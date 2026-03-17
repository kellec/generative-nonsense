import colorContrast from "color-contrast";

export const splitPalette = (palette: string[]): { background: string; palette: string[] } => {
  const maxContrast = true;
  let bestContrastIndex = 0;
  let bestContrast = maxContrast ? -Infinity : Infinity;
  for (let i = 0; i < palette.length; i++) {
    const a = palette[i];
    let sum = 0;
    for (let j = 0; j < palette.length; j++) {
      const b = palette[j];
      if (a === b) continue;
      sum += colorContrast(a, b);
    }
    if (maxContrast ? sum > bestContrast : sum < bestContrast) {
      bestContrast = sum;
      bestContrastIndex = i;
    }
  }
  const colors = palette.slice();
  const background = colors.splice(bestContrastIndex, 1)[0];
  return {
    background,
    palette: colors
  };
};
