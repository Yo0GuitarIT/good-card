import { and, asc, eq, isNull } from "drizzle-orm";
import type { CollectionResponse } from "@good-card/shared";
import { db, schema } from "../db/client";
import { toCardData } from "../mappers";

type CollectionRow = typeof schema.collections.$inferSelect;

/**
 * 把一個收藏底下的卡片與章整理成前端要的形狀。
 * 查看頁與管理頁共用，避免兩邊各寫一次而漸漸不一致。
 */
export async function buildCollectionResponse(
  collection: CollectionRow,
): Promise<CollectionResponse> {
  const cardRows = await db
    .select()
    .from(schema.cards)
    .where(eq(schema.cards.collectionId, collection.id))
    .orderBy(asc(schema.cards.serialNumber));

  const stampRows = await db
    .select()
    .from(schema.stamps)
    .innerJoin(schema.cards, eq(schema.stamps.cardId, schema.cards.id))
    .where(
      and(
        eq(schema.cards.collectionId, collection.id),
        isNull(schema.stamps.revokedAt),
      ),
    )
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

  return {
    collectionId: collection.id,
    currentCard: activeIndex === -1 ? null : cards[activeIndex],
    historyCards: cards.filter((_, index) => index !== activeIndex),
  };
}
