import { useMemo, useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router";
import {
  ArrowLeft,
  Calendar,
  CreditCard,
  MapPin,
  Plus,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useTestKits } from "@/services/testKit/testKit.queries";
import {
  useAcceptCustomerOrderMutation,
  useCancelCustomerOrderMutation,
  useCreateCustomerOrderMutation,
  useCustomerOrderFormDataQuery,
  useCustomerServicesQuery,
  useOrderDetailByCustomerQuery,
} from "@/services/order/order.queries";
import { getOrderStatusLabel } from "@/services/order/customerOrdersService";
import {
  getCurrentStepIndex,
  workflowSteps,
} from "@/services/order/orderWorkflowService";

const paymentMethodOptions = [
  { value: "BANK_TRANSFER", label: "Chuyển khoản ngân hàng" },
  { value: "CASH", label: "Tiền mặt" },
  { value: "CREDIT_CARD", label: "Thẻ tín dụng" },
  { value: "DEBIT_CARD", label: "Thẻ ghi nợ" },
  { value: "MOMO", label: "MoMo" },
  { value: "VIETTEL_MONEY", label: "Viettel Money" },
  { value: "VNPAY", label: "VNPay" },
  { value: "ZALO_PAY", label: "Zalo Pay" },
];

const collectionTypeLabels: Record<string, string> = {
  HOME_COLLECTION: "Thu thập tại nhà",
  LAB_VISIT: "Đến phòng xét nghiệm",
};

const formatDateTime = (value?: string | null) => {
  if (!value) return "N/A";

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString("vi-VN");
};

const getCollectionTypeValue = (
  option: string | { name?: string; [key: string]: unknown },
) => (typeof option === "string" ? option : option.name || String(option));

const getCollectionTypeLabel = (
  option:
    | string
    | { name?: string; description?: string; [key: string]: unknown },
) => {
  const value = getCollectionTypeValue(option);
  if (typeof option !== "string" && option.description) {
    return option.description;
  }

  return collectionTypeLabels[value] ?? value;
};

const genderOptions = ["Male", "Female", "Other"];

type ParticipantFormRow = {
  id: string;
  firstName: string;
  lastName: string;
  gender: string;
  birthDate: string;
};

const createParticipantRow = (): ParticipantFormRow => ({
  id: crypto.randomUUID(),
  firstName: "",
  lastName: "",
  gender: "Male",
  birthDate: "",
});

const OrderWorkflowPage = () => {
  const { id } = useParams<{ id: string }>();

  if (!id || id === "new") {
    return <OrderCreationForm />;
  }

  return <OrderDetailPage orderId={Number(id)} />;
};

const OrderDetailPage = ({ orderId }: { orderId: number }) => {
  const navigate = useNavigate();
  const {
    data: orderData,
    isLoading,
    error,
  } = useOrderDetailByCustomerQuery(orderId);
  const acceptOrderMutation = useAcceptCustomerOrderMutation();
  const cancelOrderMutation = useCancelCustomerOrderMutation();

  const order = orderData?.data?.orderDetails;
  const kits = orderData?.data?.orderTestKits ?? [];
  const participants = orderData?.data?.orderParticipants ?? [];
  const paymentTotal = orderData?.data?.paymentTotal ?? 0;
  const existingFeedback = orderData?.data?.existingFeedback ?? null;

  const currentStepIndex = useMemo(
    () => getCurrentStepIndex(order?.orderStatus),
    [order?.orderStatus],
  );

  const canAct =
    !!order &&
    !["COMPLETED", "CANCELLED"].includes(
      (order.orderStatus ?? "").toUpperCase(),
    );

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex h-96 items-center justify-center">
          <p className="text-lg text-gray-600">
            Đang tải thông tin đơn hàng...
          </p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="container mx-auto p-6">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-800">
              Không thể tải thông tin đơn hàng. Vui lòng thử lại.
            </p>
            <Button
              variant="outline"
              onClick={() => navigate("/")}
              className="mt-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Quay lại trang chủ
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleAcceptOrder = () => {
    acceptOrderMutation.mutate(orderId);
  };

  const handleCancelOrder = () => {
    if (window.confirm("Bạn có chắc muốn hủy đơn hàng này không?")) {
      cancelOrderMutation.mutate(orderId);
    }
  };

  return (
    <div className="container mx-auto space-y-6 p-6">
      <div className="flex flex-wrap items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => navigate("/")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Quay lại trang chủ
        </Button>
        <div className="min-w-0 flex-1">
          <h1 className="text-3xl font-bold tracking-tight">
            Quy trình đơn hàng #{order.idServiceOrder}
          </h1>
          <p className="mt-1 text-gray-600">
            Theo dõi tiến trình và thông tin chi tiết của đơn hàng
          </p>
        </div>
        {canAct ? (
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={handleCancelOrder}
              disabled={cancelOrderMutation.isPending}
            >
              Hủy đơn
            </Button>
            <Button
              onClick={handleAcceptOrder}
              disabled={acceptOrderMutation.isPending}
            >
              Xác nhận đơn
            </Button>
          </div>
        ) : null}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Thông tin đơn hàng
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <Label className="text-sm font-medium text-gray-600">
                  Mã đơn hàng
                </Label>
                <p className="text-lg font-semibold">#{order.idServiceOrder}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">
                  Trạng thái
                </Label>
                <div className="mt-1">
                  <Badge variant="secondary">
                    {getOrderStatusLabel(order.orderStatus)}
                  </Badge>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">
                  Loại xét nghiệm
                </Label>
                <p>{order.medicalServiceName || "N/A"}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">
                  Tổng tiền
                </Label>
                <p className="text-lg font-semibold text-green-600">
                  ${paymentTotal || 0}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">
                  Ngày hẹn
                </Label>
                <p className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {formatDateTime(order.appointmentDate)}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">
                  Loại thu thập
                </Label>
                <p>{order.collectionType || "N/A"}</p>
              </div>
            </div>

            {order.collectionAddress ? (
              <div>
                <Label className="flex items-center gap-2 text-sm font-medium text-gray-600">
                  <MapPin className="h-4 w-4" />
                  Địa chỉ thu thập mẫu
                </Label>
                <p className="mt-1">{order.collectionAddress}</p>
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Thanh toán
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between gap-4">
                <span className="text-gray-600">Trạng thái thanh toán</span>
                <Badge variant="outline">Đã tạo</Badge>
              </div>
              <div className="flex justify-between gap-4 font-semibold">
                <span>Tổng cộng</span>
                <span className="text-green-600">${paymentTotal || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Test Kits</CardTitle>
        </CardHeader>
        <CardContent>
          {kits.length > 0 ? (
            <div className="space-y-3">
              {kits.map((kit) => (
                <div
                  key={kit.id}
                  className="flex items-center justify-between border-b pb-2 last:border-b-0 last:pb-0"
                >
                  <span>
                    {kit.kitName} (x{kit.quantityOrdered})
                  </span>
                  <span>${kit.totalPrice}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">Chưa có bộ kit nào</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Participants</CardTitle>
        </CardHeader>
        <CardContent>
          {participants.length > 0 ? (
            <div className="space-y-3">
              {participants.map((participant, index) => (
                <div
                  key={`${participant.firstName}-${participant.lastName}-${index}`}
                  className="rounded-lg border p-3"
                >
                  <p className="font-medium">
                    {participant.firstName} {participant.lastName}
                  </p>
                  <p className="text-sm text-gray-600">
                    {participant.gender},{" "}
                    {formatDateTime(participant.dateBirth)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">Chưa có người tham gia</p>
          )}
        </CardContent>
      </Card>

      {existingFeedback ? (
        <Card>
          <CardHeader>
            <CardTitle>Phản hồi của khách hàng</CardTitle>
            <CardDescription>
              Thông tin phản hồi đã được gửi cho đơn hàng này
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge variant="secondary">
                {existingFeedback.feedbackTitle}
              </Badge>
              <span className="text-sm text-gray-600">
                {existingFeedback.overallRating}/5
              </span>
            </div>
            <p className="text-gray-700">{existingFeedback.feedbackContent}</p>
            {existingFeedback.responseContent ? (
              <div className="rounded-lg border bg-gray-50 p-4">
                <p className="text-sm font-medium text-gray-700">
                  Phản hồi từ hệ thống
                </p>
                <p className="mt-1 text-sm text-gray-600">
                  {existingFeedback.responseContent}
                </p>
              </div>
            ) : null}
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Tiến trình xử lý</CardTitle>
          <CardDescription>
            Theo dõi các bước xử lý đơn hàng từ đầu đến cuối
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {workflowSteps.map((step, index) => {
              const isCompleted = index <= currentStepIndex;
              const isCurrent = index === currentStepIndex;
              const Icon = step.icon;

              return (
                <div key={step.status} className="flex items-start gap-4">
                  <div
                    className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${isCompleted ? step.color + " text-white" : "bg-gray-200 text-gray-400"}`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3
                        className={`font-semibold ${isCompleted ? "text-gray-900" : "text-gray-500"}`}
                      >
                        {step.label}
                      </h3>
                      {isCurrent ? (
                        <Badge
                          variant="secondary"
                          className="bg-blue-100 text-blue-800"
                        >
                          Đang xử lý
                        </Badge>
                      ) : null}
                    </div>
                    <p
                      className={`mt-1 text-sm ${isCompleted ? "text-gray-700" : "text-gray-500"}`}
                    >
                      {step.description}
                    </p>
                    {index < workflowSteps.length - 1 ? (
                      <div
                        className={`mt-4 h-px w-full ${index < currentStepIndex ? "bg-green-300" : "bg-gray-200"}`}
                      />
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const OrderCreationForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    medicalServiceId: "",
    appointmentDate: "",
    collectionType: "",
    collectionAddress: "",
    paymentMethod: "CASH",
    selectedKitId: "",
    quantityKit: 1,
    participants: [createParticipantRow()],
  });

  const { data: servicesData, isLoading: servicesLoading } =
    useCustomerServicesQuery();
  const selectedMedicalServiceId = formData.medicalServiceId
    ? Number(formData.medicalServiceId)
    : null;
  const { data: orderFormData, isLoading: formDataLoading } =
    useCustomerOrderFormDataQuery(selectedMedicalServiceId);
  const { data: testKitsData, isLoading: kitsLoading } = useTestKits(
    0,
    100,
    true,
  );
  const createOrderMutation = useCreateCustomerOrderMutation();

  const services = servicesData?.data ?? [];
  const selectedService = services.find(
    (service) => service.id.toString() === formData.medicalServiceId,
  );
  const collectionTypes = orderFormData?.data?.collectionTypes ?? [];
  const kits = testKitsData?.content ?? [];
  const serviceSubtotal = Number(selectedService?.currentPrice ?? 0);
  const selectedKit = kits.find(
    (kit) => kit.id.toString() === formData.selectedKitId,
  );
  const kitSubtotal =
    (selectedKit?.currentPrice ?? 0) * Number(formData.quantityKit || 0);
  const displayedTotal = serviceSubtotal + kitSubtotal;

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
      ...(field === "medicalServiceId" ? { collectionType: "" } : {}),
    }));
  };

  const handleParticipantChange = (
    index: number,
    field: "firstName" | "lastName" | "gender" | "birthDate",
    value: string,
  ) => {
    setFormData((prev) => {
      const nextParticipants = [...prev.participants];
      nextParticipants[index] = {
        ...nextParticipants[index],
        [field]: value,
      };
      return { ...prev, participants: nextParticipants };
    });
  };

  const addParticipantRow = () => {
    setFormData((prev) => ({
      ...prev,
      participants: [...prev.participants, createParticipantRow()],
    }));
  };

  const removeParticipantRow = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      participants:
        prev.participants.length > 1
          ? prev.participants.filter(
              (_, participantIndex) => participantIndex !== index,
            )
          : prev.participants,
    }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (
      !formData.medicalServiceId ||
      !formData.appointmentDate ||
      !formData.collectionType ||
      !formData.collectionAddress ||
      !formData.paymentMethod ||
      !formData.selectedKitId ||
      !formData.quantityKit ||
      formData.participants.some(
        (participant) =>
          !participant.firstName.trim() ||
          !participant.lastName.trim() ||
          !participant.gender.trim() ||
          !participant.birthDate,
      )
    ) {
      window.alert(
        "Vui lòng điền đầy đủ thông tin đơn hàng, kit và participants",
      );
      return;
    }

    createOrderMutation.mutate(
      {
        idMedicalService: Number(formData.medicalServiceId),
        appointmentDate: formData.appointmentDate,
        collectionType: formData.collectionType,
        collectionAddress: formData.collectionAddress,
        paymentMethod: formData.paymentMethod,
        paymentStatus: "PENDING",
        idKit: formData.selectedKitId,
        quantityKit: Number(formData.quantityKit),
        participants: formData.participants.map((participant) => ({
          firstName: participant.firstName,
          lastName: participant.lastName,
          gender: participant.gender,
          birthDate: participant.birthDate,
        })),
      },
      {
        onSuccess: (response) => {
          const createdOrderId = response?.data?.idServiceOrder;
          if (createdOrderId) {
            navigate(`/order-workflow/${createdOrderId}`);
          }
        },
      },
    );
  };

  const isLoading = servicesLoading || formDataLoading;
  const isKitLoading = kitsLoading;

  return (
    <div className="container mx-auto space-y-6 p-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => navigate("/")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Quay lại trang chủ
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Đặt dịch vụ xét nghiệm
          </h1>
          <p className="mt-1 text-gray-600">
            Tạo đơn hàng mới theo đúng API của customer controller
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Thông tin đơn hàng
          </CardTitle>
          <CardDescription>
            Chọn dịch vụ, thời gian và thông tin thu thập mẫu để tạo đơn hàng
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-10 text-center text-gray-600">
              Đang tải dữ liệu dịch vụ...
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="medicalServiceId">Dịch vụ y tế</Label>
                  <Select
                    value={formData.medicalServiceId}
                    onValueChange={(value) =>
                      handleInputChange("medicalServiceId", value)
                    }
                  >
                    <SelectTrigger id="medicalServiceId">
                      <SelectValue placeholder="Chọn dịch vụ" />
                    </SelectTrigger>
                    <SelectContent>
                      {services.map((service) => (
                        <SelectItem
                          key={service.id}
                          value={service.id.toString()}
                        >
                          {service.serviceName}
                          {service.currentPrice != null
                            ? ` - $${service.currentPrice}`
                            : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="appointmentDate">Ngày hẹn</Label>
                  <Input
                    id="appointmentDate"
                    type="datetime-local"
                    value={formData.appointmentDate}
                    onChange={(event) =>
                      handleInputChange("appointmentDate", event.target.value)
                    }
                  />
                </div>
              </div>

              {selectedService ? (
                <div className="rounded-lg border bg-gray-50 p-4">
                  <p className="text-sm font-medium text-gray-700">
                    {selectedService.serviceName}
                  </p>
                  <p className="mt-1 text-sm text-gray-600">
                    {selectedService.serviceDescription || "Chưa có mô tả"}
                  </p>
                  {selectedService.currentPrice != null ? (
                    <p className="mt-2 text-sm font-semibold text-green-600">
                      Giá: ${selectedService.currentPrice}
                    </p>
                  ) : null}
                </div>
              ) : null}

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="collectionType">Loại thu thập</Label>
                  <Select
                    value={formData.collectionType}
                    onValueChange={(value) =>
                      handleInputChange("collectionType", value)
                    }
                    disabled={!selectedMedicalServiceId}
                  >
                    <SelectTrigger id="collectionType">
                      <SelectValue placeholder="Chọn loại thu thập" />
                    </SelectTrigger>
                    <SelectContent>
                      {collectionTypes.map((collectionType) => {
                        const value = getCollectionTypeValue(collectionType);
                        return (
                          <SelectItem key={value} value={value}>
                            {getCollectionTypeLabel(collectionType)}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="paymentMethod">Phương thức thanh toán</Label>
                  <Select
                    value={formData.paymentMethod}
                    onValueChange={(value) =>
                      handleInputChange("paymentMethod", value)
                    }
                  >
                    <SelectTrigger id="paymentMethod">
                      <SelectValue placeholder="Chọn phương thức thanh toán" />
                    </SelectTrigger>
                    <SelectContent>
                      {paymentMethodOptions.map((method) => (
                        <SelectItem key={method.value} value={method.value}>
                          {method.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="collectionAddress">Địa chỉ thu thập mẫu</Label>
                <Textarea
                  id="collectionAddress"
                  placeholder="Nhập địa chỉ chi tiết để thu thập mẫu"
                  value={formData.collectionAddress}
                  onChange={(event) =>
                    handleInputChange("collectionAddress", event.target.value)
                  }
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="selectedKitId">Test kit</Label>
                  <Select
                    value={formData.selectedKitId}
                    onValueChange={(value) =>
                      handleInputChange("selectedKitId", value)
                    }
                    disabled={isKitLoading}
                  >
                    <SelectTrigger id="selectedKitId">
                      <SelectValue placeholder="Chọn test kit" />
                    </SelectTrigger>
                    <SelectContent>
                      {kits.map((kit) => (
                        <SelectItem key={kit.id} value={kit.id.toString()}>
                          {kit.kitName}
                          {kit.currentPrice != null
                            ? ` - $${kit.currentPrice}`
                            : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="quantityKit">Số lượng kit</Label>
                  <Input
                    id="quantityKit"
                    type="number"
                    min={1}
                    value={formData.quantityKit}
                    onChange={(event) =>
                      setFormData((prev) => ({
                        ...prev,
                        quantityKit: Number(event.target.value || 1),
                      }))
                    }
                  />
                </div>
              </div>

              <div className="space-y-4 rounded-lg border p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-base font-semibold">Participants</h3>
                    <p className="text-sm text-gray-600">
                      Nhập danh sách người tham gia cho đơn hàng
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addParticipantRow}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Thêm participant
                  </Button>
                </div>

                <div className="space-y-4">
                  {formData.participants.map((participant, index) => (
                    <div
                      key={participant.id}
                      className="rounded-lg border bg-muted/20 p-4"
                    >
                      <div className="mb-4 flex items-center justify-between">
                        <p className="font-medium">Participant {index + 1}</p>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeParticipantRow(index)}
                          disabled={formData.participants.length === 1}
                        >
                          Xóa
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor={`participant-first-${index}`}>
                            Họ và tên đệm
                          </Label>
                          <Input
                            id={`participant-first-${index}`}
                            placeholder="Nhập họ và tên đệm"
                            value={participant.firstName}
                            onChange={(event) =>
                              handleParticipantChange(
                                index,
                                "firstName",
                                event.target.value,
                              )
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`participant-last-${index}`}>
                            Tên
                          </Label>
                          <Input
                            id={`participant-last-${index}`}
                            placeholder="Nhập tên"
                            value={participant.lastName}
                            onChange={(event) =>
                              handleParticipantChange(
                                index,
                                "lastName",
                                event.target.value,
                              )
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Giới tính</Label>
                          <Select
                            value={participant.gender}
                            onValueChange={(value) =>
                              handleParticipantChange(index, "gender", value)
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Chọn giới tính" />
                            </SelectTrigger>
                            <SelectContent>
                              {genderOptions.map((gender) => (
                                <SelectItem key={gender} value={gender}>
                                  {gender}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Ngày sinh</Label>
                          <Input
                            type="date"
                            value={participant.birthDate}
                            onChange={(event) =>
                              handleParticipantChange(
                                index,
                                "birthDate",
                                event.target.value,
                              )
                            }
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-lg border bg-gray-50 p-4">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm text-gray-600">Giá dịch vụ</span>
                  <span className="font-medium text-gray-900">
                    ${serviceSubtotal || 0}
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between gap-4">
                  <span className="text-sm text-gray-600">Giá test kit</span>
                  <span className="font-medium text-gray-900">
                    ${kitSubtotal || 0}
                  </span>
                </div>
                <div className="mt-3 flex items-center justify-between gap-4 border-t pt-3 font-semibold">
                  <span>Tổng tạm tính</span>
                  <span className="text-green-600">${displayedTotal || 0}</span>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/")}
                >
                  Hủy
                </Button>
                <Button type="submit" disabled={createOrderMutation.isPending}>
                  {createOrderMutation.isPending
                    ? "Đang tạo..."
                    : "Tạo đơn hàng"}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default OrderWorkflowPage;
