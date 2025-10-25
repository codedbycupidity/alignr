import { RefObject, useState } from 'react';
import { Calendar, Users, Check, X, Loader2, Clock, Globe, Edit2 } from 'lucide-react';
import type { TimeBlock } from '../types/block';

interface EditableEventHeaderProps {
  eventName: string;
  eventDescription?: string;
  isOrganizer: boolean;
  editingName: boolean;
  savingName: boolean;
  timeBlock: TimeBlock | null;
  fixedTimeBlock?: TimeBlock | null;
  participantCount?: number;
  nameInputRef: RefObject<HTMLInputElement>;
  onNameChange: (name: string) => void;
  onSaveName: () => void;
  onCancelEdit: () => void;
  onStartEdit: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  onDeleteFixedTimeBlock?: () => void;
  onDescriptionSave?: (description: string) => void;
}

export default function EditableEventHeader({
  eventName,
  eventDescription,
  isOrganizer,
  editingName,
  savingName,
  timeBlock,
  fixedTimeBlock,
  participantCount = 0,
  nameInputRef,
  onNameChange,
  onSaveName,
  onCancelEdit,
  onStartEdit,
  onKeyDown,
  onDeleteFixedTimeBlock,
  onDescriptionSave
}: EditableEventHeaderProps) {
  const [editingDescription, setEditingDescription] = useState(false);
  const [descriptionValue, setDescriptionValue] = useState(eventDescription || '');
  const [savingDescription, setSavingDescription] = useState(false);

  const handleSaveDescription = async () => {
    if (!onDescriptionSave) return;
    setSavingDescription(true);
    try {
      await onDescriptionSave(descriptionValue);
      setEditingDescription(false);
    } finally {
      setSavingDescription(false);
    }
  };

  const handleCancelDescription = () => {
    setDescriptionValue(eventDescription || '');
    setEditingDescription(false);
  };
  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime12Hour = (time24: string) => {
    const [hour, min] = time24.split(':').map(Number);
    const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    const ampm = hour < 12 ? 'AM' : 'PM';
    return `${hour12}:${min.toString().padStart(2, '0')} ${ampm}`;
  };
  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-12 h-12 bg-[#75619D] rounded-xl flex items-center justify-center shadow-lg">
          <Calendar className="w-6 h-6 text-white" strokeWidth={2.5} />
        </div>
        <div className="flex-1">
          {editingName ? (
            <div className="flex items-center gap-2">
              <input
                ref={nameInputRef}
                type="text"
                value={eventName}
                onChange={(e) => onNameChange(e.target.value)}
                onKeyDown={onKeyDown}
                className="text-3xl font-bold text-[#1E1E2F] tracking-tight border-b-2 border-[#75619D] focus:outline-none bg-transparent"
                placeholder="Enter event name..."
              />
              <button
                onClick={onSaveName}
                disabled={savingName}
                className="p-2 bg-[#75619D] text-white rounded-lg hover:bg-[#75619D]/90 disabled:opacity-50"
              >
                {savingName ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
              </button>
              <button
                onClick={onCancelEdit}
                className="p-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <h1
              onClick={isOrganizer ? onStartEdit : undefined}
              className={`text-3xl font-bold text-[#1E1E2F] tracking-tight ${
                isOrganizer ? 'cursor-pointer hover:text-[#75619D] transition-colors' : ''
              }`}
            >
              {eventName || 'Loading...'}
            </h1>
          )}

          {/* Description Section */}
          {!editingName && (
            <div className="mt-2">
              {editingDescription ? (
                <div className="flex items-start gap-2">
                  <textarea
                    value={descriptionValue}
                    onChange={(e) => setDescriptionValue(e.target.value)}
                    placeholder="Add a description for your event..."
                    className="flex-1 text-sm text-gray-600 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#75619D] focus:border-transparent resize-none"
                    rows={3}
                    autoFocus
                  />
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={handleSaveDescription}
                      disabled={savingDescription}
                      className="p-1.5 bg-[#75619D] text-white rounded-lg hover:bg-[#624F8A] disabled:opacity-50 transition-colors"
                      title="Save description"
                    >
                      {savingDescription ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Check className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={handleCancelDescription}
                      className="p-1.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                      title="Cancel"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-2 group">
                  {eventDescription ? (
                    <p className="text-sm text-gray-600 flex-1">{eventDescription}</p>
                  ) : (
                    isOrganizer && (
                      <p className="text-sm text-gray-400 italic flex-1">Add a description...</p>
                    )
                  )}
                  {isOrganizer && (
                    <button
                      onClick={() => setEditingDescription(true)}
                      className="p-1 opacity-0 group-hover:opacity-100 hover:bg-gray-100 rounded transition-all"
                      title="Edit description"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-gray-500" />
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      {/* Event metadata */}
      <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
        {/* Fixed Date/Time */}
        {fixedTimeBlock && (
          <>
            <Calendar className="w-4 h-4 text-[#75619D]" />
            <span>
              {fixedTimeBlock.content.fixedDate && formatDate(fixedTimeBlock.content.fixedDate)}
            </span>
            <span className="text-gray-400">•</span>
            <Clock className="w-4 h-4 text-[#75619D]" />
            <span>
              {fixedTimeBlock.content.fixedStartTime && formatTime12Hour(fixedTimeBlock.content.fixedStartTime)} - {fixedTimeBlock.content.fixedEndTime && formatTime12Hour(fixedTimeBlock.content.fixedEndTime)}
            </span>
            <span className="text-gray-400">•</span>
            <Globe className="w-4 h-4 text-[#75619D]" />
            <span className="text-xs">{fixedTimeBlock.content.fixedTimezone?.replace('_', ' ')}</span>
            {isOrganizer && onDeleteFixedTimeBlock && (
              <>
                <span className="text-gray-400">•</span>
                <button
                  onClick={() => {
                    if (window.confirm('Are you sure you want to delete the fixed date/time?')) {
                      onDeleteFixedTimeBlock();
                    }
                  }}
                  className="p-0.5 hover:bg-gray-200 rounded transition-colors"
                  title="Delete fixed date/time"
                >
                  <X className="w-3.5 h-3.5 text-gray-500 hover:text-gray-700" />
                </button>
              </>
            )}
          </>
        )}

        {/* Availability Mode */}
        {timeBlock && (
          <>
            <Calendar className="w-4 h-4 text-[#75619D]" />
            <span>
              {timeBlock.content.selectedDates?.length || 0} {timeBlock.content.selectedDates?.length === 1 ? 'date' : 'dates'} selected
            </span>
          </>
        )}

        {/* Participant Count - Show for both modes */}
        {(timeBlock || fixedTimeBlock) && participantCount > 0 && (
          <>
            <span className="text-gray-400">•</span>
            <Users className="w-4 h-4 text-[#75619D]" />
            <span>
              {participantCount} {participantCount === 1 ? 'participant' : 'participants'}
            </span>
          </>
        )}
      </div>
    </div>
  );
}
