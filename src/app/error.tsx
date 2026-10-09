"use client";

import { useEffect } from "react";

import { Button } from "@/components/ui/button";

export default function Error({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto flex w-full max-w-xl flex-col gap-4 px-5 py-16">
      <h1 className="font-display text-4xl leading-tight">Something went wrong.</h1>
      <p className="text-lg leading-7 text-muted">The page failed to render. Your answers are not stored.</p>
      <div>
        <Button type="button" onClick={() => retry()}>
          Try again
        </Button>
      </div>
    </main>
  );
}
