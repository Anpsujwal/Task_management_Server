const mongoose = require('mongoose');
const TaskSchema = new mongoose.Schema({
  title: String,
  comment: String,
  priority: { type: String, enum: ['low', 'high'], default: 'low' },
  assignToEntireGroup:{ type: Boolean, default: false },
  groupTaskDetails: {
    group:{ type: mongoose.Schema.Types.ObjectId, ref: 'Group' },
    workersNeeded: { type: Number },
    frozenBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  assignedWorkers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdDate: { type: Date},
  scheduleFor: {type:String,enum: ['specific_day', 'week_days', 'week_ends','alternate_days','month','quarter','half_yearly','yearly'], default: 'specific_day'},
  dueDate: { type: Date },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status:{
    text:{ type: String, enum: ['pending', 'in_progress', 'completed'], default: 'pending' },
    image:{hasImage:{type:Boolean},media:{type: Buffer}},
    video:{hasVideo:{type:Boolean},media:{type: Buffer}},
    audio:{hasAudio:{type:Boolean},media:{type: Buffer}},
    updates: [{
      comment: {type:String}, 
      date: { type: Date}, 
      byUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } }]
    } ,
  
  
});
module.exports = mongoose.model('Task', TaskSchema);