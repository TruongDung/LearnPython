"use strict";

const SA9018_SOURCE = Object.freeze([
  "from heapq import heapify, heappop, heappush", "", "class ServerAllocator:",
  "    def __init__(self, existing_inventory):", "        self.init(existing_inventory)", "", "    @staticmethod",
  "    def _split(name):", "        server_type, number = name.rsplit(\"-\", 1)", "        return server_type, int(number)", "",
  "    def init(self, existing_inventory):", "        self.used = {}", "        self.free = {}", "        self.next_id = {}",
  "        for name in existing_inventory:", "            server_type, number = self._split(name)",
  "            self.used.setdefault(server_type, set()).add(number)", "        for server_type, numbers in self.used.items():",
  "            next_id = max(numbers) + 1", "            gaps = [number for number in range(1, next_id)",
  "                    if number not in numbers]", "            heapify(gaps)", "            self.free[server_type] = gaps",
  "            self.next_id[server_type] = next_id", "", "    def allocate(self, server_type):",
  "        self.used.setdefault(server_type, set())", "        self.free.setdefault(server_type, [])",
  "        self.next_id.setdefault(server_type, 1)", "        if self.free[server_type]:",
  "            number = heappop(self.free[server_type])", "        else:", "            number = self.next_id[server_type]",
  "            self.next_id[server_type] += 1", "        self.used[server_type].add(number)",
  "        return f\"{server_type}-{number}\"", "", "    def deallocate(self, name):",
  "        server_type, number = self._split(name)", "        numbers = self.used.get(server_type)",
  "        if numbers is None or number not in numbers:", "            return", "        numbers.remove(number)",
  "        heappush(self.free[server_type], number)",
]);

const SA9018_EVENTS = new Set([
  "import-heap", "bind-class", "construct", "call-init", "reset-state", "select-inventory-name", "split-name",
  "record-used", "inventory-loop-complete", "select-type", "compute-next-id", "find-gaps", "heapify-gaps",
  "store-free-heap", "store-next-id", "init-complete", "allocate-request", "ensure-used", "ensure-free",
  "ensure-next-id", "free-check-true", "free-check-false", "pop-gap", "take-fresh", "advance-next-id",
  "mark-used", "return-name", "deallocate-request", "split-deallocation", "lookup-type", "missing-check-true",
  "missing-check-false", "ignore-missing", "remove-used", "push-gap", "simulation-complete",
]);
const SA9018_PHASES = Object.freeze(["setup", "init-scan", "init-heaps", "allocate", "deallocate", "done"]);
const SA9018_COUNTERS = Object.freeze([
  ["inventoryScans", "Inventory scans", "Lần quét inventory"],
  ["gapsFound", "Initial gaps", "Khoảng trống ban đầu"],
  ["heapBuilds", "Heap builds", "Lần tạo heap"],
  ["heapPops", "Gap reuses", "Lần tái sử dụng"],
  ["freshIds", "Fresh IDs", "ID mới"],
  ["heapPushes", "Released IDs", "ID đã trả"],
  ["allocateCalls", "allocate calls", "Lệnh allocate"],
  ["deallocateCalls", "deallocate calls", "Lệnh deallocate"],
  ["noOps", "Safe no-ops", "No-op an toàn"],
]);
const SA9018_TEXT = Object.freeze({
  en: Object.freeze({
    kicker: "DESIGN 9018 · HASH MAP + MIN-HEAP", fallback: "Server Name Allocator", line: "LINE",
    before: "before execution", after: "after execution", source: "Current source action", phase: "Phase",
    event: "Runtime event", condition: "Condition", noCondition: "No condition on this frame.", yes: "TRUE", no: "FALSE",
    flow: "Lifecycle", setup: "Set up", scan: "Scan inventory", heaps: "Build gap heaps", allocate: "Allocate",
    deallocate: "Deallocate", done: "Done", current: "Current operation", currentHelp: "The candidate is chosen independently inside one server type.",
    argument: "argument", status: "status", expected: "smallest before call", selected: "selected number", result: "result",
    sourceKind: "ID source", pending: "pending", none: "None", types: "Per-type allocator state",
    typesHelp: "Used IDs stay occupied. Reusable gaps live in a min-heap. next_id is the first never-issued number.",
    used: "allocated / used", free: "free min-heap (array order)", available: "sorted reusable IDs", next: "next fresh",
    smallest: "smallest available", numberLine: "Positive ID line", noUsed: "No allocated IDs", noFree: "Heap empty",
    fresh: "fresh", reusable: "reusable", occupied: "used", history: "Operation ledger", historyHelp: "Completed public-method calls and their outputs.",
    index: "#", operation: "operation", strategy: "path", output: "output", finalInventory: "Final inventory",
    noHistory: "No operation has completed yet.", outputs: "Method outputs", invariants: "Trace invariants",
    heapInvariant: "every free array is a valid min-heap", uniqueInvariant: "all IDs are positive and unique per set",
    disjointInvariant: "used and free are disjoint", coverageInvariant: "every issued ID is tracked",
    cursorInvariant: "next_id stays above issued IDs", minimumInvariant: "allocation selects the pre-call minimum",
    counters: "Operation counters", note: "Why this frame matters", valid: "valid", broken: "broken", noTypes: "No server types yet",
  }),
  vi: Object.freeze({
    kicker: "THIẾT KẾ 9018 · HASH MAP + MIN-HEAP", fallback: "Server Name Allocator", line: "DÒNG",
    before: "trước khi chạy", after: "sau khi chạy", source: "Thao tác mã nguồn hiện tại", phase: "Giai đoạn",
    event: "Sự kiện runtime", condition: "Điều kiện", noCondition: "Frame này không có điều kiện.", yes: "ĐÚNG", no: "SAI",
    flow: "Vòng đời", setup: "Thiết lập", scan: "Quét inventory", heaps: "Tạo gap heap", allocate: "Cấp phát",
    deallocate: "Giải phóng", done: "Hoàn tất", current: "Thao tác hiện tại", currentHelp: "Candidate được chọn độc lập trong một loại server.",
    argument: "đối số", status: "trạng thái", expected: "nhỏ nhất trước lệnh", selected: "số đã chọn", result: "kết quả",
    sourceKind: "nguồn ID", pending: "đang chờ", none: "None", types: "Trạng thái allocator theo loại",
    typesHelp: "ID used đang bị chiếm. Khoảng trống tái sử dụng nằm trong min-heap. next_id là số đầu tiên chưa từng cấp.",
    used: "đang cấp / used", free: "free min-heap (thứ tự mảng)", available: "ID tái sử dụng đã sort", next: "ID mới kế tiếp",
    smallest: "nhỏ nhất khả dụng", numberLine: "Dòng ID dương", noUsed: "Không có ID đang cấp", noFree: "Heap rỗng",
    fresh: "mới", reusable: "tái sử dụng", occupied: "đang dùng", history: "Sổ thao tác", historyHelp: "Các public-method call đã hoàn tất và output.",
    index: "#", operation: "thao tác", strategy: "đường đi", output: "output", finalInventory: "Inventory cuối",
    noHistory: "Chưa có thao tác nào hoàn tất.", outputs: "Kết quả method", invariants: "Bất biến trace",
    heapInvariant: "mọi mảng free là min-heap hợp lệ", uniqueInvariant: "mọi ID dương và duy nhất trong từng tập",
    disjointInvariant: "used và free không giao nhau", coverageInvariant: "mọi ID đã cấp đều được theo dõi",
    cursorInvariant: "next_id luôn cao hơn ID đã cấp", minimumInvariant: "allocation chọn minimum trước lệnh",
    counters: "Bộ đếm thao tác", note: "Ý nghĩa của frame này", valid: "hợp lệ", broken: "lỗi", noTypes: "Chưa có loại server",
  }),
});

