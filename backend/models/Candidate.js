const mongoose = require('mongoose');

const candidateSchema = new mongoose.Schema({
  name: { type: String, required: true },
  position: {
    type: String,
    enum: ["president", "vicePresident", "secretaryGeneral", "financeSecretary"],
    required: true,
  },
})
module.exports = mongoose.model('Candidate', candidateSchema);
