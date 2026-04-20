import { useMemo, useState } from "react";
import { useAuthStore } from "@/stores/auth/useAuthStore";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock, Plus, Search, Trash2, Pencil } from "lucide-react";
import { toast } from "sonner";
import {
  useCreateMedicalServiceMutation,
  useCreateServiceTypeMutation,
  useDeleteMedicalServiceMutation,
  useDeleteServiceTypeMutation,
  useMedicalServicesPageQuery,
  useSearchMedicalServicesQuery,
  useServiceTypesPageQuery,
  useUpdateMedicalServiceMutation,
  useUpdateServiceTypeMutation,
} from "@/services/medicalService/medicalService.queries";
import {
  SERVICE_CATEGORIES,
  type MedicalServiceRequest,
  type MedicalServiceResponse,
  type MedicalServiceUpdateRequest,
  type ServiceTypeRequest,
  type ServiceTypeResponse,
} from "@/services/medicalService/types";

const DEFAULT_SERVICE_FORM: MedicalServiceRequest = {
  serviceName: "",
  serviceCategory: "CIVIL",
  serviceTypeId: 0,
  participants: 2,
  executionTimeDays: 3,
  basePrice: 0,
  currentPrice: 0,
  isAvailable: true,
  serviceDescription: "",
  featureAssignments: [{ featureName: "", isAvailable: true }],
};

const toUpdatePayload = (
  form: MedicalServiceRequest,
): MedicalServiceUpdateRequest => ({
  serviceName: form.serviceName,
  serviceCategory: form.serviceCategory,
  serviceTypeId: form.serviceTypeId,
  participants: form.participants,
  executionTimeDays: form.executionTimeDays,
  basePrice: form.basePrice,
  currentPrice: form.currentPrice,
  isAvailable: form.isAvailable,
  serviceDescription: form.serviceDescription,
  editFeatureAssignments: form.featureAssignments,
});

