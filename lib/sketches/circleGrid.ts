import random from "canvas-sketch-util/random";
import palettes from "nice-color-palettes";
import type { SketchSettings, SketchFn } from "../types";

export const settings: SketchSettings = {
  dimensions: [2048, 2048]
};

export const sketch: SketchFn = () => {
  random.setSeed(random.getRandomSeed());

  const createGrid = (gridWidth: number, gridHeight: number, offsetX: number, offsetY: number, palette: string[]) => {
    const count = 10;
    const squares: { position: [number, number]; w: number; h: number; color: string; stroke: string }[] = [];

    for (let i = 0; i < count; i++) {
      for (let j = 0; j < count; j++) {
        squares.push({
          position: [
            Math.ceil(offsetX + gridWidth / count * i),
            Math.ceil(offsetY + gridHeight / count * j)
          ],
          w: Math.ceil(gridWidth / count),
          h: Math.ceil(gridHeight / count),
          color: random.pick(palette),
          stroke: random.pick(palette)
        });
      }
    }

    return squares;
  };

  const colorCount = random.rangeFloor(3, 5);
  const palette = random.shuffle(random.pick(palettes).slice(0, colorCount));
  const background = palette.pop()!;
  const margin = 400;

  return ({ context, width, height }) => {
    const points = createGrid(
      width - margin * 2,
      height - margin * 2,
      margin,
      margin,
      palette
    ).filter(() => random.value() >= 0.2);
    context.fillStyle = background;
    context.fillRect(0, 0, width, height);

    function drawArc(x: number, y: number, w: number, h: number) {
      const corner = random.value();
      if (corner < 0.2) {
        context.moveTo(x + w, y + h);
        context.arc(x + w, y + h, w, 1.5 * Math.PI, Math.PI, true);
        return;
      }
      if (corner < 0.4) {
        context.moveTo(x, y + h);
        context.arc(x, y + h, w, 1.5 * Math.PI, 2 * Math.PI, false);
        return;
      }
      if (corner < 0.6) {
        context.moveTo(x, y);
        context.arc(x, y, w, 0, 0.5 * Math.PI, false);
        return;
      }
      if (corner < 0.8) {
        context.moveTo(x + w, y);
        context.arc(x + w, y, w, Math.PI, 0.5 * Math.PI, true);
        return;
      }
      if (corner < 0.85) {
        context.moveTo(x + w, y);
        context.arc(x + w, y, w, 0.5 * Math.PI, 1.5 * Math.PI, false);
        return;
      }
      if (corner < 0.9) {
        context.moveTo(x, y);
        context.arc(x, y, w, 0, Math.PI, false);
        return;
      }
      if (corner < 0.95) {
        context.moveTo(x, y + h);
        context.arc(x, y + h, w, 1.5 * Math.PI, 0.5 * Math.PI, false);
        return;
      }
      if (corner < 1) {
        context.moveTo(x + w, y + h);
        context.arc(x + w, y + h, w, 1.5 * Math.PI, 0.5 * Math.PI, false);
        return;
      }
    }

    points.forEach(data => {
      const { position: [x, y], w, h } = data;

      context.beginPath();
      context.fillStyle = data.color;
      drawArc(x, y, w, h);
      context.fill();
    });
  };
};
