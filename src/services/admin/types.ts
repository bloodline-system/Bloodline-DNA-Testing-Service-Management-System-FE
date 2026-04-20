export interface ApiResponse<TData> {
  code: number;
  message: string;
  data: TData;
  path: string;
  timestamp: string;
}

export interface PageResponse<TContent> {
  content: TContent[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

/** Roles that can be assigned via PUT /v1/admin/dashboard/users/{id} */
export type EmployeeRole = 'STAFF' | 'MANAGER';
/** Role as returned by profiles / account (includes ADMIN). */
export type EmployeeAccountRole = 'STAFF' | 'MANAGER' | 'ADMIN';
export type EmployeeId = string | number;

export interface EmployeeListItem {
  id: EmployeeId;
  username: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
  phone: string | null;
  role: EmployeeAccountRole;
  active: boolean;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface EmployeeDetails extends EmployeeListItem {
  profileImageUrl?: string | null;
  dateOfBirth?: string | null;
}

export interface EmployeeProfile {
  userId?: string;
  username: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  phoneNumber: string | null;
  profileImageUrl?: string | null;
  role: string;
  dateOfBirth: string | null;
  isActive?: boolean;
  active?: boolean;
  createdAt?: string | null;
  fullName?: string | null;
  message?: string | null;
}

export interface EmployeeUserFilters {
  page: number;
  size: number;
  sortBy: string;
  sortDir: 'asc' | 'desc';
  search: string;
}

/** Matches PUT /v1/admin/dashboard/users/{id} — body may be partial (email/phone, role, or active only). */
export interface UpdateEmployeeUserRequest {
  email?: string;
  phone?: string;
  role?: EmployeeRole;
  active?: boolean;
}

export interface UpdateEmployeeProfileRequest {
  firstName?: string | null;
  lastName?: string | null;
  email: string;
  phoneNumber?: string | null;
  password?: string;
  dateOfBirth?: string | null;
  profileImageUrl?: string | null;
}

export interface DashboardStats {
  totalEmployees?: number;
  activeEmployees?: number;
  inactiveEmployees?: number;
  managerCount?: number;
  staffCount?: number;
  adminCount?: number;
  customerCount?: number;
  [key: string]: unknown;
}

/** GET /v1/admin/dashboard/stats — Postman: data may nest metrics under `dashboard`, plus monthlyStats & performanceMetrics. */
export interface AdminDashboardStatsPayload {
  dashboard?: DashboardStats;
  monthlyStats?: unknown;
  performanceMetrics?: unknown;
  [key: string]: unknown;
}

export interface EmployeeDashboardUsersPayload {
  currentPage: number;
  totalElements: number;
  pageSize: number;
  totalPages: number;
  userStats?: {
    totalUsers?: number;
    activeUsers?: number;
    inactiveUsers?: number;
    adminUsers?: number;
    managerUsers?: number;
    staffUsers?: number;
    customerUsers?: number;
  };
  users: Array<{
    id: EmployeeId;
    username: string;
    isActive?: boolean;
    createdAt?: string;
    updatedAt?: string;
    role?: string;
    userRoles?: Array<{ role?: { roleName?: string } }>;
    profile?: {
      firstName?: string | null;
      lastName?: string | null;
      email?: string | null;
      phoneNumber?: string | null;
      profileImageUrl?: string | null;
      dateOfBirth?: string | null;
    } | null;
  }>;
}

export interface EmployeeUsersPageData extends PageResponse<EmployeeDetails> {
  stats?: DashboardStats;
}

export interface RecentActivity {
  id?: string | number;
  action?: string;
  description?: string;
  createdAt?: string;
  actorName?: string;
  username?: string;
  [key: string]: unknown;
}
