"use strict";

const { bi } = require("./hard-viz-shared");
const base = require("./heap")[218];
const copy = value => JSON.parse(JSON.stringify(value));
const MAX_BUILDINGS = 100;

function parseSkyline218(input = base.defaultInput) {
  let buildings = input;
  if (typeof input === "string") {
    const text = input.trim();
    try {
      buildings = text.startsWith("[") ? JSON.parse(text) : text.split(/[;|\n]/).map(row => row.trim()).filter(Boolean)
        .map(row => row.split(",").map(value => value.trim() === "" ? NaN : Number(value.trim())));
    } catch (_) { throw new TypeError("#218: input không hợp lệ / invalid input; example: 2,9,10;3,7,15."); }
  }
  if (!Array.isArray(buildings) || !buildings.length || buildings.length > MAX_BUILDINGS
    || !Array.from(buildings).every(building => Array.isArray(building) && building.length === 3
      && Array.from(building).every(Number.isSafeInteger) && building[0] < building[1] && building[2] > 0)) {
    throw new RangeError("#218: cần 1–100 tòa nhà [L,R,H], số nguyên an toàn, L < R và H > 0 / use 1–100 buildings [L,R,H], safe integers, L < R and H > 0.");
  }
  return buildings.map(building => [...building]).sort((a, b) => a[0] - b[0] || a[1] - b[1] || a[2] - b[2]);
}

