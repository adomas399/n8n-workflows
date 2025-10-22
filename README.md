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
docker build -t local-image . --load
```

2. Run the image:

```bash
docker run local-image
```

### Using GitHub Actions

Run Action 'Push N8N Workflow' on Github

## Example

Copy the example code to index.ts:

```bash
cp src/index.example.ts src/index.ts
```

### Hello World Workflow

```ts
import ScheduleTrigger from './nodes/ScheduleTrigger';
import WorkflowNode from './nodes/WorkflowNode';
import { ScheduleTriggerRule } from './types';
import { saveFile } from './utils';
import Workflow from './workflows/Workflow';

// Initialize an empty Workflow
const workflow = new Workflow('Hello World');

// Initialize a Schedule Trigger Node
const scheduleTrigger = new ScheduleTrigger({
  rules: [
    {
      minutesInterval: 1, // Repeat every minute
    },
  ],
  connections: ['Script'], // Connect to Script Node
});

// Initialize a custom Script Node
const script = new WorkflowNode({
  name: 'Script',
  type: 'n8n-nodes-base.code',
  version: 2,
  parameters: {
    jsCode:
      'return {message:`Hello World ${$input.first().json.Hour}:${$input.first().json.Minute}:${$input.first().json.Second}`}',
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

## Project structure

- `index.ts` - Engine usage
- `types.ts` - Type definitions
- `utils.ts` - Helper functions

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
