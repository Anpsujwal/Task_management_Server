// models/Group.js
const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
  name: { type: String, unique: true },
  users: [String] // list of user emails
});

module.exports = mongoose.model('Group', groupSchema);
