import { TriadDiagram } from "@/components/triad-diagram";
import { getPlatform } from "@/data/platforms";
import { edgesFromRules, mathFindings } from "@/lib/explain";
import { variantBySwitches } from "@/lib/phi";

export function MathFound() {
  const findings = mathFindings();
  return (
    <section className="mx-auto w-full max-w-5xl px-5 pb-16" data-testid="math-found">
      <p className="text-sm uppercase tracking-[0.18em] text-muted">What the math found</p>
      <h2 className="mt-2 max-w-3xl font-display text-4xl leading-tight sm:text-5xl">
        Two results that are easy to get wrong.
      </h2>
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        {findings.map((finding) => {
          const [platformId, adapts, alternatives] = finding.focusKey.split(":");
          const platform = getPlatform(platformId as "instagram" | "uber" | "email");
          const variant = variantBySwitches(platform.id, adapts === "true", alternatives === "true");
          return (
            <article key={finding.id} className="rounded-3xl border border-line bg-card p-5">
              <h3 className="font-display text-2xl leading-tight">{finding.title}</h3>
              <p className="mt-3 text-base leading-7">{finding.line}</p>
              <p className="mt-2 text-sm leading-6 text-muted">{finding.caveat}</p>
              <TriadDiagram
                labels={platform.diagram}
                core={variant.major_complex}
                edges={edgesFromRules(variant.rules)}
              />
            </article>
          );
        })}
      </div>
    </section>
  );
}
