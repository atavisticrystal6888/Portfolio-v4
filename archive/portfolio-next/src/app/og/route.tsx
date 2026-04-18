import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

const ALLOWED_TYPES = new Set(["page", "case-study", "blog"]);

function sanitize(value: string | null, maxLen: number): string {
  if (!value) return "";
  return value.replace(/[<>&"']/g, "").slice(0, maxLen);
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  const title = sanitize(searchParams.get("title"), 100) || "Dhruv Singhal";
  const metric = sanitize(searchParams.get("metric"), 30);
  const type = ALLOWED_TYPES.has(searchParams.get("type") || "")
    ? searchParams.get("type")!
    : "page";

  const subtitle =
    type === "case-study"
      ? "Case Study"
      : type === "blog"
        ? "Blog Article"
        : "Portfolio";

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "60px 80px",
          background: "#0a0a0b",
          fontFamily: "sans-serif",
          color: "#f5f5f5",
          position: "relative",
        }}
      >
        {/* Gradient accent bar */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "6px",
            background: "linear-gradient(90deg, #6366f1, #8b5cf6, #a855f7)",
          }}
        />

        {/* Badge */}
        <div
          style={{
            fontSize: "16px",
            fontWeight: 600,
            color: "#a78bfa",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            marginBottom: "20px",
          }}
        >
          {subtitle}
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: title.length > 40 ? "42px" : "56px",
            fontWeight: 700,
            lineHeight: 1.2,
            maxWidth: "900px",
            marginBottom: metric ? "30px" : "0",
          }}
        >
          {title}
        </div>

        {/* Metric */}
        {metric && (
          <div
            style={{
              fontSize: "36px",
              fontWeight: 700,
              color: "#6366f1",
            }}
          >
            {metric}
          </div>
        )}

        {/* Footer */}
        <div
          style={{
            position: "absolute",
            bottom: "40px",
            left: "80px",
            fontSize: "18px",
            color: "#737373",
          }}
        >
          dhruvsinghal.com
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
