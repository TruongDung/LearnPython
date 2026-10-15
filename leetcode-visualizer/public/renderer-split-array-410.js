"use strict";

const SA410_SOURCE = Object.freeze([
  "class Solution:",
  "    def splitArray(self, nums: list[int], k: int) -> int:",
  "        left, right = max(nums), sum(nums)",
  "",
  "        def can_split(limit):",
  "            groups = 1",
  "            current_sum = 0",
  "",
  "            for num in nums:",
  "                if current_sum + num > limit:",
  "                    groups += 1",
  "                    current_sum = 0",
  "",
  "                current_sum += num",
  "",
  "                if groups > k:",
  "                    return False",
  "",
  "            return True",
  "",
  "        while left < right:",
  "            mid = (left + right) // 2",
  "",
  "            if can_split(mid):",
  "                right = mid",
  "            else:",
  "                left = mid + 1",
  "",
  "        return left",
]);

const SA410_EVENTS = Object.freeze({
  "bind-class": { en: "Prepare the solution", vi: "Chuẩn bị lời giải" },
  "bind-split-method": { en: "Set the goal", vi: "Đặt mục tiêu" },
  "bind-count-method": { en: "Prepare the packing check", vi: "Chuẩn bị phép thử xếp nhóm" },
  "initialize-lower-bound": { en: "Set the smallest candidate", vi: "Đặt ứng viên nhỏ nhất" },
  "initialize-upper-bound": { en: "Set the largest candidate", vi: "Đặt ứng viên lớn nhất" },
  "initialize-bounds": { en: "The answer is inside this range", vi: "Đáp án nằm trong đoạn này" },
  "while-true": { en: "The range is not closed yet", vi: "Hai biên chưa gặp nhau" },
  "while-false": { en: "The range has closed", vi: "Hai biên đã gặp nhau" },
  "choose-mid": { en: "Try the middle capacity", vi: "Thử sức chứa ở giữa" },
  "count-call": { en: "Pack from left to right", vi: "Xếp từ trái sang phải" },
  "count-entry": { en: "Start a packing test", vi: "Bắt đầu phép thử" },
  "count-initialize": { en: "Open the first box", vi: "Mở hộp đầu tiên" },
  "sum-initialize": { en: "Start the running sum", vi: "Khởi tạo tổng đang chạy" },
  "count-loop": { en: "Pick up the next number", vi: "Nhấc số tiếp theo" },
  "count-loop-complete": { en: "All numbers are packed", vi: "Đã xếp hết các số" },
  "overflow-true": { en: "It does not fit — open a new box", vi: "Không vừa — mở hộp mới" },
  "overflow-false": { en: "It still fits", vi: "Vẫn còn vừa" },
  "open-greedy-group": { en: "Open a new box", vi: "Mở hộp mới" },
  "reset-running": { en: "The new box starts empty", vi: "Hộp mới bắt đầu rỗng" },
  "add-running": { en: "Put the number in", vi: "Đặt số vào hộp" },
  "group-limit-ok": { en: "Still within k groups", vi: "Vẫn chưa vượt k nhóm" },
  "early-reject": { en: "Too many groups — stop early", vi: "Quá nhiều nhóm — dừng sớm" },
  "return-false": { en: "Return False", vi: "Trả về False" },
  "count-return": { en: "Return True", vi: "Trả về True" },
  "count-assignment": { en: "Remember the box count", vi: "Ghi nhớ số hộp" },
  "feasible-mid": { en: "This capacity is large enough", vi: "Sức chứa này đủ lớn" },
  "infeasible-mid": { en: "This capacity is too small", vi: "Sức chứa này quá nhỏ" },
  "move-right": { en: "Search smaller capacities", vi: "Thử sức chứa nhỏ hơn" },
  "else-branch": { en: "Too many boxes", vi: "Cần quá nhiều hộp" },
  "move-left": { en: "Discard small capacities", vi: "Bỏ các sức chứa quá nhỏ" },
  "cuts-call": { en: "Turn the answer into exact cuts", vi: "Biến đáp án thành đúng số nhát cắt" },
  "cuts-entry": { en: "Scan back from the right", vi: "Quét ngược từ bên phải" },
  "cuts-initialize": { en: "No cuts yet", vi: "Chưa có nhát cắt" },
  "witness-state-initialize": { en: "Reserve exactly k boxes", vi: "Chừa đúng k hộp" },
  "witness-loop": { en: "Move one number left", vi: "Lùi sang trái một số" },
  "witness-loop-complete": { en: "Every cut is placed", vi: "Đã đặt đủ nhát cắt" },
  "must-cut-true": { en: "A cut is needed here", vi: "Cần cắt tại đây" },
  "must-cut-false": { en: "Keep these numbers together", vi: "Giữ các số này cùng nhóm" },
  "cut-branch-true": { en: "Make the cut", vi: "Thực hiện nhát cắt" },
  "cut-branch-false": { en: "No cut", vi: "Không cắt" },
  "append-cut": { en: "Place the scissors", vi: "Đặt dấu kéo" },
  "decrement-groups-left": { en: "One group is complete", vi: "Hoàn tất một nhóm" },
  "reset-suffix": { en: "Start the next group", vi: "Bắt đầu nhóm kế" },
  "add-suffix": { en: "Extend the group leftward", vi: "Nối nhóm sang trái" },
  "cuts-return": { en: "Sort the cuts", vi: "Sắp xếp các nhát cắt" },
  "cuts-assignment": { en: "The exact partition is ready", vi: "Cách chia chính xác đã sẵn sàng" },
  "final-return": { en: "Smallest possible capacity", vi: "Sức chứa nhỏ nhất có thể" },
});

