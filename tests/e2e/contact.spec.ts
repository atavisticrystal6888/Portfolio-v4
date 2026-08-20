import { test, expect } from "@playwright/test";

test.describe("Contact form", () => {
  test("contact page renders the form", async ({ page }) => {
    await page.goto("/contact");
    await expect(page.getByLabel(/name/i).first()).toBeVisible();
    await expect(page.getByLabel(/email/i).first()).toBeVisible();
    await expect(page.getByLabel(/message/i).first()).toBeVisible();
  });

  test("shows validation errors for invalid email", async ({ page }) => {
    await page.goto("/contact");

    await page.getByLabel(/name/i).first().fill("Test User");
    await page.getByLabel(/email/i).first().fill("not-an-email");
    const subject = page.getByLabel(/subject/i).first();
    if (await subject.isVisible().catch(() => false)) {
      await subject.selectOption({ label: "Other" });
    }
    await page
      .getByLabel(/message/i)
      .first()
      .fill("This is a valid message with more than twenty characters.");

    const submit = page.getByRole("button", { name: /send|submit/i }).first();
    await submit.click();

    // Browser native validation OR inline error should prevent submission
    const emailInput = page.getByLabel(/email/i).first();
    const validity = await emailInput.evaluate(
      (el: HTMLInputElement) => el.validity.valid
    );
    expect(validity).toBe(false);
  });

  // API-route tests are browser-independent; running them once (chromium) keeps
  // the suite's 15 cross-browser POSTs from tripping the route's rate limit.
  // Each test also claims its own x-forwarded-for so it cannot spend another
  // test's budget - or inherit one already spent by an earlier local run.
  test.beforeEach(async ({}, testInfo) => {
    if (testInfo.title.startsWith("API route")) {
      test.skip(testInfo.project.name !== "chromium", "API tests run on chromium only");
    }
  });

  test("API route rejects short messages", async ({ request }) => {
    const response = await request.post("/api/contact", {
      headers: { "x-forwarded-for": "203.0.113.11" },
      data: {
        name: "Test",
        email: "test@example.com",
        subject: "Hi",
        message: "too short",
      },
    });
    expect(response.status()).toBe(400);
  });

  test("API route accepts valid submission", async ({ request }) => {
    const response = await request.post("/api/contact", {
      headers: { "x-forwarded-for": "203.0.113.12" },
      data: {
        name: "Test User",
        email: "test@example.com",
        subject: "Valid inquiry",
        message:
          "This is a sufficiently long test message to pass validation checks.",
      },
    });
    // Its own client IP, so this is a clean first send every run.
    expect(response.status()).toBe(200);
  });

  test("API route rejects missing fields", async ({ request }) => {
    const response = await request.post("/api/contact", {
      headers: { "x-forwarded-for": "203.0.113.13" },
      data: { name: "Test" },
    });
    expect(response.status()).toBe(400);
  });

  test("API route: a rejected submission does not spend the sender's budget", async ({
    request,
  }) => {
    const ip = { "x-forwarded-for": "203.0.113.14" };
    // Six failed attempts - one more than the window allows - then a good one.
    for (let i = 0; i < 6; i++) {
      const bad = await request.post("/api/contact", {
        headers: ip,
        data: { name: "Test", email: "test@example.com", subject: "Hi", message: "short" },
      });
      expect(bad.status()).toBe(400);
    }
    const good = await request.post("/api/contact", {
      headers: ip,
      data: {
        name: "Test User",
        email: "test@example.com",
        subject: "Valid inquiry",
        message: "A long enough message that should still be accepted after typos.",
      },
    });
    expect(good.status()).toBe(200);
  });
});
