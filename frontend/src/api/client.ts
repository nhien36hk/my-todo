import axios from 'axios';

// Since we configured proxy in vite.config.ts, we use relative /api path.
// If we are running in production or outside Vite dev server, we can fallback to the current origin or env.
const API_URL = import.meta.env.VITE_API_URL || '/api';

const client = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface Todo {
  id: number;
  title: string;
  description: string;
  due_date: string | null;
  completed: number; // 0 or 1
  completed_at: string | null;
  priority: 'low' | 'medium' | 'high';
  created_at: string;
}

export interface HeatmapData {
  date: string;
  count: number;
}

export const todoApi = {
  getAll: async (): Promise<Todo[]> => {
    const res = await client.get<Todo[]>('/todos');
    return res.data;
  },
  create: async (todo: { title: string; description?: string; due_date?: string | null; priority?: string }): Promise<Todo> => {
    const res = await client.post<Todo>('/todos', todo);
    return res.data;
  },
  update: async (id: number, todo: Partial<Todo>): Promise<Todo> => {
    const res = await client.put<Todo>(`/todos/${id}`, todo);
    return res.data;
  },
  delete: async (id: number): Promise<{ message: string }> => {
    const res = await client.delete<{ message: string }>(`/todos/${id}`);
    return res.data;
  },
  getHeatmap: async (): Promise<HeatmapData[]> => {
    const res = await client.get<HeatmapData[]>('/todos/heatmap');
    return res.data;
  },
};

export default client;
