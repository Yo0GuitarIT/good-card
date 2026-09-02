import { and, asc, desc, eq, isNull, isNotNull } from "drizzle-orm";
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

  const payload = await buildCollectionResponse(collection);

  // 進行中卡片最近一枚被撤回的章，還在保留期限內就能復原。
  const revoked = payload.currentCard
    ? await db
        .select()
        .from(schema.stamps)
        .where(
          and(
            eq(schema.stamps.cardId, payload.currentCard.id),
            isNotNull(schema.stamps.revokedAt),
          ),
        )
        .orderBy(desc(schema.stamps.revokedAt))
        .limit(1)
    : [];

  const response: AdminCollectionResponse = {
    ...payload,
    viewToken: collection.viewToken,
    restorableStamp: revoked[0]
      ? {
          id: revoked[0].id,
          awardedAt: revoked[0].awardedAt.toISOString(),
        }
      : null,
  };

  return c.json(response);
});

/** 復原：把最近一枚被撤回的章放回去，保留原本的授印時間。 */
adminRoute.post("/cards/:id/stamps/restore-last", requireAdmin, async (c) => {
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

    const [revoked] = await tx
      .select()
      .from(schema.stamps)
      .where(
        and(
          eq(schema.stamps.cardId, cardId),
          isNotNull(schema.stamps.revokedAt),
        ),
      )
      .orderBy(desc(schema.stamps.revokedAt))
      .limit(1);

    if (!revoked) {
      return { error: "no_stamp_to_restore" as const, status: 409 as const };
    }

    const active = await tx
      .select()
      .from(schema.stamps)
      .where(
        and(eq(schema.stamps.cardId, cardId), isNull(schema.stamps.revokedAt)),
      )
      .orderBy(asc(schema.stamps.awardedAt));

    // 撤回之後又蓋了新的章，放回去會超過十枚。
    if (active.length >= card.totalStamps) {
      return { error: "card_already_complete" as const, status: 409 as const };
    }

    await tx
      .update(schema.stamps)
      .set({ revokedAt: null })
      .where(eq(schema.stamps.id, revoked.id));

    // 依 awardedAt 放回原本的位置，不是接在最後。
    const stamps = [...active, { ...revoked, revokedAt: null }].sort(
      (a, b) => a.awardedAt.getTime() - b.awardedAt.getTime(),
    );

    let updated = card;
    const shouldComplete = stamps.length === card.totalStamps;
    if (shouldComplete !== (card.completedAt !== null)) {
      const [row] = await tx
        .update(schema.cards)
        .set({
          completedAt: shouldComplete ? stamps[stamps.length - 1].awardedAt : null,
        })
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
  return c.json(result.card);
});

/** 撤回：刪掉目前進行中卡片的最後一枚章。已鎖定的舊卡不能動。 */
adminRoute.delete("/cards/:id/stamps/last", requireAdmin, async (c) => {
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
      .where(
        and(
          eq(schema.stamps.cardId, cardId),
          isNull(schema.stamps.revokedAt),
        ),
      )
      .orderBy(asc(schema.stamps.awardedAt));

    const last = existing.at(-1);
    if (!last) {
      return { error: "no_stamps_to_revoke" as const, status: 409 as const };
    }

    // 軟刪除：留著原本的 awardedAt，之後才能原位復原。
    await tx
      .update(schema.stamps)
      .set({ revokedAt: new Date() })
      .where(eq(schema.stamps.id, last.id));

    const stamps = existing.slice(0, -1);

    // 撤回後不再滿願，completedAt 必須跟著清掉，否則會出現九枚章卻標記已完成。
    let updated = card;
    if (card.completedAt !== null) {
      const [row] = await tx
        .update(schema.cards)
        .set({ completedAt: null })
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
  return c.json(result.card);
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
      .where(
        and(
          eq(schema.stamps.cardId, cardId),
          isNull(schema.stamps.revokedAt),
        ),
      )
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
