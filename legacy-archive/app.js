// Interactive ADA Lab Companion - Application Engine

// Global State
const state = {
  activeTab: 'dashboard',
  searchQuery: '',
  theme: 'dark',
  aiOpen: false,
  
  // Simulator state
  sim: {
    activeAlgoId: null,
    isPlaying: false,
    currentStepIdx: -1,
    steps: [],
    timerId: null,
    speed: 1000, // ms
    inputData: {} // current user input (matrices, items, etc)
  }
};

// SVG icons helper
const ICONS = {
  play: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>`,
  pause: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>`
};

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
  // Set initial theme
  const savedTheme = localStorage.getItem('ada-theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);
  state.theme = savedTheme;
  updateThemeIcon();
  
  // Set default route
  switchTab('dashboard');
  
  // Setup global event listeners
  document.getElementById('global-search').addEventListener('input', handleGlobalSearch);
  
  // Initialize AI drawer suggestions
  updateAISuggestions();
});

// Theme Management
function toggleTheme() {
  state.theme = state.theme === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', state.theme);
  localStorage.setItem('ada-theme', state.theme);
  updateThemeIcon();
}

function updateThemeIcon() {
  const btn = document.getElementById('theme-btn');
  if (state.theme === 'dark') {
    btn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`;
  } else {
    btn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`;
  }
}

// Navigation / Router
function switchTab(tabId) {
  // Stop running simulation
  stopSimulation();
  
  state.activeTab = tabId;
  
  // Update sidebar links
  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.remove('active');
    // check target active
    const attr = link.getAttribute('onclick');
    if (attr && attr.includes(`'${tabId}'`)) {
      link.classList.add('active');
    }
  });
  
  const dashboardView = document.getElementById('dashboard-view');
  const algoView = document.getElementById('algorithm-view');
  
  if (tabId === 'dashboard') {
    dashboardView.style.display = 'block';
    algoView.style.display = 'none';
    
    document.getElementById('main-heading').textContent = "ADA Lab Companion";
    document.getElementById('main-subheading').textContent = "Choose an experiment or view the general lab dashboard.";
  } else {
    dashboardView.style.display = 'none';
    algoView.style.display = 'block';
    
    const algoData = window.ALGORITHMS_DATA[tabId];
    if (algoData) {
      document.getElementById('main-heading').textContent = algoData.name;
      document.getElementById('main-subheading').textContent = `${algoData.lab} • ${algoData.subtitle}`;
      
      // Load Algorithm Content
      loadAlgorithm(algoData);
    }
  }
  
  updateAISuggestions();
}

// Load Content dynamically based on active algorithm
function loadAlgorithm(algo) {
  state.sim.activeAlgoId = algo.id;
  state.sim.currentStepIdx = -1;
  state.sim.steps = [];
  
  // 1. Render Comparison Cards
  const compGrid = document.getElementById('algo-comparison');
  compGrid.innerHTML = '';
  algo.comparison.forEach(c => {
    compGrid.innerHTML += `
      <div class="comparison-card">
        <div class="comparison-card-title">${c.label}</div>
        <div class="comparison-card-desc">${c.detail}</div>
      </div>
    `;
  });
  
  // 2. Load C Code Walkthrough
  const codeBlock = document.getElementById('code-walkthrough-block');
  codeBlock.innerHTML = '';
  algo.code.forEach((line, index) => {
    const row = document.createElement('div');
    row.className = 'code-line';
    row.id = `code-line-${index}`;
    row.innerHTML = `
      <span class="code-line-num">${index + 1}</span>
      <span class="code-line-text">${escapeHTML(line.c)}</span>
    `;
    row.addEventListener('click', () => highlightCodeLine(index, line.e));
    codeBlock.appendChild(row);
  });
  document.getElementById('code-explain-box').style.display = 'none';
  
  // 3. Load Viva QA Cards
  const vivaList = document.getElementById('viva-questions-list');
  vivaList.innerHTML = '';
  algo.viva.forEach((v, index) => {
    vivaList.innerHTML += `
      <div class="viva-card" id="viva-card-${index}">
        <div class="viva-question" onclick="toggleVivaCard(${index})">
          <span>Q: ${v.q}</span>
        </div>
        <div class="viva-answer">
          ${v.a}
        </div>
      </div>
    `;
  });
  
  // 4. Load Input configuration Workspace
  renderInputEditor(algo);
  
  // 5. Generate Initial Steps
  compileSimulation();
  
  // Trigger UI Reset
  resetSimulation();
}

// Render dynamic matrix editors and inputs based on current algorithm
function renderInputEditor(algo) {
  const container = document.getElementById('input-editor-container');
  container.innerHTML = '';
  
  if (algo.id === 'prim' || algo.id === 'floyd' || algo.id === 'warshall' || algo.id === 'dijkstra' || algo.id === 'topological_sort') {
    const size = algo.defaultInput.vertices;
    const isWeight = algo.id !== 'warshall' && algo.id !== 'topological_sort';
    const isDijkstra = algo.id === 'dijkstra';
    
    // Matrix size controller
    let html = `
      <div style="display:flex; align-items:center; gap:16px; margin-bottom:1rem; flex-wrap:wrap;">
        <div>
          <label style="font-size:0.85rem; font-weight:500; margin-right:6px;">Vertices:</label>
          <select id="vertices-count" class="btn" style="padding:4px 8px; width:70px;" onchange="resizeMatrix()">
            <option value="3" ${size === 3 ? 'selected' : ''}>3</option>
            <option value="4" ${size === 4 ? 'selected' : ''}>4</option>
            <option value="5" ${size === 5 ? 'selected' : ''}>5</option>
          </select>
        </div>
    `;
    
    if (isDijkstra) {
      html += `
        <div>
          <label style="font-size:0.85rem; font-weight:500; margin-right:6px;">Source Vertex:</label>
          <select id="source-vertex" class="btn" style="padding:4px 8px; width:70px;" onchange="compileSimulation()">
            <option value="0">0</option>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
          </select>
        </div>
      `;
    }
    
    html += `
      <button class="btn" onclick="randomizeInputs()">Randomize</button>
      </div>
      <div class="matrix-grid-scroll">
        <table class="matrix-table" id="editor-matrix">
        </table>
      </div>
      <div style="font-size:11px; color:var(--text-tertiary); margin-top:4px;">
        * Click cells to edit edge values. ${isWeight ? 'Use 0 for no direct edge (converted to INF).' : 'Enter 1 for directed connection, 0 for none.'}
      </div>
    `;
    
    container.innerHTML = html;
    drawMatrixGrid(size, algo.defaultInput.matrix);
  } else if (algo.id === 'kruskal') {
    // Kruskal's Edge list editor
    let html = `
      <div style="margin-bottom:1rem; display:flex; gap:8px;">
        <button class="btn btn-primary" onclick="addKruskalEdge()">+ Add Edge</button>
        <button class="btn" onclick="randomizeInputs()">Randomize</button>
      </div>
      <div style="max-height:200px; overflow-y:auto; border:1px solid var(--border-primary); padding:6px; border-radius:var(--radius-sm); margin-bottom:1rem;">
        <table style="width:100%; font-size:0.9rem; text-align:center;" id="kruskal-edges-table">
          <thead>
            <tr style="font-weight:600; color:var(--text-secondary);">
              <th>From (u)</th>
              <th>To (v)</th>
              <th>Weight</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody id="kruskal-edges-body"></tbody>
        </table>
      </div>
      <div style="font-size:11px; color:var(--text-tertiary);">
        * Add/modify edges. Maximum vertices assumed 4 (nodes 0 to 3).
      </div>
    `;
    container.innerHTML = html;
    loadKruskalEdges(algo.defaultInput.edges);
  } else if (algo.id === 'knapsack') {
    // 0/1 Knapsack list editor
    let html = `
      <div style="display:flex; gap:16px; align-items:center; margin-bottom:1rem; flex-wrap:wrap;">
        <div>
          <label style="font-size:0.85rem; font-weight:500; margin-right:6px;">Knapsack Capacity (W):</label>
          <input type="number" id="knap-capacity" class="btn" style="width:70px; padding:4px 8px; text-align:center;" value="${algo.defaultInput.capacity}" onchange="compileSimulation()">
        </div>
        <button class="btn btn-primary" onclick="addKnapsackItem()">+ Add Item</button>
        <button class="btn" onclick="randomizeInputs()">Randomize</button>
      </div>
      <div style="max-height:180px; overflow-y:auto; border:1px solid var(--border-primary); padding:6px; border-radius:var(--radius-sm); margin-bottom:1rem;">
        <table style="width:100%; font-size:0.9rem; text-align:center;" id="knap-items-table">
          <thead>
            <tr style="font-weight:600; color:var(--text-secondary);">
              <th>Item Name</th>
              <th>Value</th>
              <th>Weight</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody id="knap-items-body"></tbody>
        </table>
      </div>
    `;
    container.innerHTML = html;
    loadKnapsackItems(algo.defaultInput.items);
  }
}

