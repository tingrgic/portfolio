import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
for (const width of [390, 1440]) {
  test(`accessible sections at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    for (const section of ["intro", "work", "connect"]) {
      await page.goto(`/#${section}`);
      await page.locator('.notebook[data-phase="reading"]').waitFor();
      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze();
      expect(
        results.violations.map((v) => ({
          id: v.id,
          description: v.description,
          nodes: v.nodes.map((n) => ({
            html: n.html,
            summary: n.failureSummary,
          })),
        })),
      ).toEqual([]);
    }
  });
}
