// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
  // 絶対URL生成・正規化用（必要に応じて本番ドメインへ変更）
  site: "https://yurudra-hakoniwa.example.com",
  trailingSlash: "always",
  build: {
    // `_astro` は一部プロキシ／セキュリティ環境でブロックされやすいため変更
    assets: "assets",
    // 外部 CSS のハッシュ不一致・404 でノーCSSになるのを防ぐ（スタイルを HTML に内包）
    inlineStylesheets: "always",
  },
  vite: {
    plugins: [tailwindcss()],
    build: {
      // 念のためアセット名も assets/ 配下に揃える
      rollupOptions: {
        output: {
          assetFileNames: "assets/[name].[hash][extname]",
          chunkFileNames: "assets/[name].[hash].js",
          entryFileNames: "assets/[name].[hash].js",
        },
      },
    },
  },
});
