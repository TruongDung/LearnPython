"use strict";

const bi = (vi, en) => ({ vi, en });
const CODE = [
  "class Solution:",
  "    def sortItems(self, n, m, group, beforeItems):",
  "        nextGroup = m",
  "        for item in range(n):",
  "            if group[item] == -1:",
  "                group[item] = nextGroup; nextGroup += 1",
  "        itemGraph = [[] for _ in range(n)]",
  "        groupGraph = [[] for _ in range(nextGroup)]",
  "        itemIn = [0] * n; groupIn = [0] * nextGroup",
  "        for item in range(n):",
  "            for prev in beforeItems[item]:",
  "                itemGraph[prev].append(item); itemIn[item] += 1",
  "                if group[prev] != group[item] and group[item] not in groupGraph[group[prev]]:",
  "                    groupGraph[group[prev]].append(group[item]); groupIn[group[item]] += 1",
  "        def topo(nodes, graph, indegree):",
  "            queue = [x for x in nodes if indegree[x] == 0]",
  "            order = []",
  "            while queue:",
  "                cur = queue.pop(0); order.append(cur)",
  "                for nxt in graph[cur]:",
  "                    indegree[nxt] -= 1",
  "                    if indegree[nxt] == 0: queue.append(nxt)",
  "            return order",
  "        groupOrder = topo(all groups, groupGraph, groupIn)",
  "        if len(groupOrder) != nextGroup: return []",
  "        result = []",
  "        for g in groupOrder:",
  "            members = items in group g",
  "            itemOrder = topo(members, itemGraph, itemIn)",
  "            if len(itemOrder) != len(members): return []",
  "            result.extend(itemOrder)",
  "        return result",
];

function parseInput(input, params = {}) {
  let n = Number(params.n ?? 8); let m = Number(params.m ?? 2);
  let groupText = params.group ?? "-1,-1,1,0,0,1,0,-1";
  let beforeText = input;
  if (input && typeof input === "object" && !Array.isArray(input)) {
    n = Number(input.n ?? n); m = Number(input.m ?? m);
    groupText = input.group ?? groupText; beforeText = input.beforeItems ?? "";
  }
  const group = Array.isArray(groupText) ? groupText.map(Number) : String(groupText).split(/[\s,]+/).filter(Boolean).map(Number);
  const beforeItems = Array.isArray(beforeText)
    ? beforeText.map((row) => Array.isArray(row) ? row.map(Number) : [])
    : String(beforeText ?? "").split("|").map((row) => row.trim() ? row.split(/[\s,]+/).filter(Boolean).map(Number) : []);
  if (!Number.isInteger(n) || n < 1 || n > 10 || !Number.isInteger(m) || m < 0 || m > 5
    || group.length !== n || group.some((g) => !Number.isInteger(g) || g < -1 || g >= m)
    || beforeItems.length !== n || beforeItems.some((row) => row.some((p) => !Number.isInteger(p) || p < 0 || p >= n))
    || beforeItems.reduce((sum, row) => sum + row.length, 0) > 22) {
    throw new RangeError("#1203: Use n=1–10, m=0–5, n group ids (-1 or 0…m−1), and n dependency cells separated by | (e.g. |6|5|6|3,6|||).");
  }
  return { n, m, group, beforeItems };
}

