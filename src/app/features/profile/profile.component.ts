import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { UserService, UserProfile } from '../../core/services/user.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatChipsModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatDividerModule
  ],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  profile: UserProfile | null = null;
  profileForm!: FormGroup;
  mpinForm!: FormGroup;
  loading = false;
  savingProfile = false;
  changingMpin = false;
  hideCurrentMpin = true;
  hideNewMpin = true;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private router: Router,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.initForms();
    this.loadProfile();
  }

  initForms(): void {
    this.profileForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.email]],
      address: [''],
      city: [''],
      state: [''],
      pincode: ['', [Validators.pattern(/^\d{6}$/)]]
    });

    this.mpinForm = this.fb.group({
      currentMpin: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]],
      newMpin: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]]
    });
  }

  loadProfile(): void {
    this.loading = true;
    this.cdr.detectChanges();

    this.userService.getUserProfile().subscribe({
      next: (response) => {
        this.loading = false;
        if (response.success) {
          this.profile = response.data;
          this.populateForm();
        }
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.loading = false;
        console.error('Error loading profile:', error);
        this.snackBar.open('Failed to load profile', 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
        this.cdr.detectChanges();
      }
    });
  }

  populateForm(): void {
    if (this.profile) {
      this.profileForm.patchValue({
        fullName: this.profile.fullName,
        email: this.profile.email,
        address: this.profile.address,
        city: this.profile.city,
        state: this.profile.state,
        pincode: this.profile.pincode
      });
    }
  }

  updateProfile(): void {
    if (this.profileForm.invalid) {
      this.markFormGroupTouched(this.profileForm);
      return;
    }

    this.savingProfile = true;
    this.cdr.detectChanges();

    this.userService.updateProfile(this.profileForm.value).subscribe({
      next: (response) => {
        this.savingProfile = false;
        if (response.success) {
          this.profile = response.data;
          this.snackBar.open('Profile updated successfully!', 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
        }
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.savingProfile = false;
        const message = error.error?.message || 'Failed to update profile';
        this.snackBar.open(message, 'Close', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
        this.cdr.detectChanges();
      }
    });
  }

changeMpin(): void {
  if (this.mpinForm.invalid) {
    this.markFormGroupTouched(this.mpinForm);
    return;
  }

  this.changingMpin = true;
  this.cdr.detectChanges();

  this.userService.changeMpin(this.mpinForm.value).subscribe({
    next: (response) => {
      this.changingMpin = false;
      if (response.success) {
        // Reset form completely
        this.mpinForm.reset({
          currentMpin: '',
          newMpin: ''
        });
        
        // Clear all validation states
        this.mpinForm.markAsPristine();
        this.mpinForm.markAsUntouched();
        
        // Clear each control's state
        Object.keys(this.mpinForm.controls).forEach(key => {
          const control = this.mpinForm.get(key);
          control?.setErrors(null);
          control?.markAsPristine();
          control?.markAsUntouched();
        });
        
        // Reset visibility toggles
        this.hideCurrentMpin = true;
        this.hideNewMpin = true;
        
        this.snackBar.open('MPIN changed successfully!', 'Close', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
      }
      this.cdr.detectChanges();
    },
    error: (error) => {
      this.changingMpin = false;
      const message = error.error?.message || 'Failed to change MPIN';
      this.snackBar.open(message, 'Close', {
        duration: 5000,
        panelClass: ['error-snackbar']
      });
      this.cdr.detectChanges();
    }
  });
}

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  getKycStatusClass(): string {
    return this.profile?.kycStatus?.toLowerCase() || '';
  }

  getAccountStatusClass(): string {
    return this.profile?.accountStatus?.toLowerCase() || '';
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).format(date);
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }
}