"use client"
import { Routes, Route, Navigate } from "react-router-dom"
import { useState, useEffect } from "react"
import axios from "axios"
import "./App.css"

// Components
import Login from "./components/Auth/Login"
import Register from "./components/Auth/Register"
import VotingSection from "./components/Dashboard/VotingSection"
import Results from "./components/Dashboard/Results"
import ForgotPassword from "./components/Auth/ForgotPassword"
import ResetPassword from "./components/Auth/ResetPassword"

function App() {
  console.log("App component rendering")
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [voter, setVoter] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem("token")
        console.log("Token from localStorage:", token)

        if (token) {
          // Make sure we're using the correct endpoint and header
          const res = await axios.get("/api/auth/me", {
            headers: {
              "x-auth-token": token,
              Authorization: `Bearer ${token}`, // Add this as a fallback
            },
          })
          console.log("Auth check response:", res.data)
          setIsAuthenticated(true)
          setVoter(res.data)
        } else {
          console.log("No token found in localStorage")
          setIsAuthenticated(false)
        }
      } catch (err) {
        console.error("Auth check failed:", err)
        localStorage.removeItem("token")
        setIsAuthenticated(false)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  if (loading) {
    return <div className="app-loading">Loading application...</div>
  }

  return (
    <div className="app-container">
      <Routes>
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" />
            ) : (
              <Login setIsAuthenticated={setIsAuthenticated} setVoter={setVoter} />
            )
          }
        />

        <Route path="/register" element={<Register />} />

        <Route path="/dashboard" element={isAuthenticated ? <VotingSection voter={voter} /> : <Navigate to="/" />} />

        <Route path="/results" element={isAuthenticated ? <Results /> : <Navigate to="/" />} />

        <Route path="/forgot-password" element={<ForgotPassword />} />

        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>

      <footer className="app-footer">
        <p>© 2025 MMU Voting System. All rights reserved.</p>
      </footer>
    </div>
  )
}

export default App
