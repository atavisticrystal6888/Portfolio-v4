import type { ProductPlateImage } from "@/types/project";

/**
 * Alt text and zoom for a rendered product plate, from what the plate
 * actually mounts (`plate.kind`, `plate.source`, recorded by
 * scripts/render-plates.mjs), never guessed from other project fields.
 */

/**
 * - title-card: "<name> title plate" (it shows no product UI).
 * - screenshot of `imageUrl` itself: `imageAlt`, which describes that file.
 * - screenshot of anything else (a `plateSource` capture): a generic line.
 */
export function plateAlt(
  plate: ProductPlateImage,
  name: string,
  imageUrl?: string | null,
  imageAlt?: string | null
): string {
  if (plate.kind === "title-card") return `${name} title plate`;
  if (imageAlt && imageUrl && plate.source === imageUrl) return imageAlt;
  return `${name} shown on a product plate`;
}

/**
 * The full-size image a plate's zoom opens: `imageUrl`, only for a
 * screenshot plate whose `imageUrl` is a raster file. Null means no zoom.
 */
export function plateZoomSrc(
  plate: ProductPlateImage,
  imageUrl?: string | null
): string | null {
  if (plate.kind !== "screenshot" || !imageUrl || /\.svg$/i.test(imageUrl)) return null;
  return imageUrl;
}
