import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string[] }> }
) {
  const { slug } = await params;
  const path = slug?.join("/") || "";

  const title = "Dhruv Singhal";
  let subtitle = "Product Analyst & Builder";
  let kicker = "Portfolio";

  if (path === "about") {
    kicker = "About";
    subtitle = "Background, Skills & Experience";
  } else if (path === "projects") {
    kicker = "Projects";
    subtitle = "Problem → Action → Outcome";
  } else if (path === "ai-pm") {
    kicker = "AI PM";
    subtitle = "Playbooks for Shipping LLM Products";
  } else if (path === "blog") {
    kicker = "Blog";
    subtitle = "Thoughts on Product, Data & Building";
  } else if (path === "contact") {
    kicker = "Contact";
    subtitle = "Let's Build Something Together";
  } else if (path === "now") {
    kicker = "Now";
    subtitle = "What I'm Currently Working On";
  } else if (path === "lab") {
    kicker = "Lab";
    subtitle = "Experiments & Ideas in Motion";
  } else if (path === "uses") {
    kicker = "Uses";
    subtitle = "Tools, Stack & Daily Drivers";
  } else if (path === "bookshelf") {
    kicker = "Bookshelf";
    subtitle = "What I'm Reading & Why";
  } else if (path === "changelog") {
    kicker = "Changelog";
    subtitle = "Build Log of This Portfolio";
  } else if (path.startsWith("projects/")) {
    kicker = "Case Study";
    subtitle = decodeURIComponent(path.replace("projects/", ""))
      .replace(/-/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
  } else if (path.startsWith("blog/")) {
    kicker = "Article";
    subtitle = decodeURIComponent(path.replace("blog/", ""))
      .replace(/-/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
  }

  const accent = "#5ba4b5";
  const accentSoft = "#3a6b75";
  const bg = "#0a0a0b";
  const textStrong = "#eaeaef";
  const textMuted = "#7c7c85";
  const domain =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/^https?:\/\//, "").replace(
      /\/$/,
      ""
    ) || "dhruvsinghal.com";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "row",
          background: bg,
          color: textStrong,
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        {/* Left accent rail */}
        <div
          style={{
            display: "flex",
            width: "16px",
            background: `linear-gradient(180deg, ${accent} 0%, ${accentSoft} 100%)`,
          }}
        />

        {/* Content column */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "80px 100px",
            flex: 1,
            position: "relative",
          }}
        >
          {/* Top kicker */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
              marginBottom: "32px",
            }}
          >
            <div
              style={{
                width: "32px",
                height: "2px",
                background: accent,
              }}
            />
            <div
              style={{
                fontSize: "22px",
                color: accent,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                fontWeight: 600,
              }}
            >
              {kicker}
            </div>
          </div>

          {/* Title */}
          <div
            style={{
              fontSize: "76px",
              fontWeight: 700,
              letterSpacing: "-0.025em",
              lineHeight: 1.05,
              marginBottom: "28px",
              color: textStrong,
            }}
          >
            {title}
          </div>

          {/* Subtitle */}
          <div
            style={{
              fontSize: "36px",
              color: textStrong,
              fontWeight: 400,
              lineHeight: 1.3,
              maxWidth: "900px",
            }}
          >
            {subtitle}
          </div>

          {/* Footer rail */}
          <div
            style={{
              position: "absolute",
              bottom: "60px",
              left: "100px",
              right: "100px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: "22px",
              color: textMuted,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div
                style={{
                  width: "10px",
                  height: "10px",
                  borderRadius: "50%",
                  background: accent,
                  boxShadow: `0 0 12px ${accent}`,
                }}
              />
              <span>{domain}</span>
            </div>
            <div style={{ fontStyle: "italic" }}>Product · Data · AI</div>
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
