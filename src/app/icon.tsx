import { ImageResponse } from "next/og";
import { brand } from "@/lib/brand";

/** The favicon: the header's mark — a signal-orange block on ink. */
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
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
        <div style={{ width: 14, height: 14, background: brand.signal }} />
      </div>
    ),
    size,
  );
}
