import {
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CsrfService } from '../services/csrf.service';

export const csrfInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
) => {
  const csrfService = inject(CsrfService);

  const requiresCsrfToken = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(
    req.method.toUpperCase()
  );

  const isCsrfTokenEndpoint = req.url.endsWith('/csrf-token');

  if (!environment.production) {
    console.log(
      `CSRF Interceptor | ${req.method} ${req.url} - requiresCsrfToken: ${requiresCsrfToken}, isCsrfTokenEndpoint: ${isCsrfTokenEndpoint}`
    );
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

  return csrfService.ensureToken().pipe(
    switchMap((token) => {
      // Clone the request and add the CSRF token header
      const csrfRequest = req.clone({
        setHeaders: {
          'X-CSRF-Token': token,
        },
      });
      return next(csrfRequest);
    }),
    catchError((error) => {
      if (
        error.status === 403 &&
        (error.error?.message?.includes('CSRF') ||
          error.error?.message?.includes('csrf') ||
          error.error?.code === 'EBADCSRFTOKEN')
      ) {
        if (!environment.production) {
          console.warn(
            'CSRF token invalid, refreshing token and retrying request'
          );
        }

        // Clear the invalid token from cache
        csrfService.clearToken();

        // Fetch a fresh token and retry the original request
        return csrfService.fetchToken().pipe(
          switchMap((newToken) => {
            const retryRequest = req.clone({
              setHeaders: {
                'X-CSRF-Token': newToken,
              },
            });
            return next(retryRequest);
          }),
          catchError((retryError) => {
            // If retry also fails, re-throw the error
            if (!environment.production) {
              console.error('CSRF retry failed:', retryError);
            }
            return throwError(() => retryError);
          })
        );
      }

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
