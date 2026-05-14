import { Link, NavLink, Outlet } from "react-router-dom";
import clsx from "clsx";
import { useAuth } from "../contexts/AuthContext";
import logo from "../assets/logo.jpg";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const fullNav = [
  { to: "/dashboard", label: "Dashboard", roles: ["ADMIN", "MANAGER", "SALES_EXECUTIVE", "DESIGN_ENGINEER"] },
  { to: "/customers", label: "Customers", roles: ["ADMIN", "MANAGER", "SALES_EXECUTIVE"] },
  { to: "/calculations", label: "Calculations", roles: ["ADMIN", "MANAGER", "SALES_EXECUTIVE", "DESIGN_ENGINEER"] },
  { to: "/quotations", label: "Quotations", roles: ["ADMIN", "MANAGER", "SALES_EXECUTIVE", "DESIGN_ENGINEER"] },
  { to: "/pricing", label: "Pricing", roles: ["ADMIN", "MANAGER"] },
  { to: "/reports", label: "Reports", roles: ["ADMIN", "MANAGER"] },
];

export function Layout() {
  const { user, logout, loading } = useAuth();
  const nav = fullNav.filter((item) => user && item.roles.includes(user.role));
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center font-mono">
        <motion.div
          animate={{ scale: [1, 2, 0.5, 1], rotate: [0, 90, -90, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-fuchsia-500 text-4xl glitch-text"
          data-text="INITIALIZING_CHAOS..."
        >
          INITIALIZING_CHAOS...
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-lime-400 font-mono relative overflow-hidden">
      {/* Interactive Background Element */}
      <motion.div 
        className="absolute w-96 h-96 bg-fuchsia-600/20 rounded-full blur-3xl pointer-events-none z-0"
        animate={{
          x: mousePos.x - 192,
          y: mousePos.y - 192,
        }}
        transition={{ type: "spring", damping: 30, stiffness: 200, mass: 0.5 }}
      />

      <div className="flex relative z-10">
        <motion.aside 
          initial={{ x: -200, rotate: -10 }}
          animate={{ x: 0, rotate: 0 }}
          transition={{ type: "spring", bounce: 0.5 }}
          className="hidden md:flex md:w-72 md:flex-col border-r-4 border-fuchsia-500 glass-panel m-4 rounded-3xl chaos-shadow transform hover:rotate-1 hover:scale-105 transition-transform duration-300"
        >
          <div className="p-6 border-b-4 border-dashed border-lime-400/50">
            <Link to="/dashboard" className="flex flex-col items-center gap-4 group">
              <motion.img
                whileHover={{ rotate: 180, scale: 1.2 }}
                transition={{ duration: 0.3 }}
                src={logo}
                alt="Soledify"
                className="h-16 w-auto object-contain mix-blend-screen filter invert"
              />
              <div className="text-center">
                <h1 className="text-2xl font-black tracking-tighter text-fuchsia-400 glitch-text uppercase" data-text="Soledify_OS">Soledify_OS</h1>
                <p className="text-xs text-lime-300/70 -rotate-3 mt-1">/// TH1NK GR33N, L1V3 CL3AN</p>
              </div>
            </Link>
          </div>
          <nav className="p-6 flex flex-col gap-4">
            {nav.map((item, i) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  clsx(
                    "block px-4 py-3 text-lg font-bold uppercase tracking-widest transition-all duration-200 transform border-2",
                    isActive
                      ? "bg-fuchsia-500 text-black border-lime-400 translate-x-4 shadow-[4px_4px_0_#a3e635]"
                      : "text-lime-400 border-transparent hover:border-fuchsia-500 hover:bg-lime-400/10 hover:-translate-y-1 hover:shadow-[4px_4px_0_#d946ef]",
                  )
                }
              >
                <motion.div
                  initial={{ x: -50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: i * 0.1 }}
                >
                  [{item.label}]
                </motion.div>
              </NavLink>
            ))}
          </nav>
        </motion.aside>

        <main className="flex-1 flex flex-col min-w-0">
          <motion.header 
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            className="sticky top-4 mx-4 z-20 glass-panel border-b-4 border-lime-400 p-4 rounded-xl chaos-shadow flex flex-wrap items-center justify-between gap-4"
          >
            <div className="text-sm md:text-base font-bold text-fuchsia-400 flex items-center flex-wrap gap-2">
              <span className="animate-pulse mr-2">â—</span>
              SOLAR_PV_QUOTATION_SYSTEM_v9.9.9
              {user && (
                <motion.div 
                  whileHover={{ scale: 1.1, rotate: 2 }}
                  className="ml-4 px-3 py-1 bg-lime-400 text-black font-black text-xs uppercase chaos-border"
                >
                  USER::{user.name} | ROLE::{user.role}
                </motion.div>
              )}
            </div>
            <motion.button
              whileHover={{ scale: 1.1, backgroundColor: "#ef4444", color: "#000" }}
              whileTap={{ scale: 0.9 }}
              className="px-4 py-2 bg-transparent border-2 border-red-500 text-red-500 font-bold uppercase text-sm tracking-wider"
              onClick={logout}
            >
              [ABORT_SESSION]
            </motion.button>
          </motion.header>

          <div className="p-4 md:p-8 flex-1 relative z-10">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="h-full"
            >
              <Outlet />
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
}
