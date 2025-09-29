import React, { useState, useEffect } from 'react';
import Nav from '../../components/Nav/Nav';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './AddPlantation.css';

function AddPlantation() {
  const navigate = useNavigate();
  const [inputs, setInputs] = useState({
    plotID: "",
    name: "",
    location: "",
    size: "",
    noOfTrees: "",
    irrigationSchedules: "",
    harvest: ""
  });

  const [existingIDs, setExistingIDs] = useState([]);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({ name: "", size: "", noOfTrees: "", harvest: "" });

  // Fetch existing plot IDs
  useEffect(() => {
    axios.get("http://localhost:5000/api/plots/")
      .then((res) => {
        const ids = res.data.map(p => p.plotID);
        setExistingIDs(ids);
      })
      .catch(err => console.error(err));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "size") {
      if (value === "" || (/^[0-9]*$/.test(value) && value.length <= 5)) {
        setInputs((prev) => ({ ...prev, size: value }));
      }
      return;
    }

    if (name === "plotID") {
      if (value === "" || /^[A-Za-z0-9]+$/.test(value)) {
        setInputs((prev) => ({ ...prev, plotID: value }));
        setError("");
      } else {
        setError("Plot ID can contain letters and numbers only.");
      }
      return;
    }

    setInputs((prev) => ({ ...prev, [name]: value }));
  };

  const handleIDBlur = () => {
    if (existingIDs.includes(inputs.plotID)) {
      setError("Plot ID already exists! Please choose a unique one.");
    }
  };

  const handleHarvestChange = (e) => {
    const value = e.target.value;
    if (value === "" || /^[0-9]+$/.test(value)) {
      setInputs(prev => ({ ...prev, harvest: value }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    if (name === "name") {
      const valid = value === "" ? false : /^[A-Za-z].*/.test(value);
      setFieldErrors((prev) => ({ ...prev, name: valid ? "" : "Name must start with a letter." }));
      return;
    }
    if (name === "size") {
      const valid = /^[1-9][0-9]*$/.test(value);
      setFieldErrors((prev) => ({ ...prev, size: valid ? "" : "Size must be a positive integer." }));
      return;
    }
    if (name === "noOfTrees") {
      const valid = /^[1-9][0-9]*$/.test(value);
      setFieldErrors((prev) => ({ ...prev, noOfTrees: valid ? "" : "No of Trees must be a positive integer." }));
      return;
    }
    if (name === "harvest") {
      const valid = /^[1-9][0-9]*$/.test(value);
      setFieldErrors((prev) => ({ ...prev, harvest: valid ? "" : "Harvest must be a positive integer." }));
      return;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (existingIDs.includes(inputs.plotID)) {
      setError("Plot ID already exists! Please choose a unique one.");
      return;
    }

    const dataToSend = {
      ...inputs,
      size: Number(inputs.size)
    };

    try {
      await axios.post("http://localhost:5000/api/plots/", dataToSend);
      window.alert("Plantation added successfully!");
      navigate("/plant/plantations");
    } catch (err) {
      console.error(err);
      setError("Failed to add plantation. Try again.");
    }
  };

  const today = new Date().toISOString().split("T")[0];

  // ✅ Disable button if there is any error
  const hasErrors =
    error ||
    fieldErrors.name ||
    fieldErrors.size ||
    fieldErrors.noOfTrees ||
    fieldErrors.harvest;

  return (
    <div className="add-plantation-page-container">
      <h1 className="add-plantation-page-title">Add New Plantation</h1>
      {error && <p className="add-plantation-page-error-text">{error}</p>}

      <form onSubmit={handleSubmit} className="add-plantation-page-form">
        <div>
          <label className="add-plantation-page-label">Plot ID:</label>
          <input
            type="text"
            name="plotID"
            onChange={handleChange}
            onBlur={handleIDBlur}
            value={inputs.plotID}
             className="add-plantation-page-input"
            placeholder="Enter unique plot ID (letters and numbers only)"
            required
          />
        </div>

        <div>
          <label className="add-plantation-page-label">Name:</label>
          <input
            type="text"
            name="name"
            onChange={handleChange}
            onBlur={handleBlur}
            value={inputs.name}
            className="add-plantation-page-input"
            placeholder="Enter plantation name"
            required
          />
          {fieldErrors.name && <p className="add-plantation-page-error-text">{fieldErrors.name}</p>}
        </div>

        <div>
          <label className="add-plantation-page-label">Location:</label>
          <input
            type="text"
            name="location"
            onChange={handleChange}
            value={inputs.location}
            className="add-plantation-page-input"
            placeholder="Enter location of the plantation"
            required
          />
        </div>

        <div>
          <label className="add-plantation-page-label">Size (Acres):</label>
          <input
            type="text"
            name="size"
            value={inputs.size}
            onChange={handleChange}
            onBlur={handleBlur}
            className="add-plantation-page-input"
            placeholder="Enter size in acres"
            required
          />
          {fieldErrors.size && <p className="add-plantation-page-error-text">{fieldErrors.size}</p>}
        </div>

        <div>
          <label className="add-plantation-page-label">No of Trees:</label>
          <input
            type="number"
            name="noOfTrees"
            onChange={handleChange}
            onBlur={handleBlur}
            value={inputs.noOfTrees}
            className="add-plantation-page-input"
            placeholder="Enter no of trees (numbers only)"
            required
          />
          {fieldErrors.noOfTrees && <p className="add-plantation-page-error-text">{fieldErrors.noOfTrees}</p>}
        </div>

        <div>
          <label className="add-plantation-page-label">Irrigation Schedules:</label>
          <input
            type="date"
            name="irrigationSchedules"
            min={today}
            onChange={handleChange}
            className="add-plantation-page-input"
            value={inputs.irrigationSchedules}
            required
          />
        </div>

        <div>
          <label className="add-plantation-page-label">Monthly Harvest (numeric only):</label>
          <input
            type="text"
            name="harvest"
            onChange={handleHarvestChange}
            onBlur={handleBlur}
            value={inputs.harvest}
            className="add-plantation-page-input"
            placeholder="Enter harvest amount (numbers only)"
            required
          />
          {fieldErrors.harvest && <p className="add-plantation-page-error-text">{fieldErrors.harvest}</p>}
        </div>

        <div className="add-plantation-page-actions">
          <button type="submit" className="add-plantation-page-btn-submit" disabled={!!hasErrors}>
            Submit
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddPlantation;
