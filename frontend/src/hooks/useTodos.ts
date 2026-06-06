import { useState, useEffect } from 'react';
import { todoApi } from '../api/client';
import type { Todo, HeatmapData } from '../api/client';

export function useTodos(isAuthenticated: boolean) {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [heatmapData, setHeatmapData] = useState<HeatmapData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated]);

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

  const clearTodos = () => {
    setTodos([]);
    setHeatmapData([]);
  };

  return {
    todos,
    heatmapData,
    isLoading,
    error,
    fetchData,
    handleAddTodo,
    handleUpdateTodo,
    handleDeleteTodo,
    clearTodos
  };
}
