const mongoose = require('mongoose');
const UserSchema = new mongoose.Schema({
  userId: { type: String, unique: true },
  name: String,
  password: String,
  isAdmin: { type: Boolean, default: false }, // false for user, true for admin
  group: { type: mongoose.Schema.Types.ObjectId, ref: 'Group' },
});
module.exports = mongoose.model('User', UserSchema);