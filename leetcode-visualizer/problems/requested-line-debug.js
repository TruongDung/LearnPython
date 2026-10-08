// True instruction-by-instruction traces for the custom requested visualizations.
// The factory receives the existing parsers so validation and accepted input formats
// stay identical to requested-visualizations.js.

const CODE_9006 = [
  "from collections import defaultdict, deque",
  "",
  "def shortest_path(edges, start, target):",
  "    graph = defaultdict(list)",
  "    for left, right in edges:",
  "        graph[left].append(right)",
  "        graph[right].append(left)",
  "    for node in graph:",
  "        graph[node].sort()",
  "    queue = deque([start])",
  "    parent = {start: None}",
  "    distance = {start: 0}",
  "    while queue:",
  "        node = queue.popleft()",
  "        if node == target:",
  "            break",
  "        for nxt in graph[node]:",
  "            if nxt in parent:",
  "                continue",
  "            parent[nxt] = node",
  "            distance[nxt] = distance[node] + 1",
  "            queue.append(nxt)",
  "    if target not in parent:",
  "        return []",
  "    path = []",
  "    node = target",
  "    while node is not None:",
  "        path.append(node)",
  "        node = parent[node]",
  "    path.reverse()",
  "    return path",
];

const CODE_9013 = [
  "def arrange(n):",
  "    is_square = lambda x: int(x ** 0.5) ** 2 == x",
  "    values = list(range(1, n + 1))",
  "    graph = {value: [other for other in values if other != value and is_square(value + other)] for value in values}",
  "    path = []",
  "    used = set()",
  "    def dfs(value):",
  "        path.append(value)",
  "        used.add(value)",
  "        if len(path) == n:",
  "            return True",
  "        candidates = sorted((x for x in graph[value] if x not in used), key=lambda x: (len(graph[x]), x))",
  "        for nxt in candidates:",
  "            child_ok = dfs(nxt)",
  "            if child_ok:",
  "                return True",
  "        used.remove(value)",
  "        path.pop()",
  "        return False",
  "    starts = sorted(values, key=lambda x: (len(graph[x]), x))",
  "    for start in starts:",
  "        found = dfs(start)",
  "        if found:",
  "            return path",
  "    return []",
];

const CODE_9014 = [
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
  "        present_both = user in per_day[0] and user in per_day[1]",
  "        enough_videos = len(all_videos[user]) >= 2",
  "        if present_both and enough_videos:",
  "            answer.append(user)",
  "    return answer",
];

const CODE_9015 = [
  "def overlaps(intervals):",
  "    events = []",
  "    for interval_id, (start, end) in enumerate(intervals):",
  "        events.append((start, 1, interval_id))",
  "        events.append((end, -1, interval_id))",
  "    events.sort(key=lambda event: (event[0], -event[1], event[2]))",
  "    active = set()",
  "    pairs = 0",
  "    peak = 0",
  "    for time, delta, interval_id in events:",
  "        if delta == 1:",
  "            pairs += len(active)",
  "            active.add(interval_id)",
  "            peak = max(peak, len(active))",
  "        else:",
  "            active.remove(interval_id)",
  "    return pairs, peak",
];

const CODE_9016 = [
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
  "        if len(positions) >= m:",
  "            answer.append((users[left], users[right]))",
  "    return sorted(answer)",
];

const CODE_9017 = [
  "from collections import defaultdict",
  "def ad_metrics(events):",
  "    seen_ids = set()",
  "    metrics = defaultdict(lambda: {'impressions': 0, 'clicks': 0, 'conversions': 0, 'spend': 0.0, 'users': set()})",
  "    for event in events:",
  "        if event['event_id'] in seen_ids:",
  "            continue",
  "        seen_ids.add(event['event_id'])",
  "        metric = metrics[event['campaign']]",
  "        metric['users'].add(event['user'])",
  "        metric['spend'] += event['cost']",
  "        if event['type'] == 'impression':",
  "            metric['impressions'] += 1",
  "        elif event['type'] == 'click':",
  "            metric['clicks'] += 1",
  "        else:",
  "            metric['conversions'] += 1",
  "    answer = {}",
  "    for campaign, metric in sorted(metrics.items()):",
  "        reach = len(metric['users'])",
  "        ctr = metric['clicks'] / metric['impressions'] if metric['impressions'] else 0",
  "        cvr = metric['conversions'] / metric['clicks'] if metric['clicks'] else 0",
  "        answer[campaign] = {'impressions': metric['impressions'], 'clicks': metric['clicks'], 'conversions': metric['conversions'], 'spend': round(metric['spend'], 2), 'reach': reach, 'ctr': ctr, 'cvr': cvr}",
  "    return answer",
];

