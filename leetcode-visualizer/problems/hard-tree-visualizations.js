"use strict";

// Hard tree visualizations: strict parsing, bounded traces, and full-answer computation.

const MAX_TREE_N = 24;
const MAX_GUESSES = 64;
const MAX_TRIPS = 40;
const MAX_GENE_VALUE = 1_000_000;
const MAX_PRICE = 100_000;
const TRACE_LIMIT_2003 = 220;
const TRACE_LIMIT_2581 = 220;
const TRACE_LIMIT_2646 = 320;

const bi = (vi, en) => ({ vi, en });
const directedKey = (u, v) => `${u},${v}`;
const undirectedKey = (u, v) => (u < v ? `${u},${v}` : `${v},${u}`);

const SOURCE_2003 = Object.freeze([
  "class Solution:",
  "    def smallestMissingValueSubtree(self, parents, nums):",
  "        n = len(parents)",
  "        answer = [1] * n",
  "        try:",
  "            node = nums.index(1)",
  "        except ValueError:",
  "            return answer",
  "        children = [[] for _ in range(n)]",
  "        for child in range(1, n):",
  "            children[parents[child]].append(child)",
  "        seen = set()",
  "        mex, blocked = 1, -1",
  "        while node != -1:",
  "            stack = [node]",
  "            while stack:",
  "                current = stack.pop()",
  "                if current == blocked:",
  "                    continue",
  "                seen.add(nums[current])",
  "                stack.extend(children[current])",
  "            while mex in seen:",
  "                mex += 1",
  "            answer[node] = mex",
  "            blocked, node = node, parents[node]",
  "        return answer",
]);

const SOURCE_2581 = Object.freeze([
  "class Solution:",
  "    def rootCount(self, edges, guesses, k):",
  "        n = len(edges) + 1",
  "        graph = [[] for _ in range(n)]",
  "        for u, v in edges:",
  "            graph[u].append(v)",
  "            graph[v].append(u)",
  "        guessed = set(map(tuple, guesses))",
  "        parent = [-1] * n",
  "        order = [0]",
  "        for node in order:",
  "            for neighbor in graph[node]:",
  "                if neighbor == parent[node]:",
  "                    continue",
  "                parent[neighbor] = node",
  "                order.append(neighbor)",
  "        score = [0] * n",
  "        score[0] = sum((parent[v], v) in guessed for v in range(1, n))",
  "        for node in order[1:]:",
  "            p = parent[node]",
  "            score[node] = (score[p]",
  "                           - ((p, node) in guessed)",
  "                           + ((node, p) in guessed))",
  "        return sum(value >= k for value in score)",
]);

const SOURCE_2646 = Object.freeze([
  "class Solution:",
  "    def minimumTotalPrice(self, n, edges, price, trips):",
  "        graph = [[] for _ in range(n)]",
  "        for u, v in edges:",
  "            graph[u].append(v)",
  "            graph[v].append(u)",
  "        usage = [0] * n",
  "        def add_path(node, parent, target):",
  "            if node == target:",
  "                usage[node] += 1",
  "                return True",
  "            for neighbor in graph[node]:",
  "                if neighbor != parent and add_path(neighbor, node, target):",
  "                    usage[node] += 1",
  "                    return True",
  "            return False",
  "        for start, end in trips:",
  "            add_path(start, -1, end)",
  "        def dp(node, parent):",
  "            full = usage[node] * price[node]",
  "            half = usage[node] * (price[node] // 2)",
  "            for neighbor in graph[node]:",
  "                if neighbor == parent:",
  "                    continue",
  "                child_full, child_half = dp(neighbor, node)",
  "                full += min(child_full, child_half)",
  "                half += child_full",
  "            return full, half",
  "        return min(dp(0, -1))",
]);

const PHASES_2003 = Object.freeze([
  bi("Chuẩn bị cây", "Prepare the tree"),
  bi("Tìm gene 1", "Locate gene 1"),
  bi("Mở nhánh mới", "Expose a new branch"),
  bi("Tăng mex", "Advance the mex"),
  bi("Hoàn tất", "Finish"),
]);

const PHASES_2581 = Object.freeze([
  bi("Chuẩn bị cây", "Prepare the tree"),
  bi("Định hướng từ gốc 0", "Orient from root 0"),
  bi("Đếm dự đoán đúng ban đầu", "Count initially correct guesses"),
  bi("Đổi gốc", "Reroot"),
  bi("Đếm gốc hợp lệ", "Count valid roots"),
]);

const PHASES_2646 = Object.freeze([
  bi("Chuẩn bị cây", "Prepare the tree"),
  bi("Đếm lượt dùng đường đi", "Count path usage"),
  bi("DP từ lá lên", "Bottom-up tree DP"),
  bi("Chọn node giảm nửa", "Choose halved nodes"),
  bi("Hoàn tất", "Finish"),
]);

function fail(problemId, ErrorType, vi, en) {
  throw new ErrorType(`#${problemId}: ${vi} / ${en}`);
}

function parseIntegerList(value, options) {
  const {
    problemId,
    name,
    allowEmpty = false,
    maxLength = Number.MAX_SAFE_INTEGER,
  } = options;
  let candidate;

  if (Array.isArray(value)) {
    candidate = [...value];
  } else if (typeof value === "string") {
    const text = value.trim();
    if (!text) {
      fail(problemId, TypeError, `${name} không được rỗng`, `${name} must not be empty`);
    }
    if (text.startsWith("[")) {
      try {
        candidate = JSON.parse(text);
      } catch (_error) {
        fail(problemId, TypeError, `${name} phải là mảng JSON hợp lệ`, `${name} must be a valid JSON array`);
      }
    } else {
      const tokens = text.split(",");
      if (tokens.some((token) => !token.trim() || !/^-?\d+$/.test(token.trim()))) {
        fail(
          problemId,
          TypeError,
          `${name} chỉ được chứa số nguyên phân cách bằng dấu phẩy`,
          `${name} must contain only comma-separated integers`,
        );
      }
      candidate = tokens.map((token) => Number(token.trim()));
    }
  } else {
    fail(problemId, TypeError, `${name} phải là mảng hoặc chuỗi`, `${name} must be an array or string`);
  }

  if (!Array.isArray(candidate)) {
    fail(problemId, TypeError, `${name} phải là một mảng`, `${name} must be an array`);
  }
  if ((!allowEmpty && candidate.length === 0) || candidate.length > maxLength) {
    fail(
      problemId,
      RangeError,
      `${name} cần ${allowEmpty ? "0" : "1"}–${maxLength} phần tử`,
      `${name} must contain ${allowEmpty ? "0" : "1"}–${maxLength} values`,
    );
  }
  if (!candidate.every(Number.isSafeInteger)) {
    fail(problemId, TypeError, `${name} chỉ được chứa số nguyên an toàn`, `${name} must contain only safe integers`);
  }
  return [...candidate];
}

function parsePairList(value, options) {
  const {
    problemId,
    name,
    allowEmpty = false,
    maxPairs,
  } = options;
  let candidate;

  if (Array.isArray(value)) {
    candidate = value;
  } else if (typeof value === "string") {
    const text = value.trim();
    if (!text) {
      fail(problemId, TypeError, `${name} không được rỗng`, `${name} must not be empty`);
    }
    if (text.startsWith("[")) {
      try {
        candidate = JSON.parse(text);
      } catch (_error) {
        fail(problemId, TypeError, `${name} phải là JSON hợp lệ`, `${name} must be valid JSON`);
      }
    } else {
      const records = text.split(";");
      if (records.some((record) => !record.trim())) {
        fail(problemId, TypeError, `${name} có cặp rỗng`, `${name} contains an empty pair`);
      }
      candidate = records.map((record) => {
        const tokens = record.split(",").map((token) => token.trim());
        if (tokens.length !== 2 || tokens.some((token) => !/^\d+$/.test(token))) {
          fail(
            problemId,
            TypeError,
            `${name} dạng gọn phải là u,v;u,v`,
            `${name} compact form must be u,v;u,v`,
          );
        }
        return tokens.map(Number);
      });
    }
  } else {
    fail(problemId, TypeError, `${name} phải là mảng cặp hoặc chuỗi`, `${name} must be a pair array or string`);
  }

  if (!Array.isArray(candidate)) {
    fail(problemId, TypeError, `${name} phải là một mảng`, `${name} must be an array`);
  }
  if ((!allowEmpty && candidate.length === 0) || candidate.length > maxPairs) {
    fail(
      problemId,
      RangeError,
      `${name} cần ${allowEmpty ? "0" : "1"}–${maxPairs} cặp`,
      `${name} must contain ${allowEmpty ? "0" : "1"}–${maxPairs} pairs`,
    );
  }

  return candidate.map((pair) => {
    if (!Array.isArray(pair) || pair.length !== 2 || !pair.every(Number.isSafeInteger)) {
      fail(
        problemId,
        TypeError,
        `mỗi phần tử của ${name} phải là cặp hai số nguyên an toàn`,
        `every ${name} entry must be a pair of safe integers`,
      );
    }
    return [pair[0], pair[1]];
  });
}

function parseBoundedInteger(value, options) {
  const { problemId, name, min, max } = options;
  if (!Number.isSafeInteger(value)) {
    fail(problemId, TypeError, `${name} phải là số nguyên an toàn`, `${name} must be a safe integer`);
  }
  if (value < min || value > max) {
    fail(problemId, RangeError, `${name} phải thuộc [${min}, ${max}]`, `${name} must be in [${min}, ${max}]`);
  }
  return value;
}

class DisjointSet {
  constructor(size) {
    this.parent = Array.from({ length: size }, (_, index) => index);
    this.rank = Array(size).fill(0);
  }

  find(node) {
    let root = node;
    while (this.parent[root] !== root) root = this.parent[root];
    while (this.parent[node] !== node) {
      const next = this.parent[node];
      this.parent[node] = root;
      node = next;
    }
    return root;
  }

  union(left, right) {
    let rootLeft = this.find(left);
    let rootRight = this.find(right);
    if (rootLeft === rootRight) return false;
    if (this.rank[rootLeft] < this.rank[rootRight]) [rootLeft, rootRight] = [rootRight, rootLeft];
    this.parent[rootRight] = rootLeft;
    if (this.rank[rootLeft] === this.rank[rootRight]) this.rank[rootLeft] += 1;
    return true;
  }
}

