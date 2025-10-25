import { DollarSign } from 'lucide-react';
import { useState } from 'react';
import type { BudgetResponse } from '../types/block';

interface BudgetBlockProps {
  responses: BudgetResponse[];
  currentUserId?: string;
  currentUserName?: string;
  isOrganizer?: boolean;
  showResponsesToParticipants?: boolean;
  onResponseChange?: (budgetLevel: number) => void;
  onSettingsChange?: (settings: { showResponsesToParticipants: boolean }) => void;
}

export default function BudgetBlock({
  responses,
  currentUserId,
  currentUserName,
  isOrganizer = false,
  showResponsesToParticipants = false,
  onResponseChange,
  onSettingsChange
}: BudgetBlockProps) {
  const currentResponse = responses.find(r => r.participantId === currentUserId);
  const [selectedLevel, setSelectedLevel] = useState<number>(currentResponse?.budgetLevel || 0);

  const handleSelectLevel = (level: number) => {
    setSelectedLevel(level);
    onResponseChange?.(level);
  };

  const renderDollarSigns = (count: number, isClickable: boolean = false, level: number = 0) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <DollarSign
            key={i}
            className={`w-4 h-4 ${
              i <= count
                ? 'text-[#75619D] fill-[#75619D]'
                : 'text-gray-300'
            } ${isClickable ? 'cursor-pointer hover:text-[#624F8A] hover:fill-[#624F8A] transition-colors' : ''}`}
            strokeWidth={2}
            onClick={isClickable ? () => handleSelectLevel(level) : undefined}
          />
        ))}
      </div>
    );
  };

  const canSeeResponses = isOrganizer || showResponsesToParticipants;

  return (
    <div className="space-y-4">
      {/* Organizer Settings */}
      {isOrganizer && (
        <div className="bg-white border border-gray-200 rounded-lg p-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showResponsesToParticipants}
              onChange={(e) => onSettingsChange?.({ showResponsesToParticipants: e.target.checked })}
              className="w-4 h-4 text-[#75619D] border-gray-300 rounded focus:ring-[#75619D]"
            />
            <span className="text-sm text-gray-700">Show responses to participants</span>
          </label>
        </div>
      )}

      {/* User Selection - Only show for non-organizers */}
      {currentUserId && !isOrganizer && (
        <div className="bg-white border-2 border-[#75619D] rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Select Your Budget</h3>
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((level) => (
              <button
                key={level}
                onClick={() => handleSelectLevel(level)}
                className={`w-full p-3 rounded-lg border-2 transition-all flex items-center justify-between ${
                  selectedLevel === level
                    ? 'border-[#75619D] bg-[#75619D]/10'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <span className="text-sm font-medium text-gray-700">
                  {level === 1 && 'Budget-friendly'}
                  {level === 2 && 'Moderate'}
                  {level === 3 && 'Mid-range'}
                  {level === 4 && 'Higher-end'}
                  {level === 5 && 'Premium'}
                </span>
                {renderDollarSigns(level, false)}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Responses List - Only show if organizer OR showResponsesToParticipants is enabled */}
      {responses.length > 0 && canSeeResponses && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">
            Budget Responses ({responses.length})
          </h3>
          <div className="space-y-2">
            {responses
              .sort((a, b) => b.budgetLevel - a.budgetLevel)
              .map((response) => (
                <div
                  key={response.participantId}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded-md"
                >
                  <span className="text-sm text-gray-700 font-medium">
                    {response.participantName}
                  </span>
                  {renderDollarSigns(response.budgetLevel)}
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {responses.length === 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
          <DollarSign className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-600">No participants have selected budgets yet</p>
        </div>
      )}
    </div>
  );
}
