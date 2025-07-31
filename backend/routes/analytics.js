const express = require('express');
const { auth, requireRole } = require('../middleware/auth');
const Trip = require('../models/Trip');
const User = require('../models/User');

const router = express.Router();

// @route   GET /api/analytics/dashboard
// @desc    Get dashboard analytics (admin only)
// @access  Private
router.get('/dashboard', [auth, requireRole('admin')], async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter = {
        'timestamps.requested': {
          $gte: new Date(startDate),
          $lte: new Date(endDate),
        },
      };
    }

    // Get basic statistics
    const totalUsers = await User.countDocuments();
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalDrivers = await User.countDocuments({ role: 'driver' });
    const activeUsers = await User.countDocuments({ status: 'active' });

    const totalTrips = await Trip.countDocuments(dateFilter);
    const completedTrips = await Trip.countDocuments({
      status: 'completed',
      ...dateFilter,
    });
    const pendingTrips = await Trip.countDocuments({
      status: 'pending',
      ...dateFilter,
    });

    // Get revenue statistics
    const revenueData = await Trip.aggregate([
      { $match: { status: 'completed', ...dateFilter } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$pricing.totalFare' },
          averageFare: { $avg: '$pricing.totalFare' },
          totalDistance: { $sum: '$route.distance' },
          totalTime: { $sum: '$route.duration' },
        },
      },
    ]);

    // Get AI optimization statistics
    const aiOptimizedTrips = await Trip.countDocuments({
      'route.aiOptimized': true,
      status: 'completed',
      ...dateFilter,
    });

    const optimizationEfficiency = await Trip.aggregate([
      {
        $match: {
          'route.aiOptimized': true,
          status: 'completed',
          ...dateFilter,
        },
      },
      {
        $group: {
          _id: null,
          avgOptimizationScore: { $avg: '$route.optimizationScore' },
          avgDistanceSaved: {
            $avg: '$aiAnalysis.routeOptimization.improvement.distanceSaved',
          },
          avgTimeSaved: {
            $avg: '$aiAnalysis.routeOptimization.improvement.timeSaved',
          },
        },
      },
    ]);

    // Get user growth trends
    const userGrowth = await User.aggregate([
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$createdAt',
            },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      { $limit: 30 },
    ]);

    // Get trip trends
    const tripTrends = await Trip.aggregate([
      {
        $match: dateFilter,
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$timestamps.requested',
            },
          },
          count: { $sum: 1 },
          revenue: { $sum: '$pricing.totalFare' },
        },
      },
      { $sort: { _id: 1 } },
      { $limit: 30 },
    ]);

    const dashboardData = {
      users: {
        total: totalUsers,
        students: totalStudents,
        drivers: totalDrivers,
        active: activeUsers,
        growth: userGrowth,
      },
      trips: {
        total: totalTrips,
        completed: completedTrips,
        pending: pendingTrips,
        completionRate:
          totalTrips > 0 ? (completedTrips / totalTrips) * 100 : 0,
        trends: tripTrends,
      },
      revenue: {
        total: revenueData[0]?.totalRevenue || 0,
        average: revenueData[0]?.averageFare || 0,
        totalDistance: revenueData[0]?.totalDistance || 0,
        totalTime: revenueData[0]?.totalTime || 0,
      },
      ai: {
        optimizedTrips: aiOptimizedTrips,
        optimizationRate:
          totalTrips > 0 ? (aiOptimizedTrips / totalTrips) * 100 : 0,
        avgScore: optimizationEfficiency[0]?.avgOptimizationScore || 0,
        avgDistanceSaved: optimizationEfficiency[0]?.avgDistanceSaved || 0,
        avgTimeSaved: optimizationEfficiency[0]?.avgTimeSaved || 0,
      },
    };

    res.json({
      success: true,
      message: 'Dashboard analytics retrieved',
      data: dashboardData,
    });
  } catch (error) {
    console.error('Dashboard analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get dashboard analytics',
      error: error.message,
    });
  }
});

