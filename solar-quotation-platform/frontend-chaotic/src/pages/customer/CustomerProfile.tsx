import { useAuth } from "../../contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";

export function CustomerProfile() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <div className="text-2xl font-semibold text-slate-900">Profile</div>
        <div className="text-sm text-slate-600">Your account details.</div>
      </div>

      <Card className="hover:shadow-md transition-shadow">
        <CardHeader>
          <CardTitle>Account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-500">Name</span>
            <span className="font-medium">{user?.name || "-"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Email</span>
            <span className="font-medium">{user?.email || "-"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Phone</span>
            <span className="font-medium">{user?.phone || "-"}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

