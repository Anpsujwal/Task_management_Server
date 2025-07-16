const mongoose = require('mongoose');
const UserSchema = new mongoose.Schema({
  userId: { type: String, unique: true },
  name: String,
  password: String,
  isAdmin: { type: Boolean, default: false }, // false for user, true for admin
});
module.exports = mongoose.model('User', UserSchema);