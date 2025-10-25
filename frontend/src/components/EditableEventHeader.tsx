import { RefObject, useState } from 'react';
import { Calendar, Users, Check, X, Loader2, Clock, Globe, Edit2, Sparkles } from 'lucide-react';
import type { TimeBlock } from '../types/block';
import { generateEventDescription } from '../services/gemini';

interface EditableEventHeaderProps {
  eventName: string;
  eventDescription?: string;
  isOrganizer: boolean;
  editingName: boolean;
  savingName: boolean;
  timeBlock: TimeBlock | null;
  fixedTimeBlock?: TimeBlock | null;
  participantCount?: number;
  nameInputRef: RefObject<HTMLInputElement | null>;
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
  const [generatingDescription, setGeneratingDescription] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);

  const handleSaveDescription = async () => {
    if (!onDescriptionSave) return;
    setSavingDescription(true);
    try {
      await onDescriptionSave(descriptionValue);
      setEditingDescription(false);
      setAiSuggestion(null);
    } finally {
      setSavingDescription(false);
    }
  };

  const handleCancelDescription = () => {
    setDescriptionValue(eventDescription || '');
    setEditingDescription(false);
    setAiSuggestion(null);
  };

  const handleGenerateDescription = async () => {
    if (!eventName || eventName === 'Untitled Event') return;

    setGeneratingDescription(true);
    try {
      const description = await generateEventDescription(eventName);
      setAiSuggestion(description);
    } catch (error) {
      console.error('Error generating description:', error);
    } finally {
      setGeneratingDescription(false);
    }
  };

  const handleAcceptSuggestion = async () => {
    if (!aiSuggestion || !onDescriptionSave) return;
    setSavingDescription(true);
    try {
      await onDescriptionSave(aiSuggestion);
      setAiSuggestion(null);
    } finally {
      setSavingDescription(false);
    }
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
              {/* AI Suggestion */}
              {aiSuggestion && !eventDescription && isOrganizer && (
                <div className="mb-2 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                  <div className="flex items-start gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-[#75619D] mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs font-medium text-[#75619D] mb-1">AI Suggestion</p>
                      <p className="text-sm text-gray-700">{aiSuggestion}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleAcceptSuggestion}
                      disabled={savingDescription}
                      className="flex-1 px-3 py-1.5 bg-[#75619D] text-white text-xs rounded-lg hover:bg-[#624F8A] disabled:opacity-50 transition-colors font-medium"
                    >
                      {savingDescription ? 'Saving...' : 'Use This Description'}
                    </button>
                    <button
                      onClick={() => setAiSuggestion(null)}
                      className="px-3 py-1.5 bg-gray-200 text-gray-700 text-xs rounded-lg hover:bg-gray-300 transition-colors font-medium"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              )}

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
                    <>
                      <p
                        onClick={isOrganizer ? () => setEditingDescription(true) : undefined}
                        className={`text-sm text-gray-600 flex-1 ${
                          isOrganizer ? 'cursor-pointer hover:text-gray-800 transition-colors' : ''
                        }`}
                      >
                        {eventDescription}
                      </p>
                      {isOrganizer && (
                        <button
                          onClick={() => setEditingDescription(true)}
                          className="p-1 opacity-0 group-hover:opacity-100 hover:bg-gray-100 rounded transition-all"
                          title="Edit description"
                        >
                          <Edit2 className="w-3.5 h-3.5 text-gray-500" />
                        </button>
                      )}
                    </>
                  ) : (
                    <div className="flex-1 flex items-center gap-2">
                      {isOrganizer ? (
                        <>
                          <p
                            onClick={() => setEditingDescription(true)}
                            className="text-sm text-gray-400 italic cursor-pointer hover:text-gray-600 transition-colors"
                          >
                            Add a description...
                          </p>
                          {!aiSuggestion && (
                            <button
                              onClick={handleGenerateDescription}
                              disabled={generatingDescription}
                              className="flex items-center gap-1 px-2 py-1 text-xs bg-purple-50 text-[#75619D] rounded hover:bg-purple-100 transition-colors disabled:opacity-50"
                              title="Click to generate AI description"
                            >
                              <Sparkles className="w-3 h-3" />
                              {generatingDescription ? 'Generating...' : 'AI Suggest'}
                            </button>
                          )}
                        </>
                      ) : (
                        <p className="text-sm text-gray-400 italic">No description</p>
                      )}
                    </div>
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
