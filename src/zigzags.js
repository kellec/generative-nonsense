const canvasSketch = require("canvas-sketch");
const random = require("canvas-sketch-util/random");
const palettes = require("nice-color-palettes");

const settings = {
  dimensions: [2048, 2048]
};

const sketch = () => {
  const colorCount = random.rangeFloor(3, 6);
  const palette = random.shuffle(random.pick(palettes));
  const background = palette[0];
  const colors = palette.slice(1, colorCount);

  return ({ context, width, height }) => {
    context.fillStyle = background;
    context.fillRect(0, 0, width, height);
    context.lineCap = "round";

    const gridDivisor = random.range(10, 30);
    const chaosModifier = random.range(1, 8) / 100;
    const direction = Math.random() >= 0.5 ? "horizontal" : "vertical";

    function drawLine(start, end, odd) {
      const chaos = Math.random() >= chaosModifier;
      const invert = chaos ? !odd : odd;

      const startX = invert ? end.x : start.x;
      const startY = start.y;
      const endX = invert ? start.x : end.x;
      const endY = end.y;
      context.beginPath();
      context.moveTo(startX, startY);
      context.lineTo(endX, endY);
      context.lineWidth = gridDivisor * 0.6;
      context.strokeStyle = random.pick(colors);
      context.stroke();
    }

    for (let i = 0; i < gridDivisor; i++) {
      for (let j = 0; j < gridDivisor; j++) {
        const lWidth = height / gridDivisor;
        const lHeight = height / gridDivisor;
        const d = direction === "vertical" ? i : j;
        const odd = !!(d % 2);
        drawLine(
          { x: j * lWidth, y: lHeight * i },
          { x: j * lWidth + lWidth, y: lHeight * i + lHeight },
          odd
        );
      }
    }
  };
};

canvasSketch(sketch, settings);
