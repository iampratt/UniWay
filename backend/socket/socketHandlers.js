const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Trip = require('../models/Trip');

const setupSocketHandlers = (io) => {
  // Authentication middleware for Socket.io
  io.use(async (socket, next) => {
    try {
      const token =
        socket.handshake.auth.token ||
        socket.handshake.headers.authorization?.replace('Bearer ', '');

      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId).select('-password');

      if (!user || user.status !== 'active') {
        return next(new Error('User not found or inactive'));
      }

      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(
      `🔌 User connected: ${socket.user.email} (${socket.user.role})`
    );

    // Join user to their role-specific room
    socket.join(socket.user.role);
    socket.join(`user_${socket.user._id}`);

    // Handle location updates
    socket.on('update-location', async (data) => {
      try {
        const { latitude, longitude, address } = data;

        // Update user location in database
        await socket.user.updateLocation(latitude, longitude, address);

        // Emit location update to relevant users
        if (socket.user.role === 'driver') {
          // Notify nearby students about available driver
          const nearbyStudents = await User.find({
            role: 'student',
            status: 'active',
            'location.coordinates': {
              $near: {
                $geometry: {
                  type: 'Point',
                  coordinates: [longitude, latitude],
                },
                $maxDistance: 5000, // 5km radius
              },
            },
          });

          nearbyStudents.forEach((student) => {
            io.to(`user_${student._id}`).emit('driver-nearby', {
              driverId: socket.user._id,
              driverName: socket.user.profile.firstName,
              driverRating: socket.user.profile.rating,
              location: { latitude, longitude, address },
            });
          });
        }

        // Broadcast location to trip participants
        const activeTrips = await Trip.find({
          $or: [
            {
              student: socket.user._id,
              status: { $in: ['accepted', 'in-progress'] },
            },
            {
              driver: socket.user._id,
              status: { $in: ['accepted', 'in-progress'] },
            },
          ],
        });

        activeTrips.forEach((trip) => {
          const otherUserId =
            trip.student.toString() === socket.user._id.toString()
              ? trip.driver
              : trip.student;

          io.to(`user_${otherUserId}`).emit('location-update', {
            tripId: trip._id,
            userId: socket.user._id,
            userRole: socket.user.role,
            location: { latitude, longitude, address },
            timestamp: new Date(),
          });
        });
      } catch (error) {
        console.error('Location update error:', error);
        socket.emit('error', { message: 'Failed to update location' });
      }
    });

    // Handle trip status updates
    socket.on('trip-status-update', async (data) => {
      try {
        const { tripId, status, additionalData } = data;

        const trip = await Trip.findById(tripId);
        if (!trip) {
          socket.emit('error', { message: 'Trip not found' });
          return;
        }

        // Verify user has permission to update this trip
        const isStudent =
          trip.student.toString() === socket.user._id.toString();
        const isDriver = trip.driver.toString() === socket.user._id.toString();

        if (!isStudent && !isDriver) {
          socket.emit('error', { message: 'Access denied' });
          return;
        }

        // Update trip status
        trip.status = status;

        switch (status) {
          case 'accepted':
            trip.timestamps.accepted = new Date();
            break;
          case 'in-progress':
            trip.timestamps.started = new Date();
            break;
          case 'completed':
            trip.timestamps.completed = new Date();
            break;
          case 'cancelled':
            trip.timestamps.cancelled = new Date();
            trip.cancellation = {
              reason: additionalData?.reason || 'No reason provided',
              cancelledBy: socket.user.role,
            };
            break;
        }

        await trip.save();

        // Notify all participants
        const participants = [trip.student, trip.driver];
        participants.forEach((participantId) => {
          io.to(`user_${participantId}`).emit('trip-status-changed', {
            tripId: trip._id,
            status: trip.status,
            updatedBy: socket.user._id,
            timestamp: new Date(),
            additionalData,
          });
        });
      } catch (error) {
        console.error('Trip status update error:', error);
        socket.emit('error', { message: 'Failed to update trip status' });
      }
    });

    // Handle trip requests (students)
    socket.on('trip-request', async (data) => {
      try {
        const { pickup, destination, payment } = data;

        // Find nearby available drivers
        const nearbyDrivers = await User.find({
          role: 'driver',
          status: 'active',
          'location.coordinates': {
            $near: {
              $geometry: {
                type: 'Point',
                coordinates: pickup.location.coordinates,
              },
              $maxDistance: 10000, // 10km radius
            },
          },
        }).limit(10);

        // Notify nearby drivers
        nearbyDrivers.forEach((driver) => {
          io.to(`user_${driver._id}`).emit('new-trip-request', {
            requestId: Date.now().toString(),
            student: {
              id: socket.user._id,
              name: socket.user.profile.firstName,
              rating: socket.user.profile.rating,
            },
            pickup,
            destination,
            payment,
            timestamp: new Date(),
          });
        });

        socket.emit('trip-request-sent', {
          message: 'Trip request sent to nearby drivers',
          driversNotified: nearbyDrivers.length,
        });
      } catch (error) {
        console.error('Trip request error:', error);
        socket.emit('error', { message: 'Failed to send trip request' });
      }
    });

    // Handle driver responses to trip requests
    socket.on('trip-response', async (data) => {
      try {
        const { requestId, response, tripId } = data;

        if (response === 'accept') {
          // Update trip with driver
          const trip = await Trip.findById(tripId);
          if (trip && trip.status === 'pending') {
            trip.driver = socket.user._id;
            trip.status = 'accepted';
            trip.timestamps.accepted = new Date();
            await trip.save();

            // Notify student
            io.to(`user_${trip.student}`).emit('trip-accepted', {
              tripId: trip._id,
              driver: {
                id: socket.user._id,
                name: socket.user.profile.firstName,
                rating: socket.user.profile.rating,
                vehicle: socket.user.profile.vehicleDetails,
              },
              timestamp: new Date(),
            });
          }
        }
      } catch (error) {
        console.error('Trip response error:', error);
        socket.emit('error', { message: 'Failed to respond to trip request' });
      }
    });

    // Handle real-time messaging
    socket.on('send-message', async (data) => {
      try {
        const { tripId, message, messageType = 'text' } = data;

        const trip = await Trip.findById(tripId);
        if (!trip) {
          socket.emit('error', { message: 'Trip not found' });
          return;
        }

        // Verify user is part of this trip
        const isStudent =
          trip.student.toString() === socket.user._id.toString();
        const isDriver = trip.driver.toString() === socket.user._id.toString();

        if (!isStudent && !isDriver) {
          socket.emit('error', { message: 'Access denied' });
          return;
        }

        const messageData = {
          tripId,
          senderId: socket.user._id,
          senderName: socket.user.profile.firstName,
          senderRole: socket.user.role,
          message,
          messageType,
          timestamp: new Date(),
        };

        // Send to other participant
        const otherUserId = isStudent ? trip.driver : trip.student;
        io.to(`user_${otherUserId}`).emit('new-message', messageData);

        // Send confirmation to sender
        socket.emit('message-sent', messageData);
      } catch (error) {
        console.error('Send message error:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Handle emergency alerts
    socket.on('emergency-alert', async (data) => {
      try {
        const { tripId, alertType, location, description } = data;

        const trip = await Trip.findById(tripId);
        if (!trip) {
          socket.emit('error', { message: 'Trip not found' });
          return;
        }

        const alertData = {
          tripId,
          alertType,
          location,
          description,
          reportedBy: socket.user._id,
          reportedByName: socket.user.profile.firstName,
          timestamp: new Date(),
        };

        // Notify all participants
        const participants = [trip.student, trip.driver];
        participants.forEach((participantId) => {
          io.to(`user_${participantId}`).emit('emergency-alert', alertData);
        });

        // Notify admins
        io.to('admin').emit('emergency-alert', alertData);
      } catch (error) {
        console.error('Emergency alert error:', error);
        socket.emit('error', { message: 'Failed to send emergency alert' });
      }
    });

    // Handle driver availability updates
    socket.on('availability-update', async (data) => {
      try {
        const { available, location } = data;

        if (socket.user.role !== 'driver') {
          socket.emit('error', {
            message: 'Only drivers can update availability',
          });
          return;
        }

        // Update driver status
        socket.user.status = available ? 'active' : 'inactive';
        if (location) {
          await socket.user.updateLocation(
            location.latitude,
            location.longitude,
            location.address
          );
        }
        await socket.user.save();

        // Broadcast availability to students
        io.to('student').emit('driver-availability-update', {
          driverId: socket.user._id,
          driverName: socket.user.profile.firstName,
          available,
          location: socket.user.location,
          timestamp: new Date(),
        });
      } catch (error) {
        console.error('Availability update error:', error);
        socket.emit('error', { message: 'Failed to update availability' });
      }
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`🔌 User disconnected: ${socket.user.email}`);

      // Update user status to offline
      if (socket.user.role === 'driver') {
        socket.user.status = 'inactive';
        socket.user.save().catch(console.error);
      }
    });
  });

  // Broadcast system-wide notifications
  const broadcastSystemNotification = (notification) => {
    io.emit('system-notification', notification);
  };

  // Export for use in other parts of the application
  io.broadcastSystemNotification = broadcastSystemNotification;

  console.log('✅ Socket.io handlers configured');
};

module.exports = { setupSocketHandlers };
