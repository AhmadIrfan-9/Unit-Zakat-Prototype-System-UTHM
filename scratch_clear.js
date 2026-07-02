import { Pool } from "pg";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, ".env.local"), quiet: true });

const pool = new Pool({
  connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL,
});

export async function main() {
  console.log("Connecting to Database to clear audit logs...");
  try {
    await pool.query('TRUNCATE TABLE "AuditLog" CASCADE;');
    console.log("Audit logs cleared successfully.");
  } catch (error) {
    console.error("Failed to clear audit logs:", error);
  } finally {
    await pool.end();
  }
}

main().catch(console.error);
