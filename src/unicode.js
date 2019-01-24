const canvasSketch = require("canvas-sketch");
const { lerp } = require("canvas-sketch-util/math");
const random = require("canvas-sketch-util/random");
const palettes = require("nice-color-palettes");

const settings = {
  dimensions: [2048, 2048]
};

// 358853
// 329560

random.setSeed(random.getRandomSeed());
console.log(random.getSeed());

function createGrid(palette) {
  const points = [];
  const count = 50;

  for (let x = 0; x < count; x++) {
    for (let y = 0; y < count; y++) {
      const u = count <= 1 ? 0.5 : x / (count - 1);
      const v = count <= 1 ? 0.5 : y / (count - 1);
      points.push({
        color: random.pick(palette),
        position: [u, v],
        rotation: Math.abs(random.noise2D(u, v)),
        radius: Math.abs(random.noise2D(u, v)) * 0.2
      });
    }
  }

  return points;
}

const sketch = () => {
  const colorCount = random.rangeFloor(3, 6);
  const palette = random.shuffle(random.pick(palettes).slice(0, colorCount));

  // random.setSeed(567);
  const points = createGrid(palette).filter(() => random.gaussian() >= 0.5);
  const margin = 400;

  return ({ context, width, height }) => {
    context.fillStyle = random.pick(palette);
    context.fillRect(0, 0, width, height);

    points.forEach(data => {
      const { position: [u, v], color, radius, rotation } = data;
      const x = lerp(margin, width - margin, u);
      const y = lerp(margin, height - margin, v);

      context.save();
      context.fillStyle = color;
      context.font = `${radius * width}px 'Open Sans'`;
      context.translate(x, y);
      context.rotate(rotation);
      context.fillText("=", 0, 0);
      context.restore();
    });
  };
};

canvasSketch(sketch, settings);
