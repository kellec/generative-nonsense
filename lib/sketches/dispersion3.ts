import { lerp } from "canvas-sketch-util/math";
import random from "canvas-sketch-util/random";
import palettes from "nice-color-palettes/1000.json";
import Color from "color";
import { splitPalette } from "../util/splitPalette";
import { interpolateColors } from "../util/interpolateColors";
import { drawCircle } from "../util/drawCircle";
import { isPointWithinCircle } from "../util/isPointWithinCircle";
import type { SketchSettings, SketchFn } from "../types";

// A3 at 600 PPI: 297mm × 420mm → 7016 × 9933 pixels
const A3_WIDTH = 7016;
const A3_HEIGHT = 9933;

export const settings: SketchSettings = {
  dimensions: [A3_WIDTH, A3_HEIGHT],
  pixelsPerInch: 600
};

export const sketch: SketchFn = () => {
  random.setSeed(random.getRandomSeed());

  const MIN_COLOR_JITTER = -4;
  const MAX_COLOR_JITTER = 4;
  const MIN_POSITION_JITTER = -0.01;
  const MAX_POSITION_JITTER = 0.01;
  const PARTICLE_MIN = 30;
  const PARTICLE_MAX = 50;
  const SPREAD_MIN = -5;
  const SPREAD_MAX = 15;
  const PROBABILITY_TO_RENDER = 0.2;

  const { background, palette } = splitPalette(random.pick(palettes));
  const colors = interpolateColors(palette, 50);

  const mapVToColor = (v: number) => {
    const colorIndex = Math.round(
      lerp(0, colors.length, v) + random.range(MIN_COLOR_JITTER, MAX_COLOR_JITTER)
    );
    return colors[Math.max(0, Math.min(colorIndex, colors.length))];
  };

  const generate = () => {
    const count = 500;
    const points: {
      u: number;
      v: number;
      spread: number;
      color: InstanceType<typeof Color>;
      radius: number;
      particles: {
        u: number;
        v: number;
        highlight: InstanceType<typeof Color> | false;
        radius: number;
        color: string;
      }[];
      offset: number;
    }[] = [];

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
        const color = new Color(hexColor);
        const spread = Math.max(
          0,
          Math.round(random.range(PARTICLE_MIN, PARTICLE_MAX) * noise)
        );
        const particles: {
          u: number;
          v: number;
          highlight: InstanceType<typeof Color> | false;
          radius: number;
          color: string;
        }[] = [];

        for (let i = 1; i < spread; i++) {
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
        color: point.color.toString()
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
            context.fillStyle = particle.highlight.toString();
            context.arc(x, y, particle.radius / 2, 0, Math.PI * 2);
            context.fill();
          }
        });
      }
    });
  };
};
