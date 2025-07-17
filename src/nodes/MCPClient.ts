import { Node } from "./Node";

export class MCPClient extends Node {
  private static counter = 1;

  constructor(config: {
    id?: string;
    name?: string;
    version?: number;
    sseEndpoint: string;
    includeTools?: string[];
    excludeTools?: string[];
    connections: string[];
    position?: [number, number];
  }) {
    super({
      id: config.id,
      name: config.name ?? `MCP Client ${MCPClient.counter++}`,
      type: "@n8n/n8n-nodes-langchain.mcpClientTool",
      version: config.version,
      parameters: { options: {} },
      connections: config.connections && {
        ai_tool: config.connections,
      },
      position: config.position,
    });
  }
}
