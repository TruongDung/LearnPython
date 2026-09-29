"use strict";

const {
  bi,
  fail,
  parsePlainParams,
  parseInteger,
  parseIntegerArray,
  parseRows,
  createTracer,
} = require("./hard-viz-shared");

const PROBLEM_ID = 2872;
const DEFAULT_EDGES = "[[0,2],[1,2],[1,3],[2,4]]";
const DEFAULT_VALUES = "[1,8,1,4,4]";
const DEFAULT_K = 6;

const LIMITS = Object.freeze({
  minNodes: 1,
  maxNodes: 96,
  minValue: 1,
  maxValue: 1_000_000_000,
  maxK: 1_000_000_000,
  maxTraceSteps: 220,
  maxDetailedTraceEvents: 176,
  maxQueueItems: 40,
});

const PHASES = Object.freeze([
  bi("Kiểm tra và định hướng cây", "Validate and orient the tree"),
  bi("Lập thứ tự hậu tự DFS", "Build DFS postorder"),
  bi("Gộp tổng cây con", "Merge subtree totals"),
  bi("Cắt component chia hết", "Cut divisible components"),
  bi("Kết quả", "Result"),
]);

const LEGEND = Object.freeze([
  { label: bi("Node/cạnh đang xử lý", "Active node/edge"), state: "active" },
  { label: bi("Đang chờ trong DFS", "Waiting in DFS"), state: "queued" },
  { label: bi("Đã tính subtotal", "Subtotal computed"), state: "computed" },
  { label: bi("Gốc component hoàn tất", "Completed component root"), state: "success" },
  { label: bi("Cạnh đã cắt", "Cut edge"), state: "danger" },
]);

const SOURCE = Object.freeze([
  "from typing import List",
  "",
  "class Solution:",
  "    def maxKDivisibleComponents(",
  "        self, n: int, edges: List[List[int]], values: List[int], k: int",
  "    ) -> int:",
  "        graph = [[] for _ in range(n)]",
  "        for u, v in edges:",
  "            graph[u].append(v)",
  "            graph[v].append(u)",
  "",
  "        parent = [-2] * n",
  "        parent[0] = -1",
  "        order, stack = [], [0]",
  "        while stack:",
  "            node = stack.pop()",
  "            order.append(node)",
  "            for neighbor in graph[node]:",
  "                if neighbor == parent[node]:",
  "                    continue",
  "                parent[neighbor] = node",
  "                stack.append(neighbor)",
  "",
  "        contribution = [0] * n",
  "        components = 0",
  "        for node in reversed(order):",
  "            subtotal = values[node]",
  "            for neighbor in graph[node]:",
  "                if parent[neighbor] == node:",
  "                    subtotal += contribution[neighbor]",
  "            if subtotal % k == 0:",
  "                components += 1",
  "                contribution[node] = 0",
  "            else:",
  "                contribution[node] = subtotal",
  "        return components",
]);

function undirectedKey(left, right) {
  return left < right ? `${left}:${right}` : `${right}:${left}`;
}

function orientTree(adjacency) {
  const n = adjacency.length;
  const parent = Array(n).fill(-2);
  const depth = Array(n).fill(-1);
  const children = Array.from({ length: n }, () => []);
  const order = [];
  const stack = [0];
  parent[0] = -1;
  depth[0] = 0;

  while (stack.length) {
    const node = stack.pop();
    order.push(node);
    const nextChildren = [];
    for (const neighbor of adjacency[node]) {
      if (neighbor === parent[node]) continue;
      if (parent[neighbor] !== -2) {
        fail(PROBLEM_ID, RangeError, "các cạnh tạo chu trình", "tree edges contain a cycle");
      }
      parent[neighbor] = node;
      depth[neighbor] = depth[node] + 1;
      children[node].push(neighbor);
      nextChildren.push(neighbor);
    }
    for (let index = nextChildren.length - 1; index >= 0; index -= 1) {
      stack.push(nextChildren[index]);
    }
  }

  if (order.length !== n) {
    fail(PROBLEM_ID, RangeError, "cây phải liên thông", "the tree must be connected");
  }

  const levels = [];
  for (const node of order) {
    if (!levels[depth[node]]) levels[depth[node]] = [];
    levels[depth[node]].push(node);
  }
  return { n, root: 0, adjacency, parent, depth, children, order, levels };
}

