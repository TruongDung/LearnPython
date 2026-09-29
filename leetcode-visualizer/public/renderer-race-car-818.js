"use strict";

const RC818_SOURCE = Object.freeze([
  "class Solution:",
  "    def racecar(self, target: int) -> int:",
  "        dp = [0] * (target + 1)",
  "        for distance in range(1, target + 1):",
  "            n = distance.bit_length()",
  "            full = (1 << n) - 1",
  "            if full == distance:",
  "                dp[distance] = n",
  "                continue",
  "            dp[distance] = n + 1 + dp[full - distance]",
  "            for reverse in range(n - 1):",
  "                backward = (1 << reverse) - 1",
  "                remaining = distance - ((1 << (n - 1)) - 1 - backward)",
  "                candidate = (n - 1) + 1 + reverse + 1 + dp[remaining]",
  "                if candidate < dp[distance]:",
  "                    dp[distance] = candidate",
  "        return dp[target]",
]);

const RC818_LINE_EVENTS = Object.freeze([
  "bind-class",
  "bind-method",
  "allocate-and-seed-dp",
  "distance-loop-true",
  "compute-bit-length",
  "compute-full-run",
  "exact-condition-false",
  "write-exact-distance",
  "continue-after-exact",
  "write-overshoot-baseline",
  "reverse-loop-true",
  "compute-backward-distance",
  "compute-remaining-distance",
  "build-undershoot-candidate",
  "strict-improvement-false",
  "write-undershoot-improvement",
  "final-return",
]);

const RC818_EVENTS = Object.freeze({
  "bind-class": { en: "Bind Solution class", vi: "Liên kết lớp Solution" },
  "bind-method": { en: "Bind racecar method", vi: "Liên kết method racecar" },
  "allocate-and-seed-dp": { en: "Allocate and seed DP", vi: "Cấp phát và khởi tạo DP" },
  "distance-loop-true": { en: "Select next distance", vi: "Chọn khoảng cách kế" },
  "distance-loop-false": { en: "Finish all distances", vi: "Hoàn tất mọi khoảng cách" },
  "compute-bit-length": { en: "Find acceleration count", vi: "Tìm số lần tăng tốc" },
  "compute-full-run": { en: "Compute full run", vi: "Tính chuỗi chạy đầy đủ" },
  "exact-condition-true": { en: "Exact run found", vi: "Tìm thấy chuỗi chính xác" },
  "exact-condition-false": { en: "Reversal is required", vi: "Cần đảo hướng" },
  "write-exact-distance": { en: "Store exact optimum", vi: "Lưu tối ưu chính xác" },
  "continue-after-exact": { en: "Skip reversal cases", vi: "Bỏ qua các trường hợp đảo hướng" },
  "write-overshoot-baseline": { en: "Seed overshoot baseline", vi: "Khởi tạo baseline vượt đích" },
  "reverse-loop-true": { en: "Try undershoot reversal", vi: "Thử đảo hướng thiếu đích" },
  "reverse-loop-false": { en: "Finish undershoot cases", vi: "Hoàn tất các trường hợp thiếu đích" },
  "compute-backward-distance": { en: "Compute backward run", vi: "Tính chuỗi chạy lùi" },
  "compute-remaining-distance": { en: "Compute remaining distance", vi: "Tính khoảng cách còn lại" },
  "build-undershoot-candidate": { en: "Build undershoot candidate", vi: "Tạo ứng viên thiếu đích" },
  "strict-improvement-true": { en: "Candidate improves", vi: "Ứng viên cải thiện" },
  "strict-improvement-false": { en: "Keep incumbent", vi: "Giữ incumbent" },
  "write-undershoot-improvement": { en: "Store better choice", vi: "Lưu lựa chọn tốt hơn" },
  "capture-answer": { en: "Capture optimum", vi: "Ghi nhận tối ưu" },
  "initialize-reconstruction": { en: "Start reconstruction", vi: "Bắt đầu tái dựng" },
  "reconstruct-decision": { en: "Expand parent decision", vi: "Mở rộng quyết định parent" },
  "materialize-command-fragment": { en: "Materialize command fragment", vi: "Cụ thể hóa đoạn lệnh" },
  "reconstruction-complete": { en: "Command witness complete", vi: "Hoàn tất witness lệnh" },
  "initialize-simulation": { en: "Start physical simulation", vi: "Bắt đầu mô phỏng vật lý" },
  "simulate-accelerate": { en: "Execute Accelerate", vi: "Chạy lệnh Tăng tốc" },
  "simulate-reverse": { en: "Execute Reverse", vi: "Chạy lệnh Đảo hướng" },
  "simulation-complete": { en: "Simulation reaches target", vi: "Mô phỏng tới đích" },
  "final-return": { en: "Return minimum commands", vi: "Trả số lệnh nhỏ nhất" },
});

