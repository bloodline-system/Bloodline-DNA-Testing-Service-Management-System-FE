import { type LucideIcon } from "lucide-react";
import {
  CheckCircle,
  Clock,
  Package,
  Truck,
  TestTube,
  FileText,
} from "lucide-react";

export type WorkflowStep = {
  status: string;
  label: string;
  description: string;
  icon: LucideIcon;
  color: string;
};

export const workflowSteps: WorkflowStep[] = [
  {
    status: "PENDING",
    label: "Đơn hàng chờ xác nhận",
    description: "Đơn hàng đã được tạo và đang chờ quản lý xác nhận",
    icon: Clock,
    color: "bg-yellow-500",
  },
  {
    status: "CONFIRMED",
    label: "Đã xác nhận",
    description: "Đơn hàng đã được xác nhận và phân công nhân viên",
    icon: CheckCircle,
    color: "bg-blue-500",
  },
  {
    status: "KIT_PREPARED",
    label: "Chuẩn bị bộ kit",
    description: "Bộ kit xét nghiệm đang được chuẩn bị",
    icon: Package,
    color: "bg-purple-500",
  },
  {
    status: "KIT_SENT",
    label: "Đã gửi kit",
    description: "Bộ kit đã được gửi đến khách hàng",
    icon: Truck,
    color: "bg-indigo-500",
  },
  {
    status: "SAMPLE_COLLECTED",
    label: "Đã thu thập mẫu",
    description: "Mẫu xét nghiệm đã được thu thập",
    icon: TestTube,
    color: "bg-orange-500",
  },
  {
    status: "SAMPLE_RECEIVED",
    label: "Đã nhận mẫu",
    description: "Mẫu xét nghiệm đã được nhận tại phòng thí nghiệm",
    icon: TestTube,
    color: "bg-cyan-500",
  },
  {
    status: "IN_PROGRESS",
    label: "Đang phân tích",
    description: "Đang tiến hành phân tích mẫu",
    icon: TestTube,
    color: "bg-green-500",
  },
  {
    status: "RESULT_AVAILABLE",
    label: "Kết quả sẵn sàng",
    description: "Kết quả xét nghiệm đã sẵn sàng",
    icon: FileText,
    color: "bg-teal-500",
  },
  {
    status: "IN_REVIEW",
    label: "Đang xem xét",
    description: "Kết quả đang được xem xét cuối cùng",
    icon: FileText,
    color: "bg-lime-500",
  },
  {
    status: "COMPLETED",
    label: "Hoàn thành",
    description: "Đơn hàng đã hoàn thành",
    icon: CheckCircle,
    color: "bg-green-600",
  },
];

export const getOrderStatusValue = (status?: string) => {
  if (!status) return "PENDING";

  const normalized = status.toUpperCase().replace(/\s+/g, "_");
  return workflowSteps.some((step) => step.status === normalized)
    ? normalized
    : status;
};

export const getCurrentStepIndex = (status?: string) => {
  const currentStatus = getOrderStatusValue(status);
  return workflowSteps.findIndex((step) => step.status === currentStatus);
};
