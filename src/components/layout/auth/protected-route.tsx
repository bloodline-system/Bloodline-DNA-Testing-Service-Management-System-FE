import { useAuthStore } from "@/stores/auth/useAuthStore";
import { Navigate, Outlet } from "react-router";

export const ProtectedRoute = () => {
  const accessToken = useAuthStore((state) => state.accessToken);

  if (!accessToken) {
    return <Navigate to={"/sign-in"} replace />;
  }
  return <Outlet></Outlet>;
};

export const AuthRoute = () => {
  const accessToken = useAuthStore((state) => state.accessToken);

  if (accessToken) {
    return <Navigate to={"/"} replace />;
  }
  return <Outlet></Outlet>;
};
