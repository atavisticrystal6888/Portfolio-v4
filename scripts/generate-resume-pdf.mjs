import fs from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";

const rootDir = process.cwd();
const sourcePath = path.join(
  rootDir,
  "content",
  "resume",
  "dhruv-singhal-product-canonical.md"
);
const outputPath = path.join(
  rootDir,
  "public",
  "resume",
  "dhruv-singhal-resume.pdf"
);

function escapeHtml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatInline(value) {
  return escapeHtml(value)
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/_(.+?)_/g, "<em>$1</em>");
}

function splitSections(markdown) {
  return markdown
    .split(/\r?\n---\r?\n/g)
    .map((section) => section.trim())
    .filter(Boolean);
}

function parseHeader(section) {
  const lines = section.split(/\r?\n/).filter(Boolean);
  return {
    name: lines[0].replace(/^#\s+/, "").trim(),
    tagline: lines[1].replace(/^\*\*(.*)\*\*$/, "$1").trim(),
    contactLines: lines.slice(2),
  };
}

function stripSectionTitle(section) {
  return section.replace(/^##\s+.+?\r?\n+/s, "").trim();
}

function parseBullets(section) {
  return stripSectionTitle(section)
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.startsWith("- "))
    .map((line) => line.slice(2));
}

function parseEntries(section) {
  return stripSectionTitle(section)
    .split(/\r?\n(?=###\s)/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) => {
      const lines = block.split(/\r?\n/).filter(Boolean);
      const heading = lines.shift().replace(/^###\s+/, "").trim();
      const bulletLines = lines
        .filter((line) => line.trim().startsWith("- "))
        .map((line) => line.trim().slice(2));
      const infoLines = lines.filter((line) => !line.trim().startsWith("- "));
      return {
        heading,
        infoLines,
        bulletLines,
      };
    });
}

function renderContactLine(line) {
  const parts = line.split(" | ").map((part) => part.trim());
  const renderedParts = parts.map((part) => {
    const separatorIndex = part.indexOf(": ");
    if (separatorIndex === -1) {
      return formatInline(part);
    }

    const label = part.slice(0, separatorIndex);
    const value = part.slice(separatorIndex + 2);
    let href = "";

    if (label === "Email") {
      href = `mailto:${value}`;
    } else if (label === "Phone") {
      href = `tel:${value.replace(/\s+/g, "")}`;
    } else {
      href = value.startsWith("http") ? value : `https://${value}`;
    }

    return `<span class="contact-label">${escapeHtml(label)}:</span> <a href="${escapeHtml(href)}">${escapeHtml(value)}</a>`;
  });

  return `<p class="contacts">${renderedParts.join(' <span class="sep">|</span> ')}</p>`;
}

function renderWorkEntry(entry) {
  const dividerIndex = entry.heading.lastIndexOf(" | ");
  const title = dividerIndex === -1 ? entry.heading : entry.heading.slice(0, dividerIndex);
  const period = dividerIndex === -1 ? "" : entry.heading.slice(dividerIndex + 3);

  return `
    <article class="entry">
      <div class="entry-header">
        <div class="entry-title">${formatInline(title)}</div>
        <div class="entry-meta">${escapeHtml(period)}</div>
      </div>
      <ul>
        ${entry.bulletLines.map((line) => `<li>${formatInline(line)}</li>`).join("")}
      </ul>
    </article>
  `;
}

function renderProductEntry(entry) {
  const [stackLine = "", linksLine = ""] = entry.infoLines;
  return `
    <article class="entry product-entry">
      <div class="entry-header product-title-only">
        <div class="entry-title">${formatInline(entry.heading)}</div>
      </div>
      ${stackLine ? `<p class="entry-sub">${formatInline(stackLine)}</p>` : ""}
      ${linksLine ? `<p class="entry-links">${formatInline(linksLine)}</p>` : ""}
      <ul>
        ${entry.bulletLines.map((line) => `<li>${formatInline(line)}</li>`).join("")}
      </ul>
    </article>
  `;
}

function renderSkillLines(section) {
  return stripSectionTitle(section)
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => `<p>${formatInline(line)}</p>`)
    .join("");
}

function renderEducation(section) {
  return stripSectionTitle(section)
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => `<p>${formatInline(line)}</p>`)
    .join("");
}

