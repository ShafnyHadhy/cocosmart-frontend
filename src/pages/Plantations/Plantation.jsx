import React from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

function Plantation({ plantation }) {
  const { plotID, name, location, size, noOfTrees, irrigationSchedules, harvest } =
    plantation;

  const history = useNavigate();

  const deleteHandler = async () => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this plantation?"
    );
    if (confirmDelete) {
      try {
        await axios.delete(`http://localhost:5000/api/plots/${plotID}`);
        window.alert("Plantation deleted successfully!");
        history("/plant/plantations");
      } catch (err) {
        console.error(err);
        window.alert("Failed to delete plantation. Try again.");
      }
    }
  };

  return (
    <tr>
      <td className="cell-plotid">{plotID}</td>
      <td>{name}</td>
      <td>{location}</td>
      <td>{size}</td>
      <td>{noOfTrees}</td>
      <td className="cell-irrigation">{irrigationSchedules ? new Date(irrigationSchedules).toISOString().split("T")[0] : ""}</td>
      <td>{harvest}</td>
      <td className="no-print">
        <Link to={`/plant/viewplantations/${plotID}`} className="btn-update">
          Update
        </Link>
        <button onClick={deleteHandler} className="btn-delete">
          Delete
         
        </button>
      </td>
    </tr>
  );
}

export default Plantation;
