import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
<<<<<<< HEAD
import { useReportsQuery } from "@/services/report/report.queries";
import { Loader2 } from "lucide-react";
=======
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
>>>>>>> 4bd60cdd6da8104b97492694cc458ed0bd8f1dc9

const ReportPage = () => {
  const { data: reportsResponse, isLoading, error } = useReportsQuery();

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 flex justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading reports...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center text-red-500">
          Failed to load reports. Please try again later.
        </div>
      </div>
    );
  }

  const reports = reportsResponse?.data?.content || [];

  return (
<<<<<<< HEAD
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">DNA Test Reports</h1>
      {reports.length === 0 ? (
        <div className="text-center text-gray-500">
          No reports found.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {reports.map((report) => (
            <Card key={report.id}>
              <CardHeader>
                <CardTitle>{report.testType || "DNA Test"}</CardTitle>
                <CardDescription>
                  Created: {report.createdAt ? new Date(report.createdAt).toLocaleDateString() : "N/A"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="mb-2">Status: {report.reportStatus || "Unknown"}</p>
                <p className="mb-2">Result: {report.result || "N/A"}</p>
                <p className="mb-4">Notes: {report.notes || "No notes"}</p>
                <Button variant="outline" className="w-full">
                  View Details
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
=======
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
          <h1 className="text-2xl font-bold mb-6">DNA Test Reports</h1>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {reports.map((report) => (
              <Card key={report.id}>
                <CardHeader>
                  <CardTitle>{report.testType}</CardTitle>
                  <CardDescription>Test Date: {report.date}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="mb-2">Status: {report.status}</p>
                  <p className="mb-4">Result: {report.result}</p>
                  <Button variant="outline" className="w-full">
                    View Details
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
>>>>>>> 4bd60cdd6da8104b97492694cc458ed0bd8f1dc9
  );
};

export default ReportPage;