// Matrix Grid Drawer helper
function drawMatrixGrid(size, defaultData = null) {
  const table = document.getElementById('editor-matrix');
  table.innerHTML = '';
  
  // Header row
  let headerHTML = '<tr><td class="hdr"></td>';
  for (let i = 0; i < size; i++) {
    headerHTML += `<td class="hdr">${i}</td>`;
  }
  headerHTML += '</tr>';
  table.innerHTML += headerHTML;
  
  // Data rows
  for (let i = 0; i < size; i++) {
    let rowHTML = `<tr><td class="hdr">${i}</td>`;
    for (let j = 0; j < size; j++) {
      let val = 0;
      if (defaultData && defaultData[i] && defaultData[i][j] !== undefined) {
        val = defaultData[i][j];
      }
      // handle diagonal self zeros
      const isWeight = state.sim.activeAlgoId !== 'warshall' && state.sim.activeAlgoId !== 'topological_sort';
      const readOnly = i === j && isWeight ? 'readonly style="background-color: var(--bg-tertiary);"' : '';
      const stepVal = i === j && isWeight ? 0 : val;
      const displayVal = stepVal === 99999 ? 0 : stepVal; // display 0 for INF in input grid
      
      rowHTML += `<td><input type="number" class="cell-input" id="cell-${i}-${j}" value="${displayVal}" min="0" max="999" ${readOnly} onchange="compileSimulation()"></td>`;
    }
    rowHTML += '</tr>';
    table.innerHTML += rowHTML;
  }
}

// DSU Edge Editor
function loadKruskalEdges(edges) {
  const tbody = document.getElementById('kruskal-edges-body');
  tbody.innerHTML = '';
  edges.forEach((e, idx) => {
    tbody.innerHTML += `
      <tr id="kr-edge-row-${idx}">
        <td><input type="number" class="cell-input" style="width:50px; height:30px;" value="${e.src}" min="0" max="9" onchange="compileSimulation()"></td>
        <td><input type="number" class="cell-input" style="width:50px; height:30px;" value="${e.dest}" min="0" max="9" onchange="compileSimulation()"></td>
        <td><input type="number" class="cell-input" style="width:50px; height:30px;" value="${e.weight}" min="1" max="999" onchange="compileSimulation()"></td>
        <td><button class="btn" style="padding:2px 8px; color:var(--danger-accent);" onclick="deleteKruskalEdge(${idx})">×</button></td>
      </tr>
    `;
  });
}

function addKruskalEdge() {
  const tbody = document.getElementById('kruskal-edges-body');
  const idx = tbody.children.length;
  tbody.innerHTML += `
    <tr id="kr-edge-row-${idx}">
      <td><input type="number" class="cell-input" style="width:50px; height:30px;" value="0" min="0" max="9" onchange="compileSimulation()"></td>
      <td><input type="number" class="cell-input" style="width:50px; height:30px;" value="1" min="0" max="9" onchange="compileSimulation()"></td>
      <td><input type="number" class="cell-input" style="width:50px; height:30px;" value="5" min="1" max="999" onchange="compileSimulation()"></td>
      <td><button class="btn" style="padding:2px 8px; color:var(--danger-accent);" onclick="deleteKruskalEdge(${idx})">×</button></td>
    </tr>
  `;
  compileSimulation();
}

function deleteKruskalEdge(idx) {
  const row = document.getElementById(`kr-edge-row-${idx}`);
  if (row) row.remove();
  compileSimulation();
}

// Knapsack List Editor
function loadKnapsackItems(items) {
  const tbody = document.getElementById('knap-items-body');
  tbody.innerHTML = '';
  items.forEach((it, idx) => {
    tbody.innerHTML += `
      <tr id="kn-item-row-${idx}">
        <td><input type="text" class="cell-input" style="width:80px; height:30px; text-align:left; padding-left:5px;" value="${it.name}" onchange="compileSimulation()"></td>
        <td><input type="number" class="cell-input" style="width:60px; height:30px;" value="${it.value}" min="1" onchange="compileSimulation()"></td>
        <td><input type="number" class="cell-input" style="width:60px; height:30px;" value="${it.weight}" min="1" onchange="compileSimulation()"></td>
        <td><button class="btn" style="padding:2px 8px; color:var(--danger-accent);" onclick="deleteKnapsackItem(${idx})">×</button></td>
      </tr>
    `;
  });
}

function addKnapsackItem() {
  const tbody = document.getElementById('knap-items-body');
  const idx = tbody.children.length;
  tbody.innerHTML += `
    <tr id="kn-item-row-${idx}">
      <td><input type="text" class="cell-input" style="width:80px; height:30px; text-align:left; padding-left:5px;" value="Item ${idx+1}" onchange="compileSimulation()"></td>
      <td><input type="number" class="cell-input" style="width:60px; height:30px;" value="10" min="1" onchange="compileSimulation()"></td>
      <td><input type="number" class="cell-input" style="width:60px; height:30px;" value="10" min="1" onchange="compileSimulation()"></td>
      <td><button class="btn" style="padding:2px 8px; color:var(--danger-accent);" onclick="deleteKnapsackItem(${idx})">×</button></td>
    </tr>
  `;
  compileSimulation();
}

function deleteKnapsackItem(idx) {
  const row = document.getElementById(`kn-item-row-${idx}`);
  if (row) row.remove();
  compileSimulation();
}

// Resize matrix grid helper
function resizeMatrix() {
  const select = document.getElementById('vertices-count');
  const size = parseInt(select.value);
  
  // Re-load default source select if dijkstra
  const srcSelect = document.getElementById('source-vertex');
  if (srcSelect) {
    srcSelect.innerHTML = '';
    for (let i = 0; i < size; i++) {
      srcSelect.innerHTML += `<option value="${i}">${i}</option>`;
    }
  }
  
  drawMatrixGrid(size);
  compileSimulation();
}

// Randomize Grid Inputs
function randomizeInputs() {
  const algoId = state.sim.activeAlgoId;
  
  if (algoId === 'prim' || algoId === 'floyd' || algoId === 'warshall' || algoId === 'dijkstra' || algoId === 'topological_sort') {
    const select = document.getElementById('vertices-count');
    const size = parseInt(select.value);
    const isWeight = algoId !== 'warshall' && algoId !== 'topological_sort';
    
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        const input = document.getElementById(`cell-${i}-${j}`);
        if (input) {
          if (i === j) {
            input.value = 0;
          } else {
            if (isWeight) {
              // weight: some 0s, mostly 1 to 20
              const randVal = Math.random() < 0.25 ? 0 : Math.floor(Math.random() * 15) + 1;
              input.value = randVal;
            } else {
              // binary: mostly 0 or 1
              const randVal = Math.random() < 0.35 ? 1 : 0;
              input.value = randVal;
            }
          }
        }
      }
    }
  } else if (algoId === 'kruskal') {
    const tbody = document.getElementById('kruskal-edges-body');
    tbody.innerHTML = '';
    const numEdges = Math.floor(Math.random() * 3) + 3; // 3 to 5 edges
    for (let i = 0; i < numEdges; i++) {
      const u = Math.floor(Math.random() * 4);
      let v = Math.floor(Math.random() * 4);
      while (u === v) { v = Math.floor(Math.random() * 4); }
      const w = Math.floor(Math.random() * 15) + 1;
      tbody.innerHTML += `
        <tr id="kr-edge-row-${i}">
          <td><input type="number" class="cell-input" style="width:50px; height:30px;" value="${u}" min="0" max="9" onchange="compileSimulation()"></td>
          <td><input type="number" class="cell-input" style="width:50px; height:30px;" value="${v}" min="0" max="9" onchange="compileSimulation()"></td>
          <td><input type="number" class="cell-input" style="width:50px; height:30px;" value="${w}" min="1" max="999" onchange="compileSimulation()"></td>
          <td><button class="btn" style="padding:2px 8px; color:var(--danger-accent);" onclick="deleteKruskalEdge(${i})">×</button></td>
        </tr>
      `;
    }
  } else if (algoId === 'knapsack') {
    const tbody = document.getElementById('knap-items-body');
    tbody.innerHTML = '';
    const numItems = Math.floor(Math.random() * 2) + 3; // 3 or 4 items
    for (let i = 0; i < numItems; i++) {
      const val = Math.floor(Math.random() * 40) + 10;
      const wt = Math.floor(Math.random() * 25) + 10;
      tbody.innerHTML += `
        <tr id="kn-item-row-${i}">
          <td><input type="text" class="cell-input" style="width:80px; height:30px; text-align:left; padding-left:5px;" value="Item ${i+1}" onchange="compileSimulation()"></td>
          <td><input type="number" class="cell-input" style="width:60px; height:30px;" value="${val}" min="1" onchange="compileSimulation()"></td>
          <td><input type="number" class="cell-input" style="width:60px; height:30px;" value="${wt}" min="1" onchange="compileSimulation()"></td>
          <td><button class="btn" style="padding:2px 8px; color:var(--danger-accent);" onclick="deleteKnapsackItem(${i})">×</button></td>
        </tr>
      `;
    }
    document.getElementById('knap-capacity').value = Math.floor(Math.random() * 40) + 30; // 30 to 70
  }
  
  compileSimulation();
}

