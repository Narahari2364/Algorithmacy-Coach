import { getPlatform, isPlatformId, type Platform, type PlatformId } from "@/data/platforms";
import {
  asVerdict,
  partyPhrase,
  phiFile,
  platformVariants,
  type PartyLabels,
  type TriadVerdict,
  type VariantPhi,
} from "@/lib/phi";
import type { Level } from "@/lib/score";
import { formatPhi } from "@/lib/utils";

export type NodeId = "U" | "A" | "C";

export type RuleRead = {
  reads: NodeId[];
  orUser: boolean;
};

const nodes: NodeId[] = ["U", "A", "C"];

export function parseRules(rules: string): Record<NodeId, RuleRead> {
  const parsed: Record<NodeId, RuleRead> = {
    U: { reads: [], orUser: false },
    A: { reads: [], orUser: false },
    C: { reads: [], orUser: false },
  };
  for (const part of rules.split(";")) {
    const match = part.trim().match(/^([UAC])'=(.+)$/);
    if (!match) continue;
    const node = match[1] as NodeId;
    const rhs = match[2];
    parsed[node] = {
      reads: nodes.filter((other) => other !== node && rhs.includes(other)),
      orUser: node !== "U" && /\bOR\b/.test(rhs) && rhs.includes("U"),
    };
  }
  return parsed;
}

/** Arrow from X to Y when Y's rule reads X. */
export function edgesFromRules(rules: string): Array<[NodeId, NodeId]> {
  const parsed = parseRules(rules);
  const edges: Array<[NodeId, NodeId]> = [];
  for (const target of nodes) {
    for (const source of parsed[target].reads) {
      edges.push([source, target]);
    }
  }
  return edges;
}

function cap(text: string) {
  if (!text) return text;
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function joinAnd(items: string[]) {
  if (items.length <= 1) return items[0] ?? "";
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(", ")}, and ${items[items.length - 1]}`;
}

export function orderedParties(major: string[] | null) {
  return nodes.filter((code) => major?.includes(code));
}

export function partyList(major: string[] | null, labels: PartyLabels) {
  return joinAnd(orderedParties(major).map((code) => partyPhrase(code, labels)));
}

export function tightestCoreLabel(major: string[] | null, labels: PartyLabels) {
  const names = orderedParties(major).map((code) => partyPhrase(code, labels));
  return names.length ? names.join(" + ") : "none";
}

export function algorithmName(platform: Platform) {
  return partyPhrase("A", platform.diagram);
}

export function structureHeadline(
  platform: Platform,
  phi: number | null,
  uInMajorComplex: boolean,
  level: Level,
) {
  const algo = algorithmName(platform);
  if (!(phi !== null && phi > 0)) {
    if (platform.id === "email") return "There's no tangle here: Email acts like a pipe.";
    return `No tangle for you: you don't react to what ${algo} does, so for you it just passes things along. Users who adapt to it get pulled in.`;
  }
  if (uInMajorComplex && level === "Deliberate") return "You're in the game and steering it.";
  if (uInMajorComplex) return "You're in the game, but not steering yet.";
  if (level === "Deliberate") return "You've stepped back on purpose.";
  return "You're carried along without reacting to it.";
}

