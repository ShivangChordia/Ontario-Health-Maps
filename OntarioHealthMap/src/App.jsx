import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar"; 
import Home from "./pages/Home";
import HealthMap from "./components/HealthMap"; 

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
