const express = require('express');
const router = express.Router();
const Ticket = require('../models/Ticket');

const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.get('/', async (req, res) => {
  try {
    const tickets = await Ticket.find().select('-status.image.media -status.video.media -status.audio.media -status.updates');
    res.status(200).json(tickets);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch tasks', error });
  }
})

// Create a new ticket
router.post('/', async (req, res) => {
  try {
    const ticket = new Ticket(req.body);
    await ticket.save();
    res.status(201).json(ticket);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ message: 'Failed to create task', error });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id).select('-status.image.media -status.video.media -status.audio.media -status.updates');
    if (!ticket) return res.status(404).json({ message: 'Task not found' });
    res.status(200).json(ticket)

  } catch (error) {
    console.error('Error fetching task:', error);
    res.status(500).json({ message: 'Failed to fetch task', error });
  }
})


router.get('/createdby/:id', async (req, res) => {
  try {
    const tickets = await Ticket.find({ createdBy: req.params.id }).select('-status.image.media -status.video.media -status.audio.media -status.updates');
    if (!tickets) return res.status(404).json({ message: 'Tasks not found' });
    res.status(200).json(tickets)

  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ message: 'Failed to fetch tasks', error });
  }
})


// Get tasks assigned to a user (by assignedWorker array)
router.get('/user/:userId', async (req, res) => {
  try {
    const tickets = await Ticket.find({ assignedWorker: req.params.userId }, ).select('-status.image.media -status.video.media -status.audio.media -status.updates');
    res.status(200).json(tickets);
  } catch (error) {
    console.error('Error fetching tasks for user:', error);
    res.status(500).json({ message: 'Failed to fetch user tasks', error });
  }
});

// Get tasks assigned to a group (by assignedGroup)
router.get('/group/:groupId', async (req, res) => {
  try {
    const tickets = await Ticket.find({ assignedGroup: req.params.groupId }).select('-status.image.media -status.video.media -status.audio.media -status.updates');
    res.status(200).json(tickets);
  } catch (error) {
    console.error('Error fetching tasks for user:', error);
    res.status(500).json({ message: 'Failed to fetch group tasks', error });
  }
});


router.patch('/freeze/:id', async (req, res) => {
  try {
    const { userId } = req.body;
    const ticket = await Ticket.findById(req.params.id).select('-status')
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

    if (!ticket.assignedWorker) {
        ticket.assignedWorker=userId;
        await ticket.save();
        res.status(200).json({ message: 'Ticket frozen successfully' });
      } 
     else {
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
    const ticket = await Ticket.findById(req.params.id).select('-status');
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

    console.log(ticket.assignedWorker + "  "+ userId)
    if(String(ticket.assignedWorker)===String(userId)){
      ticket.assignedWorker=undefined
      await ticket.save()
      return res.status(200).json({ message: 'Ticket unfrozen successfully' });
    }
    res.status(403).json({ message: 'you are not authourized' });
    
  } catch (error) {
    console.error('Error unfreezing ticket:', error);
    res.status(500).json({ message: 'Failed to unfreeze ticket', error });
  }

})

  


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

router.patch('/assignWorker/:ticketId',async (req,res)=>{
  try{
    const ticket=await Ticket.findById(req.params.ticketId);
    if(!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }
    ticket.assignedWorker=req.body.workerId;
    await ticket.save();
    res.status(200).json({ message: 'assigned the worker to ticket'});
  }catch(error) {
    res.status(500).json({ message: 'Server error while adding user to group' });
  }
})

// PUT /api/tasks/:id/status
router.put('/:id/status', upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'video', maxCount: 1 },
  { name: 'audio', maxCount: 1 }
]), async (req, res) => {
  try {
    const { statusText, description, byUser } = req.body;
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) return res.status(404).send({ error: 'Task not found' });

    // Update status text
    ticket.status.text = statusText;

    // Initialize media objects if missing
    if (!ticket.status.image) ticket.status.image = { hasImage: false, media: null };
    if (!ticket.status.video) ticket.status.video = { hasVideo: false, media: null };
    if (!ticket.status.audio) ticket.status.audio = { hasAudio: false, media: null };

    // Update image
    if (req.files?.image?.[0]) {
      ticket.status.image.hasImage = true;
      ticket.status.image.media = req.files.image[0].buffer;
    }

    // Update video
    if (req.files?.video?.[0]) {
      ticket.status.video.hasVideo = true;
      ticket.status.video.media = req.files.video[0].buffer;
    }

    // Update audio
    if (req.files?.audio?.[0]) {
      ticket.status.audio.hasAudio = true;
      ticket.status.audio.media = req.files.audio[0].buffer;
    }

    // Push update log
    if (!Array.isArray(ticket.status.updates)) {
      ticket.status.updates = [];
    }
    ticket.status.updates.push({
      comment: description || '',
      date: new Date(),
      byUser
    });

    await ticket.save();
    res.status(200).send({ message: 'Task status updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: 'Failed to update task status' });
  }
});


// GET /api/tasks/:id/image
router.get('/:id/image', async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket || !ticket.status.image?.hasImage) {
      console.log("here")
      return res.status(404).send('Image not found');
    }

    res.set('Content-Type', 'image/jpeg'); // or image/png if needed
    res.writeHead(200, {
      'Content-Type': 'image/jpeg',
      'Content-Length': ticket.status.image.media.length
    });
    res.end(ticket.status.image.media);

  } catch (err) {
    console.error(err);
    res.status(500).send('Failed to retrieve image');
  }
});

router.get('/:id/video', async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket || !ticket.status?.video) {
      return res.status(404).send('video not found');
    }

    res.set('Content-Type', 'video/mp4');
    res.writeHead(200, {
      'Content-Type': 'video/mp4',
      'Content-Length': ticket.status.video.media.length
    });
    res.end(ticket.status.video.media);

  } catch (err) {
    console.error(err);
    res.status(500).send('Failed to retrieve video');
  }
});

router.get('/:id/audio', async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket || !ticket.status?.audio) {
      return res.status(404).send('audio not found');
    }

    res.set('Content-Type', 'audio/mpeg'); // or audio/wav if needed
    res.writeHead(200, {
      'Content-Type': 'audio/mpeg',
      'Content-Length': ticket.status.audio.media.length
    });
    res.end(ticket.status.audio.media);

  } catch (err) {
    console.error(err);
    res.status(500).send('Failed to retrieve audio');
  }
});



// Delete a ticket
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Ticket.findByIdAndDelete(req.params.id);
    if (!deleted)
      return res.status(404).json({ message: 'Task not found' });

    res.status(200).json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ message: 'Failed to delete task', error });
  }
});



module.exports = router;
