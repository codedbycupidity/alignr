import { RefObject } from 'react';
import { Calendar, Users, Check, X, Loader2 } from 'lucide-react';
import type { TimeBlock } from '../types/block';

interface EditableEventHeaderProps {
  eventName: string;
  eventDescription?: string;
  isOrganizer: boolean;
  editingName: boolean;
  savingName: boolean;
  timeBlock: TimeBlock | null;
  nameInputRef: RefObject<HTMLInputElement>;
  onNameChange: (name: string) => void;
  onSaveName: () => void;
  onCancelEdit: () => void;
  onStartEdit: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
}

export default function EditableEventHeader({
  eventName,
  eventDescription,
  isOrganizer,
  editingName,
  savingName,
  timeBlock,
  nameInputRef,
  onNameChange,
  onSaveName,
  onCancelEdit,
  onStartEdit,
  onKeyDown
}: EditableEventHeaderProps) {
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
          {eventDescription && !editingName && (
            <p className="text-sm text-gray-600 mt-1">{eventDescription}</p>
          )}
        </div>
      </div>
      {timeBlock && (
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar className="w-4 h-4 text-[#75619D]" />
          <span>
            {timeBlock.content.selectedDates?.length || 0} {timeBlock.content.selectedDates?.length === 1 ? 'date' : 'dates'} selected
          </span>
          {timeBlock.content.availability && timeBlock.content.availability.length > 0 && (
            <>
              <span className="text-gray-400">•</span>
              <Users className="w-4 h-4 text-[#75619D]" />
              <span>
                {timeBlock.content.availability.length} {timeBlock.content.availability.length === 1 ? 'participant' : 'participants'}
              </span>
            </>
          )}
        </div>
      )}
    </div>
  );
}
