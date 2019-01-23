const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

function resize() {
  canvas.width = window.innerWidth - 50;
  canvas.height = window.innerHeight - 50;
}

(function() {
  resize();
  window.addEventListener("resize", resize);
})();

function randomBetween(min, max) {
  return Math.round(Math.random() * (max - min) + min);
}

function drawCircleAsDiamond({ x, y, radius }, fill) {
  ctx.beginPath();
  ctx.fillStyle = fill;
  ctx.moveTo(x - radius, y);
  ctx.lineTo(x, y - radius);
  ctx.lineTo(x + radius, y);
  ctx.lineTo(x, y + radius);
  ctx.fill();
}

function randomStarWithinMap(radius) {
  return {
    x: randomBetween(0, canvas.width),
    y: randomBetween(0, canvas.height),
    radius
  };
}

function gaussianRand() {
  var rand = 0;

  for (var i = 0; i < 6; i += 1) {
    rand += Math.random();
  }

  return rand / 6;
}

function randomStarJitteredXAxis(radius, x, spread) {
  const clusteredSpread = gaussianRand();
  return {
    x: randomBetween(
      x - spread * clusteredSpread,
      x + spread * clusteredSpread
    ),
    y: randomBetween(0, canvas.height),
    radius
  };
}

function backgroundStars() {
  const bgStars = randomBetween(200, 400);
  for (let i = 0; i < bgStars; i++) {
    const star = randomStarWithinMap(randomBetween(3, 5));
    drawCircleAsDiamond(
      star,
      `rgba(255, 250, 240, ${randomBetween(5, 9) / 10}`
    );
  }
}

// TODO: better
function milkyway() {
  const x = randomBetween(200, canvas.width - 200);
  const cluster = randomBetween(500, 1000);
  for (let i = 0; i < cluster; i++) {
    const star = randomStarJitteredXAxis(randomBetween(3, 5), x, 500);
    drawCircleAsDiamond(
      star,
      `rgba(255, 250, 240, ${randomBetween(5, 9) / 10}`
    );
  }

  for (let i = 0; i < cluster; i++) {
    const star = randomStarJitteredXAxis(randomBetween(3, 5), x, 200);
    drawCircleAsDiamond(
      star,
      `rgba(255, 250, 240, ${randomBetween(5, 9) / 10}`
    );
  }
}

function backgroundGradient() {
  const gradient = ctx.createLinearGradient(
    canvas.width / 2,
    0,
    canvas.width / 2,
    canvas.height
  );

  gradient.addColorStop(0, "#1c202c");
  gradient.addColorStop(0.5, "#263560");
  gradient.addColorStop(1, "#495778");

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function accent() {
  const x = canvas.width / 2;
  const y = canvas.height / 6 * 5;
  const r = x;
  const gradient = ctx.createRadialGradient(
    x, // circle1 x
    y, // circle1 y
    randomBetween(100, x / 4), // circle1 r
    x, // circle2 x
    y, // circle2 y
    r
  );

  gradient.addColorStop(0, "rgba(127, 100, 140, 0.5");
  gradient.addColorStop(randomBetween(3, 7) / 10, "rgba(127, 100, 140, 0");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function horizon() {
  const baseHorizonY = canvas.height / 3 * 2;
  const horizonMaxOffsetTop = baseHorizonY - canvas.height / 20;
  const horizonMaxOffsetBottom = baseHorizonY + canvas.height / 20;
  const numberOfPeaks = randomBetween(8, 18);
  const averagePeakWidth = canvas.width / numberOfPeaks;

  const gradient = ctx.createLinearGradient(
    canvas.width / 2,
    horizonMaxOffsetTop,
    canvas.width / 2,
    canvas.height
  );

  // Add three color stops
  gradient.addColorStop(0, "#22273d");
  gradient.addColorStop(1, "#343d5e");

  ctx.fillStyle = gradient;
  ctx.moveTo(0, canvas.height);

  for (let x = 0; x <= canvas.width + averagePeakWidth; x += averagePeakWidth) {
    ctx.lineTo(x, randomBetween(horizonMaxOffsetTop, horizonMaxOffsetBottom));
  }

  ctx.lineTo(canvas.width, canvas.height);
  ctx.fill();
}

backgroundGradient();
accent();
backgroundStars();
milkyway();
horizon();
