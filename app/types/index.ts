import {
    Milestone,
    LifeEvent,  
    Category,
    Settings,
} from "../interfaces";


export type CategoryKey = "none" | "learning" | "work" | "retirement" | "other";

export type MilestoneMap = Record<string, Milestone>;

export type LifeEventType =
  | "work"
  | "study"
  | "child"
  | "relationship"
  | "health"
  | "loss"
  | "move"
    | "other";
  
  export type CalendarData = Record<string, CategoryKey>;

  export type Language = "pl" | "en";

  export type AgeFilter = { from: number | null; to: number | null };
