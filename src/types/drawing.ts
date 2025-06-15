
export interface Point {
  x: number;
  y: number;
  [key: string]: any;
}

export interface DrawingPath {
  points: Point[];
  type: 'draw' | 'erase';
  timestamp: number;
}

export interface PathData {
  points: Point[];
  timestamp: number;
  [key: string]: any;
}

export interface DrawingCanvasProps {
  canvasId: string;
}
