import { inverseLerp } from "canvas-sketch-util/math";
import random from "canvas-sketch-util/random";
import type { SketchSettings, SketchFn } from "../types";

export const settings: SketchSettings = {
  dimensions: [2048, 2048]
};

function isCircleWithinMapBounds(point: { x: number; y: number; radius: number }, circleMask: { x: number; y: number; radius: number }, tolerance = 20) {
  const a = point.radius + circleMask.radius - tolerance;
  const x = point.x - circleMask.x;
  const y = point.y - circleMask.y;

  return a >= Math.sqrt(x * x + y * y);
}

function randomPointWithinCircle(
  radius: number,
  canvasWidth: number,
  canvasHeight: number,
  circleMask: { x: number; y: number; radius: number }
): { x: number; y: number; radius: number } {
  const point = {
    x: random.range(0, canvasWidth),
    y: random.range(0, canvasHeight),
    radius
  };
  if (isCircleWithinMapBounds(point, circleMask)) return point;

  return randomPointWithinCircle(radius, canvasWidth, canvasHeight, circleMask);
}

function drawCircle(point: { x: number; y: number; radius: number }, context: CanvasRenderingContext2D) {
  context.beginPath();
  context.arc(point.x, point.y, point.radius, 0, Math.PI * 2);
  context.fill();
}

export const sketch: SketchFn = () => {
  random.setSeed(random.getRandomSeed());

  const generate = (width: number, height: number, circleMask: { x: number; y: number; radius: number }) => {
    const density = 0.5;
    const particleCount = width * density;
    const particles: { circle: { x: number; y: number; radius: number }; cluster: number }[] = [];

    while (particles.length < particleCount) {
      const circle = randomPointWithinCircle(1, width, height, circleMask);
      const noise =
        random.noise2D(
          circle.x / particleCount - 1,
          circle.y / particleCount - 1
        ) * 500;
      particles.push({
        circle,
        cluster: Math.max(
          random.range(1, 40),
          Math.round(inverseLerp(-1, 1, noise))
        )
      });
    }

    return particles;
  };

  return ({ context, width, height }) => {
    context.fillStyle = "black";
    context.fillRect(0, 0, width, height);

    const circleMask = { x: width / 2, y: height / 2, radius: width / 3 };
    const particles = generate(width, height, circleMask);

    context.fillStyle = "white";
    particles.forEach(p => {
      for (let i = 1; i < p.cluster; i++) {
        const offset = random.range(-3 - i / p.cluster, 1 + i / p.cluster) * i;
        if (p.cluster > 10 || random.value() > 0.5) {
          drawCircle(
            {
              x: p.circle.x + offset,
              y: p.circle.y,
              radius: p.circle.radius
            },
            context
          );
        }
      }
    });
  };
};
