import { useState } from 'react';
import { BarChart3, Plus, X } from 'lucide-react';

interface VotingOption {
  text: string;
  votes: number;
  voters: string[];
}

interface VotingBlockProps {
  title?: string;
  options?: VotingOption[];
  editable?: boolean;
  onChange?: (options: VotingOption[]) => void;
}

export default function VotingBlock({
  title = 'Vote',
  options = [{ text: 'Option 1', votes: 0, voters: [] }],
  // editable prop is reserved for future use
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  editable = true,
  onChange
}: VotingBlockProps) {
  const [pollOptions, setPollOptions] = useState<VotingOption[]>(options);
  const [newOption, setNewOption] = useState('');
  const [voterName, setVoterName] = useState('');

  const totalVotes = pollOptions.reduce((sum, opt) => sum + opt.votes, 0);

  const handleVote = (index: number) => {
    if (!voterName.trim()) {
      alert('Please enter your name first!');
      return;
    }

    const updated = [...pollOptions];
    // Check if already voted
    const alreadyVoted = updated.some(opt => opt.voters.includes(voterName.trim()));
    
    if (alreadyVoted) {
      // Remove previous vote
      updated.forEach(opt => {
        opt.voters = opt.voters.filter(v => v !== voterName.trim());
        opt.votes = opt.voters.length;
      });
    }

    // Add new vote
    updated[index].voters.push(voterName.trim());
    updated[index].votes = updated[index].voters.length;
    
    setPollOptions(updated);
    onChange?.(updated);
  };

  const handleAddOption = () => {
    if (newOption.trim()) {
      const updated = [...pollOptions, { text: newOption.trim(), votes: 0, voters: [] }];
      setPollOptions(updated);
      setNewOption('');
      onChange?.(updated);
    }
  };

  const handleRemoveOption = (index: number) => {
    if (pollOptions.length > 1) {
      const updated = pollOptions.filter((_, i) => i !== index);
      setPollOptions(updated);
      onChange?.(updated);
    }
  };

  const handleEditOption = (index: number, newText: string) => {
    const updated = [...pollOptions];
    updated[index].text = newText;
    setPollOptions(updated);
    onChange?.(updated);
  };

  const getVotePercentage = (votes: number) => {
    return totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0;
  };

  return (
    <div className="p-4 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md hover:border-purple-300 transition-all duration-300 w-80">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <BarChart3 className="w-4 h-4 text-[#7B61FF]" strokeWidth={2} />
          <h4 className="text-sm font-semibold text-[#1E1E2F]">{title}</h4>
        </div>
        <span className="text-xs text-gray-500 font-medium">{totalVotes} votes</span>
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
        {pollOptions.map((option, index) => (
          <div key={index} className="group">
            <div className="flex items-center justify-between mb-1">
              <input
                type="text"
                value={option.text}
                onChange={(e) => handleEditOption(index, e.target.value)}
                className="flex-1 text-sm text-[#1E1E2F] bg-transparent border-none outline-none font-medium"
              />
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-500">{option.votes}</span>
                <button
                  onClick={() => handleRemoveOption(index)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3 text-gray-400 hover:text-red-500" strokeWidth={2} />
                </button>
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
                onClick={() => handleVote(index)}
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
    </div>
  );
}
