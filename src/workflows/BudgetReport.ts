import AIAgent from '../nodes/AIAgent';
import ChatModel from '../nodes/ChatModel';
import MCPClient from '../nodes/MCPClient';
import Resend from '../nodes/Resend';
import ScheduleTrigger from '../nodes/ScheduleTrigger';
import { LLMProvider, ScheduleTriggerRule } from '../types';
import Workflow from './Workflow';

export default class BudgetReport extends Workflow {
  constructor(config: {
    name?: string;
    scheduleTriggerRules: ScheduleTriggerRule[];
    prompt: string;
    chatModel: string;
    modelProvider: LLMProvider;
    modelProviderCredentialID: string;
    chatModelOptions?: Record<string, any>;
    MCPEndpoint: string;
    MCPAuthentication?: 'bearerAuth' | 'headerAuth';
    MCPCredentialID?: string;
    includeMCPTools?: string[];
    excludeMCPTools?: string[];
    mailFrom?: string;
    mailTo: string;
    mailSubject?: string;
    resendCredentialID: string;
  }) {
    super(config.name ?? 'Budget Report');

    this.addNode(
      new ScheduleTrigger({
        rules: config.scheduleTriggerRules,
        connections: ['AI Agent'],
      })
    );
    this.addNode(
      new AIAgent({
        prompt: config.prompt,
        connections: ['Resend'],
      })
    );
    this.addNode(
      new ChatModel({
        model: config.chatModel,
        provider: config.modelProvider,
        credential_id: config.modelProviderCredentialID,
        options: config.chatModelOptions,
        connections: ['AI Agent'],
      })
    );
    this.addNode(
      new MCPClient({
        sseEndpoint: config.MCPEndpoint,
        authentication: config.MCPAuthentication,
        credential_id: config.MCPCredentialID,
        includeTools: config.includeMCPTools,
        excludeTools: config.excludeMCPTools,
        connections: ['AI Agent'],
      })
    );
    this.addNode(
      new Resend({
        from: config.mailFrom,
        to: config.mailTo,
        subject:
          config.mailSubject ??
          "Budget Report — {{ $('Schedule Trigger').item.json.Month }}{{ $('Schedule Trigger').item.json['Day of month'] }}",
        html: '{{ $json.output }}',
        credential_id: config.resendCredentialID,
      })
    );
  }
}
