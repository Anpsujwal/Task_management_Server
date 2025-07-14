const mongoose = require('mongoose');
const TaskSchema = new mongoose.Schema({
  title: String,
  description: String,
  priority: String,
  dueDate: Date,
  assignedWorker: [{ type: Number}],
  assignedGroup: { type: mongoose.Schema.Types.ObjectId, ref: 'Group' },
  isRoutine: { type: Boolean, default: false },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status:{
    text:{ type: String, enum: ['pending', 'in_progress', 'completed'], default: 'pending' },
    image:{type: Buffer} // stores binary image data
    } ,
  updates: [{ text: String, date: Date, byUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } }]
});
module.exports = mongoose.model('Task', TaskSchema);