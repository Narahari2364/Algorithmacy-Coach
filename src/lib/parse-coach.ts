import { clampWords } from "@/lib/utils";
import type { CoachCopy } from "@/lib/coach-copy";

export function parseCoachResponse(text: string): CoachCopy | null {
  let raw = text.trim();
  raw = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start === -1 || end <= start) return null;
  raw = raw.slice(start, end + 1);

  try {
    const data: unknown = JSON.parse(raw);
    if (!data || typeof data !== "object") return null;
    const record = data as Record<string, unknown>;
    if (typeof record.headline !== "string" || typeof record.explanation !== "string") return null;
    if (!Array.isArray(record.tips) || record.tips.length !== 3) return null;
    if (!record.tips.every((tip) => typeof tip === "string" && tip.trim().length > 0)) return null;
    const tips = record.tips as string[];
    return {
      headline: clampWords(record.headline, 12),
      explanation: clampWords(record.explanation, 45),
      tips: [clampWords(tips[0], 25), clampWords(tips[1], 25), clampWords(tips[2], 25)],
    };
  } catch {
    return null;
  }
}
