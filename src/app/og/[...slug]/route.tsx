import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string[] }> }
) {
  const { slug } = await params;
  const path = slug?.join("/") || "";

  // Derive title from path
  const title = "Dhruv Singhal";
  let subtitle = "Product Analyst & Builder";

  if (path === "about") {
    subtitle = "About — Background, Skills & Experience";
  } else if (path === "projects") {
    subtitle = "Projects — Problem → Action → Outcome";
  } else if (path === "blog") {
    subtitle = "Blog — Thoughts on Product, Data & Building";
  } else if (path === "contact") {
    subtitle = "Contact — Let's Build Something Together";
  } else if (path === "now") {
    subtitle = "Now — What I'm Currently Working On";
  } else if (path.startsWith("projects/")) {
    subtitle = decodeURIComponent(path.replace("projects/", "")).replace(
      /-/g,
      " "
    );
    subtitle = subtitle.charAt(0).toUpperCase() + subtitle.slice(1);
  } else if (path.startsWith("blog/")) {
    subtitle = decodeURIComponent(path.replace("blog/", "")).replace(/-/g, " ");
    subtitle = subtitle.charAt(0).toUpperCase() + subtitle.slice(1);
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "flex-start",
          padding: "80px",
          background: "linear-gradient(135deg, #0a0a0b 0%, #141416 100%)",
          color: "#eaeaef",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            fontSize: "64px",
            fontWeight: 700,
            letterSpacing: "-0.02em",
            lineHeight: 1.1,
            marginBottom: "20px",
          }}
        >
          {title}
        </div>
        <div
          style={{
            fontSize: "32px",
            color: "#5ba4b5",
            fontWeight: 500,
          }}
        >
          {subtitle}
        </div>
        <div
          style={{
            position: "absolute",
            bottom: "60px",
            left: "80px",
            fontSize: "20px",
            color: "#6e6e77",
          }}
        >
          dhruvsinghal.com
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
