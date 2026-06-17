const userModel = require('../models/userModel');
const db = require('../utils/connection');

exports.getUserProfile = async (req, res) => {
  try {
    const user = await userModel.getUserProfile(db, req.params.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }
    const { Password_Hash, ...profile } = user;
    res.json(profile);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching user profile.' });
  }
};
