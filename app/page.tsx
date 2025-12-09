"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent,
  type Dispatch,
  type SetStateAction,
} from "react";

import { getStrings, months } from "./i18n";
import {
  settingsLanguageIsPl,
  getEventColor,
  getEventDefaultIcon,  
} from "./utils";

import {
  resetFilters,
  DEFAULT_CATEGORY_FILTER,
  DEFAULT_AGE_FILTER,
} from "./utils/resetFilters";


import { LanguageSwitcher } from "./components/LangSwitcher";
import { EventsTimeline } from "./components/EventsTimeline";
import { CalendarGridSection } from "./components/CalendarGridSection";
import { ExportToPdf } from "./components/ExportToPdf";
import {
  CategoryKey,
  CalendarData,
  MilestoneMap,
  AgeFilter,
  LifeEventType,
  LifeCellId,
} from "./types";

import {
  Settings,
  QuickConfig,
  Category,
  LifeEvent,
  CurrentPosition,
  Milestone,
 } from "./interfaces";

const CATEGORIES: Category[] = [
  { key: "none", color: "#e5e7eb" },
  { key: "learning", color: "#60a5fa" },
  { key: "work", color: "#4ade80" },
  { key: "retirement", color: "#a1a1aa" },
  { key: "other", color: "#facc15" },
];

const STORAGE_KEYS = {
  calendar: "life-calendar-cells-v1",
  settings: "life-calendar-settings-v1",
  quickConfig: "life-calendar-quick-config-v1",
  milestones: "life-calendar-milestones-v1",
  events: "life-calendar-events-v1",
} as const;

const DEFAULT_SETTINGS: Settings = {
  maxAge: 90,
  birthYear: null,
  birthMonth: null,
  language: "pl",
};

const DEFAULT_QUICK_CONFIG: QuickConfig = {
  highSchoolFrom: null,
  highSchoolYears: null,
  universityFrom: null,
  universityYears: null,
  careerFrom: null,
  careerYears: null,
  retirementFrom: null,
};

function usePersistentState<T>(
  key: string,
  defaultValue: T
): [T, Dispatch<SetStateAction<T>>, boolean] {
  const [value, setValue] = useState<T>(defaultValue);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw != null) {
        setValue(JSON.parse(raw));
      }
    } catch {
      // ignore
    } finally {
      setHydrated(true);
    }
  }, [key]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // ignore
    }
  }, [key, value, hydrated]);

  return [value, setValue, hydrated];
}

function getCurrentPosition(settings: Settings): CurrentPosition | null {
  const { birthYear, birthMonth, maxAge } = settings;
  if (!birthYear || !birthMonth) return null;

  const now = new Date();
  const nowYear = now.getFullYear();
  const nowMonthIndex = now.getMonth();

  const diffMonths =
    (nowYear - birthYear) * 12 + (nowMonthIndex - (birthMonth - 1));

  if (diffMonths < 0) return null;

  const yearIndex = Math.floor(diffMonths / 12);
  const monthIndex = diffMonths % 12;

  if (yearIndex < 0 || yearIndex >= maxAge) return null;

  const ageYears = nowYear - birthYear;
  return { yearIndex, monthIndex, ageYears };
}

