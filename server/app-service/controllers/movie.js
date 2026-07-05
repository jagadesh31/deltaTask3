const jwt = require('jsonwebtoken')
const movieModel = require('../models/movie.js')
require('../models/user.js');

const { createClient } = require('redis');

const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

redisClient.on('error', err => console.log('Redis Client Error', err));
redisClient.connect().catch(console.error);

let findMovie = async (req, res) => {
  let {movieId, fields, organizedBy, addedBy, status} = req.query;

   const projection = {};
  if (fields) {
    fields.split(',').forEach(field => projection[field] = 1);
  }
  
  try {
    const cacheKey = `movies:${JSON.stringify(req.query)}`;
    const cachedData = await redisClient.get(cacheKey);

    if (cachedData) {
      return res.status(200).json(JSON.parse(cachedData));
    }

    let query = {};
    if (movieId) query._id = movieId;
    if (organizedBy) query.organizedBy = organizedBy;
    if (addedBy) query.addedBy = addedBy;
    // Clients should only see ACTIVE movies. Admins and distributors can specify other statuses.
    if (status) query.status = status;
    
    let findRes = await movieModel.find(query, projection).populate('addedBy', 'email username role');

    if (!findRes || findRes.length === 0) {
      return res.status(404).json({ error: 'movies not found' })
    } else {
      // Cache for 1 hour (3600 seconds)
      await redisClient.setEx(cacheKey, 3600, JSON.stringify(findRes));
      res.status(200).json(findRes)
    }
  } catch (err) {
    console.error(`Error finding movie : ${err.message}`)
    res.status(500).json({ error: err.message })
  }
}

const addMovie = async (req, res) => {
  try {
    // Force status to PENDING_APPROVAL on creation
    const movieData = {
      ...req.body,
      status: 'PENDING_APPROVAL'
    };
    let addRes = await movieModel.create(movieData);
    res.status(201).json({message:"successfully created", addRes});
  } catch (err) {
    console.log('error in adding movie ', err)
    res.status(500).json({ error: err.message })
  }
}

const updateMovie = async (req, res) => {
  try {
    // Only Admin can set to ACTIVE, but that logic might be enforced by route middleware or specific endpoints.
    let updateRes = await movieModel.updateOne({_id:req.query.id}, req.body);
    res.status(200).json({message:"successfully updated", updateRes});
  } catch (err) {
    console.log('error in update movie ', err)
    res.status(500).json({ error: err.message })
  }
};

const deleteMovie = async (req, res) => {
  let {id} = req.query;
  try {
    let Res = await movieModel.deleteOne({_id:id});
    res.status(200).json({message:"successfully deleted", Res});
  } catch (err) {
    console.log('error in delete movie ', err)
    res.status(500).json({ error: err.message })
  }
}

// Admin Specific Logic
const approveMovie = async (req, res) => {
  let {id} = req.query;
  try {
    let updateRes = await movieModel.updateOne({_id:id}, { status: 'ACTIVE', globalCommissionRate: req.body.globalCommissionRate || 10 });
    res.status(200).json({message:"successfully approved", updateRes});
  } catch (err) {
    console.log('error in approve movie ', err)
    res.status(500).json({ error: err.message })
  }
}

module.exports = { findMovie, addMovie, updateMovie, deleteMovie, approveMovie }
