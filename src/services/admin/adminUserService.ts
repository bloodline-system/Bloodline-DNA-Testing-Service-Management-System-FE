import api from '@/lib/axios';
import type {
  ApiResponse,
  EmployeeAccountRole,
  EmployeeDetails,
  EmployeeDashboardUsersPayload,
  EmployeeId,
  EmployeeProfile,
  EmployeeUserFilters,
  EmployeeUsersPageData,
  UpdateEmployeeProfileRequest,
  UpdateEmployeeUserRequest,
} from './types';

const toUserParams = (filters: EmployeeUserFilters) => {
  const params = new URLSearchParams({
    page: String(filters.page),
    size: String(filters.size),
    sortBy: filters.sortBy,
    sortDir: filters.sortDir,
  });
  const q = filters.search.trim();
  if (q) {
    params.set('search', q);
  }
  return params.toString();
};

export const adminUserService = {
  async getUsers(filters: EmployeeUserFilters): Promise<ApiResponse<EmployeeUsersPageData>> {
    const response = await api.get<ApiResponse<EmployeeDashboardUsersPayload>>(`/v1/admin/dashboard/users?${toUserParams(filters)}`, {
      withCredentials: true,
    });

    const payload = response.data.data;
    const mappedUsers = (payload.users ?? []).map(mapEmployeeFromDashboard);

    return {
      ...response.data,
      data: {
        content: mappedUsers,
        pageNumber: payload.currentPage ?? 0,
        pageSize: payload.pageSize ?? filters.size,
        totalElements: payload.totalElements ?? mappedUsers.length,
        totalPages: payload.totalPages ?? 1,
        last: (payload.currentPage ?? 0) >= Math.max((payload.totalPages ?? 1) - 1, 0),
        stats: {
          totalEmployees: payload.userStats?.totalUsers ?? payload.totalElements ?? mappedUsers.length,
          activeEmployees: payload.userStats?.activeUsers ?? 0,
          inactiveEmployees: payload.userStats?.inactiveUsers ?? 0,
          managerCount: payload.userStats?.managerUsers ?? 0,
          staffCount: payload.userStats?.staffUsers ?? 0,
          adminCount: payload.userStats?.adminUsers ?? 0,
          customerCount: payload.userStats?.customerUsers ?? 0,
        },
      },
    };
  },

  async getUserById(id: EmployeeId): Promise<ApiResponse<EmployeeDetails>> {
    const response = await api.get<ApiResponse<EmployeeDetails>>(`/v1/admin/dashboard/users/${id}`, {
      withCredentials: true,
    });

    const fallback: EmployeeDetails = {
      id,
      username: '',
      firstName: null,
      lastName: null,
      email: '',
      phone: null,
      role: 'STAFF' satisfies EmployeeAccountRole,
      active: true,
    };

    return {
      ...response.data,
      data: mapEmployeeDetails(response.data.data, fallback),
    };
  },

  async updateUser(id: EmployeeId, payload: UpdateEmployeeUserRequest): Promise<ApiResponse<EmployeeDetails>> {
    const response = await api.put<ApiResponse<EmployeeDetails>>(`/v1/admin/dashboard/users/${id}`, payload, { withCredentials: true });

    return {
      ...response.data,
      data: mapEmployeeDetails(response.data.data, {
        id,
        username: '',
        firstName: null,
        lastName: null,
        email: payload.email ?? '',
        phone: payload.phone ?? null,
        role: payload.role ?? 'STAFF',
        active: payload.active ?? true,
      }),
    };
  },

  async getAllProfiles(): Promise<ApiResponse<EmployeeProfile[]>> {
    const response = await api.get<ApiResponse<EmployeeProfile[]>>('/v1/admin/profiles', {
      withCredentials: true,
    });
    return response.data;
  },

  async getProfileByUsername(username: string): Promise<ApiResponse<EmployeeProfile>> {
    const response = await api.get<ApiResponse<EmployeeProfile>>(
      `/v1/admin/profiles/${encodeURIComponent(username)}`,
      {
        withCredentials: true,
      },
    );
    return response.data;
  },

  /** Matches OpenAPI: multipart fields firstName, lastName, email, dateOfBirth, phoneNumber, profileImageUrl (not a JSON `profile` blob). */
  async updateProfile(username: string, payload: UpdateEmployeeProfileRequest): Promise<ApiResponse<EmployeeProfile>> {
    const formData = new FormData();
    formData.append('firstName', payload.firstName ?? '');
    formData.append('lastName', payload.lastName ?? '');
    formData.append('email', payload.email);
    formData.append('dateOfBirth', payload.dateOfBirth ?? '');
    formData.append('phoneNumber', payload.phoneNumber ?? '');
    formData.append('profileImageUrl', payload.profileImageUrl ?? '');
    if (payload.password) {
      formData.append('password', payload.password);
    }

    const response = await api.put<ApiResponse<EmployeeProfile>>(
      `/v1/profiles/${encodeURIComponent(username)}`,
      formData,
      { withCredentials: true },
    );
    return response.data;
  },

  async deleteProfile(username: string): Promise<ApiResponse<{ message?: string }>> {
    const response = await api.delete<ApiResponse<{ message?: string }>>(`/v1/profiles/${encodeURIComponent(username)}`, {
      withCredentials: true,
    });
    return response.data;
  },
};

