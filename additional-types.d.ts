declare module "nice-color-palettes" {
  const palettes: string[][];
  export default palettes;
}

declare module "nice-color-palettes/1000.json" {
  const palettes: string[][];
  export default palettes;
}

declare module "color-contrast" {
  function colorContrast(a: string, b: string): number;
  export default colorContrast;
}

declare module "hex-to-hsl" {
  function hexToHsl(hex: string): [number, number, number];
  export default hexToHsl;
}
