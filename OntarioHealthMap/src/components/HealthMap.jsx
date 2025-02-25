import { useEffect, useState } from "react";
import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const HealthMap = () => {
  const [geoData, setGeoData] = useState(null);
  const [phuData, setPhuData] = useState([]); // Fetched PHU Data
  const [missingCount, setMissingCount] = useState(0); // Tracks missing matches

  // 🔹 Fetch PHU Data from PostgreSQL API (Neon)
  useEffect(() => {
    fetch("http://localhost:5000/api/phu-data") // Ensure backend is running
      .then((response) => response.json())
      .then((data) => {
        console.log("✅ Fetched PHU Data:", data);
        setPhuData(data);
      })
      .catch((error) => console.error("❌ Error fetching PHU data:", error));
  }, []);

  useEffect(() => {
    fetch(
      "https://services9.arcgis.com/a03W7iZ8T3s5vB7p/arcgis/rest/services/MOH_PHU_BOUNDARY/FeatureServer/0/query?where=1%3D1&outFields=*&outSR=4326&f=geojson"
    )
      .then((response) => response.json())
      .then((geojson) => {
        console.log("🗺️ GeoJSON Data Loaded:", geojson);
        setGeoData(geojson);
      })
      .catch((error) => console.error("❌ Error loading GeoJSON data:", error));
  }, []);

  // 🔹 Match PHU Regions with Census Data (Run when both datasets are loaded)
  useEffect(() => {
    if (geoData && phuData.length > 0) {
      console.log("✅ Processing PHU Matches...");
      let missing = 0;

      geoData.features.forEach((feature) => {
        const phuNameGeoJSON = feature.properties.NAME_ENG.trim();
        const matchingData = phuData.find(
          (data) => data.phu_name.trim() === phuNameGeoJSON
        );

        if (!matchingData) {
          console.warn(`❌ No match for PHU: ${phuNameGeoJSON}`);
          missing += 1;
        } else {
          console.log(`✅ Matched: ${matchingData.phu_name}`);
        }
      });

      setMissingCount(missing);
    }
  }, [geoData, phuData]); // Runs when both datasets are available

  const onEachFeature = (feature, layer) => {
    if (!feature.properties || !feature.properties.NAME_ENG) {
      console.warn("⚠️ Missing NAME_ENG in feature:", feature);
      return;
    }

    const phuNameGeoJSON = feature.properties.NAME_ENG.trim();
    let matchingData = phuData.find(
      (data) => data.phu_name.trim() === phuNameGeoJSON
    );

    if (matchingData) {
      layer.bindPopup(`
        <b>${matchingData.phu_name}</b><br/>
        <b>Region:</b> ${matchingData.region || "N/A"}<br/>
        <b>Population:</b> ${matchingData.population || "N/A"}<br/>
        <b>Median Income:</b> $${matchingData.median_total_income || "N/A"}
      `);
    }

    layer.on("mouseover", function () {
      layer.setStyle({ fillColor: "yellow", fillOpacity: 0.5 });
    });
    layer.on("mouseout", function () {
      layer.setStyle({ fillColor: "blue", fillOpacity: 0.3 });
    });
  };

  return (
    <div>
      <header
        style={{
          padding: "10px",
          background: "#222",
          color: "white",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h1>Ontario Health Data Map</h1>
        <h2 style={{ color: "red" }}>❌ Missing PHU Matches: {missingCount}</h2>
      </header>

      <div
        id="map-container"
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "20px",
        }}
      >
        <MapContainer
          center={[49, -85]} // 🔹 Fixed Map Centering
          zoom={5} // 🔹 Fixed Zoom Level
          style={{
            width: "90vw",
            height: "80vh",
            borderRadius: "10px",
            boxShadow: "0 0 10px rgba(0,0,0,0.3)",
          }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          {geoData && (
            <GeoJSON
              data={geoData}
              onEachFeature={onEachFeature}
              style={{ color: "blue", weight: 2 }} // 🔹 Fixed Boundaries
            />
          )}
        </MapContainer>
      </div>
    </div>
  );
};

export default HealthMap;
