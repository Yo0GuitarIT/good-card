import { existsSync } from "node:fs";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { db } from "./client";
import { migrationsFolder } from "../paths";

/**
 * 用 drizzle-orm 內建的 migrator，而不是 drizzle-kit。
 * drizzle-kit 是 devDependency，正式環境不一定裝得到；
 * migrator 屬於 runtime 依賴，打包後也帶得走。
 */
export async function runMigrations(): Promise<void> {
  if (!existsSync(migrationsFolder)) {
    throw new Error(`找不到 migration 資料夾：${migrationsFolder}`);
  }
  await migrate(db, { migrationsFolder });
}
