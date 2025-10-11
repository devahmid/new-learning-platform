import { computed, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { LoginDto, RegisterDto } from '../models/user.model';
import { map, Observable, of, switchMap, tap } from 'rxjs';
import { LevelDto } from '../models/levelDto.model';
import { ApiPaths } from '../shared/api-paths';
import {
  ChildProfilePayload,
  CreateChildPayload,
  UserPayload,
} from '../models/payloads';
import { GoogleAnalyticsService } from '../services/google-analytics.service';

// type UserPayload = {
//   id: number;
//   email: string;
//   role: string;
//   firstName: string;
//   lastName: string;
//   type: string;
//   phoneNumber: string;
//   address: string;
//   dateOfBirth: string;
// };

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrlUsers = ApiPaths.users;
  private apiUrlAuth = ApiPaths.auth;
  private userSignal = signal<UserPayload | null>(null);

  constructor(
    private http: HttpClient,
    private googleAnalytics: GoogleAnalyticsService
  ) {
    this.initUser();
  }

  setToken(token: string) {
    localStorage.setItem('token', token);
    const payload = jwtDecode(token);
    if (payload?.sub && payload?.email && payload?.role) {
      this.userSignal.set({
        id: payload.sub,
        email: payload.email,
        role: payload.role,
        firstName: payload.firstName ?? '',
        lastName: payload.lastName ?? '',
        type: payload.type ?? '',
        phoneNumber: payload.phoneNumber ?? '',
        address: payload.address ?? '',
        dateOfBirth: payload.dateOfBirth ?? '',
        status: payload.status ?? 'approved',
        rejection_reason: payload.rejection_reason ?? null,
      });
    }
  }

  logout() {
    localStorage.removeItem('token');
    this.userSignal.set(null);

    // Nettoyer le contexte des enfants
    // Note: On ne peut pas injecter ChildContextService ici car cela créerait une dépendance circulaire
    // Le nettoyage sera fait dans les composants qui gèrent la déconnexion
  }

  private initUser() {
    const token = localStorage.getItem('token');
    if (!token) return;

    const payload = jwtDecode(token);
    if (payload?.sub && payload?.email && payload?.role) {
      this.userSignal.set({
        id: payload.sub,
        email: payload.email,
        role: payload.role,
        firstName: payload.firstName ?? '',
        lastName: payload.lastName ?? '',
        type: payload.type ?? '',
        phoneNumber: payload.phoneNumber ?? '',
        address: payload.address ?? '',
        dateOfBirth: payload.dateOfBirth ?? '',
        status: payload.status ?? 'approved',
        rejection_reason: payload.rejection_reason ?? null,
      });

      this.fetchAndMergeParentProfile().subscribe(); // ✅ Ajoute ça
    }
  }

  // login(credentials: { email: string; motDePasse: string }): Observable<any> {
  //   const payload: LoginDto = {
  //     email: credentials.email,
  //     password: credentials.motDePasse
  //   };

  //   return this.http.post(`${this.apiUrlAuth}/login`, payload);
  // }

  login(credentials: { email: string; motDePasse: string }): Observable<any> {
    const payload: LoginDto = {
      email: credentials.email,
      password: credentials.motDePasse,
    };

    return this.http
      .post<{ access_token: string }>(`${this.apiUrlAuth}/login`, payload)
      .pipe(
        tap((res) => {
          this.setToken(res.access_token);
        }),
        switchMap(() => {
          return this.fetchAndMergeParentProfile();
        }),
        tap((userProfile) => {
          // Tracker la connexion utilisateur
          if (userProfile && userProfile.id) {
            this.googleAnalytics.trackUserLogin(userProfile.id.toString(), 'email');
          }
        }),

        map(() => true) // ou `of(true)` pour signaler que tout est OK
      );
  }

  public fetchAndMergeParentProfile(): Observable<any> {
    const id = this.userSignal()?.id;
    if (!id) return of(null);

    return this.getParentProfile(id).pipe(
      tap((res: any) => {
        const current = this.userSignal();
        if (!current) return;

        // Fusionner toutes les informations de l'utilisateur
        this.userSignal.set({
          ...current,
          // Informations de base de l'utilisateur
          firstName: res.firstName || current.firstName,
          lastName: res.lastName || current.lastName,
          email: res.email || current.email,
          phoneNumber: res.phoneNumber || current.phoneNumber,
          address: res.address || current.address,
          dateOfBirth: res.dateOfBirth || current.dateOfBirth,
          type: res.type || current.type,
          role: res.role || current.role,
          // Informations spécifiques au parent
          parentProfile: res.parentProfile,
          children: res.children,
          payments: res.payments,
          // Statut de validation
          status: res.status || current.status,
          rejection_reason: res.rejection_reason || current.rejection_reason,
        });
      })
    );
  }

  register(user: RegisterDto): Observable<any> {
    return this.http.post(`${this.apiUrlUsers}`, user).pipe(
      tap((response) => {
        // Tracker l'inscription
        this.googleAnalytics.trackUserSignup('email');
      })
    );
  }

  updateUser(
    id: number,
    data: { firstName: string; lastName: string }
  ): Observable<any> {
    return this.http.patch(`${this.apiUrlUsers}/${id}`, data);
  }

  getChildren(parentId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrlUsers}/${parentId}/children`);
  }

  addChild(data: CreateChildPayload): Observable<any> {
    return this.http.post(`${this.apiUrlUsers}/children`, data);
  }

  updateChild(childId: number, data: { firstName: string; lastName: string }) {
    return this.http.patch(`${this.apiUrlUsers}/children/${childId}`, data);
  }

  deleteChild(childId: number) {
    return this.http.delete(`${this.apiUrlUsers}/children/${childId}`);
  }

  deleteMyAccount(id: number) {
    return this.http.delete(`${this.apiUrlUsers}/${id}`);
  }

  getLevels(): Observable<LevelDto[]> {
    return this.http.get<LevelDto[]>(`${ApiPaths.levels}`);
  }

  changePassword(
    currentPassword: string,
    newPassword: string
  ): Observable<any> {
    return this.http.post(`${this.apiUrlAuth}/change-password`, {
      currentPassword,
      newPassword,
    });
  }

  // === ACCESSORS ===

  get user() {
    return this.userSignal.asReadonly();
  }

  get role() {
    return computed(() => this.userSignal()?.role ?? null);
  }

  get isLoggedIn() {
    return computed(() => !!this.userSignal());
  }

  get isAdmin() {
    return computed(() => this.userSignal()?.role === 'admin');
  }

  get email() {
    return computed(() => this.userSignal()?.email ?? null);
  }
  get firstName() {
    return computed(() => this.userSignal()?.firstName ?? null);
  }
  get lastName() {
    return computed(() => this.userSignal()?.lastName ?? null);
  }
  get phoneNumber() {
    return computed(() => this.userSignal()?.phoneNumber ?? null);
  }
  get address() {
    return computed(() => this.userSignal()?.address ?? null);
  }
  get dateOfBirth() {
    return computed(() => this.userSignal()?.dateOfBirth ?? null);
  }
  get type() {
    return computed(() => this.userSignal()?.type ?? null);
  }
  get isParent() {
    return computed(() => this.userSignal()?.role === 'parent');
  }
  get isStudent() {
    return computed(() => this.userSignal()?.role === 'student');
  }
  get isTeacher() {
    return computed(() => this.userSignal()?.role === 'teacher');
  }
  get isAdminOrParent() {
    return computed(
      () =>
        this.userSignal()?.role === 'admin' ||
        this.userSignal()?.role === 'parent'
    );
  }
  get isAdminOrStudent() {
    return computed(
      () =>
        this.userSignal()?.role === 'admin' ||
        this.userSignal()?.role === 'student'
    );
  }
  get isAdminOrTeacher() {
    return computed(
      () =>
        this.userSignal()?.role === 'admin' ||
        this.userSignal()?.role === 'teacher'
    );
  }

  get fullName() {
    return computed(() => {
      const u = this.userSignal();
      return u ? `${u.firstName} ${u.lastName}`.trim() : null;
    });
  }

  get id() {
    return computed(() => this.userSignal()?.id ?? null);
  }

  getCurrentUser(): Observable<UserPayload | null> {
    return of(this.userSignal());
  }

  requestPasswordReset(email: string): Observable<any> {
    return this.http.post(`${this.apiUrlUsers}/request-password-reset`, {
      email,
    });
  }

  resetPassword(token: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrlUsers}/reset-password`, {
      token,
      password,
    });
  }

  getParentProfile(userId: number) {
    return this.http.get(`${this.apiUrlUsers}/parents/${userId}`);
  }

  updateParentProfile(userId: number, data: any) {
    return this.http.patch(`${this.apiUrlUsers}/parents/${userId}`, data);
  }
}

function jwtDecode(token: string): any {
  // const token = localStorage.getItem('token');
  if (!token) return null;

  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch {
    return null;
  }
}
