import React from 'react';
import { Inbox, Calendar, CalendarDays, CheckSquare, ListTodo, LogOut } from 'lucide-react';
import type { Todo } from '../../api/client';
import { useAuth } from '../../hooks/useAuth';

interface SidebarProps {
  activeFilter: 'inbox' | 'today' | 'upcoming' | 'completed';
  setActiveFilter: (filter: 'inbox' | 'today' | 'upcoming' | 'completed') => void;
  todos: Todo[];
}

export const Sidebar: React.FC<SidebarProps> = ({ activeFilter, setActiveFilter, todos }) => {
  const { user, logout } = useAuth();
  const todayStr = new Date().toISOString().split('T')[0];

  // Count active todos for badges
  const inboxCount = todos.filter((t) => t.completed === 0).length;
  const todayCount = todos.filter((t) => t.completed === 0 && t.due_date === todayStr).length;
  const upcomingCount = todos.filter((t) => t.completed === 0 && t.due_date && t.due_date > todayStr).length;

  const menuItems = [
    {
      id: 'inbox' as const,
      label: 'Hộp thư đến',
      icon: <Inbox size={20} />,
      count: inboxCount,
      color: 'text-sky-400',
    },
    {
      id: 'today' as const,
      label: 'Hôm nay',
      icon: <Calendar size={20} />,
      count: todayCount,
      color: 'text-emerald-400',
    },
    {
      id: 'upcoming' as const,
      label: 'Sắp tới',
      icon: <CalendarDays size={20} />,
      count: upcomingCount,
      color: 'text-amber-400',
    },
    {
      id: 'completed' as const,
      label: 'Hoàn thành',
      icon: <CheckSquare size={20} />,
      count: 0, 
      color: 'text-purple-400',
    },
  ];

  return (
    <>
      {/* DESKTOP SIDEBAR */}
      <div className="hidden md:flex w-64 bg-zinc-950/40 backdrop-blur-2xl min-h-screen border-r border-white/5 p-4 flex-col gap-6 relative z-20 shadow-[4px_0_24px_rgba(0,0,0,0.2)]">
        {/* Brand Logo */}
        <div className="flex items-center justify-between px-2 py-3 border-b border-zinc-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-tr from-emerald-600 to-emerald-400 rounded-xl shadow-lg shadow-emerald-500/20 text-zinc-950">
              <ListTodo size={20} strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-sm font-bold text-zinc-100 tracking-wide">MYTODO</h1>
              <span className="text-[10px] text-zinc-500 font-semibold tracking-wider uppercase truncate max-w-[100px] block">
                {user?.name || 'Cá nhân'}
              </span>
            </div>
          </div>
          <button onClick={logout} title="Đăng xuất" className="p-2 text-zinc-500 hover:text-red-400 transition-colors bg-zinc-900/50 hover:bg-red-950/30 rounded-lg">
            <LogOut size={16} />
          </button>
        </div>

        {/* Navigation menu */}
        <div className="flex flex-col gap-1">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveFilter(item.id)}
              className={`flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 w-full ${
                activeFilter === item.id
                  ? 'bg-zinc-900 text-zinc-50 shadow-inner'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={item.color}>{item.icon}</span>
                <span>{item.label}</span>
              </div>
              
              {item.count > 0 && (
                <span className="px-2 py-0.5 text-[10px] bg-zinc-800 text-zinc-300 rounded-full font-bold border border-zinc-700/30">
                  {item.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Footer Info */}
        <div className="mt-auto flex flex-col gap-2 p-3 bg-zinc-900/20 rounded-xl border border-white/5">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">MongoDB Đã kết nối</span>
          </div>
          <p className="text-[10px] text-zinc-500 leading-normal">
            Dữ liệu được mã hoá và lưu độc lập cho tài khoản của bạn.
          </p>
        </div>
      </div>

      {/* MOBILE HEADER (Logo & Logout) */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-zinc-950/80 backdrop-blur-xl border-b border-white/5 sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-gradient-to-tr from-emerald-600 to-emerald-400 rounded-lg text-zinc-950">
            <ListTodo size={16} strokeWidth={2.5} />
          </div>
          <span className="text-sm font-bold tracking-wide">MYTODO</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-zinc-400 font-medium truncate max-w-[100px]">{user?.name}</span>
          <button onClick={logout} className="text-zinc-400 hover:text-red-400 p-1">
            <LogOut size={18} />
          </button>
        </div>
      </div>

      {/* MOBILE BOTTOM NAVIGATION */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-zinc-950/90 backdrop-blur-2xl border-t border-white/10 z-40 pb-safe">
        <div className="flex justify-around items-center p-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveFilter(item.id)}
              className={`flex flex-col items-center gap-1 p-2 min-w-[64px] rounded-xl transition-all ${
                activeFilter === item.id ? 'text-zinc-50' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <div className="relative">
                <span className={activeFilter === item.id ? item.color : 'text-inherit'}>
                  {item.icon}
                </span>
                {item.count > 0 && (
                  <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 flex items-center justify-center text-[9px] bg-red-500 text-white rounded-full font-bold px-1">
                    {item.count}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-semibold">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
};
