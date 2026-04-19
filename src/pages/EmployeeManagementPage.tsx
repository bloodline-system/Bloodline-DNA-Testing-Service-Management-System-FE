import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { ArrowLeft, ArrowRight, BriefcaseBusiness, Clock3, Eye, Search, ShieldCheck, Trash2, UserCog, UsersRound } from 'lucide-react';

import LogoImage from '@/assets/toggle-logo.png';
import { Navbar } from '@/components/layout/home/navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useAdminRecentActivitiesQuery, useAdminDashboardStatsQuery } from '@/services/admin/adminDashboard.queries';
import {
  useAdminDeleteProfileMutation,
  useAdminProfileByUsernameQuery,
  useAdminProfilesQuery,
  useAdminUpdateProfileMutation,
  useAdminUpdateUserMutation,
  useAdminUsersQuery,
} from '@/services/admin/adminUser.queries';
import type { EmployeeAccountRole, EmployeeDetails, EmployeeProfile, EmployeeRole, EmployeeUserFilters } from '@/services/admin/types';
import { useStaffOrdersQuery, useStaffSampleCollectionsQuery, useStaffTestResultsQuery } from '@/services/staff/staffWork.queries';
import { useFetchMe } from '@/services/user/user.queries';
import { useAuthStore } from '@/stores/auth/useAuthStore';

const EMPLOYEE_MENU = [{ title: 'Home', url: '/' }];
const EMPLOYEE_AUTH = {
  login: { title: 'Sign In', url: '/sign-in' },
  signup: { title: 'Sign Up', url: '/sign-up' },
};

const initialFilters: EmployeeUserFilters = {
  page: 0,
  size: 8,
  sortBy: 'createdAt',
  sortDir: 'desc',
  search: '',
};

type DetailTab = 'overview' | 'profile' | 'work-history';

