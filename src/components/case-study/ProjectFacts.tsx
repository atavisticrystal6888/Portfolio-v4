import type { EvidenceTier, ProjectStatus } from "@/types/project";
import { cn } from "@/lib/utils";
import styles from "./ProjectFacts.module.css";

/**
 * The exact product-status and evidence vocabulary, shared by the case-study
 * masthead, the /projects cards and rows, related work and the home carousel.
 * One source so a pill never says something different on two pages.
 */
export const STATUS_LABEL: Record<ProjectStatus, string> = {
  live: "Live",
  "local-build": "Local build · not deployed",
  "pilot-ready": "Ready for local pilot",
  "open-source": "Open source",
  private: "Private",
  internal: "Internal",
  archived: "Archived",
};

export const EVIDENCE_LABEL: Record<EvidenceTier, string> = {
  measured: "Measured",
  tested: "Tested",
  built: "Built",
  "self-reported": "Self-reported",
};

/** One-line legend: what each tier does and does not claim. */
export const EVIDENCE_LEGEND: Record<EvidenceTier, string> = {
  measured: "an evaluation result exists",
  tested: "automated tests, no usage data",
  built: "works locally, lightly tested",
  "self-reported": "no file evidence",
};

/** Strength of the tier, 1 to 4; drives the small ladder glyph. */
const EVIDENCE_RANK: Record<EvidenceTier, number> = {
  measured: 4,
  tested: 3,
  built: 2,
  "self-reported": 1,
};

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/**
 * "2026-09-30" -> "30 Sep 2026". Parsed by hand, not through Intl: ICU builds
 * disagree on "Sep" vs "Sept", and a server/client mismatch there would be a
 * hydration warning on a client-rendered card.
 */
export function formatVerified(iso: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  if (!match) return iso;
  const [, y, m, d] = match;
  const month = MONTHS[Number(m) - 1];
  return month ? `${Number(d)} ${month} ${y}` : iso;
}

interface StatusPillProps {
  status: ProjectStatus;
  className?: string;
}

/** Exact product status. Live gets the one green dot on the page. */
export function StatusPill({ status, className }: StatusPillProps) {
  return (
    <span
      className={cn(styles.status, styles[`status_${status}`], className)}
      data-testid="status-pill"
      data-status={status}
    >
      {status === "live" && <span className={styles.statusDot} aria-hidden="true" />}
      {STATUS_LABEL[status]}
    </span>
  );
}

function Ladder({ tier }: { tier: EvidenceTier }) {
  const rank = EVIDENCE_RANK[tier];
  return (
    <span className={styles.ladder} aria-hidden="true">
      {[1, 2, 3, 4].map((step) => (
        <span key={step} className={cn(styles.rung, step <= rank && styles.rungOn)} />
      ))}
    </span>
  );
}

interface EvidenceChipProps {
  tier: EvidenceTier;
  className?: string;
}

/**
 * Evidence tier as a field tag: "Evidence: Tested". The legend rides along as
 * a tooltip; the masthead prints it in full.
 */
export function EvidenceChip({ tier, className }: EvidenceChipProps) {
  return (
    <span
      className={cn(styles.evidence, className)}
      data-testid="evidence-chip"
      data-tier={tier}
      title={`${EVIDENCE_LABEL[tier]}: ${EVIDENCE_LEGEND[tier]}`}
    >
      <Ladder tier={tier} />
      <span className={styles.evidenceKey}>Evidence:</span> {EVIDENCE_LABEL[tier]}
    </span>
  );
}

interface OwnershipLineProps {
  ownership: string;
  className?: string;
}

/** Exact contribution line, clamped to two lines on cards; full text on hover. */
export function OwnershipLine({ ownership, className }: OwnershipLineProps) {
  return (
    <p className={cn(styles.ownership, className)} title={ownership} data-testid="ownership-line">
      {ownership}
    </p>
  );
}

interface EvidenceLedgerProps {
  status?: ProjectStatus;
  /** Small qualifier beside the pill, e.g. "Hosted v1.3.1 line is frozen; v2 alpha runs locally". */
  statusNote?: string;
  ownership?: string;
  evidenceTier?: EvidenceTier;
  /** Visible limit under the tier, e.g. "Offline eval …; field accuracy not measured". */
  evidenceNote?: string;
  lastVerified?: string;
  className?: string;
}

/**
 * The masthead's evidence row: status, whose work it was, how strong the
 * evidence is (with its one-line legend) and when the facts were checked.
 */
export function EvidenceLedger({
  status,
  statusNote,
  ownership,
  evidenceTier,
  evidenceNote,
  lastVerified,
  className,
}: EvidenceLedgerProps) {
  if (!status && !ownership && !evidenceTier && !lastVerified) return null;

  return (
    <dl className={cn(styles.ledger, className)} data-testid="evidence-row">
      {status && (
        <div className={styles.cell}>
          <dt className={styles.key}>Status</dt>
          <dd className={styles.value}>
            <StatusPill status={status} />
            {statusNote && (
              <span className={styles.statusNote} data-testid="status-note">
                {statusNote}
              </span>
            )}
          </dd>
        </div>
      )}
      {ownership && (
        <div className={styles.cell}>
          <dt className={styles.key}>Ownership</dt>
          <dd className={styles.value}>{ownership}</dd>
        </div>
      )}
      {evidenceTier && (
        <div className={styles.cell}>
          <dt className={styles.key}>Evidence</dt>
          <dd className={styles.value} data-testid="evidence-tier">
            <Ladder tier={evidenceTier} />
            <strong className={styles.tier}>{EVIDENCE_LABEL[evidenceTier]}</strong>
            <span className={styles.legend}>: {EVIDENCE_LEGEND[evidenceTier]}</span>
            {evidenceNote && (
              <span className={styles.statusNote} data-testid="evidence-note">
                {evidenceNote}
              </span>
            )}
          </dd>
        </div>
      )}
      {lastVerified && (
        <div className={styles.cell}>
          <dt className={styles.key}>Checked</dt>
          <dd className={styles.value} data-testid="last-verified">
            Last verified{" "}
            <time dateTime={lastVerified}>{formatVerified(lastVerified)}</time>
          </dd>
        </div>
      )}
    </dl>
  );
}
