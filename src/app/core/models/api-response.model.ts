export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp?: string;
  errorCode?: string;
}

export interface LoginResponse {
  token: string;
  refreshToken: string;
  expiresIn: number;
  user: User;
  account?: Account;
}

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