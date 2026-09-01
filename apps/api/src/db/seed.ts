import { randomBytes } from "node:crypto";
import { db, schema } from "./client";

/** 從原本寫死在前端的 src/data/cards.ts 搬過來的資料。 */
const SEED_STAMPS = [
  "2026-08-01T12:00:00+08:00",
  "2026-08-03T18:30:00+08:00",
  "2026-08-05T20:00:00+08:00",
  "2026-08-18T22:32:00+08:00",
  "2026-08-25T10:15:00+08:00",
  "2026-08-25T23:10:00+08:00",
  "2026-08-31T09:00:00+08:00",
];

async function seed() {
  const existing = await db.select().from(schema.collections).limit(1);
  if (existing.length > 0) {
    console.log("已經有資料了，略過 seed。要重來請執行 pnpm db:reset。");
    return;
  }

  const viewToken = randomBytes(24).toString("base64url");

  const [collection] = await db
    .insert(schema.collections)
    .values({
      viewToken,
      ownerName: "トモ",
      issuerName: "みずき",
    })
    .returning();

  const [card] = await db
    .insert(schema.cards)
    .values({
      collectionId: collection.id,
      serialNumber: 1,
      label: "御褒美",
      title: "集印帳",
      totalStamps: 10,
      themeId: "black-gold",
      createdAt: new Date("2026-08-01T12:00:00+08:00"),
    })
    .returning();

  await db.insert(schema.stamps).values(
    SEED_STAMPS.map((awardedAt) => ({
      cardId: card.id,
      awardedAt: new Date(awardedAt),
    })),
  );

  console.log("seed 完成");
  console.log(`查看連結 token：${viewToken}`);
  console.log(`卡片 id：${card.id}`);
}

seed()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
