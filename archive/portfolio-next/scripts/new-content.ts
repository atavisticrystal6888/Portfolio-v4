#!/usr/bin/env npx tsx
/**
 * Content scaffolding script.
 *
 * Usage:
 *   npx tsx scripts/new-content.ts --type blog --slug my-new-post --title "My New Post"
 *   npx tsx scripts/new-content.ts --type case-study --slug my-project --title "My Project"
 */

import fs from "fs";
import path from "path";

const CONTENT_DIR = path.join(process.cwd(), "content");

function parseArgs(argv: string[]): Record<string, string> {
  const args: Record<string, string> = {};
  for (let i = 2; i < argv.length; i++) {
    if (argv[i].startsWith("--") && argv[i + 1]) {
      args[argv[i].slice(2)] = argv[++i];
    }
  }
  return args;
}

function validateSlug(slug: string): boolean {
  return /^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug);
}

function todayISO(): string {
  return new Date().toISOString().split("T")[0];
}

function blogTemplate(slug: string, title: string): string {
  return `---
slug: ${slug}
title: "${title}"
date: ${todayISO()}
updatedDate: null
category: Product
tags: []
readingTime: "5 min read"
excerpt: ""
socialImage: null
draft: true
---

# ${title}

Write your content here.
`;
}

function caseStudyTemplate(slug: string, title: string): string {
  return `---
slug: ${slug}
title: "${title}"
subtitle: ""
role: ""
duration: "${new Date().getFullYear()}"
stack: []
tldr: ""
metrics:
  - label: ""
    value: 0
    displayValue: ""
    chartType: bar
prevSlug: portfolio-site
nextSlug: aarkid
draft: true
---

# ${title}

## Problem

## Approach

## Results

## Lessons Learned
`;
}

function main() {
  const args = parseArgs(process.argv);

  if (!args.type || !args.slug || !args.title) {
    console.error(
      "Usage: npx tsx scripts/new-content.ts --type blog|case-study --slug <slug> --title <title>"
    );
    process.exit(1);
  }

  const { type, slug, title } = args;

  if (type !== "blog" && type !== "case-study") {
    console.error('Error: --type must be "blog" or "case-study"');
    process.exit(1);
  }

  if (!validateSlug(slug)) {
    console.error(
      "Error: --slug must be lowercase alphanumeric with hyphens (e.g. my-new-post)"
    );
    process.exit(1);
  }

  const dir =
    type === "blog"
      ? path.join(CONTENT_DIR, "blog")
      : path.join(CONTENT_DIR, "case-studies");
  const filePath = path.join(dir, `${slug}.mdx`);

  if (fs.existsSync(filePath)) {
    console.error(`Error: ${filePath} already exists. Choose a different slug.`);
    process.exit(1);
  }

  // Ensure directory exists
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const content =
    type === "blog" ? blogTemplate(slug, title) : caseStudyTemplate(slug, title);

  fs.writeFileSync(filePath, content, "utf-8");
  console.log(`✓ Created ${path.relative(process.cwd(), filePath)}`);

  // For case studies, also add to projects.json
  if (type === "case-study") {
    const projectsPath = path.join(CONTENT_DIR, "projects.json");
    const projects = JSON.parse(fs.readFileSync(projectsPath, "utf-8"));
    const maxOrder = Math.max(...projects.map((p: { order: number }) => p.order), 0);

    projects.push({
      slug,
      name: title,
      category: "technical",
      description: "",
      stack: [],
      metricValue: "",
      metricLabel: "",
      featured: false,
      githubUrl: null,
      duration: "",
      role: "",
      order: maxOrder + 1,
    });

    fs.writeFileSync(projectsPath, JSON.stringify(projects, null, 2) + "\n", "utf-8");
    console.log(`✓ Added "${title}" to content/projects.json (order: ${maxOrder + 1})`);
  }

  console.log(`\nContent created with draft: true. Remove 'draft: true' to publish.`);
}

main();
