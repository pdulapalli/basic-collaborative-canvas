
import React, { useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { DrawingCanvasProps, PathData } from '@/types/drawing';
import { loadExistingDrawings } from '@/services/drawingOperations';
import DrawingToolbar from './DrawingToolbar';
import { useDrawingCanvas } from '@/hooks/useDrawingCanvas';

const DrawingCanvas: React.FC<DrawingCanvasProps> = ({ canvasId }) => {
  const {
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
  } = useDrawingCanvas(canvasId);
  
  const { toast } = useToast();

  const loadExistingDrawingsAndRedraw = useCallback(async () => {
    try {
      const operations = await loadExistingDrawings(canvasId);

      // Clear canvas and redraw all operations
      const ctx = getCanvasContext();
      if (ctx) {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        
        operations.forEach((op) => {
          const pathData = op.path_data as unknown as PathData;
          if (pathData && pathData.points) {
            handleDrawPath({
              points: pathData.points,
              type: op.operation_type as 'draw' | 'erase',
              timestamp: pathData.timestamp || Date.now()
            });
          }
        });
      }
    } catch (error) {
      console.error('Failed to load existing drawings:', error);
      toast({
        title: "Error",
        description: "Failed to load existing drawings",
        variant: "destructive"
      });
    }
  }, [canvasId, getCanvasContext, handleDrawPath, toast]);

  // Set up real-time subscription
  useEffect(() => {
    console.log('Setting up real-time subscription for canvas:', canvasId);
    
    const channel = supabase
      .channel('drawing-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'drawing_operations',
          filter: `canvas_id=eq.${canvasId}`
        },
        (payload) => {
          const operation = payload.new;
          console.log('Received real-time operation:', operation.id, 'Own ops:', ownOperationIdsRef.current);
          
          // Skip if this is our own operation
          if (ownOperationIdsRef.current.has(operation.id)) {
            console.log('Skipping own operation:', operation.id);
            return;
          }
          
          console.log('Drawing operation from other user:', operation.id);
          const pathData = operation.path_data as unknown as PathData;
          if (pathData && pathData.points) {
            // Draw the operation from other users immediately
            handleDrawPath({
              points: pathData.points,
              type: operation.operation_type as 'draw' | 'erase',
              timestamp: pathData.timestamp || Date.now()
            });
          }
        }
      )
      .subscribe();

    return () => {
      console.log('Cleaning up real-time subscription');
      supabase.removeChannel(channel);
    };
  }, [canvasId, handleDrawPath]);

  // Initialize canvas
  useEffect(() => {
    handleSetupCanvas();
    loadExistingDrawingsAndRedraw();

    // Handle window resize
    const handleResize = () => {
      handleSetupCanvas();
      loadExistingDrawingsAndRedraw();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [handleSetupCanvas, loadExistingDrawingsAndRedraw]);

  return (
    <div className="flex flex-col h-full">
      <DrawingToolbar 
        currentTool={currentTool}
        onToolChange={setCurrentTool}
      />

      {/* Canvas */}
      <div className="flex-1 bg-gray-50 overflow-hidden">
        <canvas
          ref={canvasRef}
          className="w-full h-full cursor-crosshair bg-white"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        />
      </div>
    </div>
  );
};

export default DrawingCanvas;
