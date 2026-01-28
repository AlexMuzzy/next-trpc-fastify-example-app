import Fastify, { type FastifyReply, type FastifyRequest } from "fastify";
import cors from "@fastify/cors";
import { fastifyTRPCPlugin } from "@trpc/server/adapters/fastify";
import { fromNodeHeaders } from "better-auth/node";
import { appRouter } from "./router.js";
import { serverConfig } from "@fsapp/config";
import { drizzle } from "drizzle-orm/postgres-js";
import { schema } from "./db/database.js";
import createAuth from "./lib/auth.js";

async function main() {
  const server = Fastify({ logger: true });
  const db = drizzle(serverConfig.POSTGRES_URL!, { schema, logger: true });
  const auth = createAuth(db);

  await server.register(cors, {
    origin: serverConfig.CLIENT_URL,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    credentials: true,
    maxAge: 86400,
  });

  // tRPC router with Better-Auth session in context
  await server.register(fastifyTRPCPlugin, {
    prefix: "/trpc",
    trpcOptions: {
      router: appRouter,
      createContext: async ({ req }: { req: FastifyRequest }) => {
        const session = await auth.api.getSession({
          headers: fromNodeHeaders(req.headers),
        });

        return {
          db,
          auth,
          user: session?.user ?? null,
          headers: fromNodeHeaders(req.headers),
        };
      },
    },
  });

  // Better-Auth handler bridged through Fastify at /api/auth/*
  server.route({
    method: ["GET", "POST"],
    url: "/api/auth/*",
    async handler(request: FastifyRequest, reply: FastifyReply) {
      try {
        const url = new URL(request.url, `http://${request.headers.host}`);

        const headers = new Headers();
        Object.entries(request.headers).forEach(([key, value]) => {
          if (value) headers.append(key, value.toString());
        });

        const req = new Request(url.toString(), {
          method: request.method,
          headers,
          body: request.body ? JSON.stringify(request.body) : undefined,
        });

        const res = await auth.handler(req);

        reply.status(res.status);
        res.headers.forEach((value, key) => reply.header(key, value));
        reply.send(res.body ? await res.text() : null);
      } catch (error) {
        server.log.error({ err: error }, "Authentication Error");
        reply.status(500).send({
          error: "Internal authentication error",
          code: "AUTH_FAILURE",
        });
      }
    },
  });

  server.get("/healthz", async () => ({ ok: true }));

  // Gracefully close DB connection on server shutdown
  server.addHook("onClose", async () => {
    await db.$client.end();
  });

  const port = Number(serverConfig.PORT);
  const host = serverConfig.HOST;
  await server.listen({ port, host });
  server.log.info(`API listening on http://${host}:${port}`);
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});