function parseMaximumKDivisibleComponents2872Input(input, params = {}) {
  const safeParams = parsePlainParams(params, PROBLEM_ID);
  const values = parseIntegerArray(
    safeParams.values === undefined ? DEFAULT_VALUES : safeParams.values,
    {
      problemId: PROBLEM_ID,
      name: "values",
      minLength: LIMITS.minNodes,
      maxLength: LIMITS.maxNodes,
      minValue: LIMITS.minValue,
      maxValue: LIMITS.maxValue,
    },
  );
  const n = values.length;
  const edges = parseRows(input === undefined ? DEFAULT_EDGES : input, {
    problemId: PROBLEM_ID,
    name: "edges",
    columns: 2,
    minRows: 0,
    maxRows: LIMITS.maxNodes - 1,
    minValue: Number.MIN_SAFE_INTEGER,
    maxValue: Number.MAX_SAFE_INTEGER,
  });
  const k = parseInteger(safeParams.k === undefined ? DEFAULT_K : safeParams.k, {
    problemId: PROBLEM_ID,
    name: "k",
    min: 1,
    max: LIMITS.maxK,
  });

  if (edges.length !== n - 1) {
    fail(
      PROBLEM_ID,
      RangeError,
      `cây ${n} node phải có đúng ${n - 1} cạnh`,
      `a ${n}-node tree must have exactly ${n - 1} edges`,
    );
  }

  const adjacency = Array.from({ length: n }, () => []);
  const dsuParent = Array.from({ length: n }, (_, node) => node);
  const dsuRank = Array(n).fill(0);
  const seenEdges = new Set();

  function find(node) {
    let root = node;
    while (dsuParent[root] !== root) root = dsuParent[root];
    while (dsuParent[node] !== node) {
      const next = dsuParent[node];
      dsuParent[node] = root;
      node = next;
    }
    return root;
  }

  function union(left, right) {
    let leftRoot = find(left);
    let rightRoot = find(right);
    if (leftRoot === rightRoot) return false;
    if (dsuRank[leftRoot] < dsuRank[rightRoot]) {
      [leftRoot, rightRoot] = [rightRoot, leftRoot];
    }
    dsuParent[rightRoot] = leftRoot;
    if (dsuRank[leftRoot] === dsuRank[rightRoot]) dsuRank[leftRoot] += 1;
    return true;
  }

  for (const [u, v] of edges) {
    if (u < 0 || u >= n || v < 0 || v >= n) {
      fail(
        PROBLEM_ID,
        RangeError,
        `cạnh [${u},${v}] có endpoint ngoài [0,${n - 1}]`,
        `edge [${u},${v}] has an endpoint outside [0,${n - 1}]`,
      );
    }
    if (u === v) {
      fail(PROBLEM_ID, RangeError, `cạnh [${u},${v}] là self-loop`, `edge [${u},${v}] is a self-loop`);
    }
    const key = undirectedKey(u, v);
    if (seenEdges.has(key)) {
      fail(PROBLEM_ID, RangeError, `cạnh [${u},${v}] bị lặp`, `edge [${u},${v}] is duplicated`);
    }
    seenEdges.add(key);
    if (!union(u, v)) {
      fail(PROBLEM_ID, RangeError, "các cạnh tạo chu trình", "tree edges contain a cycle");
    }
    adjacency[u].push(v);
    adjacency[v].push(u);
  }

  adjacency.forEach((neighbors) => neighbors.sort((left, right) => left - right));
  const root = find(0);
  for (let node = 1; node < n; node += 1) {
    if (find(node) !== root) {
      fail(PROBLEM_ID, RangeError, "cây phải liên thông", "the tree must be connected");
    }
  }

  const total = values.reduce((sum, value) => sum + value, 0);
  if (!Number.isSafeInteger(total)) {
    fail(PROBLEM_ID, RangeError, "tổng values vượt số nguyên an toàn", "the values total exceeds the safe-integer range");
  }
  if (total % k !== 0) {
    fail(
      PROBLEM_ID,
      RangeError,
      `tổng values = ${total} không chia hết cho k = ${k}`,
      `the values total ${total} is not divisible by k = ${k}`,
    );
  }

  return {
    n,
    edges: edges.map((edge) => [...edge]),
    values: [...values],
    k,
    total,
    tree: orientTree(adjacency),
  };
}

