import { ImageResponse } from "next/og";
import { brand } from "@/lib/brand";

/** The iOS home-screen icon — the same mark, at a size iOS will accept. */
export const size = { width: 180, height: 180 };
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
          background: brand.ink,
        }}
      >
        <div style={{ width: 84, height: 84, background: brand.signal }} />
      </div>
    ),
    size,
  );
}
