"use strict";

const MAX_N = 24;
const MAX_QUERIES = 32;

const bi = (vi, en) => ({ vi, en });

const SOURCE = Object.freeze([
  "class Solution:",
  "    def minOperationsQueries(self, n, edges, queries):",
  "        graph = [[] for _ in range(n)]",
  "        for u, v, weight in edges:",
  "            graph[u].append((v, weight))",
  "            graph[v].append((u, weight))",
  "",
  "        LOG = n.bit_length()",
  "        up = [[0] * n for _ in range(LOG)]",
  "        depth = [0] * n",
  "        prefix = [[0] * 27 for _ in range(n)]",
  "",
  "        up[0][0] = 0",
  "        order = [0]",
  "        for node in order:",
  "            for nei, weight in graph[node]:",
  "                if nei == up[0][node]:",
  "                    continue",
  "                up[0][nei] = node",
  "                depth[nei] = depth[node] + 1",
  "                prefix[nei] = prefix[node].copy()",
  "                prefix[nei][weight] += 1",
  "                order.append(nei)",
  "",
  "        for jump in range(1, LOG):",
  "            for node in range(n):",
  "                up[jump][node] = up[jump - 1][up[jump - 1][node]]",
  "",
  "        def lca(a, b):",
  "            if depth[a] < depth[b]:",
  "                a, b = b, a",
  "            diff = depth[a] - depth[b]",
  "            for bit in range(LOG):",
  "                if diff >> bit & 1:",
  "                    a = up[bit][a]",
  "            if a == b:",
  "                return a",
  "            for bit in range(LOG - 1, -1, -1):",
  "                if up[bit][a] != up[bit][b]:",
  "                    a, b = up[bit][a], up[bit][b]",
  "            return up[0][a]",
  "",
  "        answer = []",
  "        for u, v in queries:",
  "            ancestor = lca(u, v)",
  "            path_len = depth[u] + depth[v] - 2 * depth[ancestor]",
  "            counts = [prefix[u][w] + prefix[v][w] - 2 * prefix[ancestor][w] for w in range(1, 27)]",
  "            keep = max(counts, default=0)",
  "            answer.append(path_len - keep)",
  "        return answer",
]);

function fail(ErrorType, vi, en) {
  throw new ErrorType(`#2846: ${vi} / ${en}`);
}

function parseRecords(value, name, width, options = {}) {
  const { allowEmpty = false, maxRecords = Number.MAX_SAFE_INTEGER } = options;
  let records;
  if (Array.isArray(value)) {
    records = value;
  } else if (typeof value === "string") {
    const text = value.trim();
    if (!text) {
      if (allowEmpty) return [];
      fail(TypeError, `${name} không được rỗng`, `${name} must not be empty`);
    }
    if (text.startsWith("[")) {
      try {
        records = JSON.parse(text);
      } catch (_error) {
        fail(TypeError, `${name} phải là JSON hợp lệ`, `${name} must be valid JSON`);
      }
    } else {
      records = text.split(";").map((record) => record.split(",").map((token) => Number(token.trim())));
    }
  } else {
    fail(TypeError, `${name} phải là mảng hoặc chuỗi`, `${name} must be an array or string`);
  }
  if (!Array.isArray(records) || (!allowEmpty && records.length === 0) || records.length > maxRecords) {
    fail(RangeError, `${name} có số phần tử không hợp lệ`, `${name} has an invalid number of entries`);
  }
  return records.map((record) => {
    if (!Array.isArray(record) || record.length !== width || !record.every(Number.isSafeInteger)) {
      fail(TypeError, `mỗi phần tử ${name} phải có ${width} số nguyên`, `every ${name} entry must contain ${width} integers`);
    }
    return [...record];
  });
}

