/**
 * Copyright 2019 Matt DesLauriers
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
const colorContrast = require("color-contrast");

module.exports = palette => {
  const maxContrast = true;
  let bestContrastIndex = 0;
  let bestContrast = maxContrast ? -Infinity : Infinity;
  for (let i = 0; i < palette.length; i++) {
    const a = palette[i];
    let sum = 0;
    // Get the sum of contrasts from this to all others
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
  let colors = palette.slice();
  const background = colors.splice(bestContrastIndex, 1);
  return {
    background,
    palette: colors
  };
};