function orientTree(adjacency, root, problemId) {
  const n = adjacency.length;
  if (!Number.isSafeInteger(root) || root < 0 || root >= n) {
    fail(problemId, RangeError, "gốc cây không hợp lệ", "tree root is out of range");
  }
  const parent = Array(n).fill(-2);
  const depth = Array(n).fill(-1);
  const children = Array.from({ length: n }, () => []);
  const levels = [];
  const order = [root];
  parent[root] = -1;
  depth[root] = 0;

  for (let cursor = 0; cursor < order.length; cursor++) {
    const node = order[cursor];
    if (!levels[depth[node]]) levels[depth[node]] = [];
    levels[depth[node]].push(node);
    for (const neighbor of adjacency[node]) {
      if (neighbor === parent[node]) continue;
      if (parent[neighbor] !== -2) continue;
      parent[neighbor] = node;
      depth[neighbor] = depth[node] + 1;
      children[node].push(neighbor);
      order.push(neighbor);
    }
  }

  if (order.length !== n) {
    fail(problemId, RangeError, "cây không liên thông", "tree must be connected");
  }
  return {
    n,
    root,
    adjacency,
    parent,
    depth,
    children,
    levels,
    order,
  };
}

function parseStrictTreeEdges(edges, n, problemId) {
  if (!Number.isSafeInteger(n) || n < 1 || n > MAX_TREE_N) {
    fail(
      problemId,
      RangeError,
      `visualization chỉ hỗ trợ 1–${MAX_TREE_N} node`,
      `the visualization supports 1–${MAX_TREE_N} nodes`,
    );
  }
  if (edges.length !== n - 1) {
    fail(
      problemId,
      RangeError,
      `cây ${n} node phải có đúng ${n - 1} cạnh`,
      `a ${n}-node tree must have exactly ${n - 1} edges`,
    );
  }

  const adjacency = Array.from({ length: n }, () => []);
  const seenEdges = new Set();
  const dsu = new DisjointSet(n);
  for (const [u, v] of edges) {
    if (u < 0 || u >= n || v < 0 || v >= n) {
      fail(problemId, RangeError, `cạnh [${u},${v}] có node ngoài [0,${n - 1}]`, `edge [${u},${v}] has an endpoint outside [0,${n - 1}]`);
    }
    if (u === v) {
      fail(problemId, RangeError, `cạnh [${u},${v}] là self-loop`, `edge [${u},${v}] is a self-loop`);
    }
    const key = undirectedKey(u, v);
    if (seenEdges.has(key)) {
      fail(problemId, RangeError, `cạnh [${u},${v}] bị lặp`, `edge [${u},${v}] is duplicated`);
    }
    seenEdges.add(key);
    if (!dsu.union(u, v)) {
      fail(problemId, RangeError, "các cạnh tạo chu trình", "tree edges contain a cycle");
    }
    adjacency[u].push(v);
    adjacency[v].push(u);
  }
  adjacency.forEach((neighbors) => neighbors.sort((a, b) => a - b));

  const rootComponent = dsu.find(0);
  if (Array.from({ length: n }, (_, node) => node).some((node) => dsu.find(node) !== rootComponent)) {
    fail(problemId, RangeError, "cây không liên thông", "tree must be connected");
  }
  return orientTree(adjacency, 0, problemId);
}

function parseParentTree(parents, problemId) {
  const n = parents.length;
  if (n < 1 || n > MAX_TREE_N) {
    fail(
      problemId,
      RangeError,
      `parents cần 1–${MAX_TREE_N} phần tử`,
      `parents must contain 1–${MAX_TREE_N} entries`,
    );
  }
  if (parents[0] !== -1) {
    fail(problemId, RangeError, "parents[0] phải bằng -1", "parents[0] must be -1");
  }
  const edges = [];
  for (let node = 1; node < n; node++) {
    const parent = parents[node];
    if (parent < 0 || parent >= n || parent === node) {
      fail(
        problemId,
        RangeError,
        `parents[${node}] phải là node khác trong [0,${n - 1}]`,
        `parents[${node}] must be a different node in [0,${n - 1}]`,
      );
    }
    edges.push([parent, node]);
  }
  const tree = parseStrictTreeEdges(edges, n, problemId);
  for (let node = 1; node < n; node++) {
    if (tree.parent[node] !== parents[node]) {
      fail(
        problemId,
        RangeError,
        "parents không mô tả cây có gốc 0 liên thông",
        "parents must describe one connected tree rooted at 0",
      );
    }
  }
  return tree;
}

function validatePairEndpoints(pairs, n, problemId, name, distinct = false) {
  const seen = new Set();
  for (const [u, v] of pairs) {
    if (u < 0 || u >= n || v < 0 || v >= n) {
      fail(
        problemId,
        RangeError,
        `${name} [${u},${v}] có node ngoài [0,${n - 1}]`,
        `${name} [${u},${v}] has an endpoint outside [0,${n - 1}]`,
      );
    }
    if (distinct && u === v) {
      fail(problemId, RangeError, `${name} không được chứa [${u},${v}]`, `${name} cannot contain [${u},${v}]`);
    }
    const key = directedKey(u, v);
    if (distinct && seen.has(key)) {
      fail(problemId, RangeError, `${name} [${u},${v}] bị lặp`, `${name} [${u},${v}] is duplicated`);
    }
    seen.add(key);
  }
}

function pathBetween(tree, start, end) {
  let leftNode = start;
  let rightNode = end;
  const left = [leftNode];
  const right = [];

  while (tree.depth[leftNode] > tree.depth[rightNode]) {
    leftNode = tree.parent[leftNode];
    left.push(leftNode);
  }
  while (tree.depth[rightNode] > tree.depth[leftNode]) {
    right.push(rightNode);
    rightNode = tree.parent[rightNode];
  }
  while (leftNode !== rightNode) {
    leftNode = tree.parent[leftNode];
    left.push(leftNode);
    right.push(rightNode);
    rightNode = tree.parent[rightNode];
  }
  return left.concat(right.reverse());
}

function edgeSetFromPath(path) {
  const result = new Set();
  for (let index = 1; index < path.length; index++) {
    result.add(undirectedKey(path[index - 1], path[index]));
  }
  return result;
}

function uniqueSortedIndices(values, length) {
  return [...new Set(values)]
    .filter((value) => Number.isSafeInteger(value) && value >= 0 && value < length)
    .sort((a, b) => a - b);
}

function makeTreeGraph(tree, options) {
  const nodes = Array.from({ length: tree.n }, (_, node) => ({
    id: node,
    label: String(options.nodeLabel(node)),
    sub: String(options.nodeSub(node)),
    state: options.nodeState(node) || "idle",
  }));
  const edges = [];
  for (let node = 0; node < tree.n; node++) {
    const parent = tree.parent[node];
    if (parent === -1) continue;
    const edge = {
      u: parent,
      v: node,
      directed: options.directed !== false,
      state: options.edgeState(parent, node) || "idle",
    };
    const label = options.edgeLabel ? options.edgeLabel(parent, node) : null;
    if (label !== null && label !== undefined && label !== "") edge.label = String(label);
    edges.push(edge);
  }
  return {
    layout: "tree",
    nodes,
    edges,
    levels: tree.levels.map((level) => [...level]),
  };
}

function cloneJsonSafe(value, path = "$", active = new Set()) {
  if (value === null || typeof value === "string" || typeof value === "boolean") return value;
  if (typeof value === "number") {
    if (!Number.isFinite(value)) throw new TypeError(`${path} must contain a finite number`);
    return value;
  }
  if (typeof value !== "object") throw new TypeError(`${path} is not JSON-safe`);
  if (active.has(value)) throw new TypeError(`${path} must not be cyclic`);
  const prototype = Object.getPrototypeOf(value);
  if (prototype !== Object.prototype && prototype !== Array.prototype && prototype !== null) {
    throw new TypeError(`${path} must contain only plain objects and arrays`);
  }
  active.add(value);
  let clone;
  if (Array.isArray(value)) {
    clone = value.map((entry, index) => cloneJsonSafe(entry, `${path}[${index}]`, active));
  } else {
    clone = {};
    for (const [key, entry] of Object.entries(value)) {
      clone[key] = cloneJsonSafe(entry, `${path}.${key}`, active);
    }
  }
  active.delete(value);
  return clone;
}

function freezeDeep(value) {
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    Object.values(value).forEach(freezeDeep);
    Object.freeze(value);
  }
  return value;
}

function validateLocalized(value, field, problemId) {
  if (!value || typeof value !== "object" || typeof value.vi !== "string" || typeof value.en !== "string") {
    throw new TypeError(`#${problemId}: ${field} must be bilingual {vi,en}`);
  }
}

function pushStep(steps, source, problemId, config) {
  validateLocalized(config.title, "title", problemId);
  validateLocalized(config.note, "note", problemId);
  if (!Array.isArray(config.codeLines) || config.codeLines.length === 0
    || config.codeLines.some((line) => !Number.isSafeInteger(line) || line < 1 || line > source.length)) {
    throw new RangeError(`#${problemId}: every codeLines entry must be within 1..${source.length}`);
  }
  if (!Array.isArray(config.arr) || !Array.isArray(config.sub) || config.arr.length !== config.sub.length) {
    throw new TypeError(`#${problemId}: arr and sub must be parallel arrays`);
  }
  if (!config.arr.every((value) => typeof value === "number" && Number.isFinite(value))) {
    throw new TypeError(`#${problemId}: arr must contain finite numbers`);
  }
  if (!Array.isArray(config.vars) || !Array.isArray(config.highlight) || !Array.isArray(config.mark)) {
    throw new TypeError(`#${problemId}: vars, highlight, and mark must be arrays`);
  }
  const highlight = uniqueSortedIndices(config.highlight, config.arr.length);
  const mark = uniqueSortedIndices(config.mark, config.arr.length);
  const hardProblemView = freezeDeep(cloneJsonSafe(config.hardProblemView));
  steps.push({
    title: config.title,
    note: config.note,
    codeLines: [...config.codeLines],
    vars: cloneJsonSafe(config.vars),
    arr: [...config.arr],
    sub: [...config.sub],
    highlight,
    mark,
    final: Boolean(config.final),
    hardProblemView,
  });
}

function finishTrace(steps, problemId) {
  if (steps.length === 0 || !steps[steps.length - 1].final) {
    throw new Error(`#${problemId}: trace must end with one terminal final step`);
  }
  if (steps.slice(0, -1).some((step) => step.final)) {
    throw new Error(`#${problemId}: only the terminal step may set final=true`);
  }
}

