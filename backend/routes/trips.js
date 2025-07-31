const express = require('express');
const { body, validationResult } = require('express-validator');
const Trip = require('../models/Trip');
const User = require('../models/User');
const { auth, requireRole } = require('../middleware/auth');
const aiService = require('../services/aiService');

const router = express.Router();

// @route   POST /api/trips/request
// @desc    Request a new trip (students only)
// @access  Private
router.post(
  '/request',
  [
    auth,
    requireRole('student'),
    body('pickup.location.coordinates').isArray({ min: 2, max: 2 }),
    body('pickup.address').notEmpty(),
    body('pickup.time').isISO8601(),
    body('destination.location.coordinates').isArray({ min: 2, max: 2 }),
    body('destination.address').notEmpty(),
    body('payment.method').isIn(['cash', 'card', 'digital_wallet']),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array(),
        });
      }

      const { pickup, destination, payment } = req.body;

      // Get current weather and events (simulated)
      const weather = { condition: 'sunny', temperature: 25, humidity: 60 };
      const events = [];

      // AI route optimization
      const optimization = await aiService.optimizeRoute(
        pickup,
        destination,
        new Date(),
        weather,
        events
      );

      if (!optimization.success) {
        return res.status(500).json({
          success: false,
          message: 'Route optimization failed',
          error: optimization.error,
        });
      }

      // Calculate base fare
      const baseFare = 5.0; // Base fare $5
      const distanceFare =
        optimization.optimizedRoute.route.estimatedDistance * 0.5;
      const timeFare =
        optimization.optimizedRoute.route.estimatedDuration * 0.1;
      const totalFare = baseFare + distanceFare + timeFare;

      // Create trip
      const trip = new Trip({
        student: req.user._id,
        pickup: {
          ...pickup,
          location: {
            type: 'Point',
            coordinates: pickup.location.coordinates,
          },
        },
        destination: {
          ...destination,
          location: {
            type: 'Point',
            coordinates: destination.location.coordinates,
          },
        },
        route: {
          distance: optimization.optimizedRoute.route.estimatedDistance,
          duration: optimization.optimizedRoute.route.estimatedDuration,
          trafficLevel: optimization.optimizedRoute.route.trafficLevel,
          waypoints: optimization.optimizedRoute.route.waypoints,
          aiOptimized: true,
          optimizationScore: optimization.confidence,
        },
        pricing: {
          baseFare,
          distanceFare,
          timeFare,
          totalFare,
          currency: 'USD',
        },
        payment: {
          method: payment.method,
          status: 'pending',
        },
        aiAnalysis: {
          routeOptimization: {
            suggested: optimization.optimizedRoute.route,
            confidence: optimization.confidence,
            factors: optimization.factors,
          },
        },
        metadata: {
          weather,
          events,
          college: {
            name: req.user.profile.college,
            semester: 'Fall 2024',
            examSchedule: false,
          },
        },
      });

      await trip.save();

      // Add to AI vector store for future optimization
      await aiService.addTripData(trip);

      res.status(201).json({
        success: true,
        message: 'Trip requested successfully',
        data: {
          trip,
          optimization: {
            confidence: optimization.confidence,
            factors: optimization.factors,
          },
        },
      });
    } catch (error) {
      console.error('Trip request error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to request trip',
        error: error.message,
      });
    }
  }
);

// @route   GET /api/trips/available
// @desc    Get available trips for drivers
// @access  Private
router.get('/available', [auth, requireRole('driver')], async (req, res) => {
  try {
    const { page = 1, limit = 10, radius = 5000 } = req.query;
    const skip = (page - 1) * limit;

    // Get driver's location
    const driver = await User.findById(req.user._id);
    if (!driver.location.coordinates || driver.location.coordinates[0] === 0) {
      return res.status(400).json({
        success: false,
        message: 'Driver location not available',
      });
    }

    // Find nearby pending trips
    const trips = await Trip.find({
      status: 'pending',
      'pickup.location': {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: driver.location.coordinates,
          },
          $maxDistance: parseInt(radius),
        },
      },
    })
      .populate('student', 'profile.firstName profile.lastName profile.rating')
      .sort({ 'timestamps.requested': -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Trip.countDocuments({
      status: 'pending',
      'pickup.location': {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: driver.location.coordinates,
          },
          $maxDistance: parseInt(radius),
        },
      },
    });

    res.json({
      success: true,
      data: {
        trips,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error('Get available trips error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get available trips',
      error: error.message,
    });
  }
});

// @route   PUT /api/trips/:id/accept
// @desc    Accept a trip (drivers only)
// @access  Private
router.put('/:id/accept', [auth, requireRole('driver')], async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found',
      });
    }

    if (trip.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Trip is not available for acceptance',
      });
    }

    // Check if driver is already on another trip
    const activeTrip = await Trip.findOne({
      driver: req.user._id,
      status: { $in: ['accepted', 'in-progress'] },
    });

    if (activeTrip) {
      return res.status(400).json({
        success: false,
        message: 'You already have an active trip',
      });
    }

    trip.driver = req.user._id;
    trip.status = 'accepted';
    trip.timestamps.accepted = new Date();

    await trip.save();

    res.json({
      success: true,
      message: 'Trip accepted successfully',
      data: { trip },
    });
  } catch (error) {
    console.error('Accept trip error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to accept trip',
      error: error.message,
    });
  }
});

