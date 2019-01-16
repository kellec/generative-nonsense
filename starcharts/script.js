const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");

const canvasWidth = 1000;
const canvasHeight = 1000;

//THE FLUFF

// paper
context.fillStyle = "floralwhite";
context.fillRect(0, 0, canvasWidth, canvasHeight);

// circle map
const backgroundCircle = {
  x: canvasWidth / 2,
  y: canvasHeight / 2,
  radius: canvasHeight / 2 - 30
};

function randomIntBetween(min, max) {
  return Math.round(Math.random() * (max - min) + min);
}

function isCircleWithinMapBounds(circle, tolerance = 20) {
  var a = circle.radius + backgroundCircle.radius - tolerance;
  var x = circle.x - backgroundCircle.x;
  var y = circle.y - backgroundCircle.y;

  return a >= Math.sqrt(x * x + y * y);
}

function drawCircle(
  { x, y, radius },
  fill = "floralwhite",
  strokeStyle,
  lineWidth = 1
) {
  context.beginPath();
  context.arc(x, y, radius, 0, 2 * Math.PI);
  if (fill) {
    context.fillStyle = fill;
    context.fill();
  }
  if (strokeStyle) {
    context.lineWidth = lineWidth;
    context.strokeStyle = strokeStyle;
    context.stroke();
  }
}

function randomStarWithinMap(radius) {
  const circle = {
    x: randomIntBetween(0, canvasWidth),
    y: randomIntBetween(0, canvasHeight),
    radius
  };
  if (isCircleWithinMapBounds(circle)) return circle;

  return randomStarWithinMap(radius);
}

function backgroundStars() {
  const bgStars = randomIntBetween(180, 300);
  for (let i = 0; i < bgStars; i++) {
    const circle = randomStarWithinMap(randomIntBetween(1, 3));
    drawCircle(circle, `rgba(255, 250, 240, ${randomIntBetween(2, 7) / 10}`);
  }
}

function drawAngledLine(x, y, length, angle) {
  const radians = angle / 180 * Math.PI;
  const endX = x + length * Math.cos(radians);
  const endY = y - length * Math.sin(radians);

  context.beginPath();
  context.moveTo(x, y);
  context.lineTo(endX, endY);
  context.closePath();
  context.stroke();
}

function mapLines() {
  const jitter = randomIntBetween(5, 15);
  const numberOfCircles = randomIntBetween(7, 10);
  const numberOfSegments = randomIntBetween(20, 36);
  for (let i = 0; i < numberOfCircles; i++) {
    context.beginPath();
    context.arc(
      backgroundCircle.x,
      backgroundCircle.y,
      Math.max(1, backgroundCircle.radius - i * (3 + jitter) * numberOfCircles), // TODO Calculate this properly
      0,
      2 * Math.PI
    );
    context.strokeStyle = "#4b5e7e";
    context.stroke();
  }

  for (let j = 0; j < numberOfSegments; j++) {
    drawAngledLine(
      backgroundCircle.x,
      backgroundCircle.y,
      backgroundCircle.radius,
      j * (360 / numberOfSegments)
    );
  }
}

function mapExternalDecoration() {
  for (let i = 0; i < 12; i++) {
    context.strokeStyle = "black";
    drawAngledLine(
      backgroundCircle.x,
      backgroundCircle.y,
      backgroundCircle.radius + 20,
      i * (360 / 12)
    );
  }

  drawCircle(
    {
      x: backgroundCircle.x,
      y: backgroundCircle.y,
      radius: backgroundCircle.radius
    },
    null,
    "black",
    2
  );

  drawCircle(
    {
      x: backgroundCircle.x,
      y: backgroundCircle.y,
      radius: backgroundCircle.radius + 5
    },
    "floralwhite",
    "black"
  );

  drawCircle(
    {
      x: backgroundCircle.x,
      y: backgroundCircle.y,
      radius: backgroundCircle.radius + 20
    },
    null,
    "black",
    3
  );

  drawCircle(
    {
      x: backgroundCircle.x,
      y: backgroundCircle.y,
      radius: backgroundCircle.radius + 25
    },
    null,
    "black"
  );
}

function mapBackground() {
  context.beginPath();
  context.arc(
    backgroundCircle.x,
    backgroundCircle.y,
    backgroundCircle.radius,
    0,
    2 * Math.PI
  );
  var gradient = context.createLinearGradient(20, 0, 1000, 250);
  gradient.addColorStop(0, "#4a6583");
  gradient.addColorStop(1, "#192b43");
  context.fillStyle = gradient;
  context.fill();
  context.closePath();
}

// THE MATH
const directions = ["n", "s", "e", "w"];

function plotConstellationPoint(previousPoint) {
  const jitter = randomIntBetween(25, 50);
  const offset = randomIntBetween(20, 100);
  const radius = randomIntBetween(2, 7);

  let direction = directions[randomIntBetween(0, 3)];
  if (direction === previousPoint.direction)
    direction = directions[randomIntBetween(0, 3)]; // reduce the chance of duplicate directions

  let circle;

  if (direction === "n") {
    circle = {
      x: previousPoint.x + jitter,
      y: previousPoint.y + jitter - offset,
      radius,
      direction
    };
  }

  if (direction === "e") {
    circle = {
      x: previousPoint.x + jitter + offset,
      y: previousPoint.y + jitter,
      radius,
      direction
    };
  }

  if (direction === "s") {
    circle = {
      x: previousPoint.x + jitter,
      y: previousPoint.y + jitter + offset,
      radius,
      direction
    };
  }

  if (direction === "w") {
    circle = {
      x: previousPoint.x + jitter - offset,
      y: previousPoint.y + jitter,
      radius,
      direction
    };
  }

  if (isCircleWithinMapBounds(circle)) return circle;
  return plotConstellationPoint(previousPoint);
}

function constellation() {
  const stars = randomIntBetween(4, 9);
  const coords = [randomStarWithinMap(randomIntBetween(2, 7))];

  for (let i = 0; i <= stars; i++) {
    if (i > 0) {
      const previousCoords = coords[i - 1];
      const newCircle = plotConstellationPoint(previousCoords);

      coords.push(newCircle);
      context.beginPath();
      context.moveTo(previousCoords.x, previousCoords.y);
      context.lineTo(newCircle.x, newCircle.y);
      context.setLineDash([5, 2]);
      context.strokeStyle = "floralwhite";
      context.stroke();
      context.closePath();
    }

    drawCircle(coords[i], "floralwhite");
  }
}

mapExternalDecoration();
mapBackground();
mapLines();
backgroundStars();
constellation();
constellation();
constellation();
constellation();
constellation();
constellation();
