import {
  ProtectedRoute,
  AuthRoute,
} from "@/components/layout/auth/protected-route";
import HomePage from "@/pages/HomePage";
import SignInPage from "@/pages/SignInPage";
import SignUpPage from "@/pages/SignUpPage";
import { BrowserRouter, Routes, Route } from "react-router";

const AppRoutes = () => {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route element={<ProtectedRoute />}></Route>
          <Route index element={<HomePage />} />
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
