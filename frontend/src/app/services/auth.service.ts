import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap, catchError, throwError } from 'rxjs';
import { User, AuthResponse, LoginRequest, RegisterRequest } from '../models/user.model';
import { TokenStorageService } from './token-storage.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:5000/api';
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private tokenStorage: TokenStorageService
  ) {
    // Load user from storage on service initialization
    const user = this.tokenStorage.getUser();
    if (user) {
      this.currentUserSubject.next(user);
      this.setupTokenRefresh();
    }
  }

  private setupTokenRefresh(): void {
    setInterval(() => {
      if (this.isLoggedIn()) {
        const refreshToken = this.tokenStorage.getRefreshToken();
        if (refreshToken) {
          this.refreshToken(refreshToken).subscribe();
        }
      }
    }, 45 * 60 * 1000); // Refresh token every 45 minutes
  }

  /**
   * Register a new user
   */
  register(data: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/register`, data)
      .pipe(
        tap(response => {
          if (response.ok && response.user && response.tokens) {
            this.storeAuthData(response.user, response.tokens.access, response.tokens.refresh);
          }
        }),
        catchError(error => {
          return throwError(() => error);
        })
      );
  }

  /**
   * Login user
   */
  login(data: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, data)
      .pipe(
        tap(response => {
          if (response.ok && response.user && response.tokens) {
            this.storeAuthData(response.user, response.tokens.access, response.tokens.refresh);
          }
        }),
        catchError(error => {
          return throwError(() => error);
        })
      );
  }

  /**
   * Logout user
   */
  logout(): void {
    this.tokenStorage.clear();
    this.currentUserSubject.next(null);
  }

  /**
   * Refresh access token using refresh token
   * @param token The refresh token to use
   */
  refreshToken(token?: string): Observable<AuthResponse> {
    const refreshToken = token || this.tokenStorage.getRefreshToken();
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/refresh`, { refreshToken })
      .pipe(
        tap(response => {
          if (response.ok && response.tokens) {
            this.tokenStorage.saveAccessToken(response.tokens.access);
            if (response.tokens.refresh) {
              this.tokenStorage.saveRefreshToken(response.tokens.refresh);
            }
          }
        }),
        catchError(error => {
          // If refresh fails, logout the user
          this.logout();
          return throwError(() => error);
        })
      );
  }

  /**
   * Check if user is logged in
   */
  isLoggedIn(): boolean {
    return !!this.tokenStorage.getAccessToken();
  }

  /**
   * Get current user value
   */
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Store authentication data
   */
  private storeAuthData(user: User, accessToken: string, refreshToken: string): void {
    this.tokenStorage.saveUser(user);
    this.tokenStorage.saveAccessToken(accessToken);
    this.tokenStorage.saveRefreshToken(refreshToken);
    this.currentUserSubject.next(user);
  }
}