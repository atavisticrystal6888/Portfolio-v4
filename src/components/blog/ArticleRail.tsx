import { formatDate } from "@/lib/utils";

interface ArticleRailProps {
  date: string;
  category: string;
  readingTime?: string;
}

/**
 * The ListRow rail for an article, wherever an article is listed (/blog,
 * home, related reading, /ai-pm, "Where to go next"): the short date, then
 * category and reading time. CSS uppercases it; the source stays as written.
 */
export function ArticleRail({ date, category, readingTime }: ArticleRailProps) {
  return (
    <>
      <time dateTime={date}>{formatDate(date, "short")}</time>
      <span>
        {category}
        {readingTime && <> &middot; {readingTime}</>}
      </span>
    </>
  );
}
