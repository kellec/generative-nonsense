const canvasSketch = require("canvas-sketch");
const random = require("canvas-sketch-util/random");

random.setSeed(random.getRandomSeed());
// console.log(random.getSeed());

const settings = {
  dimensions: [2048, 2048],
  suffix: `-seed-${random.getSeed()}`
};

const decideIfCircle = (rowSquares, count, rowIndex, columnIndex, rowAbove) => {
  // don't be on the first or last, top or bottom
  if (
    rowIndex === 0 ||
    rowIndex === count - 1 ||
    columnIndex < 2 ||
    columnIndex > count - 3
  )
    return false;

  const previousSquare = rowIndex[columnIndex - 1] || {};
  const previousPreviousSquare = rowIndex[columnIndex - 2] || {};

  if (
    previousSquare.circle ||
    previousSquare.skip ||
    previousSquare.cap ||
    previousPreviousSquare.circle ||
    previousPreviousSquare.skip ||
    previousPreviousSquare.cap
  )
    return false;

  const rowAboveSquare = (rowAbove && rowAbove.squares[columnIndex]) || {};
  const rowAbovePreviousSquare =
    (rowAbove && rowAbove.squares[columnIndex - 1]) || {};
  if (
    rowAboveSquare.circle ||
    rowAboveSquare.skip ||
    rowAboveSquare.cap ||
    rowAbovePreviousSquare.circle ||
    rowAbovePreviousSquare.skip ||
    rowAbovePreviousSquare.cap
  )
    return false;
  return random.value() > 0.95;
};

const decideIfSkipped = (rowSquares, columnIndex) => {
  return rowSquares[columnIndex - 1] && rowSquares[columnIndex - 1].circle;
};

const decideIfCapped = (rowSquares, columnIndex) => {
  return rowSquares[columnIndex - 1] && rowSquares[columnIndex - 1].skip;
};

const decideIfBuffer = (rowSquares, columnIndex) => {
  return rowSquares[columnIndex - 1] && rowSquares[columnIndex - 1].cap;
};

const createGrid = (gridWidth, gridHeight, offsetX, offsetY) => {
  const count = 20;
  const rows = [];

  for (let rowIndex = 0; rowIndex < count; rowIndex++) {
    const row = {
      x: Math.ceil(offsetX),
      y: Math.ceil(offsetY + rowIndex * gridHeight / count),
      width: Math.ceil(gridWidth),
      height: Math.ceil(gridHeight / count),
      backgroundColor: rowIndex % 2 ? "lightblue" : "black",
      squares: []
    };

    for (let columnIndex = 0; columnIndex < count; columnIndex++) {
      row.squares.push({
        position: [
          Math.ceil(offsetX + gridWidth / count * columnIndex),
          Math.ceil(offsetY + gridHeight / count * rowIndex)
        ],
        w: Math.ceil(gridWidth / count),
        h: Math.ceil(gridHeight / count),
        color: rowIndex % 2 ? "black" : "lightblue",
        circle: decideIfCircle(
          row.squares,
          count,
          rowIndex,
          columnIndex,
          rows[rowIndex - 1]
        ),
        skip: decideIfSkipped(row.squares, columnIndex),
        cap: decideIfCapped(row.squares, columnIndex)
      });
    }
    rows.push(row);
  }

  return rows;
};

const sketch = () => {
  const margin = 100;
  return ({ context, width, height }) => {
    const croppedWidth = width - margin * 2;
    const croppedHeight = height - margin * 2;
    const points = createGrid(croppedWidth, croppedHeight, margin, margin);

    context.fillStyle = "white";
    context.fillRect(0, 0, width, height);
    points.forEach(row => {
      context.beginPath();
      context.fillStyle = row.backgroundColor;
      context.rect(row.x, row.y, row.width, row.height);
      context.fill();
      row.squares.forEach(point => {
        const { position: [x, y], w, h, color, circle, cap, skip } = point;
        if (!skip) {
          context.beginPath();
          context.fillStyle = color;
          if (circle) context.arc(x, y + 10, w - 10, 0, 2 * Math.PI);
          if (!circle && !cap) context.rect(x, y, w, h);
          if (cap) {
            context.rect(x, y, w, h);
            context.arc(x, y + 10, w - 10, 0, 2 * Math.PI);
          }
          context.fill();
        }
      });
    });
  };
};

canvasSketch(sketch, settings);
