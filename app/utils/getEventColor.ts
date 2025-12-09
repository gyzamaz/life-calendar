import { LifeEventType } from "../types";

export function getEventColor(type: LifeEventType): string {
  switch (type) {
    case "work":
      return "#0ea5e9";
    case "study":
      return "#6366f1";
    case "child":
      return "#f97316";
    case "relationship":
      return "#ec4899";
    case "health":
      return "#22c55e";
    case "loss":
      return "#6b7280";
    case "move":
      return "#06b6d4";
    case "other":
    default:
      return "#facc15";
  }
}