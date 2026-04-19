import React, { useState } from "react";
import {
  useTestKits,
  useCreateTestKit,
  useUpdateTestKit,
  useDeleteTestKit,
} from "@/services/testKit/testKit.queries";
import type { TestKit } from "@/services/testKit/types";
import { useAuthStore } from "@/stores/auth/useAuthStore";
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
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  Plus,
  Edit,
  Trash2,
  Search,
  ChevronLeft,
  ChevronRight,
  Lock,
} from "lucide-react";

const testKitSchema = z.object({
  kitName: z.string().min(1, "Kit name is required"),
  kitType: z.enum([
    "PATERNITY",
    "MATERNITY",
    "SIBLING",
    "GRANDPARENT",
    "ANCESTRY",
    "RELATIONSHIP",
    "FORENSIC",
    "IMMIGRATION",
    "PRENATAL",
    "TWIN_ZYGOSITY",
    "GENETIC_HEALTH",
    "CARRIER_SCREENING",
    "PHARMACOGENOMICS",
    "OTHER",
  ]),
  sampleType: z.enum([
    "BLOOD",
    "URINE",
    "SALIVA",
    "TISSUE",
    "HAIR",
    "SEMEN",
    "SWAB",
    "NAIL",
    "OTHER",
  ]),
  basePrice: z.number().min(0, "Base price must be >= 0"),
  currentPrice: z.number().min(0, "Current price must be >= 0"),
  quantityInStock: z.number().min(0, "Quantity must be >= 0"),
  kitDescription: z.string().optional(),
  expiryDate: z.string().min(1, "Expiry date is required"),
  producedBy: z.string().min(1, "Producer is required"),
  isAvailable: z.boolean().optional(),
});

type TestKitFormData = z.infer<typeof testKitSchema>;

