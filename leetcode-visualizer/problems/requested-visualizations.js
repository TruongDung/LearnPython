// Focused teaching traces for the requested custom visualizations.
// Metadata is inherited from the original modules so catalog ownership remains unchanged.

const INTERVIEW = require("./interview");
const HEAP = require("./heap");

const label = (vi, en) => ({ vi, en });

// ─── #9006: Graph BFS Shortest Path ─────────────────────────────────────────

function parseEdges9006(input) {
  let rawEdges;
  if (Array.isArray(input)) {
    rawEdges = input;
  } else {
    const raw = String(input ?? "").trim();
    if (!raw) throw new Error("edges không được rỗng");
    if (raw.startsWith("[")) {
      try {
        rawEdges = JSON.parse(raw);
      } catch (_error) {
        throw new Error('JSON edges phải có dạng [["A","B"],["B","C"]]');
      }
    } else {
      const separator = raw.includes(";") ? ";" : ",";
      rawEdges = raw.split(separator).map((token) => {
        const parts = token.split("-").map((name) => name.trim());
        if (parts.length !== 2) {
          throw new Error("Mỗi edge dạng A-B; dùng JSON nếu tên node chứa dấu '-' hoặc ','");
        }
        return parts;
      });
    }
  }

  if (!Array.isArray(rawEdges) || rawEdges.length < 1 || rawEdges.length > 60) {
    throw new Error("Cần từ 1 đến 60 edges");
  }
  const edges = [];
  const seen = new Set();
  for (const edge of rawEdges) {
    if (!Array.isArray(edge) || edge.length !== 2) throw new Error("Mỗi edge phải có đúng hai đầu mút");
    const left = String(edge[0] ?? "").trim();
    const right = String(edge[1] ?? "").trim();
    if (!left || !right || left.length > 40 || right.length > 40) throw new Error("Tên node phải dài từ 1 đến 40 ký tự");
    if (left === right) throw new Error(`Self-loop ${left}-${right} không cần thiết cho shortest path`);
    const key = [left, right].sort().join("\u0000");
    if (seen.has(key)) continue;
    seen.add(key);
    edges.push([left, right]);
  }
  if (!edges.length) throw new Error("Không còn edge hợp lệ sau khi loại trùng");
  const names = [...new Set(edges.flat())];
  if (names.length > 24) throw new Error("Visualizer hỗ trợ tối đa 24 nodes để graph còn dễ đọc");
  return edges;
}

function buildSteps9006Easy(input, params = {}) {
  const edges = parseEdges9006(input);
  const start = String(params.start ?? "").trim();
  const target = String(params.target ?? "").trim();
  if (!start || !target) throw new Error("start và target không được rỗng");

  const names = [...new Set(edges.flat())];
  if (!names.includes(start) || !names.includes(target)) throw new Error("start và target phải xuất hiện trong edges");
  const idOf = new Map(names.map((name, index) => [name, index]));
  const adjacency = Array.from({ length: names.length }, () => []);
  for (const [left, right] of edges) {
    const a = idOf.get(left);
    const b = idOf.get(right);
    adjacency[a].push(b);
    adjacency[b].push(a);
  }
  adjacency.forEach((neighbors) => neighbors.sort((a, b) => names[a].localeCompare(names[b])));

  const startId = idOf.get(start);
  const targetId = idOf.get(target);
  const parent = Array(names.length).fill(-1);
  const distance = Array(names.length).fill(null);
  const discovered = new Set([startId]);
  const expanded = new Set();
  const queue = [startId];
  let head = 0;
  distance[startId] = 0;
  const steps = [];

  const pathEdgeKeys = (path) => new Set(path.slice(1).map((node, index) => {
    const a = path[index];
    return a < node ? `${a}-${node}` : `${node}-${a}`;
  }));

  function snapshot(options) {
    const queued = new Set(queue.slice(head));
    const path = options.path || [];
    const finalPathEdges = pathEdgeKeys(path);
    const currentEdgeKey = options.edge
      ? (options.edge[0] < options.edge[1] ? `${options.edge[0]}-${options.edge[1]}` : `${options.edge[1]}-${options.edge[0]}`)
      : null;
    const graphEdges = edges.map(([left, right]) => {
      const u = idOf.get(left);
      const v = idOf.get(right);
      const key = u < v ? `${u}-${v}` : `${v}-${u}`;
      return {
        u,
        v,
        left,
        right,
        undirected: true,
        tree: parent[v] === u || parent[u] === v,
        path: finalPathEdges.has(key),
        current: currentEdgeKey === key,
      };
    });
    const nodes = names.map((name, id) => {
      let status = "unseen";
      if (expanded.has(id)) status = "expanded";
      else if (queued.has(id)) status = "queued";
      else if (discovered.has(id)) status = "discovered";
      if (options.current === id) status = "current";
      if (path.includes(id)) status = "path";
      return {
        id,
        name,
        distance: distance[id],
        parent: parent[id] < 0 ? null : names[parent[id]],
        status,
        isStart: id === startId,
        isTarget: id === targetId,
        isCurrent: options.current === id,
        isNeighbor: options.neighbor === id,
      };
    });
    const highlightNodes = [options.current, options.neighbor].filter((id) => Number.isInteger(id));
    const highlightEdges = path.length
      ? path.slice(1).map((node, index) => [path[index], node])
      : options.edge ? [options.edge] : [];
    steps.push({
      title: options.title,
      arr: [],
      highlight: [],
      mark: [],
      final: Boolean(options.final),
      codeLines: options.codeLines || [],
      vars: [
        { name: "queue (front → back)", value: `[${queue.slice(head).map((id) => names[id]).join(", ")}]` },
        { name: "current", value: Number.isInteger(options.current) ? names[options.current] : "—" },
        { name: "distance", value: `{${names.map((name, id) => distance[id] === null ? null : `${name}:${distance[id]}`).filter(Boolean).join(", ")}}` },
        { name: "parent", value: `{${names.map((name, id) => parent[id] < 0 ? null : `${name}:${names[parent[id]]}`).filter(Boolean).join(", ")}}` },
      ],
      note: options.note,
      graph: {
        nodes: nodes.map((node) => ({
          id: node.id,
          label: node.name,
          sub: node.distance === null ? "d=∞" : `d=${node.distance}`,
        })),
        edges: graphEdges,
        hlNodes: highlightNodes,
        hlEdges: highlightEdges,
        visitedNodes: [...discovered],
        annotations: Object.fromEntries(path.map((id, index) => [id, `${index}`])),
        dimUnfocused: Boolean(path.length),
        caption: label("BFS duyệt theo từng lớp khoảng cách", "BFS explores one distance layer at a time"),
      },
      bfs9006View: {
        phase: options.phase,
        start,
        target,
        nodes,
        edges: graphEdges,
        queue: queue.slice(head).map((id) => ({ id, name: names[id], distance: distance[id] })),
        expanded: [...expanded],
        current: Number.isInteger(options.current) ? options.current : null,
        neighbor: Number.isInteger(options.neighbor) ? options.neighbor : null,
        reason: options.reason || null,
        path: path.map((id) => names[id]),
        distance: path.length ? path.length - 1 : null,
        answer: options.final ? path.map((id) => names[id]) : null,
      },
    });
  }

  snapshot({
    phase: "init",
    title: label(`Đưa start ${start} vào queue`, `Enqueue start ${start}`),
    codeLines: [4, 5, 6, 7, 9, 10, 11],
    note: label(
      "Đánh dấu ngay khi enqueue để một node không bị đưa vào queue nhiều lần. distance[start]=0 và parent[start] chưa có.",
      "Mark a node when it is enqueued so it cannot enter the queue twice. distance[start]=0 and start has no parent.",
    ),
  });

  let found = false;
  while (head < queue.length) {
    const node = queue[head++];
    snapshot({
      phase: "dequeue",
      current: node,
      title: label(`Dequeue ${names[node]} (d=${distance[node]})`, `Dequeue ${names[node]} (d=${distance[node]})`),
      codeLines: [12, 13],
      note: label(
        "Queue FIFO luôn lấy node có khoảng cách nhỏ nhất chưa mở rộng. Các node còn lại trong queue nằm ở cùng lớp hoặc lớp kế tiếp.",
        "The FIFO queue always removes the closest unexpanded node. Remaining nodes are in the same or next distance layer.",
      ),
    });

    if (node === targetId) {
      found = true;
      snapshot({
        phase: "found",
        current: node,
        reason: "target",
        title: label(`Đã dequeue target ${target}`, `Dequeued target ${target}`),
        codeLines: [14],
        note: label(
          "Đây là lần đầu target được lấy khỏi queue, nên parent chain của nó chắc chắn có ít cạnh nhất.",
          "This is the first time the target leaves the queue, so its parent chain has the fewest possible edges.",
        ),
      });
      break;
    }

    for (const next of adjacency[node]) {
      snapshot({
        phase: "inspect",
        current: node,
        neighbor: next,
        edge: [node, next],
        reason: discovered.has(next) ? "already-discovered" : "unseen",
        title: label(`Xét cạnh ${names[node]} — ${names[next]}`, `Inspect edge ${names[node]} — ${names[next]}`),
        codeLines: [15, 16],
        note: discovered.has(next)
          ? label(`${names[next]} đã có distance=${distance[next]}, nên bỏ qua để giữ parent đầu tiên (ngắn nhất).`, `${names[next]} already has distance=${distance[next]}, so keep its first—and shortest—parent.`)
          : label(`${names[next]} chưa được phát hiện; gán parent và distance trước khi enqueue.`, `${names[next]} is unseen; assign its parent and distance before enqueueing it.`),
      });
      if (discovered.has(next)) continue;
      discovered.add(next);
      parent[next] = node;
      distance[next] = distance[node] + 1;
      queue.push(next);
      snapshot({
        phase: "enqueue",
        current: node,
        neighbor: next,
        edge: [node, next],
        reason: "new-node",
        title: label(`Enqueue ${names[next]} với d=${distance[next]}`, `Enqueue ${names[next]} with d=${distance[next]}`),
        codeLines: [17, 18, 19],
        note: label(
          `parent[${names[next]}]=${names[node]}. Cạnh này trở thành cạnh cây BFS dùng để dựng đường đi cuối.`,
          `parent[${names[next]}]=${names[node]}. This becomes a BFS-tree edge used for final reconstruction.`,
        ),
      });
    }
    expanded.add(node);
    snapshot({
      phase: "expanded",
      title: label(`Mở rộng xong ${names[node]}`, `Finished expanding ${names[node]}`),
      codeLines: [12],
      note: label(
        "Node chuyển từ đang xét sang expanded. Queue đã chứa toàn bộ neighbor mới theo đúng thứ tự FIFO.",
        "The node moves to expanded. Every newly found neighbor is now in FIFO order in the queue.",
      ),
    });
  }

  const path = [];
  if (found) {
    for (let node = targetId; node !== -1; node = parent[node]) path.push(node);
    path.reverse();
  }
  snapshot({
    phase: "done",
    path,
    final: true,
    title: path.length
      ? label(`Shortest path: ${path.map((id) => names[id]).join(" → ")}`, `Shortest path: ${path.map((id) => names[id]).join(" → ")}`)
      : label(`Không có đường từ ${start} tới ${target}`, `No path from ${start} to ${target}`),
    codeLines: path.length ? [22, 23, 24, 25, 26] : [20, 21],
    note: path.length
      ? label(`Đi ngược parent từ target rồi đảo lại. Đường có ${path.length - 1} cạnh; BFS đảm bảo không tồn tại đường ngắn hơn.`, `Follow parents backward from the target, then reverse. The path has ${path.length - 1} edges, and BFS guarantees no shorter path exists.`)
      : label("Queue đã rỗng mà target chưa từng được dequeue, nên target không reachable từ start.", "The queue emptied before the target was dequeued, so the target is unreachable from the start."),
  });

  return { original: edges, answer: path.map((id) => names[id]), steps };
}

