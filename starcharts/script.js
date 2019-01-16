const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");

const canvasWidth = 1000;
const canvasHeight = 1000;

// paper
context.fillStyle = "floralwhite";
context.fillRect(0, 0, canvasWidth, canvasHeight);

// circle map
const backgroundCircle = {
  x: canvasWidth / 2,
  y: canvasHeight / 2,
  radius: canvasHeight / 2 - 20
};

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

function randomIntBetween(min, max) {
  return Math.round(Math.random() * (max - min) + min);
}

function isCircleWithinMapBounds(circle, tolerance = 20) {
  var a = circle.radius + backgroundCircle.radius - tolerance;
  var x = circle.x - backgroundCircle.x;
  var y = circle.y - backgroundCircle.y;

  return a >= Math.sqrt(x * x + y * y);
}

function drawCircle({ x, y, radius }, fill = "white") {
  context.beginPath();
  context.arc(x, y, radius, 0, 2 * Math.PI);
  context.fillStyle = fill;
  context.fill();
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
    drawCircle(circle, `rgba(255,255,255,${randomIntBetween(2, 7) / 10}`);
  }
}

const directions = ["n", "s", "e", "w"];

function plotConstellationPoint(previousPoint) {
  const jitter = randomIntBetween(25, 50);
  const offset = randomIntBetween(70, 200);
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
      console.log(previousCoords);
      const newCircle = plotConstellationPoint(previousCoords);

      coords.push(newCircle);
      context.beginPath();
      context.moveTo(previousCoords.x, previousCoords.y);
      context.lineTo(newCircle.x, newCircle.y);
      context.strokeStyle = "white";
      context.stroke();
      context.closePath();
    }

    drawCircle(coords[i], "white");
  }
}

backgroundStars();
constellation();
constellation();
