import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";

/**
 * 本機開發時讀取 repo 根目錄的 .env。
 * 正式環境（Zeabur）直接由平台注入環境變數，不會有這個檔案。
 */
const rootEnvFile = fileURLToPath(new URL("../../../.env", import.meta.url));
if (existsSync(rootEnvFile)) {
  process.loadEnvFile(rootEnvFile);
}

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`缺少環境變數 ${name}，請參考 .env.example`);
  }
  return value;
}

export const env = {
  databaseUrl: required("DATABASE_URL"),
  adminPassword: required("ADMIN_PASSWORD"),
  cookieSecret: required("COOKIE_SECRET"),
  port: Number(process.env.PORT ?? 8787),
  isProduction: process.env.NODE_ENV === "production",
};
