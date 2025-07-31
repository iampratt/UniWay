const express = require('express');
const { body, validationResult } = require('express-validator');
const { auth, requireRole } = require('../middleware/auth');
const aiService = require('../services/aiService');
const Trip = require('../models/Trip');

const router = express.Router();

// @route   POST /api/ai/optimize-route
// @desc    Get AI-optimized route
// @access  Private
router.post(
  '/optimize-route',
  [
    auth,
    body('pickup.lat').isFloat(),
    body('pickup.lng').isFloat(),
    body('pickup.address').notEmpty(),
    body('destination.lat').isFloat(),
    body('destination.lng').isFloat(),
    body('destination.address').notEmpty(),
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

      const { pickup, destination } = req.body;
      const currentTime = new Date();

      // Get weather and events (simulated)
      const weather = { condition: 'sunny', temperature: 25, humidity: 60 };
      const events = [];

      const optimization = await aiService.optimizeRoute(
        pickup,
        destination,
        currentTime,
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

      res.json({
        success: true,
        message: 'Route optimized successfully',
        data: {
          optimizedRoute: optimization.optimizedRoute,
          confidence: optimization.confidence,
          factors: optimization.factors,
        },
      });
    } catch (error) {
      console.error('Route optimization error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to optimize route',
        error: error.message,
      });
    }
  }
);

// @route   POST /api/ai/predict-traffic
// @desc    Predict traffic patterns for a location
// @access  Private
router.post(
  '/predict-traffic',
  [
    auth,
    body('location.lat').isFloat(),
    body('location.lng').isFloat(),
    body('location.address').notEmpty(),
    body('time').isISO8601(),
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

      const { location, time } = req.body;

      const prediction = await aiService.predictTrafficPatterns(location, time);

      res.json({
        success: true,
        message: 'Traffic prediction generated',
        data: prediction,
      });
    } catch (error) {
      console.error('Traffic prediction error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to predict traffic',
        error: error.message,
      });
    }
  }
);

// @route   GET /api/ai/route-insights/:tripId
// @desc    Get AI insights for a specific trip
// @access  Private
router.get('/route-insights/:tripId', auth, async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.tripId);

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found',
      });
    }

    // Check if user has access to this trip
    const isStudent = trip.student.toString() === req.user._id.toString();
    const isDriver = trip.driver.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isStudent && !isDriver && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    const insights = await aiService.generateRouteInsights(trip);

    res.json({
      success: true,
      message: 'Route insights generated',
      data: insights,
    });
  } catch (error) {
    console.error('Route insights error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate route insights',
      error: error.message,
    });
  }
});

// @route   GET /api/ai/similar-trips
// @desc    Find similar historical trips
// @access  Private
router.get('/similar-trips', auth, async (req, res) => {
  try {
    const { pickup, destination, limit = 5 } = req.query;

    if (!pickup || !destination) {
      return res.status(400).json({
        success: false,
        message: 'Pickup and destination are required',
      });
    }

    const similarTrips = await aiService.findSimilarTrips(
      JSON.parse(pickup),
      JSON.parse(destination),
      new Date()
    );

    res.json({
      success: true,
      message: 'Similar trips found',
      data: {
        trips: similarTrips.slice(0, parseInt(limit)),
        total: similarTrips.length,
      },
    });
  } catch (error) {
    console.error('Similar trips error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to find similar trips',
      error: error.message,
    });
  }
});

// @route   POST /api/ai/update-patterns
// @desc    Update historical patterns (admin only)
// @access  Private
router.post(
  '/update-patterns',
  [auth, requireRole('admin')],
  async (req, res) => {
    try {
      await aiService.updateHistoricalPatterns();

      res.json({
        success: true,
        message: 'Historical patterns updated successfully',
      });
    } catch (error) {
      console.error('Update patterns error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update historical patterns',
        error: error.message,
      });
    }
  }
);

