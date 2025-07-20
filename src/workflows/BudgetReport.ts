import AIAgent from "../nodes/AIAgent";
import MCPClient from "../nodes/MCPClient";
import OpenRouterChatModel from "../nodes/OpenRouterChatModel";
import Resend from "../nodes/Resend";
import ScheduleTrigger from "../nodes/ScheduleTrigger";
import { N8NCredential, ScheduleTriggerRule } from "../types";
import Workflow from "./Workflow";

export default class BudgetReport extends Workflow {
  constructor(config: {
    name?: string;
    scheduleTriggerRules: ScheduleTriggerRule[];
    prompt: string;
    chatModel?: string;
    openRouterCredential: N8NCredential;
    sseEndpoint: string;
    sseAuthentication?: "bearerAuth" | "headerAuth";
    sseCredential?: N8NCredential;
    includeMCPTools?: string[];
    excludeMCPTools?: string[];
    mailFrom?: string;
    mailTo: string;
    mailSubject?: string;
    resendCredential: N8NCredential;
  }) {
    super({
      name: config.name ?? "Budget Report",
    });

    this.addNode(
      new ScheduleTrigger({
        rules: config.scheduleTriggerRules,
        connections: ["AI Agent"],
      })
    );
    this.addNode(
      new AIAgent({
        prompt: config.prompt,
        connections: ["Resend"],
      })
    );
    this.addNode(
      new OpenRouterChatModel({
        model: config.chatModel ?? "anthropic/claude-3.7-sonnet",
        credential: config.openRouterCredential,
        connections: ["AI Agent"],
      })
    );
    this.addNode(
      new MCPClient({
        sseEndpoint: config.sseEndpoint,
        authentication: config.sseAuthentication,
        credential: config.sseCredential,
        includeTools: config.includeMCPTools,
        excludeTools: config.excludeMCPTools,
        connections: ["AI Agent"],
      })
    );
    this.addNode(
      new Resend({
        from: config.mailFrom,
        to: config.mailTo,
        subject:
          config.mailSubject ??
          "Budget Report — {{ $('Schedule Trigger').item.json.Month }}{{ $('Schedule Trigger').item.json['Day of month'] }}",
        html: "{{ $json.output }}",
        credential: config.resendCredential,
      })
    );
  }
}
