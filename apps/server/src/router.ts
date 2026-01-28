import { initTRPC, TRPCError } from "@trpc/server";
import { z } from "zod";
import superjson from "superjson";
import {
  listTodos,
  createTodo,
  updateTodo,
  deleteTodo,
} from "./services/todos.js";
import type createAuth from "./lib/auth.js";
import { DrizzleClient } from "@fsapp/server/db/database.js";

export type RequestContext = {
  db: DrizzleClient;
  auth: ReturnType<typeof createAuth>;
  user: { id: string; email: string; name: string | null } | null;
  headers?: globalThis.Headers;
};

const t = initTRPC.context<RequestContext>().create({
  transformer: superjson,
});
export const router = t.router;
export const publicProcedure = t.procedure;

// Protected procedure that requires authentication
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "You must be logged in to access this resource",
    });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user, // TypeScript now knows user is non-null
    },
  });
});

export const appRouter = router({
  healthz: publicProcedure.query(() => "ok"),
  echo: publicProcedure
    .input(z.object({ message: z.string() }))
    .mutation(({ input }) => ({ message: input.message })),
  todos: router({
    list: protectedProcedure.query(async ({ ctx }) => listTodos(ctx.db)),
    create: protectedProcedure
      .input(z.object({ title: z.string().min(1).max(200) }))
      .mutation(async ({ input, ctx }) => createTodo(ctx.db, input.title)),
    update: protectedProcedure
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
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => deleteTodo(ctx.db, input.id)),
  }),
  dashboard: router({
    stats: publicProcedure.query(async ({ ctx }) => {
      const todos = await listTodos(ctx.db);
      const completedCount = todos.filter((t) => t.completed).length;
      const pendingCount = todos.length - completedCount;
      const completionRate =
        todos.length > 0 ? (completedCount / todos.length) * 100 : 0;

      return {
        totalTodos: todos.length,
        completedCount,
        pendingCount,
        completionRate,
      };
    }),
  }),
});

export type AppRouter = typeof appRouter;
