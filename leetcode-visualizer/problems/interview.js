// Interview-style additions: heap enumeration, language model counts, and indexed BFS.

const HEAP = { key: "heap", vi: "Heap / Priority Queue", en: "Heap / Priority Queue" };
const SORTING = { key: "sorting", vi: "Sắp xếp", en: "Sorting" };
const DESIGN = { key: "design", vi: "Thiết kế hệ thống", en: "Design" };
const HASHMAP = { key: "hashmap", vi: "Hash Map", en: "Hash Map" };
const STRING = { key: "string", vi: "Chuỗi", en: "String" };
const GRAPH = { key: "graph", vi: "Đồ thị", en: "Graph" };
const BFS = { key: "bfs", vi: "BFS", en: "BFS" };
const MATRIX = { key: "2d-array", vi: "Mảng 2D", en: "2D Array" };
const GEOMETRY = { key: "geometry", vi: "Hình học", en: "Geometry" };
const FILE_IO = { key: "file-io", vi: "File I/O", en: "File I/O" };
const DP = { key: "dp", vi: "Quy hoạch động", en: "Dynamic Programming" };
const BACKTRACKING = { key: "backtracking", vi: "Quay lui", en: "Backtracking" };
const INTERVAL = { key: "interval", vi: "Khoảng", en: "Interval" };
const SWEEP = { key: "sweep-line", vi: "Đường quét", en: "Sweep Line" };
const MINIMAX = { key: "minimax", vi: "Minimax", en: "Minimax" };

function buildSteps2386(input, params = {}) {
  const nums = (Array.isArray(input) ? input : []).map(Number);
  const k = Number(params.k);
  if (!nums.length || nums.some((value) => !Number.isInteger(value)) || !Number.isInteger(k) || k < 1) throw new Error("nums phải là số nguyên và k phải dương.");
  const totalSubsets = 2 ** nums.length;
  if (k > totalSubsets) throw new Error(`k không thể lớn hơn ${totalSubsets} subset.`);
  const maxSum = nums.reduce((sum, value) => sum + Math.max(0, value), 0);
  const absNums = nums.map(Math.abs).sort((a, b) => a - b);
  const heap = [];
  const steps = [];
  const push = (item) => { heap.push(item); heap.sort((a, b) => a.removed - b.removed || a.index - b.index); };
  const heapText = () => `[${heap.map((item) => `(${item.removed}, i=${item.index})`).join(", ")}]`;
  const snap = (options) => steps.push({
    title: options.title, arr: [...absNums], highlight: options.highlight || [], mark: options.mark || [], final: Boolean(options.final), codeLines: options.codeLines || [],
    vars: [{ name: "max_sum", value: maxSum }, { name: "min-heap (removed sum)", value: heapText() }, { name: "candidate", value: options.candidate ?? "—" }],
    note: options.note,
  });
  snap({ title: { vi: `max_sum = ${maxSum}`, en: `max_sum = ${maxSum}` }, codeLines: [3, 4], note: { vi: "Subset lớn nhất lấy mọi số dương. Các subset nhỏ hơn tương đương với việc trừ một tổng trị tuyệt đối.", en: "The largest subset takes every positive number. Smaller subsets are equivalent to subtracting an absolute-value sum." } });
  snap({ title: { vi: `Sort |nums| → [${absNums.join(", ")}]`, en: `Sort |nums| → [${absNums.join(", ")}]` }, codeLines: [5], note: { vi: "Heap sẽ liệt kê các tổng bị trừ theo thứ tự tăng dần.", en: "The heap enumerates removed sums in ascending order." } });
  if (k === 1) {
    snap({ title: { vi: `k=1 → ${maxSum}`, en: `k=1 → ${maxSum}` }, codeLines: [6], candidate: maxSum, final: true, note: { vi: "Subset lớn nhất là đáp án đầu tiên.", en: "The largest subset is the first answer." } });
    return { original: nums, answer: maxSum, steps };
  }
  push({ removed: absNums[0], index: 0 });
  snap({ title: { vi: `Push (${absNums[0]}, 0)`, en: `Push (${absNums[0]}, 0)` }, codeLines: [8], highlight: [0], note: { vi: "Bắt đầu bằng cách bỏ trị tuyệt đối nhỏ nhất.", en: "Start by removing the smallest absolute value." } });
  let answer = maxSum;
  for (let rank = 2; rank <= k; rank++) {
    const current = heap.shift();
    answer = maxSum - current.removed;
    snap({ title: { vi: `Pop thứ hạng ${rank}: ${maxSum} - ${current.removed} = ${answer}`, en: `Pop rank ${rank}: ${maxSum} - ${current.removed} = ${answer}` }, codeLines: [10, 11], highlight: [current.index], candidate: answer, note: { vi: "Min removed-sum tạo ra subset-sum lớn nhất còn lại.", en: "The smallest removed sum creates the largest remaining subset sum." } });
    const next = current.index + 1;
    if (next < absNums.length) {
      push({ removed: current.removed + absNums[next], index: next });
      snap({ title: { vi: `Thêm |nums|[${next}] vào removed sum`, en: `Add |nums|[${next}] to the removed sum` }, codeLines: [13], highlight: [current.index, next], candidate: answer, note: { vi: "Nhánh 1 giữ lựa chọn cũ và thêm phần tử kế tiếp.", en: "Branch 1 keeps the old choice and adds the next element." } });
      push({ removed: current.removed - absNums[current.index] + absNums[next], index: next });
      snap({ title: { vi: `Thay |nums|[${current.index}] bằng |nums|[${next}]`, en: `Replace |nums|[${current.index}] with |nums|[${next}]` }, codeLines: [14], highlight: [current.index, next], candidate: answer, note: { vi: "Nhánh 2 thay phần tử cuối để không bỏ sót tổ hợp nào.", en: "Branch 2 replaces the last element so no combination is missed." } });
    }
  }
  snap({ title: { vi: `Return ${answer}`, en: `Return ${answer}` }, codeLines: [15], candidate: answer, final: true, note: { vi: `Đây là k-sum lớn thứ ${k}.`, en: `This is the ${k}-th largest subset sum.` } });
  return { original: nums, answer, steps };
}

function buildSteps9005(input, params = {}) {
  const sentences = String(input || "").split("|").map((line) => line.trim().toLowerCase().split(/\s+/).filter(Boolean)).filter((words) => words.length > 1);
  const query = String(params.word || "").trim().toLowerCase();
  if (!sentences.length || !query) throw new Error("Nhập câu (ngăn bởi |) và từ truy vấn.");
  const counts = new Map();
  const steps = [];
  const table = () => `{${[...counts.entries()].map(([word, next]) => `${word}→{${[...next.entries()].map(([key, value]) => `${key}:${value}`).join(",")}}`).join("; ")}}`;
  const snap = (title, line, note, final = false, current = "") => steps.push({ title, arr: [], highlight: [], mark: [], final, codeLines: [line], vars: [{ name: "counts", value: table() }, { name: "query", value: query }, { name: "pair", value: current || "—" }], note });
  snap({ vi: "Khởi tạo bảng transition", en: "Initialize transition counts" }, 3, { vi: "counts[word][next] đếm bigram word → next.", en: "counts[word][next] counts the bigram word → next." });
  for (const words of sentences) {
    for (let index = 0; index + 1 < words.length; index++) {
      const [word, next] = [words[index], words[index + 1]];
      if (!counts.has(word)) counts.set(word, new Map());
      const nextCounts = counts.get(word);
      nextCounts.set(next, (nextCounts.get(next) || 0) + 1);
      snap({ vi: `Train “${word}” → “${next}”`, en: `Train “${word}” → “${next}”` }, 6, { vi: "Tăng số lần xuất hiện của bigram.", en: "Increment the occurrence count of this bigram." }, false, `${word} → ${next}`);
    }
  }
  const winner = new Map();
  for (const [word, options] of counts) {
    winner.set(word, [...options.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))[0][0]);
  }
  const choices = counts.get(query) || new Map();
  snap({ vi: `Tra hash map cho “${query}”`, en: `Hash-map lookup for “${query}”` }, 8, { vi: "Sau preprocessing, chỉ cần một lần tra counts[query].", en: "After preprocessing, only one counts[query] lookup is needed." });
  const prediction = winner.get(query) || null;
  snap(prediction ? { vi: `Dự đoán: “${prediction}”`, en: `Prediction: “${prediction}”` } : { vi: "Không có dự đoán", en: "No prediction" }, 9, prediction ? { vi: `“${prediction}” có tần suất lớn nhất; hòa chọn alphabet nhỏ hơn.`, en: `“${prediction}” has the largest count; ties choose alphabetically.` } : { vi: "Từ query chưa xuất hiện trước một từ khác.", en: "The query word never appears before another word." }, true);
  return { original: sentences.map((words) => words.join(" ")), answer: prediction, steps };
}

function buildSteps9006(input, params = {}) {
  const edgeTokens = String(input || "").split(/[;,]+/).map((token) => token.trim()).filter(Boolean);
  const edges = edgeTokens.map((token) => token.split("-").map((name) => name.trim())).filter((pair) => pair.length === 2 && pair[0] && pair[1]);
  const start = String(params.start || "").trim();
  const target = String(params.target || "").trim();
  if (!edges.length || !start || !target) throw new Error("Nhập edges như A-B,B-C cùng start và target.");
  const names = [...new Set(edges.flat())];
  if (!names.includes(start) || !names.includes(target)) throw new Error("start và target phải xuất hiện trong edges.");
  const idOf = new Map(names.map((name, index) => [name, index]));
  const nameOf = [...names];
  const adjacency = Array.from({ length: names.length }, () => []);
  edges.forEach(([left, right]) => { const a = idOf.get(left); const b = idOf.get(right); adjacency[a].push(b); adjacency[b].push(a); });
  const queue = [idOf.get(start)], parent = Array(names.length).fill(-1), visited = new Set(queue), steps = [];
  const graph = (current = null, path = []) => ({ nodes: nameOf.map((name, id) => ({ id, label: name, sub: id === idOf.get(start) ? "start" : id === idOf.get(target) ? "target" : `id=${id}` })), edges: edges.map(([left, right]) => ({ u: idOf.get(left), v: idOf.get(right), undirected: true })), hlNodes: current === null ? [] : [current], visitedNodes: [...visited], annotations: Object.fromEntries(path.map((id, index) => [id, `path ${index}`])) });
  const snap = (title, line, note, options = {}) => steps.push({ title, arr: [], highlight: [], mark: [], final: Boolean(options.final), codeLines: [line], graph: graph(options.current, options.path), vars: [{ name: "name ↔ id", value: `{${nameOf.map((name, id) => `${name}:${id}`).join(", ")}}` }, { name: "queue", value: `[${queue.map((id) => nameOf[id]).join(", ")}]` }], note });
  snap({ vi: "Dựng bimap name ↔ id", en: "Build the name ↔ id bimap" }, 3, { vi: "Map hai chiều giúp adjacency dùng mảng nhanh, nhưng UI vẫn hiển thị tên node. Với node 3D, key có thể là chuỗi “x,y,z”.", en: "The two-way map gives arrays fast adjacency while the UI still shows names. For 3D nodes, the key can be a string such as “x,y,z”." });
  snap({ vi: `BFS từ ${start}`, en: `BFS from ${start}` }, 7, { vi: "Queue FIFO đảm bảo lần đầu tới node là số cạnh ít nhất.", en: "A FIFO queue ensures the first arrival at a node uses the fewest edges." }, { current: idOf.get(start) });
  while (queue.length) {
    const node = queue.shift();
    snap({ vi: `Pop ${nameOf[node]}`, en: `Pop ${nameOf[node]}` }, 9, { vi: "Mở rộng tất cả neighbor chưa thăm.", en: "Expand every unvisited neighbor." }, { current: node });
    if (node === idOf.get(target)) break;
    for (const next of adjacency[node]) {
      if (visited.has(next)) continue;
      visited.add(next); parent[next] = node; queue.push(next);
      snap({ vi: `Visit ${nameOf[next]} từ ${nameOf[node]}`, en: `Visit ${nameOf[next]} from ${nameOf[node]}` }, 12, { vi: "Ghi parent để dựng đường ngắn nhất cuối cùng.", en: "Record parent to reconstruct the final shortest path." }, { current: next });
    }
  }
  const goal = idOf.get(target);
  const path = visited.has(goal) ? (() => { const result = []; for (let node = goal; node !== -1; node = parent[node]) result.push(node); return result.reverse(); })() : [];
  snap(path.length ? { vi: `Shortest path: ${path.map((id) => nameOf[id]).join(" → ")}`, en: `Shortest path: ${path.map((id) => nameOf[id]).join(" → ")}` } : { vi: "Không có đường đi", en: "No path exists" }, 15, path.length ? { vi: `Khoảng cách = ${path.length - 1}. Bimap là follow-up tối ưu mapping, còn BFS vẫn O(V+E).`, en: `Distance = ${path.length - 1}. The bimap optimizes mapping; BFS remains O(V+E).` } : { vi: "Target không reachable từ start.", en: "The target is not reachable from start." }, { current: goal, path, final: true });
  return { original: edges, answer: path.map((id) => nameOf[id]), steps };
}

