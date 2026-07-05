const crypto = require('crypto');
const axios = require('axios');
const mongoose = require('mongoose');
const Transaction = require('../models/transaction');

const razorpayWebhook = async (req, res) => {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) {
    console.error('RAZORPAY_WEBHOOK_SECRET not configured');
    return res.status(500).json({ status: 'failed', error: 'Webhook secret not configured' });
  }
  
  // 1. Verify Razorpay Signature
  const shasum = crypto.createHmac('sha256', secret);
  shasum.update(JSON.stringify(req.body));
  const digest = shasum.digest('hex');

  if (digest !== req.headers['x-razorpay-signature']) {
    return res.status(400).json({ status: 'failed', error: 'Invalid signature' });
  }

  // Event parsing
  const event = req.body.event;
  const paymentEntity = req.body.payload.payment.entity;
  const orderId = paymentEntity.order_id;
  const paymentId = paymentEntity.id;
  const idempotencyKey = req.headers['x-razorpay-event-id']; // Unique ID for this webhook event

  try {
    // 2. Idempotency Check
    const existingTransaction = await Transaction.findOne({ idempotencyKey });
    if (existingTransaction) {
      console.log(`Webhook already processed for event: ${idempotencyKey}`);
      return res.status(200).json({ status: 'ok', message: 'Already processed' });
    }

    // Find the pending payment reference
    const payRef = await mongoose.connection.db.collection('paymentrefs').findOne({ orderId: orderId });
    if (!payRef) {
      return res.status(404).json({ status: 'failed', error: 'Payment reference not found' });
    }

    if (payRef.status === 'PAID') {
      return res.status(200).json({ status: 'ok', message: 'Transaction already marked as success' });
    }

    // 3. Process Event
    if (event === 'payment.captured' || event === 'payment.authorized') {
      // Mark payRef as PAID
      await mongoose.connection.db.collection('paymentrefs').updateOne({ orderId: orderId }, { $set: { status: 'PAID' } });

      const adminCut = Math.floor(payRef.amount * 0.10);
      const splitCut = Math.floor(payRef.amount * 0.45);

      // Create transaction record
      const transactionData = {
        clientId: payRef.user,
        showId: payRef.metaData?.showId,
        seats: payRef.metaData?.seatsBooked || [],
        totalAmount: payRef.amount,
        adminAmount: adminCut,
        distributorAmount: splitCut,
        exhibitorAmount: splitCut,
        razorpayOrderId: orderId,
        razorpayPaymentId: paymentId,
        status: 'SUCCESS',
        purpose: payRef.purpose,
        distributor: payRef.distributor,
        exhibitor: payRef.exhibitor,
        metaData: payRef.metaData,
        amount: payRef.amount,
        orderId: orderId,
        paymentId: paymentId,
        idempotencyKey: idempotencyKey
      };
      
      const transaction = await Transaction.create(transactionData);

      // Revenue split and myTransactions update
      try {
        const db = mongoose.connection.db;

        // User's myTransactions
        await db.collection('users').updateOne(
          { _id: new mongoose.Types.ObjectId(payRef.user) },
          { $push: { myTransactions: transaction._id } }
        );

        // Admin Cut
        const admin = await db.collection('users').findOne({ role: { $in: ['admin', 'ADMIN'] } });
        if (admin) {
           await db.collection('users').updateOne(
             { _id: admin._id },
             { $push: { myTransactions: transaction._id }, $inc: { amountAvailable: adminCut } }
           );
        }

        // Distributor
        if (payRef.distributor) {
          await db.collection('users').updateOne(
            { _id: new mongoose.Types.ObjectId(payRef.distributor) },
            { $push: { myTransactions: transaction._id }, $inc: { amountAvailable: splitCut } }
          );
        }

        // Exhibitor
        if (payRef.exhibitor) {
          await db.collection('users').updateOne(
            { _id: new mongoose.Types.ObjectId(payRef.exhibitor) },
            { $push: { myTransactions: transaction._id }, $inc: { amountAvailable: splitCut } }
          );
        }

        const obj = {
          transactionId: transaction._id,
          seatsBooked: payRef.metaData?.seatsBooked,
          BookedBy: payRef.user,
        };

        // Show update
        if (payRef.purpose === 'movie') {
          await db.collection('movieshows').updateOne(
            { _id: new mongoose.Types.ObjectId(payRef.metaData?.showId) },
            {
              $push: { ticketsBooked: obj },
              $inc: { ticketsAvailable: -(payRef.metaData?.seatsBooked?.length || 0) },
            }
          );
        } else if (payRef.purpose === 'concert') {
          await db.collection('concertshows').updateOne(
            { _id: new mongoose.Types.ObjectId(payRef.metaData?.showId) },
            {
              $push: { ticketsBooked: obj },
              $inc: { ticketsAvailable: -(payRef.metaData?.seatsBooked?.length || 0) },
            }
          );
        }

      } catch (err) {
        console.error('Revenue split logic error:', err);
      }

      // 4. Push job to RabbitMQ
      try {
        const user = await mongoose.connection.db.collection('users').findOne({_id: new mongoose.Types.ObjectId(payRef.user)});
        if(user && user.email) {
          const isAsync = process.env.ASYNC_EMAIL === 'true';
          if (isAsync) {
            const { sendEmailJob } = require('./rabbitmq.js');
            await sendEmailJob(user.email, transactionData);
            console.log(`Payment captured. Email job pushed to queue for ${user.email}.`);
          } else {
            axios.post(
              `${process.env.EMAIL_SERVICE_URL || 'http://localhost:8004'}/email/invoice?email=${encodeURIComponent(user.email)}`,
              transactionData
            ).catch(err => console.error('Sync email error:', err.message));
            console.log(`Payment captured. Sync email requested for ${user.email}.`);
          }
        } else {
          console.log(`Payment captured but user email not found for clientId ${payRef.user}`);
        }
      } catch (err) {
        console.error(`Failed to push invoice job to queue: ${err.message}`);
      }
      return res.status(200).json({ status: 'ok' });

    } else if (event === 'payment.failed') {
      await mongoose.connection.db.collection('paymentrefs').updateOne({ orderId: orderId }, { $set: { status: 'FAILED' } });
      return res.status(200).json({ status: 'ok' });
    }

    // Acknowledge other events
    return res.status(200).json({ status: 'ok' });

  } catch (error) {
    console.error('Webhook processing error:', error);
    return res.status(500).json({ status: 'failed', error: 'Internal server error' });
  }
};

module.exports = { razorpayWebhook };
