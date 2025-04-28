const mongoose = require("mongoose")

const electionSettingsSchema = new mongoose.Schema({
  isVotingClosed: {
    type: Boolean,
    default: false
  }
})

module.exports = mongoose.model("ElectionSettings", electionSettingsSchema)