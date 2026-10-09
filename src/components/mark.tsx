export function Mark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <rect width="32" height="32" rx="8" fill="var(--accent)" />
      <path
        d="M16 7.5 25.5 24.5h-19Z"
        fill="none"
        stroke="var(--paper)"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <circle cx="16" cy="11.5" r="1.6" fill="var(--paper)" />
      <circle cx="10.2" cy="22.2" r="1.6" fill="var(--paper)" />
      <circle cx="21.8" cy="22.2" r="1.6" fill="var(--paper)" />
    </svg>
  );
}
