/**
 * Simple markdown-to-HTML converter for BLOG content only. Case studies use
 * real MDX via src/lib/mdx.ts and the block grammar in
 * src/components/case-study/blocks.
 * Handles: headings, paragraphs, bold, italic, code, links, lists, blockquotes, hr, images, tables.
 * Not used for content/case-studies anymore.
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
      `<pre tabindex="0" role="group" aria-label="Code sample"><code class="language-${lang}">${escapeHtml(code.trim())}</code></pre>`
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

  // Links. Only off-site hrefs get a new tab: an in-body link to /projects/...
  // or #section used to open a second tab and reload the whole site.
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_m, text: string, href: string) => {
    const external = /^[a-z][a-z0-9+.-]*:/i.test(href) && !href.startsWith("mailto:");
    const attrs = external ? ' target="_blank" rel="noopener noreferrer"' : "";
    return `<a href="${href}"${attrs}>${text}</a>`;
  });

  // Headings, each fenced as its own block. A line written directly under a
  // heading ("### Rubric\nThe axes…") used to share the heading's block, so
  // the paragraph pass skipped it and the text was left outside any <p>.
  html = html.replace(/^#### (.+)$/gm, "\n<h4>$1</h4>\n");
  html = html.replace(/^### (.+)$/gm, "\n<h3>$1</h3>\n");
  html = html.replace(/^## (.+)$/gm, "\n<h2>$1</h2>\n");
  html = html.replace(/^# (.+)$/gm, "\n<h1>$1</h1>\n");

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
      // Fenced by blank lines: the row pattern swallows the newline after the
      // last row, so prose right below a table used to share its block and
      // was left bare, outside any <p>.
      return `\n\n${tableHtml}\n\n`;
    }
  );

  // Lists. Each list is emitted as its own block, fenced by blank lines and
  // with no newlines inside it. Prose written directly above or below a list
  // ("It means:\n- a") used to share the list's paragraph block, so the
  // paragraph pass wrapped the list in <p> and joined every line with <br />.
  // The trailing newline the item patterns consume also swallowed the blank
  // line after a list, so the next paragraph lost its <p>.
  const listBlock = (tag: "ul" | "ol", items: string) =>
    `\n\n<${tag}>${items.replace(/\n/g, "")}</${tag}>\n\n`;

  // Unordered lists
  html = html.replace(/^- (.+)$/gm, "<li>$1</li>");
  html = html.replace(/((?:<li>.*<\/li>\n?)+)/g, (match: string) => listBlock("ul", match));

  // Ordered lists - wrap consecutive numbered lines in <ol>
  html = html.replace(/((?:^\d+\. .+$\n?)+)/gm, (match: string) =>
    listBlock("ol", match.replace(/^\d+\. (.+)$/gm, "<li>$1</li>"))
  );

  // Paragraphs - wrap remaining text blocks
  html = html
    .split(/\n{2,}/)
    .map((block) => {
      const trimmed = block.trim();
      if (!trimmed) return "";
      // Only real block elements skip wrapping. Inline markup at the start
      // of a paragraph (<strong>, <em>, <a>) used to match a bare "<[a-z]"
      // test, so bold-led paragraphs lost their <p> and consecutive ones
      // collapsed into one run-on block.
      if (BLOCK_START.test(trimmed)) return trimmed;
      return `<p>${trimmed.replace(/\n/g, "<br />")}</p>`;
    })
    .filter(Boolean)
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
  // Tags are masked rather than split on, so an emphasis span can wrap a
  // link: "*see [x](y) here*" must become <em>see <a>x</a> here</em>, which
  // a per-segment pass never matched. The mask holds no "*" or "_", so hrefs
  // and attributes still cannot be touched.
  const tags: string[] = [];
  const masked = html.replace(/<\/?[a-zA-Z][^>]*>/g, (tag) => {
    tags.push(tag);
    return `\u0001${tags.length - 1}\u0001`;
  });
  return transform(masked).replace(/\u0001(\d+)\u0001/g, (_m, i: string) => tags[Number(i)] ?? "");
}

/** Block-level openers (and closers) that must not be wrapped in <p>. */
const BLOCK_START =
  /^<\/?(?:p|h[1-6]|ul|ol|li|pre|blockquote|table|thead|tbody|tr|div|figure|figcaption|hr|details|summary|section|codeblock)\b/i;

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
