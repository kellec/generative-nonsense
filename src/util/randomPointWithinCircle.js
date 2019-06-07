const random = require("canvas-sketch-util/random");

const isPointWithinCircle = (point, circleMask, tolerance = 20) => {
  var a = point.radius + circleMask.radius - tolerance;
  var x = point.x - circleMask.x;
  var y = point.y - circleMask.y;

  return a >= Math.sqrt(x * x + y * y);
};

const randomPointWithinCircle = (
  radius,
  canvasWidth,
  canvasHeight,
  circleMask
) => {
  const point = {
    x: random.range(0, canvasWidth),
    y: random.range(0, canvasHeight),
    radius
  };
  if (isPointWithinCircle(point, circleMask)) return point;

  return randomPointWithinCircle(radius, canvasWidth, canvasHeight, circleMask);
};

module.exports = randomPointWithinCircle;
