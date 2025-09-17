import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Course } from '../models/course.model';
import { ApiPaths } from '../shared/api-paths';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CoursService {
  // private apiUrl = 'https://api.arrisala.fr/courses';
  private apiUrl = ApiPaths.courses;
  private apiUrlUpload = ApiPaths.upload;

  constructor(private http: HttpClient) {}

  getCours(): Observable<Course[]> {
    return this.http.get<Course[]>(this.apiUrl);
  }

  getCoursById(id: number): Observable<Course> {
    return this.http.get<Course>(`${this.apiUrl}/${id}`);
  }

  ajouterCours(cours: Partial<Course>): Observable<Course> {
    return this.http.post<Course>(this.apiUrl, cours);
  }

  uploadFile(file: FormData): Observable<{ url: string }> {
    //const formData = new FormData();
    //formData.append('file', file);
    return this.http.post<{ url: string }>(
      `${this.apiUrlUpload}/multiple`,
      file
    );
  }
  suploadFile(file: File): Observable<{ url: string }> {
    const formData = new FormData();
    formData.append('files', file);
    return this.http.post<{ url: string }>(this.apiUrlUpload, formData);
  }

  createCourse(payload: any): Observable<any> {
    return this.http.post(this.apiUrl, payload);
  }

  getAllCourses(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  getCourse(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  markLessonAsCompleted(enrollmentId: number, lessonId: number) {
    return this.http.post(`${ApiPaths.lessonProgress}/complete`, {
      enrollmentId,
      lessonId,
    });
  }

  enrollToCourse(courseId: number) {
    return this.http.post(`${ApiPaths.enrollments}`, { courseId });
  }

  isEnrolled(courseId: number) {
    return this.http.get<{ enrolled: boolean; enrollmentId: number | null }>(
      `${ApiPaths.enrollments}/check/${courseId}`
    );
  }

  getCompletedLessons(enrollmentId: number) {
    return this.http.get<number[]>(
      `${ApiPaths.lessonProgress}/completed/${enrollmentId}`
    );
  }
}
