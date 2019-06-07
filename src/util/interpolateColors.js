const lerpColor = require("./lerpHexColor");

module.exports = (palette, steps) => {
  const stepsBetweenColours = (steps - palette.length) / (palette.length - 1);
  const colors = [];

  for (let color = 0; color < palette.length; color++) {
    colors.push(palette[color]);
    if (!palette[color + 1]) break;
    for (let step = 0; step < stepsBetweenColours; step++) {
      const newColor = lerpColor(
        palette[color],
        palette[color + 1],
        step / stepsBetweenColours
      );
      colors.push(newColor);
    }
  }

  return colors;
};
