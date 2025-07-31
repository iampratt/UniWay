import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://localhost:5000/api';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Get auth token from storage
  async getToken() {
    try {
      return await AsyncStorage.getItem('authToken');
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  }

  // Set auth token in storage
  async setToken(token) {
    try {
      await AsyncStorage.setItem('authToken', token);
    } catch (error) {
      console.error('Error setting token:', error);
    }
  }

  // Remove auth token from storage
  async removeToken() {
    try {
      await AsyncStorage.removeItem('authToken');
    } catch (error) {
      console.error('Error removing token:', error);
    }
  }

  // Make authenticated request
  async makeRequest(endpoint, options = {}) {
    const token = await this.getToken();

    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Request failed');
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Authentication APIs
  async register(userData) {
    return this.makeRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async login(credentials) {
    const response = await this.makeRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    if (response.success && response.data.token) {
      await this.setToken(response.data.token);
    }

    return response;
  }

  async logout() {
    await this.removeToken();
    return this.makeRequest('/auth/logout', {
      method: 'POST',
    });
  }

  async getProfile() {
    return this.makeRequest('/auth/me');
  }

  async updateProfile(profileData) {
    return this.makeRequest('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  // Trip APIs
  async requestTrip(tripData) {
    return this.makeRequest('/trips/request', {
      method: 'POST',
      body: JSON.stringify(tripData),
    });
  }

  async getAvailableTrips(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.makeRequest(`/trips/available?${queryString}`);
  }

  async acceptTrip(tripId) {
    return this.makeRequest(`/trips/${tripId}/accept`, {
      method: 'PUT',
    });
  }

  async startTrip(tripId) {
    return this.makeRequest(`/trips/${tripId}/start`, {
      method: 'PUT',
    });
  }

  async completeTrip(tripId, completionData = {}) {
    return this.makeRequest(`/trips/${tripId}/complete`, {
      method: 'PUT',
      body: JSON.stringify(completionData),
    });
  }

  async rateTrip(tripId, ratingData) {
    return this.makeRequest(`/trips/${tripId}/rate`, {
      method: 'PUT',
      body: JSON.stringify(ratingData),
    });
  }

  async getMyTrips(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.makeRequest(`/trips/my-trips?${queryString}`);
  }

  async getTripDetails(tripId) {
    return this.makeRequest(`/trips/${tripId}`);
  }

  // AI APIs
  async optimizeRoute(routeData) {
    return this.makeRequest('/ai/optimize-route', {
      method: 'POST',
      body: JSON.stringify(routeData),
    });
  }

  async predictTraffic(locationData) {
    return this.makeRequest('/ai/predict-traffic', {
      method: 'POST',
      body: JSON.stringify(locationData),
    });
  }

  async getRouteInsights(tripId) {
    return this.makeRequest(`/ai/route-insights/${tripId}`);
  }

  async getSimilarTrips(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.makeRequest(`/ai/similar-trips?${queryString}`);
  }

  // User APIs
  async updateLocation(locationData) {
    return this.makeRequest('/users/location', {
      method: 'PUT',
      body: JSON.stringify(locationData),
    });
  }

  async getNearbyDrivers(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.makeRequest(`/users/nearby-drivers?${queryString}`);
  }

  async getUserStats() {
    return this.makeRequest('/users/stats');
  }

  // Analytics APIs (Admin only)
  async getDashboardAnalytics(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.makeRequest(`/analytics/dashboard?${queryString}`);
  }

  async getTripAnalytics(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.makeRequest(`/analytics/trip-analytics?${queryString}`);
  }

  async getUserAnalytics(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.makeRequest(`/analytics/user-analytics?${queryString}`);
  }

  async getAIEfficiencyAnalytics(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.makeRequest(`/analytics/ai-efficiency?${queryString}`);
  }

  // Health check
  async healthCheck() {
    try {
      const response = await fetch(
        `${API_BASE_URL.replace('/api', '')}/health`
      );
      return response.ok;
    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  }
}

export default new ApiService();
