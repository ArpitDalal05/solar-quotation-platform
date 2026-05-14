import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { IconInput } from "../components/ui/icon-input";
import logo from "../assets/logo.jpg";

export function Login() {
  const nav = useNavigate();
  const { setUser } = useAuth();
  const [email, setEmail] = useState("admin@example.com");
  const [password, setPassword] = useState("password123");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  return (
    <div className="min-h-screen grid place-items-center bg-gradient-to-br from-sky-50 via-white to-emerald-50 p-4">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-2 mb-6 justify-center">
          <img
            src={logo}
            alt="Soledify"
            className="h-10 w-auto rounded-md object-contain"
          />
          <div>
            <div className="text-sm font-semibold text-slate-900">Soledify</div>
            <div className="text-xs text-slate-500">Think Green, Live Clean</div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Sign in</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              className="space-y-3"
              onSubmit={async (e) => {
                e.preventDefault();
                setError(null);
                setLoading(true);
                try {
                  const res = await api.post("/auth/login", { email, password });
                  localStorage.setItem("token", res.data.token);
                  setUser(res.data.user);
                  nav(res.data.user?.role === "CUSTOMER" ? "/customer/dashboard" : "/dashboard");
                } catch (err: any) {
                  setError(
                    err?.response?.data?.message ?? "Login failed. Check credentials.",
                  );
                } finally {
                  setLoading(false);
                }
              }}
            >
              <div className="space-y-1">
                <label className="text-xs text-slate-600">Email</label>
                <IconInput
                  icon={
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M4 6h16v12H4V6Z"
                        stroke="currentColor"
                        strokeWidth="2"
                      />
                      <path
                        d="m4 7 8 6 8-6"
                        stroke="currentColor"
                        strokeWidth="2"
                      />
                    </svg>
                  }
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  type="email"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-slate-600">Password</label>
                <IconInput
                  icon={
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M7 11V8a5 5 0 0 1 10 0v3"
                        stroke="currentColor"
                        strokeWidth="2"
                      />
                      <path
                        d="M6 11h12v10H6V11Z"
                        stroke="currentColor"
                        strokeWidth="2"
                      />
                    </svg>
                  }
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  type="password"
                />
              </div>
              {error ? (
                <div className="text-sm text-red-600">{error}</div>
              ) : null}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Signing in..." : "Sign in"}
              </Button>

              <p className="text-xs text-slate-500 text-center">
                Don't have an account?{" "}
                <Link
                  to="/signup"
                  className="text-solar-blue font-medium hover:underline"
                >
                  Sign up
                </Link>
              </p>

              <div className="text-xs text-slate-500 space-y-1">
                <div>Admin: admin@example.com / password123</div>
                <div>Sales Exec: register via Postman, then login</div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