// @route   PUT /api/trips/:id/start
// @desc    Start a trip
// @access  Private
router.put('/:id/start', auth, async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found',
      });
    }

    if (trip.status !== 'accepted') {
      return res.status(400).json({
        success: false,
        message: 'Trip cannot be started',
      });
    }

    // Verify user is the driver
    if (trip.driver.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the assigned driver can start this trip',
      });
    }

    trip.status = 'in-progress';
    trip.timestamps.started = new Date();

    await trip.save();

    res.json({
      success: true,
      message: 'Trip started successfully',
      data: { trip },
    });
  } catch (error) {
    console.error('Start trip error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to start trip',
      error: error.message,
    });
  }
});

// @route   PUT /api/trips/:id/complete
// @desc    Complete a trip
// @access  Private
router.put('/:id/complete', auth, async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found',
      });
    }

    if (trip.status !== 'in-progress') {
      return res.status(400).json({
        success: false,
        message: 'Trip cannot be completed',
      });
    }

    // Verify user is the driver
    if (trip.driver.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the assigned driver can complete this trip',
      });
    }

    // Calculate actual route data
    const actualDistance = req.body.actualDistance || trip.route.distance;
    const actualDuration = req.body.actualDuration || trip.route.duration;

    trip.status = 'completed';
    trip.timestamps.completed = new Date();
    trip.route.distance = actualDistance;
    trip.route.duration = actualDuration;

    // Update AI analysis with actual data
    trip.aiAnalysis.routeOptimization.actual = {
      distance: actualDistance,
      duration: actualDuration,
      trafficLevel: trip.route.trafficLevel,
    };

    // Calculate improvements
    const suggested = trip.aiAnalysis.routeOptimization.suggested;
    if (suggested) {
      const distanceSaved = suggested.estimatedDistance - actualDistance;
      const timeSaved = suggested.estimatedDuration - actualDuration;

      trip.aiAnalysis.routeOptimization.improvement = {
        distanceSaved: Math.max(0, distanceSaved),
        timeSaved: Math.max(0, timeSaved),
        percentage: Math.round(
          ((distanceSaved + timeSaved) /
            (suggested.estimatedDistance + suggested.estimatedDuration)) *
            100
        ),
      };
    }

    await trip.save();

    // Update user stats
    const driver = await User.findById(trip.driver);
    await driver.updateStats({
      distance: actualDistance,
      duration: actualDuration,
      rating: 0, // Will be updated when rated
    });

    const student = await User.findById(trip.student);
    await student.updateStats({
      distance: actualDistance,
      duration: actualDuration,
      rating: 0,
    });

    res.json({
      success: true,
      message: 'Trip completed successfully',
      data: { trip },
    });
  } catch (error) {
    console.error('Complete trip error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to complete trip',
      error: error.message,
    });
  }
});

// @route   PUT /api/trips/:id/rate
// @desc    Rate a completed trip
// @access  Private
router.put(
  '/:id/rate',
  [
    auth,
    body('rating').isInt({ min: 1, max: 5 }),
    body('comment').optional().isString().isLength({ max: 500 }),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array(),
        });
      }

      const { rating, comment } = req.body;
      const trip = await Trip.findById(req.params.id);

      if (!trip) {
        return res.status(404).json({
          success: false,
          message: 'Trip not found',
        });
      }

      if (trip.status !== 'completed') {
        return res.status(400).json({
          success: false,
          message: 'Can only rate completed trips',
        });
      }

      // Determine if user is student or driver
      const isStudent = trip.student.toString() === req.user._id.toString();
      const isDriver = trip.driver.toString() === req.user._id.toString();

      if (!isStudent && !isDriver) {
        return res.status(403).json({
          success: false,
          message: 'You can only rate trips you participated in',
        });
      }

      const ratingData = {
        rating,
        comment,
        ratedAt: new Date(),
      };

      if (isStudent) {
        trip.rating.studentRating = ratingData;
      } else {
        trip.rating.driverRating = ratingData;
      }

      await trip.save();

      // Update user rating
      const user = await User.findById(req.user._id);
      const totalTrips = user.stats.completedTrips;
      const currentRating = user.profile.rating;

      user.profile.rating =
        (currentRating * (totalTrips - 1) + rating) / totalTrips;
      await user.save();

      res.json({
        success: true,
        message: 'Trip rated successfully',
        data: { trip },
      });
    } catch (error) {
      console.error('Rate trip error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to rate trip',
        error: error.message,
      });
    }
  }
);

// @route   GET /api/trips/my-trips
// @desc    Get user's trips
// @access  Private
router.get('/my-trips', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const skip = (page - 1) * limit;

    let query = {};

    if (req.user.role === 'student') {
      query.student = req.user._id;
    } else if (req.user.role === 'driver') {
      query.driver = req.user._id;
    }

    if (status) {
      query.status = status;
    }

    const trips = await Trip.find(query)
      .populate('student', 'profile.firstName profile.lastName profile.rating')
      .populate('driver', 'profile.firstName profile.lastName profile.rating')
      .sort({ 'timestamps.requested': -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Trip.countDocuments(query);

    res.json({
      success: true,
      data: {
        trips,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error('Get my trips error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get trips',
      error: error.message,
    });
  }
});

// @route   GET /api/trips/:id
// @desc    Get trip details
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id)
      .populate('student', 'profile.firstName profile.lastName profile.rating')
      .populate('driver', 'profile.firstName profile.lastName profile.rating');

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found',
      });
    }

    // Check if user has access to this trip
    const isStudent = trip.student._id.toString() === req.user._id.toString();
    const isDriver = trip.driver._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isStudent && !isDriver && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    res.json({
      success: true,
      data: { trip },
    });
  } catch (error) {
    console.error('Get trip details error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get trip details',
      error: error.message,
    });
  }
});

module.exports = router;
