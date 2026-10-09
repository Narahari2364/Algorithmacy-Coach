"use client";

import type { Platform } from "@/data/platforms";
import { changeNote, verdictLabel } from "@/lib/explain";
import { platformVariants, type VariantPhi } from "@/lib/phi";
import { formatPhi } from "@/lib/utils";

export function WhatIf({
  platform,
  actual,
  viewed,
  onChange,
}: {
  platform: Platform;
  actual: VariantPhi;
  viewed: VariantPhi;
  onChange: (next: { adapts: boolean; alternatives: boolean }) => void;
}) {
  const note = changeNote(actual, viewed, platform);
  const cells = platformVariants(platform.id);

  return (
    <section className="rounded-3xl border border-line bg-card p-5" data-testid="what-if">
      <h2 className="font-display text-3xl">What if?</h2>
      <p className="mt-2 text-base leading-7 text-muted">
        Your coach score stays the same. These toggles only change the structure.
      </p>
      <div className="mt-4 flex flex-col gap-3">
        <Toggle
          testId="toggle-adapts"
          pressed={viewed.adapts}
          marked={viewed.adapts === actual.adapts}
          label="I adapt to the algorithm"
          onClick={() => onChange({ adapts: !viewed.adapts, alternatives: viewed.alternatives })}
        />
        <Toggle
          testId="toggle-alternatives"
          pressed={viewed.alternatives}
          marked={viewed.alternatives === actual.alternatives}
          label={`I keep another way to reach ${platform.counterpart}`}
          onClick={() => onChange({ adapts: viewed.adapts, alternatives: !viewed.alternatives })}
        />
      </div>
      {viewed.key !== actual.key ? (
        <button
          type="button"
          className="mt-3 text-sm underline decoration-line underline-offset-4"
          onClick={() => onChange({ adapts: actual.adapts, alternatives: actual.alternatives })}
        >
          Reset to my answers
        </button>
      ) : null}
      {note ? (
        <p className="mt-4 text-base leading-7" data-testid="change-note">
          {note}
        </p>
      ) : null}
      <div className="mt-4 grid grid-cols-2 gap-2" data-testid="variant-grid">
        {cells.map((cell) => {
          const isActual = cell.key === actual.key;
          const isViewed = cell.key === viewed.key;
          return (
            <button
              key={cell.key}
              type="button"
              data-testid={`cell-${cell.key}`}
              onClick={() => onChange({ adapts: cell.adapts, alternatives: cell.alternatives })}
              className={`rounded-2xl border px-3 py-3 text-left text-sm leading-5 ${
                isViewed ? "border-accent bg-accent-soft" : "border-line"
              } ${isActual ? "ring-2 ring-accent ring-offset-2 ring-offset-card" : ""}`}
            >
              <span className="block font-medium">
                {cell.adapts ? "Adapt" : "Don't adapt"}
                {" · "}
                {cell.alternatives ? "Other way" : "No other way"}
              </span>
              <span className="mt-1 block text-muted">
                {verdictLabel(cell.verdict)} · Φ {formatPhi(cell.phi)}
              </span>
              {isActual ? <span className="mt-1 block text-xs uppercase tracking-wide text-accent">Your answers</span> : null}
            </button>
          );
        })}
      </div>
    </section>
  );
}

function Toggle({
  label,
  pressed,
  marked,
  onClick,
  testId,
}: {
  label: string;
  pressed: boolean;
  marked: boolean;
  onClick: () => void;
  testId: string;
}) {
  return (
    <button
      type="button"
      data-testid={testId}
      aria-pressed={pressed}
      onClick={onClick}
      className={`flex w-full items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-left ${
        pressed ? "border-accent bg-accent-soft" : "border-line"
      }`}
    >
      <span>
        <span className="block text-base leading-6">{label}</span>
        {marked ? <span className="text-xs uppercase tracking-wide text-accent">your answers</span> : null}
      </span>
      <span
        aria-hidden="true"
        className={`relative h-7 w-12 shrink-0 rounded-full border border-line transition-colors duration-300 ${
          pressed ? "bg-accent" : "bg-background"
        }`}
      >
        <span
          className={`absolute top-0.5 size-5 rounded-full bg-card transition-transform duration-300 ${
            pressed ? "translate-x-6" : "translate-x-0.5"
          }`}
        />
      </span>
    </button>
  );
}
