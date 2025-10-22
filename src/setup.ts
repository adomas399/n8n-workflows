#!/usr/bin/env node
import { input, select } from '@inquirer/prompts';
import dotenv from 'dotenv';
import fs from 'node:fs';
import path from 'node:path';
import { z } from 'zod';

// Types from your project
import type { Weekday } from './types';
type LLMProvider =
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

const ENV_PATH = path.resolve(process.cwd(), '.env');

const WEEKDAYS = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
] as const satisfies readonly Weekday[];

const LLM_PROVIDERS = [
  'OpenRouter',
  'OpenAi',
  'Anthropic',
  'GoogleGemini',
  'MistralCloud',
  'DeepSeek',
  'Groq',
  'XAiGroq',
  'AzureOpenAi',
  'Ollama',
  'AwsBedrock',
] as const satisfies readonly LLMProvider[];

let existing: Record<string, string> = {};
if (fs.existsSync(ENV_PATH)) existing = dotenv.parse(fs.readFileSync(ENV_PATH));

const schema = z
  .object({
    // Required
    N8N_URL: z.string().url(),
    N8N_API_KEY: z.string().min(1),
    LLM_PROVIDER: z.enum(LLM_PROVIDERS),
    LLM_PROVIDER_CREDENTIAL_ID: z.string().min(1),
    RESEND_CREDENTIAL_ID: z.string().min(1),
    MAIL_FROM: z.string().email(),
    MAIL_TO: z.string().email(),
    OVERWRITE: z.enum(['true', 'false']),
    MCP_ENDPOINT: z.string().url(),

    // MCP Authentication (optional)
    MCP_AUTHENTICATION: z.enum(['bearerAuth', 'headerAuth']).optional(),
    MCP_CREDENTIAL_ID: z.string().optional(),

    // Optional
    WORKFLOW_NAME: z.string().optional(),
    WEEK_DAY: z.enum(WEEKDAYS).optional(),
    HOUR: z.int().optional(),
    CHAT_MODEL: z.string().optional(),
  })
  .superRefine((val, ctx) => {
    // If auth is provided, credential id must be provided
    if (val.MCP_AUTHENTICATION && !val.MCP_CREDENTIAL_ID) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['MCP_CREDENTIAL_ID'],
        message:
          'MCP_CREDENTIAL_ID is required when MCP_AUTHENTICATION is set.',
      });
    }
  });

