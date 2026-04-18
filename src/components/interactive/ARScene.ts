/**
 * AR session launcher stub.
 *
 * A full implementation would construct a Three.js + @react-three/xr scene
 * describing the case study architecture (nodes = services, edges = calls)
 * and request an `immersive-ar` session via `navigator.xr.requestSession`.
 *
 * This stub keeps the code path type-safe and lazy-loaded so that the
 * main bundle is never penalised for WebXR support on devices that will
 * never use it.
 */
export async function launchARSession(caseStudySlug: string): Promise<void> {
  const xr = (navigator as Navigator & {
    xr?: {
      requestSession?: (mode: string) => Promise<unknown>;
    };
  }).xr;

  if (!xr || typeof xr.requestSession !== "function") {
    throw new Error("WebXR not available");
  }

  console.info(`[AR] Launching immersive session for: ${caseStudySlug}`);
  // Full scene construction would go here (deferred).
}
