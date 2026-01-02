// src/services/entriesService.ts
export interface CreateEntryData {
    type: 'WRITTEN' | 'VIDEO';
    title: string;
    content?: string;
    videoUrl?: string;
    videoDuration?: number;
    mood?: string;
    privacy: 'PRIVATE' | 'PUBLIC';
    location?: string;
    locationCoords?: { lat: number; lng: number };
    tags?: string[];
    images?: string[];
  }
  
  export const entriesService = {
    async createEntry(data: CreateEntryData) {
      const response = await api.post('/entries', data);
      return response.data;
    },
  
    async getEntries(filters?: {
      type?: 'WRITTEN' | 'VIDEO';
      privacy?: 'PRIVATE' | 'PUBLIC';
      mood?: string;
      search?: string;
      tags?: string[];
      page?: number;
      limit?: number;
      sortBy?: 'newest' | 'oldest';
    }) {
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined) {
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
  
    async getEntry(id: string) {
      const response = await api.get(`/entries/${id}`);
      return response.data;
    },
  
    async updateEntry(id: string, data: Partial<CreateEntryData>) {
      const response = await api.patch(`/entries/${id}`, data);
      return response.data;
    },
  
    async deleteEntry(id: string) {
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
  
