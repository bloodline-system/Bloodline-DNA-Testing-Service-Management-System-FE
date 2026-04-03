export interface ApiResponse<TData> {
  code: number;
  message: string;
  data: TData;
  path: string;
  timestamp: string;
}

export interface SignUpRequest {
  username: string;
  password: string;
  email: string;
  firstName: string;
  lastName: string;
}

export interface SignUpResponseData {
  "sign-up-id": string;
}

export interface VerifyOtpRequest {
  signUpId: string;
  otp: string;
}

export interface ResendOtpRequest {
  signUpId: string;
}
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponseData {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  user_id: string;
}

export interface LoginSessionData {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  userId: string;
}

export interface LogoutRequest {
  refreshToken: string;
}
