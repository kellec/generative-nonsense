import { lerp } from "canvas-sketch-util/math";
import random from "canvas-sketch-util/random";
import palettes from "nice-color-palettes";
import type { SketchSettings, SketchFn } from "../types";

export const settings: SketchSettings = {
  dimensions: [2048, 1200]
};

function hexToRgb(hex: string): number[] {
  const h = hex.replace("#", "");
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
}

function luminance(rgb: number[]): number {
  return 0.299 * rgb[0] + 0.587 * rgb[1] + 0.114 * rgb[2];
}

export const sketch: SketchFn = () => {
  random.setSeed(random.getRandomSeed());

  // Pick a random palette and sort brightest → darkest (center → edge)
  const rawPalette = random.pick(palettes);
  const palette = rawPalette
    .map(hexToRgb)
    .sort((a, b) => luminance(b) - luminance(a));

  function lerpRgb(a: number[], b: number[], t: number): number[] {
    return [
      Math.round(lerp(a[0], b[0], t)),
      Math.round(lerp(a[1], b[1], t)),
      Math.round(lerp(a[2], b[2], t)),
    ];
  }

  function flareColor(t: number, alpha: number): string {
    // t = 0 (center) → t = 1 (edge)
    const stops = palette.length - 1;
    const scaled = t * stops;
    const idx = Math.min(Math.floor(scaled), stops - 1);
    const localT = scaled - idx;
    const [r, g, b] = lerpRgb(palette[idx], palette[idx + 1], localT);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  // Randomize shape parameters once per generation
  const originX = random.range(0.3, 0.7);   // off-center horizontal
  const originY = random.range(0.35, 0.65);  // off-center vertical
  const squash = random.range(0.2, 0.5);     // elliptical eccentricity
  const tilt = random.range(-Math.PI / 4, Math.PI / 4); // rotation of the ellipse
  const driftAngle = random.range(0, Math.PI * 12);      // direction outer rings drift
  const driftStrength = random.range(0.5, 2.0);         // how much they drift

  return ({ context, width, height }) => {
    // Background uses the darkest palette color (last after sort)
    const [br, bg, bb] = palette[palette.length - 1];
    context.fillStyle = `rgb(${br}, ${bg}, ${bb})`;
    context.fillRect(0, 0, width, height);

    const cx = width * originX;
    const cy = height * originY;

    function drawRings(
      ringCount: number,
      ringSpacing: number,
      lineWidthFn: (i: number) => number,
      alphaFn: (t: number) => number,
      arcLenMin: number,
      arcLenMax: number,
    ) {
      for (let i = 0; i < ringCount; i++) {
        const t = i / ringCount;
        // Per-ring center drift — outer rings pull away from center
        const drift = t * t * driftStrength * ringSpacing * 3;
        const ringCx = cx + Math.cos(driftAngle) * drift;
        const ringCy = cy + Math.sin(driftAngle) * drift;

        context.save();
        context.translate(ringCx, ringCy);
        context.rotate(tilt);
        context.scale(1, squash);
        context.rotate(random.value());

        for (
          let j = 0;
          j < Math.PI * 2 + random.range(0, Math.PI * 8);
          j = j + random.range(Math.PI / 8, Math.PI / 100)
        ) {
          const colorJitter = random.range(-0.04, 0.04);

          context.beginPath();
          context.lineWidth = lineWidthFn(i);
          context.strokeStyle = flareColor(
            Math.max(0, Math.min(1, t + colorJitter)),
            alphaFn(t)
          );
          context.arc(
            0,
            0,
            Math.max(0, ringSpacing * i),
            j,
            j + random.range(arcLenMin, arcLenMax)
          );
          context.stroke();
        }
        context.restore();
      }
    }

    // --- Pass 1: thick opaque arcs for solid color foundation ---
    const thickSpacing = Math.ceil(Math.max(width, height) / 30);
    const thickLineWidth = Math.ceil(thickSpacing * 1.8); // wider than spacing = overlap
    const thickRings = Math.floor(Math.max(width, height) * 1.2 / thickSpacing);

    drawRings(
      thickRings,
      thickSpacing,
      () => thickLineWidth,
      () => 1,
      Math.PI / 8,
      Math.PI / 8 + 0.05,
    );

    // Fill center to cover the black dot where inner rings converge
    const [cr, cg, cb] = palette[0];
    context.save();
    context.translate(cx, cy);
    context.rotate(tilt);
    context.scale(1, squash);
    context.beginPath();
    context.arc(0, 0, thickLineWidth * 2, 0, Math.PI * 2);
    context.fillStyle = `rgb(${cr}, ${cg}, ${cb})`;
    context.fill();
    context.restore();

    // --- Pass 2: thin transparent arcs for painterly texture ---
    const thinSpacing = 8;
    const thinRings = Math.floor(Math.max(width, height) / thinSpacing);

    drawRings(
      thinRings,
      thinSpacing,
      () => random.range(2, 12),
      () => random.range(0.05, 0.4),
      Math.PI / 12,
      Math.PI / 4,
    );
  };
};