const MedicalServiceManagementPage = () => {
  const accessToken = useAuthStore((state) => state.accessToken);

  const [activeTab, setActiveTab] = useState("services");
  const [servicePage, setServicePage] = useState(0);
  const [serviceTypePage, setServiceTypePage] = useState(0);
  const [search, setSearch] = useState("");

  const [serviceDialogOpen, setServiceDialogOpen] = useState(false);
  const [serviceTypeDialogOpen, setServiceTypeDialogOpen] = useState(false);

  const [editingService, setEditingService] =
    useState<MedicalServiceResponse | null>(null);
  const [editingServiceType, setEditingServiceType] =
    useState<ServiceTypeResponse | null>(null);

  const [serviceForm, setServiceForm] =
    useState<MedicalServiceRequest>(DEFAULT_SERVICE_FORM);
  const [serviceTypeForm, setServiceTypeForm] = useState<ServiceTypeRequest>({
    typeName: "",
    isActive: true,
  });

  const servicesPageQuery = useMedicalServicesPageQuery({
    page: servicePage,
    size: 10,
  });
  const servicesSearchQuery = useSearchMedicalServicesQuery(search, {
    page: servicePage,
    size: 10,
  });
  const serviceTypesPageQuery = useServiceTypesPageQuery({
    page: serviceTypePage,
    size: 10,
  });

  const serviceTypesForSelectQuery = useServiceTypesPageQuery({
    page: 0,
    size: 100,
  });

  const createServiceMutation = useCreateMedicalServiceMutation();
  const updateServiceMutation = useUpdateMedicalServiceMutation();
  const deleteServiceMutation = useDeleteMedicalServiceMutation();

  const createServiceTypeMutation = useCreateServiceTypeMutation();
  const updateServiceTypeMutation = useUpdateServiceTypeMutation();
  const deleteServiceTypeMutation = useDeleteServiceTypeMutation();

  const serviceResult = useMemo(
    () => (search.trim() ? servicesSearchQuery.data : servicesPageQuery.data),
    [search, servicesSearchQuery.data, servicesPageQuery.data],
  );

  const services = serviceResult?.content ?? [];
  const serviceTypes = serviceTypesPageQuery.data?.content ?? [];
  const serviceTypeOptions = serviceTypesForSelectQuery.data?.content ?? [];

  const resetServiceForm = () => {
    setServiceForm(DEFAULT_SERVICE_FORM);
    setEditingService(null);
  };

  const resetServiceTypeForm = () => {
    setServiceTypeForm({ typeName: "", isActive: true });
    setEditingServiceType(null);
  };

  const openEditService = (service: MedicalServiceResponse) => {
    setEditingService(service);
    setServiceForm({
      serviceName: service.serviceName,
      serviceCategory: service.serviceCategory,
      serviceTypeId: service.serviceTypeId,
      participants: service.participants,
      executionTimeDays: service.executionTimeDays,
      basePrice: Number(service.basePrice),
      currentPrice: Number(service.currentPrice),
      isAvailable: service.isAvailable,
      serviceDescription: service.serviceDescription,
      featureAssignments:
        service.features?.length > 0
          ? service.features.map((feature) => ({
              featureName: feature.featureName,
              isAvailable: feature.isAvailable,
            }))
          : [{ featureName: "", isAvailable: true }],
    });
    setServiceDialogOpen(true);
  };

  const openEditServiceType = (serviceType: ServiceTypeResponse) => {
    setEditingServiceType(serviceType);
    setServiceTypeForm({
      typeName: serviceType.typeName,
      isActive: serviceType.isActive,
    });
    setServiceTypeDialogOpen(true);
  };

  const handleSubmitService = async () => {
    if (!serviceForm.serviceName.trim() || !serviceForm.serviceTypeId) {
      toast.error("Vui lòng nhập tên dịch vụ và chọn loại dịch vụ");
      return;
    }

    const hasFeature = serviceForm.featureAssignments.some(
      (feature) => feature.featureName.trim().length > 0,
    );

    if (!hasFeature) {
      toast.error("Dịch vụ phải có ít nhất 1 feature");
      return;
    }

    try {
      if (editingService) {
        await updateServiceMutation.mutateAsync({
          id: editingService.id,
          payload: toUpdatePayload(serviceForm),
        });
        toast.success("Cập nhật dịch vụ thành công");
      } else {
        await createServiceMutation.mutateAsync(serviceForm);
        toast.success("Tạo dịch vụ thành công");
      }

      setServiceDialogOpen(false);
      resetServiceForm();
    } catch {
      toast.error("Không thể lưu dịch vụ");
    }
  };

  const handleDeleteService = async (id: number) => {
    if (!window.confirm("Bạn có chắc muốn xóa dịch vụ này?")) return;

    try {
      await deleteServiceMutation.mutateAsync(id);
      toast.success("Xóa dịch vụ thành công");
    } catch {
      toast.error("Không thể xóa dịch vụ");
    }
  };

  const handleSubmitServiceType = async () => {
    if (!serviceTypeForm.typeName.trim()) {
      toast.error("Vui lòng nhập tên loại dịch vụ");
      return;
    }

    try {
      if (editingServiceType) {
        await updateServiceTypeMutation.mutateAsync({
          id: editingServiceType.id,
          payload: serviceTypeForm,
        });
        toast.success("Cập nhật loại dịch vụ thành công");
      } else {
        await createServiceTypeMutation.mutateAsync(serviceTypeForm);
        toast.success("Tạo loại dịch vụ thành công");
      }

      setServiceTypeDialogOpen(false);
      resetServiceTypeForm();
    } catch {
      toast.error("Không thể lưu loại dịch vụ");
    }
  };

  const handleDeleteServiceType = async (id: number) => {
    if (!window.confirm("Bạn có chắc muốn xóa loại dịch vụ này?")) return;

    try {
      await deleteServiceTypeMutation.mutateAsync(id);
      toast.success("Xóa loại dịch vụ thành công");
    } catch {
      toast.error("Không thể xóa loại dịch vụ");
    }
  };

  if (!accessToken) {
    return (
      <SidebarProvider
        style={
          {
            "--sidebar-width": "calc(var(--spacing) * 72)",
            "--header-height": "calc(var(--spacing) * 12)",
          } as React.CSSProperties
        }
      >
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader />
          <div className="container mx-auto p-6">
            <div className="rounded-lg border border-muted p-8 text-center">
              <Lock className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <h2 className="mb-2 text-2xl font-semibold">
                Authentication Required
              </h2>
              <p className="text-muted-foreground">
                You need to sign in to access Medical Service Management.
              </p>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="container mx-auto space-y-6 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Medical Services Management
              </h1>
              <p className="text-muted-foreground">
                Quản trị dịch vụ và loại dịch vụ
              </p>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="services">Services</TabsTrigger>
              <TabsTrigger value="service-types">Service Types</TabsTrigger>
            </TabsList>

            <TabsContent value="services" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Danh sách dịch vụ</span>
                    <Dialog
                      open={serviceDialogOpen}
                      onOpenChange={(open) => {
                        setServiceDialogOpen(open);
                        if (!open) resetServiceForm();
                      }}
                    >
                      <DialogTrigger asChild>
                        <Button>
                          <Plus className="mr-2 h-4 w-4" />
                          Tạo dịch vụ
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-h-[85vh] max-w-3xl overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>
                            {editingService
                              ? "Cập nhật dịch vụ"
                              : "Tạo dịch vụ mới"}
                          </DialogTitle>
                        </DialogHeader>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Tên dịch vụ</Label>
                            <Input
                              value={serviceForm.serviceName}
                              onChange={(event) =>
                                setServiceForm((prev) => ({
                                  ...prev,
                                  serviceName: event.target.value,
                                }))
                              }
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>Loại dịch vụ</Label>
                            <Select
                              value={String(serviceForm.serviceTypeId || "")}
                              onValueChange={(value) =>
                                setServiceForm((prev) => ({
                                  ...prev,
                                  serviceTypeId: Number(value),
                                }))
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Chọn loại dịch vụ" />
                              </SelectTrigger>
                              <SelectContent>
                                {serviceTypeOptions.map((serviceType) => (
                                  <SelectItem
                                    key={serviceType.id}
                                    value={String(serviceType.id)}
                                  >
                                    {serviceType.typeName}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label>Danh mục</Label>
                            <Select
                              value={serviceForm.serviceCategory}
                              onValueChange={(value) =>
                                setServiceForm((prev) => ({
                                  ...prev,
                                  serviceCategory:
                                    value as (typeof SERVICE_CATEGORIES)[number],
                                }))
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {SERVICE_CATEGORIES.map((category) => (
                                  <SelectItem key={category} value={category}>
                                    {category}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label>Số người tham gia</Label>
                            <Input
                              type="number"
                              value={serviceForm.participants}
                              onChange={(event) =>
                                setServiceForm((prev) => ({
                                  ...prev,
                                  participants: Number(event.target.value || 0),
                                }))
                              }
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>Thời gian thực hiện (ngày)</Label>
                            <Input
                              type="number"
                              value={serviceForm.executionTimeDays}
                              onChange={(event) =>
                                setServiceForm((prev) => ({
                                  ...prev,
                                  executionTimeDays: Number(
                                    event.target.value || 0,
                                  ),
                                }))
                              }
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>Trạng thái</Label>
                            <Select
                              value={serviceForm.isAvailable ? "true" : "false"}
                              onValueChange={(value) =>
                                setServiceForm((prev) => ({
                                  ...prev,
                                  isAvailable: value === "true",
                                }))
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="true">Available</SelectItem>
                                <SelectItem value="false">
                                  Unavailable
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label>Giá gốc</Label>
                            <Input
                              type="number"
                              value={serviceForm.basePrice}
                              onChange={(event) =>
                                setServiceForm((prev) => ({
                                  ...prev,
                                  basePrice: Number(event.target.value || 0),
                                }))
                              }
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>Giá hiện tại</Label>
                            <Input
                              type="number"
                              value={serviceForm.currentPrice}
                              onChange={(event) =>
                                setServiceForm((prev) => ({
                                  ...prev,
                                  currentPrice: Number(event.target.value || 0),
                                }))
                              }
                            />
                          </div>
                        </div>

                        <div className="mt-4 space-y-2">
                          <Label>Mô tả dịch vụ</Label>
                          <Textarea
                            rows={3}
                            value={serviceForm.serviceDescription}
                            onChange={(event) =>
                              setServiceForm((prev) => ({
                                ...prev,
                                serviceDescription: event.target.value,
                              }))
                            }
                          />
                        </div>

                        <div className="mt-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <Label>Feature assignments</Label>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                setServiceForm((prev) => ({
                                  ...prev,
                                  featureAssignments: [
                                    ...prev.featureAssignments,
                                    { featureName: "", isAvailable: true },
                                  ],
                                }))
                              }
                            >
                              <Plus className="mr-2 h-4 w-4" />
                              Thêm feature
                            </Button>
                          </div>

                          {serviceForm.featureAssignments.map(
                            (feature, index) => (
                              <div
                                key={index}
                                className="grid grid-cols-[1fr_180px_48px] gap-2"
                              >
                                <Input
                                  placeholder="Feature name"
                                  value={feature.featureName}
                                  onChange={(event) =>
                                    setServiceForm((prev) => {
                                      const next = [...prev.featureAssignments];
                                      next[index] = {
                                        ...next[index],
                                        featureName: event.target.value,
                                      };
                                      return {
                                        ...prev,
                                        featureAssignments: next,
                                      };
                                    })
                                  }
                                />
                                <Select
                                  value={feature.isAvailable ? "true" : "false"}
                                  onValueChange={(value) =>
                                    setServiceForm((prev) => {
                                      const next = [...prev.featureAssignments];
                                      next[index] = {
                                        ...next[index],
                                        isAvailable: value === "true",
                                      };
                                      return {
                                        ...prev,
                                        featureAssignments: next,
                                      };
                                    })
                                  }
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="true">
                                      Available
                                    </SelectItem>
                                    <SelectItem value="false">
                                      Unavailable
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="icon"
                                  disabled={
                                    serviceForm.featureAssignments.length === 1
                                  }
                                  onClick={() =>
                                    setServiceForm((prev) => ({
                                      ...prev,
                                      featureAssignments:
                                        prev.featureAssignments.filter(
                                          (_, featureIndex) =>
                                            featureIndex !== index,
                                        ),
                                    }))
                                  }
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            ),
                          )}
                        </div>

                        <div className="mt-6 flex justify-end gap-2">
                          <Button
                            variant="outline"
                            onClick={() => {
                              setServiceDialogOpen(false);
                              resetServiceForm();
                            }}
                          >
                            Hủy
                          </Button>
                          <Button
                            onClick={handleSubmitService}
                            disabled={
                              createServiceMutation.isPending ||
                              updateServiceMutation.isPending
                            }
                          >
                            {editingService ? "Cập nhật" : "Tạo mới"}
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Search className="h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Tìm theo tên dịch vụ..."
                      value={search}
                      onChange={(event) => {
                        setSearch(event.target.value);
                        setServicePage(0);
                      }}
                    />
                  </div>

                  <div className="overflow-x-auto rounded-md border">
                    <table className="w-full text-sm">
                      <thead className="bg-muted/40">
                        <tr>
                          <th className="px-3 py-2 text-left">Name</th>
                          <th className="px-3 py-2 text-left">Category</th>
                          <th className="px-3 py-2 text-left">Type</th>
                          <th className="px-3 py-2 text-left">Price</th>
                          <th className="px-3 py-2 text-left">Status</th>
                          <th className="px-3 py-2 text-left">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {servicesPageQuery.isLoading ||
                        servicesSearchQuery.isLoading ? (
                          <tr>
                            <td
                              colSpan={6}
                              className="px-3 py-6 text-center text-muted-foreground"
                            >
                              Đang tải dữ liệu...
                            </td>
                          </tr>
                        ) : services.length === 0 ? (
                          <tr>
                            <td
                              colSpan={6}
                              className="px-3 py-6 text-center text-muted-foreground"
                            >
                              Không có dữ liệu dịch vụ
                            </td>
                          </tr>
                        ) : (
                          services.map((service) => (
                            <tr key={service.id} className="border-t">
                              <td className="px-3 py-2 font-medium">
                                {service.serviceName}
                              </td>
                              <td className="px-3 py-2">
                                {service.serviceCategory}
                              </td>
                              <td className="px-3 py-2">
                                {service.serviceTypeName}
                              </td>
                              <td className="px-3 py-2">
                                ${Number(service.currentPrice)}
                              </td>
                              <td className="px-3 py-2">
                                <Badge
                                  variant={
                                    service.isAvailable
                                      ? "default"
                                      : "secondary"
                                  }
                                >
                                  {service.isAvailable
                                    ? "Available"
                                    : "Unavailable"}
                                </Badge>
                              </td>
                              <td className="px-3 py-2">
                                <div className="flex items-center gap-2">
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => openEditService(service)}
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() =>
                                      handleDeleteService(service.id)
                                    }
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      Trang {(serviceResult?.pageNumber ?? 0) + 1} /{" "}
                      {serviceResult?.totalPages ?? 1}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={(serviceResult?.pageNumber ?? 0) <= 0}
                        onClick={() =>
                          setServicePage((prev) => Math.max(0, prev - 1))
                        }
                      >
                        Trước
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={serviceResult?.last ?? true}
                        onClick={() => setServicePage((prev) => prev + 1)}
                      >
                        Sau
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="service-types" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Danh sách loại dịch vụ</span>
                    <Dialog
                      open={serviceTypeDialogOpen}
                      onOpenChange={(open) => {
                        setServiceTypeDialogOpen(open);
                        if (!open) resetServiceTypeForm();
                      }}
                    >
                      <DialogTrigger asChild>
                        <Button>
                          <Plus className="mr-2 h-4 w-4" />
                          Tạo loại dịch vụ
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>
                            {editingServiceType
                              ? "Cập nhật loại dịch vụ"
                              : "Tạo loại dịch vụ mới"}
                          </DialogTitle>
                        </DialogHeader>

                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label>Tên loại dịch vụ</Label>
                            <Input
                              value={serviceTypeForm.typeName}
                              onChange={(event) =>
                                setServiceTypeForm((prev) => ({
                                  ...prev,
                                  typeName: event.target.value,
                                }))
                              }
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>Trạng thái</Label>
                            <Select
                              value={
                                serviceTypeForm.isActive ? "true" : "false"
                              }
                              onValueChange={(value) =>
                                setServiceTypeForm((prev) => ({
                                  ...prev,
                                  isActive: value === "true",
                                }))
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="true">Active</SelectItem>
                                <SelectItem value="false">Inactive</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="mt-6 flex justify-end gap-2">
                          <Button
                            variant="outline"
                            onClick={() => {
                              setServiceTypeDialogOpen(false);
                              resetServiceTypeForm();
                            }}
                          >
                            Hủy
                          </Button>
                          <Button
                            onClick={handleSubmitServiceType}
                            disabled={
                              createServiceTypeMutation.isPending ||
                              updateServiceTypeMutation.isPending
                            }
                          >
                            {editingServiceType ? "Cập nhật" : "Tạo mới"}
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="overflow-x-auto rounded-md border">
                    <table className="w-full text-sm">
                      <thead className="bg-muted/40">
                        <tr>
                          <th className="px-3 py-2 text-left">ID</th>
                          <th className="px-3 py-2 text-left">Type name</th>
                          <th className="px-3 py-2 text-left">Status</th>
                          <th className="px-3 py-2 text-left">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {serviceTypesPageQuery.isLoading ? (
                          <tr>
                            <td
                              colSpan={4}
                              className="px-3 py-6 text-center text-muted-foreground"
                            >
                              Đang tải dữ liệu...
                            </td>
                          </tr>
                        ) : serviceTypes.length === 0 ? (
                          <tr>
                            <td
                              colSpan={4}
                              className="px-3 py-6 text-center text-muted-foreground"
                            >
                              Không có loại dịch vụ
                            </td>
                          </tr>
                        ) : (
                          serviceTypes.map((serviceType) => (
                            <tr key={serviceType.id} className="border-t">
                              <td className="px-3 py-2">{serviceType.id}</td>
                              <td className="px-3 py-2 font-medium">
                                {serviceType.typeName}
                              </td>
                              <td className="px-3 py-2">
                                <Badge
                                  variant={
                                    serviceType.isActive
                                      ? "default"
                                      : "secondary"
                                  }
                                >
                                  {serviceType.isActive ? "Active" : "Inactive"}
                                </Badge>
                              </td>
                              <td className="px-3 py-2">
                                <div className="flex items-center gap-2">
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() =>
                                      openEditServiceType(serviceType)
                                    }
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() =>
                                      handleDeleteServiceType(serviceType.id)
                                    }
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      Trang {(serviceTypesPageQuery.data?.pageNumber ?? 0) + 1}{" "}
                      / {serviceTypesPageQuery.data?.totalPages ?? 1}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={
                          (serviceTypesPageQuery.data?.pageNumber ?? 0) <= 0
                        }
                        onClick={() =>
                          setServiceTypePage((prev) => Math.max(0, prev - 1))
                        }
                      >
                        Trước
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={serviceTypesPageQuery.data?.last ?? true}
                        onClick={() => setServiceTypePage((prev) => prev + 1)}
                      >
                        Sau
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default MedicalServiceManagementPage;
