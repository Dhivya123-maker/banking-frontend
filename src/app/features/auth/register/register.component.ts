import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatStepperModule } from '@angular/material/stepper';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { AuthService } from '../../../core/services/auth.service';
import { RegisterRequest } from '../../../core/models/user.model';

@Component({
  selector: 'app-register',
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
    MatProgressSpinnerModule,
    MatStepperModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  personalInfoForm!: FormGroup;
  contactForm!: FormGroup;
  mpinForm!: FormGroup;
  
  loading = false;
  errorMessage = '';
  hidePassword = true;
  hideConfirmPassword = true;
  
  maxDate = new Date();

  states = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
    'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
    'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
    'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
  ];

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.maxDate.setFullYear(this.maxDate.getFullYear() - 18);

    this.personalInfoForm = this.formBuilder.group({
      fullName: ['', [Validators.required, Validators.minLength(3)]],
      dateOfBirth: ['', Validators.required],
      gender: ['', Validators.required]
    });

  this.contactForm = this.formBuilder.group({
  mobileNumber: ['', [
    Validators.required,
    Validators.pattern('^[6-9][0-9]{9}$')  // ← Updated pattern
  ]],
  email: ['', [Validators.required, Validators.email]],
  address: ['', Validators.required],
  city: ['', Validators.required],
  state: ['', Validators.required],
  pincode: ['', [
    Validators.required,
    Validators.pattern('^[0-9]{6}$')
  ]]
});

    this.mpinForm = this.formBuilder.group({
      mpin: ['', [
        Validators.required,
        Validators.minLength(6),
        Validators.maxLength(6),
        Validators.pattern('^[0-9]{6}$')
      ]],
      confirmMpin: ['', Validators.required]
    }, {
      validators: this.mpinMatchValidator
    });
  }

  mpinMatchValidator(control: AbstractControl): ValidationErrors | null {
    const mpin = control.get('mpin');
    const confirmMpin = control.get('confirmMpin');

    if (!mpin || !confirmMpin) {
      return null;
    }

    return mpin.value === confirmMpin.value ? null : { mpinMismatch: true };
  }

  onSubmit(): void {
    if (this.personalInfoForm.invalid || this.contactForm.invalid || this.mpinForm.invalid) {
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    const registerRequest: RegisterRequest = {
      ...this.personalInfoForm.value,
      ...this.contactForm.value,
      ...this.mpinForm.value,
      dateOfBirth: this.formatDate(this.personalInfoForm.value.dateOfBirth)
    };

    this.authService.register(registerRequest).subscribe({
      next: (response) => {
        if (response.success) {
          alert('Registration successful! Please login.');
          this.router.navigate(['/auth/login']);
        } else {
          this.errorMessage = response.message || 'Registration failed';
          this.loading = false;
        }
      },
      error: (error) => {
        console.error('Registration error:', error);
        this.errorMessage = error.message || 'Registration failed. Please try again.';
        this.loading = false;
      }
    });
  }

  formatDate(date: Date): string {
    const d = new Date(date);
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const year = d.getFullYear();
    return `${year}-${month}-${day}`;
  }

  togglePasswordVisibility(field: string): void {
    if (field === 'mpin') {
      this.hidePassword = !this.hidePassword;
    } else {
      this.hideConfirmPassword = !this.hideConfirmPassword;
    }
  }
}