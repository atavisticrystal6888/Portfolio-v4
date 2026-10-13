# 3D product plates (Blender pipeline)

Added 13 October 2026. Every project gets one Blender-rendered "product plate":
the real screenshot (or a generated title card when there is no screenshot)
mounted on an accent-coloured slab, photographed three-quarter from above with
a soft studio key light. The render has a transparent background with the
shadow baked into the alpha channel, so one theme-neutral image works on both
the light and the dark page ground. There is no runtime WebGL: the plates are
static WebP/AVIF files served through next/image, which keeps server-side
rendering, CLS and the 2 s mobile LCP budget intact.

## Why this shape

The v5 design notes removed the Three.js hero globe because decoration without
a decision trail reads as style over substance. Plates are different: each one
is the product itself, shown as an object, and it replaces the flat screenshot
or the CSS monogram that was already there. The slab colour is the project's
`accent` (or the site accent when the project has none), so the plate carries
the same colour the card and masthead already use.

## Files

| Path | Role |
|---|---|
| `scripts/blender/render-plate.py` | Blender (5.x, headless, Cycles) scene for one plate. Builds the slab and the screen card, lights, camera fit, renders a transparent PNG. |
| `scripts/render-plates.mjs` | Batch driver. Picks the source image, renders title cards for imageless projects with Playwright, calls Blender, trims and fits the plate into a 1600x1000 canvas with sharp, writes WebP + AVIF, records `plate` on each project. |
| `public/images/plates/<slug>.webp`, `.avif` | The shipped plates, 1600x1000, transparent. |
| `content/projects.json` | `plate: { src, avif, width, height }` per project, written by the batch. |
| `src/components/projects/ProductPlate.tsx` | Renders a plate (next/image, reserved 16:10 box). Used by ProductCard, the case-study hero and the imageless masthead. |
| `docs/design-system/plates/` | Design-system card for the plate pattern. |

## Regenerating

```
node scripts/render-plates.mjs                 # all projects, 1600 px, 40 samples
node scripts/render-plates.mjs --only sawari   # one project
node scripts/render-plates.mjs --skip-existing # resume after a crash
node scripts/render-plates.mjs --dry-run       # list what would render
node scripts/render-plates.mjs --post-only     # redo only the sharp stage from tmp/plates/raw
```

- Blender is found at `C:/Program Files/Blender Foundation/Blender 5.2/blender.exe`;
  set `BLENDER` to override.
- Each render takes 4 to 8 minutes on CPU at 1600 px. Cycles can fail with
  "out of memory" when a Next.js build or a Playwright run competes for RAM.
  The batch retries once after 20 s and records progress after every plate,
  so `--skip-existing` resumes cleanly. Prefer running it alone.
- The sharp stage trims the alpha bounds, then remaps alpha so anything at or
  below the trim threshold is fully transparent and the shadow fades to zero
  at the crop. Without that remap the crop left a faint hard-edged rectangle
  on the light theme. `--post-only` re-runs just this stage on the raw PNGs
  kept in `tmp/plates/raw` (ignored by git, so it needs a prior full render).
- Tuning knobs live in `render-plate.py` (`--tilt`, `--turn`, `--samples`,
  `--width`) and in the constants at the top of `render-plates.mjs`
  (canvas, padding, default accent).
- A project can set `plateSource` in `content/projects.json` to mount a
  different screenshot than the one its card shows. KiteEdge does this: its
  `imageUrl` is a portrait tearsheet, so the plate uses the landscape
  analytics screenshot instead and stays in the 16:10 family.
- Title cards (projects without a raster screenshot, or with an SVG one) use
  the bundled Fraunces, Manrope and JetBrains Mono fonts from `public/fonts`
  and the project's name, tagline, category and status.

## Rules for using a plate

1. A plate sits straight on the page ground. No frame, border, border-radius
   clip or tinted ground around it, or the baked shadow gets cut.
2. Dark theme applies only the existing `filter: brightness(0.86)` treatment.
3. Reserve the 16:10 box (width and height on the image) so layout does not
   shift while it loads. Only the first home carousel card and the first
   /projects card load with priority.
4. The lightbox still opens the original screenshot, not the plate. Title-card
   plates have no lightbox.
5. Keep `sizes` honest: cards render at 540 px or less, the hero at 1072 px.

## Owner checks

- Real-device look at /, /projects and one case study on a phone: the plate
  shadow should read as part of the page, not as a pasted rectangle.
- If a project's screenshot changes, re-run the batch for that slug.
- Lighthouse mobile on / after deploy; the plates add about 20 KB AVIF per
  visible card.
