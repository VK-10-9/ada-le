"use client";

import React, { useEffect, useRef } from "react";

export default function CodeWalkthrough({
  code = [],
  activeLineIdx = -1,
  selectedLineIdx,
  onLineClick,
  explanationText
}) {
  const containerRef = useRef(null);

  // Auto-scroll to active line
  useEffect(() => {
    if (activeLineIdx !== -1 && containerRef.current) {
      const activeElement = containerRef.current.querySelector(`#code-row-${activeLineIdx}`);
      if (activeElement) {
        activeElement.scrollIntoView({
          behavior: "smooth",
          block: "nearest"
        });
      }
    }
  }, [activeLineIdx]);

  return (
    <div className="card code-panel">
      <div className="card-subtitle">C Implementation Walkthrough</div>
      <h3 className="card-title" style={{ marginBottom: "0.5rem" }}>
        Interactive Line Guide
      </h3>
      <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.75rem" }}>
        Tap any line during pause to highlight its explanation.
      </p>
      
      <div className="code-container" ref={containerRef} style={{ maxHeight: "450px" }}>
        {code.map((line, idx) => {
          const isActive = idx === activeLineIdx || idx === selectedLineIdx;
          return (
            <div
              key={idx}
              id={`code-row-${idx}`}
              className={`code-line ${isActive ? "active" : ""}`}
              onClick={() => onLineClick(idx, line.e)}
            >
              <span className="code-line-num">{idx + 1}</span>
              <span className="code-line-text">{line.c}</span>
            </div>
          );
        })}
      </div>

      {(explanationText || (activeLineIdx !== -1 && code[activeLineIdx]?.e)) && (
        <div className="explain-box">
          {explanationText || code[activeLineIdx]?.e}
        </div>
      )}
    </div>
  );
}
