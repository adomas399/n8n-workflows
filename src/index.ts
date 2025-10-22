import 'dotenv/config';
import type { LLMProvider, Weekday } from './types';
import { ScheduleTriggerRule } from './types';
import { capitalizeFirst, loadFile } from './utils';
import BudgetReport from './workflows/BudgetReport';

// helpers
function get(name: string): string | undefined {
  const v = process.env[name];
  return v && v.trim() ? v.trim() : undefined;
}
function must(name: string): string {
  const v = get(name);
  if (!v) {
    console.error(`Missing required env: ${name}`);
    process.exit(1);
  }
  return v;
}
function parseBool(str: string | undefined, fallback = false) {
  if (str == null) return fallback;
  return String(str).toLowerCase() === 'true';
}

// load prompt
const prompt = loadFile('budgetReviewPrompt.txt');

// required
const N8N_URL = must('N8N_URL');
const N8N_API_KEY = must('N8N_API_KEY');

const LLM_PROVIDER = must('LLM_PROVIDER') as LLMProvider; // typed via your union elsewhere if desired
const LLM_PROVIDER_CREDENTIAL_ID = must('LLM_PROVIDER_CREDENTIAL_ID');

const RESEND_CREDENTIAL_ID = must('RESEND_CREDENTIAL_ID');
const MAIL_FROM = must('MAIL_FROM');
const MAIL_TO = must('MAIL_TO');
const OVERWRITE = parseBool(get('OVERWRITE'), true);
const MCP_ENDPOINT = must('MCP_ENDPOINT');

// MCP Auth (optional)
const MCP_AUTHENTICATION = get('MCP_AUTHENTICATION') as
  | 'bearerAuth'
  | 'headerAuth'
  | undefined;
const MCP_CREDENTIAL_ID = get('MCP_CREDENTIAL_ID');

// if auth set, enforce credential id presence at runtime too
if (MCP_AUTHENTICATION && !MCP_CREDENTIAL_ID) {
  console.error(
    'MCP_CREDENTIAL_ID is required when MCP_AUTHENTICATION is set.'
  );
  process.exit(1);
}

// optional with defaults
const WORKFLOW_NAME = get('WORKFLOW_NAME') ?? 'Weekly Budget Report';
const CHAT_MODEL = get('CHAT_MODEL') ?? 'anthropic/claude-3.7-sonnet';

// weekday (typed)
const weekDayRaw = get('WEEK_DAY');
let weekDay: Weekday = 'Sunday';
if (weekDayRaw) {
  const normalized = capitalizeFirst(weekDayRaw.toLowerCase());
  const valid: Weekday[] = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];
  if (valid.includes(normalized as Weekday)) {
    weekDay = normalized as Weekday;
  } else {
    console.warn(`⚠️ Invalid WEEK_DAY "${weekDayRaw}". Defaulting to Sunday.`);
  }
}

const hourRaw = get('HOUR');
let hour = 21;
if (
  Number(hourRaw) &&
  Number(hourRaw) >= 0 &&
  Number(hourRaw) <= 23 &&
  Number(hourRaw) % 1 == 0
) {
  hour = Number(hourRaw);
} else {
  console.warn(`⚠️ Invalid HOUR "${hourRaw}". Defaulting to 21.`);
}

// schedule
const scheduleTriggerRules: ScheduleTriggerRule[] = [
  {
    weeksInterval: 1,
    triggerAtDay: [weekDay],
    triggerAtHour: 21,
  },
];

// include tools
const includeMCPTools = [
  'get-accounts',
  'spending-by-category',
  'balance-history',
  'monthly-summary',
];

// instantiate
const budgetReport = new BudgetReport({
  name: WORKFLOW_NAME,
  scheduleTriggerRules,
  prompt,
  chatModel: CHAT_MODEL,
  modelProvider: LLM_PROVIDER,
  modelProviderCredentialID: LLM_PROVIDER_CREDENTIAL_ID,
  MCPEndpoint: MCP_ENDPOINT,
  MCPAuthentication: MCP_AUTHENTICATION,
  MCPCredentialID: MCP_CREDENTIAL_ID,
  includeMCPTools,
  mailFrom: MAIL_FROM,
  mailTo: MAIL_TO,
  resendCredentialID: RESEND_CREDENTIAL_ID,
});

// debug + push
budgetReport.save();
budgetReport.push(OVERWRITE, N8N_URL, N8N_API_KEY);
