const express = require('express');
const cors = require('cors');
const { initDb } = require('./db');
const authMiddleware = require('./middleware/auth');
const User = require('./models/User');
const Todo = require('./models/Todo');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const port = process.env.PORT || 5001;
const JWT_SECRET = process.env.JWT_SECRET || 'supersecret_mytodo_jwt_key_2026';

app.use(cors());
app.use(express.json());

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

// --- AUTH ROUTES ---

// Register
app.post('/api/auth/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required' });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email is already registered' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();

    const token = jwt.sign({ id: newUser._id, name: newUser.name }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, user: { id: newUser._id, name: newUser.name, email: newUser.email } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id, name: user.name }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- TODO ROUTES (Protected) ---

// 1. Get all todos
app.get('/api/todos', authMiddleware, async (req, res) => {
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
app.post('/api/todos', authMiddleware, async (req, res) => {
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
app.put('/api/todos/:id', authMiddleware, async (req, res) => {
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
app.delete('/api/todos/:id', authMiddleware, async (req, res) => {
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
app.get('/api/todos/heatmap', authMiddleware, async (req, res) => {
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

// Start server after DB init
initDb().then(() => {
  app.listen(port, () => {
    console.log(`Backend listening on port ${port}`);
  });
}).catch(err => {
  console.error('Failed to initialize database:', err);
  process.exit(1);
});
