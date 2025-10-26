import { useState, useCallback } from 'react';
import { Users, Plus, X, CalendarClock } from 'lucide-react';
import { RsvpBlock as IRsvpBlock, RsvpBlockContent, RsvpResponse } from '../types/block';
import { Timestamp } from 'firebase/firestore';

interface RsvpBlockProps {
  block: IRsvpBlock;
  editable?: boolean;
  onChange?: (content: RsvpBlockContent) => void;
}

export default function RsvpBlock({ block, editable = true, onChange }: RsvpBlockProps) {
  const [rsvpContent, setRsvpContent] = useState<RsvpBlockContent>(block.content);
  const [newName, setNewName] = useState('');
  const [selectedResponse, setSelectedResponse] = useState<RsvpResponse['response']>('going');

  const updateContent = useCallback((updatedContent: Partial<RsvpBlockContent>) => {
    const newContent = {
      ...rsvpContent,
      ...updatedContent
    };
    setRsvpContent(newContent);
    onChange?.(newContent);
  }, [rsvpContent, onChange]);

  const handleAdd = () => {
    if (newName.trim()) {
      const newResponse: RsvpResponse = {
        name: newName.trim(),
        response: selectedResponse,
        timestamp: Timestamp.now()
      };

      // Check if person already responded
      const existingIndex = rsvpContent.responses.findIndex(
        r => r.name.toLowerCase() === newName.trim().toLowerCase()
      );

      let updatedResponses: RsvpResponse[];
      if (existingIndex >= 0) {
        // Update existing response
        updatedResponses = rsvpContent.responses.map((r, i) =>
          i === existingIndex ? newResponse : r
        );
      } else {
        // Add new response
        updatedResponses = [...rsvpContent.responses, newResponse];
      }

      updateContent({ responses: updatedResponses });
      setNewName('');
      setSelectedResponse('going');
    }
  };

  const handleRemove = (name: string) => {
    updateContent({
      responses: rsvpContent.responses.filter(r => r.name !== name)
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getAvatarColor = (name: string) => {
    const colors = [
      'from-[#7B61FF] to-[#A78BFA]',
      'from-[#F59E0B] to-[#FBBF24]',
      'from-[#EF4444] to-[#F87171]',
      'from-[#10B981] to-[#34D399]',
      'from-[#3B82F6] to-[#60A5FA]',
      'from-[#8B5CF6] to-[#A78BFA]',
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  return (
    <div className="p-4 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md hover:border-purple-300 transition-all duration-300 w-64">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Users className="w-4 h-4 text-[#7B61FF]" strokeWidth={2} />
          <h4 className="text-sm font-semibold text-[#1E1E2F]">RSVP</h4>
        </div>
        
        {rsvpContent.deadline && (
          <div className="flex items-center space-x-1 text-xs text-gray-500">
            <CalendarClock className="w-3 h-3" />
            <span>Due {rsvpContent.deadline.toDate().toLocaleDateString()}</span>
          </div>
        )}
      </div>

      {/* Response Stats */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="text-center p-2 bg-green-50 rounded">
          <div className="text-lg font-semibold text-green-600">
            {rsvpContent.responses.filter(r => r.response === 'going').length}
          </div>
          <div className="text-xs text-green-800">Going</div>
        </div>
        <div className="text-center p-2 bg-red-50 rounded">
          <div className="text-lg font-semibold text-red-600">
            {rsvpContent.responses.filter(r => r.response === 'not-going').length}
          </div>
          <div className="text-xs text-red-800">Not Going</div>
        </div>
        {rsvpContent.allowMaybe && (
          <div className="text-center p-2 bg-yellow-50 rounded">
            <div className="text-lg font-semibold text-yellow-600">
              {rsvpContent.responses.filter(r => r.response === 'maybe').length}
            </div>
            <div className="text-xs text-yellow-800">Maybe</div>
          </div>
        )}
      </div>

      <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
        {rsvpContent.responses.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-4">No responses yet</p>
        ) : (
          rsvpContent.responses.map((response) => (
            <div key={response.name} className="flex items-center space-x-2 group">
              <div className={`w-7 h-7 bg-gradient-to-br ${getAvatarColor(response.name)} rounded-full flex items-center justify-center flex-shrink-0 shadow-sm`}>
                <span className="text-white text-xs font-medium">{getInitials(response.name)}</span>
              </div>
              <span className="text-sm text-[#1E1E2F] flex-1">{response.name}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                response.response === 'going' ? 'bg-green-100 text-green-800' :
                response.response === 'not-going' ? 'bg-red-100 text-red-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {response.response}
              </span>
              {editable && (
                <button
                  onClick={() => handleRemove(response.name)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3 text-gray-400 hover:text-red-500" strokeWidth={2} />
                </button>
              )}
            </div>
          ))
        )}
      </div>

      {editable && (
        <div className="space-y-2 pt-2 border-t border-gray-100">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
            placeholder="Your name..."
            className="w-full text-xs text-[#1E1E2F] bg-gray-50 px-2 py-1.5 rounded border border-gray-200 focus:border-[#7B61FF] focus:outline-none"
          />
          
          <div className="flex items-center space-x-2">
            <select
              value={selectedResponse}
              onChange={(e) => setSelectedResponse(e.target.value as RsvpResponse['response'])}
              className="flex-1 text-xs text-[#1E1E2F] bg-gray-50 px-2 py-1.5 rounded border border-gray-200 focus:border-[#7B61FF] focus:outline-none"
            >
              <option value="going">Going</option>
              <option value="not-going">Not Going</option>
              {rsvpContent.allowMaybe && (
                <option value="maybe">Maybe</option>
              )}
            </select>
            
            <button
              onClick={handleAdd}
              className="p-1.5 bg-[#7B61FF] text-white rounded hover:bg-[#6B51E0] transition-colors"
            >
              <Plus className="w-3 h-3" strokeWidth={2} />
            </button>
          </div>
        </div>
      )}
      {!editable && (
        <div className="mt-2 text-xs text-gray-400 flex items-center space-x-1">
          <span>🔒</span>
          <span>View only</span>
        </div>
      )}
    </div>
  );
}