function buildHtml(markdown) {
  const [headerSection, summarySection, workSection, productsSection, achievementsSection, skillsSection, educationSection] = splitSections(markdown);
  const header = parseHeader(headerSection);
  const summary = stripSectionTitle(summarySection);
  const workEntries = parseEntries(workSection);
  const productEntries = parseEntries(productsSection);
  const achievements = parseBullets(achievementsSection);
  const skills = renderSkillLines(skillsSection);
  const education = renderEducation(educationSection);

  return `
  <!doctype html>
  <html lang="en">
    <head>
      <meta charset="utf-8" />
      <title>${escapeHtml(header.name)} Resume</title>
      <style>
        @page {
          size: A4;
          margin: 0.42in;
        }

        * {
          box-sizing: border-box;
        }

        html, body {
          margin: 0;
          padding: 0;
          background: #ffffff;
          color: #111827;
          font-family: Arial, Helvetica, sans-serif;
        }

        body {
          font-size: 8.7pt;
          line-height: 1.24;
        }

        .page {
          width: 100%;
        }

        header {
          text-align: center;
          margin-bottom: 0.08in;
        }

        .name {
          font-size: 23pt;
          font-weight: 700;
          letter-spacing: 0.04em;
          margin: 0;
        }

        .tagline {
          font-size: 9.1pt;
          font-weight: 700;
          margin: 0.03in 0 0;
        }

        .contacts {
          margin: 0.03in 0 0;
          font-size: 8pt;
          line-height: 1.18;
        }

        .contacts a {
          color: inherit;
          text-decoration: none;
        }

        .sep {
          color: #6b7280;
          margin: 0 0.05in;
        }

        .contact-label {
          font-weight: 700;
        }

        section {
          border-top: 0.75pt solid #111827;
          padding-top: 0.05in;
          margin-top: 0.08in;
        }

        .section-title {
          margin: 0 0 0.04in;
          font-size: 9pt;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .summary {
          margin: 0;
          font-size: 8.6pt;
        }

        .entry {
          margin-bottom: 0.06in;
          page-break-inside: avoid;
        }

        .entry:last-child {
          margin-bottom: 0;
        }

        .entry-header {
          display: flex;
          justify-content: space-between;
          gap: 0.1in;
          align-items: baseline;
        }

        .entry-title {
          font-size: 8.9pt;
          font-weight: 700;
        }

        .entry-meta {
          font-size: 8pt;
          white-space: nowrap;
        }

        .product-title-only {
          display: block;
        }

        .entry-sub,
        .entry-links,
        .skills p,
        .education p {
          margin: 0.02in 0 0;
          font-size: 8.1pt;
        }

        .entry-sub {
          font-style: italic;
        }

        .entry-links a,
        .education a,
        .skills a,
        .summary a,
        li a {
          color: inherit;
          text-decoration: none;
        }

        ul {
          margin: 0.03in 0 0 0.16in;
          padding: 0;
        }

        li {
          margin-bottom: 0.02in;
        }

        li:last-child {
          margin-bottom: 0;
        }

        .bottom-grid {
          display: grid;
          grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr);
          gap: 0.12in;
        }

        .bottom-grid section {
          margin-top: 0.08in;
        }
      </style>
    </head>
    <body>
      <main class="page">
        <header>
          <h1 class="name">${escapeHtml(header.name)}</h1>
          <p class="tagline">${escapeHtml(header.tagline)}</p>
          ${header.contactLines.map(renderContactLine).join("")}
        </header>

        <section>
          <h2 class="section-title">Summary</h2>
          <p class="summary">${formatInline(summary)}</p>
        </section>

        <section>
          <h2 class="section-title">Work Experience</h2>
          ${workEntries.map(renderWorkEntry).join("")}
        </section>

        <section>
          <h2 class="section-title">Selected Products</h2>
          ${productEntries.map(renderProductEntry).join("")}
        </section>

        <div class="bottom-grid">
          <section>
            <h2 class="section-title">Achievements & Leadership</h2>
            <ul>
              ${achievements.map((item) => `<li>${formatInline(item)}</li>`).join("")}
            </ul>
          </section>

          <div>
            <section>
              <h2 class="section-title">Skills</h2>
              <div class="skills">${skills}</div>
            </section>

            <section>
              <h2 class="section-title">Education</h2>
              <div class="education">${education}</div>
            </section>
          </div>
        </div>
      </main>
    </body>
  </html>`;
}

async function main() {
  const markdown = await fs.readFile(sourcePath, "utf8");
  const html = buildHtml(markdown);

  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: "load" });
  await page.pdf({
    path: outputPath,
    format: "A4",
    printBackground: true,
    preferCSSPageSize: true,
  });
  await browser.close();

  console.log(`Generated resume PDF at ${outputPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});