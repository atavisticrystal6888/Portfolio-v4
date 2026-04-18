"use client";

import { useMemo, useState } from "react";
import styles from "./EvalHarnessDemo.module.css";

/** A single test case in the "golden set". */
interface GoldenCase {
  id: string;
  input: string;
  expected: string;
  /** Pre-baked model outputs keyed by model id. */
  outputs: Record<
    ModelId,
    {
      label: string;
      confidence: number; // 0..1
      latencyMs: number;
      cited: boolean;
    }
  >;
}

type ModelId = "v1-baseline" | "v2-grounded";

const MODELS: { id: ModelId; name: string; tag: string }[] = [
  { id: "v1-baseline", name: "v1 · vision-only", tag: "Gemini 1.5 Pro, no retrieval" },
  { id: "v2-grounded", name: "v2 · grounded", tag: "+ Perplexity Sonar citations" },
];

/** Hand-picked plant-diagnosis cases, mirroring the kind of golden set used on Aarkid. */
const GOLDEN_SET: GoldenCase[] = [
  {
    id: "yellow-monstera",
    input: "Monstera deliciosa, yellowing lower leaves, soil wet 4 days post-water",
    expected: "Overwatering / root rot risk",
    outputs: {
      "v1-baseline": { label: "Nutrient deficiency", confidence: 0.61, latencyMs: 1820, cited: false },
      "v2-grounded": { label: "Overwatering / root rot risk", confidence: 0.91, latencyMs: 2940, cited: true },
    },
  },
  {
    id: "fiddle-spots",
    input: "Fiddle-leaf fig, brown spots with yellow halo, recent move near AC vent",
    expected: "Cold draft + fungal stress",
    outputs: {
      "v1-baseline": { label: "Bacterial leaf spot", confidence: 0.72, latencyMs: 1610, cited: false },
      "v2-grounded": { label: "Cold draft + fungal stress", confidence: 0.86, latencyMs: 2710, cited: true },
    },
  },
  {
    id: "snake-mushy",
    input: "Snake plant, mushy base, leaves falling at touch",
    expected: "Advanced root rot",
    outputs: {
      "v1-baseline": { label: "Advanced root rot", confidence: 0.94, latencyMs: 1480, cited: false },
      "v2-grounded": { label: "Advanced root rot", confidence: 0.96, latencyMs: 2530, cited: true },
    },
  },
  {
    id: "pothos-pale",
    input: "Pothos, pale variegated leaves, low-light corner for 6 weeks",
    expected: "Insufficient light",
    outputs: {
      "v1-baseline": { label: "Insufficient light", confidence: 0.83, latencyMs: 1550, cited: false },
      "v2-grounded": { label: "Insufficient light", confidence: 0.92, latencyMs: 2640, cited: true },
    },
  },
  {
    id: "calathea-crisp",
    input: "Calathea orbifolia, crispy edges, indoor humidity 28%",
    expected: "Low humidity stress",
    outputs: {
      "v1-baseline": { label: "Underwatering", confidence: 0.66, latencyMs: 1730, cited: false },
      "v2-grounded": { label: "Low humidity stress", confidence: 0.89, latencyMs: 2820, cited: true },
    },
  },
  {
    id: "zz-droop",
    input: "ZZ plant, drooping stems, watered weekly past month",
    expected: "Overwatering",
    outputs: {
      "v1-baseline": { label: "Underwatering", confidence: 0.58, latencyMs: 1690, cited: false },
      "v2-grounded": { label: "Overwatering", confidence: 0.88, latencyMs: 2890, cited: true },
    },
  },
];

function normalize(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9 ]/g, "").trim();
}

function isMatch(expected: string, actual: string) {
  return normalize(expected) === normalize(actual);
}

