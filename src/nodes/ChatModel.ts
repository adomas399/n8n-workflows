import { N8NCredential } from "../types";
import WorkflowNode from "./WorkflowNode";

export default class ChatModel extends WorkflowNode {
  protected static counter = 0;

  constructor(config: {
    id?: string;
    name?: string;
    version?: number;
    provider:
      | "OpenRouter"
      | "OpenAi"
      | "Anthropic"
      | "GoogleGemini"
      | "MistralCloud"
      | "DeepSeek"
      | "Groq"
      | "XAiGroq"
      | "AzureOpenAi"
      | "Ollama"
      | "AwsBedrock";
    model: string;
    credential: N8NCredential;
    connections: string[];
    options?: Record<string, any>;
    position?: [number, number];
  }) {
    let credentialKey;
    switch (config.provider) {
      case "GoogleGemini":
        credentialKey = "googlePalmApi";
        break;
      case "AwsBedrock":
        credentialKey = "aws";
        break;
      case "XAiGroq":
        credentialKey = "xAiApi";
        break;
      default:
        credentialKey =
          config.provider.charAt(0).toLowerCase() +
          config.provider.slice(1) +
          "Api";
    }

    super({
      id: config.id,
      name:
        config.name ??
        `Chat Model${ChatModel.counter++ > 0 ? " " + ChatModel.counter : ""}`,
      type: `@n8n/n8n-nodes-langchain.lmChat${config.provider}`,
      version: config.version ?? 1,
      parameters: { model: `=${config.model}`, options: config.options },
      credential: { [credentialKey]: config.credential },
      connections: config.connections && {
        ai_languageModel: config.connections,
      },
      position: config.position,
    });
  }
}
