import { test, expect } from "@playwright/test";
import { mkdirSync } from "node:fs";
const sizes = [
  [390, 844],
  [430, 932],
  [768, 1024],
  [1366, 768],
  [1440, 900],
  [1920, 1080],
];
mkdirSync("artifacts/qa", { recursive: true });
for (const [width, height] of sizes) {
  test(`notebook at ${width}×${height}`, async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text());
    });
    await page.setViewportSize({ width, height });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await page.locator('.notebook[data-phase="reading"]').waitFor();
    await page.evaluate(() => document.fonts.ready);
    await expect(page.locator(".desk")).toHaveAttribute(
      "data-arriving",
      "false",
    );
    await expect(
      page.getByRole("heading", { name: /Tin Grgić/ }),
    ).toBeVisible();
    await expect(page.locator('a[href^="mailto:"]')).toHaveCount(0);
    for (const section of ["intro", "work", "connect"]) {
      if (section === "work")
        await page.getByRole("button", { name: "See my work" }).click();
      if (section === "connect")
        await page.getByRole("button", { name: "03 Connect" }).click();
      await expect(page.locator(".notebook")).toHaveAttribute(
        "aria-busy",
        "false",
      );
      await expect(page.locator(".section-tab.active")).toHaveAttribute(
        "aria-current",
        "page",
      );
      if (section === "intro") {
        const contactFits = await page.locator(".intro-links").evaluate((el) => {
          const page = el.closest(".paper-page")!.getBoundingClientRect();
          const contact = el.getBoundingClientRect();
          return contact.bottom <= page.bottom && contact.top >= page.top;
        });
        expect(contactFits).toBe(true);
      }
      if (section === "work") {
        await expect(
          page.getByRole("heading", { name: "Komon", exact: true }),
        ).toBeVisible();
        await expect(page.locator('a[href="https://komon.hr"]')).toHaveCount(2);
        if (width < 700) {
          await expect(page.locator(".book-content")).toHaveCSS(
            "overflow-y",
            "clip",
          );
          const workFits = await page.evaluate(() => {
            const paper = document
              .querySelector(".book-content")!
              .getBoundingClientRect();
            const link = document
              .querySelector(".project-link")!
              .getBoundingClientRect();
            return link.bottom <= paper.bottom + 1;
          });
          expect(workFits).toBe(true);
          await page.screenshot({
            path: `artifacts/qa/${width}x${height}-komon.png`,
            fullPage: true,
          });
          await page.getByRole("button", { name: "Next section" }).click();
          await expect(page.locator(".notebook")).toHaveAttribute(
            "aria-busy",
            "false",
          );
          await expect(page.locator(".book-content")).toHaveCSS(
            "overflow-y",
            "clip",
          );
        }
        await expect(
          page.locator(
            ".project-tags, .project-note, .project-pager, .project-page .page-foot",
          ),
        ).toHaveCount(0);
        await expect(
          page.getByRole("heading", { name: "PK Normal", exact: true }),
        ).toBeVisible();
        await expect(
          page.locator('a[href="https://tingrgic.github.io/pk-normal"]'),
        ).toHaveCount(2);
      }
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBeTruthy();
      expect(
        await page
          .locator("img")
          .evaluateAll((images) =>
            images.every(
              (i) =>
                (i as HTMLImageElement).complete &&
                (i as HTMLImageElement).naturalWidth > 0,
            ),
          ),
      ).toBeTruthy();
      await page.screenshot({
        path: `artifacts/qa/${width}x${height}-${section}.png`,
        fullPage: true,
      });
    }
    await page.getByRole("button", { name: "Back to the beginning" }).click();
    await expect(page.locator(".notebook")).toHaveAttribute(
      "aria-busy",
      "false",
    );
    await expect(
      page.getByRole("heading", { name: /Tin Grgić/ }),
    ).toBeFocused();
    expect(errors).toEqual([]);
  });
}
test("keyboard, history and motion preferences", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page.locator('.notebook[data-phase="reading"]').waitFor();
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("link", { name: "Skip to notebook" }),
  ).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("heading", { name: /Tin Grgić/ })).toBeFocused();
  await page.getByRole("button", { name: "See my work" }).focus();
  await page.keyboard.press("Enter");
  await expect(
    page.getByRole("heading", { name: "Selected work." }),
  ).toBeFocused();
  await expect(page.locator(".notebook")).toHaveAttribute("data-hand", "none");
  await expect(page.locator(".notebook")).toHaveAttribute(
    "data-phase",
    "reading",
  );
  await expect(page).toHaveURL(/#work/);
  await page.goBack();
  await expect(page.getByRole("heading", { name: /Tin Grgić/ })).toBeVisible();
  await page.screenshot({
    path: "artifacts/qa/reduced-motion.png",
    fullPage: true,
  });
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page
    .getByRole("button", { name: "Reduce motion", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Motion reduced" }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "See my work" }).click();
  await expect(page.locator(".notebook")).toHaveAttribute("aria-busy", "false");
});
test("deep links and rapid interaction remain consistent", async ({ page }) => {
  await page.goto("/#work");
  await page.locator('.notebook[data-phase="reading"]').waitFor();
  await expect(
    page.getByRole("heading", { name: "Selected work." }),
  ).toBeVisible();
  await page.getByRole("button", { name: "03 Connect" }).click();
  await expect(page.getByRole("button", { name: "02 Work" })).toBeDisabled();
  await page.waitForTimeout(350);
  await page.screenshot({ path: "artifacts/qa/hand-transition.png" });
  await expect(page.locator(".notebook")).toHaveAttribute("aria-busy", "false");
  await expect(
    page.getByRole("heading", { name: "Good things start with a hello." }),
  ).toBeVisible();
});
test("narrow layout remains usable", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 320, height: 700 });
  await page.goto("/");
  await page.locator('.notebook[data-phase="reading"]').waitFor();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBeTruthy();
  await page.getByRole("button", { name: "See my work" }).click();
  await page.getByRole("button", { name: "Next section" }).click();
  await expect(
    page.getByRole("heading", { name: "PK Normal", exact: true }),
  ).toBeVisible();
  await page.screenshot({
    path: "artifacts/qa/narrow-320.png",
    fullPage: true,
  });
});

test("200 percent desktop zoom equivalent reflows", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  // Browser zoom at 200% halves a 1440px layout viewport to 720 CSS pixels.
  await page.setViewportSize({ width: 720, height: 450 });
  for (const section of ["intro", "work", "connect"]) {
    await page.goto("/#" + section);
    await page.locator('.notebook[data-phase="reading"]').waitFor();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBeTruthy();
    await page.screenshot({
      path: `artifacts/qa/zoom-equivalent-${section}.png`,
      fullPage: true,
    });
  }
});

test("footer navigation returns to the notebook before turning", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/#work");
  await page.locator('.notebook[data-phase="reading"]').waitFor();
  const next = page.getByRole("button", { name: "Next section" });
  await next.scrollIntoViewIfNeeded();
  await next.click();
  expect(await page.evaluate(() => window.scrollY)).toBe(0);
  await expect(page.locator(".notebook")).toHaveAttribute("aria-busy", "false");
  await expect(
    page.getByRole("heading", { name: "PK Normal", exact: true }),
  ).toBeVisible();
});
