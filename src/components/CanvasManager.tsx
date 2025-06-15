
import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2, Share, Plus } from 'lucide-react';

interface Canvas {
  id: string;
  title: string;
  created_at: string;
}

interface CanvasManagerProps {
  onSelectCanvas: (canvasId: string) => void;
  selectedCanvasId: string | null;
  canvases: Canvas[];
  onCanvasesChange: () => void;
}

const CanvasManager: React.FC<CanvasManagerProps> = ({
  onSelectCanvas,
  selectedCanvasId,
  canvases,
  onCanvasesChange
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newCanvasTitle, setNewCanvasTitle] = useState('');
  const { toast } = useToast();

  const createCanvas = async () => {
    if (!newCanvasTitle.trim()) {
      toast({
        title: "Error",
        description: "Please enter a canvas title",
        variant: "destructive"
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('canvases')
        .insert({ title: newCanvasTitle.trim() })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Canvas created successfully"
      });

      setNewCanvasTitle('');
      setIsCreating(false);
      onCanvasesChange();
      onSelectCanvas(data.id);
    } catch (error) {
      console.error('Failed to create canvas:', error);
      toast({
        title: "Error",
        description: "Failed to create canvas",
        variant: "destructive"
      });
    }
  };

  const deleteCanvas = async (canvasId: string) => {
    if (!confirm('Are you sure you want to delete this canvas? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('canvases')
        .delete()
        .eq('id', canvasId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Canvas deleted successfully"
      });

      onCanvasesChange();
      if (selectedCanvasId === canvasId) {
        onSelectCanvas('');
      }
    } catch (error) {
      console.error('Failed to delete canvas:', error);
      toast({
        title: "Error",
        description: "Failed to delete canvas",
        variant: "destructive"
      });
    }
  };

  const shareCanvas = (canvasId: string) => {
    const shareUrl = `${window.location.origin}/?canvas=${canvasId}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      toast({
        title: "Link Copied",
        description: "Canvas share link copied to clipboard"
      });
    }).catch(() => {
      toast({
        title: "Share Link",
        description: shareUrl,
        variant: "default"
      });
    });
  };

  return (
    <div className="bg-white border-r border-gray-200 w-80 p-4 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Canvases</h2>
        <Button
          onClick={() => setIsCreating(true)}
          size="sm"
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          New
        </Button>
      </div>

      {isCreating && (
        <div className="mb-4 p-3 border border-gray-200 rounded-md">
          <Input
            placeholder="Canvas title"
            value={newCanvasTitle}
            onChange={(e) => setNewCanvasTitle(e.target.value)}
            className="mb-2"
            onKeyPress={(e) => e.key === 'Enter' && createCanvas()}
          />
          <div className="flex gap-2">
            <Button onClick={createCanvas} size="sm">
              Create
            </Button>
            <Button
              onClick={() => {
                setIsCreating(false);
                setNewCanvasTitle('');
              }}
              variant="outline"
              size="sm"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        {canvases.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            No canvases yet. Create your first canvas!
          </p>
        ) : (
          <div className="space-y-2">
            {canvases.map((canvas) => (
              <div
                key={canvas.id}
                className={`p-3 border rounded-md cursor-pointer transition-colors ${
                  selectedCanvasId === canvas.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => onSelectCanvas(canvas.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium truncate">{canvas.title}</h3>
                    <p className="text-sm text-gray-500">
                      {new Date(canvas.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-1 ml-2">
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        shareCanvas(canvas.id);
                      }}
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                    >
                      <Share className="h-4 w-4" />
                    </Button>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteCanvas(canvas.id);
                      }}
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CanvasManager;
