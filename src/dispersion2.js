const canvasSketch = require("canvas-sketch");
const { inverseLerp, lerp } = require("canvas-sketch-util/math");
const random = require("canvas-sketch-util/random");
const palettes = require("nice-color-palettes/1000.json");

const splitPalette = require("./util/splitPalette");
const interpolateColors = require("./util/interpolateColors");
const randomPointWithinCircle = require("./util/randomPointWithinCircle");
const drawCircle = require("./util/drawCircle");

random.setSeed(random.getRandomSeed());
console.log(random.getSeed());

const WIDTH = 4096;
const HEIGHT = 4096;

const settings = {
  dimensions: [WIDTH, HEIGHT],
  suffix: `-seed-${random.getSeed()}`
};

const circleMaskRadius = WIDTH / 3;
const circleMask = {
  x: WIDTH / 2,
  y: HEIGHT / 2,
  radius: circleMaskRadius
};

const { background, palette } = splitPalette(random.pick(palettes));
const colors = interpolateColors(palette, 50);

const CLUSTER_MIN = 20;
const CLUSTER_MAX = 40;
const SPREAD_MIN = -5;
const SPREAD_MAX = 5;
const MIN_COLOR_JITTER = -2;
const MAX_COLOR_JITTER = 2;
const STARTING_RADIUS = 6;
const MIN_DENSITY = 0.5;
const MAX_DENSITY = 0.8;
const PROBABILITY_TO_RENDER = 0.2;

const generate = () => {
  const particleCount = WIDTH / random.range(MIN_DENSITY, MAX_DENSITY);
  const points = [];

  while (points.length < particleCount) {
    const { x, y, radius } = randomPointWithinCircle(
      STARTING_RADIUS,
      WIDTH,
      HEIGHT,
      circleMask
    );

    const noise =
      random.noise2D(x / particleCount - 1, y / particleCount - 1) * 500;
    const cluster = Math.max(
      random.range(CLUSTER_MIN, CLUSTER_MAX),
      Math.round(inverseLerp(-1, 1, noise))
    );

    // based on the y position of the particle, pick the nearest colour from
    // our interpolated array of colours + a little bit of noise for texture
    const colorIndex = Math.round(
      lerp(0, colors.length, y / HEIGHT) +
        random.range(MIN_COLOR_JITTER, MAX_COLOR_JITTER)
    );
    const color = colors[Math.max(0, Math.min(colorIndex, colors.length))];

    const particles = [];

    // Each poinnt has a trail of particles
    for (let i = 1; i < cluster; i++) {
      // for each sub-particle on the trail randomly offset it with an index modifier
      const offset =
        random.range(SPREAD_MIN - i / cluster, SPREAD_MAX + i / cluster) * i;

      particles.push({
        x: x + offset,
        y,
        radius: Math.max(0.3, radius - radius / cluster * i),
        color: color
      });
    }

    points.push({
      x,
      y,
      radius,
      offset: random.range(SPREAD_MIN / cluster, SPREAD_MAX / cluster),
      particles,
      color
    });
  }

  return points;
};

const points = generate(WIDTH, HEIGHT, circleMask).filter(
  () => random.value() < PROBABILITY_TO_RENDER
);

const sketch = () => {
  return ({ context, width, height }) => {
    context.fillStyle = background;
    context.fillRect(0, 0, width, height);

    points.forEach(point => {
      point.particles.forEach(particle => {
        drawCircle(particle, context);
      });
    });
  };
};

canvasSketch(sketch, settings);
