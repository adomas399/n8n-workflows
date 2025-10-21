import { N8NCredential } from '../types';
import WorkflowNode from './WorkflowNode';

export default class MCPClient extends WorkflowNode {
  protected static counter = 0;

  constructor(config: {
    id?: string;
    name?: string;
    version?: number;
    sseEndpoint: string;
    includeTools?: string[];
    excludeTools?: string[];
    authentication?: 'bearerAuth' | 'headerAuth';
    credential?: N8NCredential;
    connections: string[];
    position?: [number, number];
  }) {
    super({
      id: config.id,
      name:
        config.name ??
        `MCP Client${MCPClient.counter++ > 0 ? ' ' + MCPClient.counter : ''}`,
      type: '@n8n/n8n-nodes-langchain.mcpClientTool',
      version: config.version ?? 1,
      parameters: {
        sseEndpoint: config.sseEndpoint,
        include:
          (config.includeTools && 'selected') ||
          (config.excludeTools && 'except'),
        includeTools: config.includeTools,
        excludeTools: config.excludeTools,
        authentication: config.authentication,
      },
      credential:
        config.credential &&
        (config.authentication == 'headerAuth'
          ? ({
              httpHeaderAuth: config.credential,
            } as Record<string, N8NCredential>)
          : ({
              httpBearerAuth: config.credential,
            } as Record<string, N8NCredential>)),
      connections: config.connections && {
        ai_tool: config.connections,
      },
      position: config.position,
    });
  }
}
