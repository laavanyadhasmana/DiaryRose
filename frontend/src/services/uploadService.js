// frontend/src/services/uploadService.js
import api from './api';

export const premiumService = {
  async createCheckoutSession(priceId) {
    const response = await api.post('/premium/checkout', { priceId });
    return response.data;
  }
};