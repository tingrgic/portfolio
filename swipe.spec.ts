import { test, expect } from "@playwright/test";

test("touch swipes navigate both ways while vertical gestures and taps remain usable", async ({
  page,
  browserName,
}) => {
  test.skip(browserName !== "chromium", "Real touch injection uses Chromium's CDP; WebKit navigation is covered separately.");
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page.locator('.notebook[data-phase="reading"]').waitFor();
  const cdp = await page.context().newCDPSession(page);
  const swipe = async (x: number, y: number, endX: number, endY: number) => {
    await cdp.send("Input.dispatchTouchEvent", {
      type: "touchStart",
      touchPoints: [{ x, y }],
    });
    for (let step = 1; step <= 6; step++) {
      await cdp.send("Input.dispatchTouchEvent", {
        type: "touchMove",
        touchPoints: [
          { x: x + ((endX - x) * step) / 6, y: y + ((endY - y) * step) / 6 },
        ],
      });
    }
    await cdp.send("Input.dispatchTouchEvent", {
      type: "touchEnd",
      touchPoints: [],
    });
  };
  await swipe(320, 400, 95, 410);
  await expect(page).toHaveURL(/#work$/);
  await swipe(320, 300, 95, 310); // Across the linked print, must not open it.
  await expect(page).toHaveURL(/#work\/normal$/);
  expect(page.context().pages()).toHaveLength(1);
  await swipe(100, 400, 320, 410);
  await expect(page).toHaveURL(/#work$/);
  await swipe(200, 500, 205, 300);
  await expect(page).toHaveURL(/#work$/);
  await expect(page.locator(".book-content")).toHaveCSS("overflow-y", "clip");
  expect(
    await page.evaluate(
      () => document.querySelector(".book-content")?.scrollTop || 0,
    ),
  ).toBe(0);
  await page.waitForTimeout(550);
  await page
    .context()
    .route("https://komon.hr/", (route) =>
      route.fulfill({ body: "Project destination" }),
    );
  const popup = page.waitForEvent("popup");
  await page
    .getByRole("link", {
      name: "Visit Komon (opens in a new tab)",
      exact: true,
    })
    .click();
  await expect(await popup).toHaveURL("https://komon.hr/");
});