function parse2003(input, params = {}) {
  const parents = parseIntegerList(input, {
    problemId: 2003,
    name: "parents",
    maxLength: MAX_TREE_N,
  });
  const nums = parseIntegerList(params.nums ?? "[1,2,3,4]", {
    problemId: 2003,
    name: "nums",
    maxLength: MAX_TREE_N,
  });
  if (parents.length !== nums.length) {
    fail(2003, RangeError, "parents và nums phải cùng độ dài", "parents and nums must have equal length");
  }
  const tree = parseParentTree(parents, 2003);
  const unique = new Set();
  for (const value of nums) {
    if (value < 1 || value > MAX_GENE_VALUE) {
      fail(
        2003,
        RangeError,
        `mỗi genetic value phải thuộc [1, ${MAX_GENE_VALUE}]`,
        `every genetic value must be in [1, ${MAX_GENE_VALUE}]`,
      );
    }
    if (unique.has(value)) {
      fail(2003, RangeError, `genetic value ${value} bị lặp`, `genetic value ${value} is duplicated`);
    }
    unique.add(value);
  }
  return { parents, nums, tree };
}

function parse2581(input, params = {}) {
  const edges = parsePairList(input, {
    problemId: 2581,
    name: "edges",
    allowEmpty: true,
    maxPairs: MAX_TREE_N - 1,
  });
  const n = edges.length + 1;
  const tree = parseStrictTreeEdges(edges, n, 2581);
  const guesses = parsePairList(params.guesses ?? "[[1,3],[0,1],[1,0],[2,4]]", {
    problemId: 2581,
    name: "guesses",
    allowEmpty: true,
    maxPairs: MAX_GUESSES,
  });
  validatePairEndpoints(guesses, n, 2581, "guess", true);
  const k = parseBoundedInteger(params.k ?? 3, {
    problemId: 2581,
    name: "k",
    min: 0,
    max: guesses.length,
  });
  return { n, edges, guesses, k, tree };
}

function parse2646(input, params = {}) {
  const price = parseIntegerList(params.price ?? "[2,2,10,6]", {
    problemId: 2646,
    name: "price",
    maxLength: MAX_TREE_N,
  });
  const n = price.length;
  for (const value of price) {
    if (value < 2 || value > MAX_PRICE || value % 2 !== 0) {
      fail(
        2646,
        RangeError,
        `mỗi price phải là số chẵn trong [2, ${MAX_PRICE}]`,
        `every price must be even and in [2, ${MAX_PRICE}]`,
      );
    }
  }
  const edges = parsePairList(input, {
    problemId: 2646,
    name: "edges",
    allowEmpty: true,
    maxPairs: MAX_TREE_N - 1,
  });
  const tree = parseStrictTreeEdges(edges, n, 2646);
  const trips = parsePairList(params.trips ?? "[[0,3],[2,1],[2,3]]", {
    problemId: 2646,
    name: "trips",
    allowEmpty: false,
    maxPairs: MAX_TRIPS,
  });
  validatePairEndpoints(trips, n, 2646, "trip", false);
  return { n, edges, price, trips, tree };
}