// Reads input structures from HTML fields
function gatherInputs() {
  const algoId = state.sim.activeAlgoId;
  const data = {};
  
  if (algoId === 'prim' || algoId === 'floyd' || algoId === 'warshall' || algoId === 'dijkstra' || algoId === 'topological_sort') {
    const select = document.getElementById('vertices-count');
    if (!select) return null;
    const size = parseInt(select.value);
    data.vertices = size;
    
    data.matrix = [];
    const isWeight = algoId !== 'warshall' && algoId !== 'topological_sort';
    
    for (let i = 0; i < size; i++) {
      data.matrix[i] = [];
      for (let j = 0; j < size; j++) {
        const input = document.getElementById(`cell-${i}-${j}`);
        let val = input ? parseInt(input.value) || 0 : 0;
        
        // Convert input 0 to INF (99999) if it represents weights
        if (isWeight && i !== j && val === 0) {
          val = 99999; 
        }
        data.matrix[i][j] = val;
      }
    }
    
    if (algoId === 'dijkstra') {
      const srcSelect = document.getElementById('source-vertex');
      data.source = srcSelect ? parseInt(srcSelect.value) || 0 : 0;
    }
  } else if (algoId === 'kruskal') {
    data.edges = [];
    const tableBody = document.getElementById('kruskal-edges-body');
    if (tableBody) {
      let maxNode = 0;
      Array.from(tableBody.children).forEach(row => {
        const inputs = row.querySelectorAll('input');
        if (inputs.length >= 3) {
          const src = parseInt(inputs[0].value) || 0;
          const dest = parseInt(inputs[1].value) || 0;
          const weight = parseInt(inputs[2].value) || 1;
          data.edges.push({ src, dest, weight });
          maxNode = Math.max(maxNode, src, dest);
        }
      });
      data.vertices = maxNode + 1;
    }
  } else if (algoId === 'knapsack') {
    data.items = [];
    data.capacity = parseInt(document.getElementById('knap-capacity').value) || 0;
    const tableBody = document.getElementById('knap-items-body');
    if (tableBody) {
      Array.from(tableBody.children).forEach(row => {
        const inputs = row.querySelectorAll('input');
        if (inputs.length >= 3) {
          data.items.push({
            name: inputs[0].value || 'Item',
            value: parseInt(inputs[1].value) || 1,
            weight: parseInt(inputs[2].value) || 1
          });
        }
      });
    }
  }
  
  state.sim.inputData = data;
  return data;
}

// ----------------------------------------------------
// SIMULATION COMPILER: Dynamic generation of step traces
// ----------------------------------------------------
function compileSimulation() {
  const inputs = gatherInputs();
  if (!inputs) return;
  
  const algoId = state.sim.activeAlgoId;
  const steps = [];
  
  if (algoId === 'prim') {
    compilePrim(inputs, steps);
  } else if (algoId === 'kruskal') {
    compileKruskal(inputs, steps);
  } else if (algoId === 'floyd') {
    compileFloyd(inputs, steps);
  } else if (algoId === 'warshall') {
    compileWarshall(inputs, steps);
  } else if (algoId === 'dijkstra') {
    compileDijkstra(inputs, steps);
  } else if (algoId === 'topological_sort') {
    compileTopologicalSort(inputs, steps);
  } else if (algoId === 'knapsack') {
    compileKnapsack(inputs, steps);
  }
  
  state.sim.steps = steps;
  state.sim.currentStepIdx = -1;
  resetSimulation();
}

// 1. Prim's Simulation compiler
function compilePrim(data, steps) {
  const V = data.vertices;
  const cost = JSON.parse(JSON.stringify(data.matrix));
  const visited = new Array(V).fill(0);
  
  // Step 1: Definition & Arrays Init
  steps.push({
    lineIdx: 0,
    traceText: `Initialized visited array to 0. Number of nodes = ${V}.`,
    badges: [{ l: 'visited', v: visited.join(','), t: 'tertiary' }],
    matrix: JSON.parse(JSON.stringify(cost))
  });
  
  // Step 2: Initialize total cost & INF replacement
  steps.push({
    lineIdx: 6,
    traceText: "Calculated input cost matrix. Replaced cells of 0 with INF (99999) to indicate no edges.",
    badges: [{ l: 'mincost', v: '0', t: 'tertiary' }],
    matrix: JSON.parse(JSON.stringify(cost))
  });
  
  // Step 3: Visited 0 = 1
  visited[0] = 1;
  steps.push({
    lineIdx: 8,
    traceText: "Started MST from vertex 0. Marked visited[0] = 1.",
    badges: [
      { l: 'visited', v: visited.map((v, i) => `${i}:${v}`).join(' | '), t: 'primary' },
      { l: 'mincost', v: '0', t: 'tertiary' }
    ],
    matrix: JSON.parse(JSON.stringify(cost))
  });
  
  let mincost = 0;
  
  // Choose V-1 edges
  for (let edge = 1; edge < V; edge++) {
    steps.push({
      lineIdx: 9,
      traceText: `[Edge Pick Loop] Choosing edge number ${edge} out of ${V-1}. Resetting search variables.`,
      badges: [
        { l: 'edge', v: edge, t: 'warning' },
        { l: 'visited', v: visited.map((v, i) => `${i}:${v}`).join(' | '), t: 'primary' }
      ],
      matrix: JSON.parse(JSON.stringify(cost))
    });
    
    let min = 99999;
    let a = -1, b = -1;
    
    // Loop crossing edges
    for (let i = 0; i < V; i++) {
      if (visited[i]) {
        for (let j = 0; j < V; j++) {
          if (!visited[j] && cost[i][j] < min) {
            min = cost[i][j];
            a = i;
            b = j;
          }
        }
      }
    }
    
    if (a !== -1 && b !== -1) {
      mincost += min;
      visited[b] = 1;
      
      steps.push({
        lineIdx: 15,
        traceText: `Greedily selected the cheapest edge connecting MST: ${a} --> ${b} with weight ${min}.`,
        badges: [
          { l: 'edge picked', v: `${a}-${b}`, t: 'success' },
          { l: 'weight', v: min, t: 'success' },
          { l: 'mincost', v: mincost, t: 'primary' }
        ],
        highlightEdge: { src: a, dest: b },
        matrix: JSON.parse(JSON.stringify(cost))
      });
    } else {
      steps.push({
        lineIdx: 19,
        traceText: "Graph is disconnected! Spanning tree selection failed.",
        badges: [{ l: 'error', v: 'disconnected', t: 'danger' }],
        matrix: JSON.parse(JSON.stringify(cost))
      });
      break;
    }
  }
  
  steps.push({
    lineIdx: 21,
    traceText: `MST completed successfully! Total Minimum Cost is ${mincost}.`,
    badges: [{ l: 'Final Cost', v: mincost, t: 'success' }],
    matrix: JSON.parse(JSON.stringify(cost))
  });
}

// 2. Kruskal's Simulation compiler
function compileKruskal(data, steps) {
  const edges = JSON.parse(JSON.stringify(data.edges));
  const V = data.vertices;
  const parent = [];
  
  steps.push({
    lineIdx: 0,
    traceText: "Defined Edge structure and parent array. Gathering inputs.",
    badges: [{ l: 'EdgesCount', v: edges.length, t: 'tertiary' }]
  });
  
  // Step 2: Sort Edges
  edges.sort((a, b) => a.weight - b.weight);
  steps.push({
    lineIdx: 15,
    traceText: `Sorted all edges by weight in ascending order: ${edges.map(e => `${e.src}-${e.dest}(${e.weight})`).join(', ')}.`,
    badges: [{ l: 'Cheapest', v: edges.length > 0 ? `${edges[0].src}-${edges[0].dest}` : 'None', t: 'primary' }]
  });
  
  // Step 3: DSU Init
  for (let i = 0; i < V; i++) parent[i] = i;
  steps.push({
    lineIdx: 16,
    traceText: `Initialized parent array for Union-Find: each vertex is its own representative set.`,
    badges: [{ l: 'parents', v: parent.map((p, idx) => `${idx}:${p}`).join(', '), t: 'primary' }]
  });
  
  // Find & Unite helper logic
  const find = (i) => {
    let root = i;
    while (parent[root] !== root) {
      root = parent[root];
    }
    // Path compression
    let curr = i;
    while (curr !== root) {
      let next = parent[curr];
      parent[curr] = root;
      curr = next;
    }
    return root;
  };
  
  const unite = (x, y) => {
    parent[find(x)] = find(y);
  };
  
  let minCost = 0;
  let edgesPicked = 0;
  
  for (let i = 0; i < edges.length; i++) {
    const e = edges[i];
    const u = e.src;
    const v = e.dest;
    
    steps.push({
      lineIdx: 17,
      traceText: `Inspecting next cheapest edge: ${u} -- ${v} with weight ${e.weight}.`,
      badges: [
        { l: 'evaluating', v: `${u}-${v}(${e.weight})`, t: 'warning' },
        { l: 'parent[]', v: parent.map((p, idx) => `${idx}:${p}`).join(', '), t: 'tertiary' }
      ]
    });
    
    const rootU = find(u);
    const rootV = find(v);
    
    if (rootU !== rootV) {
      minCost += e.weight;
      unite(u, v);
      edgesPicked++;
      
      steps.push({
        lineIdx: 20,
        traceText: `Success: Root sets differ (find(${u})=${rootU}, find(${v})=${rootV}). No cycle. Edge included!`,
        badges: [
          { l: 'added', v: `${u}-${v}`, t: 'success' },
          { l: 'new parent[]', v: parent.map((p, idx) => `${idx}:${p}`).join(', '), t: 'primary' },
          { l: 'total cost', v: minCost, t: 'success' }
        ],
        highlightEdge: { src: u, dest: v, picked: true }
      });
      
      if (edgesPicked === V - 1) {
        steps.push({
          lineIdx: 22,
          traceText: `MST holds exactly V-1 (${V-1}) edges now. Spanning is complete!`,
          badges: [{ l: 'MST Cost', v: minCost, t: 'success' }]
        });
        break;
      }
    } else {
      steps.push({
        lineIdx: 22,
        traceText: `Skipped: Root sets are identical (find(${u})=${rootU}, find(${v})=${rootV}). Including this edge forms a CYCLE!`,
        badges: [
          { l: 'skipped', v: `${u}-${v}`, t: 'danger' }
        ],
        highlightEdge: { src: u, dest: v, picked: false }
      });
    }
  }
}