const SA410_COPY = Object.freeze({
  vi: Object.freeze({
    region: "Minh họa bài 410",
    fallbackTitle: "Chia mảng để tổng lớn nhất nhỏ nhất",
    stages: ["Khoanh vùng", "Thử xếp", "Kết quả"],
    target: "nhóm liền nhau",
    capacity: "Sức chứa",
    answer: "Đáp án",
    groups: "hộp",
    fits: "VỪA",
    tooSmall: "QUÁ NHỎ",
    searching: "ĐANG THỬ",
    array: "Dãy số",
    packing: "Xếp số vào hộp",
    emptyBoxes: "Các hộp sẽ xuất hiện khi bắt đầu thử",
    cutScan: "quét ngược",
    capacityCut: "vượt sức chứa",
    reserveCut: "chừa phần tử cho nhóm còn lại",
    cutHere: "cắt tại đây",
    keep: "giữ cùng nhóm",
    line: "Dòng",
  }),
  en: Object.freeze({
    region: "Problem 410 visualization",
    fallbackTitle: "Split Array Largest Sum",
    stages: ["Narrow range", "Test packing", "Result"],
    target: "contiguous groups",
    capacity: "Capacity",
    answer: "Answer",
    groups: "boxes",
    fits: "FITS",
    tooSmall: "TOO SMALL",
    searching: "TESTING",
    array: "Number row",
    packing: "Pack numbers into boxes",
    emptyBoxes: "Boxes appear when the test starts",
    cutScan: "reverse scan",
    capacityCut: "capacity overflow",
    reserveCut: "reserve numbers for remaining groups",
    cutHere: "cut here",
    keep: "keep together",
    line: "Line",
  }),
});

