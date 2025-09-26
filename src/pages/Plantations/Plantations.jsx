import React, { useState, useEffect, useRef } from "react";
import Plantation from "./Plantation";
import axios from "axios";
import Nav from "../../components/Nav/Nav";
import { useReactToPrint } from "react-to-print";
import "./Plantations.css";

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

  const isPositiveInteger = (value) => {
    return Number.isInteger(Number(value)) && Number(value) > 0;
  };

  const currentDateTime = new Date().toLocaleString();
  const reportId = `RPT-${new Date().getFullYear()}${(
    "0" +
    (new Date().getMonth() + 1)
  ).slice(-2)}${("0" + new Date().getDate()).slice(-2)}-001`;

  return (
    <div>


      {/* Search */}
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search Plantation Details"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button onClick={handleSearch}>Search</button>
      </div>

      {noResults ? (
        <p className="no-results">No results found for "{searchQuery}"</p>
      ) : (
        <div ref={componentRef} className="plantations-container">
          {/* PDF HEADER */}
          <div className="pdf-header only-print">
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
            </>
          ) : (
            <p>No plantation records found.</p>
          )}

          {/* Recommendations */}
          <div className="recommendations only-print">
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
          </div>

          {/* Signature Section */}
          <div className="signature-section only-print">
            <p>______________________________</p>
            <p>Administrator Signature</p>
            <p>Date Signed: __________________</p>
          </div>

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

      <div className="action-buttons">
        <button onClick={handlePrint}>Download Report</button>
        <button onClick={handleSendReport}>Send Whatsapp Message</button>
      </div>
    </div>
  );
}

export default Plantations;
