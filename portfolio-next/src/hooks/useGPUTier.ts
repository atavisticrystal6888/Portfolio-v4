"use client";

export type GPUTier = "high" | "medium" | "low" | "fallback";

function detectGPU(): GPUTier {
  try {
    const canvas = document.createElement("canvas");
    const gl =
      canvas.getContext("webgl") || canvas.getContext("experimental-webgl");

    if (!gl) {
      return "fallback";
    }

    const webgl = gl as WebGLRenderingContext;
    const debugInfo = webgl.getExtension("WEBGL_debug_renderer_info");

    if (debugInfo) {
      const renderer = webgl.getParameter(
        debugInfo.UNMASKED_RENDERER_WEBGL
      ) as string;
      const rendererLower = renderer.toLowerCase();

      if (
        /nvidia|geforce|rtx|gtx|radeon rx|amd radeon pro/i.test(rendererLower)
      ) {
        return "high";
      }
      if (/intel iris|intel uhd|apple m[1-9]/i.test(rendererLower)) {
        return "medium";
      }
      if (
        /swiftshader|llvmpipe|software|mesa/i.test(rendererLower)
      ) {
        return "low";
      }
    }

    canvas.remove();
    return "medium";
  } catch {
    return "fallback";
  }
}

let cachedTier: GPUTier | null = null;

export function useGPUTier(): GPUTier {
  if (cachedTier === null && typeof document !== "undefined") {
    cachedTier = detectGPU();
  }
  return cachedTier ?? "medium";
}