export function EvalHarnessDemo() {
  const [modelId, setModelId] = useState<ModelId>("v2-grounded");
  const [threshold, setThreshold] = useState(0.7);

  const results = useMemo(() => {
    return GOLDEN_SET.map((c) => {
      const out = c.outputs[modelId];
      const passed = isMatch(c.expected, out.label) && out.confidence >= threshold;
      return { case: c, out, passed };
    });
  }, [modelId, threshold]);

  const stats = useMemo(() => {
    const total = results.length;
    const passes = results.filter((r) => r.passed).length;
    const accuracy = total === 0 ? 0 : passes / total;
    const avgLatency =
      total === 0
        ? 0
        : Math.round(results.reduce((s, r) => s + r.out.latencyMs, 0) / total);
    const avgConfidence =
      total === 0 ? 0 : results.reduce((s, r) => s + r.out.confidence, 0) / total;
    return { total, passes, accuracy, avgLatency, avgConfidence };
  }, [results]);

  return (
    <div className={styles.harness} role="region" aria-label="Eval harness demo">
      <div className={styles.controls}>
        <div className={styles.modelToggle} role="radiogroup" aria-label="Model version">
          {MODELS.map((m) => (
            <button
              key={m.id}
              type="button"
              role="radio"
              aria-checked={modelId === m.id}
              className={modelId === m.id ? styles.modelOn : styles.modelOff}
              onClick={() => setModelId(m.id)}
            >
              <span className={styles.modelName}>{m.name}</span>
              <span className={styles.modelTag}>{m.tag}</span>
            </button>
          ))}
        </div>

        <label className={styles.threshold}>
          <span className={styles.thresholdLabel}>
            Confidence gate <strong>{Math.round(threshold * 100)}%</strong>
          </span>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={threshold}
            onChange={(e) => setThreshold(parseFloat(e.target.value))}
            aria-label="Minimum confidence threshold for a pass"
          />
        </label>
      </div>

      <div className={styles.statRow}>
        <div className={styles.stat}>
          <span className={styles.statValue}>
            {Math.round(stats.accuracy * 100)}%
          </span>
          <span className={styles.statLabel}>
            Accuracy ({stats.passes}/{stats.total})
          </span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statValue}>
            {Math.round(stats.avgConfidence * 100)}%
          </span>
          <span className={styles.statLabel}>Avg confidence</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statValue}>
            {(stats.avgLatency / 1000).toFixed(2)}s
          </span>
          <span className={styles.statLabel}>Avg latency</span>
        </div>
      </div>

      <ul className={styles.cases}>
        {results.map(({ case: c, out, passed }) => (
          <li key={c.id} className={passed ? styles.caseRow : styles.caseRowFail}>
            <div className={styles.caseHead}>
              <span
                className={passed ? styles.badgePass : styles.badgeFail}
                aria-label={passed ? "Pass" : "Fail"}
              >
                {passed ? "PASS" : "FAIL"}
              </span>
              <span className={styles.caseInput}>{c.input}</span>
            </div>
            <div className={styles.caseBody}>
              <div className={styles.caseField}>
                <span className={styles.fieldLabel}>Expected</span>
                <span className={styles.fieldValue}>{c.expected}</span>
              </div>
              <div className={styles.caseField}>
                <span className={styles.fieldLabel}>Predicted</span>
                <span className={styles.fieldValue}>
                  {out.label}
                  {out.cited && (
                    <span className={styles.cited} title="Grounded by retrieval citations">
                      cited
                    </span>
                  )}
                </span>
              </div>
              <div className={styles.caseField}>
                <span className={styles.fieldLabel}>Confidence</span>
                <span className={styles.fieldValue}>
                  {Math.round(out.confidence * 100)}%
                </span>
              </div>
              <div className={styles.caseField}>
                <span className={styles.fieldLabel}>Latency</span>
                <span className={styles.fieldValue}>
                  {(out.latencyMs / 1000).toFixed(2)}s
                </span>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <p className={styles.note}>
        Toggle between the v1 baseline and the grounded v2 stack, or raise the
        confidence gate, to see how the same golden set re-scores. This is the
        same shape of harness we used on Aarkid to validate the 92% diagnosis
        accuracy claim before any user saw the model in production.
      </p>
    </div>
  );
}
