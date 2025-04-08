"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import Header from "../Layout/Header"
import MainContainer from "../Layout/MainContainer"

const Register = () => {
  const [formData, setFormData] = useState({
    admissionNumber: "",
    name: "",
    email: "",
    course: "",
    phone: "",
    password: "",
    confirmPassword: "",
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

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      setLoading(false)
      return
    }

    try {
      const response = await axios.post("/api/auth/register", formData)
      setSuccess(response.data.message || "Registration successful")

      // Redirect to login after a delay
      setTimeout(() => {
        navigate("/")
      }, 3000)
    } catch (err) {
      console.error("Registration error:", err)
      setError(err.response?.data?.message || "Registration failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="register-page">
      <Header />
      <MainContainer>
        <div className="auth-logo-container">
          <img src="/images/mmulogo1.png" alt="Multimedia University of Kenya" className="auth-logo" />
          <h2>Student Registration</h2>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
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
              placeholder="Enter your admission number"
            />
          </div>

          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              disabled={loading}
              placeholder="Enter your full name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={loading}
              placeholder="Enter your email address"
            />
          </div>

          <div className="form-group">
            <label htmlFor="course">Course</label>
            <input
              type="text"
              id="course"
              name="course"
              value={formData.course}
              onChange={handleChange}
              required
              disabled={loading}
              placeholder="Enter your course"
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
              placeholder="Enter your phone number"
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
              placeholder="Create a password"
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
              disabled={loading}
              placeholder="Confirm your password"
            />
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner-small"></span>
                Registering...
              </>
            ) : (
              "Register"
            )}
          </button>

          <div className="auth-links">
            <button type="button" onClick={() => navigate("/")} disabled={loading}>
              Already have an account? Login
            </button>
          </div>
        </form>
      </MainContainer>
    </div>
  )
}

export default Register
