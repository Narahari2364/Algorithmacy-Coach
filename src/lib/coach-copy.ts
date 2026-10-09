import { fallbackTips } from "@/data/fallbackTips";
import { getPlatform, type PlatformId } from "@/data/platforms";
import { tangleLine, variantPhi } from "@/lib/phi";
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

export function fallbackExplanation(platformId: PlatformId, answers: number[]) {
  const platform = getPlatform(platformId);
  const triad = variantPhi(platformId, answers);
  if (!triad.verdict || triad.phi === null) {
    return `Structural verdict coming soon. The model rules are ${triad.rules}.`;
  }
  const phi = formatPhi(triad.phi);
  return `${tangleLine(triad.uInMajorComplex)}. ${platform.name} is ${triad.verdict} on your answers, and Φ is ${phi}.`;
}

export function buildFallback(platformId: PlatformId, answers: number[]): CoachCopy {
  const { level } = scoreAnswers(answers);
  const tips = weakestQuestions(answers).map((index) => {
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
