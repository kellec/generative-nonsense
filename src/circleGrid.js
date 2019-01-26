const canvasSketch = require("canvas-sketch");
const random = require("canvas-sketch-util/random");
const palettes = require("nice-color-palettes");

// 632231
random.setSeed(random.getRandomSeed());
// console.log(random.getSeed());

const settings = {
  dimensions: [2048, 2048],
  suffix: `-seed-${random.getSeed()}`
};

const createGrid = (gridWidth, gridHeight, offsetX, offsetY, palette) => {
  const count = 10;
  const squares = [];

  for (let i = 0; i < count; i++) {
    for (let j = 0; j < count; j++) {
      squares.push({
        position: [
          Math.ceil(offsetX + gridWidth / count * i),
          Math.ceil(offsetY + gridHeight / count * j)
        ],
        w: Math.ceil(gridWidth / count),
        h: Math.ceil(gridHeight / count),
        color: random.pick(palette),
        stroke: random.pick(palette)
      });
    }
  }

  return squares;
};

const sketch = () => {
  const colorCount = random.rangeFloor(3, 5);
  const palette = random.shuffle(random.pick(palettes).slice(0, colorCount));
  const background = palette.pop();
  const margin = 400;

  return ({ context, width, height }) => {
    const points = createGrid(
      width - margin * 2,
      height - margin * 2,
      margin,
      margin,
      palette
    ).filter(() => random.value() >= 0.2);
    context.fillStyle = background;
    context.fillRect(0, 0, width, height);

    function drawArc(x, y, w, h) {
      const corner = random.value();
      if (corner < 0.2) {
        context.moveTo(x + w, y + h); // bottom right
        context.arc(x + w, y + h, w, 1.5 * Math.PI, Math.PI, true);
        return;
      }
      if (corner < 0.4) {
        context.moveTo(x, y + h); // bottom left
        context.arc(x, y + h, w, 1.5 * Math.PI, 2 * Math.PI, false);
        return;
      }
      if (corner < 0.6) {
        context.moveTo(x, y); // top left
        context.arc(x, y, w, 0, 0.5 * Math.PI, false);
        return;
      }
      if (corner < 0.8) {
        context.moveTo(x + w, y); // top right
        context.arc(x + w, y, w, Math.PI, 0.5 * Math.PI, true);
        return;
      }
      if (corner < 0.85) {
        context.moveTo(x + w, y); // top right
        context.arc(x + w, y, w, 0.5 * Math.PI, 1.5 * Math.PI, false); // 180 degrees
        return;
      }
      if (corner < 0.9) {
        context.moveTo(x, y); // top left
        context.arc(x, y, w, 0, Math.PI, false); // 180 degrees
        return;
      }
      if (corner < 0.95) {
        context.moveTo(x, y + h); // bottom left
        context.arc(x, y + h, w, 1.5 * Math.PI, 0.5 * Math.PI, false); // 180 degrees
        return;
      }
      if (corner < 1) {
        context.moveTo(x + w, y + h); // bottom right
        context.arc(x + w, y + h, w, 1.5 * Math.PI, 0.5 * Math.PI, false); // 180 degrees
        return;
      }
    }

    points.forEach(data => {
      const { position: [x, y], color, w, h } = data;

      context.beginPath();
      context.fillStyle = color;
      drawArc(x, y, w, h);
      context.fill();
    });
  };
};

canvasSketch(sketch, settings);
