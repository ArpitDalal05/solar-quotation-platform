import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { IconInput } from "../components/ui/icon-input";
import { Input } from "../components/ui/input";

const INDIAN_STATES_CITIES: Record<string, string[]> = {
  Maharashtra: ["Mumbai", "Pune", "Nagpur", "Nashik"],
  Gujarat: ["Ahmedabad", "Surat", "Vadodara", "Rajkot"],
  Karnataka: ["Bangalore", "Mysore", "Mangalore"],
  "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai"],
  Delhi: ["New Delhi"],
};

export function Signup() {
  const nav = useNavigate();
  const { setUser } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
   const [state, setState] = useState("");
   const [city, setCity] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const stateOptions = Object.keys(INDIAN_STATES_CITIES);
  const cityOptions = state ? INDIAN_STATES_CITIES[state] ?? [] : [];

  return (
    <div className="min-h-screen grid place-items-center bg-gradient-to-br from-amber-50 via-white to-sky-50 p-4">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-2 mb-6 justify-center">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-customer-amber to-customer-orange" />
          <div>
            <div className="text-sm font-semibold text-slate-900">Solar CRM</div>
            <div className="text-xs text-slate-500">Customer Portal</div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Create customer account</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              className="space-y-3"
              onSubmit={async (e) => {
                e.preventDefault();
                setError(null);
                if (password !== confirmPassword) {
                  setError("Passwords do not match");
                  return;
                }
                if (!state || !city) {
                  setError("Please select both state and city");
                  return;
                }
                setLoading(true);
                try {
                  const res = await api.post("/auth/signup", {
                    name,
                    email,
                    password,
                    phone,
                    state,
                    city,
                  });
                  localStorage.setItem("token", res.data.token);
                  setUser(res.data.user);
                  nav("/customer/dashboard");
                } catch (err: unknown) {
                  const msg =
                    (err as { response?: { data?: { message?: string } } })
                      ?.response?.data?.message ?? "Signup failed. Try again.";
                  setError(msg);
                } finally {
                  setLoading(false);
                }
              }}
            >
              <div className="space-y-1">
                <label className="text-xs text-slate-600">Name</label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Full name"
                  required
                />
              </div>
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
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="focus-within:ring-customer-orange"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-slate-600">Phone Number</label>
                <IconInput
                  icon={
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M7 2h10v20H7V2Z"
                        stroke="currentColor"
                        strokeWidth="2"
                      />
                      <path
                        d="M11 18h2"
                        stroke="currentColor"
                        strokeWidth="2"
                      />
                    </svg>
                  }
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 9876543210"
                  required
                  className="focus-within:ring-customer-orange"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-slate-600">State</label>
                  <select
                    className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-solar-blue"
                    value={state}
                    onChange={(e) => {
                      setState(e.target.value);
                      setCity("");
                    }}
                    required
                  >
                    <option value="">Select state</option>
                    {stateOptions.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-600">City</label>
                  <select
                    className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-solar-blue"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    required
                    disabled={!state}
                  >
                    <option value="">
                      {state ? "Select city" : "Select state first"}
                    </option>
                    {cityOptions.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
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
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  minLength={6}
                  required
                  className="focus-within:ring-customer-orange"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-slate-600">Confirm Password</label>
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
                      <path
                        d="m9 16 2 2 4-4"
                        stroke="currentColor"
                        strokeWidth="2"
                      />
                    </svg>
                  }
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  minLength={6}
                  required
                  className="focus-within:ring-customer-orange"
                />
              </div>
              {error && (
                <div className="text-sm text-red-600">{error}</div>
              )}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Creating…" : "Sign up"}
              </Button>

              <p className="text-xs text-slate-500 text-center">
                Already have an account?{" "}
                <Link to="/login" className="text-solar-blue hover:underline">
                  Sign in
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
