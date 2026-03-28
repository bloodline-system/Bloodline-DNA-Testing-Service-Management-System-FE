import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { GridFields } from "@/components/ui/grid-fields";
import { Input } from "@/components/ui/input";
import { Link, useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useSignUpMutation } from "@/services/auth/auth.queries";
import { getApiErrorMessage } from "@/lib/api-error";

const signupSchema = z
  .object({
    firstName: z.string().trim().min(1, "First name is required."),
    lastName: z.string().trim().min(1, "Last name is required."),
    email: z.email("Please enter a valid email address."),
    username: z
      .string()
      .trim()
      .min(3, "Username must be at least 3 characters long."),
    password: z.string().min(8, "Password must be at least 8 characters long."),
    confirmPassword: z.string().min(8, "Please confirm your password."),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

type SignupFormValues = z.infer<typeof signupSchema>;

type SignupFormProps = Omit<React.ComponentProps<"form">, "onSubmit"> & {
  onSubmit?: (values: SignupFormValues) => void | Promise<void>;
  onSignupSuccess?: (payload: { email: string; signUpId: string }) => void;
};

export function SignupForm({
  className,
  onSubmit,
  onSignupSuccess,
  ...props
}: SignupFormProps) {
  const navigate = useNavigate();
  const signUpMutation = useSignUpMutation();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty, isValid },
  } = useForm<SignupFormValues>({
    mode: "onChange",
    resolver: zodResolver(signupSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "example@email.com",
      username: "",
      password: "",
      confirmPassword: "",
    },
  });

  const handleFormSubmit = async (values: SignupFormValues) => {
    const { email } = values;

    try {
      const signUpId = await signUpMutation.mutateAsync(values);
      await onSubmit?.(values);

      if (onSignupSuccess) {
        onSignupSuccess({ email, signUpId });
        return;
      }

      navigate("/sign-in");
    } catch {
      // Errors are surfaced via mutation state and toast in the hook.
    }
  };

  return (
    <form
      className={cn("flex flex-col gap-6", className)}
      onSubmit={handleSubmit(handleFormSubmit)}
      {...props}
    >
      <FieldGroup>
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-primary">Get Started</h1>
          <p className="text-sm text-balance text-muted-foreground font-bold">
            It's free to signup and only takes a minute.
          </p>
        </div>
        <GridFields>
          <Field data-invalid={Boolean(errors.firstName)}>
            <FieldLabel htmlFor="firstName">First Name</FieldLabel>
            <Input
              id="firstName"
              type="text"
              placeholder="John"
              aria-invalid={Boolean(errors.firstName)}
              {...register("firstName")}
              className="bg-background"
            />
            <FieldError errors={[errors.firstName]} />
          </Field>
          <Field data-invalid={Boolean(errors.lastName)}>
            <FieldLabel htmlFor="lastName">Last Name</FieldLabel>
            <Input
              id="lastName"
              type="text"
              placeholder="Doe"
              aria-invalid={Boolean(errors.lastName)}
              {...register("lastName")}
              className="bg-background"
            />
            <FieldError errors={[errors.lastName]} />
          </Field>
        </GridFields>
        <Field data-invalid={Boolean(errors.email)}>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            id="email"
            type="email"
            placeholder="m@example.com"
            aria-invalid={Boolean(errors.email)}
            {...register("email")}
            className="bg-background"
          />
          <FieldDescription>
            We&apos;ll use this to contact you. We will not share your email
            with anyone else.
          </FieldDescription>
          <FieldError errors={[errors.email]} />
        </Field>
        <Field data-invalid={Boolean(errors.username)}>
          <FieldLabel htmlFor="username">Username</FieldLabel>
          <Input
            id="username"
            type="text"
            placeholder="johndoe"
            aria-invalid={Boolean(errors.username)}
            {...register("username")}
            className="bg-background"
          />
          <FieldDescription>
            Choose a unique username for your account.
          </FieldDescription>
          <FieldError errors={[errors.username]} />
        </Field>
        <Field data-invalid={Boolean(errors.password)}>
          <FieldLabel htmlFor="password">Password</FieldLabel>
          <Input
            id="password"
            type="password"
            aria-invalid={Boolean(errors.password)}
            {...register("password")}
            className="bg-background"
          />
          <FieldDescription>
            Must be at least 8 characters long.
          </FieldDescription>
          <FieldError errors={[errors.password]} />
        </Field>
        <Field data-invalid={Boolean(errors.confirmPassword)}>
          <FieldLabel htmlFor="confirmPassword">Confirm Password</FieldLabel>
          <Input
            id="confirmPassword"
            type="password"
            aria-invalid={Boolean(errors.confirmPassword)}
            {...register("confirmPassword")}
            className="bg-background"
          />
          <FieldError errors={[errors.confirmPassword]} />
        </Field>
        <Field>
          <Button
            type="submit"
            disabled={
              signUpMutation.isPending || isSubmitting || !isDirty || !isValid
            }
          >
            {signUpMutation.isPending || isSubmitting
              ? "Creating Account..."
              : "Create Account"}
          </Button>
          {signUpMutation.isError ? (
            <FieldDescription className="text-destructive">
              {getApiErrorMessage(
                signUpMutation.error,
                "Unable to create account.",
              )}
            </FieldDescription>
          ) : null}
        </Field>
        <FieldSeparator>Or continue with</FieldSeparator>
        <Field>
          <Button variant="outline" type="button">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path
                d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"
                fill="currentColor"
              />
            </svg>
            Sign up with GitHub
          </Button>
          <FieldDescription className="px-6 text-center">
            Already have an account?
            <Link to="/sign-in" className="underline underline-offset-4">
              Sign in
            </Link>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  );
}
