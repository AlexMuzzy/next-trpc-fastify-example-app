import { getServerSessionCookie } from "@/lib/auth/constants";

/**
 * Get the current session from cookies on the server side.
 * This uses the Better-Auth session token stored in cookies.
 */
export async function getServerSession() {
  try {
    const sessionCookie = await getServerSessionCookie();

    if (!sessionCookie) {
      return null;
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

    const response = await fetch(`${apiUrl}/api/auth/get-session`, {
      method: "GET",
      headers: {
        Cookie: `${sessionCookie.name}=${sessionCookie.value}`,
      },
      credentials: "include",
    });

    if (!response.ok) {
      return null;
    }

    const session = await response.json();
    return session;
  } catch (error) {
    console.error("Error getting server session:", error);
    return null;
  }
}
