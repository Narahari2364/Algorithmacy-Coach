import Link from "next/link";

const LAB_URL = "https://github.com/rogerSuperBuilderAlpha/algorithmacy-lab";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-line">
      <div className="mx-auto flex max-w-5xl flex-col gap-4 px-5 py-8 text-sm leading-6 text-muted">
        <p>
          Inspired by Roger Hunt&apos;s algorithmacy research. Structural verdicts are computed with PyPhi
          (IIT 4.0) via the open{" "}
          <a className="underline decoration-line underline-offset-4" href={LAB_URL}>
            algorithmacy-lab
          </a>{" "}
          repo, on simplified three-party models of each platform.
        </p>
        <p>The coach score is a prototype rubric, not a validated measure.</p>
        <p>Your answers are not stored.</p>
        <p className="flex flex-wrap gap-x-4 gap-y-2">
          <Link href="/coach" className="underline underline-offset-4">
            Try the coach
          </Link>
          <Link href="/qr" className="underline underline-offset-4">
            Demo QR
          </Link>
          <a className="underline underline-offset-4" href={LAB_URL}>
            algorithmacy-lab
          </a>
        </p>
      </div>
    </footer>
  );
}
