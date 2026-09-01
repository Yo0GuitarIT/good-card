import { fileURLToPath } from "node:url";

/**
 * 執行時的檔案位置：
 *   開發 → apps/api/src/paths.ts
 *   打包 → apps/api/dist/index.js
 * 兩者都在 apps/api 底下一層，所以 "../" 都會得到 apps/api/。
 * 路徑集中在這裡，就不會因為某個模組多一層目錄而算錯。
 */
const apiRoot = new URL("../", import.meta.url);

export const migrationsFolder = fileURLToPath(new URL("drizzle/", apiRoot));
export const webDistFolder = fileURLToPath(new URL("../web/dist/", apiRoot));
