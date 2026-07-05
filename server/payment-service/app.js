const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const paymentRoute = require('./routes/paymentRoute.js');
const transactionRoutes = require('./routes/transactionsRoute.js');

let app = express();

app.use(cors());

app.use((req, res, next) => {
  const allowedOrigin = process.env.CLIENT_URL;
  res.header("Access-Control-Allow-Origin", allowedOrigin);
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  next();
});

app.use(express.json());
app.use('/payment', paymentRoute);
app.use('/transaction', transactionRoutes);

app.get('/', (req, res) => {
  res.send('Payment Service Running');
});

app.get('/health', (req, res) => {
  res.json({ port: Number(process.env.PORT) || 8003, health: true });
});

const PORT = process.env.PORT || 8003;

mongoose.connect(process.env.MONGODB_URL).then(async () => {
  console.log("Payment Service: connected to mongodb");
  if (process.env.ASYNC_EMAIL === 'true') {
    const { connectQueue } = require('./rabbitmq.js');
    await connectQueue();
    console.log("Payment Service: RabbitMQ connected (async email mode)");
  } else {
    console.log("Payment Service: Sync email mode (no RabbitMQ)");
  }
  app.listen(PORT, () => {
    console.log(`Payment Service is listening on http://localhost:${PORT}`);
  });
}).catch((err) => {
  console.log('error connecting to mongodb:' + err);
});
