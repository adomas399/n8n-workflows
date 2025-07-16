import { Node } from "./Node";

export class HTTPRequest extends Node {
  private static counter = 1;

  constructor(config: {
    id?: string;
    name?: string;
    version?: number;
    method: "GET" | "POST";
    url: string;
    headerParameters?: { name: string; value: string }[];
    bodyParameters?: { name: string; value: string }[];
    authentication?: "predefinedCredentialType" | "genericCredentialType";
    credentialType?: string;
    credentials?: { id: string; name: string };
    connections?: string[];
    position?: [number, number];
  }) {
    super({
      id: config.id,
      name: config.name ?? `HTTP Request ${HTTPRequest.counter++}`,
      type: "n8n-nodes-base.httpRequest",
      version: config.version,
      parameters: {
        method: config.method,
        url: config.url,
        authentication: config.authentication,
        sendHeaders: config.headerParameters != null,
        headerParameters: { parameters: config.headerParameters },
        sendBody: config.bodyParameters != null,
        bodyParameters: { parameters: config.bodyParameters },
        nodeCredentialType:
          config.authentication == "predefinedCredentialType" &&
          config.credentialType,
        genericAuthType:
          config.authentication == "genericCredentialType" &&
          config.credentialType,
      },
      credentials:
        config.credentialType && config.credentials
          ? ({
              [config.credentialType]: config.credentials,
            } as Record<string, { id: string; name: string }>)
          : undefined,
      connections: config.connections && { main: config.connections },
      position: config.position,
    });
  }
}
