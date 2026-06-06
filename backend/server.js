const express = require('express');
const cors = require('cors');
const { initDb } = require('./db');

const authRoutes = require('./routes/auth');
const todoRoutes = require('./routes/todos');

const app = express();
const port = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

// --- ROUTES ---
app.use('/api/auth', authRoutes);
app.use('/api/todos', todoRoutes);

// Start server after DB init
initDb().then(() => {
  app.listen(port, () => {
    console.log(`Backend listening on port ${port}`);
  });
}).catch(err => {
  console.error('Failed to initialize database:', err);
  process.exit(1);
});
