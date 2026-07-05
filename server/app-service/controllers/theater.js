const jwt = require('jsonwebtoken')
const theaterModel = require('../models/theater.js')
require('../models/user.js');

let findTheater = async (req, res) => {
  let {theaterId, fields, exhibitorId, organizedBy, addedBy, status} = req.query;

  const projection = {};
  if (fields) {
    fields.split(',').forEach(field => projection[field] = 1);
  }
    
  try {
    let query = {};
    if (theaterId) query._id = theaterId;
    if (exhibitorId) query.exhibitorId = exhibitorId;
    if (organizedBy) query.organizedBy = organizedBy;
    if (addedBy) query.addedBy = addedBy;
    if (status) query.status = status;
    
    let findRes = await theaterModel.find(query, projection).populate('addedBy', 'email username role');
  
    if (!findRes || findRes.length === 0) {
      return res.status(404).json({ error: 'theater not found' })
    } else {
      res.status(200).json(findRes)
    }
  } catch (err) {
    console.error(`Error finding theater : ${err.message}`)
    res.status(500).json({ error: err.message })
  }
}

const addTheater = async (req, res) => {
  try {
    // Force PENDING_APPROVAL status
    const theaterData = {
      ...req.body,
      status: 'PENDING_APPROVAL'
    };
    let addRes = await theaterModel.create(theaterData);
    res.status(201).json({message: "successfully created", addRes});
  } catch (err) {
    console.log('error in adding theater ', err)
    res.status(500).json({ error: err.message })
  }
}

const updateTheater = async (req, res) => {
  try {
    let updateRes = await theaterModel.updateOne({_id:req.query.id}, req.body);
    res.status(200).json({message: "successfully updated", updateRes});
  } catch (err) {
    console.log('error in update theater ', err)
    res.status(500).json({ error: err.message })
  }
};

const deleteTheater = async (req, res) => {
  let {id} = req.query;
  try {
    let Res = await theaterModel.deleteOne({_id:id});
    res.status(200).json({message:"successfully deleted", Res});
  } catch (err) {
    console.log('error in delete theater ', err)
    res.status(500).json({ error: err.message })
  }
}

const approveTheater = async (req, res) => {
  let {id} = req.query;
  try {
    let updateRes = await theaterModel.updateOne({_id:id}, { status: 'ACTIVE' });
    res.status(200).json({message:"successfully approved", updateRes});
  } catch (err) {
    console.log('error in approve theater ', err)
    res.status(500).json({ error: err.message })
  }
}

module.exports = { findTheater, addTheater, updateTheater, deleteTheater, approveTheater }
