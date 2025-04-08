const express = require("express")
const router = express.Router()
const auth = require("../middleware/auth")
const Vote = require("../models/Vote")
const Voter = require("../models/Voter")
const mongoose = require("mongoose")

// Add this new endpoint for candidates
router.get("/candidates", async (req, res) => {
  try {
    // You can replace this with actual database queries if you have a candidates collection
    const candidates = {
      president: ["John Doe", "Jane Smith", "Michael Johnson"],
      vicePresident: ["Sarah Williams", "Robert Brown", "Emily Davis"],
      secretaryGeneral: ["David Wilson", "Jennifer Taylor", "Christopher Martinez"],
      financeSecretary: ["Jessica Anderson", "Daniel Thomas", "Michelle Garcia"],
    }

    res.json(candidates)
  } catch (err) {
    console.error("Error fetching candidates:", err)
    res.status(500).json({ message: "Server error" })
  }
})

// Submit Vote
router.post("/submitVote", auth, async (req, res) => {
  const session = await mongoose.startSession()
  session.startTransaction()

  try {
    const io = req.app.get("io")
    const voter = await Voter.findById(req.voter._id).session(session)

    if (!voter) {
      await session.abortTransaction()
      return res.status(404).json({ message: "Voter not found" })
    }

    if (voter.hasVoted) {
      await session.abortTransaction()
      return res.status(403).json({ message: "Already voted" })
    }

    // Validate vote data
    const requiredFields = ["president", "vicePresident", "secretaryGeneral", "financeSecretary"]
    const missingFields = requiredFields.filter((field) => !req.body[field])

    if (missingFields.length > 0) {
      await session.abortTransaction()
      return res.status(400).json({
        message: `Missing required fields: ${missingFields.join(", ")}`,
      })
    }

    // Create vote and update voter atomically
    const [newVote] = await Promise.all([
      Vote.create(
        [
          {
            voter: voter._id,
            ...req.body,
          },
        ],
        { session },
      ),

      Voter.findByIdAndUpdate(voter._id, { $set: { hasVoted: true } }, { new: true, session }),
    ])

    await session.commitTransaction()

    // Emit realtime update
    if (io) {
      io.emit("voteUpdate", await getVoteCounts())
    }

    res.json({ message: "Vote submitted successfully" })
  } catch (err) {
    await session.abortTransaction()
    console.error("Vote submission error:", err)
    res.status(500).json({
      message: "Server error",
      error: err.message,
    })
  } finally {
    session.endSession()
  }
})

// Get Results
router.get("/voteResults", async (req, res) => {
  try {
    const results = await getVoteCounts()
    res.json(results)
  } catch (err) {
    res.status(500).send("Server error")
  }
})

async function getVoteCounts() {
  try {
    const aggregate = await Vote.aggregate([
      {
        $group: {
          _id: null,
          president: { $push: "$president" },
          vicePresident: { $push: "$vicePresident" },
          secretaryGeneral: { $push: "$secretaryGeneral" },
          financeSecretary: { $push: "$financeSecretary" },
        },
      },
    ])

    // Handle case when no votes exist
    if (!aggregate.length) {
      return {
        president: {},
        vicePresident: {},
        secretaryGeneral: {},
        financeSecretary: {},
      }
    }

    // Process counts
    return processCounts(aggregate[0])
  } catch (error) {
    console.error("Error in getVoteCounts:", error)
    return {
      president: {},
      vicePresident: {},
      secretaryGeneral: {},
      financeSecretary: {},
    }
  }
}

function processCounts(data) {
  return {
    president: countVotes(data.president),
    vicePresident: countVotes(data.vicePresident),
    secretaryGeneral: countVotes(data.secretaryGeneral),
    financeSecretary: countVotes(data.financeSecretary),
  }
}

function countVotes(arr) {
  return arr.reduce((acc, curr) => {
    acc[curr] = (acc[curr] || 0) + 1
    return acc
  }, {})
}

module.exports = router
