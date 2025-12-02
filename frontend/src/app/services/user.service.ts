import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { 
  UserProfile, 
  CreateUserRequest, 
  UpdateProfileRequest, 
  ChangePasswordRequest 
} from '../models/auth.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) {}

  /**
   * Create a new employee (Admin only)
   */
  createUser(request: CreateUserRequest): Observable<UserProfile> {
    return this.http.post<UserProfile>(this.apiUrl, request);
  }

  /**
   * Get all users (Admin only)
   */
  getAllUsers(includeInactive: boolean = false): Observable<UserProfile[]> {
    return this.http.get<UserProfile[]>(`${this.apiUrl}?includeInactive=${includeInactive}`);
  }

  /**
   * Get user by ID
   */
  getUserById(id: string): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.apiUrl}/${id}`);
  }

  /**
   * Get current user's profile
   */
  getMyProfile(): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.apiUrl}/profile`);
  }

  /**
   * Update user profile
   */
  updateProfile(id: string, request: UpdateProfileRequest): Observable<UserProfile> {
    return this.http.put<UserProfile>(`${this.apiUrl}/${id}`, request);
  }

  /**
   * Upload profile image
   */
  uploadProfileImage(userId: string, file: File): Observable<{ imageUrl: string; user: UserProfile }> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<{ imageUrl: string; user: UserProfile }>(
      `${this.apiUrl}/${userId}/profile-image`,
      formData
    );
  }

  /**
   * Change password
   */
  changePassword(id: string, request: ChangePasswordRequest): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/${id}/change-password`, request);
  }

  /**
   * Deactivate user (Admin only)
   */
  deactivateUser(id: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/${id}/deactivate`, {});
  }
}
