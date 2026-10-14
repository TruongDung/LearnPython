"use strict";

const bi = (vi, en) => ({ vi, en });
const CODE = Object.freeze([
  "from typing import List",
  "",
  "class Solution:",
  "    def shipWithinDays(self, weights: List[int], days: int) -> int:",
  "        def count_days(capacity: int) -> int:",
  "            used_days, load = 1, 0",
  "            for weight in weights:",
  "                if load + weight > capacity:",
  "                    used_days += 1",
  "                    load = 0",
  "                load += weight",
  "            return used_days",
  "",
  "        lo, hi = max(weights), sum(weights)",
  "        while lo < hi:",
  "            mid = (lo + hi) // 2",
  "            needed_days = count_days(mid)",
  "            if needed_days <= days:",
  "                hi = mid",
  "            else:",
  "                lo = mid + 1",
  "        return lo",
]);

function parseInput(input, params = {}) {
  if (!Array.isArray(input) || !input.length || input.length > 50000 || input.some(w => !Number.isInteger(w) || w < 1 || w > 500)) {
    throw new RangeError("1011: weights must contain 1..50000 integers in [1, 500] / weights gồm 1..50000 số nguyên từ 1 đến 500.");
  }
  const raw = params.days === undefined ? 5 : params.days;
  if (typeof raw !== "number" && (typeof raw !== "string" || !/^\d+$/.test(raw.trim()))) throw new TypeError("1011: days must be an integer / days phải là số nguyên.");
  const days = Number(raw);
  if (!Number.isInteger(days) || days < 1 || days > input.length) throw new RangeError("1011: days must be in [1, weights.length] / days từ 1 đến số kiện hàng.");
  return { weights: [...input], days };
}

function scheduleFor(weights, capacity) {
  const schedule = [{ day: 1, load: 0, packages: [] }];
  for (let index = 0; index < weights.length; index++) {
    if (schedule.at(-1).load + weights[index] > capacity) schedule.push({ day: schedule.length + 1, load: 0, packages: [] });
    const ship = schedule.at(-1);
    ship.packages.push({ index, weight: weights[index] }); ship.load += weights[index];
  }
  return schedule;
}

function buildSteps(input, params = {}) {
  const { weights, days } = parseInput(input, params);
  const initialLo = Math.max(...weights), initialHi = weights.reduce((sum, w) => sum + w, 0);
  let lo, hi, mid, needed_days, index = -1, processed = 0, round = 0, activeCapacity = null, complete = false;
  let schedule = [];
  const steps = [], tested = [];
  let truncated = false;

  function emit(line, phase, helper = null, extra = {}) {
    if (steps.length >= 450 && !extra.final) { truncated = true; return; }
    const locals = {};
    const values = helper || { days, lo, hi, mid, needed_days };
    for (const [name, value] of Object.entries(values)) if (value !== undefined) locals[name] = value;
    const visibleQueue = weights.length <= 12 ? weights.map((_, i) => i) : [...new Set([0, 1, 2, 3, ...(index >= 0 ? [Math.max(0, index - 1), index, Math.min(weights.length - 1, index + 1)] : []), weights.length - 2, weights.length - 1])].sort((a, b) => a - b);
    const visibleDays = schedule.length <= 6 ? schedule.map((_, i) => i) : [0, 1, 2, 3, schedule.length - 2, schedule.length - 1];
    const picture = visibleDays.map(i => {
      const ship = schedule[i];
      const ids = ship.packages.length <= 8 ? ship.packages.map((_, j) => j) : [0, 1, 2, 3, ship.packages.length - 2, ship.packages.length - 1];
      return { day: ship.day, load: ship.load, count: ship.packages.length, first: ship.packages[0]?.index ?? null, last: ship.packages.at(-1)?.index ?? null,
        packages: ids.map(j => ({ ...ship.packages[j] })), active: !extra.final && i === schedule.length - 1 };
    });
    const view = {
      phase, source: { line, text: CODE[line - 1], scope: helper ? "count_days" : "shipWithinDays", timing: "before" }, locals,
      n: weights.length, days, initialLo, initialHi, lo: lo ?? null, hi: hi ?? null, mid: mid ?? null,
      capacity: activeCapacity, index, processed, round, complete, neededDays: complete ? schedule.length : null,
      currentDays: schedule.length || null, queue: visibleQueue.map(i => ({ index: i, weight: weights[i], loaded: i < processed, active: i === index })),
      schedule: picture, scheduleCount: schedule.length, cropped: visibleQueue.length < weights.length || picture.length < schedule.length || picture.some(ship => ship.count > ship.packages.length),
      attempt: helper?.load !== undefined && helper?.weight !== undefined && index >= 0 ? { load: helper.load, weight: helper.weight, total: helper.load + helper.weight, fits: helper.load + helper.weight <= activeCapacity } : null,
      tested: tested.map(t => ({ ...t })), final: false, answer: null, truncated, ...extra,
    };
    steps.push({ arr: [], highlight: [], mark: [], codeLines: [line], final: !!extra.final,
      title: bi("Xếp hàng lên tàu theo từng ngày", "Load packages onto ships by day"), note: bi("", ""),
      vars: Object.entries(locals).map(([name, value]) => ({ name, value })), shipPackages1011View: view });
  }

  function countDays(capacity) {
    let used_days, load, weight;
    const frame = () => ({ capacity, used_days, load, weight });
    emit(6, "start-day", frame()); used_days = 1; load = 0;
    schedule = [{ day: 1, load: 0, packages: [] }];
    for (let i = 0; ; i++) {
      emit(7, "next-package", frame()); if (i === weights.length) break;
      weight = weights[i]; index = i;
      emit(8, "check-load", frame());
      if (load + weight > capacity) {
        emit(9, "new-day", frame()); used_days++;
        schedule.push({ day: used_days, load: 0, packages: [] });
        emit(10, "reset-load", frame()); load = 0;
      }
      emit(11, "load-package", frame()); load += weight;
      const ship = schedule.at(-1); ship.packages.push({ index: i, weight }); ship.load = load;
      processed = i + 1;
    }
    emit(12, "return-days", frame()); return used_days;
  }

  emit(5, "define-helper"); emit(14, "bounds"); lo = initialLo; hi = initialHi;
  while (true) {
    emit(15, "while"); if (!(lo < hi)) break;
    emit(16, "mid"); mid = Math.floor((lo + hi) / 2); round++;
    activeCapacity = mid; schedule = []; processed = 0; index = -1; complete = false;
    emit(17, "call-helper"); needed_days = countDays(mid); complete = true;
    emit(18, "check-days"); const feasible = needed_days <= days;
    tested.push({ capacity: mid, days: needed_days, feasible });
    if (feasible) { emit(19, "keep", null, { nextLo: lo, nextHi: mid }); hi = mid; }
    else { emit(21, "discard", null, { nextLo: mid + 1, nextHi: hi }); lo = mid + 1; }
  }
  const answer = lo;
  schedule = scheduleFor(weights, answer); complete = true; activeCapacity = answer; processed = weights.length; index = -1;
  const smallerDays = answer > initialLo ? scheduleFor(weights, answer - 1).length : null;
  emit(22, "result", null, { final: true, answer, smallerDays, minimumPackageBound: answer === initialLo });
  return { original: weights, answer, steps };
}

