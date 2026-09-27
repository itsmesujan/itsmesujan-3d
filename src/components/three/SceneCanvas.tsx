"use client";

import dynamic from "next/dynamic";
import { Component, type ReactNode } from "react";

/**
 * The renderer boundary.
 *
 * R3F + Three is a large dependency. It is code-split, never SSR'd, and only
 * mounted in the browser. Before it loads — and forever if WebGL is missing,
 * the module fails, or the context is lost — `fallback` renders as the
 * permanent static composition. That fallback is not a degraded mode: it
 * carries the full message on its own.
 */

const Canvas = dynamic(() => import("@react-three/fiber").then((m) => m.Canvas), {
  ssr: false,
  loading: () => null,
});

const AdaptiveDpr = dynamic(() => import("@react-three/drei").then((m) => m.AdaptiveDpr), {
  ssr: false,
});

type CatchProps = {
  children: ReactNode;
  onFail?: () => void;
};

/**
 * Catches render-time failures inside the canvas subtree. On failure the
 * subtree is unmounted and the static fallback shows through — the page
 * stays complete.
 */
class SceneErrorBoundary extends Component<CatchProps, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    console.error("[scene] render failed", error);
    this.props.onFail?.();
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}

export type SceneCanvasProps = {
  /** Rendered in place of the canvas when 3D is unavailable or unwanted. */
  fallback: ReactNode;
  children: ReactNode;
  /** Overall opacity target; scenes fade in once mounted. */
  className?: string;
  camera?: { position: [number, number, number]; fov?: number };
  /** Cap device pixel ratio for performance. */
  maxDpr?: number;
  shadows?: boolean;
  /** Called once the GL context is created — good place to drop the loader. */
  onReady?: () => void;
  /** Called if the context is lost or the scene fails. */
  onFail?: () => void;
  frameloop?: "always" | "demand";
};

export default function SceneCanvas({
  fallback,
  children,
  className = "",
  camera = { position: [0, 0, 6], fov: 45 },
  maxDpr = 1.25,
  shadows = false,
  onReady,
  onFail,
  frameloop = "always",
}: SceneCanvasProps) {
  return (
    <div className={`absolute inset-0 ${className}`} aria-hidden="true">
      {/* The static composition. Always in the DOM, behind the canvas.
          If WebGL never initializes, this is what the visitor sees — and it
          is a complete, readable presentation of the same idea. */}
      <div className="absolute inset-0">{fallback}</div>

      <SceneErrorBoundary onFail={onFail}>
        <Canvas
          className="relative"
          dpr={[1, maxDpr]}
          frameloop={frameloop}
          shadows={shadows}
          camera={camera}
          gl={{
            antialias: false,
            alpha: true,
            powerPreference: "high-performance",
            failIfMajorPerformanceCaveat: false,
          }}
          onCreated={({ gl }) => {
            gl.setClearColor(0x000000, 0);
            // Context loss is a real failure mode, not a theoretical one.
            const canvas = gl.domElement;
            const onLost = (e: Event) => {
              e.preventDefault();
              onFail?.();
            };
            canvas.addEventListener("webglcontextlost", onLost);
            onReady?.();
            return () => canvas.removeEventListener("webglcontextlost", onLost);
          }}
        >
          <AdaptiveDpr pixelated={false} />
          {children}
        </Canvas>
      </SceneErrorBoundary>
    </div>
  );
}
