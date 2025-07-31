#!/bin/bash

echo "🚀 UniWay - AI-Powered College Cab Management System"
echo "=================================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check if MongoDB is running
if ! command -v mongod &> /dev/null; then
    echo "⚠️  MongoDB is not installed. Please install MongoDB 5.0+ first."
    echo "   You can download it from: https://www.mongodb.com/try/download/community"
fi

# Check if backend directory exists
if [ ! -d "backend" ]; then
    echo "❌ Backend directory not found. Please ensure you're in the project root."
    exit 1
fi

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "📝 Creating .env file from template..."
    cp env.example .env
    echo "⚠️  Please edit backend/.env with your configuration:"
    echo "   - Set MONGODB_URI"
    echo "   - Add OPENAI_API_KEY"
    echo "   - Configure JWT_SECRET"
    echo "   - Add GOOGLE_MAPS_API_KEY (optional)"
fi

cd ..

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
npm install

# Check if AsyncStorage is installed
if ! npm list @react-native-async-storage/async-storage &> /dev/null; then
    echo "📦 Installing additional frontend dependencies..."
    npm install @react-native-async-storage/async-storage socket.io-client react-native-vector-icons react-native-paper react-native-elements react-native-gesture-handler react-native-reanimated
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "🚀 To start the application:"
echo ""
echo "1. Start the backend:"
echo "   cd backend && npm run dev"
echo ""
echo "2. In a new terminal, start the frontend:"
echo "   npm start"
echo ""
echo "3. Open the Expo app on your device or simulator"
echo ""
echo "📱 The app will be available at: http://localhost:19006"
echo "🔗 Backend API will be available at: http://localhost:5000"
echo ""
echo "📚 For more information, see the README.md file"
echo ""
echo "🎉 Happy coding!" 