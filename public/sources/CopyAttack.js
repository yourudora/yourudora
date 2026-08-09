/*:
 * @target MZ
 * @plugindesc [CopyAttack] 戦闘中に敵の技をコピーして習得する
 * @author Open Source
 * @url
 * @help CopyAttack.js
 *
 * 【概要】
 * 戦闘中に「コピー用スキル」を敵へ使うと、その敵が持つスキルから
 * 1つを選んでアクターのコピー技として習得できます。
 *
 * 【メモ欄タグ】（タグ名はパラメータで変更可／旧タグも互換対応）
 * ■ スキル
 *   <CopyAttack>           … コピー開始スキル
 *   <CopyAttackForget>     … 技忘れスキル（ターン非消費）
 *   <NoCopyAttack>         … コピー候補から除外
 *   <CopyAttackLearned>    … コピーで得た技の識別用（他プラグイン連携）
 * ■ 敵キャラ
 *   <CopyAttackHpRate:30>  … HPが最大の30%以下になるまでコピー対象にできない
 *
 * 旧タグ互換: <CopySkill> <ForgetSkill> <NoCopy> <CopyHpRate:n> など
 *
 * 【使い方】
 * 1. パラメータ「コピー用スキルID」を設定するか、スキルに <CopyAttack> を書く
 * 2. コピー用スキルのスコープは「敵単体」にする
 * 3. 技忘れは <CopyAttackForget>（スコープ「なし」推奨）
 *
 * 【保持上限】
 * コピー技が最大数に達している間はコピー用スキルを使用不可（グレーアウト）です。
 * 技忘れなどで枠を空けてから再度コピーしてください。
 *
 * 【削除確認】
 * 技忘れ／手動削除時は「本当に消しますか？」確認が出ます（初期カーソルは「いいえ」）。
 *
 * 【プラグインコマンド】
 * - LearnCopiedSkillByPlayer … プレイヤー選択でコピー技を追加
 * - LearnCopiedSkillFromListByPlayer … 指定リストから選択・習得
 * - AddCopiedSkillDirect … 自動追加（画面なし）
 * - ForgetCopiedSkillByPlayer … プレイヤー選択で削除
 * - RemoveCopiedSkillDirect … 自動削除（画面なし）
 * - SetMaxCopiedSkills … 最大保持数を変更（セーブ対応）
 *
 * ※ 習得・忘却のバトルログは出しません（ウィンドウと成功アニメのみ）。
 *
 * @param copySkillId
 * @text コピー用スキルID
 * @desc コピー処理を開始するスキルのID。0の場合はメモタグのみで判定します。
 * @type skill
 * @default 0
 *
 * @param copySkillMetaTag
 * @text コピー用スキルタグ
 * @desc コピー用スキルとして扱うメモ欄タグ名
 * @default CopyAttack
 *
 * @param forgetSkillId
 * @text 技忘れ用スキルID
 * @desc コピー技を自発的に忘れるスキルのID。0の場合はメモタグのみで判定します。
 * @type skill
 * @default 0
 *
 * @param forgetSkillMetaTag
 * @text 技忘れ用スキルタグ
 * @desc 技忘れ用スキルとして扱うメモ欄タグ名
 * @default CopyAttackForget
 *
 * @param copiedSkillMetaTag
 * @text コピー技タグ
 * @desc コピーで取得した技として参照するメモ欄タグ名（他プラグイン連携用）
 * @default CopyAttackLearned
 *
 * @param copyableSkillMetaTag
 * @text コピー可能スキルタグ
 * @desc 設定時、このタグを持つ敵スキルのみコピー候補になります。空欄ですべて対象。
 * @default
 *
 * @param uncopyableSkillMetaTag
 * @text コピー不可スキルタグ
 * @desc このメモ欄タグが書かれたスキルは、敵が所持していてもコピー候補一覧に表示されなくなります。
 * @default NoCopyAttack
 *
 * @param defaultRequiredHpRate
 * @text デフォルト必要HP割合
 * @desc 敵メモに割合指定がないときの必要HP%（現在HPがこの値以下で選択可）。100で制限なし。
 * @type number
 * @min 1
 * @max 100
 * @default 100
 *
 * @param requiredHpRateMetaTag
 * @text 必要HP割合メモタグ
 * @desc 敵メモ欄のタグ名。例: <CopyAttackHpRate: 30> でHP30%以下まで削ると対象にできる
 * @default CopyAttackHpRate
 *
 * @param maxCopiedSkills
 * @text 最大保持数
 * @desc コピー技として保持できる最大数（未変更アクターのデフォルト。プラグインコマンドで上書き可）
 * @type number
 * @min 1
 * @max 99
 * @default 5
 *
 * @param excludeBasicSkills
 * @text 通常攻撃・防御を除外
 * @desc 敵の通常攻撃・防御をコピー候補から除外する
 * @type boolean
 * @default true
 *
 * @param successAnimationId
 * @text コピー成功時アニメーションID
 * @desc コピー成功時に再生するアニメーション。0で非再生。
 * @type animation
 * @default 0
 *
 * @param successAnimationTarget
 * @text コピー成功時アニメーション対象
 * @desc アニメーションを再生する対象
 * @type select
 * @option 使用者（アクター）
 * @value actor
 * @option 対象の敵
 * @value enemy
 * @default actor
 *
 * @param selectWindow
 * @text ■ 技選択ウィンドウ
 *
 * @param selectWindowX
 * @text 技選択 X
 * @desc -1でデフォルト位置
 * @type number
 * @min -9999
 * @parent selectWindow
 * @default -1
 *
 * @param selectWindowY
 * @text 技選択 Y
 * @desc -1でデフォルト位置
 * @type number
 * @min -9999
 * @parent selectWindow
 * @default -1
 *
 * @param selectWindowWidth
 * @text 技選択 幅
 * @desc 0でデフォルト幅
 * @type number
 * @min 0
 * @parent selectWindow
 * @default 0
 *
 * @param selectWindowHeight
 * @text 技選択 高さ
 * @desc 0でデフォルト高さ（行数が優先される場合あり）
 * @type number
 * @min 0
 * @parent selectWindow
 * @default 0
 *
 * @param selectWindowRows
 * @text 技選択 行数
 * @desc 0で高さから自動計算
 * @type number
 * @min 0
 * @parent selectWindow
 * @default 0
 *
 * @param selectWindowCols
 * @text 技選択 列数
 * @desc ウィンドウの列数
 * @type number
 * @min 1
 * @parent selectWindow
 * @default 1
 *
 * @param discardWindow
 * @text ■ 忘れるウィンドウ
 *
 * @param discardWindowX
 * @text 忘れる技 X
 * @desc -1でデフォルト位置
 * @type number
 * @min -9999
 * @parent discardWindow
 * @default -1
 *
 * @param discardWindowY
 * @text 忘れる技 Y
 * @desc -1でデフォルト位置
 * @type number
 * @min -9999
 * @parent discardWindow
 * @default -1
 *
 * @param discardWindowWidth
 * @text 忘れる技 幅
 * @desc 0でデフォルト幅
 * @type number
 * @min 0
 * @parent discardWindow
 * @default 0
 *
 * @param discardWindowHeight
 * @text 忘れる技 高さ
 * @desc 0でデフォルト高さ（行数が優先される場合あり）
 * @type number
 * @min 0
 * @parent discardWindow
 * @default 0
 *
 * @param discardWindowRows
 * @text 忘れる技 行数
 * @desc 0で高さから自動計算
 * @type number
 * @min 0
 * @parent discardWindow
 * @default 0
 *
 * @param discardWindowCols
 * @text 忘れる技 列数
 * @desc ウィンドウの列数
 * @type number
 * @min 1
 * @parent discardWindow
 * @default 1
 *
 * @param confirmWindow
 * @text ■ 削除確認ウィンドウ
 *
 * @param confirmMessage
 * @text 削除確認メッセージ
 * @desc 技を忘れる直前にヘルプへ表示する文言
 * @parent confirmWindow
 * @default 本当に消しますか？
 *
 * @param confirmYesText
 * @text 確認「はい」
 * @desc 削除を実行する選択肢の表示名
 * @parent confirmWindow
 * @default はい
 *
 * @param confirmNoText
 * @text 確認「いいえ」
 * @desc 削除をやめる選択肢の表示名（初期カーソル位置）
 * @parent confirmWindow
 * @default いいえ
 *
 * @command LearnCopiedSkillByPlayer
 * @text プレイヤー選択でコピー技を追加
 * @desc 指定アクターのコピー技習得画面を開きます。保持数上限時は開きません。
 *
 * @arg actorId
 * @text アクターID
 * @desc 対象アクター（0で先頭メンバー）
 * @type actor
 * @default 1
 *
 * @command LearnCopiedSkillFromListByPlayer
 * @text 指定リストからコピー技を選択・習得
 * @desc 指定したスキルIDリストの中から1つ選んでコピー技として習得します。保持数上限時は開きません。
 *
 * @arg actorId
 * @text アクターID
 * @desc 対象アクター（0で先頭メンバー）
 * @type actor
 * @default 1
 *
 * @arg skillIds
 * @text スキルリスト
 * @desc 選択肢として表示するスキル（複数選択可）
 * @type skill[]
 * @default []
 *
 * @command AddCopiedSkillDirect
 * @text 内部処理で自動的にコピー技を追加
 * @desc 指定スキルをコピー技として直接登録します（画面なし）。上限時は追加しません。
 *
 * @arg actorId
 * @text アクターID
 * @desc 対象アクター（0で先頭メンバー）
 * @type actor
 * @default 1
 *
 * @arg skillId
 * @text スキルID
 * @desc 追加するスキル
 * @type skill
 * @default 1
 *
 * @command ForgetCopiedSkillByPlayer
 * @text プレイヤー選択でコピー技を削除
 * @desc 保持中のコピー技から1つ選んで忘れさせる画面を開きます。
 *
 * @arg actorId
 * @text アクターID
 * @desc 対象アクター（0で先頭メンバー）
 * @type actor
 * @default 1
 *
 * @command RemoveCopiedSkillDirect
 * @text 内部処理で自動的にコピー技を削除
 * @desc 指定スキルのコピー技を直接削除します（画面なし）。未保持なら何もしません。
 *
 * @arg actorId
 * @text アクターID
 * @desc 対象アクター（0で先頭メンバー）
 * @type actor
 * @default 1
 *
 * @arg skillId
 * @text スキルID
 * @desc 削除するスキル
 * @type skill
 * @default 1
 *
 * @command SetMaxCopiedSkills
 * @text コピー技の最大保持数を変更
 * @desc コピー技として保持できる最大数を変更します。セーブデータに保存されます。
 *
 * @arg actorId
 * @text アクターID
 * @desc 対象アクター（0でパーティ全員）
 * @type actor
 * @default 0
 *
 * @arg maxCount
 * @text 最大保持数
 * @desc 変更後の最大保持数（1〜99）
 * @type number
 * @min 1
 * @max 99
 * @default 5
 */