module.exports = { 1011: {
  id: 1011, difficulty: "medium", slug: "capacity-to-ship-packages-within-d-days",
  category: { key: "binary-search", vi: "Tìm kiếm nhị phân", en: "Binary Search" },
  title: bi("Capacity To Ship Packages Within D Days", "Capacity To Ship Packages Within D Days"),
  titleVi: bi("Sức chứa nhỏ nhất để chở hàng", "Minimum ship capacity"),
  statement: bi("Chở các kiện theo đúng thứ tự, không chia nhỏ kiện. Mỗi ngày tổng tải không vượt sức chứa tàu. Tìm sức chứa nhỏ nhất để chở hết trong days ngày.", "Ship packages in their original order without splitting them. Each day's load must fit the ship. Find the minimum capacity to finish within the allowed days."),
  defaultInput: [1,2,3,4,5,6,7,8,9,10], inputKind: "positive", inputLabel: bi("weights · mỗi kiện 1–500", "weights · each package 1–500"),
  extraParams: [{ key: "days", type: "number", min: 1, max: 50000, default: 5, label: bi("days · số ngày cho phép", "days · allowed days") }],
  approach: [
    bi("Sức chứa nằm trong [kiện nặng nhất, tổng khối lượng].", "Capacity lies between the heaviest package and the total weight."),
    bi("Thử mid: xếp lần lượt; kiện tiếp theo không vừa → sang ngày mới.", "Try mid: load in order; if the next package does not fit, start a new day."),
    bi("Kịp ngày → hi = mid. Không kịp → lo = mid + 1.", "Within the deadline → hi = mid. Too many days → lo = mid + 1."),
  ],
  complexity: { time: "O(n log(sum(weights)))", space: "O(1)", note: bi("Mỗi lần thử cần một lượt đếm ngày. Code không tạo lịch xếp hàng; hình lưu thêm lịch để minh họa. Input lớn rút gọn trace.", "Each trial scans the weights once. The code only counts days; the visual additionally stores a schedule. Large inputs shorten the trace.") },
  code: CODE, debugMode: "line-by-line", builder: buildSteps,
  liveArgs: (input, params) => { const parsed = parseInput(input, params); return [parsed.weights, parsed.days]; }, parseInput,
} };
