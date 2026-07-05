/**
 * Seed script for NittBooking
 * Run: node seed.js
 * This seeds movies, concerts, theaters, stadiums, and shows into MongoDB.
 */

const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URL = process.env.MONGODB_URL;

// ─── Inline Schemas (match app-service models exactly) ──────────────────────

const movieSchema = new mongoose.Schema({ type:String,title:String,duration:String,genre:Array,director:Array,writer:Array,actors:Array,plot:String,language:Array,country:String,poster:String },{strict:false});
const theaterSchema = new mongoose.Schema({ name:String,location:String,screen:Object },{strict:false});
const movieShowSchema = new mongoose.Schema({ movie:{type:mongoose.Schema.Types.ObjectId,ref:'movies'},theater:{type:mongoose.Schema.Types.ObjectId,ref:'theaters'},date:String,slot:String,basePrice:Number,ticketsBooked:Array,ticketsAvailable:Number },{strict:false});
const concertSchema = new mongoose.Schema({ type:String,title:String,duration:String,genre:Array,Artist:String,plot:String,language:Array,country:String,poster:String },{strict:false});
const stadiumSchema = new mongoose.Schema({ name:String,location:String },{strict:false});
const concertShowSchema = new mongoose.Schema({ concert:{type:mongoose.Schema.Types.ObjectId,ref:'concerts'},stadium:{type:mongoose.Schema.Types.ObjectId,ref:'stadiums'},date:String,slot:String,basePrice:Number,ticketsBooked:Array,ticketsAvailable:Number },{strict:false});

const Movie = mongoose.model('movies', movieSchema);
const Theater = mongoose.model('theaters', theaterSchema);
const MovieShow = mongoose.model('mshows', movieShowSchema);
const Concert = mongoose.model('concerts', concertSchema);
const Stadium = mongoose.model('stadiums', stadiumSchema);
const ConcertShow = mongoose.model('cshows', concertShowSchema);

// ─── Seat Layout Generator ───────────────────────────────────────────────────

function generateSeats(rows, cols) {
  const seats = [];
  for (let r = 0; r < rows; r++) {
    const row = [];
    for (let c = 0; c < cols; c++) {
      const id = String.fromCharCode(65 + r) + (c + 1);
      const value = r < 2 ? 1.5 : r < 5 ? 1.2 : 1.0;
      const type  = r < 2 ? 'vip' : r < 5 ? 'premium' : 'standard';
      row.push({ id, type, value });
    }
    seats.push(row);
  }
  return seats;
}

const ROWS = 8, COLS = 10;
const theaterLayout = {
  capacity: String(ROWS * COLS),
  seatsLayout: { rows: String(ROWS), columns: String(COLS), seats: generateSeats(ROWS, COLS) }
};

// ─── Seed Data ───────────────────────────────────────────────────────────────

const movies = [
  { type:'movie', title:'Interstellar', duration:'169 min', genre:['Sci-Fi','Action'], director:['Christopher Nolan'], writer:['Jonathan Nolan'], actors:['Matthew McConaughey','Anne Hathaway'], plot:'A team of explorers travel through a wormhole in space.', language:['English'], country:'USA', poster:'https://m.media-amazon.com/images/M/MV5BZjdkOTU3MDktN2IxOS00OGEyLWFmMTEtY2Q1OWY2MzJhZTc2XkEyXkFqcGdeQXVyMTMxODk2OTU@._V1_SX300.jpg' },
  { type:'movie', title:'The Dark Knight', duration:'152 min', genre:['Action','Thriller'], director:['Christopher Nolan'], writer:['Jonathan Nolan'], actors:['Christian Bale','Heath Ledger'], plot:'Batman faces the Joker, a criminal mastermind.', language:['English'], country:'USA', poster:'https://m.media-amazon.com/images/M/MV5BMTMxNTMwODM0NF5BMl5BanBnXkFtZTcwODAyMTk2Mw@@._V1_SX300.jpg' },
  { type:'movie', title:'Inception', duration:'148 min', genre:['Sci-Fi','Thriller'], director:['Christopher Nolan'], writer:['Christopher Nolan'], actors:['Leonardo DiCaprio','Joseph Gordon-Levitt'], plot:'A thief who steals corporate secrets through the use of dream-sharing technology.', language:['English'], country:'USA', poster:'https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg' },
  { type:'movie', title:'A Quiet Place', duration:'90 min', genre:['Horror','Thriller'], director:['John Krasinski'], writer:['Bryan Woods'], actors:['Emily Blunt','John Krasinski'], plot:'A family struggles to survive in a post-apocalyptic world with creatures that hunt by sound.', language:['English'], country:'USA', poster:'https://m.media-amazon.com/images/M/MV5BMjI0MDMzNTQ0M15BMl5BanBnXkFtZTgwMTM5NzM3NDM@._V1_SX300.jpg' },
  { type:'movie', title:'Get Out', duration:'104 min', genre:['Horror','Thriller'], director:['Jordan Peele'], writer:['Jordan Peele'], actors:['Daniel Kaluuya','Allison Williams'], plot:'A young African-American visits his white girlfriend\'s parents for the weekend.', language:['English'], country:'USA', poster:'https://m.media-amazon.com/images/M/MV5BMjUxMDQwNjcyMl5BMl5BanBnXkFtZTgwNzcwMzc1MTI@._V1_SX300.jpg' },
  { type:'movie', title:'Dune', duration:'155 min', genre:['Sci-Fi','Action'], director:['Denis Villeneuve'], writer:['Jon Spaihts'], actors:['Timothée Chalamet','Zendaya'], plot:'Paul Atreides leads nomadic tribes in a revolt against the galactic empire on Arrakis.', language:['English'], country:'USA', poster:'https://m.media-amazon.com/images/M/MV5BN2FjNmEyNWMtYzM0ZS00NjIyLTg2Y2MtYTgyMGI3ZmY1MWQyXkEyXkFqcGdeQXVyMTkxNjUyNQ@@._V1_SX300.jpg' },
];

