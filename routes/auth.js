const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

router.post('/signup', async (req, res) => {
  try {
    const { userId,name, password } = req.body;

    if (!userId || !name || !password) {
      return res.status(400).json({ message: 'userId, name, and password are required' });
    }
    // Check if userId already exists
    const existingUser = await User.findOne({ userId });
    if (existingUser) {
      return res.status(409).json({ message: 'User ID already exists' });
    }
    
    const payload={
      userId,
      name,
      password: await bcrypt.hash(password, 10),
    }

    let isAdmin = req.body.isAdmin;
    let group = req.body.group;
    let adminType = req.body.adminType;
    

    if(isAdmin === undefined) {
      payload.isAdmin = false; 
    }else{
      payload.isAdmin = isAdmin; 
    }

    if(adminType !== undefined) {
      payload.adminType = adminType; 
    }

    if(!group) {
      payload.group=null; 
    }else{
      payload.group = group;
    }
    
    const user = new User(payload);
    await user.save();
    res.status(200).json({ message: 'User registered',id: user._id });
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