// 3. Floyd's Simulation compiler
function compileFloyd(data, steps) {
  const V = data.vertices;
  const dist = JSON.parse(JSON.stringify(data.matrix));
  
  steps.push({
    lineIdx: 0,
    traceText: `Initialized All-Pairs matrix. Number of vertices = ${V}.`,
    badges: [{ l: 'vertices', v: V, t: 'tertiary' }],
    matrix: JSON.parse(JSON.stringify(dist))
  });
  
  // Triple Loop execution snapshots
  for (let k = 0; k < V; k++) {
    steps.push({
      lineIdx: 5,
      traceText: `[Intermediate Node k = ${k}] Evaluating routing paths going through vertex ${k}.`,
      badges: [{ l: 'intermediate k', v: k, t: 'warning' }],
      matrix: JSON.parse(JSON.stringify(dist))
    });
    
    for (let i = 0; i < V; i++) {
      for (let j = 0; j < V; j++) {
        if (i === j) continue;
        
        const throughCost = dist[i][k] + dist[k][j];
        if (throughCost < dist[i][j]) {
          const oldVal = dist[i][j] === 99999 ? 'INF' : dist[i][j];
          dist[i][j] = throughCost;
          
          steps.push({
            lineIdx: 9,
            traceText: `Updated dist[${i}][${j}]: Routing through ${k} is shorter: path (${i}->${k}->${j}) cost ${throughCost} < ${oldVal}.`,
            badges: [
              { l: 'updated', v: `${i}->${j}`, t: 'success' },
              { l: 'new cost', v: throughCost, t: 'success' }
            ],
            highlightCells: { i, j, k },
            matrix: JSON.parse(JSON.stringify(dist))
          });
        }
      }
    }
  }
  
  steps.push({
    lineIdx: 10,
    traceText: "All iterations completed. Matrix shows final shortest path distances between all pairs.",
    badges: [{ l: 'status', v: 'finished', t: 'success' }],
    matrix: JSON.parse(JSON.stringify(dist))
  });
}

// 4. Warshall's Simulation compiler
function compileWarshall(data, steps) {
  const V = data.vertices;
  const g = JSON.parse(JSON.stringify(data.matrix));
  
  steps.push({
    lineIdx: 0,
    traceText: `Initialized reachability matrix from inputs. Number of vertices = ${V}.`,
    badges: [{ l: 'vertices', v: V, t: 'tertiary' }],
    matrix: JSON.parse(JSON.stringify(g))
  });
  
  for (let k = 0; k < V; k++) {
    steps.push({
      lineIdx: 5,
      traceText: `[Intermediate Node k = ${k}] Evaluating transitive connectivity through vertex ${k}.`,
      badges: [{ l: 'intermediate k', v: k, t: 'warning' }],
      matrix: JSON.parse(JSON.stringify(g))
    });
    
    for (let i = 0; i < V; i++) {
      for (let j = 0; j < V; j++) {
        if (g[i][j] === 0 && (g[i][k] && g[k][j])) {
          g[i][j] = 1;
          steps.push({
            lineIdx: 8,
            traceText: `Discovered connection: Node ${i} can reach Node ${j} via intermediate Node ${k} (i->k and k->j are reachable).`,
            badges: [
              { l: 'new path', v: `${i}→${j}`, t: 'success' }
            ],
            highlightCells: { i, j, k },
            matrix: JSON.parse(JSON.stringify(g))
          });
        }
      }
    }
  }
  
  steps.push({
    lineIdx: 9,
    traceText: "Reachability analysis finished. Transitive closure matrix fully computed.",
    badges: [{ l: 'status', v: 'finished', t: 'success' }],
    matrix: JSON.parse(JSON.stringify(g))
  });
}

// 5. Dijkstra's Simulation compiler
function compileDijkstra(data, steps) {
  const V = data.vertices;
  const src = data.source;
  const cost = JSON.parse(JSON.stringify(data.matrix));
  
  const dist = [];
  const visited = new Array(V).fill(0);
  
  steps.push({
    lineIdx: 0,
    traceText: `Initialized arrays. Total vertices = ${V}. Chosen source vertex = ${src}.`,
    badges: [
      { l: 'source', v: src, t: 'primary' },
      { l: 'visited', v: visited.join(','), t: 'tertiary' }
    ],
    dist: new Array(V).fill('INF')
  });
  
  // Copy source row to initialize dist
  for (let i = 0; i < V; i++) {
    dist[i] = cost[src][i];
  }
  
  steps.push({
    lineIdx: 6,
    traceText: `Initial estimates: copied row of source vertex ${src} into dist[].`,
    badges: [{ l: 'dist[]', v: dist.map((d, i) => `${i}:${d === 99999 ? 'INF' : d}`).join(', '), t: 'primary' }],
    dist: [...dist]
  });
  
  dist[src] = 0;
  visited[src] = 1;
  
  steps.push({
    lineIdx: 7,
    traceText: "Source self-distance set to 0. Marked source as visited/finalized.",
    badges: [
      { l: 'visited', v: visited.map((v, i) => `${i}:${v}`).join(' | '), t: 'primary' },
      { l: 'dist[]', v: dist.map((d, i) => `${i}:${d === 99999 ? 'INF' : d}`).join(', '), t: 'success' }
    ],
    dist: [...dist]
  });
  
  // V-2 main loop
  for (let c = 1; c < V - 1; c++) {
    steps.push({
      lineIdx: 8,
      traceText: `[Step ${c}] Starting search for next minimum unvisited vertex.`,
      badges: [{ l: 'round', v: c, t: 'warning' }],
      dist: [...dist]
    });
    
    let min = 99999;
    let u = -1;
    
    for (let i = 0; i < V; i++) {
      if (!visited[i] && dist[i] < min) {
        min = dist[i];
        u = i;
      }
    }
    
    if (u === -1) {
      steps.push({
        lineIdx: 11,
        traceText: "No more reachable unvisited vertices. Halting.",
        badges: [{ l: 'unreachable', v: 'yes', t: 'danger' }],
        dist: [...dist]
      });
      break;
    }
    
    visited[u] = 1;
    steps.push({
      lineIdx: 12,
      traceText: `Greedily selected closest unvisited vertex u = ${u} (min dist = ${min}). Finalizing its path.`,
      badges: [
        { l: 'finalized u', v: u, t: 'success' },
        { l: 'dist[u]', v: min, t: 'success' },
        { l: 'visited', v: visited.map((v, i) => `${i}:${v}`).join(' | '), t: 'primary' }
      ],
      dist: [...dist],
      pickedNode: u
    });
    
    // Relax neighbors
    for (let i = 0; i < V; i++) {
      if (!visited[i] && cost[u][i] !== 99999) {
        const altDist = min + cost[u][i];
        steps.push({
          lineIdx: 14,
          traceText: `Checking neighbor ${i}: direct cost via ${u} is dist[${u}] (${min}) + weight (${cost[u][i]}) = ${altDist}. Current dist[${i}] = ${dist[i] === 99999 ? 'INF' : dist[i]}.`,
          badges: [{ l: 'relaxing neighbor', v: i, t: 'warning' }],
          dist: [...dist]
        });
        
        if (altDist < dist[i]) {
          dist[i] = altDist;
          steps.push({
            lineIdx: 15,
            traceText: `Updated dist[${i}] = ${altDist}. Discovered shorter route through vertex ${u}.`,
            badges: [
              { l: 'updated node', v: i, t: 'success' },
              { l: 'new dist', v: altDist, t: 'success' }
            ],
            dist: [...dist]
          });
        }
      }
    }
  }
  
  steps.push({
    lineIdx: 17,
    traceText: "All shortest paths finalized.",
    badges: [{ l: 'dist[] final', v: dist.map((d, i) => `${i}:${d === 99999 ? 'INF' : d}`).join(', '), t: 'success' }],
    dist: [...dist]
  });
}

