import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import useAuth from "../hooks/useAuth";
import { Link } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

const AuthForm = ({ isSignup }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { setIsAuthenticated } = useAuth();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const endpoint = isSignup
        ? `${API_BASE_URL}/api/signup`
        : `${API_BASE_URL}/api/login`;
      const response = await axios.post(endpoint, formData);

      localStorage.setItem("token", response.data.token);
      setIsAuthenticated(true);

      const profileCheck = await axios.get(`${API_BASE_URL}/api/protected`, {
        headers: { Authorization: `Bearer ${response.data.token}` },
      });

      if (!profileCheck.data.isProfileCompleted) {
        navigate("/profile");
      } else {
        navigate("/");
      }
    } catch (err) {
      setError(err.response?.data?.message || "An error occurred");
    }
  };

  return (
    <div className="flex h-screen">
      {/* Left Section */}
      <div className="w-1/2 bg-green-200 flex flex-col justify-center items-center p-8">
        <div className="bg-green-500 p-2 rounded-lg shadow-lg">
          <img
            src="../assets/login_bg.jpg"
            alt="Illustration"
            className="w-120"
          />
        </div>
        <h2 className="text-xl font-bold mt-4 text-gray-800">
          Ontario Health Maps
        </h2>
        <p className="text-gray-600 text-center mt-2">
          Aggregating Ontario’s disease data using open data sources.
        </p>
      </div>

      {/* Right Section - Form */}
      <div className="w-1/2 flex flex-col justify-center items-center p-8 bg-white">
        <h2 className="text-2xl font-bold text-black mb-6">
          {isSignup ? "Sign Up" : "Login"}
        </h2>
        <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4">
          {isSignup && (
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-600 mb-2"
              required
            />
          )}
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-600 mb-2"
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-600 mb-2"
            required
          />
          <button
            type="submit"
            className="w-full bg-gray-700 text-white py-3 rounded-md hover:bg-gray-800 transition duration-300"
          >
            {isSignup ? "Sign Up" : "Sign In"}
          </button>
          {error && <p className="text-red-500 text-center mt-2">{error}</p>}
        </form>
        <p className="text-center text-gray-600 mt-2">
          {isSignup ? "Already have an account? " : "Dont have an account? "}

          <Link
            to={isSignup ? "/login" : "/signup"}
            className="ext-gray-700 hover:underline"
          >
            {isSignup ? "Login here" : "Create Account"}
          </Link>
        </p>
      </div>
    </div>
  );
};

export default AuthForm;
