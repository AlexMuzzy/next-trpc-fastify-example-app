import { createAuthClient } from "better-auth/react";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export const authClient = createAuthClient({
  baseURL: apiUrl,
  basePath: "/api/auth",
  fetchOptions: {
    credentials: "include",
  },
});

export const useSession = () => {
  return authClient.useSession();
};