// @route   GET /api/ai/efficiency-stats
// @desc    Get AI efficiency statistics
// @access  Private
router.get(
  '/efficiency-stats',
  [auth, requireRole('admin')],
  async (req, res) => {
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

      // Get trips with AI optimization
      const aiOptimizedTrips = await Trip.find({
        'route.aiOptimized': true,
        status: 'completed',
        ...dateFilter,
      });

      // Calculate efficiency metrics
      const totalTrips = aiOptimizedTrips.length;
      const totalDistanceSaved = aiOptimizedTrips.reduce((sum, trip) => {
        const improvement = trip.aiAnalysis.routeOptimization.improvement;
        return sum + (improvement?.distanceSaved || 0);
      }, 0);

      const totalTimeSaved = aiOptimizedTrips.reduce((sum, trip) => {
        const improvement = trip.aiAnalysis.routeOptimization.improvement;
        return sum + (improvement?.timeSaved || 0);
      }, 0);

      const averageOptimizationScore =
        aiOptimizedTrips.reduce((sum, trip) => {
          return sum + (trip.route.optimizationScore || 0);
        }, 0) / totalTrips;

      const efficiencyStats = {
        totalTrips,
        totalDistanceSaved: Math.round(totalDistanceSaved * 100) / 100,
        totalTimeSaved: Math.round(totalTimeSaved * 100) / 100,
        averageOptimizationScore:
          Math.round(averageOptimizationScore * 100) / 100,
        averageDistanceSaved:
          totalTrips > 0
            ? Math.round((totalDistanceSaved / totalTrips) * 100) / 100
            : 0,
        averageTimeSaved:
          totalTrips > 0
            ? Math.round((totalTimeSaved / totalTrips) * 100) / 100
            : 0,
      };

      res.json({
        success: true,
        message: 'Efficiency statistics retrieved',
        data: efficiencyStats,
      });
    } catch (error) {
      console.error('Efficiency stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get efficiency statistics',
        error: error.message,
      });
    }
  }
);

// @route   GET /api/ai/optimization-trends
// @desc    Get optimization trends over time
// @access  Private
router.get(
  '/optimization-trends',
  [auth, requireRole('admin')],
  async (req, res) => {
    try {
      const { days = 30 } = req.query;
      const endDate = new Date();
      const startDate = new Date(
        endDate.getTime() - parseInt(days) * 24 * 60 * 60 * 1000
      );

      // Get trips grouped by date
      const trips = await Trip.aggregate([
        {
          $match: {
            'route.aiOptimized': true,
            status: 'completed',
            'timestamps.requested': { $gte: startDate, $lte: endDate },
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
          },
        },
        {
          $sort: { _id: 1 },
        },
      ]);

      res.json({
        success: true,
        message: 'Optimization trends retrieved',
        data: {
          trends: trips,
          period: {
            startDate,
            endDate,
            days: parseInt(days),
          },
        },
      });
    } catch (error) {
      console.error('Optimization trends error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get optimization trends',
        error: error.message,
      });
    }
  }
);

// @route   POST /api/ai/bulk-optimize
// @desc    Bulk optimize multiple routes (admin only)
// @access  Private
router.post(
  '/bulk-optimize',
  [
    auth,
    requireRole('admin'),
    body('routes').isArray({ min: 1 }),
    body('routes.*.pickup.lat').isFloat(),
    body('routes.*.pickup.lng').isFloat(),
    body('routes.*.pickup.address').notEmpty(),
    body('routes.*.destination.lat').isFloat(),
    body('routes.*.destination.lng').isFloat(),
    body('routes.*.destination.address').notEmpty(),
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

      const { routes } = req.body;
      const results = [];

      for (const route of routes) {
        try {
          const optimization = await aiService.optimizeRoute(
            route.pickup,
            route.destination,
            new Date(),
            { condition: 'sunny', temperature: 25, humidity: 60 },
            []
          );

          results.push({
            route: route,
            optimization: optimization.success
              ? optimization.optimizedRoute
              : null,
            success: optimization.success,
            error: optimization.success ? null : optimization.error,
          });
        } catch (error) {
          results.push({
            route: route,
            optimization: null,
            success: false,
            error: error.message,
          });
        }
      }

      const successful = results.filter((r) => r.success).length;
      const failed = results.length - successful;

      res.json({
        success: true,
        message: 'Bulk optimization completed',
        data: {
          results,
          summary: {
            total: results.length,
            successful,
            failed,
          },
        },
      });
    } catch (error) {
      console.error('Bulk optimize error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to perform bulk optimization',
        error: error.message,
      });
    }
  }
);

module.exports = router;