// 6. Topological Sort Simulation compiler
function compileTopologicalSort(data, steps) {
  const V = data.vertices;
  const adj = JSON.parse(JSON.stringify(data.matrix));
  const indeg = new Array(V).fill(0);
  
  steps.push({
    lineIdx: 0,
    traceText: "Initialized indegree counts and BFS topological queue structure.",
    badges: [{ l: 'vertices', v: V, t: 'tertiary' }],
    indeg: [...indeg],
    queue: [],
    out: []
  });
  
  // Calculate Indegrees
  for (let i = 0; i < V; i++) {
    for (let j = 0; j < V; j++) {
      if (adj[i][j] === 1) {
        indeg[j]++;
      }
    }
  }
  
  steps.push({
    lineIdx: 12,
    traceText: `Pass 1 complete: scanned adjacency matrix and computed indegree counts.`,
    badges: [{ l: 'computed indeg[]', v: indeg.map((val, idx) => `${idx}:${val}`).join(', '), t: 'primary' }],
    indeg: [...indeg],
    queue: [],
    out: []
  });
  
  // Find indegree 0 nodes
  const queue = [];
  let rear = 0;
  for (let i = 0; i < V; i++) {
    if (indeg[i] === 0) {
      queue.push(i);
      rear++;
    }
  }
  
  steps.push({
    lineIdx: 14,
    traceText: `Pass 2 complete: identified starting nodes (indegree = 0) and added them to queue: [${queue.join(',')}].`,
    badges: [
      { l: 'queue', v: `[${queue.join(', ')}]`, t: 'success' },
      { l: 'indeg[]', v: indeg.map((val, idx) => `${idx}:${val}`).join(', '), t: 'tertiary' }
    ],
    indeg: [...indeg],
    queue: [...queue],
    out: []
  });
  
  const out = [];
  let count = 0;
  let front = 0;
  
  while (front < queue.length) {
    const v = queue[front++];
    out.push(v);
    count++;
    
    steps.push({
      lineIdx: 16,
      traceText: `Dequeued Node ${v} (has no remaining dependencies). Appended to topological order.`,
      badges: [
        { l: 'processed v', v: v, t: 'warning' },
        { l: 'current order', v: out.join('→'), t: 'success' },
        { l: 'queue', v: `[${queue.slice(front).join(', ')}]`, t: 'tertiary' }
      ],
      indeg: [...indeg],
      queue: [...queue],
      out: [...out]
    });
    
    // Decrement neighbors
    for (let i = 0; i < V; i++) {
      if (adj[v][i] === 1) {
        indeg[i]--;
        
        steps.push({
          lineIdx: 19,
          traceText: `Decrementing neighbor dependency: edge ${v}→${i} resolved. indeg[${i}] becomes ${indeg[i]}.`,
          badges: [{ l: 'indeg[]', v: indeg.map((val, idx) => `${idx}:${val}`).join(', '), t: 'tertiary' }],
          indeg: [...indeg],
          queue: [...queue],
          out: [...out]
        });
        
        if (indeg[i] === 0) {
          queue.push(i);
          steps.push({
            lineIdx: 21,
            traceText: `Neighbor ${i} now has no remaining dependencies (indegree hit 0). Enqueued!`,
            badges: [{ l: 'queue updated', v: `[${queue.slice(front).join(', ')}]`, t: 'success' }],
            indeg: [...indeg],
            queue: [...queue],
            out: [...out]
          });
        }
      }
    }
  }
  
  if (count !== V) {
    steps.push({
      lineIdx: 23,
      traceText: `CYCLE DETECTED! Sorted only ${count} nodes out of ${V}. A cycle exists, topological sort impossible.`,
      badges: [{ l: 'error', v: 'cycle', t: 'danger' }],
      indeg: [...indeg],
      queue: [...queue],
      out: [...out]
    });
  } else {
    steps.push({
      lineIdx: 22,
      traceText: `Completed! Processed all ${V} nodes. Valid Topological Order: ${out.join(' → ')}.`,
      badges: [{ l: 'final order', v: out.join('→'), t: 'success' }],
      indeg: [...indeg],
      queue: [...queue],
      out: [...out]
    });
  }
}

// 7. 0/1 Knapsack Simulation compiler
function compileKnapsack(data, steps) {
  const items = JSON.parse(JSON.stringify(data.items));
  const W = data.capacity;
  const n = items.length;
  
  steps.push({
    lineIdx: 1,
    traceText: `Initialized Knapsack: capacity W = ${W}, total items = ${n}.`,
    badges: [{ l: 'W', v: W, t: 'tertiary' }, { l: 'items', v: n, t: 'tertiary' }]
  });
  
  // Setup table
  const knap = [];
  for (let i = 0; i <= n; i++) {
    knap[i] = new Array(W + 1).fill(0);
  }
  
  steps.push({
    lineIdx: 2,
    traceText: `Created DP table of size (${n}+1) × (${W}+1) cells.`,
    badges: [],
    knapTable: JSON.parse(JSON.stringify(knap))
  });
  
  // Fill base cases row 0 and col 0 (implied in grid as 0, but show trace)
  steps.push({
    lineIdx: 7,
    traceText: "Anchored base cases: row 0 (0 items) and column 0 (0 capacity) filled with 0s.",
    badges: [],
    knapTable: JSON.parse(JSON.stringify(knap))
  });
  
  for (let i = 1; i <= n; i++) {
    const item = items[i - 1];
    
    steps.push({
      lineIdx: 3,
      traceText: `[Item ${i}] Evaluating '${item.name}' (value=${item.value}, weight=${item.weight}).`,
      badges: [{ l: 'current item', v: `${item.name}`, t: 'warning' }],
      knapTable: JSON.parse(JSON.stringify(knap))
    });
    
    for (let w = 1; w <= W; w++) {
      if (item.weight <= w) {
        const take = item.value + knap[i - 1][w - item.weight];
        const skip = knap[i - 1][w];
        const res = Math.max(take, skip);
        knap[i][w] = res;
        
        // Tracing changes for representative capacities to keep log lengths reasonable
        // (Log capacity every 10 units or boundary values)
        if (w === W || w % 10 === 0) {
          steps.push({
            lineIdx: 9,
            traceText: `Evaluating knap[${i}][${w}]: item fits. Option A (take) = ${take}. Option B (skip) = ${skip}. Max chosen = ${res}.`,
            badges: [{ l: 'decision', v: take > skip ? 'TAKE' : 'SKIP', t: 'success' }],
            highlightDP: { i, w, srcAbove: { i: i - 1, w }, srcBack: { i: i - 1, w: w - item.weight } },
            knapTable: JSON.parse(JSON.stringify(knap))
          });
        }
      } else {
        knap[i][w] = knap[i - 1][w];
        if (w === W || w % 10 === 0) {
          steps.push({
            lineIdx: 12,
            traceText: `Evaluating knap[${i}][${w}]: Item too heavy (${item.weight} > ${w}). Forced to skip. Value = ${knap[i][w]}.`,
            badges: [{ l: 'decision', v: 'SKIP (Forced)', t: 'danger' }],
            highlightDP: { i, w, srcAbove: { i: i - 1, w } },
            knapTable: JSON.parse(JSON.stringify(knap))
          });
        }
      }
    }
  }
  
  steps.push({
    lineIdx: 14,
    traceText: `DP calculation completed! Maximum value achievable in capacity ${W} is ${knap[n][W]}.`,
    badges: [{ l: 'Max Profit', v: knap[n][W], t: 'success' }],
    knapTable: JSON.parse(JSON.stringify(knap))
  });
}

// ----------------------------------------------------
// PLAYBACK ENGINE
// ----------------------------------------------------
function resetSimulation() {
  stopSimulation();
  state.sim.currentStepIdx = -1;
  updatePlaybackUI();
  
  // Clear timeline
  document.getElementById('steps-timeline').innerHTML = '';
  
  // Remove highlighted code line
  document.querySelectorAll('.code-line').forEach(l => l.classList.remove('active'));
  document.getElementById('code-explain-box').style.display = 'none';
  
  // Trigger rendering of initial visualizer state
  renderVisualStep();
}

function playPauseSimulation() {
  if (state.sim.isPlaying) {
    stopSimulation();
  } else {
    // If completed, loop back to start
    if (state.sim.currentStepIdx >= state.sim.steps.length - 1) {
      state.sim.currentStepIdx = -1;
      document.getElementById('steps-timeline').innerHTML = '';
    }
    
    state.sim.isPlaying = true;
    document.getElementById('btn-play-pause').innerHTML = `${ICONS.pause} <span>Pause</span>`;
    document.getElementById('btn-play-pause').classList.replace('btn-primary', 'btn-success');
    
    playbackLoop();
  }
}

function playbackLoop() {
  if (!state.sim.isPlaying) return;
  
  if (state.sim.currentStepIdx < state.sim.steps.length - 1) {
    stepNext();
    state.sim.timerId = setTimeout(playbackLoop, state.sim.speed);
  } else {
    stopSimulation();
  }
}

