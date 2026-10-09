import { QrCard } from "@/components/qr-card";

export const metadata = {
  title: "QR",
  description: "Scan to open Algorithmacy Coach on this host.",
};

export default function QrPage() {
  return (
    <main className="mx-auto flex w-full max-w-xl flex-col gap-4 px-5 py-12">
      <p className="text-sm uppercase tracking-[0.16em] text-muted">Demo</p>
      <h1 className="font-display text-4xl leading-tight sm:text-5xl">Scan the QR code and get your own score.</h1>
      <p className="text-lg leading-7 text-muted">
        The code points at this site, wherever it is open. It is not a fixed address baked into the page.
      </p>
      <QrCard />
    </main>
  );
}
