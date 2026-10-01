import { test, expect } from "@playwright/test";

test("first-use canvas textures contain both project thumbnails", async ({
  page,
  browserName,
}) => {
  await page.setViewportSize({ width: 390, height: 664 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const project of ["work", "work/normal"]) {
    await page.goto("/#" + project);
    await page.locator('.notebook[data-phase="reading"]').waitFor();
    await expect(page.locator(".desk")).toHaveAttribute(
      "data-renderer",
      "webgl",
    );
    const stats = await page.evaluate(async () => {
      // Exercise the same rasterizer used by the scene, not the live HTML img.
      // @ts-expect-error Vite resolves this browser-side module URL.
      const { capturePage } = await import("/src/scene/capturePage.ts");
      const canvas = await capturePage(document.querySelector(".book-content"));
      const ctx = canvas.getContext("2d");
      const x = Math.round(canvas.width * 0.18),
        y = Math.round(canvas.height * 0.22);
      const w = Math.round(canvas.width * 0.62),
        h = Math.round(canvas.height * 0.16);
      const data = ctx.getImageData(x, y, w, h).data;
      let dark = 0;
      for (let i = 0; i < data.length; i += 4)
        if (
          data[i + 3] > 200 &&
          Math.max(data[i], data[i + 1], data[i + 2]) < 90
        )
          dark++;
      return {
        dark,
        ratio: dark / (w * h),
        url: canvas.toDataURL().split(",")[1],
      };
    });
    // Komon's small burgundy wordmark and PK Normal's black field must exist.
    expect(stats.dark).toBeGreaterThan(project === "work" ? 20 : 1500);
    if (project.endsWith("normal")) expect(stats.ratio).toBeGreaterThan(0.3);
    await test
      .info()
      .attach(`${browserName}-${project.replace("/", "-")}-texture`, {
        body: Buffer.from(stats.url, "base64"),
        contentType: "image/png",
      });
  }
});

test("the moving sheet clears printed content before lift and after landing", async ({
  page,
  browserName,
}) => {
  test.setTimeout(120000);
  await page.setViewportSize({ width: 390, height: 664 });
  await page.goto("/#work");
  await page.locator('.notebook[data-phase="reading"]').waitFor();
  await page.evaluate(async () => {
    // @ts-expect-error Test-only module served by Vite, excluded from the build.
    const motion = await import("/tests/browser/motion-control.ts");
    motion.freezeMotion();
  });
  for (const direction of ["forward", "backward"]) {
    let landing = "";
    await page
      .getByRole("button", {
        name: direction === "forward" ? "Next section" : "Previous section",
      })
      .click();
    await expect(page.locator(".notebook")).toHaveAttribute(
      "data-phase",
      "turning",
    );
    for (const [label, time] of [
      ["before-lift", 0.2],
      ["curl", 1],
      ["landed", 1.8],
    ] as const) {
      await page.evaluate(async (t) => {
        // @ts-expect-error Vite test helper.
        const motion = await import("/tests/browser/motion-control.ts");
        motion.seekTurn(t);
      }, time);
      expect(
        Number(await page.locator(".notebook").getAttribute("data-turn-time")),
      ).toBeGreaterThanOrEqual(time);
      expect(
        Number(
          await page.locator(".notebook").getAttribute("data-ink-clearance"),
        ),
      ).toBeGreaterThan(0.012);
      await expect(page.locator(".book-content")).toHaveCSS("opacity", "0");
      const screenshot = await page.screenshot({
        path: `artifacts/qa/iphone-content-glitch/${browserName}-${direction}-${label}.png`,
      });
      if (label === "landed") landing = screenshot.toString("base64");
    }
    await page.evaluate(async () => {
      // @ts-expect-error Vite test helper.
      const motion = await import("/tests/browser/motion-control.ts");
      motion.seekTurn(1.95);
    });
    await expect(page.locator(".notebook")).toHaveAttribute(
      "data-phase",
      "reading",
    );
    await expect(page.locator(".book-content")).toHaveCSS("opacity", "1");
    const live = await page.screenshot({
      path: `artifacts/qa/iphone-content-glitch/${browserName}-${direction}-live.png`,
    });
    const marker = await page.locator(".project-index").boundingBox();
    expect(marker).not.toBeNull();
    const centroids = await page.evaluate(
      async ({ shots, rect }) => {
        return Promise.all(
          shots.map(async (shot) => {
            const img = new Image();
            img.src = `data:image/png;base64,${shot}`;
            await img.decode();
            const c = document.createElement("canvas");
            c.width = img.width;
            c.height = img.height;
            const ctx = c.getContext("2d")!;
            ctx.drawImage(img, 0, 0);
            const x = Math.floor(rect.x - 3),
              y = Math.floor(rect.y - 6),
              w = Math.ceil(rect.width + 6),
              h = Math.ceil(rect.height + 12);
            const pixels = ctx.getImageData(x, y, w, h).data;
            let sum = 0,
              count = 0;
            for (let i = 0; i < pixels.length; i += 4)
              if (
                pixels[i] > pixels[i + 1] * 1.17 &&
                pixels[i] - pixels[i + 1] > 16
              ) {
                sum += y + Math.floor(i / 4 / w);
                count++;
              }
            return { count, y: sum / count };
          }),
        );
      },
      { shots: [landing, live.toString("base64")], rect: marker! },
    );
    expect(centroids[0].count).toBeGreaterThan(3);
    expect(centroids[1].count).toBeGreaterThan(3);
    expect(Math.abs(centroids[0].y - centroids[1].y)).toBeLessThan(3);
  }
});
