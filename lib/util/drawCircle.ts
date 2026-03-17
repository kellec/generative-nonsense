export const drawCircle = (
  circle: { x: number; y: number; radius: number; color?: string },
  context: CanvasRenderingContext2D
) => {
  context.beginPath();
  if (circle.color) context.fillStyle = circle.color;
  context.arc(circle.x, circle.y, circle.radius, 0, Math.PI * 2);
  context.fill();
};
