import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import useAuth from "./hooks/useAuth";
import Home from "./pages/Home";
import AuthForm from "./components/AuthForm";
import ProfileForm from "./components/ProfileForm";

function App() {
  const { isAuthenticated, isProfileCompleted, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            isAuthenticated ? (
              isProfileCompleted ? (
                <Home />
              ) : (
                <Navigate to="/profile" />
              )
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route path="/login" element={<AuthForm isSignup={false} />} />
        <Route path="/signup" element={<AuthForm isSignup={true} />} />
        <Route
          path="/profile"
          element={
            isAuthenticated ? (
              isProfileCompleted ? (
                <Navigate to="/" />
              ) : (
                <ProfileForm />
              )
            ) : (
              <Navigate to="/login" />
            )
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
