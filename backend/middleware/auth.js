const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const Voter = require('../models/Voter');

const auth = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.header('Authorization') || '';
    const token = authHeader.replace(/^bearer\s+/i, ''); // Case-insensitive removal
    console.log('Token:', token);
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded token:', decoded);
    
    // Convert string ID to MongoDB ObjectId
    const voterId = new mongoose.Types.ObjectId(decoded.id);

    // Find voter using ObjectId
    const voter = await Voter.findOne({ _id: voterId })
      .select('-password');

    if (!voter) {
      throw new Error('Voter not found');
    }

    // Attach voter to request
    req.voter = voter;
    next();
  } catch (err) {
    console.error('Auth error:', err.message);
    res.status(401).json({ message: 'Please authenticate' });
  }
};

module.exports = auth;