function buildSteps2003(input, params = {}) {
  const { parents, nums, tree } = parse2003(input, params);
  const n = parents.length;
  const answer = Array(n).fill(1);
  const steps = [];
  const seenValues = new Set();
  const scannedNodes = new Set();
  const finalizedNodes = new Set();
  const geneOneNode = nums.indexOf(1);
  let mex = 1;
  let traceTruncated = false;

  const emit = (options) => {
    if (!options.final && steps.length >= TRACE_LIMIT_2003 - 1) {
      traceTruncated = true;
      return;
    }
    const activeNodes = new Set(options.activeNodes || []);
    if (options.activeNode !== null && options.activeNode !== undefined) activeNodes.add(options.activeNode);
    const exposedNodes = new Set(options.exposedNodes || []);
    const pathNodes = new Set(options.pathNodes || []);
    const activeEdges = options.activeEdges || new Set();
    const pathEdges = options.pathEdges || new Set();
    const graph = makeTreeGraph(tree, {
      nodeLabel: (node) => `u${node}`,
      nodeSub: (node) => `gene=${nums[node]} · miss=${answer[node]}`,
      nodeState: (node) => {
        if (activeNodes.has(node)) return "active";
        if (exposedNodes.has(node)) return "candidate";
        if (options.final || finalizedNodes.has(node)) return "success";
        if (pathNodes.has(node)) return "path";
        if (scannedNodes.has(node)) return "visited";
        return "idle";
      },
      edgeState: (parent, child) => {
        const key = undirectedKey(parent, child);
        if (activeEdges.has(key)) return "active";
        if (pathEdges.has(key)) return "path";
        if (scannedNodes.has(parent) && scannedNodes.has(child)) return "visited";
        return "idle";
      },
      edgeLabel: (parent, child) => `${parent}→${child}`,
      directed: true,
    });

    const tableRows = Array.from({ length: n }, (_, node) => ({
      label: `u${node}`,
      state: activeNodes.has(node)
        ? "active"
        : options.final || finalizedNodes.has(node)
          ? "success"
          : scannedNodes.has(node)
            ? "visited"
            : "idle",
      cells: [
        parents[node],
        nums[node],
        { value: answer[node], state: options.final || finalizedNodes.has(node) ? "success" : "muted" },
      ],
    }));
    const seenSequence = [...seenValues]
      .sort((left, right) => left - right)
      .map((value) => ({
        label: `g=${value}`,
        value,
        state: value === mex ? "active" : "visited",
      }));
    const branchItems = [...exposedNodes].sort((a, b) => a - b).map((node) => ({
      label: `u${node}`,
      value: `gene ${nums[node]}`,
      state: activeNodes.has(node) ? "active" : "candidate",
    }));
    const resultItems = [...finalizedNodes].sort((a, b) => a - b).map((node) => ({
      label: `answer[${node}]`,
      value: answer[node],
      state: "success",
    }));
    const view = {
      problemId: 2003,
      phaseIndex: options.phaseIndex,
      phases: PHASES_2003,
      phase: options.phase,
      action: options.action,
      formula: options.formula,
      metrics: [
        { label: bi("Số node", "Nodes"), value: `${n}/${MAX_TREE_N}` },
        { label: bi("Node chứa gene 1", "Node containing gene 1"), value: options.showGeneOne ? geneOneNode : "—", state: geneOneNode >= 0 ? "success" : "muted" },
        { label: bi("Tổ tiên hiện tại", "Current ancestor"), value: options.ancestor ?? "—", state: options.ancestor === null || options.ancestor === undefined ? "muted" : "active" },
        { label: bi("Giá trị đã thấy", "Seen values"), value: seenValues.size },
        { label: bi("mex", "mex"), value: mex, state: "active" },
        { label: bi("Node đã chốt", "Finalized nodes"), value: finalizedNodes.size },
      ],
      graph,
      table: {
        title: bi("Đáp án theo node", "Per-node answers"),
        columns: [bi("parent", "parent"), bi("gene", "gene"), bi("smallest missing", "smallest missing")],
        rows: tableRows,
      },
      queue: (options.queue || []).map((node, index) => ({
        label: `u${node}`,
        sub: index === 0 ? "next" : `stack ${index}`,
        state: index === 0 ? "active" : "queued",
      })),
      groups: [
        { title: bi("Nhánh mới mở", "Newly exposed branch"), items: branchItems },
        { title: bi("Kết quả đã chốt", "Finalized answers"), items: resultItems },
      ],
      sequence: seenSequence,
      legend: [
        { label: bi("Đang xử lý", "Active"), state: "active" },
        { label: bi("Nhánh mới", "New branch"), state: "candidate" },
        { label: bi("Đã quét", "Scanned"), state: "visited" },
        { label: bi("Đã chốt", "Finalized"), state: "success" },
      ],
      answer: options.final ? [...answer] : null,
      traceTruncated,
    };

    pushStep(steps, SOURCE_2003, 2003, {
      title: options.title,
      note: options.note,
      codeLines: options.codeLines,
      vars: options.vars || [
        { name: bi("node", "node"), value: options.activeNode ?? "—" },
        { name: bi("blocked", "blocked"), value: options.blocked ?? -1 },
        { name: bi("mex", "mex"), value: mex },
        { name: bi("seen", "seen"), value: [...seenValues].sort((a, b) => a - b) },
      ],
      arr: nums,
      sub: nums.map((value, node) => `u${node}: g=${value}, ans=${answer[node]}`),
      highlight: [...activeNodes],
      mark: [...new Set([...scannedNodes, ...finalizedNodes])],
      final: Boolean(options.final),
      hardProblemView: view,
    });
  };

  emit({
    phaseIndex: 0,
    phase: "prepare",
    action: bi("Khởi tạo answer bằng 1 cho mọi node", "Initialize every answer to 1"),
    formula: bi("answer = [1] × n", "answer = [1] × n"),
    title: bi("Khởi tạo cây và đáp án mặc định", "Initialize the tree and default answers"),
    note: bi(
      "Bộ phân tích đã xác nhận đúng một gốc 0, không chu trình, liên thông, genetic value duy nhất và giới hạn visualization.",
      "The parser verified one root at 0, no cycle, full connectivity, unique genetic values, and the visualization bound.",
    ),
    codeLines: [3, 4],
    activeNode: 0,
    activeNodes: [0],
    showGeneOne: false,
    ancestor: null,
  });

  emit({
    phaseIndex: 1,
    phase: "locate-one",
    action: geneOneNode >= 0
      ? bi(`Tìm thấy gene 1 tại u${geneOneNode}`, `Found gene 1 at u${geneOneNode}`)
      : bi("Không có gene 1", "Gene 1 is absent"),
    formula: geneOneNode >= 0
      ? bi(`nums[${geneOneNode}] = 1`, `nums[${geneOneNode}] = 1`)
      : bi("1 ∉ nums ⇒ mọi đáp án bằng 1", "1 ∉ nums ⇒ every answer is 1"),
    title: geneOneNode >= 0
      ? bi(`Bắt đầu từ u${geneOneNode}`, `Start at u${geneOneNode}`)
      : bi("Không cần đi lên chuỗi tổ tiên", "No ancestor walk is needed"),
    note: geneOneNode >= 0
      ? bi(
        "Chỉ subtree của node này và các tổ tiên của nó có thể chứa gene 1; mọi node khác giữ đáp án 1.",
        "Only this node's subtree and its ancestors can contain gene 1; every other node keeps answer 1.",
      )
      : bi(
        "Vì không subtree nào chứa 1, số dương thiếu nhỏ nhất của mọi subtree là 1.",
        "Because no subtree contains 1, every subtree's smallest missing positive value is 1.",
      ),
    codeLines: geneOneNode >= 0 ? [5, 6] : [5, 6, 7],
    activeNode: geneOneNode >= 0 ? geneOneNode : null,
    activeNodes: geneOneNode >= 0 ? [geneOneNode] : [],
    showGeneOne: true,
    ancestor: geneOneNode >= 0 ? geneOneNode : null,
  });

  if (geneOneNode < 0) {
    emit({
      phaseIndex: 4,
      phase: "done",
      action: bi("Trả về mảng toàn 1", "Return the all-ones array"),
      formula: bi("answer[u] = 1 với mọi u", "answer[u] = 1 for every u"),
      title: bi(`Đáp án = [${answer.join(", ")}]`, `Answer = [${answer.join(", ")}]`),
      note: bi(
        "Đây là bước kết thúc duy nhất; toàn bộ kết quả đã được tính.",
        "This is the only terminal step; the complete result has been computed.",
      ),
      codeLines: [8],
      activeNode: null,
      activeNodes: [],
      showGeneOne: true,
      ancestor: null,
      final: true,
    });
    finishTrace(steps, 2003);
    return { original: { parents: [...parents], nums: [...nums] }, answer: [...answer], steps };
  }

  emit({
    phaseIndex: 0,
    phase: "prepare",
    action: bi("Lập danh sách con", "Build child lists"),
    formula: bi("children[parents[v]].append(v)", "children[parents[v]].append(v)"),
    title: bi("Chuyển parents thành các nhánh con", "Convert parents into child branches"),
    note: bi(
      "Danh sách con cho phép quét đúng phần subtree vừa lộ ra khi đi từ node chứa 1 lên gốc.",
      "Child lists let us scan exactly the newly exposed subtree portion while walking from gene 1 to the root.",
    ),
    codeLines: [9, 10, 11],
    activeNode: geneOneNode,
    activeNodes: [geneOneNode],
    showGeneOne: true,
    ancestor: geneOneNode,
  });

  let node = geneOneNode;
  let blocked = -1;
  const ancestorPath = [];
  while (node !== -1) {
    ancestorPath.push(node);
    const pathEdges = edgeSetFromPath(ancestorPath);
    const newlyExposed = new Set();
    const stack = [node];

    emit({
      phaseIndex: 2,
      phase: "expose-subtree",
      action: bi(`Mở phần mới của subtree u${node}`, `Expose the new part of u${node}'s subtree`),
      formula: bi(`stack = [${node}], blocked = ${blocked}`, `stack = [${node}], blocked = ${blocked}`),
      title: bi(`Xử lý tổ tiên u${node}`, `Process ancestor u${node}`),
      note: blocked === -1
        ? bi(
          "Lần đầu quét toàn bộ subtree của node chứa gene 1.",
          "The first pass scans the entire subtree of the node containing gene 1.",
        )
        : bi(
          `Bỏ qua u${blocked} và toàn bộ nhánh đã quét của nó; chỉ các nhánh bên mới được thêm vào seen.`,
          `Skip u${blocked} and its already scanned branch; only newly exposed side branches enter seen.`,
        ),
      codeLines: [14, 15],
      activeNode: node,
      activeNodes: [node],
      pathNodes: ancestorPath,
      pathEdges,
      queue: stack,
      exposedNodes: newlyExposed,
      showGeneOne: true,
      ancestor: node,
      blocked,
    });

    while (stack.length) {
      const current = stack.pop();
      const activeEdges = new Set();
      if (tree.parent[current] !== -1) activeEdges.add(undirectedKey(tree.parent[current], current));
      if (current === blocked) {
        emit({
          phaseIndex: 2,
          phase: "expose-subtree",
          action: bi(`Bỏ qua nhánh u${blocked}`, `Skip branch u${blocked}`),
          formula: bi("current == blocked ⇒ continue", "current == blocked ⇒ continue"),
          title: bi(`u${blocked} đã được quét đúng một lần`, `u${blocked} was already scanned exactly once`),
          note: bi(
            "Không đưa node bị chặn hoặc bất kỳ hậu duệ nào của nó trở lại stack.",
            "The blocked node and all of its descendants are not reintroduced to the stack.",
          ),
          codeLines: [16, 17, 18, 19],
          activeNode: current,
          activeNodes: [current],
          activeEdges,
          pathNodes: ancestorPath,
          pathEdges,
          queue: stack,
          exposedNodes: newlyExposed,
          showGeneOne: true,
          ancestor: node,
          blocked,
        });
        continue;
      }
      if (scannedNodes.has(current)) {
        throw new Error(`#2003: node ${current} would be exposed more than once`);
      }
      scannedNodes.add(current);
      newlyExposed.add(current);
      seenValues.add(nums[current]);
      for (let index = tree.children[current].length - 1; index >= 0; index--) {
        stack.push(tree.children[current][index]);
      }
      emit({
        phaseIndex: 2,
        phase: "expose-subtree",
        action: bi(`Thêm gene ${nums[current]} từ u${current}`, `Add gene ${nums[current]} from u${current}`),
        formula: bi(`seen ← seen ∪ {${nums[current]}}`, `seen ← seen ∪ {${nums[current]}}`),
        title: bi(`Quét u${current}`, `Scan u${current}`),
        note: bi(
          `u${current} thuộc phần subtree mới lộ ra. Các con chưa xét được đưa lên stack; tổng cộng ${seenValues.size} gene đã thấy.`,
          `u${current} belongs to the newly exposed portion. Its unprocessed children enter the stack; ${seenValues.size} genes are now seen.`,
        ),
        codeLines: [16, 17, 20, 21],
        activeNode: current,
        activeNodes: [current],
        activeEdges,
        pathNodes: ancestorPath,
        pathEdges,
        queue: stack,
        exposedNodes: newlyExposed,
        showGeneOne: true,
        ancestor: node,
        blocked,
      });
    }

    while (seenValues.has(mex)) {
      const oldMex = mex;
      mex += 1;
      emit({
        phaseIndex: 3,
        phase: "advance-mex",
        action: bi(`mex ${oldMex} đã xuất hiện`, `mex ${oldMex} is present`),
        formula: bi(`${oldMex} ∈ seen ⇒ mex = ${mex}`, `${oldMex} ∈ seen ⇒ mex = ${mex}`),
        title: bi(`Tăng mex lên ${mex}`, `Advance mex to ${mex}`),
        note: bi(
          "seen chỉ tăng khi đi lên tổ tiên, nên mex cũng chỉ tăng và tổng số lần tăng là tuyến tính.",
          "seen only grows during the ancestor walk, so mex only advances and moves a linear number of times overall.",
        ),
        codeLines: [22, 23],
        activeNode: node,
        activeNodes: [node],
        pathNodes: ancestorPath,
        pathEdges,
        exposedNodes: newlyExposed,
        showGeneOne: true,
        ancestor: node,
        blocked,
      });
    }

    answer[node] = mex;
    finalizedNodes.add(node);
    emit({
      phaseIndex: 3,
      phase: "advance-mex",
      action: bi(`Chốt answer[${node}] = ${mex}`, `Finalize answer[${node}] = ${mex}`),
      formula: bi(`${mex} ∉ seen ⇒ answer[${node}] = ${mex}`, `${mex} ∉ seen ⇒ answer[${node}] = ${mex}`),
      title: bi(`Số thiếu nhỏ nhất của u${node} là ${mex}`, `u${node}'s smallest missing value is ${mex}`),
      note: bi(
        "Mọi gene nhỏ hơn mex đã xuất hiện trong subtree hiện tại, còn mex chưa xuất hiện. Các node ngoài chuỗi tổ tiên của gene 1 giữ giá trị mặc định 1.",
        "Every gene below mex occurs in the current subtree, while mex itself does not. Nodes outside gene 1's ancestor chain keep their default value 1.",
      ),
      codeLines: [22, 24],
      activeNode: node,
      activeNodes: [node],
      pathNodes: ancestorPath,
      pathEdges,
      exposedNodes: newlyExposed,
      showGeneOne: true,
      ancestor: node,
      blocked,
    });

    const previous = node;
    blocked = node;
    node = parents[node];
    if (node !== -1) {
      emit({
        phaseIndex: 2,
        phase: "expose-subtree",
        action: bi(`Đi từ u${previous} lên u${node}`, `Move from u${previous} to u${node}`),
        formula: bi(`blocked = ${previous}, node = ${node}`, `blocked = ${previous}, node = ${node}`),
        title: bi(`Chuyển sang tổ tiên u${node}`, `Move to ancestor u${node}`),
        note: bi(
          `Subtree u${previous} đã được thêm đúng một lần và sẽ bị chặn ở vòng kế tiếp.`,
          `u${previous}'s subtree was added exactly once and will be blocked in the next iteration.`,
        ),
        codeLines: [25],
        activeNode: node,
        activeNodes: [previous, node],
        activeEdges: new Set([undirectedKey(previous, node)]),
        pathNodes: [...ancestorPath, node],
        pathEdges: edgeSetFromPath([...ancestorPath, node]),
        showGeneOne: true,
        ancestor: node,
        blocked,
      });
    }
  }

  emit({
    phaseIndex: 4,
    phase: "done",
    action: bi("Trả về toàn bộ đáp án", "Return all answers"),
    formula: bi(`answer = [${answer.join(", ")}]`, `answer = [${answer.join(", ")}]`),
    title: bi(`Đáp án = [${answer.join(", ")}]`, `Answer = [${answer.join(", ")}]`),
    note: traceTruncated
      ? bi(
        `Trace đã dừng ở ${TRACE_LIMIT_2003} frame để giữ giao diện mượt, nhưng thuật toán vẫn quét và tính đầy đủ mọi node.`,
        `The trace was capped at ${TRACE_LIMIT_2003} frames for responsiveness, but the algorithm still scanned and computed every node.`,
      )
      : bi(
        "Mỗi node được thêm vào seen nhiều nhất một lần; mex chỉ tăng, nên tổng thời gian là O(n).",
        "Each node enters seen at most once and mex only advances, giving O(n) total time.",
      ),
    codeLines: [26],
    activeNode: null,
    activeNodes: [],
    pathNodes: ancestorPath,
    pathEdges: edgeSetFromPath(ancestorPath),
    showGeneOne: true,
    ancestor: null,
    blocked,
    final: true,
  });

  finishTrace(steps, 2003);
  return { original: { parents: [...parents], nums: [...nums] }, answer: [...answer], steps };
}

