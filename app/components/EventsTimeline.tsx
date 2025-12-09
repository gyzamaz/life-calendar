"use client";


import {
  useMemo,
  useState,
} from "react";

import { settingsLanguageIsPl, getEventColor } from "../utils";

type LifeEventType =
  | "work"
  | "study"
  | "child"
  | "relationship"
  | "health"
  | "loss"
  | "move"
  | "other";

interface LifeEvent {
  id: string;
  title: string;
  type: LifeEventType;
  startYear: number | null;
  startMonth: number | null;
  endYear: number | null;
  endMonth: number | null;
  color?: string;
  icon?: string;
}


function calendarDateToLifeIndexForTimeline(
  birthYear: number | null,
  birthMonth: number | null,
  maxAge: number,
  year: number,
  month: number
): number | null {
  if (!birthYear || !birthMonth) return null;
  const index = (year - birthYear) * 12 + (month - birthMonth);
  if (index < 0) return null;
  const totalMonths = maxAge * 12;
  if (index > totalMonths - 1) return null;
  return index;
}

function getEventDefaultIcon(type: LifeEventType): string {
  switch (type) {
    case "work":
      return "💼";
    case "study":
      return "🎓";
    case "child":
      return "👶";
    case "relationship":
      return "❤️";
    case "health":
      return "⚕️";
    case "loss":
      return "🕯️";
    case "move":
      return "🚚";
    case "other":
    default:
      return "⭐";
  }
}

export function EventsTimeline({
  t,
  events,
  birthYear,
  birthMonth,
  maxAge,
}: {
  t: Record<string, string>;
  events: LifeEvent[];
  birthYear: number | null;
  birthMonth: number | null;
  maxAge: number;
    }) {
    
  const totalMonths = maxAge * 12;
  const [zoom, setZoom] = useState(1.5);

  const bars = useMemo(() => {
    if (!birthYear || !birthMonth) return [];
    const result: { ev: LifeEvent; left: number; width: number }[] = [];

    for (const ev of events) {
      if (!ev.startYear || !ev.startMonth) continue;

      const startIndex = calendarDateToLifeIndexForTimeline(
        birthYear,
        birthMonth,
        maxAge,
        ev.startYear,
        ev.startMonth
      );
      if (startIndex == null) continue;

      let endIndex: number;
      if (ev.endYear && ev.endMonth) {
        const ei = calendarDateToLifeIndexForTimeline(
          birthYear,
          birthMonth,
          maxAge,
          ev.endYear,
          ev.endMonth
        );
        if (ei == null) continue;
        endIndex = Math.max(startIndex, ei);
      } else {
        endIndex = totalMonths - 1;
      }

      if (startIndex > totalMonths - 1) continue;
      endIndex = Math.min(endIndex, totalMonths - 1);

      const left = (startIndex / totalMonths) * 100;
      const width =
        ((endIndex - startIndex + 1) / totalMonths) * 100;

      result.push({ ev, left, width });
    }

    return result;
  }, [events, birthYear, birthMonth, maxAge, totalMonths]);

  if (!birthYear || !birthMonth) {
    return (
      <p className="text-[10px] text-slate-400">
        {t.eventsNeedsBirthInfo}
      </p>
    );
  }

  if (!bars.length) {
    return (
      <p className="text-[10px] text-slate-400">
        {t.eventsTimelineEmpty}
      </p>
    );
  }

  const zoomLabel =
    t.eventsTimelineZoomLabel ??
    (settingsLanguageIsPl(t)
      ? "Powiększenie osi"
      : "Timeline zoom");

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-medium text-slate-600">
          {t.eventsTimelineTitle}
        </p>
        <div className="flex items-center gap-2 text-[10px] text-slate-500">
          <span>{zoomLabel}</span>
          <input
            type="range"
            min={1}
            max={4}
            step={0.5}
            value={zoom}
            onChange={(e) => setZoom(parseFloat(e.target.value))}
            className="w-24"
          />
          <span className="tabular-nums text-[10px] text-slate-400">
            {zoom.toFixed(1)}×
          </span>
        </div>
      </div>

      <div className="w-full overflow-x-auto">
        <div
          className="relative h-10 rounded-lg bg-slate-50 border border-slate-200 overflow-hidden min-w-full"
          style={{ width: `${zoom * 100}%` }}
        >
          {bars.map((bar) => (
            <div
              key={bar.ev.id}
              className="absolute top-1 bottom-1 rounded-md px-1 flex items-center gap-1 text-[9px] text-white shadow-sm"
              style={{
                left: `${bar.left}%`,
                width: `${Math.max(bar.width, 1)}%`,
                backgroundColor:
                  bar.ev.color ?? getEventColor(bar.ev.type),
              }}
              title={bar.ev.title}
            >
              <span>
                {bar.ev.icon || getEventDefaultIcon(bar.ev.type)}
              </span>
              <span className="truncate">
                {bar.ev.title || "…"}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-between text-[9px] text-slate-400">
        <span>0</span>
        <span>{Math.floor(maxAge / 2)}</span>
        <span>{maxAge}</span>
      </div>
    </div>
  );
}