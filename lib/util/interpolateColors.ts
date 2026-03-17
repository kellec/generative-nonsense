import { lerpHexColor } from "./lerpHexColor";

export const interpolateColors = (palette: string[], steps: number): string[] => {
  const stepsBetweenColours = (steps - palette.length) / (palette.length - 1);
  const colors: string[] = [];

  for (let color = 0; color < palette.length; color++) {
    colors.push(palette[color]);
    if (!palette[color + 1]) break;
    for (let step = 0; step < stepsBetweenColours; step++) {
      const newColor = lerpHexColor(
        palette[color],
        palette[color + 1],
        step / stepsBetweenColours
      );
      colors.push(newColor);
    }
  }

  return colors;
};
