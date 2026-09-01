import { asc, eq } from "drizzle-orm";
import { Hono } from "hono";
import type { AdminCollectionResponse } from "@good-card/shared";
import { db, schema } from "../db/client";
import { buildCollectionResponse } from "../queries/collection";
import {
  clearAdminCookie,
  issueAdminCookie,
  requireAdmin,
  verifyPassword,
} from "../auth";
import { toCardData } from "../mappers";

export const adminRoute = new Hono();

adminRoute.post("/login", async (c) => {
  const body = await c.req
    .json<{ password?: string }>()
    .catch((): { password?: string } => ({}));
  if (typeof body.password !== "string" || !verifyPassword(body.password)) {
    return c.json({ error: "invalid_password" }, 401);
  }
  await issueAdminCookie(c);
  return c.json({ ok: true });
});

adminRoute.post("/logout", (c) => {
  clearAdminCookie(c);
  return c.json({ ok: true });
});

adminRoute.get("/me", requireAdmin, (c) => c.json({ role: "issuer" }));

/** 系統固定只有一位授印者、一個收藏，所以不需要用 id 指定。 */
adminRoute.get("/collection", requireAdmin, async (c) => {
  const collection = await db.query.collections.findFirst({
    orderBy: asc(schema.collections.createdAt),
  });

  if (!collection) {
    return c.json({ error: "collection_not_found" }, 404);
  }

  const response: AdminCollectionResponse = {
    ...(await buildCollectionResponse(collection)),
    viewToken: collection.viewToken,
  };

  return c.json(response);
});

/** 授印：在指定卡片上增加一枚章。 */
adminRoute.post("/cards/:id/stamps", requireAdmin, async (c) => {
  const cardId = c.req.param("id");

  const result = await db.transaction(async (tx) => {
    const card = await tx.query.cards.findFirst({
      where: eq(schema.cards.id, cardId),
    });
    if (!card) {
      return { error: "card_not_found" as const, status: 404 as const };
    }
    if (card.lockedAt !== null) {
      return { error: "card_locked" as const, status: 409 as const };
    }

    const existing = await tx
      .select()
      .from(schema.stamps)
      .where(eq(schema.stamps.cardId, cardId))
      .orderBy(asc(schema.stamps.awardedAt));

    if (existing.length >= card.totalStamps) {
      return { error: "card_already_complete" as const, status: 409 as const };
    }

    const [stamp] = await tx
      .insert(schema.stamps)
      .values({ cardId })
      .returning();

    const stamps = [...existing, stamp];

    // 蓋滿最後一枚時記下滿願時間。
    let updated = card;
    if (stamps.length === card.totalStamps) {
      const [row] = await tx
        .update(schema.cards)
        .set({ completedAt: stamp.awardedAt })
        .where(eq(schema.cards.id, cardId))
        .returning();
      updated = row;
    }

    const collection = await tx.query.collections.findFirst({
      where: eq(schema.collections.id, card.collectionId),
    });

    return { card: toCardData(updated, stamps, collection!) };
  });

  if ("error" in result) {
    return c.json({ error: result.error }, result.status);
  }
  return c.json(result.card, 201);
});
