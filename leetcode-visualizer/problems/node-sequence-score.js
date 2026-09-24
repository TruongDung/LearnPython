// LeetCode 2242: keep the three highest-scoring neighbors of each node.

const label = (vi, en) => ({ vi, en });
const NODE_PREVIEW = 14;
const EDGE_PREVIEW = 12;
const TRACE_EDGES = 20;

function parseEdges2242(raw) {
  let edges = raw;
  if (typeof raw === "string") {
    try {
      edges = JSON.parse(raw);
    } catch (_) {
      throw new Error('edges must be JSON pairs such as [[0,1],[1,2]]');
    }
  }
  if (!Array.isArray(edges) || edges.length > 50000 || edges.some((pair) =>
    !Array.isArray(pair) || pair.length !== 2 || !Number.isInteger(pair[0])
    || !Number.isInteger(pair[1]))) {
    throw new Error("edges must contain 0..50000 integer pairs [u, v]");
  }
  return edges.map(([u, v]) => [u, v]);
}

function validateInput2242(input, params = {}) {
  const scores = Array.isArray(input) ? [...input] : [];
  if (scores.length < 4 || scores.length > 50000
    || scores.some((score) => !Number.isInteger(score) || score < 1 || score > 100000000)) {
    throw new Error("scores must contain 4..50000 integers in [1, 100000000]");
  }
  const edges = parseEdges2242(params.edges);
  const seen = new Set();
  for (const [u, v] of edges) {
    if (u < 0 || v < 0 || u >= scores.length || v >= scores.length || u === v) {
      throw new Error("each edge must connect two distinct nodes in [0, n)");
    }
    const key = `${Math.min(u, v)},${Math.max(u, v)}`;
    if (seen.has(key)) throw new Error("duplicate undirected edges are not allowed");
    seen.add(key);
  }
  return { scores, edges };
}

function buildSteps2242(input, params = {}) {
  const { scores, edges } = validateInput2242(input, params);
  const n = scores.length;
  const top = Array.from({ length: n }, () => []);
  const steps = [];
  let answer = -1;
  let bestPath = null;

  function record(phase, title, line, note, state = {}) {
    const edgeIndex = state.edgeIndex ?? null;
    const middle = edgeIndex === null ? null : edges[edgeIndex];
    const candidate = state.candidate || null;
    const ids = new Set(Array.from({ length: Math.min(n, NODE_PREVIEW) }, (_, index) => index));
    for (const id of [...(middle || []), ...(candidate || []), ...(bestPath || [])]) ids.add(id);
    const edgeIds = new Set(Array.from({ length: Math.min(edges.length, EDGE_PREVIEW) }, (_, index) => index));
    if (edgeIndex !== null) edgeIds.add(edgeIndex);
    const vars = [{ name: "n", value: n }, { name: "edges", value: edges.length }];
    if (edgeIndex !== null) vars.push({ name: "edge", value: edgeIndex },
      { name: "b", value: middle[0] }, { name: "c", value: middle[1] });
    if (candidate) vars.push({ name: "a", value: candidate[0] }, { name: "d", value: candidate[3] });
    if (state.total !== undefined) vars.push({ name: "total", value: state.total });
    vars.push({ name: "best", value: answer });
    steps.push({
      title, arr: [], highlight: [], mark: [], codeLines: [line], vars, note,
      final: Boolean(state.final),
      nodeSequence2242View: {
        phase, n, edgeCount: edges.length, edgeIndex, middle, candidate,
        valid: state.valid ?? null, reason: state.reason || null,
        total: state.total ?? null, answer, bestPath: bestPath ? [...bestPath] : null,
        nodes: [...ids].sort((a, b) => a - b).map((id) => ({ id, score: scores[id], top: [...top[id]] })),
        edges: [...edgeIds].sort((a, b) => a - b).map((index) => ({ index, u: edges[index][0], v: edges[index][1] })),
        leftTop: middle ? [...top[middle[0]]].map((id) => ({ id, score: scores[id] })) : [],
        rightTop: middle ? [...top[middle[1]]].map((id) => ({ id, score: scores[id] })) : [],
        shortened: edges.length > TRACE_EDGES || n > NODE_PREVIEW,
      },
    });
  }

  function add(node, neighbor) {
    top[node].push(neighbor);
    top[node].sort((a, b) => scores[b] - scores[a] || a - b);
    if (top[node].length > 3) top[node].pop();
  }

  record("init", label("Tạo top-3 hàng xóm", "Initialize top-3 neighbors"), 4,
    label("Với mỗi đỉnh, chỉ cần giữ tối đa 3 hàng xóm có điểm cao nhất.",
      "Each node needs only its three highest-scoring neighbors."));
  for (let edgeIndex = 0; edgeIndex < edges.length; edgeIndex++) {
    const [u, v] = edges[edgeIndex];
    add(u, v);
    add(v, u);
    if (edgeIndex < TRACE_EDGES) {
      record("build", label(`Cạnh ${u}—${v}: cập nhật hai top-3`,
        `Edge ${u}—${v}: update both top-3 lists`), 12,
      label("Cạnh vô hướng: hai đầu đều thêm đầu kia vào danh sách hàng xóm.",
        "Undirected edge: each endpoint considers the other as a neighbor."), { edgeIndex });
    }
  }
  record("ready", label("Đã có top-3 cho mọi đỉnh", "Top-3 lists are ready"), 13,
    label("Trong một dãy a-b-c-d, mỗi đầu chỉ phải tránh tối đa hai đỉnh khác.",
      "In a-b-c-d, each outer choice excludes at most two other nodes."));

  for (let edgeIndex = 0; edgeIndex < edges.length; edgeIndex++) {
    const [b, c] = edges[edgeIndex];
    if (edgeIndex < TRACE_EDGES) {
      record("middle", label(`Thử cạnh giữa ${b}—${c}`, `Try middle edge ${b}—${c}`), 14,
        label("Chọn một hàng xóm của b làm a và một hàng xóm của c làm d.",
          "Choose a neighbor of b as a and a neighbor of c as d."), { edgeIndex });
    }
    for (const a of top[b]) {
      for (const d of top[c]) {
        const candidate = [a, b, c, d];
        const reason = a === c ? "a=c" : d === b ? "d=b" : a === d ? "a=d" : null;
        if (reason) {
          if (edgeIndex < TRACE_EDGES) {
            record("reject", label(`Bỏ ${candidate.join("→")}: ${reason}`,
              `Reject ${candidate.join("→")}: ${reason}`), 17,
            label("Bốn đỉnh phải khác nhau; không được đi lại một đỉnh.",
              "All four nodes must differ; a node cannot be revisited."),
            { edgeIndex, candidate, valid: false, reason });
          }
          continue;
        }
        const total = scores[a] + scores[b] + scores[c] + scores[d];
        const improved = total > answer;
        if (improved) {
          answer = total;
          bestPath = candidate;
        }
        if (edgeIndex < TRACE_EDGES) {
          record("candidate", label(`Dãy ${candidate.join("→")}: ${total}`,
            `Path ${candidate.join("→")}: ${total}`), improved ? 20 : 19,
          improved
            ? label("Tổng này lớn hơn best, cập nhật đáp án.", "This sum exceeds best, so update the answer.")
            : label("Dãy hợp lệ nhưng không vượt best.", "Valid path, but it does not beat best."),
          { edgeIndex, candidate, valid: true, total });
        }
      }
    }
  }
  record("done", label(`Đáp án: ${answer}`, `Answer: ${answer}`), 21,
    answer === -1
      ? label("Không có đường đi gồm 4 đỉnh khác nhau.", "No path contains four distinct nodes.")
      : label("Đã kiểm tra mọi cạnh giữa; top-3 đủ để giữ cặp đầu ngoài tối ưu.",
        "All middle edges were checked; top-3 retained an optimal outer pair."),
    { final: true });
  return { original: scores, answer, steps };
}

