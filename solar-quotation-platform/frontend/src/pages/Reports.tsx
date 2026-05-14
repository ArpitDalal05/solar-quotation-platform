import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { 
  FileStack, 
  TrendingUp, 
  CheckCircle2, 
  Clock,
  Download,
  Filter
} from "lucide-react";

type DashboardData = {
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

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444'];

export function Reports() {
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    api.get("/reports/dashboard").then((r) => setData(r.data));
  }, []);

  const pieData = data ? [
    { name: 'Accepted', value: data.conversionRatio * 100 },
    { name: 'Pending', value: (1 - data.conversionRatio) * 100 },
  ] : [];

  const perfData = data?.salesExecutivePerformance.map(p => ({
    name: `User ${p.userId}`,
    revenue: p._sum.netPayableAmount || 0,
    count: p._count._all
  })) || [];

  return (
    <div className="space-y-10 pb-20">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Reporting & Analytics</h1>
          <p className="text-slate-500 mt-1">Global performance metrics and sales conversion data.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-xl bg-white text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all">
            <Filter className="w-4 h-4" /> Filter Date
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-200">
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 professional-shadow">
          <div className="p-2 bg-blue-50 text-blue-600 w-fit rounded-lg mb-4">
            <FileStack className="w-5 h-5" />
          </div>
          <p className="text-sm font-medium text-slate-500">Total Lifecycle Volume</p>
          <h3 className="text-2xl font-bold text-slate-900">{data?.totalQuotations ?? "—"}</h3>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 professional-shadow">
          <div className="p-2 bg-emerald-50 text-emerald-600 w-fit rounded-lg mb-4">
            <TrendingUp className="w-5 h-5" />
          </div>
          <p className="text-sm font-medium text-slate-500">Revenue Forecast</p>
          <h3 className="text-2xl font-bold text-slate-900">
            ₹{Math.round(data?.revenueForecast ?? 0).toLocaleString("en-IN")}
          </h3>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 professional-shadow">
          <div className="p-2 bg-orange-50 text-orange-600 w-fit rounded-lg mb-4">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <p className="text-sm font-medium text-slate-500">Conversion Rate</p>
          <h3 className="text-2xl font-bold text-slate-900">
            {data ? `${Math.round(data.conversionRatio * 100)}%` : "—"}
          </h3>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 professional-shadow">
          <div className="p-2 bg-purple-50 text-purple-600 w-fit rounded-lg mb-4">
            <Clock className="w-5 h-5" />
          </div>
          <p className="text-sm font-medium text-slate-500">Monthly Pipeline</p>
          <h3 className="text-2xl font-bold text-slate-900">{data?.monthlySalesPipeline ?? "—"}</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-slate-200 professional-shadow">
          <h3 className="font-bold text-slate-900 mb-8 uppercase text-[11px] tracking-widest text-slate-400">Executive Revenue Distribution</h3>
          <div style={{ height: 400 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={perfData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="revenue" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-slate-200 professional-shadow">
          <h3 className="font-bold text-slate-900 mb-8 uppercase text-[11px] tracking-widest text-slate-400">Conversion Health</h3>
          <div style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-4 mt-4">
            {pieData.map((item, i) => (
              <div key={item.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                  <span className="text-slate-600 font-medium">{item.name}</span>
                </div>
                <span className="font-bold text-slate-900">{Math.round(item.value)}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
