
-- Create canvases table to store canvas metadata
CREATE TABLE public.canvases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL DEFAULT 'Untitled Canvas',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create drawing_operations table to store all drawing actions
CREATE TABLE public.drawing_operations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  canvas_id UUID REFERENCES public.canvases(id) ON DELETE CASCADE NOT NULL,
  operation_type TEXT NOT NULL CHECK (operation_type IN ('draw', 'erase')),
  path_data JSONB NOT NULL, -- Store drawing path coordinates and properties
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.canvases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drawing_operations ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (any user can create, view, edit, delete)
-- This allows sharing via URL without authentication requirements
CREATE POLICY "Anyone can manage canvases" 
  ON public.canvases 
  FOR ALL 
  USING (true) 
  WITH CHECK (true);

CREATE POLICY "Anyone can manage drawing operations" 
  ON public.drawing_operations 
  FOR ALL 
  USING (true) 
  WITH CHECK (true);

-- Enable realtime for live collaboration
ALTER TABLE public.drawing_operations REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.drawing_operations;

-- Create index for performance
CREATE INDEX idx_drawing_operations_canvas_id ON public.drawing_operations(canvas_id);
CREATE INDEX idx_drawing_operations_created_at ON public.drawing_operations(created_at);
