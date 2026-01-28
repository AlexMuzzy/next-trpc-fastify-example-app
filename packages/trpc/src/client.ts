import { createTRPCReact, type CreateTRPCReact } from "@trpc/react-query";
import { httpBatchLink, loggerLink } from "@trpc/client";
import type { AppRouter } from "@fsapp/server/router";
import superjson from "superjson";

export const trpc: CreateTRPCReact<AppRouter, unknown> =
  createTRPCReact<AppRouter>({});

export const createClient = ({ apiUrl }: { apiUrl: string }) =>
  trpc.createClient({
    links: [
      loggerLink({ enabled: () => typeof window !== "undefined" }),
      httpBatchLink({
        url: `${apiUrl}/trpc`,
        transformer: superjson,
        fetch(url, options) {
          return fetch(url, {
            ...options,
            credentials: "include",
          });
        },
      }),
    ],
  });
