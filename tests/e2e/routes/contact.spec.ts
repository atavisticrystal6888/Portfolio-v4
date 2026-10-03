import { test, expect, type Page } from "@playwright/test";

/*
 * /contact: reach Dhruv. Every submission here is intercepted; no request
 * ever reaches the real /api/contact route, so no mail can be sent.
 */
async function interceptContact(page: Page, status: number, body: object) {
  const calls: string[] = [];
  await page.route("**/api/contact", async (route) => {
    calls.push(route.request().postData() ?? "");
    await route.fulfill({ status, contentType: "application/json", body: JSON.stringify(body) });
  });
  return calls;
}

async function fillValid(page: Page) {
  await page.getByLabel(/^Name/).fill("Route Test");
  await page.getByLabel(/^Email/).fill("route-test@example.com");
  await page.getByLabel(/^Subject/).selectOption({ label: "Other" });
  await page.getByLabel(/^Message/).fill("An intercepted test message long enough to validate.");
}

test.describe("Contact (/contact)", () => {
  test.beforeEach(async ({ page }) => {
    // Safety net: anything not explicitly fulfilled by a test is aborted.
    await page.route("**/api/contact", (route) => route.abort());
    const res = await page.goto("/contact", { waitUntil: "networkidle" });
    expect(res?.status()).toBe(200);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("ways to reach me and FAQ disclosure", async ({ page }) => {
    const ways = page.getByRole("region", { name: "Ways to reach me" });
    await expect(ways).toBeVisible();
    await expect(ways.getByRole("link", { name: /^Email/ })).toHaveAttribute("href", /^mailto:/);
    await expect(ways.getByRole("link", { name: /^Resume/ })).toHaveAttribute("href", "/resume/dhruv-singhal-resume.pdf");

    const faq = page.getByRole("region", { name: "Common Questions" });
    const buttons = faq.getByRole("button");
    await expect(buttons).toHaveCount(4);
    for (let i = 0; i < 4; i++) {
      await expect(buttons.nth(i)).toHaveAttribute("aria-controls", `faq-answer-${i}`);
    }
    const first = buttons.nth(0);
    const initial = await first.getAttribute("aria-expanded");
    await expect(async () => {
      await first.click();
      expect(await first.getAttribute("aria-expanded")).not.toBe(initial);
    }).toPass({ timeout: 10_000 });
    if ((await first.getAttribute("aria-expanded")) === "true") {
      await expect(page.locator("#faq-answer-0")).toBeVisible();
    }
  });

  test("name and email declare autocomplete; the message minimum is stated up front", async ({ page }) => {
    await expect(page.getByLabel(/^Name/)).toHaveAttribute("autocomplete", "name");
    await expect(page.getByLabel(/^Email/)).toHaveAttribute("autocomplete", "email");
    await expect(page.getByLabel(/^Message/)).toHaveAccessibleDescription(/at least 20 characters/i);
  });

  test("FAQPage schema matches the visible questions and answers word for word", async ({ page }) => {
    const raw = await page.locator('script[type="application/ld+json"]').allTextContents();
    const faq = raw.map((t) => JSON.parse(t)).find((d) => d["@type"] === "FAQPage");
    expect(faq, "FAQPage JSON-LD").toBeTruthy();
    const region = page.getByRole("region", { name: "Common Questions" });
    const buttons = region.getByRole("button");
    await expect(buttons).toHaveCount(faq.mainEntity.length);
    for (let i = 0; i < faq.mainEntity.length; i++) {
      await expect(buttons.nth(i)).toHaveText(faq.mainEntity[i].name);
      await buttons.nth(i).click();
      await expect(page.locator(`#faq-answer-${i}`)).toHaveText(faq.mainEntity[i].acceptedAnswer.text);
    }
  });

  test("empty submit shows four errors and focuses Name", async ({ page }) => {
    const calls = await interceptContact(page, 200, { ok: true });
    await page.getByRole("button", { name: "Send Message" }).click();
    const form = page.locator("form");
    await expect(form.getByRole("alert")).toHaveCount(4);
    await expect(page.getByLabel(/^Name/)).toBeFocused();
    await expect(page.getByLabel(/^Name/)).toHaveAttribute("aria-invalid", "true");
    expect(calls).toHaveLength(0);
  });

  test("503 from the server shows the mailto fallback and keeps the fields", async ({ page }) => {
    await page.unroute("**/api/contact");
    const calls = await interceptContact(page, 503, { error: "Contact form is temporarily offline." });
    await fillValid(page);
    await page.getByRole("button", { name: "Send Message" }).click();
    const alert = page.locator("form").getByRole("alert");
    await expect(alert).toContainText("temporarily offline");
    await expect(alert.getByRole("link")).toHaveAttribute("href", /^mailto:/);
    await expect(page.getByLabel(/^Name/)).toHaveValue("Route Test");
    await expect(page.getByLabel(/^Message/)).toHaveValue(/intercepted test message/);
    expect(calls).toHaveLength(1);
    // Focus lands on the result message instead of dropping to <body>.
    await expect(page.getByTestId("contact-status")).toBeFocused();
  });

  test("200 from the server shows success and clears the form", async ({ page }) => {
    await page.unroute("**/api/contact");
    const calls = await interceptContact(page, 200, { ok: true });
    await fillValid(page);
    await page.getByRole("button", { name: "Send Message" }).click();
    await expect(page.getByRole("status").filter({ hasText: /sent successfully/i })).toBeVisible();
    await expect(page.getByTestId("contact-status")).toBeFocused();
    await expect(page.getByLabel(/^Name/)).toHaveValue("");
    await expect(page.getByLabel(/^Message/)).toHaveValue("");
    expect(calls).toHaveLength(1);
    expect(JSON.parse(calls[0]!)).toMatchObject({ name: "Route Test", email: "route-test@example.com" });
  });
});
