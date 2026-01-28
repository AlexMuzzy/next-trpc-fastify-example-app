import { z } from "zod";
import { config } from "dotenv";
import { join } from "path";

// Load environment variables based on NODE_ENV
const nodeEnv = process.env.NODE_ENV || "development";
const envFile = `.env.${nodeEnv}`;

// Load the environment file from the project root
config({ path: join(process.cwd(), "../../", envFile) });

const serverEnvSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  PORT: z.string().default("4000"),
  HOST: z.string().default("0.0.0.0"),

  /**
   * Public API URL used by the web client and Better-Auth.
   * In production, this should be the externally reachable API origin,
   * e.g. https://api.example.com
   */
  BASE_URL: z.string().url().default("http://localhost:4000"),

  /**
   * Public web app URL used for CORS and trusted origins.
   * In production, this should be the app origin,
   * e.g. https://app.example.com
   */
  CLIENT_URL: z.string().url().default("http://localhost:3000"),

  /**
   * Parent domain used for cross-subdomain cookies.
   * In production, this should match your apex domain,
   * e.g. example.com
   */
  CLIENT_DOMAIN: z.string().default("localhost"),

  /**
   * Better-Auth secret used to sign and verify tokens.
   * Override this with a long, random value in each environment.
   */
  BETTER_AUTH_SECRET: z
    .string()
    .default("change-me-in-production-better-auth-secret"),

  NEXT_PUBLIC_API_URL: z.string().url().optional(),
  POSTGRES_URL: z
    .string()
    .url()
    .default("postgresql://postgres:postgres@localhost:5432/fullstack_app"),
  POSTGRES_HOST: z.string().default("localhost"),
  POSTGRES_PORT: z.string().default("5432"),
  POSTGRES_USER: z.string().default("postgres"),
  POSTGRES_PASSWORD: z.string().default("postgres"),
  POSTGRES_DB: z.string().default("fullstack_app"),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

export const getServerEnv = (env: NodeJS.ProcessEnv = process.env) =>
  serverEnvSchema.parse(env);

// Export a pre-parsed config object for easy access
export const serverConfig = getServerEnv();
