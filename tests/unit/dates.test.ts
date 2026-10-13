import { describe, it, expect } from "vitest";
import { formatDate, formatDateRange, formatTagLabel } from "@/lib/utils";

/* One visible date format (UI consistency audit, 13 Oct 2026, H6). */
describe("formatDate", () => {
  it("writes en-GB order with no comma", () => {
    expect(formatDate("2026-03-28")).toBe("28 March 2026");
    expect(formatDate("2026-03-28", "long")).toBe("28 March 2026");
    expect(formatDate("2026-03-28", "short")).toBe("28 Mar 2026");
    expect(formatDate("2026-09-30", "short")).toBe("30 Sep 2026");
  });

  it("renders month-only values and the month style as 'September 2026'", () => {
    expect(formatDate("2026-09")).toBe("September 2026");
    expect(formatDate("2026-09", "short")).toBe("September 2026");
    expect(formatDate("2026-09-30", "month")).toBe("September 2026");
  });

  it("reads timestamps as their UTC calendar date", () => {
    expect(formatDate("2026-10-02T23:30:00Z", "short")).toBe("2 Oct 2026");
  });

  it("returns unparseable input unchanged", () => {
    expect(formatDate("soon")).toBe("soon");
  });
});

describe("formatDateRange", () => {
  it("states the year once when both ends share it", () => {
    expect(formatDateRange("2026-07", "2026-10")).toBe("Jul to Oct 2026");
  });

  it("states both years when they differ", () => {
    expect(formatDateRange("2025-07", "2026-10")).toBe("Jul 2025 to Oct 2026");
    expect(formatDateRange("2024", "2025")).toBe("2024 to 2025");
  });

  it("never uses a dash", () => {
    expect(formatDateRange("2026-02", "2026-07")).not.toMatch(/[-\u2013\u2014]/);
  });
});

describe("formatTagLabel", () => {
  it("turns a slug into words", () => {
    expect(formatTagLabel("product-management")).toBe("product management");
  });
});
