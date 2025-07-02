const express = require('express');
const router = express.Router();
const Group = require('../models/Groups');

// GET all groups
router.get('/', async (req, res) => {
  const groups = await Group.find();
  res.json(groups);
});

// POST create group
router.post('/', async (req, res) => {
  const { name, members } = req.body;
  const newGroup = new Group({ name, members });
  await newGroup.save();
  res.json({ msg: 'Group created' });
});

// DELETE a group
router.delete('/:id', async (req, res) => {
  await Group.findByIdAndDelete(req.params.id);
  res.json({ msg: 'Group deleted' });
});

module.exports = router;

