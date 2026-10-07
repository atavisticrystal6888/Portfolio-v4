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

/**
 * Format an ISO date string to a readable format.
 */
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
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
