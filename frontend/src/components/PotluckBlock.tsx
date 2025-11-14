import { Plus, X, Edit2, Check } from 'lucide-react';
import { useState } from 'react';
import { Timestamp } from 'firebase/firestore';
import type { PotluckItem } from '../types/block';

interface Participant {
  id: string;
  name: string;
}

interface PotluckBlockProps {
  items: PotluckItem[];
  currentUserId?: string;
  currentUserName?: string;
  participants?: Participant[];
  isOrganizer?: boolean;
  onItemsChange?: (items: PotluckItem[]) => void;
}

export default function PotluckBlock({
  items,
  currentUserId,
  currentUserName,
  participants = [],
  isOrganizer = false,
  onItemsChange
}: PotluckBlockProps) {
  const [newItem, setNewItem] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [showAddItem, setShowAddItem] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  const [editingDescription, setEditingDescription] = useState('');

  const handleAddItem = () => {
    if (!newItem.trim() || !currentUserId || !currentUserName) return;

    const item: PotluckItem = {
      id: `potluck-${Date.now()}`,
      item: newItem.trim(),
      ...(newDescription.trim() && { description: newDescription.trim() }),
      participantId: currentUserId,
      participantName: currentUserName,
      createdAt: Timestamp.now()
    };

    onItemsChange?.([...items, item]);
    setNewItem('');
    setNewDescription('');
    setShowAddItem(false);
  };

  const handleStartEdit = (item: PotluckItem) => {
    setEditingItemId(item.id);
    setEditingText(item.item);
    setEditingDescription(item.description || '');
  };

  const handleSaveEdit = (itemId: string) => {
    if (!editingText.trim()) return;

    const updatedItems = items.map(item => {
      if (item.id === itemId) {
        const updatedItem: PotluckItem = {
          ...item,
          item: editingText.trim()
        };

        // Only include description if it has a value
        if (editingDescription.trim()) {
          updatedItem.description = editingDescription.trim();
        } else {
          // Remove description field if it's empty
          delete updatedItem.description;
        }

        return updatedItem;
      }
      return item;
    });

    onItemsChange?.(updatedItems);
    setEditingItemId(null);
    setEditingText('');
    setEditingDescription('');
  };

  const handleCancelEdit = () => {
    setEditingItemId(null);
    setEditingText('');
    setEditingDescription('');
  };

  const handleDeleteItem = (itemId: string) => {
    const updatedItems = items.filter(item => item.id !== itemId);
    onItemsChange?.(updatedItems);
  };

  const canEditOrDelete = (item: PotluckItem) => {
    return isOrganizer || item.participantId === currentUserId;
  };

  // Helper function to get participant name by ID
  const getParticipantName = (participantId: string, fallbackName: string) => {
    const participant = participants.find(p => p.id === participantId);
    return participant?.name || fallbackName;
  };

  return (
    <div className="space-y-3">
      {/* Add Item Button */}
      {!showAddItem && currentUserId && (
        <button
          onClick={() => setShowAddItem(true)}
          className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-[#75619D] hover:text-[#75619D] transition-colors flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span className="text-sm font-medium">Add Item to Bring</span>
        </button>
      )}

      {/* Add Item Form */}
      {showAddItem && currentUserId && (
        <div className="bg-white border-2 border-[#75619D] rounded-lg p-3 space-y-2">
          <input
            type="text"
            placeholder="What are you bringing?"
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#75619D] focus:border-transparent"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleAddItem();
              } else if (e.key === 'Escape') {
                setShowAddItem(false);
                setNewItem('');
                setNewDescription('');
              }
            }}
          />
          <input
            type="text"
            placeholder="Description (optional)"
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
            className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#75619D] focus:border-transparent"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleAddItem();
              } else if (e.key === 'Escape') {
                setShowAddItem(false);
                setNewItem('');
                setNewDescription('');
              }
            }}
          />
          <div className="flex gap-2">
            <button
              onClick={handleAddItem}
              className="flex-1 px-3 py-1.5 bg-[#75619D] text-white text-sm rounded hover:bg-[#624F8A] transition-colors"
            >
              Add Item
            </button>
            <button
              onClick={() => {
                setShowAddItem(false);
                setNewItem('');
                setNewDescription('');
              }}
              className="px-3 py-1.5 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Items List */}
      {items.length > 0 && (
        <div className="space-y-2">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-white border border-gray-200 rounded-lg p-3"
            >
              <div className="flex items-start gap-2">
                {/* Item Content */}
                <div className="flex-1 min-w-0">
                  {editingItemId === item.id ? (
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <div className="flex-1 space-y-1">
                          <input
                            type="text"
                            value={editingText}
                            onChange={(e) => setEditingText(e.target.value)}
                            placeholder="Item name"
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#75619D] focus:border-transparent"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSaveEdit(item.id);
                              } else if (e.key === 'Escape') {
                                handleCancelEdit();
                              }
                            }}
                          />
                          <input
                            type="text"
                            value={editingDescription}
                            onChange={(e) => setEditingDescription(e.target.value)}
                            placeholder="Description (optional)"
                            className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#75619D] focus:border-transparent"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSaveEdit(item.id);
                              } else if (e.key === 'Escape') {
                                handleCancelEdit();
                              }
                            }}
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <button
                            onClick={() => handleSaveEdit(item.id)}
                            className="p-1 hover:bg-green-100 rounded transition-colors"
                          >
                            <Check className="w-4 h-4 text-green-600" />
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="p-1 hover:bg-gray-200 rounded transition-colors"
                          >
                            <X className="w-4 h-4 text-gray-500" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="text-sm font-medium text-gray-900">
                        {item.item}
                      </div>
                      {item.description && (
                        <div className="text-xs text-gray-600 mt-0.5">
                          {item.description}
                        </div>
                      )}
                      <div className="text-xs text-gray-500 mt-0.5">
                        {getParticipantName(item.participantId, item.participantName)}
                      </div>
                    </>
                  )}
                </div>

                {/* Actions */}
                {editingItemId !== item.id && canEditOrDelete(item) && (
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => handleStartEdit(item)}
                      className="p-1 hover:bg-gray-200 rounded transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4 text-gray-500 hover:text-gray-700" />
                    </button>
                    <button
                      onClick={() => handleDeleteItem(item.id)}
                      className="p-1 hover:bg-gray-200 rounded transition-colors"
                      title="Delete"
                    >
                      <X className="w-4 h-4 text-gray-500 hover:text-gray-700" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {items.length === 0 && !showAddItem && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
          <div className="text-2xl mb-2">🍽️</div>
          <p className="text-sm text-gray-600">No items yet</p>
          <p className="text-xs text-gray-500 mt-1">
            {currentUserId ? 'Add what you\'re bringing!' : 'Sign in to contribute'}
          </p>
        </div>
      )}
    </div>
  );
}
