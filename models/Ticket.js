const mongoose = require('mongoose');
const TicketSchema = new mongoose.Schema({
  title: String,
  comment: String,
  priority: { type: String, enum: ['low', 'high'], default: 'low' },
  assignedWorker: { type: mongoose.Schema.Types.ObjectId, ref: 'User'},
  assignedGroup:{type:mongoose.Schema.Types.ObjectId, ref:'Group'},
  createdDate: {type: Date},
  createdBy: {type: mongoose.Schema.Types.ObjectId, ref: 'User1'},
  status:{
    text:{ type: String, enum: ['pending', 'in_progress', 'completed'], default: 'pending' },
    image:{hasImage:{type:Boolean},media:{type: Buffer}},
    video:{hasVideo:{type:Boolean},media:{type: Buffer}},
    audio:{hasAudio:{type:Boolean},media:{type: Buffer}},
    updates: [{
      comment: {type:String}, 
      date: { type: Date}, 
      byUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } 
    }]
    },
});
module.exports = mongoose.model('Ticket', TicketSchema);