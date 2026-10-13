/**
 * Clamp a value between min and max.
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Debounce a function call.
 */
export function debounce<T extends (...args: never[]) => void>(
  fn: T,
  ms: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), ms);
  };
}

const MONTHS_LONG = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const MONTHS_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "long" = "28 March 2026", "short" = "28 Mar 2026", "month" = "March 2026". */
export type DateStyle = "long" | "short" | "month";

interface DateParts {
  year: number;
  /** 1-12, or null for a year-only value ("2024"). */
  month: number | null;
  /** 1-31, or null for a month- or year-only value ("2026-09"). */
  day: number | null;
}

/**
 * Reads "2026-09-30", "2026-09", "2026", a full ISO timestamp, or a legacy
 * human date ("30 September 2026"). ISO input is parsed by hand, not through
 * Intl: ICU builds disagree on "Sep" vs "Sept", and a server/client mismatch
 * on a client-rendered card would be a hydration warning. Timestamps resolve
 * to their UTC calendar date.
 */
function parseDateParts(value: string): DateParts | null {
  const iso = /^(\d{4})(?:-(\d{2})(?:-(\d{2}))?)?(?:T.*)?$/.exec(value.trim());
  if (iso) {
    const [, y, m, d] = iso;
    return {
      year: Number(y),
      month: m ? Number(m) : null,
      day: d ? Number(d) : null,
    };
  }
  const t = Date.parse(value);
  if (Number.isNaN(t)) return null;
  const date = new Date(t);
  return { year: date.getUTCFullYear(), month: date.getUTCMonth() + 1, day: date.getUTCDate() };
}

/**
 * The one visible date format on the site, en-GB order with no comma:
 * "28 March 2026" (long), "28 Mar 2026" (short) or "March 2026" (month).
 * A month-only value ("2026-09") always renders as "September 2026"; mono
 * rails uppercase the result in CSS, never in the string.
 */
export function formatDate(value: string, style: DateStyle = "long"): string {
  const parts = parseDateParts(value);
  if (!parts) return value;
  const { year, month, day } = parts;
  if (month === null) return String(year);
  const name = (style === "short" ? MONTHS_SHORT : MONTHS_LONG)[month - 1];
  if (!name) return value;
  if (style === "month" || day === null) return `${MONTHS_LONG[month - 1]} ${year}`;
  return `${day} ${name} ${year}`;
}

/**
 * A span of time in short months, written with "to" rather than a dash (no
 * em- or en-dashes in site copy): "Jul to Oct 2026" when both ends share a
 * year, "Jul 2025 to Oct 2026" when they do not, "2024 to 2025" for
 * year-only ends. Accepts the same inputs as formatDate.
 */
export function formatDateRange(start: string, end: string): string {
  const a = parseDateParts(start);
  const b = parseDateParts(end);
  if (!a || !b) return `${start} to ${end}`;
  const month = (p: DateParts) => (p.month ? MONTHS_SHORT[p.month - 1] : null);
  const ma = month(a);
  const mb = month(b);
  if (!ma || !mb) return a.year === b.year ? String(a.year) : `${a.year} to ${b.year}`;
  if (a.year === b.year) return ma === mb ? `${ma} ${a.year}` : `${ma} to ${mb} ${a.year}`;
  return `${ma} ${a.year} to ${mb} ${b.year}`;
}

/** A tag slug as words: "product-management" reads "product management". */
export function formatTagLabel(tag: string): string {
  return tag.replace(/-/g, " ");
}

/**
 * Convert a string to a URL-safe slug.
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Conditionally join class names (truthy values only).
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}

/**
 * Convert internal category keys into user-facing labels.
 */
export function formatCategoryLabel(category: string): string {
  switch (category.toLowerCase()) {
    case "ai":
      return "AI";
    case "product":
      return "Product";
    case "data":
      return "Data";
    case "technical":
      return "Technical";
    default:
      return category;
  }
}

/**
 * A metric caption longer than four words reads as a sentence, so it is set
 * as sentence-case body text; four words or fewer stay a mono field label.
 * Separators such as "·" are not words.
 */
export function isProseCaption(label: string): boolean {
  return label.split(/\s+/).filter((w) => /[A-Za-z0-9]/.test(w)).length > 4;
}
