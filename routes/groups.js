const express = require('express');
const router = express.Router();
const Group = require('../models/Groups');

// GET all groups
router.get('/', async (req, res) => {
  try {
    const groups = await Group.find();
    res.status(200).json(groups);
  } catch (error) {
    res.status(500).json({ message: 'Server error while fetching groups' });
  }

});

// GET one group by ID
router.get('/:id/',async (req,res)=>{
  try{
    const group =await Group.findById(req.params.idd);
    if (!group)
      return res.status(404).json({ message: 'No users found for this group' });
    res.status(200).json( group );
  } catch(error) {
    res.status(500).json({ message: 'Server error while fetching users by group' });
  }
})

// POST create group
router.post('/', async (req, res) => {
  try {
    const newGroup = new Group(req.body);
    await newGroup.save();
    res.json({ msg: 'Group created' });
  } catch (error) {
    res.status(500).json({ message: "server error" })
  }
});

//update group

router.patch('/:id/add-users', async (req, res) => {
  try {
    const { userIds } = req.body;
    const updatedGroup = await Group.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { users: { $each: userIds } } }, // avoids duplicates
      { new: true }
    );
    if (!updatedGroup) {
      return res.status(404).json({ message: 'Group not found' });
    }
    res.status(200).json(updatedGroup);
  } catch (error) {
    res.status(500).json({ message: 'Server error while updating group' });
  }
});



// DELETE a group
router.delete('/:id', async (req, res) => {
  try {
    await Group.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Group deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error while deleting group' });
  }
});

module.exports = router;

