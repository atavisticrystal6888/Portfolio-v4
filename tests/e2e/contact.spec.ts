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
      await subject.fill("Test subject");
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

  test("API route rejects short messages", async ({ request }) => {
    const response = await request.post("/api/contact", {
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
      data: {
        name: "Test User",
        email: "test@example.com",
        subject: "Valid inquiry",
        message:
          "This is a sufficiently long test message to pass validation checks.",
      },
    });
    // 200 (success with console.log fallback) or 429 if rate-limited from prior runs
    expect([200, 429]).toContain(response.status());
  });

  test("API route rejects missing fields", async ({ request }) => {
    const response = await request.post("/api/contact", {
      data: { name: "Test" },
    });
    expect(response.status()).toBe(400);
  });
});
