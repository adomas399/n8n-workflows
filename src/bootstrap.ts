import dotenv from "dotenv";

dotenv.config({ path: ".env", quiet: true });

if (!process.env.N8N_URL || !process.env.N8N_API_KEY) {
  console.error("env variable(s) missing");
  process.exit(1);
}
