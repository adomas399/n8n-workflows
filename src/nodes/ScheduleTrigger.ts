import { isStringArray, parseWeekdays } from "../utils";
import { Node } from "./Node";

const normalizeScheduleRule = (
  raw: Record<string, any>
): Record<string, any> => {
  if ("secondsInterval" in raw) return { field: "Seconds", ...raw };
  if ("minutesInterval" in raw) return { field: "Minutes", ...raw };
  if ("hoursInterval" in raw) return { field: "Hours", ...raw };
  if ("daysInterval" in raw) return { field: "Days", ...raw };
  if ("weeksInterval" in raw) return { field: "Weeks", ...raw };
  if ("monthsInterval" in raw) return { field: "Months", ...raw };
  throw new Error("Invalid schedule rule: missing interval field");
};

interface SecondsInterval {
  secondsInterval: number | string;
}

interface MinutesInterval {
  minutesInterval: number | string;
}

interface HoursInterval {
  hoursInterval: number | string;
}

interface DaysInterval {
  daysInterval: number | string;
  triggerAtHour?: number | string;
  triggerAtMinute?: number | string;
}

interface WeeksInterval {
  weeksInterval: number | string;
  triggerAtDay: string[] | number[] | string; // 0 = Sunday ... 6 = Saturday
  triggerAtHour?: number | string;
  triggerAtMinute?: number | string;
}

interface MonthsInterval {
  monthsInterval: number | string;
  triggerAtDayOfMonth: number | string;
  triggerAtHour?: number | string;
  triggerAtMinute?: number | string;
}

export type ScheduleTriggerRule =
  | SecondsInterval
  | MinutesInterval
  | HoursInterval
  | DaysInterval
  | WeeksInterval
  | MonthsInterval;

export class ScheduleTrigger extends Node {
  private static counter = 1;

  constructor(config: {
    id?: string;
    name?: string;
    version?: number;
    rules: ScheduleTriggerRule[];
    connections?: string[];
  }) {
    const normalizedRules: Record<string, any> = config.rules.map((raw) => {
      const rule = normalizeScheduleRule(raw);
      if (rule.field === "Weeks" && isStringArray(rule.triggerAtDay)) {
        rule.triggerAtDay = parseWeekdays(rule.triggerAtDay);
      }
      return rule;
    });

    super({
      id: config.id,
      name: config.name ?? `Schedule Trigger ${ScheduleTrigger.counter++}`,
      type: "n8n-nodes-base.scheduleTrigger",
      version: config.version,
      parameters: { rule: { interval: normalizedRules } },
      connections: config.connections && { main: config.connections },
    });
  }
}
