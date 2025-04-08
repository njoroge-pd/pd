"use client"

import { useEffect, useState } from "react"
import { Navigate } from "react-router-dom"
import { authAPI } from "../../services/api"

const ProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token")

      if (!token) {
        setIsAuthenticated(false)
        setLoading(false)
        return
      }

      try {
        await authAPI.getCurrentUser()
        setIsAuthenticated(true)
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
    return <div className="loading-auth">Verifying authentication...</div>
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />
  }

  return children
}

export default ProtectedRoute
