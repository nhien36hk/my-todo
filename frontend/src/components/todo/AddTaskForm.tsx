import React, { useState } from 'react';
import { Plus, Calendar, AlertCircle } from 'lucide-react';

interface AddTaskFormProps {
  onAdd: (todo: { title: string; description?: string; due_date?: string | null; priority?: string; category?: string }) => Promise<void>;
}

export const AddTaskForm: React.FC<AddTaskFormProps> = ({ onAdd }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [category, setCategory] = useState('Chung');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Tiêu đề công việc là bắt buộc.');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);

    try {
      await onAdd({
        title: title.trim(),
        description: description.trim() || undefined,
        due_date: dueDate || null,
        priority,
        category,
      });
      // Reset form
      setTitle('');
      setDescription('');
      setDueDate('');
      setPriority('medium');
      setCategory('Chung');
      setIsOpen(false);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Không thể tạo công việc. Vui lòng kiểm tra dữ liệu.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="w-full flex items-center gap-3 px-4 py-3 bg-zinc-900/40 hover:bg-zinc-800/40 text-zinc-400 hover:text-zinc-200 rounded-xl border border-dashed border-zinc-800 hover:border-zinc-700 transition-all duration-200 text-sm font-medium"
      >
        <Plus size={16} />
        Thêm công việc mới...
      </button>
    );
  }

  return (
    <form 
      onSubmit={handleSubmit}
      className="w-full bg-zinc-900/60 border border-white/5 rounded-xl p-4 flex flex-col gap-3 transition-all duration-300"
    >
      {error && (
        <div className="flex items-center gap-2 p-2 bg-red-950/40 border border-red-800/30 text-red-400 rounded-lg text-xs">
          <AlertCircle size={14} />
          <span>{error}</span>
        </div>
      )}

      {/* Title input */}
      <input
        type="text"
        placeholder="Tên công việc"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        disabled={isSubmitting}
        className="w-full bg-transparent border-0 border-b border-zinc-800 focus:border-emerald-500 text-sm font-medium text-zinc-100 placeholder-zinc-500 py-1 focus:ring-0 focus:outline-none transition-colors"
      />

      {/* Description input */}
      <textarea
        placeholder="Mô tả công việc (tùy chọn)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        disabled={isSubmitting}
        rows={2}
        className="w-full bg-transparent border-none text-xs text-zinc-300 placeholder-zinc-500 p-0 focus:ring-0 focus:outline-none resize-none"
      />

      {/* Action panel (Priority & Due date & Category) */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-zinc-800">
        <div className="flex items-center gap-3 flex-wrap">
          {/* Due date picker */}
          <div className="flex items-center gap-1 text-zinc-400 relative">
            <Calendar size={14} />
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              disabled={isSubmitting}
              className="bg-zinc-800/40 hover:bg-zinc-800 text-zinc-200 border border-zinc-700/30 rounded-lg text-xs py-1 px-1.5 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          {/* Priority selector */}
          <div className="flex items-center gap-1">
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as any)}
              disabled={isSubmitting}
              className="bg-zinc-800/40 hover:bg-zinc-800 text-zinc-200 border border-zinc-700/30 rounded-lg text-xs py-1 px-1.5 focus:ring-1 focus:ring-emerald-500 focus:outline-none cursor-pointer"
            >
              <option value="low" className="bg-zinc-900">Thấp</option>
              <option value="medium" className="bg-zinc-900">Trung bình</option>
              <option value="high" className="bg-zinc-900">Cao</option>
            </select>
          </div>

          {/* Category selector */}
          <div className="flex items-center gap-1">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              disabled={isSubmitting}
              className="bg-zinc-800/40 hover:bg-zinc-800 text-cyan-400 border border-zinc-700/30 rounded-lg text-xs py-1 px-1.5 focus:ring-1 focus:ring-cyan-500 focus:outline-none cursor-pointer font-semibold"
            >
              <option value="Chung" className="bg-zinc-900 text-zinc-300">Chung</option>
              <option value="Công việc" className="bg-zinc-900 text-zinc-300">Công việc</option>
              <option value="Cá nhân" className="bg-zinc-900 text-zinc-300">Cá nhân</option>
              <option value="Học tập" className="bg-zinc-900 text-zinc-300">Học tập</option>
            </select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            disabled={isSubmitting}
            className="px-3 py-1.5 text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !title.trim()}
            className="px-3 py-1.5 text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 disabled:bg-emerald-950/40 disabled:text-emerald-800 text-zinc-950 rounded-lg transition-all"
          >
            {isSubmitting ? 'Đang tạo...' : 'Thêm'}
          </button>
        </div>
      </div>
    </form>
  );
};