function buildSteps2581(input, params = {}) {
  const { n, edges, guesses, k, tree } = parse2581(input, params);
  const guessed = new Set(guesses.map(([u, v]) => directedKey(u, v)));
  const score = Array(n).fill(null);
  const evaluated = new Set();
  const orientedNodes = new Set([0]);
  const steps = [];
  let currentRoot = 0;
  let traceTruncated = false;
  let runningInitial = 0;

  const emit = (options) => {
    if (!options.final && steps.length >= TRACE_LIMIT_2581 - 1) {
      traceTruncated = true;
      return;
    }
    const displayRoot = options.displayRoot ?? currentRoot;
    const oriented = orientTree(tree.adjacency, displayRoot, 2581);
    const activeEdgeKey = options.activeEdge
      ? undirectedKey(options.activeEdge[0], options.activeEdge[1])
      : null;
    const activeNodes = new Set(options.activeNodes || []);
    if (!options.final && displayRoot !== null) activeNodes.add(displayRoot);
    const correctGuessKeys = new Set();
    for (let node = 0; node < n; node++) {
      const parent = oriented.parent[node];
      if (parent !== -1 && guessed.has(directedKey(parent, node))) {
        correctGuessKeys.add(directedKey(parent, node));
      }
    }
    const graph = makeTreeGraph(oriented, {
      nodeLabel: (node) => `u${node}`,
      nodeSub: (node) => `root-score=${score[node] === null ? "?" : score[node]}`,
      nodeState: (node) => {
        if (activeNodes.has(node)) return "active";
        if (evaluated.has(node)) return score[node] >= k ? "success" : "visited";
        if (orientedNodes.has(node)) return "path";
        return "idle";
      },
      edgeState: (parent, child) => {
        const key = undirectedKey(parent, child);
        if (key === activeEdgeKey) return "active";
        if (guessed.has(directedKey(parent, child))) return "success";
        if (guessed.has(directedKey(child, parent))) return "warning";
        return "idle";
      },
      edgeLabel: (parent, child) => {
        const forward = guessed.has(directedKey(parent, child));
        const reverse = guessed.has(directedKey(child, parent));
        if (forward && reverse) return `✓${parent}→${child} · ✗${child}→${parent}`;
        if (forward) return `✓ ${parent}→${child}`;
        if (reverse) return `✗ ${child}→${parent}`;
        return `${parent}→${child}`;
      },
      directed: true,
    });

    const validEvaluated = [...evaluated].filter((root) => score[root] >= k).length;
    const correctItems = [];
    const incorrectItems = [];
    for (const [u, v] of guesses) {
      const isCorrect = correctGuessKeys.has(directedKey(u, v));
      (isCorrect ? correctItems : incorrectItems).push({
        label: `${u}→${v}`,
        value: isCorrect ? "✓" : "✗",
        state: isCorrect ? "success" : "warning",
      });
    }
    const view = {
      problemId: 2581,
      phaseIndex: options.phaseIndex,
      phases: PHASES_2581,
      phase: options.phase,
      action: options.action,
      formula: options.formula,
      metrics: [
        { label: bi("Số node", "Nodes"), value: `${n}/${MAX_TREE_N}` },
        { label: bi("Gốc đang xem", "Displayed root"), value: displayRoot, state: options.final ? "muted" : "active" },
        { label: bi("score của gốc", "Root score"), value: score[displayRoot] === null ? "—" : score[displayRoot] },
        { label: bi("Ngưỡng k", "Threshold k"), value: k },
        { label: bi("Gốc đã tính", "Evaluated roots"), value: `${evaluated.size}/${n}` },
        { label: bi("Gốc đạt ngưỡng", "Qualifying roots"), value: validEvaluated, state: "success" },
      ],
      graph,
      table: {
        title: bi("Điểm theo gốc ứng viên", "Score by candidate root"),
        columns: [bi("root", "root"), bi("correct guesses", "correct guesses"), bi("score ≥ k", "score ≥ k")],
        rows: Array.from({ length: n }, (_, root) => ({
          label: `u${root}`,
          state: root === displayRoot && !options.final
            ? "active"
            : score[root] === null
              ? "idle"
              : score[root] >= k
                ? "success"
                : "visited",
          cells: [
            root,
            score[root] === null ? { value: "—", state: "muted" } : score[root],
            score[root] === null
              ? { value: "—", state: "muted" }
              : { value: score[root] >= k ? "yes" : "no", state: score[root] >= k ? "success" : "warning" },
          ],
        })),
      },
      queue: (options.queue || []).map((root, index) => ({
        label: `root u${root}`,
        sub: score[root] === null ? "pending" : `score ${score[root]}`,
        state: index === 0 ? "active" : "queued",
      })),
      groups: [
        { title: bi("Guess đúng với gốc đang xem", "Correct for displayed root"), items: correctItems },
        { title: bi("Guess sai với gốc đang xem", "Incorrect for displayed root"), items: incorrectItems },
      ],
      sequence: tree.order.map((root) => ({
        label: `u${root}`,
        value: score[root] === null ? "?" : score[root],
        state: root === displayRoot && !options.final
          ? "active"
          : score[root] === null
            ? "queued"
            : score[root] >= k
              ? "success"
              : "visited",
      })),
      legend: [
        { label: bi("Cạnh đổi gốc", "Reroot edge"), state: "active" },
        { label: bi("Guess đúng", "Correct guess"), state: "success" },
        { label: bi("Guess ngược", "Reversed guess"), state: "warning" },
        { label: bi("Gốc đã tính", "Evaluated root"), state: "visited" },
      ],
      answer: options.final ? validEvaluated : null,
      traceTruncated,
    };

    const highlight = [...activeNodes];
    if (options.activeEdge) highlight.push(...options.activeEdge);
    pushStep(steps, SOURCE_2581, 2581, {
      title: options.title,
      note: options.note,
      codeLines: options.codeLines,
      vars: options.vars || [
        { name: bi("root", "root"), value: displayRoot },
        { name: bi("score", "score"), value: score[displayRoot] === null ? "—" : score[displayRoot] },
        { name: bi("k", "k"), value: k },
        { name: bi("valid", "valid"), value: validEvaluated },
      ],
      arr: score.map((value) => value === null ? 0 : value),
      sub: score.map((value, root) => `root ${root}: ${value === null ? "?" : value}`),
      highlight,
      mark: [...evaluated],
      final: Boolean(options.final),
      hardProblemView: view,
    });
  };

  emit({
    phaseIndex: 0,
    phase: "prepare",
    action: bi("Kiểm tra và dựng adjacency list", "Validate and build the adjacency list"),
    formula: bi("|E| = n − 1 và mọi node nối với 0", "|E| = n − 1 and every node connects to 0"),
    title: bi("Cây hợp lệ đã sẵn sàng", "The validated tree is ready"),
    note: bi(
      "Parser từ chối self-loop, cạnh lặp, chu trình, node ngoài miền và cây không liên thông trước khi tạo trace.",
      "The parser rejects self-loops, duplicate edges, cycles, out-of-range nodes, and disconnected trees before tracing.",
    ),
    codeLines: [3, 4, 5, 6, 7],
    activeNodes: [0],
    displayRoot: 0,
    queue: tree.order,
  });

  emit({
    phaseIndex: 0,
    phase: "prepare",
    action: bi("Đưa mọi guess có hướng vào set", "Put every directed guess in a set"),
    formula: bi("has(u,v) = ((u,v) ∈ guessed)", "has(u,v) = ((u,v) ∈ guessed)"),
    title: bi(`Lưu ${guesses.length} dự đoán có hướng`, `Store ${guesses.length} directed guesses`),
    note: bi(
      "Set phân biệt u→v với v→u và cho phép mỗi lần kiểm tra O(1).",
      "The set distinguishes u→v from v→u and gives O(1) membership checks.",
    ),
    codeLines: [8],
    activeNodes: [0],
    displayRoot: 0,
    queue: tree.order,
  });

  for (let index = 1; index < tree.order.length; index++) {
    const node = tree.order[index];
    const parent = tree.parent[node];
    orientedNodes.add(node);
    emit({
      phaseIndex: 1,
      phase: "root-at-zero",
      action: bi(`Đặt parent[${node}] = ${parent}`, `Set parent[${node}] = ${parent}`),
      formula: bi(`${parent}→${node} trong cây gốc 0`, `${parent}→${node} in the tree rooted at 0`),
      title: bi(`Định hướng cạnh ${parent}→${node}`, `Orient edge ${parent}→${node}`),
      note: bi(
        "Thứ tự BFS bảo đảm parent của node đã biết trước khi node được dùng trong bước đổi gốc.",
        "BFS order guarantees a node's parent is known before that node is used in rerooting.",
      ),
      codeLines: [9, 10, 11, 12, 13, 14, 15, 16],
      activeNodes: [parent, node],
      activeEdge: [parent, node],
      displayRoot: 0,
      queue: tree.order.slice(index + 1),
    });
  }

  for (let index = 1; index < tree.order.length; index++) {
    const node = tree.order[index];
    const parent = tree.parent[node];
    const correct = guessed.has(directedKey(parent, node));
    if (correct) runningInitial += 1;
    emit({
      phaseIndex: 2,
      phase: "initial-score",
      action: correct
        ? bi(`Guess ${parent}→${node} đúng`, `Guess ${parent}→${node} is correct`)
        : bi(`Không có guess đúng ${parent}→${node}`, `No correct guess ${parent}→${node}`),
      formula: bi(
        `score[0] tạm thời = ${runningInitial}`,
        `running score[0] = ${runningInitial}`,
      ),
      title: correct
        ? bi(`Cộng 1 cho cạnh ${parent}→${node}`, `Add 1 for edge ${parent}→${node}`)
        : bi(`Không cộng tại cạnh ${parent}→${node}`, `Add nothing for edge ${parent}→${node}`),
      note: bi(
        "Với gốc 0, một guess đúng khi hướng guess trùng hướng parent→child của cây đã định hướng.",
        "With root 0, a guess is correct exactly when it matches an oriented parent→child tree edge.",
      ),
      codeLines: [17, 18],
      activeNodes: [parent, node],
      activeEdge: [parent, node],
      displayRoot: 0,
      queue: tree.order.slice(index + 1),
      vars: [
        { name: bi("cạnh", "edge"), value: `${parent}→${node}` },
        { name: bi("guess đúng", "guess correct"), value: correct },
        { name: bi("running score", "running score"), value: runningInitial },
        { name: bi("k", "k"), value: k },
      ],
    });
  }

  score[0] = runningInitial;
  evaluated.add(0);
  emit({
    phaseIndex: 2,
    phase: "initial-score",
    action: bi(`Chốt score[0] = ${score[0]}`, `Finalize score[0] = ${score[0]}`),
    formula: bi(`score[0] = ${runningInitial}`, `score[0] = ${runningInitial}`),
    title: bi(`Gốc 0 có ${score[0]} guess đúng`, `Root 0 has ${score[0]} correct guesses`),
    note: bi(
      "Đây là điểm khởi đầu; mọi điểm gốc khác sẽ được suy ra O(1) qua cạnh nối với parent trong cây gốc 0.",
      "This is the starting score; every other root score is derived in O(1) across its parent edge in the root-0 tree.",
    ),
    codeLines: [17, 18],
    activeNodes: [0],
    displayRoot: 0,
    queue: tree.order.slice(1),
  });

  for (let index = 1; index < tree.order.length; index++) {
    const node = tree.order[index];
    const parent = tree.parent[node];
    const losesForward = guessed.has(directedKey(parent, node)) ? 1 : 0;
    const gainsReverse = guessed.has(directedKey(node, parent)) ? 1 : 0;
    score[node] = score[parent] - losesForward + gainsReverse;
    evaluated.add(node);
    currentRoot = node;
    emit({
      phaseIndex: 3,
      phase: "reroot",
      action: bi(`Đổi gốc ${parent} → ${node}`, `Reroot ${parent} → ${node}`),
      formula: bi(
        `score[${node}] = ${score[parent]} − ${losesForward} + ${gainsReverse} = ${score[node]}`,
        `score[${node}] = ${score[parent]} − ${losesForward} + ${gainsReverse} = ${score[node]}`,
      ),
      title: bi(`score[${node}] = ${score[node]}`, `score[${node}] = ${score[node]}`),
      note: bi(
        `Chỉ cạnh ${parent}—${node} đổi hướng: mất guess ${parent}→${node} nếu có, rồi nhận guess ${node}→${parent} nếu có.`,
        `Only edge ${parent}—${node} flips: lose guess ${parent}→${node} if present, then gain guess ${node}→${parent} if present.`,
      ),
      codeLines: [19, 20, 21, 22, 23],
      activeNodes: [parent, node],
      activeEdge: [parent, node],
      displayRoot: node,
      queue: tree.order.slice(index + 1),
      vars: [
        { name: bi("parent score", "parent score"), value: score[parent] },
        { name: bi("trừ has(parent,child)", "subtract has(parent,child)"), value: losesForward },
        { name: bi("cộng has(child,parent)", "add has(child,parent)"), value: gainsReverse },
        { name: bi("child score", "child score"), value: score[node] },
      ],
    });
  }

  const answer = score.filter((value) => value >= k).length;
  currentRoot = 0;
  emit({
    phaseIndex: 4,
    phase: "done",
    action: bi("Đếm mọi score đạt k", "Count every score meeting k"),
    formula: bi(`Σ[score[root] ≥ ${k}] = ${answer}`, `Σ[score[root] ≥ ${k}] = ${answer}`),
    title: bi(`Có ${answer} gốc hợp lệ`, `${answer} roots are valid`),
    note: traceTruncated
      ? bi(
        `Trace đã được giới hạn ở ${TRACE_LIMIT_2581} frame, nhưng score của cả ${n} gốc và đáp án đầy đủ vẫn được tính.`,
        `The trace was capped at ${TRACE_LIMIT_2581} frames, but all ${n} root scores and the complete answer were still computed.`,
      )
      : bi(
        "Mỗi cạnh được xét khi định hướng, đếm ban đầu và đổi gốc; tổng thời gian O(n + guesses).",
        "Each edge is processed during orientation, initial counting, and rerooting; total time is O(n + guesses).",
      ),
    codeLines: [24],
    activeNodes: [],
    displayRoot: 0,
    queue: [],
    final: true,
    vars: [
      { name: bi("scores", "scores"), value: [...score] },
      { name: bi("k", "k"), value: k },
      { name: bi("answer", "answer"), value: answer },
    ],
  });

  finishTrace(steps, 2581);
  return {
    original: { edges: edges.map((edge) => [...edge]), guesses: guesses.map((guess) => [...guess]), k },
    answer,
    steps,
  };
}