function collectFinalComponents(tree, values, cutEdges) {
  const visited = Array(tree.n).fill(false);
  const components = [];

  for (let start = 0; start < tree.n; start += 1) {
    if (visited[start]) continue;
    const members = [];
    const stack = [start];
    visited[start] = true;
    let sum = 0;

    while (stack.length) {
      const node = stack.pop();
      members.push(node);
      sum += values[node];
      for (const neighbor of tree.adjacency[node]) {
        if (visited[neighbor] || cutEdges.has(undirectedKey(node, neighbor))) continue;
        visited[neighbor] = true;
        stack.push(neighbor);
      }
    }

    members.sort((left, right) => left - right);
    let root = members[0];
    for (const node of members) {
      if (tree.depth[node] < tree.depth[root]) root = node;
    }
    components.push({ root, members, sum });
  }

  components.sort((left, right) => left.root - right.root);
  return components;
}

function buildSteps2872(input, params = {}) {
  const parsed = parseMaximumKDivisibleComponents2872Input(input, params);
  const {
    n, edges, values, k, total, tree,
  } = parsed;
  const postorder = [...tree.order].reverse();
  const subtotal = Array(n).fill(null);
  const remainder = Array(n).fill(null);
  const contribution = Array(n).fill(null);
  const processed = new Set();
  const componentRoots = new Set();
  const cutEdges = new Set();
  const cutRecords = [];
  const completedComponents = [];
  let componentCount = 0;
  let detailedEvents = 0;
  let detailTraceStopped = false;
  let finalComponents = null;

  const tracer = createTracer({
    problemId: PROBLEM_ID,
    source: SOURCE,
    phases: PHASES,
    maxSteps: LIMITS.maxTraceSteps,
    baseArray: values,
    legend: LEGEND,
  });

  function nodeState(node, activeNodes, queuedNodes) {
    if (activeNodes.has(node)) return "active";
    if (componentRoots.has(node)) return "success";
    if (processed.has(node)) return "computed";
    if (queuedNodes.has(node)) return "queued";
    return "idle";
  }

  function makeGraph(options) {
    const activeNodes = new Set(options.activeNodes || []);
    if (options.activeNode !== null && options.activeNode !== undefined) {
      activeNodes.add(options.activeNode);
    }
    const queuedNodes = new Set(options.queue || []);
    const activeEdgeKey = options.activeEdge
      ? undirectedKey(options.activeEdge[0], options.activeEdge[1])
      : null;
    const nodes = Array.from({ length: n }, (_, node) => ({
      id: node,
      label: `u${node}`,
      sub: subtotal[node] === null
        ? `v=${values[node]} · r=?`
        : `sum=${subtotal[node]} · r=${remainder[node]}`,
      state: nodeState(node, activeNodes, queuedNodes),
    }));
    const graphEdges = [];
    for (let child = 0; child < n; child += 1) {
      const parent = tree.parent[child];
      if (parent === -1) continue;
      const key = undirectedKey(parent, child);
      let state = "idle";
      if (cutEdges.has(key)) state = "danger";
      else if (key === activeEdgeKey) state = "active";
      else if (processed.has(child)) state = "visited";
      else if (queuedNodes.has(child)) state = "queued";
      graphEdges.push({
        u: parent,
        v: child,
        directed: true,
        state,
        label: cutEdges.has(key) ? bi("CẮT", "CUT") : `${parent}→${child}`,
      });
    }
    return {
      layout: "tree",
      nodes,
      edges: graphEdges,
      levels: tree.levels.map((level) => [...level]),
    };
  }

  function makeTable(options) {
    const activeNodes = new Set(options.activeNodes || []);
    if (options.activeNode !== null && options.activeNode !== undefined) {
      activeNodes.add(options.activeNode);
    }
    return {
      title: bi("Bảng subtotal hậu tự", "Postorder subtotal table"),
      columns: [
        bi("parent", "parent"),
        bi("value", "value"),
        bi("subtotal", "subtotal"),
        bi("subtotal mod k", "subtotal mod k"),
        bi("đẩy lên parent", "sent to parent"),
        bi("kết quả", "result"),
      ],
      rows: Array.from({ length: n }, (_, node) => {
        let result = "pending";
        let state = "pending";
        if (processed.has(node)) {
          if (componentRoots.has(node)) {
            result = tree.parent[node] === -1 ? "component" : "cut";
            state = "success";
          } else {
            result = "carry";
            state = "computed";
          }
        }
        if (activeNodes.has(node)) state = "active";
        return {
          label: `u${node}`,
          state,
          cells: [
            tree.parent[node],
            values[node],
            subtotal[node] === null ? "—" : subtotal[node],
            remainder[node] === null ? "—" : remainder[node],
            contribution[node] === null ? "—" : contribution[node],
            { value: result, state },
          ],
        };
      }),
    };
  }

  function makeQueue(queue, activeNode) {
    const visible = queue.slice(0, LIMITS.maxQueueItems);
    const items = visible.map((node, index) => ({
      label: `u${node}`,
      sub: node === activeNode
        ? bi("đang xử lý", "processing")
        : bi(`chờ hậu tự ${index + 1}`, `postorder wait ${index + 1}`),
      state: node === activeNode ? "active" : "queued",
    }));
    if (queue.length > visible.length) {
      items.push({
        label: `… +${queue.length - visible.length}`,
        sub: bi("node đang chờ", "waiting nodes"),
        state: "muted",
      });
    }
    return items;
  }

  function makeGroups(options) {
    const componentItems = finalComponents === null
      ? completedComponents.map((component, index) => ({
        label: `C${index + 1} · root u${component.root}`,
        value: `sum=${component.sum} ≡ 0 (mod ${k})`,
        state: "success",
      }))
      : finalComponents.map((component, index) => ({
        label: `C${index + 1} · root u${component.root}`,
        value: `{${component.members.join(",")}} · sum=${component.sum}`,
        state: "success",
      }));
    return [
      {
        title: finalComponents === null
          ? bi("Component đã khép", "Completed components")
          : bi("Các component cuối", "Final components"),
        items: componentItems,
      },
      {
        title: bi("Cạnh đã cắt", "Cut edges"),
        items: cutRecords.map((record) => ({
          label: `u${record.parent}—u${record.child}`,
          value: `child sum=${record.sum}`,
          state: "danger",
        })),
      },
      {
        title: bi("Đóng góp các cây con hiện tại", "Current child contributions"),
        items: (options.childContributions || []).map((item, index, items) => ({
          label: `u${item.child} → u${item.parent}`,
          value: `up=${item.value}`,
          state: index === items.length - 1 ? "active" : "visited",
        })),
      },
    ];
  }

  function makeSequence(activeNode) {
    return postorder.map((node, index) => ({
      label: `#${index + 1} · u${node}`,
      value: remainder[node] === null ? "r=?" : `r=${remainder[node]}`,
      state: node === activeNode
        ? "active"
        : processed.has(node) ? (componentRoots.has(node) ? "success" : "computed") : "queued",
    }));
  }

  function emit(config) {
    const activeNode = config.activeNode ?? null;
    const activeNodes = config.activeNodes || [];
    const queue = config.queue || [];
    const currentSubtotal = activeNode === null || subtotal[activeNode] === null
      ? "—"
      : subtotal[activeNode];
    const currentRemainder = activeNode === null || remainder[activeNode] === null
      ? "—"
      : remainder[activeNode];
    return tracer.emit({
      phaseIndex: config.phaseIndex,
      title: config.title,
      note: config.note,
      action: config.action,
      formula: config.formula,
      codeLines: config.codeLines,
      vars: [
        { name: bi("node", "node"), value: activeNode === null ? "—" : activeNode },
        { name: bi("subtotal", "subtotal"), value: currentSubtotal },
        { name: bi("phần dư", "remainder"), value: currentRemainder },
        { name: bi("số component", "components"), value: componentCount },
        { name: bi("cạnh đã cắt", "cut edges"), value: cutEdges.size },
      ],
      arr: values,
      sub: values.map((value, node) => {
        if (subtotal[node] === null) return `u${node}: v=${value}, pending`;
        if (componentRoots.has(node)) return `u${node}: sum=${subtotal[node]}, cut/up=0`;
        return `u${node}: sum=${subtotal[node]}, r=${remainder[node]}, up=${contribution[node] ?? "?"}`;
      }),
      highlight: [...new Set([...activeNodes, ...(activeNode === null ? [] : [activeNode])])],
      mark: [...processed],
      metrics: [
        { label: bi("Số node", "Nodes"), value: `${n}/${LIMITS.maxNodes}` },
        { label: bi("k", "k"), value: k },
        { label: bi("Tổng values", "Values total"), value: total, state: "info" },
        { label: bi("Đã xử lý", "Processed"), value: `${processed.size}/${n}` },
        { label: bi("Component", "Components"), value: componentCount, state: componentCount ? "success" : "muted" },
        { label: bi("Cạnh cắt", "Cut edges"), value: cutEdges.size, state: cutEdges.size ? "danger" : "muted" },
        { label: bi("Subtotal hiện tại", "Current subtotal"), value: currentSubtotal },
        { label: bi("Phần dư hiện tại", "Current remainder"), value: currentRemainder },
      ],
      graph: makeGraph({
        activeNode,
        activeNodes,
        activeEdge: config.activeEdge,
        queue,
      }),
      table: makeTable({ activeNode, activeNodes }),
      queue: makeQueue(queue, activeNode),
      groups: makeGroups(config),
      sequence: makeSequence(activeNode),
      final: Boolean(config.final),
      answer: config.final ? componentCount : null,
    });
  }

  function emitDetail(config) {
    if (detailedEvents >= LIMITS.maxDetailedTraceEvents) {
      if (!detailTraceStopped) {
        tracer.truncate();
        detailTraceStopped = true;
      }
      return false;
    }
    detailedEvents += 1;
    return emit(config);
  }

  emit({
    phaseIndex: 0,
    title: bi("Cây đầu vào hợp lệ", "The input tree is valid"),
    note: bi(
      "Parser đã xác nhận n=values.length, đúng n−1 cạnh, mọi endpoint hợp lệ, không chu trình, liên thông, k>0 và tổng values chia hết cho k.",
      "The parser verified n=values.length, exactly n−1 edges, valid endpoints, acyclicity, connectivity, k>0, and a values total divisible by k.",
    ),
    action: bi("Định hướng cây tổng quát từ gốc u0.", "Orient the general tree from root u0."),
    formula: bi(`|V|=${n}; |E|=${edges.length}; Σvalues=${total}`, `|V|=${n}; |E|=${edges.length}; Σvalues=${total}`),
    codeLines: [7, 8, 9, 10, 12, 13],
    activeNode: 0,
    activeNodes: [0],
    queue: tree.order,
  });

  emit({
    phaseIndex: 1,
    title: bi("Đã tạo thứ tự hậu tự", "Built the postorder"),
    note: bi(
      "DFS dùng stack để tạo thứ tự parent-trước-child; đảo thứ tự đó bảo đảm mọi child được tính trước parent.",
      "Stack-based DFS creates parent-before-child order; reversing it guarantees every child is computed before its parent.",
    ),
    action: bi("Đảo DFS order để xử lý từ lá lên gốc.", "Reverse DFS order to process leaves toward the root."),
    formula: bi(`postorder = [${postorder.join(", ")}]`, `postorder = [${postorder.join(", ")}]`),
    codeLines: [14, 15, 16, 17, 18, 19, 20, 21, 22, 26],
    activeNode: postorder[0],
    activeNodes: [postorder[0]],
    queue: postorder,
  });

  for (let orderIndex = 0; orderIndex < postorder.length; orderIndex += 1) {
    const node = postorder[orderIndex];
    let runningSubtotal = values[node];
    subtotal[node] = runningSubtotal;
    remainder[node] = runningSubtotal % k;
    const childContributions = [];

    for (const child of tree.children[node]) {
      if (contribution[child] === null) {
        throw new Error(`#${PROBLEM_ID}: child u${child} must be complete before parent u${node}`);
      }
      const before = runningSubtotal;
      runningSubtotal += contribution[child];
      subtotal[node] = runningSubtotal;
      remainder[node] = runningSubtotal % k;
      childContributions.push({ parent: node, child, value: contribution[child] });
      emitDetail({
        phaseIndex: 2,
        title: bi(`Gộp u${child} vào u${node}`, `Merge u${child} into u${node}`),
        note: contribution[child] === 0
          ? bi(
            `Subtree tại u${child} đã tạo component chia hết nên cạnh phía trên bị cắt và đóng góp 0.`,
            `The subtree at u${child} already formed a divisible component, so its parent edge is cut and it contributes 0.`,
          )
          : bi(
            `Component mở tại u${child} chưa chia hết; đẩy toàn bộ subtotal ${contribution[child]} lên parent.`,
            `The open component at u${child} is not yet divisible; send its full subtotal ${contribution[child]} to the parent.`,
          ),
        action: bi("Cộng contribution của child vào subtotal.", "Add the child contribution to the subtotal."),
        formula: bi(
          `subtotal[${node}] = ${before} + ${contribution[child]} = ${runningSubtotal}`,
          `subtotal[${node}] = ${before} + ${contribution[child]} = ${runningSubtotal}`,
        ),
        codeLines: [27, 28, 29, 30],
        activeNode: node,
        activeNodes: [node, child],
        activeEdge: [node, child],
        queue: [node, ...postorder.slice(orderIndex + 1)],
        childContributions,
      });
    }

    const divisible = runningSubtotal % k === 0;
    remainder[node] = runningSubtotal % k;
    contribution[node] = divisible ? 0 : runningSubtotal;
    processed.add(node);

    if (divisible) {
      componentCount += 1;
      componentRoots.add(node);
      completedComponents.push({ root: node, sum: runningSubtotal });
      const parent = tree.parent[node];
      if (parent !== -1) {
        const key = undirectedKey(parent, node);
        cutEdges.add(key);
        cutRecords.push({ parent, child: node, sum: runningSubtotal });
      }
      emitDetail({
        phaseIndex: 3,
        title: parent === -1
          ? bi(`Khép component gốc tại u${node}`, `Close the root component at u${node}`)
          : bi(`Cắt cạnh u${parent}—u${node}`, `Cut edge u${parent}—u${node}`),
        note: parent === -1
          ? bi(
            "Component còn lại chứa gốc cũng chia hết cho k; không có cạnh cha để cắt.",
            "The remaining root component is also divisible by k; it has no parent edge to cut.",
          )
          : bi(
            "Subtotal chia hết cho k tạo một component độc lập; gửi 0 lên parent để loại component này khỏi các tổng phía trên.",
            "A subtotal divisible by k forms an independent component; send 0 upward to remove it from ancestor totals.",
          ),
        action: bi("Tăng components và cắt contribution lên parent.", "Increment components and cut the contribution to the parent."),
        formula: bi(
          `${runningSubtotal} mod ${k} = 0 ⇒ components=${componentCount}, up[${node}]=0`,
          `${runningSubtotal} mod ${k} = 0 ⇒ components=${componentCount}, up[${node}]=0`,
        ),
        codeLines: [31, 32, 33],
        activeNode: node,
        activeNodes: [node],
        activeEdge: parent === -1 ? null : [parent, node],
        queue: [node, ...postorder.slice(orderIndex + 1)],
        childContributions,
      });
    } else {
      emitDetail({
        phaseIndex: 2,
        title: bi(`Giữ component mở tại u${node}`, `Keep the component at u${node} open`),
        note: bi(
          `Subtotal còn dư ${remainder[node]}, nên toàn bộ ${runningSubtotal} tiếp tục được đẩy lên parent.`,
          `The subtotal leaves remainder ${remainder[node]}, so the full ${runningSubtotal} continues to the parent.`,
        ),
        action: bi("Lưu subtotal làm contribution lên parent.", "Store the subtotal as the parent contribution."),
        formula: bi(
          `${runningSubtotal} mod ${k} = ${remainder[node]} ⇒ up[${node}]=${runningSubtotal}`,
          `${runningSubtotal} mod ${k} = ${remainder[node]} ⇒ up[${node}]=${runningSubtotal}`,
        ),
        codeLines: [31, 34, 35],
        activeNode: node,
        activeNodes: [node],
        queue: [node, ...postorder.slice(orderIndex + 1)],
        childContributions,
      });
    }
  }

  if (contribution[0] !== 0 || remainder[0] !== 0) {
    throw new Error(`#${PROBLEM_ID}: divisible total must close the root component`);
  }
  if (cutEdges.size !== componentCount - 1) {
    throw new Error(`#${PROBLEM_ID}: component and cut counts are inconsistent`);
  }

  finalComponents = collectFinalComponents(tree, values, cutEdges);
  if (finalComponents.length !== componentCount
    || finalComponents.some((component) => component.sum % k !== 0)
    || finalComponents.reduce((sum, component) => sum + component.sum, 0) !== total) {
    throw new Error(`#${PROBLEM_ID}: reconstructed components violate the divisibility invariant`);
  }

  emit({
    phaseIndex: 4,
    title: bi(
      `Số component lớn nhất = ${componentCount}`,
      `Maximum component count = ${componentCount}`,
    ),
    note: tracer.truncated
      ? bi(
        `Trace chi tiết đã được giới hạn ở ${LIMITS.maxDetailedTraceEvents} sự kiện, nhưng DFS, mọi subtotal, mọi cạnh cắt và đáp án vẫn được tính đầy đủ.`,
        `Detailed tracing was capped at ${LIMITS.maxDetailedTraceEvents} events, but DFS, every subtotal, every cut, and the answer were still computed in full.`,
      )
      : bi(
        "Mỗi component dựng lại đều có tổng chia hết cho k. Cắt thêm cạnh sẽ phá ít nhất một component hợp lệ, nên postorder greedy đạt cực đại.",
        "Every reconstructed component has a sum divisible by k. Any extra cut would break at least one valid component, so the postorder greedy result is maximal.",
      ),
    action: bi("Trả về số component đã khép.", "Return the number of closed components."),
    formula: bi(
      `answer=${componentCount}; cuts=${cutEdges.size}; components=cuts+1`,
      `answer=${componentCount}; cuts=${cutEdges.size}; components=cuts+1`,
    ),
    codeLines: [36],
    activeNode: null,
    activeNodes: [],
    queue: [],
    childContributions: [],
    final: true,
  });

  return {
    original: {
      n,
      edges: edges.map((edge) => [...edge]),
      values: [...values],
      k,
    },
    answer: componentCount,
    steps: tracer.finish(),
  };
}

