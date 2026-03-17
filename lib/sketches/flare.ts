import { lerp } from "canvas-sketch-util/math";
import random from "canvas-sketch-util/random";
import Color from "color";
import type { SketchSettings, SketchFn } from "../types";

export const settings: SketchSettings = {
  dimensions: [2048, 2048]
};

export const sketch: SketchFn = () => {
  random.setSeed(random.getRandomSeed());

  const mainHue = random.range(0, 360);

  return ({ context, width, height }) => {
    const lineWidth = Math.ceil(width / 100);
    const rings = width / lineWidth;

    context.fillStyle = "white";
    context.fillRect(0, 0, width, height);

    for (let i = 0; i < rings; i++) {
      const color = new Color(
        `hsl(${mainHue}, 50%, ${Math.round(lerp(100, 0, i / (rings * 0.55)))}%)`
      );
      context.save();
      context.translate(width / 2, height / 2);
      context.rotate(random.value());
      for (
        let j = 0;
        j < Math.PI * random.range(2, 10);
        j = j + random.range(Math.PI / 8, Math.PI / 100)
      ) {
        context.beginPath();
        context.lineWidth = lineWidth;
        context.strokeStyle = color
          .rotate(random.range(-10, 10))
          .saturate(random.range(-0.2, 0.2))
          .string();
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
