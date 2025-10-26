import { MessageSquare, Plus, X, Check, Heart } from 'lucide-react';
import { useState } from 'react';
import type { Comment } from '../types/block';

interface NoteBlockProps {
  text: string;
  lastEditedBy?: string;
  comments?: Comment[];
  likes?: string[];
  currentUserId?: string;
  currentUserName?: string;
  isOrganizer?: boolean;
  onNoteChange?: (text: string, comments: Comment[], lastEditedBy?: string, likes?: string[]) => void;
}

export default function NoteBlock({
  text,
  lastEditedBy,
  comments = [],
  likes = [],
  currentUserId,
  currentUserName,
  isOrganizer = false,
  onNoteChange
}: NoteBlockProps) {
  const [noteText, setNoteText] = useState(text || '');
  const [isEditing, setIsEditing] = useState(false);
  const [showAddComment, setShowAddComment] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [savingComment, setSavingComment] = useState(false);

  const hasLiked = currentUserId ? likes.includes(currentUserId) : false;
  const likeCount = likes.length;

  const handleSaveNote = async () => {
    if (noteText.trim() === (text || '')) {
      setIsEditing(false);
      return;
    }

    onNoteChange?.(
      noteText.trim(),
      comments,
      currentUserName || currentUserId,
      likes
    );
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setNoteText(text || '');
    setIsEditing(false);
  };

  const handleToggleLike = () => {
    if (!currentUserId) return;

    const updatedLikes = hasLiked
      ? likes.filter(id => id !== currentUserId)
      : [...likes, currentUserId];

    onNoteChange?.(text, comments, lastEditedBy, updatedLikes);
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !currentUserId || !currentUserName) return;

    setSavingComment(true);
    try {
      const updatedComments = [
        ...comments,
        {
          id: `comment-${Date.now()}`,
          author: currentUserName,
          text: newComment.trim(),
          createdAt: new Date() as any
        }
      ];

      onNoteChange?.(text, updatedComments, lastEditedBy, likes);
      setNewComment('');
      setShowAddComment(false);
    } finally {
      setSavingComment(false);
    }
  };

  const handleDeleteComment = (commentId: string) => {
    if (!isOrganizer) return;

    const updatedComments = comments.filter(c => c.id !== commentId);
    onNoteChange?.(text, updatedComments, lastEditedBy, likes);
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-4">
      {/* Note Content Section */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-[#75619D]" strokeWidth={2} />
            <h3 className="text-sm font-semibold text-gray-900">Notes</h3>
          </div>
        </div>

        {isEditing && isOrganizer ? (
          <div className="space-y-2">
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Type your note here..."
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#75619D] focus:border-transparent resize-none"
              rows={4}
              autoFocus
              onBlur={handleSaveNote}
            />
            <div className="flex gap-2">
              <button
                onClick={handleSaveNote}
                className="flex-1 px-3 py-2 bg-[#75619D] text-white text-sm rounded-lg hover:bg-[#624F8A] transition-colors flex items-center justify-center gap-2 font-medium"
              >
                <Check className="w-4 h-4" />
                Save Note
              </button>
              <button
                onClick={handleCancelEdit}
                className="px-3 py-2 bg-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div
            onClick={() => isOrganizer && setIsEditing(true)}
            className={`min-h-12 p-3 bg-gray-50 rounded-lg ${isOrganizer ? 'cursor-text hover:bg-gray-100 transition-colors' : ''}`}
          >
            {noteText ? (
              <p className="text-sm text-gray-900 leading-relaxed whitespace-pre-wrap">
                {noteText}
              </p>
            ) : (
              <p className="text-sm text-gray-400 italic">
                {isOrganizer ? 'Click to add a note' : 'No notes yet'}
              </p>
            )}
          </div>
        )}

        {currentUserId && (
          <div className="mt-2 flex justify-end">
            <button
              onClick={handleToggleLike}
              className={`flex items-center gap-1 px-2 py-1 rounded-lg transition-all ${
                hasLiked
                  ? 'text-[#75619D] bg-[#BEAEDB]/20 hover:bg-[#BEAEDB]/30'
                  : 'text-gray-400 hover:text-[#75619D] hover:bg-[#BEAEDB]/20'
              }`}
              title={hasLiked ? 'Unlike' : 'Like'}
            >
              <Heart
                className="w-4 h-4"
                fill={hasLiked ? 'currentColor' : 'none'}
                strokeWidth={2}
              />
              {likeCount > 0 && (
                <span className="text-xs font-medium">{likeCount}</span>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Comments Section */}
      {comments && comments.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">
            Comments ({comments.length})
          </h3>
          <div className="space-y-2">
            {comments.map((comment) => (
              <div
                key={comment.id}
                className="bg-gray-50 border border-gray-200 rounded-lg p-3"
              >
                <div className="flex items-start justify-between mb-1">
                  <div>
                    <span className="text-sm font-medium text-gray-900">
                      {comment.author}
                    </span>
                    <span className="text-xs text-gray-400 ml-2">
                      {formatDate(comment.createdAt)}
                    </span>
                  </div>
                  {isOrganizer && (
                    <button
                      onClick={() => handleDeleteComment(comment.id)}
                      className="p-1 hover:bg-gray-200 rounded transition-colors"
                      title="Delete comment"
                    >
                      <X className="w-3.5 h-3.5 text-gray-500 hover:text-red-600" />
                    </button>
                  )}
                </div>
                <p className="text-sm text-gray-700">
                  {comment.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Comment Section */}
      {showAddComment && currentUserId && (
        <div className="bg-white border-2 border-[#75619D] rounded-lg p-3 space-y-2">
          <textarea
            placeholder="Add a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#75619D] focus:border-transparent resize-none"
            rows={2}
            autoFocus
          />
          <div className="flex gap-2">
            <button
              onClick={handleAddComment}
              disabled={savingComment || !newComment.trim()}
              className="flex-1 px-3 py-2 bg-[#75619D] text-white text-sm rounded-lg hover:bg-[#624F8A] disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {savingComment ? 'Adding...' : 'Add Comment'}
            </button>
            <button
              onClick={() => {
                setShowAddComment(false);
                setNewComment('');
              }}
              className="px-3 py-2 bg-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Add Comment Button */}
      {!showAddComment && currentUserId && (
        <button
          onClick={() => setShowAddComment(true)}
          className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-[#75619D] hover:text-[#75619D] transition-colors flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span className="text-sm font-medium">Add a comment</span>
        </button>
      )}

      {/* Debug info - remove after testing */}
      {!currentUserId && (
        <div className="text-xs text-gray-400 text-center">
          Join the event to add comments
        </div>
      )}
    </div>
  );
}
