import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import { mathFindings, partyList, verdictLabel } from "../src/lib/explain";
import { phiFile } from "../src/lib/phi";
import { getPlatform, isPlatformId } from "../src/data/platforms";
import { formatPhi } from "../src/lib/utils";

function replaceBlock(source: string, name: string, body: string) {
  const start = `<!-- ${name}:START -->`;
  const end = `<!-- ${name}:END -->`;
  const pattern = new RegExp(`${start}[\\s\\S]*?${end}`);
  if (!pattern.test(source)) throw new Error(`Missing ${start} / ${end}`);
  return source.replace(pattern, `${start}\n${body.trim()}\n${end}`);
}

function resultsTable() {
  const bases = (["instagram", "uber", "email"] as const)
    .map((id) => {
      const row = phiFile.platforms[id];
      const name = id === "email" ? "Email (comparison)" : id[0].toUpperCase() + id.slice(1);
      return `| ${name} | ${row.rules} | ${row.verdict} | ${formatPhi(row.phi)} |`;
    })
    .join("\n");

  const variants = Object.entries(phiFile.variants)
    .map(([key, row]) => {
      if (!isPlatformId(row.platform)) return "";
      const platform = getPlatform(row.platform);
      const verdict = verdictLabel(row.verdict === "triadic" || row.verdict === "dyadic" ? row.verdict : null);
      const core = partyList(row.major_complex, platform.diagram);
      return `| \`${key}\` | ${row.rules} | ${verdict.toLowerCase()} | ${formatPhi(row.phi)} | ${core} |`;
    })
    .filter(Boolean)
    .join("\n");

  return `
Base models, from \`phi_results.json\`:

| Platform | Rules | Verdict | Whole-system Φ |
|---|---|---|---|
${bases}

Switches: ${phiFile.switches.adapts} ${phiFile.switches.alternatives}

| Key | Rules | Verdict | Whole-system Φ | Tightest core |
|---|---|---|---|---|
${variants}
`.trim();
}

function findingsBlock() {
  const lines = mathFindings()
    .map((finding) => `- **${finding.title}.** ${finding.line} Caveat: ${finding.caveat}.`)
    .join("\n");
  return lines;
}

const readmePath = path.join(process.cwd(), "README.md");
let readme = readFileSync(readmePath, "utf8");
readme = replaceBlock(readme, "RESULTS", resultsTable());
readme = replaceBlock(readme, "FINDINGS", findingsBlock());
writeFileSync(readmePath, readme);
console.log("rewrote README results and findings");