function parseGrid(input) {
  const grid = String(input || "").split("|").map((row) => row.trim()).filter(Boolean).map((row) => row.includes(",") ? row.split(",").map(Number) : [...row].map(Number));
  if (!grid.length || !grid[0].length || grid.some((row) => row.length !== grid[0].length || row.some((value) => value !== 0 && value !== 1))) throw new Error("Grid phải là các hàng 0/1 cùng độ dài, ngăn bởi |.");
  return grid;
}

function parseCoordinateList(raw) {
  const coords = String(raw || "").split(";").map((part) => part.trim()).filter(Boolean).map((part) => part.split(",").map((value) => Number(value.trim())));
  if (!coords.length || coords.some(([row, col]) => !Number.isInteger(row) || !Number.isInteger(col))) throw new Error("Tọa độ phải có dạng row,col;row,col.");
  return coords;
}

function buildSteps9007(input, params = {}) {
  const grid = parseGrid(input);
  const rows = grid.length, cols = grid[0].length;
  const sources = parseCoordinateList(params.sources);
  const [target] = parseCoordinateList(params.target);
  const inside = ([row, col]) => row >= 0 && row < rows && col >= 0 && col < cols;
  if (!sources.every(inside) || !inside(target) || sources.some(([row, col]) => grid[row][col]) || grid[target[0]][target[1]]) throw new Error("Source/target phải nằm trong grid và ở ô trống (0).");
  const key = ([row, col]) => `${row},${col}`;
  const sourceKeys = new Set(sources.map(key));
  const targetKey = key(target);
  const queue = sources.map((point) => [...point]);
  const visited = new Set(sources.map(key));
  const parent = new Map();
  const steps = [];
  const cells = (current = null, path = []) => {
    const queued = new Set(queue.map(key));
    const pathSet = new Set(path.map(key));
    return grid.map((row, r) => row.map((value, c) => {
      const pointKey = `${r},${c}`;
      let cls = value ? "wall" : pathSet.has(pointKey) ? "path" : current && current[0] === r && current[1] === c ? "current" : queued.has(pointKey) ? "queued" : visited.has(pointKey) ? "visited" : "empty";
      const label = value ? "×" : sourceKeys.has(pointKey) ? "S" : pointKey === targetKey ? "T" : "";
      if (sourceKeys.has(pointKey) && !current) cls = "start";
      return { cls, label, meta: visited.has(pointKey) ? `d=${distance.get(pointKey)}` : "" };
    }));
  };
  const distance = new Map(sources.map((point) => [key(point), 0]));
  const snap = (title, line, note, current = null, path = [], final = false) => steps.push({
    title, arr: [], highlight: [], mark: [], final, codeLines: [line], bfsGrid: { rows, cols, cells: cells(current, path) },
    vars: [{ name: "sources", value: `[${sources.map(key).join("; ")}]` }, { name: "queue", value: `[${queue.map(key).join("; ")}]` }, { name: "target", value: targetKey }], note,
  });
  snap({ vi: `Khởi tạo ${sources.length} source`, en: `Initialize ${sources.length} source(s)` }, 6, { vi: "Multi-source BFS đẩy tất cả source vào queue ở distance 0. Một source duy nhất chính là BFS thường.", en: "Multi-source BFS pushes every source into the queue at distance 0. One source is ordinary BFS." });
  const directions = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  let found = null;
  while (queue.length) {
    const current = queue.shift();
    const currentKey = key(current);
    snap({ vi: `Pop (${currentKey})`, en: `Pop (${currentKey})` }, 9, { vi: "FIFO đảm bảo ô được pop theo khoảng cách không giảm.", en: "FIFO ensures cells are popped in nondecreasing distance." }, current);
    if (currentKey === targetKey) { found = current; break; }
    for (const [dr, dc] of directions) {
      const next = [current[0] + dr, current[1] + dc];
      const nextKey = key(next);
      if (!inside(next) || grid[next[0]][next[1]] || visited.has(nextKey)) continue;
      visited.add(nextKey); parent.set(nextKey, current); distance.set(nextKey, distance.get(currentKey) + 1); queue.push(next);
      snap({ vi: `Visit (${nextKey})`, en: `Visit (${nextKey})` }, 14, { vi: `Đặt parent và distance=${distance.get(nextKey)}, rồi append vào queue.`, en: `Set parent and distance=${distance.get(nextKey)}, then append to the queue.` }, next);
    }
  }
  const path = found ? (() => { const result = []; for (let point = found; point; point = parent.get(key(point))) result.push(point); return result.reverse(); })() : [];
  const answer = path.length ? path.length - 1 : -1;
  snap(path.length ? { vi: `Đường ngắn nhất = ${answer} bước`, en: `Shortest path = ${answer} move(s)` } : { vi: "Không có đường đi", en: "No path exists" }, 17, path.length ? { vi: "Ô T được pop lần đầu nên path hiện tại là ngắn nhất từ source gần nhất.", en: "T is popped for the first time, so this path is shortest from the nearest source." } : { vi: "Queue đã rỗng trước khi tới target.", en: "The queue emptied before reaching target." }, found, path, true);
  return { original: grid, answer, steps };
}

function parseSortedMatrix(input) {
  const matrix = String(input || "").split(";").map((row) => row.trim()).filter(Boolean).map((row) => row.split(",").map((value) => Number(value.trim())));
  if (!matrix.length || matrix.some((row) => !row.length || row.some((value) => !Number.isFinite(value)) || row.some((value, index) => index && value < row[index - 1]))) throw new Error("Mỗi hàng matrix phải được sắp tăng và ngăn bởi dấu ;.");
  return matrix;
}

function buildSteps9008(input, params = {}) {
  const matrix = parseSortedMatrix(input);
  const k = Number(params.k);
  const total = matrix.reduce((sum, row) => sum + row.length, 0);
  if (!Number.isInteger(k) || k < 1 || k > total) throw new Error(`k phải từ 1 đến ${total}.`);
  const heap = matrix.map((row, r) => ({ value: row[0], r, c: 0 })).sort((a, b) => a.value - b.value || a.r - b.r);
  const answer = [], steps = [];
  const flat = matrix.flat();
  const heapText = () => `[${heap.map((item) => `${item.value}@${item.r},${item.c}`).join("; ")}]`;
  const snap = (title, line, note, current = null, final = false) => steps.push({ title, arr: flat, highlight: current === null ? [] : [matrix.slice(0, current.r).reduce((sum, row) => sum + row.length, 0) + current.c], mark: answer.map((value, index) => flat.indexOf(value, index ? flat.indexOf(answer[index - 1]) + 1 : 0)).filter((index) => index >= 0), final, codeLines: [line], vars: [{ name: "min-heap", value: heapText() }, { name: "answer", value: `[${answer.join(", ")}]` }], note });
  snap({ vi: "Đẩy phần tử đầu của mỗi hàng", en: "Push the first element of every row" }, 5, { vi: "Vì mỗi hàng tăng dần, phần tử chưa lấy nhỏ nhất của một hàng luôn là phần tử kế tiếp sau phần tử vừa pop.", en: "Because every row is sorted, its next unseen minimum is immediately to the right of the popped item." });
  while (answer.length < k) {
    const current = heap.shift(); answer.push(current.value);
    snap({ vi: `Pop ${current.value} (${current.r},${current.c})`, en: `Pop ${current.value} (${current.r},${current.c})` }, 8, { vi: "Root của min-heap là số nhỏ nhất chưa được chọn trên mọi hàng.", en: "The min-heap root is the smallest unselected number across all rows." }, current);
    if (current.c + 1 < matrix[current.r].length) {
      heap.push({ value: matrix[current.r][current.c + 1], r: current.r, c: current.c + 1 }); heap.sort((a, b) => a.value - b.value || a.r - b.r);
      snap({ vi: `Push số kế tiếp của hàng ${current.r}`, en: `Push the next number from row ${current.r}` }, 10, { vi: "Chỉ mở rộng đúng hàng vừa pop; nhờ đó heap có nhiều nhất số hàng phần tử.", en: "Only expand the row just popped, keeping the heap no larger than the number of rows." }, current);
    }
  }
  snap({ vi: `Return [${answer.join(", ")}]`, en: `Return [${answer.join(", ")}]` }, 11, { vi: `Đã lấy đúng ${k} số nhỏ nhất.`, en: `Exactly ${k} smallest numbers have been collected.` }, null, true);
  return { original: matrix, answer, steps };
}

function buildSteps9009(input, params = {}) {
  const merchants = String(input || "").split("|").map((item) => item.trim()).filter(Boolean).map((item) => { const [name, point] = item.split(":"); const [x, y] = String(point || "").split(",").map(Number); return { name: String(name || "").trim(), x, y }; });
  const x = Number(params.x), y = Number(params.y), radius = Number(params.radius);
  if (!merchants.length || merchants.some((merchant) => !merchant.name || !Number.isFinite(merchant.x) || !Number.isFinite(merchant.y)) || !Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(radius) || radius < 0) throw new Error("Dùng merchant dạng Name:x,y và tọa độ/radius hợp lệ.");
  const candidates = merchants.map((merchant) => ({ ...merchant, distance: Math.hypot(merchant.x - x, merchant.y - y) })).sort((a, b) => a.distance - b.distance || a.name.localeCompare(b.name));
  const matches = candidates.filter((merchant) => merchant.distance <= radius + 1e-9);
  const minX = Math.min(x - radius, ...merchants.map((merchant) => merchant.x)), maxX = Math.max(x + radius, ...merchants.map((merchant) => merchant.x));
  const minY = Math.min(y - radius, ...merchants.map((merchant) => merchant.y)), maxY = Math.max(y + radius, ...merchants.map((merchant) => merchant.y));
  const px = (value) => (value - minX) / (maxX - minX || 1);
  const py = (value) => 1 - (value - minY) / (maxY - minY || 1);
  const steps = [];
  const graph = (current = null, final = false) => ({ layout: "flow", width: 660, height: 340, nodes: [{ id: "query", label: "You", sub: `(${x},${y})` }, ...candidates.map((merchant) => ({ id: merchant.name, label: merchant.name, sub: `${merchant.distance.toFixed(2)} mi` }))], edges: matches.map((merchant) => ({ u: "query", v: merchant.name, undirected: true, label: `${merchant.distance.toFixed(2)} mi` })), positions: Object.fromEntries([["query", { x: px(x), y: py(y) }], ...candidates.map((merchant) => [merchant.name, { x: px(merchant.x), y: py(merchant.y) }])]), hlNodes: current ? [current] : final ? ["query", ...matches.map((merchant) => merchant.name)] : ["query"], visitedNodes: matches.map((merchant) => merchant.name), dimUnfocused: Boolean(final) });
  const snap = (title, line, note, current = null, final = false) => steps.push({ title, arr: [], highlight: [], mark: [], final, codeLines: [line], graph: graph(current, final), vars: [{ name: "query", value: `(${x}, ${y})` }, { name: "radius", value: `${radius} mi` }, { name: "matches", value: `[${matches.map((merchant) => merchant.name).join(", ")}]` }], note });
  snap({ vi: `Query bán kính ${radius} miles`, en: `Query with ${radius}-mile radius` }, 4, { vi: "Khoảng cách Euclid mô phỏng geo query trên mặt phẳng cục bộ. Sản phẩm thật dùng công thức địa cầu (Haversine) cho lat/lng.", en: "Euclidean distance models a local planar geo query. A production system uses Haversine for latitude/longitude." });
  for (const merchant of candidates) snap({ vi: `Kiểm tra ${merchant.name}: ${merchant.distance.toFixed(2)} ≤ ${radius}?`, en: `Check ${merchant.name}: ${merchant.distance.toFixed(2)} ≤ ${radius}?` }, 8, merchant.distance <= radius + 1e-9 ? { vi: "Điểm nằm trong hoặc ngay trên biên nên được giữ (≤, không phải <).", en: "The point is inside or exactly on the boundary, so keep it (≤, not <)." } : { vi: "Điểm ở ngoài bán kính nên loại.", en: "The point lies outside the radius, so exclude it." }, merchant.name);
  snap({ vi: `Return ${matches.length} merchant(s)`, en: `Return ${matches.length} merchant(s)` }, 11, { vi: "Follow-up: quad tree chia không gian thành ô; bỏ qua cả ô không giao với vòng tròn query và chỉ tính chính xác các candidate còn lại.", en: "Follow-up: a quad tree partitions space; skip cells that do not intersect the query circle and precisely test the remaining candidates." }, null, true);
  return { original: merchants, answer: matches.map((merchant) => merchant.name), steps };
}