export default function Page() {
  const [settings, setSettings, settingsHydrated] = usePersistentState<Settings>(
    STORAGE_KEYS.settings,
    DEFAULT_SETTINGS
  );
  const [calendar, setCalendar, calendarHydrated] =
    usePersistentState<CalendarData>(STORAGE_KEYS.calendar, {});
  const [quickConfig, setQuickConfig, quickConfigHydrated] =
    usePersistentState<QuickConfig>(STORAGE_KEYS.quickConfig, DEFAULT_QUICK_CONFIG);
  const [milestones, setMilestones, milestonesHydrated] =
    usePersistentState<MilestoneMap>(STORAGE_KEYS.milestones, {});
  const [events, setEvents, eventsHydrated] = usePersistentState<LifeEvent[]>(STORAGE_KEYS.events, []);
  const [activeCategory, setActiveCategory] =
    useState<CategoryKey>("learning");
  
const [categoryFilter, setCategoryFilter] =
  useState<CategoryKey[]>(DEFAULT_CATEGORY_FILTER);

const [ageFilter, setAgeFilter] = useState<AgeFilter>(DEFAULT_AGE_FILTER);


  const [selectedCell, setSelectedCell] = useState<{
    year: number;
    month: number;
  } | null>(null);

  const t = getStrings(settings.language);

  const calendarReady =
    settingsHydrated && calendarHydrated && quickConfigHydrated && milestonesHydrated && eventsHydrated;

  const currentPosition = useMemo(
    () => getCurrentPosition(settings),
    [settings]
  );

  const calendarRef = useRef<HTMLDivElement | null>(null);
  const notesRef = useRef<HTMLDivElement | null>(null);
  const eventsRef = useRef<HTMLDivElement | null>(null);

function scrollToNotes() {
  if (!notesRef.current) return;
  notesRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
}

function scrollToEvents() {
  if (!eventsRef.current) return;
  eventsRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
}

function handleSelectCell(year: number, month: number) {
  setSelectedCell({ year, month });
  scrollToNotes();
}

  const totals = useMemo(() => {
    const result: Record<CategoryKey, number> = {
      none: 0,
      learning: 0,
      work: 0,
      retirement: 0,
      other: 0,
    };
    Object.values(calendar).forEach((key) => {
      result[key] = (result[key] ?? 0) + 1;
    });
    return result;
  }, [calendar]);

  function handleSettingsChange<K extends keyof Settings>(
    key: K,
    value: Settings[K]
  ): void {
    setSettings({
      ...settings,
      [key]: value,
    });
  }

   function handleQuickConfigChange<K extends keyof QuickConfig>(
    key: K,
    value: QuickConfig[K]
  ): void {
    setQuickConfig((prev) => {
      const next: QuickConfig = { ...prev, [key]: value };

      setCalendar((prevCalendar) => {
        const updated: CalendarData = { ...prevCalendar };
        const maxYear = settings.maxAge;

        const paintRange = (
          from: number | null,
          years: number | null,
          category: CategoryKey
        ) => {
          if (!from || !years || years <= 0) return;
          const startYear = Math.max(1, from);
          const endYear = Math.min(maxYear, from + years - 1);
          for (let y = startYear; y <= endYear; y++) {
            for (let m = 1; m <= 12; m++) {
              const id = `${y}-${m}`;
              updated[id] = category;
            }
          }
        };

        paintRange(next.highSchoolFrom, next.highSchoolYears, "learning");
        paintRange(next.universityFrom, next.universityYears, "learning");

        paintRange(next.careerFrom, next.careerYears, "work");

        if (next.retirementFrom && next.retirementFrom > 0) {
          const startYear = Math.max(1, next.retirementFrom);
          for (let y = startYear; y <= maxYear; y++) {
            for (let m = 1; m <= 12; m++) {
              const id = `${y}-${m}`;
              updated[id] = "retirement";
            }
          }
        }

        return updated;
      });

      return next;
    });
  }

  function handleReset() {
    if (window.confirm(t.resetConfirm)) {
      setCalendar({});
      setSettings(DEFAULT_SETTINGS);
      setQuickConfig(DEFAULT_QUICK_CONFIG);
      setMilestones({});
      setEvents([]);
      setActiveCategory("learning");
      setSelectedCell(null);
      resetFilters(setCategoryFilter, setAgeFilter);
    }
  }

function makeCellId(year: number, month: number): LifeCellId {
  return `${year}-${month}` as LifeCellId;
}

  

  const selectedKey: LifeCellId | null = selectedCell
  ? makeCellId(selectedCell.year, selectedCell.month)
  : null;

const selectedMilestone =
  selectedKey && milestones[selectedKey]
    ? milestones[selectedKey]
    : null;



  function handleSaveMilestone(
    title: string,
    description: string,
    important: boolean
  ) {
    if (!selectedCell) return;
    const id = makeCellId(selectedCell.year, selectedCell.month);
    setMilestones((prev) => {
      const updated: MilestoneMap = { ...prev };
      delete updated[id];
      return updated;
    });
  }

  function handleDeleteMilestone() {
    if (!selectedCell) return;
    const id = makeCellId(selectedCell.year, selectedCell.month);
    setMilestones((prev) => {
      const updated: MilestoneMap = { ...prev };
      delete updated[id];
      return updated;
    });
  }

  function addEvent() {
    setEvents((prev) => [
      ...prev,
      {
        id:
          typeof crypto !== "undefined" && "randomUUID" in crypto
            ? crypto.randomUUID()
            : `${Date.now()}-${Math.random()}`,
        title: "",
        type: "work",
        startYear: null,
        startMonth: null,
        endYear: null,
        endMonth: null,
        color: undefined,
        icon: "",
      },
    ]);
  }

  function updateEvent(id: string, patch: Partial<LifeEvent>) {
    setEvents((prev) =>
      prev.map((ev) => (ev.id === id ? { ...ev, ...patch } : ev))
    );
  }

  function deleteEvent(id: string) {
    setEvents((prev) => prev.filter((ev) => ev.id !== id));
  }

  return (
    <div className="min-h-screen flex justify-center px-4 py-6 bg-slate-100">
      <div className="w-full bg-white/90 backdrop-blur rounded-3xl shadow-xl p-6 md:p-8 flex flex-col">
        <div className="flex-1 space-y-6">
          <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-slate-900">
                {t.appTitle}
              </h1>
              <p className="text-sm md:text-base text-slate-500 mt-1 max-w-xl">
                {t.appSubtitle}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span className="inline-flex h-3 w-3 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Autozapis w przeglądarce</span>
              </div>
              <LanguageSwitcher
                value={settings.language}
                label={t.languageLabel}
                onChange={(lang) => handleSettingsChange("language", lang)}
              />
            </div>
          </header>

          <section className="grid md:grid-cols-[minmax(0,1.6fr)_minmax(0,1.4fr)] gap-6">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-slate-600">
                    {t.maxAgeLabel}
                  </label>
                  <input
                    type="number"
                    min={10}
                    max={120}
                    value={settings.maxAge}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      if (Number.isNaN(val)) return;
                      const clamped = Math.min(Math.max(val, 10), 120);
                      handleSettingsChange("maxAge", clamped);
                    }}
                    className="border border-slate-300 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/70"
                  />
                  <p className="text-[11px] text-slate-500">
                    90 to typowa wartość, ale możesz ją zmienić.
                  </p>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-slate-600">
                    {t.birthYearLabel}
                  </label>
                  <input
                    type="number"
                    placeholder={t.noValue}
                    value={settings.birthYear ?? ""}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      if (Number.isNaN(val)) {
                        handleSettingsChange("birthYear", null);
                        return;
                      }
                      handleSettingsChange("birthYear", val);
                    }}
                    className="border border-slate-300 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/70"
                  />
                  <p className="text-[11px] text-slate-500">
                    Ustaw, aby podświetlić aktualny miesiąc życia.
                  </p>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-slate-600">
                    {t.birthMonthLabel}
                  </label>
                  <select
                    value={settings.birthMonth ?? ""}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      if (Number.isNaN(val)) {
                        handleSettingsChange("birthMonth", null);
                        return;
                      }
                      handleSettingsChange("birthMonth", val);
                    }}
                    className="border border-slate-300 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/70"
                  >
                    <option value="">{t.noValue}</option>
                    {months.map((m) => (
                      <option key={m.value} value={m.value}>
                        {settings.language === "pl" ? m.pl : m.en}
                      </option>
                    ))}
                  </select>
                  <p className="text-[11px] text-slate-500">
                    Używane wyłącznie do wizualizacji.
                  </p>
                </div>
              </div>

              {currentPosition && (
                <div className="flex flex-wrap items-center gap-3 text-xs bg-sky-50 border border-sky-100 text-sky-900 rounded-2xl px-3 py-2">
                  <span className="font-medium">
                    {t.currentAgeLabel}: {currentPosition.ageYears}{" "}
                    {t.currentAgeSuffix}
                  </span>
                  <span className="h-1 w-1 rounded-full bg-sky-300" />
                  <span>{t.currentMonthInfo}</span>
                </div>
              )}

              <div className="space-y-2">
    <div
      className="text-[11px] text-slate-500"
      dangerouslySetInnerHTML={{ __html: t.hintClick }}
    />
    <div className="flex flex-wrap gap-2 text-[11px]">
      <button
        type="button"
        onClick={scrollToNotes}
        className="inline-flex items-center gap-1 rounded-full border border-slate-300 px-2.5 py-1 bg-white hover:bg-slate-50"
      >
        📝 <span>Przejdź do notatek</span>
      </button>
      <button
        type="button"
        onClick={scrollToEvents}
        className="inline-flex items-center gap-1 rounded-full border border-slate-300 px-2.5 py-1 bg-white hover:bg-slate-50"
      >
        📌 <span>Przejdź do wydarzeń</span>
      </button>
    </div>
  </div>


            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 space-y-4">
                <p className="text-xs font-medium text-slate-600">
                  {t.quickConfigTitle}
                </p>
                <p className="text-[11px] text-slate-500">
                  {t.quickHint}
                </p>
                <div className="space-y-2 text-[11px]">
                  <QuickRow
                    label={t.quickHighSchool}
                    from={quickConfig.highSchoolFrom}
                    years={quickConfig.highSchoolYears}
                    fromLabel={t.quickFromAge}
                    yearsLabel={t.quickYears}
                    onFromChange={(val) =>
                      handleQuickConfigChange("highSchoolFrom", val)
                    }
                    onYearsChange={(val) =>
                      handleQuickConfigChange("highSchoolYears", val)
                    }
                  />
                  <QuickRow
                    label={t.quickUniversity}
                    from={quickConfig.universityFrom}
                    years={quickConfig.universityYears}
                    fromLabel={t.quickFromAge}
                    yearsLabel={t.quickYears}
                    onFromChange={(val) =>
                      handleQuickConfigChange("universityFrom", val)
                    }
                    onYearsChange={(val) =>
                      handleQuickConfigChange("universityYears", val)
                    }
                  />
                  <QuickRow
                    label={t.quickCareer}
                    from={quickConfig.careerFrom}
                    years={quickConfig.careerYears}
                    fromLabel={t.quickFromAge}
                    yearsLabel={t.quickYears}
                    onFromChange={(val) =>
                      handleQuickConfigChange("careerFrom", val)
                    }
                    onYearsChange={(val) =>
                      handleQuickConfigChange("careerYears", val)
                    }
                  />
                  <QuickRow
                    label={t.quickRetirement}
                    from={quickConfig.retirementFrom}
                    years={null}
                    fromLabel={t.quickRetirementFromAge}
                    yearsLabel=""
                    onFromChange={(val) =>
                      handleQuickConfigChange("retirementFrom", val)
                    }
                  />
                </div>              
            </div>
          </section>
          <section className="grid lg:grid-cols-[minmax(0,2.2fr)_minmax(0,1.5fr)] gap-6">
            <div
              ref={calendarRef}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-4 flex flex-col"
            >
              <CalendarGridSection
                t={t}
                settings={settings}
                calendar={calendar}
                milestones={milestones}
                events={events}
                activeCategory={activeCategory}
                onActiveCategoryChange={setActiveCategory}
                selectedCell={selectedCell}
                onSelectCell={handleSelectCell}
                calendarReady={calendarReady}
                currentPosition={currentPosition}
                onUpdateCalendar={setCalendar}
              />
            </div>

            <div className="flex flex-col gap-4 h-full">
                <div
                  ref={notesRef}
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-4 space-y-2">
                <p className="text-xs font-medium text-slate-600">
                  {t.milestonesTitle}
                </p>
                <p className="text-[11px] text-slate-500">
                  {t.milestonesHintSelect}
                </p>
                <MilestonePanel
                  t={t}
                  selectedCell={selectedCell}
                  selectedMilestone={selectedMilestone}
                  onSave={handleSaveMilestone}
                  onDelete={handleDeleteMilestone}
                />
              </div>
            
            
                <div
                  ref={eventsRef}
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-4 flex-1 overflow-y-auto">
                <EventsPanel
                  t={t}
                  events={events}
                  onAdd={addEvent}
                  onUpdate={updateEvent}
                  onDelete={deleteEvent}
                  birthYear={settings.birthYear}
                  birthMonth={settings.birthMonth}
                  maxAge={settings.maxAge}
                />      
                <div className=" py-4">
                  <EventsTimeline
                    t={t}
                    events={events}
                    birthYear={settings.birthYear}
                    birthMonth={settings.birthMonth}
                    maxAge={settings.maxAge}
                  />
                </div>
              </div>
            </div>
          </section>
          <section className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 space-y-4">
            <div className="flex flex-wrap gap-2 items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                {t.summaryTitle}
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <SummaryPill
                label={t.category_learning}
                value={totals.learning}
                color="#60a5fa"
                t={t}
              />
              <SummaryPill
                label={t.category_work}
                value={totals.work}
                color="#4ade80"
                t={t}
              />
              <SummaryPill
                label={t.category_retirement}
                value={totals.retirement}
                color="#a1a1aa"
                t={t}
              />
              <SummaryPill
                label={t.category_other}
                value={totals.other}
                color="#facc15"
                t={t}
              />
            </div>
          </section>
        </div>
        <footer className="pt-2 border-t border-slate-200 mt-2">
          <div className="flex flex-wrap justify-end gap-2">
            <ExportToPdf t={t} calendarRef={calendarRef} />
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1 rounded-full border border-slate-300 text-slate-600 text-xs px-3 py-1.5 hover:bg-slate-100 transition-colors"
            >
              ✖
              <span>{t.resetAll}</span>
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}

