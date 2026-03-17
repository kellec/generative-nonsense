import random from "canvas-sketch-util/random";
import palettes from "nice-color-palettes";
import type { SketchSettings, SketchFn } from "../types";

export const settings: SketchSettings = {
  dimensions: [2048, 2048]
};

export const sketch: SketchFn = () => {
  random.setSeed(random.getRandomSeed());

  const generate = (canvasWidth: number, lineWidth: number) => {
    const lines: { startX: number; startY: number; endX: number; endY: number }[] = [];
    const count = 20;
    const offset = canvasWidth / count + lineWidth;

    for (let x = 0; x <= count; x++) {
      for (let y = 0; y <= count; y++) {
        const rando = random.value();
        if (rando < 0.3) {
          lines.push({
            startX: x * offset,
            startY: y * offset,
            endX: x * offset + offset,
            endY: y * offset + offset
          });
        } else if (rando < 0.6) {
          lines.push({
            startX: x * offset + offset,
            startY: y * offset,
            endX: x * offset,
            endY: y * offset
          });
        } else if (rando < 0.8) {
          lines.push({
            startX: x * offset,
            startY: y * offset + offset,
            endX: x * offset,
            endY: y * offset
          });
        } else {
          lines.push({
            startX: x * offset + offset,
            startY: y * offset,
            endX: x * offset,
            endY: y * offset + offset
          });
        }
      }
    }

    return lines.filter(() => random.value() > 0.25);
  };

  const colorCount = random.rangeFloor(3, 6);
  const palette = random.shuffle(random.pick(palettes));
  const background = palette[0];
  const colors = palette.slice(1, colorCount);
  const lineWidth = 30;

  return ({ context, width, height }) => {
    context.fillStyle = background;
    context.fillRect(0, 0, width, height);
    context.lineCap = "round";
    context.lineWidth = lineWidth;

    const lines = generate(width, lineWidth);

    context.translate(-lineWidth, -lineWidth);

    lines.forEach(line => {
      context.beginPath();
      context.moveTo(line.startX, line.startY);
      context.lineTo(line.endX, line.endY);
      context.strokeStyle = random.pick(colors);
      context.stroke();
    });
  };
};
