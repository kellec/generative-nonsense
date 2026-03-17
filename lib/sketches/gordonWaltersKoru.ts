import random from "canvas-sketch-util/random";
import palettes from "nice-color-palettes";
import type { SketchSettings, SketchFn } from "../types";

export const settings: SketchSettings = {
  dimensions: [2048, 2048]
};

export const sketch: SketchFn = () => {
  random.setSeed(random.getRandomSeed());

  const colorCount = 2;
  const palette = random.shuffle(random.pick(palettes).slice(0, colorCount));

  const createGrid = (canvasWidth: number, canvasHeight: number, count: number, margin: number) => {
    const gridHeight = canvasHeight - margin * 2;
    const gridWidth = canvasWidth - margin * 2;
    const rows: {
      x: number;
      y: number;
      width: number;
      height: number;
      backgroundColor: string;
      squares: { position: [number, number]; w: number; circle: boolean }[];
    }[] = [];

    for (let rowIndex = 0; rowIndex < count; rowIndex++) {
      const row = {
        x: Math.ceil(margin),
        y: Math.ceil(margin + rowIndex * gridHeight / count),
        width: Math.ceil(gridWidth),
        height: Math.ceil(gridHeight / count),
        backgroundColor: rowIndex % 2 ? palette[0] : palette[1],
        squares: [] as { position: [number, number]; w: number; circle: boolean }[]
      };

      for (let columnIndex = 0; columnIndex < count; columnIndex++) {
        row.squares.push({
          position: [
            Math.ceil(margin + gridWidth / count * columnIndex),
            Math.ceil(margin + gridHeight / count * rowIndex)
          ],
          w: Math.ceil(gridWidth / count),
          circle: random.value() > 0.8
        });
      }
      rows.push(row);
    }

    return rows;
  };

  return ({ context, width, height }) => {
    const count = 8;
    const numberOfFauxRows = count * 4 + 2;
    const margin = height / numberOfFauxRows;
    const points = createGrid(width, height, count, margin);

    context.fillStyle = "white";
    context.fillRect(0, 0, width, height);

    for (let i = 0; i < numberOfFauxRows; i++) {
      context.beginPath();
      context.fillStyle = i % 2 ? palette[0] : palette[1];
      context.rect(0, i * margin, width, margin);
      context.fill();
    }

    points.forEach(row => {
      row.squares.forEach(point => {
        const { position: [x, y], w, circle } = point;
        context.beginPath();
        if (circle) {
          const quarter = w / 4;
          const radius = quarter - 10;
          const rowIdx = Math.round(random.range(1, 3));
          const rowOffset = rowIdx * quarter;
          context.beginPath();
          context.fillStyle = rowIdx % 2 ? palette[1] : palette[0];
          context.rect(x + quarter, y + rowOffset, w / 2, w / 2);
          context.fill();

          context.beginPath();
          context.fillStyle = rowIdx % 2 ? palette[0] : palette[1];
          context.arc(
            x + quarter,
            y + quarter + rowOffset + 10,
            radius,
            0,
            2 * Math.PI
          );
          context.arc(
            x + quarter * 3,
            y + quarter + rowOffset + 10,
            radius,
            0,
            2 * Math.PI
          );

          context.fill();
        }
      });
    });
  };
};
