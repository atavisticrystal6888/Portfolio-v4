/**
 * One motif, three sizes. Shared by the WebGL scene and the static fallback so
 * a page looks like the same object whether or not it got a GL context.
 */
export type SignatureVariant = "hero" | "dossier" | "ambient";

export interface SignatureSpec {
  /** Radius of the geodesic shell, in world units. */
  radius: number;
  /** Icosahedron subdivision - 1 is a readable lattice, 0 is bare facets. */
  detail: number;
  /** Line opacity for the shell; the ring runs at 55% of it. */
  opacity: number;
  /** Ring radius as a multiple of the shell radius. */
  ringScale: number;
  /** Camera distance, tuned so each variant fills its band. */
  camZ: number;
}

export const SIGNATURE_SPEC: Record<SignatureVariant, SignatureSpec> = {
  // Full-bleed behind the home hero: the one place it is allowed to be a
  // presence rather than a texture.
  hero: { radius: 2.6, detail: 1, opacity: 0.42, ringScale: 1.45, camZ: 8.4 },
  // Banded behind a case-study dossier header, offset right of the spec table.
  dossier: { radius: 2.2, detail: 1, opacity: 0.3, ringScale: 1.35, camZ: 7.6 },
  // Small and quiet, for a content-page header.
  ambient: { radius: 1.9, detail: 1, opacity: 0.26, ringScale: 1.25, camZ: 7.2 },
};
