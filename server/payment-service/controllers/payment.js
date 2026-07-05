const Razorpay = require('razorpay');
const crypto = require('crypto');
const axios = require('axios');

const transactionModel = require('../models/transaction.js')
let userModel = require('../models/user.js')
const movieShowModel = require('../models/movieShow.js')
const concertShowModel = require('../models/concertShow.js')
const paymentRefModel = require('../models/paymentReferences.js')


async function createOrder(req, res) {
  let body = req.body;

  // Create Razorpay instance here so env vars are always loaded
  const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });

  console.log('📦 Create order body:', JSON.stringify(body));
  console.log('🔑 key_id loaded:', process.env.RAZORPAY_KEY_ID);

  try {
    const amountInPaise = Math.round(body.amount * 100);
    console.log('💰 Amount in paise:', amountInPaise);

    if (!amountInPaise || isNaN(amountInPaise) || amountInPaise < 100) {
      return res.status(400).json({ error: `Invalid amount: ${body.amount} (${amountInPaise} paise)` });
    }

    const options = {
      amount: amountInPaise,
      currency: 'INR',
      receipt: `rcpt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    const payRef = await paymentRefModel.create({
      ...body,
      orderId: order.id,
      status: 'initiated',
    });

    console.log('Payment reference created:', payRef._id);

    res.json({
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      key_id: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    console.error('❌ Order creation error:', JSON.stringify(err, null, 2));
    res.status(500).json({
      error: 'Order creation failed',
      details: err.error?.description || err.message || JSON.stringify(err),
    });
  }
}


async function checkPaymentStatus(req, res) {
  const { orderId, paymentId, signature } = req.query;
  console.log(`[checkPaymentStatus] Polled for orderId=${orderId}, paymentId=${paymentId}, signature=${signature}`);

  if (!orderId) {
    return res.status(400).json({ error: 'Missing orderId' });
  }

  try {
    // 1. Check if it's already a full transaction (e.g. webhook succeeded)
    const transaction = await transactionModel.findOne({ razorpayOrderId: orderId });
    if (transaction) {
      return res.status(200).json({ status: transaction.status, ...transaction.toObject() });
    }

    // 2. Fallback to check the payment reference
    const payRef = await paymentRefModel.findOne({ orderId }).lean();
    if (!payRef) {
      return res.status(404).json({ error: 'Payment reference not found' });
    }

    // 3. If local dev or webhook hasn't fired yet, but frontend provided signature, verify it now
    if (payRef.status === 'initiated' && paymentId && signature) {
      const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(`${orderId}|${paymentId}`)
        .digest('hex');

      if (expectedSignature === signature) {
        // Mark as PAID
        await paymentRefModel.updateOne({ orderId }, { $set: { status: 'PAID' } });

        const adminCut = Math.floor(payRef.amount * 0.10);
        const splitCut = Math.floor(payRef.amount * 0.45);

        const newTransaction = await transactionModel.create({
          clientId: payRef.user,
          showId: payRef.metaData?.showId,
          seats: payRef.metaData?.seatsBooked || [],
          totalAmount: payRef.amount,
          adminAmount: adminCut,
          distributorAmount: splitCut,
          exhibitorAmount: splitCut,
          razorpayOrderId: orderId,
          razorpayPaymentId: paymentId,
          razorpaySignature: signature,
          status: 'SUCCESS',
          purpose: payRef.purpose,
          distributor: payRef.distributor,
          exhibitor: payRef.exhibitor,
          metaData: payRef.metaData,
          amount: payRef.amount,
          orderId: orderId,
          paymentId: paymentId,
        });

        // Revenue split
        await userModel.updateOne({ _id: payRef.user }, { $push: { myTransactions: newTransaction._id } });
        
        await userModel.findOneAndUpdate(
          { role: { $in: ['admin', 'ADMIN'] } },
          { $push: { myTransactions: newTransaction._id }, $inc: { amountAvailable: adminCut } },
          { new: true, sort: { createdAt: 1 } }
        );

        if (payRef.distributor) {
          await userModel.findOneAndUpdate(
            { _id: payRef.distributor },
            { $push: { myTransactions: newTransaction._id }, $inc: { amountAvailable: splitCut } }
          );
        }

        if (payRef.exhibitor) {
          await userModel.findOneAndUpdate(
            { _id: payRef.exhibitor },
            { $push: { myTransactions: newTransaction._id }, $inc: { amountAvailable: splitCut } }
          );
        }

        const obj = { transactionId: newTransaction._id, seatsBooked: payRef.metaData?.seatsBooked, BookedBy: payRef.user };
        
        if (payRef.purpose === 'movie') {
          await movieShowModel.findOneAndUpdate(
            { _id: payRef.metaData?.showId },
            { $push: { ticketsBooked: obj }, $inc: { ticketsAvailable: -(payRef.metaData?.seatsBooked?.length || 0) } }
          );
        } else if (payRef.purpose === 'concert') {
          await concertShowModel.findOneAndUpdate(
            { _id: payRef.metaData?.showId },
            { $push: { ticketsBooked: obj }, $inc: { ticketsAvailable: -(payRef.metaData?.seatsBooked?.length || 0) } }
          );
        }

        // Trigger email
        try {
          const user = await userModel.findById(payRef.user);
          if (user && user.email) {
            const isAsync = process.env.ASYNC_EMAIL === 'true';
            if (isAsync) {
              const { sendEmailJob } = require('./rabbitmq.js');
              await sendEmailJob(user.email, newTransaction.toObject());
            } else {
              // Fire-and-forget HTTP call to email service
              axios.post(
                `${process.env.EMAIL_SERVICE_URL || 'http://localhost:8004'}/email/invoice?email=${encodeURIComponent(user.email)}`,
                newTransaction.toObject()
              ).catch(err => console.error('Sync email error:', err.message));
            }
          }
        } catch (err) {
          console.error("Email error:", err.message);
        }

        return res.status(200).json({ status: 'SUCCESS', ...newTransaction.toObject() });
      }
    }

    return res.status(200).json({ status: payRef.status, ...payRef });
  } catch (err) {
    console.error('Error checking payment status:', err);
    return res.status(500).json({ error: 'Failed to check payment status', details: err.message });
  }
}


module.exports = { createOrder, checkPaymentStatus, cancelTicket };

async function cancelTicket(req, res) {
  try {
    const { transactionId, bankAccountDetails } = req.body;
    if (!transactionId || !bankAccountDetails) {
      return res.status(400).json({ error: 'Missing transactionId or bank account details' });
    }

    const transaction = await transactionModel.findById(transactionId);
    if (!transaction) return res.status(404).json({ error: 'Transaction not found' });
    if (transaction.status !== 'SUCCESS') return res.status(400).json({ error: 'Only SUCCESS transactions can be cancelled' });

    // Validate 24 hours
    let showDateStr;
    if (transaction.purpose === 'movie') {
      const show = await movieShowModel.findById(transaction.showId);
      if (!show) return res.status(404).json({ error: 'Show not found' });
      showDateStr = `${show.date}T${show.slot}`;
    } else {
      const show = await concertShowModel.findById(transaction.showId);
      if (!show) return res.status(404).json({ error: 'Show not found' });
      showDateStr = `${show.date}T${show.slot}`;
    }

    const showDate = new Date(showDateStr);
    const now = new Date();
    const hoursDiff = (showDate - now) / (1000 * 60 * 60);

    if (hoursDiff < 24) {
      return res.status(400).json({ error: 'Cannot cancel tickets within 24 hours of the show' });
    }

    // Update Transaction
    transaction.status = 'CANCELLED';
    transaction.bankAccountDetails = bankAccountDetails;
    await transaction.save();

    // Reverse Revenue Split
    await userModel.findOneAndUpdate(
      { role: { $in: ['admin', 'ADMIN'] } },
      { $inc: { amountAvailable: -(transaction.adminAmount || 0) } }
    );

    if (transaction.distributor) {
      await userModel.findOneAndUpdate(
        { _id: transaction.distributor },
        { $inc: { amountAvailable: -(transaction.distributorAmount || 0) } }
      );
    }

    if (transaction.exhibitor) {
      await userModel.findOneAndUpdate(
        { _id: transaction.exhibitor },
        { $inc: { amountAvailable: -(transaction.exhibitorAmount || 0) } }
      );
    }

    // Release Seats
    if (transaction.purpose === 'movie') {
      await movieShowModel.findByIdAndUpdate(transaction.showId, {
        $pull: { ticketsBooked: { transactionId: transaction._id } },
        $inc: { ticketsAvailable: transaction.seats.length }
      });
    } else if (transaction.purpose === 'concert') {
      await concertShowModel.findByIdAndUpdate(transaction.showId, {
        $pull: { ticketsBooked: { transactionId: transaction._id } },
        $inc: { ticketsAvailable: transaction.seats.length }
      });
    }

    res.json({ message: 'Ticket cancelled successfully', transaction });

  } catch (error) {
    console.error('Cancellation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
