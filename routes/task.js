const express = require('express');
const router = express.Router();
const Task = require('../models/Task');

const multer = require('multer');

const storage = multer.memoryStorage(); // store in memory
const upload = multer({ storage });

router.get('/', async (req, res) => {
  try {
    const tasks = await Task.find().select('-status.image -status.video -status.audio -status.updates');
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

router.get('/:id', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id).select('-status.image -status.video -status.audio -status.updates');
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.status(200).json(task)

  } catch (error) {
    console.error('Error fetching task:', error);
    res.status(500).json({ message: 'Failed to fetch task', error });
  }
})


router.get('/createdby/:id', async (req, res) => {
  try {
    const tasks = await Task.find({ createdBy: req.params.id }).select('-status.image.media -status.video.media -status.audio.media -status.updates');
    if (!tasks) return res.status(404).json({ message: 'Tasks not found' });
    res.status(200).json(tasks)

  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ message: 'Failed to fetch tasks', error });
  }
})


// Get tasks assigned to a user (by assignedWorker array)
router.get('/user/:userId', async (req, res) => {
  try {
    const tasks = await Task.find({ assignedWorkers: req.params.userId }, ).select('-status.image -status.video -status.audio -status.updates');
    res.status(200).json(tasks);
  } catch (error) {
    console.error('Error fetching tasks for user:', error);
    res.status(500).json({ message: 'Failed to fetch user tasks', error });
  }
});

router.get('/alltasks/user/:userId', async (req, res) => {
  try {
    const tasks = await Task.find({
      $or: [
        { assignedWorkers: req.params.userId },
        { 'groupTaskDetails.frozenBy': req.params.userId }]
    }
    ).select('-status.image -status.video -status.audio -status.updates');
    res.status(200).json(tasks);
  } catch (error) {
    console.error('Error fetching tasks for user:', error);
    res.status(500).json({ message: 'Failed to fetch user tasks', error });
  }
});

// Get tasks assigned to a group (by assignedGroup)
router.get('/group/:groupId', async (req, res) => {
  try {
    const tasks = await Task.find({ 'groupTaskDetails.group': req.params.groupId }).select('-status.image -status.video -status.audio -status.updates');
    res.status(200).json(tasks);
  } catch (error) {
    console.error('Error fetching tasks for user:', error);
    res.status(500).json({ message: 'Failed to fetch group tasks', error });
  }
});

router.patch('/freeze/:id', async (req, res) => {
  try {
    const { userId } = req.body;
    const task = await Task.findById(req.params.id).select('groupTaskDetails');
    if (!task) return res.status(404).json({ message: 'Task not found' });

    if (task.groupTaskDetails.workersNeeded > task.groupTaskDetails.frozenBy.length) {
      if (!task.groupTaskDetails.frozenBy.includes(userId)) {
        task.groupTaskDetails.frozenBy.push(userId);
        await task.save();
        res.status(200).json({ message: 'Task frozen successfully' });
      } else {
        res.status(400).json({ message: 'Task already frozen by this user' });
      }
    } else {
      res.status(400).json({ message: 'All required workers already frozen' });
    }
  } catch (error) {
    console.error('Error freezing task:', error);
    res.status(500).json({ message: 'Failed to freeze task', error });
  }

})

router.patch('/unfreeze/:id', async (req, res) => {
  try {
    const { userId } = req.body;
    const task = await Task.findById(req.params.id).select('groupTaskDetails');
    if (!task) return res.status(404).json({ message: 'Task not found' });

    if (task.groupTaskDetails.frozenBy.length > 0) {
      if (task.groupTaskDetails.frozenBy.includes(userId)) {
        task.groupTaskDetails.frozenBy = task.groupTaskDetails.frozenBy.filter(
          id => id.toString() !== userId.toString()
        );
        await task.save();
        res.status(200).json({ message: 'Task frozen successfully' });
      } else {
        res.status(400).json({ message: 'Task already frozen by this user' });
      }
    } else {
      res.status(400).json({ message: 'All required workers already frozen' });
    }
  } catch (error) {
    console.error('Error freezing task:', error);
    res.status(500).json({ message: 'Failed to freeze task', error });
  }

})

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
router.put('/:id/status', upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'video', maxCount: 1 },
  { name: 'audio', maxCount: 1 }
]), async (req, res) => {
  try {
    const { statusText, description, byUser } = req.body;
    const task = await Task.findById(req.params.id);

    if (!task) return res.status(404).send({ error: 'Task not found' });


    task.status.text = statusText;

    if (req.files?.image?.[0]) {
      task.status.image = req.files.image[0].buffer;
    }

    if (req.files?.video?.[0]) {
      task.status.video = req.files.video[0].buffer;
    }

    if (req.files?.audio?.[0]) {
      task.status.audio = req.files.audio[0].buffer;
    }

    if (!Array.isArray(task.status.updates)) {
      task.status.updates = [];
    }
    task.status.updates.push({
      comment: description || '',
      date: new Date(),
      byUser
    });

    await task.save();
    res.status(200).send({ message: 'Task status updated successfully' });
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
    res.writeHead(200, {
      'Content-Type': 'image/jpeg',
      'Content-Length': task.status.image.media.length
    });
    res.end(task.status.image);

  } catch (err) {
    console.error(err);
    res.status(500).send('Failed to retrieve image');
  }
});

router.get('/:id/video', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task || !task.status?.video) {
      return res.status(404).send('video not found');
    }

    res.set('Content-Type', 'video/mp4');
    res.writeHead(200, {
      'Content-Type': 'video/mp4',
      'Content-Length': task.status.video.media.length
    });
    res.end(task.status.video);

  } catch (err) {
    console.error(err);
    res.status(500).send('Failed to retrieve video');
  }
});

router.get('/:id/audio', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task || !task.status?.audio) {
      return res.status(404).send('audio not found');
    }

    res.set('Content-Type', 'audio/mpeg'); // or audio/wav if needed
    res.writeHead(200, {
      'Content-Type': 'audio/mpeg',
      'Content-Length': task.status.audio.media.length
    });
    res.end(task.status.audio);

  } catch (err) {
    console.error(err);
    res.status(500).send('Failed to retrieve audio');
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
