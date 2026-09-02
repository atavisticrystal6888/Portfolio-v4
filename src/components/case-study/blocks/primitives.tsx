import type { AnchorHTMLAttributes, HTMLAttributes, ImgHTMLAttributes } from "react";
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

export function MdxPre(props: HTMLAttributes<HTMLPreElement>) {
  return <pre tabIndex={0} {...props} />;
}

export function MdxImg({ src, alt = "", title }: ImgHTMLAttributes<HTMLImageElement>) {
  if (typeof src !== "string") return null;
  return (
    <span className={styles.proseImage}>
      <ZoomImage src={src} alt={alt} caption={title ?? alt} className={styles.media} />
    </span>
  );
}
