const express = require('express');
const { addReview, getReviews } = require('../controllers/review.js');

const reviewRoute = express.Router();

reviewRoute.post('/add', addReview);
reviewRoute.get('/find', getReviews);

module.exports = reviewRoute;
