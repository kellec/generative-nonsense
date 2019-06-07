const canvasSketch = require("canvas-sketch");
const { lerp } = require("canvas-sketch-util/math");
const random = require("canvas-sketch-util/random");
const palettes = require("nice-color-palettes/1000.json");
const Color = require("color");

const splitPalette = require("./util/splitPalette");
const interpolateColors = require("./util/interpolateColors");
const drawCircle = require("./util/drawCircle");
const isPointWithinCircle = require("./util/isPointWithinCircle");

random.setSeed(random.getRandomSeed());
// console.log(random.getSeed());

const MIN_COLOR_JITTER = -4;
const MAX_COLOR_JITTER = 4;
const MIN_POSITION_JITTER = -0.01;
const MAX_POSITION_JITTER = 0.01;
const PARTICLE_MIN = 30;
const PARTICLE_MAX = 50;
const SPREAD_MIN = -5;
const SPREAD_MAX = 15;
const PROBABILITY_TO_RENDER = 0.2;

const settings = {
  dimensions: "A3",
  pixelsPerInch: 600,
  suffix: `-seed-${random.getSeed()}`
};

const { background, palette } = splitPalette(random.pick(palettes));
const colors = interpolateColors(palette, 50);

const mapVToColor = v => {
  // based on the y position of the particle, pick the nearest colour from
  // our interpolated array of colours + a little bit of noise for texture
  const colorIndex = Math.round(
    lerp(0, colors.length, v) + random.range(MIN_COLOR_JITTER, MAX_COLOR_JITTER)
  );
  // Because of the noise, we can exceed the bounds of the array so max or min it out
  return colors[Math.max(0, Math.min(colorIndex, colors.length))];
};

const generate = () => {
  const count = 500;
  const points = [];
  for (let x = 0; x < count; x++) {
    for (let y = 0; y < count; y++) {
      const u =
        x / (count - 1) +
        random.range(MIN_POSITION_JITTER, MAX_POSITION_JITTER);
      const v =
        y / (count - 1) +
        random.range(MIN_POSITION_JITTER, MAX_POSITION_JITTER);
      const noise = random.noise2D(u, v, 3.8);
      const radius = Math.max(3.5, noise * 11);
      const alpha = random.range(0.9, 0.1);
      const hexColor = mapVToColor(v);
      const color = Color(hexColor);
      const spread = Math.max(
        0,
        Math.round(random.range(PARTICLE_MIN, PARTICLE_MAX) * noise)
      );
      const particles = [];

      // Each poinnt has a trail of particles
      for (let i = 1; i < spread; i++) {
        // for each sub-particle on the trail randomly offset it with an index modifier
        const offset =
          random.range(SPREAD_MIN - i / spread, SPREAD_MAX + i / spread) *
          (i / 400);

        particles.push({
          u,
          v: v + offset,
          highlight: random.value() > 0.5 ? color.lighten(0.5) : false,
          radius: Math.max(0.3, radius - radius / spread * i),
          color: color
            .rgb()
            .fade(alpha)
            .toString()
        });
      }

      points.push({
        u,
        v,
        spread: 10,
        color,
        radius,
        particles,
        offset: random.range(-5, 5)
      });
    }
  }

  return points;
};

const margin = 10;
const points = generate().filter(() => random.value() < PROBABILITY_TO_RENDER);
const sketch = () => {
  return ({ context, width, height }) => {
    const circleMaskRadius = width / 3;
    const circleMask = {
      x: width / 2,
      y: height / 3,
      radius: circleMaskRadius
    };
    context.fillStyle = background;
    context.fillRect(0, 0, width, height);

    points.forEach(point => {
      const circle = {
        x: lerp(margin, width - margin, point.u),
        y: lerp(margin, width - margin, point.v),
        radius: point.radius,
        color: point.color
      };
      if (isPointWithinCircle(circle, circleMask)) {
        drawCircle(circle, context);
        point.particles.forEach(particle => {
          const x = lerp(margin, width - margin, particle.u);
          const y = lerp(margin, width - margin, particle.v);
          const particleCircle = {
            x,
            y,
            radius: particle.radius,
            color: particle.color
          };

          drawCircle(particleCircle, context);
          if (particle.highlight) {
            context.beginPath();
            context.fillStyle = particle.highlight;
            context.arc(x, y + length, particle.radius / 2, 0, Math.PI * 2);
            context.fill();
          }
        });
      }
    });
  };
};

canvasSketch(sketch, settings);
