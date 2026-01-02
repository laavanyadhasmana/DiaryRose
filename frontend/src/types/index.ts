  // src/types/index.ts
  export interface User {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string;
    isPremium: boolean;
    premiumExpiresAt?: string;
    emailVerified: boolean;
    settings?: any;
    createdAt: string;
  }
  
  export interface Entry {
    id: string;
    userId: string;
    type: 'WRITTEN' | 'VIDEO';
    title: string;
    content?: string;
    videoUrl?: string;
    videoThumbnail?: string;
    videoDuration?: number;
    mood?: string;
    privacy: 'PRIVATE' | 'PUBLIC';
    location?: string;
    locationCoords?: { lat: number; lng: number };
    wordCount?: number;
    viewCount: number;
    likeCount: number;
    tags: string[];
    images: string[];
    createdAt: string;
    updatedAt: string;
  }
  
  export interface Stats {
    totalEntries: number;
    videoEntries: number;
    writtenEntries: number;
    publicEntries: number;
    privateEntries: number;
    thisWeek: number;
    thisMonth: number;
    totalWords: number;
    streak: number;
  }
  
  export interface ApiResponse<T> {
    status: 'success' | 'error';
    data?: T;
    message?: string;
    errors?: any[];
  }
  
  export interface PaginatedResponse<T> {
    entries: T[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }
  