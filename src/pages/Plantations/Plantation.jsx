import React from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { FaRegEdit } from "react-icons/fa";
import { RiDeleteBin5Fill } from "react-icons/ri";
import toast from "react-hot-toast";

function Plantation({ plantation }) {
  const { plotID, name, location, size, noOfTrees, irrigationSchedules, harvest } = plantation;
  const navigate = useNavigate();

  const deleteHandler = async () => {
    const confirmDelete = window.confirm("Are you sure you want to delete this plantation?");
    if (confirmDelete) {
      try {
        await axios.delete(`http://localhost:5000/api/plots/${plotID}`);
        toast.success("Plantation deleted successfully!");
        navigate("/plant/plantations");
      } catch (err) {
        console.error(err);
        toast.error("Failed to delete plantation. Try again.");
      }
    }
  };

  return (
    <tr>
      <td>{plotID}</td>
      <td>{name}</td>
      <td>{location}</td>
      <td>{size}</td>
      <td>{noOfTrees}</td>
      <td>{irrigationSchedules ? new Date(irrigationSchedules).toISOString().split("T")[0] : ""}</td>
      <td>
        <span
          style={{
            backgroundColor: "#d4f8d4",
            color: "#006400",
            padding: "4px 10px",
            borderRadius: "20px",
            fontWeight: "600",
            display: "inline-block",
            minWidth: "50px",
            textAlign: "center"
          }}
        >
          {harvest}
        </span>
      </td>
      <td className="no-print">
        <div className="flex flex-row gap-5">
          <Link to={`/plant/viewplantations/${plotID}`}>
            <div className="w-10 h-10 flex items-center justify-center rounded-full bg-green-100">
              <FaRegEdit className="text-green-600 text-xl" />
            </div>
          </Link>
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
