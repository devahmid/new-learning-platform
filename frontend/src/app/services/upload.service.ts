import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface UploadResponse {
  url: string;
  originalName?: string;
  type?: string;
  size?: number;
  filename?: string;
}

@Injectable({
  providedIn: 'root'
})
export class UploadService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /**
   * Upload un fichier vers l'API
   */
  uploadFile(file: File): Observable<UploadResponse> {
    const formData = new FormData();
    formData.append('files', file);

    // Essayer d'abord l'API NestJS locale
    if (environment.apiType === 'nestjs') {
      return this.uploadToNestJS(formData);
    } else {
      // Fallback vers l'API PHP
      return this.uploadToPHP(formData);
    }
  }

  /**
   * Upload une carte mentale vers l'API PHP
   */
  uploadMindMap(file: File): Observable<UploadResponse> {
    const formData = new FormData();
    formData.append('mindmap', file); // ← Utilise 'mindmap' au lieu de 'files'

    return this.http.post<any>(this.apiUrl + '/upload/mindmap', formData)
      .pipe(
        map(response => {
          // Adapter la réponse de l'API PHP au format attendu
          if (response && response.url) {
            return {
              url: response.url,
              originalName: response.originalName || file.name,
              type: response.type || file.type,
              size: response.size || file.size,
              filename: response.filename || response.url.split('/').pop()
            };
          }
          throw new Error('Réponse invalide du serveur');
        }),
        catchError(error => {
          console.error('Erreur upload carte mentale:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Upload vers l'API NestJS
   */
  private uploadToNestJS(formData: FormData): Observable<UploadResponse> {
    return this.http.post<UploadResponse>(`${this.apiUrl}/upload/multiple`, formData)
      .pipe(
        catchError(error => {
          console.warn('API NestJS non disponible, tentative avec l\'API PHP...', error);
          return this.uploadToPHP(formData);
        })
      );
  }

  /**
   * Upload vers l'API PHP
   */
  private uploadToPHP(formData: FormData): Observable<UploadResponse> {
    return this.uploadToPHPReal(formData);
  }

  /**
   * Upload vers l'API PHP réelle
   */
  private uploadToPHPReal(formData: FormData): Observable<UploadResponse> {
    return this.http.post<any>(this.apiUrl+'/upload/multiple', formData)
      .pipe(
        map(response => {
          // Adapter la réponse de l'API PHP au format attendu
          if (response && response.url) {
            return {
              url: response.url,
              originalName: response.originalName || (formData.get('files') as File).name,
              type: response.type || (formData.get('files') as File).type,
              size: response.size || (formData.get('files') as File).size,
              filename: response.filename || response.url.split('/').pop()
            };
          }
          throw new Error('Réponse invalide du serveur');
        }),
        catchError(error => {
          console.error('Erreur upload PHP:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Obtenir l'extension d'un fichier
   */
  private getFileExtension(file: File): string {
    return file.name.split('.').pop() || '';
  }

  /**
   * Valider un fichier avant upload
   */
  validateFile(file: File): { valid: boolean; message?: string } {
    const maxSize = 50 * 1024 * 1024; // 50MB
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/pdf',
      'video/mp4',
      'video/webm',
      'video/avi',
      'audio/mp3',
      'audio/wav',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];

    if (file.size > maxSize) {
      return {
        valid: false,
        message: `Fichier trop volumineux. Maximum: ${maxSize / 1024 / 1024}MB`
      };
    }

    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        message: `Type de fichier non autorisé: ${file.type}`
      };
    }

    return { valid: true };
  }
}
