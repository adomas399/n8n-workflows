# N8N Workflows Generator

A lightweight TypeScript-based workflow engine for building and deploying custom automation pipelines to n8n.

The engine enables you to:

- Define workflows in code using reusable workflow nodes.
- Follow predeterimined workflow templates.
- Automate the generation of complex n8n workflows.
- Push workflows to your n8n instance using the API.

## Features

### Prebuilt Workflow Nodes

- **Schedule Trigger** — Schedule your workflows with custom Schedule Trigger Rules.

- **AI Agent** — Write a custom prompt and let AI do it's thing.

- **OpenRouter Chat Model** — Connect any AI chat model via OpenRouter.

- **MCP Client** — Connect any MCP tool via an SSE endpoint.

- **HTTP Request** — Make a custom HTTP request.

- **Resend** — A custom HTTP request to send an email.

### Prebuilt Workflows

- **Budget Report** — A workflow template for creating a scheduled budget report using [actual-mcp](https://github.com/adomas399/actual-mcp), that is then sent via email.

## Installation

### Prerequisities

- [Node.js](https://nodejs.org/en/download)
- [Docker Desktop](https://www.docker.com/products/docker-desktop) (optional)

### Setup

1. Clone the repository:

```bash
git clone https://github.com/adomas399/n8n-workflows.git
cd n8n-workflows
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file

```bash
cp .env.example .env
```

Update it with your n8n instance details:

```bash
N8N_URL=https://your-n8n-instance.com
N8N_API_KEY=your-n8n-api-key
```

## Usage

### Using Node.js

Run the configurable index.ts file:

```bash
npm run start
```

or

```bash
npm run dev
```

### Using Docker

1. Build the image:

```bash
docker build -t local-image .
```

2. Run the image:

```bash
docker build -t local-image .
```

### Using GitHub Actions

Run Action 'Push N8N Workflow' on Github

## Examples

Copy the example code to index.ts:

```bash
cp src/index.example.ts src/index.ts
```

### Hello World Workflow

```ts
import ScheduleTrigger from "./nodes/ScheduleTrigger";
import WorkflowNode from "./nodes/WorkflowNode";
import { ScheduleTriggerRule } from "./types";
import { saveFile } from "./utils";
import Workflow from "./workflows/Workflow";

// Initialize an empty Workflow
const workflow = new Workflow("Hello World");

// Initialize a Schedule Trigger Node
const scheduleTrigger = new ScheduleTrigger({
  rules: [
    {
      minutesInterval: 1, // Repeat every minute
    },
  ],
  connections: ["Script"], // Connect to Script Node
});

// Initialize a custom Script Node
const script = new WorkflowNode({
  name: "Script",
  type: "n8n-nodes-base.code",
  version: 2,
  parameters: {
    jsCode:
      "return {message:`Hello World ${$input.first().json.Hour}:${$input.first().json.Minute}:${$input.first().json.Second}`}",
  },
});

// Add Nodes to Workflow
workflow.addNode(scheduleTrigger);
workflow.addNode(script);

// Export Workflow as json to /output for debugging
workflow.save();

// Push Workflow to n8n via the API
workflow.push(true); // Whether to look for a matching workflow to replace (by name)
```

### Budget Review Template

```ts
import ScheduleTrigger from "./nodes/ScheduleTrigger";
import { N8NCredential, ScheduleTriggerRule } from "./types";
import { loadFile, saveFile } from "./utils";
import BudgetReport from "./workflows/BudgetReport";

// Load the prompt variable from /input/budgetReviewPrompt.txt
const prompt = loadFile("budgetReviewPrompt.txt");

// Define the Schedule Trigger Rules
const scheduleTriggerRules: ScheduleTriggerRule[] = [
  {
    weeksInterval: 1,
    triggerAtDay: ["Sunday"], // or [0]
    triggerAtHour: 21,
  },
];

// Initialize all necessary Credentials (these must be available on your n8n)
const modelProviderCredential: N8NCredential = {
  name: "123",
  id: "abc",
};
const resendCredential: N8NCredential = {
  name: "456",
  id: "def",
};
const sseCredential: N8NCredential = {
  name: "789",
  id: "ghi",
};

// Configure which MCP tools to include
const includeMCPTools = [
  "get-accounts",
  "spending-by-category",
  "balance-history",
  "monthly-summary",
];

// Initialize a Budget Report Workflow template
const budgetReport = new BudgetReport({
  name: "Weekly Budget Report",
  scheduleTriggerRules,
  prompt,
  chatModel: "anthropic/claude-3.7-sonnet",
  modelProvider: "OpenRouter",
  modelProviderCredential,
  sseEndpoint: "https://your-actual-mcp-url/sse",
  sseAuthentication: "bearerAuth",
  sseCredential,
  includeMCPTools,
  mailFrom: "send@email.example",
  mailTo: "receive@email.example",
  resendCredential,
});

// Export Workflow as json to /output for debugging
budgetReport.save();

// Push Workflow to n8n via the API
budgetReport.push(true);
```

## Project structure

- `index.ts` - Engine usage
- `types.ts` - Type definitions
- `utils.ts` - Helper functions

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
