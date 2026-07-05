const otpModel = require('../models/otp.js')
const userModel = require('../models/user.js')
const { sendOtp } = require('../sendMail.js')

let createOtp = async (req, res) => {
  console.log('Create OTP entered')
  let { email } = req.query;
  let otp = Math.floor(Math.random() * 900000 + 1000);

  try {
    let userRes = await userModel.findOne({ email: email });
    
    if (userRes) {
      let existing = await otpModel.findOne({ email: email });
      if (existing) {
        return res.status(200).json({ message: 'Already sent, wait 2 min' });
      }
      
      await otpModel.create({ email: email, otp: otp });
      sendOtp(email, otp);
      console.log('OTP created and email sent');
      res.status(200).json({ message: 'success' });
    } else {
      res.status(404).json({ message: 'Email not found' });
    }
  } catch (err) {
    console.error('OTP creation error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
}

let verifyOtp = async (req, res) => {
  let { email, otp } = req.query;

  try {
    let verifyOtpRes = await otpModel.findOne({ email: email, otp: otp });
    if (verifyOtpRes) {
      await otpModel.deleteOne({ email: email, otp: otp });
      res.status(200).json({ message: 'OTP valid' });
    } else {
      res.status(201).json({ message: 'OTP invalid' });
    }
  } catch (err) {
    console.error('OTP verify error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
}

module.exports = { createOtp, verifyOtp }
