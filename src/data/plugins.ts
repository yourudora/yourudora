/**
 * プラグイン一覧データ。
 * image に公開パス（例: /images/plugins/copyattack.webp）を指定すると差し替えできます。
 * 未設定または差し替え前は placeholderImage が使われます。
 *
 * donationHref は site.ts の OFUSE URL と揃えてください。
 */
export const placeholderImage = "/images/plugins/placeholder.svg";
const ofuseDonationHref = "https://ofuse.me/yourudora";

export type PluginChangelogEntry = {
  version: string;
  date: string;
  description: string;
};

export type PluginItem = {
  /** URL用スラッグ（/plugins/{slug}/） */
  slug: string;
  /** 画面表示用のタイトル（機能・役割が分かる名称） */
  title: string;
  /**
   * スクリプトファイル名（例: CopyAttack.js）。
   * ダウンロード ZIP やソース表示と対応させる識別名。
   */
  fileName: string;
  engine: string;
  /** カード用の短い説明（最大2行想定） */
  shortDescription: string;
  /**
   * 詳細ページ用の概要本文（後方互換）。
   * features / help が無い場合のフォールバックに使います。
   */
  description: string;
  /**
   * 機能説明（Overview）。文字列または箇条書き配列。
   * 省略時は description を表示します。
   */
  features?: string | string[];
  /**
   * 詳細説明 / ヘルプテキスト（改行保持）。
   * ツクールMZのプラグイン管理画面のヘルプに相当する内容。
   */
  help?: string;
  /** このプラグイン単体の更新履歴（新しい順推奨） */
  changelog?: PluginChangelogEntry[];
  downloadHref: string;
  /**
   * ソースコード表示用のパス（public 配下の .js など）。
   * 例: "/sources/CopyAttack.js"
   * 省略時は「ソースコードを表示」ボタンを出しません。
   */
  sourceHref?: string;
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
  /**
   * 詳細ページ左側・上段の動画（自動再生・ミュート用）。
   * URL（watch / youtu.be / embed）または動画ID。
   */
  mainVideoUrl?: string;
  /**
   * 詳細ページ左側・下段の動画（手動再生用）。
   * URL（watch / youtu.be / embed）または動画ID。
   */
  subVideoUrl?: string;
  /**
   * 2本の動画を配列で指定する場合（[上段, 下段]）。
   * mainVideoUrl / subVideoUrl より優先されません（個別指定が優先）。
   */
  youtubeUrls?: [string, string] | string[];
  /** @deprecated mainVideoUrl を使用してください */
  youtubeUrl?: string;
  /** @deprecated mainVideoUrl を使用してください */
  youtubeId?: string;
};

/** 動作テスト用のデフォルト YouTube 動画ID */
export const defaultPluginVideoId = "dQw4w9WgXcQ";

