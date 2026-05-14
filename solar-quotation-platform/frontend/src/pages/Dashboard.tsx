import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import { useAuth } from "../contexts/AuthContext";
import { motion } from "framer-motion";
import { 
  TrendingUp, 
  Users as UsersIcon, 
  Calculator as CalcIcon, 
  FileText as FileIcon,
  ArrowUpRight,
  Target,
  IndianRupee,
  Clock
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
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

function StatCard({ title, value, icon: Icon, trend, subtext, color = "blue" }: any) {
  const colors: any = {
    blue: "text-blue-600 bg-blue-50",
    green: "text-emerald-600 bg-emerald-50",
    orange: "text-orange-600 bg-orange-50",
    purple: "text-purple-600 bg-purple-50",
  };

  return (
    <motion.div 
      whileHover={{ y: -2 }}
      className="bg-white p-6 rounded-2xl border border-slate-200 professional-shadow"
    >
      <div className="flex justify-between items-start mb-4">
        <div className={`p-2.5 rounded-xl ${colors[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
        {trend && (
          <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-bold">
            <TrendingUp className="w-3 h-3" />
            {trend}
          </div>
        )}
      </div>
      <div>
        <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-slate-900 tracking-tight">{value}</h3>
        {subtext && <p className="text-xs text-slate-400 mt-1">{subtext}</p>}
      </div>
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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  if (isSalesRole) {
    return (
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-8"
      >
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Executive Overview</h1>
            <p className="text-slate-500 mt-1">Welcome back, {user?.name}. Here's your performance snapshot.</p>
          </div>
          <div className="hidden md:flex gap-3">
            <Link to="/quotations" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 flex items-center gap-2">
              <FileIcon className="w-4 h-4" /> New Quotation
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard 
            title="Assigned Quotations" 
            value={salesData?.totalQuotations ?? "—"} 
            icon={FileIcon}
            color="blue"
          />
          <StatCard 
            title="Active Pipeline" 
            value={salesData?.monthlyPipeline ?? "—"} 
            icon={Target}
            subtext="Items added this month"
            color="purple"
          />
          <StatCard 
            title="Total Contract Value" 
            value={salesData ? `₹${salesData.totalValue.toLocaleString("en-IN")}` : "—"} 
            icon={IndianRupee}
            color="green"
            trend="+12.5%"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 professional-shadow overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-500" /> Recent Activity
              </h3>
              <Link to="/quotations" className="text-xs font-bold text-blue-600 hover:text-blue-700 uppercase tracking-wider">View All</Link>
            </div>
            <div className="p-0">
              {salesData?.recentQuotations?.length ? (
                <div className="divide-y divide-slate-50">
                  {salesData.recentQuotations.map((q) => (
                    <div key={q.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors group">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center group-hover:bg-white transition-colors">
                          <FileIcon className="w-5 h-5 text-slate-400" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900">{q.quotationNumber}</p>
                          <p className="text-xs text-slate-500">{q.customer.name}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-slate-900">₹{q.netPayableAmount.toLocaleString("en-IN")}</p>
                        <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-tighter">Generated</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center">
                  <p className="text-sm text-slate-400 font-medium">No quotations found in your recent activity stream.</p>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-bold text-slate-900 px-1">Quick Actions</h3>
            <Link to="/customers" className="block p-4 bg-white border border-slate-200 rounded-xl hover:border-blue-300 hover:bg-blue-50/30 transition-all group">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-slate-100 group-hover:bg-blue-100 transition-colors">
                  <UsersIcon className="w-5 h-5 text-slate-600 group-hover:text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-slate-900">Customer Records</p>
                  <p className="text-xs text-slate-500">Manage client information</p>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-blue-400 transition-all" />
              </div>
            </Link>
            <Link to="/calculations" className="block p-4 bg-white border border-slate-200 rounded-xl hover:border-blue-300 hover:bg-blue-50/30 transition-all group">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-slate-100 group-hover:bg-blue-100 transition-colors">
                  <CalcIcon className="w-5 h-5 text-slate-600 group-hover:text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-slate-900">System Design</p>
                  <p className="text-xs text-slate-500">Solar capacity matrix</p>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-blue-400 transition-all" />
              </div>
            </Link>
          </div>
        </div>
      </motion.div>
    );
  }

  const perf = adminData?.salesExecutivePerformance?.map((p) => ({
    name: `User ${p.userId}`,
    quotations: p._count._all,
    revenue: p._sum.netPayableAmount ?? 0,
  })) ?? [];

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Admin Dashboard</h1>
        <p className="text-slate-500 mt-1">Enterprise-wide analytics and performance tracking.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Volume" value={adminData?.totalQuotations ?? "—"} icon={FileIcon} color="blue" />
        <StatCard title="Monthly Pipeline" value={adminData?.monthlySalesPipeline ?? "—"} icon={Clock} color="purple" />
        <StatCard 
          title="Conversion Rate" 
          value={adminData ? `${Math.round(adminData.conversionRatio * 100)}%` : "—"} 
          icon={Target} 
          color="orange" 
        />
        <StatCard 
          title="Weighted Forecast" 
          value={adminData ? `₹${Math.round(adminData.revenueForecast).toLocaleString("en-IN")}` : "—"} 
          icon={TrendingUp} 
          color="green" 
          subtext="Projected Revenue"
        />
      </div>

      <div className="bg-white p-8 rounded-2xl border border-slate-200 professional-shadow">
        <div className="mb-8">
          <h3 className="text-lg font-bold text-slate-900">Performance Distribution</h3>
          <p className="text-sm text-slate-500">Revenue vs Volume across sales verticals</p>
        </div>
        <div style={{ height: 350 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={perf}>
              <defs>
                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
              />
              <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </motion.div>
  );
}
