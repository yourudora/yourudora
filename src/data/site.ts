/** OFUSE箱のユーザーID。書き換えると donation.href が連動します。 */
const ofuseUserId = "yourudora";

export const site = {
  name: "ユルドラの箱庭",
  tagline: "プラグインを育て、ゲームを届ける小さな庭",
  description:
    "自作ゲームエンジンプラグインの無料配布と、開発中の自作ゲームの最新情報をお届けするサイトです。",
  url: "https://yurudra-hakoniwa.example.com",
  author: "ユルドラ",
  social: {
    twitter: "https://twitter.com/",
    github: "https://github.com/",
    youtube: "https://youtube.com/",
  },
  /**
   * OFUSE（オフセ）の応援導線。
   * ofuseUserId を書き換えるか、公開URLが異なる場合は href を直接指定してください。
   */
  donation: {
    userId: ofuseUserId,
    label: "OFUSEで応援メッセージを送る",
    href: `https://ofuse.me/${ofuseUserId}`,
  },
} as const;

export const navItems = [
  { href: "/", label: "トップ" },
  { href: "/plugins/", label: "プラグイン" },
  { href: "/games/", label: "ゲーム" },
  { href: "/contact/", label: "お問い合わせ" },
] as const;

export type ChangelogItem = {
  date: string;
  label: string;
  href?: string;
};

/** 更新履歴（新しい日付を上に並べてください） */
export const changelog: ChangelogItem[] = [
  {
    date: "2026-08-06",
    label: "ツクールMZ用プラグイン「CopyAttack」を配布開始",
    href: "/plugins/copyattack/",
  },
  {
    date: "2026-08-06",
    label: "サイト「ユルドラの箱庭」を公開しました",
    href: "/contact/",
  },
];

/** 更新履歴を新しい順で返す */
export function getChangelogNewestFirst(): ChangelogItem[] {
  return [...changelog].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
}

/** @deprecated changelog を使用してください */
export const latestNews = changelog;

export type PickupItem = {
  kind: "plugin" | "game";
  title: string;
  summary: string;
  meta: string;
  href: string;
  status?: string;
};

export const pickupItems: PickupItem[] = [
  {
    kind: "plugin",
    title: "CopyAttack",
    summary:
      "敵の技をコピーして使えるようにする、RPGツクールMZ向けバトルプラグイン。",
    meta: "RPGツクールMZ",
    href: "/plugins/copyattack/",
    status: "無料配布中",
  },
  {
    kind: "game",
    title: "パラムネシア-まねっこ少女の冒険記-",
    summary: "敵の技を奪って攻略する、駆け引き重視の短編RPG。",
    meta: "PC / 開発中",
    href: "/games/paramnesia/",
    status: "開発中",
  },
];
