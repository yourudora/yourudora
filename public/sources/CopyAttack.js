//=============================================================================
// CopyAttack.js
//=============================================================================
/*:
 * @target MZ
 * @plugindesc 敵の技コピープラグイン
 * @author ユルドラ
 * @license MIT
 * @help CopyAttack.js
 *
 * 戦闘中にコピー用スキルを使うと、対象が持つスキルから選んで
 * アクターに覚えさせられます。保持数には上限があり、技忘れスキルや
 * プラグインコマンドで整理できます。
 *
 * ---------------------------------------------------------------------------
 * ■ 導入手順
 * ---------------------------------------------------------------------------
 * 1. プラグイン管理で本プラグインをONにする
 * 2. データベースでコピー用スキルを作成する
 *    ・敵から: 効果範囲「敵単体」「敵全体」など
 *    ・味方から: 効果範囲「味方単体」「味方全体」など
 *    ・制限なし: メモ欄に <CopyAttack>
 *    ・グループ限定: メモ欄に <CopyGroup:グループ名> だけ書く（CopyAttack は不要）
 * 3. （任意）グループ限定コピーを使うとき
 *    ・候補にしたいスキルにも同じ <CopyGroup:グループ名> を書く
 * 4. （任意）技忘れ用スキルを作成（効果範囲「なし」推奨）
 *    ・メモ欄に <CopyAttackForget> を書く
 *    ・特定グループだけ忘れさせたいときは <CopyGroup:グループ名> も併記
 * 5. 戦闘でコピー用スキルを使い、覚える技を選ぶ
 *
 * ---------------------------------------------------------------------------
 * ■ メモ欄タグ
 * ---------------------------------------------------------------------------
 * 【コピー実行スキル】
 *   <CopyAttack>                 全スキル対象のコピー（グループ制限なし）
 *   <CopyGroup:A>                グループ A 専用のコピー
 *                                ※この場合 <CopyAttack> の併記は不要です
 *   <CopyAttackCount:2>          1回の使用で選ぶ回数（<CopyCount:n> でも可）
 *
 * 【コピーされるスキル】
 *   <CopyGroup:A>                グループ A に所属するスキル
 *   タグなし                     通常スキル（<CopyAttack> からのみコピー可）
 *   <NoCopyAttack>               コピー禁止
 *
 * 【コピー技忘れスキル】
 *   <CopyAttackForget>           保持中のコピー技を忘れる
 *   <CopyGroup:A>                （任意）グループ A のコピー技だけ忘れる
 *                                ※ <CopyAttackForget> と併記。無いときは全コピー技が対象
 *
 * 【敵キャラ】
 *   <CopyAttackHpRate:30>        HPが最大の30%以下になるまでコピー不可
 *
 * ---------------------------------------------------------------------------
 * ■ グループによる候補の制限（任意）
 * ---------------------------------------------------------------------------
 * グループ指定はすべて <CopyGroup:名前> で行います。
 * <CopyAttackGroup> や <CopyAttack:名前> は使いません。
 *
 * 【制限なし（基本）】
 *   コピー用スキル … <CopyAttack>
 *   ファイア       … タグなし
 *   → ファイアはコピー候補になります（NoCopyAttack 等が無い限り）
 *
 * 【グループで限定する】
 *   コピー用スキル … <CopyGroup:A>     （CopyAttack は書かない）
 *   ファイア       … <CopyGroup:A>  → コピー可
 *   ヒール         … <CopyGroup:B>  → コピー不可（不一致）
 *   サンダー       … タグなし       → コピー不可（グループコピーではタグ必須）
 *
 * ---------------------------------------------------------------------------
 * ■ 技忘れとグループ
 * ---------------------------------------------------------------------------
 * 技忘れは「コピーで覚えた技」だけが対象です（通常習得スキルは消えません）。
 *
 * 【全コピー技を対象（デフォルト）】
 *   技忘れスキル … <CopyAttackForget>
 *   → 保持中のコピー技すべてが一覧に出ます
 *
 * 【グループ A だけ忘れる】
 *   技忘れスキル … <CopyAttackForget>
 *                   <CopyGroup:A>
 *   → <CopyGroup:A> が付いたコピー技だけが一覧に出ます
 *   → グループ B やタグなしのコピー技はそのまま残ります
 *
 * 【プラグインコマンド例】ForgetCopiedSkillByPlayer
 *   ・対象アクター … 1
 *   ・フィルタグループ … A（空欄なら全コピー技）
 *
 * ※ 覚えた技の保持は共通の1つの上限（パラメータ「コピー技の最大保持数」）です。
 * ※ グループ名は日本語でも構いません（例: 青魔法 / ラーニング）。
 * ※ タグ名はプラグインパラメータで変更できます。
 *
 * ---------------------------------------------------------------------------
 * ■ 仕様メモ
 * ---------------------------------------------------------------------------
 * ・<CopyAttack> はグループ制限なし。<CopyGroup:名前> 単体はグループ限定コピーです
 * ・グループ限定コピーでは、候補スキル側にも同じ <CopyGroup:名前> が必要です
 * ・NoCopyAttack が付いたスキルは、グループに関係なくコピーできません
 * ・技忘れに CopyGroup を書くと、そのグループのコピー技だけが忘却対象です
 * ・技忘れに CopyGroup が無いときは、全コピー技が忘却対象です
 * ・効果範囲が全体のとき、対象全員の候補スキルを1つの一覧にまとめて表示します
 * ・コピー技が上限のあいだは、コピー用スキルは使用できません
 * ・コピーできる技がない対象は選べません
 * ・敵対象: 敵の行動パターンのスキルが候補
 * ・味方対象: その味方が習得中のスキルが候補
 * ・オートバトルや混乱時はUIを出さず、候補からランダムに覚えます
 * ・1回のコピー回数が2以上でも、候補が1つあれば使用可能（実際の回数は候補数までに自動調整）
 * ・技忘れ時は確認ウィンドウを表示（初期カーソルは「いいえ」）
 * ・保持データはスキルIDの数値配列としてセーブされます
 * ・コピー用スキルは戦闘中専用です（メニューからは使用できません）
 *
 * ---------------------------------------------------------------------------
 * ■ 利用規約
 * ---------------------------------------------------------------------------
 * ・本プラグインは MIT ライセンスです
 * 商用利用：可能
 * 改変：可能
 * 再配布：可能
 * クレジット：任意
 *
 * ---------------------------------------------------------------------------
 * ■ プラグインコマンド
 * ---------------------------------------------------------------------------
 * イベントの「プラグインコマンド」から呼び出します。
 *
 * 【コピー技を選んで覚える】LearnCopiedSkillByPlayer
 *   ・対象アクター … 0ならパーティ先頭
 *   ・フィルタグループ … 空欄なら制限なし。例: A
 *
 * 【リストからコピー技を選んで覚える】LearnCopiedSkillFromListByPlayer
 *   ・対象アクター / スキルリスト / フィルタグループ
 *
 * 【コピー技を自動で覚える】AddCopiedSkillDirect
 *   ・対象アクター / 覚えるスキル
 *
 * 【コピー技を選んで忘れる】ForgetCopiedSkillByPlayer
 *   ・対象アクター … 0ならパーティ先頭
 *   ・フィルタグループ … 空欄なら全コピー技。例: A
 *
 * 【コピー技を自動で忘れる】RemoveCopiedSkillDirect
 *   ・対象アクター / 忘れるスキル
 *
 * 【コピー技の最大保持数を変える】SetMaxCopiedSkills
 *   ・対象アクター … 0ならパーティ全員
 *   ・新しい最大保持数
 *
 * @param basicSettings
 * @text ■ 基本設定
 *
 * @param copySkillId
 * @text コピー用スキル
 * @desc 技コピーを開始するスキル。0のときはメモ欄タグのみで判定します。
 * @type skill
 * @parent basicSettings
 * @default 0
 *
 * @param copySkillMetaTag
 * @text コピー用スキルのメモタグ名
 * @desc パラメータなしの <CopyAttack> として使います。グループ名は付けません。
 * @parent basicSettings
 * @default CopyAttack
 *
 * @param forgetSkillId
 * @text 技忘れ用スキル
 * @desc コピー技を忘れるスキル。0のときはメモ欄タグのみで判定します。
 * @type skill
 * @parent basicSettings
 * @default 0
 *
 * @param forgetSkillMetaTag
 * @text 技忘れ用スキルのメモタグ名
 * @desc スキルメモ欄のタグ名。通常は変更不要です。
 * @parent basicSettings
 * @default CopyAttackForget
 *
 * @param maxCopiedSkills
 * @text コピー技の最大保持数
 * @desc 1人あたりのコピー技の上限（初期値）。プラグインコマンドでも変更できます。
 * @type number
 * @min 1
 * @max 99
 * @parent basicSettings
 * @default 5
 *
 * @param excludeBasicSkills
 * @text 通常攻撃・防御をコピー対象外にする
 * @desc ONで通常攻撃(ID1)・防御(ID2)を候補から外します。
 * @type boolean
 * @parent basicSettings
 * @default true
 *
 * @param defaultCopyCount
 * @text 1回あたりのコピー選択回数
 * @desc コピー用スキル1回で選べる技の数。スキルのメモタグで上書きできます。
 * @type number
 * @min 1
 * @max 99
 * @parent basicSettings
 * @default 1
 *
 * @param copyCountMetaTag
 * @text コピー回数のメモタグ名
 * @desc 例: <CopyAttackCount:2> 。別名 <CopyCount:n> も読めます。
 * @parent basicSettings
 * @default CopyAttackCount
 *
 * @param tagSettings
 * @text ■ メモ欄タグ・制限
 *
 * @param copyGroupMetaTag
 * @text グループ指定タグ名
 * @desc 例: <CopyGroup:A> 。コピー実行・候補所属・技忘れ絞り込みで共通に使います。
 * @parent tagSettings
 * @default CopyGroup
 *
 * @param copyableSkillMetaTag
 * @text コピー可能スキルタグ名（絞り込み）
 * @desc 空欄＝候補を制限しない。入力すると、そのタグがあるスキルだけ候補になります。
 * @parent tagSettings
 * @default
 *
 * @param uncopyableSkillMetaTag
 * @text コピー不可スキルタグ名
 * @desc このタグがあるスキルはコピー候補に出ません。
 * @parent tagSettings
 * @default NoCopyAttack
 *
 * @param defaultRequiredHpRate
 * @text デフォルト必要HP割合(%)
 * @desc 敵メモ未指定時の条件。現在HPがこの%以下ならコピー可。100で制限なし。
 * @type number
 * @min 1
 * @max 100
 * @parent tagSettings
 * @default 100
 *
 * @param requiredHpRateMetaTag
 * @text 必要HP割合のメモタグ名
 * @desc 敵メモ欄のタグ名。例: <CopyAttackHpRate:30>
 * @parent tagSettings
 * @default CopyAttackHpRate
 *
 * @param animationSettings
 * @text ■ 成功時アニメーション
 *
 * @param successAnimationId
 * @text コピー成功時のアニメーション
 * @desc コピー成功時に再生。0で再生しません。
 * @type animation
 * @parent animationSettings
 * @default 0
 *
 * @param successAnimationTarget
 * @text アニメーションの再生対象
 * @desc 成功アニメの表示対象です。
 * @type select
 * @option 使用者（アクター）
 * @value actor
 * @option コピー元（対象）
 * @value enemy
 * @parent animationSettings
 * @default actor
 *
 * @param selectWindow
 * @text ■ 覚える技の選択ウィンドウ
 *
 * @param selectWindowX
 * @text ウィンドウ X
 * @desc -1で標準位置。
 * @type number
 * @min -9999
 * @parent selectWindow
 * @default -1
 *
 * @param selectWindowY
 * @text ウィンドウ Y
 * @desc -1で標準位置。
 * @type number
 * @min -9999
 * @parent selectWindow
 * @default -1
 *
 * @param selectWindowWidth
 * @text ウィンドウ幅
 * @desc 0で標準幅。
 * @type number
 * @min 0
 * @parent selectWindow
 * @default 0
 *
 * @param selectWindowHeight
 * @text ウィンドウ高さ
 * @desc 0で標準高さ（行数指定時は行数優先）。
 * @type number
 * @min 0
 * @parent selectWindow
 * @default 0
 *
 * @param selectWindowRows
 * @text 表示行数
 * @desc 0で高さから自動計算。
 * @type number
 * @min 0
 * @parent selectWindow
 * @default 0
 *
 * @param selectWindowCols
 * @text 表示列数
 * @desc 一覧の列数です。
 * @type number
 * @min 1
 * @parent selectWindow
 * @default 1
 *
 * @param discardWindow
 * @text ■ 忘れる技の選択ウィンドウ
 *
 * @param discardWindowX
 * @text ウィンドウ X
 * @desc -1で標準位置。
 * @type number
 * @min -9999
 * @parent discardWindow
 * @default -1
 *
 * @param discardWindowY
 * @text ウィンドウ Y
 * @desc -1で標準位置。
 * @type number
 * @min -9999
 * @parent discardWindow
 * @default -1
 *
 * @param discardWindowWidth
 * @text ウィンドウ幅
 * @desc 0で標準幅。
 * @type number
 * @min 0
 * @parent discardWindow
 * @default 0
 *
 * @param discardWindowHeight
 * @text ウィンドウ高さ
 * @desc 0で標準高さ（行数指定時は行数優先）。
 * @type number
 * @min 0
 * @parent discardWindow
 * @default 0
 *
 * @param discardWindowRows
 * @text 表示行数
 * @desc 0で高さから自動計算。
 * @type number
 * @min 0
 * @parent discardWindow
 * @default 0
 *
 * @param discardWindowCols
 * @text 表示列数
 * @desc 一覧の列数です。
 * @type number
 * @min 1
 * @parent discardWindow
 * @default 1
 *
 * @param confirmWindow
 * @text ■ 削除確認ウィンドウ
 *
 * @param confirmMessage
 * @text 確認メッセージ
 * @desc 忘れる直前にヘルプへ表示する文章。
 * @parent confirmWindow
 * @default 本当に消しますか？
 *
 * @param confirmYesText
 * @text 「はい」の表示名
 * @desc 削除する選択肢の表示名。
 * @parent confirmWindow
 * @default はい
 *
 * @param confirmNoText
 * @text 「いいえ」の表示名
 * @desc やめる選択肢の表示名。開いた直後に選択されます。
 * @parent confirmWindow
 * @default いいえ
 *
 * @command LearnCopiedSkillByPlayer
 * @text コピー技を選んで覚える
 * @desc 画面で技を選んでコピー技として覚えます。上限時は開きません。
 *
 * @arg actorId
 * @text 対象アクター
 * @desc 0のときはパーティ先頭です。
 * @type actor
 * @default 1
 *
 * @arg groupId
 * @text フィルタグループ
 * @desc 空欄なら制限なし。候補を <CopyGroup:名前> で絞るときのグループ名。例: A
 * @default
 *
 * @command LearnCopiedSkillFromListByPlayer
 * @text リストからコピー技を選んで覚える
 * @desc 指定スキル一覧から選んで覚えます。上限時は開きません。
 *
 * @arg actorId
 * @text 対象アクター
 * @desc 0のときはパーティ先頭です。
 * @type actor
 * @default 1
 *
 * @arg skillIds
 * @text 選べるスキル一覧
 * @desc 選択肢として表示するスキルです。
 * @type skill[]
 * @default []
 *
 * @arg groupId
 * @text フィルタグループ
 * @desc 空欄なら制限なし。リスト内をさらに <CopyGroup:名前> で絞るときのグループ名。
 * @default
 *
 * @command AddCopiedSkillDirect
 * @text コピー技を自動で覚える
 * @desc 画面なしで指定スキルを追加します。上限・重複時は何もしません。
 *
 * @arg actorId
 * @text 対象アクター
 * @desc 0のときはパーティ先頭です。
 * @type actor
 * @default 1
 *
 * @arg skillId
 * @text 覚えるスキル
 * @desc 追加するスキルです。
 * @type skill
 * @default 1
 *
 * @command ForgetCopiedSkillByPlayer
 * @text コピー技を選んで忘れる
 * @desc 保持中のコピー技から選んで忘れます。グループ指定時はそのグループのみ。
 *
 * @arg actorId
 * @text 対象アクター
 * @desc 0のときはパーティ先頭です。
 * @type actor
 * @default 1
 *
 * @arg groupId
 * @text フィルタグループ
 * @desc 空欄なら全コピー技。<CopyGroup:名前> と同じグループ名を指定。例: A
 * @default
 *
 * @command RemoveCopiedSkillDirect
 * @text コピー技を自動で忘れる
 * @desc 画面なしで指定スキルを削除します。未保持なら何もしません。
 *
 * @arg actorId
 * @text 対象アクター
 * @desc 0のときはパーティ先頭です。
 * @type actor
 * @default 1
 *
 * @arg skillId
 * @text 忘れるスキル
 * @desc 削除するスキルです。
 * @type skill
 * @default 1
 *
 * @command SetMaxCopiedSkills
 * @text コピー技の最大保持数を変える
 * @desc コピー技の上限を変更します。セーブデータに保存されます。
 *
 * @arg actorId
 * @text 対象アクター
 * @desc 0のときはパーティ全員です。
 * @type actor
 * @default 0
 *
 * @arg maxCount
 * @text 新しい最大保持数
 * @desc 1〜99で指定します。
 * @type number
 * @min 1
 * @max 99
 * @default 5
 */