function stopSimulation() {
  state.sim.isPlaying = false;
  if (state.sim.timerId) {
    clearTimeout(state.sim.timerId);
    state.sim.timerId = null;
  }
  const btn = document.getElementById('btn-play-pause');
  if (btn) {
    btn.innerHTML = `${ICONS.play} <span>Play</span>`;
    btn.classList.replace('btn-success', 'btn-primary');
  }
}

function stepPrev() {
  if (state.sim.currentStepIdx > 0) {
    state.sim.currentStepIdx--;
    
    // Remove last log node from timeline
    const timeline = document.getElementById('steps-timeline');
    if (timeline.children.length > 0) {
      timeline.removeChild(timeline.lastChild);
    }
    
    renderVisualStep();
    updatePlaybackUI();
  }
}

function stepNext() {
  if (state.sim.currentStepIdx < state.sim.steps.length - 1) {
    state.sim.currentStepIdx++;
    
    const step = state.sim.steps[state.sim.currentStepIdx];
    
    // Append log node
    const timeline = document.getElementById('steps-timeline');
    const stepCard = document.createElement('div');
    stepCard.className = `step-card`;
    if (step.badges && step.badges.some(b => b.t === 'success')) stepCard.classList.add('picked');
    if (step.badges && step.badges.some(b => b.t === 'danger')) stepCard.classList.add('skipped');
    
    stepCard.innerHTML = `
      <div style="font-weight: 600; margin-bottom: 2px;">Step ${state.sim.currentStepIdx + 1}</div>
      <div style="font-size: 0.82rem; color: var(--text-secondary); line-height:1.4;">${step.traceText}</div>
    `;
    timeline.appendChild(stepCard);
    
    // Scroll logs to bottom
    timeline.scrollTop = timeline.scrollHeight;
    
    renderVisualStep();
    updatePlaybackUI();
  }
}

function updatePlaybackUI() {
  const prevBtn = document.getElementById('btn-step-prev');
  const nextBtn = document.getElementById('btn-step-next');
  
  if (prevBtn && nextBtn) {
    prevBtn.disabled = state.sim.currentStepIdx <= 0;
    nextBtn.disabled = state.sim.currentStepIdx >= state.sim.steps.length - 1;
  }
}

// Attach control actions
document.getElementById('btn-play-pause').addEventListener('click', playPauseSimulation);
document.getElementById('btn-step-prev').addEventListener('click', stepPrev);
document.getElementById('btn-step-next').addEventListener('click', stepNext);
document.getElementById('btn-reset').addEventListener('click', resetSimulation);
document.getElementById('speed-slider').addEventListener('input', (e) => {
  state.sim.speed = parseInt(e.target.value);
  const seconds = (state.sim.speed / 1000).toFixed(1);
  document.getElementById('speed-label').textContent = `${seconds}s`;
});

// Highlight static code lines on click
function highlightCodeLine(index, explanation) {
  document.querySelectorAll('.code-line').forEach(l => l.classList.remove('active'));
  const line = document.getElementById(`code-line-${index}`);
  if (line) {
    line.classList.add('active');
  }
  const explainBox = document.getElementById('code-explain-box');
  explainBox.textContent = explanation;
  explainBox.style.display = 'block';
}

// ----------------------------------------------------
// RENDER HANDLER: Paints visual state according to visual steps
// ----------------------------------------------------
function renderVisualStep() {
  const algoId = state.sim.activeAlgoId;
  const currentIdx = state.sim.currentStepIdx;
  
  if (currentIdx === -1) {
    // Show clean defaults
    clearVisuals();
    return;
  }
  
  const step = state.sim.steps[currentIdx];
  
  // 1. Highlight C Code Line execution
  document.querySelectorAll('.code-line').forEach(l => l.classList.remove('active'));
  const activeLine = document.getElementById(`code-line-${step.lineIdx}`);
  if (activeLine) {
    activeLine.classList.add('active');
    // Scroll active line into view smoothly
    activeLine.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
  
  // Show code explanation box matching this step
  const explainBox = document.getElementById('code-explain-box');
  const algoData = window.ALGORITHMS_DATA[algoId];
  if (explainBox && algoData && algoData.code[step.lineIdx]) {
    explainBox.textContent = algoData.code[step.lineIdx].e;
    explainBox.style.display = 'block';
  }
  
  // 2. Render State Badges
  const badgesArea = document.getElementById('sim-state-badges');
  badgesArea.innerHTML = '';
  if (step.badges && step.badges.length > 0) {
    step.badges.forEach(b => {
      badgesArea.innerHTML += `<span class="state-badge ${b.t}">${b.l}: <strong>${b.v}</strong></span>`;
    });
  } else {
    badgesArea.innerHTML = '<span style="color:var(--text-tertiary); font-size:0.85rem;">Idle</span>';
  }
  
  // 3. Update active workspace visuals
  if (algoId === 'prim' || algoId === 'floyd' || algoId === 'warshall') {
    renderMatrixStates(step);
  } else if (algoId === 'kruskal') {
    renderKruskalGraph(step);
  } else if (algoId === 'dijkstra') {
    renderDijkstraVector(step);
  } else if (algoId === 'topological_sort') {
    renderTopologicalSortQueue(step);
  } else if (algoId === 'knapsack') {
    renderKnapsackDPTable(step);
  }
}

// Clear visualization boards
function clearVisuals() {
  document.getElementById('sim-state-badges').innerHTML = '<span style="color:var(--text-tertiary); font-size:0.85rem;">Pre-execution state. Tap Play/Next.</span>';
  
  const algoId = state.sim.activeAlgoId;
  const editorMatrix = document.getElementById('editor-matrix');
  
  if (editorMatrix) {
    // Clear highlight borders on matrix grid cells
    editorMatrix.querySelectorAll('.cell-input').forEach(cell => {
      cell.style.backgroundColor = '';
      cell.style.color = '';
    });
  }
}

// Render dynamic matrices (Prim, Floyd, Warshall)
function renderMatrixStates(step) {
  const size = state.sim.inputData.vertices;
  
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      const cell = document.getElementById(`cell-${i}-${j}`);
      if (cell && step.matrix && step.matrix[i]) {
        const stepVal = step.matrix[i][j];
        const isWeight = state.sim.activeAlgoId !== 'warshall';
        cell.value = stepVal === 99999 ? 0 : stepVal; // display 0 for INF
        cell.style.backgroundColor = ''; // reset color
        cell.style.color = '';
        
        if (isWeight && stepVal === 99999) {
          cell.style.color = 'var(--text-tertiary)';
        }
        
        // Highlights logic
        if (step.highlightCells) {
          const { i: hi, j: hj, k: hk } = step.highlightCells;
          if (i === hi && j === hj) {
            cell.style.backgroundColor = 'var(--success-bg)';
            cell.style.color = 'var(--success-accent)';
          } else if ((i === hi && j === hk) || (i === hk && j === hj)) {
            cell.style.backgroundColor = 'var(--info-bg)';
            cell.style.color = 'var(--info-accent)';
          }
        }
        
        if (step.highlightEdge) {
          const { src, dest } = step.highlightEdge;
          if ((i === src && j === dest) || (i === dest && j === src)) {
            cell.style.backgroundColor = 'var(--success-bg)';
            cell.style.color = 'var(--success-accent)';
          }
        }
      }
    }
  }
}

// Render Kruskal Graph sets representation
function renderKruskalGraph(step) {
  const badgesArea = document.getElementById('sim-state-badges');
  
  // Highlight table rows for edge check
  const tbody = document.getElementById('kruskal-edges-body');
  if (tbody) {
    Array.from(tbody.children).forEach(row => {
      row.style.backgroundColor = '';
    });
    
    if (step.highlightEdge) {
      const { src, dest, picked } = step.highlightEdge;
      // locate row matching src, dest
      Array.from(tbody.children).forEach(row => {
        const inputs = row.querySelectorAll('input');
        if (inputs.length >= 2) {
          const rSrc = parseInt(inputs[0].value);
          const rDest = parseInt(inputs[1].value);
          if ((rSrc === src && rDest === dest) || (rSrc === dest && rDest === src)) {
            row.style.backgroundColor = picked ? 'var(--success-bg)' : 'var(--danger-bg)';
          }
        }
      });
    }
  }
}

// Render Dijkstra distance vector table
function renderDijkstraVector(step) {
  const badgesArea = document.getElementById('sim-state-badges');
  
  // Render a visual distance list panel below inputs dynamically
  let dPanel = document.getElementById('dijkstra-vector-display');
  if (!dPanel) {
    dPanel = document.createElement('div');
    dPanel.id = 'dijkstra-vector-display';
    dPanel.style.marginTop = '1rem';
    dPanel.style.padding = '1rem';
    dPanel.style.borderRadius = 'var(--radius-sm)';
    dPanel.style.border = '1px solid var(--border-primary)';
    dPanel.style.backgroundColor = 'var(--bg-tertiary)';
    document.getElementById('input-editor-container').appendChild(dPanel);
  }
  
  if (step.dist) {
    let html = `<div style="font-weight:600; margin-bottom:8px; font-size:0.9rem;">Distance Vector dist[] from Source:</div><div class="state-row">`;
    step.dist.forEach((d, idx) => {
      const displayVal = d === 99999 ? '∞' : d;
      let activeClass = '';
      if (step.pickedNode === idx) activeClass = 'success';
      html += `<span class="state-badge ${activeClass}">dist[${idx}] = <strong>${displayVal}</strong></span>`;
    });
    html += `</div>`;
    dPanel.innerHTML = html;
  }
}

