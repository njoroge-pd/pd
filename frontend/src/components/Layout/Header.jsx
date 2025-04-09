"use client"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { useEffect, useState } from "react"

const Header = () => {
  const navigate = useNavigate()
  const location = useLocation()

  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem("token")
    setIsLoggedIn(!!token)
  }, [location]) // run on route change

  const handleLogout = () => {
    localStorage.removeItem("token")
    setIsLoggedIn(false)
    navigate("/")
  }

  return (
    <header className="app-header">
      <div className="logo">
        <img
          src="/images/mmulogo1.png"
          alt="Multimedia University of Kenya"
          className="mmu-logo"
          onClick={() => navigate(isLoggedIn ? "/dashboard" : "/")}
        />
      </div>
      <nav className="header-nav">
        {isLoggedIn ? (
          <>
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/results">Results</Link>
            <button onClick={handleLogout} className="logout-btn">
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </nav>
    </header>
  )
}

export default Header
