import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";

type SavedCalc = {
  id: number;
  systemCapacityKw: number;
  panels: number;
  annualGeneration: number;
  annualSavings: number;
  totalCost: number;
  payback: number;
  createdAt: string;
};

export function CustomerSavedCalculations() {
  const [rows, setRows] = useState<SavedCalc[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get("/calculations/my")
      .then((r) => setRows(r.data))
      .catch(() => setError("Failed to load saved calculations"));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <div className="text-2xl font-semibold text-slate-900">Saved Calculations</div>
        <div className="text-sm text-slate-600">
          Your saved solar estimates (tap any to reuse when sales creates a quotation).
        </div>
      </div>

      {error ? (
        <div className="text-sm text-amber-700 bg-amber-50 px-3 py-2 rounded-md">
          {error}
        </div>
      ) : null}

      {rows.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-slate-500">
            No saved calculations yet.
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rows.map((c) => (
            <Card key={c.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle>Calculation #{c.id}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">System</span>
                  <span className="font-medium">{c.systemCapacityKw} kW</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Panels</span>
                  <span className="font-medium">{c.panels}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Annual generation</span>
                  <span className="font-medium">
                    {c.annualGeneration.toLocaleString()} kWh
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Annual savings</span>
                  <span className="font-medium text-emerald-700">
                    ₹{c.annualSavings.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Total cost</span>
                  <span className="font-medium">
                    ₹{c.totalCost.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Payback</span>
                  <span className="font-medium">{c.payback} yrs</span>
                </div>
                <div className="pt-2 border-t border-slate-100 text-xs text-slate-500">
                  Saved on {new Date(c.createdAt).toLocaleDateString()}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

