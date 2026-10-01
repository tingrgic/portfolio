import { test, expect } from "@playwright/test";
import type { Page } from "@playwright/test";
async function clockUntil(page: Page, phase: string) {
  for (let i = 0; i < 120; i++) {
    await page.clock.runFor(40);
    if ((await page.locator(".notebook").getAttribute("data-phase")) === phase)
      return;
    await page.waitForTimeout(20);
  }
  throw new Error(`Scene did not reach ${phase}`);
}
async function frozenPage(page: Page, width: number, hash = "") {
  await page.setViewportSize({ width, height: 900 });
  await page.clock.install({ time: new Date("2026-09-30T12:00:00Z") });
  await page.clock.pauseAt(new Date("2026-09-30T12:00:01Z"));
  await page.goto("/" + hash);
}

test.setTimeout(120000);

test("real cover clears the stationary page block throughout opening", async ({
  page,
}) => {
  await frozenPage(page, 1440);
  await clockUntil(page, "opening");
  await expect(page.locator(".desk")).toHaveAttribute("data-renderer", "webgl");
  const angles = [];
  for (let i = 0; i < 9; i++) {
    await page.clock.runFor(280);
    const state = await page
      .locator(".notebook")
      .evaluate((el) => ({ ...(el as HTMLElement).dataset }));
    angles.push(Number(state.coverAngle));
    expect(Number(state.coverClearance)).toBeGreaterThan(0.015);
    if (i === 0 || i === 3 || i === 5)
      await page.screenshot({ path: `artifacts/qa/webgl-opening-${i}.png` });
  }
  expect(Math.max(...angles)).toBeGreaterThan(2.5);
  expect(Math.min(...angles)).toBeLessThan(0.05);
  await page.clock.runFor(600);
  await expect(page.locator(".notebook")).toHaveAttribute(
    "data-phase",
    "reading",
  );
  await expect(page.locator(".book-content")).toHaveCSS("opacity", "1");
});
for (const width of [390, 1440])
  test(`3D forward and backward page content stays on the sheet at ${width}`, async ({
    page,
  }) => {
    await frozenPage(page, width, "#work");
    await clockUntil(page, "reading");
    for (const direction of ["backward", "forward"]) {
      await page
        .getByRole("button", {
          name: direction === "backward" ? "01 Hello" : "See my work",
        })
        .click();
      await clockUntil(page, "turning");
      await page.clock.runFor(500);
      await expect(page.locator(".notebook")).toHaveAttribute(
        "data-hand",
        direction === "backward" ? "left" : "right",
      );
      await expect(page.locator(".book-content")).toHaveCSS("opacity", "0");
      expect(
        Number(
          await page.locator(".notebook").getAttribute("data-paper-clearance"),
        ),
      ).toBeGreaterThan(0.01);
      await expect(page.locator(".book-content")).toHaveAttribute("inert", "");
      const first = Number(
        await page.locator(".notebook").getAttribute("data-page-angle"),
      );
      if (direction === "backward") expect(first).toBeLessThan(-2);
      else expect(first).toBeGreaterThan(-1);
      await page.screenshot({
        path: `artifacts/qa/webgl-${width}-${direction}-grip.png`,
      });
      await page.clock.runFor(500);
      const later = Number(
        await page.locator(".notebook").getAttribute("data-page-angle"),
      );
      expect(direction === "backward" ? later > first : later < first).toBe(
        true,
      );
      await page.screenshot({
        path: `artifacts/qa/webgl-${width}-${direction}-carry.png`,
      });
      await page.clock.runFor(1500);
      await expect(page.locator(".notebook")).toHaveAttribute(
        "data-phase",
        "reading",
      );
      await expect(page.locator(".notebook")).toHaveAttribute(
        "data-hand",
        "none",
      );
      await expect(page.locator(".book-content")).toHaveCSS("opacity", "1");
      await expect(page.locator("#section-heading")).toBeFocused();
    }
  });
test("scene stops rendering at rest and history or resize cancels cleanly", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/#work");
  await page.locator('.notebook[data-phase="reading"]').waitFor();
  const frames = await page
    .locator(".notebook")
    .getAttribute("data-render-count");
  await page.waitForTimeout(500);
  expect(
    await page.locator(".notebook").getAttribute("data-render-count"),
  ).toBe(frames);
  await page.getByRole("button", { name: "Next section" }).click();
  await page.goBack();
  await expect(page.locator(".notebook")).toHaveAttribute("aria-busy", "false");
  await expect(page.locator(".book-content")).toHaveCSS("opacity", "1");
  await page.getByRole("button", { name: "03 Connect" }).click();
  await page.setViewportSize({ width: 1440, height: 900 });
  await expect(page.locator(".notebook")).toHaveAttribute("aria-busy", "false");
  await expect(page.locator(".book-content")).toHaveCSS("opacity", "1");
  await expect(page.locator(".desk")).toHaveAttribute("data-renderer", "webgl");
});
test("Skip opening works while hand assets are delayed", async ({ page }) => {
  let release!: () => void;
  const pending = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route("**/hands-pov/forward-1.webp", async (route) => {
    await pending;
    await route.continue();
  });
  await page.goto("/", { waitUntil: "domcontentloaded" });
  try {
    await expect(
      page.getByRole("button", { name: "Skip opening" }),
    ).toBeVisible();
    await page.getByRole("button", { name: "Skip opening" }).click();
    await expect(page.locator(".desk")).toHaveAttribute(
      "data-arriving",
      "false",
    );
  } finally {
    release();
  }
  await page.locator('.notebook[data-phase="reading"]').waitFor();
  await expect(page.locator(".book-content")).toHaveCSS("opacity", "1");
  await expect(page.locator(".notebook")).toHaveAttribute(
    "data-cover-angle",
    "0.0000",
  );
});
test("WebGL failure leaves a usable static notebook", async ({ page }) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (
      type: string,
      ...args: unknown[]
    ) {
      if (type.startsWith("webgl")) return null;
      return original.call(this, type as "2d", ...(args as []));
    } as typeof original;
  });
  await page.goto("/");
  await expect(page.locator(".desk")).toHaveAttribute(
    "data-renderer",
    "fallback",
  );
  await page.getByRole("button", { name: "See my work" }).click();
  await expect(
    page.getByRole("heading", { name: "Komon", exact: true }),
  ).toBeVisible();
  await expect(page.locator('a[href="https://komon.hr"]')).toHaveCount(2);
});
