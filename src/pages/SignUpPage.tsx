import { useState } from "react";
import { SignupForm } from "@/components/layout/auth/signup-form";
import OtpVerificationForm from "@/components/layout/auth/otp-verify-form";
import LogoImage from "../assets/toggle-logo.png";
import AuthImage from "../assets/svg/auth-image.svg";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Link } from "react-router";

type SignUpDialogContext = {
  email: string;
  signUpId: string;
};

const SignUpPage = () => {
  const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState(false);
  const [dialogContext, setDialogContext] =
    useState<SignUpDialogContext | null>(null);

  const handleSignupSuccess = (payload: SignUpDialogContext) => {
    setDialogContext(payload);
    setIsSuccessDialogOpen(true);
  };

  return (
    <>
      <div className="grid min-h-svh lg:grid-cols-[40%_60%]">
        <div className="flex flex-col gap-10 p-6 md:p-10 overflow-y-scroll h-dvh">
          <div className="flex justify-center gap-2 md:justify-start">
            <Link
              to="/"
              className="flex items-center gap-2 text-lg text-primary font-bold"
            >
              <div className="flex size-6 items-center justify-center rounded-md text-primary-foreground">
                <img src={LogoImage} alt="Logo" />
              </div>
              Bloodline DNA System
            </Link>
          </div>
          <div className="flex flex-1 items-center justify-center ">
            <div className="w-full max-w-sm">
              <SignupForm onSignupSuccess={handleSignupSuccess} />
            </div>
          </div>
        </div>
        <div className="relative hidden lg:block bg-primary/40">
          <img
            src={AuthImage}
            alt="auth-image"
            className="absolute inset-0 w-[85%] h-[85%] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 object-contain dark:brightness-[0.2] dark:grayscale"
          />
        </div>
      </div>

      <Dialog open={isSuccessDialogOpen} onOpenChange={setIsSuccessDialogOpen}>
        <DialogContent className="sm:max-w-md border-none bg-white">
          <OtpVerificationForm
            key={dialogContext?.signUpId ?? "otp-verification-form"}
            email={dialogContext?.email ?? ""}
            signUpId={dialogContext?.signUpId ?? ""}
            onVerified={() => setIsSuccessDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SignUpPage;
