import HomePage from "@/pages/HomePage";
import SignInPage from "@/pages/SignInPage";
import SignUpPage from "@/pages/SignUpPage";
import OrderPage from "@/pages/OrderPage";
import ReportPage from "@/pages/ReportPage";
import { BrowserRouter, Routes, Route } from "react-router";

const AppRoutes = () => {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route index element={<HomePage />} />
          <Route path="/sign-in" element={<SignInPage />} />
          <Route path="/sign-up" element={<SignUpPage />} />
          <Route path="/order" element={<OrderPage />} />
          <Route path="/report" element={<ReportPage />} />
        </Routes>
      </BrowserRouter>
    </>
  );
};

export default AppRoutes;
