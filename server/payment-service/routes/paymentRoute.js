const express = require('express');
const paymentRoute = express.Router();
const {createOrder,checkPaymentStatus,cancelTicket} = require('../controllers/payment.js');
const {razorpayWebhook} = require('../controllers/webhook.js');

paymentRoute.get('/status', checkPaymentStatus);
paymentRoute.post('/create-order', createOrder);
paymentRoute.post('/webhook', razorpayWebhook);
paymentRoute.post('/cancel', cancelTicket);

module.exports = paymentRoute;
