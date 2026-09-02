import { timingSafeEqual } from "node:crypto";
import type { MiddlewareHandler } from "hono";
import { deleteCookie, getSignedCookie, setSignedCookie } from "hono/cookie";
import { env } from "./env";

const COOKIE_NAME = "gc_admin";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 90; // 90 天

export function verifyPassword(input: string): boolean {
  const a = Buffer.from(input);
  const b = Buffer.from(env.adminPassword);
  // timingSafeEqual 要求長度相同，先比長度會洩漏長度但不洩漏內容。
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function issueAdminCookie(c: Parameters<MiddlewareHandler>[0]) {
  await setSignedCookie(c, COOKIE_NAME, "issuer", env.cookieSecret, {
    httpOnly: true,
    secure: env.isProduction,
    sameSite: "Lax",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  });
}

export function clearAdminCookie(c: Parameters<MiddlewareHandler>[0]) {
  deleteCookie(c, COOKIE_NAME, { path: "/" });
}

export const requireAdmin: MiddlewareHandler = async (c, next) => {
  const value = await getSignedCookie(c, env.cookieSecret, COOKIE_NAME);
  if (value !== "issuer") {
    return c.json({ error: "unauthorized" }, 401);
  }
  await next();
};
