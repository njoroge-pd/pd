const mongoose = require('mongoose');

const voteSchema = new mongoose.Schema({
  voter: { type: mongoose.Schema.Types.ObjectId, ref: 'Voter', required: true },
  president: String,
  vicePresident: String,
  secretaryGeneral: String,
  financeSecretary: String
}, { timestamps: true });

module.exports = mongoose.model('Vote', voteSchema);