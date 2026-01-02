  // src/services/userService.ts
  export const userService = {
    async getProfile() {
      const response = await api.get('/users/me');
      return response.data;
    },
  
    async updateProfile(data: { name?: string; avatarUrl?: string }) {
      const response = await api.patch('/users/me', data);
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
      return response.data;
    },
  
    async updatePassword(currentPassword: string, newPassword: string) {
      const response = await api.patch('/users/me/password', {
        currentPassword,
        newPassword
      });
      return response.data;
    },
  
    async updateSettings(settings: any) {
      const response = await api.patch('/users/me/settings', settings);
      return response.data;
    },
  
    async deleteAccount() {
      const response = await api.delete('/users/me');
      return response.data;
    }
  };
  
