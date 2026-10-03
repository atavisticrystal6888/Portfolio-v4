import { describe, it, expect } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { SITE_URL } from "@/lib/site";

const items = [
  { name: "Home", href: "/" },
  { name: "Projects", href: "/projects" },
  { name: "Aarchid", href: "/projects/aarchid" },
];

function render() {
  return renderToStaticMarkup(createElement(Breadcrumbs, { items }));
}

describe("Breadcrumbs", () => {
  it("renders a labelled nav with an ordered list", () => {
    const html = render();
    expect(html).toMatch(/<nav[^>]*aria-label="Breadcrumb"/);
    expect(html).toContain("<ol");
    expect((html.match(/<li/g) ?? []).length).toBe(3);
  });

  it("links every item but the last, which is the current page as plain text", () => {
    const html = render();
    expect(html).toMatch(/<a[^>]*href="\/"[^>]*>Home<\/a>/);
    expect(html).toMatch(/<a[^>]*href="\/projects"[^>]*>Projects<\/a>/);
    expect(html).not.toMatch(/<a[^>]*href="\/projects\/aarchid"/);
    expect(html).toMatch(/<span[^>]*aria-current="page"[^>]*>Aarchid<\/span>/);
  });

  it("hides the separators from assistive technology", () => {
    const html = render();
    const separators = html.match(/<span[^>]*aria-hidden="true"[^>]*>\/<\/span>/g) ?? [];
    expect(separators).toHaveLength(2);
  });

  it("emits exactly one BreadcrumbList with absolute item URLs", () => {
    const html = render();
    const scripts = html.match(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g) ?? [];
    expect(scripts).toHaveLength(1);
    const json = JSON.parse(scripts[0]!.replace(/^<script[^>]*>/, "").replace(/<\/script>$/, ""));
    expect(json["@type"]).toBe("BreadcrumbList");
    expect(json.itemListElement.map((i: { position: number }) => i.position)).toEqual([1, 2, 3]);
    expect(json.itemListElement.map((i: { item: string }) => i.item)).toEqual([
      SITE_URL,
      `${SITE_URL}/projects`,
      `${SITE_URL}/projects/aarchid`,
    ]);
  });

  it("renders nothing for an empty trail", () => {
    expect(renderToStaticMarkup(createElement(Breadcrumbs, { items: [] }))).toBe("");
  });
});
