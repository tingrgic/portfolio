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
    await page.evaluate(() => {
      const text = document.querySelector(".about") as HTMLElement;
      text.style.fontSize = "42px";
      text.textContent = "Enlarged text remains reachable. ".repeat(30);
    });
    const enlarged = await page.locator(".notebook").boundingBox();
    expect(enlarged!.height).toBe(original!.height);
    expect(
      await page.locator(".notebook").getAttribute("data-book-bounds"),
    ).toBe(physical);
    const scroller = page.locator(
      width < 700 ? ".book-content" : ".intro-copy-page",
    );
    expect(
      await scroller.evaluate((el) => el.scrollHeight > el.clientHeight),
    ).toBe(true);
    await scroller.evaluate((el) => {
      el.scrollTop = el.scrollHeight;
    });
    expect(await scroller.evaluate((el) => el.scrollTop)).toBeGreaterThan(0);
  });
}
