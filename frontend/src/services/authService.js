// frontend/src/services/authService.js
import api from './api';

export const authService = {
  async register(data) {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  async login(data) {
    const response = await api.post('/auth/login', data);
    
    // Check if the response has the data we expect before saving
    if (response.data && response.data.data && response.data.data.accessToken) {
      localStorage.setItem('accessToken', response.data.data.accessToken);
      // This matches the key used in your App.js
      localStorage.setItem('currentUser', JSON.stringify(response.data.data.user));
    }
    return response.data;
  },

  async logout() {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error("Logout error", error);
    }
    // Cleanup local storage using the correct keys
    localStorage.removeItem('accessToken');
    localStorage.removeItem('currentUser'); 
  },

  async verifyEmail(token) {
    const response = await api.get(`/auth/verify-email/${token}`);
    return response.data;
  },

  async refreshToken() {
    const response = await api.post('/auth/refresh');
    return response.data;
  },

  getCurrentUser() {
    const userStr = localStorage.getItem('currentUser');
    return userStr ? JSON.parse(userStr) : null;
  },

  isAuthenticated() {
    return !!localStorage.getItem('accessToken');
  }
};