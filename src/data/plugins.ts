/**
 * プラグイン一覧データ。
 * image に公開パス（例: /images/plugins/copyattack.webp）を指定すると差し替えできます。
 * 未設定または差し替え前は placeholderImage が使われます。
 *
 * donationHref は site.ts の OFUSE URL と揃えてください。
 */
export const placeholderImage = "/images/plugins/placeholder.svg";
const ofuseDonationHref = "https://ofuse.me/yourudora";

export type PluginItem = {
  /** URL用スラッグ（/plugins/{slug}/） */
  slug: string;
  title: string;
  engine: string;
  /** カード用の短い説明（最大2行想定） */
  shortDescription: string;
  /** 詳細ページ用の本文 */
  description: string;
  downloadHref: string;
  donationHref?: string;
  category: string;
  /** 公開・更新日（YYYY-MM-DD）。新着順ソートに使用 */
  updatedAt: string;
  /**
   * アイキャッチ画像パス（public 配下）。
   * 例: "/images/plugins/copyattack.webp"
   * 省略時は placeholderImage を使用。
   */
  image?: string;
  imageAlt?: string;
};

export const plugins: PluginItem[] = [
  {
    slug: "copyattack",
    title: "CopyAttack",
    engine: "RPGツクールMZ",
    shortDescription:
      "敵の技をコピーして使える、バトル向けプラグイン。",
    description:
      "敵から技をコピーできるスキルを実装するバトルプラグインです。\nコピーした技を味方側で使用でき、敵の攻撃を活かした駆け引きのある戦闘を作れます。",
    downloadHref: "/downloads/CopyAttack.zip",
    donationHref: ofuseDonationHref,
    category: "バトル系",
    updatedAt: "2026-08-06",
    // image: "/images/plugins/copyattack.webp",
    imageAlt: "CopyAttack のアイキャッチ画像",
  },
];

/** 登録済みジャンル（絞り込み用） */
export function getPluginGenres(): string[] {
  return [...new Set(plugins.map((plugin) => plugin.category))].sort((a, b) =>
    a.localeCompare(b, "ja"),
  );
}

export function getPluginImage(plugin: PluginItem): string {
  return plugin.image ?? placeholderImage;
}

export type PluginSortMode = "newest" | "oldest" | "name";

export function sortPlugins(items: PluginItem[], mode: PluginSortMode = "newest"): PluginItem[] {
  const list = [...items];
  if (mode === "oldest") {
    return list.sort((a, b) => a.updatedAt.localeCompare(b.updatedAt));
  }
  if (mode === "name") {
    return list.sort((a, b) => a.title.localeCompare(b.title, "ja"));
  }
  return list.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

/** 新着順（updatedAt 降順）のプラグイン一覧 */
export function getPluginsNewestFirst(): PluginItem[] {
  return sortPlugins(plugins, "newest");
}

export function getPluginBySlug(slug: string): PluginItem | undefined {
  return plugins.find((plugin) => plugin.slug === slug);
}
