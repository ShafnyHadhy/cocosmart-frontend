import React, { useState, useEffect } from "react";
import Plantation from "./Plantation";
import axios from "axios";
import { IoIosSearch } from "react-icons/io";
import { FaDownload, FaWhatsapp } from "react-icons/fa";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import "./Plantations.css";

const URL = "http://localhost:5000/api/plots/";

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

  const handleSearch = () => {
    if (searchQuery.trim() === "") {
      fetchHandler().then((data) => {
        setPlantations(data);
        setNoResults(false);
      });
      return;
    }

    fetchHandler().then((data) => {
      const filtered = data.filter((plantation) =>
        Object.values(plantation).some((field) =>
          field?.toString().toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
      setPlantations(filtered);
      setNoResults(filtered.length === 0);
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

  const reportId = `RPT-${new Date().getFullYear()}${(
    "0" + (new Date().getMonth() + 1)
  ).slice(-2)}${("0" + new Date().getDate()).slice(-2)}-001`;

  const handleDownloadPDF = () => {
    if (!plantations || plantations.length === 0) return;

    const doc = new jsPDF();
    const logoImg = new Image();
    logoImg.src = "/clogo.png"; // put logo in public folder

    logoImg.onload = () => {
      // --- Logo & Company Header ---
      doc.addImage(logoImg, "PNG", 15, 10, 30, 30);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(20);
      doc.text("CocoSmart Pvt Ltd", 105, 20, { align: "center" });

      doc.setFont("helvetica", "normal");
      doc.setFontSize(14);
      doc.text("Smart Solutions for Coconut Plantations", 105, 28, { align: "center" });

      doc.setFontSize(9);
      doc.text(
        "Hotline: +94 77 123 4567 | Email: info@cocosmart.com | Fax: +1-234-567-890",
        105,
        36,
        { align: "center" }
      );
      doc.text("123/C, Main Street, Colombo 01, Sri Lanka", 105, 42, { align: "center" });

      // --- Report Title ---
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.text("Plantation Report", 105, 53, { align: "center" });

      // --- Generated Date & Report ID ---
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 193, 64, { align: "right" });
      doc.text(`Report ID: ${reportId}`, 15, 64, { align: "left" });

      // --- Table Data ---
      const tableData = plantations.map((p) => [
        p.plotID,
        p.name,
        p.location,
        p.size,
        p.noOfTrees,
        p.irrigationSchedules ? new Date(p.irrigationSchedules).toISOString().split("T")[0] : "",
        p.harvest
      ]);

      autoTable(doc, {
        startY: 70,
        head: [["Plot ID", "Name", "Location", "Size (Acres)", "No. of Trees", "Irrigation", "Harvest"]],
        body: tableData,
        theme: "grid",
        styles: { fontSize: 10 },
        headStyles: { fillColor: [42, 85, 64], textColor: 255, halign: "center" },
        columnStyles: {
          0: { cellWidth: 20 },
          1: { cellWidth: 35 },
          2: { cellWidth: 35 },
          3: { cellWidth: 20, halign: "center" },
          4: { cellWidth: 20, halign: "center" },
          5: { cellWidth: 30, halign: "center" },
          6: { cellWidth: 20, halign: "center" }
        }
      });

      // --- Totals ---
      const totalPlots = plantations.length;
      const totalHarvest = plantations.reduce((sum, p) => sum + (Number(p.harvest) || 0), 0);

      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text(`Total Number of Plots: ${totalPlots}`, 15, doc.lastAutoTable.finalY + 10);
      doc.text(`Total Harvest (units): ${totalHarvest}`, 15, doc.lastAutoTable.finalY + 18);

      // --- Footer ---
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        doc.text("Prepared by: Admin01 | Approved by: Plantation Manager", 15, 290, { align: "left" });
        doc.text(`Report ID: ${reportId} | Page ${i} of ${pageCount}`, 200, 290, { align: "right" });
      }

      doc.save(`Plantation_Report_${new Date().toISOString()}.pdf`);
    };
  };

  return (
    <div className="pgs-plantations-page">
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
        <p className="pgs-no-results">No results found for "{searchQuery}"</p>
      ) : (
        <div className="pgs-plantations-container">
          {plantations.length > 0 ? (
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
                {plantations.map((p, i) => (
                  <Plantation key={i} plantation={p} />
                ))}
              </tbody>
            </table>
          ) : (
            <p>No plantation records found.</p>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="pgs-action-buttons flex justify-center gap-4 mt-4">
        <button onClick={handleDownloadPDF} className="pgs-btn-download flex items-center gap-2">
          <FaDownload />
          <span>Download Report</span>
        </button>
        <button onClick={handleSendReport} className="pgs-btn-whatsapp flex items-center gap-2">
          <FaWhatsapp />
          <span>Send Whatsapp Message</span>
        </button>
      </div>
    </div>
  );
}

export default Plantations;
