import WorkflowNode from '../nodes/WorkflowNode';
import { WorkflowJSON } from '../types';
import { saveFile } from '../utils';

export default class Workflow {
  name: string;
  nodes: WorkflowNode[];
  settings: Record<string, any>;

  constructor(
    name: string,
    nodes: WorkflowNode[] = [],
    settings: Record<string, any> = {}
  ) {
    this.name = name;
    this.nodes = nodes;
    this.settings = settings;
  }

  addNode(node: WorkflowNode) {
    this.nodes.push(node);
  }

  json(): WorkflowJSON {
    const output: WorkflowJSON = {
      name: this.name,
      nodes: [],
      connections: {},
      settings: this.settings,
    };

    for (const node of this.nodes) {
      output.nodes.push(node.json());
      output.connections[node.name] = node.connectionJson();
    }

    return output;
  }

  save(filename?: string) {
    const outputPath = saveFile(this.json(), filename ?? this.name + '.json');
    console.log(`✅ Saved workflow "${this.name}" to ${outputPath}`);
  }

  async push(
    updateIfMatching = false,
    N8N_URL?: string,
    N8N_API_KEY?: string
  ): Promise<boolean> {
    try {
      const workflowData = this.json();

      if (updateIfMatching) {
        // Get all workflows
        const response = await fetch(
          `${N8N_URL ?? process.env.N8N_URL!}/api/v1/workflows`,
          {
            headers: {
              accept: 'application/json',
              'X-N8N-API-KEY': N8N_API_KEY ?? process.env.N8N_API_KEY!,
            },
          }
        );
        const existingWorkflows = await response.json();

        // Find matching workflow by name
        const matchingWorkflow = existingWorkflows.data.find(
          (workflow: any) => !workflow.isArchived && workflow.name == this.name
        );

        if (matchingWorkflow) {
          // Update existing workflow
          await fetch(
            `${N8N_URL ?? process.env.N8N_URL!}/api/v1/workflows/${
              matchingWorkflow.id
            }`,
            {
              method: 'PUT',
              headers: {
                accept: 'application/json',
                'Content-Type': 'application/json',
                'X-N8N-API-KEY': N8N_API_KEY ?? process.env.N8N_API_KEY!,
              },
              body: JSON.stringify(workflowData),
            }
          );
          console.log(`✅ Updated workflow ${this.name} on n8n`);
          return true;
        }
      }

      // Create new workflow
      await fetch(`${N8N_URL ?? process.env.N8N_URL!}/api/v1/workflows`, {
        method: 'POST',
        headers: {
          accept: 'application/json',
          'Content-Type': 'application/json',
          'X-N8N-API-KEY': N8N_API_KEY ?? process.env.N8N_API_KEY!,
        },
        body: JSON.stringify(workflowData),
      });
      console.log(`✅ Pushed workflow ${this.name} to n8n`);
      return true;
    } catch (error) {
      console.error(`❌ Error pushing workflow "${this.name}":`, error);
      return false;
    }
  }
}
