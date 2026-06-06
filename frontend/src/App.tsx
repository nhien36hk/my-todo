import { useState, useEffect } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { Heatmap } from './components/heatmap/Heatmap';
import { AddTaskForm } from './components/todo/AddTaskForm';
import { TaskList } from './components/todo/TaskList';
import { todoApi } from './api/client';
import type { Todo, HeatmapData } from './api/client';
import { AlertCircle, RefreshCw } from 'lucide-react';

function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [heatmapData, setHeatmapData] = useState<HeatmapData[]>([]);
  const [activeFilter, setActiveFilter] = useState<'inbox' | 'today' | 'completed'>('inbox');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all data from backend
  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [todosList, heatmap] = await Promise.all([
        todoApi.getAll(),
        todoApi.getHeatmap()
      ]);
      setTodos(todosList);
      setHeatmapData(heatmap);
    } catch (err: any) {
      console.error(err);
      setError('Không thể kết nối đến máy chủ API. Vui lòng kiểm tra xem Backend đã chạy chưa.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // API Call wrappers
  const handleAddTodo = async (todoData: { title: string; description?: string; due_date?: string | null; priority?: string }) => {
    try {
      const newTodo = await todoApi.create(todoData);
      setTodos((prev) => [newTodo, ...prev]);
      
      // Refresh heatmap data since we might have completed it immediately or changed states
      const heatmap = await todoApi.getHeatmap();
      setHeatmapData(heatmap);
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Có lỗi xảy ra khi tạo công việc.';
      alert(msg);
      throw err;
    }
  };

  const handleUpdateTodo = async (id: number, updateData: Partial<Todo>) => {
    try {
      const updated = await todoApi.update(id, updateData);
      setTodos((prev) => prev.map((t) => (t.id === id ? updated : t)));

      // Refresh heatmap immediately after status updates to sync completed dates
      const heatmap = await todoApi.getHeatmap();
      setHeatmapData(heatmap);
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Có lỗi xảy ra khi cập nhật công việc.';
      alert(msg);
      throw err;
    }
  };

  const handleDeleteTodo = async (id: number) => {
    try {
      await todoApi.delete(id);
      setTodos((prev) => prev.filter((t) => t.id !== id));

      // Refresh heatmap in case a completed task was deleted
      const heatmap = await todoApi.getHeatmap();
      setHeatmapData(heatmap);
    } catch (err: any) {
      alert('Có lỗi xảy ra khi xóa công việc.');
      throw err;
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#09090b] text-zinc-50">
      {/* Sidebar navigation */}
      <Sidebar 
        activeFilter={activeFilter} 
        setActiveFilter={setActiveFilter} 
        todos={todos} 
      />

      {/* Main Content */}
      <main className="flex-1 flex flex-col p-4 md:p-8 max-w-4xl mx-auto w-full gap-6 overflow-y-auto">
        {/* Error Alert Bar */}
        {error && (
          <div className="flex items-center justify-between gap-3 p-4 bg-red-950/40 border border-red-800/30 text-red-300 rounded-2xl">
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

        {/* Heatmap Area */}
        <section className="w-full">
          <Heatmap data={heatmapData} />
        </section>

        {/* Task Section */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-zinc-200 uppercase tracking-wide">
              {activeFilter === 'inbox' 
                ? 'Hộp thư đến' 
                : activeFilter === 'today' 
                ? 'Hôm nay' 
                : 'Đã hoàn thành'}
            </h2>
            {isLoading && (
              <RefreshCw size={14} className="animate-spin text-zinc-500" />
            )}
          </div>

          {/* Form and Lists */}
          {activeFilter !== 'completed' && (
            <AddTaskForm onAdd={handleAddTodo} />
          )}

          <TaskList
            todos={todos}
            filter={activeFilter}
            onUpdate={handleUpdateTodo}
            onDelete={handleDeleteTodo}
          />
        </section>
      </main>
    </div>
  );
}

export default App;
