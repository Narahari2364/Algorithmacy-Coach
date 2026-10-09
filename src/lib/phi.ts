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

function asVerdict(value: string | null): TriadVerdict | null {
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

export function tangleLine(uInMajorComplex: boolean) {
  return uInMajorComplex ? "You are part of the tangle" : "You sit outside the tangle";
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
