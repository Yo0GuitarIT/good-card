import { and, isNotNull, lt } from "drizzle-orm";
import { db, schema } from "./client";

/** 撤回的章保留一個月，讓誤按有機會復原；超過就真的刪掉。 */
export const REVOKED_STAMP_RETENTION_DAYS = 30;

const DAY_IN_MS = 24 * 60 * 60 * 1000;

export async function purgeRevokedStamps(): Promise<number> {
  const cutoff = new Date(
    Date.now() - REVOKED_STAMP_RETENTION_DAYS * DAY_IN_MS,
  );

  const deleted = await db
    .delete(schema.stamps)
    .where(
      and(
        isNotNull(schema.stamps.revokedAt),
        lt(schema.stamps.revokedAt, cutoff),
      ),
    )
    .returning({ id: schema.stamps.id });

  return deleted.length;
}

/**
 * 啟動時跑一次，之後每天跑一次。
 * unref 讓這個計時器不會拖住程序結束。
 */
export function scheduleRevokedStampPurge(): void {
  const run = () => {
    purgeRevokedStamps()
      .then((count) => {
        if (count > 0) {
          console.log(`已清除 ${count} 枚超過保留期限的撤回章`);
        }
      })
      .catch((error) => console.error("清除撤回章失敗", error));
  };

  run();
  setInterval(run, DAY_IN_MS).unref();
}
