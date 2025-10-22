import fs from 'fs';
import path from 'path';

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
    Array.isArray(value) && value.every((item) => typeof item === 'string')
  );
}

export function loadFile(filename: string): string {
  return fs.readFileSync(
    path.join(__dirname, '..', 'input', filename),
    'utf-8'
  );
}

export function saveFile(data: any, filename: string): string {
  const outputDir = path.join(__dirname, '..', 'output');
  const outputPath = path.join(outputDir, filename);

  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(outputPath, JSON.stringify(data));

  return outputPath;
}

export async function safeJson(res: Response) {
  const contentType = res.headers.get('content-type') || '';

  // Check status
  if (!res.ok) {
    const text = await res.text();
    throw new Error(
      `HTTP ${res.status} ${res.statusText}\n` +
        (text.startsWith('<!DOCTYPE')
          ? '→ HTML returned (wrong URL or auth?)'
          : text.slice(0, 200))
    );
  }

  // Check content type
  if (!contentType.includes('application/json')) {
    const text = await res.text();
    throw new Error(
      `Expected JSON but got ${contentType}\n` +
        (text.startsWith('<!DOCTYPE')
          ? '→ HTML returned (probably login/error page)'
          : text.slice(0, 200))
    );
  }

  // Safe to parse now
  return res.json();
}

export function capitalizeFirst(str: string | undefined) {
  if (!str) return;
  str = str.toLowerCase();
  return str.charAt(0).toUpperCase() + str.slice(1);
}
