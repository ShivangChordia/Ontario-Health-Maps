import HealthMap from "../components/HealthMap";

const Home = () => {
  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h1>Welcome to the Ontario Health Map</h1>
      <div style={{ width: "70%", height: "100%" }}>
          <HealthMap />
        </div>
    </div>
  );
};

export default Home;
