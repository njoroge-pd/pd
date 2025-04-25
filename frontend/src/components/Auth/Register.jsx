"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import Header from "../Layout/Header"
import MainContainer from "../Layout/MainContainer"
import { authAPI } from "../../services/api"

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
    const { name, value } = e.target
    let processedValue = value

    switch (name) {
      case 'admissionNumber':
        // Allow only alphanumeric characters
        processedValue = value.replace(/[^A-Za-z0-9]/g, '')
        break
      case 'name':
      case 'course':
        // Allow only letters, spaces, apostrophes, and hyphens
        processedValue = value.replace(/[^A-Za-z\s'-]/g, '')
        break
      case 'phone':
        // Allow only numbers and limit to 10 digits
        processedValue = value.replace(/\D/g, '').slice(0, 10)
        break
      case 'email':
        // Remove spaces and special characters except valid email symbols
        processedValue = value.replace(/[^\w@.-]/g, '')
        break
      default:
        break
    }

    setFormData(prev => ({
      ...prev,
      [name]: processedValue,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    // Trim all text fields except passwords
    const trimmedData = {
      ...formData,
      admissionNumber: formData.admissionNumber.trim(),
      name: formData.name.trim(),
      email: formData.email.trim(),
      course: formData.course.trim(),
      phone: formData.phone.trim(),
    }

    // Final validation check
    if (!/^[A-Za-z0-9]+$/.test(trimmedData.admissionNumber)) {
      setError("Invalid admission number format")
      setLoading(false)
      return
    }

    if (!/^[A-Za-z\s'-]+$/.test(trimmedData.name)) {
      setError("Invalid characters in name")
      setLoading(false)
      return
    }

    if (!/^[A-Za-z\s'-]+$/.test(trimmedData.course)) {
      setError("Invalid characters in course name")
      setLoading(false)
      return
    }

    if (trimmedData.phone.length !== 10) {
      setError("Phone number must be 10 digits")
      setLoading(false)
      return
    }

    if (trimmedData.password !== trimmedData.confirmPassword) {
      setError("Passwords do not match")
      setLoading(false)
      return
    }

    try {
      const response = await authAPI.register(trimmedData)
      setSuccess(response.data.message || "Registration successful")
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
              pattern="[A-Za-z0-9]+"
              title="Admission number can only contain letters and numbers"
              required
              disabled={loading}
              placeholder="Enter admission number"
              maxLength="20"
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
              pattern="[A-Za-z\s'-]+"
              title="Name can only contain letters, spaces, apostrophes, and hyphens"
              required
              disabled={loading}
              placeholder="Enter full name"
              maxLength="50"
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
              pattern="^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
              title="Please enter a valid email address"
              required
              disabled={loading}
              placeholder="Enter email address"
              maxLength="100"
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
              pattern="[A-Za-z\s'-]+"
              title="Course name can only contain letters, spaces, apostrophes, and hyphens"
              required
              disabled={loading}
              placeholder="Enter course name"
              maxLength="50"
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
              pattern="[0-9]{10}"
              title="Phone number must be exactly 10 digits"
              required
              disabled={loading}
              placeholder="Enter 10-digit phone number"
              inputMode="numeric"
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
              placeholder="Create password"
              minLength="8"
              maxLength="30"
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
              placeholder="Confirm password"
              minLength="8"
              maxLength="30"
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