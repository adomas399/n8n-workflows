import { N8NCredential } from "../types";
import WorkflowNode from "./WorkflowNode";

export default class OpenRouterChatModel extends WorkflowNode {
  protected static counter = 0;

  constructor(config: {
    id?: string;
    name?: string;
    version?: number;
    model: string;
    credential: N8NCredential;
    connections: string[];
    position?: [number, number];
  }) {
    super({
      id: config.id,
      name:
        config.name ??
        `OpenRouter Chat Model${
          OpenRouterChatModel.counter++ > 0
            ? " " + OpenRouterChatModel.counter
            : ""
        }`,
      type: "@n8n/n8n-nodes-langchain.lmChatOpenRouter",
      version: config.version ?? 1,
      parameters: { model: `=${config.model}` },
      credentials: { openRouterApi: config.credential },
      connections: config.connections && {
        ai_languageModel: config.connections,
      },
      position: config.position,
    });
  }
}