const CODE_9011 = [
  "class DiskKV:",
  "    def __init__(self):",
  "        self.log = []",
  "        self.index = {}",
  "",
  "    def put(self, key, value):",
  "        offset = len(self.log)",
  "        self.log.append((key, value, False))",
  "        self.index[key] = offset",
  "",
  "    def update(self, key, value):",
  "        if key not in self.index:",
  "            return False",
  "        self.put(key, value)",
  "        return True",
  "",
  "    def delete(self, key):",
  "        offset = len(self.log)",
  "        self.log.append((key, None, True))",
  "        self.index.pop(key, None)",
  "",
  "    def scan(self):",
  "        answer = []",
  "        for key in sorted(self.index):",
  "            offset = self.index[key]",
  "            value = self.log[offset][1]",
  "            answer.append((key, value))",
  "        return answer",
  "",
  "def execute(commands):",
  "    store = DiskKV()",
  "    for op, key, value in commands:",
  "        if op == 'PUT':",
  "            store.put(key, value)",
  "        elif op == 'UPDATE':",
  "            store.update(key, value)",
  "        elif op == 'DELETE':",
  "            store.delete(key)",
  "        else:",
  "            store.scan()",
  "    return store.scan()",
];

function buildSteps9011(input) {
  const rawCommands = String(input || "").split("|").map((part) => part.trim()).filter(Boolean);
  if (!rawCommands.length) throw new Error("Nhập thao tác như PUT a 1|UPDATE a 2|DELETE a|SCAN.");

  const commands = rawCommands.map((raw) => {
    const tokens = raw.split(/\s+/);
    const op = tokens[0].toUpperCase();
    if (op === "SCAN" && tokens.length === 1) return { op, key: null, value: null, raw };
    if (op === "DELETE" && tokens.length === 2) return { op, key: tokens[1], value: null, raw };
    if ((op === "PUT" || op === "UPDATE") && tokens.length >= 3) {
      return { op, key: tokens[1], value: tokens.slice(2).join(" "), raw };
    }
    throw new Error("Dùng PUT key value, UPDATE key value, DELETE key, hoặc SCAN.");
  });

  const compareText = (left, right) => (left < right ? -1 : left > right ? 1 : 0);
  const steps = [];
  let log = null;
  let index = null;

  const liveEntries = () => {
    if (!index || !log) return [];
    return [...index.entries()]
      .sort(([left], [right]) => compareText(left, right))
      .map(([key, offset]) => [key, log[offset].value]);
  };
  const diskText = () => log === null
    ? "—"
    : `[${log.map((record) => record.deleted ? `${record.key}:✕` : `${record.key}:${record.value}`).join(" | ")}]`;
  const indexText = () => index === null
    ? "—"
    : `{${[...index.entries()].sort(([left], [right]) => compareText(left, right)).map(([key, offset]) => `${key}@${offset}`).join(", ")}}`;

  function emit(line, operation, options = {}) {
    const scan = options.scan || liveEntries();
    steps.push({
      title: options.title || { vi: `Dòng ${line}: ${operation}`, en: `Line ${line}: ${operation}` },
      arr: [],
      highlight: [],
      mark: [],
      final: Boolean(options.final),
      codeLines: [line],
      vars: [
        { name: "operation", value: operation },
        { name: "command", value: options.command || "—" },
        { name: "offset", value: options.offset ?? "—" },
        { name: "append-only file", value: diskText() },
        { name: "index", value: indexText() },
        { name: "sorted scan", value: `[${scan.map(([key, value]) => `${key}:${value}`).join(", ")}]` },
      ],
      note: options.note || { vi: "Mỗi bước chỉ thực thi một dòng code đang được tô sáng.", en: "Each step executes only the single highlighted source line." },
      diskKv9011View: {
        operation,
        command: options.command || null,
        records: log ? log.map((record) => ({ ...record })) : [],
        index: index ? [...index.entries()].map(([key, offset]) => ({ key, offset })) : [],
        scan: scan.map(([key, value]) => ({ key, value })),
        offset: options.offset ?? null,
        key: options.key ?? null,
        value: options.value ?? null,
        result: options.result ?? null,
      },
    });
  }

  function put(key, value, command) {
    const offset = log.length;
    emit(7, "offset = len(log)", { command, offset, key, value });
    log.push({ key, value, deleted: false, offset });
    emit(8, "append value record", { command, offset, key, value });
    index.set(key, offset);
    emit(9, "index[key] = offset", {
      command,
      offset,
      key,
      value,
      note: { vi: `Index của ${key} trỏ tới version mới nhất ở offset ${offset}.`, en: `${key}'s index now points to the newest version at offset ${offset}.` },
    });
  }

  function update(key, value, command) {
    const missing = !index.has(key);
    emit(12, "check key in index", { command, key, value, result: !missing });
    if (missing) {
      emit(13, "return False", {
        command,
        key,
        value,
        result: false,
        note: { vi: "UPDATE key chưa tồn tại không ghi thêm record.", en: "Updating a missing key does not append a record." },
      });
      return false;
    }
    emit(14, "self.put(key, value)", { command, key, value });
    put(key, value, command);
    emit(15, "return True", { command, key, value, result: true });
    return true;
  }

  function remove(key, command) {
    const offset = log.length;
    emit(18, "offset = len(log)", { command, offset, key });
    log.push({ key, value: null, deleted: true, offset });
    emit(19, "append tombstone", {
      command,
      offset,
      key,
      note: { vi: "Tombstone được giữ trong log để recovery biết key đã bị xóa.", en: "The tombstone stays in the log so recovery knows the key was deleted." },
    });
    index.delete(key);
    emit(20, "index.pop(key, None)", { command, offset, key });
  }

  function scan(command) {
    const answer = [];
    emit(23, "answer = []", { command, scan: answer });
    for (const key of [...index.keys()].sort(compareText)) {
      emit(24, "iterate sorted key", { command, key, scan: answer });
      const offset = index.get(key);
      emit(25, "offset = index[key]", { command, key, offset, scan: answer });
      const value = log[offset].value;
      emit(26, "value = log[offset][1]", { command, key, value, offset, scan: answer });
      answer.push([key, value]);
      emit(27, "answer.append((key, value))", { command, key, value, offset, scan: answer });
    }
    emit(28, "return answer", {
      command,
      scan: answer,
      result: answer,
      note: { vi: "SCAN trả key sống theo thứ tự tăng dần; production dùng SSTable hoặc B-tree.", en: "SCAN returns live keys in ascending order; production uses an SSTable or B-tree." },
    });
    return answer;
  }

  emit(31, "store = DiskKV()", { command: "initialize" });
  log = [];
  emit(3, "self.log = []", { command: "initialize" });
  index = new Map();
  emit(4, "self.index = {}", {
    command: "initialize",
    note: { vi: "Log append-only nằm trên disk; hash index trong RAM giữ offset mới nhất.", en: "The append-only log lives on disk; the in-memory hash index keeps the newest offset." },
  });

  for (const command of commands) {
    emit(32, "read next command", { command: command.raw, key: command.key, value: command.value });
    const isPut = command.op === "PUT";
    emit(33, "check PUT", { command: command.raw, key: command.key, value: command.value, result: isPut });
    if (isPut) {
      emit(34, "store.put(key, value)", { command: command.raw, key: command.key, value: command.value });
      put(command.key, command.value, command.raw);
      continue;
    }

    const isUpdate = command.op === "UPDATE";
    emit(35, "check UPDATE", { command: command.raw, key: command.key, value: command.value, result: isUpdate });
    if (isUpdate) {
      emit(36, "store.update(key, value)", { command: command.raw, key: command.key, value: command.value });
      update(command.key, command.value, command.raw);
      continue;
    }

    const isDelete = command.op === "DELETE";
    emit(37, "check DELETE", { command: command.raw, key: command.key, result: isDelete });
    if (isDelete) {
      emit(38, "store.delete(key)", { command: command.raw, key: command.key });
      remove(command.key, command.raw);
      continue;
    }

    emit(39, "enter SCAN branch", { command: command.raw });
    emit(40, "store.scan()", { command: command.raw });
    scan(command.raw);
  }

  emit(41, "return store.scan()", { command: "final scan" });
  const answer = scan("final scan");
  emit(41, "return final answer", {
    command: "final scan",
    scan: answer,
    result: answer,
    final: true,
    note: { vi: "Kết quả chỉ chứa các key còn sống và version mới nhất của chúng.", en: "The result contains only live keys and their newest versions." },
  });
  return { original: rawCommands, answer, steps };
}

const CODE_9012 = [
  "class VendingMachine:",
  "    def __init__(self, coins):",
  "        self.coins = sorted(set(coins))",
  "",
  "    def purchase(self, price, paid):",
  "        if paid < price:",
  "            raise ValueError('insufficient payment')",
  "        change = paid - price",
  "        return self.min_change(change)",
  "",
  "    def min_change(self, change):",
  "        inf = change + 1",
  "        dp = [inf] * (change + 1)",
  "        pick = [-1] * (change + 1)",
  "        dp[0] = 0",
  "        for amount in range(1, change + 1):",
  "            for coin in self.coins:",
  "                if coin > amount:",
  "                    break",
  "                candidate = dp[amount - coin] + 1",
  "                if candidate < dp[amount]:",
  "                    dp[amount] = candidate",
  "                    pick[amount] = coin",
  "        if dp[change] == inf:",
  "            return None",
  "        answer = []",
  "        amount = change",
  "        while amount > 0:",
  "            coin = pick[amount]",
  "            answer.append(coin)",
  "            amount -= coin",
  "        return answer",
];

