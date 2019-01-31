const canvasSketch = require("canvas-sketch");
const random = require("canvas-sketch-util/random");
const palettes = require("nice-color-palettes");

const goodSeeds = [
  93329,
  5028,
  98293,
  816054,
  102449,
  575738,
  165791,
  609544,
  40808,
  947080,
  799294,
  647391,
  861120,
  846607,
  515460,
  587869
];

// random.setSeed(random.pick(goodSeeds));
random.setSeed(random.getRandomSeed());
console.log(random.getSeed());

const settings = {
  dimensions: [2048, 2048],
  suffix: `-seed-${random.getSeed()}`
};

const colorCount = 2;
const palette = random.shuffle(random.pick(palettes).slice(0, colorCount));

const createGrid = (canvasWidth, canvasHeight, count, margin) => {
  const gridHeight = canvasHeight - margin * 2;
  const gridWidth = canvasWidth - margin * 2;
  const rows = [];

  for (let rowIndex = 0; rowIndex < count; rowIndex++) {
    const row = {
      x: Math.ceil(margin),
      y: Math.ceil(margin + rowIndex * gridHeight / count),
      width: Math.ceil(gridWidth),
      height: Math.ceil(gridHeight / count),
      backgroundColor: rowIndex % 2 ? palette[0] : palette[1],
      squares: []
    };

    for (let columnIndex = 0; columnIndex < count; columnIndex++) {
      row.squares.push({
        position: [
          Math.ceil(margin + gridWidth / count * columnIndex),
          Math.ceil(margin + gridHeight / count * rowIndex)
        ],
        w: Math.ceil(gridWidth / count),
        circle: random.value() > 0.8
      });
    }
    rows.push(row);
  }

  return rows;
};

const sketch = () => {
  return ({ context, width, height }) => {
    const count = 8;
    const numberOfFauxRows = count * 4 + 2;
    const margin = height / numberOfFauxRows;
    const points = createGrid(width, height, count, margin);

    context.fillStyle = "white";
    context.fillRect(0, 0, width, height);

    for (let i = 0; i < numberOfFauxRows; i++) {
      context.beginPath();
      context.fillStyle = i % 2 ? palette[0] : palette[1];
      context.rect(0, i * margin, width, margin);
      context.fill();
    }

    points.forEach(row => {
      row.squares.forEach(point => {
        const { position: [x, y], w, color, circle } = point;
        context.beginPath();
        context.fillStyle = color;
        if (circle) {
          const quarter = w / 4;
          const radius = quarter - 10;
          const row = Math.round(random.range(1, 3));
          const rowOffset = row * quarter;
          context.beginPath();
          context.fillStyle = row % 2 ? palette[1] : palette[0];
          context.rect(x + quarter, y + rowOffset, w / 2, w / 2);
          context.fill();

          context.beginPath();
          context.fillStyle = row % 2 ? palette[0] : palette[1];
          context.arc(
            x + quarter,
            y + quarter + rowOffset + 10,
            radius,
            0,
            2 * Math.PI
          );
          context.arc(
            x + quarter * 3,
            y + quarter + rowOffset + 10,
            radius,
            0,
            2 * Math.PI
          );

          context.fill();
        }

        // helper grid
        // context.beginPath();
        // context.strokeStyle = "black";
        // context.rect(x, y, w, w);
        // context.stroke();
      });
    });
  };
};

canvasSketch(sketch, settings);