const concerts = [
  { type:'concert', title:'Coldplay World Tour 2025', duration:'180 min', genre:['Pop','Rock'], Artist:'Coldplay', plot:'Experience the magic of Coldplay live on their Music of the Spheres World Tour.', language:['English'], country:'UK', poster:'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=400&h=600&fit=crop' },
  { type:'concert', title:'AR Rahman Live', duration:'150 min', genre:['Pop'], Artist:'AR Rahman', plot:'Witness the maestro AR Rahman performing his iconic compositions live.', language:['Tamil','Hindi'], country:'India', poster:'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=600&fit=crop' },
  { type:'concert', title:'Arijit Singh Live in Concert', duration:'120 min', genre:['Pop'], Artist:'Arijit Singh', plot:'An unforgettable evening with Bollywood\'s most beloved voice.', language:['Hindi'], country:'India', poster:'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&h=600&fit=crop' },
];

const theaters = [
  { name:'PVR Cinemas - IMAX', location:'Chennai, Tamil Nadu', layout: theaterLayout },
  { name:'Rohini Silver Screens', location:'Chennai, Tamil Nadu', layout: theaterLayout },
];

const stadiums = [
  { name:'YMCA Ground', location:'Chennai, Tamil Nadu', layout: theaterLayout },
  { name:'Jawaharlal Nehru Stadium', location:'Chennai, Tamil Nadu', layout: theaterLayout },
];

// Helper to get future dates
function futureDate(daysFromNow) {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d.toISOString().split('T')[0];
}

async function seed() {
  await mongoose.connect(MONGODB_URL);
  console.log('✅ Connected to MongoDB');

  // Clear existing data
  await Promise.all([
    Movie.deleteMany({}),
    Theater.deleteMany({}),
    MovieShow.deleteMany({}),
    Concert.deleteMany({}),
    Stadium.deleteMany({}),
    ConcertShow.deleteMany({}),
  ]);
  console.log('🗑️  Cleared existing collections');

  // Insert movies & theaters
  const insertedMovies  = await Movie.insertMany(movies);
  const insertedTheaters = await Theater.insertMany(theaters);
  const insertedConcerts = await Concert.insertMany(concerts);
  const insertedStadiums = await Stadium.insertMany(stadiums);
  console.log(`🎬 Inserted ${insertedMovies.length} movies`);
  console.log(`🎭 Inserted ${insertedTheaters.length} theaters`);
  console.log(`🎵 Inserted ${insertedConcerts.length} concerts`);
  console.log(`🏟️  Inserted ${insertedStadiums.length} stadiums`);

  // Create movie shows (2 per movie, different dates & slots)
  const slots = ['10:00 AM', '02:00 PM', '06:00 PM', '09:30 PM'];
  const movieShows = [];
  insertedMovies.forEach((movie, mi) => {
    const theater = insertedTheaters[mi % insertedTheaters.length];
    for (let d = 1; d <= 5; d++) {
      slots.forEach(slot => {
        movieShows.push({
          movie: movie._id,
          theater: theater._id,
          date: futureDate(d),
          slot,
          basePrice: 150,
          ticketsBooked: [],
          ticketsAvailable: ROWS * COLS,
        });
      });
    }
  });
  await MovieShow.insertMany(movieShows);
  console.log(`🎟️  Inserted ${movieShows.length} movie shows`);

  // Create concert shows
  const concertShows = [];
  insertedConcerts.forEach((concert, ci) => {
    const stadium = insertedStadiums[ci % insertedStadiums.length];
    for (let d = 3; d <= 7; d++) {
      concertShows.push({
        concert: concert._id,
        stadium: stadium._id,
        date: futureDate(d),
        slot: '07:00 PM',
        basePrice: 500,
        ticketsBooked: [],
        ticketsAvailable: ROWS * COLS,
      });
    }
  });
  await ConcertShow.insertMany(concertShows);
  console.log(`🎟️  Inserted ${concertShows.length} concert shows`);

  console.log('\n🚀 Seed complete! You can now open http://localhost:8000/home');
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch(err => {
  console.error('❌ Seed error:', err);
  process.exit(1);
});
