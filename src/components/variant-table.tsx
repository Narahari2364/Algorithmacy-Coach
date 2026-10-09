import { getPlatform, isPlatformId } from "@/data/platforms";
import { tightestCoreLabel, verdictLabel } from "@/lib/explain";
import { phiFile } from "@/lib/phi";
import { formatPhi } from "@/lib/utils";

export function VariantTable() {
  const rows = Object.entries(phiFile.variants);
  return (
    <div className="mt-4 flex flex-col gap-3">
      {rows.map(([key, row]) => {
        if (!isPlatformId(row.platform)) return null;
        const platform = getPlatform(row.platform);
        return (
          <article key={key} className="rounded-2xl border border-line px-4 py-3">
            <p className="font-mono text-sm">{key}</p>
            <p className="mt-1 text-base leading-6">
              {verdictLabel(row.verdict === "triadic" || row.verdict === "dyadic" ? row.verdict : null)} · whole-system Φ{" "}
              {formatPhi(row.phi)}
            </p>
            <p className="text-base leading-6 text-muted">
              Tightest core: {tightestCoreLabel(row.major_complex, platform.diagram)}
            </p>
            <p className="mt-1 font-mono text-sm text-muted [overflow-wrap:anywhere]">{row.rules}</p>
          </article>
        );
      })}
    </div>
  );
}
