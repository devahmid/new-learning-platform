import {
  Controller,
  Post,
  Get,
  Param,
  UploadedFile,
  UseInterceptors,
  Res,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { Response } from 'express';
import { UploadService } from './upload.service';
import { Express } from 'express';

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) { }

  @Post('multiple')
  @UseInterceptors(FileInterceptor('files', {
    storage: diskStorage({
      destination: './uploads',
      filename: (req, file, cb) => {
        const ext = extname(file.originalname);
        const filename = `${file.fieldname}-${Date.now()}${ext}`;
        cb(null, filename);
      },
    }),
  }))
  uploadMultiple(@UploadedFile() file: Express.Multer.File) {
    // Générer l'URL complète pour l'hébergement mutualisé
    const baseUrl = process.env.API_BASE_URL || 'http://localhost:3000';
    const fileUrl = `${baseUrl}/upload/${file.filename}`;
    
    return {
      url: fileUrl,
      originalName: file.originalname,
      type: file.mimetype,
      size: file.size,
      filename: file.filename
    };
  }


  // @Get(':filename')
  // getFile(@Param('filename') filename: string, @Res() res: Response) {
  //   const stream = this.uploadService.getFileStream(filename);
  //   stream.pipe(res);
  // }
  @Get(':filename')
  getFile(@Param('filename') filename: string, @Res() res: Response) {
    const filePath = this.uploadService.getFilePath(filename);

    // Set headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');
    res.setHeader('Content-Disposition', 'inline'); // or attachment; filename="..."
    res.setHeader('Content-Type', this.getMimeType(filename));

    const stream = this.uploadService.getFileStream(filename);
    stream.pipe(res);
  }

  private getMimeType(filename: string): string {
    const ext = extname(filename).toLowerCase();
    switch (ext) {
      case '.pdf':
        return 'application/pdf';
      case '.jpg':
      case '.jpeg':
        return 'image/jpeg';
      case '.png':
        return 'image/png';
      default:
        return 'application/octet-stream';
    }
  }

}
