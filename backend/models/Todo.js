const mongoose = require('mongoose');

const todoSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  due_date: { type: String, default: null },
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  category: { type: String, default: 'Chung' },
  completed: { type: Number, enum: [0, 1], default: 0 },
  completed_at: { type: String, default: null }
}, { timestamps: true });

// Optional: compound index for heatmap queries
todoSchema.index({ userId: 1, completed: 1, completed_at: 1 });

module.exports = mongoose.model('Todo', todoSchema);
