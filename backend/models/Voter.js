const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const voterSchema = new mongoose.Schema({
  admissionNumber: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  course: { type: String, required: true },
  phone: { type: String, required: true },
  password: { type: String, required: true },
  hasVoted: { type: Boolean, default: false },
  resetToken: String,
  resetExpires: Date
});

voterSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

module.exports = mongoose.model('Voter', voterSchema);