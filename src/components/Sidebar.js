"use client";

import React from "react";
import { ALGORITHMS } from "@/data/algorithms";

export default function Sidebar({
  activeTab,
  onTabChange,
  searchQuery,
  onSearchChange,
  theme,
  onThemeToggle
}) {
  const listAlgos = Object.values(ALGORITHMS);
  
  // Filter list locally based on query
  const filteredAlgos = listAlgos.filter(algo => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    
    // Match name, lab, subtitle, description
    if (algo.name.toLowerCase().includes(q) ||
        algo.lab.toLowerCase().includes(q) ||
        algo.subtitle.toLowerCase().includes(q) ||
        algo.description.toLowerCase().includes(q)) {
      return true;
    }
    
    // Match inside viva QA
    const vivaMatch = algo.viva.some(
      v => v.q.toLowerCase().includes(q) || v.a.toLowerCase().includes(q)
    );
    if (vivaMatch) return true;
    
    return false;
  });

  return (
    <aside className="sidebar">
      <div className="logo-area">
        <div className="logo-icon">Ω</div>
        <div className="logo-text">ADA Companion</div>
      </div>
      
      <div className="search-box-container">
        <input
          type="text"
          className="search-box"
          placeholder="Search codes, vivas, topics..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      
      <nav className="nav-links">
        <div className="nav-item">
          <a
            className={`nav-link ${activeTab === "dashboard" ? "active" : ""}`}
            onClick={() => onTabChange("dashboard")}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="7" height="9" rx="1" />
              <rect x="14" y="3" width="7" height="5" rx="1" />
              <rect x="14" y="12" width="7" height="9" rx="1" />
              <rect x="3" y="16" width="7" height="5" rx="1" />
            </svg>
            <span>Dashboard</span>
          </a>
        </div>
        
        <div style={{
          fontSize: "11px",
          textTransform: "uppercase",
          color: "var(--text-tertiary)",
          padding: "0.75rem 1rem 0.25rem",
          fontWeight: 600
        }}>
          Lab Experiments
        </div>
        
        {filteredAlgos.map((algo) => (
          <div className="nav-item" key={algo.id}>
            <a
              className={`nav-link ${activeTab === algo.id ? "active" : ""}`}
              onClick={() => onTabChange(algo.id)}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
              <span>{algo.name}</span>
              <span className="nav-link-badge">{algo.lab}</span>
            </a>
          </div>
        ))}
        
        {filteredAlgos.length === 0 && (
          <div style={{ padding: "1rem", fontSize: "0.85rem", color: "var(--text-tertiary)", textAlign: "center" }}>
            No matches found
          </div>
        )}
      </nav>
      
      <div className="sidebar-footer">
        <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>v1.0.0 (Next.js)</span>
        <button
          className="theme-toggle"
          onClick={onThemeToggle}
          title="Switch Light/Dark Theme"
        >
          {theme === "dark" ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="5" />
              <line x1="12" y1="1" x2="12" y2="3" />
              <line x1="12" y1="21" x2="12" y2="23" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
              <line x1="1" y1="12" x2="3" y2="12" />
              <line x1="21" y1="12" x2="23" y2="12" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          )}
        </button>
      </div>
    </aside>
  );
}
