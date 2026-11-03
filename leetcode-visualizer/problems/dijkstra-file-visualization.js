const DIJKSTRA_FILE_CODE = [
  "import heapq",
  "",
  "def dijkstra(n, graph, start):",
  "    dist = [float(\"inf\")] * n",
  "    dist[start] = 0",
  "",
  "    pq = [(0, start)]",
  "",
  "    while pq:",
  "        d, u = heapq.heappop(pq)",
  "",
  "        if d > dist[u]:",
  "            continue",
  "",
  "        for v, w in graph[u]:",
  "            new_dist = d + w",
  "",
  "            if new_dist < dist[v]:",
  "                dist[v] = new_dist",
  "                heapq.heappush(pq, (new_dist, v))",
  "",
  "    return dist",
  "",
  "# Demo graph",
  "n = 5",
  "graph = [[] for _ in range(n)]",
  "edges = [",
  "    (0, 1, 4),",
  "    (0, 2, 1),",
  "    (2, 1, 2),",
  "    (1, 3, 1),",
  "    (2, 3, 5),",
  "    (3, 4, 3),",
  "]",
  "",
  "for u, v, w in edges:",
  "    graph[u].append((v, w))",
  "",
  "print(dijkstra(n, graph, 0))",
];

function buildSteps9030(input, params = {}) {
  const n = Number(params.n ?? 5);
  const start = Number(params.start ?? 0);
  const rawEdges = String(input ?? "").split(",").map((edge) => edge.trim()).filter(Boolean);
  const edges = rawEdges.map((edge) => {
    const [u, v, w, ...extra] = edge.split("-").map(Number);
    return { u, v, w, extra };
  });
  const valid = Number.isInteger(n) && n >= 1 && n <= 10
    && Number.isInteger(start) && start >= 0 && start < n
    && edges.every(({ u, v, w, extra }) => (
      extra.length === 0
      && Number.isInteger(u) && u >= 0 && u < n
      && Number.isInteger(v) && v >= 0 && v < n
      && Number.isFinite(w) && w >= 0
    ));
  const steps = [];
  const nodes = Array.from({ length: Number.isInteger(n) && n > 0 && n <= 10 ? n : 0 }, (_, node) => node);
  const distances = Array(nodes.length).fill(Infinity);
  const heap = [];
  const finalized = new Set();
  const graph = Array.from({ length: nodes.length }, () => []);
  const formatDistance = (distance) => distance === Infinity ? "∞" : String(distance);

  function makeGraph(hlNodes = [], hlEdges = [], annotations = {}) {
    return {
      nodes: nodes.map((id) => ({ id, label: String(id) })),
      edges,
      hlNodes,
      hlEdges,
      visitedNodes: [...finalized],
      annotations: { [start]: "source", ...annotations },
      dimUnfocused: true,
    };
  }

  function snapshot(options) {
    const {
      phase = "build",
      currentNode = null,
      edge = null,
      candidate = null,
      oldDistance = null,
      improves = null,
      title,
      note,
      codeLine,
      vars = [],
      final = false,
      hlNodes = [],
      hlEdges = [],
    } = options;
    steps.push({
      title,
      arr: [],
      graph: makeGraph(hlNodes, hlEdges),
      dijkstraFileView: {
        phase,
        n: nodes.length,
        start,
        adjacency: graph.map((neighbors) => neighbors.map(([v, w]) => [v, w])),
        distances: distances.map((value, node) => ({
          node,
          value: formatDistance(value),
          isSource: node === start,
          isCurrent: node === currentNode,
          isFinalized: finalized.has(node),
          isCandidate: Boolean(edge && node === edge.v),
        })),
        heap: heap.map(([distance, node]) => ({ distance, node })),
        currentNode,
        activeEdge: edge,
        candidate,
        oldDistance: oldDistance === Infinity ? "∞" : oldDistance,
        improves,
        answer: options.answer,
      },
      highlight: [],
      mark: [],
      final,
      codeLines: [codeLine],
      vars,
      note,
    });
  }

  if (!valid) {
    steps.push({
      title: { vi: "Đầu vào không hợp lệ", en: "Invalid input" },
      arr: [],
      dijkstraFileView: {
        phase: "invalid",
        error: {
          vi: "Nhập cạnh theo dạng u-v-w, cách nhau bằng dấu phẩy. Node phải thuộc 0..n-1, n từ 1 đến 10, start hợp lệ và trọng số không âm.",
          en: "Enter edges as u-v-w separated by commas. Nodes must be in 0..n-1, n must be 1..10, start must be valid, and weights must be non-negative.",
        },
        n: nodes.length,
        start,
        adjacency: graph,
        distances: [],
        heap: [],
      },
      final: true,
      codeLines: [3],
      vars: [{ name: "answer", value: "invalid input" }],
      note: {
        vi: "Kiểm tra lại n, start và định dạng cạnh u-v-w.",
        en: "Check n, start, and the u-v-w edge format.",
      },
    });
    return { edges: rawEdges, n, start, answer: null, steps };
  }

  snapshot({
    title: { vi: "Tạo graph rỗng", en: "Create an empty graph" },
    phase: "build",
    codeLine: 26,
    vars: [{ name: "graph", value: `n = ${n} danh sách kề rỗng` }],
    note: {
      vi: `Tạo ${n} danh sách kề, tương ứng các node 0 đến ${n - 1}.`,
      en: `Create ${n} adjacency lists for nodes 0 through ${n - 1}.`,
    },
  });

  for (const edge of edges) {
    graph[edge.u].push([edge.v, edge.w]);
    snapshot({
      title: { vi: `Thêm cạnh ${edge.u} → ${edge.v}`, en: `Add edge ${edge.u} → ${edge.v}` },
      phase: "build",
      codeLine: 37,
      edge,
      hlNodes: [edge.u, edge.v],
      hlEdges: [[edge.u, edge.v]],
      vars: [{ name: `graph[${edge.u}]`, value: graph[edge.u].map(([v, w]) => `(${v}, ${w})`).join(", ") }],
      note: {
        vi: `Cạnh có hướng ${edge.u} → ${edge.v} tốn ${edge.w}. Chỉ thêm vào graph[${edge.u}], không tự thêm chiều ngược lại.`,
        en: `The directed edge ${edge.u} → ${edge.v} costs ${edge.w}. Add it to graph[${edge.u}] only; the reverse edge is not implied.`,
      },
    });
  }

  snapshot({
    title: { vi: "dist = [∞] * n", en: "dist = [∞] * n" },
    phase: "init",
    codeLine: 4,
    vars: [{ name: "dist", value: `[${distances.map(formatDistance).join(", ")}]` }],
    note: {
      vi: "Ban đầu chưa biết đường tới node nào, nên tất cả khoảng cách được đặt là ∞.",
      en: "No routes are known yet, so every distance starts at ∞.",
    },
  });

  distances[start] = 0;
  snapshot({
    title: { vi: `dist[${start}] = 0`, en: `dist[${start}] = 0` },
    phase: "init",
    codeLine: 5,
    currentNode: start,
    hlNodes: [start],
    vars: [{ name: "dist", value: `[${distances.map(formatDistance).join(", ")}]` }],
    note: {
      vi: "Khoảng cách từ node nguồn đến chính nó bằng 0; các node khác chưa biết nên là ∞.",
      en: "The source is zero distance from itself; all other distances are unknown, so they start at ∞.",
    },
  });

  heap.push([0, start]);
  snapshot({
    title: { vi: `pq = [(0, ${start})]`, en: `pq = [(0, ${start})]` },
    phase: "init",
    codeLine: 7,
    currentNode: start,
    hlNodes: [start],
    vars: [{ name: "pq", value: `[(0, ${start})]` }],
    note: {
      vi: "Min-heap lưu (khoảng cách, node). Phần tử nhỏ nhất nằm ở gốc và sẽ được lấy ra trước.",
      en: "The min-heap stores (distance, node). Its smallest entry is at the root and is popped next.",
    },
  });

  const less = (left, right) => left[0] < right[0] || (left[0] === right[0] && left[1] < right[1]);
  const pushHeap = (item) => {
    heap.push(item);
    let index = heap.length - 1;
    while (index > 0) {
      const parent = Math.floor((index - 1) / 2);
      if (!less(heap[index], heap[parent])) break;
      [heap[index], heap[parent]] = [heap[parent], heap[index]];
      index = parent;
    }
  };
  const popHeap = () => {
    const root = heap[0];
    const last = heap.pop();
    if (heap.length) {
      heap[0] = last;
      let index = 0;
      while (true) {
        const left = index * 2 + 1;
        const right = left + 1;
        let smallest = index;
        if (left < heap.length && less(heap[left], heap[smallest])) smallest = left;
        if (right < heap.length && less(heap[right], heap[smallest])) smallest = right;
        if (smallest === index) break;
        [heap[index], heap[smallest]] = [heap[smallest], heap[index]];
        index = smallest;
      }
    }
    return root;
  };

  while (heap.length) {
    const [distance, u] = popHeap();
    snapshot({
      title: { vi: `heappop → (${distance}, ${u})`, en: `heappop → (${distance}, ${u})` },
      phase: "pop",
      codeLine: 10,
      currentNode: u,
      hlNodes: [u],
      vars: [
        { name: "d", value: distance },
        { name: "u", value: u },
        { name: "pq", value: `[${heap.map(([d, node]) => `(${d}, ${node})`).join(", ")}]` },
      ],
      note: {
        vi: `Lấy (${distance}, ${u}) vì đây là phần tử nhỏ nhất của min-heap.`,
        en: `Pop (${distance}, ${u}) because it is the smallest entry in the min-heap.`,
      },
    });

    const stale = distance > distances[u];
    snapshot({
      title: stale
        ? { vi: `${distance} > dist[${u}] = ${distances[u]} → bản ghi cũ`, en: `${distance} > dist[${u}] = ${distances[u]} → stale entry` }
        : { vi: `${distance} > dist[${u}]? Không`, en: `${distance} > dist[${u}]? No` },
      phase: stale ? "stale" : "check",
      codeLine: 12,
      currentNode: u,
      hlNodes: [u],
      vars: [
        { name: "d", value: distance },
        { name: `dist[${u}]`, value: distances[u] },
        { name: "bản ghi cũ?", value: stale },
      ],
      note: stale
        ? {
            vi: `Đường tới node ${u} đã được cải thiện thành ${distances[u]}. Bản ghi ${distance} không còn hữu ích, nên continue bỏ qua các cạnh đi ra.`,
            en: `A better route to node ${u} has already been found with distance ${distances[u]}. Skip this outdated ${distance} entry without exploring its edges.`,
          }
        : {
            vi: `Giá trị vừa lấy vẫn bằng dist[${u}], nên đây là khoảng cách tốt nhất hiện biết và có thể mở rộng.`,
            en: `The popped value still matches dist[${u}], so it is the best known distance and can be expanded.`,
          },
    });
    if (stale) continue;

    finalized.add(u);
    for (const [v, weight] of graph[u]) {
      const edge = { u, v, w: weight };
      snapshot({
        title: { vi: `Xét cạnh ${u} → ${v} (trọng số ${weight})`, en: `Inspect edge ${u} → ${v} (weight ${weight})` },
        phase: "inspect",
        codeLine: 15,
        currentNode: u,
        edge,
        hlNodes: [u, v],
        hlEdges: [[u, v]],
        vars: [{ name: "u, v, w", value: `${u}, ${v}, ${weight}` }],
        note: {
          vi: `Thử đi từ node ${u} sang ${v}; cộng trọng số cạnh vào khoảng cách hiện tại.`,
          en: `Try going from node ${u} to ${v}; add this edge's weight to the current distance.`,
        },
      });

      const newDistance = distance + weight;
      const improves = newDistance < distances[v];
      const oldDistance = distances[v];
      snapshot({
        title: { vi: `${distance} + ${weight} = ${newDistance}`, en: `${distance} + ${weight} = ${newDistance}` },
        phase: "compare",
        codeLine: 17,
        currentNode: u,
        edge,
        candidate: newDistance,
        oldDistance,
        improves,
        hlNodes: [u, v],
        hlEdges: [[u, v]],
        vars: [
          { name: "new_dist", value: newDistance },
          { name: `dist[${v}]`, value: formatDistance(oldDistance) },
        ],
        note: improves
          ? {
              vi: `Đi qua ${u} cho khoảng cách ${newDistance}, ngắn hơn ${formatDistance(oldDistance)} đang lưu ở node ${v}.`,
              en: `Going through ${u} gives distance ${newDistance}, improving on ${formatDistance(oldDistance)} for node ${v}.`,
            }
          : {
              vi: `${newDistance} không nhỏ hơn ${formatDistance(oldDistance)}, nên đường này không cải thiện dist[${v}].`,
              en: `${newDistance} is not less than ${formatDistance(oldDistance)}, so this route does not improve dist[${v}].`,
            },
      });
      if (!improves) continue;

      distances[v] = newDistance;
      snapshot({
        title: { vi: `dist[${v}] = ${newDistance}`, en: `dist[${v}] = ${newDistance}` },
        phase: "update",
        codeLine: 19,
        currentNode: u,
        edge,
        candidate: newDistance,
        oldDistance,
        improves: true,
        hlNodes: [v],
        hlEdges: [[u, v]],
        vars: [{ name: "dist", value: `[${distances.map(formatDistance).join(", ")}]` }],
        note: {
          vi: `Ghi nhận khoảng cách ngắn nhất tạm thời mới tới node ${v}.`,
          en: `Record the improved tentative shortest distance to node ${v}.`,
        },
      });
      pushHeap([newDistance, v]);
      snapshot({
        title: { vi: `heappush((${newDistance}, ${v}))`, en: `heappush((${newDistance}, ${v}))` },
        phase: "push",
        codeLine: 20,
        currentNode: u,
        edge,
        candidate: newDistance,
        oldDistance,
        improves: true,
        hlNodes: [v],
        hlEdges: [[u, v]],
        vars: [{ name: "pq", value: `[${heap.map(([d, node]) => `(${d}, ${node})`).join(", ")}]` }],
        note: {
          vi: "Thêm khoảng cách mới vào min-heap để xử lý node này sau khi nó trở thành nhỏ nhất.",
          en: "Push the improved distance into the min-heap so the node can be processed when it reaches the root.",
        },
      });
    }
  }

  snapshot({
    title: { vi: "Heap rỗng → trả về dist", en: "Heap is empty → return dist" },
    phase: "done",
    codeLine: 22,
    final: true,
    answer: distances.map((distance) => (distance === Infinity ? "∞" : distance)),
    vars: [{ name: "dist", value: `[${distances.map(formatDistance).join(", ")}]` }],
    note: {
      vi: "Không còn đường đi nào có thể cải thiện. dist[i] là khoảng cách ngắn nhất từ start tới node i; ∞ nghĩa là không tới được.",
      en: "No remaining route can improve a distance. dist[i] is the shortest distance from start to node i; ∞ means unreachable.",
    },
  });

  return {
    edges: rawEdges,
    n,
    start,
    answer: distances.map((distance) => (distance === Infinity ? "∞" : distance)),
    steps,
  };
}

