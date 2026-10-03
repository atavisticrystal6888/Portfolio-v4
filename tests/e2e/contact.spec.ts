import { test, expect, type Page } from "@playwright/test";

/*
 * Mail safety: no test in this file can send a real email, even on a machine
 * with RESEND_API_KEY configured. Every browser submission is fulfilled by
 * page.route and never reaches the server. The server-side tests that call
 * the route handler directly (request.post) only ever send payloads that the
 * handler rejects or drops before its send step: a 400 validation failure, or
 * a honeypot drop whose payload would also fail validation if the honeypot
 * ever regressed. A well-formed payload is never posted to the real route.
 */
async function interceptContact(page: Page, status: number, body: object) {
  const calls: string[] = [];
  await page.route("**/api/contact", async (route) => {
    calls.push(route.request().postData() ?? "");
    await route.fulfill({ status, contentType: "application/json", body: JSON.stringify(body) });
  });
  return calls;
}

test.describe("Contact form", () => {
  test("contact page renders the form", async ({ page }) => {
    await page.goto("/contact");
    await expect(page.getByLabel(/name/i).first()).toBeVisible();
    await expect(page.getByLabel(/email/i).first()).toBeVisible();
    await expect(page.getByLabel(/message/i).first()).toBeVisible();
  });

  test("shows validation errors for invalid email", async ({ page }) => {
    // Intercepted: even if client validation regressed, nothing reaches the server.
    const calls = await interceptContact(page, 503, { error: "intercepted" });
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
    expect(calls, "an invalid email must not be submitted").toHaveLength(0);
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
    // Server-side 400 validation, so it calls the real handler directly. Mail
    // safe: a message under 20 characters is rejected before the send step.
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

  test("a valid submission is posted and the 200 / 503 answer is handled", async ({ page }) => {
    // Previously a request.post of a valid payload to the real route, which
    // would send a real email wherever RESEND_API_KEY is set. Now the browser
    // submits and page.route answers with the honest no-key 503, so nothing
    // reaches the server. Same assertion: a well-formed message gets 200 or
    // 503, never a 4xx.
    const calls = await interceptContact(page, 503, {
      error: "The contact form is temporarily offline. Please email me directly.",
    });
    await page.goto("/contact", { waitUntil: "networkidle" });
    await page.getByLabel(/^Name/).fill("Test User");
    await page.getByLabel(/^Email/).fill("test@example.com");
    await page.getByLabel(/^Subject/).selectOption({ label: "Other" });
    await page
      .getByLabel(/^Message/)
      .fill("This is a sufficiently long test message to pass validation checks.");
    const answered = page.waitForResponse("**/api/contact");
    await page.getByRole("button", { name: /send|submit/i }).first().click();
    const response = await answered;
    expect([200, 503]).toContain(response.status());
    expect(calls).toHaveLength(1);
    expect(JSON.parse(calls[0] ?? "{}")).toMatchObject({
      name: "Test User",
      email: "test@example.com",
    });
    await expect(page.locator("form").getByRole("alert")).toContainText(/offline/i);
  });

  test("API route silently accepts and drops a honeypot submission", async ({
    request,
  }) => {
    const response = await request.post("/api/contact", {
      headers: { "x-forwarded-for": "203.0.113.15" },
      // Mail safe: the email is malformed, so if the honeypot check ever
      // regressed this payload would stop at validation (400), not at the
      // send step. A 200 here proves the honeypot short-circuits first.
      data: {
        name: "Spam Bot",
        email: "bot-at-example",
        subject: "Valid inquiry",
        message: "A long enough message that a bot would happily send anyway.",
        website: "http://spam.example",
      },
    });
    // Drops before validation and the offline check, so this is 200 with or
    // without a key.
    expect(response.status()).toBe(200);
    expect(await response.json()).toMatchObject({ ok: true });
  });

  test("API route rejects missing fields", async ({ request }) => {
    // Server-side 400 validation via the real handler. Mail safe: email,
    // subject and message are missing, so it never reaches the send step.
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
    // Six failed attempts, one more than the five-per-window budget. The
    // limiter runs only after validation, so every one must be a 400; if
    // rejected attempts spent the budget, the sixth would be a 429. Mail safe:
    // the message is under 20 characters, so none reaches the send step.
    // (The old version then posted a valid message to the real route to prove
    // the budget was intact, which would send mail where a key is set; the
    // sixth attempt's 400 proves the same ordering without a send.)
    for (let i = 0; i < 6; i++) {
      const bad = await request.post("/api/contact", {
        headers: ip,
        data: { name: "Test", email: "test@example.com", subject: "Hi", message: "short" },
      });
      expect(bad.status(), `attempt ${i + 1}`).toBe(400);
      expect(bad.status()).not.toBe(429);
    }
  });
});
