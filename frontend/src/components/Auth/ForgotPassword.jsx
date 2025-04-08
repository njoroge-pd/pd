"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { authAPI } from "../../services/api"
import Header from "../Layout/Header"
import MainContainer from "../Layout/MainContainer"

const ForgotPassword = () => {
  const [formData, setFormData] = useState({
    admissionNumber: "",
    phone: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const navigate = useNavigate()

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

    try {
      const response = await authAPI.forgotPassword(formData)
      setSuccess(response.data.message || "Password reset instructions sent")
    } catch (err) {
      console.error("Forgot password error:", err)
      setError(err.response?.data?.message || "Failed to process request. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="forgot-password-page">
      <Header />
      <MainContainer>
        <h2>Forgot Password</h2>

        {error && <div className="alert alert-danger">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <form onSubmit={handleSubmit}>
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
            />
          </div>

          <div className="form-group">
            <label htmlFor="phone">Phone Number</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? "Submitting..." : "Reset Password"}
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

export default ForgotPassword
