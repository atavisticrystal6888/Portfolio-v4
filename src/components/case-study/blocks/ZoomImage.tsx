import { getPublicImageSize } from "@/lib/image-size";
import { ZoomImageButton, type ZoomImageButtonProps } from "./ZoomImageButton";

export type ZoomImageProps = ZoomImageButtonProps;

/**
 * Server wrapper for the lightbox image. Reads the file's intrinsic size from
 * `public/` at render time so every case-study image reserves its box before
 * it loads (no layout shift, and chapter jumps land on the heading). Explicit
 * `width`/`height` props win over the file header.
 */
export function ZoomImage({ width, height, ...rest }: ZoomImageProps) {
  const size = width && height ? { width, height } : getPublicImageSize(rest.src);
  return <ZoomImageButton {...rest} width={size?.width} height={size?.height} />;
}
