import { X, Loader2, Sparkles, CheckSquare } from 'lucide-react';
import { useState, useEffect } from 'react';
import type { Task } from '../types/block';
import { suggestTasks, type TaskSuggestion } from '../services/gemini';

interface TaskSuggestionsModalProps {
  isOpen: boolean;
  eventName: string;
  eventDescription?: string;
  onAccept: (tasks: Task[]) => void;
  onSkip: () => void;
}

export default function TaskSuggestionsModal({
  isOpen,
  eventName,
  eventDescription,
  onAccept,
  onSkip
}: TaskSuggestionsModalProps) {
  const [suggestions, setSuggestions] = useState<TaskSuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const fetchSuggestions = async () => {
      setLoading(true);
      setError(null);

      try {
        const tasks = await suggestTasks(eventName, eventDescription);
        setSuggestions(tasks);
      } catch (err) {
        console.error('Error fetching task suggestions:', err);
        setError('Failed to generate task suggestions');
      } finally {
        setLoading(false);
      }
    };

    fetchSuggestions();
  }, [isOpen, eventName, eventDescription]);

  const handleAccept = () => {
    const tasks: Task[] = suggestions.map((suggestion, index) => ({
      id: `task-${Date.now()}-${index}`,
      label: suggestion.label,
      description: suggestion.description,
      completed: false
    }));

    onAccept(tasks);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#75619D]" />
            <h2 className="text-lg font-bold text-gray-900">AI Task Suggestions</h2>
          </div>
          <button
            onClick={onSkip}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading && (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-[#75619D] animate-spin mb-3" />
              <p className="text-sm text-gray-600">Generating task suggestions...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
              <p className="text-sm text-red-600">{error}</p>
              <button
                onClick={onSkip}
                className="mt-3 px-4 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
              >
                Continue Without Suggestions
              </button>
            </div>
          )}

          {!loading && !error && suggestions.length > 0 && (
            <div className="space-y-3">
              <p className="text-sm text-gray-600 mb-4">
                Here are some suggested tasks for <span className="font-semibold">"{eventName}"</span>:
              </p>

              {suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="bg-gray-50 border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex items-start gap-2">
                    <CheckSquare className="w-5 h-5 text-[#75619D] flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">
                        {suggestion.label}
                      </div>
                      {suggestion.description && (
                        <div className="text-xs text-gray-600 mt-1">
                          {suggestion.description}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {!loading && !error && suggestions.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200 flex gap-3">
            <button
              onClick={onSkip}
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
              Skip & Add My Own
            </button>
            <button
              onClick={handleAccept}
              className="flex-1 px-4 py-2 bg-[#75619D] text-white rounded-lg hover:bg-[#624F8A] transition-colors font-medium"
            >
              Use These Tasks
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