module.exports = {
  2872: {
    id: 2872,
    difficulty: "hard",
    slug: "maximum-number-of-k-divisible-components",
    category: { key: "binary-tree", vi: "Cây tổng quát", en: "General Tree" },
    tags: [
      { key: "tree", vi: "Cây", en: "Tree" },
      { key: "dfs", vi: "DFS", en: "DFS" },
      { key: "postorder", vi: "Hậu tự", en: "Postorder" },
      { key: "greedy", vi: "Tham lam", en: "Greedy" },
    ],
    title: bi(
      "Số component chia hết cho k lớn nhất",
      "Maximum Number of K-Divisible Components",
    ),
    titleVi: bi(
      "Cắt cây tối đa bằng tổng cây con chia hết",
      "Maximize tree cuts with divisible subtree sums",
    ),
    statement: bi(
      "Cho cây vô hướng n node, values[u] tại mỗi node và số dương k. Cắt một số cạnh để tối đa hóa số component sao cho tổng values trong mọi component đều chia hết cho k.",
      "Given an undirected n-node tree, a value at each node, and positive k, remove edges to maximize the number of components whose value sums are all divisible by k.",
    ),
    defaultInput: DEFAULT_EDGES,
    defaults: { input: DEFAULT_EDGES, values: DEFAULT_VALUES, k: DEFAULT_K },
    inputKind: "string",
    inputLabel: bi(
      "edges [u,v] (JSON hoặc u,v;u,v)",
      "edges [u,v] (JSON or u,v;u,v)",
    ),
    extraParams: [
      {
        key: "values",
        type: "string",
        default: DEFAULT_VALUES,
        label: bi("values theo node", "values by node"),
      },
      {
        key: "k",
        type: "number",
        min: 1,
        max: LIMITS.maxK,
        default: DEFAULT_K,
        label: bi("k (ước số dương)", "k (positive divisor)"),
      },
    ],
    visualizationLimits: { ...LIMITS },
    approach: [
      bi(
        "Dùng DFS stack từ gốc 0 để định hướng cây tổng quát và lấy thứ tự parent-trước-child; đảo thứ tự thành postorder.",
        "Use stack-based DFS from root 0 to orient the general tree and obtain parent-before-child order; reverse it into postorder.",
      ),
      bi(
        "Tại u, cộng values[u] với contribution của mọi child đã xử lý; child component đã cắt đóng góp 0.",
        "At u, add values[u] and every processed child's contribution; an already cut child component contributes 0.",
      ),
      bi(
        "Nếu subtotal chia hết cho k, tăng số component và trả contribution 0; ngược lại đẩy toàn bộ subtotal lên parent.",
        "If the subtotal is divisible by k, increment the component count and return contribution 0; otherwise send the full subtotal to the parent.",
      ),
      bi(
        "Vì tổng toàn cây chia hết cho k, component chứa gốc luôn khép. Mỗi lần khép sớm tạo thêm một component hợp lệ nên kết quả là lớn nhất.",
        "Because the whole-tree total is divisible by k, the root component always closes. Every earliest closure creates one additional valid component, making the result maximal.",
      ),
    ],
    complexity: {
      time: "O(n)",
      space: "O(n)",
      note: bi(
        "Mỗi node và cạnh được xử lý số lần hằng số. Trace semantic bị giới hạn, nhưng toàn bộ DFS và phép tính đáp án luôn hoàn tất.",
        "Each node and edge is processed a constant number of times. Semantic tracing is bounded, while the full DFS and answer computation always complete.",
      ),
    },
    code: SOURCE,
    debugMode: "semantic",
    parser: parseMaximumKDivisibleComponents2872Input,
    parseMaximumKDivisibleComponents2872Input,
    liveArgs(input, params = {}) {
      const parsed = parseMaximumKDivisibleComponents2872Input(input, params);
      return [
        parsed.n,
        parsed.edges.map((edge) => [...edge]),
        [...parsed.values],
        parsed.k,
      ];
    },
    builder: buildSteps2872,
  },
};