// ─── #9001: make the existing lazy-heap trace easier to render ───────────────

function buildSteps9001Easy(input, params = {}) {
  const result = HEAP[9001].builder(input, params);
  for (const step of result.steps || []) {
    if (!step.profitTrackerView) {
      step.profitTrackerView = {
        invalid: true,
        operations: Array.isArray(input) ? input.map((op, index) => ({ op: String(op), name: "", delta: 0, index })) : [],
        activeIndex: -1,
        phase: "invalid",
        totals: [],
        heap: [],
        result: [],
        action: { type: "invalid" },
      };
    }
    const view = step.profitTrackerView;
    view.tieRule = label("Profit lớn hơn trước; nếu bằng nhau, tên alphabet nhỏ hơn trước.", "Higher profit first; ties use the alphabetically smaller name.");
    view.heap = (view.heap || []).map((entry) => ({
      ...entry,
      key: `(${-entry.profit}, '${entry.name}')`,
      parentIndex: entry.index === 0 ? null : Math.floor((entry.index - 1) / 2),
      leftIndex: 2 * entry.index + 1 < view.heap.length ? 2 * entry.index + 1 : null,
      rightIndex: 2 * entry.index + 2 < view.heap.length ? 2 * entry.index + 2 : null,
      level: Math.floor(Math.log2(entry.index + 1)),
    }));
  }
  return result;
}

// ─── #9013: Perfect-Square Arrangement ──────────────────────────────────────

