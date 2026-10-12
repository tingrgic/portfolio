import sharp from "/home/tin/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp/dist/index.cjs";
import { mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const sources = {
  forward:
    "/home/tin/.codex/generated_images/01a0eca4-5a90-7970-a71a-76c7f073d9ca/exec-db24c136-bd26-4919-a074-6839bf1304b7.png",
  backward:
    "/home/tin/.codex/generated_images/01a0eca4-5a90-7970-a71a-76c7f073d9ca/exec-d8e08452-50c0-4417-9ec1-d07be523dded.png",
};

const outputDirectory = new URL("../public/images/hands/", import.meta.url);
await mkdir(outputDirectory, { recursive: true });

for (const [direction, source] of Object.entries(sources)) {
  for (let index = 0; index < 6; index += 1) {
    const left = (index % 3) * 512;
    const top = Math.floor(index / 3) * 512;
    const { data, info } = await sharp(source)
      .extract({ left, top, width: 512, height: 512 })
      .resize(420, 420)
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    for (let pixel = 0; pixel < data.length; pixel += info.channels) {
      const alphaIndex = pixel + 3;
      const alpha = data[alphaIndex];
      // Image generation supplied a translucent studio glow. The animation needs
      // a graphic cutout, so keep the opaque photographed hand and discard the glow.
      data[alphaIndex] = alpha <= 205 ? 0 : Math.min(255, (alpha - 205) * 6);
    }

    // Keep only the principal connected cutout; neighboring atlas cells can
    // leave a detached sleeve fragment at the extraction boundary.
    const seen = new Uint8Array(info.width * info.height);
    let largest = [];
    for (let start = 0; start < seen.length; start++) {
      if (seen[start] || data[start * 4 + 3] < 10) continue;
      const component = [start]; seen[start] = 1;
      for (let cursor = 0; cursor < component.length; cursor++) {
        const pixel = component[cursor], x = pixel % info.width;
        for (const neighbor of [x > 0 ? pixel - 1 : -1, x < info.width - 1 ? pixel + 1 : -1, pixel - info.width, pixel + info.width]) {
          if (neighbor < 0 || neighbor >= seen.length || seen[neighbor] || data[neighbor * 4 + 3] < 10) continue;
          seen[neighbor] = 1; component.push(neighbor);
        }
      }
      if (component.length > largest.length) largest = component;
    }
    const keep = new Uint8Array(seen.length);
    for (const pixel of largest) keep[pixel] = 1;
    for (let pixel = 0; pixel < keep.length; pixel++) if (!keep[pixel]) data[pixel * 4 + 3] = 0;
    await sharp(data, { raw: info })
      .webp({ quality: 84, alphaQuality: 92 })
      .toFile(
        fileURLToPath(new URL(`${direction}-${index + 1}.webp`, outputDirectory)),
      );
  }
}
