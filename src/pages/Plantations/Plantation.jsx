import React from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { FaRegEdit, FaTrash } from "react-icons/fa";
import { RiDeleteBin5Fill } from "react-icons/ri";

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
      <td className="cell-irrigation">
        {irrigationSchedules
          ? new Date(irrigationSchedules).toISOString().split("T")[0]
          : ""}
      </td>
      <td>
        <span
          style={{
            backgroundColor: "#d4f8d4",   // light green
            color: "#006400",             // dark green text
            padding: "4px 10px",
            borderRadius: "20px",
            fontWeight: "600",
            display: "inline-block",
            minWidth: "50px",
            textAlign: "center",
          }}
        >
          {plantation.harvest}
        </span>
      </td>

      <td className="no-print">
       <div className="flex flex-row gap-5">
      {/* Edit Icon with light green circle */}
      <Link to={`/plant/viewplantations/${plotID}`}>
        <div className="w-10 h-10 flex items-center justify-center rounded-full bg-green-100">
          <FaRegEdit className="text-green-600 text-xl" />
        </div>
      </Link>

      {/* Delete Icon with light red circle */}
      <Link onClick={deleteHandler}>
        <div className="w-10 h-10 flex items-center justify-center rounded-full bg-red-100">
          <RiDeleteBin5Fill className="text-red-600 text-xl" />
        </div>
      </Link>
    </div>


      </td>
    </tr>
  );
}

export default Plantation;
