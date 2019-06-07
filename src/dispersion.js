const canvasSketch = require("canvas-sketch");
const { inverseLerp } = require("canvas-sketch-util/math");
const random = require("canvas-sketch-util/random");

random.setSeed(random.getRandomSeed());
// console.log(random.getSeed());

const settings = {
  dimensions: [2048, 2048],
  suffix: `-seed-${random.getSeed()}`
};

function isCircleWithinMapBounds(point, circleMask, tolerance = 20) {
  var a = point.radius + circleMask.radius - tolerance;
  var x = point.x - circleMask.x;
  var y = point.y - circleMask.y;

  return a >= Math.sqrt(x * x + y * y);
}

function randomPointWithinCircle(
  radius,
  canvasWidth,
  canvasHeight,
  circleMask
) {
  const point = {
    x: random.range(0, canvasWidth),
    y: random.range(0, canvasHeight),
    radius
  };
  if (isCircleWithinMapBounds(point, circleMask)) return point;

  return randomPointWithinCircle(radius, canvasWidth, canvasHeight, circleMask);
}

function drawCircle(point, context) {
  context.beginPath();
  context.arc(point.x, point.y, point.radius, 0, Math.PI * 2);
  context.fill();
}

const generate = (width, height, circleMask) => {
  const density = 0.5;
  const particleCount = width * density;
  const particles = [];

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

const sketch = () => {
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

canvasSketch(sketch, settings);
