/**
 * public/sources のプラグイン JS を downloads に同期する。
 * - CopyAttack.js をそのまま配置
 * - CopyAttack.zip（ルートに JS のみ）を再生成
 */
import { copyFileSync, existsSync, mkdirSync, statSync, unlinkSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const sourceJs = join(root, "public", "sources", "CopyAttack.js");
const downloadsDir = join(root, "public", "downloads");
const outJs = join(downloadsDir, "CopyAttack.js");
const outZip = join(downloadsDir, "CopyAttack.zip");

if (!existsSync(sourceJs)) {
  console.error(`[sync-plugin-downloads] missing: ${sourceJs}`);
  process.exit(1);
}

mkdirSync(downloadsDir, { recursive: true });
copyFileSync(sourceJs, outJs);

if (existsSync(outZip)) {
  unlinkSync(outZip);
}

const q = (p) => p.replace(/'/g, "''");

let result;
if (process.platform === "win32") {
  result = spawnSync(
    "powershell",
    [
      "-NoProfile",
      "-Command",
      `Compress-Archive -LiteralPath '${q(sourceJs)}' -DestinationPath '${q(outZip)}' -CompressionLevel Optimal`,
    ],
    { encoding: "utf8" },
  );
} else {
  result = spawnSync("zip", ["-j", "-9", outZip, sourceJs], { encoding: "utf8" });
}

if (result.status !== 0) {
  console.error(result.stderr || result.stdout || "zip failed");
  process.exit(1);
}

const jsStat = statSync(outJs);
const zipStat = statSync(outZip);
console.log(`[sync-plugin-downloads] OK  js=${jsStat.size}B  zip=${zipStat.size}B`);
