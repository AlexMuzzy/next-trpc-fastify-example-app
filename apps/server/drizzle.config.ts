import { defineConfig } from "drizzle-kit";
import { serverConfig } from "@fsapp/config";

export default defineConfig({
  // Point directly to individual schema files to avoid ES module resolution issues
  schema: ["./src/db/auth-schema.ts", "./src/db/todo-schema.ts"],
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: serverConfig.POSTGRES_URL,
  },
});