const roleNameFromUserRoles = (userRoles: EmployeeDashboardUsersPayload['users'][number]['userRoles']): string | undefined => {
  if (!Array.isArray(userRoles)) return undefined;
  const names = userRoles.map((r) => r?.role?.roleName).filter((n): n is string => typeof n === 'string');
  const upper = names.map((n) => n.toUpperCase().replace(/^ROLE_/, ''));
  if (upper.includes('MANAGER')) return 'MANAGER';
  if (upper.includes('STAFF')) return 'STAFF';
  return names[0];
};

const mapEmployeeFromDashboard = (user: EmployeeDashboardUsersPayload['users'][number]): EmployeeDetails => {
  const normalizedRole = normalizeAccountRole(user.role ?? roleNameFromUserRoles(user.userRoles));
  return {
    id: user.id,
    username: user.username ?? '',
    firstName: user.profile?.firstName ?? null,
    lastName: user.profile?.lastName ?? null,
    email: user.profile?.email ?? '',
    phone: user.profile?.phoneNumber ?? null,
    role: normalizedRole,
    active: Boolean(user.isActive),
    createdAt: user.createdAt ?? null,
    updatedAt: user.updatedAt ?? null,
    profileImageUrl: user.profile?.profileImageUrl ?? null,
    dateOfBirth: user.profile?.dateOfBirth ?? null,
  };
};

const mapEmployeeDetails = (input: unknown, fallback: EmployeeDetails): EmployeeDetails => {
  if (!input || typeof input !== 'object') {
    return fallback;
  }

  const candidate = input as Record<string, unknown>;
  const profile = (candidate.profile as Record<string, unknown> | null | undefined) ?? null;
  const role = normalizeAccountRole(candidate.role);

  return {
    id: (candidate.id as EmployeeId | undefined) ?? fallback.id,
    username: (candidate.username as string | undefined) ?? fallback.username,
    firstName: (candidate.firstName as string | null | undefined) ?? (profile?.firstName as string | null | undefined) ?? fallback.firstName,
    lastName: (candidate.lastName as string | null | undefined) ?? (profile?.lastName as string | null | undefined) ?? fallback.lastName,
    email: (candidate.email as string | undefined) ?? (profile?.email as string | undefined) ?? fallback.email,
    phone:
      (candidate.phone as string | null | undefined) ??
      (candidate.phoneNumber as string | null | undefined) ??
      (profile?.phoneNumber as string | null | undefined) ??
      fallback.phone,
    role,
    active: (candidate.active as boolean | undefined) ?? (candidate.isActive as boolean | undefined) ?? fallback.active,
    createdAt: (candidate.createdAt as string | null | undefined) ?? fallback.createdAt,
    updatedAt: (candidate.updatedAt as string | null | undefined) ?? fallback.updatedAt,
    profileImageUrl:
      (candidate.profileImageUrl as string | null | undefined) ?? (profile?.profileImageUrl as string | null | undefined) ?? fallback.profileImageUrl,
    dateOfBirth: (candidate.dateOfBirth as string | null | undefined) ?? (profile?.dateOfBirth as string | null | undefined) ?? fallback.dateOfBirth,
  };
};

const normalizeAccountRole = (value: unknown): EmployeeAccountRole => {
  if (typeof value !== 'string') {
    return 'STAFF';
  }
  const role = value.toUpperCase().replace(/^ROLE_/, '');
  if (role === 'ADMIN') return 'ADMIN';
  if (role === 'MANAGER') return 'MANAGER';
  return 'STAFF';
};
