import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { useAuth } from "../contexts/AuthContext";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

type Customer = { id: number; name: string; email?: string | null; contactNumber?: string | null };
type Calculation = {
  id: number;
  systemCapacityKw: number;
  annualGeneration: number;
  createdAt: string;
};
type Quotation = {
  id: number;
  quotationNumber: string;
  totalAmount: number;
  netPayableAmount: number;
  status: string;
  pdfUrl: string | null;
  createdAt: string;
  customer: { name: string; email?: string | null } | null;
  customerName: string;
  user?: { name: string };
};

export function Quotations() {
  const { user } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [calculations, setCalculations] = useState<Calculation[]>([]);
  const [quotations, setQuotations] = useState<Quotation[]>([]);

  const [customerId, setCustomerId] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [calculationId, setCalculationId] = useState("");
  const [subsidyPercent, setSubsidyPercent] = useState("0");
  const [electricityTariff, setElectricityTariff] = useState("8");

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [listError, setListError] = useState<string | null>(null);
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [addingCustomer, setAddingCustomer] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    name: "",
    location: "",
    state: "Maharashtra",
    electricity_tariff: "8",
    sanctioned_load: "5",
    contact_number: "",
    email: "",
  });

  const loadData = () => {
    api.get("/customers").then((r) => setCustomers(r.data)).catch(() => setCustomers([]));
    api
      .get("/quotations")
      .then((r) => setQuotations(r.data))
      .catch(() => {
        setQuotations([]);
        setListError("Failed to load quotations");
      });
  };

  useEffect(() => loadData(), []);

  useEffect(() => {
    if (!customerId) {
      setCalculations([]);
      setCalculationId("");
      if (user?.role === "SALES_EXECUTIVE") setCustomerName("");
      return;
    }

    const selected = customers.find((c) => String(c.id) === customerId);
    if (selected) setCustomerName(selected.name);

    api
      .get(`/calculations/by-customer/${customerId}`)
      .then((r) => setCalculations(r.data))
      .catch(() => setCalculations([]));
  }, [customerId, customers, user?.role]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError(null);
    setSaveSuccess(null);
    setSaving(true);

    const calcId = parseInt(calculationId, 10);
    if (!calcId) {
      setSaveError("Select a calculation");
      setSaving(false);
      return;
    }
    if (!customerId && !customerName.trim()) {
      setSaveError("Enter customer name or select an existing customer");
      setSaving(false);
      return;
    }

    try {
      await api.post("/quotations", {
        customer_id: customerId ? parseInt(customerId, 10) : undefined,
        customer_name: customerName.trim() || undefined,
        calculation_id: calcId,
        subsidy_percent: parseFloat(subsidyPercent) || 0,
        electricity_tariff: parseFloat(electricityTariff) || 8,
      });
      loadData();
      setCustomerId("");
      setCustomerName("");
      setCalculationId("");
      setSubsidyPercent("0");
      setSaveSuccess("Quotation created successfully.");
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Failed to save quotation";
      setSaveError(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddingCustomer(true);
    setSaveError(null);
    try {
      const res = await api.post("/customers", {
        ...newCustomer,
        electricity_tariff: parseFloat(newCustomer.electricity_tariff) || 8,
        sanctioned_load: parseFloat(newCustomer.sanctioned_load) || 5,
      });
      setCustomers((prev) => [res.data, ...prev]);
      setCustomerId(String(res.data.id));
      setShowAddCustomer(false);
      setNewCustomer({
        name: "",
        location: "",
        state: "Maharashtra",
        electricity_tariff: "8",
        sanctioned_load: "5",
        contact_number: "",
        email: "",
      });
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Failed to add customer";
      setSaveError(msg);
    } finally {
      setAddingCustomer(false);
    }
  };

  const handleDownload = (q: Quotation) => {
    if (!q.pdfUrl) return;
    const url = `${API_BASE}${q.pdfUrl}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="text-xl font-semibold text-slate-900">Quotations</div>
        <div className="text-sm text-slate-600">
          Create and download quotation PDFs
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Save New Quotation</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-slate-600">
                    Customer
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowAddCustomer(!showAddCustomer)}
                    className="text-xs text-solar-blue hover:underline"
                  >
                    {showAddCustomer ? "Cancel" : "+ Add customer"}
                  </button>
                </div>
                <select
                  className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-solar-blue"
                  value={customerId}
                  onChange={(e) => setCustomerId(e.target.value)}
                >
                  <option value="">Select customer</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                      {c.contactNumber ? ` (${c.contactNumber})` : ""}
                    </option>
                  ))}
                </select>
                {showAddCustomer && (
                  <form
                    onSubmit={handleAddCustomer}
                    className="mt-3 p-3 rounded-lg border border-slate-200 bg-slate-50 space-y-2"
                  >
                    <Input
                      placeholder="Name"
                      value={newCustomer.name}
                      onChange={(e) =>
                        setNewCustomer({ ...newCustomer, name: e.target.value })
                      }
                      required
                    />
                    <Input
                      type="email"
                      placeholder="Email"
                      value={newCustomer.email}
                      onChange={(e) =>
                        setNewCustomer({ ...newCustomer, email: e.target.value })
                      }
                      required
                    />
                    <Input
                      placeholder="Contact"
                      value={newCustomer.contact_number}
                      onChange={(e) =>
                        setNewCustomer({
                          ...newCustomer,
                          contact_number: e.target.value,
                        })
                      }
                      required
                    />
                    <Input
                      placeholder="Location"
                      value={newCustomer.location}
                      onChange={(e) =>
                        setNewCustomer({
                          ...newCustomer,
                          location: e.target.value,
                        })
                      }
                      required
                    />
                    <Input
                      placeholder="State"
                      value={newCustomer.state}
                      onChange={(e) =>
                        setNewCustomer({ ...newCustomer, state: e.target.value })
                      }
                    />
                    <div className="flex gap-2">
                      <Button
                        type="submit"
                        disabled={addingCustomer}
                        className="text-xs h-8"
                      >
                        {addingCustomer ? "Adding…" : "Add & Select"}
                      </Button>
                      <Button
                        type="button"
                        variant="secondary"
                        className="text-xs h-8"
                        onClick={() => setShowAddCustomer(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                )}
              </div>
              {user?.role === "SALES_EXECUTIVE" ? (
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-600">
                    Customer Name
                  </label>
                  <Input
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Enter customer name"
                    disabled={!!customerId}
                  />
                  <div className="text-xs text-slate-500">
                    {customerId
                      ? "Auto-filled from selected customer"
                      : "Required if no customer is selected"}
                  </div>
                </div>
              ) : null}
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-600">
                  Calculation
                </label>
                <select
                  className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-solar-blue"
                  value={calculationId}
                  onChange={(e) => setCalculationId(e.target.value)}
                  required
                >
                  <option value="">Select calculation</option>
                  {calculations.map((c) => (
                    <option key={c.id} value={c.id}>
                      Calculation #{c.id} – {c.systemCapacityKw}kW System – Saved on{" "}
                      {new Date(c.createdAt).toLocaleDateString()}
                    </option>
                  ))}
                </select>
                {!customerId ? (
                  <div className="text-xs text-slate-500">
                    Select a customer to see their saved calculations.
                  </div>
                ) : null}
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-600">
                  Subsidy (%)
                </label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={subsidyPercent}
                  onChange={(e) => setSubsidyPercent(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-600">
                  Electricity Tariff (₹/kWh)
                </label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={electricityTariff}
                  onChange={(e) => setElectricityTariff(e.target.value)}
                />
              </div>
            </div>
            {saveError && (
              <div className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-md">
                {saveError}
              </div>
            )}
            {saveSuccess && (
              <div className="text-sm text-emerald-700 bg-emerald-50 px-3 py-2 rounded-md">
                {saveSuccess}
              </div>
            )}
            <Button type="submit" disabled={saving}>
              {saving ? "Saving…" : "Save Quotation"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Quotation List</CardTitle>
        </CardHeader>
        <CardContent>
          {listError && (
            <div className="text-sm text-amber-600 mb-4">{listError}</div>
          )}
          {quotations.length === 0 ? (
            <div className="text-sm text-slate-500 py-8 text-center">
              No quotations yet. Create one above.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-slate-600">
                    <th className="py-3 px-2 font-medium">Quotation #</th>
                    <th className="py-3 px-2 font-medium">Customer</th>
                    <th className="py-3 px-2 font-medium">Net Amount</th>
                    <th className="py-3 px-2 font-medium">Status</th>
                    <th className="py-3 px-2 font-medium">Date</th>
                    <th className="py-3 px-2 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {quotations.map((q) => (
                    <tr key={q.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-3 px-2 font-medium">{q.quotationNumber}</td>
                      <td className="py-3 px-2">{q.customer?.name ?? q.customerName}</td>
                      <td className="py-3 px-2">
                        ₹{q.netPayableAmount.toLocaleString("en-IN")}
                      </td>
                      <td className="py-3 px-2">
                        <span
                          className={
                            q.status === "ACCEPTED"
                              ? "text-emerald-600"
                              : q.status === "REJECTED"
                              ? "text-red-600"
                              : "text-slate-600"
                          }
                        >
                          {q.status}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-slate-500">
                        {new Date(q.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-2">
                        <Button
                          variant="secondary"
                          disabled={!q.pdfUrl}
                          onClick={() => handleDownload(q)}
                          className="text-xs h-8"
                        >
                          {q.pdfUrl ? "Download PDF" : "No PDF"}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