const RC818_COUNTERS = Object.freeze([
  ["frames", { en: "Trace frames", vi: "Frame trace" }],
  ["distanceIterations", { en: "Distances solved", vi: "Khoảng cách đã giải" }],
  ["bitLengthComputations", { en: "Bit lengths", vi: "Lần tính bit-length" }],
  ["fullComputations", { en: "Full runs", vi: "Chuỗi chạy đầy đủ" }],
  ["exactChecks", { en: "Exact checks", vi: "Lần kiểm tra chính xác" }],
  ["exactWrites", { en: "Exact writes", vi: "Lần ghi chính xác" }],
  ["overshootCandidates", { en: "Overshoot baselines", vi: "Baseline vượt đích" }],
  ["undershootIterations", { en: "Undershoot cases", vi: "Trường hợp thiếu đích" }],
  ["backwardComputations", { en: "Backward runs", vi: "Lần tính chạy lùi" }],
  ["remainingComputations", { en: "Remainders", vi: "Phần còn lại" }],
  ["candidateEvaluations", { en: "Candidates", vi: "Ứng viên" }],
  ["strictComparisons", { en: "Strict comparisons", vi: "So sánh nghiêm ngặt" }],
  ["improvements", { en: "Improvements", vi: "Lần cải thiện" }],
  ["tiesKept", { en: "Ties kept", vi: "Lần giữ khi hòa" }],
  ["worseKept", { en: "Worse candidates", vi: "Ứng viên kém hơn" }],
  ["decisionWrites", { en: "Decision writes", vi: "Lần ghi quyết định" }],
  ["reconstructionCalls", { en: "Reconstruction calls", vi: "Lần gọi tái dựng" }],
  ["materializations", { en: "Fragments built", vi: "Đoạn lệnh đã tạo" }],
  ["simulatedCommands", { en: "Commands simulated", vi: "Lệnh đã mô phỏng" }],
  ["accelerations", { en: "A commands", vi: "Lệnh A" }],
  ["reverses", { en: "R commands", vi: "Lệnh R" }],
]);

const RC818_INVARIANTS = Object.freeze([
  ["sourceLineValid", { en: "source line belongs to the displayed program", vi: "dòng nguồn thuộc chương trình hiển thị" }],
  ["computedPrefix", { en: "computed DP cells form a complete prefix", vi: "các ô DP đã tính tạo thành prefix đầy đủ" }],
  ["costsAreSafe", { en: "all computed costs are finite safe integers", vi: "mọi cost đã tính là số nguyên hữu hạn an toàn" }],
  ["uncomputedCellsAreZero", { en: "uncomputed storage remains untouched", vi: "bộ nhớ chưa tính vẫn chưa bị thay đổi" }],
  ["decisionsCoverComputed", { en: "every computed cell has a decision", vi: "mọi ô đã tính đều có quyết định" }],
  ["decisionsAreValid", { en: "stored decisions satisfy their recurrence", vi: "các quyết định đã lưu thỏa recurrence" }],
  ["decisionDependenciesDecrease", { en: "every dependency is a smaller distance", vi: "mọi dependency là khoảng cách nhỏ hơn" }],
  ["activeDependencyReady", { en: "the active dependency is already solved", vi: "dependency hiện tại đã được giải" }],
  ["strictImprovementOnly", { en: "updates require a strict improvement", vi: "cập nhật đòi hỏi cải thiện nghiêm ngặt" }],
  ["tieKeptIncumbent", { en: "ties preserve the incumbent", vi: "khi hòa vẫn giữ incumbent" }],
  ["overshootWinsItsTies", { en: "the overshoot baseline wins its ties", vi: "baseline vượt đích thắng khi hòa" }],
  ["answerMatchesTarget", { en: "answer equals the target DP cell", vi: "answer bằng ô DP của target" }],
  ["commandsContainOnlyAR", { en: "the witness contains only A and R", vi: "witness chỉ chứa A và R" }],
  ["commandsMatchAnswer", { en: "witness length equals the answer", vi: "độ dài witness bằng answer" }],
  ["simulationHistoryValid", { en: "simulation transitions obey command rules", vi: "các transition mô phỏng tuân theo quy tắc lệnh" }],
  ["finalWitnessValid", { en: "the optimal witness physically reaches target", vi: "witness tối ưu thực sự tới target" }],
]);

