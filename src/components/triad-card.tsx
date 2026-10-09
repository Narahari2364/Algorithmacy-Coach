import { TriadDiagram } from "@/components/triad-diagram";
import type { Platform } from "@/data/platforms";
import { edgesFromRules, glossary, structureHeadline, tightestCoreLabel, verdictLabel, whyLine } from "@/lib/explain";
import type { VariantPhi } from "@/lib/phi";
import type { Level } from "@/lib/score";
import { formatPhi } from "@/lib/utils";

export function TriadCard({
  platform,
  variant,
  level,
}: {
  platform: Platform;
  variant: VariantPhi;
  level: Level;
}) {
  const headline = structureHeadline(platform, variant.phi, variant.uInMajorComplex, level);
  const why = variant.rules ? whyLine(variant.rules, platform) : "Structural verdict coming soon.";
  const core = tightestCoreLabel(variant.major_complex, platform.diagram);

  return (
    <article className="rounded-3xl border border-line bg-card p-5" data-testid="triad-card">
      <p className="text-sm uppercase tracking-[0.16em] text-muted">Triad Check</p>
      <h2 className="mt-2 font-display text-3xl leading-tight" data-testid="structure-headline">
        {headline}
      </h2>
      <p className="mt-3 text-base leading-7" data-testid="why-line">
        {why}
      </p>
      <dl className="mt-4 flex flex-col gap-1 text-base leading-6">
        <div className="flex flex-wrap gap-x-2">
          <dt className="text-muted">Whole-system:</dt>
          <dd data-testid="verdict-label">{verdictLabel(variant.verdict)}</dd>
        </div>
        <div className="flex flex-wrap gap-x-2">
          <dt className="text-muted">Whole-system Φ:</dt>
          <dd data-testid="phi-label">{formatPhi(variant.phi)}</dd>
        </div>
        <div className="flex flex-wrap gap-x-2">
          <dt className="text-muted">Tightest core:</dt>
          <dd data-testid="core-label">{core}</dd>
        </div>
      </dl>
      <details className="mt-4 rounded-2xl border border-line px-4 py-3">
        <summary className="cursor-pointer font-medium">What the numbers mean</summary>
        <dl className="mt-3 flex flex-col gap-3">
          {glossary().map((item) => (
            <div key={item.term}>
              <dt className="font-medium">{item.term}</dt>
              <dd className="text-base leading-7 text-muted">{item.body}</dd>
            </div>
          ))}
        </dl>
      </details>
      <div className="mt-4">
        <TriadDiagram
          labels={platform.diagram}
          core={variant.major_complex}
          edges={variant.rules ? edgesFromRules(variant.rules) : []}
        />
      </div>
      {variant.rules ? <p className="font-mono text-sm text-muted [overflow-wrap:anywhere]">{variant.rules}</p> : null}
    </article>
  );
}
