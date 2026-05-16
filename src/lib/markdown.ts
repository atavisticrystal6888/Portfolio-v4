/**
 * Simple markdown-to-HTML converter for case study and blog content.
 * Handles: headings, paragraphs, bold, italic, code, links, lists, blockquotes, hr, images, tables.
 * For full MDX support, swap to @next/mdx or mdx-bundler.
 */
export function markdownToHtml(md: string): string {
  // Normalize line endings to LF
  let html = md.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  // Code blocks (``` ... ```)
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_m, lang, code) => {
    const escaped = escapeHtml(code.trim());
    return `<pre tabindex="0"><code class="language-${lang}">${escaped}</code></pre>`;
  });

  // Inline code
  html = html.replace(/`([^`]+)`/g, "<code>$1</code>");

  // Images
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" loading="lazy" />');

  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

  // Headings
  html = html.replace(/^#### (.+)$/gm, "<h4>$1</h4>");
  html = html.replace(/^### (.+)$/gm, "<h3>$1</h3>");
  html = html.replace(/^## (.+)$/gm, "<h2>$1</h2>");
  html = html.replace(/^# (.+)$/gm, "<h1>$1</h1>");

  // Horizontal rules
  html = html.replace(/^---$/gm, "<hr />");

  // Bold + italic
  html = html.replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>");
  html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/\*(.+?)\*/g, "<em>$1</em>");

  // Blockquotes
  html = html.replace(/^> (.+)$/gm, "<blockquote><p>$1</p></blockquote>");

  // Tables - match consecutive pipe-delimited lines (header | separator | rows)
  html = html.replace(
    /((?:^\|.+\|$\n?){2,})/gm,
    (tableBlock) => {
      const lines = tableBlock.trim().split('\n').filter((l) => l.trim());
      if (lines.length < 2) return tableBlock;

      // First line is the header, second is the separator (|---|---|)
      const headerLine = lines[0]!;
      const separatorLine = lines[1]!;

      // Verify the second line is a separator
      if (!/^\|[\s\-:|]+\|$/.test(separatorLine)) return tableBlock;

      const parseRow = (line: string) =>
        line.split('|').slice(1, -1).map((cell) => cell.trim());

      const headers = parseRow(headerLine);
      const dataRows = lines.slice(2);

      let tableHtml = '<table><thead><tr>';
      for (const h of headers) {
        tableHtml += `<th>${h}</th>`;
      }
      tableHtml += '</tr></thead><tbody>';
      for (const row of dataRows) {
        const cells = parseRow(row);
        tableHtml += '<tr>';
        for (const cell of cells) {
          tableHtml += `<td>${cell}</td>`;
        }
        tableHtml += '</tr>';
      }
      tableHtml += '</tbody></table>';
      return tableHtml;
    }
  );

  // Unordered lists
  html = html.replace(/^- (.+)$/gm, "<li>$1</li>");
  html = html.replace(/((?:<li>.*<\/li>\n?)+)/g, "<ul>$1</ul>");

  // Ordered lists - wrap consecutive numbered lines in <ol>
  html = html.replace(/((?:^\d+\. .+$\n?)+)/gm, (match) => {
    const items = match.replace(/^\d+\. (.+)$/gm, "<li>$1</li>");
    return `<ol>${items}</ol>`;
  });

  // Paragraphs - wrap remaining text blocks
  html = html
    .split("\n\n")
    .map((block) => {
      const trimmed = block.trim();
      if (!trimmed) return "";
      if (/^<[a-z]/.test(trimmed)) return trimmed; // Already an HTML element
      return `<p>${trimmed.replace(/\n/g, "<br />")}</p>`;
    })
    .join("\n");

  return html;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