/*:ja
 * @target MZ
 * @plugindesc [CopyAttack] 戦闘中に敵の技をコピーして習得する
 * @author Open Source
 * @url
 * @help CopyAttack.js
 *
 * 【概要】
 * 戦闘中に「コピー用スキル」を敵へ使うと、その敵が持つスキルから
 * 1つを選んでアクターのコピー技として習得できます。
 *
 * 【メモ欄タグ】（タグ名はパラメータで変更可／旧タグも互換対応）
 * ■ スキル
 *   <CopyAttack>           … コピー開始スキル
 *   <CopyAttackForget>     … 技忘れスキル（ターン非消費）
 *   <NoCopyAttack>         … コピー候補から除外
 *   <CopyAttackLearned>    … コピーで得た技の識別用（他プラグイン連携）
 * ■ 敵キャラ
 *   <CopyAttackHpRate:30>  … HPが最大の30%以下になるまでコピー対象にできない
 *
 * 旧タグ互換: <CopySkill> <ForgetSkill> <NoCopy> <CopyHpRate:n> など
 *
 * 【使い方】
 * 1. パラメータ「コピー用スキルID」を設定するか、スキルに <CopyAttack> を書く
 * 2. コピー用スキルのスコープは「敵単体」にする
 * 3. 技忘れは <CopyAttackForget>（スコープ「なし」推奨）
 *
 * 【保持上限】
 * コピー技が最大数に達している間はコピー用スキルを使用不可（グレーアウト）です。
 * 技忘れなどで枠を空けてから再度コピーしてください。
 *
 * 【削除確認】
 * 技忘れ／手動削除時は「本当に消しますか？」確認が出ます（初期カーソルは「いいえ」）。
 *
 * 【プラグインコマンド】
 * - LearnCopiedSkillByPlayer … プレイヤー選択でコピー技を追加
 * - LearnCopiedSkillFromListByPlayer … 指定リストから選択・習得
 * - AddCopiedSkillDirect … 自動追加（画面なし）
 * - ForgetCopiedSkillByPlayer … プレイヤー選択で削除
 * - RemoveCopiedSkillDirect … 自動削除（画面なし）
 * - SetMaxCopiedSkills … 最大保持数を変更（セーブ対応）
 *
 * ※ 習得・忘却のバトルログは出しません（ウィンドウと成功アニメのみ）。
 *
 * @param copySkillId
 * @text コピー用スキルID
 * @desc コピー処理を開始するスキルのID。0の場合はメモタグのみで判定します。
 * @type skill
 * @default 0
 *
 * @param copySkillMetaTag
 * @text コピー用スキルタグ
 * @desc コピー用スキルとして扱うメモ欄タグ名
 * @default CopyAttack
 *
 * @param forgetSkillId
 * @text 技忘れ用スキルID
 * @desc コピー技を自発的に忘れるスキルのID。0の場合はメモタグのみで判定します。
 * @type skill
 * @default 0
 *
 * @param forgetSkillMetaTag
 * @text 技忘れ用スキルタグ
 * @desc 技忘れ用スキルとして扱うメモ欄タグ名
 * @default CopyAttackForget
 *
 * @param copiedSkillMetaTag
 * @text コピー技タグ
 * @desc コピーで取得した技として参照するメモ欄タグ名（他プラグイン連携用）
 * @default CopyAttackLearned
 *
 * @param copyableSkillMetaTag
 * @text コピー可能スキルタグ
 * @desc 設定時、このタグを持つ敵スキルのみコピー候補になります。空欄ですべて対象。
 * @default
 *
 * @param uncopyableSkillMetaTag
 * @text コピー不可スキルタグ
 * @desc このメモ欄タグが書かれたスキルは、敵が所持していてもコピー候補一覧に表示されなくなります。
 * @default NoCopyAttack
 *
 * @param defaultRequiredHpRate
 * @text デフォルト必要HP割合
 * @desc 敵メモに割合指定がないときの必要HP%（現在HPがこの値以下で選択可）。100で制限なし。
 * @type number
 * @min 1
 * @max 100
 * @default 100
 *
 * @param requiredHpRateMetaTag
 * @text 必要HP割合メモタグ
 * @desc 敵メモ欄のタグ名。例: <CopyAttackHpRate: 30> でHP30%以下まで削ると対象にできる
 * @default CopyAttackHpRate
 *
 * @param maxCopiedSkills
 * @text 最大保持数
 * @desc コピー技として保持できる最大数（未変更アクターのデフォルト。プラグインコマンドで上書き可）
 * @type number
 * @min 1
 * @max 99
 * @default 5
 *
 * @param excludeBasicSkills
 * @text 通常攻撃・防御を除外
 * @desc 敵の通常攻撃・防御をコピー候補から除外する
 * @type boolean
 * @default true
 *
 * @param successAnimationId
 * @text コピー成功時アニメーションID
 * @desc コピー成功時に再生するアニメーション。0で非再生。
 * @type animation
 * @default 0
 *
 * @param successAnimationTarget
 * @text コピー成功時アニメーション対象
 * @desc アニメーションを再生する対象
 * @type select
 * @option 使用者（アクター）
 * @value actor
 * @option 対象の敵
 * @value enemy
 * @default actor
 *
 * @param selectWindow
 * @text ■ 技選択ウィンドウ
 *
 * @param selectWindowX
 * @text 技選択 X
 * @desc -1でデフォルト位置
 * @type number
 * @min -9999
 * @parent selectWindow
 * @default -1
 *
 * @param selectWindowY
 * @text 技選択 Y
 * @desc -1でデフォルト位置
 * @type number
 * @min -9999
 * @parent selectWindow
 * @default -1
 *
 * @param selectWindowWidth
 * @text 技選択 幅
 * @desc 0でデフォルト幅
 * @type number
 * @min 0
 * @parent selectWindow
 * @default 0
 *
 * @param selectWindowHeight
 * @text 技選択 高さ
 * @desc 0でデフォルト高さ（行数が優先される場合あり）
 * @type number
 * @min 0
 * @parent selectWindow
 * @default 0
 *
 * @param selectWindowRows
 * @text 技選択 行数
 * @desc 0で高さから自動計算
 * @type number
 * @min 0
 * @parent selectWindow
 * @default 0
 *
 * @param selectWindowCols
 * @text 技選択 列数
 * @desc ウィンドウの列数
 * @type number
 * @min 1
 * @parent selectWindow
 * @default 1
 *
 * @param discardWindow
 * @text ■ 忘れるウィンドウ
 *
 * @param discardWindowX
 * @text 忘れる技 X
 * @desc -1でデフォルト位置
 * @type number
 * @min -9999
 * @parent discardWindow
 * @default -1
 *
 * @param discardWindowY
 * @text 忘れる技 Y
 * @desc -1でデフォルト位置
 * @type number
 * @min -9999
 * @parent discardWindow
 * @default -1
 *
 * @param discardWindowWidth
 * @text 忘れる技 幅
 * @desc 0でデフォルト幅
 * @type number
 * @min 0
 * @parent discardWindow
 * @default 0
 *
 * @param discardWindowHeight
 * @text 忘れる技 高さ
 * @desc 0でデフォルト高さ（行数が優先される場合あり）
 * @type number
 * @min 0
 * @parent discardWindow
 * @default 0
 *
 * @param discardWindowRows
 * @text 忘れる技 行数
 * @desc 0で高さから自動計算
 * @type number
 * @min 0
 * @parent discardWindow
 * @default 0
 *
 * @param discardWindowCols
 * @text 忘れる技 列数
 * @desc ウィンドウの列数
 * @type number
 * @min 1
 * @parent discardWindow
 * @default 1
 *
 * @param confirmWindow
 * @text ■ 削除確認ウィンドウ
 *
 * @param confirmMessage
 * @text 削除確認メッセージ
 * @desc 技を忘れる直前にヘルプへ表示する文言
 * @parent confirmWindow
 * @default 本当に消しますか？
 *
 * @param confirmYesText
 * @text 確認「はい」
 * @desc 削除を実行する選択肢の表示名
 * @parent confirmWindow
 * @default はい
 *
 * @param confirmNoText
 * @text 確認「いいえ」
 * @desc 削除をやめる選択肢の表示名（初期カーソル位置）
 * @parent confirmWindow
 * @default いいえ
 *
 * @command LearnCopiedSkillByPlayer
 * @text プレイヤー選択でコピー技を追加
 * @desc 指定アクターのコピー技習得画面を開きます。保持数上限時は開きません。
 *
 * @arg actorId
 * @text アクターID
 * @desc 対象アクター（0で先頭メンバー）
 * @type actor
 * @default 1
 *
 * @command LearnCopiedSkillFromListByPlayer
 * @text 指定リストからコピー技を選択・習得
 * @desc 指定したスキルIDリストの中から1つ選んでコピー技として習得します。保持数上限時は開きません。
 *
 * @arg actorId
 * @text アクターID
 * @desc 対象アクター（0で先頭メンバー）
 * @type actor
 * @default 1
 *
 * @arg skillIds
 * @text スキルリスト
 * @desc 選択肢として表示するスキル（複数選択可）
 * @type skill[]
 * @default []
 *
 * @command AddCopiedSkillDirect
 * @text 内部処理で自動的にコピー技を追加
 * @desc 指定スキルをコピー技として直接登録します（画面なし）。上限時は追加しません。
 *
 * @arg actorId
 * @text アクターID
 * @desc 対象アクター（0で先頭メンバー）
 * @type actor
 * @default 1
 *
 * @arg skillId
 * @text スキルID
 * @desc 追加するスキル
 * @type skill
 * @default 1
 *
 * @command ForgetCopiedSkillByPlayer
 * @text プレイヤー選択でコピー技を削除
 * @desc 保持中のコピー技から1つ選んで忘れさせる画面を開きます。
 *
 * @arg actorId
 * @text アクターID
 * @desc 対象アクター（0で先頭メンバー）
 * @type actor
 * @default 1
 *
 * @command RemoveCopiedSkillDirect
 * @text 内部処理で自動的にコピー技を削除
 * @desc 指定スキルのコピー技を直接削除します（画面なし）。未保持なら何もしません。
 *
 * @arg actorId
 * @text アクターID
 * @desc 対象アクター（0で先頭メンバー）
 * @type actor
 * @default 1
 *
 * @arg skillId
 * @text スキルID
 * @desc 削除するスキル
 * @type skill
 * @default 1
 *
 * @command SetMaxCopiedSkills
 * @text コピー技の最大保持数を変更
 * @desc コピー技として保持できる最大数を変更します。セーブデータに保存されます。
 *
 * @arg actorId
 * @text アクターID
 * @desc 対象アクター（0でパーティ全員）
 * @type actor
 * @default 0
 *
 * @arg maxCount
 * @text 最大保持数
 * @desc 変更後の最大保持数（1〜99）
 * @type number
 * @min 1
 * @max 99
 * @default 5
 */

