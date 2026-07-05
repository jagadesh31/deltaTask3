const nodemailer = require('nodemailer');
const hbs = require('nodemailer-express-handlebars');
const path = require('path');
const generatePdf = require('./pdfGenerator');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.Gmail,
    pass: process.env.Gmail_pass
  }
});

transporter.use('compile', hbs({
  viewEngine: {
    extName: '.hbs',
    partialsDir: path.resolve(__dirname, 'templates'),
    defaultLayout: false
  },
  viewPath: path.resolve(__dirname, 'templates'),
  extName: '.hbs'
}));

const sendOtp = (email, otp) => {
  console.log('Sending OTP to:', email);

  let options = {
    from: process.env.Gmail,
    to: email,
    subject: 'OTP Verification',
    template: 'otp',
    context: {
      otp: otp
    }
  };

  transporter.sendMail(options, (err, info) => {
    if (err) {
      console.error('Error sending OTP email:', err);
      return;
    }
    console.log('OTP email sent:', info.response);
  });
};

const invoiceHandler = async (req, res) => {
  try {
    let pdfBuffer = await generatePdf(req.body);

    const options = {
      from: process.env.Gmail,
      to: req.query.email,
      subject: 'Your Booking Invoice',
      text: 'Please find attached your booking invoice.',
      attachments: [
        {
          filename: 'invoice.pdf',
          content: pdfBuffer,
          contentType: 'application/pdf'
        }
      ]
    };

    transporter.sendMail(options, (error, info) => {
      if (error) {
        console.error('Error sending invoice email:', error);
        return res.status(500).json({ message: 'Failed to send invoice email' });
      }
      console.log('Invoice email sent:', info.response);
      res.json({ message: 'Invoice sent successfully' });
    });
  } catch (error) {
    console.error('Invoice handler error:', error);
    res.status(500).json({ message: 'Failed to generate/send invoice' });
  }
};

const sendBookingEmail = async (email, transactionData) => {
  try {
    let pdfBuffer = await generatePdf(transactionData);

    const options = {
      from: process.env.Gmail,
      to: email,
      subject: 'Your Booking Invoice',
      text: 'Please find attached your booking invoice.',
      attachments: [
        {
          filename: 'invoice.pdf',
          content: pdfBuffer,
          contentType: 'application/pdf'
        }
      ]
    };

    return new Promise((resolve, reject) => {
      transporter.sendMail(options, (error, info) => {
        if (error) {
          console.error('Error sending invoice email:', error);
          return reject(error);
        }
        console.log('Invoice email sent:', info.response);
        resolve(info);
      });
    });
  } catch (error) {
    console.error('Send booking email error:', error);
    throw error;
  }
};

module.exports = { sendOtp, invoiceHandler, sendBookingEmail };
