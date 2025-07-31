# UniWay Backend

A comprehensive backend for the UniWay cab management system with AI-powered route optimization, real-time features, and analytics.

## Features

- **3-Role Authentication**: Student, Driver, and Admin roles with role-based access control
- **AI-Powered Route Optimization**: LangChain RAG pipeline with GPT-4 for optimal route suggestions
- **FAISS Vector Database**: Historical trip data analysis for pattern recognition
- **Real-time Features**: Socket.io for live location tracking and trip updates
- **Analytics Dashboard**: Comprehensive analytics for admin monitoring
- **Geospatial Queries**: MongoDB geospatial indexing for location-based services
- **Rate Limiting & Security**: Helmet, CORS, and rate limiting for production security

## Tech Stack

- **Runtime**: Node.js with Express.js
- **Database**: MongoDB with Mongoose ODM
- **AI/ML**: LangChain, OpenAI GPT-4, FAISS vector database
- **Real-time**: Socket.io for live updates
- **Authentication**: JWT tokens with bcrypt password hashing
- **Validation**: Express-validator for input validation
- **Security**: Helmet, CORS, rate limiting
- **Monitoring**: Morgan logging and compression

## Prerequisites

- Node.js 18+
- MongoDB 5.0+
- OpenAI API key
- Google Maps API key (optional for traffic data)

## Installation

1. **Clone the repository**

   ```bash
   cd backend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Setup**

   ```bash
   cp env.example .env
   ```

   Edit `.env` with your configuration:

   ```env
   # Server Configuration
   PORT=5000
   NODE_ENV=development

   # Database
   MONGODB_URI=mongodb://localhost:27017/uniway

   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key
   JWT_EXPIRES_IN=7d

   # OpenAI Configuration
   OPENAI_API_KEY=your-openai-api-key
   OPENAI_MODEL=gpt-4

   # External APIs
   GOOGLE_MAPS_API_KEY=your-google-maps-api-key
   ```

4. **Start the server**

   ```bash
   # Development
   npm run dev

   # Production
   npm start
   ```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/profile` - Update user profile
- `PUT /api/auth/password` - Change password
- `POST /api/auth/refresh` - Refresh JWT token

### Trips

- `POST /api/trips/request` - Request new trip (students)
- `GET /api/trips/available` - Get available trips (drivers)
- `PUT /api/trips/:id/accept` - Accept trip (drivers)
- `PUT /api/trips/:id/start` - Start trip
- `PUT /api/trips/:id/complete` - Complete trip
- `PUT /api/trips/:id/rate` - Rate completed trip
- `GET /api/trips/my-trips` - Get user's trips
- `GET /api/trips/:id` - Get trip details

### AI Services

- `POST /api/ai/optimize-route` - Get AI-optimized route
- `POST /api/ai/predict-traffic` - Predict traffic patterns
- `GET /api/ai/route-insights/:tripId` - Get route insights
- `GET /api/ai/similar-trips` - Find similar historical trips
- `GET /api/ai/efficiency-stats` - Get AI efficiency statistics
- `GET /api/ai/optimization-trends` - Get optimization trends

### Users

- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `PUT /api/users/location` - Update user location
- `GET /api/users/nearby-drivers` - Get nearby drivers
- `GET /api/users/stats` - Get user statistics
- `GET /api/users/all` - Get all users (admin)

### Analytics

- `GET /api/analytics/dashboard` - Get dashboard analytics
- `GET /api/analytics/trip-analytics` - Get trip analytics
- `GET /api/analytics/user-analytics` - Get user analytics
- `GET /api/analytics/ai-efficiency` - Get AI efficiency analytics
- `GET /api/analytics/export` - Export analytics data

## AI Features

### Route Optimization

The system uses a LangChain RAG pipeline with GPT-4 to suggest optimal routes based on:

- Historical trip data (vectorized with FAISS)
- Live traffic conditions
- Weather data
- College events and schedules
- Driver availability patterns

### Vector Database

- FAISS index stores historical trip data for similarity search
- Trip data is vectorized using OpenAI embeddings
- Enables pattern recognition and route optimization

### Traffic Prediction

- Analyzes historical traffic patterns
- Predicts traffic levels for specific locations and times
- Provides confidence scores and recommendations

## Real-time Features

### Socket.io Events

- `update-location` - Update user location
- `trip-status-update` - Update trip status
- `trip-request` - Request new trip
- `trip-response` - Respond to trip request
- `send-message` - Send real-time messages
- `emergency-alert` - Send emergency alerts
- `availability-update` - Update driver availability

## Database Models

### User Model

- Role-based authentication (student, driver, admin)
- Geospatial location tracking
- Profile information and preferences
- Statistics and ratings
- Vehicle details (for drivers)

### Trip Model

- Comprehensive trip tracking
- AI analysis and optimization data
- Pricing and payment information
- Ratings and feedback
- Metadata (weather, events, college info)

## Security Features

- JWT-based authentication
- Role-based access control
- Password hashing with bcrypt
- Rate limiting
- Input validation
- CORS protection
- Helmet security headers

## Performance Optimizations

- MongoDB geospatial indexing
- FAISS vector similarity search
- Compression middleware
- Efficient aggregation pipelines
- Connection pooling

## Monitoring & Analytics

- Comprehensive analytics dashboard
- AI efficiency metrics
- User behavior analysis
- Revenue tracking
- Trip completion rates
- Route optimization statistics

## Deployment

### Production Setup

1. Set `NODE_ENV=production`
2. Configure production MongoDB URI
3. Set secure JWT secret
4. Configure rate limiting
5. Set up monitoring and logging

### Environment Variables

- `PORT` - Server port (default: 5000)
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - JWT signing secret
- `OPENAI_API_KEY` - OpenAI API key
- `GOOGLE_MAPS_API_KEY` - Google Maps API key
- `RATE_LIMIT_MAX_REQUESTS` - Rate limiting configuration

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details
