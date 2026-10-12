import { Matrix3 } from "three";

/** Match the readable CSS plane to the perspective-projected paper. Only ink
 * is pre-warped; the physical paper, camera and lighting stay unchanged.
 * Inverse pixel sampling avoids the cracks of a canvas triangle rasterizer.
 */
export function warpPage(source: HTMLCanvasElement, transform: Matrix3) {
  const canvas = document.createElement("canvas");
  const width = (canvas.width = source.width);
  const height = (canvas.height = source.height);
  const ctx = canvas.getContext("2d")!;
  const input = source.getContext("2d")!.getImageData(0, 0, width, height).data;
  const output = ctx.createImageData(width, height),
    pixels = output.data;
  const m = transform.clone().invert().elements;
  for (let y = 0; y < height; y++) {
    const v = (y + 0.5) / height;
    for (let x = 0; x < width; x++) {
      const u = (x + 0.5) / width,
        w = m[2] * u + m[5] * v + m[8];
      const sx = ((m[0] * u + m[3] * v + m[6]) / w) * width - 0.5;
      const sy = ((m[1] * u + m[4] * v + m[7]) / w) * height - 0.5;
      if (sx < 0 || sx >= width - 1 || sy < 0 || sy >= height - 1) continue;
      const ix = Math.floor(sx),
        iy = Math.floor(sy),
        fx = sx - ix,
        fy = sy - iy;
      const i = (iy * width + ix) * 4,
        j = ((iy + 1) * width + ix) * 4;
      const a = (1 - fx) * (1 - fy) * input[i + 3],
        b = fx * (1 - fy) * input[i + 7];
      const c = (1 - fx) * fy * input[j + 3],
        d = fx * fy * input[j + 7];
      const alpha = a + b + c + d,
        out = (y * width + x) * 4;
      if (alpha === 0) continue;
      for (let channel = 0; channel < 3; channel++)
        pixels[out + channel] =
          (input[i + channel] * a +
            input[i + 4 + channel] * b +
            input[j + channel] * c +
            input[j + 4 + channel] * d) /
          alpha;
      pixels[out + 3] = alpha;
    }
  }
  ctx.putImageData(output, 0, 0);
  return canvas;
}