function buildSteps218(input) {
  const buildings = Object.freeze(parseSkyline218(input).map(building => Object.freeze(building)));
  const events = [...new Set(buildings.flatMap(([left, right]) => [left, right]))].sort((a, b) => a - b);
  const state = { buildings }, heap = [], steps = [];
  let eventIndex = -1, sampledHeight = null;
  // Match heapq's tuple comparison and heap layout, including equal-child ties.
  const less = (a, b) => a.height > b.height || a.height === b.height && a.right < b.right;
  function siftDown(start, pos) {
    const item = heap[pos];
    while (pos > start) {
      const parent = (pos - 1) >> 1;
      if (!less(item, heap[parent])) break;
      heap[pos] = heap[parent]; pos = parent;
    }
    heap[pos] = item;
  }
  function push(entry) { heap.push(entry); siftDown(0, heap.length - 1); }
  function pop() {
    const removed = heap[0], last = heap.pop();
    if (heap.length) {
      const end = heap.length;
      let pos = 0, child = 1;
      while (child < end) {
        const right = child + 1;
        if (right < end && !less(heap[child], heap[right])) child = right;
        heap[pos] = heap[child]; pos = child; child = 2 * pos + 1;
      }
      heap[pos] = last; siftDown(0, pos);
    }
    return removed;
  }
  const captions = {
    events: bi("Các mốc cạnh tòa nhà", "Building-edge events"), "heap-init": bi("Khởi tạo heap", "Initialize heap"),
    "answer-init": bi("Khởi tạo skyline", "Initialize skyline"), "pointer-init": bi("Tòa nhà tiếp theo", "Next building"),
    sweep: bi("Di chuyển đường quét", "Move the sweep line"), "sweep-done": bi("Đã quét hết các cạnh", "All edges swept"),
    "start-check": bi("Có tòa nhà bắt đầu?", "Does a building start?"), "start-done": bi("Đã thêm đủ tại x", "All starts at x added"),
    unpack: bi("Chọn tòa nhà", "Select a building"), push: bi("Thêm vào heap", "Push into heap"), advance: bi("Tăng i", "Advance i"),
    "expire-check": bi("Root đã hết hạn", "Root has expired"), "expire-done": bi("Root hợp lệ hoặc heap rỗng", "Valid root or empty heap"),
    pop: bi("Bỏ root hết hạn", "Pop expired root"), height: bi("Lấy độ cao lớn nhất", "Read the maximum height"),
    compare: bi("Độ cao có đổi?", "Did the height change?"), append: bi("Thêm điểm ngoặt", "Append a key point"), done: bi("Skyline hoàn tất", "Skyline complete"),
  };
  function emit(line, phase, detail = {}) {
    if (state.heap) state.heap = heap.map(entry => [-entry.height, entry.right]);
    const locals = copy(state), x = state.x ?? null, answer = state.answer || [];
    const root = heap.length ? `(${-heap[0].height}, ${heap[0].right})` : "—";
    steps.push({
      title: captions[phase], note: bi("", ""), arr: [], highlight: [], mark: [], codeLines: [line], codeBlock: 1, final: phase === "done",
      vars: [{ name: "x", value: state.x ?? "—" }, { name: "i", value: state.i ?? "—" }, { name: "height", value: state.height ?? "—" },
        { name: "heap[0]", value: root }, { name: "answer[-1]", value: answer.length ? `[${answer.at(-1).join(", ")}]` : "—" }],
      skylineView: {
        buildings, events, eventIndex, sweepX: x, phase, skyline: answer.map(point => [...point]),
        heap: heap.map(entry => ({ ...entry, expired: x !== null && entry.right <= x })),
        activeBuildingIds: x === null ? [] : buildings.flatMap(([left, right], id) => left <= x && x < right ? [id] : []),
        focusBuildingId: detail.focusBuildingId ?? null, action: detail.action || null,
        currentHeight: sampledHeight, previousHeight: detail.previousHeight ?? null, changed: detail.changed ?? null,
        guard: detail.guard ?? null, locals, source: { line, text: base.code[line - 1], timing: "after" },
      },
    });
  }
  state.events = [...events]; emit(5, "events");
  state.heap = []; emit(6, "heap-init");
  state.answer = []; emit(7, "answer-init");
  state.i = 0; emit(8, "pointer-init");
  for (const x of events) {
    state.x = x; eventIndex++; sampledHeight = null; emit(10, "sweep");
    while (true) {
      const pass = state.i < buildings.length && buildings[state.i][0] <= x;
      emit(11, pass ? "start-check" : "start-done", { guard: pass, focusBuildingId: pass ? state.i : null });
      if (!pass) break;
      [state.left, state.right, state.height] = buildings[state.i];
      emit(12, "unpack", { focusBuildingId: state.i });
      const entry = { height: state.height, right: state.right, id: state.i };
      push(entry); emit(13, "push", { focusBuildingId: state.i, action: { kind: "push", ...entry } });
      state.i++; emit(14, "advance");
    }
    while (true) {
      const pass = heap.length > 0 && heap[0].right <= x;
      emit(16, pass ? "expire-check" : "expire-done", { guard: pass, focusBuildingId: heap[0]?.id ?? null });
      if (!pass) break;
      const entry = pop(); emit(17, "pop", { focusBuildingId: entry.id, action: { kind: "pop", ...entry } });
    }
    state.height = heap.length ? heap[0].height : 0; sampledHeight = state.height; emit(19, "height");
    const previousHeight = state.answer.length ? state.answer.at(-1)[1] : null;
    const changed = previousHeight === null || previousHeight !== state.height;
    emit(20, "compare", { previousHeight, changed });
    if (changed) { state.answer.push([x, state.height]); emit(21, "append", { previousHeight, changed }); }
  }
  emit(10, "sweep-done"); emit(23, "done");
  return { original: buildings.map(building => [...building]), answer: copy(state.answer), steps };
}

module.exports = {
  218: {
    ...base, builder: buildSteps218,
    inputLabel: bi("[L,R,H] · hàng cách ; hoặc JSON · tự xếp theo L · tối đa 100 tòa nhà", "[L,R,H] · semicolon rows or JSON · sorted by L · up to 100 buildings"),
    approach: [bi("Quét x → thêm tòa nhà bắt đầu → bỏ root đã hết hạn.", "Sweep x → push starting buildings → pop expired roots."),
      bi("Root cho độ cao lớn nhất. Độ cao đổi → thêm [x, height].", "The root gives the maximum height. A height change → append [x, height].")],
    visualizationLimits: { maxBuildings: MAX_BUILDINGS }, liveArgs: input => [parseSkyline218(input)],
  },
};
