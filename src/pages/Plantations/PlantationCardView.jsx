import React from "react";
import "./PlantationCardView.css";

// import images
import coconutImage from "../../assets/coconut.jpg";
import bananaImage from "../../assets/banana.jpg";
import coco1Image from "../../assets/coco1.jpg";
import teaImage from "../../assets/tea.jpg";
import coco2Image from "../../assets/coco2.jpg";
import coco3Image from "../../assets/coco3.jpg";
import coco4Image from "../../assets/coco5.jpg";
import coco5Image from "../../assets/coco6.webp";
import coco6Image from "../../assets/coco7.webp";
import coco7Image from "../../assets/coco8.webp";
import coco8Image from "../../assets/coco9.jpg";


// map plantation names to images
const plantationImages = {
  "North Plantation": bananaImage,
  "South Plantation": coco1Image,
  "East Coconut Field": teaImage,
  "West Agro Land": coco7Image,
  "Dhiyan": coco2Image,
  "West Cocos": coco3Image,
  "East Cocos": coco4Image,
  "South Cocos": coco5Image,
  "North Cocos": coco8Image,
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
    <div className="pgc-card">
      <div className="pgc-media">
        <img src={plantationImage} alt={name} />
        <span className="pgc-badge">Excellent</span>
      </div>
      <div className="pgc-body">
        <div className="pgc-top">
          <h3 className="pgc-title">{name}</h3>
          <span className="pgc-plot">#{plotID}</span>
          <p className="pgc-location">📍 {location}</p>
        </div>

        <div className="pgc-metrics">
          <div className="pgc-metric">
            <span className="pgc-label">Size</span>
            <span className="pgc-value">{size} acres</span>
          </div>
          <div className="pgc-metric">
            <span className="pgc-label">Trees</span>
            <span className="pgc-value">{noOfTrees}</span>
          </div>
          <div className="pgc-metric">
            <span className="pgc-label">Irrigation</span>
            <span className="pgc-value">{fmtDateOnly(irrigationSchedules)}</span>
          </div>
          <div className="pgc-metric">
            <span className="pgc-label">Harvest</span>
            <span className="pgc-value">{harvest} nuts/month</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PlantationCardView;
