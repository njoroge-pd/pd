"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import io from "socket.io-client"
import { voteAPI, authAPI } from "../../services/api"
import Header from "../Layout/Header"
import MainContainer from "../Layout/MainContainer"

const VotingSection = () => {
  const [votes, setVotes] = useState({
    President: "",
    DeputyPresident: "",
    SecretaryGeneral: "",
    FinanceSecretary: "",
  })
  const [candidates, setCandidates] = useState({
    President: ["Joshua Kamande", "Faith Blessing", "Brian James"],
    DeputyPresident: ["John Kamau", "Mary Mbithe", "Allan Omondi"],
    SecretaryGeneral: ["Britney Moraa", "Henriette Namasaya", "Joshua Mumo"],
    FinanceSecretary: ["Elvis Parmuat", "Shekinah Glory", "Peter Njoroge"],
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
        const userResponse = await authAPI.getCurrentUser()
        if (userResponse.data.hasVoted) {
          setHasVoted(true)
          return
        }

        try {
          const candidatesResponse = await voteAPI.getCandidates()
          setCandidates(candidatesResponse.data)
        } catch (err) {
          console.warn("Using default candidates:", err)
        }

        const socketUrl = import.meta.env.VITE_API_URL || window.location.origin
        socket = io(socketUrl)

        socket.on("connect", () => {
          console.log("Socket connected:", socket.id)
        })

        socket.on("voteUpdate", (updatedVotes) => {
          console.log("Vote update:", updatedVotes)
        })

        socket.on("connect_error", (err) => {
          console.error("Socket error:", err)
        })
      } catch (err) {
        console.error("Initialization error:", err)
        if (err.response?.status === 401) {
          navigate("/")
        } else {
          setError("Failed to load data. Try again later.")
        }
      } finally {
        setLoading(false)
      }
    }

    initializeData()

    return () => {
      if (socket) socket.disconnect()
    }
  }, [navigate])

  const handleVote = (position, candidate) => {
    setVotes((prev) => ({ ...prev, [position]: candidate }))
  }

  const validateVotes = () => {
    const missing = Object.keys(votes).filter((p) => !votes[p])
    if (missing.length > 0) {
      const formatted = missing.map((p) => p.replace(/([A-Z])/g, " $1").trim()).join(", ")
      setError(`Please select candidates for: ${formatted}`)
      return false
    }
    return true
  }

  const submitVote = async (e) => {
    e.preventDefault()
    if (!validateVotes()) return

    setSubmitting(true)
    setError(null)
    setSuccess(null)

    try {
      await voteAPI.submitVote(votes)
      setSuccess("Vote submitted successfully!")
      setHasVoted(true)
    } catch (err) {
      console.error("Submit error:", err)
      if (err.response?.data?.message === "Already voted") {
        setHasVoted(true)
      } else {
        setError(err.response?.data?.message || "Error submitting vote.")
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
          <div className="thank-you-message">
            <h3>Voted</h3>
            <p>Your vote has been recorded successfully. Thank you for participating in the election.</p>
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
          <p>Select one candidate for each position. All fields are required.</p>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <form onSubmit={submitVote}>
          {Object.entries(candidates).map(([position, list]) => (
            <div key={position} className="vote-section">
              <h3>{position.replace(/([A-Z])/g, " $1").trim()}</h3>
              <div className="candidates-grid">
                {list.map((candidate) => (
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
