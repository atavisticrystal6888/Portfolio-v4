import { ImageResponse } from "next/og";

export const size = {
  width: 180,
  height: 180,
};

export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0a0a0b 0%, #17171d 100%)",
          color: "#5ba4b5",
          fontFamily: "Georgia, serif",
          fontSize: 96,
          fontWeight: 700,
          letterSpacing: "-0.08em",
          borderRadius: 44,
        }}
      >
        DS
      </div>
    ),
    size
  );
}