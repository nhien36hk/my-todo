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

// Interceptor to add auth token
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor to handle 401 Unauthorized
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.dispatchEvent(new Event('auth_error'));
    }
    return Promise.reject(error);
  }
);

export interface Todo {
  id: string; // Mongo ID is string
  title: string;
  description: string;
  due_date: string | null;
  category: string;
  completed: number; // 0 or 1
  completed_at: string | null;
  priority: 'low' | 'medium' | 'high';
  created_at: string;
}

export interface HeatmapData {
  date: string;
  count: number;
}

export const authApi = {
  login: async (credentials: any) => {
    const res = await client.post('/auth/login', credentials);
    return res.data;
  },
  register: async (data: any) => {
    const res = await client.post('/auth/register', data);
    return res.data;
  }
};

export const todoApi = {
  getAll: async (): Promise<Todo[]> => {
    const res = await client.get<Todo[]>('/todos');
    return res.data;
  },
  create: async (todo: { title: string; description?: string; due_date?: string | null; priority?: string; category?: string }): Promise<Todo> => {
    const res = await client.post<Todo>('/todos', todo);
    return res.data;
  },
  update: async (id: string, todo: Partial<Todo>): Promise<Todo> => {
    const res = await client.put<Todo>(`/todos/${id}`, todo);
    return res.data;
  },
  delete: async (id: string): Promise<{ message: string }> => {
    const res = await client.delete<{ message: string }>(`/todos/${id}`);
    return res.data;
  },
  getHeatmap: async (): Promise<HeatmapData[]> => {
    const res = await client.get<HeatmapData[]>('/todos/heatmap');
    return res.data;
  },
};

export default client;
