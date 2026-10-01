import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests",
  fullyParallel: false,
  timeout: 60000,
  workers: 2,
  reporter: "list",
  use: {
    browserName: process.env.TEST_BROWSER === "webkit" ? "webkit" : "chromium",
    baseURL: "http://127.0.0.1:5178",
    headless: true,
    launchOptions: {
      executablePath:
        process.env.TEST_BROWSER === "webkit"
          ? process.env.PLAYWRIGHT_WEBKIT_EXECUTABLE_PATH
          : process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,
      args:
        process.env.TEST_BROWSER === "webkit"
          ? []
          : ["--enable-unsafe-swiftshader"],
    },
  },
  webServer: {
    command: "pnpm dev --port 5178",
    url: "http://127.0.0.1:5178",
    reuseExistingServer: !process.env.CI,
  },
});
