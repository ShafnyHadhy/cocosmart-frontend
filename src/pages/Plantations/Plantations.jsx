import React, { useState, useEffect, useRef } from "react";
import Plantation from "./Plantation";
import axios from "axios";
import Nav from "../../components/Nav/Nav";
import { useReactToPrint } from "react-to-print";
import "./Plantations.css";
import { IoIosSearch } from "react-icons/io";
import { FaDownload, FaWhatsapp } from "react-icons/fa";

const URL = "http://localhost:5000/api/plots/";

// Fetch all plantations
const fetchHandler = async () => {
  return await axios.get(URL).then((res) => res.data);
};

function Plantations() {
  const [plantations, setPlantations] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [noResults, setNoResults] = useState(false);

  useEffect(() => {
    fetchHandler().then((data) => setPlantations(data));
  }, []);

  const componentRef = useRef(null);

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
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

  const totalPlots = plantations.length;
  const totalHarvest = plantations.reduce(
    (sum, plantation) => sum + (Number(plantation.harvest) || 0),
    0
  );

  return (
    <div className="pgs-body">
      {/* <Nav /> */}

      {/* Search Bar */}
     <div className="pgs-search-bar flex justify-center">
        <div className="pgs-search-wrapper relative w-full max-w-md">
          <IoIosSearch className="pgs-search-icon" />
          <input
            type="text"
            placeholder="Search Plantation Details"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="pgs-search-input"
          />
        </div>
        <button className="pgs-search-btn ml-2" onClick={handleSearch}>
          Search
        </button>
      </div>

      {noResults ? (
        <p className="pgs-no-results">
          No results found for "{searchQuery}"
        </p>
      ) : (
        <div ref={componentRef} className="pgs-plantations-container">
          {/* PDF HEADER */}
          <div className="pgs-pdf-header pgs-only-print">
            <img
              src="/cocsmart.png"
              alt="CocoSmart Logo"
              className="pgs-pdf-logo"
            />
            <h1>COCOSMART - PLANTATION REPORT</h1>
            <h3>Comprehensive Coconut Plantation Management Analysis</h3>
            <p>
              <b>Generated on:</b> {currentDateTime} &nbsp;&nbsp; | &nbsp;&nbsp;
              <b>Report ID:</b> {reportId}
            </p>
            <hr />
          </div>

          {/* Description */}
          <div className="pgs-report-description pgs-only-print">
            <p>
              CocoSmart is a web-based coconut plantation management system
              that helps farmers and estate managers track and manage plots
              efficiently. It supports recording details like plot ID, size,
              trees, irrigation, and harvests, with features such as search,
              filtering, PDF reports, WhatsApp sharing, real-time weather
              updates, and a built-in guidance chatbot.
            </p>
          </div>

          {/* Table */}
          {plantations.length > 0 ? (
            <>
              <h2 className="pgs-section-title pgs-only-print">
                ✅ Plantation Details
              </h2>
              <table className="pgs-plantation-table">
                <thead>
                  <tr>
                    <th>Plot ID</th>
                    <th>Name</th>
                    <th>Location</th>
                    <th>Size (Acres)</th>
                    <th>No. of Trees</th>
                    <th>Irrigation Schedule</th>
                    <th>Harvest (units)</th>
                    <th className="pgs-no-print">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {plantations.map((plantation, i) => (
                    <Plantation key={i} plantation={plantation} />
                  ))}
                </tbody>
              </table>

              {/* Totals */}
              <div className="pgs-totals-section pgs-only-print">
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

          {/* Contact Info */}
          <div className="pgs-contact-info pgs-only-print">
            <p>📧 support@cocosmart.lk</p>
            <p>📱 +94 70 152 0421</p>
            <p>🌐 www.cocosmart.lk</p>
          </div>

          {/* Footer */}
          <div className="pgs-pdf-footer pgs-only-print">
            <hr />
            <p>Report generated by CocoSmart © {new Date().getFullYear()}</p>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="pgs-action-buttons flex justify-center gap-4 mt-4">
        <button
          onClick={handlePrint}
          className="pgs-btn-download flex items-center gap-2"
        >
          <FaDownload />
          <span>Download Report</span>
        </button>

        <button
          onClick={handleSendReport}
          className="pgs-btn-whatsapp flex items-center gap-2"
        >
          <FaWhatsapp />
          <span>Send Whatsapp Message</span>
        </button>
      </div>
    </div>
  );
}

export default Plantations;