function SummaryPill({
  label,
  value,
  color,
  t,
}: {
  label: string;
  value: number;
  color: string;
  t: Record<string, string>;
}) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2">
      <div className="flex items-center gap-2">
        <span
          className="inline-flex h-3 w-3 rounded-full"
          style={{ backgroundColor: color }}
        />
        <span className="text-[11px] text-slate-600">{label}</span>
      </div>
      <span className="text-[11px] font-semibold text-slate-800">
        {value} {t.monthShort}
      </span>
    </div>
  );
}

interface QuickRowProps {
  label: string;
  from: number | null;
  years: number | null;
  fromLabel: string;
  yearsLabel: string;
  onFromChange: (value: number | null) => void;
  onYearsChange?: (value: number | null) => void;
}

function QuickRow({
  label,
  from,
  years,
  fromLabel,
  yearsLabel,
  onFromChange,
  onYearsChange,
}: QuickRowProps) {
  return (
    <div className="border border-slate-200 rounded-2xl bg-slate-50 px-3 py-2">
      <div className="text-[11px] font-semibold text-slate-700 mb-1">
        {label}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] text-slate-500">{fromLabel}</span>
          <input
            type="number"
            min={1}
            max={120}
            value={from ?? ""}
            onChange={(e) => {
              const raw = e.target.value;
              if (raw === "") {
                onFromChange(null);
                return;
              }
              const val = parseInt(raw, 10);
              if (Number.isNaN(val)) {
                onFromChange(null);
                return;
              }
              onFromChange(val);
            }}
            className="border border-slate-300 rounded-lg px-2 py-1 text-[11px] bg-white focus:outline-none focus:ring-1 focus:ring-sky-500/70"
          />
        </div>
        {onYearsChange && (
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] text-slate-500">{yearsLabel}</span>
            <input
              type="number"
              min={1}
              max={120}
              value={years ?? ""}
              onChange={(e) => {
                const raw = e.target.value;
                if (raw === "") {
                  onYearsChange(null);
                  return;
                }
                const val = parseInt(raw, 10);
                if (Number.isNaN(val)) {
                  onYearsChange(null);
                  return;
                }
                onYearsChange(val);
              }}
              className="border border-slate-300 rounded-lg px-2 py-1 text-[11px] bg-white focus:outline-none focus:ring-1 focus:ring-sky-500/70"
            />
          </div>
        )}
      </div>
    </div>
  );
}

