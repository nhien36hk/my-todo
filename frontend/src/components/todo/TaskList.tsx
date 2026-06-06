import React from 'react';
import type { Todo } from '../../api/client';
import { TaskItem } from './TaskItem';
import { Inbox, CheckCircle2 } from 'lucide-react';

interface TaskListProps {
  todos: Todo[];
  filter: 'inbox' | 'today' | 'completed';
  onUpdate: (id: number, data: Partial<Todo>) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}

export const TaskList: React.FC<TaskListProps> = ({ todos, filter, onUpdate, onDelete }) => {
  const getFilteredTodos = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    
    switch (filter) {
      case 'today':
        return todos.filter((todo) => todo.completed === 0 && todo.due_date === todayStr);
      case 'completed':
        return todos.filter((todo) => todo.completed === 1);
      case 'inbox':
      default:
        return todos.filter((todo) => todo.completed === 0);
    }
  };

  const filtered = getFilteredTodos();

  if (filtered.length === 0) {
    return (
      <div className="w-full py-16 flex flex-col items-center justify-center text-center gap-4 bg-zinc-900/10 rounded-2xl border border-zinc-800/30 p-8">
        <div className="p-4 bg-zinc-900/50 rounded-full text-zinc-600 border border-zinc-800">
          {filter === 'completed' ? (
            <CheckCircle2 size={32} />
          ) : (
            <Inbox size={32} />
          )}
        </div>
        <div>
          <h3 className="text-sm font-semibold text-zinc-300">
            {filter === 'completed' ? 'Chưa có công việc nào hoàn thành' : 'Tất cả đã hoàn thành!'}
          </h3>
          <p className="text-xs text-zinc-500 mt-1 max-w-[280px]">
            {filter === 'completed' 
              ? 'Hãy hoàn thành các công việc hôm nay để lấp đầy biểu đồ nhiệt xanh lá.'
              : 'Tuyệt vời! Bạn không còn công việc nào cần giải quyết ở mục này.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col bg-zinc-900/10 border border-zinc-800/40 rounded-xl overflow-hidden">
      {filtered.map((todo) => (
        <TaskItem
          key={todo.id}
          todo={todo}
          onUpdate={onUpdate}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};
