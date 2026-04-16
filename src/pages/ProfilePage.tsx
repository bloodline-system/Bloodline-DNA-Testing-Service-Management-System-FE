import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

import LogoImage from "@/assets/toggle-logo.png";
import { Navbar } from "@/components/layout/home/navbar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Field,
  FieldDescription as InlineDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { GridFields } from "@/components/ui/grid-fields";
import { Input } from "@/components/ui/input";
import {
  useDeleteProfileMutation,
  useFetchMe,
  useUpdateProfileMutation,
  useUploadImageMutation,
} from "@/services/user/user.queries";
import type { UpdateUserProfileRequest } from "@/services/user/types";
import { useAuthStore } from "@/stores/auth/useAuthStore";

const PROFILE_MENU = [{ title: "Home", url: "/" }];

const PROFILE_AUTH = {
  login: { title: "Sign In", url: "/sign-in" },
  signup: { title: "Sign Up", url: "/sign-up" },
};

const MAX_AVATAR_BYTES = 1 * 1024 * 1024;

const TABS = [
  { key: "personal", label: "Personal" },
  { key: "account", label: "Account" },
  { key: "security", label: "Security" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

const personalSchema = z.object({
  firstName: z.string().max(100).optional(),
  lastName: z.string().max(100).optional(),
  email: z.string().email("Please enter a valid email."),
  phoneNumber: z
    .string()
    .max(20, "Phone number must not exceed 20 characters.")
    .regex(
      /^[0-9+\-\s]*$/,
      "Phone number must contain only digits, +, -, and spaces.",
    )
    .optional(),
  dateOfBirth: z
    .string()
    .optional()
    .refine((val) => !val || /^\d{4}-\d{2}-\d{2}$/.test(val), {
      message: "Date of birth must be YYYY-MM-DD.",
    }),
});

type PersonalFormValues = z.infer<typeof personalSchema>;

const getTabFromSearchParams = (tabParam: string | null): TabKey => {
  if (tabParam === "personal" || tabParam === "account" || tabParam === "security") {
    return tabParam;
  }
  return "personal";
};

const ProfilePage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const accessToken = useAuthStore((state) => state.accessToken);
  const clearSession = useAuthStore((state) => state.clearSession);

  const meQuery = useFetchMe(Boolean(accessToken));
  const profile = meQuery.data?.data ?? null;

  const activeTab = useMemo(() => {
    return getTabFromSearchParams(searchParams.get("tab"));
  }, [searchParams]);

  const setActiveTab = (tab: TabKey) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set("tab", tab);
      return next;
    });
  };

  const username = profile?.username ?? "";
  const updateProfileMutation = useUpdateProfileMutation(username);
  const uploadImageMutation = useUploadImageMutation();
  const deleteProfileMutation = useDeleteProfileMutation();

  const [selectedAvatarFile, setSelectedAvatarFile] = useState<File | null>(null);
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string>("");

  const {
    register,
    reset,
    handleSubmit,
    formState: { errors, isDirty, isValid, isSubmitting },
  } = useForm<PersonalFormValues>({
    mode: "all",
    resolver: zodResolver(personalSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      dateOfBirth: "",
    },
  });

  useEffect(() => {
    if (!profile) return;

    reset({
      firstName: profile.firstName ?? "",
      lastName: profile.lastName ?? "",
      email: profile.email ?? "",
      phoneNumber: profile.phoneNumber ?? "",
      dateOfBirth: profile.dateOfBirth ?? "",
    });

    setSelectedAvatarFile(null);
    setAvatarPreviewUrl("");
  }, [profile, reset]);

  useEffect(() => {
    if (!selectedAvatarFile) return;

    const url = URL.createObjectURL(selectedAvatarFile);
    setAvatarPreviewUrl(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [selectedAvatarFile]);

  const avatarUrl = avatarPreviewUrl || profile?.profileImageUrl || "";

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;

    if (!file) {
      setSelectedAvatarFile(null);
      setAvatarPreviewUrl("");
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file.");
      event.target.value = "";
      setSelectedAvatarFile(null);
      setAvatarPreviewUrl("");
      return;
    }

    if (file.size > MAX_AVATAR_BYTES) {
      toast.error("Image must be 1MB or smaller.");
      event.target.value = "";
      setSelectedAvatarFile(null);
      setAvatarPreviewUrl("");
      return;
    }

    setSelectedAvatarFile(file);
  };

  const onSubmitPersonal = async (values: PersonalFormValues) => {
    if (!username) return;

    const payload: UpdateUserProfileRequest = {
      firstName: values.firstName?.trim() || null,
      lastName: values.lastName?.trim() || null,
      email: values.email.trim(),
      phoneNumber: values.phoneNumber?.trim() || null,
      dateOfBirth: values.dateOfBirth?.trim() || null,
    };

    if (selectedAvatarFile) {
      const uploadResponse =
        await uploadImageMutation.mutateAsync(selectedAvatarFile);

      const fileName = uploadResponse.data;
      const profileImageUrl = `/api/upload/files/${encodeURIComponent(fileName)}`;

      await updateProfileMutation.mutateAsync({
        ...payload,
        profileImageUrl,
      });
      return;
    }

    await updateProfileMutation.mutateAsync(payload);
  };

  const handleDeleteAccount = async () => {
    if (!username) return;

    await deleteProfileMutation.mutateAsync(username);
    clearSession();
    navigate("/sign-in");
  };

  const logo = {
    url: "/",
    src: LogoImage,
    alt: "Bloodline logo",
    title: "Bloodline DNA",
  };

  return (
    <div className="min-h-svh bg-background text-foreground">
      <header className="sticky top-0 z-50 flex justify-center border-b bg-white/95 text-slate-900 backdrop-blur">
        <Navbar
          className="flex w-11/12 justify-center py-3"
          inverted={false}
          logo={logo}
          menu={PROFILE_MENU}
          auth={PROFILE_AUTH}
          profile={profile}
        />
      </header>

      <main className="mx-auto w-11/12 max-w-5xl py-8">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold">Profile</h1>
            <p className="text-sm text-muted-foreground">
              Manage your personal information, account, and security.
            </p>
          </div>

          {meQuery.isLoading ? (
            <Card>
              <CardContent className="py-6">Loading your profile...</CardContent>
            </Card>
          ) : meQuery.isError ? (
            <Card>
              <CardContent className="py-6">
                Unable to load your profile.
              </CardContent>
            </Card>
          ) : !profile ? (
            <Card>
              <CardContent className="py-6">No profile data.</CardContent>
            </Card>
          ) : (
            <div className="flex flex-col gap-6 md:flex-row">
              <div className="flex flex-row gap-2 md:w-60 md:flex-col">
                {TABS.map((tab) => (
                  <Button
                    key={tab.key}
                    type="button"
                    variant={activeTab === tab.key ? "default" : "outline"}
                    className="w-full justify-start"
                    onClick={() => setActiveTab(tab.key)}
                  >
                    {tab.label}
                  </Button>
                ))}
              </div>

              <div className="flex-1">
                {activeTab === "personal" ? (
                  <Card>
                    <CardHeader>
                      <CardTitle>Personal information</CardTitle>
                      <CardDescription>
                        Update your profile details and avatar.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-col gap-6">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex items-center gap-4">
                            <Avatar className="size-12">
                              <AvatarImage alt="Avatar" src={avatarUrl} />
                              <AvatarFallback>
                                {(profile.username || "U").slice(0, 1).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="text-sm font-medium">
                                {profile.username}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {profile.email}
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col gap-2">
                            <Input
                              type="file"
                              accept="image/*"
                              onChange={handleAvatarChange}
                            />
                            <p className="text-xs text-muted-foreground">
                              Upload a JPG/PNG image (max 1MB).
                            </p>
                          </div>
                        </div>

                        <form
                          className="flex flex-col gap-6"
                          onSubmit={handleSubmit(onSubmitPersonal)}
                        >
                          <FieldGroup>
                            <GridFields columns={2} className="gap-4">
                              <Field data-invalid={Boolean(errors.firstName)}>
                                <FieldLabel htmlFor="firstName">
                                  First name
                                </FieldLabel>
                                <Input
                                  id="firstName"
                                  className="bg-background"
                                  {...register("firstName")}
                                />
                                <FieldError errors={[errors.firstName]} />
                              </Field>

                              <Field data-invalid={Boolean(errors.lastName)}>
                                <FieldLabel htmlFor="lastName">
                                  Last name
                                </FieldLabel>
                                <Input
                                  id="lastName"
                                  className="bg-background"
                                  {...register("lastName")}
                                />
                                <FieldError errors={[errors.lastName]} />
                              </Field>

                              <Field data-invalid={Boolean(errors.email)}>
                                <FieldLabel htmlFor="email">Email</FieldLabel>
                                <Input
                                  id="email"
                                  type="email"
                                  className="bg-background"
                                  aria-invalid={Boolean(errors.email)}
                                  {...register("email")}
                                />
                                <FieldError errors={[errors.email]} />
                              </Field>

                              <Field data-invalid={Boolean(errors.phoneNumber)}>
                                <FieldLabel htmlFor="phoneNumber">
                                  Phone number
                                </FieldLabel>
                                <Input
                                  id="phoneNumber"
                                  className="bg-background"
                                  {...register("phoneNumber")}
                                />
                                <FieldError errors={[errors.phoneNumber]} />
                              </Field>

                              <Field data-invalid={Boolean(errors.dateOfBirth)}>
                                <FieldLabel htmlFor="dateOfBirth">
                                  Date of birth
                                </FieldLabel>
                                <Input
                                  id="dateOfBirth"
                                  type="date"
                                  className="bg-background"
                                  {...register("dateOfBirth")}
                                />
                                <FieldError errors={[errors.dateOfBirth]} />
                              </Field>
                            </GridFields>

                            <Field>
                              <Button
                                type="submit"
                                disabled={
                                  updateProfileMutation.isPending ||
                                  isSubmitting ||
                                  !isValid ||
                                  !isDirty
                                }
                              >
                                {updateProfileMutation.isPending || isSubmitting
                                  ? "Saving..."
                                  : "Save changes"}
                              </Button>
                              <InlineDescription>
                                Your changes will be saved to your account.
                              </InlineDescription>
                            </Field>
                          </FieldGroup>
                        </form>
                      </div>
                    </CardContent>
                  </Card>
                ) : null}

                {activeTab === "account" ? (
                  <div className="flex flex-col gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Account</CardTitle>
                        <CardDescription>
                          Basic information about your account.
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid gap-3 text-sm">
                          <div className="flex items-center justify-between gap-4">
                            <span className="text-muted-foreground">
                              Username
                            </span>
                            <span className="font-medium">{profile.username}</span>
                          </div>
                          <div className="flex items-center justify-between gap-4">
                            <span className="text-muted-foreground">Role</span>
                            <span className="font-medium">{profile.role}</span>
                          </div>
                          {profile.createdAt ? (
                            <div className="flex items-center justify-between gap-4">
                              <span className="text-muted-foreground">
                                Created at
                              </span>
                              <span className="font-medium">
                                {profile.createdAt}
                              </span>
                            </div>
                          ) : null}
                          {typeof profile.isActive === "boolean" ? (
                            <div className="flex items-center justify-between gap-4">
                              <span className="text-muted-foreground">
                                Status
                              </span>
                              <span className="font-medium">
                                {profile.isActive ? "Active" : "Inactive"}
                              </span>
                            </div>
                          ) : null}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Danger zone</CardTitle>
                        <CardDescription>
                          Deleting your account requires admin approval.
                        </CardDescription>
                      </CardHeader>
                      <CardFooter className="justify-between gap-4">
                        <p className="text-sm text-muted-foreground">
                          Request to delete your account.
                        </p>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="destructive">Delete account</Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Delete account</DialogTitle>
                              <DialogDescription>
                                This action cannot be undone.
                              </DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                              <DialogClose asChild>
                                <Button variant="outline" type="button">
                                  Cancel
                                </Button>
                              </DialogClose>
                              <Button
                                variant="destructive"
                                type="button"
                                onClick={() => void handleDeleteAccount()}
                                disabled={deleteProfileMutation.isPending}
                              >
                                {deleteProfileMutation.isPending
                                  ? "Deleting..."
                                  : "Confirm delete"}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </CardFooter>
                    </Card>
                  </div>
                ) : null}

                {activeTab === "security" ? (
                  <Card>
                    <CardHeader>
                      <CardTitle>Security</CardTitle>
                      <CardDescription>
                        Change your password and secure your account.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-col gap-4">
                        <p className="text-sm text-muted-foreground">
                          Password change via profile update is not supported by
                          the current backend API.
                        </p>
                        <div className="grid gap-4">
                          <Field data-disabled={true}>
                            <FieldLabel htmlFor="currentPassword">
                              Current password
                            </FieldLabel>
                            <Input
                              id="currentPassword"
                              type="password"
                              disabled
                            />
                          </Field>
                          <Field data-disabled={true}>
                            <FieldLabel htmlFor="newPassword">
                              New password
                            </FieldLabel>
                            <Input id="newPassword" type="password" disabled />
                          </Field>
                          <Field data-disabled={true}>
                            <FieldLabel htmlFor="confirmPassword">
                              Confirm new password
                            </FieldLabel>
                            <Input
                              id="confirmPassword"
                              type="password"
                              disabled
                            />
                          </Field>
                          <Button type="button" disabled>
                            Update password
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ) : null}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ProfilePage;
