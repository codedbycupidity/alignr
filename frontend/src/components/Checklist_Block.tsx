import { useState } from 'react';
import { Check, Plus, X } from 'lucide-react';

interface ChecklistBlockProps {
  items?: string[];
  editable?: boolean;
  onChange?: (items: string[]) => void;
}

export default function ChecklistBlock({ items = [], editable = true, onChange }: ChecklistBlockProps) {
  const [checklist, setChecklist] = useState<{ text: string; completed: boolean }[]>(
    items.map(item => ({ text: item, completed: false }))
  );
  const [newItem, setNewItem] = useState('');

  const handleToggle = (index: number) => {
    const updated = [...checklist];
    updated[index].completed = !updated[index].completed;
    setChecklist(updated);
    onChange?.(updated.map(item => item.text));
  };

  const handleAdd = () => {
    if (newItem.trim()) {
      const updated = [...checklist, { text: newItem, completed: false }];
      setChecklist(updated);
      setNewItem('');
      onChange?.(updated.map(item => item.text));
    }
  };

  const handleRemove = (index: number) => {
    const updated = checklist.filter((_, i) => i !== index);
    setChecklist(updated);
    onChange?.(updated.map(item => item.text));
  };

  const handleEdit = (index: number, newText: string) => {
    const updated = [...checklist];
    updated[index].text = newText;
    setChecklist(updated);
    onChange?.(updated.map(item => item.text));
  };

  return (
    <div className="p-4 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md hover:border-purple-300 transition-all duration-300 w-72">
      <div className="flex items-center space-x-2 mb-3">
        <Check className="w-4 h-4 text-[#7B61FF]" strokeWidth={2} />
        <h4 className="text-sm font-semibold text-[#1E1E2F]">Checklist</h4>
      </div>

      <div className="space-y-2 mb-3">
        {checklist.map((item, index) => (
          <div key={index} className="flex items-center space-x-2 group">
            <button
              onClick={() => handleToggle(index)}
              className={`w-4 h-4 rounded border-2 flex-shrink-0 flex items-center justify-center transition-all ${
                item.completed
                  ? 'bg-[#7B61FF] border-[#7B61FF]'
                  : 'border-gray-300 hover:border-[#7B61FF]'
              }`}
            >
              {item.completed && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
            </button>
            <input
              type="text"
              value={item.text}
              onChange={(e) => handleEdit(index, e.target.value)}
              className={`flex-1 text-sm bg-transparent border-none outline-none ${
                item.completed ? 'line-through text-gray-400' : 'text-[#1E1E2F]'
              }`}
            />
            <button
              onClick={() => handleRemove(index)}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="w-3 h-3 text-gray-400 hover:text-red-500" strokeWidth={2} />
            </button>
          </div>
        ))}
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="text"
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
          placeholder="Add new item..."
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
