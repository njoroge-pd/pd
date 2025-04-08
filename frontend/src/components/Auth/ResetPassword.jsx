"use client"

import { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { authAPI } from "../../services/api"
import Header from "../Layout/Header"
import MainContainer from "../Layout/MainContainer"

const ResetPassword = () => {
  const [formData, setFormData] = useState({
    token: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    // Extract token from URL query parameters
    const searchParams = new URLSearchParams(location.search)
    const token = searchParams.get("token")

    if (token) {
      setFormData((prev) => ({ ...prev, token }))
    } else {
      setError("Invalid or missing reset token")
    }
  }, [location])

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    // Validate passwords match
    if (formData.newPassword !== formData.confirmPassword) {
      setError("Passwords do not match")
      setLoading(false)
      return
    }

    try {
      const response = await authAPI.resetPassword(formData)
      setSuccess(response.data.message || "Password reset successful")

      // Redirect to login after a delay
      setTimeout(() => {
        navigate("/")
      }, 3000)
    } catch (err) {
      console.error("Reset password error:", err)
      setError(err.response?.data?.message || "Failed to reset password. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="reset-password-page">
      <Header />
      <MainContainer>
        <h2>Reset Password</h2>

        {error && <div className="alert alert-danger">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="newPassword">New Password</label>
            <input
              type="password"
              id="newPassword"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              required
              disabled={loading || !formData.token}
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              disabled={loading || !formData.token}
            />
          </div>

          <button type="submit" className="submit-btn" disabled={loading || !formData.token}>
            {loading ? "Resetting..." : "Reset Password"}
          </button>

          <div className="auth-links">
            <button type="button" onClick={() => navigate("/")} disabled={loading}>
              Back to Login
            </button>
          </div>
        </form>
      </MainContainer>
    </div>
  )
}

export default ResetPassword
