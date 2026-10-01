import html2canvas from "html2canvas";

function stripes(first: string, second: string, split: number, period: number) {
  const tile = document.createElement("canvas");
  tile.width = period;
  tile.height = 4;
  const ctx = tile.getContext("2d")!;
  ctx.fillStyle = first;
  ctx.fillRect(0, 0, split, 4);
  ctx.fillStyle = second;
  ctx.fillRect(split, 0, period - split, 4);
  return `url(${tile.toDataURL()})`;
}

let grain: Promise<HTMLImageElement> | undefined;
function paperGrain() {
  return (grain ??= (async () => {
    const image = new Image();
    image.src = "/images/paper-texture.webp";
    await image.decode();
    return image;
  })());
}

/** Paint the page directly to canvas. SVG foreignObject snapshots can silently
 * omit decoded images in Safari; waiting for the original img isn't sufficient.
 * All changes below affect html2canvas's isolated document, never the live page.
 */
export async function capturePage(
  element: HTMLElement,
): Promise<HTMLCanvasElement> {
  // A React commit can precede the browser scheduling its new font loads.
  // Resolve the actual fonts used by this spread before measuring its layout.
  const fonts = new Set(
    [...element.querySelectorAll<HTMLElement>("*")].map((node) => {
      const style = getComputedStyle(node);
      return `${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
    }),
  );
  await Promise.all(
    [...fonts].map((font) =>
      document.fonts.load(font, element.textContent || "Tin Grgić"),
    ),
  );
  await document.fonts.ready;
  const images = [...element.querySelectorAll("img")];
  await Promise.all(images.map((image) => image.decode()));
  const paper = images.length ? await paperGrain() : null;
  const width = element.clientWidth,
    height = element.clientHeight;
  // html2canvas does not implement object-fit. Rasterize the existing local
  // image into its CSS image box first, preserving exactly the current crop.
  const imageBoxes = images.map((image) => {
    const style = getComputedStyle(image);
    const w = image.clientWidth,
      h = image.clientHeight;
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(w * 2);
    canvas.height = Math.round(h * 2);
    const ctx = canvas.getContext("2d")!;
    const scale =
      style.objectFit === "cover"
        ? Math.max(
            canvas.width / image.naturalWidth,
            canvas.height / image.naturalHeight,
          )
        : Math.min(
            canvas.width / image.naturalWidth,
            canvas.height / image.naturalHeight,
          );
    const dw =
      style.objectFit === "fill" ? canvas.width : image.naturalWidth * scale;
    const dh =
      style.objectFit === "fill" ? canvas.height : image.naturalHeight * scale;
    const [px, py] = style.objectPosition
      .split(" ")
      .map((v) => parseFloat(v) / 100);
    ctx.drawImage(
      image,
      (canvas.width - dw) * px,
      (canvas.height - dh) * (py ?? px),
      dw,
      dh,
    );
    // Bake the multiply grain into the thumbnail; the DOM painter does not
    // implement mix-blend-mode, which otherwise washes black screenshots grey.
    if (paper && image.closest(".image-print")) {
      // Match the thumbnail's saturate(.65) contrast(1.08), including engines
      // without CanvasRenderingContext2D.filter.
      const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < pixels.data.length; i += 4) {
        const luminance =
          pixels.data[i] * 0.213 +
          pixels.data[i + 1] * 0.715 +
          pixels.data[i + 2] * 0.072;
        for (let c = 0; c < 3; c++)
          pixels.data[i + c] =
            (luminance + (pixels.data[i + c] - luminance) * 0.65 - 127.5) *
              1.08 +
            127.5;
      }
      ctx.putImageData(pixels, 0, 0);
      ctx.save();
      ctx.globalCompositeOperation = "multiply";
      ctx.globalAlpha = 0.26;
      for (let x = 0; x < canvas.width; x += 600)
        for (
          let y = 0;
          y < canvas.height;
          y += (600 * paper.height) / paper.width
        )
          ctx.drawImage(paper, x, y, 600, (600 * paper.height) / paper.width);
      ctx.restore();
    }
    return { src: canvas.toDataURL("image/png"), width: w, height: h };
  });
  return html2canvas(element, {
    width,
    height,
    scale: 1.5,
    backgroundColor: null,
    foreignObjectRendering: false,
    logging: false,
    scrollX: 0,
    scrollY: 0,
    ignoreElements: (node) =>
      node.classList.contains("world-canvas") ||
      node.classList.contains("sr-only"),
    onclone: async (doc, cloned) => {
      // Remove only scene projection; keep the 2D collage rotations intact.
      let ancestor = cloned.parentElement;
      while (ancestor) {
        ancestor.style.setProperty("transform", "none", "important");
        ancestor.style.setProperty("opacity", "1", "important");
        ancestor.style.setProperty("overflow", "visible", "important");
        ancestor = ancestor.parentElement;
      }
      Object.assign(cloned.style, {
        transform: "none",
        transformOrigin: "0 0",
        position: "relative",
        left: "0",
        top: "0",
        opacity: "1",
        margin: "0",
        outline: "none",
        width: `${width}px`,
        height: `${height}px`,
        scrollbarWidth: "none",
      });
      const style = doc.createElement("style");
      // Repeat gradients are unsupported by this painter. Equivalent local
      // pixel tiles retain the tape/backing instead of leaving empty outlines.
      style.textContent = `
        * { outline: none !important; animation: none !important; transition: none !important; }
        .image-print::after, .image-print > html2canvaspseudoelement { display: none !important; }
        .tape { background-image: ${stripes("#dec79666", "#e9d8ae88", 2, 4)} !important; background-size: 4px 4px !important; }
        .collage > html2canvaspseudoelement { background-image: ${stripes("#326b6870", "#36716b42", 3, 5)} !important; background-size: 5px 4px !important; }
        .project-pk-normal .collage > html2canvaspseudoelement { background-image: ${stripes("#963e2e77", "#a758363e", 3, 6)} !important; background-size: 6px 4px !important; }
      `;
      doc.head.append(style);
      await Promise.all(
        [...cloned.querySelectorAll("img")].map(async (image, i) => {
          const box = imageBoxes[i];
          image.srcset = "";
          image.src = box.src;
          image.style.width = `${box.width}px`;
          image.style.height = `${box.height}px`;
          await image.decode();
        }),
      );
      await doc.fonts.ready;
    },
  });
}
