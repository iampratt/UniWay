const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { auth, requireRole } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/users/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');

    res.json({
      success: true,
      data: { user },
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get profile',
      error: error.message,
    });
  }
});

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put(
  '/profile',
  [
    auth,
    body('profile.firstName').optional().notEmpty().trim(),
    body('profile.lastName').optional().notEmpty().trim(),
    body('profile.phone').optional().notEmpty(),
    body('profile.college').optional().notEmpty(),
    body('profile.studentId').optional().notEmpty(),
    body('profile.licenseNumber').optional().notEmpty(),
    body('preferences').optional().isObject(),
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

      const updates = req.body;
      const user = await User.findById(req.user._id);

      // Update profile fields
      if (updates.profile) {
        Object.assign(user.profile, updates.profile);
      }

      // Update preferences
      if (updates.preferences) {
        Object.assign(user.preferences, updates.preferences);
      }

      await user.save();

      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: { user },
      });
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update profile',
        error: error.message,
      });
    }
  }
);

// @route   PUT /api/users/location
// @desc    Update user location
// @access  Private
router.put(
  '/location',
  [
    auth,
    body('latitude').isFloat(),
    body('longitude').isFloat(),
    body('address').optional().isString(),
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

      const { latitude, longitude, address } = req.body;

      await req.user.updateLocation(latitude, longitude, address);

      res.json({
        success: true,
        message: 'Location updated successfully',
        data: {
          location: req.user.location,
        },
      });
    } catch (error) {
      console.error('Update location error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update location',
        error: error.message,
      });
    }
  }
);

// @route   GET /api/users/nearby-drivers
// @desc    Get nearby drivers (students only)
// @access  Private
router.get(
  '/nearby-drivers',
  [auth, requireRole('student')],
  async (req, res) => {
    try {
      const { latitude, longitude, radius = 5000 } = req.query;

      if (!latitude || !longitude) {
        return res.status(400).json({
          success: false,
          message: 'Location coordinates are required',
        });
      }

      const drivers = await User.find({
        role: 'driver',
        status: 'active',
        'location.coordinates': {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [parseFloat(longitude), parseFloat(latitude)],
            },
            $maxDistance: parseInt(radius),
          },
        },
      })
        .select(
          'profile.firstName profile.lastName profile.rating location vehicleDetails'
        )
        .limit(20);

      res.json({
        success: true,
        data: {
          drivers,
          count: drivers.length,
        },
      });
    } catch (error) {
      console.error('Get nearby drivers error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get nearby drivers',
        error: error.message,
      });
    }
  }
);

// @route   GET /api/users/stats
// @desc    Get user statistics
// @access  Private
router.get('/stats', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    res.json({
      success: true,
      data: {
        stats: user.stats,
        profile: {
          rating: user.profile.rating,
          totalTrips: user.profile.totalTrips,
        },
      },
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get statistics',
      error: error.message,
    });
  }
});

// @route   GET /api/users/all
// @desc    Get all users (admin only)
// @access  Private
router.get('/all', [auth, requireRole('admin')], async (req, res) => {
  try {
    const { page = 1, limit = 20, role, status } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    if (role) query.role = role;
    if (status) query.status = status;

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get users',
      error: error.message,
    });
  }
});

// @route   PUT /api/users/:id/status
// @desc    Update user status (admin only)
// @access  Private
router.put(
  '/:id/status',
  [
    auth,
    requireRole('admin'),
    body('status').isIn(['active', 'inactive', 'suspended', 'pending']),
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

      const { status } = req.body;
      const user = await User.findById(req.params.id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      user.status = status;
      await user.save();

      res.json({
        success: true,
        message: 'User status updated successfully',
        data: { user },
      });
    } catch (error) {
      console.error('Update user status error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update user status',
        error: error.message,
      });
    }
  }
);

module.exports = router;
