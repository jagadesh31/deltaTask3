const jwt = require('jsonwebtoken')
const movieShowModel = require('../models/movieShow.js')
const mongoose = require('mongoose')

let findShow = async (req, res) => {
  let {movieId,date,fields,showId,top,exhibitorId,theaterId} = req.query;
  console.log(showId)

  console.log('entered')

  const projection = {};
  if (fields) {
    fields.split(',').forEach(field => projection[field] = 1);
  }

  try {
      let query = {};
      if (showId) query._id = showId;
      if (movieId) query.movieId = movieId;
      if (theaterId) query.theaterId = theaterId;
      if (date) query.date = date;
      
      let rawRes = await movieShowModel.find(query, projection)
        .populate("movieId")
        .populate("theaterId");

      const raw = rawRes.map(doc => {
        let obj = doc.toObject ? doc.toObject() : doc;
        obj.movie = obj.movieId;
        obj.theater = obj.theaterId;
        return obj;
      });

      // Handle exhibitorId which requires filtering by theater's organizedBy
      if (exhibitorId) {
        findRes = raw.filter(d => d.theater && d.theater.organizedBy && d.theater.organizedBy?.toString() === exhibitorId);
      } else if (movieId && !date && !showId) {
        findRes = raw.filter(d => d.theater && d.theater.status === 'ACTIVE');
      } else {
        findRes = raw;
      }

      if (top) {
        findRes = findRes.sort((a,b) => a.ticketsAvailable - b.ticketsAvailable).slice(0, top);
      }
   

    if (!findRes) {
      return res.status(404).json({ error: 'shows not found' })
    } else {
      res.status(200).json(findRes)
    }
  } catch (err) {
    console.error(`Error finding show : ${err.message}`)
    res.status(500).json({ error: 'Internal Server Error' })
  }
}

const addShow = async (req, res) => {
  try {
    let addRes = await movieShowModel.create(req.body);
    res.status(200).json({message:"successfully created"})
    console.log(addRes)
  } catch (err) {
    console.log('error in adding show ', err)
    res.status(500).json({ error: 'Internal Server Error' })
  }
}

const updateTicketsBooked = async (req,res) =>{
  console.log('updateShow')
  let showId = req.query.showId;
  let obj = req.body;
  console.log(showId,obj)
  try{
       let updateRes= await movieShowModel.updateOne({_id:showId},{$push:{"ticketsBooked" : obj}},{new:true});
   console.log(updateRes)
  } catch(err){
    console.log('error in updating show', err);
    res.status(500).json({ error: 'Internal Server Error' })
  }
}

const updateShow = async (req, res) => {
  try {
    let updateRes = await movieShowModel.updateOne({_id:req.query.id},req.body);
    res.status(201).json({message:"successfully updated",updateRes});
  } catch (err) {
    console.log('error in update show ', err)
    res.status(500).json({ error: 'Internal Server Error' })
  }
};

const deleteShow = async (req, res) => {
  let {id} = req.query;
  try {
    let Res = await movieShowModel.deleteOne({_id:id});
    res.status(200).json({message:"successfully deleted",Res});
  } catch (err) {
    console.log('error in delete show ', err)
    res.status(500).json({ error: 'Internal Server Error' })
  }
}


module.exports = { findShow,addShow,updateShow,deleteShow,updateTicketsBooked}
