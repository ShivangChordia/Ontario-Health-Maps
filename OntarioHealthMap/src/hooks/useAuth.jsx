import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode"; // Correct import

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isProfileCompleted, setIsProfileCompleted] = useState(false);
  const [loading, setLoading] = useState(true);

  let navigate;
  try {
    navigate = useNavigate(); // Ensure this runs only inside <Router>
  } catch {
    navigate = null; // Avoid breaking if called outside <Router>
  }

  const isTokenExpired = (token) => {
    if (!token) return true;
    try {
      const decoded = jwtDecode(token);
      return decoded.exp < Date.now() / 1000;
    } catch {
      return true;
    }
  };

  const refreshToken = async () => {
    let token = localStorage.getItem("token");
    if (isTokenExpired(token)) {
      try {
        const response = await axios.post(`${API_BASE_URL}/api/refresh-token`, {
          token,
        });
        localStorage.setItem("token", response.data.token);
        return response.data.token;
      } catch {
        localStorage.removeItem("token");
        if (navigate) navigate("/login"); // Ensure navigate is available
        return null;
      }
    }
    return token;
  };

  useEffect(() => {
    const verifyAuth = async () => {
      let token = localStorage.getItem("token");
      if (!token) {
        setIsAuthenticated(false);
        setLoading(false);
        return;
      }

      token = await refreshToken();
      if (!token) {
        setIsAuthenticated(false);
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(`${API_BASE_URL}/api/protected`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setIsAuthenticated(true);
        setIsProfileCompleted(response.data.isProfileCompleted);
      } catch {
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    verifyAuth();
  }, []);

  return {
    isAuthenticated,
    isProfileCompleted,
    loading,
    refreshToken,
    setIsAuthenticated,
  };
};

export default useAuth;
