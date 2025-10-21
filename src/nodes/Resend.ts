import { N8NCredential } from '../types';
import HTTPRequest from './HTTPRequest';

export default class Resend extends HTTPRequest {
  protected static counter = 0;

  constructor(config: {
    id?: string;
    name?: string;
    from?: string;
    to: string;
    subject: string;
    text?: string;
    html?: string;
    credential: N8NCredential;
    connections?: string[];
    position?: [number, number];
  }) {
    super({
      id: config.id,
      name:
        config.name ??
        `Resend${Resend.counter++ > 0 ? ' ' + Resend.counter : ''}`,
      version: 4.2,
      method: 'POST',
      url: 'https://api.resend.com/emails',
      headerParameters: [{ name: 'Content-Type', value: 'application/json' }],
      bodyParameters: [
        {
          name: 'from',
          value: `=${config.from ?? 'onboarding@resend.dev'}`,
        },
        {
          name: 'to',
          value: `=${config.to}`,
        },
        {
          name: 'subject',
          value: `=${config.subject}`,
        },
        {
          name: 'text',
          value: `=${config.text ?? ''}`,
        },
        {
          name: 'html',
          value: `=${config.html ?? ''}`,
        },
      ],
      authentication: 'genericCredentialType',
      credentialType: 'httpBearerAuth',
      credential: config.credential,
    });
  }
}
