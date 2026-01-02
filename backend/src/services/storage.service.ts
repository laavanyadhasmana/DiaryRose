// src/services/storage.service.ts
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';
import { AppError } from '../utils/AppError';

const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
  }
});

export class StorageService {
  async getUploadUrl(
    userId: string,
    fileName: string,
    fileType: string,
    contentType: 'image' | 'video'
  ): Promise<{ uploadUrl: string; fileUrl: string }> {
    const fileExtension = fileName.split('.').pop();
    const key = `${contentType}s/${userId}/${uuidv4()}.${fileExtension}`;
    
    const bucket = contentType === 'video' 
      ? process.env.AWS_S3_VIDEO_BUCKET! 
      : process.env.AWS_S3_BUCKET!;

    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      ContentType: fileType
    });

    const uploadUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 3600 // 1 hour
    });

    const fileUrl = `https://${bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

    return { uploadUrl, fileUrl };
  }

  async deleteFile(fileUrl: string): Promise<void> {
    try {
      const url = new URL(fileUrl);
      const key = url.pathname.substring(1); // Remove leading slash
      const bucket = url.hostname.split('.')[0];

      const command = new DeleteObjectCommand({
        Bucket: bucket,
        Key: key
      });

      await s3Client.send(command);
    } catch (error) {
      console.error('Error deleting file from S3:', error);
      throw new AppError('Failed to delete file', 500);
    }
  }
}

