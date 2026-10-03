import { test, expect, type Locator } from "@playwright/test";

/* AI PM: the demos must respond to their controls and be labelled illustrative. */
async function textOf(l: Locator) {
  return (await l.innerText()).replace(/\s+/g, " ").trim();
}

test.describe("AI PM (/ai-pm)", () => {
  test.beforeEach(async ({ page }) => {
    const res = await page.goto("/ai-pm", { waitUntil: "networkidle" });
    expect(res?.status()).toBe(200);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("eval harness: model radio and confidence slider change the scored output", async ({ page }) => {
    const demo = page.getByRole("region", { name: "Eval harness demo" });
    await demo.scrollIntoViewIfNeeded();
    const initial = await textOf(demo);
    // v1 is the opening state (see the next test); switching to v2 re-scores.
    const v2 = demo.getByRole("radio", { name: /^v2/ });
    await expect(async () => {
      await v2.check();
      await expect(v2).toBeChecked({ timeout: 1000 });
    }).toPass({ timeout: 10_000 });
    await expect.poll(() => textOf(demo)).not.toBe(initial);
    const afterRadio = await textOf(demo);

    // The accessible name is the visible label (WCAG 2.5.3).
    const slider = demo.getByRole("slider", { name: "Confidence gate" });
    await slider.focus();
    await page.keyboard.press("End");
    await expect(slider).not.toHaveValue("0.7");
    await expect.poll(() => textOf(demo)).not.toBe(afterRadio);
  });

  test("eval harness opens on the v1 baseline, never on a perfect score", async ({ page }) => {
    const demo = page.getByRole("region", { name: "Eval harness demo" });
    await expect(demo.getByRole("radio", { name: /^v1/ })).toBeChecked();
    await expect(demo).not.toContainText("100%");
    await expect(demo).toContainText(/illustrative set/i);
  });

  test("sliders: names contain the visible label and values read as words", async ({ page }) => {
    const gate = page.getByRole("slider", { name: "Confidence gate" });
    await expect(gate).toHaveAttribute("aria-valuetext", /^\d+% minimum confidence to pass$/);
    const cost = page.getByRole("region", { name: "Cost model demo" });
    for (const [name, valuetext] of [
      ["Requests per user per month", /requests per user per month$/],
      ["Batch size", /no batching|images per vision call/],
      ["Cache hit rate", /^\d+%$/],
      ["Active users", /active users per month$/],
    ] as const) {
      const s = cost.getByRole("slider", { name, exact: true });
      await expect(s, name).toHaveCount(1);
      await expect(s, name).toHaveAttribute("aria-valuetext", valuetext);
      // The visible label text sits inside the same <label> as the input.
      await expect(s.locator("xpath=ancestor::label"), name).toContainText(name);
    }
  });

  test("playbook cards link to where each playbook is written up", async ({ page }) => {
    const cards = page.getByTestId("playbook-card");
    await expect(cards).toHaveCount(4);
    for (let i = 0; i < 4; i++) {
      const href = await cards.nth(i).getAttribute("href");
      expect(href, `card ${i}`).toMatch(/^(\/blog\/|\/projects\/aarchid#|#cost-model$)/);
    }
    await expect(page.locator("#cost-model")).toHaveCount(1);
  });

  test("no overclaims: no 'shipped proof', 'at scale' or a named, unverified provider", async ({ page }) => {
    const text = await page.locator("main").innerText();
    expect(text).not.toMatch(/shipped proof|under budget at scale|Aarchid-scale/i);
    expect(text).not.toMatch(/Exa AI/);
    expect(text).toMatch(/\$0\.25[^.]*(estimate|target)/i);
  });

  test("eval harness: version radios move with the arrow keys (roving tabindex)", async ({ page }) => {
    const demo = page.getByRole("region", { name: "Eval harness demo" });
    await demo.scrollIntoViewIfNeeded();
    const radios = demo.getByRole("radio");
    await expect(radios).toHaveCount(2);
    const checked = demo.getByRole("radio", { checked: true });
    await expect(checked).toHaveCount(1);
    // Only the checked radio is in the tab order.
    await expect(checked).toHaveAttribute("tabindex", "0");
    const before = (await checked.textContent())?.trim();
    await checked.focus();
    await page.keyboard.press("ArrowRight");
    const after = demo.getByRole("radio", { checked: true });
    await expect(after).not.toHaveText(before!);
    await expect(after).toBeFocused();
    await expect(after).toHaveAttribute("tabindex", "0");
    await page.keyboard.press("ArrowLeft");
    await expect(demo.getByRole("radio", { checked: true })).toHaveText(before!);
  });

  test("cost model: a slider change moves the monthly bill", async ({ page }) => {
    const demo = page.getByRole("region", { name: "Cost model demo" });
    await demo.scrollIntoViewIfNeeded();
    const before = await textOf(demo);
    const slider = demo.getByRole("slider", { name: "Requests per user per month" });
    await expect(async () => {
      await slider.focus();
      await page.keyboard.press("End");
      await expect(slider).not.toHaveValue("8", { timeout: 1000 });
    }).toPass({ timeout: 10_000 });
    await expect.poll(() => textOf(demo)).not.toBe(before);
  });

  test("both demos are labelled illustrative in visible copy", async ({ page }) => {
    await expect(
      page.getByRole("region", { name: "An eval harness, in your browser" })
    ).toContainText(/illustrative/i);
    await expect(
      page.getByRole("region", { name: "Cost modelling, in real time" })
    ).toContainText(/illustrative/i);
  });

  test("Aarchid proof credits the co-builder and withholds the eval result", async ({ page }) => {
    const proof = page.getByRole("region", { name: "Case study", exact: true });
    await expect(proof).toContainText("Co-built with Dilpreet Grover");
    await expect(proof).toContainText(/offline/i);
    // Owner decision (3 Oct 2026): the result is withheld until the eval
    // artefact or the co-builder's confirmation is available.
    await expect(proof).toContainText(/result is withheld/i);
    await expect(proof).not.toContainText(/\d+\s*%/);
    await proof.getByRole("link", { name: /Read the case study/ }).click();
    await expect(page).toHaveURL(/\/projects\/aarchid$/);
  });
});
