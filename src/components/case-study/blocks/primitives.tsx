import type {
  AnchorHTMLAttributes,
  HTMLAttributes,
  ImgHTMLAttributes,
  TableHTMLAttributes,
} from "react";
import styles from "./blocks.module.css";
import { ZoomImage } from "./ZoomImage";

/**
 * Markdown primitives MDX emits, adjusted to match what the regex converter
 * used to do: off-site links open in a new tab, code blocks are keyboard
 * scrollable, and bare markdown images open the lightbox.
 */

export function MdxLink({ href = "", children, ...rest }: AnchorHTMLAttributes<HTMLAnchorElement>) {
  const external = /^[a-z][a-z0-9+.-]*:/i.test(href) && !href.startsWith("mailto:");
  return (
    <a href={href} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})} {...rest}>
      {children}
    </a>
  );
}

/** Code can scroll sideways, so it is focusable and needs a name to be announced by. */
export function MdxPre(props: HTMLAttributes<HTMLPreElement>) {
  return <pre tabIndex={0} role="group" aria-label="Code sample" {...props} />;
}

/**
 * Same focusable horizontal scroll region the blog renderer wraps tables in
 * (`[data-table-scroll]`, styled in MdxContent.module.css), so a wide table
 * scrolls sideways instead of overflowing a 320px viewport.
 */
export function MdxTable(props: TableHTMLAttributes<HTMLTableElement>) {
  return (
    <div data-table-scroll="" tabIndex={0} role="group" aria-label="Table, scrolls sideways">
      <table {...props} />
    </div>
  );
}

export function MdxImg({ src, alt = "", title }: ImgHTMLAttributes<HTMLImageElement>) {
  if (typeof src !== "string") return null;
  return (
    <span className={styles.proseImage}>
      <ZoomImage src={src} alt={alt} caption={title ?? alt} className={styles.media} />
    </span>
  );
}
