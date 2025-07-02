const express = require('express');
const Task = require('../models/Task');
const router = express.Router();

// Create a new task
router.post('/', async (req, res) => {
  const task = new Task(req.body);
  await task.save();
  res.json(task);
});

// Get tasks assigned to a user
router.get('/:userId', async (req, res) => {
  const tasks = await Task.find({ assignedTo: req.params.userId });
  res.json(tasks);
});

// Update a task
router.put('/:id', async (req, res) => {
  const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(task);
});

// Delete a task
router.delete('/:id', async (req, res) => {
  await Task.findByIdAndDelete(req.params.id);
  res.json({ message: 'Task deleted' });
});

// Task report for a user
router.get('/report/:userId', async (req, res) => {
  const userId = req.params.userId;
  const all = await Task.find({ assignedTo: userId });
  const completed = all.filter(t => t.status === 'completed');
  const pending = all.filter(t => t.status === 'pending');
  const overdue = all.filter(t => new Date(t.dueDate) < new Date() && t.status !== 'completed');
  res.json({ completed, pending, overdue });
});

module.exports = router;
