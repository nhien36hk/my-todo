const express = require('express');
const cors = require('cors');
const { initDb } = require('./db');

const app = express();
const port = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

let db;

// Helper to get today's date in YYYY-MM-DD
function getTodayString() {
  const d = new Date();
  return d.toISOString().split('T')[0];
}

function isValidDate(dateString) {
  if (!dateString) return true; // null or empty is fine (no due date)
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateString)) return false;
  const parts = dateString.split('-');
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  const day = parseInt(parts[2], 10);
  if (month < 1 || month > 12) return false;
  const d = new Date(year, month - 1, day);
  return d.getFullYear() === year && d.getMonth() === month - 1 && d.getDate() === day;
}

function isValidPriority(priority) {
  if (!priority) return true; // Will use default
  return ['low', 'medium', 'high'].includes(priority);
}

// 1. Get all todos
app.get('/api/todos', async (req, res) => {
  try {
    const list = await db.all('SELECT * FROM todos ORDER BY due_date ASC, id DESC');
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Create a todo
app.post('/api/todos', async (req, res) => {
  const { title, description, due_date, priority } = req.body;
  if (!title || !title.trim()) {
    return res.status(400).json({ error: 'Title is required and cannot be empty' });
  }
  if (due_date && !isValidDate(due_date)) {
    return res.status(400).json({ error: 'due_date must be a valid date in YYYY-MM-DD format' });
  }
  if (priority && !isValidPriority(priority)) {
    return res.status(400).json({ error: 'priority must be low, medium, or high' });
  }
  try {
    const result = await db.run(
      'INSERT INTO todos (title, description, due_date, priority) VALUES (?, ?, ?, ?)',
      [title.trim(), description || '', due_date || null, priority || 'medium']
    );
    const newTodo = await db.get('SELECT * FROM todos WHERE id = ?', [result.lastID]);
    res.status(201).json(newTodo);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Update a todo (including marking complete)
app.put('/api/todos/:id', async (req, res) => {
  const { id } = req.params;
  const { title, description, due_date, priority, completed } = req.body;
  
  if (title !== undefined && (!title || !title.trim())) {
    return res.status(400).json({ error: 'Title cannot be empty' });
  }
  if (due_date !== undefined && due_date !== null && !isValidDate(due_date)) {
    return res.status(400).json({ error: 'due_date must be a valid date in YYYY-MM-DD format' });
  }
  if (priority !== undefined && !isValidPriority(priority)) {
    return res.status(400).json({ error: 'priority must be low, medium, or high' });
  }

  try {
    const existing = await db.get('SELECT * FROM todos WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    let completedVal = existing.completed;
    let completedAtVal = existing.completed_at;

    if (completed !== undefined) {
      completedVal = completed ? 1 : 0;
      if (completedVal !== existing.completed) {
        completedAtVal = completedVal ? getTodayString() : null;
      }
    }

    await db.run(
      `UPDATE todos SET 
        title = ?, 
        description = ?, 
        due_date = ?, 
        priority = ?, 
        completed = ?, 
        completed_at = ?
       WHERE id = ?`,
      [
        title !== undefined ? title.trim() : existing.title,
        description !== undefined ? description : existing.description,
        due_date !== undefined ? (due_date || null) : existing.due_date,
        priority !== undefined ? priority : existing.priority,
        completedVal,
        completedAtVal,
        id
      ]
    );

    const updated = await db.get('SELECT * FROM todos WHERE id = ?', [id]);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Delete a todo
app.delete('/api/todos/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const existing = await db.get('SELECT * FROM todos WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ error: 'Todo not found' });
    }
    await db.run('DELETE FROM todos WHERE id = ?', [id]);
    res.json({ message: 'Todo deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Get heatmap completed tasks aggregation
app.get('/api/todos/heatmap', async (req, res) => {
  try {
    const stats = await db.all(`
      SELECT completed_at as date, COUNT(*) as count 
      FROM todos 
      WHERE completed = 1 AND completed_at IS NOT NULL
      GROUP BY completed_at
      ORDER BY completed_at ASC
    `);
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start server after DB init
initDb().then((database) => {
  db = database;
  app.listen(port, () => {
    console.log(`Backend listening on port ${port}`);
  });
}).catch(err => {
  console.error('Failed to initialize database:', err);
  process.exit(1);
});
