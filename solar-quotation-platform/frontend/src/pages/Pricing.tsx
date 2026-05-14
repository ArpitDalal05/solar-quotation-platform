import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { motion } from "framer-motion";
import { 
  Tag, 
  Info, 
  Settings2, 
  ArrowRight, 
  Zap, 
  ShieldCheck,
  TrendingDown,
  Layers
} from "lucide-react";

type Product = {
  id: number;
  name: string;
  category: string;
  brand: string;
  costPerWatt: number;
};

type PricingConfig = {
  structureTypeCost: number;
  cablingCostPerWatt: number;
  installationCostPerWatt: number;
  transportCost: number;
  marginPercent: number;
  gstRate: number;
};

export function Pricing() {
  const [products, setProducts] = useState<Product[]>([]);
  const [config, setConfig] = useState<PricingConfig | null>(null);
  const [systemSize, setSystemSize] = useState(5); // Default 5kW

  useEffect(() => {
    api.get("/pricing/products").then((r) => setProducts(r.data));
    api.get("/pricing/configs/latest").then((r) => setConfig(r.data));
  }, []);

  const calculateEstimate = (productCostPerWatt: number) => {
    if (!config) return 0;
    const capacityWatts = systemSize * 1000;
    const baseCost = capacityWatts * productCostPerWatt;
    const infrastructure = (config.cablingCostPerWatt + config.installationCostPerWatt) * capacityWatts;
    const totalBeforeMargin = baseCost + infrastructure + config.structureTypeCost + config.transportCost;
    const withMargin = totalBeforeMargin * (1 + config.marginPercent / 100);
    return withMargin * (1 + config.gstRate / 100);
  };

  return (
    <div className="space-y-10 pb-20">
      <header>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Products & Pricing</h1>
        <p className="text-slate-500 mt-1">Manage solar inventory and simulated pricing models.</p>
      </header>

      {/* Pricing Simulator */}
      <section className="bg-white rounded-3xl border border-slate-200 professional-shadow overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-3">
          <div className="p-8 lg:border-r border-slate-100 bg-slate-50/50">
            <div className="flex items-center gap-2 mb-6">
              <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                <Settings2 className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900">Pricing Simulator</h3>
            </div>
            <div className="space-y-6">
              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-3 underline decoration-blue-200 decoration-2 underline-offset-4">
                  Target System Capacity: {systemSize}kW
                </label>
                <input 
                  type="range" 
                  min="1" 
                  max="50" 
                  step="0.5"
                  value={systemSize}
                  onChange={(e) => setSystemSize(parseFloat(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <div className="flex justify-between text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-tighter">
                  <span>1kW</span>
                  <span>Residential</span>
                  <span>Industrial (50kW)</span>
                </div>
              </div>

              <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-3">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Margin Applied</span>
                  <span className="font-bold text-slate-900">{config?.marginPercent}%</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Tax (GST)</span>
                  <span className="font-bold text-slate-900">{config?.gstRate}%</span>
                </div>
                <div className="flex justify-between text-xs pt-2 border-t border-slate-50">
                  <span className="text-slate-500">Install Cost</span>
                  <span className="font-bold text-slate-900">₹{config?.installationCostPerWatt}/W</span>
                </div>
              </div>
              
              <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg text-[11px] text-blue-700">
                <Info className="w-4 h-4 mt-0.5 shrink-0" />
                <p>Prices fluctuate based on system scale and local logistics (transport/structure).</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 p-8 space-y-8">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <TrendingDown className="w-5 h-5 text-emerald-500" /> Live Projections
              </h3>
              <span className="text-[10px] font-black bg-emerald-100 text-emerald-700 px-2 py-1 rounded uppercase tracking-widest">
                Updated Real-time
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {products.slice(0, 4).map((product) => (
                <motion.div 
                  layout
                  key={product.id}
                  className="p-5 border border-slate-100 rounded-2xl bg-white professional-shadow hover:border-blue-200 transition-colors group"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{product.brand}</div>
                    <Zap className="w-4 h-4 text-blue-400 group-hover:text-blue-600 transition-colors" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 mb-1">{product.name}</h4>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-slate-900">
                      ₹{Math.round(calculateEstimate(product.costPerWatt)).toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="mt-4 pt-4 border-t border-slate-50 flex justify-between items-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Est. Total Pay</span>
                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 transition-all group-hover:translate-x-1" />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Catalog */}
      <section className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <h3 className="font-bold text-slate-900 flex items-center gap-2">
            <Layers className="w-5 h-5 text-blue-500" /> Full Catalog
          </h3>
          <button className="text-xs font-bold text-blue-600 hover:underline">Manage Products</button>
        </div>
        
        <div className="bg-white rounded-2xl border border-slate-200 professional-shadow overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase text-[10px] font-black tracking-widest">
                <th className="px-6 py-4">Brand / Product</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Unit Cost (W)</th>
                <th className="px-6 py-4">Reliability</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-900">{p.name}</p>
                    <p className="text-xs text-slate-400 tracking-tighter uppercase">{p.brand}</p>
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-600">{p.category}</td>
                  <td className="px-6 py-4 font-bold text-slate-900">₹{p.costPerWatt}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-emerald-600 text-xs font-bold">
                      <ShieldCheck className="w-3.5 h-3.5" /> A+ Tier
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