(() => {
    "use strict";

    // CopyAttack の公開API
    const CopyAttack = (window.CopyAttack = window.CopyAttack || {});
    if (CopyAttack.__loaded) {
        return;
    }
    CopyAttack.__loaded = true;

    function pluginName() {
        const script = document.currentScript;
        if (!script || !script.src) {
            return "CopyAttack";
        }
        const matched = script.src.match(/([^/\\]+\.js)/);
        if (!matched) {
            return "CopyAttack";
        }
        return decodeURIComponent(matched[1]).replace(/\.js$/i, "");
    }

    /**
     * @param {object} params
     * @param {string} key
     * @param {number} defaultValue
     * @returns {number}
     */
    function numberParam(params, key, defaultValue) {
        if (params[key] === undefined || params[key] === "") {
            return defaultValue;
        }
        const value = Number(params[key]);
        return Number.isNaN(value) ? defaultValue : value;
    }

    /**
     * @returns {object}
     */
    function loadParameters() {
        const params = PluginManager.parameters(pluginName());
        return {
            copySkillId: numberParam(params, "copySkillId", 0),
            copySkillMetaTag: String(params.copySkillMetaTag || "CopyAttack"),
            forgetSkillId: numberParam(params, "forgetSkillId", 0),
            forgetSkillMetaTag: String(params.forgetSkillMetaTag || "CopyAttackForget"),
            copyGroupMetaTag: String(params.copyGroupMetaTag || "CopyGroup"),
            copyableSkillMetaTag: String(params.copyableSkillMetaTag || ""),
            uncopyableSkillMetaTag: String(params.uncopyableSkillMetaTag || "NoCopyAttack"),
            defaultRequiredHpRate: Math.max(
                1,
                Math.min(100, numberParam(params, "defaultRequiredHpRate", 100))
            ),
            requiredHpRateMetaTag: String(params.requiredHpRateMetaTag || "CopyAttackHpRate"),
            maxCopiedSkills: numberParam(params, "maxCopiedSkills", 5),
            excludeBasicSkills: params.excludeBasicSkills !== "false",
            defaultCopyCount: Math.max(1, Math.min(99, numberParam(params, "defaultCopyCount", 1))),
            copyCountMetaTag: String(params.copyCountMetaTag || "CopyAttackCount"),
            successAnimationId: numberParam(params, "successAnimationId", 0),
            successAnimationTarget: String(params.successAnimationTarget || "actor"),
            selectWindowX: numberParam(params, "selectWindowX", -1),
            selectWindowY: numberParam(params, "selectWindowY", -1),
            selectWindowWidth: numberParam(params, "selectWindowWidth", 0),
            selectWindowHeight: numberParam(params, "selectWindowHeight", 0),
            selectWindowRows: numberParam(params, "selectWindowRows", 0),
            selectWindowCols: Math.max(1, numberParam(params, "selectWindowCols", 1)),
            discardWindowX: numberParam(params, "discardWindowX", -1),
            discardWindowY: numberParam(params, "discardWindowY", -1),
            discardWindowWidth: numberParam(params, "discardWindowWidth", 0),
            discardWindowHeight: numberParam(params, "discardWindowHeight", 0),
            discardWindowRows: numberParam(params, "discardWindowRows", 0),
            discardWindowCols: Math.max(1, numberParam(params, "discardWindowCols", 1)),
            confirmMessage: String(params.confirmMessage || "本当に消しますか？"),
            confirmYesText: String(params.confirmYesText || "はい"),
            confirmNoText: String(params.confirmNoText || "いいえ"),
        };
    }

    CopyAttack.params = loadParameters();
    CopyAttack.DEFAULT_GROUP = "default";
    /** コピー選択ウィンドウ開放直後の決定入力ガード（フレーム数） */
    CopyAttack.INPUT_GUARD_FRAMES = 12;
    CopyAttack.PHASE = "copyAttackSelect";
    CopyAttack.MODE_NONE = "";
    CopyAttack.MODE_COPY = "copy";
    CopyAttack.MODE_FORGET = "forget";

    /** @type {Game_Actor|null} */
    CopyAttack._pendingActor = null;
    /** @type {Game_Battler[]} */
    CopyAttack._pendingSources = [];
    /** @type {Game_Battler|null} */
    CopyAttack._pendingTarget = null;
    /** @type {string} */
    CopyAttack._pendingGroup = CopyAttack.DEFAULT_GROUP;
    /** @type {string|null} コピー候補のフィルタグループ。null なら制限なし */
    CopyAttack._pendingFilterGroup = null;
    /** @type {number} */
    CopyAttack._pendingCopyRemain = 1;
    /** @type {number} */
    CopyAttack._pendingCopyTotal = 1;
    /** @type {number[]} この選択セッションで既に選んだスキルID */
    CopyAttack._pendingPickedIds = [];
    /** @type {number[]} */
    CopyAttack._pendingCandidateIds = [];
    /** @type {object|null} */
    CopyAttack._pendingCopySkill = null;
    /** @type {string} */
    CopyAttack._pendingMode = CopyAttack.MODE_NONE;
    /** @type {object|null} */
    CopyAttack._pendingForgetSkill = null;
    /** @type {string|null} 技忘れのグループ。null なら全グループ */
    CopyAttack._pendingForgetGroup = null;
    /** @type {boolean} */
    CopyAttack._forgetFromInput = false;
    /** @type {Window_Selectable|null} */
    CopyAttack._helpOwner = null;

    /**
     * メモ欄に指定タグがあるか
     * @param {object} data
     * @param {string} tagName
     * @returns {boolean}
     */
    CopyAttack.hasMetaTag = function (data, tagName) {
        return !!(data && data.meta && tagName && data.meta[tagName] != null);
    };

    /**
     * メモ欄の数値タグを取得（無ければ null）
     * @param {object} data
     * @param {string} tagName
     * @returns {number|null}
     */
    CopyAttack.readMetaNumber = function (data, tagName) {
        if (!data || !data.meta || !tagName) {
            return null;
        }
        const raw = data.meta[tagName];
        if (raw == null || raw === true || raw === "") {
            return null;
        }
        const value = Number(raw);
        return Number.isNaN(value) ? null : value;
    };

    /**
     * グループ名を正規化（空・true は default）
     * 日本語など任意の名前をそのまま使えます（英字は小文字化して揺れを吸収）
     * 予約キー（__proto__ 等）は拒否して default に落とす
     * @param {*} raw
     * @returns {string}
     */
    CopyAttack.normalizeGroupId = function (raw) {
        if (raw == null || raw === true || raw === "") {
            return CopyAttack.DEFAULT_GROUP;
        }
        const text = String(raw).trim().toLowerCase();
        if (
            !text ||
            text === "__proto__" ||
            text === "constructor" ||
            text === "prototype"
        ) {
            return CopyAttack.DEFAULT_GROUP;
        }
        return text;
    };

    /**
     * グループ辞書用の安全な空オブジェクト
     * @returns {Object}
     */
    CopyAttack.createGroupMap = function () {
        return Object.create(null);
    };

    /**
     * 引数のフィルタグループ。空欄は null（制限なし）
     * @param {*} raw
     * @returns {string|null}
     */
    CopyAttack.parseFilterGroupArg = function (raw) {
        if (raw == null || String(raw).trim() === "") {
            return null;
        }
        return CopyAttack.normalizeGroupId(raw);
    };

    /**
     * 引数のグループ（互換用）。空欄は default。allowNull 時は空欄で null
     * @param {*} raw
     * @param {boolean} [allowNull]
     * @returns {string|null}
     */
    CopyAttack.parseGroupArg = function (raw, allowNull) {
        if (raw == null || String(raw).trim() === "") {
            return allowNull ? null : CopyAttack.DEFAULT_GROUP;
        }
        return CopyAttack.normalizeGroupId(raw);
    };

    /**
     * スキルID配列を数値の配列に正規化する（セーブ破損対策）
     * @param {*} list
     * @returns {number[]}
     */
    CopyAttack.normalizeSkillIdList = function (list) {
        if (!Array.isArray(list)) {
            return [];
        }
        const result = [];
        for (const entry of list) {
            let id = 0;
            if (typeof entry === "number") {
                id = entry;
            } else if (entry && typeof entry === "object") {
                id = Number(entry.id);
            } else {
                id = Number(entry);
            }
            id = Math.floor(id);
            if (id > 0 && Number.isFinite(id) && !result.includes(id)) {
                result.push(id);
            }
        }
        if (window.$dataSkills && $dataSkills.length > 1) {
            return result.filter((id) => !!$dataSkills[id]);
        }
        return result;
    };

    /**
     * メモ欄タグの値をグループ名として読む（空・true なら null）
     * @param {object|null} data
     * @param {string} tagName
     * @returns {string|null}
     */
    CopyAttack.readGroupMetaValue = function (data, tagName) {
        if (!data || !tagName || !CopyAttack.hasMetaTag(data, tagName)) {
            return null;
        }
        const raw = data.meta[tagName];
        if (raw == null || raw === true || String(raw).trim() === "") {
            return null;
        }
        return CopyAttack.normalizeGroupId(raw);
    };

    /**
     * コピー開始スキルか
     * ・<CopyAttack> … グループ制限なしのコピー
     * ・<CopyGroup:名前> … そのグループ専用のコピー（CopyAttack 併記不要）
     * ・技忘れスキルは除外
     * @param {object|null} skill
     * @returns {boolean}
     */
    CopyAttack.isCopySkill = function (skill) {
        if (!skill) {
            return false;
        }
        if (CopyAttack.isForgetSkill(skill)) {
            return false;
        }
        if (CopyAttack.params.copySkillId > 0 && skill.id === CopyAttack.params.copySkillId) {
            return true;
        }
        if (CopyAttack.hasMetaTag(skill, CopyAttack.params.copySkillMetaTag)) {
            return true;
        }
        // <CopyGroup:A> 単体でもコピー用スキル
        return !!CopyAttack.readGroupMetaValue(skill, CopyAttack.params.copyGroupMetaTag);
    };

    /**
     * コピー実行用として「開始スキル」扱いするか（canUse の制限用）
     * すでにコピーで覚えた技は通常使用するため除外する
     * @param {Game_Battler} user
     * @param {object|null} skill
     * @returns {boolean}
     */
    CopyAttack.isCopySkillForUse = function (user, skill) {
        if (!CopyAttack.isCopySkill(skill)) {
            return false;
        }
        if (user && user.isActor && user.isActor() && user.isCopiedSkill(skill.id)) {
            return false;
        }
        return true;
    };

    /**
     * コピー技の保管先ID（常にデフォルト。保管枠の分割は廃止）
     * @param {object|null} [_skill]
     * @returns {string}
     */
    CopyAttack.getCopyGroup = function (/* skill */) {
        return CopyAttack.DEFAULT_GROUP;
    };

    /**
     * コピー用スキル側のフィルタグループを取得する
     * <CopyGroup:A> → "a"
     * <CopyAttack> のみ（CopyGroup なし）→ null（制限なし）
     * @param {object|null} skill
     * @returns {string|null}
     */
    CopyAttack.getCopyFilterGroup = function (skill) {
        if (!skill) {
            return null;
        }
        return CopyAttack.readGroupMetaValue(skill, CopyAttack.params.copyGroupMetaTag);
    };

    /**
     * 候補スキルが属するフィルタグループを取得する
     * <CopyGroup:A> → "a" / タグ無し → null
     * @param {object|null} skill
     * @returns {string|null}
     */
    CopyAttack.getSkillBelongGroup = function (skill) {
        if (!skill) {
            return null;
        }
        return CopyAttack.readGroupMetaValue(skill, CopyAttack.params.copyGroupMetaTag);
    };

    /**
     * 候補スキルが、指定フィルタグループに属する（または制限なし）か
     * @param {object|null} skill
     * @param {string|null|undefined} filterGroup null/undefined なら常に許可
     * @returns {boolean}
     */
    CopyAttack.skillMatchesFilterGroup = function (skill, filterGroup) {
        if (filterGroup == null || filterGroup === "") {
            return true;
        }
        const belong = CopyAttack.getSkillBelongGroup(skill);
        if (belong == null) {
            return false;
        }
        return belong === CopyAttack.normalizeGroupId(filterGroup);
    };

    /** 技忘れスキルか */
    CopyAttack.isForgetSkill = function (skill) {
        if (!skill) {
            return false;
        }
        if (CopyAttack.params.forgetSkillId > 0 && skill.id === CopyAttack.params.forgetSkillId) {
            return true;
        }
        return CopyAttack.hasMetaTag(skill, CopyAttack.params.forgetSkillMetaTag);
    };

    /**
     * 技忘れスキル／コマンドが対象にするフィルタグループ
     * 技忘れ側の <CopyGroup:A> → "a" / タグ無し → null（全コピー技）
     * @param {object|null} skill 技忘れスキル（無い場合は null）
     * @returns {string|null}
     */
    CopyAttack.getForgetGroup = function (skill) {
        if (!skill) {
            return null;
        }
        return CopyAttack.readGroupMetaValue(skill, CopyAttack.params.copyGroupMetaTag);
    };

    /**
     * 技忘れ一覧用: コピーで保持中のスキルだけを返す（通常習得は含まない）
     * @param {Game_Actor|null} actor
     * @param {string|null} [filterGroup] null なら全コピー技
     * @returns {object[]}
     */
    CopyAttack.forgetableCopiedSkills = function (actor, filterGroup) {
        if (!actor) {
            return [];
        }
        return actor.copiedSkills(null).filter((skill) =>
            CopyAttack.skillMatchesFilterGroup(skill, filterGroup)
        );
    };

    /**
     * 技忘れ可能なコピー技が1つ以上あるか
     * @param {Game_Actor|null} actor
     * @param {string|null} [filterGroup]
     * @returns {boolean}
     */
    CopyAttack.hasForgetableCopiedSkills = function (actor, filterGroup) {
        return CopyAttack.forgetableCopiedSkills(actor, filterGroup).length > 0;
    };

    /**
     * 1回の使用で選べるコピー回数
     * @param {object|null} skill
     * @returns {number}
     */
    CopyAttack.getCopyCount = function (skill) {
        let value = CopyAttack.readMetaNumber(skill, CopyAttack.params.copyCountMetaTag);
        if (value == null) {
            value = CopyAttack.readMetaNumber(skill, "CopyCount");
        }
        if (value == null || value < 1) {
            value = CopyAttack.params.defaultCopyCount;
        }
        return Math.max(1, Math.min(99, Math.floor(value)));
    };

    /** 現在入力中の行動がコピー用スキルか */
    CopyAttack.isSelectingCopySkillTarget = function () {
        const action = BattleManager.inputtingAction && BattleManager.inputtingAction();
        if (!action || !action.item()) {
            return false;
        }
        const user =
            (BattleManager.actor && BattleManager.actor()) ||
            (action.subject && action.subject());
        return CopyAttack.isCopySkillForUse(user, action.item());
    };

    /**
     * 入力中／実行中のコピー技保管先（常にデフォルト）
     * @returns {string}
     */
    CopyAttack.currentCopyGroup = function () {
        return CopyAttack.DEFAULT_GROUP;
    };

    /**
     * 入力中／実行中のコピー用スキルのフィルタグループ（未指定なら null＝制限なし）
     * @returns {string|null}
     */
    CopyAttack.currentCopyFilterGroup = function () {
        if (CopyAttack._pendingMode === CopyAttack.MODE_COPY) {
            if (CopyAttack._pendingFilterGroup !== undefined) {
                return CopyAttack._pendingFilterGroup;
            }
            if (CopyAttack._pendingCopySkill) {
                return CopyAttack.getCopyFilterGroup(CopyAttack._pendingCopySkill);
            }
        }
        const input = BattleManager.inputtingAction && BattleManager.inputtingAction();
        if (input && input.item()) {
            const user =
                (BattleManager.actor && BattleManager.actor()) ||
                (input.subject && input.subject());
            if (CopyAttack.isCopySkillForUse(user, input.item())) {
                return CopyAttack.getCopyFilterGroup(input.item());
            }
        }
        const action = BattleManager._action;
        if (action && action.item() && BattleManager._subject) {
            if (CopyAttack.isCopySkillForUse(BattleManager._subject, action.item())) {
                return CopyAttack.getCopyFilterGroup(action.item());
            }
        }
        return null;
    };

    /**
     * 敵に必要なHP割合（%）。100以上なら制限なし
     * @param {Game_Enemy} enemy
     * @returns {number}
     */
    CopyAttack.getRequiredHpRatePercent = function (enemy) {
        const defaultRate = CopyAttack.params.defaultRequiredHpRate;
        if (!enemy || !enemy.enemy()) {
            return defaultRate;
        }
        const value = CopyAttack.readMetaNumber(
            enemy.enemy(),
            CopyAttack.params.requiredHpRateMetaTag
        );
        if (value == null) {
            return defaultRate;
        }
        return Math.max(0, Math.min(100, value));
    };

    /**
     * 敵のHP割合がコピー条件を満たすか
     * @param {Game_Enemy|null} enemy
     * @returns {boolean}
     */
    CopyAttack.meetsCopyHpRate = function (enemy) {
        if (!enemy || !enemy.isAlive()) {
            return false;
        }
        const percent = CopyAttack.getRequiredHpRatePercent(enemy);
        if (percent >= 100) {
            return true;
        }
        return enemy.hpRate() * 100 <= percent + 1e-6;
    };

    /**
     * コピー対象として有効なアクターを推定する（入力中／行動主体）
     * @returns {Game_Actor|null}
     */
    CopyAttack.resolveCopyUserActor = function () {
        if (BattleManager.actor && BattleManager.actor()) {
            return BattleManager.actor();
        }
        const action = BattleManager.inputtingAction && BattleManager.inputtingAction();
        if (action && action.subject && action.subject() && action.subject().isActor()) {
            return action.subject();
        }
        const subject = BattleManager._subject;
        if (subject && subject.isActor()) {
            return subject;
        }
        return null;
    };

    /**
     * コピー用スキルのターゲットとして選択可能か
     * @param {Game_Battler|null} target
     * @param {Game_Actor|null} [learner]
     * @param {string} [storageGroup]
     * @param {string|null} [filterGroup] undefined なら currentCopyFilterGroup()
     * @returns {boolean}
     */
    CopyAttack.canCopyTarget = function (target, learner, storageGroup, filterGroup) {
        if (!target || !target.isAlive()) {
            return false;
        }
        if (target.isEnemy() && !CopyAttack.meetsCopyHpRate(target)) {
            return false;
        }
        const storage = storageGroup || CopyAttack.currentCopyGroup();
        const filter =
            filterGroup !== undefined ? filterGroup : CopyAttack.currentCopyFilterGroup();
        const user = learner || CopyAttack.resolveCopyUserActor();
        if (user && user.isActor()) {
            return (
                CopyAttack.availableCopySkillIds(target, user, storage, filter).length > 0
            );
        }
        return CopyAttack.sourceCopySkillIds(target, filter).length > 0;
    };

    /**
     * コピー用スキルのスコープに応じて、有効なコピー対象が1体以上いるか
     * @param {Game_Actor} user
     * @param {object} skill
     * @returns {boolean}
     */
    CopyAttack.hasValidCopyTarget = function (user, skill) {
        // コピー処理は戦闘専用（メニュー等では使用不可）
        if (!$gameParty || !$gameParty.inBattle() || !$gameTroop) {
            return false;
        }
        if (!user || !skill) {
            return false;
        }
        const storage = CopyAttack.getCopyGroup(skill);
        const filter = CopyAttack.getCopyFilterGroup(skill);
        const action = new Game_Action(user);
        action.setItemObject(skill);
        // 使用可否判定時は単体でも「候補になり得る対象」を全員見る
        // （未選択の _lastTargetIndex に依存すると常に使用不可になる）
        const sources = CopyAttack.resolveCopySources(user, action, {
            forUsability: true
        });
        return sources.some((battler) =>
            CopyAttack.canCopyTarget(battler, user, storage, filter)
        );
    };

    // -------------------------------------------------------------------------
    // コピー用／技忘れスキルの使用可否
    // コピー用: 空き枠があり、候補技が1つ以上あれば使用可
    // （設定コピー回数が2以上でも、候補が1つなら使用可。実際の回数は min で調整）
    // -------------------------------------------------------------------------

    const _Game_BattlerBase_canUse = Game_BattlerBase.prototype.canUse;
    Game_BattlerBase.prototype.canUse = function (item) {
        if (!_Game_BattlerBase_canUse.call(this, item)) {
            return false;
        }
        if (!this.isActor() || !DataManager.isSkill(item)) {
            return true;
        }
        if (CopyAttack.isCopySkillForUse(this, item)) {
            const group = CopyAttack.getCopyGroup(item);
            // 保持枠が埋まっているときのみ不可
            if (this.isCopiedSkillFull(group)) {
                return false;
            }
            // 戦闘外ではコピー不可（コストだけ消費する事故を防ぐ）
            if (!$gameParty || !$gameParty.inBattle()) {
                return false;
            }
            // 候補が1つも無いときのみ不可（回数2以上でも候補1つなら可）
            if (!CopyAttack.hasValidCopyTarget(this, item)) {
                return false;
            }
        }
        if (CopyAttack.isForgetSkill(item)) {
            const filter = CopyAttack.getForgetGroup(item);
            if (!CopyAttack.hasForgetableCopiedSkills(this, filter)) {
                return false;
            }
        }
        return true;
    };

    // -------------------------------------------------------------------------
    // コピー用スキル適用時の戦闘ログ抑制
    // ダメージ／効果がないと result.success が立たず「効かなかった！」が出るため、
    // ヒット時は成功扱いにする
    // -------------------------------------------------------------------------

    const _Game_Action_apply = Game_Action.prototype.apply;
    /** @override */
    Game_Action.prototype.apply = function (target) {
        _Game_Action_apply.call(this, target);
        const item = this.item();
        if (!CopyAttack.isCopySkillForUse(this.subject(), item)) {
            return;
        }
        const result = target.result();
        if (result.isHit()) {
            this.makeSuccess(target);
        }
    };

    /**
     * コピー候補として有効なスキルか（敵／味方共通）
     *
     * 判定の流れ:
     *  1. 基本除外（攻撃/防御・CopyAttack付き実行スキル・技忘れ・使用不可）
     *  2. コピー禁止タグ（uncopyableSkillMetaTag / NoCopyAttack）→ 常に除外
     *  3. 任意の絞り込みタグ（copyableSkillMetaTag）
     *  4. フィルタグループ（filterGroup 指定時のみ）
     *     - null/省略 → グループ制限なし
     *     - 指定あり → 候補に <CopyGroup:同名> が必要
     *  ※候補側の <CopyGroup> だけでは除外しない（所属タグとして必要）
     *
     * @param {object|null} skill コピーされる側のスキル
     * @param {string|null} [filterGroup] フィルタグループ。null/省略で制限なし
     * @returns {boolean}
     */
    CopyAttack.isCopyableSkill = function (skill, filterGroup) {
        if (!skill) {
            return false;
        }
        if (CopyAttack.params.excludeBasicSkills && (skill.id === 1 || skill.id === 2)) {
            return false;
        }
        if (CopyAttack.isForgetSkill(skill)) {
            return false;
        }
        // <CopyAttack> 付きの実行スキル／パラメータ指定のコピー用スキルは候補外
        // （<CopyGroup> のみのスキルは候補になり得る）
        if (CopyAttack.hasMetaTag(skill, CopyAttack.params.copySkillMetaTag)) {
            return false;
        }
        if (
            CopyAttack.params.copySkillId > 0 &&
            skill.id === CopyAttack.params.copySkillId
        ) {
            return false;
        }
        // 3 = 使用不可（パッシブ扱いスキル等）
        if (skill.occasion === 3) {
            return false;
        }
        if (CopyAttack.hasMetaTag(skill, CopyAttack.params.uncopyableSkillMetaTag)) {
            return false;
        }
        const allowTag = CopyAttack.params.copyableSkillMetaTag;
        if (allowTag && !CopyAttack.hasMetaTag(skill, allowTag)) {
            return false;
        }
        if (!CopyAttack.skillMatchesFilterGroup(skill, filterGroup)) {
            return false;
        }
        return true;
    };

    /**
     * データベース上の手動習得候補スキルID一覧
     * @param {Game_Actor} actor
     * @param {string|null} [filterGroup] フィルタ。null なら制限なし
     * @returns {number[]}
     */
    CopyAttack.manualLearnSkillIds = function (actor, filterGroup) {
        if (!actor) {
            return [];
        }
        const storage = CopyAttack.DEFAULT_GROUP;
        const filter = filterGroup == null || filterGroup === "" ? null : filterGroup;
        const ids = [];
        for (let i = 1; i < $dataSkills.length; i++) {
            const skill = $dataSkills[i];
            if (
                skill &&
                CopyAttack.isCopyableSkill(skill, filter) &&
                actor.canAddCopiedSkill(skill.id, storage)
            ) {
                ids.push(i);
            }
        }
        return ids;
    };

    /**
     * プラグインコマンドの skill[] 引数をID配列へ変換
     * @param {string|number[]|*} raw
     * @returns {number[]}
     */
    CopyAttack.parseSkillIdList = function (raw) {
        if (raw == null || raw === "") {
            return [];
        }
        let list = raw;
        if (typeof raw === "string") {
            try {
                list = JSON.parse(raw);
            } catch (e) {
                list = String(raw).split(/[,:]/);
            }
        }
        if (!Array.isArray(list)) {
            list = [list];
        }
        const ids = [];
        for (const entry of list) {
            const id = Number(entry);
            if (id > 0 && !ids.includes(id) && $dataSkills[id]) {
                ids.push(id);
            }
        }
        return ids;
    };

    /**
     * アクターを取得する。0 ならパーティ先頭。見つからなければ null。
     * @param {number|string} actorId
     * @returns {Game_Actor|null}
     */
    CopyAttack.resolveActor = function (actorId) {
        if (!$gameActors || !$gameParty) {
            return null;
        }
        const id = Number(actorId);
        if (Number.isNaN(id) || id < 0) {
            return null;
        }
        if (id > 0) {
            return $gameActors.actor(id) || null;
        }
        return $gameParty.members()[0] || null;
    };

    /**
     * 最大保持数変更用。0 ならパーティ全員。
     * @param {number|string} actorId
     * @returns {Game_Actor[]}
     */
    CopyAttack.resolveActorsForMax = function (actorId) {
        if (!$gameActors || !$gameParty) {
            return [];
        }
        const id = Number(actorId);
        if (Number.isNaN(id) || id < 0) {
            return [];
        }
        if (id > 0) {
            const actor = $gameActors.actor(id);
            return actor ? [actor] : [];
        }
        return $gameParty.members().filter((a) => a && a.isActor());
    };

    /**
     * プラグインコマンド用の選択シーンを開く
     * @param {Function} SceneClass
     * @param {object} params
     */
    CopyAttack.pushCommandScene = function (SceneClass, params) {
        if (typeof SceneClass !== "function") {
            return;
        }
        CopyAttack._commandSceneParams = params || {};
        SceneManager.push(SceneClass);
        const interpreter = $gameMap && $gameMap._interpreter;
        if (interpreter && interpreter.isRunning()) {
            interpreter.setWaitMode("copyAttackCommand");
        }
    };

    /**
     * コピー用ウィンドウがヘルプを占有中か
     * @returns {boolean}
     */
    CopyAttack.isHelpLocked = function () {
        return !!CopyAttack._helpOwner;
    };

    /**
     * @param {Window_Selectable|null} owner
     */
    CopyAttack.setHelpOwner = function (owner) {
        CopyAttack._helpOwner = owner || null;
        if (owner) {
            owner._copyHelpIndex = null;
        }
    };

    /**
     * ヘルプ所有ウィンドウの説明を必要なときだけ更新する
     * （毎フレーム updateHelp しない）
     * @param {Window_Help|null} helpWindow
     */
    CopyAttack.refreshOwnedHelp = function (helpWindow) {
        const owner = CopyAttack._helpOwner;
        if (!owner || !owner.active || !helpWindow) {
            return;
        }
        helpWindow.visible = true;
        const index = typeof owner.index === "function" ? owner.index() : -1;
        if (owner._copyHelpIndex === index) {
            return;
        }
        owner._copyHelpIndex = index;
        if (typeof owner.updateHelp === "function") {
            owner.updateHelp();
        }
    };

    /**
     * @param {Window_Selectable} win
     * @returns {boolean}
     */
    CopyAttack.isHelpOwner = function (win) {
        return !!win && CopyAttack._helpOwner === win;
    };

    /**
     * 実際に選べる回数 = min(設定回数, 候補数, 空き枠)
     * @param {Game_Actor} actor
     * @param {string} group
     * @param {object|null} copySkill
     * @param {number} availableCount
     * @returns {number}
     */
    CopyAttack.clampCopySessionCount = function (actor, group, copySkill, availableCount) {
        const requested = CopyAttack.getCopyCount(copySkill);
        const available = Math.max(0, Number(availableCount) || 0);
        if (!actor || available <= 0) {
            return 0;
        }
        const freeSlots = Math.max(
            0,
            actor.maxCopiedSkills(group) - actor.copiedSkillIds(group).length
        );
        return Math.min(requested, available, freeSlots);
    };

    /**
     * @param {Game_Actor} actor
     * @param {Game_Battler[]} sources
     * @param {object} copySkill
     */
    CopyAttack.reserveCopySelect = function (actor, sources, copySkill) {
        const list = (sources || []).filter((b) => b && b.isAlive());
        const group = CopyAttack.getCopyGroup(copySkill);
        const filter = CopyAttack.getCopyFilterGroup(copySkill);
        CopyAttack._pendingActor = actor;
        CopyAttack._pendingSources = list;
        CopyAttack._pendingTarget = list[0] || null;
        CopyAttack._pendingGroup = group;
        CopyAttack._pendingFilterGroup = filter;
        CopyAttack._pendingCopySkill = copySkill || null;
        CopyAttack._pendingPickedIds = [];
        CopyAttack._pendingMode = CopyAttack.MODE_COPY;
        CopyAttack._pendingForgetSkill = null;
        CopyAttack._pendingForgetGroup = null;
        CopyAttack._forgetFromInput = false;
        CopyAttack.refreshPendingCandidates();
        const total = CopyAttack.clampCopySessionCount(
            actor,
            group,
            copySkill,
            CopyAttack._pendingCandidateIds.length
        );
        CopyAttack._pendingCopyTotal = Math.max(1, total);
        CopyAttack._pendingCopyRemain = total;
    };

    /**
     * 候補リストを「まだ覚えられる技」に更新（セッション中の選択済みを除外）
     */
    CopyAttack.refreshPendingCandidates = function () {
        const actor = CopyAttack._pendingActor;
        if (!actor) {
            CopyAttack._pendingCandidateIds = [];
            return;
        }
        const storage = CopyAttack._pendingGroup || CopyAttack.DEFAULT_GROUP;
        const filter = CopyAttack._pendingFilterGroup;
        const picked = CopyAttack._pendingPickedIds || [];
        const pickedSet = Object.create(null);
        for (let i = 0; i < picked.length; i++) {
            pickedSet[picked[i]] = true;
        }
        const ids = CopyAttack.mergeAvailableCopySkillIds(
            CopyAttack._pendingSources || [],
            actor,
            storage,
            filter
        ).filter((id) => !pickedSet[id]);
        CopyAttack._pendingCandidateIds = ids;
    };

    /**
     * 候補から1件だけ外す（全再検索より軽い）
     * @param {number} skillId
     */
    CopyAttack.removePendingCandidate = function (skillId) {
        const id = Number(skillId);
        const list = CopyAttack._pendingCandidateIds;
        if (!list || !list.length) {
            return;
        }
        const index = list.indexOf(id);
        if (index >= 0) {
            list.splice(index, 1);
        }
    };

    /**
     * 複数回コピーの選択セッションが継続中か
     * @returns {boolean}
     */
    CopyAttack.isCopySessionActive = function () {
        return (
            CopyAttack._pendingMode === CopyAttack.MODE_COPY &&
            !!CopyAttack._pendingActor &&
            CopyAttack._pendingCopyRemain > 0
        );
    };

    /**
     * まだ次の選択を続けるべきか（重い再検索はしない）
     * @returns {boolean}
     */
    CopyAttack.canContinueCopySession = function () {
        if (!CopyAttack.isCopySessionActive()) {
            return false;
        }
        const actor = CopyAttack._pendingActor;
        const group = CopyAttack._pendingGroup;
        if (!actor || actor.isCopiedSkillFull(group)) {
            return false;
        }
        return (CopyAttack._pendingCandidateIds || []).length > 0;
    };

    /**
     * @param {Game_Actor} actor
     * @param {object|null} forgetSkill
     * @param {boolean} fromInput
     */
    CopyAttack.reserveForgetSelect = function (actor, forgetSkill, fromInput) {
        CopyAttack._pendingActor = actor;
        CopyAttack._pendingSources = [];
        CopyAttack._pendingTarget = null;
        CopyAttack._pendingGroup = CopyAttack.DEFAULT_GROUP;
        CopyAttack._pendingFilterGroup = null;
        CopyAttack._pendingCopySkill = null;
        CopyAttack._pendingCopyTotal = 1;
        CopyAttack._pendingCopyRemain = 0;
        CopyAttack._pendingPickedIds = [];
        CopyAttack._pendingCandidateIds = [];
        CopyAttack._pendingMode = CopyAttack.MODE_FORGET;
        CopyAttack._pendingForgetSkill = forgetSkill || null;
        CopyAttack._pendingForgetGroup = CopyAttack.getForgetGroup(forgetSkill);
        CopyAttack._forgetFromInput = !!fromInput;
        CopyAttack._forgetCostPaid = false;
    };

    /**
     * 技忘れUI（戦闘入力中）を開いているか
     * @returns {boolean}
     */
    CopyAttack.isForgetSelectOpen = function () {
        return (
            CopyAttack._pendingMode === CopyAttack.MODE_FORGET && !!CopyAttack._pendingActor
        );
    };

    /** @returns {boolean} */
    CopyAttack.isSelectPhase = function () {
        return BattleManager._phase === CopyAttack.PHASE;
    };

    /** @returns {boolean} */
    CopyAttack.isForgetFromInput = function () {
        return CopyAttack._forgetFromInput;
    };

    /** @returns {Game_Actor|null} */
    CopyAttack.pendingActor = function () {
        return CopyAttack._pendingActor;
    };

    /** @returns {Game_Battler|null} */
    CopyAttack.pendingTarget = function () {
        return CopyAttack._pendingTarget;
    };

    /** @returns {Game_Battler[]} */
    CopyAttack.pendingSources = function () {
        return CopyAttack._pendingSources || [];
    };

    /** @returns {string} */
    CopyAttack.pendingGroup = function () {
        return CopyAttack._pendingGroup || CopyAttack.DEFAULT_GROUP;
    };

    /** @returns {number[]} */
    CopyAttack.pendingCandidateIds = function () {
        return CopyAttack._pendingCandidateIds || [];
    };

    /** @returns {number} */
    CopyAttack.pendingCopyRemain = function () {
        const value = Number(CopyAttack._pendingCopyRemain);
        return Number.isFinite(value) ? Math.max(0, value) : 0;
    };

    /** @returns {number} */
    CopyAttack.pendingCopyTotal = function () {
        const value = Number(CopyAttack._pendingCopyTotal);
        return Number.isFinite(value) ? Math.max(1, value) : 1;
    };

    /** @returns {string} */
    CopyAttack.pendingMode = function () {
        return CopyAttack._pendingMode;
    };

    /** @returns {object|null} */
    CopyAttack.pendingForgetSkill = function () {
        return CopyAttack._pendingForgetSkill;
    };

    /** @returns {string|null} */
    CopyAttack.pendingForgetGroup = function () {
        return CopyAttack._pendingForgetGroup;
    };

    CopyAttack.clearPending = function () {
        CopyAttack._pendingActor = null;
        CopyAttack._pendingSources = [];
        CopyAttack._pendingTarget = null;
        CopyAttack._pendingGroup = CopyAttack.DEFAULT_GROUP;
        CopyAttack._pendingFilterGroup = null;
        CopyAttack._pendingCopyTotal = 1;
        CopyAttack._pendingCopyRemain = 0;
        CopyAttack._pendingPickedIds = [];
        CopyAttack._pendingCandidateIds = [];
        CopyAttack._pendingCopySkill = null;
        CopyAttack._pendingMode = CopyAttack.MODE_NONE;
        CopyAttack._pendingForgetSkill = null;
        CopyAttack._pendingForgetGroup = null;
        CopyAttack._forgetFromInput = false;
        CopyAttack._forgetCostPaid = false;
    };

    /**
     * 直前の行動対象を、スキルの効果範囲に応じて敵／味方ユニットから解決する
     * @param {Game_Battler} subject
     * @returns {Game_Battler|null}
     */
    CopyAttack.resolveLastTarget = function (subject) {
        if (!subject) {
            return null;
        }
        const index = subject._lastTargetIndex;
        if (index == null || index < 0) {
            return null;
        }
        let unit = subject.opponentsUnit();
        const action = BattleManager._action;
        if (action && action.item()) {
            if (action.isForFriend()) {
                unit = subject.friendsUnit();
            } else if (action.isForOpponent()) {
                unit = subject.opponentsUnit();
            }
        }
        return unit.members()[index] || null;
    };

    /**
     * 効果範囲に応じたコピー元バトラー一覧（全体なら生存メンバー全員）
     * @param {Game_Battler} subject
     * @param {Game_Action} action
     * @param {{forUsability?: boolean}} [options]
     *   forUsability:true のとき、単体スコープでも対象ユニット生存者全員を返す
     *   （スキル使用可否判定用。実行時は従来どおり選択済み単体のみ）
     * @returns {Game_Battler[]}
     */
    CopyAttack.resolveCopySources = function (subject, action, options) {
        if (!subject || !action || !action.item()) {
            return [];
        }
        const forUsability = !!(options && options.forUsability);
        const aliveOk = (battler) => {
            if (!battler || !battler.isAlive()) {
                return false;
            }
            if (battler.isEnemy() && !CopyAttack.meetsCopyHpRate(battler)) {
                return false;
            }
            return true;
        };

        if (action.isForUser()) {
            return aliveOk(subject) ? [subject] : [];
        }
        if (action.isForEveryone && action.isForEveryone()) {
            const all = subject
                .opponentsUnit()
                .aliveMembers()
                .concat(subject.friendsUnit().aliveMembers());
            return all.filter(aliveOk);
        }
        if (action.isForOpponent()) {
            const members = subject.opponentsUnit().aliveMembers().filter(aliveOk);
            // 全体、または使用可否の単体プローブ
            if (!action.isForOne() || forUsability) {
                return members;
            }
            const one = CopyAttack.resolveLastTarget(subject);
            return one && aliveOk(one) ? [one] : [];
        }
        if (action.isForFriend()) {
            const members = subject.friendsUnit().aliveMembers().filter(aliveOk);
            if (!action.isForOne() || forUsability) {
                return members;
            }
            const one = CopyAttack.resolveLastTarget(subject);
            return one && aliveOk(one) ? [one] : [];
        }
        const one = CopyAttack.resolveLastTarget(subject);
        return one && aliveOk(one) ? [one] : [];
    };

    /**
     * 敵の行動パターンからコピー候補スキルIDを収集
     * @param {Game_Enemy} enemy
     * @param {string|null} [filterGroup] null ならグループ制限なし
     * @returns {number[]}
     */
    CopyAttack.enemyCopySkillIds = function (enemy, filterGroup) {
        if (!enemy || !enemy.enemy()) {
            return [];
        }
        const skillIds = [];
        for (const action of enemy.enemy().actions) {
            const skillId = action.skillId;
            if (skillId <= 0 || skillIds.includes(skillId)) {
                continue;
            }
            const skill = $dataSkills[skillId];
            if (CopyAttack.isCopyableSkill(skill, filterGroup)) {
                skillIds.push(skillId);
            }
        }
        return skillIds.sort((a, b) => a - b);
    };

    /**
     * 味方が習得中のスキルからコピー候補スキルIDを収集
     * @param {Game_Actor} actor
     * @param {string|null} [filterGroup] null ならグループ制限なし
     * @returns {number[]}
     */
    CopyAttack.actorCopySkillIds = function (actor, filterGroup) {
        if (!actor || !actor.isActor() || typeof actor.skills !== "function") {
            return [];
        }
        const skillIds = [];
        for (const skill of actor.skills()) {
            if (!skill || skillIds.includes(skill.id)) {
                continue;
            }
            if (CopyAttack.isCopyableSkill(skill, filterGroup)) {
                skillIds.push(skill.id);
            }
        }
        return skillIds.sort((a, b) => a - b);
    };

    /**
     * @param {Game_Battler} source
     * @param {string|null} [filterGroup]
     * @returns {number[]}
     */
    CopyAttack.sourceCopySkillIds = function (source, filterGroup) {
        if (!source) {
            return [];
        }
        if (source.isEnemy()) {
            return CopyAttack.enemyCopySkillIds(source, filterGroup);
        }
        if (source.isActor()) {
            return CopyAttack.actorCopySkillIds(source, filterGroup);
        }
        return [];
    };

    /**
     * 習得可能なコピー候補ID一覧
     * @param {Game_Battler} source
     * @param {Game_Actor} actor
     * @param {string} [storageGroup] 保管枠
     * @param {string|null} [filterGroup] フィルタ。undefined なら currentCopyFilterGroup()
     * @returns {number[]}
     */
    CopyAttack.availableCopySkillIds = function (source, actor, storageGroup, filterGroup) {
        if (!source || !actor) {
            return [];
        }
        const storage = CopyAttack.normalizeGroupId(storageGroup);
        const filter =
            filterGroup !== undefined ? filterGroup : CopyAttack.currentCopyFilterGroup();
        return CopyAttack.sourceCopySkillIds(source, filter).filter((skillId) =>
            actor.canAddCopiedSkill(skillId, storage)
        );
    };

    /**
     * 複数ソースの候補を重複なく統合
     * @param {Game_Battler[]} sources
     * @param {Game_Actor} actor
     * @param {string} [storageGroup]
     * @param {string|null} [filterGroup]
     * @returns {number[]}
     */
    CopyAttack.mergeAvailableCopySkillIds = function (
        sources,
        actor,
        storageGroup,
        filterGroup
    ) {
        if (!actor || !sources || sources.length === 0) {
            return [];
        }
        const storage = CopyAttack.normalizeGroupId(storageGroup);
        const filter =
            filterGroup !== undefined ? filterGroup : CopyAttack.currentCopyFilterGroup();
        const merged = [];
        const seen = Object.create(null);
        for (const source of sources) {
            if (!source) {
                continue;
            }
            for (const skillId of CopyAttack.availableCopySkillIds(
                source,
                actor,
                storage,
                filter
            )) {
                if (!seen[skillId]) {
                    seen[skillId] = true;
                    merged.push(skillId);
                }
            }
        }
        return merged.sort((a, b) => a - b);
    };

    /**
     * @param {Game_Actor} actor
     * @param {Game_Battler[]|Game_Battler} sources
     * @param {string} [storageGroup]
     * @param {string|null} [filterGroup]
     * @returns {boolean}
     */
    CopyAttack.needsCopySelect = function (actor, sources, storageGroup, filterGroup) {
        const list = Array.isArray(sources) ? sources : sources ? [sources] : [];
        return (
            CopyAttack.mergeAvailableCopySkillIds(list, actor, storageGroup, filterGroup)
                .length > 0
        );
    };

    /**
     * 選択UIを出せない状態か（オートバトル・混乱など）
     * @param {Game_Actor} actor
     * @returns {boolean}
     */
    CopyAttack.shouldSkipCopySelectUi = function (actor) {
        if (!actor || !actor.isActor()) {
            return true;
        }
        if (actor.isAutoBattle && actor.isAutoBattle()) {
            return true;
        }
        if (actor.isConfused && actor.isConfused()) {
            return true;
        }
        if (typeof actor.restriction === "function" && actor.restriction() >= 3) {
            return true;
        }
        return false;
    };

    /**
     * UIなしで候補からランダムに覚える（指定回数まで）
     * @param {Game_Actor} actor
     * @param {Game_Battler[]} sources
     * @param {object} copySkill
     * @returns {number} 習得できた数
     */
    CopyAttack.applyAutoCopy = function (actor, sources, copySkill) {
        if (!actor || !sources || !sources.length) {
            return 0;
        }
        const storage = CopyAttack.getCopyGroup(copySkill);
        const filter = CopyAttack.getCopyFilterGroup(copySkill);
        let ids = CopyAttack.mergeAvailableCopySkillIds(
            sources,
            actor,
            storage,
            filter
        );
        const count = CopyAttack.clampCopySessionCount(
            actor,
            storage,
            copySkill,
            ids.length
        );
        let learned = 0;
        for (let i = 0; i < count; i++) {
            if (!ids.length) {
                break;
            }
            const pick = Math.randomInt(ids.length);
            const skillId = ids[pick];
            ids.splice(pick, 1);
            if (actor.addCopiedSkill(skillId, storage)) {
                learned++;
            } else {
                break;
            }
        }
        if (learned > 0) {
            CopyAttack.playSuccessAnimation(actor, sources[0] || null);
        }
        return learned;
    };

    /**
     * @param {Game_Actor|null} actor
     * @param {Game_Battler|null} source
     */
    CopyAttack.playSuccessAnimation = function (actor, source) {
        const animationId = CopyAttack.params.successAnimationId;
        if (animationId <= 0) {
            return;
        }
        const target =
            CopyAttack.params.successAnimationTarget === "enemy" ? source : actor;
        if (!target) {
            return;
        }
        $gameTemp.requestAnimation([target], animationId);
    };

    /**
     * @param {Scene_Base} scene
     * @param {"select"|"discard"} type
     * @returns {Rectangle}
     */
    CopyAttack.makeWindowRect = function (scene, type) {
        const p = CopyAttack.params;
        const isSelect = type === "select";
        const defaultWidth = Graphics.boxWidth;
        const defaultHeight = scene.windowAreaHeight
            ? scene.windowAreaHeight()
            : Window_Selectable.prototype.fittingHeight(8);

        const xParam = isSelect ? p.selectWindowX : p.discardWindowX;
        const yParam = isSelect ? p.selectWindowY : p.discardWindowY;
        const wParam = isSelect ? p.selectWindowWidth : p.discardWindowWidth;
        const hParam = isSelect ? p.selectWindowHeight : p.discardWindowHeight;
        const rows = isSelect ? p.selectWindowRows : p.discardWindowRows;

        let width = wParam > 0 ? wParam : defaultWidth;
        let height = hParam > 0 ? hParam : defaultHeight;
        if (rows > 0) {
            height = Window_Selectable.prototype.fittingHeight(rows);
        }
        const x = xParam >= 0 ? xParam : 0;
        const y = yParam >= 0 ? yParam : Graphics.boxHeight - height;
        return new Rectangle(x, y, width, height);
    };

    /**
     * はい／いいえ確認ウィンドウ用の矩形（画面中央）
     * @returns {Rectangle}
     */
    CopyAttack.makeConfirmWindowRect = function () {
        const width = 240;
        const height = Window_Selectable.prototype.fittingHeight(2);
        const x = Math.floor((Graphics.boxWidth - width) / 2);
        const y = Math.floor((Graphics.boxHeight - height) / 2);
        return new Rectangle(x, y, width, height);
    };

    // -------------------------------------------------------------------------
    // ヘルプ上書き防止
    // -------------------------------------------------------------------------

    const _Window_Selectable_callUpdateHelp = Window_Selectable.prototype.callUpdateHelp;
    /**
     * コピー選択中は所有者以外のウィンドウによるヘルプ更新を遮断
     * @override
     */
    Window_Selectable.prototype.callUpdateHelp = function () {
        if (CopyAttack.isHelpLocked() && !CopyAttack.isHelpOwner(this)) {
            return;
        }
        _Window_Selectable_callUpdateHelp.call(this);
    };

    const _Window_Selectable_hideHelpWindow = Window_Selectable.prototype.hideHelpWindow;
    /**
     * コピー選択中は他ウィンドウによるヘルプ非表示を遮断
     * @override
     */
    Window_Selectable.prototype.hideHelpWindow = function () {
        if (CopyAttack.isHelpLocked() && !CopyAttack.isHelpOwner(this)) {
            return;
        }
        _Window_Selectable_hideHelpWindow.call(this);
    };

    const _Window_Help_clear = Window_Help.prototype.clear;
    /**
     * ロック中の clear を無視（他ウィンドウの updateHelp 既定実装対策）
     * @override
     */
    Window_Help.prototype.clear = function () {
        if (CopyAttack.isHelpLocked()) {
            return;
        }
        _Window_Help_clear.call(this);
    };

    const _Window_Help_hide = Window_Help.prototype.hide;
    /**
     * ロック中の hide を無視
     * @override
     */
    Window_Help.prototype.hide = function () {
        if (CopyAttack.isHelpLocked()) {
            return;
        }
        _Window_Help_hide.call(this);
    };

    // -------------------------------------------------------------------------
    // Game_Actor（グループ別のコピー技保持）
    // -------------------------------------------------------------------------

    const _Game_Actor_initMembers = Game_Actor.prototype.initMembers;
    Game_Actor.prototype.initMembers = function () {
        _Game_Actor_initMembers.call(this);
        this._copiedSkillGroups = CopyAttack.createGroupMap();
        this._maxCopiedSkillsByGroup = CopyAttack.createGroupMap();
        this._copiedSkillIdSet = null;
        this._copyAttackGroupsReady = false;
        // 旧形式互換用（ensure でグループへ移行）
        this._copiedSkills = [];
        this._maxCopiedSkills = null;
    };

    /**
     * 保持中コピー技IDの Set を再構築（isCopiedSkill 高速化用）
     */
    Game_Actor.prototype.rebuildCopiedSkillIdSet = function () {
        this.ensureCopiedSkillGroups();
        const set = new Set();
        for (const key of Object.keys(this._copiedSkillGroups)) {
            const list = this._copiedSkillGroups[key];
            if (!list) {
                continue;
            }
            for (let i = 0; i < list.length; i++) {
                set.add(list[i]);
            }
        }
        this._copiedSkillIdSet = set;
    };

    /**
     * グループ辞書を整え、旧 _copiedSkills があれば default へ移す
     * （セーブ読込後など初回だけ正規化する）
     */
    Game_Actor.prototype.ensureCopiedSkillGroups = function () {
        if (this._copyAttackGroupsReady) {
            return;
        }
        if (!this._copiedSkillGroups || typeof this._copiedSkillGroups !== "object") {
            this._copiedSkillGroups = CopyAttack.createGroupMap();
        }
        if (!this._maxCopiedSkillsByGroup || typeof this._maxCopiedSkillsByGroup !== "object") {
            this._maxCopiedSkillsByGroup = CopyAttack.createGroupMap();
        }
        if (Array.isArray(this._copiedSkills) && this._copiedSkills.length > 0) {
            const migrated = CopyAttack.normalizeSkillIdList(this._copiedSkills);
            const def = CopyAttack.DEFAULT_GROUP;
            const current = CopyAttack.normalizeSkillIdList(this._copiedSkillGroups[def]);
            const seen = new Set(current);
            for (const id of migrated) {
                if (!seen.has(id)) {
                    current.push(id);
                    seen.add(id);
                }
            }
            this._copiedSkillGroups[def] = current.sort((a, b) => a - b);
            this._copiedSkills = [];
        }
        const cleaned = CopyAttack.createGroupMap();
        const def = CopyAttack.DEFAULT_GROUP;
        const merged = [];
        const seen = new Set();
        // 旧保管枠分割データを1つの保持リストへ統合
        for (const key of Object.keys(this._copiedSkillGroups)) {
            const list = CopyAttack.normalizeSkillIdList(this._copiedSkillGroups[key]);
            for (const id of list) {
                if (!seen.has(id)) {
                    merged.push(id);
                    seen.add(id);
                }
            }
        }
        cleaned[def] = merged.sort((a, b) => a - b);
        this._copiedSkillGroups = cleaned;
        // 上限も default へ寄せる（最大値を採用）
        let maxCap = 0;
        for (const key of Object.keys(this._maxCopiedSkillsByGroup)) {
            const v = Number(this._maxCopiedSkillsByGroup[key]) || 0;
            if (v > maxCap) {
                maxCap = v;
            }
        }
        const maxMap = CopyAttack.createGroupMap();
        if (maxCap > 0) {
            maxMap[def] = maxCap;
            this._maxCopiedSkills = maxCap;
        }
        this._maxCopiedSkillsByGroup = maxMap;
        this._copiedSkillIdSet = null;
        this._copyAttackGroupsReady = true;
    };

    /**
     * @param {string|null} [group] null/省略で全グループの合算
     * @returns {number[]}
     */
    Game_Actor.prototype.copiedSkillIds = function (group) {
        this.ensureCopiedSkillGroups();
        if (group == null) {
            if (!this._copiedSkillIdSet) {
                this.rebuildCopiedSkillIdSet();
            }
            return Array.from(this._copiedSkillIdSet).sort((a, b) => a - b);
        }
        const g = CopyAttack.normalizeGroupId(group);
        if (!this._copiedSkillGroups[g]) {
            this._copiedSkillGroups[g] = [];
        }
        return this._copiedSkillGroups[g];
    };

    /**
     * @param {string} [group]
     * @returns {number}
     */
    Game_Actor.prototype.maxCopiedSkills = function (group) {
        const g = CopyAttack.normalizeGroupId(group);
        this.ensureCopiedSkillGroups();
        if (this._maxCopiedSkillsByGroup[g] > 0) {
            return this._maxCopiedSkillsByGroup[g];
        }
        // 旧フィールドは default グループの上限として扱う
        if (
            g === CopyAttack.DEFAULT_GROUP &&
            this._maxCopiedSkills != null &&
            this._maxCopiedSkills > 0
        ) {
            return this._maxCopiedSkills;
        }
        return CopyAttack.params.maxCopiedSkills;
    };

    /**
     * @param {number} maxCount
     * @param {string} [group]
     */
    Game_Actor.prototype.setMaxCopiedSkills = function (maxCount, group) {
        this.ensureCopiedSkillGroups();
        const value = Math.max(1, Math.min(99, Number(maxCount) || 1));
        const g = CopyAttack.normalizeGroupId(group);
        this._maxCopiedSkillsByGroup[g] = value;
        if (g === CopyAttack.DEFAULT_GROUP) {
            this._maxCopiedSkills = value;
        }
    };

    /**
     * @param {string|null} [group]
     * @returns {object[]}
     */
    Game_Actor.prototype.copiedSkills = function (group) {
        return this.copiedSkillIds(group)
            .map((id) => $dataSkills[id])
            .filter((skill) => !!skill);
    };

    /**
     * @param {number} skillId
     * @returns {boolean}
     */
    Game_Actor.prototype.isCopiedSkill = function (skillId) {
        const id = Number(skillId);
        if (!id) {
            return false;
        }
        this.ensureCopiedSkillGroups();
        if (!this._copiedSkillIdSet) {
            this.rebuildCopiedSkillIdSet();
        }
        return this._copiedSkillIdSet.has(id);
    };

    /**
     * @param {string} [group]
     * @returns {boolean}
     */
    Game_Actor.prototype.isCopiedSkillFull = function (group) {
        const g = CopyAttack.normalizeGroupId(group);
        return this.copiedSkillIds(g).length >= this.maxCopiedSkills(g);
    };

    /**
     * @param {number} skillId
     * @param {string} [group]
     * @returns {boolean}
     */
    Game_Actor.prototype.canAddCopiedSkill = function (skillId, group) {
        const id = Number(skillId);
        if (!id || !$dataSkills || !$dataSkills[id]) {
            return false;
        }
        const g = CopyAttack.normalizeGroupId(group);
        if (this.isCopiedSkill(id)) {
            return false;
        }
        if (this.isLearnedSkill(id)) {
            return false;
        }
        if (this.isCopiedSkillFull(g)) {
            return false;
        }
        return true;
    };

    /**
     * @param {number} skillId
     * @param {string} [group]
     * @returns {boolean}
     */
    Game_Actor.prototype.addCopiedSkill = function (skillId, group) {
        const id = Number(skillId);
        const g = CopyAttack.normalizeGroupId(group);
        if (!this.canAddCopiedSkill(id, g)) {
            return false;
        }
        const list = this.copiedSkillIds(g);
        list.push(id);
        list.sort((a, b) => a - b);
        if (!this._copiedSkillIdSet) {
            this.rebuildCopiedSkillIdSet();
        } else {
            this._copiedSkillIdSet.add(id);
        }
        this.learnSkill(id);
        return true;
    };

    /**
     * @param {number} skillId
     */
    Game_Actor.prototype.removeCopiedSkill = function (skillId) {
        const id = Number(skillId);
        if (!id || !this.isCopiedSkill(id)) {
            return;
        }
        this.ensureCopiedSkillGroups();
        for (const key of Object.keys(this._copiedSkillGroups)) {
            const list = this._copiedSkillGroups[key];
            if (Array.isArray(list) && list.includes(id)) {
                list.remove(id);
            }
        }
        if (this._copiedSkillIdSet) {
            this._copiedSkillIdSet.delete(id);
        }
        this.forgetSkill(id);
    };

    // -------------------------------------------------------------------------
    // セーブ読込後にグループ正規化フラグをリセット
    // -------------------------------------------------------------------------

    const _DataManager_extractSaveContents = DataManager.extractSaveContents;
    /** @override */
    DataManager.extractSaveContents = function (contents) {
        _DataManager_extractSaveContents.call(this, contents);
        if (!$gameActors || typeof $gameActors._data === "undefined") {
            return;
        }
        const actors = $gameActors._data;
        for (let i = 0; i < actors.length; i++) {
            const actor = actors[i];
            if (!actor) {
                continue;
            }
            actor._copyAttackGroupsReady = false;
            actor._copiedSkillIdSet = null;
        }
    };

    // -------------------------------------------------------------------------
    // Window_CopyAttackSkillList
    // -------------------------------------------------------------------------

    function Window_CopyAttackSkillList() {
        this.initialize(...arguments);
    }

    Window_CopyAttackSkillList.prototype = Object.create(Window_Selectable.prototype);
    Window_CopyAttackSkillList.prototype.constructor = Window_CopyAttackSkillList;

    /**
     * @param {Rectangle} rect
     */
    Window_CopyAttackSkillList.prototype.initialize = function (rect) {
        Window_Selectable.prototype.initialize.call(this, rect);
        this._source = null;
        this._actor = null;
        this._group = CopyAttack.DEFAULT_GROUP;
        this._filterGroup = null;
        this._manualMode = false;
        this._skillIdFilter = null;
        this._data = [];
        this._maxCols = CopyAttack.params.selectWindowCols;
        this._canRepeat = false;
        this._copyInputGuard = 0;
        this._copyOkReleased = true;
        this.hide();
        this.deactivate();
    };

    /**
     * 戦闘コピー選択（統合済みスキルIDリスト）
     * @param {Game_Actor} actor
     * @param {number[]} skillIds
     * @param {string} [group]
     */
    Window_CopyAttackSkillList.prototype.setCopySession = function (actor, skillIds, group) {
        this._manualMode = false;
        this._source = null;
        this._actor = actor;
        this._group = group || CopyAttack.DEFAULT_GROUP;
        this._skillIdFilter = skillIds && skillIds.length > 0 ? skillIds.slice() : [];
        this.refresh();
        this.scrollTo(0, 0);
    };

    /**
     * イベント手動習得用
     * @param {Game_Actor} actor
     * @param {number[]|null} [skillIds]
     * @param {string} [storageGroup]
     * @param {string|null} [filterGroup]
     */
    Window_CopyAttackSkillList.prototype.setManualActor = function (
        actor,
        skillIds,
        storageGroup,
        filterGroup
    ) {
        this._manualMode = true;
        this._source = null;
        this._actor = actor;
        this._group = storageGroup || CopyAttack.DEFAULT_GROUP;
        this._filterGroup = filterGroup === undefined ? null : filterGroup;
        this._skillIdFilter =
            skillIds && skillIds.length > 0 ? skillIds.slice() : null;
        this.refresh();
        this.scrollTo(0, 0);
    };

    /** @override */
    Window_CopyAttackSkillList.prototype.maxCols = function () {
        return this._maxCols || 1;
    };

    /** @override */
    Window_CopyAttackSkillList.prototype.maxItems = function () {
        return this._data ? this._data.length : 0;
    };

    /** @returns {object|null} */
    Window_CopyAttackSkillList.prototype.item = function () {
        return this.itemAt(this.index());
    };

    /**
     * @param {number} index
     * @returns {object|null}
     */
    Window_CopyAttackSkillList.prototype.itemAt = function (index) {
        return this._data && index >= 0 ? this._data[index] : null;
    };

    /** @override */
    Window_CopyAttackSkillList.prototype.isCurrentItemEnabled = function () {
        return this.isEnabled(this.item());
    };

    /**
     * @param {object|null} item
     * @returns {boolean}
     */
    Window_CopyAttackSkillList.prototype.isEnabled = function (item) {
        // 戦闘コピー一覧は事前に候補を絞っているので常に選択可
        if (!this._manualMode && this._skillIdFilter) {
            return !!item;
        }
        if (!item || !this._actor) {
            return false;
        }
        return this._actor.canAddCopiedSkill(item.id, this._group);
    };

    /** @override */
    Window_CopyAttackSkillList.prototype.makeItemList = function () {
        this._data = [];
        if (!this._actor) {
            return;
        }
        const group = this._group || CopyAttack.DEFAULT_GROUP;
        const filter = this._filterGroup;
        if (this._manualMode) {
            if (this._skillIdFilter) {
                for (let i = 0; i < this._skillIdFilter.length; i++) {
                    const skill = $dataSkills[this._skillIdFilter[i]];
                    if (skill && CopyAttack.isCopyableSkill(skill, filter)) {
                        this._data.push(skill);
                    }
                }
            } else {
                const ids = CopyAttack.manualLearnSkillIds(this._actor, filter);
                for (let i = 0; i < ids.length; i++) {
                    const skill = $dataSkills[ids[i]];
                    if (skill) {
                        this._data.push(skill);
                    }
                }
            }
            return;
        }
        // 戦闘中: 渡された候補IDをそのまま表示（都度 canAdd / 再検索しない）
        const ids =
            this._skillIdFilter && this._skillIdFilter.length > 0
                ? this._skillIdFilter
                : this._source
                  ? CopyAttack.availableCopySkillIds(this._source, this._actor, group)
                  : [];
        for (let i = 0; i < ids.length; i++) {
            const skill = $dataSkills[ids[i]];
            if (skill) {
                this._data.push(skill);
            }
        }
    };

    /** @override */
    Window_CopyAttackSkillList.prototype.drawItem = function (index) {
        const skill = this.itemAt(index);
        if (!skill) {
            return;
        }
        const rect = this.itemLineRect(index);
        this.changePaintOpacity(this.isEnabled(skill));
        this.drawItemName(skill, rect.x, rect.y, rect.width);
        this.changePaintOpacity(true);
    };

    /**
     * 選択中スキルの説明＋残り選択回数
     * @override
     */
    Window_CopyAttackSkillList.prototype.updateHelp = function () {
        if (!this._helpWindow) {
            return;
        }
        const item = this.item();
        const remain = CopyAttack.isSelectPhase() ? CopyAttack.pendingCopyRemain() : 0;
        const total = CopyAttack.isSelectPhase() ? CopyAttack.pendingCopyTotal() : 0;
        let extra = "";
        if (total > 1 && remain > 0) {
            extra = "\nあと" + remain + "個選択できます";
        }
        if (item) {
            const text = String(item.description || "") + extra;
            this._helpWindow.setText(text);
        } else if (extra) {
            this._helpWindow.setText(extra.trim());
        } else {
            this._helpWindow.setText("");
        }
    };

    /** @override */
    Window_CopyAttackSkillList.prototype.refresh = function () {
        this.makeItemList();
        Window_Selectable.prototype.refresh.call(this);
    };

    // -------------------------------------------------------------------------
    // Window_CopyAttackForgetList
    // -------------------------------------------------------------------------

    function Window_CopyAttackForgetList() {
        this.initialize(...arguments);
    }

    Window_CopyAttackForgetList.prototype = Object.create(Window_Selectable.prototype);
    Window_CopyAttackForgetList.prototype.constructor = Window_CopyAttackForgetList;

    /**
     * @param {Rectangle} rect
     */
    Window_CopyAttackForgetList.prototype.initialize = function (rect) {
        Window_Selectable.prototype.initialize.call(this, rect);
        this._actor = null;
        this._group = null;
        this._data = [];
        this._maxCols = CopyAttack.params.discardWindowCols;
        this._canRepeat = false;
        this._copyInputGuard = 0;
        this._copyOkReleased = true;
        this.hide();
        this.deactivate();
    };

    /**
     * @param {Game_Actor} actor
     * @param {string|null} [filterGroup] 技忘れ側 CopyGroup。null なら全コピー技
     */
    Window_CopyAttackForgetList.prototype.setActor = function (actor, filterGroup) {
        this._actor = actor;
        this._group = filterGroup === undefined ? null : filterGroup;
        this.refresh();
        this.scrollTo(0, 0);
    };

    /**
     * 削除後などにリストを更新し、フォーカスをリストへ戻す
     * @param {number} [selectIndex]
     * @returns {boolean} まだ消せる技が残っているか
     */
    Window_CopyAttackForgetList.prototype.reloadAndActivate = function (selectIndex) {
        this.refresh();
        const max = this.maxItems();
        if (max <= 0) {
            this.deactivate();
            return false;
        }
        const index = Math.max(0, Math.min(selectIndex == null ? 0 : selectIndex, max - 1));
        this.show();
        this.select(index);
        this.activate();
        this.updateHelp();
        return true;
    };

    /** @override */
    Window_CopyAttackForgetList.prototype.maxCols = function () {
        return this._maxCols || 1;
    };

    /** @override */
    Window_CopyAttackForgetList.prototype.maxItems = function () {
        return this._data ? this._data.length : 0;
    };

    /** @returns {object|null} */
    Window_CopyAttackForgetList.prototype.item = function () {
        return this.itemAt(this.index());
    };

    /**
     * @param {number} index
     * @returns {object|null}
     */
    Window_CopyAttackForgetList.prototype.itemAt = function (index) {
        return this._data && index >= 0 ? this._data[index] : null;
    };

    /** @override */
    Window_CopyAttackForgetList.prototype.isCurrentItemEnabled = function () {
        return !!this.item();
    };

    /** @override */
    Window_CopyAttackForgetList.prototype.makeItemList = function () {
        // コピー保持中のスキルのみ。通常習得スキルは混ざらない
        this._data = this._actor
            ? CopyAttack.forgetableCopiedSkills(this._actor, this._group)
            : [];
    };

    /** @override */
    Window_CopyAttackForgetList.prototype.drawItem = function (index) {
        const skill = this.itemAt(index);
        if (!skill) {
            return;
        }
        const rect = this.itemLineRect(index);
        this.drawItemName(skill, rect.x, rect.y, rect.width);
    };

    /**
     * 選択中スキルの説明文を毎更新で確実にセット
     * @override
     */
    Window_CopyAttackForgetList.prototype.updateHelp = function () {
        if (!this._helpWindow) {
            return;
        }
        const item = this.item();
        this._helpWindow.setItem(item);
    };

    /** @override */
    Window_CopyAttackForgetList.prototype.refresh = function () {
        this.makeItemList();
        Window_Selectable.prototype.refresh.call(this);
    };

    /**
     * 技削除の確認ウィンドウ（はい / いいえ）
     * @extends Window_Command
     */
    function Window_CopyAttackConfirm() {
        this.initialize(...arguments);
    }

    Window_CopyAttackConfirm.prototype = Object.create(Window_Command.prototype);
    Window_CopyAttackConfirm.prototype.constructor = Window_CopyAttackConfirm;

    Window_CopyAttackConfirm.prototype.initialize = function (rect) {
        Window_Command.prototype.initialize.call(this, rect);
        this.hide();
        this.deactivate();
    };

    /** @override */
    Window_CopyAttackConfirm.prototype.makeCommandList = function () {
        const p = CopyAttack.params;
        this.addCommand(p.confirmYesText, "yes");
        this.addCommand(p.confirmNoText, "no");
    };

    /**
     * 確認メッセージをヘルプへ表示
     * @override
     */
    Window_CopyAttackConfirm.prototype.updateHelp = function () {
        if (this._helpWindow) {
            this._helpWindow.setText(CopyAttack.params.confirmMessage);
        }
    };

    /**
     * 確認を開く。初期カーソルは必ず「いいえ」(index 1)
     */
    Window_CopyAttackConfirm.prototype.openConfirm = function () {
        this.refresh();
        this.show();
        this.select(1);
        this.activate();
        // 連続削除時も、開放直後の押しっぱなし決定を必ず拒否する
        if (typeof this.startCopyInputGuard === "function") {
            this.startCopyInputGuard();
        }
    };

    Window_CopyAttackConfirm.prototype.closeConfirm = function () {
        this.deactivate();
        this.hide();
    };

    /**
     * 技忘れ確認の決定音を一元化
     * 「はい」はここでだけ SoundManager.playOk() し、ハンドラ側では鳴らさない
     * @override
     */
    Window_CopyAttackConfirm.prototype.callOkHandler = function () {
        if (this.currentSymbol() === "yes") {
            SoundManager.playOk();
        }
        Window_Command.prototype.callOkHandler.call(this);
    };

    /**
     * 「はい」は callOkHandler で再生するため、ここでは二重再生を避ける
     * @override
     */
    Window_CopyAttackConfirm.prototype.playOkSound = function () {
        if (this.currentSymbol() === "yes") {
            return;
        }
        SoundManager.playOk();
    };

    /**
     * 技選択／忘れる技ウィンドウ共通の決定入力ガード
     * ・activate直後は一定フレーム決定不可
     * ・決定は Input.isTriggered のみ（押しっぱなし／リピート無効）
     * ・一度ボタンを離すまで決定しない
     * @param {object} proto
     */
    function applyCopySelectionInputGuard(proto) {
        const _activate = proto.activate;
        proto.activate = function () {
            _activate.call(this);
            this.startCopyInputGuard();
        };

        proto.startCopyInputGuard = function () {
            this._copyInputGuard = CopyAttack.INPUT_GUARD_FRAMES;
            // 開放時点で決定が押されていれば、離すまで決定不可
            this._copyOkReleased = !Input.isPressed("ok") && !TouchInput.isPressed();
        };

        const _update = proto.update;
        proto.update = function () {
            if (this._copyInputGuard > 0) {
                this._copyInputGuard--;
            }
            if (!Input.isPressed("ok") && !TouchInput.isPressed()) {
                this._copyOkReleased = true;
            }
            _update.call(this);
        };

        /**
         * リピート入力を使わず、ガード解除後の新規押下のみ許可
         * @override
         */
        proto.isOkTriggered = function () {
            if (this._copyInputGuard > 0 || !this._copyOkReleased) {
                return false;
            }
            return Input.isTriggered("ok");
        };

        /**
         * ガード中の決定を完全に無視
         * @override
         */
        proto.processOk = function () {
            if (this._copyInputGuard > 0 || !this._copyOkReleased) {
                return;
            }
            Window_Selectable.prototype.processOk.call(this);
        };

        /**
         * タッチ決定も同様にガード
         * @override
         */
        proto.onTouchOk = function () {
            if (this._copyInputGuard > 0 || !this._copyOkReleased) {
                return;
            }
            Window_Selectable.prototype.onTouchOk.call(this);
        };
    }

    applyCopySelectionInputGuard(Window_CopyAttackSkillList.prototype);
    applyCopySelectionInputGuard(Window_CopyAttackForgetList.prototype);
    applyCopySelectionInputGuard(Window_CopyAttackConfirm.prototype);

    // -------------------------------------------------------------------------
    // BattleManager
    // -------------------------------------------------------------------------

    const _BattleManager_initMembers = BattleManager.initMembers;
    /** @override */
    BattleManager.initMembers = function () {
        _BattleManager_initMembers.call(this);
        CopyAttack.clearPending();
        CopyAttack.setHelpOwner(null);
    };

    const _BattleManager_endAction = BattleManager.endAction;
    /**
     * コピー可能な技がある場合のみ選択フェーズへ移行する
     * @override
     */
    BattleManager.endAction = function () {
        const action = this._action;
        const subject = this._subject;
        let shouldOpenSelect = false;

        if (
            action &&
            subject &&
            subject.isActor() &&
            CopyAttack.isCopySkillForUse(subject, action.item())
        ) {
            const copySkill = action.item();
            const sources = CopyAttack.resolveCopySources(subject, action);
            const group = CopyAttack.getCopyGroup(copySkill);
            const filter = CopyAttack.getCopyFilterGroup(copySkill);
            if (
                sources.length > 0 &&
                CopyAttack.needsCopySelect(subject, sources, group, filter)
            ) {
                if (CopyAttack.shouldSkipCopySelectUi(subject)) {
                    CopyAttack.applyAutoCopy(subject, sources, copySkill);
                    CopyAttack.clearPending();
                } else {
                    CopyAttack.reserveCopySelect(subject, sources, copySkill);
                    // 候補または空き枠が0なら選択画面を開かない
                    if (CopyAttack.pendingCopyRemain() > 0) {
                        shouldOpenSelect = true;
                    } else {
                        CopyAttack.clearPending();
                    }
                }
            } else {
                CopyAttack.clearPending();
            }
        }

        _BattleManager_endAction.call(this);

        if (shouldOpenSelect && !this.isBattleEnd() && CopyAttack.pendingActor()) {
            this._phase = CopyAttack.PHASE;
        }
    };

    const _BattleManager_updatePhase = BattleManager.updatePhase;
    /** @override */
    BattleManager.updatePhase = function (timeActive) {
        // コピー選択セッション中のみフェーズを固定（孤立状態では復帰）
        if (CopyAttack.isCopySessionActive()) {
            this._phase = CopyAttack.PHASE;
            return;
        }
        // 技忘れUI中は戦闘進行を止める
        if (CopyAttack.isForgetSelectOpen()) {
            return;
        }
        // 孤立した copyAttackSelect フェーズはターンへ戻す
        if (this._phase === CopyAttack.PHASE) {
            if (CopyAttack.pendingActor() && CopyAttack._pendingMode === CopyAttack.MODE_COPY) {
                return;
            }
            CopyAttack.clearPending();
            this._phase = "turn";
            return;
        }
        _BattleManager_updatePhase.call(this, timeActive);
    };

    BattleManager.finishCopyAttackSelect = function () {
        CopyAttack.clearPending();
        if (this._phase === CopyAttack.PHASE) {
            this._phase = "turn";
        }
    };

    // -------------------------------------------------------------------------
    // ターゲット選択制限（コピー用スキル：敵／味方）
    // -------------------------------------------------------------------------

    const _Window_BattleEnemy_isCurrentItemEnabled =
        Window_BattleEnemy.prototype.isCurrentItemEnabled;
    /**
     * コピー用スキル選択時、コピー不可の敵は選択不可
     * @override
     */
    Window_BattleEnemy.prototype.isCurrentItemEnabled = function () {
        if (CopyAttack.isSelectingCopySkillTarget()) {
            return CopyAttack.canCopyTarget(this.enemy(), null, CopyAttack.currentCopyGroup());
        }
        if (_Window_BattleEnemy_isCurrentItemEnabled) {
            return _Window_BattleEnemy_isCurrentItemEnabled.call(this);
        }
        return true;
    };

    const _Window_BattleEnemy_drawItem = Window_BattleEnemy.prototype.drawItem;
    /**
     * コピー不可対象をグレーアウト表示
     * @override
     */
    Window_BattleEnemy.prototype.drawItem = function (index) {
        if (CopyAttack.isSelectingCopySkillTarget()) {
            const enemy = this._enemies[index];
            this.changePaintOpacity(
                CopyAttack.canCopyTarget(enemy, null, CopyAttack.currentCopyGroup())
            );
            this.resetTextColor();
            const name = enemy.name();
            const rect = this.itemLineRect(index);
            this.drawText(name, rect.x, rect.y, rect.width);
            this.changePaintOpacity(true);
            return;
        }
        _Window_BattleEnemy_drawItem.call(this, index);
    };

    const _Scene_Battle_onEnemyOk = Scene_Battle.prototype.onEnemyOk;
    /**
     * コピー不可の敵は確定しない（ブザーは processOk 側のみ）
     * @override
     */
    Scene_Battle.prototype.onEnemyOk = function () {
        if (CopyAttack.isSelectingCopySkillTarget()) {
            const enemy = this._enemyWindow.enemy();
            if (!CopyAttack.canCopyTarget(enemy, null, CopyAttack.currentCopyGroup())) {
                this._enemyWindow.activate();
                return;
            }
        }
        _Scene_Battle_onEnemyOk.call(this);
    };

    const _Window_BattleActor_isCurrentItemEnabled =
        Window_BattleActor.prototype.isCurrentItemEnabled;
    /**
     * コピー用スキル選択時、コピー不可の味方は選択不可
     * ※ actor() は index 必須（省略すると常に undefined になる）
     * @override
     */
    Window_BattleActor.prototype.isCurrentItemEnabled = function () {
        if (CopyAttack.isSelectingCopySkillTarget()) {
            return CopyAttack.canCopyTarget(
                this.actor(this.index()),
                null,
                CopyAttack.currentCopyGroup()
            );
        }
        if (_Window_BattleActor_isCurrentItemEnabled) {
            return _Window_BattleActor_isCurrentItemEnabled.call(this);
        }
        return Window_Selectable.prototype.isCurrentItemEnabled.call(this);
    };

    const _Window_BattleActor_drawItem = Window_BattleActor.prototype.drawItem;
    /**
     * コピー不可の味方をグレーアウト表示
     * @override
     */
    Window_BattleActor.prototype.drawItem = function (index) {
        if (CopyAttack.isSelectingCopySkillTarget()) {
            const actor = this.actor(index);
            this.changePaintOpacity(
                CopyAttack.canCopyTarget(actor, null, CopyAttack.currentCopyGroup())
            );
            _Window_BattleActor_drawItem.call(this, index);
            this.changePaintOpacity(true);
            return;
        }
        _Window_BattleActor_drawItem.call(this, index);
    };

    const _Scene_Battle_onActorOk = Scene_Battle.prototype.onActorOk;
    /**
     * コピー不可の味方は確定しない
     * （無効時のブザーは processOk 側のみ。ここでは鳴らさない）
     * @override
     */
    Scene_Battle.prototype.onActorOk = function () {
        if (CopyAttack.isSelectingCopySkillTarget()) {
            const actor = this._actorWindow.actor(this._actorWindow.index());
            if (
                !CopyAttack.canCopyTarget(actor, null, CopyAttack.currentCopyGroup())
            ) {
                this._actorWindow.activate();
                return;
            }
        }
        _Scene_Battle_onActorOk.call(this);
    };

    // -------------------------------------------------------------------------
    // Scene_Battle
    // -------------------------------------------------------------------------

    const _Scene_Battle_createAllWindows = Scene_Battle.prototype.createAllWindows;
    /** @override */
    Scene_Battle.prototype.createAllWindows = function () {
        _Scene_Battle_createAllWindows.call(this);
        this.createCopyAttackWindows();
    };

    Scene_Battle.prototype.createCopyAttackWindows = function () {
        this._copySkillWindow = new Window_CopyAttackSkillList(
            CopyAttack.makeWindowRect(this, "select")
        );
        this._copySkillWindow.setHelpWindow(this._helpWindow);
        this._copySkillWindow.setHandler("ok", this.onCopySkillOk.bind(this));
        this._copySkillWindow.setHandler("cancel", this.onCopySkillCancel.bind(this));
        this.addWindow(this._copySkillWindow);

        this._copySkillDiscardWindow = new Window_CopyAttackForgetList(
            CopyAttack.makeWindowRect(this, "discard")
        );
        this._copySkillDiscardWindow.setHelpWindow(this._helpWindow);
        this._copySkillDiscardWindow.setHandler("ok", this.onCopySkillDiscardOk.bind(this));
        this._copySkillDiscardWindow.setHandler(
            "cancel",
            this.onCopySkillDiscardCancel.bind(this)
        );
        this.addWindow(this._copySkillDiscardWindow);

        this._copySkillConfirmWindow = new Window_CopyAttackConfirm(
            CopyAttack.makeConfirmWindowRect()
        );
        this._copySkillConfirmWindow.setHelpWindow(this._helpWindow);
        this._copySkillConfirmWindow.setHandler("yes", this.onCopyForgetConfirmYes.bind(this));
        this._copySkillConfirmWindow.setHandler("no", this.onCopyForgetConfirmNo.bind(this));
        this._copySkillConfirmWindow.setHandler("cancel", this.onCopyForgetConfirmNo.bind(this));
        this.addWindow(this._copySkillConfirmWindow);

        this._pendingDiscardSkill = null;
        this._copySkillSelectStarted = false;
    };

    const _Scene_Battle_update = Scene_Battle.prototype.update;
    /** @override */
    Scene_Battle.prototype.update = function () {
        _Scene_Battle_update.call(this);
        this.updateCopySkillSelect();
        this.refreshCopyAttackHelp();
    };

    /**
     * 所有ウィンドウの説明を必要なときだけ更新しヘルプを表示維持
     */
    Scene_Battle.prototype.refreshCopyAttackHelp = function () {
        CopyAttack.refreshOwnedHelp(this._helpWindow);
    };

    /**
     * @param {Window_Selectable} owner
     */
    Scene_Battle.prototype.beginCopyHelpOwner = function (owner) {
        CopyAttack.setHelpOwner(owner);
        if (this._helpWindow) {
            this._helpWindow.show();
            this._helpWindow.visible = true;
        }
        if (owner) {
            owner.updateHelp();
        }
    };

    Scene_Battle.prototype.endCopyHelpOwner = function () {
        CopyAttack.setHelpOwner(null);
    };

    Scene_Battle.prototype.updateCopySkillSelect = function () {
        const inCopy =
            CopyAttack.isCopySessionActive() ||
            (CopyAttack._pendingMode === CopyAttack.MODE_COPY && CopyAttack.pendingActor());

        if (!inCopy && !CopyAttack.isSelectPhase()) {
            this._copySkillSelectStarted = false;
            return;
        }

        // 選択セッション中はフェーズを固定
        if (CopyAttack.pendingActor() && CopyAttack._pendingMode === CopyAttack.MODE_COPY) {
            BattleManager._phase = CopyAttack.PHASE;
        }

        if (!CopyAttack.isSelectPhase()) {
            return;
        }

        // 初回オープンのみ（連続選択は onCopySkillOk 内で即時更新）
        if (!this._copySkillSelectStarted) {
            if (BattleManager.isBusy()) {
                return;
            }
            this._copySkillSelectStarted = true;
            this.startCopySkillSelection();
        }
    };

    Scene_Battle.prototype.startCopySkillSelection = function () {
        const actor = CopyAttack.pendingActor();
        const candidates = CopyAttack.pendingCandidateIds();

        if (!actor || !candidates || candidates.length === 0) {
            this.endCopySkillSelection();
            return;
        }
        // 候補0や空き枠0なら開かない（回数はすでに clamp 済み）
        if (CopyAttack.pendingCopyRemain() <= 0) {
            this.endCopySkillSelection();
            return;
        }

        this.closeCopySkillBlockingWindows();
        if (this._copySkillDiscardWindow) {
            this._copySkillDiscardWindow.hide();
        }
        this._copySkillWindow.setCopySession(
            actor,
            candidates,
            CopyAttack.pendingGroup()
        );
        this._copySkillWindow.show();
        this._copySkillWindow.activate();
        this._copySkillWindow.select(0);
        this.beginCopyHelpOwner(this._copySkillWindow);
    };

    /**
     * 連続コピー: 重い再検索・busy待ちなしでリストだけ差し替える
     */
    Scene_Battle.prototype.continueCopySkillSelectionLight = function () {
        const actor = CopyAttack.pendingActor();
        const candidates = CopyAttack.pendingCandidateIds();
        if (!actor || candidates.length === 0 || CopyAttack.pendingCopyRemain() <= 0) {
            this.endCopySkillSelection();
            return;
        }
        BattleManager._phase = CopyAttack.PHASE;
        this._copySkillWindow.setCopySession(
            actor,
            candidates,
            CopyAttack.pendingGroup()
        );
        this._copySkillWindow.show();
        this._copySkillWindow.activate();
        this._copySkillWindow.select(0);
        this.beginCopyHelpOwner(this._copySkillWindow);
    };

    Scene_Battle.prototype.closeCopySkillBlockingWindows = function () {
        this._partyCommandWindow.deactivate();
        this._actorCommandWindow.deactivate();
        if (!CopyAttack.isHelpLocked()) {
            CopyAttack.setHelpOwner(this._copySkillWindow || this._copySkillDiscardWindow);
        }
        this._skillWindow.hide();
        this._itemWindow.hide();
        this._actorWindow.hide();
        this._enemyWindow.hide();
    };

    Scene_Battle.prototype.onCopySkillOk = function () {
        const actor = CopyAttack.pendingActor();
        const target = CopyAttack.pendingTarget();
        const group = CopyAttack.pendingGroup();
        const skill = this._copySkillWindow.item();

        BattleManager._phase = CopyAttack.PHASE;

        if (!actor || !skill) {
            this.onCopySkillCancel();
            return;
        }

        if (!actor.canAddCopiedSkill(skill.id, group)) {
            CopyAttack.removePendingCandidate(skill.id);
            if (CopyAttack.canContinueCopySession()) {
                this.continueCopySkillSelectionLight();
            } else {
                this.endCopySkillSelection();
            }
            return;
        }

        if (!actor.addCopiedSkill(skill.id, group)) {
            CopyAttack.removePendingCandidate(skill.id);
            if (CopyAttack.canContinueCopySession()) {
                this.continueCopySkillSelectionLight();
            } else {
                this.endCopySkillSelection();
            }
            return;
        }

        if (!CopyAttack._pendingPickedIds) {
            CopyAttack._pendingPickedIds = [];
        }
        if (!CopyAttack._pendingPickedIds.includes(skill.id)) {
            CopyAttack._pendingPickedIds.push(skill.id);
        }
        CopyAttack.removePendingCandidate(skill.id);
        CopyAttack._pendingCopyRemain = Math.max(0, CopyAttack.pendingCopyRemain() - 1);

        // 決定音は processOk 済み。演出は非同期のまま次選択へ（busy待ちしない）
        CopyAttack.playSuccessAnimation(actor, target);

        if (
            CopyAttack.pendingCopyRemain() <= 0 ||
            actor.isCopiedSkillFull(group) ||
            CopyAttack.pendingCandidateIds().length === 0
        ) {
            this.endCopySkillSelection();
            return;
        }

        this.continueCopySkillSelectionLight();
    };

    Scene_Battle.prototype.onCopySkillCancel = function () {
        this.endCopySkillSelection();
    };

    Scene_Battle.prototype.startCopySkillDiscard = function () {
        const actor = CopyAttack.pendingActor();
        const filter = CopyAttack.pendingForgetGroup();
        if (!actor || !CopyAttack.hasForgetableCopiedSkills(actor, filter)) {
            this.endInputForgetSelection(true);
            return;
        }
        if (this._copySkillConfirmWindow) {
            this._copySkillConfirmWindow.closeConfirm();
        }
        this._pendingDiscardSkill = null;
        this._copySkillDiscardWindow.setActor(actor, filter);
        this._copySkillDiscardWindow.show();
        this._copySkillDiscardWindow.activate();
        this._copySkillDiscardWindow.select(0);
        this.beginCopyHelpOwner(this._copySkillDiscardWindow);
    };

    Scene_Battle.prototype.onCopySkillDiscardOk = function () {
        const actor = CopyAttack.pendingActor();
        const forgetSkill = this._copySkillDiscardWindow.item();
        if (!actor || !forgetSkill) {
            this.returnToBattleForgetList();
            return;
        }
        this._pendingDiscardSkill = forgetSkill;
        this._copySkillDiscardWindow.deactivate();
        this.beginCopyHelpOwner(this._copySkillConfirmWindow);
        this._copySkillConfirmWindow.openConfirm();
    };

    Scene_Battle.prototype.onCopyForgetConfirmYes = function () {
        const actor = CopyAttack.pendingActor();
        const forgetSkill = this._pendingDiscardSkill;
        const prevIndex = this._copySkillDiscardWindow
            ? this._copySkillDiscardWindow.index()
            : 0;
        this._pendingDiscardSkill = null;

        // 先にリスト側へフォーカスを戻し、入力ウィンドウ空白のフレームを作らない
        if (this._copySkillDiscardWindow) {
            this._copySkillDiscardWindow.show();
        }

        if (this._copySkillConfirmWindow) {
            this._copySkillConfirmWindow.closeConfirm();
        }

        if (!actor || !forgetSkill) {
            this.returnToBattleForgetList(prevIndex);
            return;
        }

        const usedSkill = CopyAttack.pendingForgetSkill();
        const filter = CopyAttack.pendingForgetGroup();
        actor.removeCopiedSkill(forgetSkill.id);

        // コスト消費のみ（SEは確認ウィンドウの playOk に統一。playUseSkill は鳴らさない）
        if (usedSkill && !CopyAttack._forgetCostPaid) {
            actor.useItem(usedSkill);
            CopyAttack._forgetCostPaid = true;
        }

        // 対象グループ内が0個になったときだけ閉じる
        if (!CopyAttack.hasForgetableCopiedSkills(actor, filter)) {
            this.endInputForgetSelection(false);
            return;
        }

        // 連続削除: 削除ウィンドウを維持
        this.returnToBattleForgetList(prevIndex);
    };

    /**
     * 技忘れリストへフォーカスを戻す（連続削除）
     * @param {number} [prevIndex]
     */
    Scene_Battle.prototype.returnToBattleForgetList = function (prevIndex) {
        const actor = CopyAttack.pendingActor();
        const filter = CopyAttack.pendingForgetGroup();
        this._pendingDiscardSkill = null;

        if (this._copySkillConfirmWindow) {
            this._copySkillConfirmWindow.closeConfirm();
        }

        if (!actor || !CopyAttack.hasForgetableCopiedSkills(actor, filter)) {
            this.endInputForgetSelection(false);
            return;
        }

        const win = this._copySkillDiscardWindow;
        win.setActor(actor, filter);
        if (!win.reloadAndActivate(prevIndex)) {
            this.endInputForgetSelection(false);
            return;
        }
        this.beginCopyHelpOwner(win);
    };

    Scene_Battle.prototype.onCopyForgetConfirmNo = function () {
        this._pendingDiscardSkill = null;
        if (this._copySkillConfirmWindow) {
            this._copySkillConfirmWindow.closeConfirm();
        }
        this.returnToBattleForgetList(
            this._copySkillDiscardWindow ? this._copySkillDiscardWindow.index() : 0
        );
    };

    Scene_Battle.prototype.onCopySkillDiscardCancel = function () {
        // キャンセル時のみ前の画面へ戻る
        this._pendingDiscardSkill = null;
        if (this._copySkillConfirmWindow) {
            this._copySkillConfirmWindow.closeConfirm();
        }
        this.endInputForgetSelection(true);
    };

    Scene_Battle.prototype.hideCopySkillUi = function () {
        this.endCopyHelpOwner();
        this._pendingDiscardSkill = null;
        if (this._copySkillWindow) {
            this._copySkillWindow.deactivate();
            this._copySkillWindow.hide();
        }
        if (this._copySkillDiscardWindow) {
            this._copySkillDiscardWindow.deactivate();
            this._copySkillDiscardWindow.hide();
        }
        if (this._copySkillConfirmWindow) {
            this._copySkillConfirmWindow.closeConfirm();
        }
        if (this._helpWindow) {
            this._helpWindow.hide();
        }
    };

    Scene_Battle.prototype.endCopySkillSelection = function () {
        this.hideCopySkillUi();
        this._copySkillSelectStarted = false;
        BattleManager.finishCopyAttackSelect();
    };

    // ---- 技忘れ（戦闘入力フェーズ・ターン非消費） ----

    const _Scene_Battle_onSkillOk = Scene_Battle.prototype.onSkillOk;
    /** @override */
    Scene_Battle.prototype.onSkillOk = function () {
        const skill = this._skillWindow.item();
        if (CopyAttack.isForgetSkill(skill)) {
            this.startInputForgetSelection(skill);
            return;
        }
        _Scene_Battle_onSkillOk.call(this);
    };

    /**
     * @param {object} skill
     */
    Scene_Battle.prototype.startInputForgetSelection = function (skill) {
        const actor = BattleManager.actor();
        if (!actor) {
            return;
        }
        // canUse で既に弾いているが、念のため（ブザーは鳴らさない）
        if (!CopyAttack.hasForgetableCopiedSkills(actor, CopyAttack.getForgetGroup(skill))) {
            this._skillWindow.activate();
            return;
        }

        CopyAttack.reserveForgetSelect(actor, skill, true);
        // 先に所有者を設定してから skillWindow.hide（hideHelpWindow 対策）
        CopyAttack.setHelpOwner(this._copySkillDiscardWindow);
        this._skillWindow.hide();
        this._actorCommandWindow.deactivate();
        this.closeCopySkillBlockingWindows();
        this.startCopySkillDiscard();
    };

    /**
     * @param {boolean} cancelled
     */
    Scene_Battle.prototype.endInputForgetSelection = function (cancelled) {
        this.hideCopySkillUi();
        CopyAttack.clearPending();
        this._statusWindow.show();
        if (cancelled) {
            this._skillWindow.show();
            this._skillWindow.activate();
            this._helpWindow.show();
        } else {
            this._actorCommandWindow.show();
            this._actorCommandWindow.activate();
        }
    };

    const _Scene_Battle_isAnyInputWindowActive = Scene_Battle.prototype.isAnyInputWindowActive;
    /** @override */
    Scene_Battle.prototype.isAnyInputWindowActive = function () {
        return (
            _Scene_Battle_isAnyInputWindowActive.call(this) ||
            (this._copySkillWindow && this._copySkillWindow.active) ||
            (this._copySkillDiscardWindow &&
                (this._copySkillDiscardWindow.active || this._copySkillDiscardWindow.visible)) ||
            (this._copySkillConfirmWindow && this._copySkillConfirmWindow.active) ||
            CopyAttack.isForgetSelectOpen()
        );
    };

    const _Scene_Battle_isTimeActive = Scene_Battle.prototype.isTimeActive;
    /** @override */
    Scene_Battle.prototype.isTimeActive = function () {
        if (CopyAttack.isForgetSelectOpen()) {
            return false;
        }
        if (this._copySkillWindow && this._copySkillWindow.active) {
            return false;
        }
        if (this._copySkillDiscardWindow && this._copySkillDiscardWindow.visible) {
            return false;
        }
        if (this._copySkillConfirmWindow && this._copySkillConfirmWindow.active) {
            return false;
        }
        return _Scene_Battle_isTimeActive.call(this);
    };

    // -------------------------------------------------------------------------
    // Scene_Skill（メニューからの技忘れ）
    // -------------------------------------------------------------------------

    const _Scene_ItemBase_isItemEffectsValid = Scene_ItemBase.prototype.isItemEffectsValid;
    /** @override */
    Scene_ItemBase.prototype.isItemEffectsValid = function () {
        if (CopyAttack.isForgetSkill(this.item())) {
            const user = this.user();
            const filter = CopyAttack.getForgetGroup(this.item());
            return !!(user && user.isActor() && CopyAttack.hasForgetableCopiedSkills(user, filter));
        }
        return _Scene_ItemBase_isItemEffectsValid.call(this);
    };

    const _Scene_Skill_create = Scene_Skill.prototype.create;
    /** @override */
    Scene_Skill.prototype.create = function () {
        _Scene_Skill_create.call(this);
        this.createCopyForgetWindow();
    };

    Scene_Skill.prototype.createCopyForgetWindow = function () {
        const rect = CopyAttack.makeWindowRect(this, "discard");
        this._copyForgetWindow = new Window_CopyAttackForgetList(rect);
        this._copyForgetWindow.setHelpWindow(this._helpWindow);
        this._copyForgetWindow.setHandler("ok", this.onCopyForgetOk.bind(this));
        this._copyForgetWindow.setHandler("cancel", this.onCopyForgetCancel.bind(this));
        this.addWindow(this._copyForgetWindow);

        this._copyForgetConfirmWindow = new Window_CopyAttackConfirm(
            CopyAttack.makeConfirmWindowRect()
        );
        this._copyForgetConfirmWindow.setHelpWindow(this._helpWindow);
        this._copyForgetConfirmWindow.setHandler("yes", this.onCopyForgetConfirmYes.bind(this));
        this._copyForgetConfirmWindow.setHandler("no", this.onCopyForgetConfirmNo.bind(this));
        this._copyForgetConfirmWindow.setHandler("cancel", this.onCopyForgetConfirmNo.bind(this));
        this.addWindow(this._copyForgetConfirmWindow);
        this._pendingForgetSkill = null;
    };

    const _Scene_Skill_update = Scene_Skill.prototype.update;
    /** @override */
    Scene_Skill.prototype.update = function () {
        _Scene_Skill_update.call(this);
        CopyAttack.refreshOwnedHelp(this._helpWindow);
    };

    const _Scene_Skill_determineItem = Scene_Skill.prototype.determineItem;
    /** @override */
    Scene_Skill.prototype.determineItem = function () {
        if (CopyAttack.isForgetSkill(this.item())) {
            this.startMenuCopyForget();
            return;
        }
        _Scene_Skill_determineItem.call(this);
    };

    Scene_Skill.prototype.startMenuCopyForget = function () {
        const actor = this.user();
        const filter = CopyAttack.getForgetGroup(this.item());
        if (!actor || !CopyAttack.hasForgetableCopiedSkills(actor, filter)) {
            this.activateItemWindow();
            return;
        }
        this._itemWindow.deactivate();
        this._copyForgetConfirmWindow.closeConfirm();
        this._pendingForgetSkill = null;
        this._menuForgetCostPaid = false;
        this._copyForgetGroup = filter;
        this._copyForgetWindow.setActor(actor, filter);
        this._copyForgetWindow.show();
        this._copyForgetWindow.activate();
        this._copyForgetWindow.select(0);
        CopyAttack.setHelpOwner(this._copyForgetWindow);
        this._copyForgetWindow.updateHelp();
    };

    Scene_Skill.prototype.onCopyForgetOk = function () {
        const actor = this.user();
        const forgetSkill = this._copyForgetWindow.item();
        if (!actor || !forgetSkill) {
            this.returnToMenuForgetList();
            return;
        }
        this._pendingForgetSkill = forgetSkill;
        this._copyForgetWindow.deactivate();
        CopyAttack.setHelpOwner(this._copyForgetConfirmWindow);
        this._copyForgetConfirmWindow.openConfirm();
        this._copyForgetConfirmWindow.updateHelp();
    };

    Scene_Skill.prototype.onCopyForgetConfirmYes = function () {
        const actor = this.user();
        const forgetSkill = this._pendingForgetSkill;
        const usedSkill = this.item();
        const prevIndex = this._copyForgetWindow ? this._copyForgetWindow.index() : 0;
        const filter = this._copyForgetGroup;
        this._pendingForgetSkill = null;

        if (this._copyForgetWindow) {
            this._copyForgetWindow.show();
        }
        if (this._copyForgetConfirmWindow) {
            this._copyForgetConfirmWindow.closeConfirm();
        }

        if (!actor || !forgetSkill) {
            this.returnToMenuForgetList(prevIndex);
            return;
        }

        actor.removeCopiedSkill(forgetSkill.id);
        // コスト消費のみ（SEは確認ウィンドウの playOk に統一。playUseSkill は鳴らさない）
        if (usedSkill && !this._menuForgetCostPaid) {
            actor.useItem(usedSkill);
            this._menuForgetCostPaid = true;
        }
        if (this._statusWindow) {
            this._statusWindow.refresh();
        }

        // 対象グループ内が0個になったときだけ閉じる
        if (!CopyAttack.hasForgetableCopiedSkills(actor, filter)) {
            this.finishMenuCopyForget();
            return;
        }

        // 連続削除: 削除ウィンドウを維持
        this.returnToMenuForgetList(prevIndex);
    };

    /**
     * メニュー技忘れリストへフォーカスを戻す
     * @param {number} [prevIndex]
     */
    Scene_Skill.prototype.returnToMenuForgetList = function (prevIndex) {
        const actor = this.user();
        const filter = this._copyForgetGroup;
        this._pendingForgetSkill = null;
        if (this._copyForgetConfirmWindow) {
            this._copyForgetConfirmWindow.closeConfirm();
        }
        if (!actor || !CopyAttack.hasForgetableCopiedSkills(actor, filter)) {
            this.finishMenuCopyForget();
            return;
        }
        this._copyForgetWindow.setActor(actor, filter);
        if (!this._copyForgetWindow.reloadAndActivate(prevIndex)) {
            this.finishMenuCopyForget();
            return;
        }
        CopyAttack.setHelpOwner(this._copyForgetWindow);
    };

    Scene_Skill.prototype.finishMenuCopyForget = function () {
        this._pendingForgetSkill = null;
        this._menuForgetCostPaid = false;
        if (this._copyForgetConfirmWindow) {
            this._copyForgetConfirmWindow.closeConfirm();
        }
        CopyAttack.setHelpOwner(null);
        if (this._copyForgetWindow) {
            this._copyForgetWindow.hide();
            this._copyForgetWindow.deactivate();
        }
        if (this._statusWindow) {
            this._statusWindow.refresh();
        }
        this.activateItemWindow();
    };

    Scene_Skill.prototype.onCopyForgetConfirmNo = function () {
        this._pendingForgetSkill = null;
        if (this._copyForgetConfirmWindow) {
            this._copyForgetConfirmWindow.closeConfirm();
        }
        this.returnToMenuForgetList(
            this._copyForgetWindow ? this._copyForgetWindow.index() : 0
        );
    };

    Scene_Skill.prototype.onCopyForgetCancel = function () {
        // キャンセル時のみ前の画面へ戻る
        this.finishMenuCopyForget();
    };

    // -------------------------------------------------------------------------
    // プラグインコマンド用シーン
    // -------------------------------------------------------------------------

    /**
     * コピー技の手動習得シーン
     * @extends Scene_MenuBase
     */
    function Scene_CopyAttackLearn() {
        this.initialize(...arguments);
    }

    Scene_CopyAttackLearn.prototype = Object.create(Scene_MenuBase.prototype);
    Scene_CopyAttackLearn.prototype.constructor = Scene_CopyAttackLearn;

    Scene_CopyAttackLearn.prototype.initialize = function () {
        Scene_MenuBase.prototype.initialize.call(this);
        const params = CopyAttack._commandSceneParams || {};
        this._targetActor = CopyAttack.resolveActor(params.actorId);
        this._group = CopyAttack.DEFAULT_GROUP;
        this._filterGroup = CopyAttack.parseFilterGroupArg(params.groupId);
        this._skillIdFilter =
            params.skillIds && params.skillIds.length > 0 ? params.skillIds.slice() : null;
    };

    Scene_CopyAttackLearn.prototype.create = function () {
        Scene_MenuBase.prototype.create.call(this);
        this.createHelpWindow();
        this.createLearnWindow();
        if (
            !this._targetActor ||
            this._targetActor.isCopiedSkillFull(this._group) ||
            !this.hasLearnCandidates()
        ) {
            this.popScene();
            return;
        }
        this.startLearnSelection();
    };

    /**
     * 表示できる候補があるか
     * @returns {boolean}
     */
    Scene_CopyAttackLearn.prototype.hasLearnCandidates = function () {
        if (!this._targetActor) {
            return false;
        }
        if (this._skillIdFilter) {
            return this._skillIdFilter.some((id) => {
                const skill = $dataSkills[id];
                return (
                    !!skill &&
                    CopyAttack.isCopyableSkill(skill, this._filterGroup) &&
                    this._targetActor.canAddCopiedSkill(id, this._group)
                );
            });
        }
        return CopyAttack.manualLearnSkillIds(this._targetActor, this._filterGroup).length > 0;
    };

    Scene_CopyAttackLearn.prototype.createLearnWindow = function () {
        this._learnWindow = new Window_CopyAttackSkillList(CopyAttack.makeWindowRect(this, "select"));
        this._learnWindow.setHelpWindow(this._helpWindow);
        this._learnWindow.setHandler("ok", this.onLearnOk.bind(this));
        this._learnWindow.setHandler("cancel", this.onLearnCancel.bind(this));
        this.addWindow(this._learnWindow);
    };

    Scene_CopyAttackLearn.prototype.startLearnSelection = function () {
        this._learnWindow.setManualActor(
            this._targetActor,
            this._skillIdFilter,
            this._group,
            this._filterGroup
        );
        this._learnWindow.show();
        this._learnWindow.activate();
        this._learnWindow.select(0);
        CopyAttack.setHelpOwner(this._learnWindow);
        this._helpWindow.show();
        this._learnWindow.updateHelp();
    };

    const _Scene_CopyAttackLearn_update = Scene_CopyAttackLearn.prototype.update;
    Scene_CopyAttackLearn.prototype.update = function () {
        _Scene_CopyAttackLearn_update.call(this);
        CopyAttack.refreshOwnedHelp(this._helpWindow);
    };

    Scene_CopyAttackLearn.prototype.onLearnOk = function () {
        const skill = this._learnWindow.item();
        const actor = this._targetActor;
        if (!actor || !skill) {
            this.onLearnCancel();
            return;
        }
        if (!actor.canAddCopiedSkill(skill.id, this._group)) {
            this._learnWindow.activate();
            return;
        }
        actor.addCopiedSkill(skill.id, this._group);
        CopyAttack.playSuccessAnimation(actor, null);
        this.finishScene();
    };

    Scene_CopyAttackLearn.prototype.onLearnCancel = function () {
        this.finishScene();
    };

    Scene_CopyAttackLearn.prototype.finishScene = function () {
        CopyAttack.setHelpOwner(null);
        CopyAttack._commandSceneParams = null;
        this.popScene();
    };

    /**
     * コピー技の手動削除シーン
     * @extends Scene_MenuBase
     */
    function Scene_CopyAttackForget() {
        this.initialize(...arguments);
    }

    Scene_CopyAttackForget.prototype = Object.create(Scene_MenuBase.prototype);
    Scene_CopyAttackForget.prototype.constructor = Scene_CopyAttackForget;

    Scene_CopyAttackForget.prototype.initialize = function () {
        Scene_MenuBase.prototype.initialize.call(this);
        const params = CopyAttack._commandSceneParams || {};
        this._targetActor = CopyAttack.resolveActor(params.actorId);
        // null = 全コピー技 / 文字列 = その CopyGroup のみ
        this._group = CopyAttack.parseFilterGroupArg(params.groupId);
    };

    Scene_CopyAttackForget.prototype.create = function () {
        Scene_MenuBase.prototype.create.call(this);
        this.createHelpWindow();
        this.createForgetWindow();
        this.createConfirmWindow();
        if (
            !this._targetActor ||
            !CopyAttack.hasForgetableCopiedSkills(this._targetActor, this._group)
        ) {
            this.popScene();
            return;
        }
        this.startForgetSelection();
    };

    Scene_CopyAttackForget.prototype.createForgetWindow = function () {
        this._forgetWindow = new Window_CopyAttackForgetList(CopyAttack.makeWindowRect(this, "discard"));
        this._forgetWindow.setHelpWindow(this._helpWindow);
        this._forgetWindow.setHandler("ok", this.onForgetOk.bind(this));
        this._forgetWindow.setHandler("cancel", this.onForgetCancel.bind(this));
        this.addWindow(this._forgetWindow);
    };

    Scene_CopyAttackForget.prototype.createConfirmWindow = function () {
        this._confirmWindow = new Window_CopyAttackConfirm(CopyAttack.makeConfirmWindowRect());
        this._confirmWindow.setHelpWindow(this._helpWindow);
        this._confirmWindow.setHandler("yes", this.onForgetConfirmYes.bind(this));
        this._confirmWindow.setHandler("no", this.onForgetConfirmNo.bind(this));
        this._confirmWindow.setHandler("cancel", this.onForgetConfirmNo.bind(this));
        this.addWindow(this._confirmWindow);
        this._pendingForgetSkill = null;
    };

    Scene_CopyAttackForget.prototype.startForgetSelection = function () {
        this._confirmWindow.closeConfirm();
        this._pendingForgetSkill = null;
        this._forgetWindow.setActor(this._targetActor, this._group);
        this._forgetWindow.show();
        this._forgetWindow.activate();
        this._forgetWindow.select(0);
        CopyAttack.setHelpOwner(this._forgetWindow);
        this._helpWindow.show();
        this._forgetWindow.updateHelp();
    };

    const _Scene_CopyAttackForget_update = Scene_CopyAttackForget.prototype.update;
    Scene_CopyAttackForget.prototype.update = function () {
        _Scene_CopyAttackForget_update.call(this);
        CopyAttack.refreshOwnedHelp(this._helpWindow);
    };

    Scene_CopyAttackForget.prototype.onForgetOk = function () {
        const actor = this._targetActor;
        const skill = this._forgetWindow.item();
        if (!actor || !skill) {
            this.returnToPluginForgetList();
            return;
        }
        this._pendingForgetSkill = skill;
        this._forgetWindow.deactivate();
        CopyAttack.setHelpOwner(this._confirmWindow);
        this._confirmWindow.openConfirm();
        this._confirmWindow.updateHelp();
    };

    Scene_CopyAttackForget.prototype.onForgetConfirmYes = function () {
        const actor = this._targetActor;
        const skill = this._pendingForgetSkill;
        const prevIndex = this._forgetWindow ? this._forgetWindow.index() : 0;
        this._pendingForgetSkill = null;

        if (this._forgetWindow) {
            this._forgetWindow.show();
        }
        if (this._confirmWindow) {
            this._confirmWindow.closeConfirm();
        }

        if (actor && skill) {
            actor.removeCopiedSkill(skill.id);
        }

        // 対象グループ内が0個になったときだけ閉じる
        if (!actor || !CopyAttack.hasForgetableCopiedSkills(actor, this._group)) {
            this.finishScene();
            return;
        }

        // 連続削除: 削除ウィンドウを維持
        this.returnToPluginForgetList(prevIndex);
    };

    /**
     * プラグインコマンド技忘れリストへフォーカスを戻す
     * @param {number} [prevIndex]
     */
    Scene_CopyAttackForget.prototype.returnToPluginForgetList = function (prevIndex) {
        const actor = this._targetActor;
        this._pendingForgetSkill = null;
        if (this._confirmWindow) {
            this._confirmWindow.closeConfirm();
        }
        if (!actor || !CopyAttack.hasForgetableCopiedSkills(actor, this._group)) {
            this.finishScene();
            return;
        }
        this._forgetWindow.setActor(actor, this._group);
        if (!this._forgetWindow.reloadAndActivate(prevIndex)) {
            this.finishScene();
            return;
        }
        CopyAttack.setHelpOwner(this._forgetWindow);
        this._forgetWindow.updateHelp();
    };

    Scene_CopyAttackForget.prototype.onForgetConfirmNo = function () {
        this._pendingForgetSkill = null;
        if (this._confirmWindow) {
            this._confirmWindow.closeConfirm();
        }
        this.returnToPluginForgetList(
            this._forgetWindow ? this._forgetWindow.index() : 0
        );
    };

    Scene_CopyAttackForget.prototype.onForgetCancel = function () {
        // キャンセル時のみ前の画面へ戻る
        this._pendingForgetSkill = null;
        if (this._confirmWindow) {
            this._confirmWindow.closeConfirm();
        }
        this.finishScene();
    };

    Scene_CopyAttackForget.prototype.finishScene = function () {
        CopyAttack.setHelpOwner(null);
        CopyAttack._commandSceneParams = null;
        this.popScene();
    };

    // -------------------------------------------------------------------------
    // プラグインコマンド
    // -------------------------------------------------------------------------

    const PLUGIN_NAME = pluginName();

    PluginManager.registerCommand(PLUGIN_NAME, "LearnCopiedSkillByPlayer", (args) => {
        const actor = CopyAttack.resolveActor(args.actorId);
        const storage = CopyAttack.DEFAULT_GROUP;
        const filter = CopyAttack.parseFilterGroupArg(args.groupId);
        if (
            !actor ||
            actor.isCopiedSkillFull(storage) ||
            CopyAttack.manualLearnSkillIds(actor, filter).length === 0
        ) {
            return;
        }
        CopyAttack.pushCommandScene(Scene_CopyAttackLearn, {
            actorId: Number(args.actorId || 0),
            groupId: filter,
        });
    });

    PluginManager.registerCommand(PLUGIN_NAME, "LearnCopiedSkillFromListByPlayer", (args) => {
        const actor = CopyAttack.resolveActor(args.actorId);
        const storage = CopyAttack.DEFAULT_GROUP;
        const filter = CopyAttack.parseFilterGroupArg(args.groupId);
        const skillIds = CopyAttack.parseSkillIdList(args.skillIds);
        if (!actor || actor.isCopiedSkillFull(storage) || skillIds.length === 0) {
            return;
        }
        const learnable = skillIds.filter((id) => {
            const skill = $dataSkills[id];
            return (
                !!skill &&
                CopyAttack.isCopyableSkill(skill, filter) &&
                actor.canAddCopiedSkill(id, storage)
            );
        });
        if (learnable.length === 0) {
            return;
        }
        CopyAttack.pushCommandScene(Scene_CopyAttackLearn, {
            actorId: Number(args.actorId || 0),
            skillIds: skillIds,
            groupId: filter,
        });
    });

    PluginManager.registerCommand(PLUGIN_NAME, "AddCopiedSkillDirect", (args) => {
        const actor = CopyAttack.resolveActor(args.actorId);
        const storage = CopyAttack.DEFAULT_GROUP;
        const skillId = Number(args.skillId || 0);
        if (!actor || skillId <= 0 || !$dataSkills[skillId]) {
            return;
        }
        if (actor.isCopiedSkillFull(storage)) {
            return;
        }
        actor.addCopiedSkill(skillId, storage);
    });

    PluginManager.registerCommand(PLUGIN_NAME, "ForgetCopiedSkillByPlayer", (args) => {
        const actor = CopyAttack.resolveActor(args.actorId);
        const filter = CopyAttack.parseFilterGroupArg(args.groupId);
        if (!actor || !CopyAttack.hasForgetableCopiedSkills(actor, filter)) {
            return;
        }
        CopyAttack.pushCommandScene(Scene_CopyAttackForget, {
            actorId: Number(args.actorId || 0),
            groupId: filter,
        });
    });

    PluginManager.registerCommand(PLUGIN_NAME, "RemoveCopiedSkillDirect", (args) => {
        const actor = CopyAttack.resolveActor(args.actorId);
        const skillId = Number(args.skillId || 0);
        if (!actor || skillId <= 0) {
            return;
        }
        actor.removeCopiedSkill(skillId);
    });

    PluginManager.registerCommand(PLUGIN_NAME, "SetMaxCopiedSkills", (args) => {
        const maxCount = Math.max(1, Math.min(99, Number(args.maxCount || 1)));
        const storage = CopyAttack.DEFAULT_GROUP;
        const actors = CopyAttack.resolveActorsForMax(args.actorId);
        for (const actor of actors) {
            actor.setMaxCopiedSkills(maxCount, storage);
        }
    });

    const _Game_Interpreter_updateWaitMode = Game_Interpreter.prototype.updateWaitMode;
    /** プラグインコマンドシーン終了までイベントを待機 */
    Game_Interpreter.prototype.updateWaitMode = function () {
        if (this._waitMode === "copyAttackCommand") {
            if (SceneManager.isSceneChanging()) {
                return true;
            }
            if (!(SceneManager._scene instanceof Scene_Map)) {
                return true;
            }
            this._waitMode = "";
            return false;
        }
        return _Game_Interpreter_updateWaitMode.call(this);
    };
})();
