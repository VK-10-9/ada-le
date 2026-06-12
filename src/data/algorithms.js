// Structured data for Analysis and Design of Algorithms (ADA) Lab Companion
export const ALGORITHMS = {
  prim: {
    id: "prim",
    lab: "Lab 2",
    name: "Prim's Algorithm",
    subtitle: "Minimum Spanning Tree (Vertex-centric)",
    description: "Greedily grows a single Minimum Spanning Tree (MST) from a starting vertex by repeatedly picking the cheapest edge connecting the tree to any unvisited vertex.",
    idea: "Start with a single visited node (e.g., node 0). Find the cheapest edge from any visited node to any unvisited node, add it to the MST, and mark the new node as visited. Repeat until V-1 edges are chosen.",
    complexities: { time: "O(V²) with adjacency matrix (typical lab implementation)", space: "O(V²) for adjacency matrix" },
    comparison: [
      { label: "Prim's (Lab 2)", detail: "Vertex-centric. Grows a single tree. Best for dense graphs. Uses adjacency matrix in labs." },
      { label: "Kruskal's (Lab 2)", detail: "Edge-centric. Merges multiple forest components. Best for sparse graphs. Uses sorted edge list." }
    ],
    defaultInput: {
      vertices: 4,
      matrix: [
        [0, 10, 0, 5],
        [10, 0, 0, 15],
        [0, 0, 0, 4],
        [5, 15, 4, 0]
      ]
    },
    viva: [
      {
        q: "Why do we replace 0 with INF (99999) when the input is 0?",
        a: "In the cost matrix, 0 represents 'no edge'. If we don't replace it with infinity, the algorithm will greedily pick the 0-weight edges as the cheapest, resulting in incorrect calculations."
      },
      {
        q: "Why do we run the outer loop V-1 times?",
        a: "A spanning tree on V vertices always contains exactly V-1 edges. Each iteration picks one edge, so V-1 iterations are required."
      },
      {
        q: "What is the time complexity of the standard adjacency matrix implementation?",
        a: "O(V²). The outer loop runs V-1 times, and the inner loops scan all visited-unvisited pairs, which takes O(V) per step."
      },
      {
        q: "What is the purpose of the visited[] array?",
        a: "It tracks which vertices are already part of the MST. We only check edges from a visited vertex to an unvisited vertex to prevent cycles."
      }
    ],
    code: [
      { c: "int n, cost[100][100], visited[100] = {0};", e: "n = number of vertices. cost[][] = adjacency cost matrix. visited[] = initialized to 0 (all unvisited)." },
      { c: "int mincost = 0;", e: "mincost accumulates the total weight of the MST." },
      { c: "scanf(\"%d\", &n);", e: "Read the number of vertices V." },
      { c: "for (int i = 0; i < n; i++)", e: "Outer loop to read the cost matrix row by row." },
      { c: "  for (int j = 0; j < n; j++) {", e: "Inner loop for columns." },
      { c: "    scanf(\"%d\", &cost[i][j]);", e: "Read weight between node i and j." },
      { c: "    if (cost[i][j] == 0) cost[i][j] = INF;", e: "CRITICAL: Replace 0 (no edge) with INF (99999) so it is never picked as the minimum edge. Diagonal (self-loops) also becomes INF." },
      { c: "  }", e: "" },
      { c: "visited[0] = 1;", e: "Start building the tree from vertex 0. Mark it as visited." },
      { c: "for (int edge = 1; edge < n; edge++) {", e: "Spanning tree needs V-1 edges. This loop runs V-1 times to select one edge per iteration." },
      { c: "  int min = INF, a, b;", e: "Reset min weight for this round. a and b will hold the endpoints of the selected edge." },
      { c: "  for (int i = 0; i < n; i++)", e: "Scan all vertices in the graph." },
      { c: "    if (visited[i])", e: "We only consider vertices 'i' that are already part of the MST." },
      { c: "      for (int j = 0; j < n; j++)", e: "For each visited vertex 'i', scan all other vertices 'j'." },
      { c: "        if (!visited[j] && cost[i][j] < min) {", e: "Vertex j must be UNVISITED (not in MST yet) AND the edge i-j must be cheaper than current min." },
      { c: "          min = cost[i][j]; a = i; b = j;", e: "Update the minimum weight and save the endpoints of this cheapest edge." },
      { c: "        }", e: "" },
      { c: "  printf(\"%d --> %d = %d\\n\", a, b, min);", e: "Print the chosen edge showing connection from visited node 'a' to new node 'b'." },
      { c: "  mincost += min;", e: "Add the edge weight to the total cost." },
      { c: "  visited[b] = 1;", e: "Mark the newly added vertex 'b' as visited. It is now part of the MST tree." },
      { c: "}", e: "" },
      { c: "printf(\"Minimum Cost = %d\\n\", mincost);", e: "Print the final MST cost. All vertices are now spanning." }
    ]
  },
  kruskal: {
    id: "kruskal",
    lab: "Lab 2 (Alt)",
    name: "Kruskal's Algorithm",
    subtitle: "Minimum Spanning Tree (Edge-centric)",
    description: "Sorts all graph edges in ascending order of weight and greedily adds them to the MST, skipping edges that form a cycle using a Disjoint Set Union (DSU) structure.",
    idea: "Initialize each vertex as its own tree. Sort all edges. Take the cheapest edge; if its endpoints belong to different components (no cycle), merge the components and include the edge. Stop when V-1 edges are added.",
    complexities: { time: "O(E log E) for sorting edges", space: "O(V + E) to store parent array and edge list" },
    comparison: [
      { label: "Kruskal's", detail: "Edge-centric. Works by merging forest components. Better for sparse graphs. O(E log E)." },
      { label: "Prim's", detail: "Vertex-centric. Grows a single cohesive tree outwards. Better for dense graphs. O(V²)." }
    ],
    defaultInput: {
      vertices: 4,
      edges: [
        { src: 2, dest: 3, weight: 4 },
        { src: 0, dest: 3, weight: 5 },
        { src: 0, dest: 1, weight: 10 },
        { src: 1, dest: 3, weight: 15 }
      ]
    },
    viva: [
      {
        q: "Why do we sort edges in Kruskal's algorithm?",
        a: "Sorting enables the greedy approach: we always inspect the cheapest available edge first. This guarantees a minimum weight tree."
      },
      {
        q: "What is path compression in the Union-Find structure?",
        a: "During the find() operation, path compression attaches nodes directly to the root of their set, reducing tree height. This flattens the structure and makes subsequent find operations nearly O(1)."
      },
      {
        q: "How does Union-Find detect a cycle?",
        a: "If find(u) == find(v), it means vertices u and v already belong to the same connected component. Adding the edge (u, v) would create a cycle, so we skip it."
      },
      {
        q: "When does Kruskal's terminate?",
        a: "It terminates when we have selected exactly V-1 edges, or when we run out of edges (if the graph is disconnected)."
      }
    ],
    code: [
      { c: "struct Edge { int src, dest, weight; };", e: "Defines a structure to represent an edge with source, destination, and weight." },
      { c: "int parent[100];", e: "Globally tracks parent pointers for Union-Find/Disjoint Set." },
      { c: "int find(int i) {", e: "Function to find the root representative of the set containing element i." },
      { c: "  if (parent[i] != i)", e: "If i is not its own parent, climb up the tree." },
      { c: "    parent[i] = find(parent[i]);", e: "PATH COMPRESSION: Point node directly to root of the tree, optimizing future find calls to O(1)." },
      { c: "  return parent[i];", e: "Return root parent index." },
      { c: "}", e: "" },
      { c: "void unite(int x, int y) {", e: "Merges two disjoint sets." },
      { c: "  parent[find(x)] = find(y);", e: "Find roots of both nodes, and set the parent of x's root to y's root." },
      { c: "}", e: "" },
      { c: "int compare(const void *a, const void *b) {", e: "Comparator function for qsort to sort edges." },
      { c: "  return ((struct Edge*)a)->weight - ((struct Edge*)b)->weight;", e: "Returns difference in weights. Guides sorting in ascending order." },
      { c: "}", e: "" },
      { c: "qsort(edges, E, sizeof(edges[0]), compare);", e: "C Library function to sort the edge array. E is the total number of edges." },
      { c: "for (int i = 0; i < V; i++) parent[i] = i;", e: "Initialize DSU: make every vertex its own parent (disjoint components)." },
      { c: "for (int i = 0; i < E; i++) {", e: "Loop through sorted edges, checking cheapest first." },
      { c: "  int u = edges[i].src, v = edges[i].dest;", e: "Get endpoints of the current cheapest edge." },
      { c: "  if (find(u) != find(v)) {", e: "CYCLE CHECK: If root representatives are different, no cycle is formed." },
      { c: "    printf(...); minCost += edges[i].weight;", e: "Print selected edge, and add weight to running MST cost." },
      { c: "    unite(u, v);", e: "Merge the components containing u and v." },
      { c: "  }", e: "If find(u) == find(v), they are already connected. Skip the edge to avoid a cycle." },
      { c: "}", e: "" }
    ]
  },
  floyd: {
    id: "floyd",
    lab: "Lab 3a",
    name: "Floyd's Algorithm",
    subtitle: "All-Pairs Shortest Path (Dynamic Programming)",
    description: "Computes the shortest path distances between all pairs of vertices in a weighted graph using a triple nested loop.",
    idea: "Iteratively update an all-pairs distance matrix. In step k, check if routing from i to j through intermediate vertex k yields a shorter path: dist[i][j] = min(dist[i][j], dist[i][k] + dist[k][j]).",
    complexities: { time: "O(V³)", space: "O(V²) for the distance matrix" },
    comparison: [
      { label: "Floyd's (Lab 3a)", detail: "All-pairs shortest path. O(V³) time. Handles negative edge weights (but not negative cycles)." },
      { label: "Dijkstra's (Lab 4)", detail: "Single-source shortest path. O(V²) time. Cannot handle negative weights." }
    ],
    defaultInput: {
      vertices: 4,
      matrix: [
        [0, 3, 99999, 7],
        [99999, 0, 2, 99999],
        [99999, 99999, 0, 1],
        [2, 99999, 99999, 0]
      ]
    },
    viva: [
      {
        q: "Why is the intermediate vertex variable k in the outermost loop?",
        a: "To ensure that paths are updated sequentially. If k were inside, we would try to route through k before having finalized shortest paths using intermediate vertices 0 to k-1, violating Dynamic Programming structure."
      },
      {
        q: "Does Floyd's algorithm work with negative edge weights?",
        a: "Yes, it works as long as there are no negative weight cycles. A negative cycle will cause distances to continuously decrease."
      },
      {
        q: "How can we detect a negative cycle using Floyd's?",
        a: "If the distance from any vertex to itself becomes negative (i.e. dist[i][i] < 0) after running the algorithm, a negative cycle is present."
      },
      {
        q: "What does the cell value 99999 signify in Floyd's input?",
        a: "It represents infinity, meaning there is no direct edge between those two vertices."
      }
    ],
    code: [
      { c: "int n, dist[10][10];", e: "n = number of vertices. dist[][] will hold the inputs and eventually the shortest paths." },
      { c: "printf(\"Enter the cost matrix (use 99999 for infinity):\\n\");", e: "Prompt user. Note that 99999 represents unreachable paths." },
      { c: "for (int i=0; i<n; i++)", e: "Loop to read rows." },
      { c: "  for (int j=0; j<n; j++)", e: "Loop to read columns." },
      { c: "    scanf(\"%d\", &dist[i][j]);", e: "Read weights. Self distances (i==j) should be entered as 0." },
      { c: "for (int k=0; k<n; k++)", e: "OUTERMOST LOOP: k is the intermediate vertex. We try routing through k for all pairs." },
      { c: "  for (int i=0; i<n; i++)", e: "MIDDLE LOOP: i is the starting source vertex." },
      { c: "    for (int j=0; j<n; j++)", e: "INNERMOST LOOP: j is the target destination vertex." },
      { c: "      if (dist[i][k] + dist[k][j] < dist[i][j])", e: "CORE RECURRENCE: Check if path i -> k -> j is shorter than direct path i -> j." },
      { c: "        dist[i][j] = dist[i][k] + dist[k][j];", e: "Update cell: record the new shorter distance." },
      { c: "dist[i][j] == INF ? printf(\"INF \") : printf(\"%d \", dist[i][j]);", e: "Display final matrix. If unreachable, print INF, else print shortest path distance." }
    ]
  },
  warshall: {
    id: "warshall",
    lab: "Lab 3b",
    name: "Warshall's Algorithm",
    subtitle: "Transitive Closure (Reachability Matrix)",
    description: "Computes the transitive closure of a directed graph, determining if there is a path of any length from vertex i to vertex j.",
    idea: "Iteratively updates a reachability matrix of 0s and 1s. In step k, we establish: i can reach j if it can already reach j directly, OR if i can reach k AND k can reach j. g[i][j] = g[i][j] || (g[i][k] && g[k][j]).",
    complexities: { time: "O(V³)", space: "O(V²) for binary reachability matrix" },
    comparison: [
      { label: "Warshall's (Lab 3b)", detail: "Computes reachability (transitive closure). Uses logical OR/AND operators. Operates on 0/1 inputs." },
      { label: "Floyd's (Lab 3a)", detail: "Computes shortest distances. Uses min/+ arithmetic operators. Operates on weights and INF." }
    ],
    defaultInput: {
      vertices: 4,
      matrix: [
        [0, 1, 0, 0],
        [0, 0, 1, 0],
        [0, 0, 0, 1],
        [0, 0, 0, 0]
      ]
    },
    viva: [
      {
        q: "What is Transitive Closure?",
        a: "A matrix representation showing if there exists a path of length zero or more from node i to node j. If a path exists, cell is 1; otherwise, it is 0."
      },
      {
        q: "What boolean logic formula does Warshall's use?",
        a: "g[i][j] = g[i][j] || (g[i][k] && g[k][j]). i can reach j if it already could, OR if i can reach k AND k can reach j."
      },
      {
        q: "Do we need weights or INF in Warshall's input?",
        a: "No. Warshall's only requires connectivity (0 for no edge, 1 for edge). No edge weights or infinity designations are required."
      },
      {
        q: "How does Warshall's compare to Floyd's in structure?",
        a: "They have the exact same triple-loop shell (O(V³)). The only difference is Floyd computes values using addition and min, whereas Warshall computes logic using boolean operations."
      }
    ],
    code: [
      { c: "int n, g[10][10];", e: "n = vertices. g[][] is the binary adjacency matrix (1 = edge, 0 = no edge)." },
      { c: "printf(\"Enter the adjacency matrix:\\n\");", e: "Prompt user for binary inputs (0 or 1)." },
      { c: "for (int i=0; i<n; i++)", e: "Row iterator." },
      { c: "  for (int j=0; j<n; j++)", e: "Col iterator." },
      { c: "    scanf(\"%d\", &g[i][j]);", e: "Read connectivity status directly." },
      { c: "for (int k=0; k<n; k++)", e: "OUTER k LOOP: Iterates over the intermediate vertices." },
      { c: "  for (int i=0; i<n; i++)", e: "MIDDLE i LOOP: Iterates over start vertices." },
      { c: "    for (int j=0; j<n; j++)", e: "INNER j LOOP: Iterates over end vertices." },
      { c: "      g[i][j] = g[i][j] || (g[i][k] && g[k][j]);", e: "WARSHALL TRANSITIVE RULE: Update connectivity cell via OR and AND logic." },
      { c: "printf(\"%d \", g[i][j]);", e: "Print reachability status. 1 means reachable, 0 means unreachable." }
    ]
  },
  dijkstra: {
    id: "dijkstra",
    lab: "Lab 4",
    name: "Dijkstra's Algorithm",
    subtitle: "Single-Source Shortest Path (Greedy)",
    description: "Computes the shortest paths from a single source vertex to all other vertices in a weighted graph with non-negative edge weights.",
    idea: "Maintain a dist[] array. Greedily select the unvisited vertex 'u' with the smallest dist[u]. Mark it visited (finalized). Then relax all of u's neighbors: if dist[u] + cost[u][v] < dist[v], update dist[v].",
    complexities: { time: "O(V²) with adjacency matrix (typical lab implementation)", space: "O(V) for distance array, O(V²) for graph matrix" },
    comparison: [
      { label: "Dijkstra's (Lab 4)", detail: "Single-source. O(V²) with adjacency matrix. Doesn't support negative weights." },
      { label: "Floyd's (Lab 3a)", detail: "All-pairs. O(V³). Supports negative weights (no negative cycles)." }
    ],
    defaultInput: {
      vertices: 4,
      source: 0,
      matrix: [
        [0, 2, 99999, 1],
        [2, 0, 3, 99999],
        [99999, 3, 0, 99999],
        [1, 99999, 4, 0]
      ]
    },
    viva: [
      {
        q: "Why does Dijkstra's fail with negative edge weights?",
        a: "Dijkstra locks in the shortest distance once a vertex is marked visited. If a negative weight is discovered later, it could provide a shorter path, but since the vertex is already finalized, the algorithm won't update it."
      },
      {
        q: "Why do we set dist[src] = 0 and visited[src] = 1 separately?",
        a: "To kickstart the algorithm. Source self-distance is 0 and it starts as the first finalized node in the visited set."
      },
      {
        q: "What is the difference between Dijkstra and Prim?",
        a: "They look similar but have different goals: Prim finds a tree of minimum total edge weight (MST). Dijkstra finds the shortest cumulative distance from a single source to all nodes."
      },
      {
        q: "What is the time complexity of Dijkstra's algorithm?",
        a: "O(V²) using an adjacency matrix. If implemented using an adjacency list and min-heap, it is optimized to O((V + E) log V)."
      }
    ],
    code: [
      { c: "int n, cost[100][100], dist[100], visited[100]={0}, src;", e: "n = vertices. cost[][] = adjacency matrix. dist[] = shortest paths from source. visited[] = finalized tracker. src = starting node." },
      { c: "for (int i=0; i<n; i++)", e: "Read cost matrix rows." },
      { c: "  for (int j=0; j<n; j++) {", e: "Read cost matrix columns." },
      { c: "    scanf(\"%d\", &cost[i][j]);", e: "Read weight." },
      { c: "    if (i!=j && cost[i][j]==0) cost[i][j]=INF;", e: "IMPORTANT: 0 (no edge) is converted to INF so it's not picked. We preserve diagonal cost[i][i] = 0." },
      { c: "  }", e: "" },
      { c: "for (int i=0; i<n; i++) dist[i]=cost[src][i];", e: "Initialize dist[] by copying the source row weights. This is our initial path estimate." },
      { c: "dist[src]=0; visited[src]=1;", e: "Source self-distance = 0. Mark source as visited (finalized)." },
      { c: "for (int c=1; c<n-1; c++) {", e: "Main loop: runs V-2 times. (V-1 is sufficient because the last vertex becomes finalized automatically)." },
      { c: "  int min=INF, u;", e: "Reset min weight search. u will hold the index of the closest unvisited vertex." },
      { c: "  for (int i=0; i<n; i++)", e: "Scan unvisited vertices." },
      { c: "    if (!visited[i] && dist[i]<min) { min=dist[i]; u=i; }", e: "Greedily pick the unvisited vertex 'u' with the minimum tentative distance." },
      { c: "  visited[u]=1;", e: "Lock in vertex u: its shortest path from source is now finalized." },
      { c: "  for (int i=0; i<n; i++)", e: "RELAXATION: Scan neighbors of finalized vertex u." },
      { c: "    if (!visited[i] && min+cost[u][i]<dist[i])", e: "Check if path source -> u -> i is shorter than current path estimate dist[i]." },
      { c: "      dist[i]=min+cost[u][i];", e: "Update: record the new shorter distance to node i. Note min is dist[u]." },
      { c: "  }", e: "" },
      { c: "printf(\"%d --> %d = %d\\n\", src, i, dist[i]);", e: "Print shortest path results." }
    ]
  },
  topological_sort: {
    id: "topological_sort",
    lab: "Lab 5",
    name: "Topological Sort",
    subtitle: "Kahn's BFS Algorithm (DAG Dependencies)",
    description: "Linearly orders vertices of a Directed Acyclic Graph (DAG) such that for every directed edge u -> v, u appears before v.",
    idea: "Compute indegrees of all vertices. Enqueue all vertices with indegree 0. While queue is not empty: dequeue v, output it, decrement indegrees of v's neighbors. If a neighbor's indegree hits 0, enqueue it. If count != V, cycle exists.",
    complexities: { time: "O(V + E)", space: "O(V) for queue and indegree array" },
    comparison: [
      { label: "Kahn's (Lab 5)", detail: "BFS-based. Uses indegree count and a queue. Detects cycles explicitly if count != V." },
      { label: "DFS-based Topo", detail: "DFS-based. Uses a recursion stack and pushes nodes to a list/stack on exit. Cycle detection requires tracking back-edges." }
    ],
    defaultInput: {
      vertices: 4,
      matrix: [
        [0, 1, 1, 0],
        [0, 0, 0, 1],
        [0, 0, 0, 1],
        [0, 0, 0, 0]
      ]
    },
    viva: [
      {
        q: "What is Topological Sort only applicable to?",
        a: "Only Directed Acyclic Graphs (DAGs). It requires direction to establish precedence and must be acyclic so dependencies don't loop endlessly."
      },
      {
        q: "How does Kahn's algorithm detect a cycle?",
        a: "If a cycle exists, the vertices in the cycle will never have their indegrees reduced to 0, so they never enter the queue. At the end, if count of processed vertices is less than V, a cycle is detected."
      },
      {
        q: "Is Topological Sort unique?",
        a: "No. If multiple vertices have an indegree of 0 at the same time, they can be processed in any order, resulting in different valid topological sorts."
      },
      {
        q: "What are real-world applications of Topological Sort?",
        a: "Build systems (like Make/Gradle determining file compilation order), package managers (resolving library dependencies), and task scheduling (course prerequisites)."
      }
    ],
    code: [
      { c: "int n, adj[100][100], indeg[100];", e: "n = vertices. adj[][] = adjacency matrix. indeg[] = indegree count for each vertex (number of incoming edges)." },
      { c: "void topologicalSort() {", e: "Main function containing sorting logic." },
      { c: "  int queue[100], front=0, rear=0, count=0;", e: "front/rear manage queue indices. count tracks number of successfully sorted vertices." },
      { c: "  for (int i=0; i<n; i++)", e: "Compute indegrees: loop over all rows." },
      { c: "    for (int j=0; j<n; j++)", e: "Loop over columns to locate edges." },
      { c: "      if (adj[i][j]) indeg[j]++;", e: "If edge i -> j exists, increment indegree of node j." },
      { c: "  for (int i=0; i<n; i++)", e: "Loop to locate starting nodes." },
      { c: "    if (indeg[i]==0) queue[rear++]=i;", e: "Enqueue all nodes with indegree 0 (no prerequisites/dependencies)." },
      { c: "  while (front < rear) {", e: "Kahn's BFS queue iteration loop." },
      { c: "    int v = queue[front++];", e: "Dequeue node 'v' from queue front." },
      { c: "    printf(\"%d \", v);", e: "Output/print node. It is ready because all its requirements have run." },
      { c: "    count++;", e: "Increment processed nodes counter." },
      { c: "    for (int i=0; i<n; i++)", e: "Scan neighbors of processed node v." },
      { c: "      if (adj[v][i] && --indeg[i]==0)", e: "If edge v -> i exists, decrement indegree of neighbor i. If it reaches 0, it has no remaining dependencies." },
      { c: "        queue[rear++]=i;", e: "Enqueue node i since it is now ready to be sorted." },
      { c: "  }", e: "" },
      { c: "  if (count != n)", e: "CYCLE CHECK: If sorted count is not equal to total V, some nodes were never resolved." },
      { c: "    printf(\"\\nGraph has a cycle...\");", e: "Print cycle alert: topological sorting is impossible." }
    ]
  },
  knapsack: {
    id: "knapsack",
    lab: "Lab 6",
    name: "0/1 Knapsack",
    subtitle: "Dynamic Programming (Take or Skip)",
    description: "Finds the maximum value subset of items that can fit into a knapsack of limited weight capacity, without splitting items (0/1 choice).",
    idea: "Build a 2D table knap[i][w] representing max value using first i items and capacity w. Recurrence: if item weight fits, choice is max(skip, take): max(knap[i-1][w], val[i-1] + knap[i-1][w - wt[i-1]]). Otherwise, skip.",
    complexities: { time: "O(n · W) where W is capacity, n is items", space: "O(n · W) for DP table" },
    comparison: [
      { label: "0/1 Knapsack (Lab 6)", detail: "Dynamic Programming. Items cannot be split. Runs in O(n·W) pseudo-polynomial time." },
      { label: "Fractional Knap (Lab 7)", detail: "Greedy. Items can be split. Runs in O(n log n) by sorting value/weight ratios." }
    ],
    defaultInput: {
      capacity: 50,
      items: [
        { name: "Item 1", value: 20, weight: 25 },
        { name: "Item 2", value: 25, weight: 20 },
        { name: "Item 3", value: 40, weight: 30 }
      ]
    },
    viva: [
      {
        q: "Why is it called '0/1' Knapsack?",
        a: "Because items are binary. You either take an item fully (1) or you do not take it at all (0). You cannot take fractions of an item."
      },
      {
        q: "Why is the DP table size (n+1) × (W+1)?",
        a: "To represent baseline states. Row 0 represents using 0 items (yielding 0 value). Column 0 represents knapsack capacity of 0 (yielding 0 value). This avoids off-by-one errors."
      },
      {
        q: "Why does Greedy algorithm fail for 0/1 Knapsack?",
        a: "Greedy choice (selecting highest value-to-weight ratio) can leave unused capacity that could have been filled more optimally by other combinations. Dynamic Programming guarantees checking all valid combinations."
      },
      {
        q: "What is the complexity status of 0/1 Knapsack?",
        a: "It is NP-complete. However, Dynamic Programming solves it in O(n·W) time, which is pseudo-polynomial because W depends on numerical input value."
      }
    ],
    code: [
      { c: "int max(int a, int b) { return a > b ? a : b; }", e: "Helper function returning the larger of two integers." },
      { c: "int knapsack(int W, int wt[], int val[], int n) {", e: "W = capacity, wt[] = weights array, val[] = values array, n = items count." },
      { c: "  int knap[n+1][W+1];", e: "DP table to store solutions of subproblems." },
      { c: "  for (int i=0; i<=n; i++) {", e: "Iterate over first i items (row index)." },
      { c: "    for (int w=0; w<=W; w++) {", e: "Iterate over all knapsack capacities from 0 to W (col index)." },
      { c: "      if (i==0 || w==0)", e: "Base cases: 0 items or 0 capacity." },
      { c: "        knap[i][w] = 0;", e: "Fill base cells with value 0." },
      { c: "      else if (wt[i-1] <= w)", e: "If item weight wt[i-1] is less than capacity w, we can take it." },
      { c: "        knap[i][w] = max(val[i-1] + knap[i-1][w-wt[i-1]],", e: "TAKE ITEM: Add its value, subtract its weight from capacity, add solution of remaining items: val[i-1] + knap[i-1][w - wt[i-1]]." },
      { c: "                         knap[i-1][w]);", e: "SKIP ITEM: Carry forward the maximum value obtained using i-1 items at same capacity w." },
      { c: "      else", e: "Item weight is greater than capacity w (won't fit)." },
      { c: "        knap[i][w] = knap[i-1][w];", e: "Must skip item. Carry forward previous value: knap[i-1][w]." },
      { c: "    }", e: "" },
      { c: "  }", e: "" },
      { c: "  return knap[n][W];", e: "Return final maximum profit from the bottom-right cell." },
      { c: "}", e: "" }
    ]
  }
};
