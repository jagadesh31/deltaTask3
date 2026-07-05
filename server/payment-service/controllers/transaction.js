const jwt = require('jsonwebtoken')
const transactionModel = require('../models/transaction.js')
const userModel = require('../models/user.js')
const concertShowModel = require('../models/concertShow.js')
const movieShowModel = require('../models/movieShow.js')

const models = {
  movie: movieShowModel,
  concert: concertShowModel,
};


let findTransaction = async (req, res) => {
  let {id, date, fields, limit, distributor, exhibitor, vendor} = req.query;

  const projection = {};
  if (fields) {
    fields.split(',').forEach(field => projection[field] = 1);
  }

  try {
     let findRes;
     let query = {};
     if (date) query.date = date;
     if (vendor) query.vendor = vendor; // legacy support if any
     if (distributor) query.distributor = distributor;
     if (exhibitor) query.exhibitor = exhibitor;

    if(id){
     findRes = await transactionModel.find({_id:id},projection).populate('clientId').populate('distributor').populate('exhibitor')
    } else if (limit) {
      findRes = await transactionModel.find(query,projection).sort({ createdAt : -1 }).limit(Number(limit)).populate('clientId').populate('distributor').populate('exhibitor');
    } else {
      findRes = await transactionModel.find(query,projection).sort({ createdAt : -1 }).populate('clientId').populate('distributor').populate('exhibitor');
    }
   

    if (!findRes) {
      return res.status(404).json({ error: 'shows not found' })
    } else {
      res.status(200).json(findRes)
    }
  } catch (err) {
    console.error(`Error finding show : ${err.message}`)
  }
}

const addTransaction = async (req, res) => {
  try {
    let addRes = await transactionModel.insertOne(req.body);
    res.status(201).json(addRes);
  } catch (err) {
    console.log('error in adding transaction ', err)
  }
}

const cancelTicket = async (req,res)=>{
  let {transactionId} = req.query;

  try{
   transactionModel.findOneAndUpdate({_id:transactionId},{$set:{status:"CANCELLED"}},{new:true}).then((r1)=>{
    console.log('Cancelled transaction:', r1._id)
  
    if(r1.distributor) {
        userModel.findOneAndUpdate({ _id: r1.distributor }, {$inc: {amountAvailable: -r1.distributorAmount} }, { new: true }).catch((err) => { console.log('error in refunding money to distributor',err) })
    }
    if(r1.exhibitor) {
        userModel.findOneAndUpdate({ _id: r1.exhibitor }, {$inc: {amountAvailable: -r1.exhibitorAmount} }, { new: true }).catch((err) => { console.log('error in refunding money to exhibitor',err) })
    }
    if(r1.adminAmount) {
        userModel.findOneAndUpdate({ role: { $in: ['admin', 'ADMIN'] } }, {$inc: {amountAvailable: -r1.adminAmount} }, { new: true, sort: { createdAt: 1 } }).catch((err) => { console.log('error in refunding admin fee',err) })
    }

      let model = models[r1.purpose];
      if (model) {
        model.updateOne(
          { _id: r1.metaData.showId },
       { $pull: { seatsBooked: { transactionId : transactionId } } })
      .then((r3)=>{
           console.log('cancelled successfully')
              res.json('successfully cancelled')
      })
      } else {
        res.json('successfully cancelled')
      }
    })
 } catch(err){
  console.log('error in cancelling tickets')
 }
}


const getAnalytics = async (req, res) => {
  try {
    const pipeline = [
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          amount: { $sum: "$amount" },
          adminAmount: { $sum: "$adminAmount" }
        }
      }
    ];
    
    const results = await transactionModel.aggregate(pipeline);
    
    let analytics = {
      totalTransactions: 0,
      totalAmount: 0,
      successfulTransactions: 0,
      successfulAmount: 0,
      failedTransactions: 0,
      failedAmount: 0,
      cancelledTransactions: 0,
      cancelledAmount: 0
    };

    results.forEach(r => {
      analytics.totalTransactions += r.count;
      analytics.totalAmount += (r.amount || 0);
      
      if (r._id === 'SUCCESS' || r._id === 'PAID') {
        analytics.successfulTransactions += r.count;
        analytics.successfulAmount += (r.adminAmount || r.amount * 0.1 || 0);
      } else if (r._id === 'FAILED') {
        analytics.failedTransactions += r.count;
        analytics.failedAmount += (r.amount || 0);
      } else if (r._id === 'CANCELLED') {
        analytics.cancelledTransactions += r.count;
        analytics.cancelledAmount += (r.amount || 0);
      }
    });

    res.status(200).json(analytics);
  } catch (err) {
    console.error('Error fetching analytics:', err);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
};

module.exports = { findTransaction, addTransaction, cancelTicket, getAnalytics };
