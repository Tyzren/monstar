import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { User } from '../models/user.model';
import { ObjectId } from 'mongoose';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // URL for backend endpoints
  private url = environment.authUrl;

  // Stores the current user as behaviour subject of type User (nullable)
  private currentUser = new BehaviorSubject<User | null>(null);


  // Set current user helper method
  setCurrentUser(user: User) {
    this.currentUser.next(user);
  }

  // Get current user helper method
  getCurrentUser(): Observable<User | null> {
    return this.currentUser.asObservable();
  }


  // ! Injects HttpClient
  constructor(private http: HttpClient) { }


  /**
   * * Register a user
   * 
   * Registers a user with the provided email and password.
   * 
   * @param {string} email The email of the user.
   * @param {string} password The password of the user.
   * @returns {Observable<any>} an observable containing the response from the server.
   */
  register(email: string, password: string): Observable<any> {
    return this.http.post(`${this.url}/register`, { email, password });
  }

  /**
   * * Register and/or login a Google user
   * 
   * Register and/or logins a Google user using the Google ID token.
   * 
   * @param {string} idToken The Google id token of the user.
   * @returns {Observable<any>} an observable containing the response from the server.
   */
  googleAuthenticate(idToken: string): Observable<any> {
    return this.http.post(`${this.url}/google/authenticate`,
      { idToken },
      { withCredentials: true }
    ).pipe(
      tap((response: any) => {
        // Update the current user with the response data
        const user = new User(response.data);
        this.currentUser.next(user);

        // ? Debug log
        // console.log('AuthService | Logged in as:', this.currentUser);
      })
    );
  }

  /**
   * * Refresh the access token using the refresh token
   *
   * Called automatically by the auth interceptor when the access token expires (after 15 minutes).
   * Uses the long-lived refresh token (stored as httpOnly cookie) to obtain a new access token.
   * This allows users to stay logged in for 7 days without re-authentication.
   *
   * Token Refresh Flow:
   * 1. Access token expires after 15 minutes
   * 2. API request fails with 401 Unauthorized
   * 3. Auth interceptor catches the error and calls this method
   * 4. Backend validates the refresh token and issues new access token
   * 5. Interceptor retries the original request with new token
   * 6. User experiences no interruption
   *
   * Note:
   * This method is typically called by the auth interceptor, not directly by components.
   * Manual calls are only needed for testing or special refresh scenarios.
   *
   * @returns {Observable<any>} Observable containing the server response with new tokens
   * @throws {403} If the refresh token is expired or invalid (user will be logged out)
   */
  refreshToken(): Observable<any> {
    return this.http.post(`${this.url}/refresh`,
      {},
      { withCredentials: true },
    );
  }

  /**
   * * Login a user and set current user
   * 
   * Logs in a user with the provided email and password.
   * Also sets the current user for the frontend.
   * 
   * @param {string} email The email of the user.
   * @param {string} password The password of the user.
   * @returns {Observable<any>} an observable containing the response from the server.
   */
  login(email: string, password: string): Observable<any> {
    return this.http.post(`${this.url}/login`,
      { email, password },
      { withCredentials: true }
    ).pipe(
      tap((response: any) => {
        // Update the current user with the response data
        const user = new User(response.data);
        this.currentUser.next(user);

        // ? Debug log
        // console.log('AuthService | Logged in as:', this.currentUser);
      })
    );
  }

  /**
   * * Logout the current user
   *
   * Logs out the current user by:
   * 1. Calling the backend /logout endpoint to invalidate both tokens
   * 2. Clearing access token and refresh token cookies (httpOnly)
   * 3. Removing refresh token from database to prevent reuse
   * 4. Clearing the current user state in the frontend
   *
   * Token Cleanup:
   * - Access token cookie is cleared (15-minute token)
   * - Refresh token cookie is cleared (7-day token)
   * - Refresh token hash is removed from database
   * - Current user BehaviorSubject is set to null
   *
   * Security:
   * This method ensures complete session termination by invalidating tokens
   * both client-side (cookies) and server-side (database). This prevents
   * token reuse even if an attacker somehow obtained the cookies.
   *
   * @returns {Observable<any>} Observable containing the server response
   * @emits Updates currentUser BehaviorSubject to null on successful logout
   */
  logout(): Observable<any> {
    return this.http.post(
      `${this.url}/logout`,
      {},
      { withCredentials: true },
    ).pipe(
      tap(() => {
        this.currentUser.next(null);
      })
    );
  }

  /**
   * * Forgot password
   * 
   * Sends a password reset email to the user with the provided email.
   * 
   * @param {string} email The email of the user.
   * @returns {Observable<any>} an observable containing the response from the server.
   */
  forgotPassword(email: string): Observable<any> {
    return this.http.post(`${this.url}/forgot-password`, { email });
  }

  /**
   * * Reset password
   * 
   * Resets the user's password using the provided token.
   * 
   * @param {string} token The token to reset the password.
   * @param {string} password The new password for the user.
   * @returns {Observable<any>} an observable containing the response from the server.
   */
  resetPassword(token: string, password: string): Observable<any> {
    return this.http.post(`${this.url}/reset-password/${token}`, { password });
  }

  /**
   * * Validate the user's session
   * 
   * Validates the current user's session and updates the current user data.
   * 
   * @returns {Observable<any>} an observable containing the response from the server.
   */
  validateSession(): Observable<any> {
    return this.http.get(`${this.url}/validate`,
      { withCredentials: true }
    ).pipe(
      tap((response: any) => {
        // Update the current user with the response data
        const user = new User(response.data);
        this.currentUser.next(user);

        // ? Debug log
        // console.log('AuthService | validated user as:', this.currentUser);
      })
    );
  }

  /**
   * * Verify and login the user
   * 
   * Verifies the user's email using the provided token and logs them in.
   * Also sets the current user for the frontend.
   * 
   * @param token The token to verify the user's email
   * @returns {Observable<any>} an observable containing the response from the server.
   */
  verifyAndLogin(token: string): Observable<any> {
    return this.http.get(`${this.url}/verify-email/${token}`,
      { withCredentials: true }
    ).pipe(
      tap((response: any) => {
        // Update the current user with the response data
        const user = new User(response.data);
        this.currentUser.next(user);

        // ? Debug log
        // console.log('AuthService | Signed up, Verified, & Logged In as:', this.currentUser);
      })
    );
  }

  /**
   * * Update user details
   * 
   * Updates the user's details such as username and password.
   * 
   * @param {string} userId The MongoDB ID of the user.
   * @param {string} [username] The new username for the user.
   * @param {string} [password] The new password for the user.
   * @returns {Observable<any>} an observable containing the response from the server.
   */
  updateDetails(userId: string, username?: string, password?: string) {
    return this.http.put(`${this.url}/update/${userId}`,
      { username: username, password: password },
      { withCredentials: true }
    ).pipe(
      tap((response: any) => {
        // Update the current user's username
        if (this.currentUser.value) {
          this.currentUser.value.username = response.username;

          // ? Debug log
          // console.log('AuthService | Updated user details:', this.currentUser);
        }
      })
    );
  }

  /**
   * * Upload avatar
   * 
   * Uploads a new avatar for the user.
   * 
   * @param {string} file the avatar file to upload.
   * @param {string} email The email of the user.
   * @returns {Observable<{ profileImg: string }>} an observable containing updated profile image URL.
   */
  uploadAvatar(file: File, email: string): Observable<{ profileImg: string }> {
    const formData = new FormData();
    formData.append('avatar', file);
    formData.append('email', email);

    return this.http.post<{ profileImg: string }>(`${this.url}/upload-avatar`,
      formData,
      { withCredentials: true }
    ).pipe(
      tap((response: any) => {
        // Update the current user's profile image
        if (this.currentUser.value) {
          this.currentUser.value.profileImg = response.profileImg;

          // ? Debug log
          // console.log('AuthService | Uploaded avatar:', this.currentUser);
        }
      })
    );
  }

  /**
   * * Delete user account
   * 
   * Deletes the user's account.
   * 
   * @param {string} userId The MongoDB ID of the user.
   * @returns {Observable<any>} An observable containing the response from the server.
   */
  deleteUserAccount(userId: String): Observable<any> {
    return this.http.delete(`${this.url}/delete/${userId}`,
      { withCredentials: true }
    ).pipe(
      tap(() => {
        this.currentUser.next(null);

        // ? Debug log
        // console.log('AuthService | Deleted user account.')
      })
    );
  }
}