const EmployeeManagementPage = () => {
  const accessToken = useAuthStore((state) => state.accessToken);
  const meQuery = useFetchMe(Boolean(accessToken));
  const authProfile = meQuery.data?.data ?? null;

  const [filters, setFilters] = useState<EmployeeUserFilters>(initialFilters);
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeDetails | null>(null);
  const [activeTab, setActiveTab] = useState<DetailTab>('overview');
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const usersQuery = useAdminUsersQuery(filters);
  const profilesQuery = useAdminProfilesQuery(true);
  const statsQuery = useAdminDashboardStatsQuery(true);
  const recentActivitiesQuery = useAdminRecentActivitiesQuery(true);

  const usersPage = usersQuery.data?.data;
  const users = usersPage?.content ?? [];
  const profiles = profilesQuery.data?.data ?? [];
  const profileByUsername = useMemo(() => {
    const map = new Map<string, EmployeeProfile>();
    for (const p of profiles) {
      if (p.username) map.set(p.username, p);
    }
    return map;
  }, [profiles]);

  const displayUsers = useMemo(
    () => users.map((u) => mergeEmployeeWithProfile(u, profileByUsername.get(u.username))),
    [users, profileByUsername],
  );

  const selectedUsername = selectedEmployee?.username ?? null;
  const profileFromList = selectedUsername ? profileByUsername.get(selectedUsername) : undefined;
  const profileQuery = useAdminProfileByUsernameQuery(
    selectedUsername,
    Boolean(selectedUsername) && profileFromList === undefined,
  );

  const updateUserMutation = useAdminUpdateUserMutation();
  const updateProfileMutation = useAdminUpdateProfileMutation();
  const deleteProfileMutation = useAdminDeleteProfileMutation();

  const [workFilters, setWorkFilters] = useState({
    ordersPage: 0,
    testsPage: 0,
    samplesPage: 0,
    size: 5,
    sort: 'id,desc',
    status: '',
  });

  const staffOrdersQuery = useStaffOrdersQuery(
    {
      page: workFilters.ordersPage,
      size: workFilters.size,
      sort: workFilters.sort,
      status: workFilters.status || undefined,
    },
    Boolean(selectedEmployee)
  );
  const staffTestResultsQuery = useStaffTestResultsQuery(
    {
      page: workFilters.testsPage,
      size: workFilters.size,
      sort: workFilters.sort,
    },
    Boolean(selectedEmployee)
  );
  const staffSamplesQuery = useStaffSampleCollectionsQuery(
    {
      page: workFilters.samplesPage,
      size: workFilters.size,
      sort: workFilters.sort,
    },
    Boolean(selectedEmployee)
  );

  const selectedDisplay = useMemo(() => {
    if (!selectedEmployee) return null;
    const fromList = displayUsers.find((u) => u.id === selectedEmployee.id);
    return fromList ?? mergeEmployeeWithProfile(selectedEmployee, profileByUsername.get(selectedEmployee.username));
  }, [selectedEmployee, displayUsers, profileByUsername]);

  const selectedProfile = profileQuery.data?.data ?? profileFromList ?? null;

  const [profileForm, setProfileForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    dateOfBirth: '',
  });

  useEffect(() => {
    if (!selectedProfile) return;

    setProfileForm({
      firstName: selectedProfile.firstName ?? '',
      lastName: selectedProfile.lastName ?? '',
      email: selectedProfile.email ?? '',
      phoneNumber: selectedProfile.phoneNumber ?? '',
      dateOfBirth: selectedProfile.dateOfBirth ?? '',
    });
  }, [selectedProfile]);

  const handleAssignRole = async (role: EmployeeRole) => {
    if (!selectedEmployee) return;
    await updateUserMutation.mutateAsync({
      id: selectedEmployee.id,
      data: { role },
    });
  };

  const profileCount = useMemo(() => profilesQuery.data?.data?.length ?? 0, [profilesQuery.data?.data]);

  const statsData = {
    ...(usersPage?.stats ?? {}),
    ...(statsQuery.data?.data ?? {}),
  };
  const recentActivities = recentActivitiesQuery.data?.data ?? [];

  const handleSelectEmployee = (employee: EmployeeDetails) => {
    setSelectedEmployee(employee);
    setActiveTab('overview');
    setWorkFilters((current) => ({
      ...current,
      ordersPage: 0,
      testsPage: 0,
      samplesPage: 0,
    }));
  };

  const handleUpdateProfile = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedUsername) return;

    await updateProfileMutation.mutateAsync({
      username: selectedUsername,
      data: {
        firstName: profileForm.firstName.trim() || null,
        lastName: profileForm.lastName.trim() || null,
        email: profileForm.email.trim(),
        phoneNumber: profileForm.phoneNumber.trim() || null,
        dateOfBirth: profileForm.dateOfBirth.trim() || null,
      },
    });
  };

  const handleDelete = async () => {
    if (!selectedUsername) return;
    await deleteProfileMutation.mutateAsync(selectedUsername);
    setDeleteDialogOpen(false);
    setSelectedEmployee(null);
  };

  return (
    <main className="min-h-svh bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.16),_transparent_28%),radial-gradient(circle_at_top_right,_rgba(99,102,241,0.12),_transparent_24%),linear-gradient(180deg,_#f8fbff_0%,_#ffffff_42%,_#eef6ff_100%)] text-slate-900">
      <header className="sticky top-0 z-50 flex justify-center border-b border-white/70 bg-white/85 text-slate-900 backdrop-blur-xl">
        <Navbar
          className="flex w-11/12 justify-center py-3"
          inverted={false}
          logo={{
            url: '/',
            src: LogoImage,
            alt: 'Bloodline logo',
            title: 'Bloodline DNA',
          }}
          menu={EMPLOYEE_MENU}
          auth={EMPLOYEE_AUTH}
          profile={authProfile}
        />
      </header>

      <section className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-6 py-8 lg:px-10">
        <Card className="border-slate-200/80 bg-white/92 shadow-2xl shadow-slate-200/70 backdrop-blur">
          <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-slate-50 via-white to-sky-50/50">
            <CardTitle>Account overview &amp; recent activity</CardTitle>
            <CardDescription>Workforce metrics and the latest events from employee operations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8 p-6 md:p-8">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <StatCard
                icon={<UsersRound className="size-4" />}
                label="Total employees"
                value={String(toNumber(statsData.totalEmployees, usersPage?.totalElements ?? 0))}
              />
              <StatCard icon={<ShieldCheck className="size-4" />} label="Active" value={String(toNumber(statsData.activeEmployees))} />
              <StatCard icon={<UserCog className="size-4" />} label="Managers" value={String(toNumber(statsData.managerCount))} />
              <StatCard icon={<BriefcaseBusiness className="size-4" />} label="Profiles synced" value={String(profileCount)} />
            </div>

            <div className="border-t border-slate-200 pt-6">
              <div className="mb-4 flex items-center gap-2">
                <Clock3 className="size-4 text-slate-600" />
                <h3 className="text-sm font-semibold tracking-wide text-slate-900 uppercase">Recent activities</h3>
              </div>
              {recentActivitiesQuery.isLoading ? (
                <p className="text-sm text-slate-500">Loading activities…</p>
              ) : recentActivitiesQuery.isError ? (
                <p className="text-sm text-rose-600">Unable to load activities.</p>
              ) : recentActivities.length === 0 ? (
                <p className="text-sm text-slate-600">No activities available.</p>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {recentActivities.slice(0, 6).map((activity, index) => (
                    <div
                      key={String(activity.id ?? index)}
                      className="flex flex-col gap-1 rounded-xl border border-slate-200 bg-slate-50/90 px-4 py-3 shadow-sm transition-shadow hover:shadow-md"
                    >
                      <div className="text-sm font-medium leading-snug text-slate-900">
                        {String(activity.description ?? activity.action ?? 'Activity update')}
                      </div>
                      <div className="text-xs text-slate-500">{formatDate(activity.createdAt as string | undefined)}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 bg-white/90 shadow-lg shadow-slate-200/60 backdrop-blur">
          <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-sky-50 via-white to-indigo-50">
            <CardTitle>Employee filters</CardTitle>
            <CardDescription>Find staff by name/email, then open details to manage profile and work history.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 p-6 lg:grid-cols-[1.3fr_0.8fr_0.8fr_auto]">
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
              <Input
                className="pl-9"
                placeholder="Search name or email"
                value={filters.search}
                onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value, page: 0 }))}
              />
            </div>
            <select
              className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm"
              value={filters.sortBy}
              onChange={(event) => setFilters((current) => ({ ...current, sortBy: event.target.value, page: 0 }))}
            >
              <option value="createdAt">Sort by created date</option>
              <option value="id">Sort by ID</option>
              <option value="firstName">Sort by first name</option>
              <option value="email">Sort by email</option>
              <option value="role">Sort by role</option>
            </select>
            <select
              className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm"
              value={filters.sortDir}
              onChange={(event) => setFilters((current) => ({ ...current, sortDir: event.target.value as 'asc' | 'desc', page: 0 }))}
            >
              <option value="desc">Newest first</option>
              <option value="asc">Oldest first</option>
            </select>
            <Button type="button" variant="outline" onClick={() => setFilters(initialFilters)}>
              Reset
            </Button>
          </CardContent>
        </Card>

        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <section className="space-y-4">
            {usersQuery.isLoading ? (
              <StateCard text="Loading employees..." />
            ) : usersQuery.isError ? (
              <StateCard text="Unable to load employees. Please retry." />
            ) : displayUsers.length === 0 ? (
              <StateCard text="No employees found for current filters." />
            ) : (
              displayUsers.map((employee) => {
                const isSelected = selectedEmployee?.id === employee.id;
                const profile = profileByUsername.get(employee.username);
                return (
                  <Card
                    key={employee.id}
                    className={`border transition-all ${isSelected ? 'border-sky-400 shadow-xl shadow-sky-100' : 'border-slate-200/80 shadow-md shadow-slate-100 hover:-translate-y-0.5 hover:shadow-lg'}`}
                  >
                    <CardHeader className="space-y-2 border-b border-slate-100 bg-gradient-to-r from-white via-slate-50 to-sky-50/60">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <CardTitle className="text-lg text-slate-950">{getEmployeeName(employee, profile)}</CardTitle>
                          <CardDescription>@{employee.username}</CardDescription>
                        </div>
                        <div
                          className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide shadow-sm ${roleBadgeClass(employee.role)}`}
                        >
                          {formatRoleLabel(employee.role)}
                        </div>
                      </div>
                      <div className="text-sm text-slate-600">{employee.email || '—'}</div>
                    </CardHeader>
                    <CardContent className="space-y-4 p-5">
                      <div className="flex flex-wrap gap-2 text-xs text-slate-500">
                        <span>Phone: {employee.phone || 'N/A'}</span>
                        <span>Status: {employee.active ? 'Active' : 'Inactive'}</span>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <Button variant="outline" onClick={() => handleSelectEmployee(employee)}>
                          <Eye className="mr-2 size-4" />
                          View
                        </Button>
                        <Button
                          variant="outline"
                          onClick={async () => {
                            handleSelectEmployee(employee);
                            await updateUserMutation.mutateAsync({
                              id: employee.id,
                              data: { active: !employee.active },
                            });
                          }}
                          disabled={updateUserMutation.isPending}
                        >
                          {employee.active ? 'Disable' : 'Enable'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}

            <div className="flex items-center justify-between gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setFilters((current) => ({ ...current, page: Math.max(0, current.page - 1) }))}
                disabled={filters.page === 0}
              >
                <ArrowLeft className="mr-2 size-4" />
                Previous
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  setFilters((current) => ({
                    ...current,
                    page: Math.min(Math.max((usersPage?.totalPages ?? 1) - 1, 0), current.page + 1),
                  }))
                }
                disabled={filters.page >= Math.max((usersPage?.totalPages ?? 1) - 1, 0)}
              >
                Next
                <ArrowRight className="ml-2 size-4" />
              </Button>
            </div>
          </section>

          <aside className="space-y-4">
            <Card className="sticky top-24 border-slate-200/80 bg-white/95 shadow-xl shadow-slate-200/70 backdrop-blur">
              <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-indigo-50 via-white to-sky-50">
                <CardTitle>Employee detail panel</CardTitle>
                <CardDescription>
                  {selectedDisplay
                    ? `Managing ${getEmployeeName(selectedDisplay, profileByUsername.get(selectedDisplay.username))}`
                    : 'Select an employee card to start.'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 p-5">
                {!selectedEmployee ? (
                  <p className="text-sm text-slate-500">Select an employee from the left panel.</p>
                ) : (
                  <>
                    <div className="flex flex-wrap gap-2">
                      <TabButton label="Overview" active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
                      <TabButton label="Profile" active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} />
                      <TabButton label="Work history" active={activeTab === 'work-history'} onClick={() => setActiveTab('work-history')} />
                    </div>

                    {activeTab === 'overview' && selectedDisplay ? (
                      <div className="space-y-3">
                        <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm">
                          <InfoRow label="Username" value={selectedDisplay.username} />
                          <InfoRow label="Display name" value={getEmployeeName(selectedDisplay, profileByUsername.get(selectedDisplay.username))} />
                          <InfoRow label="Email" value={selectedDisplay.email || '—'} />
                          <InfoRow label="Phone" value={selectedDisplay.phone || '—'} />
                          <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white px-3 py-2">
                            <span className="text-slate-500">Role</span>
                            <span
                              className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide ${roleBadgeClass(selectedDisplay.role)}`}
                            >
                              {formatRoleLabel(selectedDisplay.role)}
                            </span>
                          </div>
                          <InfoRow label="Status" value={selectedDisplay.active ? 'Active' : 'Inactive'} />
                        </div>

                        {selectedDisplay.role === 'ADMIN' ? (
                          <p className="text-xs text-slate-500">Admin role cannot be changed from this screen.</p>
                        ) : (
                          <div className="space-y-2 rounded-2xl border border-slate-200 bg-white p-4 text-sm">
                            <div className="text-xs font-semibold tracking-wide text-slate-600 uppercase">Assign role</div>
                            <p className="text-xs text-slate-500">Sends a JSON body with only the role field to the dashboard user endpoint.</p>
                            <div className="flex flex-wrap gap-2">
                              <Button
                                type="button"
                                size="sm"
                                variant={selectedDisplay.role === 'STAFF' ? 'default' : 'outline'}
                                disabled={updateUserMutation.isPending || selectedDisplay.role === 'STAFF'}
                                onClick={() => void handleAssignRole('STAFF')}
                              >
                                Set STAFF
                              </Button>
                              <Button
                                type="button"
                                size="sm"
                                variant={selectedDisplay.role === 'MANAGER' ? 'default' : 'outline'}
                                disabled={updateUserMutation.isPending || selectedDisplay.role === 'MANAGER'}
                                onClick={() => void handleAssignRole('MANAGER')}
                              >
                                Set MANAGER
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : null}

                    {activeTab === 'profile' ? (
                      <form className="space-y-3" onSubmit={handleUpdateProfile}>
                        <Input
                          placeholder="First name"
                          value={profileForm.firstName}
                          onChange={(event) => setProfileForm((current) => ({ ...current, firstName: event.target.value }))}
                        />
                        <Input
                          placeholder="Last name"
                          value={profileForm.lastName}
                          onChange={(event) => setProfileForm((current) => ({ ...current, lastName: event.target.value }))}
                        />
                        <Input
                          placeholder="Email"
                          value={profileForm.email}
                          onChange={(event) => setProfileForm((current) => ({ ...current, email: event.target.value }))}
                        />
                        <Input
                          placeholder="Phone number"
                          value={profileForm.phoneNumber}
                          onChange={(event) => setProfileForm((current) => ({ ...current, phoneNumber: event.target.value }))}
                        />
                        <Input
                          type="date"
                          value={profileForm.dateOfBirth}
                          onChange={(event) => setProfileForm((current) => ({ ...current, dateOfBirth: event.target.value }))}
                        />
                        <Button type="submit" className="w-full" disabled={updateProfileMutation.isPending}>
                          {updateProfileMutation.isPending ? 'Updating...' : 'Update profile'}
                        </Button>
                        <Button
                          type="button"
                          variant="destructive"
                          className="w-full"
                          onClick={() => setDeleteDialogOpen(true)}
                          disabled={deleteProfileMutation.isPending}
                        >
                          <Trash2 className="mr-2 size-4" />
                          Delete profile
                        </Button>
                      </form>
                    ) : null}

                    {activeTab === 'work-history' ? (
                      <div className="space-y-3">
                        <div className="grid gap-2 sm:grid-cols-2">
                          <Input
                            placeholder="Status (orders only)"
                            value={workFilters.status}
                            onChange={(event) =>
                              setWorkFilters((current) => ({
                                ...current,
                                status: event.target.value,
                                ordersPage: 0,
                              }))
                            }
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() =>
                              setWorkFilters((current) => ({
                                ...current,
                                status: '',
                                ordersPage: 0,
                                testsPage: 0,
                                samplesPage: 0,
                              }))
                            }
                          >
                            Reset history filters
                          </Button>
                        </div>

                        <HistoryCard
                          title="Orders"
                          loading={staffOrdersQuery.isLoading}
                          rows={staffOrdersQuery.data?.data?.content}
                          page={workFilters.ordersPage}
                          totalPages={staffOrdersQuery.data?.data?.totalPages ?? 0}
                          onPrev={() =>
                            setWorkFilters((current) => ({
                              ...current,
                              ordersPage: Math.max(0, current.ordersPage - 1),
                            }))
                          }
                          onNext={() =>
                            setWorkFilters((current) => ({
                              ...current,
                              ordersPage: Math.min(Math.max((staffOrdersQuery.data?.data?.totalPages ?? 1) - 1, 0), current.ordersPage + 1),
                            }))
                          }
                        />
                        <HistoryCard
                          title="Test results"
                          loading={staffTestResultsQuery.isLoading}
                          rows={staffTestResultsQuery.data?.data?.content}
                          page={workFilters.testsPage}
                          totalPages={staffTestResultsQuery.data?.data?.totalPages ?? 0}
                          onPrev={() =>
                            setWorkFilters((current) => ({
                              ...current,
                              testsPage: Math.max(0, current.testsPage - 1),
                            }))
                          }
                          onNext={() =>
                            setWorkFilters((current) => ({
                              ...current,
                              testsPage: Math.min(Math.max((staffTestResultsQuery.data?.data?.totalPages ?? 1) - 1, 0), current.testsPage + 1),
                            }))
                          }
                        />
                        <HistoryCard
                          title="Sample collections"
                          loading={staffSamplesQuery.isLoading}
                          rows={staffSamplesQuery.data?.data?.content}
                          page={workFilters.samplesPage}
                          totalPages={staffSamplesQuery.data?.data?.totalPages ?? 0}
                          onPrev={() =>
                            setWorkFilters((current) => ({
                              ...current,
                              samplesPage: Math.max(0, current.samplesPage - 1),
                            }))
                          }
                          onNext={() =>
                            setWorkFilters((current) => ({
                              ...current,
                              samplesPage: Math.min(Math.max((staffSamplesQuery.data?.data?.totalPages ?? 1) - 1, 0), current.samplesPage + 1),
                            }))
                          }
                        />
                      </div>
                    ) : null}
                  </>
                )}
              </CardContent>
            </Card>
          </aside>
        </div>
      </section>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete employee profile</DialogTitle>
            <DialogDescription>This action removes profile data for `{selectedUsername ?? 'unknown'}` and cannot be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button type="button" variant="destructive" onClick={() => void handleDelete()} disabled={deleteProfileMutation.isPending}>
              {deleteProfileMutation.isPending ? 'Deleting...' : 'Confirm delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
};

const TabButton = ({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) => (
  <Button type="button" variant={active ? 'default' : 'outline'} size="sm" onClick={onClick}>
    {label}
  </Button>
);

const StateCard = ({ text }: { text: string }) => (
  <Card className="border-slate-200/80 bg-white/90 shadow-lg shadow-slate-200/60 backdrop-blur">
    <CardContent className="py-10 text-center text-slate-600">{text}</CardContent>
  </Card>
);

const StatCard = ({ icon, label, value }: { icon: ReactNode; label: string; value: string }) => (
  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
    <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-500">
      {icon}
      {label}
    </div>
    <div className="mt-2 text-2xl font-semibold text-slate-950">{value}</div>
  </div>
);

const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white px-3 py-2">
    <span className="text-slate-500">{label}</span>
    <span className="font-semibold text-slate-900">{value}</span>
  </div>
);

const HistoryCard = ({
  title,
  rows,
  loading,
  page,
  totalPages,
  onPrev,
  onNext,
}: {
  title: string;
  rows: Array<Record<string, unknown>> | undefined;
  loading: boolean;
  page: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
}) => (
  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
    <div className="mb-2 text-sm font-semibold text-slate-900">{title}</div>
    {loading ? (
      <p className="text-xs text-slate-500">Loading...</p>
    ) : !rows?.length ? (
      <p className="text-xs text-slate-500">No records found.</p>
    ) : (
      <div className="space-y-2">
        {rows.slice(0, 3).map((row, index) => (
          <div
            key={String(row.id ?? row.orderId ?? row.testResultId ?? row.collectionId ?? index)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs"
          >
            <div className="font-medium text-slate-900">{String(row.status ?? 'Updated')}</div>
            <div className="text-slate-500">{formatDate((row.updatedAt as string | undefined) ?? (row.createdAt as string | undefined))}</div>
          </div>
        ))}
      </div>
    )}
    <div className="mt-3 flex items-center justify-between">
      <Button size="sm" variant="outline" onClick={onPrev} disabled={page <= 0}>
        Prev
      </Button>
      <span className="text-xs text-slate-500">
        {page + 1}/{Math.max(totalPages, 1)}
      </span>
      <Button size="sm" variant="outline" onClick={onNext} disabled={page >= Math.max(totalPages - 1, 0)}>
        Next
      </Button>
    </div>
  </div>
);

function normalizeProfileRole(role: string | undefined | null): EmployeeAccountRole | null {
  if (!role || typeof role !== 'string') return null;
  const r = role.toUpperCase().replace(/^ROLE_/, '');
  if (r === 'ADMIN') return 'ADMIN';
  if (r === 'MANAGER') return 'MANAGER';
  return 'STAFF';
}

function mergeEmployeeWithProfile(employee: EmployeeDetails, profile: EmployeeProfile | undefined): EmployeeDetails {
  if (!profile) return employee;
  const profileRole = normalizeProfileRole(profile.role);
  return {
    ...employee,
    role: profileRole ?? employee.role,
    firstName: profile.firstName ?? employee.firstName,
    lastName: profile.lastName ?? employee.lastName,
    email: (profile.email ?? employee.email) || '',
    phone: profile.phoneNumber ?? employee.phone,
    active: profile.active ?? profile.isActive ?? employee.active,
    profileImageUrl: profile.profileImageUrl ?? employee.profileImageUrl,
    dateOfBirth: profile.dateOfBirth ?? employee.dateOfBirth,
  };
}

function formatRoleLabel(role: EmployeeAccountRole): string {
  if (role === 'ADMIN') return 'Admin';
  if (role === 'MANAGER') return 'Manager';
  return 'Staff';
}

function roleBadgeClass(role: EmployeeAccountRole): string {
  if (role === 'ADMIN') return 'border-rose-200 bg-rose-50 text-rose-800';
  if (role === 'MANAGER') return 'border-violet-200 bg-violet-50 text-violet-800';
  return 'border-slate-200 bg-white text-slate-600';
}

const getEmployeeName = (employee: EmployeeDetails, profile?: EmployeeProfile) => {
  if (profile?.fullName?.trim()) return profile.fullName.trim();
  const fullName = [employee.firstName, employee.lastName].filter(Boolean).join(' ').trim();
  return fullName || employee.username;
};

const toNumber = (value: unknown, fallback = 0): number => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
};

const formatDate = (input?: string) => {
  if (!input) return 'No timestamp';
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) return input;
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export default EmployeeManagementPage;
