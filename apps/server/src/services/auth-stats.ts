import type { createAuth } from "../lib/auth.js";

type AuthInstance = ReturnType<typeof createAuth>;

/**
 * Get user statistics using Better-Auth admin API
 */
export const getUserStats = async (
  auth: AuthInstance,
  headers?: globalThis.Headers,
) => {
  try {
    // Use Better-Auth's admin API to list users
    // Note: This requires admin authentication
    const result = await auth.api.listUsers({
      query: {},
      headers: headers || new Headers(),
    });
    const users = result.users || [];

    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    return {
      totalUsers: users.length,
      verifiedUsers: users.filter((u) => u.emailVerified).length,
      recentUsers: users.filter((u) => u.createdAt >= sevenDaysAgo).length,
      users: users.slice(0, 10).map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        emailVerified: u.emailVerified,
        createdAt:
          typeof u.createdAt === "string"
            ? u.createdAt
            : u.createdAt.toISOString(),
      })),
    };
  } catch (error) {
    console.error("Error fetching user stats:", error);
    return {
      totalUsers: 0,
      verifiedUsers: 0,
      recentUsers: 0,
      users: [],
    };
  }
};
