
import { DrawingPath } from '@/types/drawing';

export const setupCanvas = (canvas: HTMLCanvasElement): CanvasRenderingContext2D | null => {
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  // Set canvas size
  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;

  // Set drawing properties
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.lineWidth = 2;

  return ctx;
};

export const drawPath = (ctx: CanvasRenderingContext2D, path: DrawingPath) => {
  if (path.points.length < 2) return;

  ctx.beginPath();
  ctx.globalCompositeOperation = path.type === 'erase' ? 'destination-out' : 'source-over';
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = path.type === 'erase' ? 10 : 2;

  ctx.moveTo(path.points[0].x, path.points[0].y);
  for (let i = 1; i < path.points.length; i++) {
    ctx.lineTo(path.points[i].x, path.points[i].y);
  }
  ctx.stroke();
};

export const getEventPoint = (event: React.MouseEvent<HTMLCanvasElement>, canvas: HTMLCanvasElement) => {
  const rect = canvas.getBoundingClientRect();
  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top
  };
};
