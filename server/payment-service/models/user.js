const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String }, // Hashed
  role: { 
    type: String, 
    enum: ['ADMIN', 'DISTRIBUTOR', 'EXHIBITOR', 'CLIENT'], 
    default: 'CLIENT' 
  },
  profile: {
    firstName: String,
    lastName: String,
    companyName: String,
    contactNumber: String,
  },
  profileImageUrl: { type: String, default: 'https://res.cloudinary.com/diizmtj04/image/upload/v1751293061/default-pic_kl5jwr.avif' },
  amountAvailable: { type: Number, default: 200 },
  isSuspended: { type: Boolean, default: false },
  myTransactions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'transactions' }],
  isActive: { type: Boolean, default: true }
}, { timestamps: true, strict: false });

module.exports = mongoose.model('users', userSchema);
