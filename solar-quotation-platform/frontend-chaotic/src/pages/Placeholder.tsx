export function Placeholder({ title }: { title: string }) {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10">
      <div className="text-lg font-semibold text-slate-900">{title}</div>
      <div className="text-sm text-slate-600">
        UI scaffolded. Next step: wire CRUD screens to backend APIs.
      </div>
    </div>
  );
}

