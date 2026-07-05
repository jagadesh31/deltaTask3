const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const otpRoutes = require('./routes/otpRoute.js');
const transactionModel = require('./models/transaction.js');
const generatePdf = require('./pdfGenerator.js');
const { invoiceHandler } = require('./sendMail.js');

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
app.use('/otp', otpRoutes);

// Invoice email endpoint
app.post('/email/invoice', invoiceHandler);

// PDF download endpoint
app.get('/pdf/download', async (req, res) => {
  console.log('PDF download entered');
  let r = await transactionModel.findOne({orderId: req.query.orderId});
  if(r){
    let bufferData = await generatePdf(r);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'inline;filename="invoice.pdf"',
      'Content-Length': bufferData.length,
    });
    res.end(bufferData);
  } else {
    res.status(404).json({ message: 'Transaction not found' });
  }
});

app.get('/', (req, res) => {
  res.send('Email Service Running');
});

app.get('/health', (req, res) => {
  res.json({ port: Number(process.env.PORT) || 8004, health: true });
});

const PORT = process.env.PORT || 8004;

mongoose.connect(process.env.MONGODB_URL).then(async () => {
  console.log("Email Service: connected to mongodb");
  const isAsync = process.env.ASYNC_EMAIL === 'true';
  if (isAsync) {
    const { startEmailConsumer } = require('./rabbitmq.js');
    await startEmailConsumer();
    console.log("Email Service: Async mode (RabbitMQ consumer started)");
  } else {
    console.log("Email Service: Sync mode (direct email delivery)");
  }
  app.listen(PORT, () => {
    console.log(`Email Service is listening on http://localhost:${PORT}`);
  });
}).catch((err) => {
  console.log('error connecting to mongodb:' + err);
});
