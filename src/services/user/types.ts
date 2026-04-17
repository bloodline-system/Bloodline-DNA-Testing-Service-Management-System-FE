export interface ApiResponse<TData> {
  code: number;
  message: string;
  data: TData;
  path: string;
  timestamp: string;
}

// Backend legacy response shape used by some endpoints (e.g. /api/upload/*)
export interface ResponseObject<TData> {
  status: string;
  message: string;
  data: TData;
}

export interface UserProfileResponse {
  userId: string;
  username: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
  phoneNumber: string | null;
  profileImageUrl: string | null;
  role: string;
  dateOfBirth: string | null;

  // Present in GET /profiles/{username} response
  isActive?: boolean;
  createdAt?: string;
}

export interface UpdateUserProfileRequest {
  firstName?: string | null;
  lastName?: string | null;
  email: string;
  dateOfBirth?: string | null;
  phoneNumber?: string | null;
  profileImageUrl?: string | null;

  // Included in Postman examples for update profile; optional.
  // Backend may ignore this field if unsupported.
  password?: string;
}
