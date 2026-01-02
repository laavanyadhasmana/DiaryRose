export const premiumService = {
    async createCheckoutSession(priceId: string) {
      const response = await api.post('/premium/checkout', { priceId });
      return response.data;
    }
  };
  