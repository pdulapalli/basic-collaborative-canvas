
import React from 'react';

interface DrawingToolbarProps {
  currentTool: 'draw' | 'erase';
  onToolChange: (tool: 'draw' | 'erase') => void;
}

const DrawingToolbar: React.FC<DrawingToolbarProps> = ({ currentTool, onToolChange }) => {
  return (
    <div className="bg-white border-b border-gray-200 p-4 flex gap-4 items-center">
      <button
        onClick={() => onToolChange('draw')}
        className={`px-4 py-2 rounded-md font-medium transition-colors ${
          currentTool === 'draw'
            ? 'bg-blue-500 text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
        ✏️ Pencil
      </button>
      <button
        onClick={() => onToolChange('erase')}
        className={`px-4 py-2 rounded-md font-medium transition-colors ${
          currentTool === 'erase'
            ? 'bg-red-500 text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
        🧽 Eraser
      </button>
    </div>
  );
};

export default DrawingToolbar;
