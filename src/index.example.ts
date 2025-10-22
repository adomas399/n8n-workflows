import ScheduleTrigger from './nodes/ScheduleTrigger';
import WorkflowNode from './nodes/WorkflowNode';
import Workflow from './workflows/Workflow';

// Initialize an empty Workflow
const workflow = new Workflow('Hello World');

// Initialize a Schedule Trigger Node
const scheduleTrigger = new ScheduleTrigger({
  rules: [
    {
      minutesInterval: 1, // Repeat every minute
    },
  ],
  connections: ['Script'], // Connect to Script Node
});

// Initialize a custom Script Node
const script = new WorkflowNode({
  name: 'Script',
  type: 'n8n-nodes-base.code',
  version: 2,
  parameters: {
    jsCode:
      'return {message:`Hello World ${$input.first().json.Hour}:${$input.first().json.Minute}:${$input.first().json.Second}`}',
  },
});

// Add Nodes to Workflow
workflow.addNode(scheduleTrigger);
workflow.addNode(script);

// Export Workflow as json to /output for debugging
workflow.save();

// Push Workflow to n8n via the API
workflow.push(true); // Whether to look for a matching workflow to replace (by name)
