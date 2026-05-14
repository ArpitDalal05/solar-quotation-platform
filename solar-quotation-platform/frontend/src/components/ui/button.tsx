import * as React from "react";
import clsx from "clsx";

type Variant = "default" | "secondary" | "ghost";

export function Button({
  className,
  variant = "default",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  const base =
    "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-solar-blue disabled:opacity-50 disabled:pointer-events-none h-10 px-4 py-2";
  const variants: Record<Variant, string> = {
    default:
      "bg-solar-blue text-white hover:bg-sky-600 shadow-sm",
    secondary:
      "bg-slate-100 text-slate-900 hover:bg-slate-200",
    ghost: "bg-transparent hover:bg-slate-100 text-slate-900",
  };

  return (
    <button
      className={clsx(base, variants[variant], className)}
      {...props}
    />
  );
}

