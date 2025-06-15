
import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import DrawingCanvas from '@/components/DrawingCanvas';

interface SharedCanvasViewProps {
  canvasId: string;
}

const SharedCanvasView: React.FC<SharedCanvasViewProps> = ({ canvasId }) => {
  const [canvasTitle, setCanvasTitle] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const switchToManagementView = () => {
    // Remove the shared view flag by navigating to the management interface
    window.location.href = '/';
  };

  useEffect(() => {
    const loadCanvasInfo = async () => {
      try {
        const { data, error } = await supabase
          .from('canvases')
          .select('title')
          .eq('id', canvasId)
          .single();

        if (error) {
          setError('Canvas not found');
          toast({
            title: "Error",
            description: "Canvas not found or no longer exists",
            variant: "destructive"
          });
          return;
        }

        setCanvasTitle(data.title);
      } catch (error) {
        console.error('Failed to load canvas info:', error);
        setError('Failed to load canvas');
        toast({
          title: "Error",
          description: "Failed to load canvas information",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    loadCanvasInfo();
  }, [canvasId, toast]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading canvas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Canvas Not Found</h1>
          <p className="text-gray-600 mb-6">
            The canvas you're looking for doesn't exist or may have been deleted.
          </p>
          <Button onClick={switchToManagementView} variant="outline">
            Go to Canvas Manager
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Simple header with canvas title and management access */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-900">{canvasTitle}</h1>
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-500">
              Collaborative Drawing Canvas
            </div>
            <Button 
              onClick={switchToManagementView} 
              variant="outline" 
              size="sm"
            >
              Manage Canvases
            </Button>
          </div>
        </div>
      </div>
      
      {/* Full drawing canvas */}
      <div className="flex-1">
        <DrawingCanvas canvasId={canvasId} />
      </div>
    </div>
  );
};

export default SharedCanvasView;
