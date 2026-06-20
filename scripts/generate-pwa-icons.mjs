import sharp from "sharp";
import { mkdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const iconsDir = path.join(root, "public", "icons");
const svg = await readFile(path.join(iconsDir, "icon.svg"));

await mkdir(iconsDir, { recursive: true });

const sizes = [
  { name: "icon-192.png", size: 192 },
  { name: "icon-512.png", size: 512 },
  { name: "apple-touch-icon.png", size: 180 },
  { name: "icon-maskable-512.png", size: 512, padding: 64 },
];

for (const { name, size, padding = 0 } of sizes) {
  const image = sharp(svg).resize(size - padding * 2, size - padding * 2).png();
  const output =
    padding > 0
      ? await sharp({
          create: {
            width: size,
            height: size,
            channels: 4,
            background: "#2563eb",
          },
        })
          .composite([{ input: await image.toBuffer(), gravity: "center" }])
          .png()
          .toBuffer()
      : await image.toBuffer();

  await sharp(output).toFile(path.join(iconsDir, name));
}

console.log("PWA icons generated.");