export function whyLine(rules: string, platform: Platform) {
  const parsed = parseRules(rules);
  const algo = algorithmName(platform);
  const other = platform.counterpart;
  const Algo = cap(algo);
  const Other = cap(other);
  const sentences: string[] = [];
  const userReads = parsed.U.reads;

  if (userReads.length === 0) sentences.push(`You don't react to ${algo}.`);
  else if (userReads.includes("A") && userReads.includes("C")) sentences.push(`You react to ${algo} and to ${other}.`);
  else if (userReads.includes("A")) sentences.push(`You react to ${algo}.`);
  else sentences.push(`You react to ${joinAnd(userReads.map((code) => partyPhrase(code, platform.diagram)))}.`);

  const algoReads = parsed.A.reads;
  if (algoReads.includes("U") && algoReads.includes("C")) sentences.push(`${Algo} reads both you and ${other}.`);
  else if (algoReads.includes("U")) sentences.push(`${Algo} reads you.`);
  else if (algoReads.includes("C")) sentences.push(`${Algo} reads ${other}.`);
  else sentences.push(`${Algo} keeps its own state.`);

  const counterpart = parsed.C;
  if (counterpart.orUser && counterpart.reads.includes("U")) {
    sentences.push(
      `Your direct channel lets ${other} hear from you without ${algo}, which loosens its hold on them.`,
    );
  } else if (counterpart.reads.includes("A") && counterpart.reads.includes("U")) {
    sentences.push(`${Other} updates from both ${algo} and you.`);
  } else if (counterpart.reads.includes("A")) {
    sentences.push(`${Other} updates from ${algo}.`);
  } else if (counterpart.reads.includes("U")) {
    sentences.push(`${Other} hears from you directly.`);
  }

  const fullLoop =
    userReads.includes("A") &&
    algoReads.includes("U") &&
    algoReads.includes("C") &&
    counterpart.reads.includes("A") &&
    !counterpart.orUser;
  if (userReads.length === 0) {
    sentences.push("Nothing loops back to you. You're an input, not part of the knot.");
  } else if (fullLoop) {
    sentences.push("That loop runs through all three of you.");
  }

  return sentences.join(" ");
}

function sameMembers(left: string[] | null, right: string[] | null) {
  const a = new Set(left ?? []);
  const b = new Set(right ?? []);
  if (a.size !== b.size) return false;
  for (const item of a) if (!b.has(item)) return false;
  return true;
}

export function changeNote(actual: VariantPhi, viewed: VariantPhi, platform: Platform) {
  if (actual.key === viewed.key) return null;
  const labels = platform.diagram;
  const algo = algorithmName(platform);
  const wasIn = Boolean(actual.major_complex?.includes("U"));
  const nowIn = Boolean(viewed.major_complex?.includes("U"));
  const before = new Set(actual.major_complex ?? []);
  const after = new Set(viewed.major_complex ?? []);
  const dropped = nodes.filter((code) => code !== "U" && before.has(code) && !after.has(code));
  const added = nodes.filter((code) => !before.has(code) && after.has(code));

  if (wasIn && !nowIn) {
    const binders = partyList(viewed.major_complex, labels);
    return `This change takes you out of the tangle. ${cap(binders)} now bind each other without you.`;
  }
  if (!wasIn && nowIn) {
    return `This change pulls you into the tangle. What you do now shapes, and is shaped by, ${algo}.`;
  }
  if (wasIn && nowIn && after.size < before.size && dropped.length > 0) {
    const names = dropped.map((code) => partyPhrase(code, labels));
    const droppedText =
      names.length === 1 ? `${cap(names[0])} falls out` : `${cap(joinAnd(names))} fall out`;
    return `The tangle gets smaller. ${droppedText}, so ${algo} has less hold over them.`;
  }
  if (after.size > before.size && added.length > 0) {
    const names = added.map((code) => partyPhrase(code, labels));
    const verb = names.length === 1 ? "is" : "are";
    return `The tangle gets bigger. ${cap(joinAnd(names))} ${verb} now bound in too.`;
  }
  if (actual.verdict === "triadic" && viewed.verdict === "dyadic") {
    return "The knot comes apart. The system now splits into independent pieces.";
  }
  if (actual.verdict === "dyadic" && viewed.verdict === "triadic") {
    return "A knot forms. The system can no longer be split without losing something.";
  }
  if (sameMembers(actual.major_complex, viewed.major_complex) && actual.verdict === viewed.verdict) {
    return `Nothing changes structurally. On ${platform.app}, this habit doesn't move the tangle.`;
  }
  return `Nothing changes structurally. On ${platform.app}, this habit doesn't move the tangle.`;
}

