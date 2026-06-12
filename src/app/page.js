"use client";

import React, { useState, useEffect, useRef } from "react";
import { ALGORITHMS } from "@/data/algorithms";
import Sidebar from "@/components/Sidebar";
import CodeWalkthrough from "@/components/CodeWalkthrough";
import VivaList from "@/components/VivaList";
import Visualizer from "@/components/Visualizer";

export default function Page() {
  // Navigation & UI States
  const [activeTab, setActiveTab] = useState("dashboard");
  const [searchQuery, setSearchQuery] = useState("");
  const [theme, setTheme] = useState("dark");
  const [aiOpen, setAiOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState([
    {
      sender: "bot",
      text: "Hi! I am your ADA Lab Tutor. I can explain code lines, perform custom dry runs, explain exam topics, or help you understand time complexities. Tap one of the suggestions below or type your question!"
    }
  ]);

  // Code Walkthrough click overrides
  const [selectedLineIdx, setSelectedLineIdx] = useState(null);
  const [manualExplanation, setManualExplanation] = useState("");

  // Visualizer / Simulator State
  const [isPlaying, setIsPlaying] = useState(false);
  const [stepIdx, setStepIdx] = useState(-1);
  const [speed, setSpeed] = useState(1000);
  const [steps, setSteps] = useState([]);
  
  // Custom inputs state for all algorithms (keyed by ID)
  const [algoInputs, setAlgoInputs] = useState(() => {
    const initialInputs = {};
    Object.values(ALGORITHMS).forEach(algo => {
      initialInputs[algo.id] = JSON.parse(JSON.stringify(algo.defaultInput));
    });
    return initialInputs;
  });

  const timerRef = useRef(null);
  const timelineRef = useRef(null);

  // Sync Global Theme
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  // Sync Playback loop timer
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setStepIdx((prev) => {
          if (prev < steps.length - 1) {
            return prev + 1;
          } else {
            setIsPlaying(false);
            return prev;
          }
        });
      }, speed);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, steps.length, speed]);

  // Auto-scroll the trace log panel to the bottom when steps change
  useEffect(() => {
    if (timelineRef.current) {
      timelineRef.current.scrollTop = timelineRef.current.scrollHeight;
    }
  }, [stepIdx]);

  // Recompile steps when inputs or algorithm changes
  useEffect(() => {
    if (activeTab === "dashboard") return;
    
    const input = algoInputs[activeTab];
    if (!input) return;

    let compiledSteps = [];
    if (activeTab === "prim") compilePrim(input, compiledSteps);
    else if (activeTab === "kruskal") compileKruskal(input, compiledSteps);
    else if (activeTab === "floyd") compileFloyd(input, compiledSteps);
    else if (activeTab === "warshall") compileWarshall(input, compiledSteps);
    else if (activeTab === "dijkstra") compileDijkstra(input, compiledSteps);
    else if (activeTab === "topological_sort") compileTopologicalSort(input, compiledSteps);
    else if (activeTab === "knapsack") compileKnapsack(input, compiledSteps);

    setSteps(compiledSteps);
    setIsPlaying(false);
    setStepIdx(-1);
    setSelectedLineIdx(null);
    setManualExplanation("");
  }, [activeTab, algoInputs]);

  // Compiles and saves custom input states
  const handleInputChange = (newInput) => {
    setAlgoInputs(prev => ({
      ...prev,
      [activeTab]: newInput
    }));
  };

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
  };

  // Playback Control Handlers
  const handlePlayPause = () => {
    if (isPlaying) {
      setIsPlaying(false);
    } else {
      if (stepIdx >= steps.length - 1) {
        setStepIdx(-1);
      }
      setIsPlaying(true);
    }
  };

  const handleStepNext = () => {
    if (stepIdx < steps.length - 1) {
      setStepIdx(prev => prev + 1);
    }
  };

  const handleStepPrev = () => {
    if (stepIdx > 0) {
      setStepIdx(prev => prev - 1);
    }
  };

  const handleReset = () => {
    setIsPlaying(false);
    setStepIdx(-1);
    setSelectedLineIdx(null);
    setManualExplanation("");
  };

  const handleLineClick = (idx, explain) => {
    setIsPlaying(false);
    setSelectedLineIdx(idx);
    setManualExplanation(explain);
  };

  // ----------------------------------------------------
  // SIMULATION COMPILERS (JS Equivalents of lab algorithms)
  // ----------------------------------------------------
  
  // 1. Prim MST
  const compilePrim = (data, list) => {
    const V = data.vertices;
    const cost = JSON.parse(JSON.stringify(data.matrix));
    const visited = new Array(V).fill(0);
    
    list.push({
      lineIdx: 0,
      traceText: `Initialized visited array to 0. Number of nodes = ${V}.`,
      badges: [{ l: 'visited', v: visited.join(','), t: 'tertiary' }],
      matrix: JSON.parse(JSON.stringify(cost))
    });
    
    list.push({
      lineIdx: 6,
      traceText: "Calculated input cost matrix. Replaced cells of 0 with INF (99999) to indicate no edges.",
      badges: [{ l: 'mincost', v: '0', t: 'tertiary' }],
      matrix: JSON.parse(JSON.stringify(cost))
    });
    
    visited[0] = 1;
    list.push({
      lineIdx: 8,
      traceText: "Started MST from vertex 0. Marked visited[0] = 1.",
      badges: [
        { l: 'visited', v: visited.map((v, i) => `${i}:${v}`).join(' | '), t: 'primary' },
        { l: 'mincost', v: '0', t: 'tertiary' }
      ],
      matrix: JSON.parse(JSON.stringify(cost))
    });
    
    let mincost = 0;
    
    for (let edge = 1; edge < V; edge++) {
      list.push({
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
        
        list.push({
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
        list.push({
          lineIdx: 19,
          traceText: "Graph is disconnected! Spanning tree selection failed.",
          badges: [{ l: 'error', v: 'disconnected', t: 'danger' }],
          matrix: JSON.parse(JSON.stringify(cost))
        });
        break;
      }
    }
    
    list.push({
      lineIdx: 21,
      traceText: `MST completed successfully! Total Minimum Cost is ${mincost}.`,
      badges: [{ l: 'Final Cost', v: mincost, t: 'success' }],
      matrix: JSON.parse(JSON.stringify(cost))
    });
  };

  // 2. Kruskal MST
  const compileKruskal = (data, list) => {
    const edges = JSON.parse(JSON.stringify(data.edges || []));
    const V = data.vertices;
    const parent = [];
    
    list.push({
      lineIdx: 0,
      traceText: "Defined Edge structure and parent array. Gathering inputs.",
      badges: [{ l: 'EdgesCount', v: edges.length, t: 'tertiary' }]
    });
    
    edges.sort((a, b) => a.weight - b.weight);
    list.push({
      lineIdx: 15,
      traceText: `Sorted all edges by weight in ascending order: ${edges.map(e => `${e.src}-${e.dest}(${e.weight})`).join(', ')}.`,
      badges: [{ l: 'Cheapest', v: edges.length > 0 ? `${edges[0].src}-${edges[0].dest}` : 'None', t: 'primary' }]
    });
    
    for (let i = 0; i < V; i++) parent[i] = i;
    list.push({
      lineIdx: 16,
      traceText: `Initialized parent array for Union-Find: each vertex is its own representative set.`,
      badges: [{ l: 'parents', v: parent.map((p, idx) => `${idx}:${p}`).join(', '), t: 'primary' }]
    });
    
    const find = (i) => {
      let root = i;
      while (parent[root] !== root) {
        root = parent[root];
      }
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
      
      list.push({
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
        
        list.push({
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
          list.push({
            lineIdx: 22,
            traceText: `MST holds exactly V-1 (${V-1}) edges now. Spanning is complete!`,
            badges: [{ l: 'MST Cost', v: minCost, t: 'success' }]
          });
          break;
        }
      } else {
        list.push({
          lineIdx: 22,
          traceText: `Skipped: Root sets are identical (find(${u})=${rootU}, find(${v})=${rootV}). Including this edge forms a CYCLE!`,
          badges: [
            { l: 'skipped', v: `${u}-${v}`, t: 'danger' }
          ],
          highlightEdge: { src: u, dest: v, picked: false }
        });
      }
    }
  };

  // 3. Floyd Warshall (Shortest Path)
  const compileFloyd = (data, list) => {
    const V = data.vertices;
    const dist = JSON.parse(JSON.stringify(data.matrix));
    
    list.push({
      lineIdx: 0,
      traceText: `Initialized All-Pairs matrix. Number of vertices = ${V}.`,
      badges: [{ l: 'vertices', v: V, t: 'tertiary' }],
      matrix: JSON.parse(JSON.stringify(dist))
    });
    
    for (let k = 0; k < V; k++) {
      list.push({
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
            
            list.push({
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
    
    list.push({
      lineIdx: 10,
      traceText: "All iterations completed. Matrix shows final shortest path distances between all pairs.",
      badges: [{ l: 'status', v: 'finished', t: 'success' }],
      matrix: JSON.parse(JSON.stringify(dist))
    });
  };

  // 4. Warshall Transitive Closure
  const compileWarshall = (data, list) => {
    const V = data.vertices;
    const g = JSON.parse(JSON.stringify(data.matrix));
    
    list.push({
      lineIdx: 0,
      traceText: `Initialized reachability matrix from inputs. Number of vertices = ${V}.`,
      badges: [{ l: 'vertices', v: V, t: 'tertiary' }],
      matrix: JSON.parse(JSON.stringify(g))
    });
    
    for (let k = 0; k < V; k++) {
      list.push({
        lineIdx: 5,
        traceText: `[Intermediate Node k = ${k}] Evaluating transitive connectivity through vertex ${k}.`,
        badges: [{ l: 'intermediate k', v: k, t: 'warning' }],
        matrix: JSON.parse(JSON.stringify(g))
      });
      
      for (let i = 0; i < V; i++) {
        for (let j = 0; j < V; j++) {
          if (g[i][j] === 0 && (g[i][k] && g[k][j])) {
            g[i][j] = 1;
            list.push({
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
    
    list.push({
      lineIdx: 9,
      traceText: "Reachability analysis finished. Transitive closure matrix fully computed.",
      badges: [{ l: 'status', v: 'finished', t: 'success' }],
      matrix: JSON.parse(JSON.stringify(g))
    });
  };

  // 5. Dijkstra Shortest Path
  const compileDijkstra = (data, list) => {
    const V = data.vertices;
    const src = data.source;
    const cost = JSON.parse(JSON.stringify(data.matrix));
    
    const dist = [];
    const visited = new Array(V).fill(0);
    
    list.push({
      lineIdx: 0,
      traceText: `Initialized arrays. Total vertices = ${V}. Chosen source vertex = ${src}.`,
      badges: [
        { l: 'source', v: src, t: 'primary' },
        { l: 'visited', v: visited.join(','), t: 'tertiary' }
      ],
      dist: new Array(V).fill('INF')
    });
    
    for (let i = 0; i < V; i++) {
      dist[i] = cost[src][i];
    }
    
    list.push({
      lineIdx: 6,
      traceText: `Initial estimates: copied row of source vertex ${src} into dist[].`,
      badges: [{ l: 'dist[]', v: dist.map((d, i) => `${i}:${d === 99999 ? 'INF' : d}`).join(', '), t: 'primary' }],
      dist: [...dist]
    });
    
    dist[src] = 0;
    visited[src] = 1;
    
    list.push({
      lineIdx: 7,
      traceText: "Source self-distance set to 0. Marked source as visited/finalized.",
      badges: [
        { l: 'visited', v: visited.map((v, i) => `${i}:${v}`).join(' | '), t: 'primary' },
        { l: 'dist[]', v: dist.map((d, i) => `${i}:${d === 99999 ? 'INF' : d}`).join(', '), t: 'success' }
      ],
      dist: [...dist]
    });
    
    for (let c = 1; c < V - 1; c++) {
      list.push({
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
        list.push({
          lineIdx: 11,
          traceText: "No more reachable unvisited vertices. Halting.",
          badges: [{ l: 'unreachable', v: 'yes', t: 'danger' }],
          dist: [...dist]
        });
        break;
      }
      
      visited[u] = 1;
      list.push({
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
      
      for (let i = 0; i < V; i++) {
        if (!visited[i] && cost[u][i] !== 99999) {
          const altDist = min + cost[u][i];
          list.push({
            lineIdx: 14,
            traceText: `Checking neighbor ${i}: direct cost via ${u} is dist[${u}] (${min}) + weight (${cost[u][i]}) = ${altDist}. Current dist[${i}] = ${dist[i] === 99999 ? 'INF' : dist[i]}.`,
            badges: [{ l: 'relaxing neighbor', v: i, t: 'warning' }],
            dist: [...dist]
          });
          
          if (altDist < dist[i]) {
            dist[i] = altDist;
            list.push({
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
    
    list.push({
      lineIdx: 17,
      traceText: "All shortest paths finalized.",
      badges: [{ l: 'dist[] final', v: dist.map((d, i) => `${i}:${d === 99999 ? 'INF' : d}`).join(', '), t: 'success' }],
      dist: [...dist]
    });
  };

  // 6. Topological Sort (Kahn's BFS)
  const compileTopologicalSort = (data, list) => {
    const V = data.vertices;
    const adj = JSON.parse(JSON.stringify(data.matrix));
    const indeg = new Array(V).fill(0);
    
    list.push({
      lineIdx: 0,
      traceText: "Initialized indegree counts and BFS topological queue structure.",
      badges: [{ l: 'vertices', v: V, t: 'tertiary' }],
      indeg: [...indeg],
      queue: [],
      out: []
    });
    
    for (let i = 0; i < V; i++) {
      for (let j = 0; j < V; j++) {
        if (adj[i][j] === 1) {
          indeg[j]++;
        }
      }
    }
    
    list.push({
      lineIdx: 12,
      traceText: `Pass 1 complete: scanned adjacency matrix and computed indegree counts.`,
      badges: [{ l: 'computed indeg[]', v: indeg.map((val, idx) => `${idx}:${val}`).join(', '), t: 'primary' }],
      indeg: [...indeg],
      queue: [],
      out: []
    });
    
    const queue = [];
    let rear = 0;
    for (let i = 0; i < V; i++) {
      if (indeg[i] === 0) {
        queue.push(i);
        rear++;
      }
    }
    
    list.push({
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
      
      list.push({
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
      
      for (let i = 0; i < V; i++) {
        if (adj[v][i] === 1) {
          indeg[i]--;
          
          list.push({
            lineIdx: 19,
            traceText: `Decrementing neighbor dependency: edge ${v}→${i} resolved. indeg[${i}] becomes ${indeg[i]}.`,
            badges: [{ l: 'indeg[]', v: indeg.map((val, idx) => `${idx}:${val}`).join(', '), t: 'tertiary' }],
            indeg: [...indeg],
            queue: [...queue],
            out: [...out]
          });
          
          if (indeg[i] === 0) {
            queue.push(i);
            list.push({
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
      list.push({
        lineIdx: 23,
        traceText: `CYCLE DETECTED! Sorted only ${count} nodes out of ${V}. A cycle exists, topological sort impossible.`,
        badges: [{ l: 'error', v: 'cycle', t: 'danger' }],
        indeg: [...indeg],
        queue: [...queue],
        out: [...out]
      });
    } else {
      list.push({
        lineIdx: 22,
        traceText: `Completed! Processed all ${V} nodes. Valid Topological Order: ${out.join(' → ')}.`,
        badges: [{ l: 'final order', v: out.join('→'), t: 'success' }],
        indeg: [...indeg],
        queue: [...queue],
        out: [...out]
      });
    }
  };

  // 7. 0/1 Knapsack DP
  const compileKnapsack = (data, list) => {
    const items = JSON.parse(JSON.stringify(data.items || []));
    const W = data.capacity;
    const n = items.length;
    
    list.push({
      lineIdx: 1,
      traceText: `Initialized Knapsack: capacity W = ${W}, total items = ${n}.`,
      badges: [{ l: 'W', v: W, t: 'tertiary' }, { l: 'items', v: n, t: 'tertiary' }]
    });
    
    const knap = [];
    for (let i = 0; i <= n; i++) {
      knap[i] = new Array(W + 1).fill(0);
    }
    
    list.push({
      lineIdx: 2,
      traceText: `Created DP table of size (${n}+1) × (${W}+1) cells.`,
      badges: [],
      knapTable: JSON.parse(JSON.stringify(knap))
    });
    
    list.push({
      lineIdx: 7,
      traceText: "Anchored base cases: row 0 (0 items) and column 0 (0 capacity) filled with 0s.",
      badges: [],
      knapTable: JSON.parse(JSON.stringify(knap))
    });
    
    for (let i = 1; i <= n; i++) {
      const item = items[i - 1];
      
      list.push({
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
          
          if (w === W || w % 10 === 0) {
            list.push({
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
            list.push({
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
    
    list.push({
      lineIdx: 14,
      traceText: `DP calculation completed! Maximum value achievable in capacity ${W} is ${knap[n][W]}.`,
      badges: [{ l: 'Max Profit', v: knap[n][W], t: 'success' }],
      knapTable: JSON.parse(JSON.stringify(knap))
    });
  };

  // ----------------------------------------------------
  // OFFLINE AI ASSISTANT ROBOT RESPONSES
  // ----------------------------------------------------
  const handleAISubmit = (e) => {
    if (e.key === "Enter" && chatInput.trim()) {
      submitQuestion(chatInput);
    }
  };

  const submitQuestion = (query) => {
    const text = query.trim();
    if (!text) return;
    
    const userMsg = { sender: "user", text };
    setChatMessages((prev) => [...prev, userMsg]);
    setChatInput("");
    
    // Process response
    setTimeout(() => {
      const lower = text.toLowerCase();
      let botResponse = "I'm not fully sure about that specific question. Try asking about dynamic programming, greedy methods, or time complexities for the active experiment!";
      
      if (lower.includes("syllabus") || lower.includes("coverage")) {
        botResponse = "The ADA Syllabus covers:\n- Lab 2 & 2b: Minimum Spanning Trees (Prim's and Kruskal's algorithms)\n- Lab 3a & 3b: Dynamic Programming (Floyd's and Warshall's algorithms)\n- Lab 4: Shortest Paths (Dijkstra's algorithm)\n- Lab 5: Topological Sort (Kahn's BFS algorithm)\n- Lab 6: 0/1 Knapsack (Dynamic Programming matrix)";
      } else if (lower.includes("greedy vs dp") || lower.includes("dp vs greedy")) {
        botResponse = "Key Differences:\n- **Greedy Method** makes the locally optimal choice at each step hoping it leads to a global optimum (e.g. Prim's, Kruskal's, Dijkstra's). It is fast but doesn't solve everything.\n- **Dynamic Programming** solves overlapping subproblems, saves results in a table (memoization), and guarantees a globally optimal solution (e.g. Floyd's, Warshall's, 0/1 Knapsack).";
      } else if (lower.includes("np-complete")) {
        botResponse = "NP-complete problems (like 0/1 Knapsack) have no known polynomial-time algorithms that solve all inputs. Dynamic Programming solves 0/1 Knapsack in O(n·W) time, which is 'pseudo-polynomial' because it depends on the numerical value of capacity W, rather than the size of the inputs alone.";
      } else if (activeTab === "prim") {
        if (lower.includes("kruskal")) {
          botResponse = "Prim's grows a single spanning tree from a chosen source node. Kruskal's builds a spanning tree by repeatedly sorting edges and uniting separate forest sets. Prim's is O(V²) and better for dense graphs; Kruskal's is O(E log E) and better for sparse graphs.";
        } else if (lower.includes("complexity") || lower.includes("v²")) {
          botResponse = "The typical lab implementation uses an adjacency matrix representation. To find the cheapest crossing edge, we iterate through V visited vertices and check V unvisited neighbors, leading to V-1 rounds of O(V) checks = O(V²).";
        } else if (lower.includes("inf") || lower.includes("infinity")) {
          botResponse = "Since 0 weight represents 'no edge', leaving it as 0 causes the algorithm to pick it as the cheapest edge. Replacing 0 with infinity (99999) ensures no-edge slots are ignored.";
        } else if (lower.includes("dijkstra")) {
          botResponse = "They share the same skeleton, but Prim's selects minimum edge weight to connect an unvisited vertex to the *closest node in the existing tree*, whereas Dijkstra's selects the minimum cumulative distance from the *single source vertex*.";
        }
      } else if (activeTab === "kruskal") {
        if (lower.includes("sort")) {
          botResponse = "Sorting edges is the greedy core of Kruskal's. We sort edges by weight ascending so we are guaranteed to process the cheapest available edge first.";
        } else if (lower.includes("compression")) {
          botResponse = "Path compression flattens the set tree structure by pointing all traversed nodes directly to the root during find(). This reduces find() checks from O(V) to nearly O(1) in subsequent iterations.";
        } else if (lower.includes("cycle")) {
          botResponse = "Cycle detection is handled via the Union-Find parent check. If find(u) == find(v), u and v belong to the same component, meaning they are already connected. Linking them with a new edge creates a closed loop/cycle, so we skip it.";
        } else if (lower.includes("complexity")) {
          botResponse = "Kruskal's time complexity is O(E log E) due to the sorting step. The Union-Find operations take nearly O(1) time per edge check, making the sort step the dominant factor.";
        }
      } else if (activeTab === "floyd") {
        if (lower.includes("loop") || lower.includes("outer")) {
          botResponse = "Outer loop is k because it represents intermediate steps in dynamic programming. In round k, all paths using vertices 0 to k-1 are finalized. If k were the innermost loop, we would calculate paths using k before finalized paths for smaller values, which violates DP dependency structure.";
        } else if (lower.includes("warshall")) {
          botResponse = "Floyd's computes actual shortest path weights (min/+ formula), whereas Warshall's computes binary connectivity/reachability (OR/AND formula). Both share the O(V³) outer shell.";
        } else if (lower.includes("complexity")) {
          botResponse = "Floyd's algorithm is O(V³) due to three nested loops, each iterating from 0 to V-1. Space is O(V²) for the distance matrix.";
        } else if (lower.includes("negative")) {
          botResponse = "Floyd's handles negative weights. However, if a negative cycle is present, the path distances can loop and decrease infinitely. If dist[i][i] < 0 for any vertex after calculation, a negative cycle exists.";
        }
      } else if (activeTab === "warshall") {
        if (lower.includes("closure") || lower.includes("transitive")) {
          botResponse = "Transitive Closure of a graph shows reachability: cell (i, j) is 1 if there exists a path of any length from node i to node j; otherwise, it is 0.";
        } else if (lower.includes("logic") || lower.includes("formula")) {
          botResponse = "Formula: g[i][j] = g[i][j] || (g[i][k] && g[k][j]). It checks if i can reach j already, OR if i can reach k AND k can reach j.";
        } else if (lower.includes("complexity")) {
          botResponse = "Warshall's time complexity is O(V³) because of the triple nested loop. Space is O(V²) for the boolean adjacency matrix.";
        }
      } else if (activeTab === "dijkstra") {
        if (lower.includes("negative")) {
          botResponse = "Dijkstra's assumes that once a vertex is marked visited, its shortest path is final. If there are negative weights, a longer path with a negative edge discovered later could yield a shorter overall path. Since visited nodes are locked, Dijkstra's misses this adjustment. Use Bellman-Ford for negative weights.";
        } else if (lower.includes("prim")) {
          botResponse = "Prim's selects edges to minimize total tree cost (grow MST). Dijkstra's selects edges to minimize the cumulative distance back to the starting source vertex.";
        } else if (lower.includes("relaxation")) {
          botResponse = "Relaxation is updating the distance of a neighbor: if going through vertex u reduces the distance to neighbor v (dist[u] + weight(u, v) < dist[v]), we update dist[v] with the lower value.";
        }
      } else if (activeTab === "topological_sort") {
        if (lower.includes("indegree")) {
          botResponse = "Indegree of a node is the count of directed edges pointing INTO it. In scheduling, indegree represent outstanding requirements. An indegree of 0 means all prerequisites are met.";
        } else if (lower.includes("cycle")) {
          botResponse = "If a cycle exists, the nodes in the cycle will never have their indegree reduced to 0, so they never enter the queue. If count of output nodes !== V, a cycle exists.";
        } else if (lower.includes("unique")) {
          botResponse = "No. If multiple vertices have an indegree of 0 at the same time, they can be processed in any order, leading to different valid topological sort sequences.";
        }
      } else if (activeTab === "knapsack") {
        if (lower.includes("why table") || lower.includes("size")) {
          botResponse = "Table size is (n+1) × (W+1). Row 0 represents using 0 items (profit is 0). Column 0 represents knapsack capacity of 0 (profit is 0). This provides baseline values to compute subsequent rows.";
        } else if (lower.includes("formula") || lower.includes("recurrence")) {
          botResponse = "If item fits (wt <= w): knap[i][w] = max(skip, take) = max(knap[i-1][w], val[i-1] + knap[i-1][w - wt[i-1]]). If item doesn't fit: knap[i][w] = knap[i-1][w].";
        }
      }

      setChatMessages((prev) => [...prev, { sender: "bot", text: botResponse }]);
    }, 450);
  };

  // Helper lists for drawer buttons
  const getAISuggestions = () => {
    if (activeTab === "dashboard") {
      return ["Explain the syllabus", "Which algorithm uses greedy?", "DP vs Greedy comparison", "Syllabus complexities cheat"];
    } else if (activeTab === "prim") {
      return ["Prim's vs Kruskal's", "Explain O(V²) time", "Explain cost[i][j] == INF", "Differentiate Dijkstra"];
    } else if (activeTab === "kruskal") {
      return ["Why sort edges first?", "Path compression O(1)", "How cycle is avoided?", "Kruskal's complexity"];
    } else if (activeTab === "floyd") {
      return ["Why outer loop is k?", "Floyd vs Warshall", "Floyd time complexity", "Negative cycle check"];
    } else if (activeTab === "warshall") {
      return ["OR-AND logic formula", "Transitive Closure meaning", "Warshall complexity", "Floyd differences"];
    } else if (activeTab === "dijkstra") {
      return ["Why negative weights fail?", "Dijkstra vs Bellman Ford", "Relaxation meaning", "Dijkstra vs Prim"];
    } else if (activeTab === "topological_sort") {
      return ["Cycle detection Kahn's", "What is Indegree?", "Is sorting unique?", "Real-world application"];
    } else if (activeTab === "knapsack") {
      return ["DP vs Greedy Knapsack", "Why table is n+1 size?", "NP-complete meaning", "Recurrence equation"];
    }
    return [];
  };

  // Fetch active algorithm data
  const currentAlgo = ALGORITHMS[activeTab];
  const activeStep = stepIdx >= 0 && stepIdx < steps.length ? steps[stepIdx] : null;

  return (
    <div className="app-container">
      
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={handleTabChange}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        theme={theme}
        onThemeToggle={() => setTheme(prev => (prev === "dark" ? "light" : "dark"))}
      />
      
      {/* Main Container */}
      <main className="main-content">
        <header className="top-nav">
          <div className="welcome-msg">
            <h1>{currentAlgo ? currentAlgo.name : "ADA Lab Companion"}</h1>
            <p>
              {currentAlgo 
                ? `${currentAlgo.lab} • ${currentAlgo.subtitle}` 
                : "Choose an experiment or view the general lab dashboard."}
            </p>
          </div>
          <div>
            <button className="btn btn-primary" onClick={() => { setAiOpen(true); submitQuestion("Explain the syllabus"); }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: "4px" }}>
                <circle cx="12" cy="12" r="10" />
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              Syllabus Help
            </button>
          </div>
        </header>
        
        {/* DASHBOARD ROUTE */}
        {activeTab === "dashboard" && (
          <div>
            <div className="dashboard-grid">
              <div className="card">
                <div className="card-subtitle">Experiment coverage</div>
                <h3 class="card-title">6 Interactive Algorithms</h3>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.92rem", marginTop: "0.5rem", lineHeight: "1.6" }}>
                  Walk through interactive state steps, C source codes, logic highlights, and real dry runs on custom matrices. Covers labs 2, 3a, 3b, 4, 5, and 6.
                </p>
              </div>
              <div className="card">
                <div className="card-subtitle">Active playground</div>
                <h3 class="card-title">Matrix & Data Editors</h3>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.92rem", marginTop: "0.5rem", lineHeight: "1.6" }}>
                  Edit weight matrices, capacity limits, or items directly in our grid interface. The simulators dynamically recalculate steps and traces in real-time.
                </p>
              </div>
              <div className="card">
                <div className="card-subtitle">Exams preparation</div>
                <h3 class="card-title">Interactive Viva Bank</h3>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.92rem", marginTop: "0.5rem", lineHeight: "1.6" }}>
                  Collapsible cards covering crucial questions examiner lists, path compression mechanics, logic equations, complexities, and cycle-detection explanations.
                </p>
              </div>
            </div>

            <div className="card" style={{ marginBottom: "2rem" }}>
              <div className="card-subtitle">Quick Cheat Sheet</div>
              <h2 className="card-title" style={{ fontSize: "1.3rem", marginBottom: "1rem" }}>Core ADA Lab Syllabus & Complexity Summary</h2>
              <div style={{ overflowX: "auto" }}>
                <table className="matrix-table" style={{ width: "100%", minWidth: "600px" }}>
                  <thead>
                    <tr>
                      <td className="hdr">Lab Unit</td>
                      <td class="hdr">Algorithm Title</td>
                      <td class="hdr">Design Paradigm</td>
                      <td class="hdr">Time Complexity</td>
                      <td class="hdr">Space Complexity</td>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.values(ALGORITHMS).map((algo) => (
                      <tr key={algo.id}>
                        <td style={{ padding: "10px", border: "1px solid var(--border-primary)", fontSize: "0.9rem" }}>{algo.lab}</td>
                        <td style={{ padding: "10px", border: "1px solid var(--border-primary)", fontWeight: 500, fontSize: "0.9rem" }}>{algo.name}</td>
                        <td style={{ padding: "10px", border: "1px solid var(--border-primary)", fontSize: "0.9rem" }}>{algo.subtitle.split('(')[1]?.replace(')', '') || "Other"}</td>
                        <td style={{ padding: "10px", border: "1px solid var(--border-primary)", fontFamily: "var(--font-mono)", fontSize: "0.85rem", color: "var(--warning-accent)" }}>{algo.complexities.time.split(' ')[0]}</td>
                        <td style={{ padding: "10px", border: "1px solid var(--border-primary)", fontFamily: "var(--font-mono)", fontSize: "0.85rem" }}>{algo.complexities.space.split(' ')[0]}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ALGORITHM LAB ROUTE */}
        {activeTab !== "dashboard" && currentAlgo && (
          <div className="lab-container">
            
            {/* LEFT CONTAINER: Visualizer & Trace logs */}
            <div className="visualizer-section">
              
              <div className="comparison-grid">
                {currentAlgo.comparison.map((c, i) => (
                  <div className="comparison-card" key={i}>
                    <div className="comparison-card-title">{c.label}</div>
                    <div className="comparison-card-desc">{c.detail}</div>
                  </div>
                ))}
              </div>
              
              <Visualizer
                algo={currentAlgo}
                inputData={algoInputs[activeTab]}
                onInputChange={handleInputChange}
                step={activeStep}
                stepIdx={stepIdx}
                totalSteps={steps.length}
                isPlaying={isPlaying}
                onPlayPause={handlePlayPause}
                onStepNext={handleStepNext}
                onStepPrev={handleStepPrev}
                onReset={handleReset}
                speed={speed}
                onSpeedChange={setSpeed}
              />
              
              {/* Dynamic steps logs timeline */}
              <div className="card">
                <div className="card-subtitle">Dry Run Timeline</div>
                <h3 className="card-title">Action Trace Logs</h3>
                <div className="steps-container" ref={timelineRef}>
                  {steps.slice(0, stepIdx + 1).map((s, idx) => {
                    const isPicked = s.badges && s.badges.some(b => b.t === "success");
                    const isSkipped = s.badges && s.badges.some(b => b.t === "danger");
                    let cardClass = "";
                    if (isPicked) cardClass = "picked";
                    if (isSkipped) cardClass = "skipped";
                    
                    return (
                      <div className={`step-card ${cardClass}`} key={idx}>
                        <div style={{ fontWeight: 600, marginBottom: "2px" }}>Step {idx + 1}</div>
                        <div style={{ fontSize: "0.82rem", color: "var(--text-secondary)", lineHeight: 1.4 }}>{s.traceText}</div>
                      </div>
                    );
                  })}
                  {stepIdx === -1 && (
                    <div style={{ color: "var(--text-tertiary)", fontSize: "0.85rem", padding: "1rem", textAlign: "center" }}>
                      Trace logs empty. Click Play/Next to begin.
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* RIGHT CONTAINER: C Code & Vivas */}
            <div className="visualizer-section">
              <CodeWalkthrough
                code={currentAlgo.code}
                activeLineIdx={activeStep ? activeStep.lineIdx : -1}
                selectedLineIdx={selectedLineIdx}
                onLineClick={handleLineClick}
                explanationText={manualExplanation}
              />
              
              <VivaList viva={currentAlgo.viva} />
            </div>
            
          </div>
        )}
      </main>

      {/* AI ASSISTANT CHAT DRAWER */}
      <button className="ai-assistant-toggle" onClick={() => setAiOpen(prev => !prev)} title="Ask ADA AI Assistant">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      </button>
      
      <div className={`ai-drawer ${aiOpen ? "open" : ""}`}>
        <div className="ai-header">
          <div className="ai-title">
            <div className="logo-icon" style={{ width: "24px", height: "24px", fontSize: "0.75rem" }}>AI</div>
            <span>ADA Tutor Assistant</span>
          </div>
          <button className="close-drawer" onClick={() => setAiOpen(false)}>&times;</button>
        </div>
        
        <div className="ai-messages">
          {chatMessages.map((msg, index) => (
            <div className={`message ${msg.sender}`} key={index}>
              {msg.text.split("\n").map((line, lIdx) => (
                <span key={lIdx}>{line}<br /></span>
              ))}
            </div>
          ))}
        </div>
        
        <div className="quick-prompts">
          {getAISuggestions().map((sug, index) => (
            <button className="quick-btn" key={index} onClick={() => submitQuestion(sug)}>
              {sug}
            </button>
          ))}
        </div>
        
        <div className="ai-input-area">
          <input
            type="text"
            className="ai-input"
            placeholder="Ask a question..."
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={handleAISubmit}
          />
          <button className="btn btn-primary" onClick={() => submitQuestion(chatInput)} style={{ padding: "0.75rem" }}>
            Send
          </button>
        </div>
      </div>
      
    </div>
  );
}
