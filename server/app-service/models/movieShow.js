const mongoose = require('mongoose');

const showSchema = new mongoose.Schema({
  addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
  exhibitorId: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
  movieId: { type: mongoose.Schema.Types.ObjectId, ref: 'movies' },
  theaterId: { type: mongoose.Schema.Types.ObjectId, ref: 'theaters' },
  startTime: { type: Date },
  endTime: { type: Date },
  basePrice: { type: Number, default: 100 },
  status: { 
    type: String, 
    enum: ['SCHEDULED', 'ONGOING', 'COMPLETED', 'CANCELLED'], 
    default: 'SCHEDULED' 
  },
  bookedSeats: [{
    seatId: String,
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    transactionId: { type: mongoose.Schema.Types.ObjectId, ref: 'transactions' }
  }]
}, { timestamps: true, strict: false });

// Pre-save validation
showSchema.pre('save', async function(next) {
  const Movie = mongoose.model('movies');
  const Theater = mongoose.model('theaters');
  
  if (this.movieId) {
    const movie = await Movie.findById(this.movieId);
    if (!movie || movie.status !== 'ACTIVE') throw new Error('Show creation failed: Movie must be ACTIVE.');
  }
  
  if (this.theaterId) {
    const theater = await Theater.findById(this.theaterId);
    if (!theater || theater.status !== 'ACTIVE') throw new Error('Show creation failed: Theater must be ACTIVE.');
  }
  next();
});

module.exports = mongoose.model('movieShows', showSchema);