function parse2846(input, params = {}) {
  const n = Number(params.n);
  if (!Number.isSafeInteger(n) || n < 1 || n > MAX_N) {
    fail(RangeError, `n phải trong [1, ${MAX_N}]`, `n must be in [1, ${MAX_N}]`);
  }
  const edges = parseRecords(input, "edges", 3, { allowEmpty: n === 1, maxRecords: MAX_N - 1 });
  const queries = parseRecords(params.queries, "queries", 2, { maxRecords: MAX_QUERIES });
  if (edges.length !== n - 1) {
    fail(RangeError, `cây n node phải có đúng n-1 cạnh`, `an n-node tree must contain exactly n-1 edges`);
  }

  const parent = Array.from({ length: n }, (_, index) => index);
  const find = (node) => {
    while (parent[node] !== node) {
      parent[node] = parent[parent[node]];
      node = parent[node];
    }
    return node;
  };
  const seenEdges = new Set();
  for (const [u, v, weight] of edges) {
    if (u < 0 || u >= n || v < 0 || v >= n || u === v) {
      fail(RangeError, `endpoint cạnh phải là hai node khác nhau trong [0,n)`, `edge endpoints must be distinct nodes in [0,n)`);
    }
    if (weight < 1 || weight > 26) {
      fail(RangeError, `trọng số cạnh phải trong [1,26]`, `edge weights must be in [1,26]`);
    }
    const key = u < v ? `${u},${v}` : `${v},${u}`;
    if (seenEdges.has(key)) fail(RangeError, `không được có cạnh trùng`, `duplicate edges are not allowed`);
    seenEdges.add(key);
    const rootU = find(u);
    const rootV = find(v);
    if (rootU === rootV) fail(RangeError, `edges chứa chu trình`, `edges contain a cycle`);
    parent[rootU] = rootV;
  }
  if (n > 1 && new Set(Array.from({ length: n }, (_, node) => find(node))).size !== 1) {
    fail(RangeError, `edges phải tạo thành một cây liên thông`, `edges must form one connected tree`);
  }
  for (const [u, v] of queries) {
    if (u < 0 || u >= n || v < 0 || v >= n) {
      fail(RangeError, `endpoint query phải trong [0,n)`, `query endpoints must be in [0,n)`);
    }
  }
  return { n, edges, queries };
}

