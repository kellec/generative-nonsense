declare module "canvas-sketch-util/random" {
  export function setSeed(seed: number): void;
  export function getSeed(): number;
  export function getRandomSeed(): number;
  export function value(): number;
  export function range(min: number, max: number): number;
  export function rangeFloor(min: number, max: number): number;
  export function pick<T>(array: T[]): T;
  export function shuffle<T>(array: T[]): T[];
  export function gaussian(): number;
  export function noise2D(x: number, y: number, frequency?: number, amplitude?: number): number;
}

declare module "canvas-sketch-util/math" {
  export function lerp(min: number, max: number, t: number): number;
  export function inverseLerp(min: number, max: number, value: number): number;
}
