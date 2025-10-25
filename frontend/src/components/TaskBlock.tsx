import { CheckSquare, Plus, X, User } from 'lucide-react';
import { useState } from 'react';
import type { Task } from '../types/block';

interface TaskBlockProps {
  tasks: Task[];
  currentUserId?: string;
  currentUserName?: string;
  participantNames?: Map<string, string>;
  isOrganizer?: boolean;
  onTasksChange?: (tasks: Task[]) => void;
}

export default function TaskBlock({
  tasks,
  currentUserId,
  currentUserName,
  participantNames,
  isOrganizer = false,
  onTasksChange
}: TaskBlockProps) {
  const [newTaskLabel, setNewTaskLabel] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [showAddTask, setShowAddTask] = useState(false);

  const handleAddTask = () => {
    if (!newTaskLabel.trim()) return;

    const newTask: Task = {
      id: `task-${Date.now()}`,
      label: newTaskLabel.trim(),
      description: newTaskDescription.trim(),
      completed: false
    };

    onTasksChange?.([...tasks, newTask]);
    setNewTaskLabel('');
    setNewTaskDescription('');
    setShowAddTask(false);
  };

  const handleClaimTask = (taskId: string) => {
    if (!currentUserId || !currentUserName) return;

    const updatedTasks = tasks.map(task => {
      if (task.id === taskId) {
        const isUnclaiming = task.claimedBy === currentUserId;
        if (isUnclaiming) {
          // Remove claimedBy field entirely when unclaiming
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { claimedBy, ...taskWithoutClaim } = task;
          return taskWithoutClaim;
        } else {
          // Add claimedBy when claiming
          return { ...task, claimedBy: currentUserId };
        }
      }
      return task;
    });

    onTasksChange?.(updatedTasks);
  };

  const handleDeleteTask = (taskId: string) => {
    const updatedTasks = tasks.filter(task => task.id !== taskId);
    onTasksChange?.(updatedTasks);
  };

  return (
    <div className="space-y-3">
      {/* Task List */}
      {tasks.length > 0 && (
        <div className="space-y-2">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="bg-white border border-gray-200 rounded-lg p-3"
            >
              <div className="flex items-start gap-2">
                {/* Task Content */}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900">
                    {task.label}
                  </div>
                  {task.description && (
                    <div className="text-xs text-gray-500 mt-0.5">
                      {task.description}
                    </div>
                  )}
                  {task.claimedBy && (
                    <div className="flex items-center gap-1 mt-1">
                      <User className="w-3 h-3 text-[#75619D]" />
                      <span className="text-xs text-[#75619D] font-medium">
                        {participantNames?.get(task.claimedBy) || 'Claimed'}
                      </span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  {currentUserId && !isOrganizer && (
                    <>
                      {/* Only show claim/unclaim if not claimed by someone else */}
                      {(!task.claimedBy || task.claimedBy === currentUserId) && (
                        <button
                          onClick={() => handleClaimTask(task.id)}
                          className={`px-2 py-1 text-xs rounded transition-colors ${
                            task.claimedBy === currentUserId
                              ? 'bg-[#75619D] text-white hover:bg-[#624F8A]'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {task.claimedBy === currentUserId ? 'Unclaim' : 'Claim'}
                        </button>
                      )}
                    </>
                  )}
                  {isOrganizer && (
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="p-1 hover:bg-gray-200 rounded transition-colors"
                    >
                      <X className="w-4 h-4 text-gray-500 hover:text-gray-700" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Task Form */}
      {showAddTask && isOrganizer && (
        <div className="bg-white border-2 border-[#75619D] rounded-lg p-3 space-y-2">
          <input
            type="text"
            placeholder="Task title..."
            value={newTaskLabel}
            onChange={(e) => setNewTaskLabel(e.target.value)}
            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#75619D] focus:border-transparent"
            autoFocus
          />
          <input
            type="text"
            placeholder="Description (optional)..."
            value={newTaskDescription}
            onChange={(e) => setNewTaskDescription(e.target.value)}
            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#75619D] focus:border-transparent"
          />
          <div className="flex gap-2">
            <button
              onClick={handleAddTask}
              className="flex-1 px-3 py-1.5 bg-[#75619D] text-white text-sm rounded hover:bg-[#624F8A] transition-colors"
            >
              Add Task
            </button>
            <button
              onClick={() => {
                setShowAddTask(false);
                setNewTaskLabel('');
                setNewTaskDescription('');
              }}
              className="px-3 py-1.5 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Add Task Button */}
      {!showAddTask && isOrganizer && (
        <button
          onClick={() => setShowAddTask(true)}
          className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-[#75619D] hover:text-[#75619D] transition-colors flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span className="text-sm font-medium">Add Task</span>
        </button>
      )}

      {/* Empty State */}
      {tasks.length === 0 && !showAddTask && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
          <CheckSquare className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-600">No tasks yet</p>
        </div>
      )}
    </div>
  );
}
