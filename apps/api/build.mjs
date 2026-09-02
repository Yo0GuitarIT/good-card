import { build } from "esbuild";

/**
 * 打包成單一檔案。
 * tsc 不會改寫 import 路徑，直接用它的產物會讓 Node ESM 找不到
 * "./db/client" 這種沒有副檔名的相對路徑（ERR_MODULE_NOT_FOUND）。
 * 打包同時也讓 @good-card/shared 這個 workspace 套件不必存在於正式環境。
 */
await build({
  entryPoints: ["src/index.ts"],
  bundle: true,
  platform: "node",
  format: "esm",
  target: "node22",
  outfile: "dist/index.js",
  sourcemap: true,
  logLevel: "info",
  banner: {
    // 部分相依套件在 ESM 下仍會用到 require，補一個進去。
    js: "import{createRequire as __cr}from'node:module';const require=__cr(import.meta.url);",
  },
});
