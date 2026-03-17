export interface SketchEntry {
  id: string;
  name: string;
  slug: string;
  active: boolean;
  wip?: boolean;
}

export const sketches: SketchEntry[] = [
  { id: "001", name: "Not Quite Zig Zags", slug: "zigzags", active: true },
  { id: "002", name: "Zig Zags II", slug: "zigzags2", active: true },
  { id: "003", name: "Petals", slug: "circles", active: false },
  { id: "004", name: "Circle Grid", slug: "circleGrid", active: true },
  { id: "005", name: "Star Charts", slug: "starchart", active: false, wip: true },
  { id: "006", name: "Night Landscape", slug: "nightsky", active: false, wip: true },
  { id: "007", name: "Dispersion", slug: "dispersion", active: true },
  { id: "008", name: "Dispersion II", slug: "dispersion2", active: true },
  { id: "009", name: "Dispersion III", slug: "dispersion3", active: true },
  { id: "010", name: "Random Walk but painterly", slug: "randomWalk", active: true },
  { id: "011", name: "Gordon Walters Tribute", slug: "gordonWaltersKoru", active: true },
  { id: "012", name: "Flare", slug: "flare", active: true },
  { id: "013", name: "Unicode", slug: "unicode", active: false },
];
