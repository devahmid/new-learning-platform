import { Injectable } from '@nestjs/common';
import { join } from 'path';
import * as fs from 'fs';
import { Express } from 'express';

@Injectable()
export class UploadService {
  private readonly uploadDir = 'uploads';
  private readonly maxFileSize = 10 * 1024 * 1024; // 10MB
  private readonly allowedMimeTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/pdf',
    'video/mp4',
    'video/webm',
    'audio/mp3',
    'audio/wav'
  ];

  saveFile(file: Express.Multer.File): string {
    console.log('Saving file:', file.filename);
    const filePath = join(this.uploadDir, file.filename);
    return filePath;
  }

  getFilePath(filename: string): string {
    return join(process.cwd(), this.uploadDir, filename);
  }

  getFileStream(filename: string): fs.ReadStream {
    const path = this.getFilePath(filename);
    return fs.createReadStream(path);
  }

  validateFile(file: Express.Multer.File): boolean {
    // Vérifier la taille
    if (file.size > this.maxFileSize) {
      throw new Error(`Fichier trop volumineux. Maximum: ${this.maxFileSize / 1024 / 1024}MB`);
    }

    // Vérifier le type MIME
    if (!this.allowedMimeTypes.includes(file.mimetype)) {
      throw new Error(`Type de fichier non autorisé: ${file.mimetype}`);
    }

    return true;
  }

  generatePublicUrl(filename: string): string {
    const baseUrl = process.env.API_BASE_URL || 'http://localhost:3000';
    return `${baseUrl}/upload/${filename}`;
  }

  deleteFile(filename: string): boolean {
    try {
      const filePath = this.getFilePath(filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error deleting file:', error);
      return false;
    }
  }
}