function buildSteps9013Easy(input) {
  const n = Array.isArray(input) ? Number(input[0]) : Number(input);
  if (!Number.isInteger(n) || n < 1 || n > 16) throw new Error("n phải là số nguyên từ 1 đến 16");
  const isSquare = (value) => Number.isInteger(Math.sqrt(value));
  const values = Array.from({ length: n }, (_, index) => index + 1);
  const adjacency = new Map(values.map((value) => [
    value,
    values.filter((other) => other !== value && isSquare(value + other)),
  ]));
  const allEdges = values.flatMap((value) => adjacency.get(value)
    .filter((other) => value < other)
    .map((other) => ({ u: value, v: other, sum: value + other, root: Math.sqrt(value + other) })));
  const path = [];
  const used = new Set();
  const steps = [];
  const TRACE_LIMIT = 180;
  let attempts = 0;
  let backtracks = 0;
  let omitted = 0;
  let solution = null;

  const ordered = (items) => [...items].sort((a, b) => adjacency.get(a).length - adjacency.get(b).length || a - b);

  function snapshot(options) {
    if (steps.length >= TRACE_LIMIT && !options.final) {
      omitted++;
      return;
    }
    const candidates = options.candidates || [];
    const currentPath = [...path];
    const pathEdges = currentPath.slice(1).map((value, index) => [currentPath[index], value]);
    steps.push({
      title: options.title,
      arr: [],
      highlight: [],
      mark: [],
      final: Boolean(options.final),
      codeLines: options.codeLines || [],
      vars: [
        { name: "path", value: `[${currentPath.join(", ")}]` },
        { name: "depth", value: currentPath.length },
        { name: "candidates", value: `[${candidates.join(", ")}]` },
        { name: "attempts / backtracks", value: `${attempts} / ${backtracks}` },
      ],
      note: options.note,
      graph: {
        nodes: values.map((value) => ({ id: value, label: String(value), sub: `deg=${adjacency.get(value).length}` })),
        edges: allEdges.map((edge) => ({ ...edge, undirected: true, w: edge.sum })),
        hlNodes: options.focus ? [options.focus] : currentPath,
        hlEdges: options.edge ? [options.edge] : pathEdges,
        visitedNodes: currentPath,
        dimUnfocused: Boolean(options.final && solution),
        caption: label("Cạnh a—b tồn tại khi a+b là số chính phương", "Edge a—b exists when a+b is a perfect square"),
      },
      square9013View: {
        phase: options.phase,
        n,
        nodes: values.map((value) => ({
          value,
          degree: adjacency.get(value).length,
          state: currentPath.includes(value) ? "path" : candidates.includes(value) ? "candidate" : used.has(value) ? "used" : "available",
        })),
        edges: allEdges.map((edge) => ({ ...edge, inPath: pathEdges.some(([a, b]) => (a === edge.u && b === edge.v) || (a === edge.v && b === edge.u)), current: options.edge ? options.edge.includes(edge.u) && options.edge.includes(edge.v) : false })),
        path: currentPath,
        candidates: [...candidates],
        focus: options.focus ?? null,
        attempted: options.attempted ?? null,
        attempts,
        backtracks,
        omitted,
        traceTruncated: omitted > 0,
        solution: options.final ? solution : null,
        reason: options.reason || null,
      },
    });
  }

  snapshot({
    phase: "graph",
    title: label("Dựng compatibility graph", "Build the compatibility graph"),
    codeLines: [2, 3, 4, 5, 6, 7],
    note: label(
      "Mỗi số là một node. Nhãn trên cạnh là tổng chính phương; arrangement cần đi qua mỗi node đúng một lần, tức Hamiltonian path.",
      "Each number is a node. Edge labels are square sums; an arrangement visits every node exactly once, so it is a Hamiltonian path.",
    ),
  });

  const isolated = n > 1 ? values.filter((value) => adjacency.get(value).length === 0) : [];
  function dfs(value) {
    attempts++;
    path.push(value);
    used.add(value);
    const candidates = ordered(adjacency.get(value).filter((next) => !used.has(next)));
    snapshot({
      phase: "choose",
      focus: value,
      candidates,
      title: label(`Chọn ${value} ở depth ${path.length}`, `Choose ${value} at depth ${path.length}`),
      codeLines: [10, 11, 12],
      note: label(
        candidates.length
          ? `Đường hiện tại hợp lệ. Ưu tiên candidate có degree nhỏ: [${candidates.join(", ")}], để nhánh khó được thử trước.`
          : "Không còn candidate chưa dùng từ node này.",
        candidates.length
          ? `The current path is valid. Try lower-degree candidates first: [${candidates.join(", ")}], so constrained branches fail early.`
          : "No unused candidate remains from this node.",
      ),
    });
    if (path.length === n) {
      solution = [...path];
      return true;
    }
    if (!candidates.length) {
      snapshot({
        phase: "dead-end",
        focus: value,
        candidates,
        reason: "no-candidate",
        title: label(`Dead end tại ${value}`, `Dead end at ${value}`),
        codeLines: [12],
        note: label("Path chưa đủ n node nhưng node cuối không còn neighbor hợp lệ; bắt buộc quay lui.", "The path is shorter than n but its last node has no legal neighbor, so backtracking is required."),
      });
    }
    for (const next of candidates) {
      snapshot({
        phase: "try",
        focus: value,
        attempted: next,
        candidates,
        edge: [value, next],
        title: label(`Thử ${value} → ${next}`, `Try ${value} → ${next}`),
        codeLines: [13, 14],
        note: label(`${value}+${next}=${value + next}=${Math.sqrt(value + next)}², nên có thể nối.`, `${value}+${next}=${value + next}=${Math.sqrt(value + next)}², so this edge is legal.`),
      });
      if (dfs(next)) return true;
    }
    used.delete(value);
    path.pop();
    backtracks++;
    snapshot({
      phase: "backtrack",
      focus: value,
      candidates,
      reason: "branch-failed",
      title: label(`Backtrack: đã bỏ ${value}`, `Backtrack: removed ${value}`),
      codeLines: [15],
      note: label("Mọi candidate phía sau đều thất bại. Node cuối đã được bỏ khỏi path; depth trước sẽ thử lựa chọn tiếp theo.", "Every continuation failed. The last node is now removed, so the previous depth can try its next choice."),
    });
    return false;
  }

  if (!isolated.length) {
    for (const start of ordered(values)) {
      snapshot({
        phase: "start",
        attempted: start,
        candidates: ordered(values.filter((value) => !used.has(value))),
        title: label(`Thử start = ${start}`, `Try start = ${start}`),
        codeLines: [17, 18],
        note: label(`Node ${start} có degree ${adjacency.get(start).length}; thử các start theo degree tăng dần.`, `Node ${start} has degree ${adjacency.get(start).length}; starts are tried in ascending degree order.`),
      });
      if (dfs(start)) break;
    }
  }

  snapshot({
    phase: "done",
    final: true,
    reason: isolated.length ? `isolated:${isolated.join(",")}` : solution ? "solution" : "exhausted",
    title: solution
      ? label(`Arrangement: [${solution.join(", ")}]`, `Arrangement: [${solution.join(", ")}]`)
      : label(`Không có arrangement cho n=${n}`, `No arrangement for n=${n}`),
    codeLines: solution ? [19] : [20],
    note: solution
      ? label(
        `Path dùng đủ ${n} node; mỗi cạnh đều có tổng chính phương.${omitted ? ` Đã ẩn ${omitted} state tìm kiếm để trace gọn hơn.` : ""}`,
        `The path uses all ${n} nodes and every edge has a square sum.${omitted ? ` ${omitted} search states were hidden to keep the trace readable.` : ""}`,
      )
      : isolated.length
        ? label(`Node [${isolated.join(", ")}] có degree 0 nên không thể nằm trong path dài hơn 1.`, `Node(s) [${isolated.join(", ")}] have degree 0, so they cannot belong to a path longer than one.`)
        : label(`Đã thử hết các start và nhánh hợp lệ.${omitted ? ` Trace đã ẩn ${omitted} state.` : ""}`, `All starts and legal branches were exhausted.${omitted ? ` The trace hid ${omitted} states.` : ""}`),
  });
  return { original: [n], answer: solution || [], steps };
}

// ─── #9014: Loyal Customers from Daily Logs ─────────────────────────────────

function parseDailyLogs9014(input) {
  const parts = String(input ?? "").split("||");
  if (parts.length !== 2 || parts.some((part) => !part.trim())) {
    throw new Error("Nhập đúng hai ngày theo dạng day1||day2");
  }
  return parts.map((part, day) => {
    const rawEntries = part.split(",");
    if (rawEntries.length > 80 || rawEntries.some((entry) => !entry.trim())) throw new Error(`Day ${day + 1} cần 1–80 records không rỗng`);
    return rawEntries.map((entry) => {
      const fields = entry.split(":");
      if (fields.length !== 2) throw new Error("Mỗi record phải có đúng dạng user:video");
      const user = fields[0].trim();
      const video = fields[1].trim();
      if (!user || !video || user.length > 40 || video.length > 40) throw new Error("user và video phải dài từ 1 đến 40 ký tự");
      return [user, video];
    });
  });
}

