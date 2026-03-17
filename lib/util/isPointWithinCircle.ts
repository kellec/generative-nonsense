interface Point {
  x: number;
  y: number;
  radius: number;
}

export const isPointWithinCircle = (point: Point, circleMask: Point): boolean => {
  const a = point.radius + circleMask.radius;
  const x = point.x - circleMask.x;
  const y = point.y - circleMask.y;

  return a >= Math.sqrt(x * x + y * y);
};
