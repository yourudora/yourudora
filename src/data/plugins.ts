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
  /**
   * メモ欄タグ（Metaタグ）を使うプラグインの場合 true。
   * true のとき詳細ページにタグ自動生成ツールを表示します。
   */
  hasMetaTags?: boolean;
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
   * 詳細ページ左側・上段のローカル動画（自動再生・ミュート・ループ）。
   * public 配下のパス。例: "/videos/plugins/copyattack-preview.mp4"
   * 省略時は `/videos/plugins/{slug}-preview.mp4` を参照します。
   */
  previewVideoSrc?: string;
  /**
   * 詳細ページ左側・下段の使い方講座が準備済みなら true。
   * false / 未設定のときは「準備中」プレースホルダーを表示します。
   */
  tutorialVideoReady?: boolean;
  /**
   * @deprecated 上段は previewVideoSrc（ローカル動画）を使用してください。
   * 下段の YouTube 用に残しています。
   */
  mainVideoUrl?: string;
  /**
   * 詳細ページ左側・下段の動画（手動再生用・YouTube）。
   * tutorialVideoReady が true のときのみ使用します。
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
    title: "敵の技コピー",
    fileName: "CopyAttack.js",
    engine: "RPGツクールMZ",
    shortDescription:
      "敵・味方の技をコピーして覚えるバトルプラグイン。CopyAttack＋CopyGroup によるグループ限定にも対応。",
    description:
      "戦闘中にコピー用スキルを使うと、対象が持つスキルから選んでアクターに覚えさせられます。\n敵だけでなく味方からもコピーでき、<CopyAttack> と <CopyGroup> の併用によるグループ限定コピーにも対応します。",
    features: [
      "戦闘中に敵／味方の技をコピーし、アクターのコピー技として習得できる",
      "制限なしコピー（<CopyAttack>）と、グループ限定コピー（<CopyAttack>＋<CopyGroup:名前>）を使い分けできる",
      "効果範囲が全体のとき、対象全員の候補を1つの一覧にまとめて選べる",
      "1回の発動で複数技を選ぶ回数指定、必要HP割合、コピー除外などのメモ欄タグに対応",
      "技忘れスキル（グループ絞り込み可）・削除確認、プラグインコマンド操作に対応",
    ],
    help: `【概要】
戦闘中にコピー用スキルを使うと、対象が持つスキルから選んで
アクターに覚えさせられます。保持数には上限があり、技忘れスキルや
プラグインコマンドで整理できます。

【導入手順】
1. プラグイン管理で本プラグインをONにする
2. データベースでコピー用スキルを作成する
   ・敵から: 効果範囲「敵単体」「敵全体」など
   ・味方から: 効果範囲「味方単体」「味方全体」など
   ・制限なし: メモ欄に <CopyAttack>
   ・グループ限定: メモ欄に <CopyAttack> と <CopyGroup:グループ名> を併用
3. （任意）グループ限定コピーを使うとき
   ・候補にしたいスキルにも同じ <CopyGroup:グループ名> を書く
     （候補側には <CopyAttack> は付けない）
4. （任意）技忘れ用スキルを作成（効果範囲「なし」推奨）
   ・メモ欄に <CopyAttackForget> を書く
   ・特定グループだけ忘れさせたいときは <CopyGroup:グループ名> も併記
5. 戦闘でコピー用スキルを使い、覚える技を選ぶ

【メモ欄タグ】（タグ名はパラメータで変更可）
■ コピー実行スキル
  <CopyAttack>                 … 全スキル対象のコピー（グループ制限なし）
  <CopyAttack> <CopyGroup:A>   … グループ A 専用のコピー（※併用して記述）
  <CopyAttackCount:2>          … 1回の使用で選ぶ回数（<CopyCount:n> でも可）
■ コピーされるスキル
  <CopyGroup:A>                … グループ A に所属するスキル
  タグなし                     … 通常スキル（制限なし <CopyAttack> からのみコピー可）
  <NoCopyAttack>               … コピー禁止
■ コピー技忘れスキル
  <CopyAttackForget>           … 保持中のコピー技を忘れる
  <CopyAttackForget> <CopyGroup:A>
                               … グループ A のコピー技だけ忘れる（※併用）
■ 敵キャラ
  <CopyAttackHpRate:30>        … HPが最大の30%以下になるまでコピー不可

※ グループ指定はすべて <CopyGroup:名前> で行います。
   <CopyAttackGroup> や <CopyAttack:名前> は使いません。
※ コピー実行スキルには必ず <CopyAttack> が必要です。
※ グループ名は日本語でも可（例: 青魔法 / ラーニング）。
※ 覚えた技の保持は共通の1つの上限（パラメータ「コピー技の最大保持数」）です。

【グループによる候補の制限（任意）】
・制限なし: コピー用スキルに <CopyAttack> → タグなしスキルも候補
・グループ限定: コピー用スキルに <CopyAttack> と <CopyGroup:A> を併用
  → 同じ <CopyGroup:A> があるスキルだけ候補（タグなしは不可）

【技忘れとグループ】
・技忘れは「コピーで覚えた技」だけが対象（通常習得スキルは消えません）
・<CopyAttackForget> のみ → 全コピー技が対象
・<CopyAttackForget> + <CopyGroup:A> → グループ A のコピー技だけ対象

【仕様メモ】
・コピー実行には <CopyAttack> が必須です（<CopyGroup> 単体では実行しません）
・グループ限定コピーでは、候補スキル側にも同じ <CopyGroup:名前> が必要です
・候補側の <CopyGroup:名前> だけでは通常スキル扱いです（コピー実行にはなりません）
・効果範囲が全体のとき、対象全員の候補スキルを1つの一覧にまとめます
・コピー技が上限のあいだは、コピー用スキルは使用できません
・敵対象: 敵の行動パターンのスキルが候補
・味方対象: その味方が習得中のスキルが候補
・オートバトルや混乱時はUIを出さず、候補からランダムに覚えます
・1回のコピー回数が2以上でも、候補が1つあれば使用可能（実際の回数は候補数までに自動調整）
・技忘れ時は確認ウィンドウを表示（初期カーソルは「いいえ」）
・コピー用スキルは戦闘中専用です（メニューからは使用できません）

【プラグインコマンド】
- LearnCopiedSkillByPlayer … プレイヤー選択でコピー技を追加（フィルタグループ可）
- LearnCopiedSkillFromListByPlayer … 指定リストから選択・習得
- AddCopiedSkillDirect … 自動追加（画面なし）
- ForgetCopiedSkillByPlayer … プレイヤー選択で削除（フィルタグループ可）
- RemoveCopiedSkillDirect … 自動削除（画面なし）
- SetMaxCopiedSkills … 最大保持数を変更（セーブ対応）

【主なパラメータ】
\`copySkillId\` … コピー用スキル（0ならメモタグのみ）
\`maxCopiedSkills\` … コピー技の最大保持数（デフォルト 5）
\`defaultCopyCount\` … 1回あたりのコピー選択回数（デフォルト 1）
\`copyGroupMetaTag\` … グループ指定タグ名（デフォルト CopyGroup）
\`defaultRequiredHpRate\` … デフォルト必要HP割合（100で制限なし）

ライセンス: MIT（商用・改変・再配布可／クレジット任意）`,
    changelog: [
      {
        version: "Ver 1.0.0",
        date: "2026-08-06",
        description: "初版リリース（新規公開）",
      },
    ],
    downloadHref: "/downloads/CopyAttack.zip",
    sourceHref: "/sources/CopyAttack.js",
    donationHref: ofuseDonationHref,
    category: "バトル系",
    updatedAt: "2026-08-06",
    hasMetaTags: true,
    // image: "/images/plugins/copyattack.webp",
    imageAlt: "敵の技コピーのアイキャッチ画像",
    // 上段ローカル動画: public/videos/plugins/copyattack-preview.mp4 を配置
    previewVideoSrc: "/videos/plugins/copyattack-preview.mp4",
    // 下段の使い方講座は準備中（プレースホルダー表示）
    tutorialVideoReady: false,
    // subVideoUrl: "https://www.youtube.com/watch?v=yyyyyyyyyyy",
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

/** 詳細ページ上段のローカル動画パス */
export function getPluginPreviewVideoSrc(plugin: PluginItem): string {
  return plugin.previewVideoSrc?.trim() || `/videos/plugins/${plugin.slug}-preview.mp4`;
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
