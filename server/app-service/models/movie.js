const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
  addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
  distributorId: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
  type: { type: String, default: 'movie' },
  title: { type: String, required: true },
  durationMinutes: { type: Number },
  genre: [String],
  cast: [String],
  director: String,
  plot: String,
  posterUrl: String,
  poster: String, // Backwards compatibility
  status: { 
    type: String, 
    enum: ['PENDING_APPROVAL', 'ACTIVE', 'REJECTED'], 
    default: 'PENDING_APPROVAL' 
  },
  globalCommissionRate: { type: Number }
}, { timestamps: true, strict: false });

module.exports = mongoose.model('movies', movieSchema);
