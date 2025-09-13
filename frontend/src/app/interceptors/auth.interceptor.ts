import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject, catchError, switchMap, filter, take } from 'rxjs';
import { TokenStorageService } from '../services/token-storage.service';
import { AuthService } from '../services/auth.service';
import { inject } from '@angular/core';

// Track token refresh state
let isRefreshing = false;
const refreshTokenSubject = new BehaviorSubject<string | null>(null);

export const AuthInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  const tokenStorage = inject(TokenStorageService);
  const authService = inject(AuthService);
  
  let authReq = req;
  const token = tokenStorage.getAccessToken();
  console.log('Interceptor triggered for:', req.url);
  console.log('Token:', token);

  if (token) {
    authReq = addTokenHeader(req, token);
  }

  return next(authReq).pipe(
    catchError(error => {
      if (error instanceof HttpErrorResponse && error.status === 401) {
        return handle401Error(authReq, next, tokenStorage, authService);
      }
      return throwError(() => error);
    })
  );
};

function addTokenHeader(request: HttpRequest<any>, token: string) {
  return request.clone({
    headers: request.headers.set('Authorization', `Bearer ${token}`)
  });
}

function handle401Error(
  request: HttpRequest<any>, 
  next: HttpHandlerFn,
  tokenStorage: TokenStorageService,
  authService: AuthService
) {
  if (!isRefreshing) {
    isRefreshing = true;
    refreshTokenSubject.next(null);

    const refreshToken = tokenStorage.getRefreshToken();

    if (refreshToken) {
      return authService.refreshToken(refreshToken).pipe(
        switchMap((token: any) => {
          isRefreshing = false;
          
          if (token.ok && token.tokens) {
            const accessToken = token.tokens.access;
            tokenStorage.saveAccessToken(accessToken);
            refreshTokenSubject.next(accessToken);
            return next(addTokenHeader(request, accessToken));
          }
          return throwError(() => new Error('Failed to refresh token'));
        }),
        catchError((err) => {
          isRefreshing = false;
           tokenStorage.clear();
           return throwError(() => err);
        })
      );
    } else {
      isRefreshing = false;
       tokenStorage.clear();
       return throwError(() => new Error('Refresh token not available'));
    }
  }

  return refreshTokenSubject.pipe(
    filter(token => token !== null),
    take(1),
    switchMap(token => next(addTokenHeader(request, token!)))
  );
}