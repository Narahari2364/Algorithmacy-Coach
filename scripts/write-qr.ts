import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import QRCode from "qrcode";

async function main() {
  const base = process.argv[2] || process.env.BASE_URL || "http://127.0.0.1:43123";
  const destination = path.join(process.cwd(), "public", "qr.png");
  await mkdir(path.dirname(destination), { recursive: true });
  const png = await QRCode.toBuffer(base, {
    type: "png",
    width: 640,
    margin: 1,
    color: { dark: "#0c6b52", light: "#fffdf8" },
  });
  await writeFile(destination, png);
  console.log(`wrote ${destination} for ${base}`);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
