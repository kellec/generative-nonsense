"use client";

import { useRef, useEffect } from "react";
import type { SketchSettings, SketchFn, SketchAnimated, SketchRender } from "@/lib/types";

function isAnimated(result: SketchRender | SketchAnimated): result is SketchAnimated {
  return typeof (result as SketchAnimated).render === "function";
}

function resolveDimensions(dimensions: [number, number] | string): [number, number] {
  if (Array.isArray(dimensions)) return dimensions;
  // Only dispersion3 uses "A3" at 600ppi
  // A3 = 297mm × 420mm, at 600 PPI: 7016 × 9933
  if (dimensions === "A3") return [7016, 9933];
  throw new Error(`Unknown paper size: ${dimensions}`);
}

interface Props {
  settings: SketchSettings;
  sketch: SketchFn;
}

export default function SketchCanvas({ settings, sketch }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    const [width, height] = resolveDimensions(settings.dimensions);
    canvas.width = width;
    canvas.height = height;

    const result = sketch();
    const props = { context, width, height };

    let frameId: number | undefined;

    if (isAnimated(result)) {
      result.begin(props);
      const loop = () => {
        result.render(props);
        frameId = requestAnimationFrame(loop);
      };
      frameId = requestAnimationFrame(loop);
    } else {
      result(props);
    }

    return () => {
      if (frameId !== undefined) {
        cancelAnimationFrame(frameId);
      }
    };
  }, [settings, sketch]);

  const [width, height] = resolveDimensions(settings.dimensions);
  const aspectRatio = width / height;

  return (
    <canvas
      ref={canvasRef}
      style={{
        maxWidth: "100vw",
        maxHeight: "100vh",
        width: aspectRatio >= 1 ? "100vw" : "auto",
        height: aspectRatio >= 1 ? "auto" : "100vh",
        aspectRatio: `${width} / ${height}`,
        display: "block",
        margin: "0 auto",
      }}
    />
  );
}
