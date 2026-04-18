"use client";

import { useMemo, useState } from "react";
import styles from "./CostModelDemo.module.css";

/**
 * Per-1k-token / per-call costs grounded in publicly listed pricing
 * for the Aarkid stack. Numbers are illustrative, not contractual.
 */
const PRICES = {
  visionPerCall: 0.0035, // Gemini 1.5 Pro vision call w/ ~1MP image
  retrievalPerCall: 0.005, // Perplexity Sonar grounded query
  embedPerCall: 0.0001, // text-embedding-3-small for cache lookup
  workerPerCall: 0.0000005, // Cloudflare Workers per-request
};

function formatUsd(n: number, digits = 4) {
  return `$${n.toFixed(digits)}`;
}

export function CostModelDemo() {
  const [requestsPerUser, setRequestsPerUser] = useState(8); // per month
  const [batchSize, setBatchSize] = useState(1); // 1 = no batching
  const [cacheHitRate, setCacheHitRate] = useState(0.45); // 0..1
  const [users, setUsers] = useState(5000);

  const math = useMemo(() => {
    // For a single uncached call, cost = vision + retrieval + worker
    const fullCallCost =
      PRICES.visionPerCall + PRICES.retrievalPerCall + PRICES.workerPerCall;
    // A cache hit only pays embed + worker
    const cachedCallCost = PRICES.embedPerCall + PRICES.workerPerCall;
    // Batching amortises the vision call across N images (vision dominates)
    const batchedFullCost =
      PRICES.visionPerCall / batchSize +
      PRICES.retrievalPerCall +
      PRICES.workerPerCall;

    const effectivePerCall =
      cacheHitRate * cachedCallCost + (1 - cacheHitRate) * batchedFullCost;

    const perUserPerMonth = effectivePerCall * requestsPerUser;
    const monthlyTotal = perUserPerMonth * users;

    return {
      fullCallCost,
      cachedCallCost,
      batchedFullCost,
      effectivePerCall,
      perUserPerMonth,
      monthlyTotal,
    };
  }, [requestsPerUser, batchSize, cacheHitRate, users]);

  const withinEnvelope = math.perUserPerMonth <= 0.25;

  return (
    <div className={styles.harness} role="region" aria-label="Cost model demo">
      <div className={styles.controls}>
        <label className={styles.control}>
          <span className={styles.controlLabel}>
            Requests / user / month
            <strong>{requestsPerUser}</strong>
          </span>
          <input
            type="range"
            min={1}
            max={40}
            step={1}
            value={requestsPerUser}
            onChange={(e) => setRequestsPerUser(parseInt(e.target.value, 10))}
            aria-label="Requests per user per month"
          />
        </label>

        <label className={styles.control}>
          <span className={styles.controlLabel}>
            Batch size <strong>{batchSize}</strong>
          </span>
          <input
            type="range"
            min={1}
            max={8}
            step={1}
            value={batchSize}
            onChange={(e) => setBatchSize(parseInt(e.target.value, 10))}
            aria-label="Vision batch size"
          />
        </label>

        <label className={styles.control}>
          <span className={styles.controlLabel}>
            Cache hit rate <strong>{Math.round(cacheHitRate * 100)}%</strong>
          </span>
          <input
            type="range"
            min={0}
            max={0.95}
            step={0.05}
            value={cacheHitRate}
            onChange={(e) => setCacheHitRate(parseFloat(e.target.value))}
            aria-label="Cache hit rate"
          />
        </label>

        <label className={styles.control}>
          <span className={styles.controlLabel}>
            Active users <strong>{users.toLocaleString()}</strong>
          </span>
          <input
            type="range"
            min={500}
            max={50000}
            step={500}
            value={users}
            onChange={(e) => setUsers(parseInt(e.target.value, 10))}
            aria-label="Active monthly users"
          />
        </label>
      </div>

      <div className={styles.statRow}>
        <div className={styles.stat}>
          <span className={styles.statValue}>
            {formatUsd(math.effectivePerCall, 5)}
          </span>
          <span className={styles.statLabel}>Effective / request</span>
        </div>
        <div
          className={withinEnvelope ? styles.statGood : styles.statBad}
          title="Target envelope: $0.25 / user / month"
        >
          <span className={styles.statValue}>
            {formatUsd(math.perUserPerMonth, 3)}
          </span>
          <span className={styles.statLabel}>
            / user / month {withinEnvelope ? "· in envelope" : "· over budget"}
          </span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statValue}>
            ${math.monthlyTotal.toFixed(0)}
          </span>
          <span className={styles.statLabel}>Monthly run-rate</span>
        </div>
      </div>

      <div className={styles.breakdown}>
        <h4 className={styles.breakdownTitle}>Per-request breakdown</h4>
        <ul className={styles.breakdownList}>
          <li>
            <span className={styles.bdLabel}>Vision (Gemini 1.5 Pro)</span>
            <span className={styles.bdValue}>
              {formatUsd(PRICES.visionPerCall / batchSize, 5)}
              {batchSize > 1 && (
                <span className={styles.bdNote}>÷{batchSize} batched</span>
              )}
            </span>
          </li>
          <li>
            <span className={styles.bdLabel}>Retrieval (Perplexity Sonar)</span>
            <span className={styles.bdValue}>
              {formatUsd(PRICES.retrievalPerCall, 5)}
            </span>
          </li>
          <li>
            <span className={styles.bdLabel}>Embed (cache lookup, on hit)</span>
            <span className={styles.bdValue}>
              {formatUsd(PRICES.embedPerCall, 5)}
            </span>
          </li>
          <li>
            <span className={styles.bdLabel}>Edge worker</span>
            <span className={styles.bdValue}>
              {formatUsd(PRICES.workerPerCall, 7)}
            </span>
          </li>
        </ul>
      </div>

      <p className={styles.note}>
        The Aarkid envelope is <strong>$0.25 / active user / month</strong>.
        Vision is the dominant cost — batching it across multiple images
        (gallery upload, time-lapse) and caching repeat diagnoses by perceptual
        hash are the two levers that keep us under budget at scale.
      </p>
    </div>
  );
}
