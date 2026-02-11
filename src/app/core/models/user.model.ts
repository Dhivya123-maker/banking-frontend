export interface User {
  userId: number;
  customerId: string;
  fullName: string;
  email: string;
  mobileNumber: string;
  accountStatus: string;
  kycStatus: string;
  biometricEnabled: boolean;
}

export interface Account {
  accountId: number;
  accountNumber: string;
  accountType: string;
  balance: string;
  accountStatus: string;
}

export interface LoginRequest {
  mobileNumber: string;
  mpin: string;
  deviceId: string;
  deviceType: string;
  osType: string;
}

export interface RegisterRequest {
  mobileNumber: string;
  email: string;
  fullName: string;
  dateOfBirth: string;
  gender: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  mpin: string;
  confirmMpin: string;
}

export interface OTPRequest {
  mobileNumber: string;
  email?: string;
  otpType: 'REGISTRATION' | 'LOGIN' | 'FORGOT_MPIN' | 'TRANSACTION';
}

export interface OTPVerifyRequest {
  mobileNumber: string;
  otpCode: string;
  otpType: string;
}