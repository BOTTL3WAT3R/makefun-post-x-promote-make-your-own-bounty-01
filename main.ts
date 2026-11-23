// Entry program for make.fun's "Promote make.fun's make-your-own-bounty post on X" bounty.
// The real entry is the X post itself; this repository only has to name it. POST.json at the
// repository root holds {"url": "https://x.com/<handle>/status/<id>"} for that post, and this
// program copies POST.json into the output directory, where the grader reads it.
//
// Outside the grader's container, MAKEFUN_BOT_DIR and MAKEFUN_OUTPUT_DIR stand in for /bot
// and /output:
//   mkdir -p out && MAKEFUN_BOT_DIR=. MAKEFUN_OUTPUT_DIR=out node main.ts

import { copyFileSync, mkdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const BOT_DIR = process.env.MAKEFUN_BOT_DIR ?? "/bot";
const OUTPUT_DIR = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";

function readPostUrl(botDir: string): string {
  const raw = readFileSync(join(botDir, "POST.json"), "utf8");
  const data = JSON.parse(raw) as { url?: unknown };
  if (typeof data.url !== "string" || data.url.length === 0) {
    throw new Error("POST.json does not carry a post url");
  }
  // The address must be one post on X: https://x.com/<handle>/status/<id>
  // (twitter.com passes too). Anything else, the placeholder included, is a
  // mistake worth failing on here rather than at the grader.
  const postUrl = /^https:\/\/(x\.com|twitter\.com)\/[^/]+\/status\/\d+$/;
  if (!postUrl.test(data.url) || data.url.includes("PLACEHOLDER")) {
    throw new Error(`POST.json url is not a real X post address: ${data.url}`);
  }
  return data.url;
}

const url = readPostUrl(BOT_DIR);
mkdirSync(OUTPUT_DIR, { recursive: true });
copyFileSync(join(BOT_DIR, "POST.json"), join(OUTPUT_DIR, "POST.json"));
console.log(`POST.json copied to ${OUTPUT_DIR} (post: ${url})`);
