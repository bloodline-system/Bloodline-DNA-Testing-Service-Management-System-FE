import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const ReportPage = () => {
  // Mock data for reports
  const reports = [
    {
      id: 1,
      testType: "Paternity Test",
      date: "2023-10-01",
      status: "Completed",
      result: "Positive Match",
    },
    {
      id: 2,
      testType: "Ancestry Test",
      date: "2023-09-15",
      status: "Pending",
      result: "N/A",
    },
    {
      id: 3,
      testType: "DNA Profiling",
      date: "2023-08-20",
      status: "Completed",
      result: "Profile Generated",
    },
  ];

  return (
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
  );
};

export default ReportPage;