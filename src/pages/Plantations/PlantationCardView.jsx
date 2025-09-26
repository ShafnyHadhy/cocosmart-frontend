import React from "react";
import "./PlantationCardView.css";

// import images
import coconutImage from "../../assets/coconut.jpg";
import bananaImage from "../../assets/banana.jpg";
import coco1Image from "../../assets/coco1.jpg";
import teaImage from "../../assets/tea.jpg";
import coco2Image from "../../assets/coco2.jpg";
import coco3Image from "../../assets/coco3.jpg";

// map plantation names to images
const plantationImages = {
  "North Plantation": bananaImage,
  "South Plantation": coco1Image,
  "East Coconut Field": teaImage,
  "West Agro Land": coconutImage,
  "Dhiyan": coco2Image,
  "West Cocos": coco3Image,
};

function fmtDateOnly(value) {
  if (!value) return "";
  try {
    return new Date(value).toISOString().split("T")[0];
  } catch {
    return value;
  }
}

function PlantationCardView({ plantation }) {
  if (!plantation) {
    return <div className="pcv-card">No plantation data available</div>;
  }

  const { name, plotID, location, size, noOfTrees, irrigationSchedules, harvest } = plantation;

  // pick image based on plantation name, fallback to coconut
  const plantationImage = plantationImages[name] || coconutImage;

  return (
    <div className="pcv-card">
      <div className="pcv-media">
        <img src={plantationImage} alt={name} />
        <span className="pcv-badge">Excellent</span>
      </div>
      <div className="pcv-body">
        <div className="pcv-top">
          <h3 className="pcv-title">{name}</h3>
          <span className="pcv-plot">#{plotID}</span>
          <p className="pcv-location">📍 {location}</p>
        </div>

        <div className="pcv-metrics">
          <div className="pcv-metric">
            <span className="pcv-label">Size</span>
            <span className="pcv-value">{size} acres</span>
          </div>
          <div className="pcv-metric">
            <span className="pcv-label">Trees</span>
            <span className="pcv-value">{noOfTrees}</span>
          </div>
          <div className="pcv-metric">
            <span className="pcv-label">Irrigation</span>
            <span className="pcv-value">{fmtDateOnly(irrigationSchedules)}</span>
          </div>
          <div className="pcv-metric">
            <span className="pcv-label">Harvest</span>
            <span className="pcv-value">{harvest} nuts/month</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PlantationCardView;
