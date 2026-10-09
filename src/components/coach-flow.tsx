"use client";

import { ArrowLeft, Check, Share2 } from "lucide-react";
import { useEffect, useState } from "react";

import { TriadCard } from "@/components/triad-card";
import { WhatIf } from "@/components/what-if";
import { Button } from "@/components/ui/button";
import { personas, type PersonaId } from "@/data/personas";
import { getPlatform, platforms, type PlatformId } from "@/data/platforms";
import { fillTemplate, questions } from "@/data/questions";
import { buildFallback, structureContext, type CoachCopy } from "@/lib/coach-copy";
import { tangleKind, variantBySwitches, variantPhi } from "@/lib/phi";
import { scoreAnswers, shareText } from "@/lib/score";
import { formatPhi } from "@/lib/utils";

type Phase = "pick" | "ask" | "results";

export function CoachFlow({ initialPersona }: { initialPersona: PersonaId | null }) {
  const seeded = initialPersona ? personas[initialPersona] : null;
  const [phase, setPhase] = useState<Phase>(seeded ? "results" : "pick");
  const [platformId, setPlatformId] = useState<PlatformId | null>(seeded?.platform ?? null);
  const [answers, setAnswers] = useState<number[]>(seeded ? [...seeded.answers] : []);
  const [qIndex, setQIndex] = useState(seeded ? questions.length - 1 : 0);
  const [remote, setRemote] = useState<(CoachCopy & { source: "grok" | "fallback" }) | null>(null);
  const [copied, setCopied] = useState(false);
  const [shareFallback, setShareFallback] = useState("");
  const [view, setView] = useState<{ adapts: boolean; alternatives: boolean } | null>(null);

  const answerKey = answers.join(",");

  useEffect(() => {
    if (phase !== "results" || !platformId) return;
    const parsed = answerKey.split(",").map((part) => Number(part));
    if (parsed.length !== 6 || parsed.some((score) => score !== 0 && score !== 1 && score !== 2)) return;

    const controller = new AbortController();
    let cancelled = false;
    const scored = scoreAnswers(parsed);
    const context = structureContext(platformId, parsed);

    fetch("/api/coach", {
      method: "POST",
      signal: controller.signal,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        platform: platformId,
        answers: parsed,
        score: scored.score,
        level: scored.level,
        triad: {
          verdict: context.triad.verdict,
          phi: context.triad.phi,
          major_complex: context.triad.major_complex,
          tangle: context.headline,
          why: context.why,
          level: context.level,
        },
      }),
    })
      .then((response) => (response.ok ? response.json() : null))
      .then((data: unknown) => {
        if (cancelled || !data || typeof data !== "object") return;
        const record = data as Record<string, unknown>;
        if (
          typeof record.headline !== "string" ||
          typeof record.explanation !== "string" ||
          !Array.isArray(record.tips) ||
          record.tips.length !== 3 ||
          record.tips.some((tip) => typeof tip !== "string")
        ) {
          return;
        }
        const tips = record.tips as string[];
        setRemote({
          headline: record.headline,
          explanation: record.explanation,
          tips: [tips[0], tips[1], tips[2]],
          source: record.source === "grok" ? "grok" : "fallback",
        });
      })
      .catch(() => {});

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [phase, platformId, answerKey]);

  function runPersona(id: PersonaId) {
    const persona = personas[id];
    setPlatformId(persona.platform);
    setAnswers([...persona.answers]);
    setQIndex(questions.length - 1);
    setRemote(null);
    setCopied(false);
    setShareFallback("");
    setView(null);
    setPhase("results");
  }

  function pick(id: PlatformId) {
    setPlatformId(id);
    setAnswers([]);
    setQIndex(0);
    setRemote(null);
    setCopied(false);
    setShareFallback("");
    setView(null);
    setPhase("ask");
  }

  function choose(score: number) {
    const next = answers.slice();
    next[qIndex] = score;
    const trimmed = next.slice(0, qIndex + 1);
    setAnswers(trimmed);
    if (qIndex === questions.length - 1) {
      setView(null);
      setPhase("results");
    }
    else setQIndex(qIndex + 1);
  }

  function back() {
    if (qIndex === 0) setPhase("pick");
    else setQIndex(qIndex - 1);
  }

  function reset() {
    setPhase("pick");
    setPlatformId(null);
    setAnswers([]);
    setQIndex(0);
    setRemote(null);
    setCopied(false);
    setShareFallback("");
    setView(null);
  }

  async function share() {
    if (!platformId || answers.length !== 6) return;
    const scored = scoreAnswers(answers);
    const text = shareText(scored.level, scored.score, getPlatform(platformId).name, window.location.origin);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setShareFallback("");
    } catch {
      setCopied(false);
      setShareFallback(text);
    }
  }

  const platform = platformId ? getPlatform(platformId) : null;
  const ready =
    platform !== null &&
    answers.length === 6 &&
    answers.every((score) => score === 0 || score === 1 || score === 2);
  const scored = ready ? scoreAnswers(answers) : null;
  const actual = ready && platformId ? variantPhi(platformId, answers) : null;
  const viewed =
    actual && platformId
      ? variantBySwitches(platformId, view?.adapts ?? actual.adapts, view?.alternatives ?? actual.alternatives)
      : null;
  const copy = ready && platformId ? (remote ?? buildFallback(platformId, answers)) : null;
  const question = phase === "ask" ? questions[qIndex] : null;

  const personasBar = (
    <div className="flex flex-col gap-2 sm:flex-row">
      <Button type="button" variant="outline" data-testid="persona-riya" onClick={() => runPersona("riya")}>
        Try as Riya (passive)
      </Button>
      <Button type="button" variant="outline" data-testid="persona-sam" onClick={() => runPersona("sam")}>
        Try as Sam (deliberate)
      </Button>
    </div>
  );

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-6 px-5 py-8">
      {phase === "pick" ? personasBar : null}

      {phase === "pick" ? (
        <section className="flex flex-col gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.16em] text-muted">Step 1</p>
            <h1 className="mt-2 font-display text-4xl leading-tight">Which app are you inside?</h1>
            <p className="mt-3 text-lg leading-7 text-muted">
              Six questions, then two readings: one about the platform, one about you.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            {platforms.map((item) => (
              <Button
                key={item.id}
                type="button"
                variant="outline"
                data-testid={`platform-${item.id}`}
                onClick={() => pick(item.id)}
                className="h-auto w-full flex-col items-start gap-2 whitespace-normal rounded-3xl px-5 py-5 text-left"
              >
                <span className="font-display text-2xl font-normal">{item.name}</span>
                <span className="text-base font-normal leading-6 text-muted">{item.blurb}</span>
              </Button>
            ))}
          </div>
        </section>
      ) : null}

      {phase === "ask" && question && platform ? (
        <section className="flex flex-col gap-5">
          <div className="flex items-center justify-between gap-3 text-sm text-muted">
            <Button type="button" variant="ghost" onClick={back} className="h-10 px-3">
              <ArrowLeft aria-hidden="true" />
              Back
            </Button>
            <span>
              Question {qIndex + 1} of {questions.length}
            </span>
          </div>
          <div className="h-1 overflow-hidden rounded-full bg-line">
            <div className="h-full bg-accent" style={{ width: `${((qIndex + 1) / questions.length) * 100}%` }} />
          </div>
          <div>
            <p className="text-sm uppercase tracking-[0.16em] text-accent">{question.theme}</p>
            <h1 className="mt-2 font-display text-4xl leading-tight">{fillTemplate(question.prompt, platform)}</h1>
          </div>
          <div className="flex flex-col gap-3">
            {question.answers.map((answer, score) => {
              const selected = answers[qIndex] === score;
              return (
                <Button
                  key={answer}
                  type="button"
                  variant="outline"
                  data-testid={`answer-${score}`}
                  onClick={() => choose(score)}
                  className={`h-auto min-h-14 w-full justify-start whitespace-normal px-4 py-4 text-left font-normal leading-6 ${
                    selected ? "border-accent bg-accent-soft" : ""
                  }`}
                >
                  {fillTemplate(answer, platform)}
                </Button>
              );
            })}
          </div>
        </section>
      ) : null}

      {phase === "results" && platform && actual && viewed && scored && copy ? (
        <section
          className="flex flex-col gap-4"
          data-testid="results"
          data-source={remote?.source ?? "fallback"}
          data-score={scored.score}
          data-level={scored.level}
          data-variant={viewed.key}
          data-actual={actual.key}
          data-tangle={tangleKind(viewed.phi, viewed.uInMajorComplex) ?? "pending"}
          data-phi={viewed.phi === null ? "" : formatPhi(viewed.phi)}
          data-verdict={viewed.verdict ?? "pending"}
        >
          <div>
            <p className="text-sm uppercase tracking-[0.16em] text-muted">{platform.name}</p>
            <h1 className="mt-2 font-display text-4xl leading-tight">Two readings</h1>
            <p className="mt-2 text-muted">
              Adapting and keeping another channel change this reading. The score still uses all six answers.
            </p>
          </div>

          <TriadCard platform={platform} variant={viewed} level={scored.level} />
          <WhatIf
            platform={platform}
            actual={actual}
            viewed={viewed}
            onChange={(next) => setView(next)}
          />

          <article className="rounded-3xl border border-line bg-card p-5">
            <p className="text-sm uppercase tracking-[0.16em] text-muted">Coach score</p>
            <p className="mt-2 font-display text-6xl leading-none">{`${scored.score}/12`}</p>
            <h2 className="mt-2 font-display text-3xl">{scored.level}</h2>
            <p className="mt-3 text-lg leading-7">{copy.headline}</p>
            <ol className="mt-4 flex list-decimal flex-col gap-3 pl-5 text-base leading-6">
              {copy.tips.map((tip) => (
                <li key={tip}>{tip}</li>
              ))}
            </ol>
          </article>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button type="button" variant="outline" onClick={reset}>
              Try another platform
            </Button>
            <Button type="button" onClick={share}>
              {copied ? <Check aria-hidden="true" /> : <Share2 aria-hidden="true" />}
              Share my result
            </Button>
          </div>
          {copied ? (
            <p className="text-sm text-accent" role="status">
              Copied.
            </p>
          ) : null}
          {shareFallback ? (
            <p className="rounded-2xl border border-line bg-card p-4 text-sm leading-6 break-words">
              Copy this: {shareFallback}
            </p>
          ) : null}
          {personasBar}
        </section>
      ) : null}
    </div>
  );
}
