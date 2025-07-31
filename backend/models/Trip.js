const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: [
        'pending',
        'accepted',
        'in-progress',
        'completed',
        'cancelled',
        'disputed',
      ],
      default: 'pending',
    },
    pickup: {
      location: {
        type: {
          type: String,
          enum: ['Point'],
          default: 'Point',
        },
        coordinates: {
          type: [Number],
          required: true,
        },
      },
      address: {
        type: String,
        required: true,
      },
      time: {
        type: Date,
        required: true,
      },
      notes: String,
    },
    destination: {
      location: {
        type: {
          type: String,
          enum: ['Point'],
          default: 'Point',
        },
        coordinates: {
          type: [Number],
          required: true,
        },
      },
      address: {
        type: String,
        required: true,
      },
      time: {
        type: Date,
      },
      notes: String,
    },
    route: {
      distance: {
        type: Number, // in kilometers
        required: true,
      },
      duration: {
        type: Number, // in minutes
        required: true,
      },
      trafficLevel: {
        type: String,
        enum: ['low', 'medium', 'high', 'severe'],
        default: 'medium',
      },
      waypoints: [
        {
          location: {
            type: {
              type: String,
              enum: ['Point'],
              default: 'Point',
            },
            coordinates: [Number],
          },
          address: String,
          timestamp: Date,
        },
      ],
      aiOptimized: {
        type: Boolean,
        default: false,
      },
      optimizationScore: {
        type: Number,
        min: 0,
        max: 100,
      },
    },
    pricing: {
      baseFare: {
        type: Number,
        required: true,
      },
      distanceFare: {
        type: Number,
        required: true,
      },
      timeFare: {
        type: Number,
        required: true,
      },
      trafficSurcharge: {
        type: Number,
        default: 0,
      },
      totalFare: {
        type: Number,
        required: true,
      },
      currency: {
        type: String,
        default: 'USD',
      },
    },
    payment: {
      method: {
        type: String,
        enum: ['cash', 'card', 'digital_wallet'],
        required: true,
      },
      status: {
        type: String,
        enum: ['pending', 'completed', 'failed', 'refunded'],
        default: 'pending',
      },
      transactionId: String,
      paidAt: Date,
    },
    rating: {
      studentRating: {
        rating: {
          type: Number,
          min: 1,
          max: 5,
        },
        comment: String,
        ratedAt: Date,
      },
      driverRating: {
        rating: {
          type: Number,
          min: 1,
          max: 5,
        },
        comment: String,
        ratedAt: Date,
      },
    },
    aiAnalysis: {
      routeOptimization: {
        suggested: {
          distance: Number,
          duration: Number,
          trafficLevel: String,
          waypoints: [
            {
              location: {
                type: {
                  type: String,
                  enum: ['Point'],
                  default: 'Point',
                },
                coordinates: [Number],
              },
              address: String,
            },
          ],
        },
        actual: {
          distance: Number,
          duration: Number,
          trafficLevel: String,
        },
        improvement: {
          distanceSaved: Number,
          timeSaved: Number,
          percentage: Number,
        },
      },
      trafficPrediction: {
        predictedLevel: String,
        confidence: Number,
        factors: [String],
      },
      historicalPatterns: {
        similarTrips: [
          {
            tripId: mongoose.Schema.Types.ObjectId,
            similarity: Number,
            date: Date,
          },
        ],
        patternConfidence: Number,
      },
    },
    metadata: {
      weather: {
        condition: String,
        temperature: Number,
        humidity: Number,
      },
      events: [
        {
          name: String,
          type: String,
          impact: String,
        },
      ],
      college: {
        name: String,
        semester: String,
        examSchedule: Boolean,
      },
    },
    timestamps: {
      requested: {
        type: Date,
        default: Date.now,
      },
      accepted: Date,
      started: Date,
      completed: Date,
      cancelled: Date,
    },
    cancellation: {
      reason: String,
      cancelledBy: {
        type: String,
        enum: ['student', 'driver', 'system'],
      },
      refundAmount: Number,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient querying
tripSchema.index({ 'pickup.location.coordinates': '2dsphere' });
tripSchema.index({ 'destination.location.coordinates': '2dsphere' });
tripSchema.index({ student: 1, status: 1 });
tripSchema.index({ driver: 1, status: 1 });
tripSchema.index({ status: 1, 'timestamps.requested': -1 });
tripSchema.index({ 'route.aiOptimized': 1 });
tripSchema.index({ 'metadata.college.name': 1, 'timestamps.requested': -1 });

// Virtual for total rating
tripSchema.virtual('averageRating').get(function () {
  const studentRating = this.rating.studentRating?.rating || 0;
  const driverRating = this.rating.driverRating?.rating || 0;

  if (studentRating && driverRating) {
    return (studentRating + driverRating) / 2;
  } else if (studentRating) {
    return studentRating;
  } else if (driverRating) {
    return driverRating;
  }
  return 0;
});

// Method to calculate route efficiency
tripSchema.methods.calculateEfficiency = function () {
  if (!this.aiAnalysis.routeOptimization.suggested) return null;

  const actual = this.route;
  const suggested = this.aiAnalysis.routeOptimization.suggested;

  const distanceEfficiency =
    ((suggested.distance - actual.distance) / suggested.distance) * 100;
  const timeEfficiency =
    ((suggested.duration - actual.duration) / suggested.duration) * 100;

  return {
    distanceEfficiency,
    timeEfficiency,
    overallEfficiency: (distanceEfficiency + timeEfficiency) / 2,
  };
};

// Method to update AI analysis
tripSchema.methods.updateAIAnalysis = function (analysis) {
  this.aiAnalysis = { ...this.aiAnalysis, ...analysis };
  return this.save();
};

// Method to complete trip
tripSchema.methods.completeTrip = function () {
  this.status = 'completed';
  this.timestamps.completed = new Date();
  return this.save();
};

// Method to calculate fare
tripSchema.methods.calculateFare = function () {
  const baseFare = this.pricing.baseFare;
  const distanceFare = this.route.distance * 0.5; // $0.50 per km
  const timeFare = this.route.duration * 0.1; // $0.10 per minute

  let trafficSurcharge = 0;
  if (this.route.trafficLevel === 'high') {
    trafficSurcharge = baseFare * 0.2;
  } else if (this.route.trafficLevel === 'severe') {
    trafficSurcharge = baseFare * 0.4;
  }

  const totalFare = baseFare + distanceFare + timeFare + trafficSurcharge;

  this.pricing.distanceFare = distanceFare;
  this.pricing.timeFare = timeFare;
  this.pricing.trafficSurcharge = trafficSurcharge;
  this.pricing.totalFare = totalFare;

  return totalFare;
};

module.exports = mongoose.model('Trip', tripSchema);
