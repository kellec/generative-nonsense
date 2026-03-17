export interface SketchSettings {
  dimensions: [number, number] | string;
  pixelsPerInch?: number;
  animate?: boolean;
  suffix?: string;
}

export interface SketchRenderProps {
  context: CanvasRenderingContext2D;
  width: number;
  height: number;
}

export type SketchRender = (props: SketchRenderProps) => void;

export interface SketchAnimated {
  begin: (props: SketchRenderProps) => void;
  render: (props: SketchRenderProps) => void;
}

export type SketchFn = () => SketchRender | SketchAnimated;
