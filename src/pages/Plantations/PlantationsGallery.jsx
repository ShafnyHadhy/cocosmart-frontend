import React, { useEffect, useState } from "react";
import Nav from "../../components/Nav/Nav";
import axios from "axios";
import PlantationCardView from "./PlantationCardView";
import { IoIosSearch } from "react-icons/io"; // ✅ import search icon
import "./PlantationsGallery.css";

const URL = "http://localhost:5000/api/plots/";

function PlantationsGallery() {
  const [allPlantations, setAllPlantations] = useState([]);
  const [query, setQuery] = useState("");
  const [filtered, setFiltered] = useState([]);

  useEffect(() => {
    axios
      .get(URL)
      .then((res) => {
        setAllPlantations(res.data || []);
        setFiltered(res.data || []);
      })
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setFiltered(allPlantations);
      return;
    }
    const lowercasedFilter = query.toLowerCase();
    setFiltered(
      allPlantations.filter(
        (p) =>
          p.name.toLowerCase().startsWith(lowercasedFilter) ||
          p.location.toLowerCase().startsWith(lowercasedFilter) ||
          p.plotID.toLowerCase().startsWith(lowercasedFilter)
      )
    );
  }, [query, allPlantations]);

  return (
    <div>
      <div className="pg-gallery-header">
        <p className="pg-gallery-sub">
          Monitor and Manage your Coconut Plantations efficiently
        </p>

        {/* Search bar */}
      <div className="pg-gallery-search">
  <input
    type="text"
    placeholder="Search plantations by name, location, or plot..."
    value={query}
    onChange={(e) => setQuery(e.target.value)}
  />
</div>

      </div>

      <div className="pg-gallery-grid">
        {filtered.map((p) => (
          <PlantationCardView key={p.plotID} plantation={p} />
        ))}
        {filtered.length === 0 && (
          <p className="pg-gallery-empty">No plantations match your search.</p>
        )}
      </div>
    </div>

      );
    }

export default PlantationsGallery;