function sa9018Escape(value) {
  return String(value == null ? "" : value)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
function sa9018Locale() { return typeof lang !== "undefined" && lang === "vi" ? "vi" : "en"; }
function sa9018Int(value, minimum, maximum) {
  return Number.isSafeInteger(value) && value >= minimum && value <= maximum ? value : null;
}
function sa9018Text(value, locale, fallback = "") {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return String(value[locale] ?? value.en ?? value.vi ?? fallback).slice(0, 600);
  }
  return typeof value === "string" ? value.slice(0, 600) : fallback;
}
function sa9018Name(value) { return typeof value === "string" ? value.slice(0, 64) : ""; }
function sa9018Ids(value) {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.slice(0, 64).map((item) => sa9018Int(item, 1, 64)).filter((item) => item !== null))];
}
function sa9018Nullable(value) {
  if (value === null) return null;
  return typeof value === "string" ? value.slice(0, 64) : null;
}
function sa9018Normalize(step) {
  const raw = step && step.serverAllocator9018View && typeof step.serverAllocator9018View === "object"
    ? step.serverAllocator9018View : {};
  const sourceRaw = raw.source && typeof raw.source === "object" ? raw.source : {};
  const fallbackLine = step && Array.isArray(step.codeLines) ? step.codeLines[0] : null;
  const line = sa9018Int(sourceRaw.line, 1, SA9018_SOURCE.length)
    ?? sa9018Int(fallbackLine, 1, SA9018_SOURCE.length) ?? 1;
  const inputRaw = raw.input && typeof raw.input === "object" ? raw.input : {};
  const operationRaw = raw.operation && typeof raw.operation === "object" ? raw.operation : {};
  const typeRows = Array.isArray(raw.types) ? raw.types.slice(0, 10) : [];
  const types = typeRows.map((typeRaw) => {
    const used = sa9018Ids(typeRaw && typeRaw.used).sort((left, right) => left - right);
    const heap = sa9018Ids(typeRaw && typeRaw.heap);
    const available = sa9018Ids(typeRaw && typeRaw.available).sort((left, right) => left - right);
    const nextId = sa9018Int(typeRaw && typeRaw.nextId, 1, 64);
    return {
      serverType: sa9018Name(typeRaw && typeRaw.serverType), used, heap, available, nextId,
      smallestAvailable: sa9018Int(typeRaw && typeRaw.smallestAvailable, 1, 64),
    };
  }).filter((type) => type.serverType);
  const operation = {
    index: sa9018Int(operationRaw.index, 0, 19),
    kind: ["init", "allocate", "deallocate"].includes(operationRaw.kind) ? operationRaw.kind : null,
    arg: sa9018Name(operationRaw.arg), serverType: sa9018Name(operationRaw.serverType),
    number: sa9018Int(operationRaw.number, 1, 64), expectedNumber: sa9018Int(operationRaw.expectedNumber, 1, 64),
    nextId: sa9018Int(operationRaw.nextId, 1, 64), candidates: sa9018Ids(operationRaw.candidates).sort((a, b) => a - b),
    source: ["reused", "fresh", "released", "no-op"].includes(operationRaw.source) ? operationRaw.source : null,
    status: sa9018Name(operationRaw.status), result: sa9018Nullable(operationRaw.result),
  };
  const history = (Array.isArray(raw.history) ? raw.history.slice(0, 20) : []).map((entry, index) => ({
    index: sa9018Int(entry && entry.index, 0, 19) ?? index,
    kind: entry && ["allocate", "deallocate"].includes(entry.kind) ? entry.kind : "allocate",
    arg: sa9018Name(entry && entry.arg), serverType: sa9018Name(entry && entry.serverType),
    number: sa9018Int(entry && entry.number, 1, 64), status: sa9018Name(entry && entry.status),
    source: sa9018Name(entry && entry.source), result: sa9018Nullable(entry && entry.result),
  }));
  const invariantRaw = raw.invariants && typeof raw.invariants === "object" ? raw.invariants : {};
  const counterRaw = raw.counters && typeof raw.counters === "object" ? raw.counters : {};
  const counters = {};
  SA9018_COUNTERS.forEach(([key]) => { counters[key] = sa9018Int(counterRaw[key], 0, 10000) ?? 0; });
  return {
    source: { line, text: SA9018_SOURCE[line - 1] },
    event: SA9018_EVENTS.has(raw.event) ? raw.event : "bind-class",
    phase: SA9018_PHASES.includes(raw.phase) ? raw.phase : "setup",
    timing: raw.timing === "before" ? "before" : "after",
    condition: {
      expression: typeof (raw.condition && raw.condition.expression) === "string" ? raw.condition.expression.slice(0, 180) : "",
      result: typeof (raw.condition && raw.condition.result) === "boolean" ? raw.condition.result : null,
    },
    input: {
      inventory: (Array.isArray(inputRaw.inventory) ? inputRaw.inventory.slice(0, 18) : []).map(sa9018Name),
      operations: (Array.isArray(inputRaw.operations) ? inputRaw.operations.slice(0, 20) : []).map(sa9018Name),
    },
    operation, types, history,
    outputs: (Array.isArray(raw.outputs) ? raw.outputs.slice(0, 20) : []).map(sa9018Nullable),
    finalInventory: (Array.isArray(raw.finalInventory) ? raw.finalInventory.slice(0, 64) : []).map(sa9018Name),
    invariants: {
      validMinHeaps: invariantRaw.validMinHeaps === true,
      positiveUniqueIds: invariantRaw.positiveUniqueIds === true,
      usedAndFreeDisjoint: invariantRaw.usedAndFreeDisjoint === true,
      completeCoverage: invariantRaw.completeCoverage === true,
      nextIdAboveKnownIds: invariantRaw.nextIdAboveKnownIds === true,
      smallestAllocationChosen: invariantRaw.smallestAllocationChosen === true,
    },
    counters,
    final: raw.final === true || Boolean(step && step.final),
    title: sa9018Text(step && step.title, sa9018Locale(), SA9018_TEXT[sa9018Locale()].fallback),
    note: sa9018Text(step && step.note, sa9018Locale(), ""),
  };
}
function sa9018EventLabel(event) {
  return event.split("-").map((part) => part ? part[0].toUpperCase() + part.slice(1) : "").join(" ");
}
function sa9018Flow(state, copy) {
  const items = [
    ["setup", copy.setup], ["init-scan", copy.scan], ["init-heaps", copy.heaps],
    ["allocate", copy.allocate], ["deallocate", copy.deallocate], ["done", copy.done],
  ];
  const activeIndex = Math.max(0, items.findIndex(([phase]) => phase === state.phase));
  return `<nav class="sa9018-flow" aria-label="${sa9018Escape(copy.flow)}"><ol>${items.map(([phase, label], index) =>
    `<li class="${index === activeIndex ? "active" : index < activeIndex ? "complete" : ""}"><span>${index < activeIndex ? "✓" : index + 1}</span><strong>${sa9018Escape(label)}</strong><small>${sa9018Escape(phase)}</small></li>`).join("")}</ol></nav>`;
}
function sa9018Source(state, copy) {
  const condition = state.condition.result === null ? copy.noCondition
    : `${state.condition.expression} → ${state.condition.result ? copy.yes : copy.no}`;
  return `<section class="sa9018-source"><div><small>${sa9018Escape(copy.source)}</small><code>${sa9018Escape(state.source.text || " ")}</code></div><dl><div><dt>${sa9018Escape(copy.phase)}</dt><dd>${sa9018Escape(state.phase)}</dd></div><div><dt>${sa9018Escape(copy.event)}</dt><dd>${sa9018Escape(sa9018EventLabel(state.event))}</dd></div><div><dt>${sa9018Escape(copy.condition)}</dt><dd>${sa9018Escape(condition)}</dd></div></dl></section>`;
}
function sa9018Current(state, copy) {
  const operation = state.operation;
  const call = operation.kind ? `${operation.kind}(${operation.arg || "…"})` : "—";
  const result = operation.result === null ? copy.none : operation.result || copy.pending;
  const cards = [
    [copy.argument, operation.arg || "—"], [copy.status, operation.status || copy.pending],
    [copy.expected, operation.expectedNumber ?? "—"], [copy.selected, operation.number ?? "—"],
    [copy.sourceKind, operation.source || "—"], [copy.result, result],
  ];
  return `<section class="sa9018-card sa9018-current"><header><div><h3>${sa9018Escape(copy.current)}</h3><p>${sa9018Escape(copy.currentHelp)}</p></div><code>${sa9018Escape(call)}</code></header><dl>${cards.map(([label, value]) => `<div><dt>${sa9018Escape(label)}</dt><dd>${sa9018Escape(value)}</dd></div>`).join("")}</dl></section>`;
}
function sa9018IdLine(type, state, copy) {
  const selected = state.operation.serverType === type.serverType ? state.operation.number : null;
  const maximum = Math.min(64, Math.max(20, (type.nextId || 1) + 8, selected || 1, ...type.used, ...type.heap));
  const used = new Set(type.used);
  const available = new Set(type.heap);
  const inFlight = ["pop-gap", "take-fresh", "advance-next-id", "remove-used"].includes(state.event);
  return `<div class="sa9018-id-scroll" tabindex="0" aria-label="${sa9018Escape(`${type.serverType}: 1, 2, 3, …, ∞`)}"><ol class="sa9018-id-line">${Array.from({ length: maximum }, (_, index) => {
    const number = index + 1;
    const transit = selected === number && inFlight && !used.has(number) && !available.has(number);
    const status = used.has(number) ? "used" : available.has(number) ? "free" : transit ? "transit"
      : type.nextId !== null && number >= type.nextId ? "fresh" : "unknown";
    const active = selected === number ? " active" : "";
    const label = status === "used" ? copy.occupied : status === "free" ? copy.reusable : status === "fresh" ? copy.fresh
      : status === "transit" ? (sa9018Locale() === "vi" ? "đang chuyển" : "in flight") : "—";
    const marker = number === type.nextId ? "next ↓" : number === type.heap[0] ? "min ↓" : "&nbsp;";
    return `<li class="${status}${active}" data-number="${number}" data-status="${status}" title="${sa9018Escape(`${type.serverType}-${number}: ${label}`)}"><small>${marker}</small><strong>${number}</strong><em>${sa9018Escape(label)}</em></li>`;
  }).join("")}<li class="sa9018-infinity"><strong>… → ∞</strong><em>${sa9018Locale() === "vi" ? "tiếp tục mãi" : "continues forever"}</em></li></ol></div>`;
}
function sa9018HeapTree(type, state, copy) {
  const vi = sa9018Locale() === "vi";
  if (!type.heap.length) return `<div class="sa9018-heap-empty"><strong>∅</strong><span>${sa9018Escape(copy.noFree)}</span><p>${vi ? "deallocate trả ID đang dùng vào heap." : "deallocate returns an allocated ID to the heap."}</p></div>`;
  const levels = Math.floor(Math.log2(type.heap.length)) + 1;
  const width = Math.max(340, 2 ** (levels - 1) * 62);
  const height = levels * 78 + 28;
  const point = (index) => {
    const level = Math.floor(Math.log2(index + 1));
    const slot = index - (2 ** level - 1);
    return { x: width * (slot + 0.5) / 2 ** level, y: 44 + level * 78 };
  };
  const edges = type.heap.map((number, index) => {
    if (!index) return "";
    const parent = point(Math.floor((index - 1) / 2));
    const child = point(index);
    return `<line x1="${parent.x}" y1="${parent.y + 22}" x2="${child.x}" y2="${child.y - 22}" />`;
  }).join("");
  const nodes = type.heap.map((number, index) => {
    const { x, y } = point(index);
    const inserted = state.event === "push-gap" && state.operation.serverType === type.serverType && state.operation.number === number;
    return `<g class="sa9018-heap-node${index === 0 ? " root" : ""}${inserted ? " inserted" : ""}" data-number="${number}" data-index="${index}"><circle cx="${x}" cy="${y}" r="23" /><text x="${x}" y="${y + 5}">${number}</text><text class="sa9018-node-label" x="${x}" y="${y + 38}">${index === 0 ? "MIN / ROOT" : `[${index}]`}</text></g>`;
  }).join("");
  return `<div class="sa9018-heap-scroll" tabindex="0"><svg class="sa9018-heap-tree${type.heap.length <= 7 ? " compact" : ""}" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="${sa9018Escape(`${type.serverType}: ${vi ? "cây min-heap ID trống" : "min-heap of free IDs"}`)}">${edges}${nodes}</svg></div>`;
}
function sa9018Transfer(type, state) {
  const vi = sa9018Locale() === "vi";
  const op = state.operation;
  if (op.serverType !== type.serverType || !["allocate", "deallocate"].includes(op.kind)) return "";
  const number = op.number ?? op.expectedNumber;
  const call = `${op.kind}("${op.arg}")`;
  let from;
  let to;
  let ignored = false;
  if (op.kind === "allocate") {
    from = op.source === "reused" || (!op.source && type.heap.length) ? (vi ? "Gốc min-heap" : "Min-heap root") : (vi ? "Dãy ID mới" : "Fresh ID sequence");
    to = number === null ? "?" : `${type.serverType}-${number}`;
  } else {
    from = op.arg;
    ignored = op.source === "no-op" || ["missing-check-true", "ignore-missing"].includes(state.event);
    to = ignored ? (vi ? "Không được cấp → bỏ qua" : "Not allocated → ignore") : "MIN-HEAP";
  }
  return `<div class="sa9018-transfer" data-event="${state.event}"><b>${sa9018Escape(from)}</b><span>→</span><code>${sa9018Escape(call)}</code><span>${ignored ? "↛" : "→"}</span><b class="sa9018-transfer-result">${sa9018Escape(to)}</b></div>`;
}
function sa9018TypeCard(type, state, copy) {
  const chipList = (values, empty, className, names = false) => values.length
    ? `<ol class="${className}">${values.map((number, index) => `<li class="${index === 0 && className.includes("heap") ? "root" : ""}"><small>${index === 0 && className.includes("heap") ? "min" : names ? `#${number}` : `i=${index}`}</small><strong>${sa9018Escape(names ? `${type.serverType}-${number}` : number)}</strong></li>`).join("")}</ol>`
    : `<p class="sa9018-empty">${sa9018Escape(empty)}</p>`;
  const vi = sa9018Locale() === "vi";
  const tailNote = type.nextId === null ? (vi ? "Đang đọc inventory và xây heap." : "Reading inventory and building the heap.")
    : (vi ? `Từ ${type.nextId} trở đi, mọi ID đều chưa cấp. ID nhỏ hơn được tái sử dụng qua heap.` : `Every ID from ${type.nextId} onward is unallocated. Smaller free IDs are reused through the heap.`);
  return `<article class="sa9018-type ${state.operation.serverType === type.serverType ? "active" : ""}" data-server-type="${sa9018Escape(type.serverType)}"><header><div><small>SERVER TYPE</small><h4>${sa9018Escape(type.serverType)}</h4></div><div><span>${sa9018Escape(copy.smallest)}</span><strong>${type.smallestAvailable ?? "—"}</strong></div></header><div class="sa9018-type-summary"><span>${sa9018Escape(copy.next)} <strong>${type.nextId ?? "—"}</strong></span><span>${sa9018Escape(copy.used)} <strong>${type.used.length}</strong></span><span>${sa9018Escape(copy.free)} <strong>${type.heap.length}</strong></span></div><h5>${sa9018Escape(copy.numberLine)} · 1, 2, 3, …, ∞</h5>${sa9018IdLine(type, state, copy)}<div class="sa9018-id-legend"><span class="used">${sa9018Escape(copy.occupied)}</span><span class="free">${vi ? "Trống trong heap" : "Free in heap"}</span><span class="fresh">${vi ? "ID mới chưa cấp" : "Unallocated fresh ID"}</span></div><p class="sa9018-tail-note">${tailNote}</p>${sa9018Transfer(type, state)}<div class="sa9018-type-columns"><section class="sa9018-heap-panel"><h5>MIN-HEAP · free[${sa9018Escape(type.serverType)}]</h5>${sa9018HeapTree(type, state, copy)}<div class="sa9018-heap-array"><small>${vi ? "Mảng heap" : "Heap array"}</small><code>[${type.heap.join(", ")}]</code></div></section><section class="sa9018-used-panel"><h5>${sa9018Escape(copy.used)}</h5>${chipList(type.used, copy.noUsed, "sa9018-used-list", true)}<p>${vi ? "allocate lấy gốc heap trước; heap rỗng thì dùng next_id. deallocate đưa ID vào heap của đúng loại." : "allocate takes the heap root first; if empty, use next_id. deallocate returns the ID to its own type's heap."}</p></section></div><div class="sa9018-sorted"><span>${sa9018Escape(copy.available)}</span><code>[${type.available.join(", ")}]</code></div></article>`;
}
function sa9018Types(state, copy) {
  const types = [...state.types].sort((left, right) => Number(right.serverType === state.operation.serverType) - Number(left.serverType === state.operation.serverType));
  const body = types.length ? types.map((type) => sa9018TypeCard(type, state, copy)).join("")
    : `<p class="sa9018-empty large">${sa9018Escape(copy.noTypes)}</p>`;
  return `<section class="sa9018-card sa9018-types"><header><div><h3>${sa9018Escape(copy.types)}</h3><p>${sa9018Escape(copy.typesHelp)}</p></div><strong>${state.types.length}</strong></header><div class="sa9018-type-grid">${body}</div></section>`;
}
function sa9018History(state, copy) {
  const rows = state.history.map((entry) => {
    const call = `${entry.kind}(${entry.arg})`;
    return `<tr class="${entry.index === state.operation.index ? "active" : ""}"><td>${entry.index + 1}</td><td><code>${sa9018Escape(call)}</code></td><td><span class="sa9018-path ${sa9018Escape(entry.source)}">${sa9018Escape(entry.source || entry.status)}</span></td><td><code>${sa9018Escape(entry.result === null ? copy.none : entry.result)}</code></td></tr>`;
  }).join("");
  const outputChips = state.outputs.map((output, index) => `<li><small>${index + 1}</small><code>${sa9018Escape(output === null ? copy.none : output)}</code></li>`).join("");
  return `<section class="sa9018-card sa9018-history"><header><div><h3>${sa9018Escape(copy.history)}</h3><p>${sa9018Escape(copy.historyHelp)}</p></div><strong>${state.history.length}/${state.input.operations.length}</strong></header>${rows ? `<div class="sa9018-table" tabindex="0"><table><thead><tr><th>${sa9018Escape(copy.index)}</th><th>${sa9018Escape(copy.operation)}</th><th>${sa9018Escape(copy.strategy)}</th><th>${sa9018Escape(copy.output)}</th></tr></thead><tbody>${rows}</tbody></table></div>` : `<p class="sa9018-empty large">${sa9018Escape(copy.noHistory)}</p>`}<h4>${sa9018Escape(copy.outputs)}</h4><ol class="sa9018-outputs">${outputChips}</ol>${state.final ? `<div class="sa9018-final"><span>${sa9018Escape(copy.finalInventory)}</span><code>[${state.finalInventory.map((name) => sa9018Escape(name)).join(", ")}]</code></div>` : ""}</section>`;
}
function sa9018Checks(state, copy) {
  const checks = [
    [copy.heapInvariant, state.invariants.validMinHeaps], [copy.uniqueInvariant, state.invariants.positiveUniqueIds],
    [copy.disjointInvariant, state.invariants.usedAndFreeDisjoint], [copy.coverageInvariant, state.invariants.completeCoverage],
    [copy.cursorInvariant, state.invariants.nextIdAboveKnownIds], [copy.minimumInvariant, state.invariants.smallestAllocationChosen],
  ];
  return `<section class="sa9018-card sa9018-checks"><header><h3>${sa9018Escape(copy.invariants)}</h3></header><ul>${checks.map(([label, valid]) => `<li class="${valid ? "yes" : "no"}"><span>${valid ? "✓" : "×"}</span><strong>${sa9018Escape(label)}</strong><small>${sa9018Escape(valid ? copy.valid : copy.broken)}</small></li>`).join("")}</ul></section>`;
}
function sa9018Counters(state, copy, locale) {
  return `<section class="sa9018-card sa9018-counters"><header><h3>${sa9018Escape(copy.counters)}</h3></header><ul>${SA9018_COUNTERS.map(([key, en, vi]) => `<li><small>${sa9018Escape(locale === "vi" ? vi : en)}</small><strong>${state.counters[key]}</strong></li>`).join("")}</ul></section>`;
}
function renderServerAllocator9018View(step) {
  const host = typeof document !== "undefined" && document.getElementById
    ? document.getElementById("treeView") : typeof $ === "function" ? $("treeView") : null;
  if (!host) return;
  const locale = sa9018Locale();
  const copy = SA9018_TEXT[locale];
  const state = sa9018Normalize(step);
  const note = state.note ? `<aside class="sa9018-note"><strong>${sa9018Escape(copy.note)}</strong><p>${sa9018Escape(state.note)}</p></aside>` : "";
  host.innerHTML = `<article class="sa9018-viz ${state.final ? "final" : ""}" role="region" aria-label="Server allocator, ${sa9018Escape(copy.line)} ${state.source.line}"><header class="sa9018-header"><div><span>${sa9018Escape(copy.kicker)}</span><h2>${sa9018Escape(state.title)}</h2></div><div><strong>${sa9018Escape(copy.line)} ${state.source.line}</strong><span>${state.timing === "before" ? sa9018Escape(copy.before) : sa9018Escape(copy.after)}</span><em>${sa9018Escape(sa9018EventLabel(state.event))}</em></div></header>${sa9018Types(state, copy)}${note}${sa9018History(state, copy)}<details class="sa9018-details"><summary>${locale === "vi" ? "Chi tiết dòng lệnh và trạng thái" : "Code and state details"}</summary><div>${sa9018Flow(state, copy)}${sa9018Source(state, copy)}${sa9018Current(state, copy)}<div class="sa9018-grid">${sa9018Checks(state, copy)}${sa9018Counters(state, copy, locale)}</div></div></details></article>`;
  if (host.querySelectorAll) host.querySelectorAll(".sa9018-id-scroll").forEach((strip) => {
    const target = strip.querySelector(".active") || strip.querySelector(".fresh");
    if (target) strip.scrollLeft = Math.max(0, target.offsetLeft - strip.offsetLeft - strip.clientWidth / 2 + target.offsetWidth / 2);
  });
}

