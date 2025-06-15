
import { useRef, useState, useCallback } from 'react';
import { Point, DrawingPath } from '@/types/drawing';
import { setupCanvas, drawPath, getEventPoint } from '@/utils/canvasUtils';
import { saveDrawingOperation } from '@/services/drawingOperations';
import { useToast } from '@/hooks/use-toast';

export const useDrawingCanvas = (canvasId: string) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentTool, setCurrentTool] = useState<'draw' | 'erase'>('draw');
  const [currentPath, setCurrentPath] = useState<Point[]>([]);
  const ownOperationIdsRef = useRef<Set<string>>(new Set());
  const { toast } = useToast();

  const getCanvasContext = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    return canvas.getContext('2d');
  }, []);

  const handleSetupCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setupCanvas(canvas);
  }, []);

  const handleDrawPath = useCallback((path: DrawingPath) => {
    const ctx = getCanvasContext();
    if (!ctx) return;
    drawPath(ctx, path);
  }, [getCanvasContext]);

  const handleSaveDrawingOperation = useCallback(async (path: DrawingPath) => {
    try {
      const data = await saveDrawingOperation(canvasId, path);
      
      // Track this operation as our own using ref to avoid re-subscription issues
      if (data) {
        ownOperationIdsRef.current.add(data.id);
      }
    } catch (error) {
      console.error('Failed to save drawing operation:', error);
      toast({
        title: "Error",
        description: "Failed to save drawing operation",
        variant: "destructive"
      });
    }
  }, [canvasId, toast]);

  const handleMouseDown = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    setIsDrawing(true);
    const point = getEventPoint(event, canvas);
    setCurrentPath([point]);
  }, []);

  const handleMouseMove = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const point = getEventPoint(event, canvas);
    setCurrentPath(prev => {
      const newPath = [...prev, point];
      
      // Draw the current stroke locally for immediate feedback
      const ctx = getCanvasContext();
      if (ctx && prev.length > 0) {
        ctx.beginPath();
        ctx.globalCompositeOperation = currentTool === 'erase' ? 'destination-out' : 'source-over';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = currentTool === 'erase' ? 10 : 2;
        ctx.moveTo(prev[prev.length - 1].x, prev[prev.length - 1].y);
        ctx.lineTo(point.x, point.y);
        ctx.stroke();
      }
      
      return newPath;
    });
  }, [isDrawing, getCanvasContext, currentTool]);

  const handleMouseUp = useCallback(() => {
    if (!isDrawing || currentPath.length < 2) {
      setIsDrawing(false);
      setCurrentPath([]);
      return;
    }

    const path: DrawingPath = {
      points: currentPath,
      type: currentTool,
      timestamp: Date.now()
    };

    // Save to database for real-time sync
    handleSaveDrawingOperation(path);

    setIsDrawing(false);
    setCurrentPath([]);
  }, [isDrawing, currentPath, currentTool, handleSaveDrawingOperation]);

  return {
    canvasRef,
    currentTool,
    setCurrentTool,
    ownOperationIdsRef,
    getCanvasContext,
    handleSetupCanvas,
    handleDrawPath,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp
  };
};