function buildSteps9012(input, params = {}) {
  const tokens = String(input ?? "").split(",").map((value) => value.trim());
  if (!tokens.length || tokens.some((value) => value === "" || !/^[+]?[0-9]+$/.test(value))) {
    throw new Error("Coins phải là danh sách số nguyên dương, ngăn bằng dấu phẩy.");
  }
  const parsedCoins = tokens.map(Number);
  if (parsedCoins.some((coin) => !Number.isSafeInteger(coin) || coin <= 0)) {
    throw new Error("Coins phải là danh sách số nguyên dương, ngăn bằng dấu phẩy.");
  }
  const coins = [...new Set(parsedCoins)].sort((a, b) => a - b);
  const price = Number(params.price);
  const paid = Number(params.paid);
  if (!Number.isSafeInteger(price) || !Number.isSafeInteger(paid) || price < 0 || paid < price) {
    throw new Error("price và paid phải là số nguyên không âm; paid phải lớn hơn hoặc bằng price.");
  }

  const change = paid - price;
  const steps = [];
  let inf = null;
  let dp = null;
  let pick = null;
  let answer = null;

  function emit(line, operation, options = {}) {
    const dpSnapshot = dp ? dp.map((value) => value === inf ? -1 : value) : [];
    const pickSnapshot = pick ? [...pick] : [];
    const active = [options.amount, options.previousAmount]
      .filter((value, index, values) => Number.isInteger(value) && values.indexOf(value) === index);
    steps.push({
      title: options.title || { vi: `Dòng ${line}: ${operation}`, en: `Line ${line}: ${operation}` },
      arr: dpSnapshot,
      sub: dpSnapshot.map((_value, index) => `$${index}`),
      highlight: active,
      mark: dpSnapshot.map((value, index) => value >= 0 ? index : null).filter((index) => index !== null),
      final: Boolean(options.final),
      codeLines: [line],
      vars: [
        { name: "operation", value: operation },
        { name: "price / paid", value: `${price} / ${paid}` },
        { name: "change", value: change },
        { name: "coins", value: `[${coins.join(", ")}]` },
        { name: "amount", value: options.amount ?? "—" },
        { name: "coin", value: options.coin ?? "—" },
        { name: "candidate", value: options.candidate ?? "—" },
        { name: "pick", value: pick ? `[${pick.join(", ")}]` : "—" },
        { name: "answer", value: answer === null ? "—" : `[${answer.join(", ")}]` },
      ],
      note: options.note || { vi: "Mỗi bước chỉ thực thi một dòng code đang được tô sáng.", en: "Each step executes only the single highlighted source line." },
      vending9012View: {
        operation,
        price,
        paid,
        change,
        coins: [...coins],
        inf,
        dp: dpSnapshot,
        pick: pickSnapshot,
        amount: options.amount ?? null,
        previousAmount: options.previousAmount ?? null,
        coin: options.coin ?? null,
        candidate: options.candidate ?? null,
        improved: options.improved ?? null,
        reachable: options.reachable ?? null,
        answer: answer === null ? null : [...answer],
      },
    });
  }

  emit(3, "self.coins = sorted(set(coins))", {
    note: { vi: "Loại coin trùng và sắp tăng để có thể dừng vòng lặp khi coin > amount.", en: "Deduplicate and sort coins so the loop can stop once coin > amount." },
  });
  const insufficient = paid < price;
  emit(6, "check paid < price", { improved: insufficient });
  emit(8, "change = paid - price", {
    note: { vi: `Tiền thừa cần trả là ${paid} − ${price} = ${change}.`, en: `Required change is ${paid} − ${price} = ${change}.` },
  });
  emit(9, "return self.min_change(change)");

  inf = change + 1;
  emit(12, "inf = change + 1");
  dp = Array(change + 1).fill(inf);
  emit(13, "dp = [inf] * (change + 1)");
  pick = Array(change + 1).fill(-1);
  emit(14, "pick = [-1] * (change + 1)");
  dp[0] = 0;
  emit(15, "dp[0] = 0", {
    amount: 0,
    note: { vi: "Cần 0 coin để tạo amount 0.", en: "Zero coins are needed to make amount 0." },
  });

  for (let amount = 1; amount <= change; amount++) {
    emit(16, "iterate amount", { amount });
    for (const coin of coins) {
      emit(17, "iterate coin", { amount, coin });
      const tooLarge = coin > amount;
      emit(18, "check coin > amount", { amount, coin, improved: tooLarge });
      if (tooLarge) {
        emit(19, "break", {
          amount,
          coin,
          note: { vi: "Coins đã sort nên mọi coin phía sau cũng quá lớn.", en: "Coins are sorted, so every later coin is also too large." },
        });
        break;
      }

      const previousAmount = amount - coin;
      const candidate = dp[previousAmount] + 1;
      emit(20, "candidate = dp[amount - coin] + 1", { amount, previousAmount, coin, candidate });
      const improved = candidate < dp[amount];
      emit(21, "check candidate < dp[amount]", { amount, previousAmount, coin, candidate, improved });
      if (!improved) continue;

      dp[amount] = candidate;
      emit(22, "dp[amount] = candidate", { amount, previousAmount, coin, candidate, improved: true });
      pick[amount] = coin;
      emit(23, "pick[amount] = coin", {
        amount,
        previousAmount,
        coin,
        candidate,
        improved: true,
        note: { vi: `Amount ${amount} tốt nhất hiện dùng ${candidate} coin; coin cuối là ${coin}.`, en: `The best solution for amount ${amount} now uses ${candidate} coin(s), ending with ${coin}.` },
      });
    }
  }

  const reachable = dp[change] !== inf;
  emit(24, "check dp[change] == inf", { amount: change, reachable });
  if (!reachable) {
    emit(25, "return None", {
      amount: change,
      reachable: false,
      note: { vi: `Không có tổ hợp coin tạo đúng ${change}.`, en: `No coin combination makes exactly ${change}.` },
    });
    emit(9, "return None from purchase", { amount: change, reachable: false, final: true });
    return { original: coins, answer: null, steps };
  }

  answer = [];
  emit(26, "answer = []", { amount: change, reachable: true });
  let amount = change;
  emit(27, "amount = change", { amount, reachable: true });
  while (amount > 0) {
    emit(28, "check amount > 0", { amount, reachable: true });
    const coin = pick[amount];
    emit(29, "coin = pick[amount]", { amount, coin, reachable: true });
    answer.push(coin);
    emit(30, "answer.append(coin)", { amount, coin, reachable: true });
    const previousAmount = amount;
    amount -= coin;
    emit(31, "amount -= coin", { amount, previousAmount, coin, reachable: true });
  }
  emit(28, "check amount > 0", { amount, reachable: true });
  emit(32, "return answer", {
    amount,
    reachable: true,
    note: { vi: "Dựng ngược theo pick[] tạo một tổ hợp có số coin tối thiểu.", en: "Following pick[] backward produces a minimum-coin combination." },
  });
  emit(9, "return answer from purchase", { amount, reachable: true, final: true });
  return { original: coins, answer: [...answer], steps };
}

function buildSteps9013(input) {
  const n = Array.isArray(input) ? Number(input[0]) : Number(input);
  if (!Number.isInteger(n) || n < 1 || n > 16) throw new Error("n phải từ 1 đến 16.");
  const square = (value) => Number.isInteger(Math.sqrt(value));
  const values = Array.from({ length: n }, (_, index) => index + 1);
  const adjacency = new Map(values.map((value) => [value, values.filter((other) => other !== value && square(value + other))]));
  const steps = [], path = [], used = new Set();
  const graph = (current = null, final = false) => ({ nodes: values.map((value) => ({ id: value, label: String(value), sub: `deg ${adjacency.get(value).length}` })), edges: values.flatMap((value) => adjacency.get(value).filter((other) => value < other).map((other) => ({ u: value, v: other, undirected: true, label: `${value + other}` }))), hlNodes: current ? [current] : path, hlEdges: path.slice(1).map((value, index) => [path[index], value]), visitedNodes: path, dimUnfocused: final });
  const snap = (title, line, note, current = null, final = false) => steps.push({ title, arr: [], highlight: [], mark: [], final, codeLines: [line], graph: graph(current, final), vars: [{ name: "path", value: `[${path.join(", ")}]` }, { name: "unused", value: `[${values.filter((value) => !used.has(value)).join(", ")}]` }], note });
  snap({ vi: "Dựng graph: cạnh a—b khi a+b là square", en: "Build graph: edge a—b when a+b is a square" }, 4, { vi: "Bài toán trở thành tìm Hamiltonian path qua các node 1..n.", en: "The problem becomes finding a Hamiltonian path through nodes 1..n." });
  let solution = null, emitted = 0;
  const dfs = (value) => {
    path.push(value); used.add(value);
    if (emitted++ < 48) snap({ vi: `Chọn ${value}`, en: `Choose ${value}` }, 10, { vi: "Mọi cặp kề hiện có đều cộng thành số chính phương.", en: "Every adjacent pair currently sums to a perfect square." }, value);
    if (path.length === n) { solution = [...path]; return true; }
    const nexts = adjacency.get(value).filter((other) => !used.has(other)).sort((a, b) => adjacency.get(a).length - adjacency.get(b).length || a - b);
    for (const next of nexts) if (dfs(next)) return true;
    used.delete(value); path.pop();
    if (emitted++ < 48) snap({ vi: `Backtrack từ ${value}`, en: `Backtrack from ${value}` }, 14, { vi: "Không còn neighbor chưa dùng hợp lệ; bỏ lựa chọn cuối và thử nhánh khác.", en: "No valid unused neighbor remains; remove the last choice and try another branch." }, value);
    return false;
  };
  for (const start of [...values].sort((a, b) => adjacency.get(a).length - adjacency.get(b).length || a - b)) if (dfs(start)) break;
  snap(solution ? { vi: `Return [${solution.join(", ")}]`, en: `Return [${solution.join(", ")}]` } : { vi: `Không có arrangement cho n=${n}`, en: `No arrangement for n=${n}` }, 17, solution ? { vi: "Mỗi cạnh trên path có tổng là số chính phương.", en: "Every edge on the path has a perfect-square sum." } : { vi: "Đã thử mọi đường backtracking có thể.", en: "Every possible backtracking path was tried." }, null, true);
  return { original: [n], answer: solution || [], steps };
}

function buildSteps9014(input) {
  const [firstRaw, secondRaw, ...extra] = String(input || "").split("||");
  if (extra.length || !firstRaw || !secondRaw) throw new Error("Nhập day1||day2; mỗi log là user:video,user:video.");
  const parseLog = (raw) => raw.split(",").map((entry) => entry.trim()).filter(Boolean).map((entry) => { const [user, video] = entry.split(":").map((item) => item.trim()); if (!user || !video) throw new Error("Mỗi entry phải là user:video."); return [user, video]; });
  const days = [parseLog(firstRaw), parseLog(secondRaw)];
  const perDay = days.map(() => new Map()), videos = new Map(), steps = [];
  const display = (map) => `{${[...map.entries()].map(([user, set]) => `${user}:{${[...set].join(",")}}`).join("; ")}}`;
  const snap = (title, line, note, final = false) => steps.push({ title, arr: [], highlight: [], mark: [], final, codeLines: [line], vars: [{ name: "day 1", value: display(perDay[0]) }, { name: "day 2", value: display(perDay[1]) }, { name: "all unique videos", value: display(videos) }], note });
  for (let day = 0; day < 2; day++) {
    for (const [user, video] of days[day]) {
      if (!perDay[day].has(user)) perDay[day].set(user, new Set());
      if (!videos.has(user)) videos.set(user, new Set());
      perDay[day].get(user).add(video); videos.get(user).add(video);
      snap({ vi: `Day ${day + 1}: ${user} xem ${video}`, en: `Day ${day + 1}: ${user} watched ${video}` }, 8, { vi: "Set loại bỏ video lặp trong cùng ngày và giữa hai ngày.", en: "A set removes repeated videos within and across days." });
    }
  }
  const loyal = [...videos.keys()].filter((user) => perDay[0].has(user) && perDay[1].has(user) && videos.get(user).size >= 2).sort();
  snap({ vi: `Loyal customers: [${loyal.join(", ")}]`, en: `Loyal customers: [${loyal.join(", ")}]` }, 14, { vi: "Điều kiện: user xuất hiện cả hai file và tổng số video distinct ≥ 2. File lớn: hash-partition theo user hoặc external sort/merge để không giữ toàn bộ trong RAM.", en: "Conditions: the user appears in both files and has at least 2 distinct videos. For huge files, hash-partition by user or externally sort/merge so all data is not held in RAM." }, true);
  return { original: days, answer: loyal, steps };
}

function buildSteps9015(input) {
  const intervals = String(input || "").split(",").map((part) => part.trim()).filter(Boolean).map((part) => part.split("-").map(Number));
  if (!intervals.length || intervals.some(([start, end]) => !Number.isFinite(start) || !Number.isFinite(end) || start > end)) throw new Error("Nhập interval start-end, ví dụ 1-5,2-6,4-7.");
  const events = intervals.flatMap(([start, end], id) => [{ time: start, delta: 1, id, kind: "start" }, { time: end, delta: -1, id, kind: "end" }]).sort((a, b) => a.time - b.time || b.delta - a.delta || a.id - b.id);
  let active = 0, overlapPairs = 0, maxActive = 0; const steps = [];
  const snap = (title, line, note, current = null, final = false) => steps.push({ title, arr: intervals.flat(), sub: intervals.flatMap(([,], id) => [`#${id} start`, `#${id} end`]), highlight: current === null ? [] : [current.id * 2 + (current.kind === "start" ? 0 : 1)], mark: [], final, codeLines: [line], vars: [{ name: "event", value: current ? `${current.kind}@${current.time}` : "—" }, { name: "active", value: active }, { name: "overlap pairs", value: overlapPairs }, { name: "max simultaneous", value: maxActive }], note });
  snap({ vi: "Tạo start/end events", en: "Create start/end events" }, 5, { vi: "Với closed intervals, start được xử lý trước end ở cùng thời điểm nên [1,2] và [2,3] tính là overlap.", en: "For closed intervals, process starts before ends at the same time, so [1,2] and [2,3] overlap." });
  for (const event of events) {
    if (event.delta === 1) { overlapPairs += active; active++; maxActive = Math.max(maxActive, active); snap({ vi: `Start #${event.id} tại ${event.time}`, en: `Start #${event.id} at ${event.time}` }, 10, { vi: `Có ${active - 1} interval đang active, nên thêm từng đó overlap pair.`, en: `${active - 1} intervals are already active, so add that many overlap pairs.` }, event); }
    else { active--; snap({ vi: `End #${event.id} tại ${event.time}`, en: `End #${event.id} at ${event.time}` }, 13, { vi: "Interval rời active set.", en: "The interval leaves the active set." }, event); }
  }
  const answer = { overlapPairs, maxAtAnyTime: maxActive };
  snap({ vi: `Pairs=${overlapPairs}; max concurrent=${maxActive}`, en: `Pairs=${overlapPairs}; max concurrent=${maxActive}` }, 15, { vi: "Follow-up “tại bất kỳ thời điểm” chính là peak active count của sweep line.", en: "The follow-up “at any time point” is exactly the sweep line's peak active count." }, null, true);
  return { original: intervals, answer, steps };
}

