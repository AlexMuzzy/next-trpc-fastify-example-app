import { cookies } from "next/headers";
import type { NextRequest } from "next/server";

const COOKIE_NAME = "fsapp.session_token";
const SECURE_COOKIE_NAME = "__Secure-fsapp.session_token";

export const getServerSessionCookie = async () => {
  const cookieStore = await cookies();

  return cookieStore.get(SECURE_COOKIE_NAME) || cookieStore.get(COOKIE_NAME);
};

export const getRequestSessionCookie = (request: NextRequest) => {
  const sessionCookie =
    request.cookies.get(SECURE_COOKIE_NAME) || request.cookies.get(COOKIE_NAME);
  return sessionCookie;
};