function buildSteps2846(input, params = {}) {
  const { n, edges, queries } = parse2846(input, params);
  const graph = Array.from({ length: n }, () => []);
  for (const [u, v, weight] of edges) {
    graph[u].push([v, weight]);
    graph[v].push([u, weight]);
  }
  graph.forEach((neighbors) => neighbors.sort((a, b) => a[0] - b[0]));

  const LOG = Math.max(1, Math.ceil(Math.log2(n + 1)));
  const up = Array.from({ length: LOG }, () => Array(n).fill(0));
  const depth = Array(n).fill(0);
  const prefix = Array.from({ length: n }, () => Array(27).fill(0));
  const parentWeight = Array(n).fill(0);
  const children = Array.from({ length: n }, () => []);
  const order = [0];
  const visited = new Set([0]);
  const steps = [];
  const answers = [];
  let queryIndex = -1;
  let activeQuery = null;
  let activeNodes = [];
  let activeEdges = [];
  let currentNode = null;
  let ancestor = null;
  let frequencies = Array(26).fill(0);
  let pathLength = null;
  let maxFrequency = null;
  let lift = null;

  const edgeKey = (u, v) => u < v ? `${u},${v}` : `${v},${u}`;
  const source = (line) => SOURCE[line - 1] || "";
  const snapshotView = (phase, event, line) => ({
    problemId: 2846,
    phase,
    event,
    line,
    source: source(line),
    n,
    log: LOG,
    edges: edges.map(([u, v, weight]) => ({ u, v, weight })),
    parent: [...up[0]],
    parentWeight: [...parentWeight],
    depth: [...depth],
    up: up.map((row) => [...row]),
    prefix: prefix.map((row) => row.slice(1)),
    visited: [...visited],
    queryIndex,
    queryCount: queries.length,
    queries: queries.map((query) => [...query]),
    query: activeQuery ? [...activeQuery] : null,
    currentNode,
    activeNodes: [...activeNodes],
    activeEdges: [...activeEdges],
    ancestor,
    frequencies: [...frequencies],
    pathLength,
    maxFrequency,
    lift: lift ? { ...lift } : null,
    answers: [...answers],
  });

  function push({ phase, event, line, title, note, vars = [], final = false }) {
    steps.push({
      title,
      note,
      arr: [],
      highlight: [],
      mark: [],
      codeLines: [line],
      vars,
      final,
      edgeEquilibrium2846View: { ...snapshotView(phase, event, line), final },
    });
  }

  push({
    phase: "setup",
    event: "build-graph",
    line: 3,
    title: bi(`Dựng cây ${n} node`, `Build the ${n}-node tree`),
    note: bi("Chọn node 0 làm gốc để định nghĩa depth, ancestor và prefix frequency.", "Root the tree at node 0 to define depth, ancestors, and prefix frequencies."),
    vars: [{ name: "n", value: n }, { name: "LOG", value: LOG }],
  });

  for (let index = 0; index < order.length; index += 1) {
    const node = order[index];
    currentNode = node;
    for (const [neighbor, weight] of graph[node]) {
      if (neighbor === up[0][node] || visited.has(neighbor)) continue;
      up[0][neighbor] = node;
      depth[neighbor] = depth[node] + 1;
      prefix[neighbor] = [...prefix[node]];
      prefix[neighbor][weight] += 1;
      parentWeight[neighbor] = weight;
      children[node].push(neighbor);
      order.push(neighbor);
      visited.add(neighbor);
      currentNode = neighbor;
      activeNodes = [node, neighbor];
      activeEdges = [edgeKey(node, neighbor)];
      frequencies = prefix[neighbor].slice(1);
      lift = null;
      push({
        phase: "preprocess",
        event: "orient-edge",
        line: 22,
        title: bi(`0→${neighbor}: depth=${depth[neighbor]}, thêm weight ${weight}`, `0→${neighbor}: depth=${depth[neighbor]}, add weight ${weight}`),
        note: bi(`Copy prefix của parent ${node}, rồi tăng bucket weight ${weight}.`, `Copy parent ${node}'s prefix, then increment weight bucket ${weight}.`),
        vars: [
          { name: "parent", value: `${neighbor} ← ${node}` },
          { name: "depth", value: depth[neighbor] },
          { name: `prefix[${neighbor}][${weight}]`, value: prefix[neighbor][weight] },
        ],
      });
    }
  }

  activeNodes = [];
  activeEdges = [];
  currentNode = null;
  frequencies = Array(26).fill(0);
  for (let jump = 1; jump < LOG; jump += 1) {
    for (let node = 0; node < n; node += 1) {
      up[jump][node] = up[jump - 1][up[jump - 1][node]];
    }
    lift = { side: "table", bit: jump, distance: 2 ** jump };
    push({
      phase: "preprocess",
      event: "build-jump-level",
      line: 27,
      title: bi(`Dựng ancestor 2^${jump} = ${2 ** jump} bước`, `Build 2^${jump} = ${2 ** jump}-step ancestors`),
      note: bi("Mỗi ô ghép hai bước nhảy 2^(jump-1).", "Each cell composes two 2^(jump-1) jumps."),
      vars: [{ name: "jump", value: jump }, { name: `up[${jump}]`, value: `[${up[jump].join(", ")}]` }],
    });
  }

  function pathFor(u, v, lcaNode) {
    const left = [];
    const right = [];
    let node = u;
    while (node !== lcaNode) {
      left.push(node);
      node = up[0][node];
    }
    left.push(lcaNode);
    node = v;
    while (node !== lcaNode) {
      right.push(node);
      node = up[0][node];
    }
    const nodes = [...left, ...right.reverse()];
    return {
      nodes,
      edgeKeys: nodes.slice(1).map((item, index) => edgeKey(nodes[index], item)),
    };
  }

  function tracedLca(originalU, originalV) {
    let a = originalU;
    let b = originalV;
    if (depth[a] < depth[b]) {
      [a, b] = [b, a];
      activeNodes = [a, b];
      lift = { side: "swap", from: originalU, to: a, other: b };
      push({
        phase: "lca",
        event: "swap-deeper",
        line: 31,
        title: bi(`Đưa node sâu hơn về a: a=${a}, b=${b}`, `Put the deeper node in a: a=${a}, b=${b}`),
        note: bi("Luôn nâng node sâu hơn trước.", "Always lift the deeper node first."),
      });
    }
    const diff = depth[a] - depth[b];
    for (let bit = 0; bit < LOG; bit += 1) {
      if ((diff >> bit) & 1) {
        const from = a;
        a = up[bit][a];
        activeNodes = [from, a, b];
        lift = { side: "a", bit, from, to: a, other: b, reason: "align-depth" };
        push({
          phase: "lca",
          event: "lift-depth",
          line: 35,
          title: bi(`Nâng a ${2 ** bit} bước: ${from} → ${a}`, `Lift a by ${2 ** bit}: ${from} → ${a}`),
          note: bi(`Bit ${bit} của chênh lệch depth đang bật.`, `Bit ${bit} of the depth difference is set.`),
          vars: [{ name: "depth diff", value: diff }, { name: "bit", value: bit }],
        });
      }
    }
    if (a === b) {
      lift = { side: "done", from: a, to: a, reason: "met-after-align" };
      return a;
    }
    for (let bit = LOG - 1; bit >= 0; bit -= 1) {
      if (up[bit][a] !== up[bit][b]) {
        const fromA = a;
        const fromB = b;
        a = up[bit][a];
        b = up[bit][b];
        activeNodes = [fromA, fromB, a, b];
        lift = { side: "both", bit, from: fromA, to: a, otherFrom: fromB, otherTo: b, reason: "stay-below-lca" };
        push({
          phase: "lca",
          event: "lift-both",
          line: 39,
          title: bi(`Nâng cả hai 2^${bit}: ${fromA}→${a}, ${fromB}→${b}`, `Lift both by 2^${bit}: ${fromA}→${a}, ${fromB}→${b}`),
          note: bi("Hai ancestor còn khác nhau, nên bước nhảy này vẫn nằm dưới LCA.", "The two ancestors still differ, so this jump remains below the LCA."),
          vars: [{ name: "bit", value: bit }, { name: "a, b", value: `${a}, ${b}` }],
        });
      }
    }
    lift = { side: "done", from: a, to: up[0][a], other: b, reason: "parent-is-lca" };
    return up[0][a];
  }

  for (let index = 0; index < queries.length; index += 1) {
    const [u, v] = queries[index];
    queryIndex = index;
    activeQuery = [u, v];
    ancestor = null;
    frequencies = Array(26).fill(0);
    pathLength = null;
    maxFrequency = null;
    lift = null;
    currentNode = null;
    activeNodes = [u, v];
    activeEdges = [];
    push({
      phase: "query",
      event: "start-query",
      line: 44,
      title: bi(`Query ${index + 1}: ${u} ↔ ${v}`, `Query ${index + 1}: ${u} ↔ ${v}`),
      note: bi("Bước 1 tìm LCA, bước 2 trừ hai prefix frequency.", "Step 1 finds the LCA; step 2 subtracts the two prefix-frequency vectors."),
      vars: [{ name: "u, v", value: `${u}, ${v}` }],
    });

    ancestor = tracedLca(u, v);
    const path = pathFor(u, v, ancestor);
    activeNodes = path.nodes;
    activeEdges = path.edgeKeys;
    lift = { side: "done", to: ancestor, reason: "lca-found" };
    push({
      phase: "lca",
      event: "lca-found",
      line: 45,
      title: bi(`LCA(${u}, ${v}) = ${ancestor}`, `LCA(${u}, ${v}) = ${ancestor}`),
      note: bi("Đường query tách thành u→LCA và LCA→v.", "The query path splits into u→LCA and LCA→v."),
      vars: [{ name: "ancestor", value: ancestor }],
    });

    pathLength = depth[u] + depth[v] - 2 * depth[ancestor];
    frequencies = Array.from({ length: 26 }, (_, offset) => {
      const weight = offset + 1;
      return prefix[u][weight] + prefix[v][weight] - 2 * prefix[ancestor][weight];
    });
    maxFrequency = Math.max(0, ...frequencies);
    push({
      phase: "frequency",
      event: "subtract-prefixes",
      line: 47,
      title: bi("Đếm trọng số trên đúng path bằng hiệu prefix", "Count weights on the exact path by subtracting prefixes"),
      note: bi("freq[w] = prefix[u][w] + prefix[v][w] − 2×prefix[LCA][w].", "freq[w] = prefix[u][w] + prefix[v][w] − 2×prefix[LCA][w]."),
      vars: [
        { name: "path_len", value: pathLength },
        { name: "weight counts", value: frequencies.map((count, offset) => count ? `${offset + 1}:${count}` : null).filter(Boolean).join(", ") || "none" },
      ],
    });

    const answer = pathLength - maxFrequency;
    answers.push(answer);
    push({
      phase: "answer",
      event: "answer-query",
      line: 49,
      title: bi(`${pathLength} cạnh − giữ ${maxFrequency} cạnh cùng weight = ${answer}`, `${pathLength} edges − keep ${maxFrequency} equal-weight edges = ${answer}`),
      note: bi("Đổi mọi cạnh không thuộc nhóm trọng số xuất hiện nhiều nhất.", "Change every edge outside the most frequent weight group."),
      vars: [{ name: "operations", value: answer }, { name: "answers", value: `[${answers.join(", ")}]` }],
    });
  }

  activeNodes = [];
  activeEdges = [];
  activeQuery = null;
  ancestor = null;
  frequencies = Array(26).fill(0);
  pathLength = null;
  maxFrequency = null;
  lift = null;
  push({
    phase: "done",
    event: "done",
    line: 50,
    title: bi(`Kết quả: [${answers.join(", ")}]`, `Result: [${answers.join(", ")}]`),
    note: bi("Mỗi query được trả lời trong O(log n + 26) sau tiền xử lý.", "Each query is answered in O(log n + 26) after preprocessing."),
    vars: [{ name: "answer", value: `[${answers.join(", ")}]` }],
    final: true,
  });

  return { original: edges, answer: answers, steps };
}

