const mongoose = require('mongoose');
const TaskSchema = new mongoose.Schema({
  title: String,
  description: String,
  priority: String,
  dueDate: Date,
  assignedTo: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: ['pending', 'in_progress', 'completed'], default: 'pending' },
  updates: [{ text: String, date: Date, byUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } }]
});
module.exports = mongoose.model('Task', TaskSchema);