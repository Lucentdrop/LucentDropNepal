import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
test("catalogue filters, guest gate and demo member quotation flow", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/products");
  await expect(page.getByText("6 solutions found")).toBeVisible();
  await page.getByRole("button", { name: "Water ATM", exact: true }).click();
  await expect(page.getByText("1 solution found")).toBeVisible();
  await page.getByRole("button", { name: "All", exact: true }).click();
  await page.getByRole("searchbox").fill("zzzz");
  await expect(
    page.getByRole("heading", { name: "No matching products" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Clear filters" }).click();
  await page.goto("/products/ro-water-treatment-plant");
  await expect(
    page.getByRole("heading", { name: "More details. Better decisions." }),
  ).toBeVisible();
  await expect(page.getByRole("tab", { name: "Specifications" })).toHaveCount(
    0,
  );
  await page.getByRole("link", { name: "Sign In to View Details" }).click();
  await page.getByRole("button", { name: "Preview Member Experience" }).click();
  await expect(page.getByRole("tab", { name: "Specifications" })).toBeVisible();
  await page.getByRole("tab", { name: "Specifications" }).click();
  await expect(page.getByText("500–10,000 L/hour")).toBeVisible();
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Saved", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Request a Quotation", exact: true })
    .click();
  await page
    .getByRole("textbox", { name: "Your requirements" })
    .fill("Demo request for a 1,000 litre per hour plant in Kathmandu.");
  await page.getByRole("button", { name: "Save Demo Request" }).click();
  await expect(
    page.getByText("Demo quotation saved.", { exact: false }),
  ).toBeVisible();
  await page.getByRole("link", { name: "View My Requests" }).click();
  await expect(
    page.getByText(
      "Demo request for a 1,000 litre per hour plant in Kathmandu.",
    ),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByText(
      "Demo request for a 1,000 litre per hour plant in Kathmandu.",
    ),
  ).toBeVisible();
  await page.goto("/dashboard/saved-products");
  await expect(
    page.getByRole("heading", { name: "RO Water Treatment Plant" }),
  ).toBeVisible();
  await page.goto("/dashboard/analytics");
  await expect(page.locator("canvas")).toHaveCount(4);
  await page.getByRole("button", { name: "Turbidity", exact: true }).click();
  await page.goto("/dashboard/account");
  await page.getByRole("button", { name: "Clear Demo Data" }).click();
  await expect(
    page.getByText("Demo saved products and requests cleared."),
  ).toBeVisible();
  await page.goto("/dashboard/saved-products");
  await expect(
    page.getByRole("heading", { name: "Your shortlist starts here" }),
  ).toBeVisible();
  expect(errors).toEqual([]);
});
test("contact validation and honest development result", async ({ page }) => {
  await page.goto("/contact");
  await page.getByRole("button", { name: "Send Enquiry" }).click();
  await expect(page.getByText("Enter a valid email address.")).toBeVisible();
  await page.getByLabel("Full Name").fill("Test Member");
  await page.getByLabel("Company Name").fill("Test Company");
  await page.getByLabel("Email", { exact: false }).fill("test@example.com");
  await page.getByLabel("Phone Number").fill("9812345678");
  await page.getByLabel("Location").fill("Kathmandu");
  await page
    .getByLabel("Message", { exact: false })
    .fill("Please advise on a system for our demo facility.");
  await page.getByRole("button", { name: "Send Enquiry" }).click();
  await expect(
    page.getByText("Demo enquiry validated successfully.", { exact: false }),
  ).toBeVisible();
});
test("public routes and accessible structure", async ({ page }) => {
  for (const route of [
    "/",
    "/about",
    "/services",
    "/services/water-treatment",
    "/products",
    "/updates",
    "/updates/future-of-water-treatment",
    "/contact",
    "/login",
    "/signup",
  ]) {
    const response = await page.goto(route);
    expect(response?.status()).toBe(200);
    await expect(page.locator("h1")).toHaveCount(1);
  }
  for (const route of ["/", "/products", "/contact", "/login", "/signup"]) {
    await page.goto(route);
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();
    expect(
      results.violations.map((v) => ({
        id: v.id,
        nodes: v.nodes.map((n) => n.target),
      })),
    ).toEqual([]);
  }
});
test("responsive layouts and mobile menu", async ({ page }) => {
  for (const width of [375, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of [
      "/",
      "/products",
      "/about",
      "/contact",
      "/signup",
      "/products/ro-water-treatment-plant",
    ]) {
      await page.goto(route);
      await page.evaluate(() => document.fonts.ready);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
        `${route} overflows at ${width}px`,
      ).toBe(true);
    }
    await page.goto("/");
    await page.screenshot({
      path: `test-results/home-${width}.png`,
      fullPage: true,
    });
  }
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/");
  await page.getByRole("button", { name: "Open navigation" }).click();
  await page
    .locator(".main-nav")
    .getByRole("link", { name: "Products", exact: true })
    .click();
  await expect(page).toHaveURL(/\/products/);
});
