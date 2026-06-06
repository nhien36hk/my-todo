import React from 'react';
import { Inbox, Calendar, CheckSquare, ListTodo } from 'lucide-react';
import type { Todo } from '../../api/client';

interface SidebarProps {
  activeFilter: 'inbox' | 'today' | 'completed';
  setActiveFilter: (filter: 'inbox' | 'today' | 'completed') => void;
  todos: Todo[];
}

export const Sidebar: React.FC<SidebarProps> = ({ activeFilter, setActiveFilter, todos }) => {
  const todayStr = new Date().toISOString().split('T')[0];

  // Count active todos for badges
  const inboxCount = todos.filter((t) => t.completed === 0).length;
  const todayCount = todos.filter((t) => t.completed === 0 && t.due_date === todayStr).length;

  const menuItems = [
    {
      id: 'inbox' as const,
      label: 'Hộp thư đến',
      icon: <Inbox size={18} />,
      count: inboxCount,
      color: 'text-sky-400',
    },
    {
      id: 'today' as const,
      label: 'Hôm nay',
      icon: <Calendar size={18} />,
      count: todayCount,
      color: 'text-emerald-400',
    },
    {
      id: 'completed' as const,
      label: 'Đã hoàn thành',
      icon: <CheckSquare size={18} />,
      count: 0, // No count badge needed for completed
      color: 'text-purple-400',
    },
  ];

  return (
    <div className="w-full md:w-64 bg-zinc-950 md:min-h-screen border-r border-zinc-900 p-4 flex flex-col gap-6">
      {/* Brand Logo */}
      <div className="flex items-center gap-3 px-2 py-3 border-b border-zinc-900/50">
        <div className="p-2 bg-gradient-to-tr from-emerald-600 to-emerald-400 rounded-xl shadow-lg shadow-emerald-500/20 text-zinc-950">
          <ListTodo size={20} strokeWidth={2.5} />
        </div>
        <div>
          <h1 className="text-sm font-bold text-zinc-100 tracking-wide">MYTODO</h1>
          <span className="text-[10px] text-zinc-500 font-semibold tracking-wider uppercase">Năng suất mỗi ngày</span>
        </div>
      </div>

      {/* Navigation menu */}
      <div className="flex flex-row md:flex-col gap-1 overflow-x-auto md:overflow-visible">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveFilter(item.id)}
            className={`flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 whitespace-nowrap md:w-full ${
              activeFilter === item.id
                ? 'bg-zinc-900 text-zinc-50'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span className={item.color}>{item.icon}</span>
              <span>{item.label}</span>
            </div>
            
            {item.count > 0 && (
              <span className="px-2 py-0.5 text-[9px] bg-zinc-800 text-zinc-300 rounded-full font-bold border border-zinc-700/30">
                {item.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Footer Info */}
      <div className="mt-auto hidden md:flex flex-col gap-2 p-2 bg-zinc-900/20 rounded-xl border border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider">Đồng bộ đám mây</span>
        </div>
        <p className="text-[10px] text-zinc-500 leading-normal">
          Dữ liệu SQLite được lưu tự động trên VPS.
        </p>
      </div>
    </div>
  );
};
