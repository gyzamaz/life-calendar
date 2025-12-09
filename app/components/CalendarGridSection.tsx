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

import { getEventColor, getEventDefaultIcon } from "../utils";

import {
  resetFilters,
  DEFAULT_CATEGORY_FILTER,
  DEFAULT_AGE_FILTER,
} from "../utils/resetFilters";

import { CategoryKey } from "../types";
import { Settings } from "../interfaces";

import { LegendItem } from "./LegendItem";

interface Category {
  key: CategoryKey;
  color: string;
}

const CATEGORIES: Category[] = [
  { key: "none", color: "#e5e7eb" },
  { key: "learning", color: "#60a5fa" },
  { key: "work", color: "#4ade80" },
  { key: "retirement", color: "#a1a1aa" },
  { key: "other", color: "#facc15" },
];



type CalendarData = Record<string, CategoryKey>;

interface CalendarGridSectionProps {
  t: Record<string, string>;
  settings: Settings;
  calendar: CalendarData;
  milestones: MilestoneMap;
  events: LifeEvent[];
  activeCategory: CategoryKey;
  onActiveCategoryChange: (key: CategoryKey) => void;
  selectedCell: { year: number; month: number } | null;
  onSelectCell: (year: number, month: number) => void;
  calendarReady: boolean;
  currentPosition: CurrentPosition | null;
  onUpdateCalendar: Dispatch<SetStateAction<CalendarData>>;
}

function lifeCellToCalendarDate(
  settings: Settings,
  lifeYear: number,
  lifeMonth: number
): { year: number; month: number } | null {
  const { birthYear, birthMonth } = settings;
  if (!birthYear || !birthMonth) return null;

  const lifeIndex = (lifeYear - 1) * 12 + (lifeMonth - 1);
  const monthIndexFromBirth = (birthMonth - 1) + lifeIndex;

  const year = birthYear + Math.floor(monthIndexFromBirth / 12);
  const month = (monthIndexFromBirth % 12) + 1;

  return { year, month };
}

function isDateWithinEvent(
  year: number,
  month: number,
  ev: LifeEvent
): boolean {
  if (!ev.startYear || !ev.startMonth) return false;

  const startCmp = compareYearMonth(year, month, ev.startYear, ev.startMonth);
  if (startCmp < 0) return false;

  if (!ev.endYear || !ev.endMonth) {
    return true;
  }

  const endCmp = compareYearMonth(year, month, ev.endYear, ev.endMonth);
  return endCmp <= 0;
}

function getEventsForCell(
  settings: Settings,
  events: LifeEvent[],
  lifeYear: number,
  lifeMonth: number
): LifeEvent[] {
  const date = lifeCellToCalendarDate(settings, lifeYear, lifeMonth);
  if (!date) return [];
  const { year, month } = date;
  return events.filter((ev) => isDateWithinEvent(year, month, ev));
}



function compareYearMonth(
  aYear: number,
  aMonth: number,
  bYear: number,
  bMonth: number
): number {
  if (aYear !== bYear) return aYear < bYear ? -1 : 1;
  if (aMonth !== bMonth) return aMonth < bMonth ? -1 : 1;
  return 0;
}


function getMilestoneIcon(ms: Milestone): string {
  const text = (ms.title + " " + ms.description).toLowerCase();

  if (text.includes("ślub") || text.includes("slub") || text.includes("wesele") || text.includes("małżeń") || text.includes("malzen")) {
    return "💍";
  }
  if (
    text.includes("dziecko") ||
    text.includes("syn") ||
    text.includes("córk") ||
    text.includes("cork") ||
    text.includes("urodził") ||
    text.includes("urodzil")
  ) {
    return "👶";
  }
  if (text.includes("przeprowadzk") || text.includes("wyprowadz") || text.includes("wprowadz")) {
    return "🏠";
  }
  if (text.includes("kraj") || text.includes("emigrac") || text.includes("emigr") || text.includes("zagranic")) {
    return "🌍";
  }
  if (text.includes("wypalenie") || text.includes("burnout")) {
    return "🧯";
  }

  return "★";
}



