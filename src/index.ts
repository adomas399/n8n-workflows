import fs from "fs";
import path from "path";
import { ScheduleTrigger } from "./nodes/ScheduleTrigger";
import { AIAgent } from "./nodes/AIAgent";
import { OpenRouterChatModel } from "./nodes/OpenRouterChatModel";
import { MCPClient } from "./nodes/MCPClient";
import { HTTPRequest } from "./nodes/HTTPRequest";

function main() {
  // Create workflow json object
  const workflow: {
    name: string;
    nodes: Record<string, any>[];
    connections: Record<string, any>;
    settings: Record<string, any>;
  } = {
    name: "Workflow test",
    nodes: [],
    connections: {},
    settings: {},
  };

  // Create Nodes
  const scheduleTrigger = new ScheduleTrigger({
    rules: [
      {
        weeksInterval: 1,
        triggerAtDay: ["Sunday"],
        triggerAtHour: 21,
      },
    ],
    connections: ["AI Agent"],
  });
  const aiAgent = new AIAgent({
    name: "AI Agent",
    prompt: "do smth",
    connections: ["Resend"],
  });
  const chatModel = new OpenRouterChatModel({
    model: "anthropic/claude-3.7-sonnet",
    credentials: { id: "nN8UkME96wTEJUsX", name: "OpenRouter my" },
    connections: ["AI Agent"],
  });
  const mcpClient = new MCPClient({
    sseEndpoint: "https://duck-fleet-sturgeon.ngrok-free.app/sse",
    includeTools: [
      "get-accounts",
      "spending-by-category",
      "balance-history",
      "monthly-summary",
    ],
    connections: ["AI Agent"],
  });
  const resendRequest = new HTTPRequest({
    name: "Resend",
    method: "POST",
    url: "https://api.resend.com/emails",
    headerParameters: [{ name: "Content-Type", value: "application/json" }],
    bodyParameters: [
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
    ],
    authentication: "genericCredentialType",
    credentialType: "httpBearerAuth",
    credentials: {
      id: "GyoOmDhEai7HY25I",
      name: "Resend my",
    },
  });

  // Push nodes to workflow json
  scheduleTrigger.pushTo(workflow);
  aiAgent.pushTo(workflow);
  chatModel.pushTo(workflow);
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

main();
