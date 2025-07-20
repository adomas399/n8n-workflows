import WorkflowNode from "../nodes/WorkflowNode";
import { WorkflowJSON } from "../types";

export default abstract class Workflow {
  name: string;
  nodes: WorkflowNode[];
  settings: Record<string, any>;

  constructor(config: {
    name: string;
    nodes?: WorkflowNode[];
    settings?: Record<string, any>;
  }) {
    this.name = config.name;
    this.nodes = config.nodes ?? [];
    this.settings = config.settings ?? {};
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

  async push(
    updateIfMatching = false,
    N8N_URL?: string,
    N8N_API_KEY?: string
  ): Promise<Response> {
    const workflowData = this.json();

    if (updateIfMatching) {
      // Get all workflows
      const response = await fetch(
        `${N8N_URL ?? process.env.N8N_URL!}/api/v1/workflows`,
        {
          headers: {
            accept: "application/json",
            "X-N8N-API-KEY": N8N_API_KEY ?? process.env.N8N_API_KEY!,
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
        return fetch(
          `${N8N_URL ?? process.env.N8N_URL!}/api/v1/workflows/${
            matchingWorkflow.id
          }`,
          {
            method: "PUT",
            headers: {
              accept: "application/json",
              "Content-Type": "application/json",
              "X-N8N-API-KEY": N8N_API_KEY ?? process.env.N8N_API_KEY!,
            },
            body: JSON.stringify(workflowData),
          }
        );
      }
    }

    // Create new workflow
    return fetch(`${N8N_URL ?? process.env.N8N_URL!}/api/v1/workflows`, {
      method: "POST",
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
        "X-N8N-API-KEY": N8N_API_KEY ?? process.env.N8N_API_KEY!,
      },
      body: JSON.stringify(workflowData),
    });
  }
}
