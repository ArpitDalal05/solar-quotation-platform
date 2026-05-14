import { useState, useEffect } from "react";
import { api } from "../lib/api";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";

type SolarResult = {
  location: string;
  irradiance: number;
  systemCapacity_kW: number;
  numberOfPanels: number;
  annualGeneration_kWh: number;
  annualSavings: number;
  totalSystemCost: number;
  paybackPeriod_years: number;
  weather?: {
    temperature: number;
    cloudCover: number;
    sunrise: string;
    sunset: string;
    coordinates: { lat: number; lon: number };
  } | null;
  fallback?: string;
};

export function SolarCalculation() {
  const [city, setCity] = useState("Pune");
  const [state, setState] = useState("Maharashtra");
  const [monthlyConsumption, setMonthlyConsumption] = useState("300");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [electricityRate, setElectricityRate] = useState("8");
  const [panelWattage, setPanelWattage] = useState("400");
  const [efficiency, setEfficiency] = useState("0.75");
  const [costPerWatt, setCostPerWatt] = useState("80");
  const [installationMultiplier, setInstallationMultiplier] = useState("0.1");
  const [gstRate, setGstRate] = useState("0.18");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SolarResult | null>(null);
  const [customers, setCustomers] = useState<{ id: number; name: string }[]>([]);
  const [savingCalc, setSavingCalc] = useState(false);
  const [saveCalcCustomerId, setSaveCalcCustomerId] = useState("");
  const [saveCalcSuccess, setSaveCalcSuccess] = useState(false);

  useEffect(() => {
    api.get("/customers").then((r) => setCustomers(r.data)).catch(() => {});
  }, []);

  const handleSaveCalculation = async () => {
    if (!result) return;
    setSavingCalc(true);
    setError(null);
    setSaveCalcSuccess(false);
    try {
      await api.post("/calculations/from-solar-calc", {
        customer_id: saveCalcCustomerId ? parseInt(saveCalcCustomerId, 10) : undefined,
        state,
        roof_type: "RCC",
        monthly_bill: parseFloat(monthlyConsumption) || undefined,
        systemCapacity_kW: result.systemCapacity_kW,
        numberOfPanels: result.numberOfPanels,
        annualGeneration_kWh: result.annualGeneration_kWh,
      });
      setSaveCalcSuccess(true);
      setSaveCalcCustomerId("");
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Failed to save";
      setError(msg);
    } finally {
      setSavingCalc(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResult(null);
    setSaveCalcSuccess(false);
    setLoading(true);

    const body: Record<string, number | string> = {
      city: city.trim(),
      monthlyConsumption: parseFloat(monthlyConsumption) || 0,
    };

    if (showAdvanced) {
      body.electricityRate = parseFloat(electricityRate) || 8;
      body.panelWattage = parseFloat(panelWattage) || 400;
      body.efficiency = parseFloat(efficiency) || 0.75;
      body.costPerWatt = parseFloat(costPerWatt) || 80;
      body.installationMultiplier = parseFloat(installationMultiplier) || 0.1;
      body.gstRate = parseFloat(gstRate) || 0.18;
    }

    try {
      const res = await api.post<SolarResult>("/solar-calc", body);
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

  return (
    <div className="space-y-6">
      <div>
        <div className="text-xl font-semibold text-slate-900">
          Solar Calculation
        </div>
        <div className="text-sm text-slate-600">
          Enter location and consumption to get system sizing and financial estimates
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Input</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-600">
                  City
                </label>
                <Input
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Pune, Mumbai"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-600">
                  State
                </label>
                <Input
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  placeholder="e.g. Maharashtra"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-600">
                  Monthly Consumption (kWh)
                </label>
                <Input
                  type="number"
                  step="0.01"
                  min="1"
                  value={monthlyConsumption}
                  onChange={(e) => setMonthlyConsumption(e.target.value)}
                  placeholder="e.g. 300"
                  required
                />
              </div>
            </div>

            <button
              type="button"
              className="text-xs text-solar-blue hover:underline"
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              {showAdvanced ? "Hide" : "Show"} advanced parameters
            </button>

            {showAdvanced && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2 border-t border-slate-100">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-600">
                    Electricity Rate (₹/kWh)
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={electricityRate}
                    onChange={(e) => setElectricityRate(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-600">
                    Panel Wattage (W)
                  </label>
                  <Input
                    type="number"
                    step="1"
                    min="1"
                    value={panelWattage}
                    onChange={(e) => setPanelWattage(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-600">
                    Efficiency (0–1)
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    max="1"
                    value={efficiency}
                    onChange={(e) => setEfficiency(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-600">
                    Cost per Watt (₹)
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={costPerWatt}
                    onChange={(e) => setCostPerWatt(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-600">
                    Installation Multiplier (0–1)
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    max="1"
                    value={installationMultiplier}
                    onChange={(e) => setInstallationMultiplier(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-600">
                    GST Rate (0–1, e.g. 0.18)
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    max="1"
                    value={gstRate}
                    onChange={(e) => setGstRate(e.target.value)}
                  />
                </div>
              </div>
            )}

            {error && (
              <div className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-md">
                {error}
              </div>
            )}

            <Button type="submit" disabled={loading}>
              {loading ? "Calculating…" : "Calculate"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {result && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>System Capacity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold text-solar-blue">
                {result.systemCapacity_kW} kW
              </div>
              <div className="text-xs text-slate-500 mt-1">
                {result.numberOfPanels} panels × {result.irradiance} kWh/m²/day
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Annual Generation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">
                {result.annualGeneration_kWh.toLocaleString()} kWh
              </div>
              <div className="text-xs text-slate-500 mt-1">
                Location: {result.location}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Annual Savings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold text-solar-green">
                ₹{result.annualSavings.toLocaleString("en-IN")}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Total Cost</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">
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
        <Card>
          <CardHeader>
            <CardTitle>Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-slate-500">Location</span>
                <div className="font-medium">{result.location}</div>
              </div>
              <div>
                <span className="text-slate-500">Irradiance</span>
                <div className="font-medium">{result.irradiance} kWh/m²/day</div>
              </div>
              <div>
                <span className="text-slate-500">Panels</span>
                <div className="font-medium">{result.numberOfPanels}</div>
              </div>
              <div>
                <span className="text-slate-500">Payback Period</span>
                <div className="font-medium">{result.paybackPeriod_years} years</div>
              </div>
            </div>
            {result.weather && (
              <div className="pt-3 border-t border-slate-100 text-sm text-slate-600">
                <span className="font-medium">Weather:</span> Temp {result.weather.temperature}°C,
                Cloud cover {result.weather.cloudCover}%
              </div>
            )}
            {result.fallback && (
              <div className="text-amber-600 text-sm">{result.fallback}</div>
            )}
            <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center gap-3">
              <span className="text-sm font-medium">Save calculation:</span>
              <select
                value={saveCalcCustomerId}
                onChange={(e) => setSaveCalcCustomerId(e.target.value)}
                className="h-9 rounded-md border border-slate-200 px-3 text-sm"
              >
                <option value="">No customer (optional)</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <Button
                variant="secondary"
                onClick={handleSaveCalculation}
                disabled={savingCalc}
              >
                {savingCalc ? "Saving…" : "Save Calculation"}
              </Button>
              {saveCalcSuccess && (
                <span className="text-sm text-solar-green">Saved! Use in Quotations.</span>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
