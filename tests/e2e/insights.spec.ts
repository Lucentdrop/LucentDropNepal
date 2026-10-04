import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("public evidence charts, district filters, demand assumptions and CSV downloads", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/insights");
  await expect(
    page.getByRole("heading", { name: "Water Insights", exact: true }),
  ).toBeVisible();
  await expect(page.locator(".chart-canvas canvas")).toHaveCount(10);
  await page.getByLabel("Province for district charts").selectOption("3");
  await page.getByLabel("Search districts").fill("Kathmandu");
  await expect(
    page.getByText("1 districts in comparison", { exact: true }),
  ).toBeVisible();
  await page.getByLabel("District detail").selectOption({ label: "Kathmandu" });
  await expect(
    page.getByRole("heading", { name: "Kathmandu: drinking-water source mix" }),
  ).toBeVisible();
  const sourceMix = page.locator(".insight-chart").filter({
    has: page.getByRole("heading", {
      name: "Kathmandu: drinking-water source mix",
    }),
  });
  await sourceMix.getByText("View data table", { exact: true }).click();
  await expect(sourceMix.locator("tbody tr")).toHaveCount(9);
  await page.getByLabel("Search districts").fill("no-such-district");
  await expect(
    page.getByText("No data available for this period."),
  ).toHaveCount(2);
  await page.getByLabel("Search districts").fill("");
  await expect(page.locator(".chart-canvas canvas")).toHaveCount(10);
  const accessibility = await new AxeBuilder({ page })
    .include(".insights-explorer")
    .analyze();
  expect(accessibility.violations).toEqual([]);
  await page.screenshot({
    path: "output/insights-water-desktop.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: "output/insights-water-mobile.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.getByRole("tab", { name: "Demand planner" }).click();
  await expect(page.locator(".chart-canvas canvas")).toHaveCount(4);
  await expect(page.getByText("4,861", { exact: true })).toBeVisible();
  await page.getByLabel("Planning province").selectOption("6");
  await expect(
    page.getByText("Modeled total consumption", { exact: true }),
  ).toBeVisible();
  await page.getByLabel("Station capacity (litres / day)").fill("1000");
  expect(
    (await new AxeBuilder({ page }).include(".insights-explorer").analyze())
      .violations,
  ).toEqual([]);
  await page.getByRole("tab", { name: "Sources & methods" }).click();
  await expect(
    page.getByRole("link", { name: /Open official census dataset catalogue/ }),
  ).toBeVisible();
  const response = await page.request.get("/data/nepal-water-sources-2021.csv");
  expect(response.ok()).toBe(true);
  expect(await response.text()).toContain("a_TapPiped1");
  await page.getByRole("tab", { name: "Sources & methods" }).focus();
  await page.keyboard.press("Home");
  await expect(page.getByRole("tab", { name: "Nepal water" })).toBeFocused();
  expect(errors).toEqual([]);
});

test("synthetic business charts load on demand, filter, download and fit mobile", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  const requests: string[] = [];
  page.on("request", (r) => requests.push(r.url()));
  await page.goto("/insights");
  await expect(page.locator(".chart-canvas canvas")).toHaveCount(10);
  expect(requests.some((u) => u.endsWith("lucent-demo-summary.json"))).toBe(
    false,
  );
  await page.getByRole("tab", { name: "Lucent business demo" }).click();
  await expect(page.locator(".chart-canvas canvas")).toHaveCount(14);
  await expect(
    page.getByText(/Synthetic dataset · 41,754 records/),
  ).toBeVisible();
  await page.getByLabel("Business year").selectOption("all");
  await page.getByLabel("Business province").selectOption("6");
  await expect(page.locator(".chart-canvas canvas")).toHaveCount(14);
  const a11y = await new AxeBuilder({ page })
    .include(".insights-explorer")
    .analyze();
  expect(a11y.violations).toEqual([]);
  const [download] = await Promise.all([
    page.waitForEvent("download"),
    page.getByRole("link", { name: /32,892 demo orders CSV/ }).click(),
  ]);
  expect(download.suggestedFilename()).toBe("lucent-demo-orders.csv");
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.locator(".chart-canvas canvas")).toHaveCount(14);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: "output/insights-business-mobile.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.screenshot({
    path: "output/insights-business-desktop.png",
    fullPage: true,
  });
  expect(errors).toEqual([]);
});

test("business dataset error offers a working retry", async ({ page }) => {
  let fail = true;
  await page.route("**/data/lucent-demo-summary.json", (route) =>
    fail
      ? route.fulfill({ status: 503, body: "unavailable" })
      : route.continue(),
  );
  await page.goto("/insights");
  await page.getByRole("tab", { name: "Lucent business demo" }).click();
  await expect(
    page.locator(".insights-explorer").getByRole("alert"),
  ).toContainText("Unable to load the demo dataset");
  fail = false;
  await page.getByRole("button", { name: "Try again" }).click();
  await expect(page.locator(".chart-canvas canvas")).toHaveCount(14);
});
