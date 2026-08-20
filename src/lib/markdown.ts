/**
 * Simple markdown-to-HTML converter for case study and blog content.
 * Handles: headings, paragraphs, bold, italic, code, links, lists, blockquotes, hr, images, tables.
 * For full MDX support, swap to @next/mdx or mdx-bundler.
 */
export function markdownToHtml(md: string): string {
  // Normalize line endings to LF
  let html = md.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  // Code is lifted out first and put back last. Every transform below runs
  // over the whole document, so leaving code inline meant its own text was
  // parsed as markdown: a `# comment` line became a heading, `*args` became
  // emphasis, and pipe-delimited output became a table.
  const codeBlocks: string[] = [];
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_m, lang: string, code: string) => {
    codeBlocks.push(
      `<pre tabindex="0"><code class="language-${lang}">${escapeHtml(code.trim())}</code></pre>`
    );
    // Starts with "<", so the paragraph pass leaves it alone.
    return `<codeblock data-i="${codeBlocks.length - 1}"></codeblock>`;
  });

  const inlineCode: string[] = [];
  html = html.replace(/`([^`]+)`/g, (_m, code: string) => {
    inlineCode.push(`<code>${escapeHtml(code)}</code>`);
    // Inline, so this placeholder must NOT look like an HTML element.
    return `\u0000IC${inlineCode.length - 1}\u0000`;
  });

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

  // Bold + italic. Asterisk and underscore forms both, run only over text
  // outside HTML tags so an href like /a/_hero_.png is left alone.
  html = replaceOutsideTags(html, (text) =>
    text
      .replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>")
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.+?)\*/g, "<em>$1</em>")
      // Underscore emphasis is intraword-safe: snake_case_names must survive,
      // so both delimiters have to sit on a word boundary.
      .replace(/(^|[^\w])__(?=\S)([^_]*?\S)__(?!\w)/g, "$1<strong>$2</strong>")
      .replace(/(^|[^\w])_(?=\S)([^_]*?\S)_(?!\w)/g, "$1<em>$2</em>")
  );

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

  // Put the code back now that no transform can reach into it.
  html = html.replace(/\u0000IC(\d+)\u0000/g, (_m, i: string) => inlineCode[Number(i)] ?? "");
  html = html.replace(
    /<codeblock data-i="(\d+)"><\/codeblock>/g,
    (_m, i: string) => codeBlocks[Number(i)] ?? ""
  );

  return html;
}

/**
 * Runs `transform` over the text between HTML tags only, leaving tags (and the
 * attribute values inside them) untouched.
 *
 * A tag must open with `</?` + a letter. Prose in these case studies is full of
 * bare comparisons - "P95 <10s", "<50ms overhead" - and a looser `<[^>]*>`
 * swallows everything up to the next unrelated `>` as if it were one tag,
 * which silently drops the emphasis pass over that whole span.
 */
function replaceOutsideTags(html: string, transform: (text: string) => string): string {
  return html
    .split(/(<\/?[a-zA-Z][^>]*>)/)
    .map((segment, i) => (i % 2 === 1 ? segment : transform(segment)))
    .join("");
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
