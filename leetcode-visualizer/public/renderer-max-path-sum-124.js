"use strict";

const MPS124_EVENT_RAIL = Object.freeze([
  { line: 3, event: "initialize-best", en: "Initialize best", vi: "Khởi tạo best" },
  { line: 4, event: "define-gain", en: "Define gain", vi: "Định nghĩa gain" },
  { line: 10, event: "call-root", en: "Call root", vi: "Gọi root" },
  { line: 5, event: "check-node", en: "Check node", vi: "Kiểm tra node" },
  { line: 5, event: "return-zero", en: "None returns 0", vi: "None trả 0" },
  { line: 6, event: "call-left", en: "Call left", vi: "Gọi trái" },
  { line: 6, event: "raw-left-return", en: "Left raw return", vi: "Raw trái trở về" },
  { line: 6, event: "clamp-left", en: "Clamp left", vi: "Chặn trái" },
  { line: 7, event: "call-right", en: "Call right", vi: "Gọi phải" },
  { line: 7, event: "raw-right-return", en: "Right raw return", vi: "Raw phải trở về" },
  { line: 7, event: "clamp-right", en: "Clamp right", vi: "Chặn phải" },
  { line: 8, event: "through-candidate", en: "Build candidate", vi: "Tạo candidate" },
  { line: 8, event: "best-update", en: "Update global", vi: "Cập nhật global" },
  { line: 8, event: "best-keep", en: "Keep global", vi: "Giữ global" },
  { line: 9, event: "return-one-arm", en: "Return one arm", vi: "Trả một tay" },
  { line: 10, event: "root-returned", en: "Root returned", vi: "Root đã trả" },
  { line: 11, event: "done", en: "Final answer", vi: "Đáp án cuối" },
]);

const MPS124_DEFAULT_STAGES = Object.freeze([
  Object.freeze({ en: "Initialize the rule", vi: "Khởi tạo quy tắc" }),
  Object.freeze({ en: "Descend and check calls", vi: "Đi xuống và kiểm tra" }),
  Object.freeze({ en: "Receive and clamp gains", vi: "Nhận và chặn gain" }),
  Object.freeze({ en: "Compare the through path", vi: "So sánh path đi qua" }),
  Object.freeze({ en: "Return one arm and finish", vi: "Trả một tay và hoàn tất" }),
]);

