/**
 * Design-token guard (warn-only for now — see docs/DESIGN_SYSTEM_PLAN.md phase 7).
 *
 * Flags styling values that should come from the token layer in src/index.css:
 *   - raw hex colours in className strings / style props
 *   - arbitrary font sizes  (text-[13px])
 *   - Tailwind grey-family palette classes (bg-gray-*, text-slate-* …)
 *
 * Run: node scripts/check-design-tokens.mjs   (or: npm run lint:design)
 * Exit code is always 0 until the migration is complete.
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, extname } from "node:path";

const ROOT = "src";
const EXT = new Set([".tsx", ".ts"]);
const IGNORE_FILES = new Set(["index.css"]);

const RULES = [
  { name: "raw hex colour", re: /#[0-9a-fA-F]{3,8}\b/g },
  { name: "arbitrary font-size", re: /\btext-\[[0-9.]+(px|rem|em)\]/g },
  {
    name: "grey palette class",
    re: /\b(?:bg|text|border|ring|from|to|via|divide)-(?:gray|slate|zinc|neutral|stone)-\d{2,3}\b/g,
  },
];

let files = 0;
const hits = [];

function walk(dir) {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) {
      walk(p);
    } else if (EXT.has(extname(p)) && !IGNORE_FILES.has(entry)) {
      files++;
      const lines = readFileSync(p, "utf8").split("\n");
      lines.forEach((line, i) => {
        for (const rule of RULES) {
          const m = line.match(rule.re);
          if (m) hits.push({ file: p, line: i + 1, rule: rule.name, sample: m[0] });
        }
      });
    }
  }
}

walk(ROOT);

const byRule = hits.reduce((acc, h) => ((acc[h.rule] = (acc[h.rule] || 0) + 1), acc), {});
console.log(`\nDesign-token guard — scanned ${files} files\n`);
for (const [rule, n] of Object.entries(byRule)) {
  console.log(`  ${String(n).padStart(5)}  ${rule}`);
}
console.log(`  ${String(hits.length).padStart(5)}  total\n`);
console.log("warn-only: not failing the build. Target = 0 (see DESIGN_SYSTEM_PLAN.md).\n");
process.exit(0);
