import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { CalendarDays, Mail, ShieldCheck, Sparkles, UserCircle2 } from "lucide-react";

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
  useChangePasswordMutation,
  useFetchMe,
  useUpdateProfileMutation,
  useUploadImageMutation,
} from "@/services/user/user.queries";
import type { ChangePasswordRequest, UpdateUserProfileRequest } from "@/services/user/types";
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
  const changePasswordMutation = useChangePasswordMutation();
  const uploadImageMutation = useUploadImageMutation();
  const deleteProfileMutation = useDeleteProfileMutation();

  const [selectedAvatarFile, setSelectedAvatarFile] = useState<File | null>(null);
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string>("");
  const [passwordForm, setPasswordForm] = useState<ChangePasswordRequest>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

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
    setPasswordForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  }, [profile?.username]);

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

  const handlePasswordChange = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      toast.error("Please fill in all password fields.");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("New password and confirmation do not match.");
      return;
    }

    await changePasswordMutation.mutateAsync(passwordForm);
    setPasswordForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  const logo = {
    url: "/",
    src: LogoImage,
    alt: "Bloodline logo",
    title: "Bloodline DNA",
  };

  return (
    <div className="min-h-svh bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.16),_transparent_28%),radial-gradient(circle_at_top_right,_rgba(99,102,241,0.12),_transparent_24%),linear-gradient(180deg,_#f8fbff_0%,_#ffffff_48%,_#eff6ff_100%)] text-foreground">
      <header className="sticky top-0 z-50 flex justify-center border-b border-white/70 bg-white/85 text-slate-900 backdrop-blur-xl">
        <Navbar
          className="flex w-11/12 justify-center py-3"
          inverted={false}
          logo={logo}
          menu={PROFILE_MENU}
          auth={PROFILE_AUTH}
          profile={profile}
        />
      </header>

      <main className="mx-auto w-11/12 max-w-6xl py-8 md:py-10">
        <div className="flex flex-col gap-6">
          <section className="overflow-hidden rounded-[28px] border border-slate-200/70 bg-white/90 shadow-2xl shadow-slate-200/60 backdrop-blur">
            <div className="grid gap-6 px-6 py-6 md:grid-cols-[1.2fr_0.8fr] md:px-8 md:py-8">
              <div className="space-y-5">
                <div className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">
                  <Sparkles className="size-3.5" />
                  Account studio
                </div>
                <div className="space-y-2">
                  <h1 className="text-3xl font-semibold tracking-tight text-slate-950 md:text-5xl">
                    Shape your profile and security in one place.
                  </h1>
                  <p className="max-w-2xl text-sm leading-6 text-slate-600 md:text-base">
                    Keep your identity details, avatar, and password aligned without jumping between screens.
                  </p>
                </div>

                {profile ? (
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-500">
                        <UserCircle2 className="size-4" />
                        Username
                      </div>
                      <div className="mt-2 text-sm font-semibold text-slate-950">{profile.username}</div>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-500">
                        <ShieldCheck className="size-4" />
                        Role
                      </div>
                      <div className="mt-2 text-sm font-semibold text-slate-950">{profile.role}</div>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-500">
                        <CalendarDays className="size-4" />
                        Status
                      </div>
                      <div className="mt-2 text-sm font-semibold text-slate-950">
                        {typeof profile.isActive === "boolean" ? (profile.isActive ? "Active" : "Inactive") : "Member"}
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>

              {profile ? (
                <div className="rounded-[24px] border border-slate-200 bg-[linear-gradient(180deg,_rgba(255,255,255,0.9),_rgba(241,245,249,0.95))] p-5 shadow-lg shadow-slate-200/60">
                  <div className="flex items-center gap-4">
                    <Avatar className="size-16 ring-4 ring-sky-100">
                      <AvatarImage alt="Avatar" src={avatarUrl} />
                      <AvatarFallback className="text-lg font-semibold">
                        {(profile.username || "U").slice(0, 1).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium text-slate-500">Signed in as</div>
                      <div className="truncate text-xl font-semibold text-slate-950">
                        {profile.firstName || profile.lastName
                          ? `${profile.firstName ?? ""} ${profile.lastName ?? ""}`.trim()
                          : profile.username}
                      </div>
                      <div className="mt-1 flex items-center gap-2 text-sm text-slate-600">
                        <Mail className="size-4" />
                        <span className="truncate">{profile.email}</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-5 grid gap-3 text-sm text-slate-600">
                    <div className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3">
                      Personal details are synced with your account.
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3">
                      Avatar changes are uploaded before profile save.
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </section>

          {meQuery.isLoading ? (
            <Card className="border-slate-200/80 bg-white/90 shadow-lg shadow-slate-200/60 backdrop-blur">
              <CardContent className="py-10 text-center text-slate-600">Loading your profile...</CardContent>
            </Card>
          ) : meQuery.isError ? (
            <Card className="border-slate-200/80 bg-white/90 shadow-lg shadow-slate-200/60 backdrop-blur">
              <CardContent className="py-10 text-center text-slate-600">
                Unable to load your profile.
              </CardContent>
            </Card>
          ) : !profile ? (
            <Card className="border-slate-200/80 bg-white/90 shadow-lg shadow-slate-200/60 backdrop-blur">
              <CardContent className="py-10 text-center text-slate-600">No profile data.</CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
              <div className="rounded-[24px] border border-slate-200/70 bg-white/90 p-3 shadow-lg shadow-slate-200/50 backdrop-blur">
                {TABS.map((tab) => (
                  <Button
                    key={tab.key}
                    type="button"
                    variant={activeTab === tab.key ? "default" : "ghost"}
                    className={`w-full justify-start rounded-2xl px-4 py-3 text-left ${activeTab === tab.key ? "bg-slate-950 text-white hover:bg-slate-900" : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"}`}
                    onClick={() => setActiveTab(tab.key)}
                  >
                    {tab.label}
                  </Button>
                ))}
              </div>

              <div className="flex-1 space-y-6">
                {activeTab === "personal" ? (
                  <Card className="border-slate-200/80 bg-white/95 shadow-xl shadow-slate-200/60 backdrop-blur">
                    <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-sky-50 via-white to-indigo-50">
                      <CardTitle>Personal information</CardTitle>
                      <CardDescription>
                        Update your profile details and avatar.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6 p-6 md:p-8">
                      <div className="grid gap-5 lg:grid-cols-[300px_minmax(0,1fr)]">
                        <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
                          <div className="flex items-center gap-4">
                            <Avatar className="size-16 ring-4 ring-white shadow-lg shadow-slate-200/60">
                              <AvatarImage alt="Avatar" src={avatarUrl} />
                              <AvatarFallback className="text-lg font-semibold">
                                {(profile.username || "U").slice(0, 1).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <div className="text-sm font-medium text-slate-500">Current profile</div>
                              <div className="truncate text-lg font-semibold text-slate-950">{profile.username}</div>
                              <div className="truncate text-sm text-slate-600">{profile.email}</div>
                            </div>
                          </div>

                          <div className="mt-5 space-y-3">
                            <Input
                              type="file"
                              accept="image/*"
                              onChange={handleAvatarChange}
                              className="bg-white"
                            />
                            <p className="text-xs leading-5 text-slate-500">
                              Upload a JPG/PNG image. Max size: 1MB.
                            </p>
                          </div>

                          <div className="mt-5 overflow-hidden rounded-[20px] border border-slate-200 bg-white shadow-sm">
                            <img
                              src={avatarUrl || "https://placehold.co/600x400/e2e8f0/334155?text=Profile+preview"}
                              alt="Avatar preview"
                              className="h-56 w-full object-cover"
                            />
                          </div>
                        </div>

                        <form
                          className="space-y-6"
                          onSubmit={handleSubmit(onSubmitPersonal)}
                        >
                          <FieldGroup>
                            <GridFields columns={2} className="gap-4">
                              <Field data-invalid={Boolean(errors.firstName)}>
                                <FieldLabel htmlFor="firstName">First name</FieldLabel>
                                <Input id="firstName" className="bg-white" {...register("firstName")} />
                                <FieldError errors={[errors.firstName]} />
                              </Field>

                              <Field data-invalid={Boolean(errors.lastName)}>
                                <FieldLabel htmlFor="lastName">Last name</FieldLabel>
                                <Input id="lastName" className="bg-white" {...register("lastName")} />
                                <FieldError errors={[errors.lastName]} />
                              </Field>

                              <Field data-invalid={Boolean(errors.email)}>
                                <FieldLabel htmlFor="email">Email</FieldLabel>
                                <Input id="email" type="email" className="bg-white" aria-invalid={Boolean(errors.email)} {...register("email")} />
                                <FieldError errors={[errors.email]} />
                              </Field>

                              <Field data-invalid={Boolean(errors.phoneNumber)}>
                                <FieldLabel htmlFor="phoneNumber">Phone number</FieldLabel>
                                <Input id="phoneNumber" className="bg-white" {...register("phoneNumber")} />
                                <FieldError errors={[errors.phoneNumber]} />
                              </Field>

                              <Field data-invalid={Boolean(errors.dateOfBirth)}>
                                <FieldLabel htmlFor="dateOfBirth">Date of birth</FieldLabel>
                                <Input id="dateOfBirth" type="date" className="bg-white" {...register("dateOfBirth")} />
                                <FieldError errors={[errors.dateOfBirth]} />
                              </Field>
                            </GridFields>

                            <Field className="rounded-[22px] border border-slate-200 bg-slate-50 p-4">
                              <Button
                                type="submit"
                                disabled={
                                  updateProfileMutation.isPending ||
                                  isSubmitting ||
                                  !isValid ||
                                  !isDirty
                                }
                                className="w-full md:w-auto"
                              >
                                {updateProfileMutation.isPending || isSubmitting ? "Saving..." : "Save changes"}
                              </Button>
                              <InlineDescription className="mt-2">
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
                  <div className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
                    <Card className="border-slate-200/80 bg-white/95 shadow-xl shadow-slate-200/60 backdrop-blur">
                      <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-indigo-50 via-white to-sky-50">
                        <CardTitle>Account</CardTitle>
                        <CardDescription>
                          Basic information about your account.
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="p-6">
                        <div className="grid gap-3 text-sm">
                          <div className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                            <span className="text-slate-500">Username</span>
                            <span className="font-semibold text-slate-950">{profile.username}</span>
                          </div>
                          <div className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                            <span className="text-slate-500">Role</span>
                            <span className="font-semibold text-slate-950">{profile.role}</span>
                          </div>
                          {profile.createdAt ? (
                            <div className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                              <span className="text-slate-500">Created at</span>
                              <span className="font-semibold text-slate-950">{profile.createdAt}</span>
                            </div>
                          ) : null}
                          {typeof profile.isActive === "boolean" ? (
                            <div className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                              <span className="text-slate-500">Status</span>
                              <span className="font-semibold text-slate-950">
                                {profile.isActive ? "Active" : "Inactive"}
                              </span>
                            </div>
                          ) : null}
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-rose-200/80 bg-rose-50/70 shadow-xl shadow-rose-100/60 backdrop-blur">
                      <CardHeader>
                        <CardTitle className="text-rose-950">Danger zone</CardTitle>
                        <CardDescription className="text-rose-700/80">
                          Deleting your account requires admin approval.
                        </CardDescription>
                      </CardHeader>
                      <CardFooter className="flex-col items-stretch gap-4 md:flex-row md:justify-between">
                        <p className="text-sm text-rose-800/80">
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
                                {deleteProfileMutation.isPending ? "Deleting..." : "Confirm delete"}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </CardFooter>
                    </Card>
                  </div>
                ) : null}

                {activeTab === "security" ? (
                  <Card className="border-slate-200/80 bg-white/95 shadow-xl shadow-slate-200/60 backdrop-blur">
                    <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-slate-50 via-white to-sky-50">
                      <CardTitle>Security</CardTitle>
                      <CardDescription>
                        Change your password and secure your account.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-6 p-6 md:grid-cols-[0.92fr_1.08fr] md:p-8">
                      <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
                        <div className="flex items-center gap-3">
                          <div className="flex size-12 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-lg shadow-slate-200/60">
                            <ShieldCheck className="size-5" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-slate-500">Security controls</div>
                            <div className="text-lg font-semibold text-slate-950">Password change</div>
                          </div>
                        </div>
                        <div className="mt-5 space-y-3 text-sm text-slate-600">
                          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                            Use a strong password with at least 8 characters.
                          </div>
                          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                            Current password is required to confirm the change.
                          </div>
                        </div>
                      </div>

                      <form className="grid gap-4" onSubmit={handlePasswordChange}>
                        <Field>
                          <FieldLabel htmlFor="currentPassword">Current password</FieldLabel>
                          <Input
                            id="currentPassword"
                            type="password"
                            autoComplete="current-password"
                            value={passwordForm.currentPassword}
                            onChange={(event) =>
                              setPasswordForm((current) => ({
                                ...current,
                                currentPassword: event.target.value,
                              }))
                            }
                            className="bg-white"
                          />
                        </Field>
                        <Field>
                          <FieldLabel htmlFor="newPassword">New password</FieldLabel>
                          <Input
                            id="newPassword"
                            type="password"
                            autoComplete="new-password"
                            value={passwordForm.newPassword}
                            onChange={(event) =>
                              setPasswordForm((current) => ({
                                ...current,
                                newPassword: event.target.value,
                              }))
                            }
                            className="bg-white"
                          />
                        </Field>
                        <Field>
                          <FieldLabel htmlFor="confirmPassword">Confirm new password</FieldLabel>
                          <Input
                            id="confirmPassword"
                            type="password"
                            autoComplete="new-password"
                            value={passwordForm.confirmPassword}
                            onChange={(event) =>
                              setPasswordForm((current) => ({
                                ...current,
                                confirmPassword: event.target.value,
                              }))
                            }
                            className="bg-white"
                          />
                        </Field>
                        <Button type="submit" disabled={changePasswordMutation.isPending}>
                          {changePasswordMutation.isPending ? "Updating..." : "Update password"}
                        </Button>
                      </form>
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