function MilestonePanel({
  t,
  selectedCell,
  selectedMilestone,
  onSave,
  onDelete,
}: {
  t: Record<string, string>;
  selectedCell: { year: number; month: number } | null;
  selectedMilestone: Milestone | null;
  onSave: (title: string, description: string, important: boolean) => void;
  onDelete: () => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [important, setImportant] = useState(false);

  useEffect(() => {
    if (selectedMilestone) {
      setTitle(selectedMilestone.title);
      setDescription(selectedMilestone.description);
      setImportant(Boolean(selectedMilestone.important));
    } else {
      setTitle("");
      setDescription("");
      setImportant(false);
    }
  }, [selectedMilestone?.title, selectedMilestone?.description, selectedMilestone?.important, selectedCell]);

  if (!selectedCell) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-3 py-2 text-[11px] text-slate-500">
        {t.milestonesNoCell}
      </div>
    );
  }

  const labelMonth = `${selectedCell.month}. ${t.monthShort}`;
  const labelYear = `${selectedCell.year}. ${t.yearLabel}`;

  return (
    <div className="rounded-2xl border border-sky-200 bg-sky-50 px-3 py-3 space-y-2 shadow-[0_0_0_1px_rgba(56,189,248,0.25)]">
    <div className="flex items-center justify-between gap-2">
      <div className="text-[11px] text-slate-500">
        <span className="font-medium text-slate-700">
          {t.milestonesPositionLabel}:{" "}
        </span>
        <span>
          {labelMonth}, {labelYear}
        </span>
      </div>
      <span className="inline-flex items-center gap-1 rounded-full bg-sky-100 text-sky-800 px-2 py-0.5 text-[10px] border border-sky-200">
        ✏️{" "}
        {t.milestonesEditingLabel ??
          (settingsLanguageIsPl(t)
            ? "Edytujesz tę kratkę"
            : "Editing this cell")}
      </span>
    </div>

      <div className="flex flex-col gap-1">
        <label className="text-[10px] text-slate-500">
          {t.milestonesTitleLabel}
        </label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="border border-slate-300 rounded-lg px-2 py-1 text-[11px] bg-white focus:outline-none focus:ring-1 focus:ring-sky-500/70"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-[10px] text-slate-500">
          {t.milestonesDescriptionLabel}
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="border border-slate-300 rounded-lg px-2 py-1 text-[11px] bg-white focus:outline-none focus:ring-1 focus:ring-sky-500/70 resize-none"
        />
      </div>

      <label className="flex items-center gap-2 text-[11px] text-slate-600 mt-1">
        <input
          type="checkbox"
          checked={important}
          onChange={(e) => setImportant(e.target.checked)}
          className="h-3 w-3 rounded border-slate-300 text-sky-600 focus:outline-none focus:ring-1 focus:ring-sky-500/70"
        />
        <span>
          {settingsLanguageIsPl(t)
            ? "Oznacz jako ważny moment"
            : "Mark as key moment"}
        </span>
      </label>

      <div className="flex items-center justify-between mt-1">
        <button
          type="button"
          onClick={() => onSave(title, description, important)}
          className="inline-flex items-center gap-1 rounded-full bg-slate-900 text-white text-[11px] px-3 py-1.5 shadow-sm hover:bg-slate-800 transition-colors"
        >
          💾
          <span>{t.milestonesSave}</span>
        </button>

        
        {selectedMilestone && (
          <button
            type="button"
            onClick={onDelete}
            className="inline-flex items-center gap-1 rounded-full border border-slate-300 text-slate-600 text-[11px] px-3 py-1.5 hover:bg-slate-100 transition-colors"
          >
            🗑
            <span>{t.milestonesDelete}</span>
          </button>
        )}
      </div>
      <p className="text-[10px] text-slate-400 mt-1">
        {t.milestonesSavedInfo}
      </p>
    </div>
  );
}

