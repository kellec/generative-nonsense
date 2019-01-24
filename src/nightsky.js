const canvasSketch = require("canvas-sketch");
const random = require("canvas-sketch-util/random");

const settings = {
  dimensions: [2048, 1300]
};

function createBackgroundStars(width, height) {
  const stars = [];
  const count = random.rangeFloor(200, 400);

  for (let i = 0; i < count; i++) {
    stars.push({
      x: random.range(0, width),
      y: random.range(0, height),
      radius: random.rangeFloor(3, 5),
      opacity: random.range(5, 9) / 10
    });
  }

  return stars;
}

function createStarCluster(width, height) {
  const stars = [];
  const count = random.rangeFloor(1000, 1500);
  const spread = width / 10;
  const x = random.range(200, width - 200);

  for (let i = 0; i < count; i++) {
    const distribution = random.gaussian();
    stars.push({
      x: random.range(x - spread * distribution, x + spread * distribution),
      y: random.range(0, height / 3 * 2),
      radius: random.rangeFloor(3, 5),
      opacity: random.range(5, 9) / 10
    });
  }
  return stars;
}

function createHills(width, height) {
  const hills = [];
  const count = random.range(2, 4);
  const totalHorizonHeight = height * 0.6;
  const segmentHeigt = totalHorizonHeight / count;

  for (let i = 0; i < count; i++) {
    const points = [];
    const offset = i * segmentHeigt;
    const baseY = totalHorizonHeight + offset;
    const maxOffsetTop = baseY - segmentHeigt / 5;
    const maxOffsetBottom = baseY + segmentHeigt / 5;
    const numberOfPeaks = random.range(8, 18);
    const averagePeakWidth = width / numberOfPeaks;

    for (let x = 0; x <= width + averagePeakWidth; x += averagePeakWidth) {
      points.push({
        x,
        y: random.range(maxOffsetTop, maxOffsetBottom)
      });
    }

    hills.push({ points, top: maxOffsetTop, bottom: baseY + segmentHeigt });
  }
  return hills;
}

const sketch = () => {
  const hue = random.rangeFloor(200, 290); // restrict to blues/purples
  return ({ context, width, height }) => {
    context.fillStyle = "black";
    context.fillRect(0, 0, width, height);

    function drawCircleAsDiamond({ x, y, radius }, fill) {
      context.beginPath();
      context.fillStyle = fill;
      context.moveTo(x - radius, y);
      context.lineTo(x, y - radius);
      context.lineTo(x + radius, y);
      context.lineTo(x, y + radius);
      context.fill();
    }

    function backgroundStars() {
      createBackgroundStars(width, height).forEach(star =>
        drawCircleAsDiamond(
          star,
          `rgba(255, 250, 240, ${random.range(5, 9) / 10})`
        )
      );
    }

    function milkyway() {
      createStarCluster(width, height).forEach(star =>
        drawCircleAsDiamond(
          star,
          `rgba(255, 250, 240, ${random.range(5, 9) / 10})`
        )
      );
    }

    function backgroundGradient() {
      const gradient = context.createLinearGradient(
        width / 2,
        0,
        width / 2,
        height
      );

      gradient.addColorStop(0, `hsl(${hue}, 20%, 10%`);
      gradient.addColorStop(0.5, `hsl(${hue}, 30%, 20%`);
      gradient.addColorStop(1, `hsl(${hue}, 40%, 30%`);

      context.fillStyle = gradient;
      context.fillRect(0, 0, width, height);
    }

    function accent() {
      const x = width / 2;
      const y = height / 6 * 5;
      const r = x;
      const gradient = context.createRadialGradient(
        x, // circle1 x
        y, // circle1 y
        random.range(100, x / 4), // circle1 r
        x, // circle2 x
        y, // circle2 y
        r
      );

      const hue = random.rangeFloor(0, 260);

      gradient.addColorStop(0, `hsla(${hue}, 80%, 80%, 0.5`);
      gradient.addColorStop(
        random.range(3, 7) / 10,
        `hsla(${hue}, 80%, 80%, 0`
      );
      context.fillStyle = gradient;
      context.fillRect(0, 0, width, height);
    }

    function horizon() {
      const hills = createHills(width, height);
      hills.forEach(({ points, top, bottom }) => {
        const gradient = context.createLinearGradient(
          width / 2,
          top,
          width / 2,
          bottom
        );

        gradient.addColorStop(0, `hsl(${hue}, 10%, 10%)`);
        gradient.addColorStop(1, `hsl(${hue}, 10%, 20%)`);

        context.fillStyle = gradient;
        context.beginPath();
        context.moveTo(0, height);
        points.forEach(point => {
          context.lineTo(point.x, point.y);
        });
        context.lineTo(width, height);
        context.fill();
      });
    }

    backgroundGradient();
    accent();
    backgroundStars();
    milkyway();
    horizon();
  };
};

canvasSketch(sketch, settings);