const RC818_TEXT = Object.freeze({
  en: Object.freeze({
    region: "Race Car exact dynamic-programming visualization",
    kicker: "LEETCODE 818 · DISTANCE DP + COMMAND WITNESS",
    fallbackTitle: "Race Car",
    sourceRail: "Exact source and runtime event rail",
    currentAction: "Current source action",
    line: "LINE",
    before: "before execution",
    after: "after execution",
    phase: "Phase",
    event: "Event",
    condition: "Condition",
    noCondition: "No condition on this frame.",
    trueValue: "TRUE",
    falseValue: "FALSE",
    target: "target",
    answer: "minimum commands",
    waiting: "pending",
    recurrence: "Current recurrence",
    recurrenceHelp: "Each distance compares one overshoot with every legal undershoot.",
    distance: "distance",
    accelerations: "n accelerations",
    full: "full run",
    previousFull: "short run",
    reverse: "backward A count",
    backward: "backward distance",
    remaining: "remaining subproblem",
    dependency: "dependency cost",
    fixed: "fixed prefix cost",
    candidateCost: "candidate cost",
    exact: "exact",
    overshoot: "overshoot",
    undershoot: "undershoot",
    base: "base",
    candidate: "Candidate",
    incumbent: "Incumbent",
    noPlan: "No plan is active yet.",
    update: "UPDATE",
    tie: "TIE · KEEP",
    keep: "KEEP",
    baseline: "BASELINE",
    dpTable: "Bottom-up DP table",
    dpHelp: "dp[d] stores the exact minimum command count; each cell also keeps one deterministic reconstruction decision.",
    cost: "cost",
    choice: "choice",
    numberLine: "Physical command simulation",
    trackHelp: "The viewport expands to include zero, target, and every simulated car position.",
    start: "start",
    car: "car",
    speed: "speed",
    commands: "Optimal A/R command witness",
    commandsHelp: "A moves by the current speed and doubles it. R keeps position and resets speed toward the opposite direction.",
    noCommands: "The command witness has not been reconstructed yet.",
    simulationLog: "Simulation history",
    noHistory: "No command has been simulated yet.",
    from: "from",
    to: "to",
    invariants: "Trace invariants",
    notReady: "not ready",
    counters: "Operation counters",
    note: "Why this frame matters",
  }),
  vi: Object.freeze({
    region: "Minh họa quy hoạch động chính xác cho Race Car",
    kicker: "LEETCODE 818 · DP KHOẢNG CÁCH + WITNESS LỆNH",
    fallbackTitle: "Race Car",
    sourceRail: "Mã nguồn chính xác và chuỗi sự kiện runtime",
    currentAction: "Thao tác mã nguồn hiện tại",
    line: "DÒNG",
    before: "trước khi chạy",
    after: "sau khi chạy",
    phase: "Giai đoạn",
    event: "Sự kiện",
    condition: "Điều kiện",
    noCondition: "Frame này không có điều kiện.",
    trueValue: "ĐÚNG",
    falseValue: "SAI",
    target: "target",
    answer: "số lệnh nhỏ nhất",
    waiting: "đang chờ",
    recurrence: "Recurrence hiện tại",
    recurrenceHelp: "Mỗi khoảng cách so sánh một phương án vượt đích với mọi phương án thiếu đích hợp lệ.",
    distance: "khoảng cách",
    accelerations: "n lần tăng tốc",
    full: "chuỗi đầy đủ",
    previousFull: "chuỗi ngắn",
    reverse: "số lệnh A chạy lùi",
    backward: "khoảng cách chạy lùi",
    remaining: "bài toán con còn lại",
    dependency: "cost dependency",
    fixed: "cost prefix cố định",
    candidateCost: "cost ứng viên",
    exact: "chính xác",
    overshoot: "vượt đích",
    undershoot: "thiếu đích",
    base: "cơ sở",
    candidate: "Ứng viên",
    incumbent: "Incumbent",
    noPlan: "Chưa có phương án đang xét.",
    update: "CẬP NHẬT",
    tie: "HÒA · GIỮ",
    keep: "GIỮ",
    baseline: "BASELINE",
    dpTable: "Bảng DP bottom-up",
    dpHelp: "dp[d] lưu số lệnh nhỏ nhất chính xác; mỗi ô cũng giữ một quyết định tái dựng xác định.",
    cost: "cost",
    choice: "lựa chọn",
    numberLine: "Mô phỏng lệnh vật lý",
    trackHelp: "Viewport mở rộng để chứa 0, target và mọi vị trí xe đã mô phỏng.",
    start: "bắt đầu",
    car: "xe",
    speed: "tốc độ",
    commands: "Witness lệnh A/R tối ưu",
    commandsHelp: "A di chuyển theo tốc độ hiện tại rồi nhân đôi. R giữ vị trí và đặt tốc độ về hướng ngược lại.",
    noCommands: "Witness lệnh chưa được tái dựng.",
    simulationLog: "Lịch sử mô phỏng",
    noHistory: "Chưa mô phỏng lệnh nào.",
    from: "từ",
    to: "đến",
    invariants: "Bất biến trace",
    notReady: "chưa sẵn sàng",
    counters: "Bộ đếm thao tác",
    note: "Ý nghĩa của frame này",
  }),
});

