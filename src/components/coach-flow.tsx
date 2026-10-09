"use client";

import { ArrowLeft, Check, Share2 } from "lucide-react";
import { useEffect, useState } from "react";

import { TriadDiagram } from "@/components/triad-diagram";
import { Button } from "@/components/ui/button";
import { personas, type PersonaId } from "@/data/personas";
import { getPlatform, platforms, type PlatformId } from "@/data/platforms";
import { fillTemplate, questions } from "@/data/questions";
import { buildFallback, displayExplanation, type CoachCopy } from "@/lib/coach-copy";
import { coreLine, tangleKind, tangleLine, variantPhi } from "@/lib/phi";
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

  const answerKey = answers.join(",");

  useEffect(() => {
    if (phase !== "results" || !platformId) return;
    const parsed = answerKey.split(",").map((part) => Number(part));
    if (parsed.length !== 6 || parsed.some((score) => score !== 0 && score !== 1 && score !== 2)) return;

    const controller = new AbortController();
    let cancelled = false;
    const scored = scoreAnswers(parsed);
    const triad = variantPhi(platformId, parsed);

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
          verdict: triad.verdict,
          phi: triad.phi,
          major_complex: triad.major_complex,
          tangle: tangleLine(triad.phi, triad.uInMajorComplex, getPlatform(platformId).app),
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
    setPhase("results");
  }

  function pick(id: PlatformId) {
    setPlatformId(id);
    setAnswers([]);
    setQIndex(0);
    setRemote(null);
    setCopied(false);
    setShareFallback("");
    setPhase("ask");
  }

  function choose(score: number) {
    const next = answers.slice();
    next[qIndex] = score;
    const trimmed = next.slice(0, qIndex + 1);
    setAnswers(trimmed);
    if (qIndex === questions.length - 1) setPhase("results");
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
  const triad = ready && platformId ? variantPhi(platformId, answers) : null;
  const copy = ready && platformId ? (remote ?? buildFallback(platformId, answers)) : null;
  const membership =
    triad && platform ? tangleLine(triad.phi, triad.uInMajorComplex, platform.app) : "";
  const core =
    triad && platform ? coreLine(triad.verdict, triad.major_complex, platform.diagram) : null;
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

      {phase === "results" && platform && triad && scored && copy ? (
        <section
          className="flex flex-col gap-4"
          data-testid="results"
          data-source={remote?.source ?? "fallback"}
          data-score={scored.score}
          data-level={scored.level}
          data-variant={triad.key}
          data-tangle={tangleKind(triad.phi, triad.uInMajorComplex) ?? "pending"}
          data-phi={triad.phi === null ? "" : formatPhi(triad.phi)}
          data-verdict={triad.verdict ?? "pending"}
        >
          <div>
            <p className="text-sm uppercase tracking-[0.16em] text-muted">{platform.name}</p>
            <h1 className="mt-2 font-display text-4xl leading-tight">Two readings</h1>
            <p className="mt-2 text-muted">
              Adapting and keeping another channel change this reading. The score still uses all six answers.
            </p>
          </div>

          <article className="rounded-3xl border border-line bg-card p-5">
            <p className="text-sm uppercase tracking-[0.16em] text-muted">Triad Check</p>
            {triad.verdict && triad.phi !== null ? (
              <>
                <h2 className="mt-2 font-display text-3xl leading-tight">{membership}</h2>
                <p className="mt-1 text-lg">Φ {formatPhi(triad.phi)}</p>
                <p className="text-base capitalize text-muted">{triad.verdict}</p>
                {core ? (
                  <p className="mt-1 text-base" data-testid="core-members">
                    {core}
                  </p>
                ) : null}
              </>
            ) : (
              <h2 className="mt-2 font-display text-3xl leading-tight">Structural verdict coming soon</h2>
            )}
            <p className="mt-3 text-base leading-7">
              {platformId ? displayExplanation(platformId, answers, copy.explanation) : copy.explanation}
            </p>
            <div className="mt-4">
              <TriadDiagram verdict={triad.verdict} labels={platform.diagram} />
            </div>
            <p className="break-words font-mono text-sm text-muted">{triad.rules}</p>
          </article>

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
