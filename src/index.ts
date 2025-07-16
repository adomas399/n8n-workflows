import fs from "fs";
import path from "path";
import { ScheduleTrigger, ScheduleTriggerRule } from "./nodes/ScheduleTrigger";
import { AIAgent } from "./nodes/AIAgent";
import { OpenRouterChatModel } from "./nodes/OpenRouterChatModel";
import { MCPClient } from "./nodes/MCPClient";
import { HTTPRequest } from "./nodes/HTTPRequest";

function budgetReviewWorkflow(
  workflowName: string,
  scheduleRules: ScheduleTriggerRule[],
  prompt: string,
  sseEndpoint: string,
  includedMcpTools: string[],
  chatModel: string,
  OpenRouterCredentials: { id: string; name: string },
  ResendCredentials: { id: string; name: string },
  ResendParameters: { name: string; value: string }[]
) {
  // Create workflow json object
  const workflow: {
    name: string;
    nodes: Record<string, any>[];
    connections: Record<string, any>;
    settings: Record<string, any>;
  } = {
    name: workflowName,
    nodes: [],
    connections: {},
    settings: {},
  };

  // Create Nodes
  const scheduleTrigger = new ScheduleTrigger({
    rules: scheduleRules,
    connections: ["AI Agent"],
  });
  const aiAgent = new AIAgent({
    name: "AI Agent",
    prompt: prompt,
    connections: ["Resend"],
  });
  const openRouterChatModel = new OpenRouterChatModel({
    model: chatModel,
    credentials: OpenRouterCredentials,
    connections: ["AI Agent"],
  });
  const mcpClient = new MCPClient({
    sseEndpoint: sseEndpoint,
    connections: ["AI Agent"],
  });
  const resendRequest = new HTTPRequest({
    name: "Resend",
    method: "POST",
    url: "https://api.resend.com/emails",
    headerParameters: [{ name: "Content-Type", value: "application/json" }],
    bodyParameters: ResendParameters,
    authentication: "genericCredentialType",
    credentialType: "httpBearerAuth",
    credentials: ResendCredentials,
  });

  // Push nodes to workflow json
  scheduleTrigger.pushTo(workflow);
  aiAgent.pushTo(workflow);
  openRouterChatModel.pushTo(workflow);
  mcpClient.pushTo(workflow);
  resendRequest.pushTo(workflow);

  // Ensure the output directory exists
  const outputDir = path.join(__dirname, "..", "output");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  }

  // Write the file into output folder
  const outputPath = path.join(outputDir, "workflow.json");
  fs.writeFileSync(outputPath, JSON.stringify(workflow, null, 2));

  console.log("✅ Workflow JSON generated at:", outputPath);
}

const workflowName = "Workflow test";
const prompt = fs.readFileSync(
  path.join(__dirname, "..", "input", "budgetReviewPrompt.txt"),
  "utf-8"
);
const scheduleRules = [
  {
    weeksInterval: 1,
    triggerAtDay: ["Sunday"],
    triggerAtHour: 21,
  },
];
const sseEndpoint = "https://duck-fleet-sturgeon.ngrok-free.app/sse";
const includedMcpTools = [
  "get-accounts",
  "spending-by-category",
  "balance-history",
  "monthly-summary",
];
const chatModel = "anthropic/claude-3.7-sonnet";
const OpenRouterCredentials = { id: "nN8UkME96wTEJUsX", name: "OpenRouter my" };
const ResendCredentials = {
  id: "GyoOmDhEai7HY25I",
  name: "Resend my",
};
const ResendParameters = [
  {
    name: "from",
    value: "onboarding@resend.dev",
  },
  {
    name: "to",
    value: "adomas.reginis@gmail.com",
  },
  {
    name: "subject",
    value: "Weekly Budget Report",
  },
  {
    name: "html",
    value: "={{ $json.output }}",
  },
];

budgetReviewWorkflow(
  workflowName,
  scheduleRules,
  prompt,
  sseEndpoint,
  includedMcpTools,
  chatModel,
  OpenRouterCredentials,
  ResendCredentials,
  ResendParameters
);
