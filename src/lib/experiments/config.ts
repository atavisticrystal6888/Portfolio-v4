/**
 * ExperimentHub is opt-in: both variables must be present, otherwise every
 * experiment path is a no-op and the site behaves exactly as before.
 * Read at call time so tests (and Vercel env changes) take effect without a
 * module reload.
 */
export interface ExperimentsConfig {
  apiUrl: string;
  apiKey: string;
}

function clean(value: string | undefined): string {
  return (value ?? "").trim();
}

export function getExperimentsConfig(): ExperimentsConfig | null {
  const apiUrl = clean(process.env.EXPERIMENTHUB_API_URL);
  const apiKey = clean(process.env.EXPERIMENTHUB_API_KEY);
  if (!apiUrl || !apiKey) return null;
  return { apiUrl, apiKey };
}

export function isExperimentsEnabled(): boolean {
  return getExperimentsConfig() !== null;
}
