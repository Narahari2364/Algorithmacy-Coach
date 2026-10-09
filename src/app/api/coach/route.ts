import { buildFallback, type CoachCopy } from "@/lib/coach-copy";
import { parseCoachResponse } from "@/lib/parse-coach";
import { tangleLine, variantPhi } from "@/lib/phi";
import { scoreAnswers } from "@/lib/score";
import { fillTemplate, questions } from "@/data/questions";
import { getPlatform, isPlatformId } from "@/data/platforms";
import { NextResponse } from "next/server";

const SYSTEM_PROMPT = `You are Algorithmacy Coach. Algorithmacy is the skill of navigating a coordination that runs through an algorithm you do not control. You receive a platform, a user's six rubric answers (0 passive, 1 mixed, 2 deliberate), their score and level, and a structural verdict for the platform (triadic means the algorithm is an irreducible third party between the user and the counterpart; dyadic means it acts like a pipe).
Reply with JSON only, no markdown, matching:
{"headline": string (max 12 words), "explanation": string (max 45 words, plain English, mention the verdict), "tips": [string, string, string] (each max 25 words, concrete actions for this platform, aimed at their weakest answers)}
Be warm and direct. No jargon beyond the word "algorithm". Never claim the score is a scientific measurement.`;

type CoachPayload = {
  headline: string;
  explanation: string;
  tips: [string, string, string];
  source: "grok" | "fallback";
  score: number;
  level: string;
};

function payload(copy: CoachCopy, source: CoachPayload["source"], score: number, level: string): CoachPayload {
  return { ...copy, source, score, level };
}

async function askGrok(userContent: string): Promise<CoachCopy | null> {
  const key = process.env.XAI_API_KEY;
  if (!key) return null;
  const model = process.env.XAI_MODEL || "grok-4.7";
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    const response = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        temperature: 0.4,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userContent },
        ],
      }),
    });
    if (!response.ok) return null;
    const data: unknown = await response.json();
    const content =
      data &&
      typeof data === "object" &&
      "choices" in data &&
      Array.isArray(data.choices) &&
      data.choices[0] &&
      typeof data.choices[0] === "object" &&
      "message" in data.choices[0] &&
      data.choices[0].message &&
      typeof data.choices[0].message === "object" &&
      "content" in data.choices[0].message &&
      typeof data.choices[0].message.content === "string"
        ? data.choices[0].message.content
        : "";
    return parseCoachResponse(content);
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Expected JSON." }, { status: 400 });
  }
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Expected an object." }, { status: 400 });
  }
  const record = body as Record<string, unknown>;
  if (!isPlatformId(record.platform)) {
    return NextResponse.json({ error: "Unknown platform." }, { status: 400 });
  }
  if (
    !Array.isArray(record.answers) ||
    record.answers.length !== 6 ||
    record.answers.some((answer) => answer !== 0 && answer !== 1 && answer !== 2)
  ) {
    return NextResponse.json({ error: "Answers must be six scores of 0, 1, or 2." }, { status: 400 });
  }

  const answers = record.answers as number[];
  const platform = getPlatform(record.platform);
  const { score, level } = scoreAnswers(answers);
  const triad = variantPhi(record.platform, answers);
  const fallback = buildFallback(record.platform, answers);

  const userContent = JSON.stringify({
    platform: platform.name,
    counterpart: platform.counterpart,
    answers,
    questions: questions.map((question, index) => ({
      theme: question.theme,
      score: answers[index],
      choice: fillTemplate(question.answers[answers[index]], platform),
    })),
    score,
    level,
    triad: {
      verdict: triad.verdict,
      phi: triad.phi,
      major_complex: triad.major_complex,
      tangle: tangleLine(triad.uInMajorComplex),
      rules: triad.rules,
    },
  });

  const grok = await askGrok(userContent);
  if (!grok) {
    return NextResponse.json(payload(fallback, "fallback", score, level));
  }
  return NextResponse.json(payload(grok, "grok", score, level));
}
