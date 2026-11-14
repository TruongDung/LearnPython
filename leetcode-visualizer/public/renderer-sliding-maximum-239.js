"use strict";

const SM239_EVENT_RAIL = Object.freeze([
  { line: 4, event: "initialize-deque", en: "Initialize deque", vi: "Tạo deque" },
  { line: 5, event: "initialize-result", en: "Initialize result", vi: "Tạo result" },
  { line: 6, event: "visit-number", en: "Visit number", vi: "Duyệt số" },
  { line: 7, event: "check-dominated-back", en: "Check dominated back", vi: "Kiểm tra back bị che" },
  { line: 8, event: "pop-dominated-back", en: "Pop dominated back", vi: "Pop back bị che" },
  { line: 9, event: "push-current-index", en: "Push current index", vi: "Push index hiện tại" },
  { line: 10, event: "check-expired-front", en: "Check expired front", vi: "Kiểm tra front hết hạn" },
  { line: 11, event: "pop-expired-front", en: "Pop expired front", vi: "Pop front hết hạn" },
  { line: 12, event: "check-full-window", en: "Check full window", vi: "Kiểm tra cửa sổ đủ" },
  { line: 13, event: "append-maximum", en: "Append maximum", vi: "Ghi maximum" },
  { line: 14, event: "return-result", en: "Return result", vi: "Trả result" },
]);

const SM239_TEXT = Object.freeze({
  en: Object.freeze({
    region: "Sliding Window Maximum line-by-line visualization",
    kicker: "LEETCODE 239 · MONOTONIC DEQUE",
    line: "LINE",
    before: "before execution",
    after: "after execution",
    eventRail: "Source line and event rail",
    condition: "Current condition",
    action: "Current action",
    phase: "Phase",
    iteration: "Iteration",
    window: "Current window",
    array: "Indexed input array",
    arrayHelp: "Window membership, deque activity, maximum, and removed roles are independent.",
    current: "CURRENT",
    inWindow: "WINDOW",
    active: "ACTIVE",
    maximum: "MAX",
    removed: "REMOVED",
    deque: "Monotonic deque",
    dequeHelp: "Indices are ordered FRONT → BACK; values are non-increasing.",
    beforeDeque: "Before mutation",
    afterDeque: "After mutation",
    currentDeque: "Current deque",
    emptyDeque: "Deque is empty.",
    front: "FRONT",
    back: "BACK",
    rules: "Why indices leave the deque",
    dominatedTitle: "Dominated back",
    dominatedRule: "Pop only when back value < current value. The newer larger value wins every future shared window; equality is retained.",
    expiredTitle: "Expired front",
    expiredRule: "Pop the front only when its index <= i - k, placing it strictly left of the current window.",
    currentExplanation: "This frame",
    noCheck: "No condition is evaluated on this source line.",
    noAction: "No deque or result mutation on this source line.",
    outputs: "Maximum outputs",
    outputsHelp: "Each card links one full window to the deque-front witness index.",
    noOutputs: "No full window has emitted a maximum yet.",
    witness: "witness index",
    answer: "Current answer",
    finalAnswer: "FINAL ANSWER",
    note: "Why this frame matters",
    unavailable: "unavailable",
  }),
  vi: Object.freeze({
    region: "Trực quan từng dòng Sliding Window Maximum",
    kicker: "LEETCODE 239 · DEQUE ĐƠN ĐIỆU",
    line: "DÒNG",
    before: "trước khi chạy",
    after: "sau khi chạy",
    eventRail: "Thanh dòng lệnh và sự kiện",
    condition: "Điều kiện hiện tại",
    action: "Hành động hiện tại",
    phase: "Giai đoạn",
    iteration: "Lượt lặp",
    window: "Cửa sổ hiện tại",
    array: "Mảng input có index",
    arrayHelp: "Vai trò trong cửa sổ, deque, maximum và phần tử bị loại được hiển thị độc lập.",
    current: "HIỆN TẠI",
    inWindow: "CỬA SỔ",
    active: "ĐANG Ở DEQUE",
    maximum: "MAX",
    removed: "ĐÃ LOẠI",
    deque: "Deque đơn điệu",
    dequeHelp: "Index theo thứ tự FRONT → BACK; giá trị không tăng.",
    beforeDeque: "Trước mutation",
    afterDeque: "Sau mutation",
    currentDeque: "Deque hiện tại",
    emptyDeque: "Deque đang rỗng.",
    front: "FRONT",
    back: "BACK",
    rules: "Vì sao index rời deque",
    dominatedTitle: "Back bị che khuất",
    dominatedRule: "Chỉ pop khi giá trị ở back < giá trị hiện tại. Giá trị mới lớn hơn thắng ở mọi cửa sổ chung sau này; giá trị bằng nhau được giữ lại.",
    expiredTitle: "Front hết hạn",
    expiredRule: "Chỉ pop front khi index <= i - k, tức index nằm hẳn bên trái cửa sổ hiện tại.",
    currentExplanation: "Frame này",
    noCheck: "Dòng lệnh này không đánh giá điều kiện.",
    noAction: "Dòng lệnh này không thay đổi deque hoặc result.",
    outputs: "Các maximum đã ghi",
    outputsHelp: "Mỗi thẻ liên kết một cửa sổ đủ với witness index ở front deque.",
    noOutputs: "Chưa có cửa sổ đủ để ghi maximum.",
    witness: "witness index",
    answer: "Đáp án hiện tại",
    finalAnswer: "ĐÁP ÁN CUỐI",
    note: "Ý nghĩa của frame này",
    unavailable: "không có",
  }),
});

