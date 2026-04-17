import {
  ProtectedRoute,
  AuthRoute,
} from "@/components/layout/auth/protected-route";
import DashBoardPage from "@/pages/DashBoard/DashBoardPage";
import HomePage from "@/pages/HomePage";
import SignInPage from "@/pages/SignInPage";
import SignUpPage from "@/pages/SignUpPage";
import TestKitPage from "@/pages/TestKitPage";
import { BrowserRouter, Routes, Route } from "react-router";

const AppRoutes = () => {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route index element={<HomePage />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<DashBoardPage />} />
            <Route path="/test-kits" element={<TestKitPage />} />
          </Route>
          <Route element={<AuthRoute />}>
            <Route path="/sign-in" element={<SignInPage />} />
            <Route path="/sign-up" element={<SignUpPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
};

export default AppRoutes;
