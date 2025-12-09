import type React from "react";
import { CategoryKey, AgeFilter } from "../types";

export const DEFAULT_CATEGORY_FILTER: CategoryKey[] = [
  "learning",
  "work",
  "retirement",
  "other",
];

export const DEFAULT_AGE_FILTER: AgeFilter = {
  from: null,
  to: null,
};

export function resetFilters(
  setCategoryFilter: React.Dispatch<React.SetStateAction<CategoryKey[]>>,
  setAgeFilter: React.Dispatch<React.SetStateAction<AgeFilter>>
) {
  setCategoryFilter(DEFAULT_CATEGORY_FILTER);
  setAgeFilter({ ...DEFAULT_AGE_FILTER });
}
