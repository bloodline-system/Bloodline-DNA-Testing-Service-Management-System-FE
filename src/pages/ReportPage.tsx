import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useReportsQuery, useCreateReportMutation } from "@/services/report/report.queries";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

const ReportPage = () => {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [search, setSearch] = useState<string>("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    reportName: "",
    reportType: "",
    reportCategory: "",
    reportData: "",
  });

  const { data: reportsData, isLoading, error } = useReportsQuery(
    0, // page
    20, // size
    statusFilter === "all" ? "all" : statusFilter, // status
    "all", // generatedByRole
    search, // search
    "createdAt", // sortBy
    "desc" // sortDir
  );

  const createReportMutation = useCreateReportMutation();

  const handleCreateFormChange = (field: string, value: string) => {
    setCreateForm(prev => ({ ...prev, [field]: value }));
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.reportName || !createForm.reportType || !createForm.reportCategory || !createForm.reportData) {
      toast.error("All fields are required");
      return;
    }
    createReportMutation.mutate(createForm, {
      onSuccess: () => {
        toast.success("Report created successfully");
        setIsCreateDialogOpen(false);
        setCreateForm({ reportName: "", reportType: "", reportCategory: "", reportData: "" });
      },
      onError: () => {
        toast.error("Failed to create report");
      },
    });
  };

  const filteredReports = reportsData?.data.content || [];

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Report Management</h1>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="create-report-btn">Create Report</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Report</DialogTitle>
              <DialogDescription>
                Fill in the details to create a new report.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateSubmit} className="space-y-4" data-testid="report-form">
              <div>
                <Label htmlFor="reportName">Report Name</Label>
                <Input
                  id="reportName"
                  value={createForm.reportName}
                  onChange={(e) => handleCreateFormChange('reportName', e.target.value)}
                  data-testid="reportName-input"
                  required
                />
              </div>
              <div>
                <Label htmlFor="reportType">Report Type</Label>
                <Select value={createForm.reportType} onValueChange={(value) => handleCreateFormChange('reportType', value)}>
                  <SelectTrigger data-testid="reportType-select">
                    <SelectValue placeholder="Select report type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MONTHLY_REVENUE">Monthly Revenue</SelectItem>
                    <SelectItem value="QUARTERLY_SALES">Quarterly Sales</SelectItem>
                    <SelectItem value="ANNUAL_REPORT">Annual Report</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="reportCategory">Report Category</Label>
                <Select value={createForm.reportCategory} onValueChange={(value) => handleCreateFormChange('reportCategory', value)}>
                  <SelectTrigger data-testid="reportCategory-select">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="REVENUE">Revenue</SelectItem>
                    <SelectItem value="SALES">Sales</SelectItem>
                    <SelectItem value="OPERATIONS">Operations</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="reportData">Report Data</Label>
                <Textarea
                  id="reportData"
                  value={createForm.reportData}
                  onChange={(e) => handleCreateFormChange('reportData', e.target.value)}
                  data-testid="reportData-textarea"
                  required
                />
              </div>
              <Button type="submit" data-testid="submit-btn" disabled={createReportMutation.isPending}>
                {createReportMutation.isPending ? "Creating..." : "Create Report"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="flex-1">
          <Input
            placeholder="Search reports..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            data-testid="search-input"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48" data-testid="status-filter">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="APPROVED">Approved</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="REJECTED">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-4">
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2 mb-2" />
                <Skeleton className="h-8 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : error ? (
        <div data-testid="error-message" className="text-red-500 text-center py-8">
          Error loading reports
        </div>
      ) : filteredReports.length === 0 ? (
        <div data-testid="empty-state" className="text-center py-8">
          No reports found
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredReports.map((report) => (
            <Card key={report.id} data-testid="report-item">
              <CardHeader>
                <CardTitle>{String(report.reportName || `Report #${report.id}`)}</CardTitle>
                <CardDescription>
                  Created: {report.createdAt ? new Date(report.createdAt).toLocaleDateString() : 'N/A'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center mb-4">
                  <Badge
                    variant={
                      report.reportStatus === 'APPROVED' ? 'default' :
                      report.reportStatus === 'REJECTED' ? 'destructive' : 'secondary'
                    }
                    data-testid="report-status"
                  >
                    {report.reportStatus}
                  </Badge>
                  <span className="text-sm text-gray-500">
                    {report.generatedByRole}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" data-testid="view-details-btn">
                    View Details
                  </Button>
                  {report.reportStatus === 'PENDING' && (
                    <>
                      <Button variant="default" size="sm" data-testid="approve-btn">
                        Approve
                      </Button>
                      <Button variant="destructive" size="sm" data-testid="reject-btn">
                        Reject
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReportPage;