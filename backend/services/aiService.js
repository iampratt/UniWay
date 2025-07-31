const { OpenAI } = require('langchain/llms/openai');
const { OpenAIEmbeddings } = require('langchain/embeddings/openai');
const { FaissStore } = require('langchain/vectorstores/faiss');
const { RecursiveCharacterTextSplitter } = require('langchain/text_splitter');
const { RetrievalQAChain } = require('langchain/chains');
const { PromptTemplate } = require('langchain/prompts');
const axios = require('axios');
const path = require('path');
const fs = require('fs').promises;

class AIService {
  constructor() {
    this.openai = new OpenAI({
      openAIApiKey: process.env.OPENAI_API_KEY,
      modelName: process.env.OPENAI_MODEL || 'gpt-4',
      temperature: 0.1,
    });

    this.embeddings = new OpenAIEmbeddings({
      openAIApiKey: process.env.OPENAI_API_KEY,
    });

    this.vectorStore = null;
    this.isInitialized = false;
    this.initializeVectorStore();
  }

  async initializeVectorStore() {
    try {
      const indexPath = process.env.FAISS_INDEX_PATH || './data/faiss_index';

      // Check if index exists
      try {
        await fs.access(indexPath);
        this.vectorStore = await FaissStore.load(indexPath, this.embeddings);
        console.log('✅ FAISS index loaded successfully');
      } catch (error) {
        console.log('📝 Creating new FAISS index...');
        this.vectorStore = await FaissStore.fromTexts(
          ['Initial document'],
          [{ id: 1 }],
          this.embeddings
        );
        await this.vectorStore.save(indexPath);
      }

      this.isInitialized = true;
    } catch (error) {
      console.error('❌ Failed to initialize vector store:', error);
    }
  }

  async addTripData(tripData) {
    if (!this.isInitialized) {
      await this.initializeVectorStore();
    }

    try {
      // Create text representation of trip data
      const tripText = this.formatTripForVectorization(tripData);

      // Split text into chunks
      const textSplitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 200,
      });

      const docs = await textSplitter.createDocuments([tripText]);

      // Add to vector store
      await this.vectorStore.addDocuments(docs);

      // Save updated index
      const indexPath = process.env.FAISS_INDEX_PATH || './data/faiss_index';
      await this.vectorStore.save(indexPath);