function buildSteps2646(input, params = {}) {
  const { n, edges, price, trips, tree } = parse2646(input, params);
  const usage = Array(n).fill(0);
  const full = Array(n).fill(null);
  const half = Array(n).fill(null);
  const dpDone = new Set();
  const selectedHalf = new Set();
  const tripSummaries = [];
  const steps = [];
  let tripsProcessed = 0;
  let traceTruncated = false;

  const emit = (options) => {
    if (!options.final && steps.length >= TRACE_LIMIT_2646 - 1) {
      traceTruncated = true;
      return;
    }
    const activePath = options.activePath || [];
    const pathNodes = new Set(activePath);
    const pathEdges = edgeSetFromPath(activePath);
    const activeEdgeKey = options.activeEdge
      ? undirectedKey(options.activeEdge[0], options.activeEdge[1])
      : null;
    const activeNodes = new Set(options.activeNodes || []);
    if (options.activeNode !== null && options.activeNode !== undefined) activeNodes.add(options.activeNode);
    const graph = makeTreeGraph(tree, {
      nodeLabel: (node) => `u${node}`,
      nodeSub: (node) => `price=${price[node]} · use=${usage[node]}`,
      nodeState: (node) => {
        if (activeNodes.has(node)) return "active";
        if (pathNodes.has(node)) return "path";
        if (options.final && selectedHalf.has(node)) return "success";
        if (options.final || dpDone.has(node)) return "visited";
        if (usage[node] > 0) return "candidate";
        return "idle";
      },
      edgeState: (parent, child) => {
        const key = undirectedKey(parent, child);
        if (key === activeEdgeKey) return "active";
        if (pathEdges.has(key)) return "path";
        if (dpDone.has(child)) return "visited";
        return "idle";
      },
      edgeLabel: (parent, child) => `${parent}—${child}`,
      directed: false,
    });

    const usageTotal = usage.reduce((sum, count) => sum + count, 0);
    const rootBest = full[0] === null ? null : Math.min(full[0], half[0]);
    const contributionItems = (options.contributions || []).map((item) => ({
      label: `child u${item.child}`,
      value: `full +${item.toFull}; half +${item.toHalf}`,
      state: item.child === options.activeChild ? "active" : "visited",
    }));
    const selectedItems = [...selectedHalf].sort((a, b) => a - b).map((node) => ({
      label: `u${node}`,
      value: `${usage[node]}×(${price[node]}/2)`,
      state: "success",
    }));
    const view = {
      problemId: 2646,
      phaseIndex: options.phaseIndex,
      phases: PHASES_2646,
      phase: options.phase,
      action: options.action,
      formula: options.formula,
      metrics: [
        { label: bi("Số node", "Nodes"), value: `${n}/${MAX_TREE_N}` },
        { label: bi("Trip đã xử lý", "Trips processed"), value: `${tripsProcessed}/${trips.length}` },
        { label: bi("Tổng lượt dùng node", "Total node uses"), value: usageTotal },
        { label: bi("Node DP hoàn tất", "Completed DP nodes"), value: `${dpDone.size}/${n}` },
        { label: bi("Chi phí tốt nhất ở gốc", "Best root cost"), value: rootBest === null ? "—" : rootBest, state: rootBest === null ? "muted" : "success" },
        { label: bi("Node giảm nửa", "Halved nodes"), value: selectedHalf.size, state: selectedHalf.size ? "success" : "muted" },
      ],
      graph,
      table: {
        title: bi("Usage và hai trạng thái DP", "Usage and the two DP states"),
        columns: [
          bi("node", "node"),
          bi("price", "price"),
          bi("usage", "usage"),
          bi("full (không giảm)", "full (not halved)"),
          bi("half (giảm nửa)", "half (halved)"),
          bi("chọn cuối", "final choice"),
        ],
        rows: Array.from({ length: n }, (_, node) => ({
          label: `u${node}`,
          state: activeNodes.has(node)
            ? "active"
            : options.final && selectedHalf.has(node)
              ? "success"
              : dpDone.has(node)
                ? "visited"
                : "idle",
          cells: [
            node,
            price[node],
            usage[node],
            full[node] === null ? { value: "—", state: "muted" } : full[node],
            half[node] === null ? { value: "—", state: "muted" } : half[node],
            options.final
              ? { value: selectedHalf.has(node) ? "half" : "full", state: selectedHalf.has(node) ? "success" : "visited" }
              : { value: "—", state: "muted" },
          ],
        })),
      },
      queue: (options.queue || []).map((node, index) => ({
        label: `u${node}`,
        sub: full[node] === null ? "pending" : `F=${full[node]}, H=${half[node]}`,
        state: index === 0 ? "active" : "queued",
      })),
      groups: [
        {
          title: bi("Các trip đã cộng usage", "Trips already added to usage"),
          items: tripSummaries.map((trip) => ({
            label: `trip ${trip.index + 1}: ${trip.start}→${trip.end}`,
            value: trip.path.join("→"),
            state: "visited",
          })),
        },
        { title: bi("Đóng góp của các con", "Child contributions"), items: contributionItems },
        { title: bi("Kế hoạch giảm nửa", "Halving plan"), items: selectedItems },
      ],
      sequence: activePath.map((node, index) => ({
        label: `u${node}`,
        value: `usage=${usage[node]}`,
        state: index === options.pathPosition ? "active" : "path",
      })),
      legend: [
        { label: bi("Node/cạnh đang xử lý", "Active node/edge"), state: "active" },
        { label: bi("Đường đi trip", "Trip path"), state: "path" },
        { label: bi("Có usage", "Used by trips"), state: "candidate" },
        { label: bi("Đã tính DP", "DP complete"), state: "visited" },
        { label: bi("Được giảm nửa", "Halved"), state: "success" },
      ],
      answer: options.final ? rootBest : null,
      traceTruncated,
    };

    const highlight = activePath.length ? [...activePath] : [...activeNodes];
    if (options.activeEdge) highlight.push(...options.activeEdge);
    pushStep(steps, SOURCE_2646, 2646, {
      title: options.title,
      note: options.note,
      codeLines: options.codeLines,
      vars: options.vars || [
        { name: bi("active node", "active node"), value: options.activeNode ?? "—" },
        { name: bi("trips done", "trips done"), value: tripsProcessed },
        { name: bi("usage total", "usage total"), value: usageTotal },
        { name: bi("root best", "root best"), value: rootBest === null ? "—" : rootBest },
      ],
      arr: price,
      sub: price.map((value, node) => `u${node}: p=${value}, use=${usage[node]}, F=${full[node] ?? "?"}, H=${half[node] ?? "?"}`),
      highlight,
      mark: options.final ? [...new Set([...dpDone, ...selectedHalf])] : [...dpDone],
      final: Boolean(options.final),
      hardProblemView: view,
    });
  };

  emit({
    phaseIndex: 0,
    phase: "prepare",
    action: bi("Kiểm tra cây, price và trips", "Validate the tree, prices, and trips"),
    formula: bi("|E| = n − 1; price chẵn; mọi endpoint hợp lệ", "|E| = n − 1; prices are even; every endpoint is valid"),
    title: bi("Dữ liệu cây hợp lệ", "Validated tree data"),
    note: bi(
      "Parser kiểm tra giới hạn visualization, self-loop, cạnh lặp, chu trình, liên thông, price chẵn và endpoint của từng trip.",
      "The parser checks visualization bounds, self-loops, duplicate edges, cycles, connectivity, even prices, and every trip endpoint.",
    ),
    codeLines: [3, 4, 5, 6],
    activeNode: 0,
    activeNodes: [0],
    queue: tree.order,
  });

  emit({
    phaseIndex: 1,
    phase: "count-usage",
    action: bi("Khởi tạo usage bằng 0", "Initialize usage to zero"),
    formula: bi("usage = [0] × n", "usage = [0] × n"),
    title: bi("Sẵn sàng cộng các đường đi", "Ready to add trip paths"),
    note: bi(
      "Mỗi trip sẽ tăng usage đúng một lần cho từng node trên đường đi duy nhất giữa hai đầu mút.",
      "Each trip increments every node exactly once on the unique path between its endpoints.",
    ),
    codeLines: [7],
    activeNode: 0,
    activeNodes: [0],
    queue: [],
  });

  for (let tripIndex = 0; tripIndex < trips.length; tripIndex++) {
    const [start, end] = trips[tripIndex];
    const path = pathBetween(tree, start, end);
    emit({
      phaseIndex: 1,
      phase: "count-usage",
      action: bi(`Tìm đường trip ${start}→${end}`, `Find trip path ${start}→${end}`),
      formula: bi(`path = ${path.join("→")}`, `path = ${path.join("→")}`),
      title: bi(`Trip ${tripIndex + 1}: ${path.join(" → ")}`, `Trip ${tripIndex + 1}: ${path.join(" → ")}`),
      note: bi(
        "Trong cây liên thông không chu trình, đường đi này là duy nhất.",
        "A connected acyclic tree has exactly one such path.",
      ),
      codeLines: [17, 18],
      activeNode: start,
      activeNodes: [start, end],
      activePath: path,
      pathPosition: 0,
      queue: path,
      vars: [
        { name: bi("trip", "trip"), value: [start, end] },
        { name: bi("path", "path"), value: [...path] },
        { name: bi("độ dài node", "node length"), value: path.length },
      ],
    });

    for (let pathIndex = path.length - 1; pathIndex >= 0; pathIndex--) {
      const node = path[pathIndex];
      usage[node] += 1;
      const activeEdge = pathIndex + 1 < path.length ? [node, path[pathIndex + 1]] : null;
      emit({
        phaseIndex: 1,
        phase: "count-usage",
        action: bi(`Tăng usage[${node}]`, `Increment usage[${node}]`),
        formula: bi(`usage[${node}] = ${usage[node] - 1} + 1 = ${usage[node]}`, `usage[${node}] = ${usage[node] - 1} + 1 = ${usage[node]}`),
        title: bi(`u${node} được dùng ${usage[node]} lần`, `u${node} is used ${usage[node]} time(s)`),
        note: pathIndex === path.length - 1
          ? bi(
            "Đây là target của DFS add_path, nên tăng tại base case trước khi trả True.",
            "This is add_path's DFS target, so the base case increments it before returning True.",
          )
          : bi(
            "Khi lời gọi con trả True, node tổ tiên này nằm trên đường đi và được tăng trong lúc unwind.",
            "When the child call returns True, this ancestor lies on the path and is incremented during unwinding.",
          ),
        codeLines: pathIndex === path.length - 1 ? [8, 9, 10, 11] : [12, 13, 14, 15],
        activeNode: node,
        activeNodes: [node],
        activeEdge,
        activePath: path,
        pathPosition: pathIndex,
        queue: path.slice(0, pathIndex),
        vars: [
          { name: bi("trip", "trip"), value: [start, end] },
          { name: bi("node", "node"), value: node },
          { name: bi("usage[node]", "usage[node]"), value: usage[node] },
          { name: bi("unwind còn lại", "remaining unwind"), value: pathIndex },
        ],
      });
    }
    tripSummaries.push({ index: tripIndex, start, end, path: [...path] });
    tripsProcessed += 1;
    emit({
      phaseIndex: 1,
      phase: "count-usage",
      action: bi(`Hoàn tất trip ${tripIndex + 1}`, `Complete trip ${tripIndex + 1}`),
      formula: bi(`usage đã cộng trên ${path.length} node`, `usage added on ${path.length} nodes`),
      title: bi(`Đã cộng đường ${start}→${end}`, `Added path ${start}→${end}`),
      note: bi(
        `Mảng usage hiện là [${usage.join(", ")}].`,
        `The usage array is now [${usage.join(", ")}].`,
      ),
      codeLines: [17, 18],
      activeNode: null,
      activeNodes: [start, end],
      activePath: path,
      queue: [],
    });
  }

  const postorder = [...tree.order].reverse();
  for (let orderIndex = 0; orderIndex < postorder.length; orderIndex++) {
    const node = postorder[orderIndex];
    full[node] = usage[node] * price[node];
    half[node] = usage[node] * (price[node] / 2);
    const contributions = [];
    emit({
      phaseIndex: 2,
      phase: "tree-dp",
      action: bi(`Khởi tạo hai trạng thái tại u${node}`, `Initialize both states at u${node}`),
      formula: bi(
        `full=${usage[node]}×${price[node]}=${full[node]}; half=${usage[node]}×${price[node] / 2}=${half[node]}`,
        `full=${usage[node]}×${price[node]}=${full[node]}; half=${usage[node]}×${price[node] / 2}=${half[node]}`,
      ),
      title: bi(`Base cost của u${node}`, `Base cost for u${node}`),
      note: bi(
        "full nghĩa là node này không giảm; half nghĩa là node này giảm một nửa trước khi cộng các subtree con.",
        "full means this node is not halved; half means it is halved before child subtrees are added.",
      ),
      codeLines: [19, 20, 21],
      activeNode: node,
      activeNodes: [node],
      queue: postorder.slice(orderIndex + 1),
      contributions,
      vars: [
        { name: bi("node", "node"), value: node },
        { name: bi("usage", "usage"), value: usage[node] },
        { name: bi("full base", "full base"), value: full[node] },
        { name: bi("half base", "half base"), value: half[node] },
      ],
    });

    for (const child of tree.children[node]) {
      if (full[child] === null || half[child] === null) {
        throw new Error(`#2646: child u${child} DP must be complete before parent u${node}`);
      }
      const toFull = Math.min(full[child], half[child]);
      const toHalf = full[child];
      full[node] += toFull;
      half[node] += toHalf;
      contributions.push({ child, toFull, toHalf });
      emit({
        phaseIndex: 2,
        phase: "tree-dp",
        action: bi(`Gộp subtree con u${child}`, `Merge child subtree u${child}`),
        formula: bi(
          `full += min(${full[child]},${half[child]})=${toFull}; half += ${full[child]}`,
          `full += min(${full[child]},${half[child]})=${toFull}; half += ${full[child]}`,
        ),
        title: bi(`Cập nhật DP u${node} từ u${child}`, `Update u${node}'s DP from u${child}`),
        note: bi(
          "Nếu u hiện tại full, child được chọn rẻ hơn giữa full/half. Nếu u hiện tại half, child bắt buộc full để hai node kề nhau không cùng giảm.",
          "If the current node is full, choose the cheaper child state. If it is half, the child must be full so adjacent nodes are never both halved.",
        ),
        codeLines: [22, 23, 24, 25, 26, 27],
        activeNode: node,
        activeChild: child,
        activeNodes: [node, child],
        activeEdge: [node, child],
        queue: postorder.slice(orderIndex + 1),
        contributions,
        vars: [
          { name: bi("node", "node"), value: node },
          { name: bi("child", "child"), value: child },
          { name: bi("full[node]", "full[node]"), value: full[node] },
          { name: bi("half[node]", "half[node]"), value: half[node] },
        ],
      });
    }
    dpDone.add(node);
    emit({
      phaseIndex: 2,
      phase: "tree-dp",
      action: bi(`Trả cặp DP của u${node}`, `Return u${node}'s DP pair`),
      formula: bi(`dp(${node}) = (${full[node]}, ${half[node]})`, `dp(${node}) = (${full[node]}, ${half[node]})`),
      title: bi(`Hoàn tất u${node}: F=${full[node]}, H=${half[node]}`, `Complete u${node}: F=${full[node]}, H=${half[node]}`),
      note: bi(
        "Mọi child đã hoàn tất trước parent nhờ thứ tự postorder.",
        "Every child is complete before its parent because nodes are processed in postorder.",
      ),
      codeLines: [28],
      activeNode: node,
      activeNodes: [node],
      queue: postorder.slice(orderIndex + 1),
      contributions,
    });
  }

  const answer = Math.min(full[0], half[0]);
  const reconstruction = [{ node: 0, parentHalved: false }];
  while (reconstruction.length) {
    const state = reconstruction.pop();
    const chooseHalf = !state.parentHalved && half[state.node] < full[state.node];
    if (chooseHalf) selectedHalf.add(state.node);
    for (let index = tree.children[state.node].length - 1; index >= 0; index--) {
      reconstruction.push({
        node: tree.children[state.node][index],
        parentHalved: chooseHalf,
      });
    }
  }
  for (const [u, v] of edges) {
    if (selectedHalf.has(u) && selectedHalf.has(v)) {
      throw new Error(`#2646: adjacent nodes u${u} and u${v} were both halved`);
    }
  }
  const reconstructedCost = price.reduce(
    (total, value, node) => total + usage[node] * (selectedHalf.has(node) ? value / 2 : value),
    0,
  );
  if (reconstructedCost !== answer) {
    throw new Error(`#2646: reconstructed cost ${reconstructedCost} does not match answer ${answer}`);
  }

  emit({
    phaseIndex: 4,
    phase: "done",
    action: bi("Chọn min(full[0], half[0])", "Choose min(full[0], half[0])"),
    formula: bi(`min(${full[0]}, ${half[0]}) = ${answer}`, `min(${full[0]}, ${half[0]}) = ${answer}`),
    title: bi(`Tổng giá tối thiểu = ${answer}`, `Minimum total price = ${answer}`),
    note: traceTruncated
      ? bi(
        `Trace được giới hạn ở ${TRACE_LIMIT_2646} frame, nhưng usage của mọi trip, toàn bộ DP và kế hoạch giảm nửa vẫn được tính đầy đủ.`,
        `The trace was capped at ${TRACE_LIMIT_2646} frames, but every trip's usage, the full DP, and the halving plan were still computed.`,
      )
      : bi(
        `Giảm nửa các node {${[...selectedHalf].sort((a, b) => a - b).join(", ") || "∅"}}; không có hai node kề nhau cùng được giảm.`,
        `Halve nodes {${[...selectedHalf].sort((a, b) => a - b).join(", ") || "∅"}}; no adjacent pair is halved together.`,
      ),
    codeLines: [29],
    activeNode: null,
    activeNodes: [],
    activePath: [],
    queue: [],
    final: true,
    vars: [
      { name: bi("usage", "usage"), value: [...usage] },
      { name: bi("full", "full"), value: [...full] },
      { name: bi("half", "half"), value: [...half] },
      { name: bi("halved nodes", "halved nodes"), value: [...selectedHalf].sort((a, b) => a - b) },
      { name: bi("answer", "answer"), value: answer },
    ],
  });

  finishTrace(steps, 2646);
  return {
    original: {
      n,
      edges: edges.map((edge) => [...edge]),
      price: [...price],
      trips: trips.map((trip) => [...trip]),
    },
    answer,
    steps,
  };
}

