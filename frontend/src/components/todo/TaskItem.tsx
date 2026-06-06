import React, { useState } from 'react';
import type { Todo } from '../../api/client';
import { Trash2, Edit2, Check, X, Calendar } from 'lucide-react';

interface TaskItemProps {
  todo: Todo;
  onUpdate: (id: number, data: Partial<Todo>) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}

export const TaskItem: React.FC<TaskItemProps> = ({ todo, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(todo.title);
  const [editDescription, setEditDescription] = useState(todo.description);
  const [editDueDate, setEditDueDate] = useState(todo.due_date || '');
  const [editPriority, setEditPriority] = useState(todo.priority);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Format due date to Vietnamese readable date
  const formatDueDate = (dateStr: string | null) => {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    return d.toLocaleDateString('vi-VN', { day: 'numeric', month: 'short' });
  };

  const handleToggleComplete = async () => {
    try {
      await onUpdate(todo.id, { completed: todo.completed === 1 ? 0 : 1 });
    } catch (e) {
      alert('Không thể cập nhật trạng thái hoàn thành.');
    }
  };

  const handleSaveEdit = async () => {
    if (!editTitle.trim()) return;
    setIsSaving(true);
    try {
      await onUpdate(todo.id, {
        title: editTitle.trim(),
        description: editDescription.trim(),
        due_date: editDueDate || null,
        priority: editPriority,
      });
      setIsEditing(false);
    } catch (e) {
      alert('Không thể cập nhật công việc.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa công việc này không?')) {
      setIsDeleting(true);
      try {
        await onDelete(todo.id);
      } catch (e) {
        alert('Không thể xóa công việc.');
        setIsDeleting(false);
      }
    }
  };

  // Priority badge styling
  const getPriorityColor = (p: string) => {
    switch (p) {
      case 'high':
        return { border: 'border-red-500/30', text: 'text-red-400', bg: 'bg-red-950/20' };
      case 'medium':
        return { border: 'border-amber-500/30', text: 'text-amber-400', bg: 'bg-amber-950/20' };
      case 'low':
      default:
        return { border: 'border-zinc-700/40', text: 'text-zinc-400', bg: 'bg-zinc-800/20' };
    }
  };

  const priorityStyle = getPriorityColor(todo.priority);

  if (isEditing) {
    return (
      <div className="w-full bg-zinc-900/60 border border-white/5 rounded-xl p-4 flex flex-col gap-3">
        <input
          type="text"
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          disabled={isSaving}
          className="w-full bg-transparent border-0 border-b border-zinc-800 focus:border-emerald-500 text-sm font-medium text-zinc-100 placeholder-zinc-500 py-1 focus:ring-0 focus:outline-none transition-colors"
        />
        <textarea
          value={editDescription}
          onChange={(e) => setEditDescription(e.target.value)}
          disabled={isSaving}
          rows={2}
          className="w-full bg-transparent border-none text-xs text-zinc-300 placeholder-zinc-500 p-0 focus:ring-0 focus:outline-none resize-none"
        />
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-zinc-800">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-zinc-400">
              <Calendar size={14} />
              <input
                type="date"
                value={editDueDate}
                onChange={(e) => setEditDueDate(e.target.value)}
                disabled={isSaving}
                className="bg-zinc-800/40 text-zinc-200 border border-zinc-700/30 rounded-lg text-xs py-1 px-2 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
            <select
              value={editPriority}
              onChange={(e) => setEditPriority(e.target.value as any)}
              disabled={isSaving}
              className="bg-zinc-800/40 text-zinc-200 border border-zinc-700/30 rounded-lg text-xs py-1 px-2 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
            >
              <option value="low">Thấp</option>
              <option value="medium">Trung bình</option>
              <option value="high">Cao</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsEditing(false)}
              disabled={isSaving}
              className="p-1.5 text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              <X size={16} />
            </button>
            <button
              onClick={handleSaveEdit}
              disabled={isSaving || !editTitle.trim()}
              className="p-1.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 rounded-lg transition-colors"
            >
              <Check size={16} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full flex items-start gap-3 p-4 bg-zinc-900/25 border-b border-zinc-800/50 hover:bg-zinc-900/40 transition-all duration-200 group ${todo.completed === 1 ? 'opacity-60' : ''}`}>
      {/* Complete Checkbox */}
      <button
        onClick={handleToggleComplete}
        className={`w-5 h-5 rounded-full flex items-center justify-center border-2 mt-0.5 transition-all duration-200 ${
          todo.completed === 1
            ? 'bg-emerald-500 border-emerald-500 text-zinc-950'
            : 'border-zinc-600 hover:border-emerald-500 text-transparent hover:text-emerald-500/30'
        }`}
      >
        <Check size={12} strokeWidth={3} />
      </button>

      {/* Task text content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-4">
          <h3 className={`text-sm font-medium text-zinc-100 break-words ${todo.completed === 1 ? 'line-through text-zinc-500' : ''}`}>
            {todo.title}
          </h3>
          
          {/* Action buttons (Visible on hover) */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => setIsEditing(true)}
              className="p-1 text-zinc-400 hover:text-zinc-200 transition-colors"
              title="Sửa công việc"
            >
              <Edit2 size={14} />
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="p-1 text-zinc-400 hover:text-red-400 transition-colors"
              title="Xóa công việc"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>

        {todo.description && (
          <p className="text-xs text-zinc-400 mt-1 break-words whitespace-pre-line">
            {todo.description}
          </p>
        )}

        {/* Badges bar */}
        <div className="flex items-center gap-2 mt-2">
          {/* Priority badge */}
          <span className={`text-[10px] px-2 py-0.5 rounded-full border ${priorityStyle.bg} ${priorityStyle.border} ${priorityStyle.text}`}>
            {todo.priority === 'high' ? 'Khẩn cấp' : todo.priority === 'medium' ? 'Trung bình' : 'Thấp'}
          </span>

          {/* Due date badge */}
          {todo.due_date && (
            <span className="text-[10px] text-zinc-400 flex items-center gap-1">
              <Calendar size={10} />
              {formatDueDate(todo.due_date)}
            </span>
          )}

          {/* Completed date badge */}
          {todo.completed === 1 && todo.completed_at && (
            <span className="text-[10px] text-emerald-400 font-medium">
              Xong ngày {formatDueDate(todo.completed_at)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
