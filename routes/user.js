const express = require('express');
const User = require('../models/User');
const router = express.Router();

// Get all users
router.get('/', async (req, res) => {
  const users = await User.find();
  res.json(users);
});

// Get one user by ID
router.get('/:id', async (req, res) => {
  const user = await User.findById(req.params.id);
  res.json(user);
});

// Update user details
router.put('/:id', async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(user);
});

// Delete user
router.delete('/:id', async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ message: 'User deleted' });
});

module.exports = router;
