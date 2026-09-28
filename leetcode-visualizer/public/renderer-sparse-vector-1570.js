function renderSparseVector1570View(step) {
  const safeStep = step && typeof step === "object" ? step : {};
  const view = safeStep.sparseVector1570View && typeof safeStep.sparseVector1570View === "object"
    ? safeStep.sparseVector1570View
    : {};
  const el = $("treeView");
  if (!el) return;

  const vi = lang === "vi";
  const isRecord = (value) => Boolean(value) && typeof value === "object" && !Array.isArray(value);
  const firstDefined = (...values) => values.find((value) => value !== null && value !== undefined);
  const isSafeScalar = (value) => {
    if (typeof value === "number") return Number.isFinite(value);
    return typeof value === "string" || typeof value === "boolean" || typeof value === "bigint";
  };
  const valueText = (value, fallback = "—") => {
    if (!isSafeScalar(value)) return fallback;
    const rendered = String(value);
    if (!rendered || ["undefined", "NaN", "Infinity", "+Infinity", "-Infinity"].includes(rendered)) return fallback;
    return rendered;
  };
  const escaped = (value, fallback = "—") => escapeHtml(valueText(value, fallback));
  const sameValue = (left, right) => {
    if (!isSafeScalar(left) || !isSafeScalar(right)) return false;
    return String(left) === String(right);
  };
  const normalizeSide = (value) => value === "left" ? "left" : value === "right" ? "right" : value === "both" ? "both" : null;
  const sideName = (side) => side === "left"
    ? (vi ? "trái" : "left")
    : side === "right"
      ? (vi ? "phải" : "right")
      : side === "both" ? (vi ? "cả hai" : "both") : (vi ? "chưa chọn" : "not selected");

  const denseSource = isRecord(view.dense) ? view.dense : {};
  const sparseSource = isRecord(view.sparse) ? view.sparse : {};
  const denseLeft = Array.isArray(denseSource.left) ? denseSource.left : [];
  const denseRight = Array.isArray(denseSource.right) ? denseSource.right : [];
  const rawSparseLeft = Array.isArray(sparseSource.left) ? sparseSource.left : [];
  const rawSparseRight = Array.isArray(sparseSource.right) ? sparseSource.right : [];

  const normalizeEntry = (entry, position) => {
    if (Array.isArray(entry)) {
      return {
        index: firstDefined(entry[0], position),
        value: firstDefined(entry[1], "—"),
        position,
      };
    }
    if (isRecord(entry)) {
      return {
        index: firstDefined(entry.index, entry.idx, entry.key, position),
        value: firstDefined(entry.value, entry.val, entry.number, "—"),
        position,
      };
    }
    return {
      index: position,
      value: firstDefined(entry, "—"),
      position,
    };
  };

  const sparseLeft = rawSparseLeft.map(normalizeEntry);
  const sparseRight = rawSparseRight.map(normalizeEntry);
  const cursors = isRecord(view.cursors) ? view.cursors : {};
  const cursorPosition = (side) => {
    const rawCursor = cursors[side];
    const rawPosition = isRecord(rawCursor)
      ? firstDefined(rawCursor.position, rawCursor.cursor, rawCursor.sparseIndex)
      : rawCursor;
    return Number.isInteger(rawPosition) && rawPosition >= 0 ? rawPosition : null;
  };
  const cursorLeft = cursorPosition("left");
  const cursorRight = cursorPosition("right");
  const rawProbe = cursors.probe;
  const explicitProbeIndex = isRecord(rawProbe)
    ? firstDefined(rawProbe.index, rawProbe.idx, rawProbe.key, rawProbe.position)
    : rawProbe;

  const current = isRecord(view.current) ? view.current : {};
  const currentOperand = (rawOperand, fallbackEntry) => {
    if (Array.isArray(rawOperand)) {
      return {
        index: firstDefined(rawOperand[0], fallbackEntry && fallbackEntry.index, "—"),
        value: firstDefined(rawOperand[1], fallbackEntry && fallbackEntry.value, "—"),
        position: fallbackEntry ? fallbackEntry.position : null,
      };
    }
    if (isRecord(rawOperand)) {
      return {
        index: firstDefined(rawOperand.index, rawOperand.idx, rawOperand.key, fallbackEntry && fallbackEntry.index, "—"),
        value: firstDefined(rawOperand.value, rawOperand.val, rawOperand.number, fallbackEntry && fallbackEntry.value, "—"),
        position: fallbackEntry ? fallbackEntry.position : null,
      };
    }
    if (isSafeScalar(rawOperand)) {
      return {
        index: fallbackEntry ? fallbackEntry.index : "—",
        value: rawOperand,
        position: fallbackEntry ? fallbackEntry.position : null,
      };
    }
    return fallbackEntry || { index: "—", value: "—", position: null };
  };
  const currentLeftSource = firstDefined(
    current.left,
    isSafeScalar(current.leftIndex) || isSafeScalar(current.leftValue)
      ? { index: current.leftIndex, value: current.leftValue }
      : undefined,
  );
  const currentRightSource = firstDefined(
    current.right,
    isSafeScalar(current.rightIndex) || isSafeScalar(current.rightValue)
      ? { index: current.rightIndex, value: current.rightValue }
      : undefined,
  );
  const currentLeft = currentOperand(currentLeftSource, cursorLeft === null ? null : sparseLeft[cursorLeft]);
  const currentRight = currentOperand(currentRightSource, cursorRight === null ? null : sparseRight[cursorRight]);
  const probeIndex = firstDefined(explicitProbeIndex, current.index);

  const normalizeContribution = (entry, position) => {
    if (Array.isArray(entry)) {
      return {
        index: firstDefined(entry[0], position),
        left: firstDefined(entry[1], "—"),
        right: firstDefined(entry[2], "—"),
        product: firstDefined(entry[3], "—"),
        total: firstDefined(entry[4], null),
        position,
      };
    }
    if (isRecord(entry)) {
      const leftEntry = Array.isArray(entry.left) || isRecord(entry.left) ? normalizeEntry(entry.left, position) : null;
      const rightEntry = Array.isArray(entry.right) || isRecord(entry.right) ? normalizeEntry(entry.right, position) : null;
      let leftValue = firstDefined(entry.leftValue, leftEntry && leftEntry.value, isSafeScalar(entry.left) ? entry.left : undefined, "—");
      let rightValue = firstDefined(entry.rightValue, rightEntry && rightEntry.value, isSafeScalar(entry.right) ? entry.right : undefined, "—");
      let product = firstDefined(entry.product, entry.contribution);
      if (!isSafeScalar(product) && typeof leftValue === "number" && Number.isFinite(leftValue) && typeof rightValue === "number" && Number.isFinite(rightValue)) {
        const calculated = leftValue * rightValue;
        product = Number.isFinite(calculated) ? calculated : "—";
      }
      return {
        index: firstDefined(entry.index, entry.idx, leftEntry && leftEntry.index, rightEntry && rightEntry.index, position),
        left: leftValue,
        right: rightValue,
        product: firstDefined(product, "—"),
        total: firstDefined(entry.total, entry.totalAfter, entry.runningTotal, entry.sum, null),
        position,
      };
    }
    return {
      index: position,
      left: "—",
      right: "—",
      product: firstDefined(entry, "—"),
      total: null,
      position,
    };
  };

  const rawContributions = Array.isArray(view.contributions) ? view.contributions : [];
  const contributions = rawContributions.map(normalizeContribution);
  const contributedIndexes = new Set(
    contributions
      .map((entry) => isSafeScalar(entry.index) ? String(entry.index) : null)
      .filter((entry) => entry !== null),
  );

  const strategy = view.strategy === "two-pointer" ? "two-pointer" : "hash-lookup";
  const strategyLabel = strategy === "two-pointer"
    ? (vi ? "Hai con trỏ" : "Two pointers")
    : (vi ? "Tra cứu bảng băm" : "Hash lookup");
  const iteratedSide = normalizeSide(view.iteratedSide);
  const lookupSide = strategy === "hash-lookup" && (iteratedSide === "left" || iteratedSide === "right")
    ? (iteratedSide === "left" ? "right" : "left")
    : null;

  const rawBuildState = isRecord(view.build)
    ? view.build
    : isRecord(view.buildState) ? view.buildState : {};
  const buildSide = normalizeSide(firstDefined(
    rawBuildState.side,
    typeof view.build === "string" ? view.build : null,
  ));
  const rawBuildEntry = firstDefined(rawBuildState.entry, rawBuildState.current, rawBuildState.pair);
  const normalizedBuildEntry = rawBuildEntry === undefined ? null : normalizeEntry(rawBuildEntry, 0);
  const buildIndex = firstDefined(
    rawBuildState.index,
    rawBuildState.idx,
    rawBuildState.denseIndex,
    rawBuildState.cursor,
    normalizedBuildEntry && normalizedBuildEntry.index,
  );
  const buildValue = firstDefined(
    rawBuildState.value,
    rawBuildState.val,
    normalizedBuildEntry && normalizedBuildEntry.value,
  );
  const rawBuildStatus = firstDefined(rawBuildState.status, rawBuildState.stage, rawBuildState.action, view.phase, "init");
  const buildStatusKey = valueText(rawBuildStatus, "init").toLowerCase();
  const buildStatusCatalog = {
    init: { en: "waiting", vi: "đang chờ" },
    store: { en: "store nonzero", vi: "lưu số khác 0" },
    "skip-zero": { en: "skip zero", vi: "bỏ qua số 0" },
    complete: { en: "compression complete", vi: "nén hoàn tất" },
    compression: { en: "compressing", vi: "đang nén" },
  };
  const buildStatusEntry = buildStatusCatalog[buildStatusKey];
  const buildStatusText = buildStatusEntry
    ? (vi ? buildStatusEntry.vi : buildStatusEntry.en)
    : valueText(rawBuildStatus, vi ? "đang nén" : "compressing");
  const buildProcessed = isRecord(rawBuildState.processed) ? rawBuildState.processed : {};
  const processedLeft = Number.isFinite(buildProcessed.left) && buildProcessed.left >= 0 ? Math.floor(buildProcessed.left) : 0;
  const processedRight = Number.isFinite(buildProcessed.right) && buildProcessed.right >= 0 ? Math.floor(buildProcessed.right) : 0;

  const phaseText = valueText(pick(view.phase), "init");
  const phaseKey = phaseText.toLowerCase();
  const phaseCatalog = {
    init: { en: "Initialize", vi: "Khởi tạo" },
    start: { en: "Start", vi: "Bắt đầu" },
    input: { en: "Read input", vi: "Đọc đầu vào" },
    dense: { en: "Read vectors", vi: "Đọc vector" },
    build: { en: "Build sparse form", vi: "Tạo dạng thưa" },
    compress: { en: "Compress", vi: "Nén vector" },
    compression: { en: "Compress", vi: "Nén vector" },
    "select-smaller": { en: "Choose shorter side", vi: "Chọn phía ngắn hơn" },
    initialize: { en: "Initialize pointers", vi: "Đặt con trỏ" },
    probe: { en: "Probe lookup", vi: "Dò bảng tra cứu" },
    miss: { en: "Lookup miss", vi: "Không tìm thấy" },
    missing: { en: "Lookup miss", vi: "Không tìm thấy" },
    compare: { en: "Compare indices", vi: "So sánh index" },
    "advance-left": { en: "Advance left", vi: "Tăng con trỏ trái" },
    "advance-right": { en: "Advance right", vi: "Tăng con trỏ phải" },
    match: { en: "Multiply match", vi: "Nhân cặp khớp" },
    accumulate: { en: "Add contribution", vi: "Cộng đóng góp" },
    complete: { en: "Complete", vi: "Hoàn tất" },
    completed: { en: "Complete", vi: "Hoàn tất" },
    done: { en: "Complete", vi: "Hoàn tất" },
    final: { en: "Final answer", vi: "Đáp án cuối" },
    answer: { en: "Final answer", vi: "Đáp án cuối" },
  };
  const phaseEntry = phaseCatalog[phaseKey];
  const phaseDisplay = phaseEntry ? (vi ? phaseEntry.vi : phaseEntry.en) : phaseText;
  let phaseIndex = 0;
  if (["done", "final", "answer", "complete", "completed"].includes(phaseKey)) phaseIndex = 3;
  else if (phaseKey.includes("build") || phaseKey.includes("compress")) phaseIndex = 1;
  else if (!["init", "start", "dense", "input"].includes(phaseKey)) phaseIndex = 2;
  const phaseLabels = strategy === "two-pointer"
    ? (vi
      ? ["Đọc vector", "Nén số khác 0", "So sánh hai index", "Kết quả"]
      : ["Read vectors", "Compress nonzeros", "Compare indices", "Result"])
    : (vi
      ? ["Đọc vector", "Tạo bảng thưa", "Dò phía ngắn hơn", "Kết quả"]
      : ["Read vectors", "Build sparse lookup", "Probe shorter side", "Result"]);
  const phasesHtml = phaseLabels.map((label, index) => {
    const stateClass = index < phaseIndex
      ? "sv1570-phase-done"
      : index === phaseIndex ? "sv1570-phase-active" : "sv1570-phase-pending";
    const marker = index < phaseIndex ? "✓" : index === phaseIndex ? "▶" : String(index + 1);
    return `<span class="sv1570-phase ${stateClass}" aria-current="${index === phaseIndex ? "step" : "false"}"><b class="sv1570-phase-marker">${escapeHtml(marker)}</b><span class="sv1570-phase-label">${escapeHtml(label)}</span></span>`;
  }).join("");

  const declaredLength = Number.isFinite(view.length) && view.length >= 0 ? Math.floor(view.length) : 0;
  const vectorLength = Math.max(declaredLength, denseLeft.length, denseRight.length);
  const visibleLength = Math.min(vectorLength, 240);
  const vectorsTruncated = vectorLength > visibleLength;

  const denseRowHtml = (side, values) => {
    const activeOperand = side === "left" ? currentLeft : currentRight;
    const label = side === "left" ? (vi ? "Vector trái" : "Left vector") : (vi ? "Vector phải" : "Right vector");
    const shortLabel = side === "left" ? "L" : "R";
    const cells = visibleLength === 0
      ? `<span class="sv1570-empty">${vi ? "Vector rỗng" : "Empty vector"}</span>`
      : Array.from({ length: visibleLength }, (_, index) => {
        const hasValue = index < values.length;
        const rawValue = hasValue ? values[index] : "—";
        const classes = ["sv1570-dense-cell"];
        if (!hasValue) classes.push("sv1570-dense-missing");
        if (rawValue === 0) classes.push("sv1570-dense-zero");
        if (sameValue(activeOperand.index, index) || (strategy === "hash-lookup" && side === iteratedSide && sameValue(probeIndex, index))) {
          classes.push("sv1570-dense-active");
        }
        const aria = `${label}, ${vi ? "index" : "index"} ${index}, ${vi ? "giá trị" : "value"} ${valueText(rawValue)}`;
        return `<span class="${classes.join(" ")}" aria-label="${escapeHtml(aria)}"><small class="sv1570-dense-index">${escapeHtml(String(index))}</small><strong class="sv1570-dense-value">${escaped(rawValue)}</strong></span>`;
      }).join("");
    return `<div class="sv1570-dense-row sv1570-dense-${side}"><div class="sv1570-dense-label"><b class="sv1570-dense-side">${escapeHtml(shortLabel)}</b><span class="sv1570-dense-name">${escapeHtml(label)}</span></div><div class="sv1570-dense-cells">${cells}</div></div>`;
  };

  const laneHtml = (side, entries, cursor) => {
    const laneLabel = side === "left" ? (vi ? "Vector thưa trái" : "Left sparse vector") : (vi ? "Vector thưa phải" : "Right sparse vector");
    const cursorLabel = side === "left" ? "L" : "R";
    const cards = entries.length === 0
      ? `<span class="sv1570-empty">${vi ? "Không có phần tử khác 0" : "No nonzero entries"}</span>`
      : entries.map((entry, position) => {
        const isPointer = cursor === position;
        const isProbe = probeIndex !== null && probeIndex !== undefined
          && (lookupSide === null || lookupSide === side)
          && sameValue(probeIndex, entry.index);
        const isCurrent = sameValue(entry.index, side === "left" ? currentLeft.index : currentRight.index);
        const isContributed = isSafeScalar(entry.index) && contributedIndexes.has(String(entry.index));
        const isBuilding = buildSide === side && sameValue(buildIndex, entry.index);
        const classes = ["sv1570-entry"];
        if (isPointer) classes.push("sv1570-entry-pointer");
        if (isProbe) classes.push("sv1570-entry-probe");
        if (isCurrent) classes.push("sv1570-entry-current");
        if (isContributed) classes.push("sv1570-entry-contributed");
        if (isBuilding) classes.push("sv1570-entry-building");
        const markers = [
          isPointer ? `<span class="sv1570-entry-marker sv1570-pointer-marker">${escapeHtml(cursorLabel)}</span>` : "",
          isProbe ? `<span class="sv1570-entry-marker sv1570-probe-marker">${vi ? "DÒ" : "PROBE"}</span>` : "",
          isContributed ? `<span class="sv1570-entry-marker sv1570-contribution-marker">✓</span>` : "",
        ].join("");
        const aria = `${laneLabel}, ${vi ? "vị trí nén" : "compressed position"} ${position}, index ${valueText(entry.index)}, ${vi ? "giá trị" : "value"} ${valueText(entry.value)}`;
        return `<article class="${classes.join(" ")}" aria-label="${escapeHtml(aria)}"><span class="sv1570-entry-position">#${escapeHtml(String(position))}</span><div class="sv1570-entry-data"><span class="sv1570-entry-index"><small class="sv1570-entry-caption">index</small><strong class="sv1570-entry-number">${escaped(entry.index)}</strong></span><span class="sv1570-entry-divider">:</span><span class="sv1570-entry-value"><small class="sv1570-entry-caption">value</small><strong class="sv1570-entry-number">${escaped(entry.value)}</strong></span></div><div class="sv1570-entry-markers">${markers}</div></article>`;
      }).join("");
    const roleText = iteratedSide === side || iteratedSide === "both"
      ? (iteratedSide === "both"
        ? (vi ? "hai con trỏ cùng duyệt" : "scanned by both pointers")
        : (vi ? "phía được duyệt" : "iterated side"))
      : lookupSide === side ? (vi ? "phía tra cứu" : "lookup side") : "";
    return `<section class="sv1570-lane sv1570-lane-${side}"><header class="sv1570-lane-header"><div class="sv1570-lane-title"><strong>${escapeHtml(laneLabel)}</strong>${roleText ? `<em class="sv1570-lane-role">${escapeHtml(roleText)}</em>` : ""}</div><span class="sv1570-lane-count">${escapeHtml(String(entries.length))} ${vi ? "phần tử khác 0" : "nonzero"}</span></header><div class="sv1570-lane-scroll"><div class="sv1570-lane-track">${cards}</div></div></section>`;
  };

  const relationKey = valueText(current.relation, "waiting").toLowerCase();
  const relationCatalog = {
    match: { symbol: "=", en: "indices match — multiply", vi: "index trùng — nhân", tone: "match" },
    equal: { symbol: "=", en: "indices match — multiply", vi: "index trùng — nhân", tone: "match" },
    "==": { symbol: "=", en: "indices match — multiply", vi: "index trùng — nhân", tone: "match" },
    probe: { symbol: "?", en: "probe this index", vi: "dò index này", tone: "probe" },
    hit: { symbol: "✓", en: "lookup hit — multiply", vi: "tra cứu thấy — nhân", tone: "match" },
    found: { symbol: "✓", en: "lookup hit — multiply", vi: "tra cứu thấy — nhân", tone: "match" },
    miss: { symbol: "∅", en: "lookup miss — skip", vi: "không tìm thấy — bỏ qua", tone: "miss" },
    missing: { symbol: "∅", en: "lookup miss — skip", vi: "không tìm thấy — bỏ qua", tone: "miss" },
    "not-found": { symbol: "∅", en: "lookup miss — skip", vi: "không tìm thấy — bỏ qua", tone: "miss" },
    "left-before-right": { symbol: "<", en: "left index is smaller — advance left", vi: "index trái nhỏ hơn — tăng trái", tone: "advance" },
    "left-less": { symbol: "<", en: "left index is smaller — advance left", vi: "index trái nhỏ hơn — tăng trái", tone: "advance" },
    "left-smaller": { symbol: "<", en: "left index is smaller — advance left", vi: "index trái nhỏ hơn — tăng trái", tone: "advance" },
    "left-after-right": { symbol: ">", en: "right index is smaller — advance right", vi: "index phải nhỏ hơn — tăng phải", tone: "advance" },
    "right-less": { symbol: ">", en: "right index is smaller — advance right", vi: "index phải nhỏ hơn — tăng phải", tone: "advance" },
    "right-smaller": { symbol: ">", en: "right index is smaller — advance right", vi: "index phải nhỏ hơn — tăng phải", tone: "advance" },
    waiting: { symbol: "·", en: "waiting for a pair", vi: "đang chờ một cặp", tone: "neutral" },
  };
  const relation = relationCatalog[relationKey] || {
    symbol: valueText(current.relation, "·"),
    en: valueText(current.relation, "waiting for a pair"),
    vi: valueText(current.relation, "đang chờ một cặp"),
    tone: "neutral",
  };
  const productValue = firstDefined(current.product, view.product);
  const hasProduct = isSafeScalar(productValue);
  let formulaText;
  if (hasProduct) {
    formulaText = `${valueText(currentLeft.value)} × ${valueText(currentRight.value)} = ${valueText(productValue)}`;
  } else if (strategy === "hash-lookup" && ["probe", "hit", "found", "miss", "missing", "not-found"].includes(relationKey)) {
    const lookupResult = relationKey === "probe"
      ? "?"
      : ["hit", "found"].includes(relationKey) ? valueText(currentRight.value) : "∅";
    formulaText = `lookup[${valueText(probeIndex)}] → ${lookupResult}`;
  } else {
    formulaText = `index ${valueText(currentLeft.index)} ${relation.symbol} index ${valueText(currentRight.index)}`;
  }

  const runningTotal = isSafeScalar(view.runningTotal) ? view.runningTotal : 0;
  const ledgerHtml = contributions.length === 0
    ? `<div class="sv1570-ledger-empty"><strong>${vi ? "Chưa có tích đóng góp" : "No contributions yet"}</strong><span>${vi ? "Chỉ các index xuất hiện ở cả hai vector mới được cộng." : "Only indices present in both vectors contribute."}</span></div>`
    : contributions.map((entry, index) => {
      const totalText = entry.total === null || entry.total === undefined
        ? ""
        : `${vi ? "tổng" : "total"} ${valueText(entry.total)}`;
      return `<div class="sv1570-ledger-row ${index === contributions.length - 1 ? "sv1570-ledger-latest" : ""}"><span class="sv1570-ledger-index"><small>index</small><strong>${escaped(entry.index)}</strong></span><code class="sv1570-ledger-equation">${escaped(entry.left)} × ${escaped(entry.right)}</code><span class="sv1570-ledger-arrow">→</span><strong class="sv1570-ledger-product">+${escaped(entry.product)}</strong><span class="sv1570-ledger-total">${escapeHtml(totalText)}</span></div>`;
    }).join("");

  const hasBuildFocus = Boolean(buildSide) || isSafeScalar(buildIndex) || isSafeScalar(buildValue);
  const buildDetail = hasBuildFocus
    ? `${sideName(buildSide)}[${valueText(buildIndex)}] = ${valueText(buildValue)}`
    : (vi ? "Chờ phần tử khác 0 tiếp theo" : "Waiting for the next nonzero value");

  const titleText = valueText(pick(safeStep.title), vi ? "Tích vô hướng vector thưa" : "Sparse vector dot product");
  const noteText = valueText(pick(safeStep.note), vi ? "Nén các số khác 0 rồi chỉ nhân các index chung." : "Compress nonzeros, then multiply only shared indices.");
  const finalFromObject = isRecord(view.final) ? firstDefined(view.final.answer, view.final.value) : undefined;
  const finalFromScalar = !isRecord(view.final) && typeof view.final !== "boolean" ? view.final : undefined;
  const finalCandidate = firstDefined(view.answer, view.finalAnswer, finalFromObject, finalFromScalar);
  const done = phaseIndex === 3 || safeStep.final === true || view.final === true;
  const hasFinalAnswer = isSafeScalar(finalCandidate);
  const finalAnswer = hasFinalAnswer ? finalCandidate : done ? runningTotal : "…";
  const summary = vi
    ? `Bài 1570, ${strategyLabel}, độ dài ${vectorLength}, tổng đang chạy ${valueText(runningTotal)}${done ? `, đáp án ${valueText(finalAnswer)}` : ""}.`
    : `Problem 1570, ${strategyLabel}, length ${vectorLength}, running total ${valueText(runningTotal)}${done ? `, answer ${valueText(finalAnswer)}` : ""}.`;

  el.innerHTML = `<section class="sv1570-viz ${strategy === "two-pointer" ? "sv1570-strategy-two-pointer" : "sv1570-strategy-hash"}" role="img" aria-label="${escapeHtml(summary)}">
    <header class="sv1570-header">
      <div class="sv1570-heading"><small class="sv1570-eyebrow">#1570 · ${vi ? "VECTOR THƯA" : "SPARSE VECTOR"}</small><strong class="sv1570-title">${vi ? "Tích vô hướng" : "Dot Product"}</strong></div>
      <div class="sv1570-meta"><span class="sv1570-strategy">${escapeHtml(strategyLabel)}</span><span class="sv1570-length">n = ${escapeHtml(String(vectorLength))}</span><span class="sv1570-phase-name">${escapeHtml(phaseDisplay)}</span></div>
    </header>
    <div class="sv1570-phases">${phasesHtml}</div>
    <section class="sv1570-action"><small class="sv1570-action-label">${vi ? "BƯỚC HIỆN TẠI" : "CURRENT STEP"}</small><strong class="sv1570-action-title">${escapeHtml(titleText)}</strong><span class="sv1570-action-note">${escapeHtml(noteText)}</span></section>
    <section class="sv1570-dense">
      <header class="sv1570-section-header"><div class="sv1570-section-heading"><strong>${vi ? "VECTOR DÀY BAN ĐẦU" : "ORIGINAL DENSE VECTORS"}</strong><span>${vi ? "index ở trên · giá trị ở dưới" : "index above · value below"}</span></div>${vectorsTruncated ? `<em class="sv1570-truncated">${vi ? `Hiển thị ${visibleLength}/${vectorLength}` : `Showing ${visibleLength}/${vectorLength}`}</em>` : ""}</header>
      <div class="sv1570-dense-scroll"><div class="sv1570-dense-rows">${denseRowHtml("left", denseLeft)}${denseRowHtml("right", denseRight)}</div></div>
    </section>
    <div class="sv1570-main">
      <section class="sv1570-sparse">
        <header class="sv1570-section-header"><div class="sv1570-section-heading"><strong>${vi ? "DẠNG NÉN (index : value)" : "COMPRESSED (index : value)"}</strong><span>${vi ? "Chỉ giữ phần tử khác 0" : "Store nonzero entries only"}</span></div><span class="sv1570-iteration">${vi ? "duyệt" : "iterate"}: ${escapeHtml(sideName(iteratedSide))}</span></header>
        <div class="sv1570-lanes">${laneHtml("left", sparseLeft, cursorLeft)}${laneHtml("right", sparseRight, cursorRight)}</div>
      </section>
      <aside class="sv1570-dashboard">
        <section class="sv1570-build"><header class="sv1570-mini-header"><strong>${vi ? "TRẠNG THÁI NÉN" : "BUILD STATE"}</strong><span>${escapeHtml(buildStatusText)}</span></header><div class="sv1570-build-counts"><span class="sv1570-build-count"><small>L · ${vi ? "đã quét / nnz" : "scanned / nnz"}</small><strong>${escapeHtml(`${processedLeft} / ${sparseLeft.length}`)}</strong></span><span class="sv1570-build-count"><small>R · ${vi ? "đã quét / nnz" : "scanned / nnz"}</small><strong>${escapeHtml(`${processedRight} / ${sparseRight.length}`)}</strong></span></div><code class="sv1570-build-detail">${escapeHtml(buildDetail)}</code></section>
        <section class="sv1570-current"><header class="sv1570-mini-header"><strong>${vi ? "SO SÁNH HIỆN TẠI" : "CURRENT COMPARISON"}</strong><span>${escapeHtml(vi ? relation.vi : relation.en)}</span></header><div class="sv1570-current-equation"><span class="sv1570-operand sv1570-operand-left"><small>L · index ${escaped(currentLeft.index)}</small><strong>${escaped(currentLeft.value)}</strong></span><span class="sv1570-relation sv1570-relation-${relation.tone}"><b>${escapeHtml(relation.symbol)}</b></span><span class="sv1570-operand sv1570-operand-right"><small>R · index ${escaped(currentRight.index)}</small><strong>${escaped(currentRight.value)}</strong></span></div><code class="sv1570-formula">${escapeHtml(formulaText)}</code></section>
        <section class="sv1570-running"><small>${vi ? "TỔNG ĐANG CHẠY" : "RUNNING TOTAL"}</small><strong>${escaped(runningTotal, "0")}</strong><span>${escapeHtml(String(contributions.length))} ${vi ? "tích đã cộng" : "contribution(s)"}</span></section>
        <section class="sv1570-answer ${done ? "sv1570-answer-ready" : "sv1570-answer-pending"}"><small>${vi ? "ĐÁP ÁN CUỐI" : "FINAL ANSWER"}</small><strong>${escaped(finalAnswer, done ? "0" : "…")}</strong><span>${done ? (vi ? "Hoàn tất tích vô hướng" : "Dot product complete") : (vi ? "Tiếp tục quét các index chung" : "Keep scanning shared indices")}</span></section>
      </aside>
    </div>
    <section class="sv1570-ledger"><header class="sv1570-section-header"><div class="sv1570-section-heading"><strong>${vi ? "SỔ CÁC TÍCH ĐÓNG GÓP" : "CONTRIBUTION LEDGER"}</strong><span>Σ left[i] × right[i]</span></div><span class="sv1570-ledger-count">${escapeHtml(String(contributions.length))}</span></header><div class="sv1570-ledger-scroll">${ledgerHtml}</div></section>
    <footer class="sv1570-legend"><span class="sv1570-legend-item"><i class="sv1570-legend-pointer"></i>${vi ? "con trỏ / phần tử đang xét" : "pointer / current entry"}</span><span class="sv1570-legend-item"><i class="sv1570-legend-probe"></i>${vi ? "index đang dò" : "active lookup probe"}</span><span class="sv1570-legend-item"><i class="sv1570-legend-contribution"></i>${vi ? "đã đóng góp vào tổng" : "already contributed"}</span></footer>
  </section>`;
}
