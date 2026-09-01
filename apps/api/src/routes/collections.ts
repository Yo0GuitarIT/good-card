import { asc, eq } from "drizzle-orm";
import { Hono } from "hono";
import type { CollectionResponse } from "@good-card/shared";
import { db, schema } from "../db/client";
import { toCardData } from "../mappers";

export const collectionsRoute = new Hono();

collectionsRoute.get("/:token", async (c) => {
  const token = c.req.param("token");

  const collection = await db.query.collections.findFirst({
    where: eq(schema.collections.viewToken, token),
  });

  if (!collection) {
    return c.json({ error: "collection_not_found" }, 404);
  }

  const cardRows = await db
    .select()
    .from(schema.cards)
    .where(eq(schema.cards.collectionId, collection.id))
    .orderBy(asc(schema.cards.serialNumber));

  const stampRows = await db
    .select()
    .from(schema.stamps)
    .innerJoin(schema.cards, eq(schema.stamps.cardId, schema.cards.id))
    .where(eq(schema.cards.collectionId, collection.id))
    .orderBy(asc(schema.stamps.awardedAt));

  const stampsByCard = new Map<string, { id: string; awardedAt: Date }[]>();
  for (const row of stampRows) {
    const list = stampsByCard.get(row.stamps.cardId) ?? [];
    list.push({ id: row.stamps.id, awardedAt: row.stamps.awardedAt });
    stampsByCard.set(row.stamps.cardId, list);
  }

  const cards = cardRows.map((card) =>
    toCardData(card, stampsByCard.get(card.id) ?? [], collection),
  );

  // lockedAt 為 null 的那張是進行中的卡片；部分唯一索引保證最多只有一張。
  const activeIndex = cardRows.findIndex((card) => card.lockedAt === null);

  const response: CollectionResponse = {
    collectionId: collection.id,
    currentCard: activeIndex === -1 ? null : cards[activeIndex],
    historyCards: cards.filter((_, index) => index !== activeIndex),
  };

  return c.json(response);
});
