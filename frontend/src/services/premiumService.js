// frontend/src/services/premiumService.js
import api from './api';

export const premiumService = {
  async createCheckoutSession(priceId) {
    const response = await api.post('/premium/checkout', { priceId });
    return response.data;
  },

  async cancelSubscription() {
    const response = await api.post('/premium/cancel');
    return response.data;
  },

  async getSubscriptionStatus() {
    const response = await api.get('/premium/status');
    return response.data;
  }
};