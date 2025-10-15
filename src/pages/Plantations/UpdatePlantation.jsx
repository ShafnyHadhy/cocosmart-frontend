import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import './UpdatePlantation.css';
import toast from 'react-hot-toast';

function UpdatePlantation() {
  const { plotID } = useParams();
  const [inputs, setInputs] = useState({});
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({
    name: "",
    size: "",
    noOfTrees: "",
    harvest: ""
  });
  const navigate = useNavigate();

  // Fetch single plantation details
  useEffect(() => {
    const fetchPlantation = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/plots/${plotID}`);
        const data = res.data;
        setInputs({
          ...data,
          irrigationSchedules: data.irrigationSchedules
            ? data.irrigationSchedules.split("T")[0]
            : ""
        });
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch plantation data.");
      }
    };
    if (plotID) fetchPlantation();
  }, [plotID]);

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "name") {
      // Allow only letters and spaces
      if (/^[A-Za-z\s]*$/.test(value)) {
        setInputs((prev) => ({ ...prev, [name]: value }));
      }
      return;
    }

    if (name === "size") {
      // Allow only positive decimal numbers (digits and one dot)
      if (/^[0-9]*\.?[0-9]*$/.test(value) && value.length <= 5) {
        setInputs((prev) => ({ ...prev, [name]: value }));
      }
      return;
    }

    if (name === "noOfTrees") {
      // Allow only numbers
      if (/^[0-9]*$/.test(value) && value.length <= 5) {
        setInputs((prev) => ({ ...prev, [name]: value }));
      }
      return;
    }

    if (name === "harvest") {
      // Allow only numbers
      if (/^[0-9]*$/.test(value) && value.length <= 7) {
        setInputs((prev) => ({ ...prev, [name]: value }));
      }
      return;
    }

    // For other inputs like location and date
    setInputs((prev) => ({ ...prev, [name]: value }));
  };

  // Field-level validation on blur
  const handleBlur = (e) => {
    const { name, value } = e.target;

    if (name === "size") {
      const valid = value === "" || (parseFloat(value) > 0 && !isNaN(parseFloat(value)));
      setFieldErrors((prev) => ({ ...prev, size: valid ? "" : "Size must be a positive number." }));
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

    const hasFieldErrors =
      fieldErrors.name ||
      fieldErrors.size ||
      fieldErrors.noOfTrees ||
      fieldErrors.harvest;

    if (hasFieldErrors) {
      toast.error("Please fix validation errors before submitting.");
      return;
    }

    try {
      await axios.put(`http://localhost:5000/api/plots/${plotID}`, {
        ...inputs,
        size: Number(inputs.size)
      });
      toast.success("Plantation updated successfully!");
      navigate("/plant/plantations");
    } catch (err) {
      console.error(err);
      setError("Failed to update plantation.");
    }
  };

  const today = new Date().toISOString().split("T")[0];

  const hasFieldErrors =
    error ||
    fieldErrors.name ||
    fieldErrors.size ||
    fieldErrors.noOfTrees ||
    fieldErrors.harvest;

  return (
    <div className="update-plantation-container">
      <h1>Update Plantation Details</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}

      <form onSubmit={handleSubmit} className="update-plantation-form">
        <div>
          <label>Plot ID:</label>
          <input
            type="text"
            name="plotID"
            value={inputs.plotID || ""}
            disabled
          />
        </div>

        <div>
          <label>Name:</label>
          <input
            type="text"
            name="name"
            onChange={handleChange}
            onBlur={handleBlur}
            value={inputs.name || ""}
            required
          />
          {fieldErrors.name && <p className="error-text">{fieldErrors.name}</p>}
        </div>

        <div>
          <label>Location:</label>
          <input
            type="text"
            name="location"
            onChange={handleChange}
            value={inputs.location || ""}
            required
          />
        </div>

        <div>
          <label>Size (Acres):</label>
          <input
            type="text"
            name="size"
            onChange={handleChange}
            onBlur={handleBlur}
            value={inputs.size || ""}
            placeholder="Enter size in acres (numbers only)"
            required
          />
          {fieldErrors.size && <p className="error-text">{fieldErrors.size}</p>}
        </div>

        <div>
          <label>No of Trees:</label>
          <input
            type="text"
            name="noOfTrees"
            onChange={handleChange}
            onBlur={handleBlur}
            value={inputs.noOfTrees || ""}
            placeholder="Enter no of trees (numbers only)"
            required
          />
          {fieldErrors.noOfTrees && <p className="error-text">{fieldErrors.noOfTrees}</p>}
        </div>

        <div>
          <label>Irrigation Schedules:</label>
          <input
            type="date"
            name="irrigationSchedules"
            min={today}
            onChange={handleChange}
            value={inputs.irrigationSchedules || ""}
            required
          />
        </div>

        <div>
          <label>Monthly Harvest:</label>
          <input
            type="text"
            name="harvest"
            onChange={handleChange}
            onBlur={handleBlur}
            value={inputs.harvest || ""}
            placeholder="Enter monthly harvest (numbers only)"
            required
          />
          {fieldErrors.harvest && <p className="error-text">{fieldErrors.harvest}</p>}
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-update" disabled={!!hasFieldErrors}>
            Update
          </button>
        </div>
      </form>
    </div>
  );
}

export default UpdatePlantation;
