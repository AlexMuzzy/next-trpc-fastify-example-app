import { initTRPC } from "@trpc/server";
import { z } from "zod";
import superjson from "superjson";
import {
  listTodos,
  createTodo,
  updateTodo,
  deleteTodo,
} from "./services/todos.js";
import { getUserStats } from "./services/auth-stats.js";
import type { DrizzleClient } from "./index.js";
import type { createAuth } from "./lib/auth.js";

export type RequestContext = {
  db: DrizzleClient;
  auth: ReturnType<typeof createAuth>;
  headers?: globalThis.Headers;
};

const t = initTRPC.context<RequestContext>().create({
  transformer: superjson,
});
export const router = t.router;
export const publicProcedure = t.procedure;

export const appRouter = router({
  healthz: publicProcedure.query(() => "ok"),
  echo: publicProcedure
    .input(z.object({ message: z.string() }))
    .mutation(({ input }) => ({ message: input.message })),
  todos: router({
    list: publicProcedure.query(async ({ ctx }) => listTodos(ctx.db)),
    create: publicProcedure
      .input(z.object({ title: z.string().min(1).max(200) }))
      .mutation(async ({ input, ctx }) => createTodo(ctx.db, input.title)),
    update: publicProcedure
      .input(
        z.object({
          id: z.number(),
          title: z.string().min(1).max(200),
          completed: z.boolean(),
        }),
      )
      .mutation(async ({ input, ctx }) =>
        updateTodo(ctx.db, input.id, input.title, input.completed),
      ),
    delete: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => deleteTodo(ctx.db, input.id)),
  }),
  auth: router({
    stats: publicProcedure.query(async ({ ctx }) =>
      getUserStats(ctx.auth, ctx.headers),
    ),
  }),
});

export type AppRouter = typeof appRouter;