module.exports = {
  9030: {
    id: 9030,
    difficulty: "medium",
    category: { key: "graph", vi: "Đồ thị", en: "Graph" },
    tags: [{ key: "dijkstra", vi: "Dijkstra", en: "Dijkstra" }],
    title: { vi: "Dijkstra — Khoảng cách từ một nguồn", en: "Dijkstra — Shortest Paths from a Source" },
    titleVi: { vi: "Dijkstra — Khoảng cách từ một nguồn", en: "Dijkstra — shortest paths from a source" },
    statement: {
      vi: "Mô phỏng hàm dijkstra(n, graph, start) trong Dijistra.py. Đồ thị có hướng, node đánh số từ 0, trọng số không âm. Nhập cạnh theo dạng u-v-w, phân cách bằng dấu phẩy.",
      en: "Trace the dijkstra(n, graph, start) function from Dijistra.py. The graph is directed, nodes are zero-indexed, and weights are non-negative. Enter edges as u-v-w, separated by commas.",
    },
    defaultInput: "0-1-4,0-2-1,2-1-2,1-3-1,2-3-5,3-4-3",
    inputKind: "string",
    inputLabel: { vi: "Cạnh (u-v-w, cách bởi dấu phẩy)", en: "Edges (u-v-w, comma separated)" },
    extraParams: [
      { key: "n", label: { vi: "n (số node)", en: "n (number of nodes)" }, default: 5 },
      { key: "start", label: { vi: "start (node nguồn)", en: "start (source node)" }, default: 0 },
    ],
    approach: [
      { vi: "Tạo danh sách kề có hướng graph[u] = [(v, w), ...].", en: "Build the directed adjacency list graph[u] = [(v, w), ...]." },
      { vi: "Khởi tạo dist[start] = 0; các node khác bằng ∞. Min-heap bắt đầu bằng (0, start).", en: "Initialize dist[start] = 0 and all other nodes to ∞. Start the min-heap with (0, start)." },
      { vi: "Lấy khoảng cách nhỏ nhất trước. Nếu d > dist[u], đây là bản ghi cũ và cần bỏ qua.", en: "Pop the smallest distance first. If d > dist[u], the heap entry is stale and should be skipped." },
      { vi: "Thử từng cạnh u → v: nếu d + w nhỏ hơn dist[v], cập nhật dist[v] và thêm trạng thái mới vào heap.", en: "Try each edge u → v: if d + w is smaller than dist[v], update dist[v] and push the new state." },
    ],
    complexity: {
      time: "O((V + E) log V)",
      space: "O(V + E)",
      note: {
        vi: "Mỗi lần cải thiện khoảng cách, một trạng thái được thêm vào min-heap.",
        en: "Each successful distance improvement adds a state to the min-heap.",
      },
    },
    code: DIJKSTRA_FILE_CODE,
    builder: buildSteps9030,
  },
};
