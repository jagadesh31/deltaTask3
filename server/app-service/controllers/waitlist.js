const waitlistModel = require('../models/waitlist.js');

const joinWaitlist = async (req, res) => {
  try {
    const { userId, showId, email } = req.body;
    const existing = await waitlistModel.findOne({ userId, showId });
    if (existing) {
      return res.status(400).json({ error: 'Already on the waitlist' });
    }
    const entry = await waitlistModel.create(req.body);
    res.status(201).json(entry);
  } catch (err) {
    res.status(500).json({ error: 'Failed to join waitlist' });
  }
};

module.exports = { joinWaitlist };
