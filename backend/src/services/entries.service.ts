// src/services/entries.service.ts
import { PrismaClient, EntryType, EntryPrivacy } from '@prisma/client';
import { AppError } from '../utils/AppError';
import { StorageService } from './storage.service';

const prisma = new PrismaClient();
const storageService = new StorageService();

interface CreateEntryData {
  type: EntryType;
  title: string;
  content?: string;
  videoUrl?: string;
  videoDuration?: number;
  mood?: string;
  privacy: EntryPrivacy;
  location?: string;
  locationCoords?: any;
  tags?: string[];
  images?: string[];
}

export class EntriesService {
  async createEntry(userId: string, data: CreateEntryData) {
    // Check limits for free users
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { isPremium: true }
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Check video limits for free users
    if (data.type === EntryType.VIDEO && !user.isPremium) {
      const thisMonthVideos = await prisma.entry.count({
        where: {
          userId,
          type: EntryType.VIDEO,
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          }
        }
      });

      if (thisMonthVideos >= 10) {
        throw new AppError('Free tier video limit reached (10/month)', 403);
      }
    }

    // Calculate word count for written entries
    let wordCount;
    if (data.type === EntryType.WRITTEN && data.content) {
      wordCount = data.content.trim().split(/\s+/).length;
    }

    // Create entry
    const entry = await prisma.entry.create({
      data: {
        userId,
        type: data.type,
        title: data.title,
        content: data.content,
        videoUrl: data.videoUrl,
        videoDuration: data.videoDuration,
        mood: data.mood,
        privacy: data.privacy,
        location: data.location,
        locationCoords: data.locationCoords,
        wordCount
      },
      include: {
        tags: {
          include: {
            tag: true
          }
        },
        images: true
      }
    });

    // Handle tags
    if (data.tags && data.tags.length > 0) {
      for (const tagName of data.tags) {
        // Get or create tag
        let tag = await prisma.tag.findFirst({
          where: { userId, name: tagName }
        });

        if (!tag) {
          tag = await prisma.tag.create({
            data: { userId, name: tagName }
          });
        }

        // Link tag to entry
        await prisma.entryTag.create({
          data: {
            entryId: entry.id,
            tagId: tag.id
          }
        });
      }
    }

