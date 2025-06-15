
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import DrawingCanvas from '@/components/DrawingCanvas';
import CanvasManager from '@/components/CanvasManager';
import SharedCanvasView from '@/components/SharedCanvasView';

interface Canvas {
  id: string;
  title: string;
  created_at: string;
}

const Index = () => {
  const [selectedCanvasId, setSelectedCanvasId] = useState<string | null>(null);
  const [canvases, setCanvases] = useState<Canvas[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSharedView, setIsSharedView] = useState(false);
  const { toast } = useToast();

  const loadCanvases = async () => {
    try {
      const { data, error } = await supabase
        .from('canvases')
        .select('id, title, created_at')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCanvases(data || []);
    } catch (error) {
      console.error('Failed to load canvases:', error);
      toast({
        title: "Error",
        description: "Failed to load canvases",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCanvasSelect = (canvasId: string) => {
    setSelectedCanvasId(canvasId);
    // Update URL for sharing
    const url = new URL(window.location.href);
    if (canvasId) {
      url.searchParams.set('canvas', canvasId);
    } else {
      url.searchParams.delete('canvas');
    }
    window.history.replaceState({}, '', url.toString());
  };

  // Check for shared canvas in URL and determine view mode
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const sharedCanvasId = urlParams.get('canvas');
    
    if (sharedCanvasId) {
      setSelectedCanvasId(sharedCanvasId);
      // If there's a canvas in the URL, check if it's a direct share link
      // We'll consider it a shared view if the user navigated directly here
      setIsSharedView(true);
    }
  }, []);

  useEffect(() => {
    // Only load canvases if not in shared view mode
    if (!isSharedView) {
      loadCanvases();
    } else {
      setLoading(false);
    }
  }, [isSharedView]);

  // If this is a shared canvas view, show the simplified interface
  if (isSharedView && selectedCanvasId) {
    return <SharedCanvasView canvasId={selectedCanvasId} />;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading canvases...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-gray-100">
      <CanvasManager
        onSelectCanvas={handleCanvasSelect}
        selectedCanvasId={selectedCanvasId}
        canvases={canvases}
        onCanvasesChange={loadCanvases}
      />
      
      <div className="flex-1 flex flex-col">
        {selectedCanvasId ? (
          <DrawingCanvas canvasId={selectedCanvasId} />
        ) : (
          <div className="flex-1 flex items-center justify-center bg-white">
            <div className="text-center max-w-md">
              <div className="text-6xl mb-4">🎨</div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Collaborative Drawing Canvas
              </h1>
              <p className="text-gray-600 mb-6">
                Create a new canvas or select an existing one to start drawing collaboratively with others in real-time.
              </p>
              <div className="text-sm text-gray-500">
                <p>• Multiple users can draw simultaneously</p>
                <p>• Share canvases via link</p>
                <p>• Simple pencil and eraser tools</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
