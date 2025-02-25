import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav
      style={{
        display: "flex",
        justifyContent: "center",
        padding: "10px",
        background: "#222",
        color: "white",
      }}
    >
      <Link
        to="/"
        style={{ margin: "10px", color: "white", textDecoration: "none" }}
      >
        🏠 Home
      </Link>
      <Link
        to="/healthmap"
        style={{ margin: "10px", color: "white", textDecoration: "none" }}
      >
        🗺️ Map
      </Link>
      <Link
        to="/form"
        style={{ margin: "10px", color: "white", textDecoration: "none" }}
      >
        📋 Form
      </Link>
    </nav>
  );
};

export default Navbar;
