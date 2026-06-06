import { useState } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { Heatmap } from './components/heatmap/Heatmap';
import { AddTaskForm } from './components/todo/AddTaskForm';
import { TaskList } from './components/todo/TaskList';
import { Auth } from './components/auth/Auth';
import { useAuth } from './hooks/useAuth';
import { useTodos } from './hooks/useTodos';
import { AlertCircle, RefreshCw, CalendarDays } from 'lucide-react';

function App() {
  const { isAuthenticated, isLoadingAuth, login } = useAuth();
  
  const {
    todos,
    heatmapData,
    isLoading: isLoadingTodos,
    error,
    fetchData,
    handleAddTodo,
    handleUpdateTodo,
    handleDeleteTodo,
    // clearTodos will be handled elsewhere or we don't need it on logout since the component remounts or user is null.
    // wait, we need clearTodos? If App rerenders on logout, useTodos effect won't fetch data, but old data remains if we don't clear it.
    // Let's keep clearTodos and we can add a useEffect to listen to isAuthenticated. 
    clearTodos
  } = useTodos(isAuthenticated);

  const [activeFilter, setActiveFilter] = useState<'inbox' | 'today' | 'upcoming' | 'completed'>('inbox');
  const [searchQuery, setSearchQuery] = useState('');

  if (isLoadingAuth) {
    return null; // Or a loading spinner
  }

  if (!isAuthenticated) {
    // When logging out, clear todos so next login doesn't briefly show old ones
    if (todos.length > 0) clearTodos();
    return <Auth onLoginSuccess={login} />;
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
        todos={filteredTodos}
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
              <RefreshCw size={14} className={isLoadingTodos ? 'animate-spin' : ''} />
            </button>
          </div>
        )}

        {/* Heatmap Area */}
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
              {isLoadingTodos && (
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
