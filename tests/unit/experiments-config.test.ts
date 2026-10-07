import { afterEach, describe, expect, it, vi } from "vitest";
import { getExperimentsConfig, isExperimentsEnabled } from "@/lib/experiments/config";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("experiments config", () => {
  it("is disabled when both variables are unset", () => {
    vi.stubEnv("EXPERIMENTHUB_API_URL", "");
    vi.stubEnv("EXPERIMENTHUB_API_KEY", "");
    expect(isExperimentsEnabled()).toBe(false);
    expect(getExperimentsConfig()).toBeNull();
  });

  it("is disabled when only one variable is set", () => {
    vi.stubEnv("EXPERIMENTHUB_API_URL", "http://127.0.0.1:4000");
    vi.stubEnv("EXPERIMENTHUB_API_KEY", "");
    expect(isExperimentsEnabled()).toBe(false);
  });

  it("treats whitespace-only values as unset", () => {
    vi.stubEnv("EXPERIMENTHUB_API_URL", "   ");
    vi.stubEnv("EXPERIMENTHUB_API_KEY", "eh_live_x");
    expect(isExperimentsEnabled()).toBe(false);
  });

  it("returns trimmed config when both are set", () => {
    vi.stubEnv("EXPERIMENTHUB_API_URL", " http://127.0.0.1:4000/ ");
    vi.stubEnv("EXPERIMENTHUB_API_KEY", " eh_live_x ");
    expect(isExperimentsEnabled()).toBe(true);
    expect(getExperimentsConfig()).toEqual({ apiUrl: "http://127.0.0.1:4000/", apiKey: "eh_live_x" });
  });
});
