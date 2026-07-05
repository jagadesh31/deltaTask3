let express = require('express');
let {findMovie,addMovie,updateMovie,deleteMovie,approveMovie} = require('../controllers/movie.js');

let movieRoutes = express.Router();

movieRoutes.get('/find',findMovie);
movieRoutes.post('/add',addMovie);
movieRoutes.patch('/update',updateMovie);
movieRoutes.delete('/delete',deleteMovie);
movieRoutes.patch('/approve',approveMovie);

module.exports=movieRoutes;
