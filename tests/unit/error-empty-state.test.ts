import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { ReactElement, ReactNode } from "react";

// The repo has no jsdom/happy-dom and vitest.config.ts pins `environment:
// "node"`, so React Testing Library cannot mount anything here. These tests
// invoke the components as plain functions and assert on the returned element
// tree instead — enough to cover the copy, the roles and the click handlers
// without adding a dependency.
vi.mock("react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react")>();
  return {
    ...actual,
    // Effects don't run outside a renderer; run them synchronously so the
    // error boundary's logging is observable.
    useEffect: (fn: () => void) => {
      fn();
    },
  };
});

const { EmptyState } = await import("@/components/ui/EmptyState");
const ErrorBoundaryPage = (await import("@/app/error")).default;

type AnyElement = ReactElement<Record<string, unknown>>;

function isElement(node: unknown): node is AnyElement {
  return typeof node === "object" && node !== null && "props" in node && "type" in node;
}

/** Depth-first walk over an un-rendered element tree. */
function findAll(node: ReactNode, match: (el: AnyElement) => boolean): AnyElement[] {
  const found: AnyElement[] = [];
  const visit = (n: unknown): void => {
    if (Array.isArray(n)) {
      n.forEach(visit);
      return;
    }
    if (!isElement(n)) return;
    if (match(n)) found.push(n);
    visit(n.props.children);
  };
  visit(node);
  return found;
}

/** Same walk, but asserts exactly-one match so callers get a non-nullable element. */
function findOne(node: ReactNode, match: (el: AnyElement) => boolean): AnyElement {
  const [first, ...rest] = findAll(node, match);
  if (!first) throw new Error("no element matched");
  if (rest.length) throw new Error(`expected one match, got ${rest.length + 1}`);
  return first;
}

function textOf(node: unknown): string {
  if (node === null || node === undefined || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(textOf).join("");
  if (isElement(node)) return textOf(node.props.children);
  return "";
}

describe("app/error.tsx", () => {
  const originalConsoleError = console.error;

  beforeEach(() => {
    console.error = vi.fn();
  });

  afterEach(() => {
    console.error = originalConsoleError;
  });

  function render(reset = vi.fn()) {
    const error = Object.assign(new Error("boom"), { digest: "abc123" });
    const tree = ErrorBoundaryPage({ error, reset }) as unknown as ReactNode;
    return { tree, reset, error };
  }

  it("renders the plain-English heading", () => {
    const { tree } = render();
    const headings = findAll(tree, (el) => el.type === "h1");
    expect(headings).toHaveLength(1);
    expect(textOf(headings[0])).toBe("Something went wrong on this page");
  });

  it("logs the error (digest included) for the server-side stack", () => {
    const { error } = render();
    expect(console.error).toHaveBeenCalledWith(error);
  });

  it("calls reset when 'Try again' is clicked", () => {
    const { tree, reset } = render();
    const tryAgain = findOne(tree, (el) => el.props.children === "Try again");
    expect(reset).not.toHaveBeenCalled();
    (tryAgain.props.onClick as () => void)();
    expect(reset).toHaveBeenCalledTimes(1);
  });

  it("offers a way out: home, projects and contact", () => {
    const { tree } = render();
    const hrefs = findAll(tree, (el) => typeof el.props.href === "string").map(
      (el) => el.props.href
    );
    expect(hrefs).toContain("/");
    expect(hrefs).toContain("/projects");
    expect(hrefs).toContain("/contact");
  });
});

describe("EmptyState", () => {
  it("marks the wrapper as a status region and renders title + description", () => {
    const tree = EmptyState({
      title: "No articles match",
      description: "Nothing matches “retention”.",
    }) as unknown as ReactNode;

    expect(findAll(tree, (el) => el.props.role === "status")).toHaveLength(1);
    expect(textOf(tree)).toContain("No articles match");
    expect(textOf(tree)).toContain("Nothing matches “retention”.");
  });

  it("fires the action's onClick", () => {
    const onClick = vi.fn();
    const tree = EmptyState({
      title: "No projects match this filter",
      action: { label: "Show all projects", onClick },
    }) as unknown as ReactNode;

    // Match on the exact child string so this finds the Button, not the
    // wrapper div whose text content is the same.
    const action = findOne(tree, (el) => el.props.children === "Show all projects");
    (action.props.onClick as () => void)();
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("renders a link action as an href, not a handler", () => {
    const tree = EmptyState({
      title: "Nothing here",
      action: { label: "Go home", href: "/" },
    }) as unknown as ReactNode;

    const action = findOne(tree, (el) => el.props.children === "Go home");
    expect(action.props.href).toBe("/");
    expect(action.props.onClick).toBeUndefined();
  });

  it("omits the action block entirely when no action is given", () => {
    const tree = EmptyState({ title: "Nothing here" }) as unknown as ReactNode;
    expect(textOf(tree)).toBe("Nothing here");
  });
});
