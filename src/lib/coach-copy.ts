import { fallbackTips } from "@/data/fallbackTips";
import { getPlatform, type PlatformId } from "@/data/platforms";
import { structureHeadline, whyLine } from "@/lib/explain";
import { tangleKind, variantPhi, type TangleKind } from "@/lib/phi";
import { scoreAnswers, weakestQuestions, type Level } from "@/lib/score";
import { formatPhi } from "@/lib/utils";

const headlines: Record<Level, string> = {
  Passive: "The algorithm is steering. You can take the wheel.",
  Aware: "You can see the algorithm. Now steer it.",
  Deliberate: "You are steering. Keep the experiments honest.",
};

export type CoachCopy = {
  headline: string;
  explanation: string;
  tips: [string, string, string];
};

export function tipIndexes(answers: number[], kind: TangleKind | null, level: Level) {
  const weakest = weakestQuestions(answers, 6);
  if ((kind === "pipe" || kind === "outside") && level !== "Deliberate") {
    const preferred = [4, 3].filter((index) => answers[index] < 2);
    const rest = weakest.filter((index) => !preferred.includes(index));
    return [...preferred, ...rest].slice(0, 3);
  }
  return weakest.slice(0, 3);
}

export function structureContext(platformId: PlatformId, answers: number[]) {
  const platform = getPlatform(platformId);
  const triad = variantPhi(platformId, answers);
  const { level } = scoreAnswers(answers);
  return {
    triad,
    level,
    kind: tangleKind(triad.phi, triad.uInMajorComplex),
    headline: structureHeadline(platform, triad.phi, triad.uInMajorComplex, level),
    why: triad.rules ? whyLine(triad.rules, platform) : "",
  };
}

export function fallbackExplanation(platformId: PlatformId, answers: number[]) {
  const platform = getPlatform(platformId);
  const triad = variantPhi(platformId, answers);
  if (!triad.verdict || triad.phi === null) {
    return `Structural verdict coming soon. The model rules are ${triad.rules}.`;
  }
  const phi = formatPhi(triad.phi);
  return `${platform.name} is ${triad.verdict} on your answers, and whole-system Φ is ${phi}.`;
}

export function displayExplanation(platformId: PlatformId, answers: number[], explanation: string) {
  const triad = variantPhi(platformId, answers);
  if (tangleKind(triad.phi, triad.uInMajorComplex) !== "pipe") return explanation;
  if (/part of the tangle|outside the tangle/i.test(explanation)) {
    return fallbackExplanation(platformId, answers);
  }
  return explanation;
}

export function buildFallback(platformId: PlatformId, answers: number[]): CoachCopy {
  const { level } = scoreAnswers(answers);
  const context = structureContext(platformId, answers);
  const tips = tipIndexes(answers, context.kind, level).map((index) => {
    const score = answers[index];
    if (score !== 0 && score !== 1 && score !== 2) {
      throw new Error("Answer out of range.");
    }
    return fallbackTips[platformId][index][score];
  });
  if (tips.length !== 3) throw new Error("Expected three tips.");
  return {
    headline: headlines[level],
    explanation: fallbackExplanation(platformId, answers),
    tips: [tips[0], tips[1], tips[2]],
  };
}
