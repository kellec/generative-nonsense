const canvasSketch = require("canvas-sketch");
const { lerp } = require("canvas-sketch-util/math");
const random = require("canvas-sketch-util/random");
const Color = require("color");

// const goodSeeds = [
//   493118,
//   427551,
//   976484,
//   726096,
//   793943,
//   319223,
//   545475,
//   171106,
//   414844,
//   68118,
//   628772
// ];
// random.setSeed(random.pick(goodSeeds));

random.setSeed(random.getRandomSeed());
console.log(random.getSeed());

const settings = {
  dimensions: [2048, 2048],
  suffix: `-seed-${random.getSeed()}`
};
const sketch = () => {
  // const palette = random.shuffle(random.pick(palettes));
  const mainHue = random.range(0, 360);

  return ({ context, width, height }) => {
    const lineWidth = Math.ceil(width / 100);
    const rings = width / lineWidth;

    context.fillStyle = "white";
    context.fillRect(0, 0, width, height);

    for (let i = 0; i < rings; i++) {
      const color = Color(
        `hsl(${mainHue}, 50%, ${Math.round(lerp(100, 0, i / (rings * 0.55)))}%)`
      );
      context.save();
      context.translate(width / 2, height / 2);
      context.rotate(random.value());
      for (
        let j = 0;
        j < Math.PI * random.range(2, 10);
        // j < Math.PI * 2;
        j = j + random.range(Math.PI / 8, Math.PI / 100)
      ) {
        context.beginPath();
        context.lineWidth = lineWidth;
        context.strokeStyle = color
          .rotate(random.range(-10, 10))
          .saturate(random.range(-0.2, 0.2))
          .string();
        context.arc(
          0,
          0,
          Math.max(0, lineWidth * i - 20),
          j,
          j + Math.PI / 8 + 0.05
        );
        context.stroke();
      }
      context.restore();
    }
  };
};

canvasSketch(sketch, settings);
