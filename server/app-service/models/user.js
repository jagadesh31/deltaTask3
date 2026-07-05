const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  role: String
}, { strict: false });

module.exports = mongoose.model('users', userSchema);
