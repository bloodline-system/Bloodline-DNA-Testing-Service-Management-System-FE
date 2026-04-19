import { LoginForm } from "@/components/layout/auth/login-form";
import AuthImage from "../assets/svg/auth-image.svg";
import LogoImage from "../assets/toggle-logo.png";
import { Link } from "react-router";

const SignInPage = () => {
  return (
    <div className="grid min-h-svh lg:grid-cols-[60%_40%] ">
      <div className="relative hidden lg:block bg-primary/40">
        <img
          src={AuthImage}
          alt="auth-image"
          className="absolute inset-0 w-[85%] h-[85%] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 object-contain dark:brightness-[0.2] dark:grayscale"
        />
      </div>
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <Link
            to="/"
            className="flex items-center gap-2 font-bold text-lg text-primary"
          >
            <div className="flex size-6 items-center justify-center rounded-md text-primary-foreground">
              <img src={LogoImage} alt="Logo" />
            </div>
            Bloodline DNA System
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-sm">
            <LoginForm />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignInPage;
