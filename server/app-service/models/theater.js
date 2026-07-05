const mongoose = require('mongoose');

const theaterSchema = new mongoose.Schema({
  addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
  exhibitorId: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
  name: { type: String, required: true },
  location: String,
  seatLayout: {
    totalSeats: Number,
    tiers: [{
      name: String,
      seatCapacity: Number
    }]
  },
  status: { 
    type: String, 
    enum: ['PENDING_APPROVAL', 'ACTIVE', 'REJECTED'], 
    default: 'PENDING_APPROVAL' 
  }
}, { timestamps: true, strict: false });

module.exports = mongoose.model('theaters', theaterSchema);
