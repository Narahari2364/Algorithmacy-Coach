import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="mx-auto flex w-full max-w-xl flex-col gap-4 px-5 py-16">
      <p className="text-sm uppercase tracking-[0.16em] text-muted">404</p>
      <h1 className="font-display text-4xl leading-tight">That page is not here.</h1>
      <p className="text-lg leading-7 text-muted">The coach is on the home page and at /coach.</p>
      <div>
        <Button asChild>
          <Link href="/">Back home</Link>
        </Button>
      </div>
    </main>
  );
}
