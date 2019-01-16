const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const frame = document.getElementById("frame");

const inset = 50;
const height = frame.clientHeight - inset * 2;

canvas.width = height;
canvas.height = height;

function randomIntBetween(min, max) {
  return Math.round(Math.random() * (max - min) + min);
}

const colorSeed = Math.random() * 120;
const gridDivisor = randomIntBetween(20, 50) + colorSeed / 4;
const chaosModifier = randomIntBetween(1, 10) / 100;
const direction = Math.random() >= 0.5 ? "horizontal" : "vertical";

function drawLine(start, end, matrix, odd) {
  const chaos = Math.random() >= chaosModifier;
  const invert = chaos ? !odd : odd;

  const startX = invert ? end.x : start.x;
  const startY = start.y;
  const endX = invert ? start.x : end.x;
  const endY = end.y;
  ctx.beginPath();
  ctx.moveTo(startX, startY);
  ctx.lineTo(endX, endY);
  ctx.lineWidth = 2;
  ctx.strokeStyle = `hsl(${matrix.j - matrix.i + colorSeed}, ${Math.ceil(
    60 - colorSeed / 4
  )}%, ${40 + colorSeed / 4}%)`;
  ctx.stroke();
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
