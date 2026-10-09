import Link from "next/link";

import { MathFound } from "@/components/math-found";
import { TriadDiagram } from "@/components/triad-diagram";
import { Button } from "@/components/ui/button";
import { edgesFromRules } from "@/lib/explain";
import { platformPhi } from "@/lib/phi";

const problems = [
  {
    title: "It sits between you",
    body: "The algorithm sits between you and your audience. You do not hand them the post, the ping, or the offer.",
  },
  {
    title: "It shapes both sides",
    body: "It shapes both sides. What you see next, and what they see of you, comes out of the same update.",
  },
  {
    title: "Nobody scores the skill",
    body: "Nobody tells you how well you navigate it. The feed just keeps going.",
  },
];

const steps = [
  { n: "01", title: "Pick an app", body: "Instagram, Uber, or Email as the comparison case." },
  { n: "02", title: "Answer six questions", body: "One screen each. Three answers. About a minute." },
  { n: "03", title: "Get two readings", body: "Whether the platform demands algorithmacy, and whether you are steering." },
];

const builtWith = [
  ["Grok", "xAI writes the coaching when a key is set"],
  ["Grok Bot in Cursor", "Built the app from the plan"],
  ["PyPhi", "Exact Φ, IIT 4.0, run once"],
  ["algorithmacy-lab", "The open classifier and the verdict rule"],
  ["Next.js", "App Router, scored in the browser"],
  ["Vercel", "Where the public link is hosted"],
];

export default function Home() {
  return (
    <main>
      <section className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-5 py-14 sm:py-20">
        <p className="text-sm uppercase tracking-[0.18em] text-accent">Algorithmacy Coach</p>
        <h1 className="max-w-4xl font-display text-[2.65rem] leading-[1.02] tracking-tight sm:text-7xl">
          Is the algorithm steering you, or are you steering it?
        </h1>
        <p className="max-w-2xl text-xl leading-8 text-muted">
          A 60-second check, built with Grok, grounded in open research on algorithmacy.
        </p>
        <div>
          <Button asChild size="lg">
            <Link href="/coach">Try the coach</Link>
          </Button>
        </div>
      </section>

      <MathFound />

      <section className="mx-auto grid w-full max-w-5xl gap-4 px-5 pb-16 sm:grid-cols-3">
        {problems.map((item, index) => (
          <article key={item.title} className="rounded-3xl border border-line bg-card p-5">
            <p className="font-display text-3xl text-accent">0{index + 1}</p>
            <h2 className="mt-3 font-display text-2xl leading-tight">{item.title}</h2>
            <p className="mt-2 text-base leading-7 text-muted">{item.body}</p>
          </article>
        ))}
      </section>

      <section className="mx-auto grid w-full max-w-5xl items-center gap-10 px-5 pb-16 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <p className="text-sm uppercase tracking-[0.18em] text-muted">How it works</p>
          <h2 className="mt-2 font-display text-4xl leading-tight sm:text-5xl">Three steps, two readings.</h2>
          <ol className="mt-6 flex flex-col gap-5">
            {steps.map((step) => (
              <li key={step.n} className="grid grid-cols-[3.5rem_1fr] gap-3">
                <span className="font-display text-xl text-accent">{step.n}</span>
                <span>
                  <span className="block font-display text-2xl">{step.title}</span>
                  <span className="mt-1 block text-base leading-7 text-muted">{step.body}</span>
                </span>
              </li>
            ))}
          </ol>
        </div>
        <div className="rounded-3xl border border-line bg-card p-4">
          <TriadDiagram
            labels={{ U: "You", A: "Algorithm", C: "Counterpart" }}
            core={platformPhi("instagram").major_complex}
            edges={edgesFromRules(platformPhi("instagram").rules)}
          />
          <p className="px-2 pb-2 text-center text-sm leading-6 text-muted">
            U, A, and C. The algorithm is a node in the triangle, not a neutral pipe drawn between two people.
          </p>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-5xl gap-4 px-5 pb-16 md:grid-cols-2">
        <article className="rounded-3xl border border-line bg-card p-6">
          <p className="text-sm uppercase tracking-[0.18em] text-muted">Structure</p>
          <h2 className="mt-2 font-display text-4xl">Triad Check</h2>
          <p className="mt-3 text-lg leading-8">Does this platform demand algorithmacy?</p>
          <p className="mt-2 text-base leading-7 text-muted">
            Exact Φ on a three-node model, read from a file. Two answers retune it: whether you adapt to the algorithm, and whether you keep another way through.
          </p>
        </article>
        <article className="rounded-3xl border border-line bg-card p-6">
          <p className="text-sm uppercase tracking-[0.18em] text-muted">Competence</p>
          <h2 className="mt-2 font-display text-4xl">Coach score</h2>
          <p className="mt-3 text-lg leading-8">Do you have it?</p>
          <p className="mt-2 text-base leading-7 text-muted">
            Six questions, scored in your browser from 0 to 12. Passive, Aware, or Deliberate. The score is about you, and it never waits on a model.
          </p>
        </article>
      </section>

      <section className="mx-auto w-full max-w-5xl px-5 pb-16">
        <p className="text-sm uppercase tracking-[0.18em] text-muted">Built with</p>
        <h2 className="mt-2 font-display text-4xl">The stack behind the two readings.</h2>
        <dl className="mt-6 grid gap-px overflow-hidden rounded-3xl border border-line bg-line sm:grid-cols-2">
          {builtWith.map(([name, detail]) => (
            <div key={name} className="bg-card px-5 py-4">
              <dt className="font-display text-2xl">{name}</dt>
              <dd className="mt-1 text-base leading-6 text-muted">{detail}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-5 pb-16">
        <h2 className="font-display text-4xl">Credits</h2>
        <p className="max-w-3xl text-base leading-7 text-muted">
          Inspired by Roger Hunt&apos;s algorithmacy research. Structural verdicts are computed with PyPhi (IIT 4.0) via
          the open{" "}
          <a
            className="underline decoration-line underline-offset-4"
            href="https://github.com/rogerSuperBuilderAlpha/algorithmacy-lab"
          >
            algorithmacy-lab
          </a>{" "}
          repo, on simplified three-party models of each platform.
        </p>
        <p className="text-base leading-7 text-muted">The coach score is a prototype rubric, not a validated measure.</p>
        <p className="text-base leading-7 text-muted">Your answers are not stored.</p>
        <div>
          <Button asChild size="lg">
            <Link href="/coach">Try the coach</Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
