export function LegendItem({
  label,
  color,
  active,
  onClick,
}: {
  label: string;
  color: string;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] transition-colors ${
        active
          ? "border-slate-900 bg-slate-900/5 text-slate-900"
          : "border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-400 hover:bg-slate-100"
      }`}
    >
      <span
        className="inline-flex h-3 w-3 rounded-[5px] border border-slate-300"
        style={{ backgroundColor: color }}
      />
      <span>{label}</span>
    </button>
  );
}
