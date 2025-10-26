import { useState } from 'react';
import { BarChart3, Plus, X, Check } from 'lucide-react';
import type { PollOption } from '../types/block';

interface PollBlockProps {
  question: string;
  options: PollOption[];
  allowMultipleVotes: boolean;
  allowParticipantOptions: boolean;
  currentUserId?: string;
  currentUserName?: string;
  isOrganizer: boolean;
  onChange?: (question: string, options: PollOption[], allowMultipleVotes: boolean, allowParticipantOptions: boolean) => void;
}

export default function PollBlock({
  question,
  options,
  allowMultipleVotes,
  allowParticipantOptions,
  currentUserId,
  currentUserName,
  isOrganizer,
  onChange
}: PollBlockProps) {
  const [editingQuestion, setEditingQuestion] = useState(false);
  const [questionText, setQuestionText] = useState(question);
  const [newOptionText, setNewOptionText] = useState('');
  const [showAddOption, setShowAddOption] = useState(false);

  // Calculate total votes
  const totalVotes = options.reduce((sum, opt) => sum + opt.votes.length, 0);

  // Handle voting
  const handleVote = (optionId: string) => {
    if (!currentUserId || !onChange || isOrganizer) return;

    const updatedOptions = options.map(opt => {
      const hasVoted = opt.votes.includes(currentUserId);

      if (opt.id === optionId) {
        // Toggle vote for this option
        return {
          ...opt,
          votes: hasVoted
            ? opt.votes.filter(id => id !== currentUserId)
            : [...opt.votes, currentUserId]
        };
      } else if (!allowMultipleVotes && hasVoted) {
        // Remove vote from other options if single vote mode
        return {
          ...opt,
          votes: opt.votes.filter(id => id !== currentUserId)
        };
      }
      return opt;
    });

    onChange(questionText, updatedOptions, allowMultipleVotes, allowParticipantOptions);
  };

  // Handle question update
  const handleQuestionSave = () => {
    if (onChange && questionText.trim()) {
      onChange(questionText, options, allowMultipleVotes, allowParticipantOptions);
    }
    setEditingQuestion(false);
  };

  // Add new option
  const handleAddOption = () => {
    if (!onChange || !newOptionText.trim()) return;

    const newOption: PollOption = {
      id: Math.random().toString(36).slice(2, 9),
      text: newOptionText.trim(),
      votes: []
    };

    onChange(questionText, [...options, newOption], allowMultipleVotes, allowParticipantOptions);
    setNewOptionText('');
    setShowAddOption(false);
  };

  // Delete option
  const handleDeleteOption = (optionId: string) => {
    if (!onChange) return;
    const updatedOptions = options.filter(opt => opt.id !== optionId);
    onChange(questionText, updatedOptions, allowMultipleVotes, allowParticipantOptions);
  };

  // Toggle settings
  const toggleMultipleVotes = () => {
    if (!onChange || !isOrganizer) return;
    onChange(questionText, options, !allowMultipleVotes, allowParticipantOptions);
  };

  const toggleParticipantOptions = () => {
    if (!onChange || !isOrganizer) return;
    onChange(questionText, options, allowMultipleVotes, !allowParticipantOptions);
  };

  const canAddOption = isOrganizer || allowParticipantOptions;

  return (
    <div className="p-4 bg-white border border-gray-200 rounded-xl shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-[#75619D] rounded-xl flex items-center justify-center shadow-sm">
          <BarChart3 className="w-5 h-5 text-white" strokeWidth={2.5} />
        </div>
        <div className="flex-1">
          {editingQuestion && isOrganizer ? (
            <input
              type="text"
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              onBlur={handleQuestionSave}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleQuestionSave();
                if (e.key === 'Escape') {
                  setQuestionText(question);
                  setEditingQuestion(false);
                }
              }}
              className="w-full text-lg font-semibold text-[#1E1E2F] border-b-2 border-[#75619D] focus:outline-none"
              placeholder="Enter poll question..."
              autoFocus
            />
          ) : (
            <h3
              className={`text-lg font-semibold text-[#1E1E2F] ${isOrganizer ? 'cursor-pointer hover:text-[#75619D]' : ''}`}
              onClick={() => isOrganizer && setEditingQuestion(true)}
            >
              {questionText || 'Untitled Poll'}
            </h3>
          )}
          <p className="text-xs text-gray-500 mt-1">
            {totalVotes} {totalVotes === 1 ? 'vote' : 'votes'} • {allowMultipleVotes ? 'Multiple choice' : 'Single choice'}
          </p>
        </div>
      </div>

      {/* Organizer Settings */}
      {isOrganizer && (
        <div className="mb-4 space-y-2">
          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input
              type="checkbox"
              checked={allowMultipleVotes}
              onChange={toggleMultipleVotes}
              className="w-4 h-4 text-[#75619D] border-gray-300 rounded focus:ring-[#75619D]"
            />
            Allow multiple votes per person
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input
              type="checkbox"
              checked={allowParticipantOptions}
              onChange={toggleParticipantOptions}
              className="w-4 h-4 text-[#75619D] border-gray-300 rounded focus:ring-[#75619D]"
            />
            Allow participants to add options
          </label>
        </div>
      )}

      {/* Poll Options */}
      <div className="space-y-2">
        {options.map((option) => {
          const voteCount = option.votes.length;
          const percentage = totalVotes > 0 ? (voteCount / totalVotes) * 100 : 0;
          const hasVoted = currentUserId ? option.votes.includes(currentUserId) : false;

          return (
            <div key={option.id} className="relative">
              <div
                onClick={() => !isOrganizer && handleVote(option.id)}
                className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-all ${
                  isOrganizer
                    ? 'border-gray-200 bg-gray-50 cursor-not-allowed'
                    : hasVoted
                    ? 'border-[#75619D] bg-[#75619D]/10 cursor-pointer'
                    : 'border-gray-200 hover:border-[#75619D]/50 bg-white cursor-pointer'
                }`}
              >
                {/* Progress bar */}
                <div
                  className="absolute inset-0 bg-[#75619D]/10 rounded-lg transition-all pointer-events-none"
                  style={{ width: `${percentage}%` }}
                />

                {/* Content */}
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-2 flex-1">
                    {hasVoted && <Check className="w-4 h-4 text-[#75619D] flex-shrink-0" />}
                    <span className="font-medium text-gray-800">{option.text}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-600 font-medium">
                      {voteCount} {voteCount === 1 ? 'vote' : 'votes'} ({Math.round(percentage)}%)
                    </span>
                    {isOrganizer && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteOption(option.id);
                        }}
                        className="p-1 hover:bg-gray-100 rounded transition-colors"
                        title="Delete option"
                      >
                        <X className="w-4 h-4 text-gray-500" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Option */}
      {canAddOption && (
        <div className="mt-3">
          {showAddOption ? (
            <div className="flex gap-2">
              <input
                type="text"
                value={newOptionText}
                onChange={(e) => setNewOptionText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddOption();
                  if (e.key === 'Escape') {
                    setNewOptionText('');
                    setShowAddOption(false);
                  }
                }}
                placeholder="Enter option text..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#75619D]"
                autoFocus
              />
              <button
                onClick={handleAddOption}
                className="px-4 py-2 bg-[#75619D] text-white rounded-lg hover:bg-[#75619D]/90 transition-colors flex-shrink-0"
              >
                Add
              </button>
              <button
                onClick={() => {
                  setNewOptionText('');
                  setShowAddOption(false);
                }}
                className="px-5 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors flex-shrink-0"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowAddOption(true)}
              className="w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-[#75619D] hover:text-[#75619D] transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add option
            </button>
          )}
        </div>
      )}

      {/* Empty state */}
      {options.length === 0 && (
        <div className="text-center py-8">
          <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">
            {canAddOption ? 'No options yet. Add one to get started!' : 'No options available'}
          </p>
        </div>
      )}
    </div>
  );
}
