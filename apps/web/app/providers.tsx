"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { trpc, createClient } from "@fsapp/trpc";
import { useState } from "react";

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() =>
    createClient({
      apiUrl: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000",
    }),
  );
  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  );
}
