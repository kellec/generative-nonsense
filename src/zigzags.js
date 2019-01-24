const canvasSketch = require("canvas-sketch");

const settings = {
  dimensions: [2048, 2048]
};

function randomBetween(min, max) {
  return Math.round(Math.random() * (max - min) + min);
}

const sketch = () => {
  return ({ context, width, height }) => {
    context.fillStyle = "white";
    context.fillRect(0, 0, width, height);

    const colorSeed = Math.random() * 120;
    const gridDivisor = randomBetween(20, 50) + colorSeed / 4;
    const chaosModifier = randomBetween(1, 8) / 100;
    const direction = Math.random() >= 0.5 ? "horizontal" : "vertical";

    function drawLine(start, end, matrix, odd) {
      const chaos = Math.random() >= chaosModifier;
      const invert = chaos ? !odd : odd;

      const startX = invert ? end.x : start.x;
      const startY = start.y;
      const endX = invert ? start.x : end.x;
      const endY = end.y;
      context.beginPath();
      context.moveTo(startX, startY);
      context.lineTo(endX, endY);
      context.lineWidth = 2;
      context.strokeStyle = `hsl(${matrix.j -
        matrix.i +
        colorSeed}, ${Math.ceil(60 - colorSeed / 4)}%, ${40 + colorSeed / 4}%)`;
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
          { i, j },
          odd
        );
      }
    }
  };
};

canvasSketch(sketch, settings);
