import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { sql } from "drizzle-orm";
import { db } from "./db/client";
import { runMigrations } from "./db/migrate";
import { scheduleRevokedStampPurge } from "./db/purge";
import { env } from "./env";
import { adminRoute } from "./routes/admin";
import { collectionsRoute } from "./routes/collections";
import { mountWebApp } from "./static";

const app = new Hono();

app.get("/api/health", async (c) => {
  try {
    await db.execute(sql`select 1`);
    return c.json({ ok: true, database: "up" });
  } catch (error) {
    console.error("health check failed", error);
    return c.json({ ok: false, database: "down" }, 503);
  }
});

app.route("/api/collections", collectionsRoute);
app.route("/api/admin", adminRoute);

// 先把資料表建好再對外服務，也確保清除排程不會在建表前就查詢。
await runMigrations();
console.log("migrations up to date");

scheduleRevokedStampPurge();

const servingWeb = mountWebApp(app);
console.log(
  servingWeb
    ? "serving web app from apps/web/dist"
    : "apps/web/dist not found, serving API only",
);

serve({ fetch: app.fetch, port: env.port }, (info) => {
  console.log(`listening on http://localhost:${info.port}`);
});
