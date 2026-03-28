import { RefreshCwIcon } from "lucide-react";
import { useEffect, useState } from "react";
import type { FormEvent } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import {
  useResendOtpMutation,
  useVerifyOtpMutation,
} from "@/services/auth/auth.queries";
import { getApiErrorMessage } from "@/lib/api-error";
import { useNavigate } from "react-router";

type OtpVerificationFormProps = {
  email: string;
  signUpId: string;
  onVerified?: () => void;
};

const OtpVerificationForm = ({
  email,
  signUpId,
  onVerified,
}: OtpVerificationFormProps) => {
  const [otp, setOtp] = useState("");
  const [resendCooldown, setResendCooldown] = useState(60);
  const verifyOtpMutation = useVerifyOtpMutation();
  const resendOtpMutation = useResendOtpMutation();
  const navigate = useNavigate();

  useEffect(() => {
    if (resendCooldown <= 0) {
      return;
    }

    const timer = window.setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [resendCooldown]);

  const handleResendOtp = async () => {
    if (!signUpId || resendCooldown > 0) {
      return;
    }

    try {
      await resendOtpMutation.mutateAsync({ signUpId });
      setResendCooldown(60);
    } catch {
      // Errors are surfaced via mutation state and toast in the hook.
    }
  };

  const handleVerify = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!signUpId || otp.length !== 6) {
      return;
    }

    try {
      await verifyOtpMutation.mutateAsync({
        signUpId,
        otp,
      });
      onVerified?.();
      navigate("/sign-in");
    } catch {
      // Errors are surfaced via mutation state and toast in the hook.
    }
  };

  return (
    <Card className="mx-auto max-w-md ring-0">
      <CardHeader>
        <CardTitle>Verify your login</CardTitle>
        <CardDescription>
          Enter the verification code we sent to your email address:{" "}
          <span className="font-medium">{email || "m@example.com"}</span>.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleVerify}>
        <CardContent>
          <Field>
            <div className="flex items-center justify-between">
              <FieldLabel htmlFor="otp-verification">
                Verification code
              </FieldLabel>
              <Button
                variant="outline"
                size="xs"
                type="button"
                onClick={handleResendOtp}
                disabled={
                  resendOtpMutation.isPending || resendCooldown > 0 || !signUpId
                }
              >
                <RefreshCwIcon />
                {resendOtpMutation.isPending
                  ? "Sending..."
                  : resendCooldown > 0
                    ? `Resend (${resendCooldown}s)`
                    : "Resend Code"}
              </Button>
            </div>
            <InputOTP
              maxLength={6}
              id="otp-verification"
              required
              value={otp}
              onChange={setOtp}
            >
              <InputOTPGroup className="*:data-[slot=input-otp-slot]:h-12 *:data-[slot=input-otp-slot]:w-11 *:data-[slot=input-otp-slot]:text-xl">
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
              </InputOTPGroup>
              <InputOTPSeparator className="mx-2" />
              <InputOTPGroup className="*:data-[slot=input-otp-slot]:h-12 *:data-[slot=input-otp-slot]:w-11 *:data-[slot=input-otp-slot]:text-xl">
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
            <FieldDescription>
              <a href="#">I no longer have access to this email address.</a>
            </FieldDescription>
          </Field>
        </CardContent>
        <CardFooter className="bg-white">
          <Field>
            <Button
              type="submit"
              className="w-full"
              disabled={
                verifyOtpMutation.isPending || otp.length !== 6 || !signUpId
              }
            >
              {verifyOtpMutation.isPending ? "Verifying..." : "Verify"}
            </Button>
            {verifyOtpMutation.isError ? (
              <FieldDescription className="text-destructive">
                {getApiErrorMessage(
                  verifyOtpMutation.error,
                  "Unable to verify OTP. Please try again.",
                )}
              </FieldDescription>
            ) : null}
            <div className="text-sm text-muted-foreground">
              Having trouble signing in?{" "}
              <a
                href="#"
                className="underline underline-offset-4 transition-colors hover:text-primary"
              >
                Contact support
              </a>
            </div>
          </Field>
        </CardFooter>
      </form>
    </Card>
  );
};

export default OtpVerificationForm;
