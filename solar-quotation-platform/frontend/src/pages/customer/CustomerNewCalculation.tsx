import { useState } from "react";
import { api } from "../../lib/api";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";

type SolarResult = {
  location: string;
  irradiance: number;
  systemCapacity_kW: number;
  numberOfPanels: number;
  annualGeneration_kWh: number;
  annualSavings: number;
  totalSystemCost: number;
  paybackPeriod_years: number;
  fallback?: string;
};

export function CustomerNewCalculation() {
  const [city, setCity] = useState("Pune");
  const [monthlyConsumption, setMonthlyConsumption] = useState("300");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [result, setResult] = useState<SolarResult | null>(null);

  const handleCalculate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setResult(null);
    setLoading(true);
    try {
      const res = await api.post<SolarResult>("/solar-calc", {
        city: city.trim(),
        monthlyConsumption: parseFloat(monthlyConsumption) || 0,
      });
      setResult(res.data);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Calculation failed. Try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!result) return;
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      await api.post("/calculations/save", {
        monthly_consumption: parseFloat(monthlyConsumption) || 0,
        irradiance: result.irradiance,
        system_capacity_kw: result.systemCapacity_kW,
        number_of_panels: result.numberOfPanels,
        annual_generation: result.annualGeneration_kWh,
        annual_savings: result.annualSavings,
        total_system_cost: result.totalSystemCost,
        payback_years: result.paybackPeriod_years,
      });
      setSuccess("Calculation saved successfully.");
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Failed to save calculation";
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="text-2xl font-semibold text-slate-900">New Calculation</div>
        <div className="text-sm text-slate-600">
          Enter your city and monthly consumption to estimate your system.
        </div>
      </div>

      <Card className="hover:shadow-md transition-shadow">
        <CardHeader>
          <CardTitle>Inputs</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCalculate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">City</label>
                <Input
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Pune"
                  required
                  className="focus:ring-customer-orange"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">
                  Monthly Consumption (kWh)
                </label>
                <Input
                  type="number"
                  min="1"
                  step="0.01"
                  value={monthlyConsumption}
                  onChange={(e) => setMonthlyConsumption(e.target.value)}
                  required
                  className="focus:ring-customer-orange"
                />
              </div>
            </div>

            {error && (
              <div className="text-sm text-red-700 bg-red-50 px-3 py-2 rounded-md">
                {error}
              </div>
            )}
            {success && (
              <div className="text-sm text-emerald-700 bg-emerald-50 px-3 py-2 rounded-md">
                {success}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="bg-customer-orange hover:bg-orange-700"
            >
              {loading ? "Calculating…" : "Calculate"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {result && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle>System Capacity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold text-slate-900">
                {result.systemCapacity_kW} kW
              </div>
              <div className="text-xs text-slate-500 mt-1">
                {result.numberOfPanels} panels · {result.irradiance} kWh/m²/day
              </div>
            </CardContent>
          </Card>
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle>Annual Generation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold text-slate-900">
                {result.annualGeneration_kWh.toLocaleString()} kWh
              </div>
              <div className="text-xs text-slate-500 mt-1">
                Location: {result.location}
              </div>
            </CardContent>
          </Card>
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle>Annual Savings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold text-emerald-700">
                ₹{result.annualSavings.toLocaleString("en-IN")}
              </div>
            </CardContent>
          </Card>
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle>Total Cost</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold text-slate-900">
                ₹{result.totalSystemCost.toLocaleString("en-IN")}
              </div>
              <div className="text-xs text-slate-500 mt-1">
                Payback: {result.paybackPeriod_years} years
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {result && (
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle>Save</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-sm text-slate-600">
              Save this calculation to reuse it in quotations.
              {result.fallback ? (
                <span className="ml-2 text-amber-700">{result.fallback}</span>
              ) : null}
            </div>
            <Button
              variant="secondary"
              onClick={handleSave}
              disabled={saving}
              className="border-amber-200 hover:bg-amber-50"
            >
              {saving ? "Saving…" : "Save Calculation"}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

