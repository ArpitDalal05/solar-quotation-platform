import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { useAuth } from "../contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FileText, 
  Download, 
  CheckCircle, 
  Plus, 
  UserPlus,
  AlertCircle,
  ChevronDown,
  User,
  History
} from "lucide-react";
import clsx from "clsx";

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
  customer: { id: number; name: string; email?: string | null } | null;
  customerName: string;
  user?: { name: string };
};

export function Quotations() {
  const { user } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [calculations, setCalculations] = useState<Calculation[]>([]);
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [expandedCustomer, setExpandedCustomer] = useState<string | number | null>(null);

  const [customerId, setCustomerId] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [calculationId, setCalculationId] = useState("");
  const [subsidyPercent, setSubsidyPercent] = useState("0");
  const [electricityTariff, setElectricityTariff] = useState("8");

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  const isStaff = user?.role === "ADMIN" || user?.role === "MANAGER" || user?.role === "SALES_EXECUTIVE";

  const loadData = () => {
    if (isStaff) {
      api.get("/customers").then((r) => setCustomers(r.data)).catch(() => setCustomers([]));
      api.get("/quotations").then((r) => setQuotations(r.data)).catch(() => setQuotations([]));
    } else {
      api.get("/quotations/my").then((r) => setQuotations(r.data)).catch(() => setQuotations([]));
    }
  };

  useEffect(() => loadData(), [isStaff]);

  useEffect(() => {
    if (!customerId) {
      setCalculations([]);
      setCalculationId("");
      return;
    }
    api.get(`/calculations/by-customer/${customerId}`)
      .then((r) => setCalculations(r.data))
      .catch(() => setCalculations([]));
  }, [customerId]);

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

    try {
      await api.post("/quotations", {
        customer_id: customerId ? parseInt(customerId, 10) : undefined,
        calculation_id: calcId,
        subsidy_percent: parseFloat(subsidyPercent) || 0,
        electricity_tariff: parseFloat(electricityTariff) || 8,
      });
      loadData();
      setCalculationId("");
      setSaveSuccess("Proposal generated successfully.");
    } catch (err: any) {
      setSaveError(err.response?.data?.message || "Failed to save quotation");
    } finally {
      setSaving(false);
    }
  };

  const markAsSold = async (id: number) => {
    try {
      await api.patch(`/quotations/${id}/status`, { status: "ACCEPTED" });
      loadData();
    } catch (err) {
      alert("Failed to update status");
    }
  };

  const handleDownload = (q: Quotation) => {
    if (!q.pdfUrl) return;
    const url = q.pdfUrl.startsWith("http") ? q.pdfUrl : `${API_BASE}${q.pdfUrl}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const groupedQuotations = quotations.reduce((acc: any, q) => {
    const key = q.customer?.id || q.customerName;
    if (!acc[key]) acc[key] = { 
      name: q.customer?.name || q.customerName, 
      items: [],
      id: q.customer?.id || null 
    };
    acc[key].items.push(q);
    return acc;
  }, {});

  return (
    <div className="space-y-8 pb-20">
      <header>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Quotations</h1>
        <p className="text-slate-500 mt-1">Generate and manage official solar proposals.</p>
      </header>

      {isStaff && (
        <Card className="border-blue-100 bg-white professional-shadow">
          <CardHeader className="border-b border-slate-50">
            <CardTitle className="text-lg flex items-center gap-2">
              <Plus className="w-5 h-5 text-blue-500" /> Draft New Proposal
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSave} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Customer Entity</label>
                  <select
                    className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    value={customerId}
                    onChange={(e) => setCustomerId(e.target.value)}
                  >
                    <option value="">Select Existing Customer</option>
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Calculation Node</label>
                  <select
                    className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    value={calculationId}
                    onChange={(e) => setCalculationId(e.target.value)}
                    required
                  >
                    <option value="">Select Calculation</option>
                    {calculations.map((c) => (
                      <option key={c.id} value={c.id}>#{c.id} - {c.systemCapacityKw}kW ({new Date(c.createdAt).toLocaleDateString()})</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Subsidy (%)</label>
                  <Input
                    type="number"
                    value={subsidyPercent}
                    onChange={(e) => setSubsidyPercent(e.target.value)}
                    className="h-11 rounded-xl border-slate-200 bg-slate-50"
                  />
                </div>
              </div>

              {saveError && <div className="text-red-600 text-sm font-medium">! {saveError}</div>}
              {saveSuccess && <div className="text-emerald-600 text-sm font-medium">✓ {saveSuccess}</div>}

              <Button type="submit" disabled={saving} className="bg-blue-600 hover:bg-blue-700 text-white h-11 px-8 rounded-xl font-bold shadow-lg shadow-blue-100">
                {saving ? "Generating..." : "Generate Proposal"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest px-1 flex items-center gap-2">
          <History className="w-4 h-4" /> Quotation Repository
        </h3>
        
        {Object.keys(groupedQuotations).length === 0 ? (
          <div className="bg-white p-12 text-center rounded-2xl border border-dashed border-slate-200">
            <p className="text-slate-400 font-medium italic">No quotation history recorded yet.</p>
          </div>
        ) : (
          Object.keys(groupedQuotations).map((key) => {
            const group = groupedQuotations[key];
            const isExpanded = expandedCustomer === key;

            return (
              <div key={key} className="bg-white rounded-2xl border border-slate-200 professional-shadow overflow-hidden">
                <button 
                  onClick={() => setExpandedCustomer(isExpanded ? null : key)}
                  className="w-full p-5 flex items-center justify-between hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-sm">
                      {group.name.charAt(0)}
                    </div>
                    <div className="text-left">
                      <h4 className="font-bold text-slate-900">{group.name}</h4>
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-tighter">
                        {group.items.length} Version{group.items.length > 1 ? 's' : ''} available
                      </p>
                    </div>
                  </div>
                  <ChevronDown className={clsx("w-5 h-5 text-slate-400 transition-all", isExpanded && "rotate-180")} />
                </button>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden bg-slate-50/30">
                      <div className="p-0 border-t border-slate-50">
                        <table className="w-full text-left text-sm">
                          <tbody className="divide-y divide-slate-100">
                            {group.items.map((q: Quotation) => (
                              <tr key={q.id} className="hover:bg-white transition-colors">
                                <td className="px-6 py-4">
                                  <p className="font-bold text-slate-900 text-xs">{q.quotationNumber}</p>
                                  <p className="text-[10px] text-slate-400 font-medium">{new Date(q.createdAt).toLocaleDateString()}</p>
                                </td>
                                <td className="px-6 py-4 font-black text-slate-900">₹{q.netPayableAmount.toLocaleString("en-IN")}</td>
                                <td className="px-6 py-4">
                                  <span className={clsx(
                                    "px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider",
                                    q.status === "ACCEPTED" ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-600"
                                  )}>
                                    {q.status}
                                  </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                  <div className="flex justify-end gap-3">
                                    <Button
                                      onClick={() => handleDownload(q)}
                                      className="h-9 px-4 text-[11px] font-bold uppercase bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-100 rounded-xl flex items-center gap-2"
                                    >
                                      <Download className="w-3.5 h-3.5" /> PDF
                                    </Button>
                                    {isStaff && q.status !== "ACCEPTED" && (
                                      <Button
                                        onClick={() => markAsSold(q.id)}
                                        className="h-9 px-4 text-[11px] font-bold uppercase bg-emerald-600 text-white hover:bg-emerald-700 rounded-xl shadow-lg shadow-emerald-100 flex items-center gap-2"
                                      >
                                        <CheckCircle className="w-3.5 h-3.5" /> Mark Sold
                                      </Button>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
