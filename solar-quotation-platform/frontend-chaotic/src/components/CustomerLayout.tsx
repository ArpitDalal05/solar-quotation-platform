import { NavLink, Outlet } from "react-router-dom";
import clsx from "clsx";
import { useAuth } from "../contexts/AuthContext";

const customerNav = [
  { to: "/customer/dashboard", label: "Dashboard" },
  { to: "/customer/new", label: "New Calculation" },
  { to: "/customer/saved", label: "Saved Calculations" },
  { to: "/customer/quotations", label: "Quotations" },
  { to: "/customer/profile", label: "Profile" },
];

export function CustomerLayout() {
  const { user, logout, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-sky-50 flex items-center justify-center">
        <div className="text-slate-500">Loading…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-sky-50">
      <div className="flex">
        <aside className="hidden md:flex md:w-72 md:flex-col border-r border-amber-100/70 bg-white/70 backdrop-blur">
          <div className="p-5 border-b border-amber-100/70">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-customer-amber to-customer-orange shadow-sm" />
              <div>
                <div className="text-sm font-semibold text-slate-900">
                  Solar Customer
                </div>
                <div className="text-xs text-slate-500">Savings & Quotations</div>
              </div>
            </div>
          </div>
          <nav className="p-3 space-y-1">
            {customerNav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  clsx(
                    "block rounded-lg px-3 py-2 text-sm transition-colors",
                    isActive
                      ? "bg-amber-100/70 text-slate-900 border border-amber-100"
                      : "text-slate-700 hover:bg-white hover:shadow-sm",
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
            <button
              className="w-full text-left rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-white hover:shadow-sm transition-colors"
              onClick={logout}
            >
              Logout
            </button>
          </nav>
        </aside>

        <main className="flex-1">
          <header className="sticky top-0 z-10 bg-white/70 backdrop-blur border-b border-amber-100/70">
            <div className="h-14 px-4 md:px-6 flex items-center justify-between">
              <div className="text-sm text-slate-700">
                Welcome{user ? `, ${user.name}` : ""}
                <span className="ml-2 text-xs text-slate-500">
                  · Customer Portal
                </span>
              </div>
              <button
                className="text-sm text-slate-700 hover:text-slate-900"
                onClick={logout}
              >
                Logout
              </button>
            </div>

            <nav className="md:hidden px-2 pb-2 flex gap-2 overflow-x-auto">
              {customerNav.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    clsx(
                      "shrink-0 rounded-full px-3 py-1.5 text-xs border transition-colors",
                      isActive
                        ? "bg-amber-100/70 text-slate-900 border-amber-100"
                        : "bg-white text-slate-700 border-amber-100/70 hover:bg-amber-50",
                    )
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </header>

          <div className="p-4 md:p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