function buildSteps(input, params = {}) {
  const { n, m, group: initialGroup, beforeItems } = parseInput(input, params);
  const group = [...initialGroup]; let nextGroup = m;
  const itemGraph = Array.from({ length: n }, () => []); let groupGraph = [];
  const itemIn = Array(n).fill(0); let groupIn = [];
  const edges = []; const groupEdges = []; const steps = [];
  let phase = "start", lineItem = null, activeEdge = null, activeGroup = null;
  let queue = [], order = [], groupOrder = [], result = [], answer = null, failed = null, layer = "group";
  function emit(line, titleVi, titleEn, final = false) {
    const members = Array.from({ length: nextGroup }, (_, g) => Array.from({ length: n }, (_, i) => i).filter((i) => group[i] === g));
    steps.push({
      title: bi(titleVi, titleEn), note: bi("", ""), arr: [], highlight: lineItem === null ? [] : [lineItem], mark: [], codeLines: [line], final,
      vars: [{ name: "group", value: group.map((g) => `G${g}`).join(" ") }, { name: "queue", value: queue.length ? queue.join(" → ") : "∅" }, { name: "order", value: order.length ? order.join(" → ") : "∅" }, { name: "result", value: result.length ? result.join(" → ") : "∅" }],
      sortItemsGroups1203View: { n, m, group: [...group], members, itemGraph: itemGraph.map((a) => [...a]), groupGraph: groupGraph.map((a) => [...a]), itemIn: [...itemIn], groupIn: [...groupIn], edges: edges.map((e) => ({ ...e })), groupEdges: groupEdges.map((e) => ({ ...e })), phase, lineItem, activeEdge: activeEdge ? { ...activeEdge } : null, activeGroup, queue: [...queue], order: [...order], groupOrder: [...groupOrder], result: [...result], layer, answer: answer ? [...answer] : answer, failed },
    });
  }
  emit(1, "Bắt đầu", "Start"); emit(2, "Đọc các món và ràng buộc", "Read items and constraints");
  emit(3, "Nhóm mới bắt đầu từ m", "New groups start at m");
  for (let item = 0; item < n; item++) {
    lineItem = item; emit(4, `Xét món ${item}`, `Check item ${item}`);
    emit(5, group[item] === -1 ? `Món ${item} chưa có nhóm` : `Món ${item} thuộc G${group[item]}`, group[item] === -1 ? `Item ${item} has no group` : `Item ${item} is in G${group[item]}`);
    if (group[item] === -1) { group[item] = nextGroup; emit(6, `Đặt món ${item} vào G${nextGroup}`, `Put item ${item} in G${nextGroup}`); nextGroup++; }
  }
  lineItem = null; emit(7, "Tạo đồ thị món", "Create item graph");
  groupGraph = Array.from({ length: nextGroup }, () => []); emit(8, "Tạo đồ thị nhóm", "Create group graph");
  groupIn = Array(nextGroup).fill(0); emit(9, "Đếm bậc vào", "Count incoming edges");
  for (let item = 0; item < n; item++) {
    lineItem = item; emit(10, `Xét món ${item}`, `Check item ${item}`);
    for (const prev of beforeItems[item]) {
      activeEdge = { from: prev, to: item }; emit(11, `${prev} phải trước ${item}`, `${prev} must come before ${item}`);
      itemGraph[prev].push(item); itemIn[item]++; edges.push({ from: prev, to: item, status: "active" });
      emit(12, `Thêm mũi tên ${prev} → ${item}`, `Add arrow ${prev} → ${item}`);
      activeEdge.status = "done";
      if (group[prev] !== group[item] && !groupGraph[group[prev]].includes(group[item])) {
        const from = group[prev], to = group[item]; groupGraph[from].push(to); groupIn[to]++;
        groupEdges.push({ from, to, status: "done" }); emit(14, `G${from} → G${to}`, `G${from} → G${to}`);
      } else if (group[prev] === group[item]) emit(13, `Cùng nhóm G${group[item]} · không cần mũi tên nhóm`, `Same group G${group[item]} · no group arrow`);
      else emit(13, `Mũi tên nhóm đã có`, `Group arrow already exists`);
      activeEdge = null;
    }
  }
  lineItem = null; layer = "group"; phase = "topo"; queue = Array.from({ length: nextGroup }, (_, g) => g).filter((g) => groupIn[g] === 0); order = [];
  emit(15, "Hàm topo sắp nút theo bậc vào", "Topological sort helper");
  emit(16, "Nhóm có bậc vào 0 vào hàng đợi", "Queue groups with 0 incoming edges"); emit(17, "Danh sách nhóm đã xếp rỗng", "Start empty group order");
  emit(24, "Bắt đầu xếp nhóm", "Start ordering groups");
  while (queue.length) {
    emit(18, "Còn nhóm sẵn sàng", "Ready groups remain");
    const g = queue.shift(); activeGroup = g; order.push(g); emit(19, `Lấy G${g} khỏi hàng đợi`, `Take G${g} from queue`);
    for (const nxt of groupGraph[g]) {
      emit(20, `Theo mũi tên tới G${nxt}`, `Follow arrow to G${nxt}`);
      groupIn[nxt]--; emit(21, `G${nxt}: bậc vào còn ${groupIn[nxt]}`, `G${nxt}: ${groupIn[nxt]} incoming`);
      if (groupIn[nxt] === 0) { queue.push(nxt); emit(22, `G${nxt} sẵn sàng`, `G${nxt} is ready`); }
    }
  }
  emit(23, "Hàng đợi đã hết", "Queue is empty");
  emit(25, order.length !== nextGroup ? "Nhóm có chu trình ✕" : "Tất cả nhóm đã xếp ✓", order.length !== nextGroup ? "Group cycle ✕" : "All groups ordered ✓");
  if (order.length !== nextGroup) { failed = "group"; answer = []; emit(26, "Không thể xếp các nhóm", "Groups cannot be ordered", true); return { original: { n, m, group: initialGroup, beforeItems }, answer, steps }; }
  groupOrder = [...order];
  emit(26, "Tạo danh sách kết quả", "Start result list");
  result = [];
  for (const g of groupOrder) {
    emit(27, `Tới nhóm G${g}`, `Visit group G${g}`);
    activeGroup = g; layer = "item"; queue = Array.from({ length: n }, (_, i) => i).filter((i) => group[i] === g && itemIn[i] === 0); order = [];
    const count = group.filter((x) => x === g).length;
    emit(28, `Món thuộc G${g}`, `Items in G${g}`);
    emit(29, `Sắp các món trong G${g}`, `Order items in G${g}`);
    emit(16, "Món có bậc vào 0 vào hàng đợi", "Queue items with 0 incoming edges"); emit(17, "Danh sách món đã xếp rỗng", "Start empty item order");
    while (queue.length) {
      emit(18, "Còn món sẵn sàng", "Ready items remain");
      const item = queue.shift(); lineItem = item; order.push(item); emit(19, `Chọn món ${item}`, `Take item ${item}`);
      for (const nxt of itemGraph[item]) {
        emit(20, `Theo mũi tên tới ${nxt}`, `Follow arrow to ${nxt}`);
        itemIn[nxt]--; activeEdge = { from: item, to: nxt }; emit(21, `${nxt}: bậc vào còn ${itemIn[nxt]}`, `${nxt}: ${itemIn[nxt]} incoming`);
        if (itemIn[nxt] === 0 && group[nxt] === g) { queue.push(nxt); emit(22, `Món ${nxt} sẵn sàng`, `Item ${nxt} is ready`); }
      }
      if (group[item] === g) result.push(item);
    }
    emit(23, "Hàng đợi đã hết", "Queue is empty");
    if (order.length !== count) { failed = `item-${g}`; answer = []; emit(30, `Chu trình món trong G${g} ✕`, `Item cycle in G${g} ✕`); emit(30, "Không thể xếp các món", "Items cannot be ordered", true); return { original: { n, m, group: initialGroup, beforeItems }, answer, steps }; }
    emit(30, `Mọi món trong G${g} đã xếp`, `All items in G${g} are ordered`);
    emit(31, `G${g} đã xếp ✓`, `G${g} ordered ✓`);
  }
  answer = [...result]; lineItem = null; activeEdge = null; phase = "done"; emit(32, "Thứ tự hợp lệ ✓", "Valid order ✓", true);
  return { original: { n, m, group: initialGroup, beforeItems }, answer, steps };
}