module.exports = {
  2846: {
    id: 2846,
    difficulty: "hard",
    slug: "minimum-edge-weight-equilibrium-queries-in-a-tree",
    category: { key: "binary-lifting", vi: "Binary Lifting", en: "Binary Lifting" },
    tags: [
      { key: "tree", vi: "Cây", en: "Tree" },
      { key: "lowest-common-ancestor", vi: "Lowest Common Ancestor", en: "Lowest Common Ancestor" },
      { key: "prefix-frequency", vi: "Tần suất tiền tố", en: "Prefix Frequency" },
      { key: "binary-lifting", vi: "Binary Lifting", en: "Binary Lifting" },
    ],
    title: bi("Minimum Edge Weight Equilibrium Queries in a Tree", "Minimum Edge Weight Equilibrium Queries in a Tree"),
    titleVi: bi("Số lần đổi trọng số ít nhất trên đường đi", "Minimum edge-weight changes on a tree path"),
    statement: bi(
      "Mỗi query [u,v] hỏi số cạnh ít nhất phải đổi trọng số để mọi cạnh trên đường u↔v có cùng trọng số. Trọng số nằm trong [1,26].",
      "For each query [u,v], return the minimum number of edge-weight changes needed to make every edge on path u↔v have the same weight. Weights are in [1,26].",
    ),
    defaultInput: "[[0,1,1],[1,2,1],[2,3,1],[3,4,2],[4,5,2],[5,6,2]]",
    inputKind: "string",
    inputLabel: bi("edges [u,v,weight]", "edges [u,v,weight]"),
    extraParams: [
      { key: "n", label: bi("n (số node)", "n (node count)"), default: 7, min: 1, max: MAX_N },
      { key: "queries", type: "string", label: bi("queries [u,v]", "queries [u,v]"), default: "[[0,3],[3,6],[2,6]]" },
    ],
    visualizationLimits: { maxNodes: MAX_N, maxQueries: MAX_QUERIES, weights: 26 },
    approach: [
      bi("Gốc hóa cây tại 0. Với mỗi node, lưu depth và prefix[node][w] = số cạnh weight w từ root đến node.", "Root the tree at 0. For every node, store depth and prefix[node][w] = count of weight-w edges from the root to that node."),
      bi("Dựng bảng up[k][node] để tìm LCA bằng binary lifting trong O(log n).", "Build up[k][node] to find each LCA with binary lifting in O(log n)."),
      bi("Với l=LCA(u,v): count[w] = prefix[u][w] + prefix[v][w] − 2·prefix[l][w].", "For l=LCA(u,v): count[w] = prefix[u][w] + prefix[v][w] − 2·prefix[l][w]."),
      bi("Giữ nguyên trọng số xuất hiện nhiều nhất; đáp án = số cạnh trên path − max(count).", "Keep the most frequent edge weight; answer = path edge count − max(count)."),
    ],
    complexity: {
      time: "O((n + q) log n + 26q)",
      space: "O(n log n + 26n)",
      note: bi("Tiền xử lý O(n log n + 26n); mỗi query O(log n + 26).", "Preprocessing costs O(n log n + 26n); each query costs O(log n + 26)."),
    },
    code: [...SOURCE],
    debugMode: "line-by-line",
    parser: parse2846,
    liveArgs(input, params = {}) {
      const parsed = parse2846(input, params);
      return [parsed.n, parsed.edges.map((edge) => [...edge]), parsed.queries.map((query) => [...query])];
    },
    builder: buildSteps2846,
  },
};
