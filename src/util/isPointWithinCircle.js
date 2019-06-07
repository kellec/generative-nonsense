const isPointWithinCircle = (point, circleMask) => {
  var a = point.radius + circleMask.radius;
  var x = point.x - circleMask.x;
  var y = point.y - circleMask.y;

  return a >= Math.sqrt(x * x + y * y);
};

module.exports = isPointWithinCircle;
