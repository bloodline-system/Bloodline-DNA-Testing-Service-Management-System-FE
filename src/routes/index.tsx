import {
  ProtectedRoute,
  AuthRoute,
} from "@/components/layout/auth/protected-route";
import DashBoardPage from "@/pages/DashBoard/DashBoardPage";
import HomePage from "@/pages/HomePage";
import ProfilePage from "@/pages/ProfilePage";
import OrderPage from "@/pages/OrderPage";
import SignInPage from "@/pages/SignInPage";
import SignUpPage from "@/pages/SignUpPage";
import TestKitPage from "@/pages/TestKitPage";
import CustomerOrdersPage from "@/pages/CustomerOrdersPage";
import OrderWorkflowPage from "@/pages/OrderWorkflowPage";
import PostManagementPage from "@/pages/PostManagementPage";
import ReportPage from "@/pages/ReportPage";
import MedicalServiceManagementPage from "@/pages/MedicalServiceManagementPage";
import { BrowserRouter, Routes, Route } from "react-router";

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route index element={<HomePage />} />

        {/* Protected routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashBoardPage />} />
          <Route path="/test-kits" element={<TestKitPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/order" element={<OrderPage />} />
          <Route path="/orders" element={<CustomerOrdersPage />} />
          <Route path="/order-workflow/new" element={<OrderWorkflowPage />} />
          <Route path="/order-workflow/:id" element={<OrderWorkflowPage />} />
          <Route path="/report" element={<ReportPage />} />
          <Route
            path="/manager/medical-services"
            element={<MedicalServiceManagementPage />}
          />
          <Route path="/manager/posts" element={<PostManagementPage />} />
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
