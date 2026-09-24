// LeetCode 2242: keep the three highest-scoring neighbors of each node.

const label = (vi, en) => ({ vi, en });
const NODE_PREVIEW = 14;
const EDGE_PREVIEW = 12;
const TRACE_EDGES = 8;

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
  const steps = [];
  let localN = null;
  let top = null;
  let answer = null;
  let bestPath = null;
  let u = null;
  let v = null;
  let node = null;
  let neighbor = null;
  let b = null;
  let c = null;
  let a = null;
  let d = null;
  let total = null;

  function record(phase, title, line, note, state = {}) {
    const edgeIndex = state.edgeIndex ?? null;
    const middle = state.middle && b !== null && c !== null ? [b, c] : null;
    const candidate = middle && a !== null && d !== null ? [a, b, c, d] : null;
    const ids = new Set(Array.from({ length: Math.min(n, NODE_PREVIEW) }, (_, index) => index));
    for (const id of [u, v, node, neighbor, ...(middle || []), ...(candidate || []), ...(bestPath || [])]) {
      if (id !== null) ids.add(id);
    }
    const edgeIds = new Set(Array.from({ length: Math.min(edges.length, EDGE_PREVIEW) }, (_, index) => index));
    if (edgeIndex !== null) edgeIds.add(edgeIndex);
    const vars = [{ name: "scores", value: `${n} nodes` }, { name: "edges", value: edges.length }];
    if (localN !== null) vars.push({ name: "n", value: localN });
    if (u !== null) vars.push({ name: "u", value: u }, { name: "v", value: v });
    if (node !== null) vars.push({ name: "node", value: node },
      { name: "neighbor", value: neighbor }, { name: "top[node]", value: `[${top[node].join(", ")}]` });
    if (answer !== null) vars.push({ name: "answer", value: answer });
    if (b !== null) vars.push({ name: "b", value: b }, { name: "c", value: c });
    if (a !== null) vars.push({ name: "a", value: a });
    if (d !== null) vars.push({ name: "d", value: d });
    if (total !== null) vars.push({ name: "total", value: total });
    steps.push({
      title, arr: [], highlight: [], mark: [], codeLines: [line], vars, note,
      final: Boolean(state.final),
      nodeSequence2242View: {
        phase, n, edgeCount: edges.length, edgeIndex, middle, candidate,
        valid: state.valid ?? null, reason: state.reason || null,
        total, answer, bestPath: bestPath ? [...bestPath] : null,
        helperNode: node, helperNeighbor: neighbor, helperTop: node === null ? [] : [...top[node]],
        trimCondition: state.trimCondition ?? null, selectedA: a, selectedD: d,
        nodes: [...ids].sort((left, right) => left - right).map((id) => ({
          id, score: scores[id], top: top ? [...top[id]] : [],
        })),
        edges: [...edgeIds].sort((a, b) => a - b).map((index) => ({ index, u: edges[index][0], v: edges[index][1] })),
        leftTop: middle ? [...top[b]].map((id) => ({ id, score: scores[id] })) : [],
        rightTop: middle ? [...top[c]].map((id) => ({ id, score: scores[id] })) : [],
        shortened: edges.length > TRACE_EDGES || n > NODE_PREVIEW,
      },
    });
  }

  record("enter", label("Vào hàm maximumScore", "Enter maximumScore"), 2,
    label("scores và edges là hai đối số đầu vào.", "scores and edges are the two input arguments."));
  localN = n;
  record("size", label(`n = ${n}`, `n = ${n}`), 3,
    label("n là số đỉnh của đồ thị.", "n is the number of graph nodes."));
  top = Array.from({ length: n }, () => []);
  record("init", label("Tạo danh sách top rỗng", "Initialize empty top lists"), 4,
    label("Mỗi đỉnh có một danh sách hàng xóm tốt nhất, ban đầu rỗng.",
      "Each node starts with an empty best-neighbor list."));

  for (let edgeIndex = 0; edgeIndex < edges.length; edgeIndex++) {
    [u, v] = edges[edgeIndex];
    node = null;
    neighbor = null;
    const trace = edgeIndex < TRACE_EDGES;
    if (trace) record("build-edge", label(`Xét cạnh ${u}—${v}`, `Read edge ${u}—${v}`), 5,
      label("Cạnh vô hướng cần cập nhật top cho cả hai đầu.",
        "An undirected edge updates both endpoints."), { edgeIndex });
    for (const [currentNode, currentNeighbor] of [[u, v], [v, u]]) {
      node = currentNode;
      neighbor = currentNeighbor;
      if (trace) record("build-side", label(`node=${node}, neighbor=${neighbor}`,
        `node=${node}, neighbor=${neighbor}`), 6,
      label("Xử lý một hướng của cạnh vô hướng.", "Process one direction of the undirected edge."),
      { edgeIndex });
      top[node].push(neighbor);
      if (trace) record("append", label(`Thêm ${neighbor} vào top[${node}]`,
        `Append ${neighbor} to top[${node}]`), 7,
      label("Danh sách có thể tạm dài 4 trước khi cắt.",
        "The list may temporarily have four entries before trimming."), { edgeIndex });
      top[node].sort((left, right) => scores[right] - scores[left] || left - right);
      if (trace) record("sort", label(`Sắp top[${node}] theo điểm`,
        `Sort top[${node}] by score`), 8,
      label("Điểm cao trước; bằng điểm thì ID nhỏ trước.",
        "Higher scores come first; smaller IDs break ties."), { edgeIndex });
      const needsTrim = top[node].length > 3;
      if (trace) record("trim-check", label(`len(top[${node}]) > 3? ${needsTrim}`,
        `len(top[${node}]) > 3? ${needsTrim}`), 9,
      needsTrim
        ? label("Giữ đúng 3 hàng xóm tốt nhất.", "Keep exactly the three strongest neighbors.")
        : label("Chưa quá 3, không cần bỏ ai.", "At most three entries, so nothing is removed."),
      { edgeIndex, trimCondition: needsTrim });
      if (needsTrim) {
        const removed = top[node].pop();
        if (trace) record("trim", label(`Bỏ #${removed} khỏi top[${node}]`,
          `Pop #${removed} from top[${node}]`), 10,
        label("Đỉnh cuối có điểm thấp nhất trong bốn ứng viên.",
          "The last node has the lowest rank among the four candidates."),
        { edgeIndex, trimCondition: true });
      }
    }
  }
  u = null;
  v = null;
  node = null;
  neighbor = null;
  answer = -1;
  record("ready", label("answer = -1; top-3 đã sẵn sàng", "answer = -1; top-3 is ready"), 11,
    label("−1 nghĩa là chưa tìm được dãy 4 đỉnh hợp lệ.",
      "−1 means no valid four-node path has been found yet."));

  for (let edgeIndex = 0; edgeIndex < edges.length; edgeIndex++) {
    [b, c] = edges[edgeIndex];
    a = null;
    d = null;
    total = null;
    const trace = edgeIndex < TRACE_EDGES;
    if (trace) record("middle", label(`Cạnh giữa ${b}—${c}`, `Middle edge ${b}—${c}`), 12,
      label("Chọn b và c làm hai đỉnh ở giữa dãy.",
        "Use b and c as the two middle nodes."), { edgeIndex, middle: true });
    for (const outerLeft of top[b]) {
      a = outerLeft;
      d = null;
      total = null;
      if (trace) record("choose-a", label(`a = ${a}`, `a = ${a}`), 13,
        label("Thử một hàng xóm điểm cao của b ở đầu trái.",
          "Try a high-scoring neighbor of b on the left."), { edgeIndex, middle: true });
      for (const outerRight of top[c]) {
        d = outerRight;
        total = null;
        if (trace) record("choose-d", label(`d = ${d}`, `d = ${d}`), 14,
          label("Thử một hàng xóm điểm cao của c ở đầu phải.",
            "Try a high-scoring neighbor of c on the right."), { edgeIndex, middle: true });
        const reason = a === c ? "a=c" : d === b ? "d=b" : a === d ? "a=d" : null;
        if (trace) record("distinct-check", label(reason ? `Trùng đỉnh: ${reason}` : "Bốn đỉnh khác nhau",
          reason ? `Repeated node: ${reason}` : "Four distinct nodes"), 15,
        reason
          ? label("Dãy này không hợp lệ; chuyển sang cặp tiếp theo.",
            "This path is invalid; move to the next pair.")
          : label("Dãy hợp lệ; tính tổng bốn điểm.", "The path is valid; add its four scores."),
        { edgeIndex, middle: true, valid: !reason, reason });
        if (reason) {
          if (trace) record("reject", label(`Bỏ ${[a, b, c, d].join("→")}`,
            `Skip ${[a, b, c, d].join("→")}`), 16,
          label("continue bỏ qua hai dòng tính tổng và cập nhật đáp án.",
            "continue skips the score and answer-update lines."),
          { edgeIndex, middle: true, valid: false, reason });
          continue;
        }
        total = scores[a] + scores[b] + scores[c] + scores[d];
        if (trace) record("candidate", label(`total = ${total}`, `total = ${total}`), 17,
          label("Cộng điểm của đúng bốn đỉnh khác nhau.",
            "Add the scores of the four distinct nodes."),
          { edgeIndex, middle: true, valid: true });
        const improved = total > answer;
        answer = Math.max(answer, total);
        if (improved) bestPath = [a, b, c, d];
        if (trace) record("update", label(improved ? `best = ${answer}` : `best giữ ${answer}`,
          improved ? `best = ${answer}` : `best stays ${answer}`), 18,
          improved
            ? label("Dãy hiện tại cải thiện đáp án.", "The current path improves the answer.")
            : label("Dãy hợp lệ nhưng không vượt best.", "Valid path, but it does not beat best."),
          { edgeIndex, middle: true, valid: true });
      }
    }
  }
  b = null;
  c = null;
  a = null;
  d = null;
  total = null;
  record("done", label(`Trả về ${answer}`, `Return ${answer}`), 19,
    answer === -1
      ? label("Không có đường đi gồm 4 đỉnh khác nhau.", "No path contains four distinct nodes.")
      : label("Mọi cạnh giữa đã được xét; đáp án là tổng điểm lớn nhất.",
        "All middle edges were checked; the answer is the largest path score."),
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
    debugMode: "line-by-line",
    code: [
      "class Solution:",
      "    def maximumScore(self, scores, edges):",
      "        n = len(scores)",
      "        top = [[] for _ in range(n)]",
      "        for u, v in edges:",
      "            for node, neighbor in ((u, v), (v, u)):",
      "                top[node].append(neighbor)",
      "                top[node].sort(key=lambda x: (-scores[x], x))",
      "                if len(top[node]) > 3:",
      "                    top[node].pop()",
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