export function CalendarGridSection({
  t,
  settings,
  calendar,
  milestones,
  events,
  activeCategory,
  onActiveCategoryChange,
  selectedCell,
  onSelectCell,
  calendarReady,
  currentPosition,
  onUpdateCalendar,
}: CalendarGridSectionProps) {
  const calendarRef = useRef<HTMLDivElement | null>(null);

  const [isPainting, setIsPainting] = useState(false);

  const yearsArray = useMemo(
    () => Array.from({ length: settings.maxAge }, (_, i) => i + 1),
    [settings.maxAge]
  );

  const [categoryFilter, setCategoryFilter] =
    useState<CategoryKey[]>(DEFAULT_CATEGORY_FILTER);
  
  const [ageFilter, setAgeFilter] = useState<AgeFilter>(DEFAULT_AGE_FILTER);
  
  useEffect(() => {
    function stopPainting() {
      setIsPainting(false);
    }
    window.addEventListener("pointerup", stopPainting);
    window.addEventListener("pointercancel", stopPainting);
    return () => {
      window.removeEventListener("pointerup", stopPainting);
      window.removeEventListener("pointercancel", stopPainting);
    };
  }, []);

  function applyCategory(year: number, month: number, category: CategoryKey) {
    const id = `${year}-${month}`;
    onUpdateCalendar((prev) => {
      const updated: CalendarData = { ...prev };
      if (category === "none") {
        delete updated[id];
      } else {
        updated[id] = category;
      }
      return updated;
    });
  }

  function handleCellPointerDown(
    e: PointerEvent<HTMLButtonElement>,
    year: number,
    month: number
  ) {
    e.preventDefault();
    setIsPainting(true);
    applyCategory(year, month, activeCategory);
  }

  function handleCellPointerEnter(
    e: PointerEvent<HTMLButtonElement>,
    year: number,
    month: number
  ) {
    if (!isPainting) return;
    e.preventDefault();
    applyCategory(year, month, activeCategory);
  }

  function toggleCategoryFilter(key: CategoryKey) {
    if (key === "none") return;
    setCategoryFilter((prev) => {
      const isActive = prev.includes(key);
      if (isActive) {
        return prev.filter((k) => k !== key);
      }
      return [...prev, key];
    });
  }

  const activeCategoryLabel = useMemo(() => {
    switch (activeCategory) {
      case "learning":
        return t.category_learning;
      case "work":
        return t.category_work;
      case "retirement":
        return t.category_retirement;
      case "other":
        return t.category_other;
      case "none":
      default:
        return t.category_none;
    }
  }, [activeCategory, t]);

  return (
    <div      ref={calendarRef}    >
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 text-[11px] text-slate-600">
          <span>{t.activeCategoryLabel}:</span>
          <span className="inline-flex items-center gap-1 rounded-full border border-slate-300 bg-slate-50 px-2 py-0.5">
            <span
              className="inline-flex h-3 w-3 rounded-[5px]"
              style={{
                backgroundColor:
                  CATEGORIES.find((c) => c.key === activeCategory)?.color ??
                  "#e5e7eb",
              }}
            />
            <span className="font-medium text-slate-800">
              {activeCategoryLabel}
            </span>
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {(["learning", "work", "retirement", "other", "none"] as CategoryKey[]).map(
            (key) => {
              const cat = CATEGORIES.find((c) => c.key === key)!;
              let label: string;
              switch (key) {
                case "learning":
                  label = t.category_learning;
                  break;
                case "work":
                  label = t.category_work;
                  break;
                case "retirement":
                  label = t.category_retirement;
                  break;
                case "other":
                  label = t.category_other;
                  break;
                case "none":
                default:
                  label = t.category_none;
                  break;
              }
              return (
                <LegendItem
                  key={key}
                  label={label}
                  color={cat.color}
                  active={activeCategory === key}
                  onClick={() => onActiveCategoryChange(key)}
                />
              );
            }
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] text-slate-500">
            {t.filterCategoriesTitle}:
          </span>
          {(["learning", "work", "retirement", "other"] as CategoryKey[]).map(
            (key) => {
              const active = categoryFilter.includes(key);
              let label: string;
              switch (key) {
                case "learning":
                  label = t.category_learning;
                  break;
                case "work":
                  label = t.category_work;
                  break;
                case "retirement":
                  label = t.category_retirement;
                  break;
                case "other":
                default:
                  label = t.category_other;
                  break;
              }
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => toggleCategoryFilter(key)}
                  className={`rounded-full border px-2.5 py-1 text-[11px] transition-colors ${
                    active
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-400 hover:bg-slate-100"
                  }`}
                >
                  {label}
                </button>
              );
            }
          )}
        </div>
        <button
          type="button"
          onClick={() => resetFilters(setCategoryFilter, setAgeFilter)}
          className="text-[11px] text-slate-500 hover:text-slate-800 underline underline-offset-2"
        >
          {t.filterReset}
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-2">
        <span className="text-[11px] text-slate-500">
          {t.filterAgeTitle}:
        </span>
        <div className="flex items-center gap-1 text-[11px]">
          <span>{t.filterAgeFrom}</span>
          <input
            type="number"
            min={1}
            max={settings.maxAge}
            value={ageFilter.from ?? ""}
            onChange={(e) => {
              const raw = e.target.value;
              if (raw === "") {
                setAgeFilter((prev) => ({ ...prev, from: null }));
                return;
              }
              const val = parseInt(raw, 10);
              if (Number.isNaN(val)) return;
              const clamped = Math.min(Math.max(val, 1), settings.maxAge);
              setAgeFilter((prev) => ({ ...prev, from: clamped }));
            }}
            className="w-14 border border-slate-300 rounded-lg px-2 py-1 text-[11px] bg-white focus:outline-none focus:ring-1 focus:ring-sky-500/70"
          />
        </div>
        <div className="flex items-center gap-1 text-[11px]">
          <span>{t.filterAgeTo}</span>
          <input
            type="number"
            min={1}
            max={settings.maxAge}
            value={ageFilter.to ?? ""}
            onChange={(e) => {
              const raw = e.target.value;
              if (raw === "") {
                setAgeFilter((prev) => ({ ...prev, to: null }));
                return;
              }
              const val = parseInt(raw, 10);
              if (Number.isNaN(val)) return;
              const clamped = Math.min(Math.max(val, 1), settings.maxAge);
              setAgeFilter((prev) => ({ ...prev, to: clamped }));
            }}
            className="w-14 border border-slate-300 rounded-lg px-2 py-1 text-[11px] bg-white focus:outline-none focus:ring-1 focus:ring-sky-500/70"
          />
        </div>
      </div>
      <div className="mt-2 flex-1 overflow-y-auto pr-1">
        {!calendarReady ? (
          <div className="flex items-center justify-center py-16 text-sm text-slate-400">
            Ładowanie danych z przeglądarki...
          </div>
        ) : (
          <div className="space-y-1.5">
            {yearsArray.map((year) => {
              const yearImportantMilestones = Object.entries(milestones).filter(
                ([id, ms]) => {
                  const [y] = id.split("-");
                  return parseInt(y, 10) === year && ms.important;
                }
              );

              const yearHasImportant = yearImportantMilestones.length > 0;
              const yearTooltip =
                yearImportantMilestones
                  .map(([id, ms]) => ms.title || ms.description)
                  .filter(Boolean)
                  .join(" • ") || "";

              return (
                <div
                  key={year}
                  className="flex items-center gap-2 text-[10px]"
                >
                  <div className="w-24 pr-1 flex-shrink-0 text-right text-slate-400">
                    <div
                      className="flex items-center justify-end gap-1"
                      title={yearTooltip}
                    >
                      <span>
                        {year}. {t.yearLabel}
                      </span>
                      {yearHasImportant &&
                        yearImportantMilestones.slice(0, 3).map(([id, ms]) => (
                          <span key={id} className="text-[11px]">
                            {getMilestoneIcon(ms)}
                          </span>
                        ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-12 gap-[3px] flex-1">
                    {Array.from({ length: 12 }, (_, i) => i + 1).map(
                      (month) => {
                        const id = `${year}-${month}`;
                        const key = calendar[id] ?? "none";
                        const category =
                          CATEGORIES.find((c) => c.key === key) ??
                          CATEGORIES[0];

                        const isCurrent =
                          currentPosition?.yearIndex === year - 1 &&
                          currentPosition?.monthIndex === month - 1;

                        const isSelected =
                          selectedCell?.year === year &&
                          selectedCell?.month === month;

                        const cellMilestone = milestones[id];
                        const hasMilestone = Boolean(cellMilestone);
                        const isImportant = Boolean(
                          cellMilestone?.important
                        );

                        const matchesCategory =
                          categoryFilter.length === 0 ||
                          key === "none" ||
                          categoryFilter.includes(key);

                        const matchesAge =
                          (!ageFilter.from || year >= ageFilter.from) &&
                          (!ageFilter.to || year <= ageFilter.to);

                        const dimmed = !(matchesCategory && matchesAge);

                        const cellEvents = getEventsForCell(
                          settings,
                          events,
                          year,
                          month
                        );

                        const eventsLabel =
                          cellEvents.length > 0
                            ? " – " +
                              cellEvents
                                .map((ev) => ev.title || "")
                                .filter(Boolean)
                                .join(" • ")
                            : "";

                        return (
                          <button
                            key={month}
                            type="button"
                            onPointerDown={(e) =>
                              handleCellPointerDown(e, year, month)
                            }
                            onPointerEnter={(e) =>
                              handleCellPointerEnter(e, year, month)
                            }
                            onClick={() => onSelectCell(year, month)}
                            className={`relative h-5 w-5 md:h-6 md:w-6 rounded-[4px] border transition-all focus:outline-none focus:ring-2 focus:ring-sky-400/80 ${
                              isCurrent
                                ? "border-red-500 ring-1 ring-red-400"
                                : isSelected
                                ? "border-sky-500"
                                : isImportant
                                ? "border-amber-500"
                                : hasMilestone
                                ? "border-indigo-500"
                                : "border-slate-200 hover:border-slate-400"
                            } ${dimmed ? "opacity-30" : ""}`}
                            style={{ backgroundColor: category.color }}
                            title={`${year}. ${t.yearLabel}, ${month}. ${
                              t.monthShort
                            }${eventsLabel}`}
                          >
                            {cellEvents.length > 0 && (
                              <>
                                <div className="absolute top-[1px] left-[1px] right-[1px] flex justify-center gap-[1px]">
                                  {cellEvents.slice(0, 3).map((ev) => (
                                    <span
                                      key={ev.id}
                                      className="h-1 w-2 rounded-full"
                                      style={{
                                        backgroundColor:
                                          ev.color ??
                                          getEventColor(ev.type),
                                      }}
                                    />
                                  ))}
                                </div>
                                <div className="absolute top-[3px] inset-x-0 flex justify-center pointer-events-none">
                                  <span className="text-[9px] leading-none">
                                    {cellEvents[0].icon ||
                                      getEventDefaultIcon(
                                        cellEvents[0].type
                                      )}
                                  </span>
                                </div>
                              </>
                            )}

                            {isSelected && (
                              <span className="absolute -top-1 -right-1 rounded-full bg-sky-600 text-white text-[9px] px-[3px] py-[1px] shadow">
                                ✏️
                              </span>
                            )}

                            {isImportant && (
                              <span className="absolute bottom-[1px] right-[1px] text-[10px] leading-none text-amber-500">
                                ★
                              </span>
                            )}
                            {!isImportant && hasMilestone && (
                              <span className="absolute bottom-[1px] right-[1px] h-1.5 w-1.5 rounded-full bg-indigo-500" />
                            )}
                          </button>
                        );
                      }
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}



