#!/usr/bin/env node
/**
 * Idempotently create what the home-page CTA experiment needs on an
 * ExperimentHub instance: two conversion metrics, the experiment with its two
 * variants, the metric attachments, and a running status.
 *
 * Usage:
 *   EXPERIMENTHUB_API_URL=http://127.0.0.1:4000 \
 *   EXPERIMENTHUB_ADMIN_EMAIL=admin@local.dev EXPERIMENTHUB_ADMIN_PASSWORD=... \
 *   node scripts/experiment-hub-setup.mjs
 *
 * Against a loopback URL the demo admin from `mix dev.demo` is the default.
 * Nothing here is secret: it uses the management API with a short-lived JWT.
 */

const EXPERIMENT = {
  key: "portfolio-hero-cta",
  name: "Portfolio hero CTA",
  hypothesis: "Naming the case studies in the hero CTA increases click-through to the work and, downstream, contact submissions.",
  description: "dhruvsinghal.codes home page. Created by scripts/experiment-hub-setup.mjs.",
  feature_tag: "home-hero",
  variants: [
    { key: "control", name: "See the work", is_control: true, traffic_allocation: 5000, sort_order: 0 },
    { key: "read-the-case-studies", name: "Read the case studies", is_control: false, traffic_allocation: 5000, sort_order: 1 },
  ],
};

const METRICS = [
  { key: "hero_cta_click", name: "Hero CTA click", role: "primary", event: "hero_cta_click", description: "Visitors who clicked the hero call-to-action, over visitors assigned." },
  { key: "contact_submitted", name: "Contact submitted", role: "secondary", event: "contact_submitted", description: "Visitors who sent a genuine contact-form message, over visitors assigned." },
];

const baseUrl = (process.env.EXPERIMENTHUB_API_URL ?? "").trim().replace(/\/+$/, "");
if (!baseUrl) fail("EXPERIMENTHUB_API_URL is required");
const loopback = /^https?:\/\/(127\.0\.0\.1|localhost)(:\d+)?$/.test(baseUrl);
const email = process.env.EXPERIMENTHUB_ADMIN_EMAIL ?? (loopback ? "admin@local.dev" : "");
const password = process.env.EXPERIMENTHUB_ADMIN_PASSWORD ?? (loopback ? "ValidP@ssword123" : "");
if (!email || !password) fail("EXPERIMENTHUB_ADMIN_EMAIL and EXPERIMENTHUB_ADMIN_PASSWORD are required for a non-local URL");

function fail(message) {
  console.error(`experiment-hub-setup: ${message}`);
  process.exit(1);
}

async function api(method, path, body, token) {
  const res = await fetch(`${baseUrl}${path}`, {
    method,
    headers: { "content-type": "application/json", ...(token ? { authorization: `Bearer ${token}` } : {}) },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await res.text();
  const json = text ? JSON.parse(text) : null;
  if (!res.ok) fail(`${method} ${path} → ${res.status} ${text.slice(0, 300)}`);
  return json;
}

const login = await api("POST", "/api/v1/auth/login", {
  email,
  password,
  ...(process.env.EXPERIMENTHUB_TENANT_ID ? { tenant_id: process.env.EXPERIMENTHUB_TENANT_ID } : {}),
});
const token = login.access_token;

// Metric definitions (shape mirrors the platform's seeded, analysable metrics).
const existingMetrics = (await api("GET", "/api/v1/metric-definitions", undefined, token)).data ?? [];
const metricIds = {};
for (const m of METRICS) {
  const found = existingMetrics.find((d) => d.key === m.key);
  if (found) {
    metricIds[m.key] = found.id;
    console.log(`metric ${m.key}: exists (${found.id})`);
    continue;
  }
  const created = await api("POST", "/api/v1/metric-definitions", {
    key: m.key,
    name: m.name,
    description: m.description,
    metric_type: "ratio",
    definition: { event_name: m.event, numerator: "conversion", denominator: "assignment" },
  }, token);
  metricIds[m.key] = (created.data ?? created).id;
  console.log(`metric ${m.key}: created (${metricIds[m.key]})`);
}

// Experiment.
const list = (await api("GET", "/api/v1/experiments", undefined, token)).data ?? [];
let experiment = list.find((e) => e.key === EXPERIMENT.key);
if (experiment) {
  console.log(`experiment ${EXPERIMENT.key}: exists (${experiment.id}, ${experiment.status})`);
} else {
  const created = await api("POST", "/api/v1/experiments", EXPERIMENT, token);
  experiment = created.data ?? created;
  console.log(`experiment ${EXPERIMENT.key}: created (${experiment.id})`);
}

// Attach metrics (ignore "already attached" conflicts).
const attached = (await api("GET", `/api/v1/experiments/${experiment.id}/metrics`, undefined, token)).data ?? [];
for (const m of METRICS) {
  if (attached.some((a) => a.metric_definition_id === metricIds[m.key] || a.metric_definition?.id === metricIds[m.key])) {
    console.log(`attach ${m.key}: exists`);
    continue;
  }
  await api("POST", `/api/v1/experiments/${experiment.id}/metrics`, { metric_definition_id: metricIds[m.key], role: m.role }, token);
  console.log(`attach ${m.key}: ${m.role}`);
}

// Start if still a draft.
const detail = (await api("GET", `/api/v1/experiments/${experiment.id}`, undefined, token)).data ?? experiment;
if (detail.status === "draft") {
  await api("POST", `/api/v1/experiments/${experiment.id}/start`, {}, token);
  console.log(`experiment ${EXPERIMENT.key}: started`);
} else {
  console.log(`experiment ${EXPERIMENT.key}: status ${detail.status} (left as is)`);
}

console.log(`\nSet on the site:\n  EXPERIMENTHUB_API_URL=${baseUrl}\n  EXPERIMENTHUB_API_KEY=<the tenant SDK key>\n`);
