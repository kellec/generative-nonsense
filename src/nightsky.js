const canvasSketch = require("canvas-sketch");

const settings = {
  dimensions: [2048, 1024]
};

function randomBetween(min, max) {
  return Math.round(Math.random() * (max - min) + min);
}

const sketch = () => {
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

    function randomStarWithinMap(radius) {
      return {
        x: randomBetween(0, width),
        y: randomBetween(0, height),
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
        y: randomBetween(0, height),
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
      const x = randomBetween(200, width - 200);
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
      const gradient = context.createLinearGradient(
        width / 2,
        0,
        width / 2,
        height
      );

      gradient.addColorStop(0, "#1c202c");
      gradient.addColorStop(0.5, "#263560");
      gradient.addColorStop(1, "#495778");

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
        randomBetween(100, x / 4), // circle1 r
        x, // circle2 x
        y, // circle2 y
        r
      );

      gradient.addColorStop(0, "rgba(127, 100, 140, 0.5");
      gradient.addColorStop(randomBetween(3, 7) / 10, "rgba(127, 100, 140, 0");
      context.fillStyle = gradient;
      context.fillRect(0, 0, width, height);
    }

    function horizon() {
      const baseHorizonY = height / 3 * 2;
      const horizonMaxOffsetTop = baseHorizonY - height / 20;
      const horizonMaxOffsetBottom = baseHorizonY + height / 20;
      const numberOfPeaks = randomBetween(8, 18);
      const averagePeakWidth = width / numberOfPeaks;

      const gradient = context.createLinearGradient(
        width / 2,
        horizonMaxOffsetTop,
        width / 2,
        height
      );

      // Add three color stops
      gradient.addColorStop(0, "#22273d");
      gradient.addColorStop(1, "#343d5e");

      context.fillStyle = gradient;
      context.moveTo(0, height);

      for (let x = 0; x <= width + averagePeakWidth; x += averagePeakWidth) {
        context.lineTo(
          x,
          randomBetween(horizonMaxOffsetTop, horizonMaxOffsetBottom)
        );
      }

      context.lineTo(width, height);
      context.fill();
    }

    backgroundGradient();
    accent();
    backgroundStars();
    milkyway();
    horizon();
  };
};

canvasSketch(sketch, settings);
