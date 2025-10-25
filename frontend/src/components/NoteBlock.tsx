import { useState } from 'react';
import { MessageSquare } from 'lucide-react';

interface NoteBlockProps {
  content: string;
  editable?: boolean;
  onChange?: (content: string) => void;
}

export default function NoteBlock({ content, editable = true, onChange }: NoteBlockProps) {
  const [noteContent, setNoteContent] = useState(content);

  const handleChange = (newContent: string) => {
    setNoteContent(newContent);
    onChange?.(newContent);
  };

  return (
    <div className="drag-handle p-4 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md hover:border-purple-300 transition-all duration-300 cursor-grab active:cursor-grabbing w-64">
      <div className="flex items-start space-x-2 mb-2">
        <MessageSquare className="w-4 h-4 text-[#7B61FF] mt-0.5 flex-shrink-0" strokeWidth={2} />
        {editable ? (
          <textarea
            value={noteContent}
            onChange={(e) => handleChange(e.target.value)}
            className="flex-1 text-sm text-[#1E1E2F] bg-transparent border-none outline-none resize-none font-medium"
            rows={3}
            placeholder="Type your note..."
          />
        ) : (
          <p className="flex-1 text-sm text-[#1E1E2F] font-medium">{noteContent}</p>
        )}
      </div>
      {!editable && (
        <div className="mt-2 text-xs text-gray-400 flex items-center space-x-1">
          <span>🔒</span>
          <span>View only</span>
        </div>
      )}
    </div>
  );
}
