const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const movieRoutes = require('./routes/moviesRoute.js');
const movieShowRoutes = require('./routes/movieShowsRoute.js');
const theaterRoutes = require('./routes/theatersRoute.js');
const reviewRoutes = require('./routes/reviewRoute.js');
const waitlistRoutes = require('./routes/waitlistRoute.js');

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
app.use('/movie', movieRoutes);
app.use('/movieShow', movieShowRoutes);
app.use('/theater', theaterRoutes);
app.use('/review', reviewRoutes);
app.use('/waitlist', waitlistRoutes);

app.get('/', (req, res) => {
  res.send('App Service Running');
});

app.get('/health', (req, res) => {
  res.json({ port: Number(process.env.PORT) || 8002, health: true });
});

const PORT = process.env.PORT || 8002;

mongoose.connect(process.env.MONGODB_URL).then(() => {
  console.log("App Service: connected to mongodb");
  app.listen(PORT, () => {
    console.log(`App Service is listening on http://localhost:${PORT}`);
  });
}).catch((err) => {
  console.log('error connecting to mongodb:' + err);
});
