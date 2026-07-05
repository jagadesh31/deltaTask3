const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const dbRoutes = require('./routes/userdb.js');

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
app.use('/auth', dbRoutes);

app.get('/', (req, res) => {
  res.send('Auth Service Running');
});

app.get('/health', (req, res) => {
  res.json({ port: Number(process.env.PORT) || 8001, health: true });
});

const PORT = process.env.PORT || 8001;

mongoose.connect(process.env.MONGODB_URL).then(() => {
  console.log("Auth Service: connected to mongodb");
  app.listen(PORT, () => {
    console.log(`Auth Service is listening on http://localhost:${PORT}`);
  });
}).catch((err) => {
  console.log('error connecting to mongodb:' + err);
});
