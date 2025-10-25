import { useState } from 'react';
import { Users, Plus, X } from 'lucide-react';

interface RsvpBlockProps {
  people?: string[];
  editable?: boolean;
  onChange?: (people: string[]) => void;
}

export default function RsvpBlock({ people = [], editable = true, onChange }: RsvpBlockProps) {
  const [attendees, setAttendees] = useState<string[]>(people);
  const [newPerson, setNewPerson] = useState('');

  const handleAdd = () => {
    if (newPerson.trim()) {
      const updated = [...attendees, newPerson.trim()];
      setAttendees(updated);
      setNewPerson('');
      onChange?.(updated);
    }
  };

  const handleRemove = (index: number) => {
    const updated = attendees.filter((_, i) => i !== index);
    setAttendees(updated);
    onChange?.(updated);
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
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Users className="w-4 h-4 text-[#7B61FF]" strokeWidth={2} />
          <h4 className="text-sm font-semibold text-[#1E1E2F]">RSVP</h4>
        </div>
        <span className="text-xs text-gray-500 font-medium">{attendees.length} going</span>
      </div>

      <div className="space-y-2 mb-3 max-h-48 overflow-y-auto">
        {attendees.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-4">No responses yet</p>
        ) : (
          attendees.map((person, index) => (
            <div key={index} className="flex items-center space-x-2 group">
              <div className={`w-7 h-7 bg-gradient-to-br ${getAvatarColor(person)} rounded-full flex items-center justify-center flex-shrink-0 shadow-sm`}>
                <span className="text-white text-xs font-medium">{getInitials(person)}</span>
              </div>
              <span className="text-sm text-[#1E1E2F] flex-1">{person}</span>
              <button
                onClick={() => handleRemove(index)}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3 text-gray-400 hover:text-red-500" strokeWidth={2} />
              </button>
            </div>
          ))
        )}
      </div>

      <div className="flex items-center space-x-2 pt-2 border-t border-gray-100">
        <input
          type="text"
          value={newPerson}
          onChange={(e) => setNewPerson(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
          placeholder="Add person..."
          disabled={!editable}
          className="flex-1 text-xs text-[#1E1E2F] bg-gray-50 px-2 py-1.5 rounded border border-gray-200 focus:border-[#7B61FF] focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
        />
        <button
          onClick={handleAdd}
          disabled={!editable}
          className="p-1.5 bg-[#7B61FF] text-white rounded hover:bg-[#6B51E0] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="w-3 h-3" strokeWidth={2} />
        </button>
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
