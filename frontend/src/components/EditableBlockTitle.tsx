import React, { useState, useRef, useEffect } from 'react';
import { Edit2, Check, X } from 'lucide-react';

interface EditableBlockTitleProps {
  title: string;
  isEditable?: boolean;
  onTitleChange?: (newTitle: string) => void;
  className?: string;
}

const EditableBlockTitle: React.FC<EditableBlockTitleProps> = ({
  title,
  isEditable = true,
  onTitleChange,
  className = ''
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(title);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  useEffect(() => {
    setEditedTitle(title);
  }, [title]);

  const handleStartEdit = () => {
    if (isEditable) {
      setIsEditing(true);
    }
  };

  const handleSave = () => {
    onTitleChange?.(editedTitle);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedTitle(title);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-2">
        <input
          ref={inputRef}
          type="text"
          value={editedTitle}
          onChange={(e) => setEditedTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          className={`bg-white px-2 py-1 rounded border border-[#75619D] focus:outline-none focus:ring-2 focus:ring-[#75619D] ${className}`}
        />
        <button
          onClick={handleSave}
          className="p-1 bg-[#75619D] text-white rounded hover:bg-[#624F8A] transition-colors"
        >
          <Check className="w-4 h-4" />
        </button>
        <button
          onClick={handleCancel}
          className="p-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="group flex items-center gap-2">
      <h3
        onClick={handleStartEdit}
        className={`${className} ${isEditable ? 'cursor-pointer hover:text-[#75619D] transition-colors' : ''}`}
      >
        {title}
      </h3>
      {isEditable && (
        <button
          onClick={handleStartEdit}
          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-100 rounded transition-all"
          title="Edit title"
        >
          <Edit2 className="w-3.5 h-3.5 text-gray-500" />
        </button>
      )}
    </div>
  );
};

export default EditableBlockTitle;