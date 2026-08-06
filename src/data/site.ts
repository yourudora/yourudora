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
  donation: {
    label: "Buy Me a Coffee",
    href: "https://www.buymeacoffee.com/",
  },
} as const;

export const navItems = [
  { href: "/", label: "Top" },
  { href: "/plugins/", label: "Plugins" },
  { href: "/games/", label: "Games" },
  { href: "/about/", label: "About" },
] as const;

export type NewsItem = {
  date: string;
  label: string;
  href?: string;
};

export const latestNews: NewsItem[] = [
  {
    date: "2026-08-06",
    label: "ツクールMZ用プラグイン「CopyAttack」を配布開始",
    href: "/plugins/",
  },
  {
    date: "2026-08-06",
    label: "サイト「ユルドラの箱庭」を公開しました",
    href: "/about/",
  },
];

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
    href: "/plugins/",
    status: "無料配布中",
  },
  {
    kind: "game",
    title: "パラムネシア-まねっこ少女の冒険記-",
    summary:
      "敵の技を奪って攻略する、駆け引き重視の短編RPG。",
    meta: "PC / 開発中",
    href: "/games/",
    status: "開発中",
  },
];

export type PluginItem = {
  title: string;
  engine: string;
  summary: string;
  downloadHref: string;
  donationHref?: string;
  category: string;
};

export const plugins: PluginItem[] = [
  {
    title: "CopyAttack",
    engine: "RPGツクールMZ",
    summary:
      "敵から技をコピーできるスキルを実装するバトルプラグインです。\nコピーした技を味方側で使用でき、敵の攻撃を活かした駆け引きのある戦闘を作れます。",
    downloadHref: "/downloads/CopyAttack.zip",
    donationHref: site.donation.href,
    category: "バトル",
  },
];

export type GameItem = {
  title: string;
  summary: string;
  status: "開発中" | "Demo公開中" | "リリース済み";
  platforms: string;
  screenshotAlt: string;
};

export const games: GameItem[] = [
  {
    title: "パラムネシア-まねっこ少女の冒険記-",
    summary:
      "洞窟で目覚めた記憶喪失の少年「ルカ」と、正義感あふれる少女「リゼット」。\n失われた記憶の手がかりと平和を求め、二人は旅に出る――。\n\n敵の技を奪って攻略する駆け引きなど、RPG好きに向けた奥深いバトルを楽しめる短編作品です。",
    status: "開発中",
    platforms: "PC（Windows）",
    screenshotAlt: "箱庭クロニクルのスクリーンショット予定領域",
  },
];
