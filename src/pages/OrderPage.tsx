import { useState, useMemo } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ChevronLeft, ChevronRight, Search, Plus } from "lucide-react";
import { useOrdersQuery } from "@/services/order/order.queries";
import { useTestTypesQuery } from "@/services/testType/testType.queries";
import { useCreateOrderMutation } from "@/services/order/order.queries";

const OrderPage = () => {
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [showCreateForm, setShowCreateForm] = useState(false);

  const { data: ordersData, isLoading, error } = useOrdersQuery();
  const { data: testTypesData } = useTestTypesQuery();
  const createOrderMutation = useCreateOrderMutation();

  const allOrders = ordersData?.data?.orders || [];
  const statusCounts = ordersData?.data?.statusCounts || {};
  const testTypes = testTypesData?.data?.testTypes || [];

  // Form state for creating new order
  const [formData, setFormData] = useState({
    testTypeId: "",
    customerName: "",
    email: "",
    phone: "",
    address: "",
  });

  // Filter and search
  const filteredOrders = useMemo(() => {
    return allOrders.filter((order) => {
      const matchStatus =
        selectedStatus === "all" || order.orderStatus === selectedStatus;
      const matchSearch =
        order.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.phone?.includes(searchTerm) ||
        order.id.toString().includes(searchTerm);
      return matchStatus && matchSearch;
    });
  }, [allOrders, selectedStatus, searchTerm]);

  // Pagination
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const startIndex = currentPage * itemsPerPage;
  const paginatedOrders = filteredOrders.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: "bg-yellow-100 text-yellow-800",
      PROCESSING: "bg-blue-100 text-blue-800",
      COMPLETED: "bg-green-100 text-green-800",
      CANCELLED: "bg-red-100 text-red-800",
      NEW: "bg-purple-100 text-purple-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const handleFormChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    createOrderMutation.mutate(
      {
        testTypeId: parseInt(formData.testTypeId),
        customerName: formData.customerName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
      },
      {
        onSuccess: () => {
          setShowCreateForm(false);
          setFormData({
            testTypeId: "",
            customerName: "",
            email: "",
            phone: "",
            address: "",
          });
        },
      },
    );
  };

  const selectedTestType = testTypes.find(
    (t) => t.id.toString() === formData.testTypeId,
  );

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-96">
          <p className="text-lg text-gray-600">Loading orders...</p>
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
              Error loading orders. Please try again.
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
            Order Management
          </h1>
          <p className="text-gray-600 mt-2">
            View and manage all DNA testing orders
          </p>
        </div>
        <Button onClick={() => setShowCreateForm(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Create Order
        </Button>
      </div>

      {/* Create Order Form */}
      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Order</CardTitle>
            <CardDescription>
              Fill in the details to create a new DNA testing order.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateOrder} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="testTypeId">Test Type</Label>
                  <Select
                    value={formData.testTypeId}
                    onValueChange={(value) =>
                      handleFormChange("testTypeId", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a test type" />
                    </SelectTrigger>
                    <SelectContent>
                      {testTypes.map((testType) => (
                        <SelectItem
                          key={testType.id}
                          value={testType.id.toString()}
                        >
                          {testType.name} - ${testType.price}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Price</Label>
                  <div className="p-3 bg-gray-50 rounded-md">
                    <span className="text-lg font-semibold text-green-600">
                      ${selectedTestType?.price || 0}
                    </span>
                    {selectedTestType && (
                      <p className="text-sm text-gray-600 mt-1">
                        Duration: {selectedTestType.duration}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="customerName">Full Name</Label>
                  <Input
                    id="customerName"
                    value={formData.customerName}
                    onChange={(e) =>
                      handleFormChange("customerName", e.target.value)
                    }
                    placeholder="Enter customer's full name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleFormChange("email", e.target.value)}
                    placeholder="Enter email address"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleFormChange("phone", e.target.value)}
                    placeholder="Enter phone number"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) =>
                      handleFormChange("address", e.target.value)
                    }
                    placeholder="Enter address"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit">Create Order</Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold">{allOrders.length}</p>
              <p className="text-sm text-gray-600 mt-1">Total Orders</p>
            </div>
          </CardContent>
        </Card>
        {Object.entries(statusCounts).map(([status, count]) => (
          <Card key={status}>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-2xl font-bold">{count as number}</p>
                <p className="text-sm text-gray-600 mt-1 capitalize">
                  {status.toLowerCase()}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search by order ID, customer name, email, or phone..."
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
            <Label className="mb-2 block">Filter by Status</Label>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedStatus === "all" ? "default" : "outline"}
                onClick={() => {
                  setSelectedStatus("all");
                  setCurrentPage(0);
                }}
              >
                All
              </Button>
              {Object.keys(statusCounts).map((status) => (
                <Button
                  key={status}
                  variant={selectedStatus === status ? "default" : "outline"}
                  onClick={() => {
                    setSelectedStatus(status);
                    setCurrentPage(0);
                  }}
                >
                  {status}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Orders ({filteredOrders.length})
            {selectedStatus !== "all" && ` - ${selectedStatus}`}
          </CardTitle>
          <CardDescription>
            Showing {paginatedOrders.length} of {filteredOrders.length} orders
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="px-4 py-3 text-left font-semibold">
                    Order ID
                  </th>
                  <th className="px-4 py-3 text-left font-semibold">
                    Customer
                  </th>
                  <th className="px-4 py-3 text-left font-semibold">Email</th>
                  <th className="px-4 py-3 text-left font-semibold">Phone</th>
                  <th className="px-4 py-3 text-left font-semibold">
                    Test Type
                  </th>
                  <th className="px-4 py-3 text-left font-semibold">Price</th>
                  <th className="px-4 py-3 text-left font-semibold">Status</th>
                  <th className="px-4 py-3 text-left font-semibold">Date</th>
                  <th className="px-4 py-3 text-left font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {paginatedOrders.length > 0 ? (
                  paginatedOrders.map((order) => (
                    <tr key={order.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3 font-semibold">#{order.id}</td>
                      <td className="px-4 py-3">
                        {order.customerName || "N/A"}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {order.email || "N/A"}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {order.phone || "N/A"}
                      </td>
                      <td className="px-4 py-3">{order.testType || "N/A"}</td>
                      <td className="px-4 py-3 font-semibold text-green-600">
                        ${order.totalPrice || 0}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.orderStatus)}`}
                        >
                          {order.orderStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {order.createdAt
                          ? new Date(order.createdAt).toLocaleDateString()
                          : "N/A"}
                      </td>
                      <td className="px-4 py-3">
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={9}
                      className="px-4 py-8 text-center text-gray-500"
                    >
                      No orders found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <p className="text-sm text-gray-600">
                Page {currentPage + 1} of {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                  disabled={currentPage === 0}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage(Math.min(totalPages - 1, currentPage + 1))
                  }
                  disabled={currentPage === totalPages - 1}
                >
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

export default OrderPage;
