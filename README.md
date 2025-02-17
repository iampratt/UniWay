# Uniway

Uniway is a cab route management app designed to enhance transportation efficiency for students at Manipal University Jaipur. It offers real-time cab tracking, optimized routes, and seamless ride booking. Ranked in the top 5 out of 200 projects at Project Expo Jaipur, it serves over 7,000 students daily.



https://github.com/user-attachments/assets/d773df10-05d7-46d4-909e-28ba8d7b1672



## Table of Contents

- [Features](#features)
- [User Roles](#user-roles)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
  - [Authentication](#authentication)
  - [Rides (User)](#rides-user)
  - [Cabs (Driver)](#cabs-driver)
  - [Drivers (Cab Owner)](#drivers-cab-owner)
  - [Cab Management (Cab Owner)](#cab-management-cab-owner)
  - [Notifications](#notifications)
  - [Payments (User & Cab Owner)](#payments-user--cab-owner)
  - [Admin (Restricted Access)](#admin-restricted-access)
- [Deployment](#deployment)
- [Screenshots](#screenshots)
- [Contributing](#contributing)
- [License](#license)

## Features

- Real-time GPS tracking of cabs
- Optimized route planning using Google Maps API
- Scheduled ride bookings
- Push notifications for live updates
- Secure JWT-based authentication
- Cross-platform support (Android & iOS)

## User Roles

Uniway supports three types of users:
1. **User**: Students or passengers who book rides.
2. **Driver**: Cab drivers who manage ride requests and update cab locations.
3. **Cab Owner**: Owners who manage cabs, drivers, and earnings.

## Tech Stack

- **Frontend**: React Native, Expo, React Navigation  
- **Backend**: Node.js, Express.js  
- **Database**: MongoDB (hosted on MongoDB Atlas)  
- **APIs**: Google Maps API, Firebase (push notifications), Route Optimization API  

## Installation

### Prerequisites
- Node.js (>=14.x)
- npm or yarn
- Expo CLI (install globally using `npm install -g expo-cli`)
- MongoDB instance

### Steps
1. Clone the repo:
   git clone https://github.com/yourusername/uniway.git
   cd uniway

2. Install dependencies:
   npm install

3. Set up `.env` file:
   MONGO_URI=your_mongodb_uri
   JWT_SECRET=your_jwt_secret
   GOOGLE_MAPS_API_KEY=your_api_key

4. Start the backend:
   npm run server

5. Run the frontend:
   npm start

## Usage

- **User**: Book rides, track cabs, and view ride history.
- **Driver**: Accept ride requests, update cab location, and manage availability.
- **Cab Owner**: Add/remove cabs, assign drivers, and view earnings.

## API Endpoints

### Authentication
- POST /api/auth/signup - Register a new user (User, Driver, or Cab Owner)
- POST /api/auth/login - Authenticate a user
- POST /api/auth/logout - Logout a user
- GET /api/auth/me - Get current user details
- POST /api/auth/forgot-password - Request password reset
- POST /api/auth/reset-password - Reset password using token

### Rides (User)
- POST /api/rides/book - Book a new ride
- GET /api/rides/status/:rideId - Check the status of a ride
- POST /api/rides/cancel/:rideId - Cancel a booked ride
- GET /api/rides/history - Get ride history for the logged-in user
- POST /api/rides/schedule - Schedule a ride for a future time
- GET /api/rides/upcoming - Get upcoming scheduled rides
- POST /api/rides/rate - Rate a completed ride

### Cabs (Driver)
- GET /api/cabs/available - List all available cabs
- GET /api/cabs/location/:cabId - Get real-time location of a specific cab
- GET /api/cabs/nearby?lat=XX&lng=XX - Find cabs nearby a given location
- POST /api/cabs/update-location/:cabId - Update the location of a cab (for drivers)
- POST /api/cabs/set-availability/:cabId - Set cab availability (online/offline)
- GET /api/cabs/assigned/:driverId - Get the cab assigned to a driver
- POST /api/cabs/start-ride/:rideId - Start a ride (Driver only)
- POST /api/cabs/end-ride/:rideId - End a ride (Driver only)

### Drivers (Cab Owner)
- POST /api/drivers/add - Add a new driver to a cab (Cab Owner only)
- DELETE /api/drivers/remove/:driverId - Remove a driver from a cab (Cab Owner only)
- GET /api/drivers/list - List all drivers associated with a cab owner
- GET /api/drivers/details/:driverId - Get detailed information about a driver
- POST /api/drivers/update/:driverId - Update driver details (e.g., name, contact info)
- POST /api/drivers/assign-cab/:driverId - Assign a cab to a driver
- POST /api/drivers/unassign-cab/:driverId - Unassign a cab from a driver

### Cab Management (Cab Owner)
- POST /api/cabs/add - Add a new cab to the system (Cab Owner only)
- DELETE /api/cabs/remove/:cabId - Remove a cab from the system (Cab Owner only)
- GET /api/cabs/earnings - View earnings for all cabs owned (Cab Owner only)
- GET /api/cabs/details/:cabId - Get detailed information about a specific cab
- POST /api/cabs/update/:cabId - Update cab details (e.g., model, registration number)
- GET /api/cabs/driver-history/:cabId - Get history of drivers assigned to a cab

### Notifications
- POST /api/notifications/send - Send a push notification to a user
- GET /api/notifications/list - List all notifications for the logged-in user
- POST /api/notifications/mark-as-read/:notificationId - Mark a notification as read
- DELETE /api/notifications/delete/:notificationId - Delete a notification

### Payments (User & Cab Owner)
- POST /api/payments/initiate - Initiate a payment for a ride (User)
- GET /api/payments/history - Get payment history for the logged-in user
- POST /api/payments/refund/:paymentId - Request a refund for a payment (User)
- GET /api/payments/summary - Get a summary of earnings for a cab owner

### Admin (Restricted Access)
- GET /api/admin/users - Get a list of all users (Admin only)
- GET /api/admin/rides - Get a list of all rides (Admin only)
- POST /api/admin/cabs/add - Add a new cab to the system (Admin only)
- DELETE /api/admin/cabs/remove/:cabId - Remove a cab from the system (Admin only)
- GET /api/admin/reports - Generate reports (e.g., ride stats, earnings)
- POST /api/admin/block-user/:userId - Block a user (Admin only)
- POST /api/admin/unblock-user/:userId - Unblock a user (Admin only)

## Deployment

- **Frontend**: Hosted on Expo  
- **Backend**: Deployed on AWS  
- **Database**: MongoDB Atlas  


## Contributing

Contributions are welcome! Fork the repo, create a feature branch, and submit a pull request.
