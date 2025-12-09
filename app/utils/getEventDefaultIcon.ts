import { LifeEventType } from "../types";

export function getEventDefaultIcon(type: LifeEventType): string {
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
