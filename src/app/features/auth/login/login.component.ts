import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../../core/services/auth.service';
import { LoginRequest } from '../../../core/models/user.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  loading = false;
  submitted = false;
  errorMessage = '';
  hidePassword = true;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Redirect if already logged in
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/dashboard']);
    }

   this.loginForm = this.formBuilder.group({
  mobileNumber: ['', [
    Validators.required,
    Validators.pattern('^[6-9][0-9]{9}$')  // ← Updated pattern
  ]],
  mpin: ['', [
    Validators.required,
    Validators.minLength(6),
    Validators.maxLength(6),
    Validators.pattern('^[0-9]{6}$')
  ]]
});
  }

  // Convenience getter for form fields
  get f() {
    return this.loginForm.controls;
  }

  onSubmit(): void {
    this.submitted = true;
    this.errorMessage = '';

    // Stop if form is invalid
    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;

    const loginRequest: LoginRequest = {
      mobileNumber: this.loginForm.value.mobileNumber,
      mpin: this.loginForm.value.mpin,
      deviceId: this.getDeviceId(),
      deviceType: this.getDeviceType(),
      osType: this.getOSType()
    };

    this.authService.login(loginRequest).subscribe({
      next: (response) => {
        if (response.success) {
          console.log('Login successful:', response.data);
          this.router.navigate(['/dashboard']);
        } else {
          this.errorMessage = response.message || 'Login failed';
          this.loading = false;
        }
      },
      error: (error) => {
        console.error('Login error:', error);
        this.errorMessage = error.message || 'Invalid credentials. Please try again.';
        this.loading = false;
      }
    });
  }

  // Get device information
  private getDeviceId(): string {
    let deviceId = localStorage.getItem('deviceId');
    if (!deviceId) {
      deviceId = 'web-' + Math.random().toString(36).substring(2, 15);
      localStorage.setItem('deviceId', deviceId);
    }
    return deviceId;
  }

  private getDeviceType(): string {
    const userAgent = navigator.userAgent;
    if (/mobile/i.test(userAgent)) {
      return 'MOBILE';
    } else if (/tablet/i.test(userAgent)) {
      return 'TABLET';
    } else {
      return 'DESKTOP';
    }
  }

  private getOSType(): string {
    const userAgent = navigator.userAgent;
    if (/windows/i.test(userAgent)) {
      return 'Windows';
    } else if (/macintosh|mac os x/i.test(userAgent)) {
      return 'macOS';
    } else if (/linux/i.test(userAgent)) {
      return 'Linux';
    } else if (/android/i.test(userAgent)) {
      return 'Android';
    } else if (/iphone|ipad|ipod/i.test(userAgent)) {
      return 'iOS';
    } else {
      return 'Unknown';
    }
  }

  togglePasswordVisibility(): void {
    this.hidePassword = !this.hidePassword;
  }
}