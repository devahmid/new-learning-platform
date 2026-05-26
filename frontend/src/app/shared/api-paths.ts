import { environment } from '../../environments/environment';

export const ApiPaths = {
  auth: `${environment.apiUrl}/auth`,
  users: `${environment.apiUrl}/users`,
  classes: `${environment.apiUrl}/classes`,
  payments: `${environment.apiUrl}/payment`,
  levels: `${environment.apiUrl}/levels`,
  courses: `${environment.apiUrl}/courses`,
  upload: `${environment.apiUrl}/upload`,
  schedules: `${environment.apiUrl}/schedules`,
  notifications: `${environment.apiUrl}/notifications`,
  registration: `${environment.apiUrl}/registration`,
  reinscriptions: `${environment.apiUrl}/reinscriptions`,
  lessonProgress: `${environment.apiUrl}/lesson-progress`,
  enrollments: `${environment.apiUrl}/enrollments`,
};
