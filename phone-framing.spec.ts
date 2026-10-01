import { test, expect } from "@playwright/test";

for (const [width, height] of [
  [390, 664],
  [390, 844],
  [430, 752],
  [430, 932],
  [375, 600],
]) {
  test(`first-load phone framing ${width}x${height}`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await expect(page.locator(".desk")).toHaveAttribute(
      "data-arriving",
      "false",
    );
    await page.locator('.notebook[data-phase="reading"]').waitFor();
    const bounds = JSON.parse(
      (await page.locator(".notebook").getAttribute("data-book-bounds"))!,
    );
    expect(bounds.left).toBeLessThan(0); // Left leaf continues beyond viewport.
    expect(bounds.right).toBeLessThan(width - 5);
    expect(bounds.top).toBeGreaterThan(48);
    expect(bounds.bottom).toBeLessThan(height - 45);
    await expect(page.locator(".desk")).toHaveAttribute(
      "data-renderer",
      "webgl",
    );
    expect(
      await page
        .locator(".book-material")
        .evaluate((el) => getComputedStyle(el).overflow),
    ).toBe("visible");
    await expect(page.locator(".brand-logo")).toHaveAttribute(
      "src",
      "/logo.svg",
    );
    const logoCentering = await page.evaluate(() => {
      const mark = document
        .querySelector(".brand-logo")!
        .getBoundingClientRect();
      const link = document.querySelector(".wordmark")!.getBoundingClientRect();
      return Math.abs(
        mark.left + mark.width / 2 - (link.left + link.width / 2),
      );
    });
    expect(logoCentering).toBeLessThan(1);
    expect(await page.evaluate(() => window.scrollY)).toBe(0);
    expect(
      await page.evaluate(() => document.documentElement.scrollHeight),
    ).toBeLessThanOrEqual(height + 1);
    await expect(page.locator(".desk-header").getByRole("link")).toHaveCount(1);
    await expect(page.locator(".desk-header")).not.toContainText("NOTES ON");
    await expect(page.locator(".desk-header")).not.toContainText("VOL.");
    await page.screenshot({
      path: `artifacts/qa/phone-fit-${width}x${height}.png`,
      fullPage: true,
    });
  });
}
