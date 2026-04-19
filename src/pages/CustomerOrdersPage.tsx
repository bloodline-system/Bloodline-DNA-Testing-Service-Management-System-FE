import { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronLeft, ChevronRight, Search, Plus } from "lucide-react";
import { useCustomerOrdersQuery } from "@/services/order/order.queries";
import {
  filterCustomerOrders,
  getCustomerOrderStats,
  getOrderStatusClass,
  getOrderStatusLabel,
  paginateCustomerOrders,
} from "@/services/order/customerOrdersService";

const CustomerOrdersPage = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");

  const { data: ordersData, isLoading, error } = useCustomerOrdersQuery();

  const allOrders = ordersData?.data || [];
  const { totalOrders, pendingCount, completedCount, totalValue } =
    getCustomerOrderStats(allOrders);

  // Filter and search
  const filteredOrders = useMemo(
    () => filterCustomerOrders(allOrders, searchTerm, selectedStatus),
    [allOrders, selectedStatus, searchTerm],
  );

  const { paginatedOrders, totalPages } = paginateCustomerOrders(
    filteredOrders,
    currentPage,
    itemsPerPage,
  );

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-96">
          <p className="text-lg text-gray-600">
            Đang tải danh sách đơn hàng...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-800">
              Không thể tải danh sách đơn hàng. Vui lòng thử lại.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Danh sách đơn hàng
          </h1>
          <p className="text-gray-600 mt-2">
            Quản lý và theo dõi các đơn hàng của bạn
          </p>
        </div>
        <Button
          onClick={() => navigate("/order-workflow/new")}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Đặt dịch vụ mới
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold">{totalOrders}</p>
              <p className="text-sm text-gray-600 mt-1">Tổng đơn hàng</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold">{pendingCount}</p>
              <p className="text-sm text-gray-600 mt-1">Chờ xử lý</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold">{completedCount}</p>
              <p className="text-sm text-gray-600 mt-1">Hoàn thành</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600">${totalValue}</p>
              <p className="text-sm text-gray-600 mt-1">Tổng giá trị</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Bộ lọc</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Tìm kiếm theo mã đơn hàng hoặc loại xét nghiệm..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(0);
              }}
              className="pl-10"
            />
          </div>

          {/* Status Filter */}
          <div>
            <Label className="mb-2 block">Lọc theo trạng thái</Label>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedStatus === "all" ? "default" : "outline"}
                onClick={() => {
                  setSelectedStatus("all");
                  setCurrentPage(0);
                }}
              >
                Tất cả
              </Button>
              <Button
                variant={selectedStatus === "PENDING" ? "default" : "outline"}
                onClick={() => {
                  setSelectedStatus("PENDING");
                  setCurrentPage(0);
                }}
              >
                Chờ xử lý
              </Button>
              <Button
                variant={selectedStatus === "COMPLETED" ? "default" : "outline"}
                onClick={() => {
                  setSelectedStatus("COMPLETED");
                  setCurrentPage(0);
                }}
              >
                Hoàn thành
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Đơn hàng ({filteredOrders.length})
            {selectedStatus !== "all" &&
              ` - ${selectedStatus === "PENDING" ? "Chờ xử lý" : selectedStatus === "COMPLETED" ? "Hoàn thành" : selectedStatus}`}
          </CardTitle>
          <CardDescription>
            Hiển thị {paginatedOrders.length} trong tổng số{" "}
            {filteredOrders.length} đơn hàng
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="px-4 py-3 text-left font-semibold">
                    Mã đơn hàng
                  </th>
                  <th className="px-4 py-3 text-left font-semibold">
                    Loại xét nghiệm
                  </th>
                  <th className="px-4 py-3 text-left font-semibold">
                    Tổng tiền
                  </th>
                  <th className="px-4 py-3 text-left font-semibold">
                    Trạng thái
                  </th>
                  <th className="px-4 py-3 text-left font-semibold">
                    Ngày hẹn
                  </th>
                  <th className="px-4 py-3 text-left font-semibold">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedOrders.length > 0 ? (
                  paginatedOrders.map((order) => (
                    <tr
                      key={order.idServiceOrder}
                      className="border-b hover:bg-gray-50"
                    >
                      <td className="px-4 py-3 font-semibold">
                        #{order.idServiceOrder}
                      </td>
                      <td className="px-4 py-3">
                        {order.medicalServiceName || "N/A"}
                      </td>
                      <td className="px-4 py-3 font-semibold text-green-600">
                        ${order.finalAmount || 0}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${getOrderStatusClass(order.orderStatus)}`}
                        >
                          {getOrderStatusLabel(order.orderStatus)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {order.appointmentDate
                          ? new Date(order.appointmentDate).toLocaleDateString(
                              "vi-VN",
                            )
                          : "N/A"}
                      </td>
                      <td className="px-4 py-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            navigate(`/order-workflow/${order.idServiceOrder}`)
                          }
                        >
                          Xem chi tiết
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-8 text-center text-gray-500"
                    >
                      {searchTerm || selectedStatus !== "all"
                        ? "Không tìm thấy đơn hàng phù hợp"
                        : "Bạn chưa có đơn hàng nào"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-gray-600">
                Trang {currentPage + 1} của {totalPages}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 0}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Trước
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages - 1}
                >
                  Sau
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomerOrdersPage;
