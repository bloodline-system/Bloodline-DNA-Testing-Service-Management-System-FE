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