function rc818Escape(value) {
  return String(value == null ? "" : value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function rc818Locale() {
  return typeof lang !== "undefined" && lang === "vi" ? "vi" : "en";
}

function rc818Text(value, fallback = "", maximum = 600) {
  if (typeof value !== "string") return fallback;
  const clean = value.slice(0, maximum).trim();
  return /^(?:undefined|null|nan|[+-]?infinity)$/i.test(clean) ? fallback : clean;
}

function rc818Localized(value, locale, fallback) {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return rc818Text(value[locale], rc818Text(value.en, rc818Text(value.vi, fallback)));
  }
  return rc818Text(value, fallback);
}

function rc818Integer(value, minimum, maximum) {
  return Number.isSafeInteger(value) && value >= minimum && value <= maximum ? value : null;
}

function rc818Boolean(value) {
  return typeof value === "boolean" ? value : null;
}

function rc818Plan(value, target) {
  if (!value || typeof value !== "object") return null;
  const distance = rc818Integer(value.distance, 0, target);
  const type = ["base", "exact", "overshoot", "undershoot"].includes(value.type) ? value.type : null;
  const cost = rc818Integer(value.cost, 0, 512);
  const n = rc818Integer(value.n, 0, 16);
  const full = rc818Integer(value.full, 0, 4095);
  const previousFull = rc818Integer(value.previousFull, 0, 2047);
  const reverse = value.reverse === null ? null : rc818Integer(value.reverse, 0, 15);
  const backward = value.backward === null ? null : rc818Integer(value.backward, 0, 2047);
  const remainder = rc818Integer(value.remainder, 0, target);
  const dependencyCost = rc818Integer(value.dependencyCost, 0, 512);
  const fixedCost = rc818Integer(value.fixedCost, 0, 64);
  const prefix = typeof value.prefix === "string" && /^[AR]{0,64}$/.test(value.prefix) ? value.prefix : "";
  if (distance === null || !type || cost === null || n === null || full === null
    || previousFull === null || remainder === null || dependencyCost === null || fixedCost === null) return null;
  return { distance, type, cost, n, full, previousFull, reverse, backward, remainder, dependencyCost, fixedCost, prefix };
}

function rc818Normalize(step) {
  const raw = step && step.raceCar818View && typeof step.raceCar818View === "object"
    ? step.raceCar818View
    : {};
  const inputRaw = raw.input && typeof raw.input === "object" ? raw.input : {};
  const target = rc818Integer(inputRaw.target, 1, 64) ?? 1;
  const sourceRaw = raw.source && typeof raw.source === "object" ? raw.source : {};
  const fallbackLine = step && Array.isArray(step.codeLines) ? step.codeLines[0] : null;
  const sourceLine = rc818Integer(sourceRaw.line, 1, RC818_SOURCE.length)
    ?? rc818Integer(fallbackLine, 1, RC818_SOURCE.length)
    ?? 1;
  const fallbackEvent = RC818_LINE_EVENTS[sourceLine - 1];
  const event = Object.prototype.hasOwnProperty.call(RC818_EVENTS, raw.event) ? raw.event : fallbackEvent;
  const phase = ["setup", "dp", "reconstruction", "done"].includes(raw.phase) ? raw.phase : "setup";
  const timing = raw.timing === "before" ? "before" : "after";
  const conditionRaw = raw.condition && typeof raw.condition === "object" ? raw.condition : {};
  const recurrenceRaw = raw.recurrence && typeof raw.recurrence === "object" ? raw.recurrence : {};
  const recurrence = {
    distance: rc818Integer(recurrenceRaw.distance, 0, target + 1),
    n: rc818Integer(recurrenceRaw.n, 0, 16),
    full: rc818Integer(recurrenceRaw.full, 0, 4095),
    exact: rc818Boolean(recurrenceRaw.exact),
    overshootRemainder: rc818Integer(recurrenceRaw.overshootRemainder, 0, target),
    previousFull: rc818Integer(recurrenceRaw.previousFull, 0, 2047),
    reverse: rc818Integer(recurrenceRaw.reverse, 0, 15),
    backward: rc818Integer(recurrenceRaw.backward, 0, 2047),
    remaining: rc818Integer(recurrenceRaw.remaining, 0, target),
    fixedCost: rc818Integer(recurrenceRaw.fixedCost, 0, 64),
    dependencyCost: rc818Integer(recurrenceRaw.dependencyCost, 0, 512),
    candidateCost: rc818Integer(recurrenceRaw.candidateCost, 0, 512),
  };
  const candidateRaw = raw.candidate && typeof raw.candidate === "object" ? raw.candidate : {};
  const candidate = {
    value: rc818Plan(candidateRaw.value, target),
    incumbent: rc818Plan(candidateRaw.incumbent, target),
    outcome: ["idle", "distance-loop", "distance-loop-complete", "exact", "baseline", "reverse-loop", "reverse-loop-complete", "improve", "tie", "worse"].includes(candidateRaw.outcome)
      ? candidateRaw.outcome
      : "idle",
  };
  const dpRaw = raw.dp && typeof raw.dp === "object" ? raw.dp : {};
  const seenDistances = new Set();
  const table = Array.isArray(dpRaw.table) ? dpRaw.table.slice(0, 65).flatMap((item) => {
    const cell = item && typeof item === "object" ? item : {};
    const distance = rc818Integer(cell.distance, 0, target);
    if (distance === null || seenDistances.has(distance)) return [];
    seenDistances.add(distance);
    const computed = cell.computed === true;
    const cost = computed ? rc818Integer(cell.cost, 0, 512) : null;
    if (computed && cost === null) return [];
    return [{ distance, cost, computed }];
  }).sort((left, right) => left.distance - right.distance) : [];
  const decisions = Array.isArray(raw.decisions)
    ? raw.decisions.slice(0, 65).map((item) => rc818Plan(item, target))
    : [];

  const reconstructionRaw = raw.reconstruction && typeof raw.reconstruction === "object" ? raw.reconstruction : {};
  const commands = typeof reconstructionRaw.commands === "string" && /^[AR]{0,256}$/.test(reconstructionRaw.commands)
    ? reconstructionRaw.commands
    : "";
  const simulationRaw = reconstructionRaw.simulation && typeof reconstructionRaw.simulation === "object"
    ? reconstructionRaw.simulation
    : {};
  const normalizePosition = (value) => rc818Integer(value, -8192, 8192);
  const normalizeSpeed = (value) => rc818Integer(value, -8192, 8192);
  const history = Array.isArray(simulationRaw.history) ? simulationRaw.history.slice(0, 256).flatMap((item) => {
    const entry = item && typeof item === "object" ? item : {};
    const command = entry.command === "A" || entry.command === "R" ? entry.command : null;
    const simulationStep = rc818Integer(entry.step, 1, 256);
    const beforePosition = normalizePosition(entry.beforePosition);
    const beforeSpeed = normalizeSpeed(entry.beforeSpeed);
    const afterPosition = normalizePosition(entry.afterPosition);
    const afterSpeed = normalizeSpeed(entry.afterSpeed);
    return command && simulationStep !== null && beforePosition !== null && beforeSpeed !== null
      && afterPosition !== null && afterSpeed !== null
      ? [{ step: simulationStep, command, beforePosition, beforeSpeed, afterPosition, afterSpeed }]
      : [];
  }) : [];
  const currentRaw = simulationRaw.current && typeof simulationRaw.current === "object" ? simulationRaw.current : {};
  const simulation = {
    started: simulationRaw.started === true,
    index: rc818Integer(simulationRaw.index, 0, 256),
    command: simulationRaw.command === "A" || simulationRaw.command === "R" ? simulationRaw.command : null,
    position: normalizePosition(currentRaw.position),
    speed: normalizeSpeed(currentRaw.speed),
    history,
    complete: simulationRaw.complete === true,
  };
  const fragments = Array.isArray(reconstructionRaw.fragments) ? reconstructionRaw.fragments.slice(0, 64).flatMap((item) => {
    const fragment = item && typeof item === "object" ? item : {};
    const fragmentDistance = rc818Integer(fragment.distance, 0, target);
    const depth = rc818Integer(fragment.depth, 0, 64);
    const type = ["base", "exact", "overshoot", "undershoot"].includes(fragment.type) ? fragment.type : null;
    const fragmentCommands = typeof fragment.commands === "string" && /^[AR]{0,256}$/.test(fragment.commands) ? fragment.commands : "";
    return fragmentDistance !== null && depth !== null && type
      ? [{ distance: fragmentDistance, depth, type, commands: fragmentCommands }]
      : [];
  }) : [];

  const countersRaw = raw.counters && typeof raw.counters === "object" ? raw.counters : {};
  const counters = {};
  RC818_COUNTERS.forEach(([name]) => {
    counters[name] = rc818Integer(countersRaw[name], 0, 100000) ?? 0;
  });
  const invariantsRaw = raw.invariants && typeof raw.invariants === "object" ? raw.invariants : {};
  const invariants = {};
  RC818_INVARIANTS.forEach(([name]) => {
    invariants[name] = rc818Boolean(invariantsRaw[name]);
  });
  const locale = rc818Locale();
  return {
    target,
    source: { line: sourceLine, text: RC818_SOURCE[sourceLine - 1] },
    event,
    phase,
    timing,
    condition: {
      expression: rc818Text(conditionRaw.expression, "", 160),
      result: rc818Boolean(conditionRaw.result),
    },
    recurrence,
    candidate,
    table,
    decisions,
    reconstruction: {
      activeDistance: rc818Integer(reconstructionRaw.activeDistance, 0, target),
      depth: rc818Integer(reconstructionRaw.depth, 0, 64),
      decision: rc818Plan(reconstructionRaw.decision, target),
      fragments,
      commands,
      complete: reconstructionRaw.complete === true,
      simulation,
    },
    counters,
    invariants,
    answer: rc818Integer(raw.answer, 0, 512),
    final: raw.final === true || Boolean(step && step.final),
    title: rc818Localized(step && step.title, locale, RC818_TEXT[locale].fallbackTitle),
    note: rc818Localized(step && step.note, locale, ""),
  };
}

function rc818EventLabel(event, locale) {
  const label = RC818_EVENTS[event];
  if (label) return label[locale];
  return rc818Text(String(event).replace(/-/g, " "), RC818_TEXT[locale].fallbackTitle, 80);
}

function rc818Display(value, fallback) {
  return value === null ? fallback : String(value);
}

function rc818RenderRail(state, copy, locale) {
  const rows = RC818_SOURCE.map((source, index) => {
    const line = index + 1;
    const active = line === state.source.line;
    const label = rc818EventLabel(RC818_LINE_EVENTS[index], locale);
    return `<li class="rc818-rail-item${active ? " rc818-is-current" : ""}"${active ? ' aria-current="step"' : ""}><small>L${line} · ${rc818Escape(label)}</small><code>${rc818Escape(source)}</code></li>`;
  }).join("");
  return `<nav class="rc818-rail-wrap" aria-label="${rc818Escape(copy.sourceRail)}" tabindex="0"><ol class="rc818-event-rail" role="list">${rows}</ol></nav>`;
}

function rc818RenderSource(state, copy, locale) {
  const eventLabel = rc818EventLabel(state.event, locale);
  const conditionClass = state.condition.result === null ? "pending" : state.condition.result ? "true" : "false";
  const condition = state.condition.result === null
    ? copy.noCondition
    : `${state.condition.expression || copy.condition} → ${state.condition.result ? copy.trueValue : copy.falseValue}`;
  return `<section class="rc818-source-card" aria-labelledby="rc818-source-title"><div class="rc818-source-expression"><small id="rc818-source-title">${rc818Escape(copy.currentAction)}</small><code>${rc818Escape(state.source.text)}</code></div><dl class="rc818-source-facts"><div><dt>${rc818Escape(copy.phase)}</dt><dd>${rc818Escape(state.phase)}</dd></div><div><dt>${rc818Escape(copy.event)}</dt><dd>${rc818Escape(eventLabel)}</dd></div><div><dt>${rc818Escape(copy.condition)}</dt><dd class="rc818-condition-${conditionClass}">${rc818Escape(condition)}</dd></div></dl></section>`;
}

function rc818PlanLabel(plan, copy) {
  if (!plan) return copy.noPlan;
  const kind = copy[plan.type] || plan.type;
  const remainder = plan.type === "exact" || plan.type === "base" ? "" : ` · dp[${plan.remainder}]=${plan.dependencyCost}`;
  return `${kind} · ${plan.prefix || "∅"}${remainder} · ${plan.cost}`;
}

function rc818RenderRecurrence(state, copy) {
  const recurrence = state.recurrence;
  const facts = [
    [copy.distance, recurrence.distance],
    [copy.accelerations, recurrence.n],
    [copy.full, recurrence.full],
    [copy.previousFull, recurrence.previousFull],
    [copy.reverse, recurrence.reverse],
    [copy.backward, recurrence.backward],
    [copy.remaining, recurrence.remaining],
    [copy.fixed, recurrence.fixedCost],
    [copy.dependency, recurrence.dependencyCost],
    [copy.candidateCost, recurrence.candidateCost],
  ].map(([label, value]) => `<div><dt>${rc818Escape(label)}</dt><dd>${rc818Escape(rc818Display(value, copy.waiting))}</dd></div>`).join("");
  const outcomeCopy = state.candidate.outcome === "improve"
    ? copy.update
    : state.candidate.outcome === "tie"
      ? copy.tie
      : state.candidate.outcome === "baseline"
        ? copy.baseline
        : copy.keep;
  const candidateClass = state.candidate.outcome === "improve" ? "update" : state.candidate.outcome === "tie" ? "tie" : "keep";
  return `<section class="rc818-card rc818-recurrence-card" aria-labelledby="rc818-recurrence-title"><header><div><h3 id="rc818-recurrence-title">${rc818Escape(copy.recurrence)}</h3><p>${rc818Escape(copy.recurrenceHelp)}</p></div><span class="rc818-outcome rc818-outcome-${candidateClass}">${rc818Escape(outcomeCopy)}</span></header><dl class="rc818-fact-grid">${facts}</dl><div class="rc818-plan-grid"><article class="rc818-plan rc818-plan-candidate"><small>${rc818Escape(copy.candidate)}</small><strong>${rc818Escape(rc818PlanLabel(state.candidate.value, copy))}</strong></article><article class="rc818-plan rc818-plan-incumbent"><small>${rc818Escape(copy.incumbent)}</small><strong>${rc818Escape(rc818PlanLabel(state.candidate.incumbent, copy))}</strong></article></div></section>`;
}

function rc818RenderDp(state, copy) {
  const rows = state.table.map((cell) => {
    const plan = state.decisions[cell.distance] || null;
    const active = cell.distance === state.recurrence.distance;
    const dependency = cell.distance === state.recurrence.remaining
      || cell.distance === state.candidate.value?.remainder;
    const classes = [active ? "rc818-is-active" : "", dependency ? "rc818-is-dependency" : "", cell.computed ? "rc818-is-computed" : ""].filter(Boolean).join(" ");
    return `<tr class="${classes}"><th scope="row">${cell.distance}</th><td>${cell.cost === null ? "·" : cell.cost}</td><td><span class="rc818-choice rc818-choice-${plan ? plan.type : "pending"}">${rc818Escape(plan ? copy[plan.type] || plan.type : copy.waiting)}</span></td><td><code>${rc818Escape(plan ? plan.prefix || "∅" : "·")}</code></td></tr>`;
  }).join("");
  return `<section class="rc818-card rc818-dp-card" aria-labelledby="rc818-dp-title"><header><div><h3 id="rc818-dp-title">${rc818Escape(copy.dpTable)}</h3><p>${rc818Escape(copy.dpHelp)}</p></div><strong>0…${state.target}</strong></header><div class="rc818-table-scroll" tabindex="0"><table><thead><tr><th scope="col">d</th><th scope="col">${rc818Escape(copy.cost)}</th><th scope="col">${rc818Escape(copy.choice)}</th><th scope="col">prefix</th></tr></thead><tbody>${rows}</tbody></table></div></section>`;
}

function rc818TrackBounds(state) {
  const history = state.reconstruction.simulation.history;
  const positions = [0, state.target];
  history.forEach((entry) => positions.push(entry.beforePosition, entry.afterPosition));
  if (state.reconstruction.simulation.position !== null) positions.push(state.reconstruction.simulation.position);
  const low = Math.min(...positions);
  const high = Math.max(...positions);
  const span = Math.max(1, high - low);
  const padding = Math.max(1, Math.ceil(span * 0.1));
  return { minimum: low - padding, maximum: high + padding };
}

function rc818TrackPercent(value, bounds) {
  return ((value - bounds.minimum) / (bounds.maximum - bounds.minimum)) * 100;
}

function rc818RenderTrack(state, copy) {
  const simulation = state.reconstruction.simulation;
  const position = simulation.position ?? 0;
  const speed = simulation.speed ?? 1;
  const bounds = rc818TrackBounds(state);
  const targetPercent = rc818TrackPercent(state.target, bounds).toFixed(3);
  const zeroPercent = rc818TrackPercent(0, bounds).toFixed(3);
  const carPercent = rc818TrackPercent(position, bounds).toFixed(3);
  const direction = speed < 0 ? "←" : "→";
  const reached = simulation.complete && position === state.target;
  return `<section class="rc818-card rc818-track-card" aria-labelledby="rc818-track-title"><header><div><h3 id="rc818-track-title">${rc818Escape(copy.numberLine)}</h3><p>${rc818Escape(copy.trackHelp)}</p></div><strong>${rc818Escape(copy.speed)} ${speed}</strong></header><div class="rc818-track" role="img" aria-label="${rc818Escape(`${copy.car} ${position}; ${copy.target} ${state.target}; ${copy.speed} ${speed}`)}"><div class="rc818-track-axis"></div><span class="rc818-track-bound rc818-track-min">${bounds.minimum}</span><span class="rc818-track-bound rc818-track-max">${bounds.maximum}</span><span class="rc818-track-marker rc818-track-zero" style="--rc818-x:${zeroPercent}%"><i></i><b>0</b><small>${rc818Escape(copy.start)}</small></span><span class="rc818-track-marker rc818-track-target" style="--rc818-x:${targetPercent}%"><i></i><b>${state.target}</b><small>${rc818Escape(copy.target)}</small></span><span class="rc818-car${reached ? " rc818-has-reached" : ""}" style="--rc818-x:${carPercent}%"><b>${direction}</b><small>${rc818Escape(copy.car)} ${position}</small></span></div></section>`;
}

function rc818RenderCommands(state, copy) {
  const reconstruction = state.reconstruction;
  const commands = reconstruction.commands;
  const simulation = reconstruction.simulation;
  const completed = simulation.history.length;
  const tokens = commands
    ? [...commands].map((command, index) => {
      const status = index < completed ? "complete" : index === simulation.index && simulation.command ? "current" : "pending";
      return `<li class="rc818-command rc818-command-${command.toLowerCase()} rc818-command-${status}"${status === "current" ? ' aria-current="step"' : ""}><small>${index + 1}</small><strong>${command}</strong></li>`;
    }).join("")
    : `<li class="rc818-empty">${rc818Escape(copy.noCommands)}</li>`;
  const recent = simulation.history.slice(-12).map((entry) => `<li><span><b>${entry.step}</b><strong class="rc818-log-command rc818-log-${entry.command.toLowerCase()}">${entry.command}</strong></span><code>${entry.beforePosition}, ${entry.beforeSpeed} → ${entry.afterPosition}, ${entry.afterSpeed}</code></li>`).join("");
  return `<section class="rc818-card rc818-command-card" aria-labelledby="rc818-command-title"><header><div><h3 id="rc818-command-title">${rc818Escape(copy.commands)}</h3><p>${rc818Escape(copy.commandsHelp)}</p></div><strong>${commands ? `${completed}/${commands.length}` : copy.waiting}</strong></header><ol class="rc818-command-list" role="list" tabindex="0">${tokens}</ol><div class="rc818-log"><h4>${rc818Escape(copy.simulationLog)}</h4>${recent ? `<ol role="list">${recent}</ol>` : `<p class="rc818-empty">${rc818Escape(copy.noHistory)}</p>`}</div></section>`;
}

function rc818RenderDiagnostics(state, copy, locale) {
  const invariantRows = RC818_INVARIANTS.map(([name, labels]) => {
    const result = state.invariants[name];
    const status = result === null ? "pending" : result ? "pass" : "fail";
    const icon = result === null ? "…" : result ? "✓" : "!";
    return `<li class="rc818-check rc818-check-${status}"><span aria-hidden="true">${icon}</span><p>${rc818Escape(labels[locale])}</p><strong>${result === null ? rc818Escape(copy.notReady) : result ? "OK" : "FAIL"}</strong></li>`;
  }).join("");
  const counterRows = RC818_COUNTERS.map(([name, labels]) => `<div><dt>${rc818Escape(labels[locale])}</dt><dd>${state.counters[name]}</dd></div>`).join("");
  return `<section class="rc818-diagnostics"><article class="rc818-card" aria-labelledby="rc818-invariants-title"><header><h3 id="rc818-invariants-title">${rc818Escape(copy.invariants)}</h3></header><ul class="rc818-check-list" role="list">${invariantRows}</ul></article><article class="rc818-card" aria-labelledby="rc818-counters-title"><header><h3 id="rc818-counters-title">${rc818Escape(copy.counters)}</h3></header><dl class="rc818-counter-grid">${counterRows}</dl></article></section>`;
}

function renderRaceCar818View(step) {
  const root = typeof $ === "function" ? $("treeView") : null;
  if (!root) return;
  const state = rc818Normalize(step);
  const locale = rc818Locale();
  const copy = RC818_TEXT[locale];
  const answer = state.answer === null ? copy.waiting : state.answer;
  const finalClass = state.final ? " rc818-is-final" : "";
  root.innerHTML = `<div class="rc818-viz${finalClass}" role="region" aria-label="${rc818Escape(copy.region)}"><header class="rc818-hero"><div><p>${rc818Escape(copy.kicker)}</p><h2>${rc818Escape(state.title)}</h2></div><dl><div><dt>${rc818Escape(copy.target)}</dt><dd>${state.target}</dd></div><div><dt>${rc818Escape(copy.answer)}</dt><dd aria-live="polite">${rc818Escape(answer)}</dd></div></dl></header><div class="rc818-layout"><aside>${rc818RenderRail(state, copy, locale)}</aside><main>${rc818RenderSource(state, copy, locale)}<div class="rc818-primary-grid">${rc818RenderRecurrence(state, copy)}${rc818RenderTrack(state, copy)}</div>${rc818RenderDp(state, copy)}${rc818RenderCommands(state, copy)}${rc818RenderDiagnostics(state, copy, locale)}<section class="rc818-note" aria-labelledby="rc818-note-title"><strong id="rc818-note-title">${rc818Escape(copy.note)}</strong><p>${rc818Escape(state.note)}</p></section></main></div></div>`;
}
