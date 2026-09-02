import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { serveStatic } from "@hono/node-server/serve-static";
import type { Hono } from "hono";
import { webDistFolder } from "./paths";

const indexHtmlPath = path.join(webDistFolder, "index.html");

/**
 * 同一個服務同時提供 API 與前端，前後端因此同網域，
 * 不必處理 CORS，admin cookie 也不用跨網域設定。
 */
export function mountWebApp(app: Hono): boolean {
  if (!existsSync(indexHtmlPath)) {
    return false;
  }

  // serveStatic 的 root 是相對於 process.cwd()，先換算，才不會被啟動目錄影響。
  const relativeRoot = path.relative(process.cwd(), webDistFolder) || ".";
  app.use("/*", serveStatic({ root: relativeRoot }));

  const indexHtml = readFileSync(indexHtmlPath, "utf8");

  // SPA fallback：/card/:token 與 /admin 都是前端路由，實體檔案不存在。
  app.notFound((c) => {
    if (c.req.path.startsWith("/api/")) {
      return c.json({ error: "not_found" }, 404);
    }
    if (c.req.method !== "GET") {
      return c.text("Not Found", 404);
    }
    return c.html(indexHtml);
  });

  return true;
}