const TestKitPage: React.FC = () => {
  const [page, setPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingKit, setEditingKit] = useState<TestKit | null>(null);

  // Access token check - core authentication requirement
  const accessToken = useAuthStore((state) => state.accessToken);

  // Enable queries only when token exists
  const { data: testKitsData, isLoading } = useTestKits(
    page,
    10,
    Boolean(accessToken),
  );
  const createMutation = useCreateTestKit();
  const updateMutation = useUpdateTestKit();
  const deleteMutation = useDeleteTestKit();

  const form = useForm<TestKitFormData>({
    resolver: zodResolver(testKitSchema),
    defaultValues: {
      kitName: "",
      kitType: "PATERNITY",
      sampleType: "SALIVA",
      basePrice: 0,
      currentPrice: 0,
      quantityInStock: 0,
      kitDescription: "",
      expiryDate: "",
      producedBy: "",
      isAvailable: true,
    },
  });

  const handleCreate = async (data: TestKitFormData) => {
    if (!accessToken) {
      toast.error("Authentication required");
      return;
    }

    try {
      await createMutation.mutateAsync(data);
      toast.success("Test kit created successfully");
      setIsCreateDialogOpen(false);
      form.reset();
    } catch (error) {
      toast.error("Failed to create test kit");
    }
  };

  const handleUpdate = async (data: TestKitFormData) => {
    if (!accessToken) {
      toast.error("Authentication required");
      return;
    }

    if (!editingKit) return;
    try {
      await updateMutation.mutateAsync({ id: editingKit.id, data });
      toast.success("Test kit updated successfully");
      setEditingKit(null);
      form.reset();
    } catch (error) {
      toast.error("Failed to update test kit");
    }
  };

  const handleDelete = async (id: number) => {
    if (!accessToken) {
      toast.error("Authentication required");
      return;
    }

    if (confirm("Are you sure you want to delete this test kit?")) {
      try {
        await deleteMutation.mutateAsync(id);
        toast.success("Test kit deleted successfully");
      } catch (error) {
        toast.error("Failed to delete test kit");
      }
    }
  };

  const openEditDialog = (kit: TestKit) => {
    if (!accessToken) {
      toast.error("Authentication required");
      return;
    }

    setEditingKit(kit);
    form.reset({
      kitName: kit.kitName,
      kitType: kit.kitType as any,
      sampleType: kit.sampleType as any,
      basePrice: kit.basePrice,
      currentPrice: kit.currentPrice,
      quantityInStock: kit.quantityInStock,
      kitDescription: kit.kitDescription || "",
      expiryDate: kit.expiryDate,
      producedBy: kit.producedBy,
      isAvailable: kit.isAvailable,
    });
  };

  // Authentication required UI
  if (!accessToken) {
    return (
      <div className="container mx-auto p-6">
        <div className="rounded-lg border border-muted p-8 text-center">
          <Lock className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-semibold mb-2">
            Authentication Required
          </h2>
          <p className="text-muted-foreground mb-4">
            You need to sign in to access the Test Kit Management dashboard.
          </p>
          <p className="text-sm text-muted-foreground">
            Please sign in to view and manage test kits.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Test Kits Management</h1>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Test Kit
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Test Kit</DialogTitle>
            </DialogHeader>
            <form
              onSubmit={form.handleSubmit(handleCreate)}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Kit Name</label>
                  <Input {...form.register("kitName")} />
                  {form.formState.errors.kitName && (
                    <p className="text-sm text-red-500">
                      {form.formState.errors.kitName.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium">Producer</label>
                  <Input {...form.register("producedBy")} />
                  {form.formState.errors.producedBy && (
                    <p className="text-sm text-red-500">
                      {form.formState.errors.producedBy.message}
                    </p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Kit Type</label>
                  <Select
                    onValueChange={(value) =>
                      form.setValue("kitType", value as any)
                    }
                    defaultValue={form.watch("kitType")}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select kit type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PATERNITY">Paternity Test</SelectItem>
                      <SelectItem value="MATERNITY">Maternity Test</SelectItem>
                      <SelectItem value="SIBLING">Sibling Test</SelectItem>
                      <SelectItem value="ANCESTRY">Ancestry Test</SelectItem>
                      <SelectItem value="OTHER">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  {form.formState.errors.kitType && (
                    <p className="text-sm text-red-500">
                      {form.formState.errors.kitType.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium">Sample Type</label>
                  <Select
                    onValueChange={(value) =>
                      form.setValue("sampleType", value as any)
                    }
                    defaultValue={form.watch("sampleType")}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select sample type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BLOOD">Blood</SelectItem>
                      <SelectItem value="SALIVA">Saliva</SelectItem>
                      <SelectItem value="URINE">Urine</SelectItem>
                      <SelectItem value="OTHER">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  {form.formState.errors.sampleType && (
                    <p className="text-sm text-red-500">
                      {form.formState.errors.sampleType.message}
                    </p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium">Base Price</label>
                  <Input
                    type="number"
                    step="0.01"
                    {...form.register("basePrice", { valueAsNumber: true })}
                  />
                  {form.formState.errors.basePrice && (
                    <p className="text-sm text-red-500">
                      {form.formState.errors.basePrice.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium">Current Price</label>
                  <Input
                    type="number"
                    step="0.01"
                    {...form.register("currentPrice", { valueAsNumber: true })}
                  />
                  {form.formState.errors.currentPrice && (
                    <p className="text-sm text-red-500">
                      {form.formState.errors.currentPrice.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium">
                    Quantity in Stock
                  </label>
                  <Input
                    type="number"
                    {...form.register("quantityInStock", {
                      valueAsNumber: true,
                    })}
                  />
                  {form.formState.errors.quantityInStock && (
                    <p className="text-sm text-red-500">
                      {form.formState.errors.quantityInStock.message}
                    </p>
                  )}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Expiry Date</label>
                <Input type="date" {...form.register("expiryDate")} />
                {form.formState.errors.expiryDate && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.expiryDate.message}
                  </p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea {...form.register("kitDescription")} />
                {form.formState.errors.kitDescription && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.kitDescription.message}
                  </p>
                )}
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? "Creating..." : "Create"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-4 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search test kits..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-8">Loading test kits...</div>
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Kit Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Sample Type</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {testKitsData?.content?.map((kit) => (
                <TableRow key={kit.id}>
                  <TableCell>{kit.id}</TableCell>
                  <TableCell>{kit.kitName}</TableCell>
                  <TableCell>{kit.kitType}</TableCell>
                  <TableCell>{kit.sampleType}</TableCell>
                  <TableCell>${kit.currentPrice}</TableCell>
                  <TableCell>{kit.quantityInStock}</TableCell>
                  <TableCell>
                    <Badge variant={kit.isAvailable ? "default" : "secondary"}>
                      {kit.isAvailable ? "Available" : "Unavailable"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(kit)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(kit.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="flex justify-between items-center mt-4">
            <Button
              variant="outline"
              onClick={() => setPage(Math.max(0, page - 1))}
              disabled={page === 0}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <span>
              Page {page + 1} of {testKitsData?.totalPages || 1}
            </span>
            <Button
              variant="outline"
              onClick={() => setPage(page + 1)}
              disabled={testKitsData?.last}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editingKit} onOpenChange={() => setEditingKit(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Test Kit</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={form.handleSubmit(handleUpdate)}
            className="space-y-4"
          >
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Kit Name</label>
                <Input {...form.register("kitName")} />
                {form.formState.errors.kitName && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.kitName.message}
                  </p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium">Producer</label>
                <Input {...form.register("producedBy")} />
                {form.formState.errors.producedBy && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.producedBy.message}
                  </p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Kit Type</label>
                <Select
                  onValueChange={(value) =>
                    form.setValue("kitType", value as any)
                  }
                  value={form.watch("kitType")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select kit type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PATERNITY">Paternity Test</SelectItem>
                    <SelectItem value="MATERNITY">Maternity Test</SelectItem>
                    <SelectItem value="SIBLING">Sibling Test</SelectItem>
                    <SelectItem value="ANCESTRY">Ancestry Test</SelectItem>
                    <SelectItem value="OTHER">Other</SelectItem>
                  </SelectContent>
                </Select>
                {form.formState.errors.kitType && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.kitType.message}
                  </p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium">Sample Type</label>
                <Select
                  onValueChange={(value) =>
                    form.setValue("sampleType", value as any)
                  }
                  value={form.watch("sampleType")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select sample type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BLOOD">Blood</SelectItem>
                    <SelectItem value="SALIVA">Saliva</SelectItem>
                    <SelectItem value="URINE">Urine</SelectItem>
                    <SelectItem value="OTHER">Other</SelectItem>
                  </SelectContent>
                </Select>
                {form.formState.errors.sampleType && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.sampleType.message}
                  </p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium">Base Price</label>
                <Input
                  type="number"
                  step="0.01"
                  {...form.register("basePrice", { valueAsNumber: true })}
                />
                {form.formState.errors.basePrice && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.basePrice.message}
                  </p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium">Current Price</label>
                <Input
                  type="number"
                  step="0.01"
                  {...form.register("currentPrice", { valueAsNumber: true })}
                />
                {form.formState.errors.currentPrice && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.currentPrice.message}
                  </p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium">Quantity in Stock</label>
                <Input
                  type="number"
                  {...form.register("quantityInStock", { valueAsNumber: true })}
                />
                {form.formState.errors.quantityInStock && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.quantityInStock.message}
                  </p>
                )}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Expiry Date</label>
              <Input type="date" {...form.register("expiryDate")} />
              {form.formState.errors.expiryDate && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.expiryDate.message}
                </p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea {...form.register("kitDescription")} />
              {form.formState.errors.kitDescription && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.kitDescription.message}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isAvailable"
                {...form.register("isAvailable")}
                className="h-4 w-4 rounded border-gray-300"
              />
              <label
                htmlFor="isAvailable"
                className="text-sm font-medium cursor-pointer"
              >
                Available
              </label>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditingKit(null)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? "Updating..." : "Update"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TestKitPage;
