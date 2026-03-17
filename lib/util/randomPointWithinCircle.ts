import random from "canvas-sketch-util/random";

interface Point {
  x: number;
  y: number;
  radius: number;
}

const isPointWithinCircle = (point: Point, circleMask: Point, tolerance = 20): boolean => {
  const a = point.radius + circleMask.radius - tolerance;
  const x = point.x - circleMask.x;
  const y = point.y - circleMask.y;

  return a >= Math.sqrt(x * x + y * y);
};

export const randomPointWithinCircle = (
  radius: number,
  canvasWidth: number,
  canvasHeight: number,
  circleMask: Point
): Point => {
  const point: Point = {
    x: random.range(0, canvasWidth),
    y: random.range(0, canvasHeight),
    radius
  };
  if (isPointWithinCircle(point, circleMask)) return point;

  return randomPointWithinCircle(radius, canvasWidth, canvasHeight, circleMask);
};