function sm239Escape(value) {
  return String(value == null ? "" : value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function sm239Locale() {
  return typeof lang !== "undefined" && lang === "vi" ? "vi" : "en";
}

function sm239CleanText(value, fallback = "") {
  if (typeof value !== "string") return fallback;
  const clean = value.slice(0, 400).trim();
  return /^(?:undefined|nan|[+-]?infinity)$/i.test(clean) ? fallback : clean;
}

function sm239Localized(value, locale, fallback = "") {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return sm239CleanText(value[locale], sm239CleanText(value.en, sm239CleanText(value.vi, fallback)));
  }
  return sm239CleanText(value, fallback);
}

function sm239Integer(value, min, max) {
  return Number.isSafeInteger(value) && value >= min && value <= max ? value : null;
}

function sm239Display(value, fallback = "—") {
  return Number.isSafeInteger(value) ? String(value) : fallback;
}

function sm239NormalizeEntry(value, nums, n) {
  if (!value || typeof value !== "object" || n < 1) return null;
  const index = sm239Integer(value.index, 0, n - 1);
  if (index === null) return null;
  return { index, value: nums[index] };
}

function sm239NormalizeDeque(value, nums, n) {
  if (!Array.isArray(value)) return [];
  const seen = new Set();
  const entries = [];
  for (const item of value.slice(0, 40)) {
    const entry = sm239NormalizeEntry(item, nums, n);
    if (!entry || seen.has(entry.index)) continue;
    seen.add(entry.index);
    entries.push(entry);
  }
  return entries.map((entry, position) => ({
    ...entry,
    front: position === 0,
    back: position === entries.length - 1,
  }));
}

function sm239NormalizeWitness(value, nums, n) {
  if (!value || typeof value !== "object" || n < 1) return null;
  const answerIndex = sm239Integer(value.answerIndex, 0, 39);
  const windowLeft = sm239Integer(value.windowLeft, 0, n - 1);
  const windowRight = sm239Integer(value.windowRight, 0, n - 1);
  const witnessIndex = sm239Integer(value.witnessIndex, 0, n - 1);
  if (answerIndex === null || windowLeft === null || windowRight === null || witnessIndex === null) return null;
  if (windowLeft > windowRight || witnessIndex < windowLeft || witnessIndex > windowRight) return null;
  return { answerIndex, windowLeft, windowRight, witnessIndex, value: nums[witnessIndex] };
}

function sm239Normalize(step) {
  const raw = step && step.slidingMaximum239View && typeof step.slidingMaximum239View === "object"
    ? step.slidingMaximum239View
    : {};
  const rawNums = Array.isArray(raw.nums) ? raw.nums.slice(0, 40) : [];
  const declaredN = sm239Integer(raw.n, 0, 40);
  const n = declaredN === null ? rawNums.length : declaredN;
  const nums = Array.from({ length: n }, (_, index) => Number.isSafeInteger(rawNums[index]) ? rawNums[index] : null);
  const k = n > 0 ? sm239Integer(raw.k, 1, n) : null;
  const sourceFromStep = step && Array.isArray(step.codeLines) ? step.codeLines[0] : null;
  const sourceLine = sm239Integer(raw.sourceLine, 4, 14) ?? sm239Integer(sourceFromStep, 4, 14);
  const knownEvents = SM239_EVENT_RAIL.map((item) => item.event);
  const event = knownEvents.includes(raw.event) ? raw.event : "unknown";
  const i = n > 0 ? sm239Integer(raw.i, 0, n - 1) : null;
  const num = i === null ? null : nums[i];
  const left = i === null || k === null ? null : Math.max(0, i - k + 1);
  const right = i;
  const size = left === null || right === null ? 0 : right - left + 1;
  const full = i !== null && k !== null && i >= k - 1;
  const expiryCutoff = i === null || k === null ? null : i - k;
  const dequeRaw = raw.deque && typeof raw.deque === "object" ? raw.deque : {};
  const before = sm239NormalizeDeque(dequeRaw.before, nums, n);
  const after = sm239NormalizeDeque(dequeRaw.after, nums, n);
  const checkRaw = raw.check && typeof raw.check === "object" ? raw.check : {};
  const checkKinds = ["dominated-back", "expired-front", "full-window"];
  const actionRaw = raw.action && typeof raw.action === "object" ? raw.action : {};
  const actionKinds = ["none", "initialize", "pop", "push", "append-output", "return"];
  const sides = ["front", "back"];
  const result = Array.isArray(raw.result)
    ? raw.result.slice(0, 40).map((value) => Number.isSafeInteger(value) ? value : null)
    : [];
  const answerWitness = Array.isArray(raw.answerWitness)
    ? raw.answerWitness.slice(0, 40).map((item) => sm239NormalizeWitness(item, nums, n)).filter(Boolean)
    : [];

  return {
    version: Number.isSafeInteger(raw.version) && raw.version > 0 ? raw.version : 1,
    problemId: 239,
    sourceLine,
    timing: raw.timing === "before" ? "before" : "after",
    phase: sm239CleanText(raw.phase, "unknown"),
    event,
    nums,
    n,
    k,
    i,
    num,
    window: { left, right, size, full, expiryCutoff },
    deque: { before, after },
    check: {
      kind: checkKinds.includes(checkRaw.kind) ? checkRaw.kind : null,
      result: typeof checkRaw.result === "boolean" ? checkRaw.result : null,
      candidate: sm239NormalizeEntry(checkRaw.candidate, nums, n),
    },
    action: {
      kind: actionKinds.includes(actionRaw.kind) ? actionRaw.kind : "none",
      side: sides.includes(actionRaw.side) ? actionRaw.side : null,
      removed: sm239NormalizeEntry(actionRaw.removed, nums, n),
      pushed: sm239NormalizeEntry(actionRaw.pushed, nums, n),
      dominatedBy: sm239NormalizeEntry(actionRaw.dominatedBy, nums, n),
    },
    result,
    currentWitness: sm239NormalizeWitness(raw.currentWitness, nums, n),
    answerWitness,
    final: raw.final === true || Boolean(step && step.final),
    title: sm239Localized(step && step.title, sm239Locale(), "Sliding Window Maximum"),
    note: sm239Localized(step && step.note, sm239Locale(), ""),
  };
}

function sm239SourceExpression(state) {
  const candidate = state.check.candidate;
  switch (state.event) {
    case "initialize-deque": return "dq = deque()";
    case "initialize-result": return "result = []";
    case "visit-number": return `i = ${sm239Display(state.i)}, num = ${sm239Display(state.num)}`;
    case "check-dominated-back": return candidate
      ? `nums[${candidate.index}] = ${sm239Display(candidate.value)} < ${sm239Display(state.num)} → ${state.check.result ? "True" : "False"}`
      : "dq is empty → False";
    case "pop-dominated-back": return "dq.pop()";
    case "push-current-index": return `dq.append(${sm239Display(state.i)})`;
    case "check-expired-front": return candidate
      ? `${candidate.index} <= ${sm239Display(state.window.expiryCutoff)} → ${state.check.result ? "True" : "False"}`
      : "dq front unavailable";
    case "pop-expired-front": return "dq.popleft()";
    case "check-full-window": return `${sm239Display(state.i)} >= ${state.k === null ? "—" : state.k - 1} → ${state.check.result ? "True" : "False"}`;
    case "append-maximum": return state.currentWitness
      ? `result.append(nums[${state.currentWitness.witnessIndex}]) = ${sm239Display(state.currentWitness.value)}`
      : "result.append(nums[dq[0]])";
    case "return-result": return `return [${state.result.map((value) => sm239Display(value)).join(", ")}]`;
    default: return "—";
  }
}

function sm239CheckText(state, copy, locale) {
  const candidate = state.check.candidate;
  if (state.check.kind === "dominated-back") {
    if (!candidate) return locale === "vi" ? "dq rỗng, nên điều kiện while là False." : "dq is empty, so the while condition is False.";
    return locale === "vi"
      ? `Back index ${candidate.index} có giá trị ${sm239Display(candidate.value)}; ${sm239Display(candidate.value)} < ${sm239Display(state.num)} là ${state.check.result ? "True" : "False"}.`
      : `Back index ${candidate.index} has value ${sm239Display(candidate.value)}; ${sm239Display(candidate.value)} < ${sm239Display(state.num)} is ${state.check.result ? "True" : "False"}.`;
  }
  if (state.check.kind === "expired-front") {
    if (!candidate) return locale === "vi" ? "Không có front hợp lệ để kiểm tra." : "No valid front is available to check.";
    return locale === "vi"
      ? `Front index ${candidate.index} ${state.check.result ? "đã" : "chưa"} vượt cutoff ${sm239Display(state.window.expiryCutoff)}.`
      : `Front index ${candidate.index} ${state.check.result ? "has" : "has not"} crossed cutoff ${sm239Display(state.window.expiryCutoff)}.`;
  }
  if (state.check.kind === "full-window") {
    return locale === "vi"
      ? `Kích thước hiện tại ${state.window.size}/${sm239Display(state.k)}; cửa sổ ${state.check.result ? "đã đủ" : "chưa đủ"}.`
      : `Current size is ${state.window.size}/${sm239Display(state.k)}; the window is ${state.check.result ? "full" : "not full"}.`;
  }
  return copy.noCheck;
}

function sm239ActionText(state, copy, locale) {
  const action = state.action;
  if (action.kind === "initialize") {
    return locale === "vi" ? "Khởi tạo cấu trúc rỗng." : "Initialize an empty structure.";
  }
  if (action.kind === "push" && action.pushed) {
    return locale === "vi"
      ? `Push index ${action.pushed.index} (giá trị ${sm239Display(action.pushed.value)}) vào BACK.`
      : `Push index ${action.pushed.index} (value ${sm239Display(action.pushed.value)}) at the BACK.`;
  }
  if (action.kind === "pop" && action.removed) {
    if (action.side === "back" && action.dominatedBy) {
      return locale === "vi"
        ? `Pop BACK index ${action.removed.index}; index ${action.dominatedBy.index} với giá trị ${sm239Display(action.dominatedBy.value)} che khuất nó.`
        : `Pop BACK index ${action.removed.index}; index ${action.dominatedBy.index} with value ${sm239Display(action.dominatedBy.value)} dominates it.`;
    }
    return locale === "vi"
      ? `Pop FRONT index ${action.removed.index} vì đã ra khỏi cửa sổ.`
      : `Pop FRONT index ${action.removed.index} because it has left the window.`;
  }
  if (action.kind === "append-output" && state.currentWitness) {
    return locale === "vi"
      ? `Ghi ${sm239Display(state.currentWitness.value)} từ witness index ${state.currentWitness.witnessIndex}.`
      : `Append ${sm239Display(state.currentWitness.value)} from witness index ${state.currentWitness.witnessIndex}.`;
  }
  if (action.kind === "return") {
    return locale === "vi" ? "Trả về bản sao result cuối cùng." : "Return the completed result copy.";
  }
  return copy.noAction;
}

function sm239RenderRail(state, copy, locale) {
  return `<nav class="sm239-rail-wrap" aria-label="${sm239Escape(copy.eventRail)}"><ol class="sm239-event-rail" role="list">${SM239_EVENT_RAIL.map((item) => {
    const current = item.line === state.sourceLine && item.event === state.event;
    return `<li class="sm239-event ${current ? "sm239-is-current" : ""}"${current ? " aria-current=\"step\"" : ""}><small>L${item.line}</small><span>${sm239Escape(item[locale])}</span></li>`;
  }).join("")}</ol></nav>`;
}

function sm239RenderSource(state, copy, locale) {
  const windowText = state.window.left === null
    ? "—"
    : `[${state.window.left}, ${state.window.right}] · ${state.window.size}/${sm239Display(state.k)}`;
  return `<section class="sm239-source"><div class="sm239-expression"><small>${sm239Escape(copy.condition)}</small><code>${sm239Escape(sm239SourceExpression(state))}</code></div><dl class="sm239-source-facts"><div><dt>${sm239Escape(copy.phase)}</dt><dd>${sm239Escape(state.phase)}</dd></div><div><dt>${sm239Escape(copy.iteration)}</dt><dd>${sm239Escape(state.i === null ? "—" : `i=${state.i}, num=${sm239Display(state.num)}`)}</dd></div><div><dt>${sm239Escape(copy.window)}</dt><dd>${sm239Escape(windowText)}</dd></div></dl><div class="sm239-live-explanation" role="status" aria-live="polite"><div><small>${sm239Escape(copy.condition)}</small><p>${sm239Escape(sm239CheckText(state, copy, locale))}</p></div><div><small>${sm239Escape(copy.action)}</small><p>${sm239Escape(sm239ActionText(state, copy, locale))}</p></div></div></section>`;
}

function sm239RenderArray(state, copy) {
  const active = new Set(state.deque.after.map((entry) => entry.index));
  const maxIndex = state.deque.after.length ? state.deque.after[0].index : null;
  const removedIndex = state.action.removed ? state.action.removed.index : null;
  const cells = state.n ? state.nums.map((value, index) => {
    const inWindow = state.window.left !== null && index >= state.window.left && index <= state.window.right;
    const roles = [];
    if (index === state.i) roles.push(copy.current);
    if (inWindow) roles.push(copy.inWindow);
    if (active.has(index)) roles.push(copy.active);
    if (index === maxIndex) roles.push(copy.maximum);
    if (index === removedIndex) roles.push(copy.removed);
    const classes = [
      "sm239-array-cell",
      index === state.i ? "sm239-is-current" : "",
      inWindow ? "sm239-is-window" : "",
      index === state.window.left ? "sm239-is-window-start" : "",
      index === state.window.right ? "sm239-is-window-end" : "",
      active.has(index) ? "sm239-is-active" : "",
      index === maxIndex ? "sm239-is-maximum" : "",
      index === removedIndex ? "sm239-is-removed" : "",
    ].filter(Boolean).join(" ");
    const label = `index ${index}, value ${sm239Display(value)}${roles.length ? `, ${roles.join(", ")}` : ""}`;
    return `<li class="${classes}" aria-label="${sm239Escape(label)}"><small>${index}</small><strong>${sm239Escape(sm239Display(value))}</strong><span>${roles.map((role) => `<i>${sm239Escape(role)}</i>`).join("")}</span></li>`;
  }).join("") : `<li class="sm239-empty">${sm239Escape(copy.unavailable)}</li>`;
  const bracket = state.window.left === null
    ? ""
    : `<div class="sm239-window-bracket" role="img" aria-label="${sm239Escape(`${copy.window} [${state.window.left}, ${state.window.right}]`)}" style="--sm239-window-left:${2 + state.window.left * 75}px;--sm239-window-width:${state.window.size * 68 + Math.max(0, state.window.size - 1) * 7}px"><span aria-hidden="true">W[${state.window.left}..${state.window.right}]</span></div>`;
  return `<section class="sm239-card sm239-array-card"><header><div><h3>${sm239Escape(copy.array)}</h3><p>${sm239Escape(copy.arrayHelp)}</p></div><div class="sm239-role-legend" aria-label="${sm239Escape(copy.arrayHelp)}"><span class="sm239-legend-active">${sm239Escape(copy.active)}</span><span class="sm239-legend-maximum">${sm239Escape(copy.maximum)}</span><span class="sm239-legend-removed">${sm239Escape(copy.removed)}</span></div></header><div class="sm239-array-scroll"><div class="sm239-array-track">${bracket}<ol class="sm239-array" role="list" aria-label="${sm239Escape(copy.array)}">${cells}</ol></div></div></section>`;
}

function sm239DequeChanged(state) {
  const before = state.deque.before.map((entry) => entry.index).join(",");
  const after = state.deque.after.map((entry) => entry.index).join(",");
  return before !== after;
}

function sm239RenderDequeRow(entries, label, copy, afterMutation) {
  const cells = entries.length ? entries.map((entry) => {
    const endpoint = [entry.front ? copy.front : "", entry.back ? copy.back : ""].filter(Boolean).join(" · ");
    const classes = [
      "sm239-deque-entry",
      entry.front ? "sm239-is-front" : "",
      entry.back ? "sm239-is-back" : "",
      afterMutation ? "sm239-is-after" : "",
    ].filter(Boolean).join(" ");
    return `<li class="${classes}"><small>${sm239Escape(endpoint || "·")}</small><strong>${sm239Escape(sm239Display(entry.value))}</strong><span>idx ${entry.index}</span></li>`;
  }).join("") : `<li class="sm239-empty">${sm239Escape(copy.emptyDeque)}</li>`;
  return `<section class="sm239-deque-state"><h4>${sm239Escape(label)}</h4><div class="sm239-deque-scroll"><ol class="sm239-deque-row" role="list" aria-label="${sm239Escape(`${label}: ${copy.front} to ${copy.back}`)}">${cells}</ol></div></section>`;
}

function sm239RenderDeque(state, copy) {
  const changed = sm239DequeChanged(state);
  const before = changed ? sm239RenderDequeRow(state.deque.before, copy.beforeDeque, copy, false) : "";
  const afterLabel = changed ? copy.afterDeque : copy.currentDeque;
  return `<section class="sm239-card sm239-deque-card"><header><div><h3>${sm239Escape(copy.deque)}</h3><p>${sm239Escape(copy.dequeHelp)}</p></div><b>${sm239Escape(copy.front)} → ${sm239Escape(copy.back)}</b></header><div class="sm239-deque-states ${changed ? "sm239-has-mutation" : ""}">${before}${sm239RenderDequeRow(state.deque.after, afterLabel, copy, changed)}</div></section>`;
}

function sm239RenderRules(state, copy, locale) {
  const current = state.check.kind === "dominated-back"
    ? copy.dominatedTitle
    : state.check.kind === "expired-front"
      ? copy.expiredTitle
      : copy.currentExplanation;
  return `<section class="sm239-card sm239-rules"><header><div><h3>${sm239Escape(copy.rules)}</h3><p>${sm239Escape(current)}</p></div></header><div class="sm239-rule-grid"><article class="sm239-rule sm239-rule-dominated"><strong>${sm239Escape(copy.dominatedTitle)}</strong><p>${sm239Escape(copy.dominatedRule)}</p></article><article class="sm239-rule sm239-rule-expired"><strong>${sm239Escape(copy.expiredTitle)}</strong><p>${sm239Escape(copy.expiredRule)}</p></article></div><div class="sm239-current-rule"><small>${sm239Escape(copy.currentExplanation)}</small><p>${sm239Escape(sm239CheckText(state, copy, locale))}</p></div></section>`;
}

function sm239RenderOutputs(state, copy) {
  const currentAnswer = state.currentWitness ? state.currentWitness.answerIndex : null;
  const cards = state.answerWitness.length ? state.answerWitness.map((witness) => {
    const active = witness.answerIndex === currentAnswer;
    const label = `answer ${witness.answerIndex}, window ${witness.windowLeft} to ${witness.windowRight}, ${copy.witness} ${witness.witnessIndex}, value ${sm239Display(witness.value)}`;
    return `<li class="sm239-output ${active ? "sm239-is-current" : ""}"${active ? " aria-current=\"step\"" : ""} aria-label="${sm239Escape(label)}"><small>#${witness.answerIndex} · W[${witness.windowLeft}..${witness.windowRight}]</small><strong>${sm239Escape(sm239Display(witness.value))}</strong><span>${sm239Escape(copy.witness)} ${witness.witnessIndex}</span></li>`;
  }).join("") : `<li class="sm239-empty">${sm239Escape(copy.noOutputs)}</li>`;
  return `<section class="sm239-card sm239-outputs"><header><div><h3>${sm239Escape(copy.outputs)}</h3><p>${sm239Escape(copy.outputsHelp)}</p></div></header><div class="sm239-output-scroll"><ol class="sm239-output-row" role="list" aria-label="${sm239Escape(copy.outputs)}">${cards}</ol></div></section>`;
}

function sm239RenderResult(state, copy) {
  const answer = `[${state.result.map((value) => sm239Display(value)).join(", ")}]`;
  return `<section class="sm239-result ${state.final ? "sm239-is-final" : ""}" role="status" aria-live="polite"><small>${sm239Escape(state.final ? copy.finalAnswer : copy.answer)}</small><strong>${sm239Escape(answer)}</strong></section>`;
}

function sm239WindowDeque(nums, left, right) {
  const indices = [];
  for (let i = left; i <= right; i++) {
    while (indices.length && nums[indices.at(-1)] < nums[i]) indices.pop();
    indices.push(i);
  }
  return indices.map((index, i) => ({ index, value: nums[index], front: i === 0, back: i === indices.length - 1 }));
}

function sm239PictureScene(state, selected, timeline = []) {
  if (!state.final || !state.answerWitness.length) return state;
  const witness = state.answerWitness[selected] || state.answerWitness[0];
  const saved = timeline.find(step => step.slidingMaximum239View?.event === 'append-maximum' && step.slidingMaximum239View.currentWitness?.answerIndex === witness.answerIndex);
  const deque = saved ? sm239Normalize(saved).deque.after : sm239WindowDeque(state.nums, witness.windowLeft, witness.windowRight);
  return { ...state, i: witness.windowRight, num: state.nums[witness.windowRight],
    window: { left: witness.windowLeft, right: witness.windowRight, size: state.k, full: true, expiryCutoff: witness.windowLeft - 1 },
    deque: { before: deque, after: deque }, check: { kind: null, result: null, candidate: null },
    action: { kind: 'none', side: null, removed: null, pushed: null, dominatedBy: null }, currentWitness: witness };
}

function sm239PictureArray(state) {
  const nums = state.nums, digitWidth = Math.max(1, ...nums.map(value => sm239Display(value).length));
  const pitch = Math.max(58, digitWidth * 8 + 16), pad = 16, width = Math.max(270, pad * 2 + state.n * pitch), height = 283, zero = 128;
  const center = i => pad + (i + .5) * pitch;
  const maximum = Math.max(1, ...nums.map(value => Math.abs(value || 0)));
  const deque = new Set(state.deque.after.map(entry => entry.index));
  const front = state.deque.after[0];
  const ready = state.i !== null && deque.has(state.i);
  const maxIndex = ready && front && front.index >= state.window.left ? front.index : null;
  const removed = state.action.removed?.index;
  let drawing = `<path class="p239-zero" d="M${pad},${zero} H${width - pad}"/>`;
  if (state.window.left !== null) {
    const left = pad + state.window.left * pitch + 3, size = state.window.size * pitch - 6;
    const pointers = state.window.size === 1 ? `<text class="p239-pointer" x="${left + size / 2}" y="19" text-anchor="middle">L=R ${state.window.left}</text>` : `<text class="p239-pointer" x="${left + 7}" y="19">L ${state.window.left}</text><text class="p239-pointer" x="${left + size - 7}" y="19" text-anchor="end">R ${state.window.right}</text>`;
    drawing += `<rect class="p239-window" x="${left}" y="30" width="${size}" height="208" rx="10"/>${pointers}`;
  }
  drawing += nums.map((value, index) => {
    const x = center(index), h = Math.max(3, Math.abs(value || 0) / maximum * 77), y = value < 0 ? zero : zero - h;
    const inWindow = state.window.left !== null && index >= state.window.left && index <= state.window.right;
    const cls = [inWindow ? 'in-window' : '', index === maxIndex ? 'maximum' : '', index === state.i ? 'current' : '', index === removed ? 'removed' : '', value < 0 ? 'negative' : ''].join(' ');
    return `<g class="p239-number ${cls}" data-array-index="${index}" data-value="${value ?? '—'}" data-in-window="${inWindow}" data-in-deque="${deque.has(index)}" data-maximum="${index === maxIndex}"><title>[${index}] = ${sm239Escape(sm239Display(value))}</title><rect class="p239-bar" x="${x - 15}" y="${y}" width="30" height="${h}" rx="5"/><text class="p239-value" x="${x}" y="${value < 0 ? y + h + 18 : y - 10}" text-anchor="middle">${sm239Escape(sm239Display(value))}</text><text class="p239-index" x="${x}" y="254" text-anchor="middle">${index}</text>${deque.has(index) ? `<circle class="p239-deque-dot" cx="${x}" cy="268" r="3"/>` : ''}${index === removed ? `<path class="p239-cross" d="M${x - 8},260 l16,14 M${x + 8},260 l-16,14"/>` : ''}${index === maxIndex ? `<text class="p239-star" x="${x}" y="${value < 0 ? zero - 12 : y - 30}" text-anchor="middle">★</text>` : ''}</g>`;
  }).join('');
  return { width, center, svg: `<svg class="p239-array" style="width:${width}px;min-width:${Math.min(width, Math.max(300, width * .8))}px;max-width:100%" viewBox="0 0 ${width} ${height}" role="img" aria-label="${sm239Locale() === 'vi' ? 'Khung là cửa sổ, sao xanh là lớn nhất, chấm tím là index trong deque' : 'Frame: current window; green star: maximum; purple dot: index in deque'}">${drawing}</svg>` };
}

function renderSlidingMaximum239View(step) {
  const host = typeof document !== 'undefined' && document.getElementById ? document.getElementById('treeView') : typeof $ === 'function' ? $('treeView') : null;
  if (!host) return;
  const t = (vi, en) => sm239Locale() === 'vi' ? vi : en, esc = sm239Escape;
  const original = sm239Normalize(step), key = JSON.stringify([original.nums, original.k]);
  const same = host.dataset?.p239Key === key, wasFinal = host.dataset?.p239Final === '1';
  const selected = original.final && same && wasFinal ? Math.max(0, Math.min(original.answerWitness.length - 1, Number(host.dataset.p239SelectedOutput || 0))) : 0;
  const timeline = typeof steps === 'undefined' ? [] : steps;
  const state = sm239PictureScene(original, selected, timeline);
  const focus = state.i === null ? 0 : state.i, oldFocus = same ? host.dataset?.p239Focus : null;
  const oldMap = same ? host.querySelector?.('.p239-array-scroll') : null;
  const oldLeft = oldMap?.scrollLeft || 0, oldWidth = Number(host.dataset?.p239Width || 0);
  if (host.dataset) { host.dataset.p239Key = key; host.dataset.p239Final = original.final ? '1' : '0'; host.dataset.p239SelectedOutput = String(selected); host.dataset.p239Focus = String(focus); host.dataset.p239Width = String(host.clientWidth || 600); }
  const card = (label, content, cls = '') => `<section class="p239-card ${cls}"><header>${label}</header>${content}</section>`;
  const names = {
    'initialize-deque': t('Giữ các ứng viên lớn nhất', 'Keep the maximum candidates'),
    'initialize-result': t('Chuẩn bị kết quả từng cửa sổ', 'Prepare one result per window'),
    'visit-number': t('Cửa sổ tiến sang phải', 'Move the window right'),
    'check-dominated-back': t('So số mới với cuối deque', 'Compare the new value with the back'),
    'pop-dominated-back': t('Nhỏ hơn số mới → bỏ ở đuôi', 'Smaller than the new value → remove back'),
    'push-current-index': t('Thêm index mới vào đuôi', 'Add the new index at the back'),
    'check-expired-front': t('Đầu deque còn trong khung?', 'Is the front still inside the window?'),
    'pop-expired-front': t('Ra ngoài khung → bỏ ở đầu', 'Outside the window → remove front'),
    'check-full-window': t('Đủ k phần tử rồi lấy max', 'Once k values are present, take the max'),
    'append-maximum': t('Đầu deque → maximum', 'Deque front → maximum'),
    'return-result': t('Chọn một kết quả để xem lại cửa sổ', 'Choose a result to inspect its window'),
  };
  const picture = sm239PictureArray(state);
  const chart = card(`<b>nums · k=${state.k ?? '—'}</b><small><span class="p239-green">★ max</span> · <span class="p239-purple">● deque</span> · <span class="p239-red">× ${t('bỏ', 'remove')}</span></small>`, `<div class="p239-array-scroll" tabindex="0" role="region" aria-label="nums">${picture.svg}</div>${picture.width * .8 > (host.clientWidth || 600) - 50 ? `<small class="p239-scroll-hint">↔ ${t('Kéo để xem', 'Scroll to explore')}</small>` : ''}`);
  const token = (entry, cls = '', label = '') => `<span class="p239-token ${cls}" data-dq-index="${entry.index}" data-dq-value="${entry.value ?? '—'}">${label ? `<small>${label}</small>` : ''}<b>${esc(sm239Display(entry.value))}</b><small>[${entry.index}]</small></span>`;
  const changed = sm239DequeChanged(state), removed = state.action.removed;
  const row = (entries, before = false) => `<div class="p239-deque-scroll"><div class="p239-deque-row" data-p239-deque="${before ? 'before' : 'after'}">${entries.map((entry, i) => token(entry, before && removed?.index === entry.index ? 'removed' : !before && state.action.pushed?.index === entry.index ? 'pushed' : i === 0 ? 'front' : '', i === 0 && i === entries.length - 1 ? 'FRONT / BACK' : i === 0 ? 'FRONT' : i === entries.length - 1 ? 'BACK' : '')).join('<i>›</i>') || '<span class="p239-empty">∅</span>'}</div></div>`;
  const deque = card(`<b>deque</b><small>${t('Giá trị không tăng →', 'Values never increase →')}</small>`, `${changed ? `<div class="p239-before"><small>${t('Trước', 'Before')}</small>${row(state.deque.before, true)}</div><div class="p239-mutation-arrow">${state.action.side === 'front' ? '←' : state.action.kind === 'push' ? '＋ →' : '× →'}</div>` : ''}${row(state.deque.after)}`);
  const candidate = state.check.candidate;
  let action = '';
  if (!state.final && state.check.kind === 'dominated-back' && candidate) {
    const smaller = candidate.value < state.num, equal = candidate.value === state.num;
    action = card(smaller ? t('Ứng viên cũ bị số mới thay thế', 'The new value dominates this candidate') : equal ? t('Bằng nhau → giữ cả hai', 'Equal values → keep both') : t('Vẫn giữ ứng viên lớn hơn', 'Keep the larger candidate'), `<div class="p239-comparison">${token(candidate, smaller ? 'removed' : 'front')}<strong>${smaller ? '&lt;' : equal ? '=' : '&gt;'}</strong>${token({ index: state.i, value: state.num }, 'pushed')}<b class="${smaller ? 'p239-red' : 'p239-green'}">${smaller ? '×' : '✓'}</b></div>`);
  } else if (!state.final && state.check.kind === 'expired-front' && candidate) {
    action = card(t('So index với cạnh trái L', 'Compare the index with the left edge L'), `<div class="p239-expiry"><span><small>index</small><b>${candidate.index}</b></span><i>${state.check.result ? '&lt;' : '≥'}</i><span><small>L</small><b>${state.window.left}</b></span><strong class="${state.check.result ? 'p239-red' : 'p239-green'}">${state.check.result ? '← ×' : '✓'}</strong></div>`);
  } else if (!state.final && state.action.kind === 'append-output' && state.currentWitness) {
    action = `<div class="p239-emit"><span>FRONT</span><b>${state.currentWitness.value}</b><i>→</i><span>result</span><strong>${state.currentWitness.value}</strong></div>`;
  } else if (!state.final && state.i !== null && !state.window.full) {
    action = `<div class="p239-warmup"><span>${state.window.size} / ${state.k}</span>${Array.from({ length: state.k || 0 }, (_, i) => `<i class="${i < state.window.size ? 'filled' : ''}"></i>`).join('')}</div>`;
  }
  const outputs = card(`<b>result</b><small>${t('Mỗi ô = max của một cửa sổ', 'Each tile = one window maximum')}</small>`, `<div class="p239-outputs">${state.answerWitness.map(witness => `<button type="button" class="p239-output ${state.final ? witness.answerIndex === selected ? 'selected' : '' : witness.answerIndex === state.currentWitness?.answerIndex ? 'selected' : ''}" data-p239-output="${witness.answerIndex}" data-window-left="${witness.windowLeft}" data-window-right="${witness.windowRight}" data-witness-index="${witness.witnessIndex}" aria-pressed="${state.final && selected === witness.answerIndex}"><small>${witness.windowLeft}…${witness.windowRight}</small><b>${esc(sm239Display(witness.value))}</b></button>`).join('') || '<span class="p239-empty">∅</span>'}</div>${state.final && state.answerWitness.length ? `<nav class="p239-play"><button type="button" data-p239-select="${selected - 1}" ${selected <= 0 ? 'disabled' : ''}>←</button><span>${selected + 1} / ${state.answerWitness.length}</span><button type="button" data-p239-select="${selected + 1}" ${selected >= state.answerWitness.length - 1 ? 'disabled' : ''}>${t('Trượt', 'Slide')} →</button></nav>` : ''}`);
  const jumpEvents = [['pop-dominated-back', t('Bỏ đuôi', 'Pop back')], ['pop-expired-front', t('Hết hạn', 'Expire')], ['append-maximum', 'max'], ['return-result', '🏁']];
  const at = typeof stepIndex === 'undefined' ? -1 : stepIndex;
  const jumps = !state.final ? `<nav class="p239-jumps">${jumpEvents.filter(([event]) => timeline.some((s, i) => i > at && s.slidingMaximum239View?.event === event)).map(([event, label]) => `<button type="button" data-p239-jump="${event}">${label} →</button>`).join('')}</nav>` : '';
  const examples = [
    { nums: [1, 3, -1, -3, 5, 3, 6, 7], k: 3, label: t('Ví dụ', 'Example') },
    { nums: [9, 7, 5, 3, 1], k: 3, label: t('Giảm dần', 'Decreasing') },
    { nums: [4, 4, 4, 2, 4], k: 3, label: t('Bằng nhau', 'Equal values') },
    { nums: [-5, -1, -3, -2, -7], k: 2, label: t('Toàn âm', 'All negative') },
    { nums: [3, 1, 3, 2], k: 1, label: 'k = 1' },
  ];
  host.innerHTML = `<section class="sm239-viz sm239-picture"><header class="p239-heading"><strong>${names[state.event] || 'Sliding Window Maximum'}</strong><small>#239 · L${state.sourceLine ?? '—'}</small></header>${chart}${deque}${action}${outputs}${jumps}<nav class="p239-examples">${examples.map((example, i) => `<button type="button" data-p239-example="${i}">${example.label}</button>`).join('')}</nav></section>`;
  const scroller = host.querySelector?.('.p239-array-scroll');
  if (scroller) {
    scroller.scrollLeft = oldLeft;
    if (oldFocus !== String(focus) || oldWidth !== host.clientWidth) {
      const svg = scroller.querySelector('svg'), bounds = svg.getBoundingClientRect(), box = scroller.getBoundingClientRect();
      scroller.scrollLeft += bounds.left + picture.center(focus) * bounds.width / picture.width - box.left - box.width / 2;
    }
  }
  const outputStrip = host.querySelector?.('.p239-outputs'), selectedOutput = outputStrip?.querySelector('.selected');
  if (selectedOutput) {
    const tile = selectedOutput.getBoundingClientRect(), strip = outputStrip.getBoundingClientRect();
    outputStrip.scrollLeft += tile.left - strip.left - (strip.width - tile.width) / 2;
  }
  const stop = () => { if (typeof stopPlay === 'function') stopPlay(); };
  host.querySelectorAll?.('button').forEach(button => button.addEventListener('keydown', event => { if (event.key === ' ' || event.key === 'Enter') event.stopPropagation(); }));
  const selectOutput = (index, selector) => {
    stop();
    if (state.final) { host.dataset.p239SelectedOutput = String(index); renderSlidingMaximum239View(step); (host.querySelector(`${selector}:not(:disabled)`) || host.querySelector('.p239-play button:not(:disabled)'))?.focus({ preventScroll: true }); }
    else { const target = timeline.findIndex(s => s.slidingMaximum239View?.event === 'append-maximum' && s.slidingMaximum239View.currentWitness?.answerIndex === index); if (target >= 0) { stepIndex = target; renderStep(); } }
  };
  host.querySelectorAll?.('[data-p239-output]').forEach(button => button.addEventListener('click', () => selectOutput(Number(button.dataset.p239Output), `[data-p239-output="${button.dataset.p239Output}"]`)));
  host.querySelectorAll?.('[data-p239-select]').forEach(button => button.addEventListener('click', () => selectOutput(Number(button.dataset.p239Select), `.p239-play button:${Number(button.dataset.p239Select) < selected ? 'first' : 'last'}-child`)));
  host.querySelectorAll?.('[data-p239-example]').forEach(button => button.addEventListener('click', async () => { stop(); const example = examples[Number(button.dataset.p239Example)]; $('arrInput').value = example.nums.join(','); $('param-k').value = example.k; await runViz(); }));
  host.querySelectorAll?.('[data-p239-jump]').forEach(button => button.addEventListener('click', () => { stop(); const target = timeline.findIndex((s, i) => i > at && s.slidingMaximum239View?.event === button.dataset.p239Jump); if (target >= 0) { stepIndex = target; renderStep(); } }));
}
