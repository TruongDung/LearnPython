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

function renderSlidingMaximum239View(step) {
  const host = typeof document !== "undefined" && document.getElementById
    ? document.getElementById("treeView")
    : typeof $ === "function" ? $("treeView") : null;
  if (!host) return;
  const locale = sm239Locale();
  const copy = SM239_TEXT[locale];
  const state = sm239Normalize(step);
  const timing = state.timing === "before" ? copy.before : copy.after;
  const eventInfo = SM239_EVENT_RAIL.find((item) => item.event === state.event);
  const eventLabel = eventInfo ? eventInfo[locale] : state.event;
  const summary = `${copy.region}. ${copy.line} ${state.sourceLine === null ? "—" : state.sourceLine}, ${eventLabel}.`;
  const note = state.note
    ? `<aside class="sm239-note"><strong>${sm239Escape(copy.note)}</strong><p>${sm239Escape(state.note)}</p></aside>`
    : "";

  host.innerHTML = `<article class="sm239-viz ${state.final ? "sm239-is-final" : ""}" role="region" aria-label="${sm239Escape(summary)}"><header class="sm239-header"><div><span>${sm239Escape(copy.kicker)}</span><h2>${sm239Escape(state.title)}</h2></div><div class="sm239-line-state"><strong>${sm239Escape(copy.line)} ${state.sourceLine === null ? "—" : state.sourceLine}</strong><span class="sm239-timing-${state.timing}">${sm239Escape(timing)}</span><em>${sm239Escape(eventLabel)}</em></div></header>${sm239RenderRail(state, copy, locale)}${sm239RenderSource(state, copy, locale)}${sm239RenderArray(state, copy)}<div class="sm239-main">${sm239RenderDeque(state, copy)}${sm239RenderRules(state, copy, locale)}</div>${sm239RenderOutputs(state, copy)}${note}${sm239RenderResult(state, copy)}</article>`;
}
