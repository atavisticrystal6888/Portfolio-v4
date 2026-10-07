import {
  ExperimentHubError,
  NetworkError,
  RateLimitError,
  ServiceUnavailableError,
  createClient,
  type Assignment,
  type ExperimentHubClient,
} from "@experiment-hub/sdk";
import { getExperimentsConfig } from "./config";

/** Assignment sits on the home page's critical path: a short budget, then control. */
export const ASSIGN_TIMEOUT_MS = 300;
/** Tracking is two requests (assign for ids, then the event); 500 ms each keeps a contact submit under +1 s. */
export const TRACK_TIMEOUT_MS = 500;

export interface ControlFallback {
  variantKey: "control";
  enrolled: false;
}

export const CONTROL: ControlFallback = { variantKey: "control", enrolled: false };

export type ExperimentAssignment = Assignment | ControlFallback;

export interface ClientOptions {
  /** Injected by tests; defaults to the global fetch. */
  fetch?: typeof globalThis.fetch;
  timeoutMs?: number;
}

/** The only place the SDK is constructed. `null` when experiments are disabled. */
export function createExperimentsClient(options: ClientOptions = {}): ExperimentHubClient | null {
  const config = getExperimentsConfig();
  if (!config) return null;
  return createClient({
    baseUrl: config.apiUrl,
    apiKey: config.apiKey,
    timeoutMs: options.timeoutMs ?? ASSIGN_TIMEOUT_MS,
    fetch: options.fetch,
  });
}

function isUnavailable(error: unknown): boolean {
  return (
    error instanceof NetworkError ||
    error instanceof ServiceUnavailableError ||
    error instanceof RateLimitError
  );
}

// Fixed labels only: never the uid, the key, or a response body.
function logFailure(operation: "assign" | "track", error: unknown): void {
  const code = error instanceof ExperimentHubError ? error.code : "unknown";
  if (isUnavailable(error)) {
    console.warn(`[experiments] ${operation} unavailable: ${code}`);
    return;
  }
  const status = error instanceof ExperimentHubError && error.status !== undefined ? error.status : "n/a";
  console.error(`[experiments] ${operation} misconfigured: ${code} ${status}`);
}

/** Never throws; the site must render even when the platform is down or misconfigured. */
export async function assignOrControl(
  uid: string,
  experimentKey: string,
  options: ClientOptions = {},
): Promise<ExperimentAssignment> {
  const hub = createExperimentsClient({ ...options, timeoutMs: options.timeoutMs ?? ASSIGN_TIMEOUT_MS });
  if (!hub) return CONTROL;
  try {
    return await hub.assign({ userId: uid, experimentKey });
  } catch (error) {
    logFailure("assign", error);
    return CONTROL;
  }
}

/**
 * Record a conversion for an enrolled user. Re-assigning is cheap and sticky,
 * and it is how the event gets the experiment/variant ids the rollup needs.
 * Un-enrolled users are never tracked (the rollup has no assignment join).
 */
export async function trackConversion(
  uid: string,
  experimentKey: string,
  eventName: string,
  options: ClientOptions = {},
): Promise<void> {
  const hub = createExperimentsClient({ ...options, timeoutMs: options.timeoutMs ?? TRACK_TIMEOUT_MS });
  if (!hub) return;
  try {
    const assignment = await hub.assign({ userId: uid, experimentKey });
    if (!assignment.enrolled) return;
    await hub.track({
      userId: uid,
      experimentId: assignment.experimentId,
      variantId: assignment.variantId,
      type: "conversion",
      name: eventName,
      idempotencyKey: `${uid}:${experimentKey}:${eventName}`,
    });
  } catch (error) {
    logFailure("track", error);
  }
}
