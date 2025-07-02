const mongoose = require('mongoose');
const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, enum: ['admin', 'user'], default: 'user' },
  groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'Group' }
});
module.exports = mongoose.model('User', UserSchema);