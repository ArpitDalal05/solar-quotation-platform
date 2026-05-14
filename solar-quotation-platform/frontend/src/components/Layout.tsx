import { Link, NavLink, Outlet } from "react-router-dom";
import clsx from "clsx";
import { useAuth } from "../contexts/AuthContext";
import logo from "../assets/logo.jpg";
import { motion, AnimatePresence } from "framer-motion";
import { 
  LayoutDashboard, 
  Users, 
  Calculator, 
  FileText, 
  Tag, 
  BarChart3, 
  LogOut,
  ChevronRight,
  Sun
} from "lucide-react";

const fullNav = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["ADMIN", "MANAGER", "SALES_EXECUTIVE", "DESIGN_ENGINEER"] },
  { to: "/customers", label: "Customers", icon: Users, roles: ["ADMIN", "MANAGER", "SALES_EXECUTIVE"] },
  { to: "/calculations", label: "Calculations", icon: Calculator, roles: ["ADMIN", "MANAGER", "SALES_EXECUTIVE", "DESIGN_ENGINEER"] },
  { to: "/quotations", label: "Quotations", icon: FileText, roles: ["ADMIN", "MANAGER", "SALES_EXECUTIVE", "DESIGN_ENGINEER"] },
  { to: "/pricing", label: "Pricing", icon: Tag, roles: ["ADMIN", "MANAGER"] },
  { to: "/reports", label: "Reports", icon: BarChart3, roles: ["ADMIN", "MANAGER"] },
];

export function Layout() {
  const { user, logout, loading } = useAuth();
  const nav = fullNav.filter((item) => user && item.roles.includes(user.role));

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Sun className="w-8 h-8 text-blue-600" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Professional Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col fixed h-full z-30">
        <div className="p-6">
          <Link to="/dashboard" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl accent-gradient flex items-center justify-center shadow-lg shadow-blue-200">
              <Sun className="text-white w-6 h-6" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-slate-900">Soledify</span>
              <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Solar Systems</p>
            </div>
          </Link>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                clsx(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group",
                  isActive
                    ? "bg-blue-50 text-blue-700 shadow-sm"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                )
              }
            >
              <item.icon className={clsx("w-5 h-5 transition-colors", "text-slate-400 group-hover:text-slate-600")} />
              {item.label}
              <ChevronRight className="w-4 h-4 ml-auto opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
            </NavLink>
          ))}
        </nav>

        <div className="p-4 mt-auto border-t border-slate-100">
          <div className="bg-slate-50 rounded-xl p-3 flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs">
              {user?.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-900 truncate">{user?.name}</p>
              <p className="text-[10px] text-slate-500 uppercase tracking-tighter">{user?.role.replace("_", " ")}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 ml-64 min-h-screen flex flex-col">
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-20 px-8 flex items-center justify-between">
          <h2 className="text-sm font-medium text-slate-500 uppercase tracking-widest">
            Platform / <span className="text-slate-900">Operations</span>
          </h2>
          <div className="flex items-center gap-4">
            <div className="h-8 w-px bg-slate-200 mx-2" />
            <span className="text-xs text-slate-400 font-mono">v1.2.4 stable</span>
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={window.location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
