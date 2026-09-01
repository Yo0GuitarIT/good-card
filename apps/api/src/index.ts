import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { sql } from "drizzle-orm";
import { db } from "./db/client";
import { env } from "./env";
import { adminRoute } from "./routes/admin";
import { collectionsRoute } from "./routes/collections";

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

serve({ fetch: app.fetch, port: env.port }, (info) => {
  console.log(`API listening on http://localhost:${info.port}`);
});
