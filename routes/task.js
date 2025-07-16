const express = require('express');
const router = express.Router();
const Task = require('../models/Task');

const multer = require('multer');

const storage = multer.memoryStorage(); // store in memory
const upload = multer({ storage });

router.get('/',async (req,res)=>{
  try {
    const tasks = await Task.find();
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch tasks', error });
  }
})

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
    const tasks = await Task.find({ assignedWorkers: req.params.userId });
    res.status(200).json(tasks);
  } catch (error) {
    console.error('Error fetching tasks for user:', error);
    res.status(500).json({ message: 'Failed to fetch user tasks', error });
  }
});

// Get tasks assigned to a group (by assignedGroup)
router.get('/group/:groupId', async (req, res) => {
  try {
    const tasks = await Task.find({ assignedGroup: req.params.groupId });
    res.status(200).json(tasks);
  } catch (error) {
    console.error('Error fetching tasks for user:', error);
    res.status(500).json({ message: 'Failed to fetch group tasks', error });
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

// PUT /api/tasks/:id/status
router.put('/:id/status', upload.single('image'), async (req, res) => {
  try {
    const { statusText, description, byUser } = req.body;
    const task = await Task.findById(req.params.id);

    task.status.text = statusText;
    console.log('image', req.file);
    if (req.file) {
      task.status.image = req.file.buffer; // store image as buffer
    }

    task.status.updates = {
      description,
      date: new Date(),
      byUser
    };

    await task.save();
    res.send(task);
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: 'Failed to update task status' });
  }
});

// GET /api/tasks/:id/image
router.get('/:id/image', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task || !task.status?.image) {
      return res.status(404).send('Image not found');
    }

    res.set('Content-Type', 'image/jpeg'); // or image/png if needed
    res.send(task.status.image);
  } catch (err) {
    console.error(err);
    res.status(500).send('Failed to retrieve image');
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
