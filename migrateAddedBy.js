const mongoose = require('mongoose');

// Connect directly to the database
mongoose.connect('mongodb+srv://jagadesh:5H8DNdJgxtRgoeot@cluster1.0qd3hua.mongodb.net/NittBooking?retryWrites=true&w=majority&appName=cluster1')
  .then(async () => {
    console.log('Connected to MongoDB');
    
    // Create models
    const Movie = mongoose.model('movies', new mongoose.Schema({}, { strict: false }));
    const Theater = mongoose.model('theaters', new mongoose.Schema({}, { strict: false }));
    const MovieShow = mongoose.model('movieshows', new mongoose.Schema({}, { strict: false }));

    const distributorId = new mongoose.Types.ObjectId('6a382f75fdfb891f79bdadb8');

    // 1. Update all movies
    const movieResult = await Movie.updateMany({}, { $set: { addedBy: distributorId } });
    console.log(`Updated ${movieResult.modifiedCount} movies to addedBy: ${distributorId}`);

    // 2. Update all theaters to copy organizedBy to addedBy
    let theaters = await Theater.find({});
    let theaterCount = 0;
    for (let t of theaters) {
      if (t.organizedBy && !t.addedBy) {
        await Theater.updateOne({ _id: t._id }, { $set: { addedBy: new mongoose.Types.ObjectId(t.organizedBy) } });
        theaterCount++;
      }
    }
    console.log(`Updated ${theaterCount} theaters to inherit organizedBy as addedBy`);

    // 3. Update all shows to copy organizedBy to addedBy
    let shows = await MovieShow.find({});
    let showCount = 0;
    for (let s of shows) {
      if (s.organizedBy && !s.addedBy) {
        await MovieShow.updateOne({ _id: s._id }, { $set: { addedBy: new mongoose.Types.ObjectId(s.organizedBy) } });
        showCount++;
      }
    }
    console.log(`Updated ${showCount} shows to inherit organizedBy as addedBy`);

    console.log('Migration Complete');
    process.exit(0);
  })
  .catch(err => {
    console.error('Connection error', err);
    process.exit(1);
  });
