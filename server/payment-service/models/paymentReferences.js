let mongoose = require('mongoose')

const paymentRefSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },   
  distributor: { type: mongoose.Schema.Types.ObjectId, ref: 'users' }, 
  exhibitor: { type: mongoose.Schema.Types.ObjectId, ref: 'users' }, 
  orderId: String,  
  amount: Number,
  purpose: { type: String, enum: ['movie', 'concert'] },
  meta: {
  },
  status : { type: String, enum: ['initiated', 'pending', 'expired', 'PAID'], default: 'initiated' },
  createdAt : { type: Date, default: Date.now },
  expiresIn: { type: Date, index: { expires: 300} }},
  { strict: false , strictPopulate: false}
) 

let paymentRefModel = mongoose.model('paymentreferences', paymentRefSchema)

module.exports = paymentRefModel;
