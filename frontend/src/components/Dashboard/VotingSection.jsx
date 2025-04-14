"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import io from "socket.io-client"
import { voteAPI, authAPI } from "../../services/api"
import Header from "../Layout/Header"
import MainContainer from "../Layout/MainContainer"

const VotingSection = () => {
  const [votes, setVotes] = useState({
    president: "",
    vicePresident: "",
    secretaryGeneral: "",
    financeSecretary: "",
  })
  const [candidates, setCandidates] = useState({
    president: ["Joshua Kamande", "Faith Blessing", "Brian James"],
    vicePresident: ["John Kamau", "Mary Mbithe", "Allan Omondi"],
    secretaryGeneral: ["Britney Moraa", "Henriette Namasaya", "Joshua Mumo"],
    financeSecretary: ["Elvis Parmuat", "Shekinah Glory", "Peter Njoroge"],
  })
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [hasVoted, setHasVoted] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    let socket

    const initializeData = async () => {
      try {
        // Check if user has already voted
        const userResponse = await authAPI.getCurrentUser()
        console.log("User data:", userResponse.data)

        if (userResponse.data.hasVoted) {
          setHasVoted(true)
          setError("You have already voted. Redirecting to results...")
          setTimeout(() => navigate("/results"), 3000)
          return
        }

        // Fetch candidates - commented out for now since the endpoint might not exist
        // Try to use hardcoded candidates if the API call fails
        try {
          const candidatesResponse = await voteAPI.getCandidates()
          setCandidates(candidatesResponse.data)
        } catch (err) {
          console.warn("Could not fetch candidates, using defaults:", err)
          // Using default candidates defined in state
        }

        // Initialize socket connection
        const socketUrl = import.meta.env.VITE_API_URL || window.location.origin
        socket = io(socketUrl)

        socket.on("connect", () => {
          console.log("Socket connected:", socket.id)
        })

        socket.on("voteUpdate", (updatedVotes) => {
          console.log("Received vote update:", updatedVotes)
        })

        socket.on("connect_error", (err) => {
          console.error("Socket connection error:", err)
        })
      } catch (err) {
        console.error("Error initializing data:", err)
        if (err.response?.status === 401) {
          navigate("/")
        } else if (err.response?.data?.message) {
          setError(err.response.data.message)
        } else {
          setError("Failed to load voting data. Please try again later.")
        }
      } finally {
        setLoading(false)
      }
    }

    initializeData()

    // Cleanup function
    return () => {
      if (socket) {
        socket.disconnect()
      }
    }
  }, [navigate])

  const handleVote = (position, candidate) => {
    setVotes((prev) => ({ ...prev, [position]: candidate }))
  }

  const validateVotes = () => {
    const missingPositions = Object.keys(votes).filter((position) => !votes[position])
    if (missingPositions.length > 0) {
      const formattedPositions = missingPositions.map((pos) => pos.replace(/([A-Z])/g, " $1").trim()).join(", ")
      setError(`Please select candidates for: ${formattedPositions}`)
      return false
    }
    return true
  }

  const submitVote = async (e) => {
    e.preventDefault()

    // Validate all positions are selected
    if (!validateVotes()) {
      return
    }

    setSubmitting(true)
    setError(null)
    setSuccess(null)

    try {
      await voteAPI.submitVote(votes)

      setSuccess("Vote submitted successfully!")
      setHasVoted(true)

      // Redirect to results page after a delay
      setTimeout(() => navigate("/results"), 3000)
    } catch (err) {
      console.error("Error submitting vote:", err)

      if (err.response?.data?.message === "Already voted") {
        setError("You have already voted. Redirecting to results...")
        setHasVoted(true)
        setTimeout(() => navigate("/results"), 3000)
      } else {
        setError(err.response?.data?.message || "Error submitting vote. Please try again.")
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="dashboard">
        <Header />
        <MainContainer>
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Loading your ballot...</p>
          </div>
        </MainContainer>
      </div>
    )
  }

  if (hasVoted) {
    return (
      <div className="dashboard">
        <Header />
        <MainContainer>
          {error && <div className="alert alert-danger">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}
          <div className="redirect-message">
            <h3>Thank you for voting!</h3>
            <p>Redirecting to results page...</p>
          </div>
        </MainContainer>
      </div>
    )
  }

  return (
    <div className="dashboard">
      <Header />
      <MainContainer>
        <div className="page-header">
          <h2>Cast Your Vote</h2>
          <p className="voting-instructions">
            Select one candidate for each position below. You must vote for all positions to submit your ballot.
          </p>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <form onSubmit={submitVote}>
          {Object.entries(candidates).map(([position, candidateList]) => (
            <div key={position} className="vote-section">
              <h3>{position.replace(/([A-Z])/g, " $1").trim()}</h3>
              <div className="candidates-grid">
                {candidateList.map((candidate) => (
                  <label
                    key={candidate}
                    className={`candidate-option ${votes[position] === candidate ? "selected" : ""}`}
                  >
                    <input
                      type="radio"
                      name={position}
                      value={candidate}
                      checked={votes[position] === candidate}
                      onChange={() => handleVote(position, candidate)}
                      disabled={submitting}
                    />
                    <span className="candidate-name">{candidate}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}

          <button type="submit" className="submit-btn" disabled={submitting}>
            {submitting ? (
              <>
                <span className="spinner-small"></span>
                Submitting...
              </>
            ) : (
              "Submit Vote"
            )}
          </button>
        </form>
      </MainContainer>
    </div>
  )
}

export default VotingSection
