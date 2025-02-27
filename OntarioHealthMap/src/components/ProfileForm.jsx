import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;
const ProfileForm = () => {
  const [formData, setFormData] = useState({
    usageIntent: "",
    preferredRole: "",
  });
  const [focusedField, setFocusedField] = useState("usageIntent");
  const navigate = useNavigate();
  const { refreshToken } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    let token = await refreshToken();

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      await axios.post(`${API_BASE_URL}/api/complete-profile`, {
        ...formData,
        token,
      });
      navigate("/");
    } catch (error) {
      console.error("❌ Profile Submission Error:", error);
    }
  };

  return (
    <div className="flex h-screen bg-green-200 text-green-900">
      <div className="w-1/2 flex flex-col justify-center items-center p-8 bg-white">
        <h2 className="text-2xl font-bold text-black mb-6">
          Profile Information
        </h2>
        <form onSubmit={handleSubmit} className="w-full max-w-md space-y-6">
          <label className="block text-black text-sm mb-2">
            How do you intend to use this data?
          </label>
          <select
            name="usageIntent"
            value={formData.usageIntent}
            onChange={(e) =>
              setFormData({ ...formData, usageIntent: e.target.value })
            }
            onFocus={() => setFocusedField("usageIntent")}
            className="w-full p-3 border border-green-600 rounded-md bg-white text-black focus:outline-none focus:ring-2 focus:ring-gray-500"
            required
          >
            <option value="">Select an option</option>
            <option value="Research">Research</option>
            <option value="Business Analytics">Business Analytics</option>
            <option value="Personal Use">Personal Use</option>
          </select>
          <label className="block text-black text-sm mb-2">
            Select your role
          </label>
          <select
            name="preferredRole"
            value={formData.preferredRole}
            onChange={(e) =>
              setFormData({ ...formData, preferredRole: e.target.value })
            }
            onFocus={() => setFocusedField("preferredRole")}
            className="w-full p-3 border border-gray-600 rounded-md bg-white text-black focus:outline-none focus:ring-2 focus:ring-gray-500 mb-2"
            required
          >
            <option value="">Select your role</option>
            <option value="Researcher">Researcher</option>
            <option value="Student">Student</option>
            <option value="Healthcare Professional">
              Healthcare Professional
            </option>
            <option value="Government Official">Government Official</option>
            <option value="Other">Other</option>
          </select>
          <button
            type="submit"
            className="w-full bg-green-200 text-black py-3 rounded-md hover:bg-green-500 transition duration-300"
          >
            Submit
          </button>
        </form>
      </div>
      <div className="w-1/2 bg-green-200 flex flex-col justify-center items-center p-8">
        <div className="bg-green-400 p-2 rounded-lg shadow-lg">
          <img
            src={
              focusedField === "usageIntent"
                ? "/assets/pf_q1.jpeg"
                : "/assets/pf_q2.jpeg"
            }
            alt="Illustration"
            className="w-120"
          />
        </div>
        <h2 className="text-xl font-bold mt-4 text-gray-200">
          Complete Your Profile
        </h2>
        <p className="text-green-700 text-center mt-2">
          Help us understand how you plan to use this data.
        </p>
      </div>
    </div>
  );
};

export default ProfileForm;
