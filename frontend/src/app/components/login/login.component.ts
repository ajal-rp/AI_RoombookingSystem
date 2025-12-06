import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: "app-login",
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
  ],
  template: `
    <div class="login-container">
      <div class="login-wrapper">
        <!-- Left Side - Image Section -->
        <div class="image-section">
          <div class="image-overlay">
            <div class="image-container">
              <img
                src="https://illustrations.popsy.co/white/remote-work.svg"
                alt="Conference Room Booking"
                class="hero-image"
                onerror="this.src='https://cdn-icons-png.flaticon.com/512/2936/2936886.png'"
              />
            </div>
            <div class="overlay-content">
              <h1 class="brand-title">Conference Room Booking</h1>
              <p class="brand-subtitle">
                Streamline your workspace management with our modern booking
                system
              </p>
              <div class="features">
                <div class="feature-item">
                  <span class="feature-icon">📅</span>
                  <span>Easy Scheduling</span>
                </div>
                <div class="feature-item">
                  <span class="feature-icon">🏢</span>
                  <span>Multiple Rooms</span>
                </div>
                <div class="feature-item">
                  <span class="feature-icon">⚡</span>
                  <span>Real-time Updates</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Side - Login Form -->
        <div class="form-section">
          <div class="form-container">
            <div class="form-header">
              <h2>Welcome Back</h2>
              <p>Please login to your account</p>
            </div>

            <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Username</mat-label>
                <input
                  matInput
                  formControlName="username"
                  required
                  autocomplete="username"
                />
                <mat-error
                  *ngIf="loginForm.get('username')?.hasError('required')"
                >
                  Username is required
                </mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Password</mat-label>
                <input
                  matInput
                  type="password"
                  formControlName="password"
                  required
                  autocomplete="current-password"
                />
                <mat-error
                  *ngIf="loginForm.get('password')?.hasError('required')"
                >
                  Password is required
                </mat-error>
              </mat-form-field>

              <button
                mat-raised-button
                color="primary"
                type="submit"
                [disabled]="loginForm.invalid || loading"
                class="login-button"
              >
                <span *ngIf="!loading">Sign In</span>
                <mat-spinner *ngIf="loading" diameter="20"></mat-spinner>
              </button>
            </form>

            <div class="demo-credentials">
              <div class="demo-header">
                <span class="demo-icon">🔑</span>
                <strong>Demo Credentials</strong>
              </div>
              <div class="credential-item">
                <span class="role-badge admin">Admin</span>
                <span class="credential-text">admin / Password123!</span>
              </div>
              <div class="credential-item">
                <span class="role-badge employee">Employee</span>
                <span class="credential-text">john.doe / Password123!</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .login-container {
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #f5f7fa;
        padding: 0;
      }

      .login-wrapper {
        display: flex;
        width: 100%;
        max-width: 1200px;
        min-height: 600px;
        background: white;
        border-radius: 16px;
        overflow: hidden;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
        margin: 20px;
      }

      /* Left Side - Image Section */
      .image-section {
        flex: 1;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 60px 40px;
        color: white;
      }

      .image-overlay {
        position: relative;
        z-index: 2;
        width: 100%;
        display: flex;
        flex-direction: column;
        gap: 40px;
      }

      .image-container {
        display: flex;
        justify-content: center;
        align-items: center;
        margin-bottom: 20px;
      }

      .hero-image {
        width: 100%;
        max-width: 400px;
        height: auto;
        filter: drop-shadow(0 10px 30px rgba(0, 0, 0, 0.2));
        animation: float 6s ease-in-out infinite;
      }

      @keyframes float {
        0%,
        100% {
          transform: translateY(0px);
        }
        50% {
          transform: translateY(-20px);
        }
      }

      .overlay-content {
        text-align: left;
      }

      .brand-title {
        font-size: 2.5rem;
        font-weight: 700;
        margin-bottom: 20px;
        line-height: 1.2;
        color: #ffffff;
        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }

      .brand-subtitle {
        font-size: 1.1rem;
        margin-bottom: 40px;
        line-height: 1.6;
        color: #ffffff;
        opacity: 0.98;
        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
      }

      .features {
        display: flex;
        flex-direction: column;
        gap: 20px;
      }

      .feature-item {
        display: flex;
        align-items: center;
        gap: 15px;
        font-size: 1rem;
        padding: 15px 20px;
        background: rgba(255, 255, 255, 0.2);
        border-radius: 12px;
        backdrop-filter: blur(10px);
        transition: all 0.3s ease;
        color: #ffffff;
        font-weight: 500;
      }

      .feature-item:hover {
        background: rgba(255, 255, 255, 0.3);
        transform: translateX(10px);
      }

      .feature-icon {
        font-size: 1.8rem;
      }

      /* Right Side - Form Section */
      .form-section {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 60px 40px;
        background: white;
      }

      .form-container {
        width: 100%;
        max-width: 420px;
      }

      .form-header {
        margin-bottom: 40px;
        text-align: center;
      }

      .form-header h2 {
        font-size: 2rem;
        font-weight: 600;
        color: #1a202c;
        margin-bottom: 10px;
      }

      .form-header p {
        font-size: 1rem;
        color: #4a5568;
      }

      mat-form-field {
        margin-bottom: 20px;
      }

      .full-width {
        width: 100%;
      }

      .login-button {
        width: 100%;
        height: 48px;
        font-size: 1rem;
        font-weight: 600;
        border-radius: 8px;
        margin-top: 10px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        transition: all 0.3s ease;
      }

      .login-button:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
      }

      .login-button:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }

      /* Demo Credentials Section */
      .demo-credentials {
        margin-top: 40px;
        padding: 24px;
        background: linear-gradient(135deg, #f6f8fb 0%, #e9ecef 100%);
        border-radius: 12px;
        border: 1px solid #e2e8f0;
      }

      .demo-header {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 16px;
        color: #1a202c;
        font-size: 0.95rem;
        font-weight: 600;
      }

      .demo-icon {
        font-size: 1.3rem;
      }

      .credential-item {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 12px;
        padding: 12px;
        background: white;
        border-radius: 8px;
        font-size: 0.9rem;
        transition: all 0.2s ease;
      }

      .credential-item:last-child {
        margin-bottom: 0;
      }

      .credential-item:hover {
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        transform: translateX(4px);
      }

      .role-badge {
        padding: 4px 12px;
        border-radius: 6px;
        font-size: 0.75rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        min-width: 80px;
        text-align: center;
      }

      .role-badge.admin {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
      }

      .role-badge.employee {
        background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
        color: white;
      }

      .credential-text {
        color: #2d3748;
        font-family: "Courier New", monospace;
        font-size: 0.85rem;
        font-weight: 500;
      }

      /* Responsive Design */
      
      /* Extra large devices (large desktops, 1400px and up) */
      @media (min-width: 1400px) {
        .login-wrapper {
          max-width: 1400px;
        }

        .hero-image {
          max-width: 450px;
        }

        .brand-title {
          font-size: 2.75rem;
        }

        .brand-subtitle {
          font-size: 1.2rem;
        }

        .form-header h2 {
          font-size: 2.25rem;
        }
      }

      /* Large desktops (1200px - 1399px) */
      @media (min-width: 1200px) and (max-width: 1399px) {
        .login-wrapper {
          max-width: 1200px;
        }

        .hero-image {
          max-width: 400px;
        }
      }

      /* Medium desktops (992px - 1199px) */
      @media (min-width: 992px) and (max-width: 1199px) {
        .login-wrapper {
          max-width: 960px;
        }

        .image-section {
          padding: 50px 35px;
        }

        .hero-image {
          max-width: 350px;
        }

        .brand-title {
          font-size: 2.25rem;
        }

        .form-section {
          padding: 50px 35px;
        }

        .form-container {
          max-width: 380px;
        }
      }

      /* Tablets (768px - 991px) */
      @media (min-width: 768px) and (max-width: 991px) {
        .login-wrapper {
          flex-direction: column;
          margin: 0;
          border-radius: 0;
          min-height: 100vh;
        }

        .image-section {
          padding: 50px 40px;
          min-height: 400px;
        }

        .hero-image {
          max-width: 320px;
        }

        .brand-title {
          font-size: 2.25rem;
        }

        .brand-subtitle {
          font-size: 1.05rem;
        }

        .features {
          flex-direction: row;
          flex-wrap: wrap;
          gap: 15px;
        }

        .feature-item {
          flex: 1;
          min-width: calc(50% - 10px);
          justify-content: center;
        }

        .form-section {
          padding: 50px 40px;
        }

        .form-container {
          max-width: 500px;
        }

        .form-header h2 {
          font-size: 2rem;
        }
      }

      /* Small tablets (576px - 767px) */
      @media (min-width: 576px) and (max-width: 767px) {
        .login-wrapper {
          flex-direction: column;
          margin: 0;
          border-radius: 0;
          min-height: 100vh;
        }

        .image-section {
          padding: 40px 30px;
          min-height: 350px;
        }

        .image-overlay {
          gap: 30px;
        }

        .hero-image {
          max-width: 280px;
        }

        .brand-title {
          font-size: 2rem;
        }

        .brand-subtitle {
          font-size: 1rem;
          margin-bottom: 30px;
        }

        .features {
          gap: 12px;
        }

        .feature-item {
          padding: 12px 18px;
          font-size: 0.95rem;
        }

        .form-section {
          padding: 40px 30px;
        }

        .form-header h2 {
          font-size: 1.75rem;
        }

        .form-header p {
          font-size: 0.95rem;
        }
      }

      /* Mobile devices (up to 575px) */
      @media (max-width: 575px) {
        .login-container {
          background: white;
        }

        .login-wrapper {
          margin: 0;
          flex-direction: column;
          border-radius: 0;
          min-height: 100vh;
          box-shadow: none;
        }

        .image-section {
          display: none;
        }

        .form-section {
          padding: 30px 20px;
        }

        .form-header {
          margin-bottom: 30px;
        }

        .form-header h2 {
          font-size: 1.5rem;
        }

        .form-header p {
          font-size: 0.9rem;
        }

        mat-form-field {
          margin-bottom: 16px;
        }

        .login-button {
          height: 44px;
          font-size: 0.95rem;
        }

        .demo-credentials {
          padding: 18px;
          margin-top: 30px;
        }

        .demo-header {
          font-size: 0.9rem;
          margin-bottom: 14px;
        }

        .credential-item {
          flex-direction: column;
          align-items: flex-start;
          gap: 8px;
          padding: 10px;
        }

        .role-badge {
          min-width: auto;
          font-size: 0.7rem;
        }

        .credential-text {
          font-size: 0.8rem;
        }
      }

      /* Extra small devices (up to 375px) */
      @media (max-width: 375px) {
        .form-section {
          padding: 25px 15px;
        }

        .form-header h2 {
          font-size: 1.35rem;
        }

        .demo-credentials {
          padding: 15px;
        }
      }

      /* Landscape orientation on mobile */
      @media (max-height: 600px) and (orientation: landscape) {
        .login-wrapper {
          flex-direction: row;
          min-height: auto;
        }

        .image-section {
          min-height: 100vh;
          padding: 30px 25px;
        }

        .image-overlay {
          gap: 20px;
        }

        .hero-image {
          max-width: 180px;
        }

        .brand-title {
          font-size: 1.5rem;
          margin-bottom: 10px;
        }

        .brand-subtitle {
          font-size: 0.85rem;
          margin-bottom: 15px;
        }

        .features {
          gap: 10px;
        }

        .feature-item {
          padding: 8px 12px;
          font-size: 0.8rem;
        }

        .form-section {
          padding: 30px 25px;
          overflow-y: auto;
        }

        .form-header {
          margin-bottom: 20px;
        }

        .form-header h2 {
          font-size: 1.5rem;
        }

        mat-form-field {
          margin-bottom: 12px;
        }

        .demo-credentials {
          margin-top: 20px;
          padding: 15px;
        }
      }

      /* Animation for spinner */
      mat-spinner {
        margin: 0 auto;
      }
    `,
  ],
})
export class LoginComponent {
  loginForm: FormGroup;
  loading = false;
  returnUrl: string;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {
    this.loginForm = this.fb.group({
      username: ["", Validators.required],
      password: ["", Validators.required],
    });

    this.returnUrl = this.route.snapshot.queryParams["returnUrl"] || "/";
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;
    this.authService.login(this.loginForm.value).subscribe({
      next: (response) => {
        this.loading = false;

        // Redirect based on role
        if (response.role === "Admin") {
          this.router.navigate(["/dashboard"]);
        } else {
          this.router.navigate(["/dashboard/employee"]);
        }

        this.snackBar.open(`Welcome, ${response.fullName}!`, "Close", {
          duration: 3000,
        });
      },
      error: (error) => {
        this.loading = false;
        this.snackBar.open("Invalid username or password", "Close", {
          duration: 3000,
        });
      },
    });
  }
}
