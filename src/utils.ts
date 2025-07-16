const weekdayMap = {
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
} as const;

type Weekday = (typeof weekdayMap)[keyof typeof weekdayMap];

export function parseWeekdays(days: string[]): Weekday[] {
  return days.map((day) => {
    const normalized = day.toLowerCase();
    const value = weekdayMap[normalized as keyof typeof weekdayMap];
    if (value === undefined) throw new Error(`Invalid weekday: ${day}`);
    return value;
  });
}

export function isStringArray(value: unknown): value is string[] {
  return (
    Array.isArray(value) && value.every((item) => typeof item === "string")
  );
}
