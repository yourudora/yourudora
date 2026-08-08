/**
 * ゲーム一覧データ。
 * image に公開パス（例: /images/games/paramnesia.webp）を指定すると差し替えできます。
 * 未設定時は placeholderImage を使用します。
 */
export const placeholderImage = "/images/games/placeholder.svg";

export type GameStatus = "開発中" | "デモ公開中" | "リリース済み";

export type GameItem = {
  /** URL用スラッグ（/games/{slug}/） */
  slug: string;
  title: string;
  /** カード用の短い説明（最大2行想定） */
  shortDescription: string;
  /** 詳細ページ用の本文 */
  description: string;
  /** ジャンル（カードバッジ用） */
  genre: string;
  status: GameStatus;
  platforms: string;
  /** 公開・更新日（YYYY-MM-DD）。新着順ソートに使用 */
  updatedAt: string;
  /**
   * アイキャッチ画像パス（public 配下）。
   * 例: "/images/games/paramnesia.webp"
   */
  image?: string;
  imageAlt?: string;
};

export const games: GameItem[] = [
  {
    slug: "paramnesia",
    title: "パラムネシア-まねっこ少女の冒険記-",
    shortDescription:
      "敵の技を奪って攻略する、駆け引き重視の短編RPG。",
    description:
      "洞窟で目覚めた記憶喪失の少年「ルカ」と、正義感あふれる少女「リゼット」。\n失われた記憶の手がかりと平和を求め、二人は旅に出る――。\n\n敵の技を奪って攻略する駆け引きなど、RPG好きに向けた奥深いバトルを楽しめる短編作品です。",
    genre: "RPG",
    status: "開発中",
    platforms: "PC（Windows）",
    updatedAt: "2026-08-06",
    // image: "/images/games/paramnesia.webp",
    imageAlt: "パラムネシアのアイキャッチ画像",
  },
];

/** 登録済みジャンル（絞り込み用） */
export function getGameGenres(): string[] {
  return [...new Set(games.map((game) => game.genre))].sort((a, b) =>
    a.localeCompare(b, "ja"),
  );
}

export function getGameImage(game: GameItem): string {
  return game.image ?? placeholderImage;
}

export type GameSortMode = "newest" | "oldest" | "name";

export function sortGames(items: GameItem[], mode: GameSortMode = "newest"): GameItem[] {
  const list = [...items];
  if (mode === "oldest") {
    return list.sort((a, b) => a.updatedAt.localeCompare(b.updatedAt));
  }
  if (mode === "name") {
    return list.sort((a, b) => a.title.localeCompare(b.title, "ja"));
  }
  return list.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function getGamesNewestFirst(): GameItem[] {
  return sortGames(games, "newest");
}

export function getGameBySlug(slug: string): GameItem | undefined {
  return games.find((game) => game.slug === slug);
}
