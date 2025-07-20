# N8N Workflows Generator

A lightweight TypeScript-based workflow engine for building and deploying custom automation pipelines to n8n.

The engine enables you to:

- Define workflows in code using reusable workflow nodes.
- Follow predeterimined workflow templates.
- Automate the generation of complex n8n workflows.
- Push workflows to your n8n instance using the API.

## Features

### Workflow Nodes

- **Schedule Trigger** — Schedule your workflows with custom Schedule Trigger Rules.

- **AI Agent** — Write a custom prompt and let AI do it's thing.

- **OpenRouter Chat Model** — Connect any AI chat model via OpenRouter.

- **MCP Client** — Connect any MCP tool via an SSE endpoint.

- **HTTP Request** — Make a custom HTTP request.

- **Resend** — A custom HTTP request to send an email.

  > You can also add a fully custom node, extend nodes, and even create your own modular nodes.

### Workflows

- **Budget Report** — A workflow template for creating a scheduled budget report using [actual-mcp](https://github.com/adomas399/actual-mcp), that is then sent via email.

  > You can also use the base workflow template to add any desired nodes, for a fully custom workflow. Furthermore, you can create your own reusable workflow templates.

#### Workflow class methods

- **AddNode()** — Add any workflow node to the workflow
- **json()** — Get the workflow exported as json
- **push()** — Push the workflow to n8n via the API.
  > 💡 Use push(true) to update matching workflow (by name) instead of creating new ones each time.
