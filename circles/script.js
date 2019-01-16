const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

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

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

function randomBetween(min, max) {
  return Math.floor(Math.random() * max) + min;
}

function drawCircle(i, previousCircle) {
  const jitter = randomBetween(30, 100);
  const maybeInvertedXJitter = Math.random() >= 0.5 ? jitter * -1 : jitter;
  const maybeInvertedYJitter = Math.random() >= 0.5 ? jitter * -1 : jitter;
  const r = Math.max(10, previousCircle.r + jitter);
  const x = previousCircle.x + maybeInvertedXJitter;
  const y = previousCircle.y + maybeInvertedYJitter;

  ctx.beginPath();
  ctx.arc(x, y, r, 0, 2 * Math.PI, false);
  ctx.strokeStyle = colours[randomBetween(0, colours.length - 1)];
  ctx.lineWidth = randomBetween(3, 20);
  ctx.filter = `opacity(${randomBetween(25, 80)}%)`;
  ctx.stroke();
}

(function() {
  resize();
  window.addEventListener("resize", resize);
})();

const limit = 500;
const circles = [
  {
    x: canvas.width / 2 + randomBetween(-30, 30),
    y: canvas.height / 2 + randomBetween(-30, 30),
    r: 300 + randomBetween(-200, 100)
  }
];

for (let i = 0; i < limit; i++) {
  drawCircle(i, circles[i - 1] || circles[0]);
}
