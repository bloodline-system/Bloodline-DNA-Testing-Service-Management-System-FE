import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const HomePage = () => {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold text-center mb-8">Bloodline DNA Testing Service</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Place an Order</CardTitle>
            <CardDescription>Order a new DNA test</CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/order">
              <Button className="w-full">Go to Order</Button>
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>View Reports</CardTitle>
            <CardDescription>Check your test results</CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/report">
              <Button className="w-full">Go to Reports</Button>
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
            <CardDescription>Access your account</CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/sign-in">
              <Button variant="outline" className="w-full">Sign In</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HomePage;
