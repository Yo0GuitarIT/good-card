import { sql } from "drizzle-orm";
import {
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

/**
 * 一個收藏屬於一組持有者／授印者，並綁定一組私人查看 token。
 * 建立新卡時 token 不變，所以 token 放在收藏而不是卡片上。
 */
export const collections = pgTable("collections", {
  id: uuid("id").primaryKey().defaultRandom(),
  viewToken: text("view_token").notNull().unique(),
  ownerName: text("owner_name").notNull(),
  issuerName: text("issuer_name").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

/**
 * lockedAt 有值代表這張卡已經被下一張卡取代，永久唯讀。
 * 部分唯一索引確保同一個收藏同時只會有一張進行中的卡片。
 */
export const cards = pgTable(
  "cards",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    collectionId: uuid("collection_id")
      .notNull()
      .references(() => collections.id, { onDelete: "cascade" }),
    serialNumber: integer("serial_number").notNull(),
    label: text("label").notNull(),
    title: text("title").notNull(),
    totalStamps: integer("total_stamps").notNull().default(10),
    themeId: text("theme_id").notNull().default("black-gold"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    lockedAt: timestamp("locked_at", { withTimezone: true }),
  },
  (table) => [
    uniqueIndex("cards_collection_serial_unique").on(
      table.collectionId,
      table.serialNumber,
    ),
    uniqueIndex("cards_one_active_per_collection")
      .on(table.collectionId)
      .where(sql`${table.lockedAt} is null`),
  ],
);

/**
 * 章數一律由這張表算出來，不另外保存 stampCount，避免資料互相矛盾。
 *
 * 撤回是軟刪除：寫入 revokedAt 而不是刪掉整列，這樣可以復原，
 * 復原後也保有原本的 awardedAt。超過保留期限才由 purgeRevokedStamps 真正刪除。
 * 所有算章數的地方都必須加上 revokedAt is null。
 */
export const stamps = pgTable(
  "stamps",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    cardId: uuid("card_id")
      .notNull()
      .references(() => cards.id, { onDelete: "cascade" }),
    awardedAt: timestamp("awarded_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    revokedAt: timestamp("revoked_at", { withTimezone: true }),
  },
  (table) => [
    index("stamps_card_active_idx")
      .on(table.cardId, table.awardedAt)
      .where(sql`${table.revokedAt} is null`),
  ],
);