export type MathFinding = {
  id: "outside-core" | "shrinking-core";
  platformId: PlatformId;
  title: string;
  line: string;
  caveat: string;
  keys: string[];
  focusKey: string;
};

const caveat = "in a simplified three-party model";

function rowPlatform(platform: string) {
  if (!isPlatformId(platform)) throw new Error(`Unknown platform in phi results: ${platform}`);
  return getPlatform(platform);
}

export function mathFindings(): MathFinding[] {
  const rows = platformIdsFromFile();
  const outside = rows.find((row) => row.verdict === "triadic" && row.uInMajorComplex === false);
  const shrink = shrinkingPair(rows);
  const findings: MathFinding[] = [];
  if (outside) {
    const platform = rowPlatform(outside.key.split(":")[0]);
    const core = partyList(outside.major_complex, platform.diagram);
    findings.push({
      id: "outside-core",
      platformId: platform.id,
      title: `${platform.name}: you can sit outside a real tangle`,
      line: `When you adapt and keep no other way through, ${platform.name} is ${outside.verdict} at whole-system Φ ${formatPhi(outside.phi)}. The tightest core is ${core}. You are not in it.`,
      caveat,
      keys: [outside.key],
      focusKey: outside.key,
    });
  }
  if (shrink) {
    const platform = rowPlatform(shrink.before.key.split(":")[0]);
    const from = partyList(shrink.before.major_complex, platform.diagram);
    const to = partyList(shrink.after.major_complex, platform.diagram);
    findings.push({
      id: "shrinking-core",
      platformId: platform.id,
      title: `${platform.name}: another channel shrinks the core`,
      line: `Keeping another way to reach ${platform.counterpart} shrinks the tightest core from ${from} to ${to}. Whole-system Φ moves from ${formatPhi(shrink.before.phi)} to ${formatPhi(shrink.after.phi)}.`,
      caveat,
      keys: [shrink.before.key, shrink.after.key],
      focusKey: shrink.after.key,
    });
  }
  return findings;
}

function platformIdsFromFile() {
  return (["instagram", "uber", "email"] as const).flatMap((id) => platformVariants(id));
}

function shrinkingPair(rows: VariantPhi[]) {
  const pairs = rows.flatMap((before) => {
    if (before.alternatives || !before.uInMajorComplex) return [];
    const [platformId, adaptsFlag] = before.key.split(":");
    const after = rows.find((row) => row.key === `${platformId}:${adaptsFlag}:true` && row.uInMajorComplex);
    if (!after?.major_complex || !before.major_complex) return [];
    const beforeSet = new Set(before.major_complex);
    const subset =
      after.major_complex.length > 0 &&
      after.major_complex.length < before.major_complex.length &&
      after.major_complex.every((code) => beforeSet.has(code));
    return subset ? [{ before, after }] : [];
  });
  return pairs.find((pair) => pair.before.key.startsWith("instagram:")) ?? pairs[0] ?? null;
}

export function verdictLabel(verdict: TriadVerdict | null) {
  if (verdict === "triadic") return "Triadic";
  if (verdict === "dyadic") return "Dyadic";
  return "Pending";
}

export function glossary() {
  return [
    {
      term: "Tangle",
      body: "A tangle is a knot you can't cut into separate threads without losing something. If the app is just a pipe, you can cut it and nothing is lost.",
    },
    {
      term: "Whole-system Φ",
      body: "How much would be lost if you cut the system into its weakest split. 0 means nothing is lost: it's really separate pieces. Higher means a tighter knot.",
    },
    {
      term: "Tightest core",
      body: "The smallest group that is most tightly knotted together. You can be in the system but outside its core.",
    },
  ];
}

export function baseModels() {
  return (Object.keys(phiFile.platforms) as Array<keyof typeof phiFile.platforms>).map((id) => {
    const row = phiFile.platforms[id];
    return {
      id,
      phi: row.phi,
      verdict: asVerdict(row.verdict),
      major_complex: row.major_complex,
      rules: row.rules,
    };
  });
}