const MPS124_TEXT = Object.freeze({
  en: Object.freeze({
    region: "Binary Tree Maximum Path Sum line-by-line visualization",
    kicker: "LEETCODE 124 · POSTORDER DFS",
    line: "LINE",
    before: "before execution",
    after: "after execution",
    eventRail: "Source line and event rail",
    invariantGlobal: "GLOBAL CANDIDATE",
    invariantGlobalBody: "A path through a node may join both positive child arms.",
    invariantReturn: "PARENT RETURN",
    invariantReturnBody: "A return may carry only one arm; positive ties choose left.",
    sourceState: "Source state",
    currentCall: "Current call",
    noCurrent: "No active node",
    nextCall: "Next call",
    noNext: "No pending call",
    activePath: "Active DFS path",
    pathEmpty: "The root call has returned",
    tree: "Tree · identity-safe node state",
    treeHelp: "Amber is current, the call path is marked, and FINAL is the winning witness.",
    treeUnavailable: "Tree view unavailable",
    stack: "Call stack",
    stackHelp: "The last frame is active",
    emptyStack: "Call stack is empty",
    leftGate: "LEFT GAIN GATE",
    rightGate: "RIGHT GAIN GATE",
    raw: "raw",
    clamped: "clamped",
    waiting: "WAITING",
    kept: "KEEP",
    discarded: "DISCARD",
    none: "None",
    through: "Through-node candidate",
    throughHelp: "The global comparison may use both positive arms.",
    noCandidate: "Waiting for both clamped child gains.",
    global: "Global best",
    uninitialized: "not initialized by a node",
    update: "UPDATE",
    keep: "KEEP FIRST WITNESS",
    pending: "COMPARE PENDING",
    pivot: "pivot",
    witness: "witness",
    returnArm: "One-arm return",
    returnHelp: "Only this chain can continue through the parent.",
    notReturned: "This call has not returned yet.",
    chooseLeft: "choose left",
    chooseRight: "choose right",
    chooseNone: "node only",
    processed: "Processed ledger",
    processedHelp: "One immutable postorder record per completed non-null node",
    noProcessed: "No non-null node has completed yet.",
    candidate: "candidate",
    answer: "GLOBAL ANSWER",
    answerPath: "winning path",
    rootReturn: "ROOT RETURN",
    rootReturnHelp: "A one-arm gain, not necessarily the answer",
    currentBest: "Current global witness",
    currentBestHelp: "Strict updates preserve the first path on equal sums.",
    note: "Why this frame matters",
    id: "node id",
  }),
  vi: Object.freeze({
    region: "Trực quan từng dòng Tổng đường đi lớn nhất trong cây nhị phân",
    kicker: "LEETCODE 124 · DFS HẬU TỰ",
    line: "DÒNG",
    before: "trước khi chạy",
    after: "sau khi chạy",
    eventRail: "Thanh dòng lệnh và sự kiện",
    invariantGlobal: "CANDIDATE TOÀN CỤC",
    invariantGlobalBody: "Path đi qua một node có thể nối cả hai tay con dương.",
    invariantReturn: "GIÁ TRỊ TRẢ CHO CHA",
    invariantReturnBody: "Mỗi return chỉ mang một tay; tie dương ưu tiên trái.",
    sourceState: "Trạng thái dòng lệnh",
    currentCall: "Lời gọi hiện tại",
    noCurrent: "Không có node đang chạy",
    nextCall: "Lời gọi tiếp theo",
    noNext: "Không có lời gọi chờ",
    activePath: "Đường DFS đang hoạt động",
    pathEmpty: "Lời gọi root đã return",
    tree: "Cây · trạng thái theo định danh node",
    treeHelp: "Cam là current, call path được đánh dấu, FINAL là witness chiến thắng.",
    treeUnavailable: "Không thể hiển thị cây",
    stack: "Call stack",
    stackHelp: "Frame cuối đang hoạt động",
    emptyStack: "Call stack rỗng",
    leftGate: "CỔNG GAIN TRÁI",
    rightGate: "CỔNG GAIN PHẢI",
    raw: "raw",
    clamped: "đã chặn",
    waiting: "ĐANG CHỜ",
    kept: "GIỮ",
    discarded: "BỎ",
    none: "None",
    through: "Candidate đi qua node",
    throughHelp: "Phép so sánh global có thể dùng cả hai tay dương.",
    noCandidate: "Đang chờ hai child gain đã chặn.",
    global: "Global best",
    uninitialized: "chưa được node nào khởi tạo",
    update: "CẬP NHẬT",
    keep: "GIỮ WITNESS ĐẦU",
    pending: "CHƯA SO SÁNH",
    pivot: "pivot",
    witness: "witness",
    returnArm: "Return một tay",
    returnHelp: "Chỉ chain này có thể tiếp tục qua parent.",
    notReturned: "Lời gọi này chưa return.",
    chooseLeft: "chọn trái",
    chooseRight: "chọn phải",
    chooseNone: "chỉ node",
    processed: "Sổ node đã xử lý",
    processedHelp: "Một record hậu tự bất biến cho mỗi node khác None đã xong",
    noProcessed: "Chưa có node khác None nào hoàn tất.",
    candidate: "candidate",
    answer: "ĐÁP ÁN GLOBAL",
    answerPath: "path chiến thắng",
    rootReturn: "ROOT RETURN",
    rootReturnHelp: "Gain một tay, không nhất thiết là đáp án",
    currentBest: "Witness global hiện tại",
    currentBestHelp: "Chỉ update nghiêm ngặt nên path đầu tiên thắng khi bằng tổng.",
    note: "Ý nghĩa của frame này",
    id: "id node",
  }),
});

