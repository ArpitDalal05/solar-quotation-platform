import { Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { Layout } from "./components/Layout";
import { CustomerLayout } from "./components/CustomerLayout";
import { Login } from "./pages/Login";
import { Signup } from "./pages/Signup";
import { Dashboard } from "./pages/Dashboard";
import { Placeholder } from "./pages/Placeholder";
import { Customers } from "./pages/Customers";
import { Quotations } from "./pages/Quotations";
import { SolarCalculation } from "./pages/SolarCalculation";
import { useAuth } from "./contexts/AuthContext";
import { CustomerDashboard } from "./pages/customer/CustomerDashboard";
import { CustomerNewCalculation } from "./pages/customer/CustomerNewCalculation";
import { CustomerSavedCalculations } from "./pages/customer/CustomerSavedCalculations";
import { CustomerQuotations } from "./pages/customer/CustomerQuotations";
import { CustomerProfile } from "./pages/customer/CustomerProfile";

function RequireAuth({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function HomeRedirect() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user?.role === "CUSTOMER") return <Navigate to="/customer/dashboard" replace />;
  return <Navigate to="/dashboard" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      <Route
        path="/"
        element={
          <RequireAuth>
            <HomeRedirect />
          </RequireAuth>
        }
      >
      </Route>

      <Route
        path="/"
        element={
          <RequireAuth>
            <Layout />
          </RequireAuth>
        }
      >
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="customers" element={<Customers />} />
        <Route path="calculations" element={<SolarCalculation />} />
        <Route path="quotations" element={<Quotations />} />
        <Route path="pricing" element={<Placeholder title="Products & Pricing" />} />
        <Route path="reports" element={<Placeholder title="Reporting" />} />
      </Route>

      <Route
        path="/customer"
        element={
          <RequireAuth>
            <CustomerLayout />
          </RequireAuth>
        }
      >
        <Route index element={<Navigate to="/customer/dashboard" replace />} />
        <Route path="dashboard" element={<CustomerDashboard />} />
        <Route path="new" element={<CustomerNewCalculation />} />
        <Route path="saved" element={<CustomerSavedCalculations />} />
        <Route path="quotations" element={<CustomerQuotations />} />
        <Route path="profile" element={<CustomerProfile />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </AuthProvider>
  );
}