function buildSteps9016(input, params = {}) {
  const k = Number(params.k), m = Number(params.m);
  const histories = String(input || "").split("|").map((entry) => entry.trim()).filter(Boolean).map((entry) => { const [user, movies] = entry.split(":"); const list = String(movies || "").split(",").map((movie) => movie.trim()).filter(Boolean); if (!user || !list.length) throw new Error("Dùng User:movie1,movie2,... | User:..."); return { user: user.trim(), list }; });
  if (!Number.isInteger(k) || !Number.isInteger(m) || k < 1 || m < 1 || m > k) throw new Error("Cần 1 ≤ m ≤ k.");
  const groups = new Map(), steps = [];
  const snap = (title, line, note, final = false) => steps.push({ title, arr: [], highlight: [], mark: [], final, codeLines: [line], vars: [{ name: "k", value: k }, { name: "m", value: m }, { name: "signature buckets", value: `{${[...groups.entries()].map(([signature, users]) => `${signature}:[${users.join(",")}]`).join("; ")}}` }], note });
  for (const { user, list } of histories) {
    const last = list.slice(-k);
    const signature = last.join("|");
    if (!groups.has(signature)) groups.set(signature, []);
    groups.get(signature).push(user);
    snap({ vi: `${user}: last ${k} → ${signature}`, en: `${user}: last ${k} → ${signature}` }, 8, { vi: "Hash signature của last-k movie để gom customer có lịch sử khớp hoàn toàn.", en: "Hash the last-k signature to group customers whose histories match exactly." });
  }
  const pairs = [];
  for (const users of groups.values()) for (let i = 0; i < users.length; i++) for (let j = i + 1; j < users.length; j++) pairs.push([users[i], users[j]]);
  snap({ vi: `Friend pairs: ${pairs.map((pair) => pair.join("—")).join(", ") || "∅"}`, en: `Friend pairs: ${pairs.map((pair) => pair.join("—")).join(", ") || "∅"}` }, 13, m === k ? { vi: "Với m=k, cùng bucket nghĩa là hai last-k history giống hệt nhau. Follow-up m<k cần inverted index theo m-grams hoặc locality-sensitive hashing.", en: "With m=k, the same bucket means identical last-k histories. For m<k, use an inverted index over m-grams or locality-sensitive hashing." } : { vi: "Demo này nhóm exact last-k. Với m<k, dùng m-gram index để đếm số movie trùng trước khi xác nhận pair.", en: "This demo groups exact last-k histories. For m<k, use an m-gram index to count matching movies before confirming a pair." }, true);
  return { original: histories, answer: pairs, steps };
}

function buildSteps9017(input) {
  const events = String(input || "").split("|").map((entry) => entry.trim()).filter(Boolean).map((entry) => { const [type, campaign, user, cost = "0"] = entry.split(":").map((value) => value.trim()); const amount = Number(cost); if (!type || !campaign || !user || !["impression", "click", "conversion"].includes(type) || !Number.isFinite(amount)) throw new Error("Dùng impression|click|conversion:campaign:user:cost."); return { type, campaign, user, cost: amount }; });
  const metrics = new Map(), seen = new Set(), steps = [];
  const ensure = (campaign) => { if (!metrics.has(campaign)) metrics.set(campaign, { impressions: 0, clicks: 0, conversions: 0, spend: 0, users: new Set() }); return metrics.get(campaign); };
  const table = () => `{${[...metrics.entries()].map(([campaign, value]) => `${campaign}:i${value.impressions}/c${value.clicks}/v${value.conversions}/$${value.spend.toFixed(2)}`).join("; ")}}`;
  const snap = (title, line, note, final = false) => steps.push({ title, arr: [], highlight: [], mark: [], final, codeLines: [line], vars: [{ name: "metrics", value: table() }, { name: "dedupe events", value: seen.size }], note });
  snap({ vi: "Schema: campaigns, creatives, impressions, clicks, conversions", en: "Schema: campaigns, creatives, impressions, clicks, conversions" }, 4, { vi: "OLTP giữ campaign/creative/budget; event log append-only partition theo ngày/campaign; warehouse pre-aggregate metrics.", en: "OLTP stores campaign/creative/budget; the event log is append-only partitioned by day/campaign; a warehouse pre-aggregates metrics." });
  for (const event of events) {
    const id = `${event.type}:${event.campaign}:${event.user}`;
    if (seen.has(id)) { snap({ vi: `Bỏ duplicate ${id}`, en: `Skip duplicate ${id}` }, 9, { vi: "Idempotency key ngăn retry làm đếm đôi metric.", en: "An idempotency key prevents retries from double-counting metrics." }); continue; }
    seen.add(id); const metric = ensure(event.campaign); metric.users.add(event.user); metric.spend += event.cost;
    if (event.type === "impression") metric.impressions++;
    if (event.type === "click") metric.clicks++;
    if (event.type === "conversion") metric.conversions++;
    snap({ vi: `${event.type} → ${event.campaign}`, en: `${event.type} → ${event.campaign}` }, 13, { vi: "Cập nhật counter theo campaign; unique reach cần distinct user sketch ở scale lớn.", en: "Update campaign counters; unique reach needs a distinct-user sketch at scale." });
  }
  const answer = Object.fromEntries([...metrics.entries()].map(([campaign, value]) => [campaign, { impressions: value.impressions, clicks: value.clicks, conversions: value.conversions, spend: Number(value.spend.toFixed(2)), ctr: value.impressions ? Number((value.clicks / value.impressions).toFixed(4)) : 0, cvr: value.clicks ? Number((value.conversions / value.clicks).toFixed(4)) : 0 }]));
  snap({ vi: "Trả metrics: impressions, clicks, conversions, spend, CTR, CVR", en: "Return metrics: impressions, clicks, conversions, spend, CTR, CVR" }, 18, { vi: "Đặt alert theo pacing/budget, CTR/CVR và lag; attribution cần event-time, watermark và dedupe key rõ ràng.", en: "Alert on pacing/budget, CTR/CVR, and lag; attribution needs event time, watermarks, and clear dedupe keys." }, true);
  return { original: events, answer, steps };
}

// ─── #843: Guess the Word (Google — minimax) ────────────────────────────────
// Chuẩn phỏng vấn: mỗi vòng chọn từ làm cho NHÓM XẤU NHẤT nhỏ nhất có thể.
// Nhóm = các từ còn lại có cùng số vị trí trùng với từ đoán; minimax đảm bảo
// tập ứng viên co nhanh dù master trả về kết quả nào.

const WORD843_RE = /^[a-z]{6}$/;
const MAX_WORDS843 = 24;

const CODE843 = [
  "class Solution:",
  "    def findSecretWord(self, words, master):",
  "        def matches(a, b):",
  "            return sum(x == y for x, y in zip(a, b))",
  "",
  "        for _ in range(10):",
  "            best, best_score = None, float(\"inf\")",
  "            for cand in words:",
  "                groups = [0] * 7",
  "                for other in words:",
  "                    groups[matches(cand, other)] += 1",
  "                score = max(groups)",
  "                if score < best_score:",
  "                    best, best_score = cand, score",
  "",
  "            x = master.guess(best)",
  "            if x == 6:",
  "                return",
  "            words = [w for w in words if matches(w, best) == x]",
];

function parseWordlist843(input) {
  let raw;
  if (Array.isArray(input)) {
    raw = input;
  } else {
    const text = String(input ?? "").trim();
    if (!text) throw new Error("wordlist không được rỗng");
    if (text.startsWith("[")) {
      try {
        raw = JSON.parse(text);
      } catch (_error) {
        throw new Error("wordlist JSON phải là mảng các chuỗi");
      }
    } else {
      raw = text.split(",").map((word) => word.trim()).filter(Boolean);
    }
  }
  if (!Array.isArray(raw) || raw.length < 1 || raw.length > MAX_WORDS843) {
    throw new Error(`wordlist cần 1–${MAX_WORDS843} từ phân biệt`);
  }
  const words = raw.map((word) => String(word).trim().toLowerCase());
  const seen = new Set();
  for (const word of words) {
    if (!WORD843_RE.test(word)) throw new Error(`"${word}" phải gồm đúng 6 chữ cái a-z`);
    if (seen.has(word)) throw new Error(`từ "${word}" bị trùng trong wordlist`);
    seen.add(word);
  }
  return words;
}

