import React, { useEffect, useState } from "react";
import Nav from "../../components/Nav/Nav";
import axios from "axios";
import PlantationCardView from "./PlantationCardView";
import "./PlantationsGallery.css";

const URL = "http://localhost:5000/api/plots/";

function PlantationsGallery() {
  const [plantations, setPlantations] = useState([]);
  const [query, setQuery] = useState("");
  const [filtered, setFiltered] = useState([]);

  useEffect(() => {
    axios
      .get(URL)
      .then((res) => {
        setPlantations(res.data || []);
        setFiltered(res.data || []);
      })
      .catch((err) => console.error(err));
  }, []);

  const handleSearch = () => {
    if (!query.trim()) {
      setFiltered(plantations);
      return;
    }
    const q = query.toLowerCase();
    setFiltered(
      plantations.filter((p) =>
        [p.plotID, p.name, p.location, p.size, p.noOfTrees, p.irrigationSchedules]
          .map((v) => (v ?? "").toString().toLowerCase())
          .some((txt) => txt.includes(q))
      )
    );
  };

  return (
    <div>
      

      <div className="pg-header">
        {/* <h1 className="pg-title">Coconut Plantation Management</h1> */}
        <p className="pg-sub">Monitor and Manage your Coconut Plantations efficiently</p>
        <div className="pg-search">
          <input
            type="text"
            placeholder="Search plantations by name, location, or plot..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
          <button onClick={handleSearch}>Search</button>
        </div>
      </div>

      <div className="pg-grid">
        {filtered.map((p) => (
          <PlantationCardView key={p.plotID} plantation={p} />
        ))}
        {filtered.length === 0 && (
          <p className="pg-empty">No plantations match your search.</p>
        )}
      </div>
    </div>
  );
}

export default PlantationsGallery;


