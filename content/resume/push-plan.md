# Push Plan For Resume And Portfolio Updates

This plan assumes the resume source files are ready and the portfolio content will be synced before deployment.

## Phase 1 - Finalize Source Content

1. Review `content/resume/dhruv-singhal-product-canonical.md` and lock the public default copy.
2. Review `content/resume/dhruv-singhal-ai-pm.md` and keep only claims that can be supported by the portfolio or documented proof.
3. Use `content/resume/repo-sync-checklist.md` as the source of truth for site-copy updates.

## Phase 2 - Update The Repo

1. Confirm `public/resume/dhruv-singhal-resume.pdf` is the latest generated export from `content/resume/dhruv-singhal-product-canonical.md`.
2. Keep the email, title, and copy updates from `content/resume/repo-sync-checklist.md` in the same shipping diff.
3. Keep the Hackmate project entry and case study in the public portfolio so the site inventory matches the resume.
4. Before staging anything, make sure generated local artifacts stay ignored. `.next/`, `node_modules/`, and other local build outputs should never be pushed.

## Phase 3 - Validate Locally

1. Run `npm run build`.
2. Click-check the resume download from navbar, About, Contact, and command palette.
3. Verify the contact email is consistent everywhere.
4. Confirm the PDF filename remains `dhruv-singhal-resume.pdf` so no links break.

## Phase 4 - Review Diff

1. Run `git status --short`.
2. Review `git diff --stat` and then `git diff` for the touched resume and content files.
3. Sanity-check that only intentional content updates are included and that `.next/`, `node_modules/`, and other generated files are excluded from staging.

## Phase 5 - Push Safely

Recommended low-risk path:

1. Create a feature branch, for example `resume-sync`.
2. Commit the content and asset changes with a focused message, for example `sync public resume and portfolio copy`.
3. Push the branch and inspect the Vercel preview deployment.
4. Once the preview is correct, merge to `main`.
5. Confirm production redeploy and re-test the public resume link on the live site.

Fast path if you intentionally ship directly from `main`:

1. Commit the validated changes on `main`.
2. Push to `origin/main`.
3. Monitor the Vercel production deploy.
4. Re-check the resume download and contact email on the live site.

## Phase 6 - Optional Follow-Ups

1. Add a second public resume selector only if there is a clear UX case for multiple variants.
2. Add Hackmate to the portfolio site so the public resume and public project inventory fully match.
3. Version-control the source format used to generate the PDF so future resume updates are cheaper.