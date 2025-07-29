const mongoose = require('mongoose');

const User1Schema = new mongoose.Schema({
    userId: { type: String, unique: true },
    name: String,
    password: String,
    roomNo: { type: String, unique: true },
})

module.exports = mongoose.model('User1', User1Schema);