function buildSteps843(input, params = {}) {
  const words0 = parseWordlist843(input);
  const secret = String(params.secret ?? "acckzz").trim().toLowerCase();
  if (!WORD843_RE.test(secret)) throw new Error("secret phải gồm đúng 6 chữ cái a-z");
  if (!words0.includes(secret)) throw new Error("secret phải nằm trong wordlist (master chỉ giấu từ có trong list)");

  const matches = (a, b) => {
    let count = 0;
    for (let k = 0; k < 6; k++) if (a[k] === b[k]) count++;
    return count;
  };
  // master được mô phỏng: giấu secret đã chọn, guess(w) trả matches(w, secret)
  const masterGuess = (word) => matches(word, secret);

  const steps = [];
  const snap = (options) => steps.push({
    title: options.title,
    arr: options.arr || [],
    sub: options.sub || [],
    highlight: options.highlight || [],
    mark: options.mark || [],
    final: Boolean(options.final),
    codeLines: options.codeLines || [],
    vars: options.vars || [],
    note: options.note,
  });

  const scoreRowsText = (rows, limit = 6) => {
    const shown = rows.slice(0, limit).map((row) => `${row.cand}=${row.score}`);
    return shown.join(" | ") + (rows.length > limit ? ` | … +${rows.length - limit}` : "");
  };

  snap({
    title: { vi: "Định nghĩa matches(a, b)", en: "Define matches(a, b)" },
    codeLines: [4],
    vars: [
      { name: "wordlist", value: words0.join(", ") },
      { name: "secret", value: "•••••• (master giữ kín)" },
    ],
    note: {
      vi: "matches đếm số vị trí i mà a[i] == b[i]. master.guess(w) trả về matches(w, secret) — visualizer mô phỏng master bằng secret bạn chọn.",
      en: "matches counts positions i where a[i] == b[i]. master.guess(w) returns matches(w, secret) — the visualizer simulates the master with your chosen secret.",
    },
  });

  {
    const exA = words0[0];
    const exB = words0.length > 1 ? words0[1] : words0[0];
    const per = [];
    for (let k = 0; k < 6; k++) per.push(exA[k] === exB[k] ? 1 : 0);
    const total = per.reduce((a, b) => a + b, 0);
    snap({
      title: { vi: `Ví dụ: matches("${exA}", "${exB}") = ${total}`, en: `Example: matches("${exA}", "${exB}") = ${total}` },
      codeLines: [4],
      arr: [...per],
      sub: exA.split("").map((ch, k) => `${ch}/${exB[k]}`),
      highlight: per.map((v, k) => (v ? k : -1)).filter((k) => k >= 0),
      vars: [
        { name: "a", value: exA },
        { name: "b", value: exB },
        { name: "zip(a, b)", value: exA.split("").map((ch, k) => `(${ch},${exB[k]})`).join(" ") },
      ],
      note: {
        vi: `Duyệt 6 vị trí: chỉ cộng 1 khi hai ký tự bằng nhau (cột highlight). Tổng = ${total}. Phép tính O(6) này chạy bên trong hai vòng lặp lồng nhau ở dòng 9–11.`,
        en: `Scan 6 positions: add 1 only when both characters are equal (highlighted bars). Total = ${total}. This O(6) computation runs inside the two nested loops at lines 9–11.`,
      },
    });
  }

  let candidates = [...words0];
  const guesses = [];
  let found = null;

  for (let round = 1; round <= 10 && !found && candidates.length; round++) {
    snap({
      title: { vi: `Vòng ${round}: còn ${candidates.length} ứng viên`, en: `Round ${round}: ${candidates.length} candidates` },
      codeLines: [6],
      vars: [
        { name: "vòng", value: `${round}/10` },
        { name: "ứng viên", value: candidates.join(", ") },
      ],
      note: {
        vi: "Mỗi vòng được đoán tối đa 1 từ. Chiến lược minimax: chọn từ làm cho nhóm xấu nhất nhỏ nhất.",
        en: "At most one guess per round. The minimax strategy: pick the word minimizing the worst group.",
      },
    });

    snap({
      title: { vi: "Đặt lại best cho vòng mới", en: "Reset best for the new round" },
      codeLines: [7],
      vars: [{ name: "best, best_score", value: "None, +inf" }],
      note: {
        vi: "best_score bắt đầu +inf để ứng viên đầu tiên luôn thắng vòng so sánh đầu.",
        en: "best_score starts at +inf so the first candidate always wins the first comparison.",
      },
    });

    const rows = candidates.map((cand) => {
      const groups = [[], [], [], [], [], [], []];
      for (const other of candidates) groups[matches(cand, other)].push(other);
      const counts = groups.map((g) => g.length);
      return { cand, groups, counts, score: Math.max(...counts) };
    });
    let best = null;
    let bestScore = Infinity;
    rows.forEach((row) => {
      if (row.score < bestScore) {
        best = row.cand;
        bestScore = row.score;
      }
      snap({
        title: { vi: `Ứng viên "${row.cand}": worst-group = ${row.score}`, en: `Candidate "${row.cand}": worst-group = ${row.score}` },
        codeLines: [12],
        arr: [...row.counts],
        sub: ["m=0", "m=1", "m=2", "m=3", "m=4", "m=5", "m=6"],
        highlight: [row.counts.indexOf(row.score)],
        vars: [
          { name: "groups[số vị trí trùng]", value: `[${row.counts.join(", ")}]` },
          { name: "nhóm chi tiết", value: row.groups.map((g, m) => (g.length ? `m=${m}: [${g.join(", ")}]` : null)).filter(Boolean).join(" · ") || "—" },
          { name: "score = max(groups)", value: row.score },
          { name: "best hiện tại", value: `${best} (score ${bestScore})` },
        ],
        note: {
          vi: `Dòng 9–11: so "${row.cand}" với từng ứng viên còn lại, gom vào 7 nhóm theo số vị trí trùng. Nếu đoán từ này, dù master trả về m nào thì nhóm còn lại lớn nhất cũng chỉ ${row.score} từ (cột highlight).`,
          en: `Lines 9–11: compare "${row.cand}" against every remaining candidate, bucketing into 7 groups by match count. Guessing this word leaves at most ${row.score} words whichever m the master returns (highlighted bar).`,
        },
      });
    });

    {
      const scores = rows.map((row) => row.score);
      const bestIdx = rows.findIndex((row) => row.cand === best);
      snap({
        title: { vi: `Minimax: chọn "${best}" (worst-group ${bestScore})`, en: `Minimax: pick "${best}" (worst-group ${bestScore})` },
        codeLines: [13, 14],
        arr: [...scores],
        sub: rows.map((row) => row.cand),
        highlight: [bestIdx],
        vars: [
          { name: "bảng điểm", value: scoreRowsText(rows, rows.length) },
          { name: "best", value: best },
          { name: "best_score", value: bestScore },
        ],
        note: {
          vi: `Dòng 13–14 duyệt bảng điểm (mỗi cột là một ứng viên) và giữ từ có worst-group nhỏ nhất — cột highlight. Câu trả lời phỏng vấn: ta tối ưu cho trường hợp XẤU NHẤT của master, nên dù master trả về gì thì số ứng viên còn lại cũng ≤ ${bestScore}.`,
          en: `Lines 13–14 scan the scoreboard (one bar per candidate) and keep the word with the smallest worst-group — the highlighted bar. The interview answer: we optimize for the master's WORST case, so at most ${bestScore} candidates survive no matter what is returned.`,
        },
      });
    }

    const bestRow = rows.find((row) => row.cand === best);
    const x = masterGuess(best);
    guesses.push(best);
    snap({
      title: { vi: `master.guess("${best}") → ${x}`, en: `master.guess("${best}") → ${x}` },
      codeLines: [16],
      arr: [...bestRow.counts],
      sub: ["m=0", "m=1", "m=2", "m=3", "m=4", "m=5", "m=6"],
      highlight: [x],
      vars: [
        { name: "guess", value: best },
        { name: "x = số vị trí trùng", value: x },
        { name: "nhóm thực tế còn lại", value: `${bestRow.counts[x]} từ` },
        { name: "scoreboard", value: scoreRowsText(rows) },
      ],
      note: {
        vi: `Master trả về ${x}: chỉ các từ trùng "${best}" đúng ${x} vị trí mới có thể là secret. Nhóm này ≤ worst-group đã tính.`,
        en: `The master returns ${x}: only words matching "${best}" in exactly ${x} positions can still be the secret. This group is ≤ the computed worst-group.`,
      },
    });

    if (x === 6) {
      found = best;
      snap({
        title: { vi: `Tìm thấy "${best}" ở vòng ${round}!`, en: `Found "${best}" in round ${round}!` },
        codeLines: [18],
        final: true,
        vars: [
          { name: "secret", value: secret },
          { name: "các lần đoán", value: guesses.join(" → ") },
          { name: "số vòng đã dùng", value: `${round}/10` },
        ],
        note: {
          vi: "x == 6 nghĩa là cả 6 vị trí đều trùng — đoán trúng từ bí mật.",
          en: "x == 6 means all 6 positions match — the secret word is guessed.",
        },
      });
      break;
    }

    const before = candidates.length;
    const pairMatches = candidates.map((word) => ({ word, m: matches(word, best) }));
    candidates = candidates.filter((word) => matches(word, best) === x);
    const kept = pairMatches.filter((entry) => entry.m === x).map((entry) => entry.word);
    const removed = pairMatches.filter((entry) => entry.m !== x).map((entry) => entry.word);
    snap({
      title: { vi: `Lọc: giữ ${kept.length}/${before} từ có matches == ${x}`, en: `Filter: keep ${kept.length}/${before} words with matches == ${x}` },
      codeLines: [19],
      arr: pairMatches.map((entry) => entry.m),
      sub: pairMatches.map((entry) => entry.word),
      highlight: pairMatches.map((entry, i) => (entry.m === x ? i : -1)).filter((i) => i >= 0),
      vars: [
        { name: "giữ lại", value: kept.join(", ") || "—" },
        { name: "loại bỏ", value: removed.join(", ") || "—" },
      ],
      note: {
        vi: `Dòng 19 tính matches(w, "${best}") cho từng từ (mỗi cột một từ) và chỉ giữ nhóm m = ${x} được highlight — vì nếu secret là w thì master đã phải trả đúng ${x}. Nhờ minimax, nhóm sống sót luôn ≤ ${bestScore}.`,
        en: `Line 19 computes matches(w, "${best}") for every word (one bar per word) and keeps only the highlighted m = ${x} group — had the secret been w, the master would have returned exactly ${x}. Thanks to minimax, the surviving group is always ≤ ${bestScore}.`,
      },
    });
  }

  if (!found) {
    snap({
      title: { vi: "Hết 10 vòng mà chưa tìm ra", en: "Out of guesses" },
      codeLines: [6],
      final: true,
      vars: [{ name: "secret", value: secret }],
      note: {
        vi: "Với chiến lược minimax, trường hợp này không xảy ra với input hợp lệ (n ≤ 100).",
        en: "With the minimax strategy this never happens on valid inputs (n ≤ 100).",
      },
    });
  }

  return { original: words0, answer: found, steps };
}

