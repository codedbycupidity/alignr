import { useState, useCallback } from 'react';
import { BarChart3, Plus, X } from 'lucide-react';
import { PollBlock as IPollBlock, PollBlockContent, PollOption } from '../types/block';
import { v4 as uuidv4 } from 'uuid';

interface PollBlockProps {
  block: IPollBlock;
  editable?: boolean;
  onChange?: (content: PollBlockContent) => void;
}

export default function PollBlock({
  block,
  editable = true,
  onChange
}: PollBlockProps) {
  const [pollContent, setPollContent] = useState<PollBlockContent>(block.content);
  const [newOption, setNewOption] = useState('');
  const [voterName, setVoterName] = useState('');

  const updateContent = useCallback((updatedContent: Partial<PollBlockContent>) => {
    const newContent = {
      ...pollContent,
      ...updatedContent,
      totalVotes: pollContent.options.reduce((sum, opt) => sum + opt.votes, 0)
    };
    setPollContent(newContent);
    onChange?.(newContent);
  }, [pollContent, onChange]);

  const handleVote = (optionId: string) => {
    if (!voterName.trim()) {
      alert('Please enter your name first!');
      return;
    }

    const updatedOptions = pollContent.options.map(opt => {
      if (opt.id === optionId) {
        const alreadyVoted = opt.voters.includes(voterName.trim());
        
        if (alreadyVoted) {
          return {
            ...opt,
            voters: opt.voters.filter(v => v !== voterName.trim()),
            votes: opt.voters.length - 1
          };
        }

        if (!pollContent.allowMultipleVotes) {
          // Remove vote from other options
          pollContent.options.forEach(o => {
            if (o.id !== optionId) {
              o.voters = o.voters.filter(v => v !== voterName.trim());
              o.votes = o.voters.length;
            }
          });
        }

        return {
          ...opt,
          voters: [...opt.voters, voterName.trim()],
          votes: opt.voters.length + 1
        };
      }
      return opt;
    });

    updateContent({ options: updatedOptions });
  };

  const handleAddOption = () => {
    if (newOption.trim()) {
      const newPollOption: PollOption = {
        id: uuidv4(),
        text: newOption.trim(),
        votes: 0,
        voters: []
      };
      
      updateContent({ 
        options: [...pollContent.options, newPollOption]
      });
      setNewOption('');
    }
  };

  const handleRemoveOption = (optionId: string) => {
    if (pollContent.options.length > 1) {
      updateContent({
        options: pollContent.options.filter(opt => opt.id !== optionId)
      });
    }
  };

  const handleEditOption = (optionId: string, newText: string) => {
    updateContent({
      options: pollContent.options.map(opt =>
        opt.id === optionId ? { ...opt, text: newText } : opt
      )
    });
  };

  const getVotePercentage = (votes: number) => {
    return pollContent.totalVotes > 0 ? Math.round((votes / pollContent.totalVotes) * 100) : 0;
  };

  return (
    <div className="p-4 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md hover:border-purple-300 transition-all duration-300 w-80">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <BarChart3 className="w-4 h-4 text-[#7B61FF]" strokeWidth={2} />
          <h4 className="text-sm font-semibold text-[#1E1E2F]">{pollContent.title}</h4>
        </div>
        <span className="text-xs text-gray-500 font-medium">{pollContent.totalVotes} votes</span>
      </div>

      {/* Voter Name Input */}
      <div className="mb-3">
        <input
          type="text"
          value={voterName}
          onChange={(e) => setVoterName(e.target.value)}
          placeholder="Your name..."
          className="w-full text-xs text-[#1E1E2F] bg-gray-50 px-2 py-1.5 rounded border border-gray-200 focus:border-[#7B61FF] focus:outline-none"
        />
      </div>

      {/* Options */}
      <div className="space-y-2 mb-3 max-h-64 overflow-y-auto">
        {pollContent.options.map(option => (
          <div key={option.id} className="group">
            <div className="flex items-center justify-between mb-1">
              <input
                type="text"
                value={option.text}
                onChange={(e) => handleEditOption(option.id, e.target.value)}
                disabled={!editable}
                className="flex-1 text-sm text-[#1E1E2F] bg-transparent border-none outline-none font-medium disabled:opacity-50"
              />
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-500">{option.votes}</span>
                {editable && (
                  <button
                    onClick={() => handleRemoveOption(option.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3 text-gray-400 hover:text-red-500" strokeWidth={2} />
                  </button>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-[#7B61FF] to-[#A78BFA] transition-all duration-500"
                  style={{ width: `${getVotePercentage(option.votes)}%` }}
                ></div>
              </div>
              <button
                onClick={() => handleVote(option.id)}
                disabled={!voterName.trim()}
                className={`text-xs px-2 py-1 rounded transition-colors ${
                  option.voters.includes(voterName.trim())
                    ? 'bg-[#7B61FF] text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-[#7B61FF]/10'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                Vote
              </button>
            </div>
            {option.voters.length > 0 && (
              <div className="mt-1 text-xs text-gray-400">
                {option.voters.slice(0, 3).join(', ')}
                {option.voters.length > 3 && ` +${option.voters.length - 3} more`}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add New Option */}
      {editable && (
        <div className="flex items-center space-x-2 pt-2 border-t border-gray-100">
          <input
            type="text"
            value={newOption}
            onChange={(e) => setNewOption(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddOption()}
            placeholder="Add option..."
            className="flex-1 text-xs text-[#1E1E2F] bg-gray-50 px-2 py-1.5 rounded border border-gray-200 focus:border-[#7B61FF] focus:outline-none"
          />
          <button
            onClick={handleAddOption}
            className="p-1.5 bg-[#7B61FF] text-white rounded hover:bg-[#6B51E0] transition-colors"
          >
            <Plus className="w-3 h-3" strokeWidth={2} />
          </button>
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