function renderServerAllocator9018BitmaskView(step) {
  const host = typeof document !== "undefined" && document.getElementById
    ? document.getElementById("treeView") : typeof $ === "function" ? $("treeView") : null;
  if (!host) return;
  const view = step.serverAllocator9018BitmaskView;
  const vi = sa9018Locale() === "vi";
  const text = (vn, en) => vi ? vn : en;
  const op = view.operation;
  const activeType = op?.serverType;
  const selected = op?.number;
  const types = [...view.types].sort((a, b) => Number(b.serverType === activeType) - Number(a.serverType === activeType));
  const typeCards = types.map(type => {
    const mask = BigInt(type.mask);
    const width = Math.max(12, Math.min(64, type.width));
    const cells = Array.from({ length: width }, (_, index) => {
      const id = index + 1;
      const used = Boolean(mask & (1n << BigInt(index)));
      const active = activeType === type.serverType && selected === id;
      return `<li class="${used ? "used" : "free"}${id === type.minimum ? " minimum" : ""}${active ? " active" : ""}" data-id="${id}" data-bit="${used ? 1 : 0}"><small>ID ${id}</small><strong>${used ? 1 : 0}</strong><em>bit ${index}</em></li>`;
    }).join("");
    return `<article class="sa9018-type${type.serverType === activeType ? " active" : ""}" data-server-type="${sa9018Escape(type.serverType)}"><header><div><small>USED MASK${type.preview ? ` · ${text("loại mới", "new type")}` : ""}</small><h4>${sa9018Escape(type.serverType)}</h4></div><div><span>${text("ID trống nhỏ nhất", "Smallest available ID")}</span><strong>${type.minimum}</strong></div></header>
      <div class="sa9018-bm-mask"><span>mask = ${sa9018Escape(type.mask)}</span><code>0b${mask.toString(2)}</code></div>
      <div class="sa9018-bm-strip" tabindex="0"><ol>${cells}<li class="sa9018-bm-tail"><strong>0, 0, …</strong><em>${text("ID cao hơn đều trống", "Higher IDs are all free")}</em></li></ol></div>
      <p class="sa9018-tail-note">${text("ID tăng từ trái sang phải. Bit 1 = đang cấp; bit 0 = trống. Ô vàng là bit 0 thấp nhất.", "IDs increase left to right. Bit 1 = allocated; bit 0 = free. Gold marks the lowest zero bit.")}</p></article>`;
  });

  let calculation = "";
  if (view.calculation) {
    const calc = view.calculation;
    const values = calc.kind === "allocate" ? [
      ["mask", calc.mask], ["mask + 1", calc.plusOne], ["~mask", calc.inverted], ["free_bit = (mask + 1) & ~mask", calc.freeBit],
    ] : [["mask", calc.mask], ["bit = 1 << (number - 1)", calc.bit], ["mask & ~bit", calc.cleared]];
    const positive = values.map(([, value]) => BigInt(value)).filter(value => value >= 0n);
    const width = Math.max(8, ...positive.map(value => value.toString(2).length + 1));
    const clip = (1n << BigInt(width)) - 1n;
    const selectedBit = calc.kind === "allocate" ? BigInt(calc.freeBit) : BigInt(calc.bit);
    const rows = values.map(([label, decimal]) => {
      const value = BigInt(decimal);
      const digits = (value & clip).toString(2).padStart(width, "0");
      const bits = [...digits].map((digit, index) => `<span class="${(1n << BigInt(width - index - 1)) === selectedBit ? "selected" : ""}">${digit}</span>`).join("");
      return `<tr><th><code>${sa9018Escape(label)}</code></th><td class="sa9018-bm-digits">${bits}</td><td>${value < 0n ? `… ${text("bit dấu 1", "sign bits 1")}` : sa9018Escape(decimal)}</td></tr>`;
    }).join("");
    const formula = calc.kind === "allocate" ? "free_bit = (mask + 1) & ~mask" : "used_masks[type] = mask & ~bit";
    calculation = `<section class="sa9018-card sa9018-bm-calculation"><header><div><h3>${text("Phép toán bit đang chạy", "Current bit operation")}</h3><p>${text("Nhị phân: bit thấp nhất ở bên phải; cột vàng là bit của ID đang xét.", "Binary: the lowest bit is on the right; the gold column is the selected ID bit.")}</p></div></header><strong class="sa9018-bm-formula">${formula}</strong><div class="sa9018-bm-table" tabindex="0"><table>${rows}</table></div><p class="sa9018-tail-note">${text("Các hàng tính toán dùng mask trước thao tác. Dãy bit phía trên là trạng thái ở dòng hiện tại.", "Calculation rows use the mask before the operation. The bit strip above shows the current line's state.")}</p></section>`;
  }
  const call = op ? op.kind === "init" ? op.arg : `${op.kind}("${op.arg}")` : text("Sẵn sàng", "Ready");
  const outputRows = view.history.map((entry, index) => `<li><small>#${index + 1} ${sa9018Escape(entry.call)}</small><code>${sa9018Escape(entry.result ?? "None")}</code></li>`).join("");
  host.innerHTML = `<article class="sa9018-viz sa9018-bitmask" role="region" aria-label="9018 Bitmask"><header class="sa9018-header"><div><span>9018 · ${text("CÁCH 2: BITMASK", "APPROACH 2: BITMASK")}</span><h2>${sa9018Escape(sa9018Text(step.title, vi ? "vi" : "en"))}</h2></div><div><strong>${text("DÒNG", "LINE")} ${view.line}</strong><code>${sa9018Escape(call)}</code></div></header>
    <section class="sa9018-card sa9018-bm-explainer"><h3>${text("Một bit cho mỗi ID, một mask cho mỗi loại", "One bit per ID, one mask per type")}</h3><p>${text("Bit k−1 biểu diễn ID k. Không cần danh sách vô hạn, heap hay con trỏ.", "Bit k−1 represents ID k. No infinite list, heap, or cursor is needed.")}</p></section>
    <div class="sa9018-type-grid">${typeCards[0] || `<p class="sa9018-empty large">${text("Chưa đọc loại server nào", "No server type read yet")}</p>`}</div>
    ${calculation}${typeCards.length > 1 ? `<details class="sa9018-details"><summary>${text("Mask của các loại server khác", "Masks of other server types")}</summary><div>${typeCards.slice(1).join("")}</div></details>` : ""}<aside class="sa9018-note"><strong>${text("Ý nghĩa dòng này", "What this line does")}</strong><p>${sa9018Escape(sa9018Text(step.note, vi ? "vi" : "en"))}</p></aside>
    <section class="sa9018-card"><h3>${text("Kết quả thao tác", "Operation outputs")}</h3><ol class="sa9018-outputs">${outputRows}</ol></section>
    <details class="sa9018-details"><summary>${text("Dòng Python hiện tại", "Current Python line")}</summary><div><code>${sa9018Escape(view.source)}</code><p>${text("Python int có độ dài tùy ý. Phép toán mask tốn O(W), với W là số word lưu mask; ID rất lớn và thưa có thể tốn bộ nhớ.", "Python ints have arbitrary precision. Mask operations cost O(W), where W is the mask's word count; very large sparse IDs may consume substantial memory.")}</p></div></details></article>`;
  if (host.querySelectorAll) host.querySelectorAll(".sa9018-bm-strip").forEach(strip => {
    const target = strip.querySelector(".active") || strip.querySelector(".minimum");
    if (target) strip.scrollLeft = Math.max(0, target.offsetLeft - strip.offsetLeft - strip.clientWidth / 2 + target.offsetWidth / 2);
  });
}