function def(key: string, fallback: any = '') {
  return existing[key] ?? process.env[key] ?? fallback;
}
function quoteIfNeeded(v: string) {
  return /[\s#=]/.test(v) ? JSON.stringify(v) : v;
}

(async () => {
  console.log('\n🔧 Setup — generate/update your .env\n');

  // Required
  const N8N_URL = await input({
    message: 'n8n base URL:',
    default: def('N8N_URL', 'https://n8n.example.com'),
  });
  const N8N_API_KEY = await input({
    message: 'n8n API key:',
    default: def('N8N_API_KEY'),
  });

  const LLM_PROVIDER = await select({
    message: 'LLM provider:',
    default: (LLM_PROVIDERS.includes(def('LLM_PROVIDER') as LLMProvider)
      ? def('LLM_PROVIDER')
      : 'OpenRouter') as LLMProvider,
    choices: LLM_PROVIDERS.map((p) => ({ name: p, value: p })),
  });

  const LLM_PROVIDER_CREDENTIAL_ID = await input({
    message: 'LLM provider credential ID:',
    default: def('LLM_PROVIDER_CREDENTIAL_ID'),
  });

  const RESEND_CREDENTIAL_ID = await input({
    message: 'Resend credential ID:',
    default: def('RESEND_CREDENTIAL_ID'),
  });

  const MAIL_FROM = await input({
    message: 'Mail FROM address:',
    default: def('MAIL_FROM', 'send@email.example'),
  });
  const MAIL_TO = await input({
    message: 'Mail TO address:',
    default: def('MAIL_TO', 'receive@email.example'),
  });

  let MCP_ENDPOINT: string;
  let MCP_AUTHENTICATION: 'bearerAuth' | 'headerAuth' | undefined;
  let MCP_CREDENTIAL_ID: string | undefined;

  MCP_ENDPOINT = await input({
    message: 'MCP SSE endpoint (URL):',
    default: def('MCP_ENDPOINT', 'https://your-actual-mcp-url/sse'),
  });

  const authChoice = (await select({
    message: 'MCP auth type:',
    default: ((): 'none' | 'bearerAuth' | 'headerAuth' => {
      const v = def('MCP_AUTHENTICATION', 'bearerAuth');
      return v === 'headerAuth'
        ? 'headerAuth'
        : v === 'none'
        ? 'none'
        : 'bearerAuth';
    })(),
    choices: [
      { name: 'None', value: 'none' },
      { name: 'bearerAuth', value: 'bearerAuth' },
      { name: 'headerAuth', value: 'headerAuth' },
    ],
  })) as 'none' | 'bearerAuth' | 'headerAuth';

  if (authChoice !== 'none') {
    MCP_AUTHENTICATION = authChoice;
    MCP_CREDENTIAL_ID = await input({
      message: 'MCP credential ID:',
      default: def('MCP_CREDENTIAL_ID'),
    });
  } else {
    MCP_AUTHENTICATION = undefined;
    MCP_CREDENTIAL_ID = undefined;
  }

  // Optional
  const WORKFLOW_NAME = await input({
    message: 'Workflow name (optional):',
    default: def('WORKFLOW_NAME', 'Weekly Budget Report'),
  });
  const CHAT_MODEL = await input({
    message: 'Chat model (optional):',
    default: def('CHAT_MODEL', 'anthropic/claude-3.7-sonnet'),
  });

  const existingWeekday = def('WEEK_DAY', '');
  const weekdayDefault = WEEKDAYS.includes(existingWeekday as Weekday)
    ? (existingWeekday as Weekday)
    : 'Sunday';
  const WEEK_DAY = (await select({
    message: 'Weekly trigger day? (optional)',
    default: weekdayDefault,
    choices: [...WEEKDAYS.map((d) => ({ name: d, value: d }))],
  })) as Weekday;

  const HOUR = await input({
    message: 'LLM provider credential ID:',
    default: def('HOUR', 21),
  });

  const OVERWRITE = await select({
    message: 'Overwrite existing workflow on push?',
    default: def('OVERWRITE', 'true') === 'false' ? 'false' : 'true',
    choices: [
      { name: 'Yes (true)', value: 'true' },
      { name: 'No (false)', value: 'false' },
    ],
  });

  const parsed = schema.safeParse({
    N8N_URL,
    N8N_API_KEY,
    LLM_PROVIDER,
    LLM_PROVIDER_CREDENTIAL_ID,
    MAIL_FROM,
    MAIL_TO,
    OVERWRITE,
    MCP_ENDPOINT,
    MCP_AUTHENTICATION,
    MCP_CREDENTIAL_ID,
    WORKFLOW_NAME: WORKFLOW_NAME || undefined,
    WEEK_DAY,
    HOUR,
    CHAT_MODEL: CHAT_MODEL || undefined,
    RESEND_CREDENTIAL_ID: RESEND_CREDENTIAL_ID || undefined,
  });

  if (!parsed.success) {
    console.error('\n❌ Invalid input:');
    for (const issue of parsed.error.issues) {
      console.error(`  - ${issue.path.join('.')}: ${issue.message}`);
    }
    process.exit(1);
  }

  const env = parsed.data;
  const lines = [
    `# Generated on ${new Date().toISOString()}`,
    `N8N_URL=${quoteIfNeeded(env.N8N_URL)}`,
    `N8N_API_KEY=${quoteIfNeeded(env.N8N_API_KEY)}`,
    `LLM_PROVIDER=${env.LLM_PROVIDER}`,
    `LLM_PROVIDER_CREDENTIAL_ID=${quoteIfNeeded(
      env.LLM_PROVIDER_CREDENTIAL_ID
    )}`,
    `RESEND_CREDENTIAL_ID=${quoteIfNeeded(env.RESEND_CREDENTIAL_ID ?? '')}`,
    `MAIL_FROM=${quoteIfNeeded(env.MAIL_FROM)}`,
    `MAIL_TO=${quoteIfNeeded(env.MAIL_TO)}`,
    `OVERWRITE=${env.OVERWRITE}`,
    `MCP_ENDPOINT=${env.MCP_ENDPOINT ? quoteIfNeeded(env.MCP_ENDPOINT) : ''}`,
    `MCP_AUTHENTICATION=${env.MCP_AUTHENTICATION ?? ''}`,
    `MCP_CREDENTIAL_ID=${
      env.MCP_CREDENTIAL_ID ? quoteIfNeeded(env.MCP_CREDENTIAL_ID) : ''
    }`,
    `WORKFLOW_NAME=${quoteIfNeeded(env.WORKFLOW_NAME ?? '')}`,
    `WEEK_DAY=${env.WEEK_DAY ?? ''}`,
    `HOUR=${env.HOUR ?? ''}`,
    `CHAT_MODEL=${quoteIfNeeded(env.CHAT_MODEL ?? '')}`,
    '',
  ].join('\n');

  fs.writeFileSync(ENV_PATH, lines, 'utf8');
  console.log(`\n✅ Wrote ${ENV_PATH}`);
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