function EventsPanel({
  t,
  events,
  onAdd,
  onUpdate,
  onDelete,
  birthYear,
  birthMonth,
  maxAge,
}: {
  t: Record<string, string>;
  events: LifeEvent[];
  onAdd: () => void;
  onUpdate: (id: string, patch: Partial<LifeEvent>) => void;
  onDelete: (id: string) => void;
  birthYear: number | null;
  birthMonth: number | null;
  maxAge: number;
}) {
  const hasBirthInfo = Boolean(birthYear && birthMonth);
  const isPl = settingsLanguageIsPl(t);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-slate-600">
          {t.eventsTitle}
        </p>
        <button
          type="button"
          onClick={onAdd}
          className="inline-flex items-center gap-1 rounded-full border border-slate-300 bg-white text-[11px] px-2.5 py-1 hover:bg-slate-50"
        >
          ➕
          <span>{t.eventsAdd}</span>
        </button>
      </div>

      <p className="text-[11px] text-slate-500">{t.eventsHint}</p>

      {!hasBirthInfo && (
        <p className="text-[10px] text-amber-700 bg-amber-50 border border-amber-100 rounded-xl px-2 py-1">
          {t.eventsNeedsBirthInfo}
        </p>
      )}

      {events.length === 0 ? (
        <p className="text-[11px] text-slate-400">{t.eventsEmpty}</p>
      ) : (
        <div className="space-y-2">
          {events.map((ev) => {
            const ongoing = !ev.endYear || !ev.endMonth;
            return (
              <div
                key={ev.id}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 space-y-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-1">
                    <span
                      className="inline-flex items-center justify-center h-5 w-5 rounded-full text-[11px]"
                      style={{
                        backgroundColor: ev.color ?? getEventColor(ev.type),
                      }}
                    >
                      <span>
                        {ev.icon || getEventDefaultIcon(ev.type)}
                      </span>
                    </span>
                    <input
                      value={ev.title}
                      onChange={(e) =>
                        onUpdate(ev.id, { title: e.target.value })
                      }
                      placeholder={t.eventsTitleLabel}
                      className="flex-1 border border-slate-200 rounded-lg px-2 py-1 text-[11px] bg-slate-50 focus:outline-none focus:ring-1 focus:ring-sky-500/70"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => onDelete(ev.id)}
                    className="text-[11px] text-slate-500 hover:text-red-500"
                    aria-label="Usuń wydarzenie"
                  >
                    🗑
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-slate-500">
                      {t.eventsTypeLabel}
                    </span>
                    <select
                      value={ev.type}
                      onChange={(e) =>
                        onUpdate(ev.id, {
                          type: e.target.value as LifeEventType,
                        })
                      }
                      className="border border-slate-300 rounded-lg px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-sky-500/70"
                    >
                      <option value="work">{t.eventsType_work}</option>
                      <option value="study">{t.eventsType_study}</option>
                      <option value="child">{t.eventsType_child}</option>
                      <option value="relationship">
                        {t.eventsType_relationship}
                      </option>
                      <option value="health">{t.eventsType_health}</option>
                      <option value="loss">{t.eventsType_loss}</option>
                      <option value="move">{t.eventsType_move}</option>
                      <option value="other">{t.eventsType_other}</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-slate-500">
                      {t.eventsStartLabel}
                    </span>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        value={ev.startYear ?? ""}
                        onChange={(e) => {
                          const raw = e.target.value;
                          const val = raw === "" ? null : parseInt(raw, 10);
                          onUpdate(ev.id, {
                            startYear: Number.isNaN(val as number)
                              ? null
                              : (val as number),
                          });
                        }}
                        className="w-16 border border-slate-300 rounded-lg px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-sky-500/70"
                      />
                      <input
                        type="number"
                        min={1}
                        max={12}
                        value={ev.startMonth ?? ""}
                        onChange={(e) => {
                          const raw = e.target.value;
                          const val = raw === "" ? null : parseInt(raw, 10);
                          onUpdate(ev.id, {
                            startMonth: Number.isNaN(val as number)
                              ? null
                              : (val as number),
                          });
                        }}
                        className="w-12 border border-slate-300 rounded-lg px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-sky-500/70"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-slate-500">
                      {t.eventsEndLabel}
                    </span>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        value={ev.endYear ?? ""}
                        disabled={ongoing}
                        onChange={(e) => {
                          const raw = e.target.value;
                          const val = raw === "" ? null : parseInt(raw, 10);
                          onUpdate(ev.id, {
                            endYear: Number.isNaN(val as number)
                              ? null
                              : (val as number),
                          });
                        }}
                        className="w-16 border border-slate-300 rounded-lg px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-sky-500/70 disabled:bg-slate-50"
                      />
                      <input
                        type="number"
                        min={1}
                        max={12}
                        value={ev.endMonth ?? ""}
                        disabled={ongoing}
                        onChange={(e) => {
                          const raw = e.target.value;
                          const val = raw === "" ? null : parseInt(raw, 10);
                          onUpdate(ev.id, {
                            endMonth: Number.isNaN(val as number)
                              ? null
                              : (val as number),
                          });
                        }}
                        className="w-12 border border-slate-300 rounded-lg px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-sky-500/70 disabled:bg-slate-50"
                      />
                    </div>
                    <label className="flex items-center gap-1 text-[10px] text-slate-600 mt-1">
                      <input
                        type="checkbox"
                        checked={ongoing}
                        onChange={(e) => {
                          if (e.target.checked) {
                            onUpdate(ev.id, {
                              endYear: null,
                              endMonth: null,
                            });
                          } else {
                            onUpdate(ev.id, {
                              endYear: ev.startYear,
                              endMonth: ev.startMonth,
                            });
                          }
                        }}
                        className="h-3 w-3 rounded border-slate-300 text-sky-600 focus:outline-none focus:ring-1 focus:ring-sky-500/70"
                      />
                      <span>{t.eventsOngoingLabel}</span>
                    </label>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-[11px]">
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-slate-500">
                      {t.eventsIconLabel}
                    </span>
                    <select
                      value={ev.icon || "auto"}
                      onChange={(e) =>
                        onUpdate(ev.id, {
                          icon:
                            e.target.value === "auto"
                              ? ""
                              : e.target.value,
                        })
                      }
                      className="border border-slate-300 rounded-lg px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-sky-500/70"
                    >
                      <option value="auto">
                        {isPl ? "Domyślna z typu" : "Default for type"}
                      </option>
                      <option value="👶">
                        👶 {isPl ? "Dziecko" : "Child"}
                      </option>
                      <option value="❤️">
                        ❤️ {isPl ? "Relacja" : "Relationship"}
                      </option>
                      <option value="💼">
                        💼 {isPl ? "Praca" : "Work"}
                      </option>
                      <option value="🏠">
                        🏠 {isPl ? "Przeprowadzka" : "Move"}
                      </option>
                      <option value="⚕️">
                        ⚕️ {isPl ? "Zdrowie" : "Health"}
                      </option>
                      <option value="🕯️">
                        🕯️ {isPl ? "Strata" : "Loss"}
                      </option>
                      <option value="⭐">
                        ⭐ {isPl ? "Inne" : "Other"}
                      </option>
                    </select>
                  </div>

                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-slate-500">
                      {t.eventsColorLabel}
                    </span>
                    <input
                      type="color"
                      value={ev.color ?? getEventColor(ev.type)}
                      onChange={(e) =>
                        onUpdate(ev.id, { color: e.target.value })
                      }
                      className="h-5 w-8 border border-slate-300 rounded cursor-pointer bg-transparent"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

