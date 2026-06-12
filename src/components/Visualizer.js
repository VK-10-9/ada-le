"use client";

import React from "react";

export default function Visualizer({
  algo,
  inputData,
  onInputChange,
  step,
  stepIdx,
  totalSteps,
  isPlaying,
  onPlayPause,
  onStepNext,
  onStepPrev,
  onReset,
  speed,
  onSpeedChange
}) {
  const isWeightMatrix = algo.id === "prim" || algo.id === "floyd" || algo.id === "dijkstra";
  const hasMatrix = algo.id === "prim" || algo.id === "floyd" || algo.id === "warshall" || algo.id === "dijkstra" || algo.id === "topological_sort";

  // Matrix resizing
  const handleVerticesChange = (e) => {
    const size = parseInt(e.target.value);
    const defaultMatrix = Array(size).fill(0).map(() => Array(size).fill(0));
    
    // Copy existing data where possible
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        if (inputData.matrix && inputData.matrix[i] && inputData.matrix[i][j] !== undefined) {
          defaultMatrix[i][j] = inputData.matrix[i][j];
        }
      }
    }
    
    onInputChange({
      ...inputData,
      vertices: size,
      matrix: defaultMatrix
    });
  };

  // Matrix cell edit
  const handleCellChange = (i, j, value) => {
    let numVal = parseInt(value) || 0;
    
    const newMatrix = inputData.matrix.map((row, rIdx) => 
      row.map((cell, cIdx) => {
        if (rIdx === i && cIdx === j) {
          return numVal;
        }
        return cell;
      })
    );
    
    onInputChange({
      ...inputData,
      matrix: newMatrix
    });
  };

  // Source selection for Dijkstra
  const handleSourceChange = (e) => {
    onInputChange({
      ...inputData,
      source: parseInt(e.target.value) || 0
    });
  };

  // Randomize values
  const handleRandomize = () => {
    if (hasMatrix) {
      const size = inputData.vertices;
      const newMatrix = Array(size).fill(0).map((_, i) => 
        Array(size).fill(0).map((_, j) => {
          if (i === j) return 0;
          if (algo.id === "warshall" || algo.id === "topological_sort") {
            return Math.random() < 0.35 ? 1 : 0;
          } else {
            return Math.random() < 0.25 ? 0 : Math.floor(Math.random() * 15) + 1;
          }
        })
      );
      onInputChange({
        ...inputData,
        matrix: newMatrix
      });
    } else if (algo.id === "kruskal") {
      const numEdges = Math.floor(Math.random() * 3) + 3;
      const edges = [];
      for (let i = 0; i < numEdges; i++) {
        const src = Math.floor(Math.random() * 4);
        let dest = Math.floor(Math.random() * 4);
        while (src === dest) dest = Math.floor(Math.random() * 4);
        const weight = Math.floor(Math.random() * 15) + 1;
        edges.push({ src, dest, weight });
      }
      onInputChange({
        vertices: 4,
        edges
      });
    } else if (algo.id === "knapsack") {
      const numItems = Math.floor(Math.random() * 2) + 3;
      const items = [];
      for (let i = 0; i < numItems; i++) {
        items.push({
          name: `Item ${i + 1}`,
          value: Math.floor(Math.random() * 40) + 10,
          weight: Math.floor(Math.random() * 25) + 10
        });
      }
      onInputChange({
        capacity: Math.floor(Math.random() * 40) + 30,
        items
      });
    }
  };

  // Kruskal Edges manipulation
  const handleEdgeChange = (idx, key, val) => {
    const newEdges = inputData.edges.map((e, index) => {
      if (index === idx) {
        return { ...e, [key]: parseInt(val) || 0 };
      }
      return e;
    });
    onInputChange({ ...inputData, edges: newEdges });
  };

  const addEdge = () => {
    const newEdges = [...(inputData.edges || []), { src: 0, dest: 1, weight: 5 }];
    onInputChange({ ...inputData, edges: newEdges });
  };

  const deleteEdge = (idx) => {
    const newEdges = inputData.edges.filter((_, index) => index !== idx);
    onInputChange({ ...inputData, edges: newEdges });
  };

  // Knapsack Items manipulation
  const handleItemChange = (idx, key, val) => {
    const newItems = inputData.items.map((it, index) => {
      if (index === idx) {
        return { ...it, [key]: key === "name" ? val : parseInt(val) || 0 };
      }
      return it;
    });
    onInputChange({ ...inputData, items: newItems });
  };

  const addItem = () => {
    const newItems = [...(inputData.items || []), { name: `Item ${(inputData.items || []).length + 1}`, value: 10, weight: 10 }];
    onInputChange({ ...inputData, items: newItems });
  };

  const deleteItem = (idx) => {
    const newItems = inputData.items.filter((_, index) => index !== idx);
    onInputChange({ ...inputData, items: newItems });
  };

  const handleCapacityChange = (e) => {
    onInputChange({
      ...inputData,
      capacity: parseInt(e.target.value) || 0
    });
  };

  return (
    <div className="card workspace-card">
      <div className="card-subtitle">Simulation Engine</div>
      <h3 className="card-title">Visual Simulator</h3>
      
      {/* Simulation Controllers */}
      <div className="sim-controls">
        <button
          className={`btn ${isPlaying ? "btn-success" : "btn-primary"}`}
          onClick={onPlayPause}
        >
          {isPlaying ? (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="6" y="4" width="4" height="16" />
                <rect x="14" y="4" width="4" height="16" />
              </svg>
              <span>Pause</span>
            </>
          ) : (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
              <span>Play</span>
            </>
          )}
        </button>
        <button className="btn" onClick={onStepPrev} disabled={stepIdx <= 0}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="19 20 9 12 19 4 19 20" />
            <line x1="5" y1="5" x2="5" y2="19" />
          </svg>
          <span>Prev</span>
        </button>
        <button className="btn" onClick={onStepNext} disabled={stepIdx >= totalSteps - 1}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="5 4 15 12 5 20 5 4" />
            <line x1="19" y1="5" x2="19" y2="19" />
          </svg>
          <span>Next</span>
        </button>
        <button className="btn" onClick={onReset}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
          </svg>
          <span>Reset</span>
        </button>
        
        <div className="speed-slider-container">
          <span>Speed:</span>
          <input
            type="range"
            className="speed-slider"
            min="300"
            max="2500"
            value={speed}
            onChange={(e) => onSpeedChange(parseInt(e.target.value))}
            step="100"
          />
          <span>{(speed / 1000).toFixed(1)}s</span>
        </div>
      </div>

      {/* Editor Block */}
      <div style={{ flex: 1 }}>
        {/* Matrix Editors: Prim, Floyd, Warshall, Dijkstra, Topo */}
        {hasMatrix && inputData.matrix && (
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "1rem", flexWrap: "wrap" }}>
              <div>
                <label style={{ fontSize: "0.85rem", fontWeight: 500, marginRight: "6px" }}>Vertices:</label>
                <select
                  className="btn"
                  style={{ padding: "4px 8px", width: "70px" }}
                  value={inputData.vertices}
                  onChange={handleVerticesChange}
                >
                  <option value={3}>3</option>
                  <option value={4}>4</option>
                  <option value={5}>5</option>
                </select>
              </div>
              
              {algo.id === "dijkstra" && (
                <div>
                  <label style={{ fontSize: "0.85rem", fontWeight: 500, marginRight: "6px" }}>Source Vertex:</label>
                  <select
                    className="btn"
                    style={{ padding: "4px 8px", width: "70px" }}
                    value={inputData.source || 0}
                    onChange={handleSourceChange}
                  >
                    {Array(inputData.vertices).fill(0).map((_, v) => (
                      <option value={v} key={v}>{v}</option>
                    ))}
                  </select>
                </div>
              )}
              
              <button className="btn" onClick={handleRandomize}>Randomize</button>
            </div>
            
            <div className="matrix-grid-scroll">
              <table className="matrix-table">
                <thead>
                  <tr>
                    <td className="hdr"></td>
                    {Array(inputData.vertices).fill(0).map((_, col) => (
                      <td className="hdr" key={col}>{col}</td>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {inputData.matrix.map((row, r) => (
                    <tr key={r}>
                      <td className="hdr">{r}</td>
                      {row.map((cell, c) => {
                        const isDiagonal = r === c;
                        const readOnly = isDiagonal && isWeightMatrix;
                        
                        // Fetch visual cell styles from active step
                        let cellStyle = {};
                        if (step && step.matrix && step.matrix[r]) {
                          const stepVal = step.matrix[r][c];
                          
                          // Highlights from Floyd/Warshall checks
                          if (step.highlightCells) {
                            const { i: hi, j: hj, k: hk } = step.highlightCells;
                            if (r === hi && c === hj) {
                              cellStyle = { backgroundColor: "var(--success-bg)", color: "var(--success-accent)" };
                            } else if ((r === hi && c === hk) || (r === hk && c === hj)) {
                              cellStyle = { backgroundColor: "var(--info-bg)", color: "var(--info-accent)" };
                            }
                          }
                          
                          // Highlights from Prim edge picks
                          if (step.highlightEdge) {
                            const { src, dest } = step.highlightEdge;
                            if ((r === src && c === dest) || (r === dest && c === src)) {
                              cellStyle = { backgroundColor: "var(--success-bg)", color: "var(--success-accent)" };
                            }
                          }
                        }
                        
                        const displayVal = cell === 99999 ? 0 : cell;

                        return (
                          <td key={c}>
                            <input
                              type="number"
                              className={`cell-input ${cell === 99999 ? "inf" : ""}`}
                              value={displayVal}
                              onChange={(e) => handleCellChange(r, c, e.target.value)}
                              readOnly={readOnly}
                              disabled={isPlaying}
                              style={{
                                ...cellStyle,
                                backgroundColor: readOnly ? "var(--bg-tertiary)" : cellStyle.backgroundColor
                              }}
                            />
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Kruskal Edge List Editor */}
        {algo.id === "kruskal" && inputData.edges && (
          <div>
            <div style={{ marginBottom: "1rem", display: "flex", gap: "8px" }}>
              <button className="btn btn-primary" onClick={addEdge} disabled={isPlaying}>+ Add Edge</button>
              <button className="btn" onClick={handleRandomize} disabled={isPlaying}>Randomize</button>
            </div>
            <div style={{ maxHeight: "180px", overflowY: "auto", border: "1px solid var(--border-primary)", padding: "6px", borderRadius: "var(--radius-sm)", marginBottom: "1.5rem" }}>
              <table style={{ width: "100%", fontSize: "0.9rem", textAlign: "center" }}>
                <thead>
                  <tr style={{ fontWeight: 600, color: "var(--text-secondary)" }}>
                    <th>From (u)</th>
                    <th>To (v)</th>
                    <th>Weight</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {inputData.edges.map((e, idx) => {
                    // Highlight if active edge check
                    let rowStyle = {};
                    if (step && step.highlightEdge) {
                      const { src, dest, picked } = step.highlightEdge;
                      if ((e.src === src && e.dest === dest) || (e.src === dest && e.dest === src)) {
                        rowStyle = { backgroundColor: picked ? "var(--success-bg)" : "var(--danger-bg)" };
                      }
                    }

                    return (
                      <tr key={idx} style={rowStyle}>
                        <td>
                          <input
                            type="number"
                            className="cell-input"
                            style={{ width: "60px", height: "30px" }}
                            value={e.src}
                            onChange={(e) => handleEdgeChange(idx, "src", e.target.value)}
                            disabled={isPlaying}
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            className="cell-input"
                            style={{ width: "60px", height: "30px" }}
                            value={e.dest}
                            onChange={(e) => handleEdgeChange(idx, "dest", e.target.value)}
                            disabled={isPlaying}
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            className="cell-input"
                            style={{ width: "60px", height: "30px" }}
                            value={e.weight}
                            onChange={(e) => handleEdgeChange(idx, "weight", e.target.value)}
                            disabled={isPlaying}
                          />
                        </td>
                        <td>
                          <button
                            className="btn"
                            style={{ padding: "2px 8px", color: "var(--danger-accent)", border: "none" }}
                            onClick={() => deleteEdge(idx)}
                            disabled={isPlaying}
                          >
                            ×
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 0/1 Knapsack Items list Editor */}
        {algo.id === "knapsack" && inputData.items && (
          <div>
            <div style={{ display: "flex", gap: "16px", alignItems: "center", marginBottom: "1rem", flexWrap: "wrap" }}>
              <div>
                <label style={{ fontSize: "0.85rem", fontWeight: 500, marginRight: "6px" }}>Knapsack Capacity (W):</label>
                <input
                  type="number"
                  className="btn"
                  style={{ width: "70px", padding: "4px 8px", textAlign: "center" }}
                  value={inputData.capacity}
                  onChange={handleCapacityChange}
                  disabled={isPlaying}
                />
              </div>
              <button className="btn btn-primary" onClick={addItem} disabled={isPlaying}>+ Add Item</button>
              <button className="btn" onClick={handleRandomize} disabled={isPlaying}>Randomize</button>
            </div>
            <div style={{ maxHeight: "180px", overflowY: "auto", border: "1px solid var(--border-primary)", padding: "6px", borderRadius: "var(--radius-sm)", marginBottom: "1.5rem" }}>
              <table style={{ width: "100%", fontSize: "0.9rem", textAlign: "center" }}>
                <thead>
                  <tr style={{ fontWeight: 600, color: "var(--text-secondary)" }}>
                    <th>Item Name</th>
                    <th>Value</th>
                    <th>Weight</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {inputData.items.map((it, idx) => (
                    <tr key={idx}>
                      <td>
                        <input
                          type="text"
                          className="cell-input"
                          style={{ width: "100px", height: "30px", textAlign: "left", paddingLeft: "5px" }}
                          value={it.name}
                          onChange={(e) => handleItemChange(idx, "name", e.target.value)}
                          disabled={isPlaying}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          className="cell-input"
                          style={{ width: "60px", height: "30px" }}
                          value={it.value}
                          onChange={(e) => handleItemChange(idx, "value", e.target.value)}
                          disabled={isPlaying}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          className="cell-input"
                          style={{ width: "60px", height: "30px" }}
                          value={it.weight}
                          onChange={(e) => handleItemChange(idx, "weight", e.target.value)}
                          disabled={isPlaying}
                        />
                      </td>
                      <td>
                        <button
                          className="btn"
                          style={{ padding: "2px 8px", color: "var(--danger-accent)", border: "none" }}
                          onClick={() => deleteItem(idx)}
                          disabled={isPlaying}
                        >
                          ×
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Supplemental Visualizations: Dijkstra dist[], Topo Queue, Knapsack DP Grid */}
        {algo.id === "dijkstra" && step && step.dist && (
          <div style={{ marginTop: "1rem", padding: "1rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-primary)", backgroundColor: "var(--bg-tertiary)" }}>
            <div style={{ fontWeight: 600, marginBottom: "8px", fontSize: "0.9rem" }}>Distance Vector dist[] from Source:</div>
            <div className="state-row">
              {step.dist.map((d, idx) => {
                const displayVal = d === 99999 ? "∞" : d;
                const isPicked = step.pickedNode === idx;
                return (
                  <span className={`state-badge ${isPicked ? "success" : ""}`} key={idx}>
                    dist[{idx}] = <strong>{displayVal}</strong>
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {algo.id === "topological_sort" && step && step.indeg && step.queue && step.out && (
          <div style={{ marginTop: "1rem", padding: "1rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-primary)", backgroundColor: "var(--bg-tertiary)", fontSize: "0.9rem" }}>
            <div style={{ marginBottom: "8px" }}>
              <span style={{ fontWeight: 600, color: "var(--text-secondary)" }}>Indegrees:</span>
              <div className="state-row" style={{ marginTop: "4px" }}>
                {step.indeg.map((ind, i) => (
                  <span className={`state-badge ${ind === 0 ? "success" : ""}`} key={i}>
                    indeg[{i}] = {ind}
                  </span>
                ))}
              </div>
            </div>
            <div style={{ marginBottom: "8px" }}>
              <span style={{ fontWeight: 600, color: "var(--text-secondary)" }}>BFS Queue:</span>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.9rem", marginLeft: "8px", background: "var(--bg-secondary)", padding: "2px 8px", borderRadius: "4px", border: "1.5px dashed var(--border-secondary)" }}>
                [{step.queue.join(", ")}]
              </span>
            </div>
            <div>
              <span style={{ fontWeight: 600, color: "var(--text-secondary)" }}>Output List:</span>
              <span style={{ fontWeight: 700, fontSize: "1rem", color: "var(--success-accent)", marginLeft: "8px" }}>
                {step.out.join(" → ") || "Empty"}
              </span>
            </div>
          </div>
        )}

        {algo.id === "knapsack" && step && step.knapTable && (
          <div style={{ marginTop: "1rem", overflowX: "auto" }}>
            <table className="matrix-table" style={{ width: "100%" }}>
              <thead>
                <tr>
                  <td className="hdr">i\w</td>
                  {Array(inputData.capacity + 1).fill(0).map((_, w) => {
                    const W = inputData.capacity;
                    if (W <= 12 || w === 0 || w === W || w % 5 === 0) {
                      return <td className="hdr" key={w}>{w}</td>;
                    }
                    return null;
                  })}
                </tr>
              </thead>
              <tbody>
                {step.knapTable.map((row, i) => (
                  <tr key={i}>
                    <td className="hdr">{i === 0 ? "0 (none)" : `Item ${i}`}</td>
                    {row.map((val, w) => {
                      const W = inputData.capacity;
                      if (W <= 12 || w === 0 || w === W || w % 5 === 0) {
                        let cellStyle = {};
                        if (step.highlightDP) {
                          const { i: hi, w: hw, srcAbove, srcBack } = step.highlightDP;
                          if (i === hi && w === hw) {
                            cellStyle = { backgroundColor: "var(--warning-bg)", color: "var(--warning-accent)", fontWeight: 700 };
                          } else if (srcAbove && i === srcAbove.i && w === srcAbove.w) {
                            cellStyle = { backgroundColor: "var(--info-bg)", color: "var(--info-accent)" };
                          } else if (srcBack && i === srcBack.i && w === srcBack.w) {
                            cellStyle = { backgroundColor: "var(--success-bg)", color: "var(--success-accent)" };
                          }
                        }
                        
                        // Final cells highlight
                        if (i === inputData.items.length && w === W && stepIdx === totalSteps - 1) {
                          cellStyle = { backgroundColor: "var(--success-bg)", color: "var(--success-accent)", fontWeight: 700, border: "2px solid var(--success-accent)" };
                        }

                        return (
                          <td key={w} style={cellStyle}>
                            {val}
                          </td>
                        );
                      }
                      return null;
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* State Badge Panels */}
      <div className="sim-state-panel">
        <div className="state-title">Active Variables State</div>
        <div className="state-row">
          {step && step.badges && step.badges.length > 0 ? (
            step.badges.map((b, idx) => (
              <span className={`state-badge ${b.t}`} key={idx}>
                {b.l}: <strong>{b.v}</strong>
              </span>
            ))
          ) : (
            <span style={{ color: "var(--text-tertiary)", fontSize: "0.85rem" }}>
              {stepIdx === -1 ? "Pre-execution state. Tap Play or Next." : "Idle"}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
