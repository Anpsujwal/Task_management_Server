const mongoose = require('mongoose');
const TaskSchema = new mongoose.Schema({
  title: String,
  description: String,
  priority: { type: String, enum: ['low', 'high'], default: 'low' },
  assignedWorkers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  assignedGroup: { type: mongoose.Schema.Types.ObjectId, ref: 'Group' },
  createdDate: { type: Date, default: Date.now },
  completeBy: {
    isRoutine: { type: Boolean, default: false },
    dueDate:{type:Date }
  },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status:{
    text:{ type: String, enum: ['pending', 'in_progress', 'completed'], default: 'pending' },
    image:{type: Buffer},
    updates: {
      description: {type:String}, 
      date: { type: Date}, 
      byUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } }
    } ,
  
});
module.exports = mongoose.model('Task', TaskSchema);