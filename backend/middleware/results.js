const ElectionSettings = require("../models/ElectionSettings")

// Middleware to check if voting is closed
const checkVotingClosed = async (req, res, next) => {
  try {
    const settings = await ElectionSettings.findOne()
    if (!settings || !settings.isVotingClosed) {
      return res.status(403).json({ message: "Results are not available yet" })
    }
    next()
  } catch (err) {
    res.status(500).json({ message: "Server error" })
  }
}