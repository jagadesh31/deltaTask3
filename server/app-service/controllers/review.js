const reviewModel = require('../models/review.js');

const addReview = async (req, res) => {
  try {
    const review = await reviewModel.create(req.body);
    res.status(201).json(review);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add review' });
  }
};

const getReviews = async (req, res) => {
  try {
    const { movieId } = req.query;
    const reviews = await reviewModel.find({ movieId }).populate('userId', 'username profileImageUrl');
    res.status(200).json(reviews);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
};

module.exports = { addReview, getReviews };
