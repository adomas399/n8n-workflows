import { N8NCredential, ScheduleTriggerRule } from './types';
import { loadFile } from './utils';
import BudgetReport from './workflows/BudgetReport';

function budgetReview() {
  // Load the prompt variable from /input/budgetReviewPrompt.txt
  const prompt = loadFile('budgetReviewPrompt.txt');

  // Define the Schedule Trigger Rules
  const scheduleTriggerRules: ScheduleTriggerRule[] = [
    {
      weeksInterval: 1,
      triggerAtDay: ['Sunday'], // or [0]
      triggerAtHour: 21,
    },
  ];

  // Initialize all necessary Credentials (these must be available on your n8n)
  const modelProviderCredential: N8NCredential = {
    name: '123',
    id: 'abc',
  };
  const resendCredential: N8NCredential = {
    name: '456',
    id: 'def',
  };
  const MCPCredential: N8NCredential = {
    name: '789',
    id: 'ghi',
  };

  // Configure which MCP tools to include
  const includeMCPTools = [
    'get-accounts',
    'spending-by-category',
    'balance-history',
    'monthly-summary',
  ];

  // Initialize a Budget Report Workflow template
  const budgetReport = new BudgetReport({
    name: 'Weekly Budget Report',
    scheduleTriggerRules,
    prompt,
    chatModel: 'anthropic/claude-3.7-sonnet',
    modelProvider: 'OpenRouter',
    modelProviderCredential,
    MCPEndpoint: 'https://your-actual-mcp-url/sse',
    MCPAuthentication: 'bearerAuth',
    MCPCredential,
    includeMCPTools,
    mailFrom: 'send@email.example',
    mailTo: 'receive@email.example',
    resendCredential,
  });

  // Export Workflow as json to /output for debugging
  budgetReport.save();

  // Push Workflow to n8n via the API
  budgetReport.push(true);
}

budgetReview();
