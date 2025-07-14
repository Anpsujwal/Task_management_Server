const express = require('express');
const router = express.Router();
const Task = require('../models/Task');

// Create a new task
router.post('/', async (req, res) => {
  try {
    const task = new Task(req.body);
    await task.save();
    res.status(201).json(task);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ message: 'Failed to create task', error });
  }
});

// Get tasks assigned to a user (by assignedWorker array)
router.get('/user/:userId', async (req, res) => {
  try {
    const tasks = await Task.find({ assignedWorker: req.params.userId });
    res.status(200).json(tasks);
  } catch (error) {
    console.error('Error fetching tasks for user:', error);
    res.status(500).json({ message: 'Failed to fetch user tasks', error });
  }
});

// Update a task
router.put('/:id', async (req, res) => {
  try {
    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedTask)
      return res.status(404).json({ message: 'Task not found' });

    res.status(200).json(updatedTask);
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ message: 'Failed to update task', error });
  }
});

// Delete a task
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Task.findByIdAndDelete(req.params.id);
    if (!deleted)
      return res.status(404).json({ message: 'Task not found' });

    res.status(200).json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ message: 'Failed to delete task', error });
  }
});

// Task report for a user (based on assignedWorker)
router.get('/report/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const allTasks = await Task.find({ assignedWorker: userId });

    const completed = allTasks.filter(t => t.status?.text === 'completed');
    const pending = allTasks.filter(t => t.status?.text === 'pending');
    const overdue = allTasks.filter(t =>
      new Date(t.dueDate) < new Date() && t.status?.text !== 'completed'
    );

    res.status(200).json({ completed, pending, overdue });
  } catch (error) {
    console.error('Error generating report:', error);
    res.status(500).json({ message: 'Failed to generate task report', error });
  }
});

module.exports = router;