export const plugins: PluginItem[] = [
  {
    slug: "copyattack",
    title: "敵の技コピープラグイン",
    fileName: "CopyAttack.js",
    engine: "RPGツクールMZ",
    shortDescription: "敵の技をコピーして使える、バトル向けプラグイン。",
    description:
      "敵から技をコピーできるスキルを実装するバトルプラグインです。\nコピーした技を味方側で使用でき、敵の攻撃を活かした駆け引きのある戦闘を作れます。",
    features: [
      "戦闘中に敵の技をコピーし、アクターのコピー技として習得できる",
      "コピー技の保持上限・技忘れ・削除確認に対応",
      "メモ欄タグでコピー開始／除外／必要HP割合などを細かく制御できる",
      "プラグインコマンドでマップ・イベントからも習得・削除が可能",
    ],
    help: `【概要】
戦闘中に「コピー用スキル」を敵へ使うと、その敵が持つスキルから
1つを選んでアクターのコピー技として習得できます。

【メモ欄タグ】（タグ名はパラメータで変更可／旧タグも互換対応）
■ スキル
  <CopyAttack>           … コピー開始スキル
  <CopyAttackForget>     … 技忘れスキル（ターン非消費）
  <NoCopyAttack>         … コピー候補から除外
  <CopyAttackLearned>    … コピーで得た技の識別用（他プラグイン連携）
■ 敵キャラ
  <CopyAttackHpRate:30>  … HPが最大の30%以下になるまでコピー対象にできない

旧タグ互換: <CopySkill> <ForgetSkill> <NoCopy> <CopyHpRate:n> など

【使い方】
1. パラメータ「コピー用スキルID」を設定するか、スキルに <CopyAttack> を書く
2. コピー用スキルのスコープは「敵単体」にする
3. 技忘れは <CopyAttackForget>（スコープ「なし」推奨）

【保持上限】
コピー技が最大数に達している間はコピー用スキルを使用不可（グレーアウト）です。
技忘れなどで枠を空けてから再度コピーしてください。

【削除確認】
技忘れ／手動削除時は「本当に消しますか？」確認が出ます（初期カーソルは「いいえ」）。

【プラグインコマンド】
- LearnCopiedSkillByPlayer … プレイヤー選択でコピー技を追加
- LearnCopiedSkillFromListByPlayer … 指定リストから選択・習得
- AddCopiedSkillDirect … 自動追加（画面なし）
- ForgetCopiedSkillByPlayer … プレイヤー選択で削除
- RemoveCopiedSkillDirect … 自動削除（画面なし）
- SetMaxCopiedSkills … 最大保持数を変更（セーブ対応）

※ 習得・忘却のバトルログは出しません（ウィンドウと成功アニメのみ）。

【主なパラメータ】
\`copySkillId\` … コピー用スキルID（0ならメモタグのみ）
\`maxCopiedSkills\` … 最大保持数（デフォルト 5）
\`defaultRequiredHpRate\` … デフォルト必要HP割合（100で制限なし）`,
    changelog: [
      {
        version: "v1.0.1",
        date: "2026-08-08",
        description: "ヘルプ表示と入力ガード周りを調整。",
      },
      {
        version: "v1.0.0",
        date: "2026-08-06",
        description: "初版公開。敵技コピー／技忘れ／プラグインコマンドに対応。",
      },
    ],
    downloadHref: "/downloads/CopyAttack.zip",
    sourceHref: "/sources/CopyAttack.js",
    donationHref: ofuseDonationHref,
    category: "バトル系",
    updatedAt: "2026-08-06",
    // image: "/images/plugins/copyattack.webp",
    imageAlt: "敵の技コピープラグインのアイキャッチ画像",
    // mainVideoUrl: "https://www.youtube.com/watch?v=xxxxxxxxxxx",
    // subVideoUrl: "https://www.youtube.com/watch?v=yyyyyyyyyyy",
    // youtubeUrls: ["xxxxxxxxxxx", "yyyyyyyyyyy"],
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

/** URL / ID 文字列から YouTube 動画IDを抽出 */
export function parseYoutubeId(value?: string | null): string | null {
  const raw = value?.trim();
  if (!raw) return null;
  if (/^[\w-]{11}$/.test(raw)) return raw;

  try {
    const parsed = new URL(raw);
    if (parsed.hostname.includes("youtu.be")) {
      const id = parsed.pathname.split("/").filter(Boolean)[0];
      return id || null;
    }
    const v = parsed.searchParams.get("v");
    if (v) return v;
    const parts = parsed.pathname.split("/").filter(Boolean);
    const embedIndex = parts.indexOf("embed");
    if (embedIndex >= 0 && parts[embedIndex + 1]) {
      return parts[embedIndex + 1];
    }
    const shortsIndex = parts.indexOf("shorts");
    if (shortsIndex >= 0 && parts[shortsIndex + 1]) {
      return parts[shortsIndex + 1];
    }
  } catch {
    return null;
  }
  return null;
}

/**
 * 詳細ページ用の上下2本の動画ID。
 * 未設定時はデフォルトのテスト用動画IDを2本とも返します。
 */
export function getPluginVideoIds(plugin: PluginItem): [string, string] {
  const fromArray = plugin.youtubeUrls ?? [];
  const main =
    parseYoutubeId(plugin.mainVideoUrl) ||
    parseYoutubeId(fromArray[0]) ||
    parseYoutubeId(plugin.youtubeId) ||
    parseYoutubeId(plugin.youtubeUrl) ||
    defaultPluginVideoId;
  const sub =
    parseYoutubeId(plugin.subVideoUrl) ||
    parseYoutubeId(fromArray[1]) ||
    defaultPluginVideoId;
  return [main, sub];
}

/** @deprecated getPluginVideoIds を使用してください */
export function getPluginYoutubeId(plugin: PluginItem): string | null {
  return getPluginVideoIds(plugin)[0];
}

/** features を表示用の文字列配列に正規化 */
export function getPluginFeatures(plugin: PluginItem): string[] {
  if (Array.isArray(plugin.features)) {
    return plugin.features.filter(Boolean);
  }
  if (typeof plugin.features === "string" && plugin.features.trim()) {
    return plugin.features
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);
  }
  if (plugin.description?.trim()) {
    return plugin.description
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);
  }
  return [];
}

/** changelog を新しい日付優先で返す */
export function getPluginChangelog(plugin: PluginItem): PluginChangelogEntry[] {
  if (!plugin.changelog?.length) return [];
  return [...plugin.changelog].sort((a, b) => {
    if (a.date === b.date) return b.version.localeCompare(a.version, "ja");
    return a.date < b.date ? 1 : -1;
  });
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
