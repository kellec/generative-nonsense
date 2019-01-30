const canvasSketch = require("canvas-sketch");
const random = require("canvas-sketch-util/random");
const palettes = require("nice-color-palettes");
const hexToHsl = require("hex-to-hsl");

const canvasWidth = 2048;
const canvasHeight = 2048;
const stepLength = 10;
const numberOfParticles = 100;

random.setSeed(random.getRandomSeed());
// console.log(random.getSeed());

const settings = {
  animate: true,
  dimensions: [canvasWidth, canvasHeight]
};

function hexToHsla(hex, a = 1) {
  const hsl = hexToHsl(hex);
  return `hsla(${hsl[0]}, ${hsl[1]}%, ${hsl[2]}%, ${a})`;
}

const palette = random.shuffle(random.pick(palettes));
const background = palette[0];
const colors = palette.slice(1, palette.length);

const draw = (context, wanderer) => {
  context.beginPath();
  context.strokeStyle = hexToHsla(wanderer.color, random.range(0.01, 0.2));
  context.lineWidth = random.range(3, 20);
  context.moveTo(wanderer.prevX, wanderer.prevY);
  context.lineTo(wanderer.x, wanderer.y);
  context.stroke();
};

function pointsHorizontalLine() {
  const particles = [];
  const y = random.range(canvasHeight / 8, canvasHeight - canvasHeight / 8);
  for (let i = 0; i < numberOfParticles; i++) {
    const startX = i * canvasWidth / numberOfParticles;
    const startY = y;
    particles.push(new Wanderer(startX, startY));
  }
  return particles;
}

function pointsVerticalLine() {
  const particles = [];
  const x = random.range(canvasWidth / 8, canvasWidth - canvasWidth / 8);
  for (let i = 0; i < numberOfParticles; i++) {
    const startX = x;
    const startY = i * canvasHeight / numberOfParticles;
    particles.push(new Wanderer(startX, startY));
  }
  return particles;
}

function pointsCircle() {
  const particles = [];
  const radius = Math.min(canvasWidth, canvasHeight) / 4;
  for (let i = 0; i < numberOfParticles; i++) {
    const angle = i * 2 * Math.PI / numberOfParticles;
    const startX = canvasWidth / 2 + radius * Math.cos(angle);
    const startY = canvasHeight / 2 + radius * Math.sin(angle);
    particles.push(new Wanderer(startX, startY));
  }
  return particles;
}

const starters = [pointsHorizontalLine, pointsVerticalLine, pointsCircle];

function Wanderer(startX = canvasWidth / 2, startY = canvasHeight / 2) {
  this.x = startX;
  this.y = startY;
  this.prevX = this.x;
  this.prevY = this.y;
  this.color = random.pick(colors);
}

Wanderer.prototype.walk = function() {
  this.prevX = this.x;
  this.prevY = this.y;
  this.x = this.x + random.range(-stepLength, stepLength);
  this.y = this.y + random.range(-stepLength, stepLength);
};

const particles = random.pick(starters)();

const sketch = () => {
  return {
    render: ({ context }) => {
      particles.forEach(p => {
        p.walk();
        draw(context, p);
      });
    },
    begin: ({ context, width, height }) => {
      context.fillStyle = background;
      context.fillRect(0, 0, width, height);
    }
  };
};

canvasSketch(sketch, settings);