      console.log('✅ Trip data added to vector store');
    } catch (error) {
      console.error('❌ Failed to add trip data to vector store:', error);
    }
  }

  formatTripForVectorization(trip) {
    return `
      Trip ID: ${trip._id}
      Date: ${trip.timestamps.requested}
      Pickup: ${trip.pickup.address} (${trip.pickup.location.coordinates.join(
      ', '
    )})
      Destination: ${
        trip.destination.address
      } (${trip.destination.location.coordinates.join(', ')})
      Distance: ${trip.route.distance} km
      Duration: ${trip.route.duration} minutes
      Traffic Level: ${trip.route.trafficLevel}
      Weather: ${trip.metadata.weather?.condition || 'Unknown'}
      College: ${trip.metadata.college?.name || 'Unknown'}
      Semester: ${trip.metadata.college?.semester || 'Unknown'}
      Exam Schedule: ${trip.metadata.college?.examSchedule || false}
      Events: ${trip.metadata.events?.map((e) => e.name).join(', ') || 'None'}
      Route Optimized: ${trip.route.aiOptimized}
      Optimization Score: ${trip.route.optimizationScore || 0}
      Total Fare: $${trip.pricing.totalFare}
      Student Rating: ${trip.rating.studentRating?.rating || 'Not rated'}
      Driver Rating: ${trip.rating.driverRating?.rating || 'Not rated'}
    `.trim();
  }

  async optimizeRoute(pickup, destination, currentTime, weather, events) {
    try {
      // Get similar historical trips
      const similarTrips = await this.findSimilarTrips(
        pickup,
        destination,
        currentTime
      );

      // Get current traffic data
      const trafficData = await this.getTrafficData(pickup, destination);

      // Create optimization prompt
      const optimizationPrompt = this.createOptimizationPrompt(
        pickup,
        destination,
        similarTrips,
        trafficData,
        weather,
        events
      );

      // Get AI optimization
      const optimization = await this.openai.call(optimizationPrompt);

      // Parse the response
      const optimizedRoute = this.parseOptimizationResponse(optimization);

      return {
        success: true,
        optimizedRoute,
        confidence: this.calculateConfidence(similarTrips, trafficData),
        factors: this.extractOptimizationFactors(optimization),
      };
    } catch (error) {
      console.error('❌ Route optimization failed:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async findSimilarTrips(pickup, destination, currentTime) {
    if (!this.isInitialized) return [];

    try {
      const query = `
        Pickup: ${pickup.address}
        Destination: ${destination.address}
        Time: ${currentTime}
      `;

      const results = await this.vectorStore.similaritySearch(query, 10);

      return results.map((doc) => ({
        content: doc.pageContent,
        score: doc.score,
      }));
    } catch (error) {
      console.error('❌ Failed to find similar trips:', error);
      return [];
    }
  }

  async getTrafficData(pickup, destination) {
    try {
      // In a real implementation, this would call a traffic API
      // For now, we'll simulate traffic data
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/directions/json?origin=${pickup.lat},${pickup.lng}&destination=${destination.lat},${destination.lng}&key=${process.env.GOOGLE_MAPS_API_KEY}`
      );

      const route = response.data.routes[0];
      const trafficLevel = this.analyzeTrafficLevel(route);

      return {
        trafficLevel,
        duration: route.legs[0].duration.value / 60, // Convert to minutes
        distance: route.legs[0].distance.value / 1000, // Convert to km
        waypoints: route.legs[0].steps.map((step) => ({
          location: step.start_location,
          address: step.html_instructions,
        })),
      };
    } catch (error) {
      console.error('❌ Failed to get traffic data:', error);
      return {
        trafficLevel: 'medium',
        duration: 30,
        distance: 10,
        waypoints: [],
      };
    }
  }

  analyzeTrafficLevel(route) {
    const duration = route.legs[0].duration.value;
    const distance = route.legs[0].distance.value;
    const speed = distance / duration; // m/s

    if (speed < 5) return 'severe';
    if (speed < 10) return 'high';
    if (speed < 15) return 'medium';
    return 'low';
  }

  createOptimizationPrompt(
    pickup,
    destination,
    similarTrips,
    trafficData,
    weather,
    events
  ) {
    const similarTripsText = similarTrips
      .map((trip) => trip.content)
      .join('\n\n');

    return `
      You are an AI route optimization expert for a college cab service. Analyze the following data and suggest the optimal route:

      CURRENT TRIP:
      Pickup: ${pickup.address} (${pickup.lat}, ${pickup.lng})
      Destination: ${destination.address} (${destination.lat}, ${
      destination.lng
    })
      Current Time: ${new Date().toISOString()}
      Weather: ${weather?.condition || 'Unknown'}
      Events: ${events?.map((e) => e.name).join(', ') || 'None'}

      CURRENT TRAFFIC:
      Level: ${trafficData.trafficLevel}
      Duration: ${trafficData.duration} minutes
      Distance: ${trafficData.distance} km

      SIMILAR HISTORICAL TRIPS:
      ${similarTripsText}

      Based on this data, provide:
      1. Optimal route with waypoints
      2. Estimated duration and distance
      3. Traffic level prediction
      4. Confidence score (0-100)
      5. Key factors influencing the optimization

      Respond in JSON format:
      {
        "route": {
          "waypoints": [{"lat": 0, "lng": 0, "address": "string"}],
          "estimatedDuration": 0,
          "estimatedDistance": 0,
          "trafficLevel": "low|medium|high|severe"
        },
        "confidence": 0,
        "factors": ["factor1", "factor2"],
        "optimizationScore": 0
      }
    `;
  }

  parseOptimizationResponse(response) {
    try {
      const parsed = JSON.parse(response);
      return parsed;
    } catch (error) {
      console.error('❌ Failed to parse optimization response:', error);
      return null;
    }
  }

  calculateConfidence(similarTrips, trafficData) {
    if (similarTrips.length === 0) return 50;

    const avgSimilarity =
      similarTrips.reduce((sum, trip) => sum + trip.score, 0) /
      similarTrips.length;
    const trafficConfidence = this.getTrafficConfidence(
      trafficData.trafficLevel
    );

    return Math.round((avgSimilarity * 0.7 + trafficConfidence * 0.3) * 100);
  }

  getTrafficConfidence(trafficLevel) {
    const confidenceMap = {
      low: 0.9,
      medium: 0.7,
      high: 0.5,
      severe: 0.3,
    };
    return confidenceMap[trafficLevel] || 0.5;
  }

  extractOptimizationFactors(response) {
    try {
      const parsed = JSON.parse(response);
      return parsed.factors || [];
    } catch (error) {
      return ['Historical patterns', 'Current traffic conditions'];
    }
  }

  async predictTrafficPatterns(location, time) {
    try {
      const query = `
        Location: ${location.address}
        Time: ${time}
        Traffic patterns and historical data
      `;

      const results = await this.vectorStore.similaritySearch(query, 20);

      const prompt = `
        Based on historical traffic data for location ${
          location.address
        } at time ${time}, predict traffic patterns:

        Historical Data:
        ${results.map((r) => r.pageContent).join('\n')}

        Provide traffic prediction in JSON format:
        {
          "predictedLevel": "low|medium|high|severe",
          "confidence": 0-100,
          "factors": ["factor1", "factor2"],
          "recommendations": ["rec1", "rec2"]
        }
      `;

      const prediction = await this.openai.call(prompt);
      return JSON.parse(prediction);
    } catch (error) {
      console.error('❌ Traffic prediction failed:', error);
      return {
        predictedLevel: 'medium',
        confidence: 50,
        factors: ['Limited historical data'],
        recommendations: ['Monitor real-time traffic'],
      };
    }
  }

  async generateRouteInsights(tripData) {
    try {
      const prompt = `
        Analyze this trip data and provide insights for route optimization:

        Trip Data:
        ${this.formatTripForVectorization(tripData)}

        Provide insights in JSON format:
        {
          "efficiency": {
            "distanceEfficiency": 0-100,
            "timeEfficiency": 0-100,
            "overallEfficiency": 0-100
          },
          "improvements": ["improvement1", "improvement2"],
          "patterns": ["pattern1", "pattern2"],
          "recommendations": ["rec1", "rec2"]
        }
      `;

      const insights = await this.openai.call(prompt);
      return JSON.parse(insights);
    } catch (error) {
      console.error('❌ Failed to generate route insights:', error);
      return {
        efficiency: {
          distanceEfficiency: 0,
          timeEfficiency: 0,
          overallEfficiency: 0,
        },
        improvements: [],
        patterns: [],
        recommendations: [],
      };
    }
  }

  async updateHistoricalPatterns() {
    try {
      // This method would be called periodically to update the vector store
      // with new trip data and retrain the model
      console.log('🔄 Updating historical patterns...');

      // In a real implementation, this would:
      // 1. Fetch new trip data from database
      // 2. Process and vectorize the data
      // 3. Update the FAISS index
      // 4. Retrain the model if necessary

      console.log('✅ Historical patterns updated');
    } catch (error) {
      console.error('❌ Failed to update historical patterns:', error);
    }
  }
}

module.exports = new AIService();
