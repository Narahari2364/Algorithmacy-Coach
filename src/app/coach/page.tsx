import { Suspense } from "react";

import { CoachFlow } from "@/components/coach-flow";
import type { PersonaId } from "@/data/personas";

export const metadata = {
  title: "Coach",
  description: "Pick an app, answer six questions, and get a Triad Check plus a coach score.",
};

function personaFromQuery(value: string | string[] | undefined): PersonaId | null {
  const raw = Array.isArray(value) ? value[0] : value;
  if (raw === "riya" || raw === "sam") return raw;
  return null;
}

async function CoachEntry({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  return <CoachFlow initialPersona={personaFromQuery(params.persona)} />;
}

export default function CoachPage({ searchParams }: PageProps<"/coach">) {
  return (
    <main>
      <Suspense
        fallback={<p className="mx-auto w-full max-w-xl px-5 py-8 text-lg text-muted">Loading the coach…</p>}
      >
        <CoachEntry searchParams={searchParams} />
      </Suspense>
    </main>
  );
}
