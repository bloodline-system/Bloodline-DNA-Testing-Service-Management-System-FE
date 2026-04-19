import {
  ProtectedRoute,
  AuthRoute,
  RoleProtectedRoute,
} from "@/components/layout/auth/protected-route";
import EmployeeManagementPage from "@/pages/EmployeeManagementPage";
import HomePage from "@/pages/HomePage";
import ProfilePage from "@/pages/ProfilePage";
import SignInPage from "@/pages/SignInPage";
import SignUpPage from "@/pages/SignUpPage";
import OrderPage from "@/pages/OrderPage";
import PostManagementPage from "@/pages/PostManagementPage";
import ReportPage from "@/pages/ReportPage";
import { BrowserRouter, Routes, Route } from "react-router";

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route index element={<HomePage />} />

        {/* Protected routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/order" element={<OrderPage />} />
          <Route path="/report" element={<ReportPage />} />
          <Route path="/manager/posts" element={<PostManagementPage />} />
        </Route>
        <Route element={<RoleProtectedRoute allow={["ADMIN", "MANAGER"]} />}>
          <Route path="/admin/employees" element={<EmployeeManagementPage />} />
        </Route>

        {/* Auth routes */}
        <Route element={<AuthRoute />}>
          <Route path="/sign-in" element={<SignInPage />} />
          <Route path="/sign-up" element={<SignUpPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;