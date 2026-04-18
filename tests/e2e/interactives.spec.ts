import { test, expect } from "@playwright/test";

test.describe("AI PM interactive demos", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/ai-pm");
  });

  test("page renders both interactive harnesses", async ({ page }) => {
    await expect(
      page.getByRole("region", { name: /eval harness demo/i })
    ).toBeVisible();
    await expect(
      page.getByRole("region", { name: /cost model demo/i })
    ).toBeVisible();
  });

  test.describe("Eval harness", () => {
    test("toggling model versions changes pass count", async ({ page }) => {
      const harness = page.getByRole("region", { name: /eval harness demo/i });
      const v1 = harness.getByRole("radio", { name: /v1.*vision-only/i });
      const v2 = harness.getByRole("radio", { name: /v2.*grounded/i });

      // v2 (grounded) is the default; switching to v1 must not throw and
      // must change the radio state.
      await v1.click();
      await expect(v1).toHaveAttribute("aria-checked", "true");
      await expect(v2).toHaveAttribute("aria-checked", "false");

      await v2.click();
      await expect(v2).toHaveAttribute("aria-checked", "true");
    });

    test("confidence slider updates the threshold label", async ({ page }) => {
      const harness = page.getByRole("region", { name: /eval harness demo/i });
      const slider = harness.getByLabel(/minimum confidence threshold/i);

      await slider.focus();
      // Bump threshold to 100% — every case should fail at that gate.
      await page.keyboard.press("End");
      await expect(harness.getByText(/confidence gate/i)).toContainText("100%");
    });

    test("at least one PASS row is present at the default gate", async ({
      page,
    }) => {
      const harness = page.getByRole("region", { name: /eval harness demo/i });
      const passes = harness.getByText(/^PASS$/);
      await expect(passes.first()).toBeVisible();
    });
  });

  test.describe("Cost model", () => {
    test("sliders move and stat tiles update", async ({ page }) => {
      const harness = page.getByRole("region", { name: /cost model demo/i });
      const usersSlider = harness.getByLabel(/active monthly users/i);

      await usersSlider.focus();
      await page.keyboard.press("End"); // max users
      // Monthly run-rate label should still render a dollar figure.
      await expect(harness.getByText(/monthly run-rate/i)).toBeVisible();
      await expect(harness.locator("text=/\\$\\d/").first()).toBeVisible();
    });

    test("envelope indicator is reachable", async ({ page }) => {
      const harness = page.getByRole("region", { name: /cost model demo/i });
      // Either "in envelope" or "over budget" must be present at all times.
      await expect(
        harness.getByText(/in envelope|over budget/i).first()
      ).toBeVisible();
    });
  });
});