// Render Topological sort queue state
function renderTopologicalSortQueue(step) {
  let qPanel = document.getElementById('topological-vector-display');
  if (!qPanel) {
    qPanel = document.createElement('div');
    qPanel.id = 'topological-vector-display';
    qPanel.style.marginTop = '1rem';
    qPanel.style.padding = '1rem';
    qPanel.style.borderRadius = 'var(--radius-sm)';
    qPanel.style.border = '1px solid var(--border-primary)';
    qPanel.style.backgroundColor = 'var(--bg-tertiary)';
    document.getElementById('input-editor-container').appendChild(qPanel);
  }
  
  if (step.indeg && step.queue && step.out) {
    qPanel.innerHTML = `
      <div style="margin-bottom:8px;">
        <span style="font-weight:600; font-size:0.85rem; color:var(--text-secondary);">Indegrees:</span>
        <div class="state-row" style="margin-top:4px;">
          ${step.indeg.map((ind, i) => `<span class="state-badge ${ind === 0 ? 'success' : ''}">indeg[${i}] = ${ind}</span>`).join('')}
        </div>
      </div>
      <div style="margin-bottom:8px;">
        <span style="font-weight:600; font-size:0.85rem; color:var(--text-secondary);">BFS Queue:</span>
        <span style="font-family:var(--font-mono); font-size:0.9rem; margin-left:8px; background:var(--bg-secondary); padding:2px 8px; border-radius:4px; border:1.5px dashed var(--border-secondary);">
          [${step.queue.join(', ')}]
        </span>
      </div>
      <div>
        <span style="font-weight:600; font-size:0.85rem; color:var(--text-secondary);">Output List:</span>
        <span style="font-weight:700; font-size:1rem; color:var(--success-accent); margin-left:8px;">
          ${step.out.join(' → ') || 'Empty'}
        </span>
      </div>
    `;
  }
}

// Render Dynamic programming table grid (Knapsack 0/1)
function renderKnapsackDPTable(step) {
  let tableDiv = document.getElementById('knapsack-dp-table-display');
  if (!tableDiv) {
    tableDiv = document.createElement('div');
    tableDiv.id = 'knapsack-dp-table-display';
    tableDiv.style.marginTop = '1rem';
    tableDiv.style.overflowX = 'auto';
    tableDiv.style.padding = '4px';
    document.getElementById('input-editor-container').appendChild(tableDiv);
  }
  
  if (step.knapTable) {
    const W = state.sim.inputData.capacity;
    const n = state.sim.inputData.items.length;
    
    // Draw table
    let html = `<table class="matrix-table" style="width:100%; border-collapse:collapse;">`;
    
    // Column header row: showing capacity intervals to fit screen
    html += `<tr><td class="hdr">i\\w</td>`;
    for (let w = 0; w <= W; w++) {
      // show capacity 0, W, or divisible by 5/10 depending on scale to avoid page blow up
      if (W <= 12 || w === 0 || w === W || w % 5 === 0) {
        html += `<td class="hdr">${w}</td>`;
      }
    }
    html += `</tr>`;
    
    // Rows
    for (let i = 0; i <= n; i++) {
      html += `<tr><td class="hdr">${i === 0 ? '0 (none)' : `Item ${i}`}</td>`;
      for (let w = 0; w <= W; w++) {
        if (W <= 12 || w === 0 || w === W || w % 5 === 0) {
          const val = step.knapTable[i][w];
          
          let cellStyle = '';
          if (step.highlightDP) {
            const { i: hi, w: hw, srcAbove, srcBack } = step.highlightDP;
            if (i === hi && w === hw) {
              cellStyle = `style="background-color: var(--warning-bg); color: var(--warning-accent); font-weight:700;"`;
            } else if (srcAbove && i === srcAbove.i && w === srcAbove.w) {
              cellStyle = `style="background-color: var(--info-bg); color: var(--info-accent);"`;
            } else if (srcBack && i === srcBack.i && w === srcBack.w) {
              cellStyle = `style="background-color: var(--success-bg); color: var(--success-accent);"`;
            }
          }
          
          // last cell is the answer
          if (i === n && w === W && currentIdx === state.sim.steps.length - 1) {
            cellStyle = `style="background-color: var(--success-bg); color: var(--success-accent); font-weight:700; border: 2px solid var(--success-accent);"`;
          }
          
          html += `<td ${cellStyle} style="padding: 4px 8px; border:1px solid var(--border-primary); font-family:var(--font-mono); font-size:0.82rem;">${val}</td>`;
        }
      }
      html += `</tr>`;
    }
    html += `</table>`;
    tableDiv.innerHTML = html;
  }
}

// Global UI QA accordion utility
function toggleVivaCard(idx) {
  const card = document.getElementById(`viva-card-${idx}`);
  if (card) {
    card.classList.toggle('open');
  }
}

