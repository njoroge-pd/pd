"use client"
import { Link, useNavigate } from "react-router-dom"

const Header = () => {
  const navigate = useNavigate()
  const isLoggedIn = localStorage.getItem("token")

  const handleLogout = () => {
    localStorage.removeItem("token")
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
