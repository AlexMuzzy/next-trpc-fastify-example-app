import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin } from "better-auth/plugins";
import { serverConfig } from "@fsapp/config";
import type { DrizzleClient } from "../index.js";
import { user, session, account, verification } from "../db/schema.js";

const authSchema = {
  user,
  session,
  account,
  verification,
} as const;

export const createAuth = (db: DrizzleClient) =>
  betterAuth({
    database: drizzleAdapter(db, {
      provider: "pg",
      schema: authSchema,
    }),
    emailAndPassword: {
      enabled: true,
    },
    plugins: [
      admin({
        // For development, allow all authenticated users to be admins
        // In production, configure adminUserIds with specific user IDs
        adminUserIds: [],
      }),
    ],
    trustedOrigins: [
      serverConfig.CLIENT_URL,
      serverConfig.BASE_URL,
      "http://localhost:3000",
      "http://localhost:4000",
    ],
    secret: serverConfig.BETTER_AUTH_SECRET,
    baseURL: serverConfig.BASE_URL,
    advanced: {
      crossSubDomainCookies: {
        enabled: true,
        domain: serverConfig.CLIENT_DOMAIN,
      },
      cookiePrefix: "fsapp",
    },
  });
