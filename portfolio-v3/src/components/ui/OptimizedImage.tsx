import Image, { type ImageProps } from "next/image";
import { cn } from "@/lib/utils";

interface OptimizedImageProps extends Omit<ImageProps, "alt"> {
  alt: string;
  className?: string;
}

export function OptimizedImage({
  alt,
  className,
  sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
  ...props
}: OptimizedImageProps) {
  return (
    <Image
      alt={alt}
      sizes={sizes}
      className={cn(className)}
      loading="lazy"
      {...props}
    />
  );
}
