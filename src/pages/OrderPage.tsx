import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useOrdersQuery } from "@/services/order/order.queries";
import { Skeleton } from "@/components/ui/skeleton";

const OrderPage = () => {
  const [formData, setFormData] = useState({
    testType: "",
    fullName: "",
    email: "",
    phone: "",
    address: "",
  });

  const { data: ordersData, isLoading: ordersLoading, error: ordersError } = useOrdersQuery();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle order submission logic here
    console.log("Order submitted:", formData);
    alert("Order placed successfully!");
  };

  return (
    <div className="container mx-auto p-6">
      <Tabs defaultValue="list" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="list">Order List</TabsTrigger>
          <TabsTrigger value="new">New Order</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Order Management</CardTitle>
              <CardDescription>View and manage all orders</CardDescription>
            </CardHeader>
            <CardContent>
              {ordersLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              ) : ordersError ? (
                <div data-testid="error-message" className="text-red-500">
                  Error loading orders
                </div>
              ) : ordersData?.data.orders.length === 0 ? (
                <div data-testid="empty-state" className="text-center py-8">
                  No orders found
                </div>
              ) : (
                <div data-testid="order-list" className="space-y-4">
                  {ordersData?.data.statusCounts && (
                    <div className="flex gap-2 mb-4">
                      {Object.entries(ordersData.data.statusCounts).map(([status, count]) => (
                        <Badge key={status} variant="outline">
                          {status}: {count}
                        </Badge>
                      ))}
                    </div>
                  )}
                  {ordersData?.data.orders.map((order) => (
                    <Card key={order.id} data-testid="order-item">
                      <CardContent className="pt-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <div data-testid="order-id" className="font-semibold">
                              Order #{order.id}
                            </div>
                            <div data-testid="customer-name" className="text-sm text-gray-600">
                              {order.customerName}
                            </div>
                            <div data-testid="created-date" className="text-sm text-gray-500">
                              {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}
                            </div>
                          </div>
                          <Badge data-testid="order-status" variant={order.orderStatus === 'COMPLETED' ? 'default' : 'secondary'}>
                            {order.orderStatus}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="new" className="space-y-4">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Place a DNA Testing Order</CardTitle>
              <CardDescription>
                Fill in the details below to place your DNA testing order.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4" data-testid="order-form">
                <div>
                  <Label htmlFor="testType">Test Type</Label>
                  <Input
                    id="testType"
                    name="testType"
                    value={formData.testType}
                    onChange={handleChange}
                    placeholder="e.g., Paternity Test, Ancestry Test"
                    required
                    data-testid="testType-input"
                  />
                </div>
                <Separator />
                <div>
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    required
                    data-testid="fullName-input"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    required
                    data-testid="email-input"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Enter your phone number"
                    required
                    data-testid="phone-input"
                  />
                </div>
                <div>
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Enter your address"
                    required
                    data-testid="address-input"
                  />
                </div>
                <Button type="submit" className="w-full" data-testid="place-order-btn">
                  Place Order
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default OrderPage;