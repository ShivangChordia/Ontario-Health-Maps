import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar"; // Import your Navbar component
import Home from "./pages/Home";
import HealthMap from "./components/HealthMap"; // Import the HealthMap component

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/healthmap" element={<HealthMap />} />
      </Routes>
    </Router>
  );
}

export default App;
