const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    role: {
      type: String,
      enum: ['student', 'driver', 'admin'],
      required: true,
    },
    profile: {
      firstName: {
        type: String,
        required: true,
        trim: true,
      },
      lastName: {
        type: String,
        required: true,
        trim: true,
      },
      phone: {
        type: String,
        required: true,
      },
      avatar: {
        type: String,
        default: null,
      },
      college: {
        type: String,
        required: function () {
          return this.role === 'student';
        },
      },
      studentId: {
        type: String,
        required: function () {
          return this.role === 'student';
        },
      },
      licenseNumber: {
        type: String,
        required: function () {
          return this.role === 'driver';
        },
      },
      vehicleDetails: {
        make: String,
        model: String,
        year: Number,
        color: String,
        plateNumber: String,
      },
      rating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
      },
      totalTrips: {
        type: Number,
        default: 0,
      },
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number],
        default: [0, 0],
      },
      address: String,
      lastUpdated: {
        type: Date,
        default: Date.now,
      },
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'suspended', 'pending'],
      default: 'pending',
    },
    preferences: {
      notifications: {
        email: { type: Boolean, default: true },
        push: { type: Boolean, default: true },
        sms: { type: Boolean, default: false },
      },
      language: {
        type: String,
        default: 'en',
      },
      theme: {
        type: String,
        enum: ['light', 'dark', 'auto'],
        default: 'auto',
      },
    },
    verification: {
      emailVerified: { type: Boolean, default: false },
      phoneVerified: { type: Boolean, default: false },
      documentsVerified: { type: Boolean, default: false },
    },
    stats: {
      totalDistance: { type: Number, default: 0 },
      totalTime: { type: Number, default: 0 },
      averageRating: { type: Number, default: 0 },
      completedTrips: { type: Number, default: 0 },
      cancelledTrips: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true,
  }
);

// Index for geospatial queries
userSchema.index({ 'location.coordinates': '2dsphere' });
userSchema.index({ email: 1 });
userSchema.index({ role: 1, status: 1 });

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Get full name
userSchema.virtual('fullName').get(function () {
  return `${this.profile.firstName} ${this.profile.lastName}`;
});

// Remove password from JSON output
userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  return user;
};

// Update location method
userSchema.methods.updateLocation = function (lat, lng, address = null) {
  this.location.coordinates = [lng, lat]; // MongoDB expects [longitude, latitude]
  this.location.address = address;
  this.location.lastUpdated = new Date();
  return this.save();
};

// Update stats method
userSchema.methods.updateStats = function (tripData) {
  this.stats.totalDistance += tripData.distance || 0;
  this.stats.totalTime += tripData.duration || 0;
  this.stats.completedTrips += 1;
  this.stats.averageRating =
    (this.stats.averageRating * (this.stats.completedTrips - 1) +
      tripData.rating) /
    this.stats.completedTrips;
  return this.save();
};

module.exports = mongoose.model('User', userSchema);
