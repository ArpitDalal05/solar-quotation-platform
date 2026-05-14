import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";

export function CustomerDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <div className="text-2xl font-semibold text-slate-900">Dashboard</div>
        <div className="text-sm text-slate-600">
          Create a new solar estimate, save it, and view your quotations.
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle>New Calculation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm text-slate-600">
              Get system size, cost, savings, and payback.
            </div>
            <Link
              to="/customer/new"
              className="inline-flex items-center justify-center rounded-md bg-customer-orange text-white px-3 py-2 text-sm hover:bg-orange-700 transition-colors"
            >
              Start
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle>Saved Calculations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm text-slate-600">
              Reuse previously saved results anytime.
            </div>
            <Link
              to="/customer/saved"
              className="inline-flex items-center justify-center rounded-md border border-amber-200 bg-white px-3 py-2 text-sm hover:bg-amber-50 transition-colors"
            >
              View
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle>Quotations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm text-slate-600">
              Download and track quotations shared by sales.
            </div>
            <Link
              to="/customer/quotations"
              className="inline-flex items-center justify-center rounded-md border border-amber-200 bg-white px-3 py-2 text-sm hover:bg-amber-50 transition-colors"
            >
              Open
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

