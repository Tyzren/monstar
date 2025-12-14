import { HttpInterceptorFn, HttpRequest, HttpHandlerFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { switchMap, catchError, throwError, of } from 'rxjs';
import { CsrfService } from '../services/csrf.service';
import { environment } from '../../../environments/environment';

/**
 * ! HTTP Interceptor for CSRF (Cross-Site Request Forgery) protection
 *
 * This interceptor protects against CSRF attacks by:
 * 1. Automatically attaching CSRF tokens to state-changing requests (POST, PUT, PATCH, DELETE)
 * 2. Skipping read-only requests (GET, HEAD, OPTIONS) that don't require CSRF protection
 * 3. Detecting invalid/expired CSRF tokens (403 errors)
 * 4. Automatically refreshing expired tokens and retrying failed requests
 *
 * * What is CSRF?
 * CSRF attacks trick authenticated users into performing unwanted actions on a web application.
 * Example: A malicious site could submit a form to transfer money from the victim's bank account.
 * CSRF tokens prevent this by requiring a secret token that only legitimate requests can obtain.
 *
 * * How it works:
 * - Backend generates a unique CSRF token per session
 * - Frontend fetches this token and includes it in the X-CSRF-Token header
 * - Backend validates the token matches the session before processing the request
 * - Malicious sites cannot obtain the token, so their requests are rejected
 *
 * * Token lifecycle:
 * - Token is fetched once and cached by CsrfService
 * - Token is automatically added to all state-changing requests
 * - If token is invalid (403), interceptor fetches a new token and retries once
 * - Token is cleared on logout or session expiration
 *
 * * Benefits:
 * - Automatic CSRF protection without manual token management in components
 * - Transparent token refresh on expiration
 * - Follows industry best practices for CSRF prevention
 *
 * @param req - The outgoing HTTP request
 * @param next - The next handler in the interceptor chain
 * @returns Observable of the HTTP response, with CSRF token automatically attached
 */
export const csrfInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  const csrfService = inject(CsrfService);

  /**
   * Only state-changing requests require CSRF protection.
   * Read-only requests (GET, HEAD, OPTIONS) are safe from CSRF attacks.
   */
  const requiresCsrfToken = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method.toUpperCase());

  /**
   * Skip the CSRF token endpoint itself to prevent infinite loops.
   * The endpoint that fetches the token doesn't need a token to fetch a token!
   */
  const isCsrfTokenEndpoint = req.url.endsWith('/csrf-token');

  if (!environment.production) {
    console.log(`CSRF Interceptor | ${req.method} ${req.url} - requiresCsrfToken: ${requiresCsrfToken}, isCsrfTokenEndpoint: ${isCsrfTokenEndpoint}`);
  }

  // Skip CSRF protection for read-only requests and the token endpoint
  if (!requiresCsrfToken || isCsrfTokenEndpoint) {
    if (!environment.production) {
      console.log('CSRF Interceptor | Skipping CSRF token for this request');
    }
    return next(req);
  }

  if (!environment.production) {
    console.log('CSRF Interceptor | Adding CSRF token to request');
  }

  /**
   * Ensure we have a valid CSRF token, then add it to the request header.
   * CsrfService handles caching and only fetches if needed.
   */
  return csrfService.ensureToken().pipe(
    switchMap(token => {
      // Clone the request and add the CSRF token header
      const csrfRequest = req.clone({
        setHeaders: {
          'X-CSRF-Token': token
        }
      });
      return next(csrfRequest);
    }),
    catchError(error => {
      /**
       * Handle 403 CSRF validation errors
       * If the token is invalid or expired, fetch a new one and retry the request once.
       */
      if (error.status === 403 && (
          error.error?.message?.includes('CSRF') ||
          error.error?.message?.includes('csrf') ||
          error.error?.code === 'EBADCSRFTOKEN'
        )) {
        if (!environment.production) {
          console.warn('CSRF token invalid, refreshing token and retrying request');
        }

        // Clear the invalid token from cache
        csrfService.clearToken();

        // Fetch a fresh token and retry the original request
        return csrfService.fetchToken().pipe(
          switchMap(newToken => {
            const retryRequest = req.clone({
              setHeaders: {
                'X-CSRF-Token': newToken
              }
            });
            return next(retryRequest);
          }),
          catchError(retryError => {
            // If retry also fails, re-throw the error
            if (!environment.production) {
              console.error('CSRF retry failed:', retryError);
            }
            return throwError(() => retryError);
          })
        );
      }

      /**
       * Handle other 403 errors (not CSRF-related)
       * Log for debugging but don't retry.
       */
      if (error.status === 403) {
        if (!environment.production) {
          console.warn('Access denied (403) for request:', req.url);
        }
      }

      // Re-throw all other errors for normal error handling
      return throwError(() => error);
    })
  );
};