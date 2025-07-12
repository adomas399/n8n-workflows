import fs from "fs";
import path from "path";

const workflow = {
  name: "Auto-generated Hello Workflow",
  nodes: [
    {
      parameters: {
        functionCode: "return [{ json: { message: 'Hello from n8n!' } }];",
      },
      id: "1",
      name: "Function",
      type: "n8n-nodes-base.function",
      typeVersion: 1,
      position: [250, 300],
    },
  ],
  connections: {},
  active: false,
};

// Ensure the output directory exists
const outputDir = path.join(__dirname, "..", "output");
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

// Write the file into output folder
const outputPath = path.join(outputDir, "workflow.json");
fs.writeFileSync(outputPath, JSON.stringify(workflow, null, 2));

console.log("✅ Workflow JSON generated at:", outputPath);