    // Handle images
    if (data.images && data.images.length > 0) {
      await Promise.all(
        data.images.map((imageUrl, index) =>
          prisma.entryImage.create({
            data: {
              entryId: entry.id,
              imageUrl,
              orderIndex: index
            }
          })
        )
      );
    }

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId,
        action: 'ENTRY_CREATED',
        metadata: { entryId: entry.id, type: data.type }
      }
    });

    return this.getEntryById(userId, entry.id);
  }

  async getEntries(
    userId: string,
    filters: {
      type?: EntryType;
      privacy?: EntryPrivacy;
      mood?: string;
      search?: string;
      tags?: string[];
      page?: number;
      limit?: number;
      sortBy?: 'newest' | 'oldest';
    }
  ) {
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {
      userId,
      deletedAt: null
    };

    if (filters.type) where.type = filters.type;
    if (filters.privacy) where.privacy = filters.privacy;
    if (filters.mood) where.mood = filters.mood;

    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { content: { contains: filters.search, mode: 'insensitive' } }
      ];
    }

    if (filters.tags && filters.tags.length > 0) {
      where.tags = {
        some: {
          tag: {
            name: { in: filters.tags }
          }
        }
      };
    }

    const [entries, total] = await Promise.all([
      prisma.entry.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: filters.sortBy === 'oldest' ? 'asc' : 'desc'
        },
        include: {
          tags: {
            include: {
              tag: true
            }
          },
          images: {
            orderBy: { orderIndex: 'asc' }
          }
        }
      }),
      prisma.entry.count({ where })
    ]);

    return {
      entries: entries.map(this.formatEntry),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  async getEntryById(userId: string, entryId: string) {
    const entry = await prisma.entry.findFirst({
      where: {
        id: entryId,
        userId,
        deletedAt: null
      },
      include: {
        tags: {
          include: {
            tag: true
          }
        },
        images: {
          orderBy: { orderIndex: 'asc' }
        }
      }
    });

    if (!entry) {
      throw new AppError('Entry not found', 404);
    }

    // Increment view count
    await prisma.entry.update({
      where: { id: entryId },
      data: { viewCount: { increment: 1 } }
    });

    return this.formatEntry(entry);
  }

  async updateEntry(
    userId: string,
    entryId: string,
    data: Partial<CreateEntryData>
  ) {
    const entry = await prisma.entry.findFirst({
      where: {
        id: entryId,
        userId,
        deletedAt: null
      }
    });

    if (!entry) {
      throw new AppError('Entry not found', 404);
    }

    // Calculate word count if content is being updated
    let wordCount = entry.wordCount;
    if (data.content) {
      wordCount = data.content.trim().split(/\s+/).length;
    }

    const updated = await prisma.entry.update({
      where: { id: entryId },
      data: {
        ...data,
        wordCount,
        updatedAt: new Date()
      },
      include: {
        tags: {
          include: {
            tag: true
          }
        },
        images: {
          orderBy: { orderIndex: 'asc' }
        }
      }
    });

    // Update tags if provided
    if (data.tags) {
      // Remove existing tags
      await prisma.entryTag.deleteMany({
        where: { entryId }
      });

      // Add new tags
      for (const tagName of data.tags) {
        let tag = await prisma.tag.findFirst({
          where: { userId, name: tagName }
        });

        if (!tag) {
          tag = await prisma.tag.create({
            data: { userId, name: tagName }
          });
        }

        await prisma.entryTag.create({
          data: {
            entryId,
            tagId: tag.id
          }
        });
      }
    }

    return this.formatEntry(updated);
  }

  async deleteEntry(userId: string, entryId: string) {
    const entry = await prisma.entry.findFirst({
      where: {
        id: entryId,
        userId,
        deletedAt: null
      }
    });

    if (!entry) {
      throw new AppError('Entry not found', 404);
    }

    // Soft delete
    await prisma.entry.update({
      where: { id: entryId },
      data: { deletedAt: new Date() }
    });

    return { message: 'Entry deleted successfully' };
  }

  async getStats(userId: string) {
    const now = new Date();
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalEntries,
      videoEntries,
      writtenEntries,
      publicEntries,
      thisWeek,
      thisMonth,
      totalWords
    ] = await Promise.all([
      prisma.entry.count({
        where: { userId, deletedAt: null }
      }),
      prisma.entry.count({
        where: { userId, type: EntryType.VIDEO, deletedAt: null }
      }),
      prisma.entry.count({
        where: { userId, type: EntryType.WRITTEN, deletedAt: null }
      }),
      prisma.entry.count({
        where: { userId, privacy: EntryPrivacy.PUBLIC, deletedAt: null }
      }),
      prisma.entry.count({
        where: {
          userId,
          deletedAt: null,
          createdAt: { gte: startOfWeek }
        }
      }),
      prisma.entry.count({
        where: {
          userId,
          deletedAt: null,
          createdAt: { gte: startOfMonth }
        }
      }),
      prisma.entry.aggregate({
        where: {
          userId,
          type: EntryType.WRITTEN,
          deletedAt: null
        },
        _sum: { wordCount: true }
      })
    ]);

    // Calculate streak
    const streak = await this.calculateStreak(userId);

    return {
      totalEntries,
      videoEntries,
      writtenEntries,
      publicEntries,
      privateEntries: totalEntries - publicEntries,
      thisWeek,
      thisMonth,
      totalWords: totalWords._sum.wordCount || 0,
      streak
    };
  }

  async getOnThisDayEntries(userId: string) {
    const now = new Date();
    const month = now.getMonth();
    const day = now.getDate();
    const currentYear = now.getFullYear();

    const entries = await prisma.$queryRaw`
      SELECT * FROM entries
      WHERE user_id = ${userId}
        AND deleted_at IS NULL
        AND EXTRACT(MONTH FROM created_at) = ${month + 1}
        AND EXTRACT(DAY FROM created_at) = ${day}
        AND EXTRACT(YEAR FROM created_at) != ${currentYear}
      ORDER BY created_at DESC
    `;

    return entries;
  }

  private async calculateStreak(userId: string): Promise<number> {
    const entries = await prisma.entry.findMany({
      where: { userId, deletedAt: null },
      select: { createdAt: true },
      orderBy: { createdAt: 'desc' }
    });

    if (entries.length === 0) return 0;

    const dates = [
      ...new Set(
        entries.map((e) => e.createdAt.toISOString().split('T')[0])
      )
    ];

    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000)
      .toISOString()
      .split('T')[0];

    if (dates[0] !== today && dates[0] !== yesterday) return 0;

    let streak = 0;
    for (let i = 0; i < dates.length; i++) {
      const expectedDate = new Date(Date.now() - i * 86400000)
        .toISOString()
        .split('T')[0];
      if (dates[i] === expectedDate) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  }

  private formatEntry(entry: any) {
    return {
      ...entry,
      tags: entry.tags?.map((et: any) => et.tag.name) || [],
      images: entry.images?.map((img: any) => img.imageUrl) || []
    };
  }
}