module.exports = {
  2386: {
    id: 2386, difficulty: "hard", slug: "find-the-k-sum-of-an-array", category: HEAP, tags: [SORTING],
    title: { vi: "Find the K-Sum of an Array", en: "Find the K-Sum of an Array" }, titleVi: { vi: "Tổng subset lớn thứ k", en: "K-th largest subset sum" },
    statement: { vi: "K-sum là tổng của một subset (có thể rỗng). Trả về k-sum lớn thứ k theo thứ tự không tăng.", en: "A k-sum is the sum of a subset (possibly empty). Return the k-th largest subset sum in non-increasing order." },
    defaultInput: [2, 4, -2], inputKind: "integer", inputLabel: { vi: "nums", en: "nums" }, extraParams: [{ key: "k", label: { vi: "k", en: "k" }, default: 5, min: 1, max: 32 }],
    approach: [{ vi: "max_sum lấy mọi số dương.", en: "max_sum takes every positive number." }, { vi: "Subset-sum khác tương đương max_sum trừ một removed-sum trên |nums|.", en: "Every other subset sum equals max_sum minus a removed sum over |nums|." }, { vi: "Min-heap liệt kê removed-sum tăng dần bằng hai nhánh thêm/thay phần tử kế tiếp.", en: "A min-heap enumerates removed sums in order using add/replace branches for the next element." }],
    complexity: { time: "O((n + k) log n)", space: "O(n + k)", note: { vi: "Sort |nums|, rồi pop/push heap tối đa k lần.", en: "Sort |nums|, then pop/push the heap at most k times." } },
    code: ["class Solution:", "    def kSum(self, nums, k):", "        max_sum = sum(x for x in nums if x > 0)", "        nums = sorted(abs(x) for x in nums)", "        if k == 1: return max_sum", "", "        heap = [(nums[0], 0)]", "        for rank in range(2, k + 1):", "            removed, i = heapq.heappop(heap)", "            answer = max_sum - removed", "            if i + 1 < len(nums):", "                nxt = nums[i + 1]", "                heapq.heappush(heap, (removed + nxt, i + 1))", "                heapq.heappush(heap, (removed - nums[i] + nxt, i + 1))", "        return answer"], builder: buildSteps2386,
  },
  9005: {
    id: 9005, difficulty: "medium", category: DESIGN, tags: [HASHMAP, STRING], title: { vi: "Next Word Predictor", en: "Next Word Predictor" }, titleVi: { vi: "Dự đoán từ kế tiếp", en: "Predict the next word" },
    statement: { vi: "Train từ các câu, đếm bigram word→next. Với query word, trả về từ kế tiếp có tần suất cao nhất (hòa chọn alphabet nhỏ hơn).", en: "Train on sentences by counting word→next bigrams. For a query word, return the most frequent next word (alphabetical tie-break)." },
    defaultInput: "i love coding|i love coffee|we love coding", inputKind: "string", inputLabel: { vi: "sentences (ngăn bởi |)", en: "sentences (separated by |)" }, extraParams: [{ key: "word", type: "string", label: { vi: "query word", en: "query word" }, default: "love" }],
    approach: [{ vi: "Preprocessing đếm counts[word][next] cho mọi cặp kề nhau.", en: "Preprocessing counts counts[word][next] for every adjacent pair." }, { vi: "Lưu winner của mỗi word khi train xong để predict thực sự O(1).", en: "Store each word's winner after training for a truly O(1) prediction." }, { vi: "Bản trace hiển thị tra hash map cho query và winner có count cao nhất.", en: "The trace shows the query hash-map lookup and the highest-count winner." }],
    complexity: { time: "O(total words) train · O(1) predict", space: "O(unique bigrams)", note: { vi: "Để predict O(1) tuyệt đối, cache winner[word] sau lượt train; trace so sánh choices để giải thích winner.", en: "For strict O(1) prediction, cache winner[word] after training; the trace compares choices to explain the winner." } },
    code: ["class Predictor:", "    def train(self, sentences):", "        counts, winner = {}, {}", "        for words in sentences:", "            for word, nxt in zip(words, words[1:]):", "                counts.setdefault(word, {})[nxt] = counts.get(word, {}).get(nxt, 0) + 1", "        for word, choices in counts.items():", "            winner[word] = min(choices, key=lambda nxt: (-choices[nxt], nxt))", "        self.winner = winner", "", "    def predict(self, word):", "        return self.winner.get(word)"], builder: buildSteps9005,
  },
  9006: {
    id: 9006, difficulty: "medium", category: GRAPH, tags: [BFS, HASHMAP], title: { vi: "Graph BFS Shortest Path", en: "Graph BFS Shortest Path" }, titleVi: { vi: "Đường đi ngắn nhất bằng BFS", en: "BFS shortest path with indexed graph" },
    statement: { vi: "Dựng graph vô hướng từ edges A-B. Tìm shortest path bằng BFS. Follow-up: dùng bimap name↔id để adjacency là mảng; node 3D chỉ cần key “x,y,z”.", en: "Build an undirected graph from A-B edges and find the shortest path with BFS. Follow-up: use a name↔id bimap for array adjacency; a 3D node is simply keyed as “x,y,z”." },
    defaultInput: "A-B,A-C,B-D,C-D,D-E", inputKind: "string", inputLabel: { vi: "edges A-B (phẩy ngăn)", en: "A-B edges (comma separated)" }, extraParams: [{ key: "start", type: "string", label: { vi: "start", en: "start" }, default: "A" }, { key: "target", type: "string", label: { vi: "target", en: "target" }, default: "E" }],
    approach: [{ vi: "Bimap name↔id nén node string/3D thành index liên tiếp cho adjacency array.", en: "A name↔id bimap compresses string/3D nodes into dense indices for array adjacency." }, { vi: "BFS dùng queue FIFO; lần đầu visit target là path ít cạnh nhất.", en: "BFS uses a FIFO queue; the first target visit has the fewest edges." }, { vi: "parent dựng lại path sau khi BFS chạm target.", en: "parent reconstructs the path after BFS reaches target." }],
    complexity: { time: "O(V + E)", space: "O(V + E)", note: { vi: "Bimap build O(V); mỗi node/cạnh được BFS xử lý tối đa một lần.", en: "Bimap construction is O(V); BFS processes every node/edge at most once." } },
    code: ["from collections import deque", "", "def shortest_path(edges, start, target):", "    name_to_id = {name: i for i, name in enumerate(all_names(edges))}", "    graph = build_adjacency(edges, name_to_id)", "    parent = [-1] * len(graph)", "    queue = deque([name_to_id[start]])", "    seen = {name_to_id[start]}", "    while queue:", "        node = queue.popleft()", "        if node == name_to_id[target]: break", "        for nxt in graph[node]:", "            if nxt not in seen:", "                seen.add(nxt); parent[nxt] = node; queue.append(nxt)", "    return reconstruct(parent, name_to_id[start], name_to_id[target])"], builder: buildSteps9006,
  },
  9007: {
    id: 9007, difficulty: "medium", category: GRAPH, tags: [BFS, MATRIX], title: { vi: "BFS Shortest Path in Obstacle Grid", en: "BFS Shortest Path in Obstacle Grid" }, titleVi: { vi: "BFS đường ngắn nhất qua vật cản", en: "BFS shortest path through obstacles" },
    statement: { vi: "Lưới 0/1: 0 là ô trống, 1 là vật cản. Tìm số bước ít nhất từ source tới target theo 4 hướng. Follow-up: nhập nhiều source, BFS trả đường từ source gần target nhất.", en: "In a 0/1 grid, 0 is open and 1 is an obstacle. Find the fewest 4-direction moves from sources to target. Follow-up: provide multiple sources; BFS returns a path from the nearest source." },
    defaultInput: "0,0,0,0,0|1,1,0,1,0|0,0,0,1,0|0,1,1,0,0|0,0,0,0,0", inputKind: "string", inputLabel: { vi: "Grid 0/1 (hàng cách |)", en: "0/1 grid (rows separated by |)" }, extraParams: [{ key: "sources", type: "string", label: { vi: "sources row,col;row,col", en: "sources row,col;row,col" }, default: "0,0" }, { key: "target", type: "string", label: { vi: "target row,col", en: "target row,col" }, default: "4,4" }],
    approach: [{ vi: "BFS thường khởi tạo một source; multi-source BFS đưa tất cả source vào queue với distance 0.", en: "Ordinary BFS starts with one source; multi-source BFS places every source in the queue at distance 0." }, { vi: "Khi target được pop lần đầu, đó là path ngắn nhất từ source gần nhất.", en: "When target is popped for the first time, it is the shortest path from the nearest source." }, { vi: "parent lưu predecessor để dựng path cuối.", en: "parent stores predecessors to reconstruct the final path." }], complexity: { time: "O(rows · cols)", space: "O(rows · cols)", note: { vi: "Mỗi ô trống được visit nhiều nhất một lần, không phụ thuộc số source.", en: "Each open cell is visited at most once, independent of the number of sources." } },
    code: ["from collections import deque", "", "def shortest_path(grid, sources, target):", "    rows, cols = len(grid), len(grid[0])", "    parent = {}", "    queue = deque(sources)  # all start at d=0", "    seen = set(sources)", "    while queue:", "        r, c = queue.popleft()", "        if (r, c) == target: break", "        for nr, nc in neighbors4(r, c):", "            if inside(nr, nc) and grid[nr][nc] == 0 and (nr, nc) not in seen:", "                seen.add((nr, nc)); parent[nr, nc] = (r, c)", "                queue.append((nr, nc))", "    return reconstruct(parent, target)"], builder: buildSteps9007,
  },
  9008: {
    id: 9008, difficulty: "medium", category: HEAP, tags: [MATRIX], title: { vi: "K Smallest Numbers in Sorted Matrix", en: "K Smallest Numbers in Sorted Matrix" }, titleVi: { vi: "k số nhỏ nhất trong ma trận sorted", en: "k smallest numbers in a sorted matrix" },
    statement: { vi: "Cho matrix với từng hàng tăng dần, trả về k số nhỏ nhất theo thứ tự tăng dần. Không cần sort lại toàn bộ matrix.", en: "Given a matrix whose rows are sorted, return the k smallest numbers in ascending order without re-sorting the entire matrix." },
    defaultInput: "1,5,9;10,11,13;12,13,15", inputKind: "string", inputLabel: { vi: "Matrix sorted theo hàng (; ngăn hàng)", en: "Row-sorted matrix (; separates rows)" }, extraParams: [{ key: "k", label: { vi: "k", en: "k" }, default: 5, min: 1, max: 128 }],
    approach: [{ vi: "Đẩy phần tử đầu của mỗi hàng vào min-heap.", en: "Push the first element of each row into a min-heap." }, { vi: "Mỗi pop là số nhỏ nhất chưa chọn; đẩy phần tử bên phải trong cùng hàng.", en: "Each pop is the smallest unselected value; push the right neighbor from that row." }, { vi: "Lặp k lần để lấy k số nhỏ nhất.", en: "Repeat k times to collect the k smallest numbers." }], complexity: { time: "O(k log rows)", space: "O(rows)", note: { vi: "Heap chỉ giữ nhiều nhất một candidate từ mỗi hàng.", en: "The heap retains at most one candidate per row." } },
    code: ["import heapq", "", "def k_smallest(matrix, k):", "    heap = [(row[0], r, 0) for r, row in enumerate(matrix)]", "    heapq.heapify(heap)", "    answer = []", "    for _ in range(k):", "        value, r, c = heapq.heappop(heap)", "        answer.append(value)", "        if c + 1 < len(matrix[r]):", "            heapq.heappush(heap, (matrix[r][c + 1], r, c + 1))", "    return answer"], builder: buildSteps9008,
  },
  9009: {
    id: 9009, difficulty: "hard", category: DESIGN, tags: [GEOMETRY, HASHMAP], title: { vi: "Nearby Merchants", en: "Nearby Merchants" }, titleVi: { vi: "Tìm merchant trong bán kính", en: "Find merchants within a radius" },
    statement: { vi: "Tìm các merchant trong bán kính cho trước quanh người dùng. Dữ liệu nhập Name:x,y; mốc được giữ nếu distance ≤ radius, kể cả đúng trên biên. Follow-up: quad tree để prune vùng không giao query.", en: "Find merchants within a given radius around a user. Input is Name:x,y; keep a merchant when distance ≤ radius, including exactly on the boundary. Follow-up: use a quad tree to prune regions that do not intersect the query." },
    defaultInput: "Cafe:0,3|Market:3,4|Pharmacy:6,0|Bakery:-4,3", inputKind: "string", inputLabel: { vi: "merchant Name:x,y (ngăn bởi |)", en: "merchants Name:x,y (separated by |)" }, extraParams: [{ key: "x", type: "float", label: { vi: "user x", en: "user x" }, default: 0 }, { key: "y", type: "float", label: { vi: "user y", en: "user y" }, default: 0 }, { key: "radius", type: "float", label: { vi: "radius (miles)", en: "radius (miles)" }, default: 5, min: 0 }],
    approach: [{ vi: "Tính distance từ query tới từng merchant và giữ distance ≤ radius để xử lý đúng biên.", en: "Compute distance from query to every merchant and keep distance ≤ radius to handle the boundary correctly." }, { vi: "Bản demo dùng scan; cache theo geohash/cell giúp giảm candidate trước khi tính distance thật.", en: "The demo scans; caching by geohash/cell reduces candidates before exact distance checks." }, { vi: "Quad tree chỉ duyệt quadrant giao với vòng tròn query, sau đó test chính xác từng điểm còn lại.", en: "A quad tree visits only quadrants intersecting the query circle, then precisely tests remaining points." }], complexity: { time: "O(n) scan · O(log n + output) expected with quad tree", space: "O(n)", note: { vi: "Với lat/lng thật, thay Euclid bằng Haversine và mở rộng query radius theo bounding box trước khi exact-check.", en: "For real latitude/longitude, replace Euclidean distance with Haversine and expand the query radius to a bounding box before exact checks." } },
    code: ["def nearby_merchants(merchants, user, radius):", "    answer = []", "    for merchant in merchants:", "        distance = euclidean(user, merchant.point)", "        if distance <= radius:  # includes boundary", "            answer.append(merchant)", "    return answer", "", "# Follow-up: QuadTree.query(circle)", "# skips nodes whose bounding box misses the circle", "# then exact-checks points in intersecting leaves"], builder: buildSteps9009,
  },
  9011: {
    id: 9011, difficulty: "medium", category: DESIGN, tags: [HASHMAP, FILE_IO], title: { vi: "On-Disk Key-Value Store", en: "On-Disk Key-Value Store" }, titleVi: { vi: "Key-value store trên disk", en: "On-disk key-value store" },
    statement: { vi: "Mô phỏng key-value store dựa trên append-only file: PUT/UPDATE ghi record mới, DELETE ghi tombstone, index key→offset trỏ record sống mới nhất, SCAN trả keys tăng dần.", en: "Simulate an append-only-file key-value store: PUT/UPDATE writes a new record, DELETE writes a tombstone, a key→offset index points to the newest live record, and SCAN returns ascending keys." },
    defaultInput: "PUT a 1|PUT b 2|UPDATE a 3|DELETE b|PUT c 4|SCAN", inputKind: "string", inputLabel: { vi: "ops: PUT/UPDATE/DELETE/SCAN (ngăn |)", en: "ops: PUT/UPDATE/DELETE/SCAN (separated by |)" }, extraParams: [],
    approach: [{ vi: "Append-only write biến update thành ghi tuần tự nhanh; index giữ record mới nhất.", en: "Append-only writes make updates fast sequential writes; the index retains the newest record." }, { vi: "DELETE dùng tombstone để recovery biết key đã bị xóa trước compaction.", en: "DELETE uses a tombstone so recovery knows the key was removed before compaction." }, { vi: "Sorted iteration cần SSTable/B-tree hoặc sorted memtable; demo sort live index để minh họa API.", en: "Sorted iteration needs an SSTable/B-tree or sorted memtable; the demo sorts the live index to illustrate the API." }], complexity: { time: "O(1) expected write/index · O(k log k) demo scan", space: "O(live keys + log)", note: { vi: "Production scan dùng cấu trúc sorted để O(log n + output), không sort lại như demo.", en: "Production scans use a sorted structure for O(log n + output), rather than re-sorting as in the demo." } },
    debugMode: "line-by-line", code: CODE_9011, builder: buildSteps9011,
  },
  9012: {
    id: 9012, difficulty: "medium", category: DESIGN, tags: [DP], title: { vi: "Vending Machine Change", en: "Vending Machine Change" }, titleVi: { vi: "Máy bán hàng và tiền thừa", en: "Vending machine and change" },
    statement: { vi: "Thiết kế VendingMachine nhận price/paid và tìm tổ hợp coin trả change với số coin ít nhất. Đây là module payment trong OOD; thuật toán bên trong dùng coin-change DP.", en: "Design a VendingMachine that receives price/paid and finds a minimum-coin change combination. This is a payment module in OOD; its internal algorithm uses coin-change DP." },
    defaultInput: "1,5,10,25", inputKind: "string", inputLabel: { vi: "coin denominations", en: "coin denominations" }, extraParams: [{ key: "price", label: { vi: "price", en: "price" }, default: 65, min: 0 }, { key: "paid", label: { vi: "paid", en: "paid" }, default: 100, min: 0 }],
    approach: [{ vi: "purchase xác thực paid ≥ price và tính change.", en: "purchase validates paid ≥ price and computes change." }, { vi: "dp[amount] là số coin ít nhất để trả amount; thử thêm từng denomination.", en: "dp[amount] is the fewest coins to return amount; try every denomination." }, { vi: "pick[] dựng lại coin combination để trả ra từ payment module.", en: "pick[] reconstructs the coin combination returned by the payment module." }], complexity: { time: "O(change × denominations)", space: "O(change)", note: { vi: "Nếu coin system lớn hoặc inventory hữu hạn, state cần thêm số lượng mỗi coin.", en: "With a large coin system or finite inventory, the state must also include each coin count." } },
    debugMode: "line-by-line", code: CODE_9012, builder: buildSteps9012,
  },
  9013: {
    id: 9013, difficulty: "hard", category: GRAPH, tags: [BACKTRACKING], title: { vi: "Perfect-Square Arrangement", en: "Perfect-Square Arrangement" }, titleVi: { vi: "Sắp xếp sao cho tổng kề là square", en: "Arrange adjacent sums as squares" },
    statement: { vi: "Cho n, sắp xếp 1..n sao cho tổng của mọi cặp kề nhau là số chính phương. Dựng graph với cạnh a—b khi a+b là square, sau đó tìm Hamiltonian path bằng backtracking.", en: "Given n, arrange 1..n so every adjacent pair sums to a perfect square. Build a graph with edge a—b when a+b is square, then find a Hamiltonian path by backtracking." },
    defaultInput: [15], inputKind: "positive", singleInput: true, maxInput: 16, inputLabel: { vi: "n", en: "n" }, extraParams: [],
    approach: [{ vi: "Node là số 1..n; cạnh biểu thị hai số có thể đứng cạnh nhau.", en: "Nodes are 1..n; an edge means those numbers may be adjacent." }, { vi: "Backtracking chọn neighbor chưa dùng; ưu tiên node bậc nhỏ để fail sớm.", en: "Backtracking selects an unused neighbor; prioritize lower-degree nodes to fail early." }, { vi: "Path dài n chính là arrangement hợp lệ.", en: "A path of length n is a valid arrangement." }], complexity: { time: "O(n!) worst case", space: "O(n²)", note: { vi: "Graph tốn O(n²); pruning theo cạnh và degree giảm mạnh nhánh thực tế nhưng worst case vẫn factorial.", en: "The graph costs O(n²); edge/degree pruning greatly reduces practical branching, though the worst case remains factorial." } },
    code: ["def arrange(n):", "    graph = {a: [] for a in range(1, n + 1)}", "    for a in graph:", "        graph[a] = [b for b in graph if b != a and is_square(a + b)]", "", "    def dfs(path, used):", "        if len(path) == n: return path", "        for nxt in sorted(graph[path[-1]], key=lambda x: len(graph[x])):", "            if nxt not in used:", "                used.add(nxt)", "                result = dfs(path + [nxt], used)", "                if result: return result", "                used.remove(nxt)", "    return next((dfs([start], {start}) for start in graph), [])"], builder: buildSteps9013,
  },
  9014: {
    id: 9014, difficulty: "medium", category: HASHMAP, tags: [FILE_IO], title: { vi: "Loyal Customers from Daily Logs", en: "Loyal Customers from Daily Logs" }, titleVi: { vi: "Khách trung thành từ hai log ngày", en: "Loyal customers from two daily logs" },
    statement: { vi: "Từ hai daily log, tìm user xuất hiện ở cả hai ngày và đã xem ít nhất 2 video distinct. Input: day1||day2, mỗi ngày user:video cách nhau bởi phẩy.", en: "From two daily logs, find users present on both days who watched at least 2 distinct videos. Input: day1||day2, with comma-separated user:video records per day." }, defaultInput: "ann:A,ann:B,bob:A||ann:B,ann:C,cam:D", inputKind: "string", inputLabel: { vi: "day1 user:video || day2 user:video", en: "day1 user:video || day2 user:video" }, extraParams: [],
    approach: [{ vi: "Map theo day kiểm tra user có visit cả hai ngày; set global đếm video unique.", en: "Per-day maps verify the user visited both days; a global set counts unique videos." }, { vi: "Lọc user có đủ hai điều kiện.", en: "Filter users satisfying both conditions." }, { vi: "File lớn: stream, hash-partition theo user hoặc external sort rồi merge từng partition.", en: "For large files: stream, hash-partition by user, or externally sort then merge each partition." }], complexity: { time: "O(records)", space: "O(unique users + unique views)", note: { vi: "Partitioning cho phép giới hạn RAM theo kích thước một partition.", en: "Partitioning bounds RAM by the size of one partition." } }, code: ["def loyal(day1_file, day2_file):", "    visited = [defaultdict(set), defaultdict(set)]", "    all_videos = defaultdict(set)", "    for day, file in enumerate([day1_file, day2_file]):", "        for user, video in stream(file):", "            visited[day][user].add(video)", "            all_videos[user].add(video)", "    return [u for u in all_videos", "            if u in visited[0] and u in visited[1]", "            and len(all_videos[u]) >= 2]"], builder: buildSteps9014,
  },
  9015: {
    id: 9015, difficulty: "medium", category: INTERVAL, tags: [SWEEP], title: { vi: "Interval Overlap Counter", en: "Interval Overlap Counter" }, titleVi: { vi: "Đếm overlap interval", en: "Count interval overlaps" }, statement: { vi: "Đếm số cặp interval overlap. Follow-up: tìm số interval overlap lớn nhất tại một thời điểm bằng sweep line.", en: "Count overlapping interval pairs. Follow-up: find the greatest number overlapping at any time with a sweep line." }, defaultInput: "1-5,2-6,4-7", inputKind: "string", inputLabel: { vi: "interval start-end, ngăn phẩy", en: "comma-separated start-end intervals" }, extraParams: [],
    approach: [{ vi: "Chuyển mỗi interval thành start +1 và end −1 event.", en: "Turn every interval into start +1 and end −1 events." }, { vi: "Khi một start đến, nó overlap với toàn bộ active interval hiện tại.", en: "When a start arrives, it overlaps every currently active interval." }, { vi: "Peak active count trả lời follow-up tại bất kỳ thời điểm nào.", en: "Peak active count answers the at-any-time follow-up." }], complexity: { time: "O(n log n)", space: "O(n)", note: { vi: "Sort 2n events, sau đó quét một lượt.", en: "Sort 2n events, then scan once." } }, code: ["def overlaps(intervals):", "    events = []", "    for start, end in intervals:", "        events += [(start, 1), (end, -1)]", "    events.sort(key=lambda e: (e[0], -e[1]))", "    active = pairs = peak = 0", "    for _, delta in events:", "        if delta == 1:", "            pairs += active", "            active += 1; peak = max(peak, active)", "        else:", "            active -= 1", "    return pairs, peak"], builder: buildSteps9015,
  },
  9016: {
    id: 9016, difficulty: "hard", category: DESIGN, tags: [HASHMAP], title: { vi: "Movie-History Friends", en: "Movie-History Friends" }, titleVi: { vi: "Bạn bè theo lịch sử phim", en: "Friends by movie history" }, statement: { vi: "Hai customer là friends nếu last k movies giống nhau. Tìm mọi pair; follow-up khi cần m trong k movie match.", en: "Two customers are friends when their last k movies match. Find every pair; follow-up when m of the k movies must match." }, defaultInput: "ann:A,B,C|bob:X,A,B,C|cam:A,B,D|dan:A,B,C", inputKind: "string", inputLabel: { vi: "User:movie,... (ngăn |)", en: "User:movie,... (separated by |)" }, extraParams: [{ key: "k", label: { vi: "last k", en: "last k" }, default: 3, min: 1, max: 20 }, { key: "m", label: { vi: "m matches", en: "m matches" }, default: 3, min: 1, max: 20 }],
    approach: [{ vi: "Signature last-k là hash key; users cùng signature tạo mọi pair.", en: "The last-k signature is a hash key; users in the same signature create all pairs." }, { vi: "Nhóm trước làm giảm so sánh pair từ toàn cục xuống trong bucket.", en: "Grouping first reduces pair comparisons from global to within buckets." }, { vi: "m<k dùng inverted index theo m-gram/movie và một bước xác nhận để tránh false positive.", en: "For m<k, use an inverted index over m-grams/movies plus a verification step to avoid false positives." }], complexity: { time: "O(total history + output)", space: "O(customers × k)", note: { vi: "Số pair trong một bucket có thể O(bucket²), không tránh được nếu phải xuất toàn bộ pair.", en: "Pairs inside one bucket can be O(bucket²), which is unavoidable when all pairs must be returned." } }, code: ["def friends(histories, k):", "    buckets = defaultdict(list)", "    for user, movies in histories.items():", "        signature = tuple(movies[-k:])", "        buckets[signature].append(user)", "    pairs = []", "    for users in buckets.values():", "        for a, b in combinations(users, 2):", "            pairs.append((a, b))", "    return pairs", "", "# m < k: inverted index of m-grams + verify candidates"], builder: buildSteps9016,
  },
  9017: {
    id: 9017, difficulty: "hard", category: DESIGN, tags: [HASHMAP, FILE_IO], title: { vi: "Ad Promotion Metrics System", en: "Ad Promotion Metrics System" }, titleVi: { vi: "Hệ thống promotion ads", en: "Ads promotion metrics system" }, statement: { vi: "Thiết kế pipeline promotion ads: schema campaign/creative/event, xử lý impression/click/conversion idempotent và tính spend, CTR, CVR. Input: type:campaign:user:cost.", en: "Design an ads-promotion pipeline: campaign/creative/event schema, idempotent impression/click/conversion processing, and spend, CTR, CVR metrics. Input: type:campaign:user:cost." }, defaultInput: "impression:summer:u1:0.05|impression:summer:u2:0.05|click:summer:u1:0.20|conversion:summer:u1:0|impression:winter:u3:0.04", inputKind: "string", inputLabel: { vi: "type:campaign:user:cost (ngăn |)", en: "type:campaign:user:cost (separated by |)" }, extraParams: [],
    approach: [{ vi: "OLTP schema: campaign, creative, budget; append-only event stream lưu delivery và attribution.", en: "OLTP schema: campaign, creative, budget; an append-only event stream stores delivery and attribution." }, { vi: "Idempotency key chống retry double-count; aggregate theo campaign cho dashboard.", en: "Idempotency keys prevent retry double-counting; aggregate by campaign for dashboards." }, { vi: "Track impressions, clicks, conversions, spend, CTR, CVR; alert pacing/budget và event lag.", en: "Track impressions, clicks, conversions, spend, CTR, CVR; alert on pacing/budget and event lag." }], complexity: { time: "O(events) streaming", space: "O(campaigns + dedupe window)", note: { vi: "Dedupe window có TTL; unique reach ở quy mô lớn dùng HyperLogLog hay sketch tương tự.", en: "The dedupe window has a TTL; unique reach at scale uses HyperLogLog or a similar sketch." } }, code: ["def consume(event):", "    if seen(event.id): return  # idempotency", "    mark_seen(event.id)", "    metric = campaign_metrics[event.campaign_id]", "    metric.spend += event.cost", "    if event.type == 'impression': metric.impressions += 1", "    if event.type == 'click': metric.clicks += 1", "    if event.type == 'conversion': metric.conversions += 1", "", "# CTR = clicks / impressions", "# CVR = conversions / clicks", "# persist raw events + daily aggregates"], builder: buildSteps9017,
  },
  843: {
    id: 843, difficulty: "hard", slug: "guess-the-word", category: STRING, tags: [STRING, MINIMAX],
    title: { vi: "Đoán từ", en: "Guess the Word" }, titleVi: { vi: "Minimax đoán từ bí mật trong 10 lượt", en: "Minimax the secret word within 10 guesses" },
    statement: { vi: "Cho wordlist gồm các từ 6 chữ cái phân biệt, một từ được master giấu kín. Mỗi lượt gọi master.guess(w) trả về số vị trí trùng với từ bí mật (tối đa 10 lượt). Tìm từ bí mật.", en: "Given a wordlist of distinct 6-letter words, the master hides one. Each turn, master.guess(w) returns the number of matching positions with the secret (at most 10 turns). Find the secret word." },
    defaultInput: "acckzz,ccbazz,eiowzz,abcczz", inputKind: "string", inputLabel: { vi: "wordlist (cách nhau bởi dấu phẩy)", en: "wordlist (comma separated)" },
    extraParams: [{ key: "secret", type: "string", label: { vi: "từ bí mật (phải có trong wordlist)", en: "secret word (must be in wordlist)" }, default: "acckzz" }],
    approach: [{ vi: "Với mỗi ứng viên, chia các từ còn lại thành 7 nhóm theo số vị trí trùng (0–6); score = kích thước nhóm lớn nhất.", en: "For each candidate, split remaining words into 7 groups by match count (0–6); score = the largest group size." }, { vi: "Đoán từ có score nhỏ nhất (minimax): dù master trả về gì, số ứng viên còn lại cũng ≤ score.", en: "Guess the word with the smallest score (minimax): no matter what the master returns, remaining candidates ≤ score." }, { vi: "Lọc wordlist chỉ giữ từ có đúng x vị trí trùng với từ vừa đoán, lặp lại.", en: "Filter the wordlist to words with exactly x matches against the guess, then repeat." }],
    complexity: { time: "O(10 · n²)", space: "O(n)", note: { vi: "Mỗi vòng tính matches cho mọi cặp ứng viên (n²); n ≤ 24 trong visualizer.", en: "Each round computes matches for every candidate pair (n²); n ≤ 24 in the visualizer." } },
    code: CODE843, builder: buildSteps843,
  },
};
