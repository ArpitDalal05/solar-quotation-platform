import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";

type Customer = {
  id: number;
  name: string;
  location: string;
  state: string;
  electricityTariff: number;
  sanctionedLoad: number;
  contactNumber: string;
  email: string;
  followupStatus: string | null;
  notes: string | null;
};

const canEdit = (role: string) =>
  ["ADMIN", "SALES_EXECUTIVE", "MANAGER"].includes(role);
const canDelete = (role: string) => ["ADMIN", "MANAGER"].includes(role);

export function Customers() {
  const { user } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Customer | null>(null);
  const [form, setForm] = useState({
    name: "",
    location: "",
    state: "",
    electricity_tariff: "8",
    sanctioned_load: "5",
    contact_number: "",
    email: "",
    followup_status: "",
    notes: "",
  });

  const load = () => {
    api
      .get<Customer[]>("/customers")
      .then((r) => setCustomers(r.data))
      .catch(() => setError("Failed to load customers"))
      .finally(() => setLoading(false));
  };

  useEffect(() => load(), []);

  const resetForm = () => {
    setForm({
      name: "",
      location: "",
      state: "",
      electricity_tariff: "8",
      sanctioned_load: "5",
      contact_number: "",
      email: "",
      followup_status: "",
      notes: "",
    });
    setEditing(null);
    setShowForm(false);
  };

  const handleEdit = (c: Customer) => {
    setEditing(c);
    setForm({
      name: c.name,
      location: c.location,
      state: c.state,
      electricity_tariff: String(c.electricityTariff),
      sanctioned_load: String(c.sanctionedLoad),
      contact_number: c.contactNumber,
      email: c.email,
      followup_status: c.followupStatus || "",
      notes: c.notes || "",
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const body = {
      name: form.name,
      location: form.location,
      state: form.state,
      electricity_tariff: parseFloat(form.electricity_tariff) || 8,
      sanctioned_load: parseFloat(form.sanctioned_load) || 5,
      contact_number: form.contact_number,
      email: form.email,
      followup_status: form.followup_status || undefined,
      notes: form.notes || undefined,
    };
    try {
      if (editing) {
        await api.put(`/customers/${editing.id}`, body);
      } else {
        await api.post("/customers", body);
      }
      load();
      resetForm();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Failed to save";
      setError(msg);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this customer?")) return;
    try {
      await api.delete(`/customers/${id}`);
      load();
    } catch {
      setError("Failed to delete");
    }
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] bg-gradient-to-br from-amber-50/50 via-white to-orange-50/30 rounded-2xl">
      <div className="p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-amber-900">Customers</h1>
            <p className="text-amber-700/80 text-sm mt-1">
              Manage your solar installation leads and customers
            </p>
          </div>
          {canEdit(user?.role || "") && (
            <Button
              onClick={() => {
                resetForm();
                setShowForm(true);
              }}
              className="bg-customer-amber hover:bg-amber-600 text-white shadow-md"
            >
              + Add Customer
            </Button>
          )}
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">
            {error}
          </div>
        )}

        {showForm && canEdit(user?.role || "") && (
          <Card className="border-amber-200 bg-amber-50/30 shadow-lg">
            <CardHeader>
              <CardTitle className="text-amber-900">
                {editing ? "Edit Customer" : "New Customer"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-amber-800">
                      Name *
                    </label>
                    <Input
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Customer name"
                      required
                      className="border-amber-200 focus:ring-amber-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-amber-800">
                      Email *
                    </label>
                    <Input
                      type="email"
                      value={form.email}
                      onChange={(e) =>
                        setForm({ ...form, email: e.target.value })
                      }
                      placeholder="email@example.com"
                      required
                      className="border-amber-200 focus:ring-amber-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-amber-800">
                      Contact *
                    </label>
                    <Input
                      value={form.contact_number}
                      onChange={(e) =>
                        setForm({ ...form, contact_number: e.target.value })
                      }
                      placeholder="9876543210"
                      required
                      className="border-amber-200 focus:ring-amber-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-amber-800">
                      Location *
                    </label>
                    <Input
                      value={form.location}
                      onChange={(e) =>
                        setForm({ ...form, location: e.target.value })
                      }
                      placeholder="City / Area"
                      required
                      className="border-amber-200 focus:ring-amber-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-amber-800">
                      State *
                    </label>
                    <Input
                      value={form.state}
                      onChange={(e) =>
                        setForm({ ...form, state: e.target.value })
                      }
                      placeholder="e.g. Maharashtra"
                      required
                      className="border-amber-200 focus:ring-amber-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-amber-800">
                      Electricity Tariff (₹/kWh)
                    </label>
                    <Input
                      type="number"
                      step="0.01"
                      value={form.electricity_tariff}
                      onChange={(e) =>
                        setForm({ ...form, electricity_tariff: e.target.value })
                      }
                      className="border-amber-200 focus:ring-amber-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-amber-800">
                      Sanctioned Load (kW)
                    </label>
                    <Input
                      type="number"
                      step="0.1"
                      value={form.sanctioned_load}
                      onChange={(e) =>
                        setForm({ ...form, sanctioned_load: e.target.value })
                      }
                      className="border-amber-200 focus:ring-amber-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-amber-800">
                      Follow-up Status
                    </label>
                    <Input
                      value={form.followup_status}
                      onChange={(e) =>
                        setForm({ ...form, followup_status: e.target.value })
                      }
                      placeholder="New, Contacted, etc."
                      className="border-amber-200 focus:ring-amber-500"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-amber-800">
                    Notes
                  </label>
                  <textarea
                    value={form.notes}
                    onChange={(e) =>
                      setForm({ ...form, notes: e.target.value })
                    }
                    placeholder="Additional notes"
                    rows={2}
                    className="w-full rounded-md border border-amber-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    type="submit"
                    className="bg-customer-amber hover:bg-amber-600 text-white"
                  >
                    {editing ? "Update" : "Save"}
                  </Button>
                  <Button type="button" variant="secondary" onClick={resetForm}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <Card className="border-amber-100 overflow-hidden">
          <CardContent className="p-0">
            {loading ? (
              <div className="py-12 text-center text-amber-600">
                Loading…
              </div>
            ) : customers.length === 0 ? (
              <div className="py-12 text-center text-amber-700">
                No customers yet.{" "}
                {canEdit(user?.role || "") && (
                  <button
                    onClick={() => setShowForm(true)}
                    className="text-customer-amber font-medium hover:underline"
                  >
                    Add one
                  </button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-amber-100/80 text-amber-900">
                      <th className="py-3 px-4 text-left font-semibold">Name</th>
                      <th className="py-3 px-4 text-left font-semibold">
                        Contact
                      </th>
                      <th className="py-3 px-4 text-left font-semibold">
                        Location
                      </th>
                      <th className="py-3 px-4 text-left font-semibold">
                        Tariff
                      </th>
                      <th className="py-3 px-4 text-left font-semibold">
                        Status
                      </th>
                      {canEdit(user?.role || "") && (
                        <th className="py-3 px-4 text-right font-semibold">
                          Actions
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {customers.map((c) => (
                      <tr
                        key={c.id}
                        className="border-t border-amber-100 hover:bg-amber-50/50"
                      >
                        <td className="py-3 px-4 font-medium text-amber-900">
                          {c.name}
                        </td>
                        <td className="py-3 px-4 text-amber-800">
                          {c.contactNumber}
                        </td>
                        <td className="py-3 px-4 text-amber-800">
                          {c.location}, {c.state}
                        </td>
                        <td className="py-3 px-4 text-amber-800">
                          ₹{c.electricityTariff}/kWh
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded-full bg-amber-200/80 text-amber-900 text-xs">
                            {c.followupStatus || "—"}
                          </span>
                        </td>
                        {canEdit(user?.role || "") && (
                          <td className="py-3 px-4 text-right space-x-2">
                            <Button
                              variant="ghost"
                              className="text-customer-amber hover:bg-amber-100 h-8 text-xs"
                              onClick={() => handleEdit(c)}
                            >
                              Edit
                            </Button>
                            {canDelete(user?.role || "") && (
                              <Button
                                variant="ghost"
                                className="text-red-600 hover:bg-red-50 h-8 text-xs"
                                onClick={() => handleDelete(c.id)}
                              >
                                Delete
                              </Button>
                            )}
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
