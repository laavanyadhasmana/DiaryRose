// frontend/src/services/userService.js
import api from './api';

export const userService = {
  async getProfile() {
    const response = await api.get('/users/me');
    return response.data;
  },

  async updateProfile(data) {
    const response = await api.patch('/users/me', data);
    
    // FIXED: Changed 'user' to 'currentUser' to match your App.js logic
    if (response.data && response.data.data && response.data.data.user) {
      localStorage.setItem('currentUser', JSON.stringify(response.data.data.user));
    }
    
    return response.data;
  },

  async updatePassword(currentPassword, newPassword) {
    const response = await api.patch('/users/me/password', {
      currentPassword,
      newPassword
    });
    return response.data;
  },

  async updateSettings(settings) {
    const response = await api.patch('/users/me/settings', settings);
    return response.data;
  },

  async deleteAccount() {
    const response = await api.delete('/users/me');
    return response.data;
  }
};