# ユルドラの箱庭

自作ゲームエンジンプラグインの無料配布と、開発中ゲームの宣伝・最新情報を掲載するサイトです。

## 技術スタック

- [Astro](https://astro.build/) 7
- [Tailwind CSS](https://tailwindcss.com/) 4（`@tailwindcss/vite`）

## ディレクトリ構成

```
yurudra-hakoniwa/
├── public/                 # 静的アセット
├── src/
│   ├── components/         # Header / Footer / DonationSlot など
│   ├── data/site.ts        # サイト定数・サンプルコンテンツ
│   ├── layouts/Layout.astro
│   ├── pages/
│   │   ├── index.astro     # Top
│   │   ├── plugins/        # プラグイン一覧
│   │   ├── games/          # ゲーム紹介
│   │   └── about/          # About / Contact
│   └── styles/global.css   # テーマトークン・ベーススタイル
├── astro.config.mjs
└── package.json
```

## 開発コマンド

```bash
npm install
npm run dev      # http://localhost:4321
npm run build
npm run preview
```

## ドネーション枠

- `DonationSlot.astro` … OFUSE 等の応援導線。`href` / `label` または slot で差し替え可能

リンク先や文言は `src/data/site.ts` で一括管理しています。