(() => {
    "use strict";

    /**
     * @namespace CopyAttack
     */
    const CopyAttack = (window.CopyAttack = window.CopyAttack || {});
    /** 二重ロード防止フラグ */
    if (CopyAttack.__loaded) {
        return;
    }
    CopyAttack.__loaded = true;

    /**
     * @returns {string}
     */
    function pluginName() {
        const script = document.currentScript;
        return script
            ? decodeURIComponent(script.src.match(/([^/\\]+\.js)/)[1]).replace(/\.js$/, "")
            : "CopyAttack";
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
            copiedSkillMetaTag: String(params.copiedSkillMetaTag || "CopyAttackLearned"),
            copyableSkillMetaTag: String(params.copyableSkillMetaTag || ""),
            uncopyableSkillMetaTag: String(params.uncopyableSkillMetaTag || "NoCopyAttack"),
            defaultRequiredHpRate: Math.max(
                1,
                Math.min(100, numberParam(params, "defaultRequiredHpRate", 100))
            ),
            requiredHpRateMetaTag: String(params.requiredHpRateMetaTag || "CopyAttackHpRate"),
            maxCopiedSkills: numberParam(params, "maxCopiedSkills", 5),
            excludeBasicSkills: params.excludeBasicSkills !== "false",
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
    /** コピー選択ウィンドウ開放直後の決定入力ガード（フレーム数） */
    CopyAttack.INPUT_GUARD_FRAMES = 12;
    CopyAttack.PHASE = "copyAttackSelect";
    CopyAttack.MODE_NONE = "";
    CopyAttack.MODE_COPY = "copy";
    CopyAttack.MODE_FORGET = "forget";

    /** @type {Game_Actor|null} */
    CopyAttack._pendingActor = null;
    /** @type {Game_Enemy|null} */
    CopyAttack._pendingEnemy = null;
    /** @type {string} */
    CopyAttack._pendingMode = CopyAttack.MODE_NONE;
    /** @type {object|null} */
    CopyAttack._pendingForgetSkill = null;
    /** @type {boolean} */
    CopyAttack._forgetFromInput = false;
    /** @type {Window_Selectable|null} ヘルプ所有ウィンドウ */
    CopyAttack._helpOwner = null;

    /**
     * @param {object|null} skill
     * @returns {boolean}
     */
    /**
     * メモ欄に指定タグ（または互換タグ）があるか
     * @param {object} data
     * @param {string} primaryTag
     * @param {string[]} legacyTags
     * @returns {boolean}
     */
    CopyAttack.hasMetaTag = function (data, primaryTag, legacyTags) {
        if (!data || !data.meta) {
            return false;
        }
        if (primaryTag && data.meta[primaryTag] != null) {
            return true;
        }
        if (legacyTags) {
            for (const tag of legacyTags) {
                if (tag && data.meta[tag] != null) {
                    return true;
                }
            }
        }
        return false;
    };

    /**
     * メモ欄の数値タグを取得（無ければ null）
     * @param {object} data
     * @param {string} primaryTag
     * @param {string[]} legacyTags
     * @returns {number|null}
     */
    CopyAttack.readMetaNumber = function (data, primaryTag, legacyTags) {
        if (!data || !data.meta) {
            return null;
        }
        const candidates = [primaryTag].concat(legacyTags || []);
        for (const tag of candidates) {
            if (!tag || data.meta[tag] == null || data.meta[tag] === true || data.meta[tag] === "") {
                continue;
            }
            const value = Number(data.meta[tag]);
            if (!Number.isNaN(value)) {
                return value;
            }
        }
        return null;
    };

    /**
     * コピー開始スキルかどうか
     * @param {object|null} skill
     * @returns {boolean}
     */
    CopyAttack.isCopySkill = function (skill) {
        if (!skill) {
            return false;
        }
        if (CopyAttack.params.copySkillId > 0 && skill.id === CopyAttack.params.copySkillId) {
            return true;
        }
        return CopyAttack.hasMetaTag(skill, CopyAttack.params.copySkillMetaTag, [
            "CopySkill",
            "copy_attack",
            "コピー",
        ]);
    };

    /**
     * 現在入力中の行動がコピー用スキルか
     * @returns {boolean}
     */
    CopyAttack.isSelectingCopySkillTarget = function () {
        const action = BattleManager.inputtingAction && BattleManager.inputtingAction();
        return !!(action && CopyAttack.isCopySkill(action.item()));
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
        const value = CopyAttack.readMetaNumber(enemy.enemy(), CopyAttack.params.requiredHpRateMetaTag, [
            "CopyHpRate",
            "copy_attack_hp_rate",
        ]);
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
     * （HP割合 ＋ 未習得かつコピー可能な技が1つ以上）
     * @param {Game_Enemy|null} enemy
     * @param {Game_Actor|null} [actor]
     * @returns {boolean}
     */
    CopyAttack.canCopyTargetEnemy = function (enemy, actor) {
        if (!CopyAttack.meetsCopyHpRate(enemy)) {
            return false;
        }
        const user = actor || CopyAttack.resolveCopyUserActor();
        if (user && user.isActor()) {
            return CopyAttack.availableCopySkillIds(enemy, user).length > 0;
        }
        // アクター不明時は敵がコピー可能スキルを1つでも持つかで判定
        return CopyAttack.enemyCopySkillIds(enemy).length > 0;
    };

    /**
     * 現在の敵グループにコピー条件を満たす敵が1体以上いるか
     * @param {Game_Actor|null} [actor]
     * @returns {boolean}
     */
    CopyAttack.hasValidCopyTargetEnemy = function (actor) {
        if (!$gameParty.inBattle() || !$gameTroop) {
            return true;
        }
        const user = actor || CopyAttack.resolveCopyUserActor();
        return $gameTroop.aliveMembers().some((enemy) =>
            CopyAttack.canCopyTargetEnemy(enemy, user)
        );
    };

    // -------------------------------------------------------------------------
    // コピー用スキルの使用可否
    // （保持数上限／条件を満たす敵がいない場合はスキル自体を不可）
    // -------------------------------------------------------------------------

    const _Game_BattlerBase_canUse = Game_BattlerBase.prototype.canUse;
    /**
     * コピー用スキルは、保持数上限または有効ターゲット不在のとき使用不可にする
     * @override
     */
    Game_BattlerBase.prototype.canUse = function (item) {
        if (!_Game_BattlerBase_canUse.call(this, item)) {
            return false;
        }
        if (this.isActor() && DataManager.isSkill(item) && CopyAttack.isCopySkill(item)) {
            if (this.isCopiedSkillFull()) {
                return false;
            }
            if ($gameParty.inBattle() && !CopyAttack.hasValidCopyTargetEnemy(this)) {
                return false;
            }
        }
        return true;
    };

    /**
     * @param {object|null} skill
     * @returns {boolean}
     */
    /**
     * 技忘れスキルかどうか
     * @param {object|null} skill
     * @returns {boolean}
     */
    CopyAttack.isForgetSkill = function (skill) {
        if (!skill) {
            return false;
        }
        if (CopyAttack.params.forgetSkillId > 0 && skill.id === CopyAttack.params.forgetSkillId) {
            return true;
        }
        return CopyAttack.hasMetaTag(skill, CopyAttack.params.forgetSkillMetaTag, [
            "ForgetSkill",
            "copy_attack_forget",
            "技忘れ",
        ]);
    };

    /**
     * 敵からコピー可能なスキルか
     * @param {object|null} skill
     * @returns {boolean}
     */
    CopyAttack.isCopyableSkill = function (skill) {
        if (!skill) {
            return false;
        }
        if (CopyAttack.params.excludeBasicSkills && (skill.id === 1 || skill.id === 2)) {
            return false;
        }
        if (
            CopyAttack.hasMetaTag(skill, CopyAttack.params.uncopyableSkillMetaTag, [
                "NoCopy",
                "no_copy_attack",
                "コピー不可",
            ])
        ) {
            return false;
        }
        const filterTag = CopyAttack.params.copyableSkillMetaTag;
        if (filterTag) {
            return CopyAttack.hasMetaTag(skill, filterTag, []);
        }
        return true;
    };

    /**
     * データベース上の手動習得候補スキルID一覧
     * @param {Game_Actor} actor
     * @returns {number[]}
     */
    CopyAttack.manualLearnSkillIds = function (actor) {
        if (!actor) {
            return [];
        }
        const ids = [];
        for (let i = 1; i < $dataSkills.length; i++) {
            const skill = $dataSkills[i];
            if (skill && CopyAttack.isCopyableSkill(skill) && actor.canAddCopiedSkill(skill.id)) {
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
     * @param {number} actorId
     * @returns {Game_Actor|null}
     */
    CopyAttack.resolveActor = function (actorId) {
        const id = Number(actorId || 0);
        if (id > 0) {
            return $gameActors.actor(id);
        }
        return $gameParty.members()[0] || null;
    };

    /**
     * プラグインコマンド用：actorId>0ならそのアクター、0ならパーティ全員
     * @param {number|string} actorId
     * @returns {Game_Actor[]}
     */
    CopyAttack.resolveActorsForMax = function (actorId) {
        const id = Number(actorId || 0);
        if (id > 0) {
            const actor = $gameActors.actor(id);
            return actor ? [actor] : [];
        }
        return $gameParty.members().filter((actor) => actor && actor.isActor());
    };

    /**
     * イベント待機用にシーンを開く
     * @param {Function} SceneClass
     * @param {object} params
     */
    CopyAttack.pushCommandScene = function (SceneClass, params) {
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
    };

    /**
     * @param {Window_Selectable} win
     * @returns {boolean}
     */
    CopyAttack.isHelpOwner = function (win) {
        return !!win && CopyAttack._helpOwner === win;
    };

    /**
     * @param {Game_Actor} actor
     * @param {Game_Battler} target
     */
    CopyAttack.reserveCopySelect = function (actor, target) {
        CopyAttack._pendingActor = actor;
        CopyAttack._pendingEnemy = target;
        CopyAttack._pendingMode = CopyAttack.MODE_COPY;
        CopyAttack._pendingForgetSkill = null;
        CopyAttack._forgetFromInput = false;
    };

    /**
     * @param {Game_Actor} actor
     * @param {object|null} forgetSkill
     * @param {boolean} fromInput
     */
    CopyAttack.reserveForgetSelect = function (actor, forgetSkill, fromInput) {
        CopyAttack._pendingActor = actor;
        CopyAttack._pendingEnemy = null;
        CopyAttack._pendingMode = CopyAttack.MODE_FORGET;
        CopyAttack._pendingForgetSkill = forgetSkill || null;
        CopyAttack._forgetFromInput = !!fromInput;
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

    /** @returns {Game_Enemy|null} */
    CopyAttack.pendingEnemy = function () {
        return CopyAttack._pendingEnemy;
    };

    /** @returns {string} */
    CopyAttack.pendingMode = function () {
        return CopyAttack._pendingMode;
    };

    /** @returns {object|null} */
    CopyAttack.pendingForgetSkill = function () {
        return CopyAttack._pendingForgetSkill;
    };

    CopyAttack.clearPending = function () {
        CopyAttack._pendingActor = null;
        CopyAttack._pendingEnemy = null;
        CopyAttack._pendingMode = CopyAttack.MODE_NONE;
        CopyAttack._pendingForgetSkill = null;
        CopyAttack._forgetFromInput = false;
    };

    /**
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
        return subject.opponentsUnit().members()[index] || null;
    };

    /**
     * @param {Game_Enemy} enemy
     * @returns {number[]}
     */
    CopyAttack.enemyCopySkillIds = function (enemy) {
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
            if (CopyAttack.isCopyableSkill(skill)) {
                skillIds.push(skillId);
            }
        }
        return skillIds.sort((a, b) => a - b);
    };

    /**
     * @param {Game_Enemy} enemy
     * @param {Game_Actor} actor
     * @returns {number[]}
     */
    CopyAttack.availableCopySkillIds = function (enemy, actor) {
        if (!enemy || !actor) {
            return [];
        }
        return CopyAttack.enemyCopySkillIds(enemy).filter((skillId) =>
            actor.canAddCopiedSkill(skillId)
        );
    };

    /**
     * @param {Game_Actor} actor
     * @param {Game_Enemy} enemy
     * @returns {boolean}
     */
    CopyAttack.needsCopySelect = function (actor, enemy) {
        return CopyAttack.availableCopySkillIds(enemy, actor).length > 0;
    };

    /**
     * @param {Game_Actor|null} actor
     * @param {Game_Enemy|null} enemy
     */
    CopyAttack.playSuccessAnimation = function (actor, enemy) {
        const animationId = CopyAttack.params.successAnimationId;
        if (animationId <= 0) {
            return;
        }
        const target =
            CopyAttack.params.successAnimationTarget === "enemy" ? enemy : actor;
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
    // Game_Actor
    // -------------------------------------------------------------------------

    const _Game_Actor_initMembers = Game_Actor.prototype.initMembers;
    /** @override */
    Game_Actor.prototype.initMembers = function () {
        _Game_Actor_initMembers.call(this);
        this._copiedSkills = [];
        // 未設定時はプラグインパラメータの maxCopiedSkills を参照
        this._maxCopiedSkills = null;
    };

    /** @returns {number[]} */
    Game_Actor.prototype.copiedSkillIds = function () {
        if (!this._copiedSkills) {
            this._copiedSkills = [];
        }
        return this._copiedSkills;
    };

    /**
     * コピー技の最大保持数（未設定ならプラグインパラメータ）
     * @returns {number}
     */
    Game_Actor.prototype.maxCopiedSkills = function () {
        if (this._maxCopiedSkills == null || this._maxCopiedSkills <= 0) {
            return CopyAttack.params.maxCopiedSkills;
        }
        return this._maxCopiedSkills;
    };

    /**
     * コピー技の最大保持数を変更（セーブデータに保存）
     * @param {number} maxCount
     */
    Game_Actor.prototype.setMaxCopiedSkills = function (maxCount) {
        const value = Math.max(1, Math.min(99, Number(maxCount) || 1));
        this._maxCopiedSkills = value;
    };

    /** @returns {object[]} */
    Game_Actor.prototype.copiedSkills = function () {
        return this.copiedSkillIds()
            .map((id) => $dataSkills[id])
            .filter((skill) => !!skill);
    };

    /**
     * @param {number} skillId
     * @returns {boolean}
     */
    Game_Actor.prototype.isCopiedSkill = function (skillId) {
        return this.copiedSkillIds().includes(skillId);
    };

    /** @returns {boolean} */
    Game_Actor.prototype.isCopiedSkillFull = function () {
        return this.copiedSkillIds().length >= this.maxCopiedSkills();
    };

    /**
     * @param {number} skillId
     * @returns {boolean}
     */
    Game_Actor.prototype.canAddCopiedSkill = function (skillId) {
        if (this.isCopiedSkill(skillId)) {
            return false;
        }
        if (this.isLearnedSkill(skillId)) {
            return false;
        }
        if (this.isCopiedSkillFull()) {
            return false;
        }
        return true;
    };

    /**
     * @param {number} skillId
     * @returns {boolean}
     */
    Game_Actor.prototype.addCopiedSkill = function (skillId) {
        if (!this.canAddCopiedSkill(skillId)) {
            return false;
        }
        this.copiedSkillIds().push(skillId);
        this.copiedSkillIds().sort((a, b) => a - b);
        this.learnSkill(skillId);
        return true;
    };

    /**
     * @param {number} skillId
     */
    Game_Actor.prototype.removeCopiedSkill = function (skillId) {
        if (!this.isCopiedSkill(skillId)) {
            return;
        }
        this.copiedSkillIds().remove(skillId);
        this.forgetSkill(skillId);
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
        this._enemy = null;
        this._actor = null;
        this._manualMode = false;
        this._skillIdFilter = null;
        this._data = [];
        this._maxCols = CopyAttack.params.selectWindowCols;
        this._canRepeat = false; // 長押しリピートでの決定を禁止
        this._copyInputGuard = 0;
        this._copyOkReleased = true;
        this.hide();
        this.deactivate();
    };

    /**
     * @param {Game_Enemy} enemy
     * @param {Game_Actor} actor
     */
    Window_CopyAttackSkillList.prototype.setBattler = function (enemy, actor) {
        this._manualMode = false;
        this._skillIdFilter = null;
        this._enemy = enemy;
        this._actor = actor;
        this.refresh();
        this.scrollTo(0, 0);
    };

    /**
     * イベント手動習得用
     * @param {Game_Actor} actor
     * @param {number[]|null} [skillIds] 指定時はそのリストのみ表示
     */
    Window_CopyAttackSkillList.prototype.setManualActor = function (actor, skillIds) {
        this._manualMode = true;
        this._enemy = null;
        this._actor = actor;
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
        if (!item || !this._actor) {
            return false;
        }
        return this._actor.canAddCopiedSkill(item.id);
    };

    /** @override */
    Window_CopyAttackSkillList.prototype.makeItemList = function () {
        this._data = [];
        if (!this._actor) {
            return;
        }
        if (this._manualMode) {
            if (this._skillIdFilter) {
                for (const skillId of this._skillIdFilter) {
                    const skill = $dataSkills[skillId];
                    if (skill) {
                        this._data.push(skill);
                    }
                }
            } else {
                for (const skillId of CopyAttack.manualLearnSkillIds(this._actor)) {
                    const skill = $dataSkills[skillId];
                    if (skill) {
                        this._data.push(skill);
                    }
                }
            }
            return;
        }
        if (!this._enemy) {
            return;
        }
        for (const skillId of CopyAttack.availableCopySkillIds(this._enemy, this._actor)) {
            const skill = $dataSkills[skillId];
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
     * 選択中スキルの説明文を毎更新で確実にセット
     * @override
     */
    Window_CopyAttackSkillList.prototype.updateHelp = function () {
        if (!this._helpWindow) {
            return;
        }
        const item = this.item();
        this._helpWindow.setItem(item);
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
        this._data = [];
        this._maxCols = CopyAttack.params.discardWindowCols;
        this._canRepeat = false; // 長押しリピートでの決定を禁止
        this._copyInputGuard = 0;
        this._copyOkReleased = true;
        this.hide();
        this.deactivate();
    };

    /**
     * @param {Game_Actor} actor
     */
    Window_CopyAttackForgetList.prototype.setActor = function (actor) {
        this._actor = actor;
        this.refresh();
        this.scrollTo(0, 0);
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
        this._data = this._actor ? this._actor.copiedSkills() : [];
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
        this.activate();
        this.select(1);
    };

    Window_CopyAttackConfirm.prototype.closeConfirm = function () {
        this.deactivate();
        this.hide();
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

        if (action && subject && subject.isActor() && CopyAttack.isCopySkill(action.item())) {
            const target = CopyAttack.resolveLastTarget(subject);
            if (
                target &&
                target.isEnemy() &&
                target.isAlive() &&
                CopyAttack.needsCopySelect(subject, target)
            ) {
                CopyAttack.reserveCopySelect(subject, target);
                shouldOpenSelect = true;
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
        if (this._phase === CopyAttack.PHASE) {
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
    // 敵ターゲットのHP割合制限（コピー用スキル）
    // -------------------------------------------------------------------------

    const _Window_BattleEnemy_isCurrentItemEnabled =
        Window_BattleEnemy.prototype.isCurrentItemEnabled;
    /**
     * コピー用スキル選択時、HP条件を満たさない敵は選択不可
     * @override
     */
    Window_BattleEnemy.prototype.isCurrentItemEnabled = function () {
        if (CopyAttack.isSelectingCopySkillTarget()) {
            return CopyAttack.canCopyTargetEnemy(this.enemy());
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
            this.changePaintOpacity(CopyAttack.canCopyTargetEnemy(enemy));
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
     * HP条件未達の敵を決定した場合はブザーのみで確定しない
     * @override
     */
    Scene_Battle.prototype.onEnemyOk = function () {
        if (CopyAttack.isSelectingCopySkillTarget()) {
            const enemy = this._enemyWindow.enemy();
            if (!CopyAttack.canCopyTargetEnemy(enemy)) {
                SoundManager.playBuzzer();
                this._enemyWindow.activate();
                return;
            }
        }
        _Scene_Battle_onEnemyOk.call(this);
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
     * 毎フレーム、所有ウィンドウの説明文を再セットしヘルプを表示維持
     */
    Scene_Battle.prototype.refreshCopyAttackHelp = function () {
        const owner = CopyAttack._helpOwner;
        if (!owner || !owner.active) {
            return;
        }
        if (this._helpWindow) {
            this._helpWindow.visible = true;
        }
        owner.updateHelp();
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
        if (!CopyAttack.isSelectPhase()) {
            this._copySkillSelectStarted = false;
            return;
        }
        if (BattleManager.isBusy()) {
            return;
        }
        if (this._copySkillSelectStarted) {
            return;
        }
        this._copySkillSelectStarted = true;
        this.startCopySkillSelection();
    };

    Scene_Battle.prototype.startCopySkillSelection = function () {
        const actor = CopyAttack.pendingActor();
        const enemy = CopyAttack.pendingEnemy();

        if (!actor || !enemy || !CopyAttack.needsCopySelect(actor, enemy)) {
            this.endCopySkillSelection();
            return;
        }

        this.closeCopySkillBlockingWindows();
        this._copySkillDiscardWindow.hide();
        this._copySkillWindow.setBattler(enemy, actor);
        this._copySkillWindow.show();
        this._copySkillWindow.activate();
        this._copySkillWindow.select(0);
        this.beginCopyHelpOwner(this._copySkillWindow);
    };

    Scene_Battle.prototype.closeCopySkillBlockingWindows = function () {
        this._partyCommandWindow.deactivate();
        this._actorCommandWindow.deactivate();
        // hideHelpWindow を踏ませないよう、先にヘルプロックしてから hide
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
        const enemy = CopyAttack.pendingEnemy();
        const skill = this._copySkillWindow.item();
        if (!actor || !skill) {
            this.onCopySkillCancel();
            return;
        }

        if (!actor.canAddCopiedSkill(skill.id)) {
            this.endCopySkillSelection();
            return;
        }

        actor.addCopiedSkill(skill.id);
        CopyAttack.playSuccessAnimation(actor, enemy);
        this.endCopySkillSelection();
    };

    Scene_Battle.prototype.onCopySkillCancel = function () {
        this.endCopySkillSelection();
    };

    Scene_Battle.prototype.startCopySkillDiscard = function () {
        const actor = CopyAttack.pendingActor();
        if (!actor || actor.copiedSkillIds().length === 0) {
            this.endInputForgetSelection(true);
            return;
        }
        if (this._copySkillConfirmWindow) {
            this._copySkillConfirmWindow.closeConfirm();
        }
        this._pendingDiscardSkill = null;
        this._copySkillDiscardWindow.setActor(actor);
        this._copySkillDiscardWindow.show();
        this._copySkillDiscardWindow.activate();
        this._copySkillDiscardWindow.select(0);
        this.beginCopyHelpOwner(this._copySkillDiscardWindow);
    };

    Scene_Battle.prototype.onCopySkillDiscardOk = function () {
        const actor = CopyAttack.pendingActor();
        const forgetSkill = this._copySkillDiscardWindow.item();
        if (!actor || !forgetSkill) {
            this.onCopySkillDiscardCancel();
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
        this._pendingDiscardSkill = null;
        this._copySkillConfirmWindow.closeConfirm();

        if (!actor || !forgetSkill) {
            this.onCopySkillDiscardCancel();
            return;
        }

        const usedSkill = CopyAttack.pendingForgetSkill();
        actor.removeCopiedSkill(forgetSkill.id);
        if (usedSkill) {
            actor.useItem(usedSkill);
        }
        SoundManager.playUseSkill();
        this.endInputForgetSelection(false);
    };

    Scene_Battle.prototype.onCopyForgetConfirmNo = function () {
        this._pendingDiscardSkill = null;
        this._copySkillConfirmWindow.closeConfirm();
        this._copySkillDiscardWindow.activate();
        this.beginCopyHelpOwner(this._copySkillDiscardWindow);
    };

    Scene_Battle.prototype.onCopySkillDiscardCancel = function () {
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
        if (actor.copiedSkillIds().length === 0) {
            SoundManager.playBuzzer();
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
            (this._copySkillDiscardWindow && this._copySkillDiscardWindow.active) ||
            (this._copySkillConfirmWindow && this._copySkillConfirmWindow.active)
        );
    };

    const _Scene_Battle_isTimeActive = Scene_Battle.prototype.isTimeActive;
    /** @override */
    Scene_Battle.prototype.isTimeActive = function () {
        if (this._copySkillWindow && this._copySkillWindow.active) {
            return false;
        }
        if (this._copySkillDiscardWindow && this._copySkillDiscardWindow.active) {
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
            return !!(user && user.isActor() && user.copiedSkillIds().length > 0);
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
        const owner = CopyAttack._helpOwner;
        if (owner && owner.active && this._helpWindow) {
            this._helpWindow.visible = true;
            owner.updateHelp();
        }
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
        if (!actor || actor.copiedSkillIds().length === 0) {
            SoundManager.playBuzzer();
            this.activateItemWindow();
            return;
        }
        this._itemWindow.deactivate();
        this._copyForgetConfirmWindow.closeConfirm();
        this._pendingForgetSkill = null;
        this._copyForgetWindow.setActor(actor);
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
            this.onCopyForgetCancel();
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
        this._pendingForgetSkill = null;
        this._copyForgetConfirmWindow.closeConfirm();
        if (!actor || !forgetSkill || !usedSkill) {
            this.onCopyForgetCancel();
            return;
        }
        actor.useItem(usedSkill);
        actor.removeCopiedSkill(forgetSkill.id);
        SoundManager.playUseSkill();
        CopyAttack.setHelpOwner(null);
        this._copyForgetWindow.hide();
        this._copyForgetWindow.deactivate();
        if (this._statusWindow) {
            this._statusWindow.refresh();
        }
        this.activateItemWindow();
    };

    Scene_Skill.prototype.onCopyForgetConfirmNo = function () {
        this._pendingForgetSkill = null;
        this._copyForgetConfirmWindow.closeConfirm();
        this._copyForgetWindow.activate();
        CopyAttack.setHelpOwner(this._copyForgetWindow);
        this._copyForgetWindow.updateHelp();
    };

    Scene_Skill.prototype.onCopyForgetCancel = function () {
        this._pendingForgetSkill = null;
        if (this._copyForgetConfirmWindow) {
            this._copyForgetConfirmWindow.closeConfirm();
        }
        CopyAttack.setHelpOwner(null);
        this._copyForgetWindow.hide();
        this._copyForgetWindow.deactivate();
        this.activateItemWindow();
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
        this._skillIdFilter =
            params.skillIds && params.skillIds.length > 0 ? params.skillIds.slice() : null;
    };

    Scene_CopyAttackLearn.prototype.create = function () {
        Scene_MenuBase.prototype.create.call(this);
        this.createHelpWindow();
        this.createLearnWindow();
        if (
            !this._targetActor ||
            this._targetActor.isCopiedSkillFull() ||
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
        if (this._skillIdFilter) {
            return this._skillIdFilter.some(
                (id) => !!$dataSkills[id] && this._targetActor.canAddCopiedSkill(id)
            );
        }
        return CopyAttack.manualLearnSkillIds(this._targetActor).length > 0;
    };

    Scene_CopyAttackLearn.prototype.createLearnWindow = function () {
        this._learnWindow = new Window_CopyAttackSkillList(CopyAttack.makeWindowRect(this, "select"));
        this._learnWindow.setHelpWindow(this._helpWindow);
        this._learnWindow.setHandler("ok", this.onLearnOk.bind(this));
        this._learnWindow.setHandler("cancel", this.onLearnCancel.bind(this));
        this.addWindow(this._learnWindow);
    };

    Scene_CopyAttackLearn.prototype.startLearnSelection = function () {
        this._learnWindow.setManualActor(this._targetActor, this._skillIdFilter);
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
        const owner = CopyAttack._helpOwner;
        if (owner && owner.active && this._helpWindow) {
            this._helpWindow.visible = true;
            owner.updateHelp();
        }
    };

    Scene_CopyAttackLearn.prototype.onLearnOk = function () {
        const skill = this._learnWindow.item();
        const actor = this._targetActor;
        if (!actor || !skill) {
            this.onLearnCancel();
            return;
        }
        if (!actor.canAddCopiedSkill(skill.id)) {
            SoundManager.playBuzzer();
            this._learnWindow.activate();
            return;
        }
        actor.addCopiedSkill(skill.id);
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
    };

    Scene_CopyAttackForget.prototype.create = function () {
        Scene_MenuBase.prototype.create.call(this);
        this.createHelpWindow();
        this.createForgetWindow();
        this.createConfirmWindow();
        if (!this._targetActor || this._targetActor.copiedSkillIds().length === 0) {
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
        this._forgetWindow.setActor(this._targetActor);
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
        const owner = CopyAttack._helpOwner;
        if (owner && owner.active && this._helpWindow) {
            this._helpWindow.visible = true;
            owner.updateHelp();
        }
    };

    Scene_CopyAttackForget.prototype.onForgetOk = function () {
        const actor = this._targetActor;
        const skill = this._forgetWindow.item();
        if (!actor || !skill) {
            this.onForgetCancel();
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
        this._pendingForgetSkill = null;
        this._confirmWindow.closeConfirm();
        if (actor && skill) {
            actor.removeCopiedSkill(skill.id);
        }
        this.finishScene();
    };

    Scene_CopyAttackForget.prototype.onForgetConfirmNo = function () {
        this._pendingForgetSkill = null;
        this._confirmWindow.closeConfirm();
        this._forgetWindow.activate();
        CopyAttack.setHelpOwner(this._forgetWindow);
        this._forgetWindow.updateHelp();
    };

    Scene_CopyAttackForget.prototype.onForgetCancel = function () {
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

    /**
     * PascalCase コマンドを登録し、旧 camelCase 名も互換エイリアスとして登録する
     * @param {string} commandName
     * @param {string} legacyName
     * @param {Function} handler
     */
    function registerCopyAttackCommand(commandName, legacyName, handler) {
        PluginManager.registerCommand(PLUGIN_NAME, commandName, handler);
        if (legacyName && legacyName !== commandName) {
            PluginManager.registerCommand(PLUGIN_NAME, legacyName, handler);
        }
    }

    registerCopyAttackCommand("LearnCopiedSkillByPlayer", "learnCopiedSkillByPlayer", (args) => {
        const actor = CopyAttack.resolveActor(args.actorId);
        if (
            !actor ||
            actor.isCopiedSkillFull() ||
            CopyAttack.manualLearnSkillIds(actor).length === 0
        ) {
            return;
        }
        CopyAttack.pushCommandScene(Scene_CopyAttackLearn, { actorId: Number(args.actorId || 0) });
    });

    registerCopyAttackCommand(
        "LearnCopiedSkillFromListByPlayer",
        "learnCopiedSkillFromListByPlayer",
        (args) => {
            const actor = CopyAttack.resolveActor(args.actorId);
            const skillIds = CopyAttack.parseSkillIdList(args.skillIds);
            if (!actor || actor.isCopiedSkillFull() || skillIds.length === 0) {
                return;
            }
            const learnable = skillIds.filter((id) => actor.canAddCopiedSkill(id));
            if (learnable.length === 0) {
                return;
            }
            CopyAttack.pushCommandScene(Scene_CopyAttackLearn, {
                actorId: Number(args.actorId || 0),
                skillIds: skillIds,
            });
        }
    );

    registerCopyAttackCommand("AddCopiedSkillDirect", "addCopiedSkillDirect", (args) => {
        const actor = CopyAttack.resolveActor(args.actorId);
        const skillId = Number(args.skillId || 0);
        if (!actor || skillId <= 0 || !$dataSkills[skillId]) {
            return;
        }
        if (actor.isCopiedSkillFull()) {
            return;
        }
        actor.addCopiedSkill(skillId);
    });

    registerCopyAttackCommand("ForgetCopiedSkillByPlayer", "forgetCopiedSkillByPlayer", (args) => {
        const actor = CopyAttack.resolveActor(args.actorId);
        if (!actor || actor.copiedSkillIds().length === 0) {
            return;
        }
        CopyAttack.pushCommandScene(Scene_CopyAttackForget, { actorId: Number(args.actorId || 0) });
    });

    registerCopyAttackCommand("RemoveCopiedSkillDirect", "removeCopiedSkillDirect", (args) => {
        const actor = CopyAttack.resolveActor(args.actorId);
        const skillId = Number(args.skillId || 0);
        if (!actor || skillId <= 0) {
            return;
        }
        actor.removeCopiedSkill(skillId);
    });

    registerCopyAttackCommand("SetMaxCopiedSkills", "setMaxCopiedSkills", (args) => {
        const maxCount = Math.max(1, Math.min(99, Number(args.maxCount || 1)));
        const actors = CopyAttack.resolveActorsForMax(args.actorId);
        for (const actor of actors) {
            actor.setMaxCopiedSkills(maxCount);
        }
    });

    const _Game_Interpreter_updateWaitMode = Game_Interpreter.prototype.updateWaitMode;
    /**
     * プラグインコマンドシーン終了までイベントを待機
     * @override
     */
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
