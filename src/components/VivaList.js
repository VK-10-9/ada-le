"use client";

import React, { useState, useEffect } from "react";

export default function VivaList({ viva = [] }) {
  const [openIndices, setOpenIndices] = useState({});

  // Reset expanded states when algorithm changes
  useEffect(() => {
    setOpenIndices({});
  }, [viva]);

  const toggleCard = (index) => {
    setOpenIndices((prev) => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  return (
    <div className="card">
      <div className="card-subtitle">Viva Voce Preparation</div>
      <h3 className="card-title" style={{ marginBottom: "1rem" }}>
        Frequent Lab Questions
      </h3>
      <div className="viva-list">
        {viva.map((v, index) => {
          const isOpen = !!openIndices[index];
          return (
            <div key={index} className={`viva-card ${isOpen ? "open" : ""}`}>
              <div className="viva-question" onClick={() => toggleCard(index)}>
                <span>Q: {v.q}</span>
              </div>
              <div className="viva-answer">
                {v.a}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
