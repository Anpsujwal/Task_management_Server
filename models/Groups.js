// models/Group.js
const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
  name: { type: String, unique: true },
  users: [Number] // list of user ids
});

module.exports = mongoose.model('Group', groupSchema);
