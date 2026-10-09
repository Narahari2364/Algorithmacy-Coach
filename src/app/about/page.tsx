import type { Metadata } from "next";
import Link from "next/link";

import { TriadDiagram } from "@/components/triad-diagram";
import { VariantTable } from "@/components/variant-table";
import { questions } from "@/data/questions";
import { labLicense, labUrl } from "@/data/site";
import { edgesFromRules, mathFindings } from "@/lib/explain";
import { phiFile, platformPhi } from "@/lib/phi";
import { formatPhi } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Case study",
  description: "How Algorithmacy Coach uses Roger Hunt's open lab, and what it adds.",
};

const limits = [
  "The platforms are simplified three-node binary models. Each party is on or off.",
  "The numbers describe those models. They are not measurements of Instagram, Uber, or anyone's inbox.",
  "The coach score is a prototype rubric. It is not a validated measure.",
  "Φ is precomputed. Nothing calls PyPhi while you click.",
  "Tips are pre-written when no XAI_API_KEY is set. Grok does not choose the score or the verdict.",
];

export default function AboutPage() {
  const findings = mathFindings();
  const instagram = platformPhi("instagram");
  const email = platformPhi("email");

  return (
    <main className="mx-auto w-full max-w-[720px] px-5 py-12 break-words">
      <p className="text-sm uppercase tracking-[0.18em] text-accent">Case study</p>
      <h1 className="mt-2 font-display text-5xl leading-[1.05]">Algorithmacy Coach</h1>

      <section className="mt-8">
        <h2 className="font-display text-3xl">Overview</h2>
        <p className="mt-3 text-base leading-7">
          Algorithmacy Coach is a one-minute check. It asks whether a simplified model of an app is a pipe or an
          irreducible third party, and whether you are steering that app. Built at the Grok Bot Boston Hackathon,
          October 2026.
        </p>
        <p className="mt-3 text-base leading-7">
          <Link className="underline decoration-line underline-offset-4" href="/">
            Open the live app
          </Link>
          . The research it borrows is{" "}
          <a className="underline decoration-line underline-offset-4" href={labUrl}>
            algorithmacy-lab
          </a>
          , {labLicense} licensed.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-3xl">The problem</h2>
        <p className="mt-3 text-base leading-7">
          People coordinate with audiences, riders, and customers through algorithms they cannot see. The algorithm
          sits between them. Most people never learn whether that algorithm is a neutral pipe or an active party, and
          they get no reading on how deliberately they navigate it.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-3xl">The research behind it</h2>
        <p className="mt-3 text-base leading-7">
          Roger Hunt&apos;s algorithmacy lab asks one question about coordination. When a worker, a mediating system,
          and a counterpart work together, does the arrangement genuinely bind all three, or does it factor into
          independent two-party pieces? A form that factors is <strong>dyadic</strong>. The lab says that demands
          ordinary literacy. A form that stays irreducible across the worker, the system, and the counterpart is{" "}
          <strong>triadic</strong>. The competence that demands is what the lab calls <strong>algorithmacy</strong>.
        </p>
        <p className="mt-3 text-base leading-7">
          The measure is exact integrated information, Φ, from Integrated Information Theory 4.0, computed with PyPhi.
          The classifier reads Φ over the minimum-information partition of the model, not a hand-picked cut. Φ above
          the lab&apos;s noise floor means triadic. Φ of zero means the cause-effect structure factors, so the verdict
          is dyadic. On systems this small the verdict is exact, not a proxy.
        </p>
        <p className="mt-3 text-base leading-7">
          The lab fixes hypotheses before it computes, runs them against that instrument, and reports nulls. Its own
          overview says about a third of the results are nulls or refutations, and that the core results are in-silico:
          evidence about Boolean models, not measurements of real organizations. It keeps an open call for real-world
          data: one field case, one qualitative study, one recorded series, and a survey cohort.
        </p>
        <p className="mt-3 text-base leading-7">
          The lab is {labLicense} licensed, copyright Roger Hunt.{" "}
          <a className="underline decoration-line underline-offset-4 [overflow-wrap:anywhere]" href={labUrl}>
            github.com/rogerSuperBuilderAlpha/algorithmacy-lab
          </a>
          .
        </p>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-3xl">How this project uses the research</h2>
        <p className="mt-3 text-base leading-7">
          Reused from the lab: the classifier <span className="font-mono text-sm">org_frontier.classifier.classify_rules</span>,
          the major-complex reading <span className="font-mono text-sm">org_frontier.probes.lib.major_complex</span>, the
          instrument control that has to print &quot;Instrument validated&quot; before any verdict is trusted, and the
          dyadic/triadic rule itself.
        </p>
        <p className="mt-3 text-base leading-7">
          New here: the Instagram, Uber, and Email models, the two personalization switches, the precompute script, the
          six-question rubric, the what-if panel, the plain-English explanations, and this web app.
        </p>
        <ol className="mt-4 flex flex-col gap-2 text-base leading-7">
          {[
            "Plain-English platform",
            "3-node Boolean model",
            "Transition table",
            "Lab classifier and PyPhi",
            "phi_results.json",
            "This app",
          ].map((step, index) => (
            <li key={step} className="rounded-2xl border border-line bg-card px-4 py-3">
              <span className="text-accent">{index + 1}. </span>
              {step}
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-3xl">The models</h2>
        <p className="mt-3 text-base leading-7">
          {phiFile.switches.adapts} {phiFile.switches.alternatives} Keys are {phiFile.switches.key}.
        </p>
        <div className="mt-4 flex flex-col gap-3">
          {(["instagram", "uber", "email"] as const).map((id) => {
            const row = platformPhi(id);
            return (
              <article key={id} className="rounded-2xl border border-line px-4 py-3">
                <h3 className="font-display text-2xl capitalize">{id}</h3>
                <p className="mt-1 font-mono text-sm">{row.rules}</p>
                <p className="mt-1 text-base leading-6">
                  {row.verdict} · whole-system Φ {formatPhi(row.phi)}
                </p>
              </article>
            );
          })}
        </div>
        <h3 className="mt-8 font-display text-2xl">All twelve variants</h3>
        <p className="mt-2 text-base leading-7 text-muted">Read from phi_results.json at build time. Not typed by hand.</p>
        <VariantTable />
      </section>

      <section className="mt-10">
        <h2 className="font-display text-3xl">What the math found</h2>
        <div className="mt-4 flex flex-col gap-4">
          {findings.map((finding) => (
            <article key={finding.id} className="rounded-2xl border border-line bg-card p-4">
              <h3 className="font-display text-2xl">{finding.title}</h3>
              <p className="mt-2 text-base leading-7">{finding.line}</p>
              <p className="mt-2 text-sm leading-6 text-muted">{finding.caveat}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-3xl">The coach score</h2>
        <p className="mt-3 text-base leading-7">
          A prototype rubric. Each answer is 0, 1, or 2. The total runs from 0 to 12. Passive is 0–4, Aware is 5–8,
          Deliberate is 9–12.
        </p>
        <ol className="mt-4 flex flex-col gap-3">
          {questions.map((question, index) => (
            <li key={question.theme} className="rounded-2xl border border-line px-4 py-3">
              <p className="font-medium">
                {index + 1}. {question.theme}
              </p>
              <p className="mt-1 text-base leading-6 text-muted">{question.prompt}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-3xl">Architecture</h2>
        <ol className="mt-4 flex flex-col gap-2 text-base leading-7">
          {[
            "Browser: six answers, scored on the device",
            "Next.js on Vercel",
            "Deterministic scorer",
            "phi_results.json",
            "/api/coach, which asks Grok when a key is set",
            "Fallback tips when the key is missing or the call fails",
          ].map((step) => (
            <li key={step} className="rounded-2xl border border-line bg-card px-4 py-3">
              {step}
            </li>
          ))}
        </ol>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <figure className="rounded-2xl border border-line p-3">
            <TriadDiagram
              labels={{ U: "You", A: "Server", C: "Recipient" }}
              core={email.major_complex}
              edges={edgesFromRules(email.rules)}
            />
            <figcaption className="px-2 pb-2 text-sm leading-6 text-muted">
              Email, forward only. The sender does not read anyone.
            </figcaption>
          </figure>
          <figure className="rounded-2xl border border-line p-3">
            <TriadDiagram
              labels={{ U: "You", A: "Ranker", C: "Audience" }}
              core={instagram.major_complex}
              edges={edgesFromRules(instagram.rules)}
            />
            <figcaption className="px-2 pb-2 text-sm leading-6 text-muted">
              Instagram&apos;s base. The ranker reads both sides, and both sides read the ranker.
            </figcaption>
          </figure>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-3xl">Honest limitations</h2>
        <ul className="mt-3 flex list-disc flex-col gap-2 pl-5 text-base leading-7">
          {limits.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-3xl">What&apos;s next</h2>
        <ul className="mt-3 flex list-disc flex-col gap-2 pl-5 text-base leading-7">
          <li>Voice input.</li>
          <li>A live PyPhi backend, for example on Railway, so a custom model can be computed instead of only looked up.</li>
          <li>Describe any app, and let Grok draft the Boolean model.</li>
          <li>Compare this rubric with the lab&apos;s survey instrument once that instrument is fielded.</li>
          <li>Contribute logs back to the lab&apos;s open call for real-world data.</li>
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-3xl">Built with</h2>
        <p className="mt-3 text-base leading-7">
          Grok, Grok Bot in Cursor, PyPhi, algorithmacy-lab, Next.js, Tailwind, and Vercel.
        </p>
        <p className="mt-6">
          <Link href="/coach" className="underline decoration-line underline-offset-4">
            Try the coach
          </Link>
        </p>
      </section>
    </main>
  );
}
