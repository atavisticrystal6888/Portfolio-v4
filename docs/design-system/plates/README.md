# Plates

Blender-rendered 3D product plates. One theme-neutral render per product:
the screenshot (or a generated title card for products without one) mounted
on an accent-coloured slab, photographed three-quarter from above, transparent
background with the shadow baked into the alpha channel.

- Files: `public/images/plates/<slug>.webp` and `.avif`, 1600x1000.
- Data: `plate: { src, avif, width, height }` on each project in `content/projects.json`.
- Rules: no frame, border, radius clip or tinted ground around a plate; it sits
  straight on the page ground. Dark theme applies only `filter: brightness(0.86)`.
- Regenerate: `node scripts/render-plates.mjs` (pipeline notes in `docs/3d-plates.md`).

`plate-card.html` shows the Aarchid plate at 800px (`aarchid-800.webp`) so the
card group renders without reaching outside this folder.
