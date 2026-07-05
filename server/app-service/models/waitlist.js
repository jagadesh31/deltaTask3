const mongoose = require('mongoose');

const waitlistSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
  showId: { type: mongoose.Schema.Types.ObjectId, ref: 'movieShows', required: true },
  email: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('waitlists', waitlistSchema);
