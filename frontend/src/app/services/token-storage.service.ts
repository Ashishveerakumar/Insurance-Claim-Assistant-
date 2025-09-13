import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TokenStorageService {
  private readonly ACCESS_TOKEN_KEY = 'auth-access-token';
  private readonly REFRESH_TOKEN_KEY = 'auth-refresh-token';
  private readonly USER_KEY = 'auth-user';
  private readonly TOKEN_EXPIRY_KEY = 'auth-token-expiry';

  constructor() {}

  /**
   * Clear all authentication data from local storage
   */
  public clear(): void {
    console.log('Clearing local storage');
    localStorage.clear();
  }

  /**
   * Save access token to local storage
   */
  public saveAccessToken(token: string): void {
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.setItem(this.ACCESS_TOKEN_KEY, token);
    
    // Set token expiry to 1 hour from now
    const expiryTime = new Date().getTime() + (60 * 60 * 1000);
    localStorage.setItem(this.TOKEN_EXPIRY_KEY, expiryTime.toString());
  }

  /**
   * Get access token from local storage
   */
  public getAccessToken(): string | null {
    const token = localStorage.getItem(this.ACCESS_TOKEN_KEY);
    const expiry = localStorage.getItem(this.TOKEN_EXPIRY_KEY);
    
    if (!token || !expiry) {
      return null;
    }
    
    // Check if token has expired
    const expiryTime = parseInt(expiry, 10);
    if (new Date().getTime() > expiryTime) {
      this.clear();
      return null;
    }
    
    return token;
  }

  /**
   * Save refresh token to local storage
   */
  public saveRefreshToken(token: string): void {
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, token);
  }

  /**
   * Get refresh token from local storage
   */
  public getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  /**
   * Save user data to local storage
   */
  public saveUser(user: any): void {
    localStorage.removeItem(this.USER_KEY);
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  /**
   * Get user data from local storage
   */
  public getUser(): any {
    const user = localStorage.getItem(this.USER_KEY);
    if (user) {
      return JSON.parse(user);
    }
    return null;
  }
}