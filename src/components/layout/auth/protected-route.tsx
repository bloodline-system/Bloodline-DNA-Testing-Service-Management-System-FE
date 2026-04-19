import { useAuthStore } from '@/stores/auth/useAuthStore';
import { Navigate, Outlet } from 'react-router';

export const ProtectedRoute = () => {
  const accessToken = useAuthStore((state) => state.accessToken);

  if (!accessToken) {
    return <Navigate to={'/sign-in'} replace />;
  }
  return <Outlet></Outlet>;
};

export const RoleProtectedRoute = ({ allow }: { allow: string[] }) => {
  const accessToken = useAuthStore((state) => state.accessToken);

  if (!accessToken) {
    return <Navigate to={'/sign-in'} replace />;
  }

  const normalizedAllow = allow.map(normalizeRole);
  const roles = getRolesFromJwt(accessToken);

  if (!roles.some((role) => normalizedAllow.includes(role))) {
    return <Navigate to={'/'} replace />;
  }

  return <Outlet></Outlet>;
};

export const AuthRoute = () => {
  const accessToken = useAuthStore((state) => state.accessToken);

  if (accessToken) {
    return <Navigate to={'/'} replace />;
  }
  return <Outlet></Outlet>;
};

const getRolesFromJwt = (token: string): string[] => {
  const payload = token.split('.')[1];
  if (!payload) return [];

  try {
    const decoded = JSON.parse(decodeJwtBase64(payload)) as {
      role?: unknown;
      roles?: unknown;
      authorities?: unknown;
    };

    const roles = new Set<string>();

    if (typeof decoded.role === 'string') {
      roles.add(normalizeRole(decoded.role));
    }

    if (Array.isArray(decoded.roles)) {
      decoded.roles.forEach((item) => {
        if (typeof item === 'string') {
          roles.add(normalizeRole(item));
        }
      });
    }

    if (Array.isArray(decoded.authorities)) {
      decoded.authorities.forEach((item) => {
        if (typeof item === 'string') {
          roles.add(normalizeRole(item));
          return;
        }

        if (typeof item === 'object' && item !== null && 'authority' in item && typeof item.authority === 'string') {
          roles.add(normalizeRole(item.authority));
        }
      });
    }

    return Array.from(roles);
  } catch {
    return [];
  }
};

const decodeJwtBase64 = (base64Url: string): string => {
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
  return atob(padded);
};

const normalizeRole = (role: string): string => {
  const upper = role.toUpperCase().trim();
  return upper.startsWith('ROLE_') ? upper.slice(5) : upper;
};
