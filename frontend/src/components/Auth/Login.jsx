"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { authAPI } from "../../services/api"
import Header from "../Layout/Header"
import MainContainer from "../Layout/MainContainer"

const Login = ({ setIsAuthenticated, setVoter }) => {
  const [formData, setFormData] = useState({
    admissionNumber: "",
    password: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      console.log("Attempting login with:", formData)
      const response = await authAPI.login(formData)
      console.log("Login response:", response.data)

      const { token, voter } = response.data

      // Store token in localStorage
      localStorage.setItem("token", token)
      console.log("Token saved to localStorage:", token)

      // Update auth state
      if (setIsAuthenticated) {
        console.log("Setting isAuthenticated to true")
        setIsAuthenticated(true)
      }

      if (setVoter) {
        console.log("Setting voter state:", voter)
        setVoter(voter)
      }

      // Check if voter has already voted and redirect accordingly
      if (voter.hasVoted) {
        console.log("Voter has already voted, redirecting to results")
        navigate("/results")
      } else {
        console.log("Redirecting to dashboard")
        navigate("/dashboard")
      }
    } catch (err) {
      console.error("Login error:", err)
      setError(err.response?.data?.message || "Invalid credentials. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <Header />
      <MainContainer>
        <div className="auth-logo-container">
          <img src="/images/mmulogo1.png" alt="Multimedia University of Kenya" className="auth-logo" />
          <h2>Student Elections Portal</h2>
        </div>

        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="auth-form">
          <div className="form-group">
            <label htmlFor="admissionNumber">Admission Number</label>
            <input
              type="text"
              id="admissionNumber"
              name="admissionNumber"
              value={formData.admissionNumber}
              onChange={handleChange}
              required
              disabled={loading}
              className="form-control"
              placeholder="Enter your admission number"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              disabled={loading}
              className="form-control"
              placeholder="Enter your password"
            />
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner-small"></span>
                Logging in...
              </>
            ) : (
              "Login"
            )}
          </button>

          <div className="auth-links">
            <button type="button" onClick={() => navigate("/forgot-password")} disabled={loading} className="link-btn">
              Forgot Password?
            </button>
            <button type="button" onClick={() => navigate("/register")} disabled={loading} className="link-btn">
              Register
            </button>
          </div>
        </form>
      </MainContainer>
    </div>
  )
}

export default Login
