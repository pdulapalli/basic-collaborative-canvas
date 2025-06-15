
import { supabase } from '@/integrations/supabase/client';
import { DrawingPath, PathData } from '@/types/drawing';

export const saveDrawingOperation = async (canvasId: string, path: DrawingPath) => {
  const pathData: PathData = {
    points: path.points,
    timestamp: path.timestamp
  };

  const { data, error } = await supabase
    .from('drawing_operations')
    .insert({
      canvas_id: canvasId,
      operation_type: path.type,
      path_data: pathData as any
    })
    .select('id')
    .single();

  if (error) throw error;
  return data;
};

export const loadExistingDrawings = async (canvasId: string) => {
  const { data: operations, error } = await supabase
    .from('drawing_operations')
    .select('*')
    .eq('canvas_id', canvasId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return operations || [];
};
