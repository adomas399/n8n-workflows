import { ScheduleTriggerRule } from "../types";
import { isStringArray, parseWeekdays } from "../utils";
import WorkflowNode from "./WorkflowNode";

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

export default class ScheduleTrigger extends WorkflowNode {
  protected static counter = 0;

  constructor(config: {
    id?: string;
    name?: string;
    version?: number;
    rules: ScheduleTriggerRule[];
    connections?: string[];
    position?: [number, number];
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
      name:
        config.name ??
        `Schedule Trigger${
          ScheduleTrigger.counter++ > 0 ? " " + ScheduleTrigger.counter : ""
        }`,
      type: "n8n-nodes-base.scheduleTrigger",
      version: config.version ?? 1.2,
      parameters: { rule: { interval: normalizedRules } },
      connections: config.connections && { main: config.connections },
      position: config.position,
    });
  }
}