// Escape raw HTML strings helper
function escapeHTML(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// ----------------------------------------------------
// AI ASSISTANT / CHATBOT DRAWER
// ----------------------------------------------------
function toggleAIDrawer() {
  const drawer = document.getElementById('ai-drawer');
  state.aiOpen = !state.aiOpen;
  drawer.classList.toggle('open', state.aiOpen);
}

function openAIDrawer(prefillQuery = '') {
  const drawer = document.getElementById('ai-drawer');
  state.aiOpen = true;
  drawer.classList.add('open');
  if (prefillQuery) {
    const input = document.getElementById('ai-input');
    input.value = prefillQuery;
    input.focus();
  }
}

// Dynamically generate chat button suggestions based on currently viewed algorithm page
function updateAISuggestions() {
  const area = document.getElementById('quick-prompts-area');
  area.innerHTML = '';
  
  const algoId = state.activeTab;
  let prompts = [];
  
  if (algoId === 'dashboard') {
    prompts = [
      "Explain the syllabus",
      "Which algorithm uses greedy?",
      "DP vs Greedy comparison",
      "Syllabus complexities cheat"
    ];
  } else if (algoId === 'prim') {
    prompts = [
      "Prim's vs Kruskal's",
      "Explain O(V²) time",
      "Explain cost[i][j] == INF",
      "Differentiate Dijkstra"
    ];
  } else if (algoId === 'kruskal') {
    prompts = [
      "Why sort edges first?",
      "Path compression O(1)",
      "How cycle is avoided?",
      "Kruskal's complexity"
    ];
  } else if (algoId === 'floyd') {
    prompts = [
      "Why outer loop is k?",
      "Floyd vs Warshall",
      "Floyd time complexity",
      "Negative cycle check"
    ];
  } else if (algoId === 'warshall') {
    prompts = [
      "OR-AND logic formula",
      "Transitive Closure meaning",
      "Warshall complexity",
      "Floyd differences"
    ];
  } else if (algoId === 'dijkstra') {
    prompts = [
      "Why negative weights fail?",
      "Dijkstra vs Bellman Ford",
      "Relaxation meaning",
      "Dijkstra vs Prim"
    ];
  } else if (algoId === 'topological_sort') {
    prompts = [
      "Cycle detection Kahn's",
      "What is Indegree?",
      "Is sorting unique?",
      "Real-world application"
    ];
  } else if (algoId === 'knapsack') {
    prompts = [
      "DP vs Greedy Knapsack",
      "Why table is n+1 size?",
      "NP-complete meaning",
      "Recurrence equation"
    ];
  }
  
  prompts.forEach(p => {
    area.innerHTML += `<button class="quick-btn" onclick="submitAIPrefill('${p}')">${p}</button>`;
  });
}

function submitAIPrefill(query) {
  appendMessage(query, 'user');
  generateAIResponse(query);
}

function handleAISubmit(e) {
  if (e.key === 'Enter') {
    submitAIQuestion();
  }
}

function submitAIQuestion() {
  const input = document.getElementById('ai-input');
  const query = input.value.trim();
  if (query) {
    appendMessage(query, 'user');
    input.value = '';
    generateAIResponse(query);
  }
}

function appendMessage(text, sender) {
  const msgArea = document.getElementById('ai-messages');
  const div = document.createElement('div');
  div.className = `message ${sender}`;
  div.innerHTML = text.replace(/\n/g, '<br>');
  msgArea.appendChild(div);
  msgArea.scrollTop = msgArea.scrollHeight;
}

// Rule-based offline AI Tutor responder
function generateAIResponse(query) {
  const lower = query.toLowerCase();
  let response = "I'm not fully sure about that specific question. Try asking about dynamic programming, greedy methods, or time complexities for the active experiment!";
  
  const algoId = state.activeTab;
  
  if (lower.includes("syllabus") || lower.includes("coverage")) {
    response = "The ADA Syllabus covers:\n- Lab 2 & 2b: Minimum Spanning Trees (Prim's and Kruskal's algorithms)\n- Lab 3a & 3b: Dynamic Programming (Floyd's and Warshall's algorithms)\n- Lab 4: Shortest Paths (Dijkstra's algorithm)\n- Lab 5: Topological Sort (Kahn's BFS algorithm)\n- Lab 6: 0/1 Knapsack (Dynamic Programming matrix)";
  } else if (lower.includes("greedy vs dp") || lower.includes("dp vs greedy")) {
    response = "Key Differences:\n- **Greedy Method** makes the locally optimal choice at each step hoping it leads to a global optimum (e.g. Prim's, Kruskal's, Dijkstra's). It is fast but doesn't solve everything.\n- **Dynamic Programming** solves overlapping subproblems, saves results in a table (memoization), and guarantees a globally optimal solution (e.g. Floyd's, Warshall's, 0/1 Knapsack).";
  } else if (lower.includes("np-complete")) {
    response = "NP-complete problems (like 0/1 Knapsack) have no known polynomial-time algorithms that solve all inputs. Dynamic Programming solves 0/1 Knapsack in O(n·W) time, which is 'pseudo-polynomial' because it depends on the numerical value of capacity W, rather than the size of the inputs alone.";
  } else if (algoId === 'prim') {
    if (lower.includes("kruskal")) {
      response = "Prim's grows a single spanning tree from a chosen source node. Kruskal's builds a spanning tree by repeatedly sorting edges and uniting separate forest sets. Prim's is O(V²) and better for dense graphs; Kruskal's is O(E log E) and better for sparse graphs.";
    } else if (lower.includes("complexity") || lower.includes("v²")) {
      response = "The typical lab implementation uses an adjacency matrix representation. To find the cheapest crossing edge, we iterate through V visited vertices and check V unvisited neighbors, leading to V-1 rounds of O(V) checks = O(V²).";
    } else if (lower.includes("inf") || lower.includes("infinity")) {
      response = "Since 0 weight represents 'no edge', leaving it as 0 causes the algorithm to pick it as the cheapest edge. Replacing 0 with infinity (99999) ensures no-edge slots are ignored.";
    } else if (lower.includes("dijkstra")) {
      response = "They share the same skeleton, but Prim's selects minimum edge weight to connect an unvisited vertex to the *closest node in the existing tree*, whereas Dijkstra's selects the minimum cumulative distance from the *single source vertex*.";
    }
  } else if (algoId === 'kruskal') {
    if (lower.includes("sort")) {
      response = "Sorting edges is the greedy core of Kruskal's. We sort edges by weight ascending so we are guaranteed to process the cheapest available edge first.";
    } else if (lower.includes("compression")) {
      response = "Path compression flattens the set tree structure by pointing all traversed nodes directly to the root during find(). This reduces find() checks from O(V) to nearly O(1) in subsequent iterations.";
    } else if (lower.includes("cycle")) {
      response = "Cycle detection is handled via the Union-Find parent check. If find(u) == find(v), u and v belong to the same component, meaning they are already connected. Linking them with a new edge creates a closed loop/cycle, so we skip it.";
    } else if (lower.includes("complexity")) {
      response = "Kruskal's time complexity is O(E log E) due to the sorting step. The Union-Find operations take nearly O(1) time per edge check, making the sort step the dominant factor.";
    }
  } else if (algoId === 'floyd') {
    if (lower.includes("loop") || lower.includes("outer")) {
      response = "Outer loop is k because it represents intermediate steps in dynamic programming. In round k, all paths using vertices 0 to k-1 are finalized. If k were the innermost loop, we would calculate paths using k before finalized paths for smaller values, which violates DP dependency structure.";
    } else if (lower.includes("warshall")) {
      response = "Floyd's computes actual shortest path weights (min/+ formula), whereas Warshall's computes binary connectivity/reachability (OR/AND formula). Both share the O(V³) outer shell.";
    } else if (lower.includes("complexity")) {
      response = "Floyd's algorithm is O(V³) due to three nested loops, each iterating from 0 to V-1. Space is O(V²) for the distance matrix.";
    } else if (lower.includes("negative")) {
      response = "Floyd's handles negative weights. However, if a negative cycle is present, the path distances can loop and decrease infinitely. If dist[i][i] < 0 for any vertex after calculation, a negative cycle exists.";
    }
  } else if (algoId === 'warshall') {
    if (lower.includes("closure") || lower.includes("transitive")) {
      response = "Transitive Closure of a graph shows reachability: cell (i, j) is 1 if there exists a path of any length from node i to node j; otherwise, it is 0.";
    } else if (lower.includes("logic") || lower.includes("formula")) {
      response = "Formula: g[i][j] = g[i][j] || (g[i][k] && g[k][j]). It checks if i can reach j already, OR if i can reach k AND k can reach j.";
    } else if (lower.includes("complexity")) {
      response = "Warshall's time complexity is O(V³) because of the triple nested loop. Space is O(V²) for the boolean adjacency matrix.";
    }
  } else if (algoId === 'dijkstra') {
    if (lower.includes("negative")) {
      response = "Dijkstra's assumes that once a vertex is marked visited, its shortest path is final. If there are negative weights, a longer path with a negative edge discovered later could yield a shorter overall path. Since visited nodes are locked, Dijkstra's misses this adjustment. Use Bellman-Ford for negative weights.";
    } else if (lower.includes("prim")) {
      response = "Prim's selects edges to minimize total tree cost (grow MST). Dijkstra's selects edges to minimize the cumulative distance back to the starting source vertex.";
    } else if (lower.includes("relaxation")) {
      response = "Relaxation is updating the distance of a neighbor: if going through vertex u reduces the distance to neighbor v (dist[u] + weight(u, v) < dist[v]), we update dist[v] with the lower value.";
    }
  } else if (algoId === 'topological_sort') {
    if (lower.includes("indegree")) {
      response = "Indegree of a node is the count of directed edges pointing INTO it. In scheduling, indegree represent outstanding requirements. An indegree of 0 means all prerequisites are met.";
    } else if (lower.includes("cycle")) {
      response = "If a cycle exists, the nodes in the cycle will never have their indegree reduced to 0, so they never enter the queue. If count of output nodes !== V, a cycle exists.";
    } else if (lower.includes("unique")) {
      response = "No. If multiple vertices have an indegree of 0 at the same time, they can be processed in any order, leading to different valid topological sort sequences.";
    }
  } else if (algoId === 'knapsack') {
    if (lower.includes("why table") || lower.includes("size")) {
      response = "Table size is (n+1) × (W+1). Row 0 represents using 0 items (profit is 0). Column 0 represents knapsack capacity of 0 (profit is 0). This provides baseline values to compute subsequent rows.";
    } else if (lower.includes("formula") || lower.includes("recurrence")) {
      response = "If item fits (wt <= w): knap[i][w] = max(skip, take) = max(knap[i-1][w], val[i-1] + knap[i-1][w - wt[i-1]]). If item doesn't fit: knap[i][w] = knap[i-1][w].";
    }
  }
  
  setTimeout(() => {
    appendMessage(response, 'bot');
  }, 400);
}

// Global hook helpers for HTML triggers
window.switchTab = switchTab;
window.toggleTheme = toggleTheme;
window.toggleVivaCard = toggleVivaCard;
window.toggleAIDrawer = toggleAIDrawer;
window.openAIDrawer = openAIDrawer;
window.submitAIQuestion = submitAIQuestion;
window.handleAISubmit = handleAISubmit;
window.submitAIPrefill = submitAIPrefill;
window.resizeMatrix = resizeMatrix;
window.compileSimulation = compileSimulation;
window.randomizeInputs = randomizeInputs;
window.addKruskalEdge = addKruskalEdge;
window.deleteKruskalEdge = deleteKruskalEdge;
window.addKnapsackItem = addKnapsackItem;
window.deleteKnapsackItem = deleteKnapsackItem;

// Global Search Functionality
function handleGlobalSearch() {
  const query = document.getElementById('global-search').value.toLowerCase().trim();
  state.searchQuery = query;
  
  if (!query) {
    // Show standard sidebar links
    document.querySelectorAll('.nav-links .nav-item').forEach(item => {
      item.style.display = 'block';
    });
    return;
  }
  
  // Filter sidebar tabs based on matching criteria
  document.querySelectorAll('.nav-links .nav-item').forEach(item => {
    const link = item.querySelector('.nav-link');
    if (!link) return;
    const text = link.innerText.toLowerCase();
    
    // Check match on title or keywords
    let match = text.includes(query);
    
    // check matching in algos questions
    const onclickAttr = link.getAttribute('onclick');
    if (onclickAttr) {
      const matchAlgo = onclickAttr.match(/'([^']+)'/);
      if (matchAlgo && matchAlgo[1]) {
        const algoId = matchAlgo[1];
        const algoData = window.ALGORITHMS_DATA[algoId];
        if (algoData) {
          // match description or questions/answers
          if (algoData.description.toLowerCase().includes(query) || algoData.idea.toLowerCase().includes(query)) {
            match = true;
          }
          algoData.viva.forEach(v => {
            if (v.q.toLowerCase().includes(query) || v.a.toLowerCase().includes(query)) {
              match = true;
            }
          });
        }
      }
    }
    
    item.style.display = match ? 'block' : 'none';
  });
}
