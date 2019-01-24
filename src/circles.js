const canvasSketch = require("canvas-sketch");

const colours = [
  "#E56981",
  "#DAD9A1",
  "#B7CDA6",
  "#72778D",
  "#5B3A67",
  "#E56981",
  "#DAD9A1",
  "#B7CDA6"
];

function randomBetween(min, max) {
  return Math.round(Math.random() * (max - min) + min);
}

function drawCircle(i, previousCircle, context) {
  const jitter = randomBetween(30, 100);
  const maybeInvertedXJitter = Math.random() >= 0.5 ? jitter * -1 : jitter;
  const maybeInvertedYJitter = Math.random() >= 0.5 ? jitter * -1 : jitter;
  const r = Math.max(10, previousCircle.r + jitter);
  const x = previousCircle.x + maybeInvertedXJitter;
  const y = previousCircle.y + maybeInvertedYJitter;

  context.beginPath();
  context.arc(x, y, r, 0, 2 * Math.PI, false);
  context.strokeStyle = colours[randomBetween(0, colours.length - 1)];
  context.lineWidth = randomBetween(3, 20);
  context.filter = `opacity(${randomBetween(25, 80)}%)`;
  context.stroke();
}

const settings = {
  dimensions: [2048, 2048]
};

const sketch = () => {
  return ({ context, width, height }) => {
    context.fillStyle = "white";
    context.fillRect(0, 0, width, height);

    const limit = 500;
    const circles = [
      {
        x: width / 2 + randomBetween(-30, 30),
        y: height / 2 + randomBetween(-30, 30),
        r: 300 + randomBetween(-200, 100)
      }
    ];

    for (let i = 0; i < limit; i++) {
      drawCircle(i, circles[i - 1] || circles[0], context);
    }
  };
};

canvasSketch(sketch, settings);
