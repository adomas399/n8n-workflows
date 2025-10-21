import { v4 as uuidv4 } from 'uuid';
import { N8NCredential } from '../types';

export default class WorkflowNode {
  id: string;
  name: string;
  type: string;
  version: number;
  parameters: Record<string, any>;
  credential?: Record<string, N8NCredential>;
  connections?: Record<string, any>;
  position?: [number, number];

  protected static counter = 0;

  constructor(config: {
    id?: string;
    name?: string;
    type: string;
    version: number;
    parameters?: Record<string, any>;
    credential?: Record<string, N8NCredential>;
    connections?: Record<string, string[]>;
    position?: [number, number];
  }) {
    this.id = config.id ?? uuidv4();
    this.name =
      config.name ??
      `AI Agent${WorkflowNode.counter++ > 0 ? ' ' + WorkflowNode.counter : ''}`;
    this.type = config.type;
    this.version = config.version;
    this.parameters = config.parameters ?? {};
    this.credential = config.credential;
    this.connections = config.connections;
    this.position = config.position ?? [0, 0];

    if (!this.parameters.options) {
      this.parameters.options = {};
    }
  }

  json(): Record<string, any> {
    return {
      id: this.id,
      name: this.name,
      type: this.type,
      parameters: this.parameters,
      position: this.position,
      ...(this.version && { typeVersion: this.version }),
      ...(this.credential && { credentials: this.credential }),
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
}
