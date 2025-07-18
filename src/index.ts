import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { ScheduleTriggerRule } from "./nodes/ScheduleTrigger";
import { N8NCredential } from "./types";
import BudgetReport from "./workflows/BudgetReport";

dotenv.config({ path: ".env" });
const N8N_URL = process.env.N8N_URL;
const N8N_API_KEY = process.env.N8N_API_KEY;

if (!N8N_URL || !N8N_API_KEY) {
  console.error(".env variables not loaded properly");
}

function main() {
  const prompt = fs.readFileSync(
    path.join(__dirname, "..", "input", "budgetReviewPrompt.txt"),
    "utf-8"
  );

  const scheduleTriggerRules: ScheduleTriggerRule[] = [
    {
      weeksInterval: 1,
      triggerAtDay: ["Sunday"],
      triggerAtHour: 21,
    },
  ];

  const openRouterCredential: N8NCredential = {
    name: "OpenRouter my",
    id: "nN8UkME96wTEJUsX",
  };

  const resendCredential: N8NCredential = {
    name: "Resend my",
    id: "GyoOmDhEai7HY25I",
  };

  const sseCredential: N8NCredential = {
    name: "MCP dev",
    id: "YN6s2NRMOeFiQSs5",
  };

  const includeMCPTools = [
    "get-accounts",
    "spending-by-category",
    "balance-history",
    "monthly-summary",
  ];

  const budgetReport = new BudgetReport({
    name: "Weekly Budget Report",
    scheduleTriggerRules,
    prompt,
    openRouterCredential,
    sseEndpoint: "https://duck-fleet-sturgeon.ngrok-free.app/sse",
    sseAuthentication: "bearerAuth",
    sseCredential,
    includeMCPTools,
    mailTo: "adomas.reginis@gmail.com",
    resendCredential,
  });

  budgetReport.push(N8N_URL!, N8N_API_KEY!, true);
}

main();