module.exports = {
  2003: {
    id: 2003,
    difficulty: "hard",
    slug: "smallest-missing-genetic-value-in-each-subtree",
    category: { key: "binary-tree", vi: "Cây nhị phân", en: "Binary Tree" },
    tags: [
      { key: "tree", vi: "Cây", en: "Tree" },
      { key: "dfs", vi: "DFS", en: "DFS" },
      { key: "hash-set", vi: "Hash Set", en: "Hash Set" },
    ],
    title: bi("Smallest Missing Genetic Value in Each Subtree", "Smallest Missing Genetic Value in Each Subtree"),
    titleVi: bi("Giá trị gene thiếu nhỏ nhất trong mỗi cây con", "Smallest Missing Genetic Value in Each Subtree"),
    statement: bi(
      "parents mô tả cây gốc 0 và nums[u] là genetic value duy nhất của node u. Với mỗi node, tìm số nguyên dương nhỏ nhất không xuất hiện trong subtree của node đó.",
      "parents describes a tree rooted at 0 and nums[u] is node u's unique genetic value. For every node, find the smallest positive integer absent from its subtree.",
    ),
    defaultInput: "[-1,0,0,2]",
    inputKind: "string",
    inputLabel: bi("parents (JSON hoặc -1,0,...)", "parents (JSON or -1,0,... )"),
    extraParams: [
      {
        key: "nums",
        type: "string",
        label: bi("nums (genetic values duy nhất)", "nums (unique genetic values)"),
        default: "[1,2,3,4]",
      },
    ],
    visualizationLimits: { maxNodes: MAX_TREE_N, maxTraceSteps: TRACE_LIMIT_2003, maxGeneValue: MAX_GENE_VALUE },
    approach: [
      bi("Nếu không có value 1, mọi subtree đều thiếu 1 nên trả mảng toàn 1.", "If value 1 is absent, every subtree is missing 1, so return all ones."),
      bi("Bắt đầu ở node chứa 1 và đi dọc chuỗi tổ tiên lên gốc.", "Start at the node containing 1 and walk its ancestor chain to the root."),
      bi("Tại mỗi tổ tiên, quét phần subtree mới lộ ra và chặn nhánh con đã quét, nên mỗi node chỉ vào seen một lần.", "At each ancestor, scan only the newly exposed subtree portion and block the already scanned child branch, so every node enters seen once."),
      bi("Tăng mex trong set seen rồi lưu mex cho tổ tiên hiện tại.", "Advance mex through the global seen set and store it for the current ancestor."),
    ],
    complexity: {
      time: "O(n)",
      space: "O(n)",
      note: bi(
        "Mỗi node được quét tối đa một lần và mex chỉ tăng; trace có giới hạn nhưng đáp án luôn được tính đầy đủ.",
        "Each node is scanned at most once and mex only advances; the trace is capped but the full answer is always computed.",
      ),
    },
    code: [...SOURCE_2003],
    debugMode: "line-by-line",
    parser: parse2003,
    liveArgs: (input, params = {}) => {
      const parsed = parse2003(input, params);
      return [[...parsed.parents], [...parsed.nums]];
    },
    builder: buildSteps2003,
  },

  2581: {
    id: 2581,
    difficulty: "hard",
    slug: "count-number-of-possible-root-nodes",
    category: { key: "binary-tree", vi: "Cây nhị phân", en: "Binary Tree" },
    tags: [
      { key: "tree", vi: "Cây", en: "Tree" },
      { key: "dfs", vi: "DFS", en: "DFS" },
      { key: "rerooting", vi: "Đổi gốc", en: "Rerooting" },
      { key: "hash-set", vi: "Hash Set", en: "Hash Set" },
    ],
    title: bi("Count Number of Possible Root Nodes", "Count Number of Possible Root Nodes"),
    titleVi: bi("Đếm số node có thể làm gốc", "Count Number of Possible Root Nodes"),
    statement: bi(
      "Cho một cây vô hướng và các guess có hướng parent→child. Đếm số cách chọn gốc sao cho ít nhất k guess đúng.",
      "Given an undirected tree and directed parent→child guesses, count the roots for which at least k guesses are correct.",
    ),
    defaultInput: "[[0,1],[1,2],[1,3],[4,2]]",
    inputKind: "string",
    inputLabel: bi("edges (JSON hoặc u,v;u,v)", "edges (JSON or u,v;u,v)"),
    extraParams: [
      {
        key: "guesses",
        type: "string",
        label: bi("guesses có hướng", "directed guesses"),
        default: "[[1,3],[0,1],[1,0],[2,4]]",
      },
      {
        key: "k",
        label: bi("k (guess đúng tối thiểu)", "k (minimum correct guesses)"),
        default: 3,
        min: 0,
        max: MAX_GUESSES,
      },
    ],
    visualizationLimits: { maxNodes: MAX_TREE_N, maxGuesses: MAX_GUESSES, maxTraceSteps: TRACE_LIMIT_2581 },
    approach: [
      bi("Định hướng cây từ gốc 0 và đếm score[0], số guess parent→child đúng.", "Orient the tree from root 0 and count score[0], the correct parent→child guesses."),
      bi("Duyệt node theo thứ tự parent trước child để đổi gốc qua từng cạnh.", "Visit nodes parent-before-child and reroot across each edge."),
      bi("Qua cạnh parent—child, chỉ hướng cạnh đó đổi: trừ has(parent,child), cộng has(child,parent).", "Across parent—child, only that edge flips: subtract has(parent,child), add has(child,parent)."),
      bi("Đếm mọi score[root] ≥ k.", "Count every score[root] ≥ k."),
    ],
    complexity: {
      time: "O(n + guesses)",
      space: "O(n + guesses)",
      note: bi(
        "Set cho phép kiểm tra guess O(1); mỗi cạnh cây được xử lý số lần hằng số.",
        "The set gives O(1) guess checks, and each tree edge is processed a constant number of times.",
      ),
    },
    code: [...SOURCE_2581],
    debugMode: "line-by-line",
    parser: parse2581,
    liveArgs: (input, params = {}) => {
      const parsed = parse2581(input, params);
      return [parsed.edges.map((edge) => [...edge]), parsed.guesses.map((guess) => [...guess]), parsed.k];
    },
    builder: buildSteps2581,
  },

  2646: {
    id: 2646,
    difficulty: "hard",
    slug: "minimize-the-total-price-of-the-trips",
    category: { key: "binary-tree", vi: "Cây nhị phân", en: "Binary Tree" },
    tags: [
      { key: "tree", vi: "Cây", en: "Tree" },
      { key: "dp", vi: "Quy hoạch động", en: "Dynamic Programming" },
      { key: "dfs", vi: "DFS", en: "DFS" },
    ],
    title: bi("Minimize the Total Price of the Trips", "Minimize the Total Price of the Trips"),
    titleVi: bi("Tối thiểu hóa tổng giá của các chuyến đi", "Minimize the Total Price of the Trips"),
    statement: bi(
      "Mỗi trip đi trên đường duy nhất giữa hai node. Có thể giảm một nửa price của một tập node không kề nhau. Tìm tổng chi phí nhỏ nhất của mọi trip.",
      "Each trip follows the unique path between two nodes. Prices may be halved on a set of non-adjacent nodes. Find the minimum total cost of all trips.",
    ),
    defaultInput: "[[0,1],[1,2],[1,3]]",
    inputKind: "string",
    inputLabel: bi("edges (JSON hoặc u,v;u,v)", "edges (JSON or u,v;u,v)"),
    extraParams: [
      {
        key: "price",
        type: "string",
        label: bi("price chẵn theo node", "even price per node"),
        default: "[2,2,10,6]",
      },
      {
        key: "trips",
        type: "string",
        label: bi("trips [start,end]", "trips [start,end]"),
        default: "[[0,3],[2,1],[2,3]]",
      },
    ],
    visualizationLimits: { maxNodes: MAX_TREE_N, maxTrips: MAX_TRIPS, maxPrice: MAX_PRICE, maxTraceSteps: TRACE_LIMIT_2646 },
    approach: [
      bi("Tìm đường duy nhất của từng trip và tăng usage cho mọi node trên đường.", "Find each trip's unique path and increment usage for every node on it."),
      bi("DP postorder với full[u]: u không giảm, và half[u]: u giảm một nửa.", "Run postorder DP with full[u] for an unhalved u and half[u] for a halved u."),
      bi("full[u] nhận min trạng thái của child; half[u] bắt buộc child dùng full để không giảm hai node kề nhau.", "full[u] takes the cheaper child state; half[u] forces the child's full state so adjacent nodes are not both halved."),
      bi("Đáp án là min(full[0], half[0]); dựng lại một tập node giảm nửa hợp lệ.", "The answer is min(full[0], half[0]); reconstruct one valid halving set."),
    ],
    complexity: {
      time: "O(n · trips + n)",
      space: "O(n)",
      note: bi(
        "Visualization tìm từng đường đi trong O(n), sau đó DP cây O(n); trace có thể bị rút gọn nhưng mọi phép tính vẫn chạy.",
        "The visualization finds each path in O(n), then runs O(n) tree DP; trace detail may be capped while all computation continues.",
      ),
    },
    code: [...SOURCE_2646],
    debugMode: "line-by-line",
    parser: parse2646,
    liveArgs: (input, params = {}) => {
      const parsed = parse2646(input, params);
      return [
        parsed.n,
        parsed.edges.map((edge) => [...edge]),
        [...parsed.price],
        parsed.trips.map((trip) => [...trip]),
      ];
    },
    builder: buildSteps2646,
  },
};
