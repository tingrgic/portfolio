import { test, expect } from "@playwright/test";

for (const [width, height] of [
  [390, 844],
  [430, 932],
  [768, 1024],
  [1366, 768],
  [1440, 900],
  [1920, 1080],
]) {
  test(`notebook proportions stay fixed at ${width}x${height}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await page.locator('.notebook[data-phase="reading"]').waitFor();
    await page.evaluate(() => document.fonts.ready);
    const original = await page.locator(".notebook").boundingBox();
    const physical = await page
      .locator(".notebook")
      .getAttribute("data-book-bounds");
    for (const section of ["02 Work", "03 Connect", "01 Hello"]) {
      await page.getByRole("button", { name: section, exact: true }).click();
      const current = await page.locator(".notebook").boundingBox();
      expect(Math.abs(current!.height - original!.height)).toBeLessThan(1);
      expect(Math.abs(current!.width - original!.width)).toBeLessThan(1);
      expect(
        await page.locator(".notebook").getAttribute("data-book-bounds"),
      ).toBe(physical);
    }
    // User-requested fixed pages now have no inner scroll regions.
    // Test the actual copy instead of the retired synthetic long-text scroller.
    for (const section of ['02 Work', '03 Connect', '01 Hello']) {
      await page.getByRole('button', {name: section, exact: true}).click();
      await expect(page.locator('.notebook')).toHaveAttribute('aria-busy','false');
      for (const leaf of await page.locator('.paper-page').all()) {
        const size = await leaf.evaluate(el => ({className:el.className,height:el.clientHeight, scroll:el.scrollHeight}));
        expect(size.scroll, `${section}: ${size.className}`).toBeLessThanOrEqual(size.height + 1);
        await leaf.evaluate(el => {el.scrollTop=999;});
        expect(await leaf.evaluate(el => el.scrollTop)).toBe(0);
      }
    }
  });
}
