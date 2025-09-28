import React, { useEffect, useState } from "react";
import Nav from "../../components/Nav/Nav";
import axios from "axios";
import PlantationCardView from "./PlantationCardView";
import { IoIosSearch } from "react-icons/io"; // ✅ import search icon
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
        [
          p.plotID,
          p.name,
          p.location,
          p.size,
          p.noOfTrees,
          p.irrigationSchedules,
        ]
          .map((v) => (v ?? "").toString().toLowerCase())
          .some((txt) => txt.includes(q))
      )
    );
  };

  return (
    <div>
      <div className="pg-header">
        <p className="pg-sub">
          Monitor and Manage your Coconut Plantations efficiently
        </p>

        {/* ✅ Search bar with icons */}
        <div className="pg-search relative flex items-center">
          {/* Icon inside input */}
         
          <input
            type="text"
            placeholder="Search plantations by name, location, or plot..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="pl-10 pr-3 py-2 border rounded w-full"
          />

          {/* Button with icon */}
          <button
            onClick={handleSearch}
            className="ml-2 flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded"
          >
            <IoIosSearch />
            <span>Search</span>
          </button>
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
