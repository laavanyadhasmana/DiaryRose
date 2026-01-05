// frontend/src/services/entriesService.js
import api from './api';

export const entriesService = {
  async createEntry(data) {
    const response = await api.post('/entries', data);
    return response.data;
  },

  async getEntries(filters) {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        // FIXED: Added check for 'all' and null to prevent backend errors
        if (value !== undefined && value !== null && value !== 'all') {
          if (Array.isArray(value)) {
            params.append(key, value.join(','));
          } else {
            params.append(key, value.toString());
          }
        }
      });
    }
    const response = await api.get(`/entries?${params.toString()}`);
    return response.data;
  },

  async getEntry(id) {
    const response = await api.get(`/entries/${id}`);
    return response.data;
  },

  async updateEntry(id, data) {
    const response = await api.patch(`/entries/${id}`, data);
    return response.data;
  },

  async deleteEntry(id) {
    const response = await api.delete(`/entries/${id}`);
    return response.data;
  },

  async getStats() {
    const response = await api.get('/entries/stats');
    return response.data;
  },

  async getOnThisDay() {
    const response = await api.get('/entries/on-this-day');
    return response.data;
  }
};