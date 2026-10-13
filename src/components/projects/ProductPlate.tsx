import Image from "next/image";
import type { ProductPlateImage } from "@/types/project";
import { cn } from "@/lib/utils";
import styles from "./ProductPlate.module.css";

interface ProductPlateProps {
  plate: ProductPlateImage;
  /** Product name, used for the fallback alt text. */
  name: string;
  /** Alt text for the screenshot on the slab; falls back to a generic line. */
  alt?: string;
  /** `sizes` for the rendered width; never wider than the layout's column. */
  sizes: string;
  /** Likely LCP image: load eagerly with fetchPriority="high". */
  priority?: boolean;
  className?: string;
}

/**
 * A Blender-rendered product plate: the product on an accent slab, shot
 * three-quarter from above, with a transparent background and its shadow in
 * the alpha channel. It sits straight on the page or card ground, so there
 * is no frame, tint, border or rounded clip here: any of those would cut the
 * shadow. The 16:10 box comes from the file's own width and height, so the
 * space is reserved before the image loads.
 *
 * next.config.ts enables AVIF and WebP in `images.formats`, so next/image
 * negotiates AVIF from the WebP source; the pre-rendered AVIF sibling is
 * kept for other consumers and not referenced here.
 */
export function ProductPlate({
  plate,
  name,
  alt,
  sizes,
  priority = false,
  className,
}: ProductPlateProps) {
  return (
    <div className={cn(styles.plate, className)} data-testid="product-plate">
      <Image
        src={plate.src}
        alt={alt ?? `${name} shown on a product plate`}
        width={plate.width}
        height={plate.height}
        sizes={sizes}
        className={styles.image}
        // Next 16 deprecates `priority`; eager + high fetch priority, no
        // <head> preload, matching FramedShot.
        loading={priority ? "eager" : undefined}
        fetchPriority={priority ? "high" : undefined}
      />
    </div>
  );
}
