import { Node } from "./Node";

export class MCPClient extends Node {
  private static counter = 1;

  constructor(config: {
    id?: string;
    name?: string;
    version?: number;
    sseEndpoint: string;
    includeTools?: string[] | string;
    excludeTools?: string[] | string;
    connections: string[];
  }) {
    super({
      id: config.id,
      name: config.name ?? `MCP Client ${MCPClient.counter++}`,
      type: "@n8n/n8n-nodes-langchain.mcpClientTool",
      version: config.version,
      parameters: {
        sseEndpoint: config.sseEndpoint,
        include:
          (config.includeTools && "selected") ||
          (config.excludeTools && "except"),
        includeTools: config.includeTools,
        excludeTools: config.excludeTools,
      },
      connections: config.connections && {
        ai_languageModel: config.connections,
      },
    });
  }
}
