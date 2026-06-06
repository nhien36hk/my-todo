import { useState, useEffect } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { Heatmap } from './components/heatmap/Heatmap';
import { AddTaskForm } from './components/todo/AddTaskForm';
import { TaskList } from './components/todo/TaskList';
import { Auth } from './components/auth/Auth';
import { todoApi } from './api/client';
import type { Todo, HeatmapData } from './api/client';
import { AlertCircle, RefreshCw, CalendarDays } from 'lucide-react';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<any>(null);

  const [todos, setTodos] = useState<Todo[]>([]);
  const [heatmapData, setHeatmapData] = useState<HeatmapData[]>([]);
  const [activeFilter, setActiveFilter] = useState<'inbox' | 'today' | 'upcoming' | 'completed'>('inbox');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');

  // Check auth state on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
      setIsAuthenticated(true);
    } else {
      setIsLoading(false);
    }

    const handleAuthError = () => {
      setIsAuthenticated(false);
      setUser(null);
    };
    window.addEventListener('auth_error', handleAuthError);
    return () => window.removeEventListener('auth_error', handleAuthError);
  }, []);

  const handleLoginSuccess = (userData: any, _token: string) => {
    setUser(userData);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUser(null);
    setTodos([]);
    setHeatmapData([]);
    setSearchQuery('');
  };

  // Fetch all data from backend
  const fetchData = async () => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    setError(null);
    try {
      const [todosList, heatmap] = await Promise.all([
        todoApi.getAll(),
        todoApi.getHeatmap()
      ]);
      setTodos(todosList);
      setHeatmapData(heatmap);

      // Reminder Logic
      const todayStr = new Date().toISOString().split('T')[0];
      const dueToday = todosList.filter((t: Todo) => t.completed === 0 && t.due_date === todayStr);
      if (dueToday.length > 0 && 'Notification' in window) {
        if (Notification.permission === 'granted') {
          const alreadyNotified = sessionStorage.getItem('notified_today');
          if (alreadyNotified !== todayStr) {
            new Notification('MyTodo Nhắc Nhở 🔔', {
              body: `Bạn có ${dueToday.length} công việc cần hoàn thành hôm nay!`,
              icon: '/favicon.svg'
            });
            sessionStorage.setItem('notified_today', todayStr);
          }
        } else if (Notification.permission !== 'denied') {
          Notification.requestPermission();
        }
      }
    } catch (err: any) {
      console.error(err);
      setError('Không thể lấy dữ liệu. Vui lòng kiểm tra kết nối.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [isAuthenticated]);

  // API Call wrappers
  const handleAddTodo = async (todoData: { title: string; description?: string; due_date?: string | null; priority?: string; category?: string }) => {
    try {
      const newTodo = await todoApi.create(todoData);
      setTodos((prev) => [newTodo, ...prev]);
      
      const heatmap = await todoApi.getHeatmap();
      setHeatmapData(heatmap);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Có lỗi xảy ra khi tạo công việc.');
      throw err;
    }
  };

  const handleUpdateTodo = async (id: string, updateData: Partial<Todo>) => {
    try {
      const updated = await todoApi.update(id, updateData);
      setTodos((prev) => prev.map((t) => (t.id === id ? updated : t)));

      const heatmap = await todoApi.getHeatmap();
      setHeatmapData(heatmap);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Có lỗi xảy ra khi cập nhật công việc.');
      throw err;
    }
  };

  const handleDeleteTodo = async (id: string) => {
    try {
      await todoApi.delete(id);
      setTodos((prev) => prev.filter((t) => t.id !== id));

      const heatmap = await todoApi.getHeatmap();
      setHeatmapData(heatmap);
    } catch (err: any) {
      alert('Có lỗi xảy ra khi xóa công việc.');
      throw err;
    }
  };

  if (!isAuthenticated) {
    return <Auth onLoginSuccess={handleLoginSuccess} />;
  }

  // Filter out todos by search query BEFORE passing to TaskList
  const filteredTodos = todos.filter(t => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const matchTitle = t.title.toLowerCase().includes(q);
    const matchDesc = t.description?.toLowerCase().includes(q) || false;
    return matchTitle || matchDesc;
  });

  return (
    <div id="app-container" className="flex flex-col md:flex-row min-h-screen bg-[#09090b] text-zinc-50 relative selection:bg-emerald-500/30 selection:text-emerald-200 pb-20 md:pb-0">
      {/* Background glow effects */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-900/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-sky-900/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Sidebar navigation */}
      <Sidebar 
        activeFilter={activeFilter} 
        setActiveFilter={setActiveFilter} 
        todos={filteredTodos} // pass filtered so sidebar counts reflect search if wanted, or just pass 'todos' to keep counts absolute. Let's pass absolute.
        user={user}
        onLogout={handleLogout}
      />

      {/* Main Content */}
      <main id="main-content" className="flex-1 flex flex-col p-4 md:p-8 max-w-4xl mx-auto w-full gap-6 overflow-y-auto relative z-10">
        {/* Error Alert Bar */}
        {error && (
          <div id="error-alert" className="flex items-center justify-between gap-3 p-4 bg-red-950/40 border border-red-800/30 text-red-300 rounded-2xl shadow-lg shadow-red-900/20 backdrop-blur-md">
            <div className="flex items-center gap-2.5">
              <AlertCircle size={18} />
              <span className="text-xs font-medium">{error}</span>
            </div>
            <button
              onClick={fetchData}
              className="p-1.5 hover:bg-red-900/20 rounded-lg transition-colors text-red-400 hover:text-red-200"
              title="Thử lại"
            >
              <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
            </button>
          </div>
        )}

        {/* Heatmap Area - Hide on very small mobile screens to save space, show on md and above or scrollable */}
        <section id="heatmap-section" className="w-full overflow-x-auto pb-2">
          <Heatmap data={heatmapData} />
        </section>

        {/* Task Section */}
        <section className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-lg font-bold text-zinc-200 uppercase tracking-wide flex items-center gap-2">
              {activeFilter === 'inbox' 
                ? 'Hộp thư đến' 
                : activeFilter === 'today' 
                ? 'Hôm nay' 
                : activeFilter === 'upcoming'
                ? <><CalendarDays size={18} /> Sắp tới</>
                : 'Đã hoàn thành'}
            </h2>
            
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Tìm kiếm..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-zinc-900/50 border border-zinc-800 rounded-lg text-sm px-3 py-1.5 focus:outline-none focus:border-emerald-500 transition-colors w-full sm:w-64"
              />
              {isLoading && (
                <RefreshCw size={14} className="animate-spin text-zinc-500" />
              )}
            </div>
          </div>

          {/* Form and Lists */}
          {activeFilter !== 'completed' && !searchQuery.trim() && (
            <AddTaskForm onAdd={handleAddTodo} />
          )}

          {searchQuery.trim() && filteredTodos.length === 0 ? (
            <div className="text-center p-8 bg-zinc-900/20 border border-dashed border-zinc-800 rounded-xl text-zinc-500 text-sm">
              Không tìm thấy công việc nào phù hợp với "{searchQuery}"
            </div>
          ) : (
            <TaskList
              todos={filteredTodos}
              filter={activeFilter}
              onUpdate={handleUpdateTodo}
              onDelete={handleDeleteTodo}
            />
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