module.exports = function createRequestedLineDebug({
  label,
  parseEdges9006,
  parseDailyLogs9014,
  parseIntervals9015,
  parseHistories9016,
  parseAdEvents9017,
}) {
  // Python's sorted() compares strings ordinally; avoid locale-dependent browser/Node collation.
  const compareText = (left, right) => (left < right ? -1 : left > right ? 1 : 0);

  function buildSteps9006LineDebug(input, params = {}) {
    const edges = parseEdges9006(input);
    const start = String(params.start ?? "").trim();
    const target = String(params.target ?? "").trim();
    if (!start || !target) throw new Error("start và target không được rỗng");

    const names = [...new Set(edges.flat())];
    if (!names.includes(start) || !names.includes(target)) {
      throw new Error("start và target phải xuất hiện trong edges");
    }

    const idOf = new Map(names.map((name, index) => [name, index]));
    const adjacency = Array.from({ length: names.length }, () => []);
    const visibleEdgeIndexes = new Set();
    const expanded = new Set();
    const steps = [];
    let queue = null;
    let head = 0;
    let parent = null;
    let distance = null;
    let graphReady = false;

    const edgeKey = (a, b) => (a < b ? `${a}-${b}` : `${b}-${a}`);
    const pathEdgeKeys = (path) => new Set(path.slice(1).map((node, index) => edgeKey(path[index], node)));

    function emit(line, operation, options = {}) {
      const path = options.path || [];
      const queued = new Set(queue ? queue.slice(head) : []);
      const pathEdges = pathEdgeKeys(path);
      const currentEdgeKey = options.edge ? edgeKey(options.edge[0], options.edge[1]) : null;
      const graphEdges = edges.flatMap(([left, right], index) => {
        if (!visibleEdgeIndexes.has(index)) return [];
        const u = idOf.get(left);
        const v = idOf.get(right);
        const key = edgeKey(u, v);
        return [{
          u,
          v,
          left,
          right,
          undirected: true,
          tree: Boolean(parent) && (parent[v] === u || parent[u] === v),
          path: pathEdges.has(key),
          current: currentEdgeKey === key,
        }];
      });
      const nodes = names.map((name, id) => {
        const discovered = Boolean(parent) && parent[id] !== undefined;
        let status = discovered ? "discovered" : "unseen";
        if (expanded.has(id)) status = "expanded";
        if (queued.has(id)) status = "queued";
        if (options.current === id) status = "current";
        if (path.includes(id)) status = "path";
        return {
          id,
          name,
          distance: distance ? distance[id] : null,
          parent: parent && Number.isInteger(parent[id]) ? names[parent[id]] : null,
          discovered,
          status,
          isStart: id === idOf.get(start),
          isTarget: id === idOf.get(target),
          isCurrent: options.current === id,
          isNeighbor: options.neighbor === id,
        };
      });
      const queueItems = queue ? queue.slice(head).map((id) => ({ id, name: names[id], distance: distance ? distance[id] : null })) : [];
      const answer = options.final ? path.map((id) => names[id]) : null;
      steps.push({
        title: options.title || label(`Dòng ${line}: ${operation}`, `Line ${line}: ${operation}`),
        arr: [],
        highlight: [],
        mark: [],
        final: Boolean(options.final),
        codeLines: [line],
        vars: [
          { name: "operation", value: operation },
          { name: "queue (front → back)", value: `[${queueItems.map((item) => item.name).join(", ")}]` },
          { name: "node", value: Number.isInteger(options.current) ? names[options.current] : "—" },
          { name: "nxt", value: Number.isInteger(options.neighbor) ? names[options.neighbor] : "—" },
          { name: "path", value: `[${path.map((id) => names[id]).join(", ")}]` },
        ],
        note: options.note || label("State chỉ phản ánh lệnh vừa được tô sáng.", "The state reflects only the highlighted instruction."),
        graph: {
          nodes: nodes.map((node) => ({ id: node.id, label: node.name, sub: node.distance === null ? "d=∞" : `d=${node.distance}` })),
          edges: graphEdges,
          hlNodes: [options.current, options.neighbor].filter(Number.isInteger),
          hlEdges: path.length ? path.slice(1).map((node, index) => [path[index], node]) : options.edge ? [options.edge] : [],
          visitedNodes: nodes.filter((node) => node.status !== "unseen").map((node) => node.id),
          annotations: Object.fromEntries(path.map((id, index) => [id, String(index)])),
          dimUnfocused: Boolean(path.length),
          caption: label("BFS duyệt theo từng lệnh nguồn", "BFS executes one source instruction at a time"),
        },
        bfs9006View: {
          phase: options.phase || "state",
          operation,
          actionText: options.actionText || null,
          start,
          target,
          graphReady,
          queueReady: queue !== null,
          parentReady: parent !== null,
          distanceReady: distance !== null,
          layoutEdges: edges.map(([left, right]) => ({ u: idOf.get(left), v: idOf.get(right) })),
          adjacency: names.map((name, id) => ({ id, name, neighbors: adjacency[id].map((next) => names[next]) })),
          nodes,
          edges: graphEdges,
          queue: queueItems,
          expanded: [...expanded],
          current: Number.isInteger(options.current) ? options.current : null,
          neighbor: Number.isInteger(options.neighbor) ? options.neighbor : null,
          reason: options.reason || null,
          path: path.map((id) => names[id]),
          pathReady: Array.isArray(options.path),
          distance: distance && distance[idOf.get(target)] !== null ? distance[idOf.get(target)] : null,
          answer,
        },
      });
    }

    emit(1, "import", { phase: "graph", actionText: label("Nạp defaultdict và deque.", "Load defaultdict and deque.") });
    emit(3, "call", { phase: "graph", actionText: label(`Nhận ${edges.length} cạnh, start=${start}, target=${target}.`, `Receive ${edges.length} edges, start=${start}, target=${target}.`) });
    graphReady = true;
    emit(4, "graph-init", { phase: "graph", actionText: label("Khởi tạo adjacency list rỗng.", "Initialize an empty adjacency list.") });

    edges.forEach(([left, right], edgeIndex) => {
      const a = idOf.get(left);
      const b = idOf.get(right);
      emit(5, "edge-loop", { phase: "graph", edge: [a, b], actionText: label(`Đọc cạnh ${left}—${right}.`, `Read edge ${left}—${right}.`) });
      adjacency[a].push(b);
      visibleEdgeIndexes.add(edgeIndex);
      emit(6, "append-left", { phase: "graph", current: a, neighbor: b, edge: [a, b], actionText: label(`graph[${left}].append(${right}); cạnh đang được dựng.`, `graph[${left}].append(${right}); the edge is being built.`) });
      adjacency[b].push(a);
      emit(7, "append-right", { phase: "graph", current: b, neighbor: a, edge: [a, b], actionText: label(`graph[${right}].append(${left}); cạnh vô hướng hoàn tất.`, `graph[${right}].append(${left}); the undirected edge is complete.`) });
    });

    names.forEach((name, id) => {
      emit(8, "sort-loop", { phase: "graph", current: id, actionText: label(`Chuẩn bị sort neighbor của ${name}.`, `Prepare to sort ${name}'s neighbors.`) });
      adjacency[id].sort((a, b) => compareText(names[a], names[b]));
      emit(9, "sort-neighbors", { phase: "graph", current: id, actionText: label(`Thứ tự ${name}: [${adjacency[id].map((next) => names[next]).join(", ")}].`, `${name} order: [${adjacency[id].map((next) => names[next]).join(", ")}].`) });
    });

    const startId = idOf.get(start);
    const targetId = idOf.get(target);
    queue = [startId];
    emit(10, "queue-init", { phase: "init", actionText: label(`Đưa ${start} vào queue.`, `Put ${start} in the queue.`) });
    parent = Array(names.length).fill(undefined);
    parent[startId] = null;
    emit(11, "parent-init", { phase: "init", current: startId, actionText: label(`parent[${start}] = None.`, `parent[${start}] = None.`) });
    distance = Array(names.length).fill(null);
    distance[startId] = 0;
    emit(12, "distance-init", { phase: "init", current: startId, actionText: label(`distance[${start}] = 0.`, `distance[${start}] = 0.`) });

    let brokeOnTarget = false;
    while (head < queue.length) {
      emit(13, "while-check", { phase: "dequeue", reason: "true", actionText: label("Queue còn phần tử: tiếp tục BFS.", "The queue is non-empty: continue BFS.") });
      const node = queue[head++];
      emit(14, "dequeue", { phase: "dequeue", current: node, actionText: label(`popleft() → ${names[node]}.`, `popleft() → ${names[node]}.`) });
      const isTarget = node === targetId;
      emit(15, "target-check", { phase: "target-check", current: node, reason: isTarget ? "target" : "not-target", actionText: isTarget ? label(`${names[node]} là target.`, `${names[node]} is the target.`) : label(`${names[node]} chưa phải target.`, `${names[node]} is not the target.`) });
      if (isTarget) {
        brokeOnTarget = true;
        emit(16, "break", { phase: "found", current: node, reason: "target", actionText: label("Dừng BFS ở lần dequeue target đầu tiên.", "Stop at the first target dequeue.") });
        break;
      }

      for (const next of adjacency[node]) {
        emit(17, "neighbor-loop", { phase: "inspect", current: node, neighbor: next, edge: [node, next], actionText: label(`Xét ${names[node]} → ${names[next]}.`, `Inspect ${names[node]} → ${names[next]}.`) });
        const alreadyDiscovered = parent[next] !== undefined;
        emit(18, "visited-check", { phase: "inspect", current: node, neighbor: next, edge: [node, next], reason: alreadyDiscovered ? "already-discovered" : "unseen", actionText: alreadyDiscovered ? label(`${names[next]} đã có parent.`, `${names[next]} already has a parent.`) : label(`${names[next]} chưa được phát hiện.`, `${names[next]} is undiscovered.`) });
        if (alreadyDiscovered) {
          emit(19, "continue", { phase: "skip", current: node, neighbor: next, edge: [node, next], reason: "already-discovered", actionText: label("Bỏ qua neighbor đã phát hiện.", "Skip the discovered neighbor.") });
          continue;
        }
        parent[next] = node;
        emit(20, "set-parent", { phase: "set-parent", current: node, neighbor: next, edge: [node, next], actionText: label(`parent[${names[next]}] = ${names[node]}.`, `parent[${names[next]}] = ${names[node]}.`) });
        distance[next] = distance[node] + 1;
        emit(21, "set-distance", { phase: "set-distance", current: node, neighbor: next, edge: [node, next], actionText: label(`distance[${names[next]}] = ${distance[next]}.`, `distance[${names[next]}] = ${distance[next]}.`) });
        queue.push(next);
        emit(22, "enqueue", { phase: "enqueue", current: node, neighbor: next, edge: [node, next], actionText: label(`append(${names[next]}) vào cuối queue.`, `Append ${names[next]} to the queue.`) });
      }
      expanded.add(node);
    }

    if (!brokeOnTarget) {
      emit(13, "while-check", { phase: "dequeue", reason: "false", actionText: label("Queue rỗng: kết thúc BFS.", "The queue is empty: end BFS.") });
    }

    const reachable = parent[targetId] !== undefined;
    emit(23, "reachable-check", { phase: "reconstruct", current: targetId, reason: reachable ? "reachable" : "unreachable", actionText: reachable ? label("Target có parent chain.", "The target has a parent chain.") : label("Target không nằm trong parent.", "The target is absent from parent.") });
    if (!reachable) {
      emit(24, "return-empty", { phase: "done", final: true, path: [], reason: "unreachable", actionText: label("Trả về đường đi rỗng.", "Return an empty path.") });
      return { original: edges, answer: [], steps };
    }

    const path = [];
    emit(25, "path-init", { phase: "reconstruct", path, actionText: label("Khởi tạo path rỗng.", "Initialize an empty path.") });
    let node = targetId;
    emit(26, "cursor-init", { phase: "reconstruct", current: node, path, actionText: label(`Bắt đầu từ target ${target}.`, `Start from target ${target}.`) });
    while (node !== null) {
      emit(27, "parent-loop", { phase: "reconstruct", current: node, path, reason: "true", actionText: label(`${names[node]} chưa phải None.`, `${names[node]} is not None.`) });
      path.push(node);
      emit(28, "path-append", { phase: "reconstruct", current: node, path, actionText: label(`path.append(${names[node]}).`, `path.append(${names[node]}).`) });
      node = parent[node];
      emit(29, "follow-parent", { phase: "reconstruct", current: Number.isInteger(node) ? node : null, path, actionText: Number.isInteger(node) ? label(`Đi tới parent ${names[node]}.`, `Move to parent ${names[node]}.`) : label("Đã vượt qua start → None.", "Moved past start → None.") });
    }
    emit(27, "parent-loop", { phase: "reconstruct", path, reason: "false", actionText: label("Cursor là None: dừng dựng ngược.", "The cursor is None: stop walking backward.") });
    path.reverse();
    emit(30, "path-reverse", { phase: "reconstruct", path, actionText: label("Đảo path thành start → target.", "Reverse the path to start → target.") });
    const answer = path.map((id) => names[id]);
    emit(31, "return", { phase: "done", final: true, path, actionText: label(`Trả [${answer.join(", ")}].`, `Return [${answer.join(", ")}].`) });
    return { original: edges, answer, steps };
  }

  function buildSteps9013LineDebug(input) {
    const n = Array.isArray(input) ? Number(input[0]) : Number(input);
    if (!Number.isInteger(n) || n < 1 || n > 16) throw new Error("n phải là số nguyên từ 1 đến 16");

    const steps = [];
    const path = [];
    const used = new Set();
    const TRACE_LIMIT = 3000;
    let values = [];
    let adjacency = new Map();
    let pathReady = false;
    let usedReady = false;
    let attempts = 0;
    let backtracks = 0;
    let omitted = 0;
    let solution = null;
    let isSquare = null;

    const ordered = (items) => [...items].sort((a, b) => adjacency.get(a).length - adjacency.get(b).length || a - b);

    function emit(line, operation, options = {}) {
      if (steps.length >= TRACE_LIMIT && !options.final) {
        omitted++;
        return;
      }
      const candidates = options.candidates || [];
      const currentPath = pathReady ? [...path] : [];
      const pathEdges = currentPath.slice(1).map((value, index) => [currentPath[index], value]);
      const edges = [];
      for (const value of values) {
        for (const other of adjacency.get(value) || []) {
          if (value < other) edges.push({ u: value, v: other, sum: value + other, root: Math.sqrt(value + other) });
        }
      }
      steps.push({
        title: options.title || label(`Dòng ${line}: ${operation}`, `Line ${line}: ${operation}`),
        arr: [],
        highlight: [],
        mark: [],
        final: Boolean(options.final),
        codeLines: [line],
        vars: [
          { name: "operation", value: operation },
          { name: "path", value: `[${currentPath.join(", ")}]` },
          { name: "used", value: usedReady ? `{${[...used].join(", ")}}` : "—" },
          { name: "candidates", value: `[${candidates.join(", ")}]` },
          { name: "attempts / backtracks", value: `${attempts} / ${backtracks}` },
        ],
        note: options.note || label("Mỗi bước ứng với đúng một câu lệnh Python.", "Each step corresponds to one Python instruction."),
        graph: {
          nodes: values.map((value) => ({ id: value, label: String(value), sub: `deg=${(adjacency.get(value) || []).length}` })),
          edges: edges.map((edge) => ({ ...edge, undirected: true, w: edge.sum })),
          hlNodes: Number.isInteger(options.focus) ? [options.focus] : currentPath,
          hlEdges: options.edge ? [options.edge] : pathEdges,
          visitedNodes: currentPath,
          dimUnfocused: Boolean(options.final && solution),
          caption: label("a—b tồn tại khi a+b là số chính phương", "a—b exists when a+b is a perfect square"),
        },
        square9013View: {
          phase: options.phase || "search",
          operation,
          n,
          nodes: values.map((value) => ({
            value,
            degree: (adjacency.get(value) || []).length,
            state: currentPath.includes(value) ? "path" : candidates.includes(value) ? "candidate" : used.has(value) ? "used" : "available",
          })),
          edges: edges.map((edge) => ({
            ...edge,
            inPath: pathEdges.some(([a, b]) => (a === edge.u && b === edge.v) || (a === edge.v && b === edge.u)),
            current: Boolean(options.edge) && options.edge.includes(edge.u) && options.edge.includes(edge.v),
          })),
          path: currentPath,
          pathReady,
          used: usedReady ? [...used] : null,
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

    emit(1, "call", { phase: "graph", note: label(`Bắt đầu arrange(n=${n}).`, `Start arrange(n=${n}).`) });
    isSquare = (value) => Number.isInteger(Math.sqrt(value));
    emit(2, "define-is-square", { phase: "graph" });
    values = Array.from({ length: n }, (_, index) => index + 1);
    emit(3, "build-values", { phase: "graph" });
    adjacency = new Map(values.map((value) => [value, values.filter((other) => other !== value && isSquare(value + other))]));
    emit(4, "build-graph", {
      phase: "graph",
      note: label("Một câu lệnh comprehension dựng toàn bộ compatibility graph.", "One comprehension builds the entire compatibility graph."),
    });
    pathReady = true;
    emit(5, "path-init", { phase: "search" });
    usedReady = true;
    emit(6, "used-init", { phase: "search" });
    emit(7, "define-dfs", { phase: "search" });

    function dfs(value) {
      attempts++;
      path.push(value);
      emit(8, "path-append", { phase: "choose", focus: value });
      used.add(value);
      emit(9, "mark-used", { phase: "choose", focus: value });
      const complete = path.length === n;
      emit(10, "complete-check", { phase: "choose", focus: value, reason: complete ? "complete" : "incomplete" });
      if (complete) {
        solution = [...path];
        emit(11, "return-true", { phase: "choose", focus: value, reason: "complete" });
        return true;
      }

      const candidates = ordered(adjacency.get(value).filter((next) => !used.has(next)));
      emit(12, "build-candidates", { phase: candidates.length ? "choose" : "dead-end", focus: value, candidates, reason: candidates.length ? null : "no-candidate" });
      for (const next of candidates) {
        emit(13, "candidate-loop", { phase: "try", focus: value, attempted: next, candidates, edge: [value, next] });
        emit(14, "recurse", { phase: "try", focus: value, attempted: next, candidates, edge: [value, next] });
        const childOk = dfs(next);
        emit(14, "child-result", { phase: childOk ? "choose" : "backtrack", focus: value, attempted: next, candidates, edge: [value, next], reason: childOk ? "success" : "failed" });
        emit(15, "child-check", { phase: childOk ? "choose" : "backtrack", focus: value, attempted: next, candidates, reason: childOk ? "true" : "false" });
        if (childOk) {
          emit(16, "return-true", { phase: "choose", focus: value, candidates, reason: "child-success" });
          return true;
        }
      }

      used.delete(value);
      emit(17, "unmark-used", { phase: "backtrack", focus: value, candidates });
      path.pop();
      backtracks++;
      emit(18, "path-pop", { phase: "backtrack", focus: value, candidates });
      emit(19, "return-false", { phase: "backtrack", focus: value, candidates, reason: "exhausted" });
      return false;
    }

    const starts = ordered(values);
    emit(20, "sort-starts", { phase: "start", candidates: starts });
    for (const start of starts) {
      emit(21, "start-loop", { phase: "start", attempted: start, candidates: starts, focus: start });
      emit(22, "call-dfs", { phase: "start", attempted: start, candidates: starts, focus: start });
      const found = dfs(start);
      emit(22, "dfs-result", { phase: found ? "choose" : "backtrack", attempted: start, candidates: starts, focus: start, reason: found ? "success" : "failed" });
      emit(23, "found-check", { phase: found ? "choose" : "backtrack", attempted: start, candidates: starts, focus: start, reason: found ? "true" : "false" });
      if (found) {
        emit(24, "return-path", {
          phase: "done",
          final: true,
          focus: start,
          reason: "solution",
          note: omitted
            ? label(`Đáp án đầy đủ; ${omitted} instruction trung gian đã được ẩn để trace không quá lớn.`, `The answer is complete; ${omitted} intermediate instructions were hidden to bound the trace.`)
            : label("Path dùng mỗi số đúng một lần và mọi tổng kề nhau là số chính phương.", "The path uses every value once and every adjacent sum is a perfect square."),
        });
        return { original: [n], answer: [...solution], steps };
      }
    }

    emit(25, "return-empty", {
      phase: "done",
      final: true,
      reason: "exhausted",
      note: omitted
        ? label(`Không có arrangement; ${omitted} instruction trung gian đã được ẩn.`, `No arrangement exists; ${omitted} intermediate instructions were hidden.`)
        : label("Mọi start và nhánh hợp lệ đều đã thất bại.", "Every start and legal branch has failed."),
    });
    return { original: [n], answer: [], steps };
  }

  function buildSteps9014LineDebug(input) {
    const days = parseDailyLogs9014(input);
    const records = days.flatMap((entries, day) => entries.map(([user, video], index) => ({ day, index, user, video })));
    const steps = [];
    const evaluations = new Map();
    let perDay = null;
    let allVideos = null;
    let answer = null;
    let processed = 0;

    const ensure = (map, user) => {
      if (!map.has(user)) map.set(user, new Set());
      return map.get(user);
    };
    const userRows = () => {
      if (!allVideos || !perDay) return [];
      const knownUsers = new Set([...perDay[0].keys(), ...perDay[1].keys(), ...allVideos.keys()]);
      return [...knownUsers].sort((a, b) => compareText(a, b)).map((user) => {
        const day1 = [...(perDay[0].get(user) || [])].sort();
        const day2 = [...(perDay[1].get(user) || [])].sort();
        const union = [...(allVideos.get(user) || [])].sort();
        const evaluation = evaluations.get(user) || {};
        return {
          user,
          day1,
          day2,
          union,
          presentBoth: evaluation.presentBoth ?? null,
          distinctCount: union.length,
          distinctEnough: evaluation.enoughVideos ?? null,
          qualifies: evaluation.qualifies ?? null,
          evaluationState: evaluation.state || "pending",
          reason: evaluation.reason || null,
        };
      });
    };

    function emit(line, operation, options = {}) {
      const users = userRows();
      const visibleAnswer = answer ? [...answer] : [];
      steps.push({
        title: options.title || label(`Dòng ${line}: ${operation}`, `Line ${line}: ${operation}`),
        arr: [],
        highlight: [],
        mark: [],
        final: Boolean(options.final),
        codeLines: [line],
        vars: [
          { name: "operation", value: operation },
          { name: "processed", value: `${processed}/${records.length}` },
          { name: "user", value: options.activeUser || "—" },
          { name: "answer", value: answer ? `[${answer.join(", ")}]` : "—" },
        ],
        note: options.note || label("Set và answer chỉ thay đổi ở đúng dòng đang được tô sáng.", "Sets and answer change only on their highlighted lines."),
        loyal9014View: {
          phase: options.phase || "state",
          operation,
          records: records.map((record, index) => ({
            ...record,
            state: index < processed ? "done" : index === options.recordIndex ? "current" : "pending",
          })),
          processed,
          current: Number.isInteger(options.recordIndex) ? records[options.recordIndex] : null,
          activeDay: options.activeDay ?? null,
          activeUser: options.activeUser || null,
          users,
          answer: visibleAnswer,
        },
      });
    }

    emit(1, "import", { phase: "init" });
    emit(2, "call", { phase: "init", note: label("Nhận chính xác hai daily logs.", "Receive exactly two daily logs.") });
    perDay = [new Map(), new Map()];
    emit(3, "per-day-init", { phase: "init" });
    allVideos = new Map();
    emit(4, "all-videos-init", { phase: "init" });

    let recordIndex = 0;
    for (let day = 0; day < days.length; day++) {
      emit(5, "day-loop", { phase: "ingest", activeDay: day, note: label(`Bắt đầu đọc day ${day + 1}.`, `Begin reading day ${day + 1}.`) });
      for (const [user, video] of days[day]) {
        emit(6, "record-loop", { phase: "ingest", activeDay: day, activeUser: user, recordIndex });
        ensure(perDay[day], user).add(video);
        emit(7, "per-day-add", { phase: "ingest", activeDay: day, activeUser: user, recordIndex, note: label(`Thêm ${video} vào Set riêng của ${user} ở day ${day + 1}.`, `Add ${video} to ${user}'s day-${day + 1} set.`) });
        ensure(allVideos, user).add(video);
        processed = recordIndex + 1;
        emit(8, "union-add", { phase: "ingest", activeDay: day, activeUser: user, recordIndex, note: label(`Union của ${user} hiện có ${allVideos.get(user).size} video distinct.`, `${user}'s union now has ${allVideos.get(user).size} distinct video(s).`) });
        recordIndex++;
      }
    }

    answer = [];
    emit(9, "answer-init", { phase: "evaluate" });
    const users = [...allVideos.keys()].sort((a, b) => compareText(a, b));
    for (const user of users) {
      evaluations.set(user, { state: "checking" });
      emit(10, "user-loop", { phase: "evaluate", activeUser: user });
      const presentBoth = perDay[0].has(user) && perDay[1].has(user);
      evaluations.set(user, { ...evaluations.get(user), presentBoth });
      emit(11, "check-days", { phase: "evaluate", activeUser: user, note: presentBoth ? label(`${user} có mặt ở cả hai ngày.`, `${user} appears on both days.`) : label(`${user} thiếu ít nhất một ngày.`, `${user} is missing at least one day.`) });
      const enoughVideos = allVideos.get(user).size >= 2;
      evaluations.set(user, { ...evaluations.get(user), enoughVideos });
      emit(12, "check-distinct", { phase: "evaluate", activeUser: user, note: label(`${user} có ${allVideos.get(user).size} video distinct.`, `${user} has ${allVideos.get(user).size} distinct video(s).`) });
      const qualifies = presentBoth && enoughVideos;
      evaluations.set(user, {
        ...evaluations.get(user),
        qualifies,
        state: qualifies ? "pass" : "fail",
        reason: !presentBoth ? "missing-day" : !enoughVideos ? "needs-two-distinct" : "loyal",
      });
      emit(13, "loyal-check", { phase: "evaluate", activeUser: user });
      if (qualifies) {
        answer.push(user);
        emit(14, "answer-append", { phase: "evaluate", activeUser: user, note: label(`Thêm ${user}; answer tăng đúng tại dòng này.`, `Append ${user}; answer grows on this line only.`) });
      }
    }

    emit(15, "return", { phase: "done", final: true, note: label(`Trả [${answer.join(", ")}].`, `Return [${answer.join(", ")}].`) });
    return { original: days, answer: [...answer], steps };
  }

  function buildSteps9015LineDebug(input) {
    const intervals = parseIntervals9015(input);
    const steps = [];
    let events = null;
    let active = null;
    let overlapPairs = null;
    let maxActive = null;

    function emit(line, operation, options = {}) {
      const eventList = events || [];
      const currentIndex = Number.isInteger(options.eventIndex) ? options.eventIndex : -1;
      const activeAfter = active ? [...active] : [];
      steps.push({
        title: options.title || label(`Dòng ${line}: ${operation}`, `Line ${line}: ${operation}`),
        arr: [],
        highlight: [],
        mark: [],
        final: Boolean(options.final),
        codeLines: [line],
        vars: [
          { name: "operation", value: operation },
          { name: "event", value: options.event ? `${options.event.kind}@${options.event.time} (#${options.event.id})` : "—" },
          { name: "active", value: active ? `{${activeAfter.map((id) => `#${id}`).join(", ")}}` : "—" },
          { name: "pairs", value: overlapPairs ?? "—" },
          { name: "peak", value: maxActive ?? "—" },
        ],
        note: options.note || label("Quan sát từng mutation riêng của sweep line.", "Observe each sweep-line mutation separately."),
        sweep9015View: {
          phase: options.phase || "init",
          operation,
          intervals: intervals.map(([start, end], id) => ({ id, start, end, active: Boolean(active) && active.has(id), current: options.event?.id === id })),
          events: eventList.map((event, index) => ({ ...event, state: index < currentIndex ? "done" : index === currentIndex ? "current" : "pending" })),
          eventIndex: currentIndex,
          currentEvent: options.event || null,
          activeBefore: options.activeBefore || [],
          activeAfter,
          newPairs: options.newPairs || [],
          overlapPairs: overlapPairs ?? 0,
          maxActive: maxActive ?? 0,
          answer: options.final ? { overlapPairs, maxAtAnyTime: maxActive } : null,
        },
      });
    }

    emit(1, "call", { phase: "init", note: label(`Nhận ${intervals.length} closed interval(s).`, `Receive ${intervals.length} closed interval(s).`) });
    events = [];
    emit(2, "events-init", { phase: "init" });
    intervals.forEach(([start, end], intervalId) => {
      emit(3, "interval-loop", { phase: "init", note: label(`Đọc #${intervalId} = [${start}, ${end}].`, `Read #${intervalId} = [${start}, ${end}].`) });
      events.push({ time: start, delta: 1, id: intervalId, kind: "start" });
      emit(4, "append-start", { phase: "init" });
      events.push({ time: end, delta: -1, id: intervalId, kind: "end" });
      emit(5, "append-end", { phase: "init" });
    });
    events.sort((a, b) => a.time - b.time || b.delta - a.delta || a.id - b.id);
    emit(6, "sort-events", { phase: "init", note: label("Cùng thời điểm: START đứng trước END để giữ semantics closed interval.", "At equal times, START precedes END to preserve closed-interval semantics.") });
    active = new Set();
    emit(7, "active-init", { phase: "init" });
    overlapPairs = 0;
    emit(8, "pairs-init", { phase: "init" });
    maxActive = 0;
    emit(9, "peak-init", { phase: "init" });

    for (let eventIndex = 0; eventIndex < events.length; eventIndex++) {
      const event = events[eventIndex];
      const activeBefore = [...active];
      emit(10, "event-loop", { phase: event.kind, eventIndex, event, activeBefore });
      const isStart = event.delta === 1;
      emit(11, "start-check", { phase: event.kind, eventIndex, event, activeBefore, note: label(`delta == 1 là ${isStart}.`, `delta == 1 is ${isStart}.`) });
      if (isStart) {
        const newPairs = activeBefore.map((other) => [other, event.id]);
        overlapPairs += activeBefore.length;
        emit(12, "count-overlaps", { phase: "start", eventIndex, event, activeBefore, newPairs, note: label(`Cộng ${activeBefore.length} vì #${event.id} overlap mọi interval đang active.`, `Add ${activeBefore.length} because #${event.id} overlaps every active interval.`) });
        active.add(event.id);
        emit(13, "active-add", { phase: "start", eventIndex, event, activeBefore, newPairs });
        maxActive = Math.max(maxActive, active.size);
        emit(14, "peak-update", { phase: "start", eventIndex, event, activeBefore, newPairs });
      } else {
        emit(15, "else", { phase: "end", eventIndex, event, activeBefore });
        active.delete(event.id);
        emit(16, "active-remove", { phase: "end", eventIndex, event, activeBefore, note: label(`#${event.id} rời active set; END không tạo pair mới.`, `#${event.id} leaves the active set; END creates no new pair.`) });
      }
    }

    const answer = { overlapPairs, maxAtAnyTime: maxActive };
    emit(17, "return", { phase: "done", final: true, note: label(`Trả pairs=${overlapPairs}, peak=${maxActive}.`, `Return pairs=${overlapPairs}, peak=${maxActive}.`) });
    return { original: intervals, answer, steps };
  }

  function buildSteps9016LineDebug(input, params = {}) {
    const k = Number(params.k);
    const m = Number(params.m);
    if (!Number.isInteger(k) || !Number.isInteger(m) || k < 1 || k > 20 || m < 1 || m > k) {
      throw new Error("Cần 1 ≤ m ≤ k ≤ 20");
    }

    const rawHistories = parseHistories9016(input, k);
    const steps = [];
    const TRACE_LIMIT = 3000;
    let histories = rawHistories;
    let windows = rawHistories.map(() => null);
    let buckets = null;
    let pairMatches = null;
    let results = null;
    let omittedInstructions = 0;

    const pairKey = (a, b) => (a < b ? `${a}:${b}` : `${b}:${a}`);
    const pairRows = () => {
      if (!pairMatches) return [];
      return [...pairMatches.entries()].map(([key, positions]) => {
        const [a, b] = key.split(":").map(Number);
        const sortedPositions = [...positions].sort((x, y) => x - y);
        return {
          a,
          b,
          left: histories[a].user,
          right: histories[b].user,
          positions: sortedPositions,
          movies: sortedPositions.map((position) => windows[a]?.[position]),
          count: sortedPositions.length,
          qualifies: sortedPositions.length >= m,
        };
      });
    };
    const bucketRows = () => {
      if (!buckets) return [];
      return [...buckets.entries()].map(([key, users]) => {
        const separator = key.indexOf("\u0000");
        return {
          position: Number(key.slice(0, separator)),
          movie: key.slice(separator + 1),
          users: users.map((index) => histories[index].user),
        };
      }).sort((a, b) => a.position - b.position || compareText(a.movie, b.movie));
    };

    function emit(line, operation, options = {}) {
      if (steps.length >= TRACE_LIMIT && !options.final) {
        omittedInstructions++;
        return;
      }
      const allBuckets = bucketRows();
      const allPairs = pairRows();
      const activeBucketIndex = Number.isInteger(options.activePosition)
        ? allBuckets.findIndex((bucket) => bucket.position === options.activePosition && bucket.movie === options.activeMovie)
        : -1;
      const bucketStart = activeBucketIndex < 0 ? 0 : Math.max(0, Math.min(activeBucketIndex - 15, allBuckets.length - 30));
      let visiblePairs = [];
      if (options.activePair) {
        const [left, right] = options.activePair;
        const row = allPairs.find((pair) => pair.a === left && pair.b === right);
        if (row) visiblePairs = [row];
      } else if (options.final) {
        visiblePairs = allPairs.filter((pair) => pair.qualifies).slice(0, 80);
      }
      const visibleResults = (results || []).slice(0, 80).map((pair) => [...pair]);
      steps.push({
        title: options.title || label(`Dòng ${line}: ${operation}`, `Line ${line}: ${operation}`),
        arr: [],
        highlight: [],
        mark: [],
        final: Boolean(options.final),
        codeLines: [line],
        vars: [
          { name: "operation", value: operation },
          { name: "user", value: Number.isInteger(options.activeUser) ? histories[options.activeUser].user : "—" },
          { name: "position / movie", value: Number.isInteger(options.activePosition) ? `${options.activePosition} / ${options.activeMovie}` : "—" },
          { name: "candidate pairs", value: pairMatches ? pairMatches.size : "—" },
          { name: "answer", value: results ? `[${results.map((pair) => pair.join("—")).join(", ")}]` : "—" },
        ],
        note: options.note || label("Index, match set và answer được cập nhật ở ba dòng riêng.", "The index, match set, and answer update on separate lines."),
        friends9016View: {
          phase: options.phase || "init",
          operation,
          k,
          m,
          histories: histories.map((history, index) => ({
            user: history.user,
            index,
            window: windows[index] ? [...windows[index]] : [],
            olderCount: windows[index] ? history.movies.length - windows[index].length : 0,
            active: index === options.activeUser,
            activePosition: index === options.activeUser ? options.activePosition ?? null : null,
          })),
          buckets: allBuckets.slice(bucketStart, bucketStart + 30),
          omittedBuckets: Math.max(0, allBuckets.length - 30),
          activeBucket: Number.isInteger(options.activePosition) ? { position: options.activePosition, movie: options.activeMovie } : null,
          pairs: visiblePairs,
          pairTotal: allPairs.length,
          omittedPairs: options.final ? Math.max(0, allPairs.filter((pair) => pair.qualifies).length - visiblePairs.length) : 0,
          activeUser: options.activeUser ?? null,
          activePair: options.activePair || null,
          priorUser: options.priorUser ?? null,
          results: visibleResults,
          omittedResults: Math.max(0, (results || []).length - visibleResults.length),
          omittedPairSteps: omittedInstructions,
          omittedInstructions,
          answer: options.final ? (results || []).map((pair) => [...pair]) : null,
        },
      });
    }

    emit(1, "import", { phase: "init" });
    emit(2, "call", { phase: "init", note: label(`So khớp ít nhất ${m}/${k} vị trí.`, `Match at least ${m}/${k} positions.`) });
    buckets = new Map();
    emit(3, "index-init", { phase: "init" });
    pairMatches = new Map();
    emit(4, "matches-init", { phase: "init" });
    histories = [...rawHistories].sort((a, b) => compareText(a.user, b.user));
    windows = histories.map(() => null);
    emit(5, "sort-users", { phase: "init" });

    for (let userIndex = 0; userIndex < histories.length; userIndex++) {
      const history = histories[userIndex];
      emit(6, "user-loop", { phase: "index", activeUser: userIndex });
      windows[userIndex] = history.movies.slice(-k);
      emit(7, "slice-window", { phase: "index", activeUser: userIndex, note: label(`${history.user}: [${windows[userIndex].join(", ")}].`, `${history.user}: [${windows[userIndex].join(", ")}].`) });
      for (let position = 0; position < k; position++) {
        const movie = windows[userIndex][position];
        emit(8, "position-loop", { phase: "index", activeUser: userIndex, activePosition: position, activeMovie: movie });
        const key = `${position}\u0000${movie}`;
        if (!buckets.has(key)) buckets.set(key, []);
        const priorUsers = buckets.get(key);
        if (!priorUsers.length) {
          emit(9, "prior-user-loop", { phase: "index", activeUser: userIndex, activePosition: position, activeMovie: movie, note: label("Bucket chưa có user trước đó; loop rỗng.", "The bucket has no prior user; the loop is empty.") });
        }
        for (const other of priorUsers) {
          const activePair = [other, userIndex];
          emit(9, "prior-user-loop", { phase: "index", activeUser: userIndex, activePosition: position, activeMovie: movie, activePair, priorUser: other });
          const keyForPair = pairKey(other, userIndex);
          if (!pairMatches.has(keyForPair)) pairMatches.set(keyForPair, new Set());
          pairMatches.get(keyForPair).add(position);
          emit(10, "match-add", {
            phase: "index",
            activeUser: userIndex,
            activePosition: position,
            activeMovie: movie,
            activePair,
            priorUser: other,
            note: label(`${histories[other].user} và ${history.user} khớp ở position ${position}.`, `${histories[other].user} and ${history.user} match at position ${position}.`),
          });
        }
        priorUsers.push(userIndex);
        emit(11, "index-append", { phase: "index", activeUser: userIndex, activePosition: position, activeMovie: movie });
      }
    }

    results = [];
    emit(12, "answer-init", { phase: "evaluate" });
    const allPairs = pairRows();
    for (const row of allPairs) {
      const activePair = [row.a, row.b];
      emit(13, "pair-loop", { phase: "evaluate", activePair });
      emit(14, "threshold-check", {
        phase: "evaluate",
        activePair,
        note: label(`${row.count} match(es) ${row.qualifies ? "≥" : "<"} m=${m}.`, `${row.count} match(es) ${row.qualifies ? "≥" : "<"} m=${m}.`),
      });
      if (row.qualifies) {
        results.push([row.left, row.right]);
        emit(15, "answer-append", { phase: "evaluate", activePair });
      }
    }

    results.sort((a, b) => compareText(a[0], b[0]) || compareText(a[1], b[1]));
    emit(16, "sort-and-return", {
      phase: "done",
      final: true,
      note: omittedInstructions
        ? label(`Đáp án vẫn đầy đủ; đã ẩn ${omittedInstructions} instruction để giới hạn trace.`, `The answer remains complete; ${omittedInstructions} instructions were hidden to bound the trace.`)
        : label("Trả mọi pair đạt ít nhất m vị trí khớp.", "Return every pair matching at least m positions."),
    });
    return { original: rawHistories.map(({ user, movies }) => ({ user, list: movies })), answer: results.map((pair) => [...pair]), steps };
  }

  function buildSteps9017LineDebug(input) {
    const events = parseAdEvents9017(input);
    const steps = [];
    const processed = Array(events.length).fill(null);
    const computed = new Map();
    let seen = null;
    let metrics = null;
    let answer = null;

    const ensure = (campaign) => {
      if (!metrics.has(campaign)) {
        metrics.set(campaign, { impressions: 0, clicks: 0, conversions: 0, spend: 0, users: new Set() });
      }
      return metrics.get(campaign);
    };
    const campaignRows = () => {
      if (!metrics) return [];
      return [...metrics.entries()].sort((a, b) => compareText(a[0], b[0])).map(([campaign, value]) => {
        const derived = computed.get(campaign) || {};
        return {
          campaign,
          impressions: value.impressions,
          clicks: value.clicks,
          conversions: value.conversions,
          spend: Number(value.spend.toFixed(2)),
          users: [...value.users].sort((a, b) => compareText(a, b)),
          reach: derived.reach ?? null,
          ctr: derived.ctr ?? null,
          cvr: derived.cvr ?? null,
          warning: value.clicks > value.impressions ? "clicks-exceed-impressions" : value.conversions > value.clicks ? "conversions-exceed-clicks" : null,
        };
      });
    };

    function emit(line, operation, options = {}) {
      const campaigns = campaignRows();
      steps.push({
        title: options.title || label(`Dòng ${line}: ${operation}`, `Line ${line}: ${operation}`),
        arr: [],
        highlight: [],
        mark: [],
        final: Boolean(options.final),
        codeLines: [line],
        vars: [
          { name: "operation", value: operation },
          { name: "eventId", value: options.event?.eventId || "—" },
          { name: "seen IDs", value: seen ? seen.size : "—" },
          { name: "campaign", value: options.campaign || options.event?.campaign || "—" },
          { name: "decision", value: options.decision || "—" },
        ],
        note: options.note || label("Mỗi counter, spend, reach và ratio có bước riêng.", "Every counter, spend, reach, and ratio has its own step."),
        ads9017View: {
          phase: options.phase || "init",
          operation,
          events: events.map((event, index) => ({ ...event, state: processed[index] || (index === options.eventIndex ? "current" : "pending") })),
          eventIndex: options.eventIndex ?? -1,
          current: options.event || null,
          decision: options.decision || null,
          activeCampaign: options.campaign || options.event?.campaign || null,
          seenIds: seen ? [...seen] : [],
          campaigns,
          partialAnswer: answer ? { ...answer } : null,
          answer: options.final ? { ...answer } : null,
        },
      });
    }

    emit(1, "import", { phase: "init" });
    emit(2, "call", { phase: "init", note: label(`Nhận stream ${events.length} event(s).`, `Receive a stream of ${events.length} event(s).`) });
    seen = new Set();
    emit(3, "seen-init", { phase: "init" });
    metrics = new Map();
    emit(4, "metrics-init", { phase: "init" });

    for (let eventIndex = 0; eventIndex < events.length; eventIndex++) {
      const event = events[eventIndex];
      emit(5, "event-loop", { phase: "receive", eventIndex, event, decision: "checking" });
      const duplicate = seen.has(event.eventId);
      emit(6, "duplicate-check", { phase: duplicate ? "duplicate" : "receive", eventIndex, event, decision: duplicate ? "duplicate" : "accepted", note: duplicate ? label(`${event.eventId} đã tồn tại.`, `${event.eventId} already exists.`) : label(`${event.eventId} là ID mới.`, `${event.eventId} is new.`) });
      if (duplicate) {
        processed[eventIndex] = "duplicate";
        emit(7, "continue", { phase: "duplicate", eventIndex, event, decision: "duplicate", note: label("Không metric nào thay đổi.", "No metric changes.") });
        continue;
      }

      seen.add(event.eventId);
      emit(8, "mark-seen", { phase: "aggregate", eventIndex, event, decision: "accepted" });
      const metric = ensure(event.campaign);
      emit(9, "metric-lookup", { phase: "aggregate", eventIndex, event, decision: "accepted" });
      metric.users.add(event.user);
      emit(10, "reach-user-add", { phase: "aggregate", eventIndex, event, decision: "accepted", note: label(`Thêm ${event.user} vào exact-reach set.`, `Add ${event.user} to the exact-reach set.`) });
      metric.spend += event.cost;
      emit(11, "spend-add", { phase: "aggregate", eventIndex, event, decision: "accepted", note: label(`spend += ${event.cost}.`, `spend += ${event.cost}.`) });
      const isImpression = event.type === "impression";
      emit(12, "impression-check", { phase: "aggregate", eventIndex, event, decision: "accepted" });
      if (isImpression) {
        metric.impressions++;
        processed[eventIndex] = "accepted";
        emit(13, "impression-increment", { phase: "aggregate", eventIndex, event, decision: "accepted" });
      } else {
        const isClick = event.type === "click";
        emit(14, "click-check", { phase: "aggregate", eventIndex, event, decision: "accepted" });
        if (isClick) {
          metric.clicks++;
          processed[eventIndex] = "accepted";
          emit(15, "click-increment", { phase: "aggregate", eventIndex, event, decision: "accepted" });
        } else {
          emit(16, "conversion-else", { phase: "aggregate", eventIndex, event, decision: "accepted" });
          metric.conversions++;
          processed[eventIndex] = "accepted";
          emit(17, "conversion-increment", { phase: "aggregate", eventIndex, event, decision: "accepted" });
        }
      }
    }

    answer = {};
    emit(18, "answer-init", { phase: "derive" });
    for (const [campaign, metric] of [...metrics.entries()].sort((a, b) => compareText(a[0], b[0]))) {
      emit(19, "campaign-loop", { phase: "derive", campaign });
      const reach = metric.users.size;
      computed.set(campaign, { reach });
      emit(20, "compute-reach", { phase: "derive", campaign });
      const ctr = metric.impressions ? metric.clicks / metric.impressions : 0;
      computed.set(campaign, { ...computed.get(campaign), ctr });
      emit(21, "compute-ctr", { phase: "derive", campaign });
      const cvr = metric.clicks ? metric.conversions / metric.clicks : 0;
      computed.set(campaign, { ...computed.get(campaign), cvr });
      emit(22, "compute-cvr", { phase: "derive", campaign });
      answer[campaign] = {
        impressions: metric.impressions,
        clicks: metric.clicks,
        conversions: metric.conversions,
        spend: Number(metric.spend.toFixed(2)),
        reach,
        ctr,
        cvr,
      };
      emit(23, "answer-campaign", { phase: "derive", campaign });
    }

    emit(24, "return", { phase: "done", final: true, note: label("Trả metrics của mọi campaign sau khi dedupe.", "Return every campaign's metrics after deduplication.") });
    return { original: events, answer: { ...answer }, steps };
  }

  return {
    9001: { debugMode: "line-by-line" },
    9006: { debugMode: "line-by-line", code: CODE_9006, builder: buildSteps9006LineDebug },
    9013: { debugMode: "line-by-line", code: CODE_9013, builder: buildSteps9013LineDebug },
    9014: { debugMode: "line-by-line", code: CODE_9014, builder: buildSteps9014LineDebug },
    9015: { debugMode: "line-by-line", code: CODE_9015, builder: buildSteps9015LineDebug },
    9016: { debugMode: "line-by-line", code: CODE_9016, builder: buildSteps9016LineDebug },
    9017: { debugMode: "line-by-line", code: CODE_9017, builder: buildSteps9017LineDebug },
  };
};
