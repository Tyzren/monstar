import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { AuthService } from '../services/auth.service';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError } from 'rxjs';

/**
 * Flag to prevent multiple simultaneous token refresh requests.
 * When true, other failed requests wait for the ongoing refresh to complete.
 */
let isRefreshing = false;

/**
 * ! HTTP Interceptor for automatic access token refresh
 *
 * This interceptor handles token expiration transparently by:
 * 1. Detecting 401 (Unauthorized) errors from expired access tokens
 * 2. Automatically calling the /auth/refresh endpoint using the long-lived refresh token
 * 3. Retrying the original failed request with the new access token
 * 4. Logging out the user if the refresh token is also expired (403 from /refresh)
 *
 * * Token Strategy:
 * - Access tokens expire after 15 minutes
 * - Refresh tokens expire after 7 days
 * - Users stay logged in for 7 days without re-authentication
 * - If refresh token expires, user is logged out and redirected to home
 *
 * * Benefits:
 * - Seamless user experience (no interruption when access token expires)
 * - Enhanced security (short-lived access tokens limit attack window)
 * - Centralized token management (no manual refresh logic in components)
 *
 * @param req - The outgoing HTTP request
 * @param next - The next handler in the interceptor chain
 * @returns Observable of the HTTP response, with automatic retry on 401 errors
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  /**
   * Skip interceptor logic for authentication endpoints to prevent infinite loops.
   * These endpoints manage tokens themselves and should not trigger refresh attempts.
   */
  const isAuthEndpoint = req.url.includes('/auth/google/authenticate') ||
    req.url.includes('/auth/refresh') ||
    req.url.includes('/auth/logout');
  if (isAuthEndpoint) {
    return next(req);
  }

  // Process the request and handle authentication errors
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      /**
       * Handle 401 Unauthorized - Access token expired
       * Attempt to refresh the token and retry the request once.
       */
      if (error.status === 401 && !isRefreshing) {
        isRefreshing = true;

        return authService.refreshToken().pipe(
          switchMap(() => {
            // Refresh successful - reset flag and retry original request
            isRefreshing = false;
            return next(req);
          }),
          catchError((refreshError) => {
            // Refresh failed - log out user and redirect to home
            isRefreshing = false;
            authService.logout();
            router.navigate(['/']);
            return throwError(() => refreshError)
          })
        );
      }

      /**
       * Handle 403 Forbidden from /auth/refresh - Refresh token expired
       * Log out the user immediately as they need to re-authenticate.
       */
      if (error.status === 403 && req.url.includes('/auth/refresh')) {
        authService.logout();
        router.navigate(['/']);
      }

      // Re-throw all other errors for normal error handling
      return throwError(() => error);
    })
  );
};
