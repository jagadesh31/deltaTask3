const express = require('express');
const { joinWaitlist } = require('../controllers/waitlist.js');

const waitlistRoute = express.Router();

waitlistRoute.post('/join', joinWaitlist);

module.exports = waitlistRoute;
