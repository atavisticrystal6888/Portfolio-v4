# Resume And Portfolio Sync Checklist

This checklist maps the canonical public resume direction to the live portfolio.

## Canonical Decisions

- Public default resume: `content/resume/dhruv-singhal-product-canonical.md`
- Secondary tailored resume: `content/resume/dhruv-singhal-ai-pm.md`
- Canonical public email: `dhruvsinghal6888@gmail.com`
- Canonical Wipro title: `Product Intern`
- Public download target: `/resume/dhruv-singhal-resume.pdf`

## Resume Asset

- [x] Replace `public/resume/dhruv-singhal-resume.pdf` with the final PDF exported from `content/resume/dhruv-singhal-product-canonical.md`.
- [x] Keep the AI PM resume in-repo as a tailored variant; do not link it publicly unless a resume selector is added.

## Global Identity Sync

- [x] `src/app/layout.tsx`
  - Change JSON-LD `jobTitle` from `Product Analyst & Builder` to `Product Manager & Builder`.
  - Update the JSON-LD description so it matches the canonical resume summary.
- [x] `src/app/about/page.tsx`
  - Change metadata description from `Product Analyst & Builder` to `Product Manager & Builder`.
  - Change the page subtitle to align with the public default role narrative.
- [x] `src/app/contact/page.tsx`
  - Change metadata description from `Product Analyst, APM, and data-driven PM roles` to `Product Manager, APM, and AI product roles`.

## Email Sync

Replace `dhruvsinghal04@gmail.com` with `dhruvsinghal6888@gmail.com` in the following files:

- [x] `src/components/contact/DirectLinks.tsx`
- [x] `src/components/contact/FAQAccordion.tsx`
- [x] `src/components/contact/ContactForm.tsx`
- [x] `src/components/interactive/CommandPalette.tsx`
- [x] `src/components/layout/Footer.tsx`
- [x] `src/app/page.tsx`
- [x] `src/app/contact/page.tsx`
- [x] `src/app/bookshelf/page.tsx`
- [x] `src/app/api/contact/route.ts`

## Wipro Title Sync

Replace `Product Trainee` with `Product Intern` in the following files:

- [x] `src/components/about/Timeline.tsx`
- [x] `src/components/home/ExperienceTimeline.tsx`
- [x] `src/app/now/page.tsx`

## Page-Level Copy Recommendations

### Home

- [x] `src/components/home/HeroSection.tsx`
  - Replace the hero statement with: `I scope and ship aviation and AI products - turning SME input, user research, and product specs into decisions teams can build.`
- [x] `src/app/page.tsx`
  - Change the final CTA heading from `Let's Build Together` to `Let's talk product` if the site should optimize for hiring rather than consulting.

### About

- [x] `src/app/about/page.tsx`
  - Update the subtitle to a single public role story. Recommended copy: `Product Manager & Builder - turning ambiguous domain problems into product decisions, specs, and shipped systems.`
  - Keep the bio aligned with `Product Intern` at Wipro and the canonical email.
- [x] `src/components/about/Philosophy.tsx`
  - Expand one card to include stakeholder or prioritization language, not only output and iteration language.

### Contact

- [x] `src/app/contact/page.tsx`
  - Change title from `Let's Build Something Together` to `Let's Talk Product`.
  - Change subtitle to: `Hiring for Product, APM, or AI product roles? I would love to talk.`
- [x] `src/components/contact/FAQAccordion.tsx`
  - Keep `Product Manager, Associate Product Manager (APM), or aviation/AI PM roles` as the public role framing.
  - Decide whether consulting should remain in the FAQ; if hiring is the primary goal, move consulting to the end or remove it.

### Now

- [x] `src/app/now/page.tsx`
  - Change `Product Trainee` to `Product Intern`.
  - Resolve version wording so the site is either publicly `v5` everywhere or version labels stay only in the changelog.

### Resume References

- [x] `src/components/layout/Navbar.tsx`
- [x] `src/app/about/page.tsx`
- [x] `src/components/contact/DirectLinks.tsx`
- [x] `src/components/interactive/CommandPalette.tsx`
  - Keep all four pointing at the same file: `/resume/dhruv-singhal-resume.pdf`.

## Content That Should Match The Resume

- [x] `content/case-studies/portfolio-site.mdx`
  - Replace `limited traditional PM experience` with `non-traditional path into product` or similar stronger phrasing.
- [x] `content/case-studies/portfolio-site.mdx` and `src/app/about/page.tsx`
  - Resolve the timeline mismatch between `4 iterative builds over 12 months` and `v1->v5 in 3 months`.
- [x] `content/case-studies/churn-analysis.mdx`
  - Replace `At Odena` with the correct employer name or anonymize it.
- [x] Decide whether `Hackmate` should be added to `content/projects.json` and the `/projects` experience.
  - If yes, add it as a first-class project.
  - If no, accept that the public resume includes one proof point not yet surfaced on the site.