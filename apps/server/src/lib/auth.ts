import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { serverConfig } from "@fsapp/config";
import { DrizzleClient, authSchema } from "../db/database.js";

export const createAuth = (db: DrizzleClient) =>
  betterAuth({
    database: drizzleAdapter(db, {
      provider: "pg",
      schema: authSchema,
    }),
    emailAndPassword: {
      enabled: true,
    },
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

export default createAuth;
