export interface ApiResponse<TData> {
  code: number;
  message: string;
  data: TData;
  path: string;
  timestamp: string;
}

export interface UserProfileResponse {
  userId: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: number | null;
  profileImageUrl: string | null;
  role: string;
  dateOfBirth: string;
}
