"use client"

import { useEffect, useState } from "react"
import { voteAPI } from "../../services/api"
import Header from "../Layout/Header"
import MainContainer from "../Layout/MainContainer"

const Results = () => {
  const [results, setResults] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const response = await voteAPI.getResults()
        setResults(response.data)
      } catch (err) {
        console.error("Error fetching results:", err)
        setError("Failed to load election results. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchResults()
  }, [])

  const formatPosition = (position) => {
    return position.replace(/([A-Z])/g, " $1").trim()
  }

  const getWinner = (candidates) => {
    if (Object.keys(candidates).length === 0) return null

    const maxVotes = Math.max(...Object.values(candidates))
    const winners = Object.entries(candidates)
      .filter(([_, votes]) => votes === maxVotes)
      .map(([name]) => name)

    return winners
  }

  if (loading) {
    return (
      <div className="results-page">
        <Header />
        <MainContainer>
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Loading results...</p>
          </div>
        </MainContainer>
      </div>
    )
  }

  return (
    <div className="results-page">
      <Header />
      <MainContainer>
        <div className="page-header">
          <h2>Election Results</h2>
          <p className="results-description">
            View the current election results below. The candidate with the most votes for each position is highlighted.
          </p>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        {!error && Object.keys(results).length === 0 && (
          <div className="no-results">
            <p>No votes have been cast yet.</p>
            <p>Results will appear here once voting begins.</p>
          </div>
        )}

        {Object.entries(results).map(([position, candidates]) => {
          const winners = getWinner(candidates)

          return (
            <div key={position} className="result-section">
              <h3>{formatPosition(position)}</h3>

              {Object.keys(candidates).length === 0 ? (
                <p className="no-votes">No votes for this position yet</p>
              ) : (
                <ul className="candidates-list">
                  {Object.entries(candidates)
                    .sort(([, votesA], [, votesB]) => votesB - votesA)
                    .map(([name, votes]) => (
                      <li key={name} className={winners?.includes(name) ? "winner" : ""}>
                        <div className="candidate-info">
                          <span className="candidate-name">{name}</span>
                          {winners?.includes(name) && winners.length === 1 && (
                            <span className="winner-badge">Winner</span>
                          )}
                        </div>
                        <div className="vote-bar-container">
                          <div
                            className="vote-bar"
                            style={{
                              width: `${(votes / Math.max(...Object.values(candidates))) * 100}%`,
                              backgroundColor: winners?.includes(name) ? "var(--primary-color)" : "#ccc",
                            }}
                          ></div>
                          <span className="vote-count">
                            {votes} vote{votes !== 1 ? "s" : ""}
                          </span>
                        </div>
                      </li>
                    ))}
                </ul>
              )}

              {winners && winners.length > 1 && <div className="tie-notice">Tie between {winners.join(" and ")}</div>}
            </div>
          )
        })}
      </MainContainer>
    </div>
  )
}

export default Results