function buildSteps9014Easy(input) {
  const days = parseDailyLogs9014(input);
  const perDay = [new Map(), new Map()];
  const allVideos = new Map();
  const records = days.flatMap((entries, day) => entries.map(([user, video], index) => ({ day, index, user, video })));
  const steps = [];
  let processed = 0;

  const ensure = (map, user) => {
    if (!map.has(user)) map.set(user, new Set());
    return map.get(user);
  };
  const userRows = () => [...new Set([...perDay[0].keys(), ...perDay[1].keys(), ...allVideos.keys()])]
    .sort((a, b) => a.localeCompare(b))
    .map((user) => {
      const day1 = [...(perDay[0].get(user) || [])].sort();
      const day2 = [...(perDay[1].get(user) || [])].sort();
      const union = [...(allVideos.get(user) || [])].sort();
      const presentBoth = perDay[0].has(user) && perDay[1].has(user);
      const qualifies = presentBoth && union.length >= 2;
      const reason = !perDay[0].has(user) ? "missing-day-1"
        : !perDay[1].has(user) ? "missing-day-2"
          : union.length < 2 ? "needs-two-distinct" : "loyal";
      return { user, day1, day2, union, presentBoth, distinctCount: union.length, qualifies, reason };
    });

  function snapshot(options) {
    const users = userRows();
    steps.push({
      title: options.title,
      arr: [],
      highlight: [],
      mark: [],
      final: Boolean(options.final),
      codeLines: options.codeLines || [],
      vars: [
        { name: "processed", value: `${processed}/${records.length}` },
        { name: "users", value: users.length },
        { name: "loyal so far", value: `[${users.filter((row) => row.qualifies).map((row) => row.user).join(", ")}]` },
      ],
      note: options.note,
      loyal9014View: {
        phase: options.phase,
        records: records.map((record, index) => ({ ...record, state: index === options.recordIndex ? "current" : index < processed ? "done" : "pending" })),
        processed,
        current: Number.isInteger(options.recordIndex) ? records[options.recordIndex] : null,
        activeUser: options.activeUser || null,
        users,
        answer: options.final ? users.filter((row) => row.qualifies).map((row) => row.user) : null,
      },
    });
  }

  snapshot({
    phase: "init",
    title: label("Hai ngày, ba điều kiện", "Two days, three conditions"),
    codeLines: [3, 4],
    note: label("Mỗi user cần: có record ở ngày 1, có record ở ngày 2, và union của video ở cả hai ngày có ít nhất 2 video khác nhau.", "Each user needs a day-1 record, a day-2 record, and at least two distinct videos in the union across both days."),
  });

  for (let recordIndex = 0; recordIndex < records.length; recordIndex++) {
    const record = records[recordIndex];
    ensure(perDay[record.day], record.user).add(record.video);
    ensure(allVideos, record.user).add(record.video);
    processed = recordIndex + 1;
    snapshot({
      phase: "ingest",
      recordIndex,
      activeUser: record.user,
      title: label(`Ngày ${record.day + 1}: ${record.user} xem ${record.video}`, `Day ${record.day + 1}: ${record.user} watched ${record.video}`),
      codeLines: [5, 6, 7, 8],
      note: label("Set tự loại view trùng. Bảng bên dưới cập nhật riêng hai ngày và union distinct ngay sau record này.", "Sets remove duplicate views. The table updates each day and the distinct union immediately after this record."),
    });
  }

  const users = userRows();
  for (const row of users) {
    snapshot({
      phase: "evaluate",
      activeUser: row.user,
      title: row.qualifies
        ? label(`${row.user}: PASS cả 3 điều kiện`, `${row.user}: PASS all 3 conditions`)
        : label(`${row.user}: không đủ điều kiện`, `${row.user}: does not qualify`),
      codeLines: [9, 10, 11, 12],
      note: row.qualifies
        ? label(`${row.user} có mặt cả hai ngày và có ${row.distinctCount} video distinct.`, `${row.user} appears on both days and has ${row.distinctCount} distinct videos.`)
        : row.reason === "missing-day-1"
          ? label(`${row.user} thiếu ngày 1.`, `${row.user} is missing day 1.`)
          : row.reason === "missing-day-2"
            ? label(`${row.user} thiếu ngày 2.`, `${row.user} is missing day 2.`)
            : label(`${row.user} có mặt cả hai ngày nhưng chỉ có ${row.distinctCount} video distinct.`, `${row.user} appears on both days but has only ${row.distinctCount} distinct video(s).`),
    });
  }

  const loyal = users.filter((row) => row.qualifies).map((row) => row.user);
  snapshot({
    phase: "done",
    final: true,
    title: label(`Loyal customers: [${loyal.join(", ")}]`, `Loyal customers: [${loyal.join(", ")}]`),
    codeLines: [13],
    note: label("Kết quả được sắp alphabet. Với file rất lớn, stream rồi hash-partition theo user; điều kiện lọc vẫn giữ nguyên.", "The answer is alphabetically sorted. For huge files, stream and hash-partition by user; the same filter still applies."),
  });
  return { original: days, answer: loyal, steps };
}

// ─── #9015: Interval Overlap Counter ────────────────────────────────────────

function parseIntervals9015(input) {
  const raw = String(input ?? "").trim();
  if (!raw) throw new Error("intervals không được rỗng");
  let intervals;
  if (raw.startsWith("[")) {
    try {
      intervals = JSON.parse(raw);
    } catch (_error) {
      throw new Error("JSON intervals phải có dạng [[1,5],[2,6]]");
    }
  } else {
    const number = "(-?(?:\\d+(?:\\.\\d+)?|\\.\\d+))";
    const pattern = new RegExp(`^\\s*${number}\\s*-\\s*${number}\\s*$`);
    intervals = raw.split(",").map((part) => {
      const match = part.match(pattern);
      if (!match) throw new Error("Mỗi interval dạng start-end; dùng JSON để nhập format khác");
      return [Number(match[1]), Number(match[2])];
    });
  }
  if (!Array.isArray(intervals) || intervals.length < 1 || intervals.length > 40
    || intervals.some((interval) => !Array.isArray(interval) || interval.length !== 2
      || interval.some((value) => !Number.isFinite(value)) || interval[0] > interval[1])) {
    throw new Error("Cần 1–40 intervals [start,end] với start ≤ end");
  }
  return intervals.map(([start, end]) => [start, end]);
}