module.exports = { 1203: {
  id: 1203, slug: "sort-items-by-groups-respecting-dependencies", difficulty: "hard", category: { key: "graph", vi: "Đồ thị", en: "Graph" },
  tags: [{ key: "graph", vi: "Đồ thị", en: "Graph" }, { key: "topological-sort", vi: "Sắp xếp topo", en: "Topological Sort" }],
  title: bi("Sort Items by Groups Respecting Dependencies", "Sort Items by Groups Respecting Dependencies"), titleVi: bi("Xếp món theo nhóm và phụ thuộc", "Sort items by groups and dependencies"),
  statement: bi("Xếp các món sao cho món cần trước đứng trước, đồng thời mỗi nhóm nằm liền nhau.", "Order items so prerequisites come first and every group stays together."),
  defaultInput: "|6|5|6|3,6|||", inputKind: "string", inputLabel: bi("beforeItems · mỗi món ngăn bằng |", "beforeItems · separate items with |"),
  extraParams: [{ key: "n", label: bi("n · số món", "n · items"), default: 8, min: 1, max: 10 }, { key: "m", label: bi("m · nhóm ban đầu", "m · initial groups"), default: 2, min: 0, max: 5 }, { key: "group", label: bi("group · id nhóm, -1 = tự tạo", "group · id, -1 = new group"), default: "-1,-1,1,0,0,1,0,-1", type: "string" }],
  debugMode: "line-by-line", approach: [bi("Mỗi món chưa nhóm được cấp nhóm riêng.", "Give each ungrouped item its own group."), bi("Xếp DAG nhóm trước, rồi xếp DAG món bên trong từng nhóm.", "Topologically order groups, then items inside each group.")],
  complexity: { time: "O(n + E)", space: "O(n + E)", note: bi("Tối đa 10 món để mũi tên luôn rõ.", "Up to 10 items keep arrows readable.") },
  code: CODE, builder: buildSteps, liveArgs: (input, params) => [parseInput(input, params)],
} };
