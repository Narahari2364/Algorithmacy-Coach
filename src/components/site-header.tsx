import Link from "next/link";

import { Mark } from "@/components/mark";
import { ThemeToggle } from "@/components/theme-toggle";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-line/80 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-2 px-4 sm:px-5">
        <Link href="/" className="flex min-w-0 items-center gap-2">
          <Mark className="size-8 shrink-0" />
          <span className="truncate font-display text-base tracking-tight sm:text-lg">Algorithmacy</span>
        </Link>
        <nav className="flex shrink-0 items-center text-sm">
          <Link href="/coach" className="rounded-full px-2.5 py-2 hover:bg-accent-soft">
            Coach
          </Link>
          <Link href="/qr" className="rounded-full px-2.5 py-2 hover:bg-accent-soft">
            QR
          </Link>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