module.exports = {
  2242: {
    id: 2242,
    difficulty: "hard",
    slug: "maximum-score-of-a-node-sequence",
    category: { key: "graph", vi: "Đồ thị", en: "Graph" },
    tags: [
      { key: "greedy", vi: "Tham lam", en: "Greedy" },
      { key: "sorting", vi: "Sắp xếp", en: "Sorting" },
    ],
    title: label("Maximum Score of a Node Sequence", "Maximum Score of a Node Sequence"),
    titleVi: label("Điểm lớn nhất của dãy 4 đỉnh", "Maximum score of four distinct nodes"),
    statement: label(
      "Cho điểm của các đỉnh và cạnh vô hướng. Tìm dãy 4 đỉnh khác nhau nối liên tiếp có tổng điểm lớn nhất; nếu không có, trả -1.",
      "Given node scores and undirected edges, maximize the score of a connected sequence of four distinct nodes; return -1 if none exists."
    ),
    defaultInput: [5, 2, 9, 8, 4],
    inputKind: "positive",
    inputLabel: label("scores (1..100000000)", "scores (1..100000000)"),
    extraParams: [{ key: "edges", type: "string",
      label: label("edges (JSON, ví dụ [[0,1],[1,2]])", "edges (JSON, e.g. [[0,1],[1,2]])"),
      default: "[[0,1],[1,2],[2,3],[0,2],[1,3],[2,4]]" }],
    approach: [
      label("Với mỗi đỉnh, giữ 3 hàng xóm có điểm cao nhất (cùng điểm thì ưu tiên ID nhỏ).",
        "Keep each node's top three scoring neighbors (smaller ID breaks ties)."),
      label("Xét mỗi cạnh b-c làm hai đỉnh giữa, thử a trong top[b] và d trong top[c].",
        "Use each edge b-c as the middle; try a from top[b] and d from top[c]."),
      label("Bỏ dãy có đỉnh lặp. Top-3 là đủ vì mỗi đầu chỉ phải tránh tối đa 2 đỉnh; lấy tổng lớn nhất.",
        "Reject repeated nodes. Top-3 suffices because each outer choice excludes at most two nodes; keep the maximum sum."),
    ],
    complexity: { time: "O(n + m)", space: "O(n)",
      note: label("n đỉnh, m cạnh. Mỗi danh sách top chỉ dài tối đa 3; không tính bộ nhớ đầu vào và trace.",
        "n nodes, m edges. Each top list has at most three entries; input storage and the teaching trace are excluded.") },
    code: [
      "class Solution:",
      "    def maximumScore(self, scores, edges):",
      "        n = len(scores)",
      "        top = [[] for _ in range(n)]",
      "        def add(node, neighbor):",
      "            top[node].append(neighbor)",
      "            top[node].sort(key=lambda x: (-scores[x], x))",
      "            if len(top[node]) > 3:",
      "                top[node].pop()",
      "        for u, v in edges:",
      "            add(u, v)",
      "            add(v, u)",
      "        answer = -1",
      "        for b, c in edges:",
      "            for a in top[b]:",
      "                for d in top[c]:",
      "                    if a == c or d == b or a == d:",
      "                        continue",
      "                    total = scores[a] + scores[b] + scores[c] + scores[d]",
      "                    answer = max(answer, total)",
      "        return answer",
    ],
    builder: buildSteps2242,
    liveArgs(input, params) {
      const { scores, edges } = validateInput2242(input, params);
      return [scores, edges];
    },
  },
};
