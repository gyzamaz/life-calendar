import { type Language } from "../i18n";

interface LanguageSwitcherProps {
  value: Language;
  label: string;
  onChange: (lang: Language) => void;
}

export function LanguageSwitcher({ value, label, onChange }: LanguageSwitcherProps) {
  return (
    <div className="flex items-center gap-2">
      <label className="text-xs font-medium text-slate-500">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as Language)}
        className="text-xs border border-slate-300 rounded-full px-3 py-1 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500/60"
      >
        <option value="pl">Polski</option>
        <option value="en">English</option>
      </select>
    </div>
  );
}
