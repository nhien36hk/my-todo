const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Todo = require('../models/Todo');
const authMiddleware = require('../middleware/auth');

// --- HELPERS ---
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

// --- TODO ROUTES (Protected) ---

// 1. Get all todos
router.get('/', authMiddleware, async (req, res) => {
  try {
    const list = await Todo.find({ userId: req.user.id }).sort({ due_date: 1, _id: -1 });
    // Transform _id to id for frontend compatibility
    const formattedList = list.map(t => {
      const obj = t.toObject();
      obj.id = obj._id;
      delete obj._id;
      return obj;
    });
    res.json(formattedList);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Create a todo
router.post('/', authMiddleware, async (req, res) => {
  const { title, description, due_date, priority, category } = req.body;
  if (!title || !title.trim()) {
    return res.status(400).json({ error: 'Title is required and cannot be empty' });
  }
  if (due_date && !isValidDate(due_date)) {
    return res.status(400).json({ error: 'Invalid due_date format or value. Expected YYYY-MM-DD.' });
  }
  if (priority && !isValidPriority(priority)) {
    return res.status(400).json({ error: 'Invalid priority value. Expected low, medium, or high.' });
  }
  try {
    const newTodo = new Todo({
      userId: req.user.id,
      title: title.trim(),
      description: description || '',
      due_date: due_date || null,
      priority: priority || 'medium',
      category: category || 'Chung'
    });
    await newTodo.save();
    const obj = newTodo.toObject();
    obj.id = obj._id;
    delete obj._id;
    res.status(201).json(obj);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Update a todo
router.put('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { title, description, due_date, priority, category, completed } = req.body;
  
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
    const existing = await Todo.findOne({ _id: id, userId: req.user.id });
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

    existing.title = title !== undefined ? title.trim() : existing.title;
    existing.description = description !== undefined ? description : existing.description;
    existing.due_date = due_date !== undefined ? (due_date || null) : existing.due_date;
    existing.priority = priority !== undefined ? priority : existing.priority;
    existing.category = category !== undefined ? category : existing.category;
    existing.completed = completedVal;
    existing.completed_at = completedAtVal;

    await existing.save();
    
    const obj = existing.toObject();
    obj.id = obj._id;
    delete obj._id;
    res.json(obj);
  } catch (err) {
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ error: 'Todo not found' });
    }
    res.status(500).json({ error: err.message });
  }
});

// 4. Delete a todo
router.delete('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  try {
    const existing = await Todo.findOne({ _id: id, userId: req.user.id });
    if (!existing) {
      return res.status(404).json({ error: 'Todo not found' });
    }
    await existing.deleteOne();
    res.json({ message: 'Todo deleted successfully' });
  } catch (err) {
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ error: 'Todo not found' });
    }
    res.status(500).json({ error: err.message });
  }
});

// 5. Get heatmap completed tasks aggregation
router.get('/heatmap', authMiddleware, async (req, res) => {
  // Fix endpoint mapping, frontend calls /api/todos/heatmap and here router path is '/heatmap'
  // But wait, it might conflict with '/:id'.
  // Actually, '/heatmap' must be defined BEFORE '/:id' to avoid 'heatmap' being treated as an id.
  // Wait, I see I placed it AFTER '/:id'. Let me fix this order in a second edit or adjust here.
  try {
    const stats = await Todo.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(req.user.id), completed: 1, completed_at: { $ne: null } } },
      { $group: { _id: "$completed_at", count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
      { $project: { date: "$_id", count: 1, _id: 0 } }
    ]);
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
