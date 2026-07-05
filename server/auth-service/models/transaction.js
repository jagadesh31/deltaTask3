const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },   
    vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'users' }, 
    link_id: String,  
    amount: Number,
    purpose: { type: String, enum: ['movie', 'concert'] },
    meta: {
    },
  status: { type: String, enum: ['PAID', 'FAILED','CANCELLED'] },
  paymentMode: String,
}
,{strict:false, strictPopulate: false});

const transactionModel = mongoose.model('transactions', transactionSchema);

module.exports = transactionModel;
