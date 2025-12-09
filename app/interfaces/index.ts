import { LifeEventType, CategoryKey, Language } from "../types";

export interface Milestone {
  title: string;
  description: string;
  important?: boolean;
}


export interface LifeEvent {
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

export interface Category {
  key: CategoryKey;
  color: string;
}

export interface Settings {
  maxAge: number;
  birthYear: number | null;
  birthMonth: number | null;
  language: Language;
}

export interface QuickConfig {
  highSchoolFrom: number | null;
  highSchoolYears: number | null;
  universityFrom: number | null;
  universityYears: number | null;
  careerFrom: number | null;
  careerYears: number | null;
  retirementFrom: number | null;
}

export interface CurrentPosition {
  yearIndex: number;
  monthIndex: number;
  ageYears: number;
}