function mps124Escape(value) {
  return String(value == null ? "" : value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function mps124Locale() {
  return typeof lang !== "undefined" && lang === "vi" ? "vi" : "en";
}

function mps124CleanText(value, fallback = "") {
  if (typeof value !== "string") return fallback;
  const clean = value.slice(0, 240).trim();
  return /^(?:undefined|nan|[+-]?infinity)$/i.test(clean) ? fallback : clean;
}

function mps124Localized(value, locale, fallback = "") {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return mps124CleanText(value[locale], mps124CleanText(value.en, mps124CleanText(value.vi, fallback)));
  }
  return mps124CleanText(value, fallback);
}

function mps124Number(value) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function mps124Integer(value) {
  return Number.isInteger(value) && value >= 0 ? value : null;
}

function mps124Display(value, fallback = "—") {
  const number = mps124Number(value);
  if (number !== null) return String(Object.is(number, -0) ? 0 : number);
  const text = mps124CleanText(value, "");
  return text || fallback;
}

function mps124Node(value) {
  if (!value || typeof value !== "object") return null;
  const id = mps124Integer(value.id !== undefined ? value.id : value.nodeId);
  const nodeValue = mps124Number(value.value);
  return id === null || nodeValue === null ? null : { id, value: nodeValue };
}

function mps124IdArray(value) {
  return Array.isArray(value) ? value.map(mps124Integer).filter((item) => item !== null).slice(0, 31) : [];
}

function mps124ValueArray(value) {
  return Array.isArray(value) ? value.map(mps124Number).filter((item) => item !== null).slice(0, 31) : [];
}

function mps124NormalizePath(value) {
  if (!Array.isArray(value)) return [];
  return value.slice(0, 31).map((item) => {
    const node = mps124Node(item);
    if (!node) return null;
    return {
      ...node,
      side: ["root", "left", "right"].includes(item.side) ? item.side : "root",
      depth: mps124Integer(item.depth) ?? 0,
      current: item.current === true,
    };
  }).filter(Boolean);
}

function mps124NormalizeStack(value) {
  if (!Array.isArray(value)) return [];
  return value.slice(0, 32).map((item, index) => {
    const raw = item && typeof item === "object" ? item : {};
    const id = mps124Integer(raw.id !== undefined ? raw.id : raw.nodeId);
    return {
      index,
      id,
      value: mps124Number(raw.value),
      side: ["root", "left", "right"].includes(raw.side) ? raw.side : "root",
      depth: mps124Integer(raw.depth) ?? index,
      stage: mps124CleanText(raw.stage, "waiting"),
      leftRaw: mps124Number(raw.leftRaw),
      leftClamped: mps124Number(raw.leftClamped),
      rightRaw: mps124Number(raw.rightRaw),
      rightClamped: mps124Number(raw.rightClamped),
    };
  });
}

function mps124NormalizeChild(value, rawMirror, clampedMirror) {
  const raw = value && typeof value === "object" ? value : {};
  const id = mps124Integer(raw.id);
  return {
    id,
    value: mps124Number(raw.value),
    ready: raw.ready === true || rawMirror !== null,
    clampedReady: raw.clampedReady === true || clampedMirror !== null,
    raw: mps124Number(raw.raw) ?? rawMirror,
    clamped: mps124Number(raw.clamped) ?? clampedMirror,
    included: typeof raw.included === "boolean" ? raw.included : (clampedMirror === null ? null : clampedMirror > 0),
    pathIds: mps124IdArray(raw.pathIds),
    pathValues: mps124ValueArray(raw.pathValues),
  };
}

function mps124NormalizeProcessed(value) {
  if (!Array.isArray(value)) return [];
  return value.slice(0, 31).map((item) => {
    const raw = item && typeof item === "object" ? item : {};
    const id = mps124Integer(raw.id);
    const nodeValue = mps124Number(raw.value);
    if (id === null || nodeValue === null) return null;
    return {
      id,
      value: nodeValue,
      leftRaw: mps124Number(raw.leftRaw),
      leftClamped: mps124Number(raw.leftClamped),
      rightRaw: mps124Number(raw.rightRaw),
      rightClamped: mps124Number(raw.rightClamped),
      candidateSum: mps124Number(raw.candidateSum),
      globalAfter: mps124Number(raw.globalAfter),
      globalUpdated: raw.globalUpdated === true,
      returnGain: mps124Number(raw.returnGain),
      chosenArm: ["left", "right", "none"].includes(raw.chosenArm) ? raw.chosenArm : "none",
      candidatePathIds: mps124IdArray(raw.candidatePathIds),
      candidatePathValues: mps124ValueArray(raw.candidatePathValues),
      returnPathIds: mps124IdArray(raw.returnPathIds),
      returnPathValues: mps124ValueArray(raw.returnPathValues),
    };
  }).filter(Boolean);
}

function mps124Normalize(step) {
  const raw = step && step.maxPathSum124View && typeof step.maxPathSum124View === "object"
    ? step.maxPathSum124View
    : {};
  const sourceFromStep = step && Array.isArray(step.codeLines) ? step.codeLines[0] : null;
  const directLine = Number.isInteger(raw.sourceLine) && raw.sourceLine >= 1 && raw.sourceLine <= 11 ? raw.sourceLine : null;
  const sourceLine = directLine !== null || !(Number.isInteger(sourceFromStep) && sourceFromStep >= 1 && sourceFromStep <= 11)
    ? directLine
    : sourceFromStep;
  const event = MPS124_EVENT_RAIL.some((item) => item.event === raw.event)
    ? raw.event
    : "unknown";
  const leftRaw = mps124Number(raw.leftRaw);
  const leftClamped = mps124Number(raw.leftClamped);
  const rightRaw = mps124Number(raw.rightRaw);
  const rightClamped = mps124Number(raw.rightClamped);
  const candidateRaw = raw.candidate && typeof raw.candidate === "object" ? raw.candidate : {};
  const globalRaw = raw.global && typeof raw.global === "object" ? raw.global : {};
  const returnedRaw = raw.returned && typeof raw.returned === "object" ? raw.returned : {};
  const globalInitialized = raw.globalInitialized === true || globalRaw.initialized === true;
  const globalUpdated = typeof raw.globalUpdated === "boolean"
    ? raw.globalUpdated
    : typeof globalRaw.updated === "boolean" ? globalRaw.updated : null;
  const candidateSum = mps124Number(raw.candidateSum) ?? mps124Number(candidateRaw.sum);
  const candidatePathIds = mps124IdArray(raw.candidatePathIds).length
    ? mps124IdArray(raw.candidatePathIds)
    : mps124IdArray(candidateRaw.pathIds);
  const candidatePathValues = mps124ValueArray(raw.candidatePathValues).length
    ? mps124ValueArray(raw.candidatePathValues)
    : mps124ValueArray(candidateRaw.pathValues);
  const globalPathIds = mps124IdArray(raw.globalPathIds).length
    ? mps124IdArray(raw.globalPathIds)
    : mps124IdArray(globalRaw.pathIds);
  const globalPathValues = mps124ValueArray(raw.globalPathValues).length
    ? mps124ValueArray(raw.globalPathValues)
    : mps124ValueArray(globalRaw.pathValues);
  const returnedGain = mps124Number(raw.returnedGain) ?? mps124Number(raw.returnGain) ?? mps124Number(returnedRaw.gain);
  const returnedPathIds = mps124IdArray(raw.returnedPathIds).length
    ? mps124IdArray(raw.returnedPathIds)
    : mps124IdArray(raw.returnPathIds).length ? mps124IdArray(raw.returnPathIds) : mps124IdArray(returnedRaw.pathIds);
  const returnedPathValues = mps124ValueArray(raw.returnedPathValues).length
    ? mps124ValueArray(raw.returnedPathValues)
    : mps124ValueArray(raw.returnPathValues).length ? mps124ValueArray(raw.returnPathValues) : mps124ValueArray(returnedRaw.pathValues);
  const stagesRaw = Array.isArray(raw.stages) ? raw.stages.slice(0, 5) : [];
  const stages = Array.from({ length: 5 }, (_, index) => stagesRaw[index] || MPS124_DEFAULT_STAGES[index]);
  const stage = Number.isInteger(raw.stage) && raw.stage >= 0 && raw.stage < stages.length ? raw.stage : 0;
  const current = mps124Node(raw.current);
  const nextRaw = raw.nextCall && typeof raw.nextCall === "object" ? raw.nextCall : null;
  const nextCall = nextRaw ? {
    id: mps124Integer(nextRaw.id !== undefined ? nextRaw.id : nextRaw.nodeId),
    value: mps124Number(nextRaw.value),
    side: ["root", "left", "right"].includes(nextRaw.side) ? nextRaw.side : "root",
    depth: mps124Integer(nextRaw.depth) ?? 0,
  } : null;
  const stack = mps124NormalizeStack(Array.isArray(raw.callStack) ? raw.callStack : raw.stack);
  const chosenArm = ["left", "right", "none"].includes(raw.chosenArm)
    ? raw.chosenArm
    : ["left", "right", "none"].includes(returnedRaw.chosenArm) ? returnedRaw.chosenArm : null;

  return {
    version: Number.isInteger(raw.version) && raw.version > 0 ? raw.version : 1,
    problemId: raw.problemId === 124 ? 124 : 124,
    sourceLine,
    timing: raw.timing === "before" ? "before" : "after",
    phase: mps124CleanText(raw.phase, "unknown"),
    event,
    stages,
    stage,
    current,
    nextCall,
    path: mps124NormalizePath(raw.path),
    stack,
    left: mps124NormalizeChild(raw.left, leftRaw, leftClamped),
    right: mps124NormalizeChild(raw.right, rightRaw, rightClamped),
    leftRaw,
    leftClamped,
    rightRaw,
    rightClamped,
    candidate: {
      sum: candidateSum,
      pivot: mps124Node(candidateRaw.pivot) || current,
      pathIds: candidatePathIds,
      pathValues: candidatePathValues,
    },
    global: {
      initialized: globalInitialized,
      before: mps124Number(raw.globalBefore) ?? mps124Number(globalRaw.before),
      after: mps124Number(raw.globalAfter) ?? mps124Number(globalRaw.after),
      updated: globalUpdated,
      pivot: mps124Node(raw.globalPivot) || mps124Node(globalRaw.pivot),
      pathIds: globalPathIds,
      pathValues: globalPathValues,
    },
    returned: {
      gain: returnedGain,
      chosenArm,
      pathIds: returnedPathIds,
      pathValues: returnedPathValues,
    },
    processed: mps124NormalizeProcessed(raw.processed),
    rootReturn: mps124Number(raw.rootReturn),
    answer: mps124Number(raw.answer),
    final: raw.final === true || Boolean(step && step.final),
    title: mps124Localized(step && step.title, mps124Locale(), "Maximum Path Sum"),
    note: mps124Localized(step && step.note, mps124Locale(), ""),
  };
}

function mps124PathHtml(ids, values, emptyText) {
  const length = Math.max(ids.length, values.length);
  if (!length) return `<span class="mps124-empty">${mps124Escape(emptyText)}</span>`;
  return Array.from({ length }, (_, index) => {
    const value = values[index] === undefined ? "—" : mps124Display(values[index]);
    const id = ids[index] === undefined ? "—" : mps124Display(ids[index]);
    const arrow = index < length - 1 ? `<i aria-hidden="true">→</i>` : "";
    return `<span class="mps124-path-node"><strong>${mps124Escape(value)}</strong><small>#${mps124Escape(id)}</small></span>${arrow}`;
  }).join("");
}

function mps124RenderRail(state, copy, locale) {
  return `<nav class="mps124-rail-wrap" aria-label="${mps124Escape(copy.eventRail)}"><ol class="mps124-event-rail" role="list">${MPS124_EVENT_RAIL.map((item) => {
    const current = item.event === state.event && item.line === state.sourceLine;
    return `<li class="mps124-event ${current ? "is-current" : ""}"${current ? " aria-current=\"step\"" : ""}><small>L${item.line}</small><span>${mps124Escape(item[locale])}</span></li>`;
  }).join("")}</ol></nav>`;
}

function mps124RenderStages(state, locale) {
  return `<ol class="mps124-stages" role="list">${state.stages.map((stage, index) => {
    const tone = index < state.stage ? "is-past" : index === state.stage ? "is-current" : "is-next";
    return `<li class="${tone}"${index === state.stage ? " aria-current=\"step\"" : ""}><i>${index < state.stage ? "✓" : index + 1}</i><span>${mps124Escape(mps124Localized(stage, locale, `Stage ${index + 1}`))}</span></li>`;
  }).join("")}</ol>`;
}

function mps124Equation(state) {
  const node = state.current ? mps124Display(state.current.value) : "node";
  const leftRaw = mps124Display(state.leftRaw);
  const left = mps124Display(state.leftClamped);
  const rightRaw = mps124Display(state.rightRaw);
  const right = mps124Display(state.rightClamped);
  const candidate = mps124Display(state.candidate.sum);
  const returned = mps124Display(state.returned.gain);
  switch (state.event) {
    case "initialize-best": return "self.max_sum uses an unbounded sentinel (JSON state: null, initialized=false)";
    case "define-gain": return "def gain(node):";
    case "call-root": return "gain(root)";
    case "check-node": return `if not ${node}`;
    case "return-zero": return "if not node: return 0";
    case "call-left": return `gain(${node}.left)`;
    case "raw-left-return": return `gain(node.left) → ${leftRaw}`;
    case "clamp-left": return `max(${leftRaw}, 0) = ${left}`;
    case "call-right": return `gain(${node}.right)`;
    case "raw-right-return": return `gain(node.right) → ${rightRaw}`;
    case "clamp-right": return `max(${rightRaw}, 0) = ${right}`;
    case "through-candidate": return `${node} + ${left} + ${right} = ${candidate}`;
    case "best-update":
    case "best-keep": return `max(${mps124Display(state.global.before, "unset")}, ${candidate}) = ${mps124Display(state.global.after)}`;
    case "return-one-arm": return `${node} + max(${left}, ${right}) = ${returned}`;
    case "root-returned": return `gain(root) → ${mps124Display(state.rootReturn)}`;
    case "done": return `return ${mps124Display(state.answer)}`;
    default: return "—";
  }
}

function mps124RenderStack(state, copy) {
  const frames = state.stack.length ? state.stack.map((frame, index) => {
    const active = index === state.stack.length - 1;
    const value = frame.value === null ? copy.none : mps124Display(frame.value);
    return `<li class="mps124-frame ${active ? "is-active" : ""}"><span>#${index + 1}</span><div><strong>${mps124Escape(value)}</strong><small>${mps124Escape(`${frame.side} · depth ${frame.depth}`)}</small></div><code>L ${mps124Escape(mps124Display(frame.leftRaw, "?"))}→${mps124Escape(mps124Display(frame.leftClamped, "?"))} · R ${mps124Escape(mps124Display(frame.rightRaw, "?"))}→${mps124Escape(mps124Display(frame.rightClamped, "?"))}</code><em>${mps124Escape(frame.stage)}</em></li>`;
  }).join("") : `<li class="mps124-empty-frame">${mps124Escape(copy.emptyStack)}</li>`;
  return `<section class="mps124-card mps124-stack-card"><header><h3>${mps124Escape(copy.stack)}</h3><span>${mps124Escape(copy.stackHelp)}</span></header><ol>${frames}</ol></section>`;
}

function mps124RenderGate(side, child, copy) {
  const isLeft = side === "left";
  const heading = isLeft ? copy.leftGate : copy.rightGate;
  const waiting = !child.ready;
  const discarded = child.clampedReady && child.raw !== null && child.raw < 0;
  const kept = child.clampedReady && !discarded;
  const tone = waiting ? "is-waiting" : discarded ? "is-discarded" : "is-kept";
  const status = waiting ? copy.waiting : discarded ? copy.discarded : copy.kept;
  const childValue = child.id === null ? copy.none : mps124Display(child.value);
  const raw = mps124Display(child.raw, "?");
  const clamped = mps124Display(child.clamped, "?");
  return `<section class="mps124-gate ${tone}" aria-label="${mps124Escape(heading)}"><header><h3>${mps124Escape(heading)}</h3><strong>${mps124Escape(status)}</strong></header><div class="mps124-gate-flow"><span><small>CHILD</small><b>${mps124Escape(childValue)}</b><em>${child.id === null ? "#—" : `#${mps124Escape(child.id)}`}</em></span><i aria-hidden="true">→</i><span><small>${mps124Escape(copy.raw)}</small><b>${mps124Escape(raw)}</b></span><i aria-hidden="true">→</i><span><small>max(raw, 0)</small><b>${mps124Escape(clamped)}</b></span></div><code>${mps124Escape(side)}_gain = max(${mps124Escape(raw)}, 0) = ${mps124Escape(clamped)}</code></section>`;
}

function mps124RenderDecision(state, copy) {
  const hasCandidate = state.candidate.sum !== null;
  const decision = state.global.updated === true ? copy.update : state.global.updated === false ? copy.keep : copy.pending;
  const tone = state.global.updated === true ? "is-update" : state.global.updated === false ? "is-keep" : "is-pending";
  const currentValue = state.current ? mps124Display(state.current.value) : "node";
  const formula = hasCandidate
    ? `${mps124Display(state.leftClamped)} + ${currentValue} + ${mps124Display(state.rightClamped)} = ${mps124Display(state.candidate.sum)}`
    : copy.noCandidate;
  const pivot = state.global.pivot ? `${mps124Display(state.global.pivot.value)} (#${state.global.pivot.id})` : "—";
  return `<div class="mps124-calculation-grid"><section class="mps124-card mps124-through-card ${hasCandidate ? "is-ready" : ""}"><header><h3>${mps124Escape(copy.through)}</h3><span>${mps124Escape(copy.throughHelp)}</span></header><code>${mps124Escape(formula)}</code><div class="mps124-candidate-path">${mps124PathHtml(state.candidate.pathIds, state.candidate.pathValues, copy.noCandidate)}</div></section><section class="mps124-card mps124-global-card ${tone}" role="status" aria-live="polite"><header><h3>${mps124Escape(copy.global)}</h3><strong>${mps124Escape(decision)}</strong></header><div class="mps124-best-transition"><span><small>BEFORE</small><b>${mps124Escape(mps124Display(state.global.before, "unset"))}</b></span><i aria-hidden="true">→</i><span><small>${mps124Escape(copy.candidate)}</small><b>${mps124Escape(mps124Display(state.candidate.sum))}</b></span><i aria-hidden="true">→</i><span><small>AFTER</small><b>${state.global.initialized ? mps124Escape(mps124Display(state.global.after)) : "—"}</b></span></div><p>${mps124Escape(copy.pivot)}: <strong>${mps124Escape(pivot)}</strong></p><div class="mps124-global-path">${mps124PathHtml(state.global.pathIds, state.global.pathValues, copy.uninitialized)}</div></section></div>`;
}

function mps124RenderReturn(state, copy) {
  const ready = state.returned.gain !== null;
  const choice = state.returned.chosenArm === "left" ? copy.chooseLeft : state.returned.chosenArm === "right" ? copy.chooseRight : state.returned.chosenArm === "none" ? copy.chooseNone : "—";
  const node = state.current ? mps124Display(state.current.value) : "node";
  const formula = ready
    ? `${node} + max(${mps124Display(state.leftClamped, "0")}, ${mps124Display(state.rightClamped, "0")}) = ${mps124Display(state.returned.gain)}`
    : copy.notReturned;
  return `<section class="mps124-card mps124-return-card ${ready ? "is-ready" : ""}"><header><div><h3>${mps124Escape(copy.returnArm)}</h3><span>${mps124Escape(copy.returnHelp)}</span></div><strong>${mps124Escape(choice)}</strong></header><code>${mps124Escape(formula)}</code><div class="mps124-return-path">${mps124PathHtml(state.returned.pathIds, state.returned.pathValues, copy.notReturned)}</div></section>`;
}

function mps124RenderLedger(state, copy) {
  const rows = state.processed.length ? state.processed.map((item, index) => {
    const fresh = index === state.processed.length - 1 && state.event === "return-one-arm";
    return `<li class="mps124-ledger-item ${fresh ? "is-fresh" : ""}"><header><strong>${mps124Escape(item.value)}</strong><small>#${mps124Escape(item.id)}</small></header><code>L ${mps124Escape(mps124Display(item.leftRaw))}→${mps124Escape(mps124Display(item.leftClamped))} · R ${mps124Escape(mps124Display(item.rightRaw))}→${mps124Escape(mps124Display(item.rightClamped))}</code><dl><div><dt>CAND</dt><dd>${mps124Escape(mps124Display(item.candidateSum))}</dd></div><div><dt>RETURN</dt><dd>${mps124Escape(mps124Display(item.returnGain))}</dd></div><div><dt>GLOBAL</dt><dd>${mps124Escape(mps124Display(item.globalAfter))}</dd></div></dl><span>${mps124Escape(item.chosenArm)}</span></li>`;
  }).join("") : `<li class="mps124-ledger-empty">${mps124Escape(copy.noProcessed)}</li>`;
  return `<section class="mps124-card mps124-ledger"><header><div><h3>${mps124Escape(copy.processed)}</h3><span>${mps124Escape(copy.processedHelp)}</span></div><b>${state.processed.length}/31</b></header><ol>${rows}</ol></section>`;
}

function mps124RenderResult(state, copy) {
  if (state.final) {
    return `<section class="mps124-final" role="status" aria-live="polite"><div class="mps124-final-answer"><small>${mps124Escape(copy.answer)}</small><strong>${mps124Escape(mps124Display(state.answer))}</strong><span>${mps124Escape(copy.answerPath)}</span><div>${mps124PathHtml(state.global.pathIds, state.global.pathValues, copy.uninitialized)}</div></div><div class="mps124-final-root"><small>${mps124Escape(copy.rootReturn)}</small><strong>${mps124Escape(mps124Display(state.rootReturn))}</strong><span>${mps124Escape(copy.rootReturnHelp)}</span></div></section>`;
  }
  return `<section class="mps124-current-best" role="status" aria-live="polite"><div><small>${mps124Escape(copy.currentBest)}</small><strong>${state.global.initialized ? mps124Escape(mps124Display(state.global.after)) : "—"}</strong><span>${mps124Escape(copy.currentBestHelp)}</span></div><div class="mps124-current-best-path">${mps124PathHtml(state.global.pathIds, state.global.pathValues, copy.uninitialized)}</div></section>`;
}

function renderMaxPathSum124View(step) {
  const host = typeof document !== "undefined" ? document.getElementById("treeView") : null;
  if (!host) return;
  const locale = mps124Locale();
  const copy = MPS124_TEXT[locale];
  const state = mps124Normalize(step);
  const timing = state.timing === "before" ? copy.before : copy.after;
  const currentText = state.current ? `${mps124Display(state.current.value)} (#${state.current.id})` : copy.noCurrent;
  const nextText = state.nextCall
    ? `${state.nextCall.side} → ${state.nextCall.value === null ? copy.none : mps124Display(state.nextCall.value)} (${state.nextCall.id === null ? "#—" : `#${state.nextCall.id}`})`
    : copy.noNext;
  const activeIds = state.path.map((item) => item.id);
  const activeValues = state.path.map((item) => item.value);
  const summary = `${copy.region}. ${copy.line} ${state.sourceLine === null ? "—" : state.sourceLine}, ${mps124CleanText(state.event, "unknown")}.`;
  const note = state.note ? `<aside class="mps124-note"><strong>${mps124Escape(copy.note)}</strong><p>${mps124Escape(state.note)}</p></aside>` : "";

  host.innerHTML = `<article class="mps124-viz ${state.final ? "is-final" : ""}" role="region" aria-label="${mps124Escape(summary)}"><header class="mps124-header"><div><span>${mps124Escape(copy.kicker)}</span><h2>${mps124Escape(state.title)}</h2></div><div class="mps124-line-state"><strong>${mps124Escape(copy.line)} ${state.sourceLine === null ? "—" : mps124Escape(state.sourceLine)}</strong><span class="is-${state.timing}">${mps124Escape(timing)}</span><em>${mps124Escape(state.event.replace(/-/g, " "))}</em></div></header>${mps124RenderRail(state, copy, locale)}${mps124RenderStages(state, locale)}<section class="mps124-invariants" aria-label="Algorithm invariants"><div><small>${mps124Escape(copy.invariantGlobal)}</small><strong>node + left + right</strong><p>${mps124Escape(copy.invariantGlobalBody)}</p></div><i aria-hidden="true">≠</i><div><small>${mps124Escape(copy.invariantReturn)}</small><strong>node + max(left, right)</strong><p>${mps124Escape(copy.invariantReturnBody)}</p></div></section><section class="mps124-source"><div><small>${mps124Escape(copy.sourceState)}</small><code>${mps124Escape(mps124Equation(state))}</code></div><dl><div><dt>${mps124Escape(copy.currentCall)}</dt><dd>${mps124Escape(currentText)}</dd></div><div><dt>${mps124Escape(copy.nextCall)}</dt><dd>${mps124Escape(nextText)}</dd></div></dl></section><div class="mps124-main"><section class="mps124-card mps124-tree-card"><header><div><h3>${mps124Escape(copy.tree)}</h3><span>${mps124Escape(copy.treeHelp)}</span></div><b>${state.path.length} frame${state.path.length === 1 ? "" : "s"}</b></header><div id="mps124Tree" class="mps124-tree" role="img" aria-label="${mps124Escape(copy.tree)}"></div><section class="mps124-active-path"><small>${mps124Escape(copy.activePath)}</small><div>${mps124PathHtml(activeIds, activeValues, copy.pathEmpty)}</div></section></section><aside class="mps124-side"><section class="mps124-card mps124-current"><div><small>${mps124Escape(copy.currentCall)}</small><strong>${mps124Escape(currentText)}</strong></div><div><small>${mps124Escape(copy.nextCall)}</small><strong>${mps124Escape(nextText)}</strong></div></section>${mps124RenderStack(state, copy)}</aside></div><div class="mps124-gates">${mps124RenderGate("left", state.left, copy)}${mps124RenderGate("right", state.right, copy)}</div>${mps124RenderDecision(state, copy)}${mps124RenderReturn(state, copy)}${mps124RenderLedger(state, copy)}${note}${mps124RenderResult(state, copy)}</article>`;

  const treeTarget = document.getElementById("mps124Tree");
  if (!treeTarget) return;
  if (step && step.tree && Array.isArray(step.tree.nodes) && step.tree.nodes.length && typeof renderTree === "function") {
    try {
      renderTree({ tree: step.tree }, "mps124Tree");
    } catch (_error) {
      treeTarget.textContent = copy.treeUnavailable;
    }
  } else {
    treeTarget.textContent = copy.treeUnavailable;
  }
}
