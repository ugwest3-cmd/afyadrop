// One-off logo cleanup: remove the black background (make transparent)
// and brighten the dark-teal artwork so it reads on light + dark surfaces.
import sharp from "sharp";
import { fileURLToPath } from "url";
import path from "path";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const pub = path.join(root, "web", "frontend", "public");

// Target brand teal for the artwork (a brighter, cleaner green than the murky original).
const BRAND = { r: 18, g: 122, b: 92 }; // teal

async function processLogo(input, output, { trim = true } = {}) {
  const img = sharp(path.join(pub, input));
  const { data, info } = await img.raw().ensureAlpha().toBuffer({ resolveWithObject: true });

  const px = new Uint8ClampedArray(data.length);
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i], g = data[i + 1], b = data[i + 2];
    const max = Math.max(r, g, b);
    const isBackground = max < 40; // near-black background
    if (isBackground) {
      px[i] = 0; px[i + 1] = 0; px[i + 2] = 0; px[i + 3] = 0; // transparent
    } else {
      // Recolour any visible pixel to the brand teal, preserving its relative luminance.
      const lum = max / 255; // 0..1
      px[i] = Math.min(255, Math.round(BRAND.r * (0.5 + lum)));
      px[i + 1] = Math.min(255, Math.round(BRAND.g * (0.5 + lum)));
      px[i + 2] = Math.min(255, Math.round(BRAND.b * (0.5 + lum)));
      px[i + 3] = 255; // opaque
    }
  }

  let out = sharp(Buffer.from(px), { raw: { width: info.width, height: info.height, channels: 4 } }).png();
  if (trim) out = out.trim(); // crop transparent border
  await out.toFile(path.join(pub, output));
  console.log(`wrote ${output}`);
}

await processLogo("logo-mark.png", "logo-mark.png");
await processLogo("logo-full.png", "logo-full.png");
console.log("done");
