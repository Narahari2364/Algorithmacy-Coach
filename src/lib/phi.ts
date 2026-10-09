import phiResults from "../../public/data/phi_results.json";
import type { PlatformId } from "@/data/platforms";

export type TriadVerdict = "triadic" | "dyadic";

export type PlatformPhi = {
  phi: number | null;
  verdict: TriadVerdict | null;
  competence: string | null;
  major_complex: string[] | null;
  rules: string;
};

export type VariantPhi = PlatformPhi & {
  key: string;
  adapts: boolean;
  alternatives: boolean;
  uInMajorComplex: boolean;
};

export const phiFile = phiResults;

export function asVerdict(value: string | null): TriadVerdict | null {
  if (value === "triadic" || value === "dyadic") return value;
  return null;
}

export function platformPhi(id: PlatformId): PlatformPhi {
  const row = phiResults.platforms[id];
  return {
    phi: row.phi,
    verdict: asVerdict(row.verdict),
    competence: row.competence,
    major_complex: row.major_complex,
    rules: row.rules,
  };
}

export function switchesFromAnswers(answers: number[]) {
  return {
    adapts: answers[3] >= 1,
    alternatives: answers[5] === 2,
  };
}

export function variantKey(platform: PlatformId, answers: number[]) {
  const switches = switchesFromAnswers(answers);
  return `${platform}:${switches.adapts}:${switches.alternatives}`;
}

export type TangleKind = "pipe" | "part" | "outside";

export type PartyLabels = { U: string; A: string; C: string };

/** Membership needs a real tangle (Φ > 0) and the user inside the major complex. */
export function tangleKind(phi: number | null, uInMajorComplex: boolean): TangleKind | null {
  if (phi === null) return null;
  if (!(phi > 0)) return "pipe";
  return uInMajorComplex ? "part" : "outside";
}

export function tangleLine(phi: number | null, uInMajorComplex: boolean, app: string) {
  const kind = tangleKind(phi, uInMajorComplex);
  if (kind === "pipe") return `There's no tangle here: ${app} acts like a pipe`;
  if (kind === "part") return "You are part of the tangle";
  if (kind === "outside") return "You sit outside the tangle";
  return "";
}

function partyPhrase(code: string, labels: PartyLabels) {
  if (code === "U") return "you";
  const label = labels[code as keyof PartyLabels];
  return `the ${label.toLowerCase()}`;
}

/** Whole-system triadic rows whose major complex has fewer than three parties. */
export function coreLine(
  verdict: TriadVerdict | null,
  major: string[] | null,
  labels: PartyLabels,
) {
  if (verdict !== "triadic" || !major || major.length === 0 || major.length >= 3) return null;
  const phrases = (["U", "A", "C"] as const)
    .filter((code) => major.includes(code))
    .map((code) => partyPhrase(code, labels));
  if (phrases.length === 1) return `The core is ${phrases[0]}.`;
  if (phrases.length === 2) return `The core is ${phrases[0]} and ${phrases[1]}.`;
  return null;
}

export function variantPhi(platform: PlatformId, answers: number[]): VariantPhi {
  const switches = switchesFromAnswers(answers);
  const key = `${platform}:${switches.adapts}:${switches.alternatives}`;
  const row = phiResults.variants[key as keyof typeof phiResults.variants];
  if (!row) {
    return {
      key,
      adapts: switches.adapts,
      alternatives: switches.alternatives,
      phi: null,
      verdict: null,
      competence: null,
      major_complex: null,
      rules: "",
      uInMajorComplex: false,
    };
  }
  const major = row.major_complex;
  return {
    key,
    adapts: row.adapts,
    alternatives: row.alternatives,
    phi: row.phi,
    verdict: asVerdict(row.verdict),
    competence: row.competence,
    major_complex: major,
    rules: row.rules,
    uInMajorComplex: Boolean(major?.includes("U")),
  };
}
