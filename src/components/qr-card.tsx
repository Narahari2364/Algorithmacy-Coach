"use client";

import QRCode from "qrcode";
import { useEffect, useRef, useState } from "react";

export function QrCard() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const next = window.location.origin;
    setOrigin(next);
    QRCode.toCanvas(canvas, next, {
      width: 280,
      margin: 1,
      color: { dark: "#1b1612", light: "#f3eee4" },
    }).catch(() => {});
  }, []);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex w-full max-w-xs items-center justify-center rounded-3xl bg-[#f3eee4] p-4">
        <canvas
          ref={canvasRef}
          role="img"
          aria-label={origin ? `QR code for ${origin}` : "QR code"}
          className="h-auto w-full"
        />
      </div>
      {origin ? <p className="break-all text-center text-base text-muted">{origin}</p> : null}
    </div>
  );
}
