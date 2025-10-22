import WorkflowNode from './WorkflowNode';

export default class HTTPRequest extends WorkflowNode {
  protected static counter = 0;

  constructor(config: {
    id?: string;
    name?: string;
    version?: number;
    method: 'GET' | 'POST' | 'DELETE' | 'PUT' | 'PATCH' | 'HEAD' | 'OPTIONS';
    url: string;
    headerParameters?: { name: string; value: string }[];
    bodyParameters?: { name: string; value: string }[];
    authentication?: 'predefinedCredentialType' | 'genericCredentialType';
    credentialType?: string;
    credential_id?: string;
    connections?: string[];
    position?: [number, number];
  }) {
    super({
      id: config.id,
      name:
        config.name ??
        `HTTP Request${
          HTTPRequest.counter++ > 0 ? ' ' + HTTPRequest.counter : ''
        }`,
      type: 'n8n-nodes-base.httpRequest',
      version: config.version ?? 4.2,
      parameters: {
        method: config.method,
        url: config.url,
        authentication: config.authentication,
        sendHeaders: config.headerParameters != null,
        headerParameters: { parameters: config.headerParameters },
        sendBody: config.bodyParameters != null,
        bodyParameters: { parameters: config.bodyParameters },
        nodeCredentialType:
          config.authentication == 'predefinedCredentialType' &&
          config.credentialType,
        genericAuthType:
          config.authentication == 'genericCredentialType' &&
          config.credentialType,
      },
      credential:
        config.credentialType && config.credential_id
          ? ({
              [config.credentialType]: { id: config.credential_id },
            } as Record<string, any>)
          : undefined,
      connections: config.connections && { main: config.connections },
      position: config.position,
    });
  }
}