function sa410Escape(value) {
  return String(value == null ? "" : value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function sa410Locale() {
  return typeof lang !== "undefined" && lang === "vi" ? "vi" : "en";
}

function sa410CleanText(value, fallback = "", maximum = 300) {
  if (typeof value !== "string") return fallback;
  const text = value.slice(0, maximum).trim();
  return /^(?:undefined|null|nan|[+-]?infinity)$/i.test(text) ? fallback : text;
}

function sa410Localized(value, locale, fallback) {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return sa410CleanText(value[locale], sa410CleanText(value.en, sa410CleanText(value.vi, fallback)));
  }
  return sa410CleanText(value, fallback);
}

function sa410Integer(value, minimum, maximum) {
  return Number.isSafeInteger(value) && value >= minimum && value <= maximum ? value : null;
}

function sa410Boolean(value) {
  return typeof value === "boolean" ? value : null;
}

function sa410Cuts(value, length, sort = false) {
  if (!Array.isArray(value) || length < 2) return [];
  const cuts = [...new Set(value.map((item) => sa410Integer(item, 1, length - 1)).filter((item) => item !== null))];
  return sort ? cuts.sort((a, b) => a - b) : cuts;
}

function sa410Normalize(step) {
  const raw = step && step.splitArray410View && typeof step.splitArray410View === "object" ? step.splitArray410View : {};
  const input = raw.input && typeof raw.input === "object" ? raw.input : {};
  const candidate = Array.isArray(input.nums) ? input.nums : step && Array.isArray(step.arr) ? step.arr : [];
  const nums = candidate.length >= 1 && candidate.length <= 16 && candidate.every((value) => Number.isSafeInteger(value) && value >= 1 && value <= 1_000_000) ? [...candidate] : [];
  const length = nums.length;
  const total = nums.reduce((sum, value) => sum + value, 0);
  const largest = length ? Math.max(...nums) : 0;
  const k = length ? sa410Integer(input.k, 1, length) : null;
  const sourceRaw = raw.source && typeof raw.source === "object" ? raw.source : {};
  const fallbackLine = step && Array.isArray(step.codeLines) ? step.codeLines[0] : null;
  const line = sa410Integer(sourceRaw.line, 1, SA410_SOURCE.length) ?? sa410Integer(fallbackLine, 1, SA410_SOURCE.length) ?? 1;
  const event = Object.prototype.hasOwnProperty.call(SA410_EVENTS, raw.event) ? raw.event : "bind-class";
  const phase = ["setup", "search", "count", "reconstruct", "done"].includes(raw.phase) ? raw.phase : "setup";
  const bound = (value) => length ? sa410Integer(value, largest, total) : null;
  const searchRaw = raw.search && typeof raw.search === "object" ? raw.search : {};
  const scanRaw = raw.scan && typeof raw.scan === "object" ? raw.scan : {};
  const witnessRaw = raw.witness && typeof raw.witness === "object" ? raw.witness : {};
  const scanCut = scanRaw.cut && typeof scanRaw.cut === "object" ? scanRaw.cut : {};
  const witnessCut = witnessRaw.cut && typeof witnessRaw.cut === "object" ? witnessRaw.cut : {};
  const groupOf = Array.from({ length }, (_, index) => {
    const group = Array.isArray(scanRaw.groupOf) ? scanRaw.groupOf[index] : null;
    return sa410Integer(group, 0, Math.max(0, length - 1));
  });
  const cuts = sa410Cuts(witnessRaw.cuts, length, true);
  const rawCuts = sa410Cuts(witnessRaw.rawCuts, length, false);
  const validCuts = k !== null && cuts.length === k - 1;
  const boundaries = validCuts ? [0, ...cuts, length] : [];
  const partitions = validCuts ? boundaries.slice(0, -1).map((start, group) => {
    const end = boundaries[group + 1];
    const values = nums.slice(start, end);
    return { group, start, end, values, sum: values.reduce((sum, value) => sum + value, 0) };
  }) : [];
  return {
    nums, length, total, largest, k, phase, event,
    source: { line, text: SA410_SOURCE[line - 1] },
    title: sa410Localized(step && step.title, sa410Locale(), SA410_COPY[sa410Locale()].fallbackTitle),
    final: raw.final === true || Boolean(step && step.final),
    answer: bound(raw.answer),
    search: {
      left: bound(searchRaw.left), right: bound(searchRaw.right), mid: bound(searchRaw.mid),
      groups: length ? sa410Integer(searchRaw.groups, 1, length) : null,
      feasible: sa410Boolean(searchRaw.feasible), outcome: sa410CleanText(searchRaw.outcome, "idle", 30),
    },
    scan: {
      active: scanRaw.active === true, limit: bound(scanRaw.limit),
      index: length ? sa410Integer(scanRaw.index, 0, length - 1) : null,
      num: length ? sa410Integer(scanRaw.num, 1, 1_000_000) : null,
      processed: sa410Integer(scanRaw.processed, 0, length) ?? 0,
      groups: length ? sa410Integer(scanRaw.groups, 1, length) : null,
      running: sa410Integer(scanRaw.running, 0, total),
      prospective: sa410Integer(scanRaw.prospective, 0, total),
      overflow: sa410Boolean(scanRaw.overflow), groupOf,
      cut: { status: sa410CleanText(scanCut.status, "idle", 30), beforeIndex: length ? sa410Integer(scanCut.beforeIndex, 0, length - 1) : null },
    },
    witness: {
      active: witnessRaw.active === true, initialized: witnessRaw.initialized === true,
      index: length ? sa410Integer(witnessRaw.index, 0, length - 1) : null,
      groupsLeft: k !== null ? sa410Integer(witnessRaw.groupsLeft, 1, k) : null,
      suffixSum: sa410Integer(witnessRaw.suffixSum, 0, total),
      prospective: sa410Integer(witnessRaw.prospective, 0, total),
      mustCut: sa410Boolean(witnessRaw.mustCut), capacityCut: sa410Boolean(witnessRaw.capacityCut),
      remainingCut: sa410Boolean(witnessRaw.remainingCut), rawCuts, cuts, partitions,
      cut: { status: sa410CleanText(witnessCut.status, "idle", 30), reason: sa410CleanText(witnessCut.reason, "", 40) },
      complete: witnessRaw.complete === true && validCuts,
    },
  };
}

function sa410Stage(state) {
  if (state.phase === "count") return 1;
  if (state.phase === "reconstruct" || state.phase === "done") return 2;
  return 0;
}

function sa410EventLabel(state, locale) {
  return SA410_EVENTS[state.event] ? SA410_EVENTS[state.event][locale] : state.event;
}

function sa410Candidate(state) {
  return state.answer ?? state.scan.limit ?? state.search.mid ?? state.search.left;
}

function sa410Action(state, copy, locale) {
  const value = state.scan.num ?? (state.scan.index !== null ? state.nums[state.scan.index] : null);
  const limit = sa410Candidate(state);
  if (state.final && state.answer !== null) return locale === "vi" ? `Tối ưu = ${state.answer}` : `Optimal = ${state.answer}`;
  if (state.event === "initialize-lower-bound") return `lower_bound = max(nums) = ${state.largest}`;
  if (state.event === "initialize-upper-bound") return `upper_bound = sum(nums) = ${state.total}`;
  if (state.event === "initialize-bounds") return locale === "vi" ? `${state.largest}  ≤  đáp án  ≤  ${state.total}` : `${state.largest}  ≤  answer  ≤  ${state.total}`;
  if (state.event === "choose-mid") return locale === "vi" ? `Thử sức chứa ${state.search.mid}` : `Try capacity ${state.search.mid}`;
  if (state.event === "overflow-true" && value !== null) return `${state.scan.running ?? 0} + ${value} > ${limit}  →  ✂`;
  if (state.event === "overflow-false" && value !== null) return `${state.scan.running ?? 0} + ${value} ≤ ${limit}  →  ✓`;
  if (state.event === "early-reject") return `${state.scan.groups} > ${state.k}  →  False`;
  if (state.event === "return-false") return `can_split(${limit})  →  False`;
  if (state.event === "count-return") return `can_split(${limit})  →  True`;
  if (["feasible-mid", "move-right"].includes(state.event) && state.search.groups !== null) return `${state.search.groups} ≤ ${state.k}  →  ${locale === "vi" ? "thu hẹp bên phải" : "move right bound"}`;
  if (["infeasible-mid", "else-branch", "move-left"].includes(state.event) && state.search.groups !== null) return `${state.search.groups} > ${state.k}  →  ${locale === "vi" ? "tăng biên trái" : "move left bound"}`;
  if (state.phase === "reconstruct" && state.witness.index !== null) {
    const decision = state.witness.mustCut === true ? `✂ ${copy.cutHere}` : state.witness.mustCut === false ? `✓ ${copy.keep}` : `← ${copy.cutScan}`;
    return `i=${state.witness.index}  ·  ${decision}`;
  }
  return sa410EventLabel(state, locale);
}

function sa410RenderStages(state, copy) {
  const active = sa410Stage(state);
  const icons = ["↔", "▣", "✂"];
  return `<ol class="sa410-stages" aria-label="${sa410Escape(copy.region)}">${copy.stages.map((label, index) => `<li class="${index === active ? "is-active" : index < active ? "is-done" : ""}"><span aria-hidden="true">${icons[index]}</span><small>${sa410Escape(label)}</small></li>`).join("")}</ol>`;
}

function sa410RenderSearch(state, copy) {
  const span = Math.max(1, state.total - state.largest);
  const point = (value) => value === null ? null : Math.max(0, Math.min(100, ((value - state.largest) / span) * 100));
  const left = point(state.search.left);
  const right = point(state.search.right);
  const mid = point(state.search.mid);
  const marker = (kind, label, value, position) => position === null ? "" : `<span class="sa410-marker ${kind}" style="--pos:${position.toFixed(2)}%"><b>${label}</b><strong>${value}</strong></span>`;
  const candidate = sa410Candidate(state);
  const groupCount = state.final && state.witness.complete
    ? state.witness.partitions.length
    : state.search.groups ?? state.scan.groups;
  let verdict = copy.searching;
  let verdictClass = "testing";
  if (state.search.feasible === true) { verdict = copy.fits; verdictClass = "fits"; }
  if (state.search.feasible === false) { verdict = copy.tooSmall; verdictClass = "small"; }
  if (state.final) { verdict = copy.answer; verdictClass = "fits"; }
  return `<section class="sa410-search" aria-label="${sa410Escape(copy.capacity)}"><div class="sa410-capacity-orb ${verdictClass}"><small>${sa410Escape(state.final ? copy.answer : copy.capacity)}</small><strong>${candidate === null ? "?" : candidate}</strong><span>${sa410Escape(verdict)}</span></div><div class="sa410-search-scale"><div class="sa410-scale-labels"><span>max = ${state.largest}</span><span>sum = ${state.total}</span></div><div class="sa410-track"><i class="sa410-discard" style="--width:${left === null ? 0 : left.toFixed(2)}%"></i><i class="sa410-window" style="--left:${left === null ? 0 : left.toFixed(2)}%;--width:${left === null || right === null ? 100 : Math.max(0, right - left).toFixed(2)}%"></i>${marker("left", "L", state.search.left, left)}${marker("mid", "M", state.search.mid, mid)}${marker("right", "R", state.search.right, right)}</div><div class="sa410-box-count ${groupCount !== null && state.k !== null && groupCount > state.k ? "is-too-many" : ""}"><span aria-hidden="true">${Array.from({ length: Math.min(groupCount ?? state.k ?? 0, 8) }, (_, index) => `<i class="${groupCount !== null && state.k !== null && index >= state.k ? "extra" : ""}">▣</i>`).join("")}</span><strong>${groupCount === null ? "?" : groupCount} / ${state.k === null ? "?" : state.k}</strong><small>${sa410Escape(copy.groups)}</small></div></div></section>`;
}

function sa410VisualCuts(state) {
  if (state.witness.cuts.length) return state.witness.cuts;
  if (state.phase === "reconstruct" && state.witness.rawCuts.length) return [...state.witness.rawCuts].sort((a, b) => a - b);
  const cuts = [];
  for (let index = 1; index < state.scan.groupOf.length; index++) {
    const before = state.scan.groupOf[index - 1];
    const current = state.scan.groupOf[index];
    if (before !== null && current !== null && before !== current) cuts.push(index);
  }
  return cuts;
}

function sa410Assignments(state, cuts) {
  if (state.phase === "reconstruct" || state.phase === "done") {
    return state.nums.map((_, index) => cuts.filter((cut) => cut <= index).length);
  }
  return state.scan.groupOf;
}

function sa410RenderArray(state, copy) {
  const cuts = sa410VisualCuts(state);
  const cutSet = new Set(cuts);
  const assignments = sa410Assignments(state, cuts);
  const active = state.witness.index !== null ? state.witness.index : state.scan.index;
  const max = Math.max(1, ...state.nums);
  const cells = state.nums.map((value, index) => {
    const group = assignments[index];
    const processed = state.phase === "reconstruct" ? state.witness.index !== null && index >= state.witness.index : state.scan.processed > index;
    return `<li class="sa410-number ${group === null ? "unassigned" : `group-${group % 4}`} ${active === index ? "is-active" : ""} ${processed ? "is-processed" : ""}">${cutSet.has(index) ? '<span class="sa410-scissors" aria-label="cut">✂</span>' : ""}<small>${index}</small><div class="sa410-number-bar"><i style="--height:${Math.max(18, value / max * 100).toFixed(2)}%"></i><strong>${value}</strong></div>${group === null ? "" : `<em>G${group + 1}</em>`}</li>`;
  }).join("");
  const reverse = state.phase === "reconstruct" ? `<div class="sa410-reverse"><span>← ← ←</span><small>${sa410Escape(copy.cutScan)}</small></div>` : "";
  return `<section class="sa410-array" aria-label="${sa410Escape(copy.array)}">${reverse}<ol role="list">${cells}</ol></section>`;
}

function sa410GroupsFromAssignments(state) {
  const groups = [];
  state.scan.groupOf.forEach((group, index) => {
    if (group === null) return;
    if (!groups[group]) groups[group] = { group, values: [], sum: 0 };
    groups[group].values.push({ value: state.nums[index], index });
    groups[group].sum += state.nums[index];
  });
  return groups.filter(Boolean);
}

function sa410RenderPacking(state, copy) {
  const finalGroups = state.witness.complete ? state.witness.partitions.map((partition) => ({ group: partition.group, values: partition.values.map((value, offset) => ({ value, index: partition.start + offset })), sum: partition.sum })) : [];
  const groups = finalGroups.length ? finalGroups : sa410GroupsFromAssignments(state);
  const limit = state.answer ?? state.scan.limit ?? state.search.mid;
  const count = groups.length || state.k || 0;
  const boxes = groups.length ? groups.map((group) => {
    const fill = limit ? Math.min(100, group.sum / limit * 100) : 0;
    return `<li class="sa410-bin group-${group.group % 4}"><header><b>G${group.group + 1}</b><strong>${group.sum}<small> / ${limit ?? "?"}</small></strong></header><div class="sa410-bin-body"><i style="--fill:${fill.toFixed(2)}%"></i><div>${group.values.map((item) => `<span class="${state.scan.index === item.index || state.witness.index === item.index ? "is-active" : ""}">${item.value}</span>`).join("")}</div></div></li>`;
  }).join("") : Array.from({ length: Math.min(count, 6) }, (_, index) => `<li class="sa410-bin is-empty"><header><b>G${index + 1}</b><strong>?</strong></header><div class="sa410-bin-body"><span>＋</span></div></li>`).join("");
  let decision = "";
  if (state.phase === "reconstruct" && state.witness.mustCut !== null) {
    const reason = state.witness.capacityCut ? copy.capacityCut : state.witness.remainingCut ? copy.reserveCut : copy.keep;
    decision = `<div class="sa410-cut-decision ${state.witness.mustCut ? "cut" : "keep"}"><b>${state.witness.mustCut ? "✂" : "✓"}</b><span>${sa410Escape(reason)}</span></div>`;
  }
  return `<section class="sa410-packing" aria-label="${sa410Escape(copy.packing)}"><ol role="list">${boxes}</ol>${decision || (!groups.length ? `<p>${sa410Escape(copy.emptyBoxes)}</p>` : "")}</section>`;
}

function renderSplitArray410View(step) {
  const host = typeof document !== "undefined" && document.getElementById ? document.getElementById("treeView") : typeof $ === "function" ? $("treeView") : null;
  if (!host) return;
  const locale = sa410Locale();
  const copy = SA410_COPY[locale];
  const state = sa410Normalize(step);
  const action = sa410Action(state, copy, locale);
  const event = sa410EventLabel(state, locale);
  host.innerHTML = `<article class="sa410-viz phase-${state.phase} ${state.final ? "is-final" : ""}" role="region" aria-label="${sa410Escape(copy.region)}"><header class="sa410-header"><div><span>LEETCODE 410</span><h2>${sa410Escape(copy.fallbackTitle)}</h2></div><div class="sa410-target"><b>${state.k ?? "?"}</b><span>${sa410Escape(copy.target)}</span></div></header>${sa410RenderStages(state, copy)}<div class="sa410-action" aria-live="polite"><strong>${sa410Escape(action)}</strong><span>${sa410Escape(event)}</span></div>${sa410RenderSearch(state, copy)}${sa410RenderArray(state, copy)}${sa410RenderPacking(state, copy)}<footer class="sa410-code"><span>${sa410Escape(copy.line)} ${state.source.line}</span><code>${sa410Escape(state.source.text)}</code></footer></article>`;
}
