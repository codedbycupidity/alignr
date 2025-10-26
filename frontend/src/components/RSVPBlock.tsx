import { Users, X, LogOut, Plus } from 'lucide-react';
import { useState } from 'react';
import Avatar from './Avatar';

interface Participant {
  id: string;
  name: string;
}

interface RSVPBlockProps {
  participants: Participant[];
  currentUserId?: string;
  isOrganizer?: boolean;
  onRemoveParticipant?: (participantId: string) => void;
  onAddParticipant?: (name: string) => void;
}

export default function RSVPBlock({
  participants,
  currentUserId,
  isOrganizer = false,
  onRemoveParticipant,
  onAddParticipant
}: RSVPBlockProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newParticipantName, setNewParticipantName] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleAddParticipant = async () => {
    if (!newParticipantName.trim() || !onAddParticipant) return;

    setIsAdding(true);
    try {
      await onAddParticipant(newParticipantName.trim());
      setNewParticipantName('');
      setShowAddForm(false);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-[#75619D]" strokeWidth={2} />
          <h3 className="text-sm font-semibold text-gray-900">Participants</h3>
        </div>
        <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
          {participants.length} {participants.length === 1 ? 'person' : 'people'}
        </span>
      </div>

      {/* Participants List */}
      {participants.length > 0 ? (
        <div className="space-y-2">
          {participants.map((participant) => {
            const isCurrentUser = participant.id === currentUserId;
            const canRemove = isOrganizer || isCurrentUser;

            return (
              <div
                key={participant.id}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors group"
              >
                <Avatar name={participant.name} size="md" />
                <span className="text-sm font-medium text-gray-900 flex-1">
                  {participant.name}
                  {isCurrentUser && (
                    <span className="ml-2 text-xs text-gray-500">(You)</span>
                  )}
                </span>

                {canRemove && onRemoveParticipant && (
                  <button
                    onClick={() => {
                      const confirmMessage = isCurrentUser
                        ? 'Are you sure you want to withdraw your RSVP?'
                        : `Are you sure you want to remove ${participant.name} from this event?`;

                      if (window.confirm(confirmMessage)) {
                        onRemoveParticipant(participant.id);
                      }
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-all"
                    title={isCurrentUser ? 'Withdraw RSVP' : 'Remove participant'}
                  >
                    {isCurrentUser ? (
                      <LogOut className="w-4 h-4" />
                    ) : (
                      <X className="w-4 h-4" />
                    )}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
          <Users className="w-10 h-10 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-600">No participants yet</p>
          <p className="text-xs text-gray-400 mt-1">
            Share the event link to invite people
          </p>
        </div>
      )}

      {/* Add Participant Form (Organizer Only) */}
      {isOrganizer && showAddForm && onAddParticipant && (
        <div className="bg-white border-2 border-[#75619D] rounded-lg p-3 space-y-2">
          <input
            type="text"
            placeholder="Enter participant name"
            value={newParticipantName}
            onChange={(e) => setNewParticipantName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAddParticipant();
              if (e.key === 'Escape') {
                setShowAddForm(false);
                setNewParticipantName('');
              }
            }}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#75619D] focus:border-transparent"
            autoFocus
          />
          <div className="flex gap-2">
            <button
              onClick={handleAddParticipant}
              disabled={isAdding || !newParticipantName.trim()}
              className="flex-1 px-3 py-2 bg-[#75619D] text-white text-sm rounded-lg hover:bg-[#624F8A] disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {isAdding ? 'Adding...' : 'Add Participant'}
            </button>
            <button
              onClick={() => {
                setShowAddForm(false);
                setNewParticipantName('');
              }}
              className="px-3 py-2 bg-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Add Participant Button (Organizer Only) */}
      {isOrganizer && !showAddForm && onAddParticipant && (
        <button
          onClick={() => setShowAddForm(true)}
          className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-[#75619D] hover:text-[#75619D] transition-colors flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span className="text-sm font-medium">Add Participant</span>
        </button>
      )}
    </div>
  );
}
