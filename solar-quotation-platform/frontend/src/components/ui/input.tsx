import * as React from "react";
import clsx from "clsx";

export function Input({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={clsx(
        "h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm shadow-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-solar-blue",
        className,
      )}
      {...props}
    />
  );
}

