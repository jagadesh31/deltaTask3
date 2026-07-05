const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
  showId: { type: mongoose.Schema.Types.ObjectId, ref: 'movieShows' },
  seats: [String],
  totalAmount: { type: Number, required: true },
  adminAmount: { type: Number },
  distributorAmount: { type: Number },
  exhibitorAmount: { type: Number },
  
  razorpayOrderId: { type: String, required: true, unique: true },
  razorpayPaymentId: { type: String, sparse: true, unique: true },
  razorpaySignature: { type: String },

  status: { 
    type: String, 
    enum: ['INITIATED', 'PROCESSING', 'SUCCESS', 'FAILED', 'REFUNDED', 'CANCELLED'], 
    default: 'INITIATED' 
  },
  bankAccountDetails: {
    accountNumber: String,
    ifscCode: String,
    accountHolderName: String
  },
  
  idempotencyKey: { type: String, unique: true, sparse: true },
  ticketJobId: { type: String }
}, { timestamps: true, strict: false });

module.exports = mongoose.model('transactions', transactionSchema);
