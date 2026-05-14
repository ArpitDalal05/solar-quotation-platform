import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import { useAuth } from "../contexts/AuthContext";
import { motion } from "framer-motion";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

type AdminDashboardData = {
  totalQuotations: number;
  monthlySalesPipeline: number;
  conversionRatio: number;
  revenueForecast: number;
  salesExecutivePerformance: Array<{
    userId: number;
    _count: { _all: number };
    _sum: { netPayableAmount: number | null };
  }>;
};

type SalesDashboardData = {
  totalQuotations: number;
  monthlyPipeline: number;
  totalValue: number;
  recentQuotations: Array<{
    id: number;
    quotationNumber: string;
    netPayableAmount: number;
    customer: { name: string };
  }>;
};

// Abstracted Chaos Card for reuse
function ChaosCard({ children, delay = 0, rotate = 0, className = "" }: { children: React.ReactNode, delay?: number, rotate?: number, className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50, rotate: rotate + 10 }}
      animate={{ opacity: 1, y: 0, rotate: rotate }}
      transition={{ type: "spring", bounce: 0.6, delay }}
      whileHover={{ scale: 1.05, rotate: rotate === 0 ? 2 : rotate - 2, zIndex: 50 }}
      className={`glass-panel p-6 rounded-2xl chaos-border chaos-shadow relative group ${className}`}
    >
      <div className="absolute inset-0 bg-fuchsia-500/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none rounded-2xl" />
      {children}
    </motion.div>
  );
}

