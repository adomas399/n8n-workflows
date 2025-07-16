import { Node } from "./Node";

export class OpenRouterChatModel extends Node {
  private static counter = 1;

  constructor(config: {
    id?: string;
    name?: string;
    version?: number;
    model: string;
    credentials: { id: string; name: string };
    connections: string[];
  }) {
    super({
      id: config.id,
      name:
        config.name ?? `OpenRouter Chat Model ${OpenRouterChatModel.counter++}`,
      type: "@n8n/n8n-nodes-langchain.lmChatOpenRouter",
      version: config.version,
      parameters: { model: config.model },
      credentials: { openRouterApi: config.credentials },
      connections: config.connections && {
        ai_languageModel: config.connections,
      },
    });
  }
}
