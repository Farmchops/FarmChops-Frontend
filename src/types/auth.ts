// src/types/auth.ts
export interface User {
    _id: string;
    email: string;
    role: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    phone?: string;
    firstName?: string;
    lastName?: string;
    profile: {
        isVerified: boolean;
        address?: string;
    };
    wallet: {
        balance: number;
    };
    gender? :string
}

export interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    profileComplete: boolean;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface SignupRequest {
    email: string;
}

export interface CompleteSignupRequest {
    email: string;
    verificationCode: string;
    password: string;
}

export interface ProfileUpdateRequest {
    firstName: string;
    lastName: string;
    phone: string;
    address?: string;
}

export interface ForgotPasswordRequest {
    email: string;
}

export interface ResetPasswordRequest {
    email: string;
    resetCode: number;
    newPassword: string;
}

export interface ApiResponse<T = any> {
    success: boolean;
    message: string;
    data?: T;
}