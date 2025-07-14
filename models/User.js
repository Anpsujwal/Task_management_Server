const mongoose = require('mongoose');
const UserSchema = new mongoose.Schema({
  userId: { type: Number, unique: true },
  name: String,
  password: String,
  isAdmin: { type: Boolean, default: false }, // false for user, true for admin
  groupId: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Group' }]
});
module.exports = mongoose.model('User', UserSchema);