// @route   GET /api/analytics/trip-analytics
// @desc    Get detailed trip analytics
// @access  Private
router.get(
  '/trip-analytics',
  [auth, requireRole('admin')],
  async (req, res) => {
    try {
      const { startDate, endDate, groupBy = 'day' } = req.query;

      let dateFilter = {};
      if (startDate && endDate) {
        dateFilter = {
          'timestamps.requested': {
            $gte: new Date(startDate),
            $lte: new Date(endDate),
          },
        };
      }

      let groupFormat = '%Y-%m-%d';
      if (groupBy === 'hour') {
        groupFormat = '%Y-%m-%d-%H';
      } else if (groupBy === 'week') {
        groupFormat = '%Y-%U';
      } else if (groupBy === 'month') {
        groupFormat = '%Y-%m';
      }

      const tripAnalytics = await Trip.aggregate([
        { $match: dateFilter },
        {
          $group: {
            _id: {
              $dateToString: {
                format: groupFormat,
                date: '$timestamps.requested',
              },
            },
            count: { $sum: 1 },
            totalRevenue: { $sum: '$pricing.totalFare' },
            avgDistance: { $avg: '$route.distance' },
            avgDuration: { $avg: '$route.duration' },
            avgFare: { $avg: '$pricing.totalFare' },
            aiOptimized: {
              $sum: { $cond: ['$route.aiOptimized', 1, 0] },
            },
            completed: {
              $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] },
            },
            cancelled: {
              $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] },
            },
          },
        },
        { $sort: { _id: 1 } },
      ]);

      res.json({
        success: true,
        message: 'Trip analytics retrieved',
        data: {
          analytics: tripAnalytics,
          groupBy,
        },
      });
    } catch (error) {
      console.error('Trip analytics error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get trip analytics',
        error: error.message,
      });
    }
  }
);

// @route   GET /api/analytics/user-analytics
// @desc    Get user analytics
// @access  Private
router.get(
  '/user-analytics',
  [auth, requireRole('admin')],
  async (req, res) => {
    try {
      const { startDate, endDate } = req.query;

      let dateFilter = {};
      if (startDate && endDate) {
        dateFilter = {
          createdAt: {
            $gte: new Date(startDate),
            $lte: new Date(endDate),
          },
        };
      }

      // User registration trends
      const userRegistration = await User.aggregate([
        { $match: dateFilter },
        {
          $group: {
            _id: {
              $dateToString: {
                format: '%Y-%m-%d',
                date: '$createdAt',
              },
            },
            count: { $sum: 1 },
            students: {
              $sum: { $cond: [{ $eq: ['$role', 'student'] }, 1, 0] },
            },
            drivers: {
              $sum: { $cond: [{ $eq: ['$role', 'driver'] }, 1, 0] },
            },
          },
        },
        { $sort: { _id: 1 } },
      ]);

      // User activity statistics
      const userStats = await User.aggregate([
        {
          $group: {
            _id: '$role',
            count: { $sum: 1 },
            avgRating: { $avg: '$profile.rating' },
            avgTrips: { $avg: '$stats.completedTrips' },
            avgDistance: { $avg: '$stats.totalDistance' },
            avgTime: { $avg: '$stats.totalTime' },
          },
        },
      ]);

      // Top performing users
      const topStudents = await User.find({ role: 'student' })
        .sort({ 'stats.completedTrips': -1 })
        .limit(10)
        .select('profile.firstName profile.lastName stats profile.rating');

      const topDrivers = await User.find({ role: 'driver' })
        .sort({ 'profile.rating': -1 })
        .limit(10)
        .select('profile.firstName profile.lastName profile.rating stats');

      res.json({
        success: true,
        message: 'User analytics retrieved',
        data: {
          registration: userRegistration,
          stats: userStats,
          topStudents,
          topDrivers,
        },
      });
    } catch (error) {
      console.error('User analytics error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get user analytics',
        error: error.message,
      });
    }
  }
);

