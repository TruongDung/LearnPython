// Interview-style additions: heap enumeration, language model counts, and indexed BFS.

const HEAP = { key: "heap", vi: "Heap / Priority Queue", en: "Heap / Priority Queue" };
const SORTING = { key: "sorting", vi: "Sắp xếp", en: "Sorting" };
const DESIGN = { key: "design", vi: "Thiết kế hệ thống", en: "Design" };
const HASHMAP = { key: "hashmap", vi: "Hash Map", en: "Hash Map" };
const STRING = { key: "string", vi: "Chuỗi", en: "String" };
const GRAPH = { key: "graph", vi: "Đồ thị", en: "Graph" };
const BFS = { key: "bfs", vi: "BFS", en: "BFS" };

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
};
