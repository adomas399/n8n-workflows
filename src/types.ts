export type Weekday =
  | 'Monday'
  | 'Tuesday'
  | 'Wednesday'
  | 'Thursday'
  | 'Friday'
  | 'Saturday'
  | 'Sunday';

export interface WorkflowJSON {
  name: string;
  nodes: Record<string, any>[];
  connections: Record<string, Record<string, any>>;
  settings: Record<string, any>;
}

export type LLMProvider =
  | 'OpenRouter'
  | 'OpenAi'
  | 'Anthropic'
  | 'GoogleGemini'
  | 'MistralCloud'
  | 'DeepSeek'
  | 'Groq'
  | 'XAiGroq'
  | 'AzureOpenAi'
  | 'Ollama'
  | 'AwsBedrock';

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
  triggerAtDay: Weekday[];
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
