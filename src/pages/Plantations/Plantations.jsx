import React, { useState, useEffect, useRef } from "react";
import Plantation from "./Plantation";
import axios from "axios";
import Nav from "../../components/Nav/Nav";
import { useReactToPrint } from "react-to-print";
import "./Plantations.css";
import { IoIosSearch } from "react-icons/io";
import { FaDownload } from "react-icons/fa";
import { FaWhatsapp } from "react-icons/fa";


const URL = "http://localhost:5000/api/plots/";

// Fetch all plantations
const fetchHandler = async () => {
  return await axios.get(URL).then((res) => res.data);
};

function Plantations() {
  const [plantations, setPlantations] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [noResults, setNoResults] = useState(false);

  // Load plantations on mount
  useEffect(() => {
    fetchHandler().then((data) => setPlantations(data));
  }, []);

  const componentRef = useRef(null);

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: "CocoSmart Plantation Report",
    onAfterPrint: () => alert("Plantation Report successfully downloaded!"),
  });

  const handleSearch = () => {
    if (searchQuery.trim() === "") {
      fetchHandler().then((data) => {
        setPlantations(data);
        setNoResults(false);
      });
      return;
    }

    fetchHandler().then((data) => {
      const filteredPlantations = data.filter((plantation) =>
        Object.values(plantation).some((field) =>
          field?.toString().toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
      setPlantations(filteredPlantations);
      setNoResults(filteredPlantations.length === 0);
    });
  };

  const handleSendReport = () => {
    const phoneNumber = "+94701520421";
    const message = `Selected plantation reports`;
    const whatsAppUrl = `https://web.whatsapp.com/send?phone=${phoneNumber}&text=${encodeURIComponent(
      message
    )}`;
    window.open(whatsAppUrl, "_blank");
  };

  const currentDateTime = new Date().toLocaleString();
  const reportId = `RPT-${new Date().getFullYear()}${(
    "0" +
    (new Date().getMonth() + 1)
  ).slice(-2)}${("0" + new Date().getDate()).slice(-2)}-001`;

  // ✅ Calculate totals
  const totalPlots = plantations.length;
  const totalHarvest = plantations.reduce(
    (sum, plantation) => sum + (Number(plantation.harvest) || 0),
    0
  );

  return (
    <div>

      {/* Search */}
      <div className="search-bar relative">
        <IoIosSearch className="absolute left-108 top-2/3 transform -translate-y-1/2 text-gray-500" />
        <input
          type="text"
          placeholder="      Search Plantation Details"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 pr-3 py-2 border rounded w-full"
        />

        
        <button onClick={handleSearch}>Search</button>
      </div>

      {noResults ? (
        <p className="no-results">No results found for "{searchQuery}"</p>
      ) : (
        <div ref={componentRef} className="plantations-container">
          {/* PDF HEADER */}
         {/* PDF HEADER */}
        <div className="pdf-header only-print">
          <img src="/cocsmart.png" alt="CocoSmart Logo" className="pdf-logo" />
          <h1>COCOSMART - PLANTATION REPORT</h1>
          <h3>Comprehensive Coconut Plantation Management Analysis</h3>
          <p>
            <b>Generated on:</b> {currentDateTime} &nbsp;&nbsp; | &nbsp;&nbsp;
            <b>Report ID:</b> {reportId}
          </p>
          <hr />
        </div>


          {/* Description */}
          <div className="report-description only-print">
            <p>
              CocoSmart is a web-based coconut plantation management system that helps farmers and estate managers track and manage plots efficiently. It supports recording details like plot ID, size, trees, irrigation, and harvests, with features such as search, filtering, PDF reports, WhatsApp sharing, real-time weather updates, and a built-in guidance chatbot.
            </p>
          </div>

          {/* Table */}
          {plantations.length > 0 ? (
            <>
              <h2 className="section-title only-print">✅ Plantation Details</h2>
              <table className="plantation-table">
                <thead>
                  <tr>
                    <th>Plot ID</th>
                    <th>Name</th>
                    <th>Location</th>
                    <th>Size (Acres)</th>
                    <th>No. of Trees</th>
                    <th>Irrigation Schedule</th>
                    <th>Harvest(units)</th>
                    <th className="no-print">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {plantations.map((plantation, i) => (
                    <Plantation key={i} plantation={plantation} />
                  ))}
                </tbody>
              </table>

              {/* ✅ Totals Section (only print) */}
              <div className="totals-section only-print">
                <p>
                  <b>Total Number of Plots:</b> {totalPlots}
                </p>
                <p>
                  <b>Total Harvest (units):</b> {totalHarvest}
                </p>
              </div>
            </>
          ) : (
            <p>No plantation records found.</p>
          )}

          {/* Recommendations */}
          {/* <div className="recommendations only-print">
            <h2>💡 Management Recommendations</h2>
            <ul>
              <li>
                <b>Pest Control:</b> Schedule quarterly pest inspection for all
                plots, especially during monsoon season (Oct–Dec).
              </li>
              <li>
                <b>Harvest Optimization:</b> Monitor soil nutrients and
                fertilizers to improve yield for underperforming plots.
              </li>
              <li>
                <b>Irrigation System:</b> Ensure irrigation schedules are met
                consistently to avoid reduced productivity.
              </li>
              <li>
                <b>Resource Allocation:</b> Consider redistributing resources
                from high-performing plots to underperforming areas.
              </li>
            </ul>
          </div> */}

          {/* Signature Section */}
          {/* <div className="signature-section only-print">
            <p>______________________________</p>
            <p>Administrator Signature</p>
            <p>Date Signed: __________________</p>
          </div> */}

          {/* Bottom-right contact info */}
          <div className="contact-info only-print">
            <p>📧 support@cocosmart.lk</p>
            <p>📱 +94 70 152 0421</p>
            <p>🌐 www.cocosmart.lk</p>
          </div>

          {/* Footer */}
          <div className="pdf-footer only-print">
            <hr />
            <p>Report generated by CocoSmart © {new Date().getFullYear()}</p>
          </div>
        </div>
      )}

      <div className="action-buttons flex justify-center gap-4 mt-4">
      <button
        onClick={handlePrint}
        className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded"
      >
        <FaDownload />
        <span>Download Report</span>
      </button>

      <button
        onClick={handleSendReport}
        className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded"
      >
        <FaWhatsapp />
        <span>Send Whatsapp Message</span>
      </button>
    </div>

    </div>
  );
}

export default Plantations;
