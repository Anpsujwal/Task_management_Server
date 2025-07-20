const mongoose = require('mongoose');
const TaskSchema = new mongoose.Schema({
  title: String,
  comment: String,
  priority: { type: String, enum: ['low', 'high'], default: 'low' },
  assignedWorkers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  assignedGroup: { type: mongoose.Schema.Types.ObjectId, ref: 'Group' },
  createdDate: { type: Date, default: Date.now },
  scheduleFor: {type:String,enum: ['specific_day', 'week_days', 'week_ends','alternate_days','month','quarter','half_yearly','yearly'], default: 'specific_day'},
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status:{
    text:{ type: String, enum: ['pending', 'in_progress', 'completed'], default: 'pending' },
    image:{type: Buffer},
    video:{type: Buffer},
    audio:{type:Buffer},
    updates: {
      comments: [{type:String}], 
      date: { type: Date}, 
      byUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } }
    } ,
  
  
});
module.exports = mongoose.model('Task', TaskSchema);