import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CloudStorageService {
  constructor(private configService: ConfigService) {}

  // Configuration pour différents fournisseurs cloud
  getCloudConfig() {
    return {
      // AWS S3
      aws: {
        accessKeyId: this.configService.get('AWS_ACCESS_KEY_ID'),
        secretAccessKey: this.configService.get('AWS_SECRET_ACCESS_KEY'),
        region: this.configService.get('AWS_REGION', 'eu-west-3'),
        bucket: this.configService.get('AWS_S3_BUCKET')
      },
      // Cloudinary (recommandé pour les images/vidéos)
      cloudinary: {
        cloud_name: this.configService.get('CLOUDINARY_CLOUD_NAME'),
        api_key: this.configService.get('CLOUDINARY_API_KEY'),
        api_secret: this.configService.get('CLOUDINARY_API_SECRET')
      },
      // Google Cloud Storage
      gcp: {
        projectId: this.configService.get('GCP_PROJECT_ID'),
        keyFilename: this.configService.get('GCP_KEY_FILE'),
        bucket: this.configService.get('GCP_BUCKET')
      }
    };
  }

  // URL de base pour les fichiers cloud
  getCloudBaseUrl(provider: 'aws' | 'cloudinary' | 'gcp'): string {
    const config = this.getCloudConfig();
    
    switch (provider) {
      case 'aws':
        return `https://${config.aws.bucket}.s3.${config.aws.region}.amazonaws.com`;
      case 'cloudinary':
        return `https://res.cloudinary.com/${config.cloudinary.cloud_name}`;
      case 'gcp':
        return `https://storage.googleapis.com/${config.gcp.bucket}`;
      default:
        return '';
    }
  }
}