// @route   GET /api/analytics/ai-efficiency
// @desc    Get AI efficiency analytics
// @access  Private
router.get('/ai-efficiency', [auth, requireRole('admin')], async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter = {
        'timestamps.requested': {
          $gte: new Date(startDate),
          $lte: new Date(endDate),
        },
      };
    }

    // AI optimization efficiency
    const aiEfficiency = await Trip.aggregate([
      {
        $match: {
          'route.aiOptimized': true,
          status: 'completed',
          ...dateFilter,
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$timestamps.requested',
            },
          },
          count: { $sum: 1 },
          avgOptimizationScore: { $avg: '$route.optimizationScore' },
          avgDistanceSaved: {
            $avg: '$aiAnalysis.routeOptimization.improvement.distanceSaved',
          },
          avgTimeSaved: {
            $avg: '$aiAnalysis.routeOptimization.improvement.timeSaved',
          },
          totalDistanceSaved: {
            $sum: '$aiAnalysis.routeOptimization.improvement.distanceSaved',
          },
          totalTimeSaved: {
            $sum: '$aiAnalysis.routeOptimization.improvement.timeSaved',
          },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Traffic level analysis
    const trafficAnalysis = await Trip.aggregate([
      {
        $match: {
          status: 'completed',
          ...dateFilter,
        },
      },
      {
        $group: {
          _id: '$route.trafficLevel',
          count: { $sum: 1 },
          avgDuration: { $avg: '$route.duration' },
          avgFare: { $avg: '$pricing.totalFare' },
        },
      },
    ]);

    // Route optimization confidence
    const confidenceAnalysis = await Trip.aggregate([
      {
        $match: {
          'route.aiOptimized': true,
          status: 'completed',
          ...dateFilter,
        },
      },
      {
        $group: {
          _id: {
            $cond: [
              { $gte: ['$route.optimizationScore', 80] },
              'High (80-100)',
              {
                $cond: [
                  { $gte: ['$route.optimizationScore', 60] },
                  'Medium (60-79)',
                  'Low (0-59)',
                ],
              },
            ],
          },
          count: { $sum: 1 },
          avgScore: { $avg: '$route.optimizationScore' },
        },
      },
    ]);

    res.json({
      success: true,
      message: 'AI efficiency analytics retrieved',
      data: {
        efficiency: aiEfficiency,
        traffic: trafficAnalysis,
        confidence: confidenceAnalysis,
      },
    });
  } catch (error) {
    console.error('AI efficiency analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get AI efficiency analytics',
      error: error.message,
    });
  }
});

// @route   GET /api/analytics/export
// @desc    Export analytics data (admin only)
// @access  Private
router.get('/export', [auth, requireRole('admin')], async (req, res) => {
  try {
    const { type, startDate, endDate } = req.query;

    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter = {
        'timestamps.requested': {
          $gte: new Date(startDate),
          $lte: new Date(endDate),
        },
      };
    }

    let data;
    let filename;

    switch (type) {
      case 'trips':
        data = await Trip.find(dateFilter)
          .populate('student', 'profile.firstName profile.lastName')
          .populate('driver', 'profile.firstName profile.lastName');
        filename = `trips_${new Date().toISOString().split('T')[0]}.json`;
        break;

      case 'users':
        data = await User.find().select('-password');
        filename = `users_${new Date().toISOString().split('T')[0]}.json`;
        break;

      case 'ai-optimized':
        data = await Trip.find({
          'route.aiOptimized': true,
          status: 'completed',
          ...dateFilter,
        });
        filename = `ai_optimized_trips_${
          new Date().toISOString().split('T')[0]
        }.json`;
        break;

      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid export type',
        });
    }

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    res.json({
      success: true,
      message: 'Data exported successfully',
      data: data,
    });
  } catch (error) {
    console.error('Export analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export data',
      error: error.message,
    });
  }
});

module.exports = router;
