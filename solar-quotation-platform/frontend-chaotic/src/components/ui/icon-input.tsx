import * as React from "react";
import clsx from "clsx";

export function IconInput({
  icon,
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { icon: React.ReactNode }) {
  return (
    <div
      className={clsx(
        "flex items-center gap-2 h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm shadow-sm focus-within:ring-2 focus-within:ring-solar-blue transition-colors",
        className,
      )}
    >
      <div className="text-slate-400">{icon}</div>
      <input
        className="w-full outline-none placeholder:text-slate-400"
        {...props}
      />
    </div>
  );
}

