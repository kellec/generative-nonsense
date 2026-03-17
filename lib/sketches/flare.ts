import { lerp } from "canvas-sketch-util/math";
import random from "canvas-sketch-util/random";
import palettes from "nice-color-palettes";
import type { SketchSettings, SketchFn } from "../types";

export const settings: SketchSettings = {
  dimensions: [2048, 2048]
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

  // // Static palette (commented out — keeping for reference)
  // const palette = [
  //   [255, 250, 240], // warm white
  //   [255, 220, 160], // gold
  //   [240, 140, 60],  // amber
  //   [200, 50, 30],   // crimson
  //   [80, 20, 60],    // dark magenta
  //   [20, 10, 40],    // deep indigo
  // ];

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

  return ({ context, width, height }) => {
    const lineWidth = Math.ceil(width / 100);
    const rings = width / lineWidth;

    // Dark space background
    context.fillStyle = "black";
    context.fillRect(0, 0, width, height);

    for (let i = 0; i < rings; i++) {
      const t = i / rings; // 0 = center, 1 = edge

      context.save();
      context.translate(width / 2, height / 2);
      context.rotate(random.value());
      for (
        let j = 0;
        j < Math.PI * random.range(2, 10);
        j = j + random.range(Math.PI / 8, Math.PI / 100)
      ) {
        const colorJitter = random.range(-0.04, 0.04);

        context.beginPath();
        context.lineWidth = lineWidth;
        context.strokeStyle = flareColor(
          Math.max(0, Math.min(1, t + colorJitter)),
          1
        );
        context.arc(
          0,
          0,
          Math.max(0, lineWidth * i - 20),
          j,
          j + Math.PI / 8 + 0.05
        );
        context.stroke();
      }
      context.restore();
    }
  };
};
