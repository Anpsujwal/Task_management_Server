const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

router.post('/signup', async (req, res) => {
  try {
    const { name, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = await User.countDocuments() + 1;
    console.log(`Creating user with ID: ${userId}`);
    const user = new User({ userId, name, password: hashedPassword});
    console.log(`User created: ${user}`);
    await user.save();
    res.status(200).json({ message: 'User registered' });
  } catch (error) {
    res.status(500).json({ message: 'Server error during signup' ,error});
  }

});

router.post('/login', async (req, res) => {

  try {
    const { userId, password } = req.body;
    const user = await User.findOne({ userId });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET);
    res.status(200).json({ token, user });
  } catch (error) {
    res.status(500).json({ message: 'Server error during login' });
  }

});

module.exports = router;