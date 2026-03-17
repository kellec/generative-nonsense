import random from "canvas-sketch-util/random";
import palettes from "nice-color-palettes";
import type { SketchSettings, SketchFn } from "../types";

export const settings: SketchSettings = {
  dimensions: [2048, 2048]
};

export const sketch: SketchFn = () => {
  random.setSeed(random.getRandomSeed());

  const palette = random.pick(palettes);

  function createCircles(width: number, height: number) {
    const circles: { r: number; color: string; x: number; y: number }[] = [];
    const count = 18;

    for (let i = 0; i < count; i++) {
      const previousCircle = circles[i - 1] || { x: undefined, y: undefined };
      const x = previousCircle.x || width / 2;
      const y = previousCircle.y || height / 2;

      circles.push({
        r: Math.abs(random.noise2D(x, y)) * width / 3,
        color: random.pick(palette),
        x: x + random.gaussian() * width / 20,
        y: y + random.gaussian() * width / 20
      });
    }

    return circles;
  }

  return ({ context, width, height }) => {
    context.fillStyle = "white";
    context.fillRect(0, 0, width, height);

    const circles = createCircles(width, height);

    circles.forEach(circle => {
      context.beginPath();
      context.arc(circle.x, circle.y, circle.r, 0, 2 * Math.PI, false);
      context.fillStyle = circle.color;
      context.lineWidth = random.rangeFloor(3, 20);
      context.filter = `opacity(${random.rangeFloor(25, 70)}%)`;
      context.fill();
    });
  };
};
