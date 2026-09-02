import { eq } from "drizzle-orm";
import { Hono } from "hono";
import { db, schema } from "../db/client";
import { buildCollectionResponse } from "../queries/collection";

export const collectionsRoute = new Hono();

collectionsRoute.get("/:token", async (c) => {
  const token = c.req.param("token");

  const collection = await db.query.collections.findFirst({
    where: eq(schema.collections.viewToken, token),
  });

  if (!collection) {
    return c.json({ error: "collection_not_found" }, 404);
  }

  return c.json(await buildCollectionResponse(collection));
});
