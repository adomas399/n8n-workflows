import WorkflowNode from "./WorkflowNode";

export default class AIAgent extends WorkflowNode {
  protected static counter = 0;

  constructor(config: {
    id?: string;
    name?: string;
    version?: number;
    prompt: string;
    connections?: string[];
    position?: [number, number];
  }) {
    super({
      id: config.id,
      name:
        config.name ??
        `AI Agent${AIAgent.counter++ > 0 ? " " + AIAgent.counter : ""}`,
      type: "@n8n/n8n-nodes-langchain.agent",
      version: config.version ?? 2,
      parameters: { promptType: "define", text: `=${config.prompt}` },
      connections: config.connections && { main: config.connections },
      position: config.position,
    });
  }
}
