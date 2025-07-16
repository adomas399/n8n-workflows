import { v4 as uuidv4 } from "uuid";

export abstract class Node {
  id: string;
  name: string;
  type: string;
  version?: number;
  parameters: Record<string, any>;
  credentials?: Record<string, { id: string; name: string }>;
  connections?: Record<string, any>;
  position?: [number, number];

  constructor(config: {
    id?: string;
    name: string;
    type: string;
    version?: number;
    parameters?: Record<string, any>;
    credentials?: Record<string, { id: string; name: string }>;
    connections?: Record<string, string[]>;
    position?: [number, number];
  }) {
    this.id = config.id ?? uuidv4();
    this.name = config.name;
    this.type = config.type;
    this.version = config.version;
    this.parameters = config.parameters ?? {};
    this.credentials = config.credentials;
    this.connections = config.connections;
    this.position = config.position ?? [0, 0];
  }

  json(): Record<string, any> {
    return {
      id: this.id,
      name: this.name,
      type: this.type,
      parameters: this.parameters,
      position: this.position,
      ...(this.version && { typeVersion: this.version }),
      ...(this.credentials && { credentials: this.credentials }),
    };
  }

  connectionJson(): Record<string, any> {
    if (!this.connections) return {};

    return Object.fromEntries(
      Object.entries(this.connections).map(([type, nodes]) => [
        type,
        [
          nodes.map((node: string) => ({
            node,
            type,
            index: 0,
          })),
        ],
      ])
    );
  }

  pushTo(workflow: {
    nodes: Record<string, any>[];
    connections: Record<string, any>;
  }) {
    workflow.nodes.push(this.json());
    workflow.connections[this.name] = this.connectionJson();
  }
}