function buildSteps9015Easy(input) {
  const intervals = parseIntervals9015(input);
  const events = intervals.flatMap(([start, end], id) => [
    { time: start, delta: 1, id, kind: "start" },
    { time: end, delta: -1, id, kind: "end" },
  ]).sort((a, b) => a.time - b.time || b.delta - a.delta || a.id - b.id);
  const active = new Set();
  const steps = [];
  let overlapPairs = 0;
  let maxActive = 0;

  function snapshot(options) {
    const currentIndex = Number.isInteger(options.eventIndex) ? options.eventIndex : -1;
    steps.push({
      title: options.title,
      arr: [],
      highlight: [],
      mark: [],
      final: Boolean(options.final),
      codeLines: options.codeLines || [],
      vars: [
        { name: "event", value: options.event ? `${options.event.kind}@${options.event.time} (#${options.event.id})` : "—" },
        { name: "active", value: `{${[...active].map((id) => `#${id}`).join(", ")}}` },
        { name: "overlap pairs", value: overlapPairs },
        { name: "peak", value: maxActive },
      ],
      note: options.note,
      sweep9015View: {
        phase: options.phase,
        intervals: intervals.map(([start, end], id) => ({ id, start, end, active: active.has(id), current: options.event?.id === id })),
        events: events.map((event, index) => ({ ...event, state: index < currentIndex ? "done" : index === currentIndex ? "current" : "pending" })),
        eventIndex: currentIndex,
        currentEvent: options.event || null,
        activeBefore: options.activeBefore || [],
        activeAfter: [...active],
        newPairs: options.newPairs || [],
        overlapPairs,
        maxActive,
        answer: options.final ? { overlapPairs, maxAtAnyTime: maxActive } : null,
      },
    });
  }

  snapshot({
    phase: "init",
    title: label("Sắp xếp 2n events", "Sort the 2n events"),
    codeLines: [2, 3, 4, 5],
    note: label("Đây là closed intervals: tại cùng thời điểm, START đứng trước END. Vì vậy [1,2] và [2,3] được tính là overlap tại t=2.", "These are closed intervals: at the same time, START comes before END, so [1,2] and [2,3] overlap at t=2."),
  });

  for (let eventIndex = 0; eventIndex < events.length; eventIndex++) {
    const event = events[eventIndex];
    const activeBefore = [...active];
    let newPairs = [];
    if (event.kind === "start") {
      newPairs = activeBefore.map((other) => [other, event.id]);
      overlapPairs += activeBefore.length;
      active.add(event.id);
      maxActive = Math.max(maxActive, active.size);
      snapshot({
        phase: "start",
        eventIndex,
        event,
        activeBefore,
        newPairs,
        title: label(`START #${event.id} tại ${event.time}: +${newPairs.length} pair`, `START #${event.id} at ${event.time}: +${newPairs.length} pair(s)`),
        codeLines: [7, 8, 9, 10],
        note: label(`Trước khi thêm #${event.id}, có ${activeBefore.length} interval active. Nó overlap với từng interval đó, nên pairs += ${activeBefore.length}.`, `Before adding #${event.id}, ${activeBefore.length} interval(s) are active. It overlaps each one, so pairs += ${activeBefore.length}.`),
      });
    } else {
      active.delete(event.id);
      snapshot({
        phase: "end",
        eventIndex,
        event,
        activeBefore,
        title: label(`END #${event.id} tại ${event.time}`, `END #${event.id} at ${event.time}`),
        codeLines: [11, 12],
        note: label(`#${event.id} rời active set sau thời điểm ${event.time}. Không tạo pair mới tại END.`, `#${event.id} leaves the active set after time ${event.time}. END creates no new pair.`),
      });
    }
  }

  const answer = { overlapPairs, maxAtAnyTime: maxActive };
  snapshot({
    phase: "done",
    final: true,
    title: label(`Pairs=${overlapPairs}; peak=${maxActive}`, `Pairs=${overlapPairs}; peak=${maxActive}`),
    codeLines: [13],
    note: label("Mỗi cặp được đếm đúng một lần: khi interval bắt đầu sau được thêm vào. Peak là kích thước active set lớn nhất.", "Each pair is counted exactly once when its later-starting interval enters. The peak is the largest active-set size."),
  });
  return { original: intervals, answer, steps };
}

// ─── #9016: Movie-History Friends with real m-of-k matching ─────────────────

function parseHistories9016(input, k) {
  const parts = String(input ?? "").split("|");
  if (parts.length < 1 || parts.length > 30 || parts.some((part) => !part.trim())) throw new Error("Cần 1–30 user histories không rỗng");
  const seenUsers = new Set();
  return parts.map((part) => {
    const fields = part.split(":");
    if (fields.length !== 2) throw new Error("Mỗi history phải có đúng dạng User:movie1,movie2,...");
    const user = fields[0].trim();
    const rawMovies = fields[1].split(",");
    const movies = rawMovies.map((movie) => movie.trim());
    if (!user || user.length > 40 || movies.length > 60 || movies.some((movie) => !movie || movie.length > 40)) throw new Error("User/movie phải dài từ 1 đến 40 ký tự; mỗi user tối đa 60 movie không rỗng");
    if (seenUsers.has(user)) throw new Error(`User ${user} xuất hiện nhiều lần`);
    if (movies.length < k) throw new Error(`${user} chỉ có ${movies.length} movie, ít hơn k=${k}`);
    seenUsers.add(user);
    return { user, movies, window: movies.slice(-k) };
  });
}

function buildSteps9016Easy(input, params = {}) {
  const k = Number(params.k);
  const m = Number(params.m);
  if (!Number.isInteger(k) || !Number.isInteger(m) || k < 1 || k > 20 || m < 1 || m > k) throw new Error("Cần 1 ≤ m ≤ k ≤ 20");
  const histories = parseHistories9016(input, k).sort((a, b) => a.user.localeCompare(b.user));
  const buckets = new Map();
  const pairMatches = new Map();
  const steps = [];
  const results = [];
  const PAIR_TRACE_LIMIT = 24;
  let omittedPairSteps = 0;

  const pairKey = (a, b) => a < b ? `${a}:${b}` : `${b}:${a}`;
  const pairRows = () => [...pairMatches.entries()].map(([key, positions]) => {
    const [a, b] = key.split(":").map(Number);
    const sortedPositions = [...positions].sort((x, y) => x - y);
    return {
      a,
      b,
      left: histories[a].user,
      right: histories[b].user,
      positions: sortedPositions,
      movies: sortedPositions.map((position) => histories[a].window[position]),
      count: sortedPositions.length,
      qualifies: sortedPositions.length >= m,
    };
  }).sort((x, y) => x.left.localeCompare(y.left) || x.right.localeCompare(y.right));
  const bucketRows = () => [...buckets.entries()].map(([key, users]) => {
    const separator = key.indexOf("\u0000");
    return { position: Number(key.slice(0, separator)), movie: key.slice(separator + 1), users: users.map((index) => histories[index].user) };
  }).sort((a, b) => a.position - b.position || a.movie.localeCompare(b.movie));

  function snapshot(options) {
    const allBuckets = bucketRows();
    const allPairs = pairRows();
    let visiblePairs = [];
    if (options.phase === "evaluate" && options.activePair) {
      const [left, right] = options.activePair;
      const activePair = allPairs.find((pair) => pair.a === left && pair.b === right);
      if (activePair) visiblePairs = [activePair];
    } else if (options.phase === "done") {
      visiblePairs = allPairs.filter((pair) => pair.qualifies).slice(0, 80);
    }
    const visibleResults = results.slice(0, 80).map((pair) => [...pair]);
    steps.push({
      title: options.title,
      arr: [],
      highlight: [],
      mark: [],
      final: Boolean(options.final),
      codeLines: options.codeLines || [],
      vars: [
        { name: "k / m", value: `${k} / ${m}` },
        { name: "candidate pairs", value: pairMatches.size },
        { name: "accepted", value: results.length },
      ],
      note: options.note,
      friends9016View: {
        phase: options.phase,
        k,
        m,
        histories: histories.map((history, index) => ({
          user: history.user,
          index,
          window: [...history.window],
          olderCount: history.movies.length - history.window.length,
          active: index === options.activeUser,
        })),
        buckets: allBuckets.slice(0, 30),
        omittedBuckets: Math.max(0, allBuckets.length - 30),
        pairs: visiblePairs,
        pairTotal: allPairs.length,
        omittedPairs: Math.max(0, allPairs.filter((pair) => pair.qualifies).length - visiblePairs.length),
        activeUser: options.activeUser ?? null,
        activePair: options.activePair || null,
        results: visibleResults,
        omittedResults: Math.max(0, results.length - visibleResults.length),
        omittedPairSteps,
        answer: options.final ? results.map((pair) => [...pair]) : null,
      },
    });
  }

  snapshot({
    phase: "init",
    title: label(`So khớp ít nhất ${m}/${k} vị trí`, `Match at least ${m}/${k} positions`),
    codeLines: [3, 4],
    note: label("Quy ước rõ ràng: so hai cửa sổ last-k theo cùng vị trí; một match khi movie ở vị trí đó giống nhau. Inverted index (vị trí, movie) sinh candidate mà không so mọi cặp từ đầu.", "Precise rule: compare the two last-k windows position by position; a match means the same movie at that position. An inverted (position, movie) index creates candidates without initially comparing every pair."),
  });

  for (let userIndex = 0; userIndex < histories.length; userIndex++) {
    const history = histories[userIndex];
    for (let position = 0; position < k; position++) {
      const movie = history.window[position];
      const key = `${position}\u0000${movie}`;
      const priorUsers = buckets.get(key) || [];
      for (const other of priorUsers) {
        const keyForPair = pairKey(other, userIndex);
        if (!pairMatches.has(keyForPair)) pairMatches.set(keyForPair, new Set());
        pairMatches.get(keyForPair).add(position);
      }
      priorUsers.push(userIndex);
      buckets.set(key, priorUsers);
    }
    snapshot({
      phase: "index",
      activeUser: userIndex,
      title: label(`${history.user}: index last-${k}`, `${history.user}: index last-${k}`),
      codeLines: [5, 6, 7, 8, 9, 10, 11],
      note: label(`Cửa sổ [${history.window.join(", ")}]. Mỗi slot được thêm vào bucket (position, movie); user đã có trong bucket tạo thêm một vị trí match cho pair.`, `Window [${history.window.join(", ")}]. Each slot enters a (position, movie) bucket; prior users in that bucket gain one matching position with this user.`),
    });
  }

  const allPairRows = pairRows();
  for (let pairIndex = 0; pairIndex < allPairRows.length; pairIndex++) {
    const row = allPairRows[pairIndex];
    if (row.qualifies) results.push([row.left, row.right]);
    if (pairIndex >= PAIR_TRACE_LIMIT) {
      omittedPairSteps++;
      continue;
    }
    snapshot({
      phase: "evaluate",
      activePair: [row.a, row.b],
      title: row.qualifies
        ? label(`${row.left} — ${row.right}: PASS ${row.count}/${k}`, `${row.left} — ${row.right}: PASS ${row.count}/${k}`)
        : label(`${row.left} — ${row.right}: ${row.count}/${k}, cần ${m}`, `${row.left} — ${row.right}: ${row.count}/${k}, need ${m}`),
      codeLines: [12, 13, 14],
      note: label(`Các vị trí khớp: [${row.positions.join(", ")}]. ${row.qualifies ? "Đủ threshold nên emit pair." : "Chưa đủ threshold nên loại."}`, `Matching positions: [${row.positions.join(", ")}]. ${row.qualifies ? "The threshold is met, so emit the pair." : "The threshold is not met, so reject it."}`),
    });
  }

  results.sort((a, b) => a[0].localeCompare(b[0]) || a[1].localeCompare(b[1]));
  snapshot({
    phase: "done",
    final: true,
    title: label(`Friend pairs: ${results.map((pair) => pair.join("—")).join(", ") || "∅"}`, `Friend pairs: ${results.map((pair) => pair.join("—")).join(", ") || "∅"}`),
    codeLines: [15],
    note: omittedPairSteps
      ? label(`m=${m} thực sự tham gia điều kiện. Đã ẩn ${omittedPairSteps} bước kiểm tra pair để trace gọn; toàn bộ ${allPairRows.length} candidate vẫn được tính.`, `m=${m} is part of the actual condition. ${omittedPairSteps} pair-check steps were hidden for readability; all ${allPairRows.length} candidates were still computed.`)
      : label(`m=${m} thực sự tham gia điều kiện. Output có thể O(users²), điều không tránh được nếu mọi pair đều phải được trả ra.`, `m=${m} is part of the actual condition. Output can be O(users²), which is unavoidable when every matching pair must be returned.`),
  });
  return { original: histories.map(({ user, movies }) => ({ user, list: movies })), answer: results, steps };
}

// ─── #9017: Ad Promotion Metrics with event-id idempotency ──────────────────

function parseAdEvents9017(input) {
  const parts = String(input ?? "").split("|");
  if (parts.length < 1 || parts.length > 80 || parts.some((part) => !part.trim())) throw new Error("Cần 1–80 events không rỗng");
  return parts.map((part) => {
    const fields = part.split(":").map((value) => value.trim());
    if (fields.length !== 5) throw new Error("Mỗi event phải có dạng eventId:type:campaign:user:cost");
    const [eventId, type, campaign, user, rawCost] = fields;
    const cost = Number(rawCost);
    if (!eventId || !campaign || !user || !["impression", "click", "conversion"].includes(type)
      || rawCost === "" || !Number.isFinite(cost) || cost < 0
      || [eventId, campaign, user].some((value) => value.length > 50)) {
      throw new Error("eventId/campaign/user phải hợp lệ, type phải là impression|click|conversion, cost phải ≥ 0");
    }
    return { eventId, type, campaign, user, cost };
  });
}

function buildSteps9017Easy(input) {
  const events = parseAdEvents9017(input);
  const metrics = new Map();
  const seen = new Set();
  const processed = [];
  const steps = [];

  const ensure = (campaign) => {
    if (!metrics.has(campaign)) {
      metrics.set(campaign, { impressions: 0, clicks: 0, conversions: 0, spend: 0, users: new Set() });
    }
    return metrics.get(campaign);
  };
  const campaignRows = () => [...metrics.entries()].sort((a, b) => a[0].localeCompare(b[0])).map(([campaign, value]) => ({
    campaign,
    impressions: value.impressions,
    clicks: value.clicks,
    conversions: value.conversions,
    spend: Number(value.spend.toFixed(2)),
    reach: value.users.size,
    ctr: value.impressions ? Number((value.clicks / value.impressions).toFixed(4)) : 0,
    cvr: value.clicks ? Number((value.conversions / value.clicks).toFixed(4)) : 0,
    warning: value.clicks > value.impressions ? "clicks-exceed-impressions"
      : value.conversions > value.clicks ? "conversions-exceed-clicks" : null,
  }));

  function snapshot(options) {
    const campaigns = campaignRows();
    steps.push({
      title: options.title,
      arr: [],
      highlight: [],
      mark: [],
      final: Boolean(options.final),
      codeLines: options.codeLines || [],
      vars: [
        { name: "eventId", value: options.event?.eventId || "—" },
        { name: "seen IDs", value: seen.size },
        { name: "campaigns", value: campaigns.length },
        { name: "decision", value: options.decision || "—" },
      ],
      note: options.note,
      ads9017View: {
        phase: options.phase,
        events: events.map((event, index) => ({
          ...event,
          state: index < processed.length ? (processed[index] === "duplicate" ? "duplicate" : "accepted") : index === options.eventIndex ? "current" : "pending",
        })),
        eventIndex: options.eventIndex ?? -1,
        current: options.event || null,
        decision: options.decision || null,
        seenIds: [...seen],
        campaigns,
        answer: options.final ? Object.fromEntries(campaigns.map(({ campaign, warning, ...metricsForCampaign }) => [campaign, metricsForCampaign])) : null,
      },
    });
  }

  snapshot({
    phase: "init",
    title: label("Event stream → dedupe → aggregate", "Event stream → dedupe → aggregate"),
    codeLines: [1],
    note: label("eventId là idempotency key thực sự: retry giữ nguyên ID và bị bỏ qua; hai event khác nhau của cùng user vẫn được đếm nếu ID khác.", "eventId is the true idempotency key: a retry keeps the same ID and is skipped, while distinct events from the same user still count when their IDs differ."),
  });

  for (let eventIndex = 0; eventIndex < events.length; eventIndex++) {
    const event = events[eventIndex];
    snapshot({
      phase: "receive",
      eventIndex,
      event,
      decision: "checking",
      title: label(`Nhận ${event.eventId}: ${event.type}`, `Receive ${event.eventId}: ${event.type}`),
      codeLines: [2],
      note: label(`Kiểm tra eventId=${event.eventId} trong dedupe window trước khi thay đổi metric.`, `Check eventId=${event.eventId} in the dedupe window before changing any metric.`),
    });
    if (seen.has(event.eventId)) {
      processed.push("duplicate");
      snapshot({
        phase: "duplicate",
        eventIndex,
        event,
        decision: "duplicate",
        title: label(`Bỏ retry ${event.eventId}`, `Skip retry ${event.eventId}`),
        codeLines: [2, 3],
        note: label("ID đã tồn tại: không tăng counter, không cộng spend và không đổi reach. Đây mới là xử lý idempotent.", "The ID already exists: counters, spend, and reach remain unchanged. This is true idempotent processing."),
      });
      continue;
    }

    seen.add(event.eventId);
    const metric = ensure(event.campaign);
    metric.users.add(event.user);
    metric.spend += event.cost;
    if (event.type === "impression") metric.impressions++;
    else if (event.type === "click") metric.clicks++;
    else metric.conversions++;
    processed.push("accepted");
    snapshot({
      phase: "aggregate",
      eventIndex,
      event,
      decision: "accepted",
      title: label(`Accept ${event.eventId} → ${event.campaign}`, `Accept ${event.eventId} → ${event.campaign}`),
      codeLines: [4, 5, 6, 7, 8, 9, 10],
      note: label(`Tăng ${event.type}, cộng $${event.cost.toFixed(2)} spend và thêm ${event.user} vào exact reach set. Production có thể thay set bằng HyperLogLog.`, `Increment ${event.type}, add $${event.cost.toFixed(2)} spend, and add ${event.user} to the exact reach set. Production can replace the set with HyperLogLog.`),
    });
  }

  const campaigns = campaignRows();
  const answer = Object.fromEntries(campaigns.map(({ campaign, warning, ...metricsForCampaign }) => [campaign, metricsForCampaign]));
  snapshot({
    phase: "done",
    final: true,
    title: label("Tính CTR và CVR an toàn", "Compute safe CTR and CVR"),
    codeLines: [12, 13, 14],
    note: label("CTR=clicks/impressions và CVR=conversions/clicks; mẫu số 0 cho kết quả 0. Dedupe window thực tế cần TTL và lưu durable checkpoint.", "CTR=clicks/impressions and CVR=conversions/clicks; a zero denominator yields zero. A production dedupe window needs TTL and durable checkpoints."),
  });
  return { original: events, answer, steps };
}

module.exports = {
  9001: {
    ...HEAP[9001],
    tags: [
      { key: "heap", vi: "Heap / Hàng đợi ưu tiên", en: "Heap / Priority Queue" },
      { key: "hashmap", vi: "Hash Map", en: "Hash Map" },
    ],
    debugMode: "semantic",
    builder: buildSteps9001Easy,
  },
  9006: {
    ...INTERVIEW[9006],
    statement: label(
      "Dựng graph vô hướng từ danh sách cạnh và tìm đường ít cạnh nhất bằng BFS. Có thể nhập A-B,A-C hoặc JSON [[\"x,y,z\",\"x2,y2,z2\"]] cho node 3D.",
      "Build an undirected graph and find a minimum-edge path with BFS. Enter A-B,A-C, or JSON [[\"x,y,z\",\"x2,y2,z2\"]] for 3D node keys.",
    ),
    inputLabel: label("edges A-B (phẩy) hoặc JSON pairs", "A-B edges (comma-separated) or JSON pairs"),
    approach: [
      label("Bimap name↔id nén tên node thành index; adjacency vẫn là mảng nhanh.", "A name↔id bimap compresses node names into indices while adjacency stays array-based."),
      label("Queue FIFO duyệt theo lớp distance; đánh dấu ngay khi enqueue để không lặp node.", "A FIFO queue explores distance layers; mark nodes at enqueue time to avoid duplicates."),
      label("parent của lần phát hiện đầu tiên tạo cây BFS và dựng lại shortest path.", "The first-discovery parent forms a BFS tree and reconstructs the shortest path."),
    ],
    code: [
      "from collections import defaultdict, deque",
      "",
      "def shortest_path(edges, start, target):",
      "    graph = defaultdict(list)",
      "    for left, right in edges:",
      "        graph[left].append(right)",
      "        graph[right].append(left)",
      "",
      "    queue = deque([start])",
      "    parent = {start: None}",
      "    distance = {start: 0}",
      "    while queue:",
      "        node = queue.popleft()",
      "        if node == target: break",
      "        for nxt in graph[node]:",
      "            if nxt in parent: continue",
      "            parent[nxt] = node",
      "            distance[nxt] = distance[node] + 1",
      "            queue.append(nxt)",
      "    if target not in parent:",
      "        return []",
      "    path = []",
      "    while target is not None:",
      "        path.append(target)",
      "        target = parent[target]",
      "    return path[::-1]",
    ],
    debugMode: "semantic",
    liveArgs: (input, params) => [parseEdges9006(input), String(params.start).trim(), String(params.target).trim()],
    builder: buildSteps9006Easy,
  },
  9013: {
    ...INTERVIEW[9013],
    approach: [
      label("Dựng compatibility graph: cạnh a—b có nhãn a+b khi tổng là số chính phương.", "Build a compatibility graph: edge a—b is labeled a+b when the sum is a perfect square."),
      label("DFS giữ một Hamiltonian path; legal-next chips chỉ gồm neighbor chưa dùng.", "DFS maintains a Hamiltonian path; legal-next chips contain only unused neighbors."),
      label("Ưu tiên degree nhỏ để fail sớm; dead end hiện rõ lý do rồi backtrack một cấp.", "Try lower-degree nodes first to fail early; each dead end explains why before backtracking one level."),
    ],
    code: [
      "def arrange(n):",
      "    is_square = lambda x: int(x ** 0.5) ** 2 == x",
      "    values = list(range(1, n + 1))",
      "    graph = {value: [] for value in values}",
      "    for a in values:",
      "        for b in values:",
      "            if a != b and is_square(a + b): graph[a].append(b)",
      "    path, used = [], set()",
      "    def dfs(value):",
      "        path.append(value); used.add(value)",
      "        if len(path) == n: return True",
      "        candidates = sorted((x for x in graph[value] if x not in used), key=lambda x: (len(graph[x]), x))",
      "        for nxt in candidates:",
      "            if dfs(nxt): return True",
      "        used.remove(value); path.pop()",
      "        return False",
      "    starts = sorted(values, key=lambda x: (len(graph[x]), x))",
      "    for start in starts:",
      "        if dfs(start): return path",
      "    return []",
    ],
    debugMode: "semantic",
    builder: buildSteps9013Easy,
  },
  9014: {
    ...INTERVIEW[9014],
    approach: [
      label("Hai per-day map trả lời user có xuất hiện ở cả ngày 1 và ngày 2 hay không.", "Two per-day maps tell whether a user appears on both day 1 and day 2."),
      label("Một union set theo user đếm video distinct qua cả hai ngày và tự loại record lặp.", "One union set per user counts distinct videos across both days and removes duplicate records."),
      label("Bảng đánh giá hiển thị riêng từng điều kiện PASS/FAIL; file lớn có thể hash-partition theo user.", "The evaluation table shows every PASS/FAIL condition; huge files can be hash-partitioned by user."),
    ],
    code: [
      "from collections import defaultdict",
      "def loyal(day1, day2):",
      "    per_day = [defaultdict(set), defaultdict(set)]",
      "    all_videos = defaultdict(set)",
      "    for day, records in enumerate([day1, day2]):",
      "        for user, video in records:",
      "            per_day[day][user].add(video)",
      "            all_videos[user].add(video)",
      "    answer = []",
      "    for user in sorted(all_videos):",
      "        if user in per_day[0] and user in per_day[1] and len(all_videos[user]) >= 2:",
      "            answer.append(user)",
      "    return answer",
    ],
    debugMode: "semantic",
    builder: buildSteps9014Easy,
  },
  9015: {
    ...INTERVIEW[9015],
    inputLabel: label("interval start-end hoặc JSON [[start,end], ...]", "start-end intervals or JSON [[start,end], ...]"),
    approach: [
      label("Tạo START và END cho mỗi closed interval; cùng thời điểm thì START đứng trước END.", "Create START and END events for every closed interval; START precedes END at equal times."),
      label("Khi START tới, interval mới overlap với toàn bộ active set: pairs += active.size.", "At START, the new interval overlaps the entire active set: pairs += active.size."),
      label("Timeline giữ identity của active intervals; peak là active-set size lớn nhất.", "The timeline retains active interval identities; peak is the largest active-set size."),
    ],
    code: [
      "def overlaps(intervals):",
      "    events = []",
      "    for interval_id, (start, end) in enumerate(intervals):",
      "        events += [(start, 1, interval_id), (end, -1, interval_id)]",
      "    events.sort(key=lambda event: (event[0], -event[1], event[2]))",
      "    active, pairs, peak = set(), 0, 0",
      "    for time, delta, interval_id in events:",
      "        if delta == 1:",
      "            pairs += len(active)",
      "            active.add(interval_id); peak = max(peak, len(active))",
      "        else:",
      "            active.remove(interval_id)",
      "    return pairs, peak",
    ],
    debugMode: "semantic",
    liveArgs: (input) => [parseIntervals9015(input)],
    builder: buildSteps9015Easy,
  },
  9016: {
    ...INTERVIEW[9016],
    statement: label(
      "Lấy cửa sổ last k của mỗi customer. Hai customer là friends khi có ít nhất m vị trí trong hai cửa sổ chứa cùng movie. Trả mọi pair.",
      "Take each customer's last-k window. Two customers are friends when at least m positions contain the same movie in both windows. Return every pair.",
    ),
    approach: [
      label("Cắt đúng last-k window và so movie theo cùng vị trí.", "Extract the exact last-k window and compare movies at matching positions."),
      label("Inverted index (position, movie) → users tăng match count cho candidate pairs.", "An inverted (position, movie) → users index increments match counts for candidate pairs."),
      label("Emit pair khi match count ≥ m; m=k tự nhiên trở thành exact last-k match.", "Emit a pair when match count ≥ m; m=k naturally becomes an exact last-k match."),
    ],
    complexity: {
      time: "O(users · k + candidate matches + output)",
      space: "O(users · k + candidate pairs)",
      note: label("Output vẫn có thể O(users²) khi nhiều lịch sử giống nhau.", "Output can still be O(users²) when many histories are similar."),
    },
    code: [
      "from collections import defaultdict",
      "def friends(histories, k, m):",
      "    index = defaultdict(list)",
      "    matches = defaultdict(set)",
      "    users = sorted(histories)",
      "    for user_id, user in enumerate(users):",
      "        window = histories[user][-k:]",
      "        for position, movie in enumerate(window):",
      "            for other_id in index[position, movie]:",
      "                matches[other_id, user_id].add(position)",
      "            index[position, movie].append(user_id)",
      "    answer = []",
      "    for (left, right), positions in matches.items():",
      "        if len(positions) >= m: answer.append((users[left], users[right]))",
      "    return sorted(answer)",
    ],
    debugMode: "semantic",
    builder: buildSteps9016Easy,
  },
  9017: {
    ...INTERVIEW[9017],
    statement: label(
      "Xử lý eventId:type:campaign:user:cost. Dedupe retry bằng eventId, rồi tính impressions, clicks, conversions, reach, spend, CTR và CVR theo campaign.",
      "Process eventId:type:campaign:user:cost. Deduplicate retries by eventId, then compute impressions, clicks, conversions, reach, spend, CTR, and CVR per campaign.",
    ),
    defaultInput: "e1:impression:summer:u1:0.05|e2:impression:summer:u2:0.05|e3:click:summer:u1:0.20|e3:click:summer:u1:0.20|e4:conversion:summer:u1:0|e5:impression:winter:u3:0.04",
    inputLabel: label("eventId:type:campaign:user:cost (ngăn |)", "eventId:type:campaign:user:cost (separated by |)"),
    approach: [
      label("eventId là idempotency key; cùng ID bị bỏ qua, còn event khác ID vẫn được đếm.", "eventId is the idempotency key; repeated IDs are skipped while distinct IDs still count."),
      label("Event hợp lệ cập nhật counter, spend và exact distinct-user reach theo campaign.", "Accepted events update counters, spend, and exact distinct-user reach per campaign."),
      label("CTR=clicks/impressions, CVR=conversions/clicks; zero denominator trả 0.", "CTR=clicks/impressions and CVR=conversions/clicks; a zero denominator returns 0."),
    ],
    code: [
      "def consume(event):",
      "    if event.event_id in seen_ids:",
      "        return  # idempotent retry",
      "    seen_ids.add(event.event_id)",
      "    metric = metrics[event.campaign]",
      "    metric.users.add(event.user)",
      "    metric.spend += event.cost",
      "    if event.type == 'impression': metric.impressions += 1",
      "    elif event.type == 'click': metric.clicks += 1",
      "    else: metric.conversions += 1",
      "",
      "# reach = len(metric.users)",
      "# CTR = clicks / impressions if impressions else 0",
      "# CVR = conversions / clicks if clicks else 0",
    ],
    debugMode: "semantic",
    builder: buildSteps9017Easy,
  },
};