export function Dashboard() {
  const { user } = useAuth();
  const [adminData, setAdminData] = useState<AdminDashboardData | null>(null);
  const [salesData, setSalesData] = useState<SalesDashboardData | null>(null);

  const isSalesRole =
    user?.role === "SALES_EXECUTIVE" || user?.role === "DESIGN_ENGINEER";

  useEffect(() => {
    if (isSalesRole) {
      api
        .get("/reports/sales-dashboard")
        .then((r) => setSalesData(r.data))
        .catch(() => setSalesData(null));
    } else {
      api
        .get("/reports/dashboard")
        .then((r) => setAdminData(r.data))
        .catch(() => setAdminData(null));
    }
  }, [isSalesRole]);

  if (isSalesRole) {
    return (
      <div className="space-y-12 pb-20">
        <motion.div 
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="relative z-10"
        >
          <div className="text-4xl md:text-6xl font-black text-fuchsia-400 glitch-text uppercase tracking-tighter" data-text="SALES_UPLINK">
            SALES_UPLINK
          </div>
          <div className="text-xl text-lime-300 mt-2 bg-black inline-block px-2 transform -rotate-1">
            &gt; IDENT_CONFIRMED: {user?.name}. PIPELINE_ACTIVE.
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <ChaosCard delay={0.1} rotate={-2}>
            <div className="text-sm font-bold text-fuchsia-400 mb-2 uppercase">[MY_QUOTATIONS]</div>
            <div className="text-5xl font-black">
              {salesData?.totalQuotations ?? "ERR_"}
            </div>
            <div className="absolute -bottom-4 -right-4 text-8xl opacity-10 blur-sm pointer-events-none">#</div>
          </ChaosCard>
          
          <ChaosCard delay={0.2} rotate={1}>
            <div className="text-sm font-bold text-fuchsia-400 mb-2 uppercase">[THIS_MONTH_TGT]</div>
            <div className="text-5xl font-black">
              {salesData?.monthlyPipeline ?? "ERR_"}
            </div>
            <div className="text-xs text-lime-500 mt-2 uppercase tracking-widest">&gt;&gt; cycles</div>
          </ChaosCard>

          <ChaosCard delay={0.3} rotate={-1} className="md:col-span-1 md:row-span-2 bg-fuchsia-900/20">
            <div className="text-sm font-bold text-fuchsia-400 mb-2 uppercase">[TOTAL_VALUE_EXTRACTED]</div>
            <div className="text-4xl lg:text-6xl font-black text-lime-400 break-words">
              {salesData
                ? `â‚¹${salesData.totalValue.toLocaleString("en-IN")}`
                : "ERR_"}
            </div>
            <motion.div 
              animate={{ rotate: 360 }} 
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              className="absolute -top-10 -right-10 w-32 h-32 border-4 border-dashed border-fuchsia-500 rounded-full opacity-20 pointer-events-none"
            />
          </ChaosCard>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <ChaosCard delay={0.4} className="md:col-span-2">
            <div className="text-xl font-bold text-fuchsia-400 mb-6 uppercase glitch-text" data-text="[RECENT_LOGS]">[RECENT_LOGS]</div>
            {salesData?.recentQuotations?.length ? (
              <ul className="space-y-4">
                {salesData.recentQuotations.map((q, i) => (
                  <motion.li
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.5 + i * 0.1 }}
                    key={q.id}
                    className="flex justify-between items-center p-4 bg-black/50 border border-lime-400/30 hover:border-fuchsia-500 transition-colors group cursor-crosshair"
                  >
                    <span className="font-bold text-fuchsia-300 group-hover:text-fuchsia-400 transition-colors">{q.quotationNumber}</span>
                    <span className="text-lime-100 uppercase tracking-widest text-xs md:text-sm">{q.customer.name}</span>
                    <span className="font-mono bg-lime-400 text-black px-2 py-1 font-bold transform group-hover:scale-110 transition-transform">
                      â‚¹{q.netPayableAmount.toLocaleString("en-IN")}
                    </span>
                  </motion.li>
                ))}
              </ul>
            ) : (
              <div className="text-sm text-lime-500/50 py-8 text-center uppercase tracking-[0.5em]">
                &lt; NO_DATA_STREAM_FOUND &gt;<br/>
                <Link to="/quotations" className="text-fuchsia-400 hover:text-fuchsia-300 hover:underline mt-4 inline-block font-bold">
                  [INITIATE_NEW_SEQUENCE]
                </Link>
              </div>
            )}
          </ChaosCard>

          <div className="flex flex-col gap-4">
            {[
              { to: "/customers", label: "CUST_DB", desc: "Manage entity records" },
              { to: "/calculations", label: "SYS_SIZE", desc: "Compute matrix" },
              { to: "/quotations", label: "GEN_PDF", desc: "Compile physical report" }
            ].map((link, i) => (
              <Link key={link.to} to={link.to}>
                <motion.div
                  whileHover={{ scale: 1.02, x: 10 }}
                  className="p-4 border-2 border-lime-400 bg-black hover:bg-lime-400 hover:text-black transition-all group"
                >
                  <div className="font-black uppercase text-xl group-hover:text-black text-fuchsia-400">{link.label}</div>
                  <div className="text-xs font-mono uppercase group-hover:text-black/70 text-lime-500 mt-1">&gt; {link.desc}</div>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const perf =
    adminData?.salesExecutivePerformance?.map((p) => ({
      name: `USR_${p.userId}`,
      quotations: p._count._all,
      revenue: p._sum.netPayableAmount ?? 0,
    })) ?? [];

  return (
    <div className="space-y-12 pb-20">
      <motion.div 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative z-10"
      >
        <div className="text-4xl md:text-7xl font-black text-lime-400 glitch-text uppercase tracking-tighter" data-text="O_V_E_R_S_E_E_R">
          O_V_E_R_S_E_E_R
        </div>
        <div className="text-lg md:text-xl text-fuchsia-400 mt-2 inline-block border-b-2 border-fuchsia-400">
          // GLOBAL_METRICS_AND_FORECAST_NODES
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <ChaosCard delay={0.1} rotate={-1}>
          <div className="text-xs font-bold text-fuchsia-400 mb-2 uppercase tracking-widest">_TOTAL_QUOTES</div>
          <div className="text-5xl font-black text-white mix-blend-difference">
            {adminData?.totalQuotations ?? "NULL"}
          </div>
        </ChaosCard>
        
        <ChaosCard delay={0.2} rotate={2} className="bg-lime-900/20">
          <div className="text-xs font-bold text-fuchsia-400 mb-2 uppercase tracking-widest">_MTH_PIPELINE</div>
          <div className="text-5xl font-black text-lime-300">
            {adminData?.monthlySalesPipeline ?? "NULL"}
          </div>
        </ChaosCard>
        
        <ChaosCard delay={0.3} rotate={-2}>
          <div className="text-xs font-bold text-fuchsia-400 mb-2 uppercase tracking-widest">_CONV_RATIO</div>
          <div className="text-5xl font-black">
            {adminData ? `${Math.round(adminData.conversionRatio * 100)}%` : "NULL"}
          </div>
          <motion.div 
            className="h-2 bg-fuchsia-500 mt-4" 
            initial={{ width: 0 }}
            animate={{ width: adminData ? `${Math.round(adminData.conversionRatio * 100)}%` : 0 }}
            transition={{ duration: 1, delay: 0.5 }}
          />
        </ChaosCard>
        
        <ChaosCard delay={0.4} rotate={1} className="border-fuchsia-500">
          <div className="text-xs font-bold text-lime-400 mb-2 uppercase tracking-widest">_REV_FORECAST</div>
          <div className="text-4xl font-black text-fuchsia-400">
            {adminData ? `â‚¹${Math.round(adminData.revenueForecast).toLocaleString("en-IN")}` : "NULL"}
          </div>
        </ChaosCard>
      </div>

      <ChaosCard delay={0.5} rotate={0} className="border-4">
        <div className="text-xl font-bold text-fuchsia-400 mb-6 uppercase tracking-[0.2em] glitch-text" data-text="PERF_MATRIX">
          [PERF_MATRIX]
        </div>
        <div style={{ height: 400 }} className="relative">
          {/* Faux CRT scanline effect over the chart */}
          <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] z-10 opacity-50 mix-blend-overlay" />
          
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={perf}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
              <XAxis dataKey="name" stroke="#a3e635" tick={{ fill: '#a3e635', fontSize: 12, fontFamily: 'monospace' }} />
              <YAxis stroke="#d946ef" tick={{ fill: '#d946ef', fontSize: 12, fontFamily: 'monospace' }} />
              <Tooltip 
                contentStyle={{ backgroundColor: 'black', border: '2px solid #a3e635', borderRadius: '0', fontFamily: 'monospace', color: '#a3e635' }}
                itemStyle={{ color: '#d946ef', fontWeight: 'bold' }}
              />
              <Line type="step" dataKey="quotations" stroke="#a3e635" strokeWidth={3} dot={{ r: 6, fill: 'black', stroke: '#a3e635', strokeWidth: 2 }} activeDot={{ r: 8, fill: '#a3e635' }} />
              <Line type="monotone" dataKey="revenue" stroke="#d946ef" strokeWidth={3} dot={{ r: 6, fill: 'black', stroke: '#d946ef', strokeWidth: 2 }} activeDot={{ r: 8, fill: '#d946ef' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </ChaosCard>
    </div>
  );
}
