import axios from "axios"

// Create an axios instance with default config
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "",
  headers: {
    "Content-Type": "application/json",
  },
})

// Add a request interceptor to include the auth token in all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token")
    console.log("API interceptor - token:", token ? "exists" : "not found")

    if (token) {
      config.headers["x-auth-token"] = token
      config.headers["Authorization"] = `Bearer ${token}` // Add this as a fallback
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Add a response interceptor to handle common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API error response:", error.response?.status, error.response?.data)

    // Handle 401 Unauthorized errors by logging out
    if (error.response && error.response.status === 401) {
      console.log("401 Unauthorized - clearing token and redirecting")
      localStorage.removeItem("token")
      window.location.href = "/"
    }
    return Promise.reject(error)
  },
)

// Auth API calls
export const authAPI = {
  login: (credentials) => api.post("/api/auth/login", credentials),
  register: (userData) => api.post("/api/auth/register", userData),
  getCurrentUser: () => api.get("/api/auth/me"),
  forgotPassword: (data) => api.post("/api/auth/forgot-password", data),
  resetPassword: (data) => api.post("/api/auth/reset-password", data),
}

// Voting API calls
export const voteAPI = {
  submitVote: (voteData) => api.post("/api/votes/submitVote", voteData),
  getResults: () => api.get("/api/votes/voteResults"),
  getCandidates: () => api.get("/api/votes/candidates"),
}

export default api
