function renderValidSequenceView(step) {
  const view = step.validSequenceView || {};
  const word1 = typeof view.word1 === "string" ? view.word1 : "";
  const word2 = typeof view.word2 === "string" ? view.word2 : "";
  const suffix = Array.isArray(view.suffix) ? view.suffix : [];
  const suffixStatus = Array.isArray(view.suffixStatus) ? view.suffixStatus : [];
  const selections = Array.isArray(view.selections) ? view.selections : [];
  const answer = Array.isArray(view.answer) ? view.answer : [];
  const vi = lang === "vi";
  const phaseIndex = { setup: 0, suffix: 0, greedy: 1, done: 2 }[view.phase] ?? 0;
  const labels = vi
    ? ["1 · Dựng suffix từ phải", "2 · Greedy chọn chỉ số nhỏ nhất", "3 · Kiểm tra đủ m chỉ số"]
    : ["1 · Build suffix from the right", "2 · Greedily take smallest indices", "3 · Verify all m indices"];
  const phases = labels.map((label, index) => {
    const done = view.phase === "done" || index < phaseIndex;
    const state = done ? "done" : index === phaseIndex ? "active" : "pending";
    return `<span class="${state}">${done ? "✓" : index === phaseIndex ? "▶" : "○"}<b>${escapeHtml(label)}</b></span>`;
  }).join("");
  const selectionByWord1 = new Map(selections.map((selection) => [selection.word1Index, selection]));
  const selectionByWord2 = new Map(selections.map((selection) => [selection.word2Index, selection]));
  const suffixWord1 = new Set(suffix.filter((value, index) => suffixStatus[index] === "matched" && value >= 0));

  const word1Html = [...word1].map((char, index) => {
    const selected = selectionByWord1.get(index);
    const classes = ["valid3302-cell", "source"];
    if (index === view.backI) classes.push("back-pointer");
    if (index === view.forwardI) classes.push("forward-pointer");
    if (selected) classes.push("selected", selected.mismatch ? "mismatch" : "exact");
    if (suffixWord1.has(index)) classes.push("suffix-position");
    const markers = [];
    if (index === view.backI) markers.push("BACK i");
    if (index === view.forwardI) markers.push("i");
    if (selected) markers.push(selected.mismatch ? "CHANGED" : `#${selected.word2Index + 1}`);
    return `<span class="${classes.join(" ")}"><small>[${index}]</small><strong>${escapeHtml(char)}</strong><em>${markers.join(" · ")}</em></span>`;
  }).join("");
  const word2Html = [...word2].map((char, index) => {
    const selected = selectionByWord2.get(index);
    const isTarget = index === view.backJ || index === view.targetJ;
    const classes = ["valid3302-cell", "target"];
    if (isTarget) classes.push("active-target");
    if (selected) classes.push("filled", selected.mismatch ? "mismatch" : "exact");
    const marker = selected
      ? `← word1[${selected.word1Index}]${selected.mismatch ? " · changed" : ""}`
      : isTarget
        ? "TARGET j"
        : "";
    return `<span class="${classes.join(" ")}"><small>word2[${index}]</small><strong>${escapeHtml(char)}</strong><em>${escapeHtml(marker)}</em></span>`;
  }).join("");
  const suffixHtml = [...word2].map((char, index) => {
    const status = suffixStatus[index] || "pending";
    const active = index === view.backJ || (view.decision && view.decision.futureBound === suffix[index]);
    const value = status === "pending" ? "_" : suffix[index];
    const statusText = status === "matched"
      ? `word1[${suffix[index]}] = '${word1[suffix[index]]}'`
      : status === "impossible"
        ? (vi ? "không thể khớp" : "cannot match")
        : (vi ? "chưa tính" : "pending");
    return `<span class="valid3302-suffix ${status}${active ? " active" : ""}"><small>suffix[${index}] · '${escapeHtml(char)}'</small><strong>${escapeHtml(String(value))}</strong><em>${escapeHtml(statusText)}</em></span>`;
  }).join("");

  const selectedString = selections.map((selection) => word1[selection.word1Index]).join("");
  const answerHtml = selections.length
    ? selections.map((selection) => `<span class="${selection.mismatch ? "mismatch" : "exact"}"><small>target ${selection.word2Index}</small><strong>${selection.word1Index}</strong><em>'${escapeHtml(word1[selection.word1Index])}'${selection.mismatch ? ` → '${escapeHtml(word2[selection.word2Index])}'` : ""}</em></span>`).join(`<b>→</b>`)
    : `<em>${vi ? "Chưa chọn chỉ số" : "No selected index"}</em>`;
  const couponHtml = `<div class="valid3302-coupon ${view.mismatchUsed ? "used" : "available"}"><small>${vi ? "PHIẾU MISMATCH" : "MISMATCH COUPON"}</small><strong>${view.mismatchUsed ? (vi ? "ĐÃ DÙNG" : "USED") : (vi ? "CÒN 1 LẦN" : "1 AVAILABLE")}</strong><span>${view.mismatchUsed ? (vi ? "Chỉ được chọn exact match" : "Exact matches only") : (vi ? "Có thể đổi tối đa một ký tự" : "At most one character may change")}</span></div>`;

  const decision = view.decision || {};
  let decisionHtml;
  if (view.phase === "suffix") {
    const sourceIndex = Number.isInteger(view.backI) ? view.backI : decision.word1Index;
    const targetIndex = Number.isInteger(view.backJ) ? view.backJ : decision.word2Index;
    if (view.event === "suffix-save") {
      decisionHtml = `<div class="valid3302-decision suffix"><small>${vi ? "LƯU MỐC BÊN PHẢI" : "SAVE RIGHTMOST MARK"}</small><strong>suffix[${targetIndex}] = ${sourceIndex}</strong><code>word1[${sourceIndex}] = word2[${targetIndex}] = '${escapeHtml(word2[targetIndex] || "")}'</code></div>`;
    } else if (["suffix-break", "suffix-exhausted-check"].includes(view.event) && sourceIndex < 0) {
      decisionHtml = `<div class="valid3302-decision reject"><small>${vi ? "HẾT WORD1" : "WORD1 EXHAUSTED"}</small><strong>i = ${sourceIndex}</strong><span>${vi ? "Dừng dựng các suffix bên trái" : "Stop building earlier suffix entries"}</span></div>`;
    } else if (Number.isInteger(sourceIndex) && sourceIndex >= 0 && Number.isInteger(targetIndex)) {
      const equal = word1[sourceIndex] === word2[targetIndex];
      decisionHtml = `<div class="valid3302-char-check ${equal ? "accept" : "reject"}"><span><small>word1[${sourceIndex}]</small><strong>'${escapeHtml(word1[sourceIndex])}'</strong></span><code>${equal ? "=" : "≠"}</code><span><small>word2[${targetIndex}]</small><strong>'${escapeHtml(word2[targetIndex])}'</strong></span><b>${equal ? (vi ? "LƯU" : "SAVE") : (vi ? "ĐI TRÁI" : "MOVE LEFT")}</b></div>`;
    } else {
      decisionHtml = `<div class="valid3302-decision suffix"><small>RIGHTMOST EXACT SUFFIX</small><strong>${vi ? "Chuẩn bị quét từ phải sang trái" : "Prepare the right-to-left scan"}</strong></div>`;
    }
  } else if (view.phase === "greedy") {
    const sourceIndex = Number.isInteger(view.forwardI) ? view.forwardI : decision.word1Index;
    const targetIndex = Number.isInteger(view.targetJ) && view.targetJ < word2.length ? view.targetJ : decision.word2Index;
    if (decision.type === "mismatch") {
      const lastTarget = targetIndex === word2.length - 1;
      const bound = decision.futureBound;
      decisionHtml = `<div class="valid3302-gate ${decision.canTake ? "accept" : "reject"}">
        <header><strong>${decision.canTake ? (vi ? "CHỌN MISMATCH" : "TAKE MISMATCH") : (vi ? "BỎ CHỈ SỐ NÀY" : "SKIP THIS INDEX")}</strong><code>i=${sourceIndex}</code></header>
        <div><span class="${!decision.mismatchUsed ? "pass" : "fail"}"><small>1</small><b>${decision.mismatchUsed ? (vi ? "coupon đã dùng" : "coupon already used") : (vi ? "coupon chưa dùng" : "coupon unused")}</b></span><span class="${decision.futureExists ? "pass" : "fail"}"><small>2</small><b>${lastTarget ? (vi ? "target cuối" : "last target") : (vi ? "có exact suffix" : "exact suffix exists")}</b></span><span class="${decision.leavesRoom ? "pass" : "fail"}"><small>3</small><b>${lastTarget ? (vi ? "không cần chừa chỗ" : "no suffix space needed") : `${sourceIndex} < suffix[${targetIndex + 1}] = ${bound}`}</b></span></div>
      </div>`;
    } else if (["match", "selected-match", "append-match"].includes(decision.type)) {
      decisionHtml = `<div class="valid3302-char-check accept"><span><small>word1[${sourceIndex}]</small><strong>'${escapeHtml(word1[sourceIndex] || "")}'</strong></span><code>=</code><span><small>word2[${targetIndex}]</small><strong>'${escapeHtml(word2[targetIndex] || "")}'</strong></span><b>${vi ? "CHỌN EXACT" : "TAKE EXACT"}</b></div>`;
    } else if (decision.type === "selected-mismatch") {
      decisionHtml = `<div class="valid3302-char-check mismatch"><span><small>word1[${sourceIndex}]</small><strong>'${escapeHtml(word1[sourceIndex] || "")}'</strong></span><code>→</code><span><small>word2[${targetIndex}]</small><strong>'${escapeHtml(word2[targetIndex] || "")}'</strong></span><b>${vi ? "DÙNG MISMATCH" : "SPEND MISMATCH"}</b></div>`;
    } else {
      decisionHtml = `<div class="valid3302-decision greedy"><small>${vi ? "QUY TẮC GREEDY" : "GREEDY RULE"}</small><strong>${vi ? "Xét i từ nhỏ đến lớn; chọn ngay khi khả thi" : "Scan i in increasing order; take it as soon as feasible"}</strong></div>`;
    }
  } else if (view.phase === "done") {
    const result = Array.isArray(view.result) ? view.result : answer;
    decisionHtml = `<div class="valid3302-decision result ${view.valid ? "accept" : "reject"}"><small>RETURN</small><strong>[${result.join(", ")}]</strong><code>${view.valid ? `"${escapeHtml(selectedString)}" ≈ "${escapeHtml(word2)}"` : `${selections.length}/${word2.length}`}</code></div>`;
  } else {
    decisionHtml = `<div class="valid3302-decision"><small>${vi ? "MỤC TIÊU" : "GOAL"}</small><strong>${vi ? "Mảng chỉ số nhỏ nhất, không phải chuỗi nhỏ nhất" : "Smallest index array, not the smallest formed string"}</strong></div>`;
  }

  $("treeView").innerHTML = `<div class="valid3302-viz">
    <div class="valid3302-phases">${phases}</div>
    <div class="valid3302-rule"><strong>VALID</strong><span>indices ↑ · selected string differs from word2 at ≤ 1 position</span></div>
    <section class="valid3302-section"><header><strong>WORD1 · SOURCE INDICES</strong><span>${vi ? "chọn từ trái sang phải" : "select left to right"}</span></header><div class="valid3302-row">${word1Html}</div></section>
    <section class="valid3302-section"><header><strong>WORD2 · TARGET</strong><span>${vi ? "mỗi ô cần một chỉ số" : "one source index per cell"}</span></header><div class="valid3302-row target">${word2Html}</div></section>
    <section class="valid3302-section suffix"><header><strong>RIGHTMOST SUFFIX FEASIBILITY</strong><span>suffix[j] → word2[j:] exact</span></header><div class="valid3302-suffix-row">${suffixHtml}</div></section>
    <div class="valid3302-status">${couponHtml}<div class="valid3302-answer"><small>ANSWER INDICES</small><div>${answerHtml}</div><span>${selectedString ? `formed = "${escapeHtml(selectedString)}"` : "formed = \"\""}</span></div></div>
    ${decisionHtml}
    <div class="valid3302-legend"><span><i class="pointer"></i>${vi ? "con trỏ hiện tại" : "current pointer"}</span><span><i class="exact"></i>exact</span><span><i class="mismatch"></i>mismatch</span><span><i class="suffix"></i>suffix position</span></div>
  </div>`;
}

function renderLongestDuplicateView(step) {
  const view = step.longestDupView || {};
  const vi = lang === "vi";
  const source = String(view.s || "");
  const chars = Array.isArray(view.chars) ? view.chars : [...String(view.s || "")];
  const windows = Array.isArray(view.windows) ? view.windows : [];
  const history = Array.isArray(view.history) ? view.history : [];
  const currentStart = Number.isInteger(view.currentStart) ? view.currentStart : -1;
  const previousStart = Number.isInteger(view.previousStart) ? view.previousStart : -1;
  const length = Number.isInteger(view.mid) ? view.mid : 0;
  const bestStart = Number.isInteger(view.bestStart) ? view.bestStart : -1;
  const bestLength = Number.isInteger(view.bestLength) ? view.bestLength : 0;
  const phaseIndex = ["intro", "choose-length"].includes(view.phase) ? 0
    : ["hash-init", "slide", "match"].includes(view.phase) ? 1
      : 2;
  const phaseLabels = vi
    ? ["1 · Chọn độ dài L", "2 · Quét Rolling Hash", "3 · Cập nhật đáp án"]
    : ["1 · Choose length L", "2 · Scan rolling hashes", "3 · Update answer"];
  const phases = phaseLabels.map((label, index) => `<span class="${index < phaseIndex ? "done" : index === phaseIndex ? "active" : ""}">${index < phaseIndex ? "✓" : ""}<b>${escapeHtml(label)}</b></span>`).join("");

  const tested = new Map(history.map((item) => [item.mid, item.found]));
  const lengthCells = Array.from({ length: Math.max(0, chars.length - 1) }, (_, index) => {
    const candidate = index + 1;
    const classes = ["ld1044-length"];
    if (candidate === view.mid) classes.push("current");
    if (tested.has(candidate)) classes.push(tested.get(candidate) ? "feasible" : "infeasible");
    if (candidate < view.lo || candidate > view.hi) classes.push("outside");
    return `<span class="${classes.join(" ")}"><small>L</small><strong>${candidate}</strong></span>`;
  }).join("");

  const charCells = chars.map((char, index) => {
    const inCurrent = length > 0 && index >= currentStart && index < currentStart + length;
    const inPrevious = length > 0 && index >= previousStart && index < previousStart + length;
    const inBest = bestLength > 0 && index >= bestStart && index < bestStart + bestLength;
    const classes = ["ld1044-char"];
    if (inBest) classes.push("best");
    if (inCurrent) classes.push("current");
    if (inPrevious) classes.push("previous");
    return `<span class="${classes.join(" ")}"><small>${index}</small><strong>${escapeHtml(char)}</strong><em>${inCurrent ? "B" : inPrevious ? "A" : ""}</em></span>`;
  }).join("");

  let hashDetail = `<div class="ld1044-hash idle"><small>${vi ? "ROLLING HASH" : "ROLLING HASH"}</small><strong>hash(window)</strong><span>${vi ? "Chọn L trước khi bắt đầu quét" : "Choose L before scanning"}</span></div>`;
  if (view.phase === "hash-init") {
    hashDetail = `<div class="ld1044-hash"><small>${vi ? "HASH CỬA SỔ ĐẦU" : "FIRST WINDOW HASH"}</small><strong>h = ${escapeHtml(String(view.currentHash))}</strong><span>power = ${view.base}<sup>${view.mid}</sup> mod ${view.mod} = ${escapeHtml(String(view.power))}</span></div>`;
  } else if (["slide", "match"].includes(view.phase)) {
    const state = view.decision === "found" ? "success" : view.decision === "collision" ? "collision" : "";
    hashDetail = `<div class="ld1044-hash ${state}"><small>${vi ? "CÔNG THỨC TRƯỢT" : "ROLLING FORMULA"}</small><strong>h' = (h × ${view.base} − '${escapeHtml(view.outgoing)}' × power + '${escapeHtml(view.incoming)}') mod M</strong><span>${escapeHtml(String(view.previousHash))} → ${escapeHtml(String(view.currentHash))}</span></div>`;
  }

  const visibleWindows = windows.slice(-12);
  const hiddenCount = windows.length - visibleWindows.length;
  const windowRows = visibleWindows.map((item) => {
    const isCurrent = item.start === currentStart;
    const isPrevious = item.start === previousStart;
    const classes = [item.status || "seen"];
    if (isCurrent) classes.push("current");
    if (isPrevious) classes.push("previous");
    const status = isPrevious ? "MATCH A" : isCurrent && view.decision === "found" ? "MATCH B" : item.status === "collision" ? "COLLISION" : isCurrent ? "CURRENT" : "SEEN";
    return `<tr class="${classes.join(" ")}"><td>${item.start}</td><td><code>"${escapeHtml(item.text)}"</code></td><td><code>${escapeHtml(String(item.hash))}</code></td><td><span>${status}</span></td></tr>`;
  }).join("");
  const windowsTable = windows.length
    ? `<div class="ld1044-table-wrap"><table class="ld1044-table"><thead><tr><th>start</th><th>substring</th><th>hash</th><th>state</th></tr></thead><tbody>${hiddenCount > 0 ? `<tr><td colspan="4">… ${hiddenCount} ${vi ? "cửa sổ trước" : "earlier windows"}</td></tr>` : ""}${windowRows}</tbody></table></div>`
    : `<div class="ld1044-empty">${vi ? "Chưa tạo cửa sổ hash" : "No hash window yet"}</div>`;

  const historyRows = history.map((item) => `<tr><td>${item.round}</td><td>[${item.lo}, ${item.hi}]</td><td>${item.mid}</td><td><b class="${item.found ? "yes" : "no"}">${item.found ? (vi ? "CÓ" : "YES") : (vi ? "KHÔNG" : "NO")}</b></td><td>[${item.nextLo}, ${item.nextHi}]</td></tr>`).join("");
  const historyTable = historyRows
    ? `<table class="ld1044-history"><thead><tr><th>#</th><th>[lo, hi]</th><th>mid</th><th>dup?</th><th>${vi ? "khoảng mới" : "next range"}</th></tr></thead><tbody>${historyRows}</tbody></table>`
    : `<div class="ld1044-empty">${vi ? "Chưa có quyết định binary search" : "No binary-search decision yet"}</div>`;
  const bestText = bestLength > 0 ? source.slice(bestStart, bestStart + bestLength) : "";
  const decisionText = view.decision === "longer" ? (vi ? "Có duplicate → lo = mid + 1" : "Duplicate found → lo = mid + 1")
    : view.decision === "shorter" ? (vi ? "Không có duplicate → hi = mid − 1" : "No duplicate → hi = mid − 1")
      : view.decision === "found" ? (vi ? "Hash trùng + chuỗi trùng → tìm thấy" : "Same hash + same text → found")
        : (vi ? "Đang kiểm tra" : "Checking");

  $("treeView").innerHTML = `<div class="ld1044-viz">
    <div class="ld1044-phases">${phases}</div>
    <section class="ld1044-bounds"><header><strong>BINARY SEARCH · LENGTH</strong><span>lo=${view.lo} · hi=${view.hi}${view.mid === null ? "" : ` · mid=${view.mid}`}</span></header><div>${lengthCells}</div></section>
    <section class="ld1044-string"><header><strong>s = "${escapeHtml(view.s || "")}"</strong><span>${vi ? "A/B là hai lần xuất hiện được xác nhận" : "A/B are the confirmed occurrences"}</span></header><div class="ld1044-char-row">${charCells}</div></section>
    <div class="ld1044-main">${hashDetail}<div class="ld1044-best"><small>BEST SO FAR</small><strong>"${escapeHtml(bestText)}"</strong><span>start=${bestStart} · length=${bestLength}</span></div></div>
    <section class="ld1044-section"><header><strong>${vi ? "CÁC CỬA SỔ ĐÃ QUÉT · L=" : "SCANNED WINDOWS · L="}${view.mid ?? "—"}</strong><span>${escapeHtml(decisionText)}</span></header>${windowsTable}</section>
    <section class="ld1044-section history"><header><strong>${vi ? "NHẬT KÝ BINARY SEARCH" : "BINARY SEARCH LOG"}</strong><span>${vi ? "CÓ → sang phải · KHÔNG → sang trái" : "YES → right · NO → left"}</span></header>${historyTable}</section>
  </div>`;
}

// ---- Render a single step ----
function renderAutocompleteView(step) {
  const view = step.autocompleteView || {};
  const vi = lang === "vi";
  const showChar = (char) => char === " " ? "␠" : char === "#" ? "#" : char;
  const displayPrefix = (value) => String(value || "").replace(/ /g, "␠");
  const phases = [
    vi ? "1 · Build Trie + cache" : "1 · Build Trie + cache",
    vi ? "2 · Debug từng input(c)" : "2 · Debug each input(c)",
    vi ? "3 · Commit và cập nhật" : "3 · Commit and update",
  ];
  const phaseRank = view.phase === "init" ? 0 : view.phase === "commit" ? 2 : 1;
  const phasesHtml = phases.map((label, index) => {
    const state = view.phase === "done" || index < phaseRank ? "done" : index === phaseRank ? "active" : "";
    return `<span class="${state}">${escapeHtml(label)}</span>`;
  }).join("");
  const stageLabels = {
    "init-empty": ["INIT", vi ? "Tạo root rỗng" : "Create empty root"],
    "build-sentence": ["BUILD", vi ? "Chèn một câu lịch sử" : "Insert one historical sentence"],
    "read-char": ["INPUT · 1/3", vi ? "Đọc ký tự và giữ nguyên node" : "Read character and keep current node"],
    "follow-edge": ["INPUT · 2/3", vi ? "Lookup cạnh children[c]" : "Look up children[c] edge"],
    "return-hot": ["INPUT · 3/3", vi ? "Đọc cache và trả kết quả" : "Read cache and return result"],
    "commit-detect": ["COMMIT · 1/3", vi ? "Nhận diện câu hoàn chỉnh" : "Identify completed sentence"],
    "commit-update": ["COMMIT · 2/3", vi ? "Cập nhật frequency và cache" : "Update frequency and caches"],
    "commit-reset": ["COMMIT · 3/3", vi ? "Reset về root" : "Reset to root"],
    done: ["DONE", vi ? "Hoàn tất input stream" : "Input stream complete"],
  };
  const [stageCode, stageText] = stageLabels[view.stage] || ["DEBUG", vi ? "Kiểm tra trạng thái" : "Inspect state"];
  const typedHtml = (view.typedChars || []).map((char, index) => {
    const classes = ["ac642-char"];
    if (index < view.charIndex || view.phase === "done") classes.push("done");
    else if (index === view.charIndex) classes.push(char === "#" ? "commit" : "active");
    return `<span class="${classes.join(" ")}"><small>${index}</small><strong>${escapeHtml(showChar(char))}</strong><em>${char === " " ? "space" : char === "#" ? "commit" : "char"}</em></span>`;
  }).join("") || `<span class="ac642-empty">${vi ? "Không có ký tự" : "No input characters"}</span>`;

  const historyHtml = (view.history || []).map((item) => `<div><strong>${escapeHtml(item.sentence)}</strong><span>${escapeHtml(item.count)}</span></div>`).join("") || `<div class="ac642-empty">${vi ? "Chưa chèn câu nào" : "No sentences inserted yet"}</div>`;
  const triePathHtml = (view.triePath || []).map((item, index, path) => {
    const label = item.char === "ROOT" ? "ROOT" : showChar(item.char);
    const classes = ["ac642-trie-node"];
    if (!item.found) classes.push("missing");
    if (index === path.length - 1) classes.push("current");
    const cache = item.hot && item.hot.length ? item.hot.map((sentence) => `“${sentence}”`).join(" · ") : "[]";
    return `${index ? `<i class="ac642-edge">→</i>` : ""}<div class="${classes.join(" ")}"><small>${escapeHtml(label)}</small><strong>${item.prefix ? `“${escapeHtml(displayPrefix(item.prefix))}”` : "prefix = empty"}</strong><em>hot[3]: ${escapeHtml(cache)}</em></div>`;
  }).join("");
  const childrenHtml = (view.nodeChildren || []).map((child) => `<div class="ac642-child"><b>${escapeHtml(showChar(child.char))}</b><span>→ “${escapeHtml(displayPrefix(child.prefix))}”</span><em>${escapeHtml(child.hot.slice(0, 3).join(" · ") || "hot=[]")}</em></div>`).join("") || `<div class="ac642-empty">${view.nodeFound ? (vi ? "Node lá · không có children" : "Leaf node · no children") : "node = None"}</div>`;
  const candidatesHtml = (view.candidates || []).map((candidate) => `<div class="ac642-candidate selected">
    <b>#${candidate.rank}</b><strong>${escapeHtml(candidate.sentence)}</strong><span>${escapeHtml(candidate.count)}×</span><em>key = ${escapeHtml(candidate.score)}${candidate.tiedWithPrevious ? (vi ? " · hòa count → A–Z" : " · count tie → A–Z") : ""}</em>
  </div>`).join("") || `<div class="ac642-no-match">${view.nodeFound ? (vi ? "Cache hot[3] đang rỗng" : "hot[3] cache is empty") : (vi ? `Không có node cho prefix “${escapeHtml(displayPrefix(view.inspectPrefix))}”` : `No node for prefix “${escapeHtml(displayPrefix(view.inspectPrefix))}”`)}</div>`;
  const returnReady = ["return-hot", "commit-detect", "commit-update", "commit-reset", "done"].includes(view.stage);
  const suggestionSlots = Array.from({ length: 3 }, (_, index) => {
    const sentence = (view.suggestions || [])[index];
    return `<div class="ac642-slot ${sentence ? "filled" : "empty"}"><b>${index + 1}</b><span>${sentence ? escapeHtml(sentence) : returnReady ? "—" : (vi ? "chờ return" : "waiting")}</span></div>`;
  }).join("");
  const cacheUpdatesHtml = (view.cacheUpdates || []).map((update) => {
    const before = update.before.length ? update.before.join(" · ") : "[]";
    const after = update.after.length ? update.after.join(" · ") : "[]";
    const label = update.prefix ? `“${displayPrefix(update.prefix)}”` : "ROOT";
    return `<div class="ac642-cache-row ${update.changed ? "changed" : "unchanged"}"><strong>${escapeHtml(label)}</strong><code>${escapeHtml(before)}</code><i>→</i><code>${escapeHtml(after)}</code><span>${update.changed ? (vi ? "ĐỔI" : "CHANGED") : (vi ? "GIỮ NGUYÊN" : "SAME")}</span></div>`;
  }).join("");

  const edgePending = view.stage === "read-char";
  const hasEdgeProbe = view.edgeChar !== undefined && view.edgeChar !== "";
  const edgeState = edgePending ? "pending" : view.edgeFound ? "found" : "missing";
  const edgeResult = edgePending
    ? (vi ? "chưa lookup" : "not looked up yet")
    : view.edgeFound ? `TrieNode(“${displayPrefix(String(view.edgeFromPrefix || "") + String(view.edgeChar || ""))}”)` : "None";
  const prefixDisplay = displayPrefix(view.prefix);
  const beforeDisplay = displayPrefix(view.prefixBefore);
  let operationCode = `prefix = “${prefixDisplay}”`;
  if (view.stage === "build-sentence") operationCode = `_add(“${view.sentenceBeingAdded}”, ${view.countAfter - view.countBefore})`;
  else if (view.stage === "read-char") operationCode = `c = '${showChar(view.inputChar)}'`;
  else if (view.stage === "follow-edge") operationCode = `node.children.get('${showChar(view.inputChar)}') → ${view.nodeFound ? "node" : "None"}`;
  else if (view.stage === "return-hot") operationCode = `return ${view.nodeFound ? "node.hot[:]" : "[]"}`;
  else if (view.stage && view.stage.startsWith("commit")) operationCode = `input('#') · “${displayPrefix(view.committedSentence)}”`;
  const isBuildStage = view.phase === "init";
  const isTypingStage = ["read-char", "follow-edge", "return-hot"].includes(view.stage);
  const isCommitStage = view.phase === "commit";
  const showHistory = isBuildStage || view.stage === "commit-update";
  const showRanking = view.stage !== "init-empty";
  const showReturn = isTypingStage || ["commit-detect", "commit-reset", "done"].includes(view.stage);
  const visibleCards = [showHistory, showRanking, showReturn].filter(Boolean).length;
  const summary = vi
    ? `Debug Trie bước ${stageCode}, prefix ${prefixDisplay || "rỗng"}, node ${view.nodeFound ? "tồn tại" : "không tồn tại"}.`
    : `Trie debug stage ${stageCode}, prefix ${prefixDisplay || "empty"}, node ${view.nodeFound ? "exists" : "is missing"}.`;

  $("treeView").innerHTML = `<section class="ac642-viz" role="img" aria-label="${escapeHtml(summary)}">
    <div class="ac642-phases">${phasesHtml}</div>
    <section class="ac642-stage ${escapeHtml(view.stage || "inspect")}"><b>${escapeHtml(stageCode)}</b><strong>${escapeHtml(stageText)}</strong><span>${escapeHtml(pick(view.decision) || "—")}</span></section>
    ${isBuildStage ? `<section class="ac642-build-focus"><div><small>${vi ? "CÂU ĐANG CHÈN" : "INSERTING SENTENCE"}</small><strong>${view.sentenceBeingAdded ? `“${escapeHtml(view.sentenceBeingAdded)}”` : (vi ? "Khởi tạo root" : "Initialize root")}</strong></div><div><small>FREQUENCY</small><strong>${view.sentenceBeingAdded ? `${escapeHtml(view.countBefore)} → ${escapeHtml(view.countAfter)}` : "—"}</strong></div><div><small>${vi ? "NODE CẬP NHẬT" : "UPDATED NODES"}</small><strong>${(view.cacheUpdates || []).length}</strong></div></section>` : ""}
    ${!isBuildStage ? `<section class="ac642-input"><header><strong>INPUT STREAM</strong><span>␠ = space · # = commit</span></header><div>${typedHtml}</div></section>` : ""}
    <section class="ac642-action ${escapeHtml(view.action || "inspect")}"><span>EXECUTE</span><strong>${escapeHtml(operationCode)}</strong>${!isBuildStage ? `<code>before “${escapeHtml(beforeDisplay)}” → now “${escapeHtml(prefixDisplay)}”</code>` : ""}</section>
    ${isTypingStage ? `<div class="ac642-debug-grid">
      <section class="ac642-probe ${hasEdgeProbe ? edgeState : "idle"}"><header><strong>EDGE PROBE</strong><span>O(1) average</span></header>${hasEdgeProbe ? `<div><small>FROM</small><code>${view.edgeFromPrefix ? `“${escapeHtml(displayPrefix(view.edgeFromPrefix))}”` : "ROOT"}</code><i>children[ '${escapeHtml(showChar(view.edgeChar))}' ]</i><b>→ ${escapeHtml(edgeResult)}</b></div>` : `<div class="ac642-empty">${vi ? "Chưa có ký tự để lookup" : "No character to look up yet"}</div>`}</section>
      <section class="ac642-inspector ${view.nodeFound ? "found" : "missing"}"><header><strong>NODE INSPECTOR</strong><span>${view.nodeFound ? "TrieNode" : "None"}</span></header><div class="ac642-inspector-head"><small>PREFIX</small><code>${view.inspectPrefix ? `“${escapeHtml(displayPrefix(view.inspectPrefix))}”` : "ROOT"}</code><small>CHILDREN</small><b>${(view.nodeChildren || []).length}</b><small>HOT SIZE</small><b>${(view.nodeHot || []).length}/3</b></div><div class="ac642-children">${childrenHtml}</div></section>
    </div>` : ""}
    ${isCommitStage ? `<section class="ac642-commit"><span># END SENTENCE</span><strong>“${escapeHtml(view.committedSentence)}”</strong><div><code>${escapeHtml(view.countBefore)}</code><b>→ +${view.countAfter - view.countBefore} →</b><code>${escapeHtml(view.countAfter)}</code></div><em>${view.stage === "commit-reset" ? "prefix = '' · node = root" : "return []"}</em></section>` : ""}
    <section class="ac642-trie"><header><strong>${isBuildStage ? (vi ? "ĐƯỜNG CHÈN VÀO TRIE" : "TRIE INSERT PATH") : (vi ? "ĐƯỜNG TRIE ĐANG INSPECT" : "INSPECTED TRIE PATH")}</strong><span>ROOT → prefix</span></header><div>${triePathHtml}</div></section>
    ${cacheUpdatesHtml ? `<section class="ac642-cache-updates"><header><strong>CACHE UPDATE · hot[3]</strong><span>${vi ? "chỉ xem trước → sau" : "before → after"}</span></header><div>${cacheUpdatesHtml}</div></section>` : ""}
    ${isTypingStage ? `<section class="ac642-rule"><span><b>1</b> read c</span><i>→</i><span><b>2</b> children[c]</span><i>→</i><span><b>3</b> inspect hot[3]</span><i>→</i><span><b>4</b> return copy</span></section>` : ""}
    ${visibleCards ? `<div class="ac642-layout cards-${visibleCards}">
      ${showHistory ? `<section class="ac642-card history"><header><strong>${vi ? "TẦN SUẤT" : "FREQUENCIES"}</strong><span>sentence → count</span></header><div>${historyHtml}</div></section>` : ""}
      ${showRanking ? `<section class="ac642-card ranking"><header><strong>${vi ? "HOT[3] TẠI NODE" : "NODE HOT[3]"}</strong><span>(-count, sentence)</span></header><div>${candidatesHtml}</div></section>` : ""}
      ${showReturn ? `<section class="ac642-card top"><header><strong>RETURN VALUE</strong><span>${returnReady ? "ready" : "not executed"}</span></header><div>${suggestionSlots}</div></section>` : ""}
    </div>` : ""}
  </section>`;
}

function renderFileSystemView(step) {
  const view = step.fileSystemView || {};
  const vi = lang === "vi";
  const formatResult = (value) => {
    if (value === undefined) return "—";
    if (value === null) return "None";
    if (Array.isArray(value)) return `[${value.map((item) => `"${item}"`).join(", ")}]`;
    return `"${String(value)}"`;
  };
  const phases = [
    { key: "parse", label: vi ? "1 · Tách đường dẫn" : "1 · Split path" },
    { key: "navigate", label: vi ? "2 · Đi trên Trie" : "2 · Walk Trie" },
    { key: "result", label: vi ? "3 · Thực hiện / trả về" : "3 · Execute / return" },
  ];
  const phaseRank = view.phase === "parse" ? 0 : view.phase === "navigate" ? 1 : 2;
  const phaseHtml = phases.map((phase, index) => `<span class="${index === phaseRank ? "active" : index < phaseRank ? "done" : ""}">${escapeHtml(phase.label)}</span>`).join("");

  const operationHtml = (view.operations || []).map((operation, index) => {
    const classes = [];
    if (view.phase === "done" || index < view.operationIndex) classes.push("done");
    else if (index === view.operationIndex) classes.push("active");
    return `<span class="${classes.join(" ")}"><small>#${index + 1}</small><strong>${escapeHtml(operation)}</strong></span>`;
  }).join("") || `<span class="empty">${vi ? "Không có thao tác" : "No operations"}</span>`;

  const createdIndexes = new Set(view.createdPartIndexes || []);
  const pathParts = Array.isArray(view.parts) ? view.parts : [];
  const pathHtml = [
    `<span class="fs588-segment root ${pathParts.length === 0 ? "active" : "done"}"><small>root</small><strong>/</strong><em>folder</em></span>`,
    ...pathParts.map((part, index) => {
      const classes = ["fs588-segment"];
      if (index < view.partIndex) classes.push("done");
      if (index === view.partIndex) classes.push("active");
      if (createdIndexes.has(index)) classes.push("created");
      const terminalType = index === pathParts.length - 1 ? view.entryType : "directory";
      return `<i>→</i><span class="${classes.join(" ")}"><small>part[${index}]</small><strong>${escapeHtml(part)}</strong><em>${terminalType === "file" ? "file" : "folder"}${createdIndexes.has(index) ? " · NEW" : ""}</em></span>`;
    }),
  ].join("");

  const node = view.currentNode;
  const nodeIcon = node && node.type === "file" ? "📄" : "📁";
  const childrenHtml = node && node.children && node.children.length
    ? node.children.map((child) => `<span>${escapeHtml(child)}</span>`).join("")
    : `<span class="empty">∅</span>`;
  const content = node && node.type === "file" ? String(node.content ?? "") : "";
  const detailHtml = node
    ? `<div class="fs588-node-head"><b>${nodeIcon}</b><div><small>${node.type === "file" ? "FILE" : "FOLDER"}</small><strong>${escapeHtml(node.name)}</strong></div></div>
       <div class="fs588-node-data"><span>${node.type === "file" ? "content" : "children"}</span>${node.type === "file" ? `<code>"${escapeHtml(content)}"</code><small>${content.length} char${content.length === 1 ? "" : "s"}</small>` : `<div>${childrenHtml}</div><small>${node.children.length} item${node.children.length === 1 ? "" : "s"}</small>`}</div>`
    : `<div class="fs588-node-missing"><b>!</b><strong>${vi ? "Không tìm thấy node" : "Node not found"}</strong></div>`;

  const actionLabels = {
    init: vi ? "KHỞI TẠO ROOT" : "INITIALIZE ROOT",
    split: vi ? "PATH → SEGMENTS" : "PATH → SEGMENTS",
    reuse: vi ? "NODE ĐÃ CÓ → DÙNG LẠI" : "NODE EXISTS → REUSE",
    "create-directory": vi ? "THIẾU NODE → TẠO FOLDER" : "MISSING NODE → CREATE FOLDER",
    "create-file": vi ? "THIẾU NODE → TẠO FILE" : "MISSING NODE → CREATE FILE",
    "mkdir-done": "MKDIR COMPLETE",
    write: vi ? "APPEND CONTENT" : "APPEND CONTENT",
    read: vi ? "ĐỌC CONTENT" : "READ CONTENT",
    list: vi ? "LIỆT KÊ VÀ SORT" : "LIST AND SORT",
    missing: vi ? "ĐƯỜNG DẪN KHÔNG TỒN TẠI" : "PATH NOT FOUND",
    invalid: vi ? "LỆNH KHÔNG HỢP LỆ" : "INVALID OPERATION",
    done: vi ? "HOÀN TẤT" : "COMPLETE",
  };
  const actionClass = ["create-directory", "create-file", "write", "read", "list", "missing", "invalid", "done"].includes(view.action) ? view.action : "";
  const isWriting = view.action === "write";
  const summary = vi
    ? `File System: ${view.rawOperation}. ${view.directories} folder và ${view.files} file.`
    : `File System: ${view.rawOperation}. ${view.directories} folders and ${view.files} files.`;

  $("treeView").innerHTML = `<section class="fs588-viz" role="img" aria-label="${escapeHtml(summary)}">
    <div class="fs588-phases">${phaseHtml}</div>
    <section class="fs588-operations"><header><strong>OPERATIONS</strong><span>${vi ? "cam = đang chạy · xanh = hoàn tất" : "amber = active · green = complete"}</span></header><div>${operationHtml}</div></section>
    <section class="fs588-action ${actionClass} ${view.valid === false ? "failure" : ""}"><span>${escapeHtml(actionLabels[view.action] || "FILE SYSTEM")}</span><strong>${escapeHtml(pick(view.decision) || "—")}</strong><code>${escapeHtml(view.rawOperation || "FileSystem()")}</code></section>
    <section class="fs588-path"><header><strong>PATH = "${escapeHtml(view.path || "/")}"</strong><span>${vi ? "đọc từ trái sang phải" : "walk left to right"}</span></header><div>${pathHtml}</div></section>
    <div class="fs588-layout">
      <section class="fs588-tree-card"><header><strong>${vi ? "CẤU TRÚC FILE SYSTEM" : "FILE SYSTEM STRUCTURE"}</strong><span>${vi ? "folder = xanh dương · file = vòng xanh lá · cam = đang xét" : "folder = blue · file = green ring · amber = current"}</span></header><div id="fs588Tree" class="fs588-tree"></div><footer><span>📁 ${view.directories} folder</span><span>📄 ${view.files} file</span></footer></section>
      <aside class="fs588-side">
        <section class="fs588-current"><header><strong>${vi ? "CHỈ XEM NODE ĐANG XÉT" : "CURRENT NODE ONLY"}</strong><span>${escapeHtml(node ? node.type : "missing")}</span></header>${detailHtml}</section>
        ${isWriting ? `<section class="fs588-append"><span>APPEND, NOT OVERWRITE</span><div><code>"${escapeHtml(view.contentBefore ?? "")}"</code><b>+</b><code>"${escapeHtml(view.appendedContent || "")}"</code><b>=</b><code class="after">"${escapeHtml(view.contentAfter ?? "")}"</code></div></section>` : ""}
        <section class="fs588-return ${view.valid === false ? "failure" : view.phase === "result" || view.phase === "done" ? "success" : ""}"><span>RETURN / RESULT</span><strong>${escapeHtml(formatResult(view.result))}</strong><small>${view.action === "list" ? (vi ? "folder → sort children · file → [name]" : "folder → sort children · file → [name]") : view.action === "read" ? "return node.content" : view.action === "write" ? "content += new_content" : "—"}</small></section>
      </aside>
    </div>
  </section>`;
  renderTree(step, "fs588Tree");
}

function renderWordSearchIIView(step) {
  const view = step.wordSearchIIView || {};
  const vi = lang === "vi";
  const phases = [
    { key: "build", label: vi ? "1 · Xây Trie" : "1 · Build Trie" },
    { key: "search", label: vi ? "2 · DFS trên Board" : "2 · DFS Board" },
    { key: "done", label: vi ? "3 · Kết quả" : "3 · Result" },
  ];
  const phaseRank = view.phase === "build" ? 0 : view.phase === "done" ? 2 : 1;
  const phaseHtml = phases.map((phase, index) => `<span class="${index === phaseRank ? "active" : index < phaseRank ? "done" : ""}">${escapeHtml(phase.label)}</span>`).join("");
  const pathMap = new Map((view.path || []).map((cell, index) => [`${cell.r},${cell.c}`, { ...cell, order: index + 1 }]));
  const sameCell = (cell, r, c) => cell && cell.r === r && cell.c === c;
  const foundSet = new Set(view.found || []);
  const prefix = String(view.prefix || "");

  const wordsHtml = (view.words || []).map((word) => {
    const classes = [];
    if (foundSet.has(word)) classes.push("found");
    else if (prefix && word.startsWith(prefix)) classes.push("candidate");
    return `<span class="${classes.join(" ")}">${foundSet.has(word) ? "✓ " : ""}${escapeHtml(word)}</span>`;
  }).join("") || `<span class="empty">${vi ? "Không có words" : "No words"}</span>`;

  const boardRows = Array.isArray(view.board) ? view.board : [];
  const boardHtml = boardRows.length ? boardRows.flatMap((row, r) => Array.from({ length: view.cols || row.length }, (_, c) => {
    if (c >= row.length) return `<div class="ws212-cell empty" aria-hidden="true"></div>`;
    const pathCell = pathMap.get(`${r},${c}`);
    const classes = ["ws212-cell"];
    const isMarked = row[c] === "#";
    let state = "";
    if (pathCell) {
      classes.push(view.action === "found" ? "found-path" : "in-path");
      state = `${vi ? "bước" : "step"} ${pathCell.order}`;
    }
    if (isMarked) {
      classes.push("marked");
      state = vi ? "đã khóa bằng #" : "locked with #";
    }
    if (sameCell(view.current, r, c)) {
      classes.push("current");
      state = view.action === "mark"
        ? (vi ? "board[r][c] = '#'" : "board[r][c] = '#'")
        : (vi ? "đang đứng" : "current");
    }
    if (sameCell(view.candidate, r, c) && view.action === "prune") {
      classes.push("pruned");
      state = vi ? "bị cắt" : "pruned";
    }
    if (sameCell(view.restored, r, c)) {
      classes.push("restored");
      state = vi ? "khôi phục ký tự" : "character restored";
    }
    return `<div class="${classes.join(" ")}"><small>(${r},${c})</small><strong>${escapeHtml(row[c])}</strong><span>${escapeHtml(state)}</span>${pathCell ? `<b>${pathCell.order}</b>` : ""}</div>`;
  })).join("") : `<div class="ws212-empty">${vi ? "Board rỗng" : "Empty board"}</div>`;

  const pathHtml = (view.path || []).length
    ? view.path.map((cell, index) => `<span><small>${index + 1}</small><strong>${escapeHtml(cell.char)}</strong><em>(${cell.r},${cell.c})</em></span>`).join("<i>→</i>")
    : `<span class="empty">∅</span>`;
  const childrenHtml = (view.trieChildren || []).length
    ? view.trieChildren.map((char) => `<span class="${char === view.needed ? "missing" : ""}">'${escapeHtml(char)}'</span>`).join("")
    : `<span class="empty">∅</span>`;
  const stackHtml = (view.callStack || []).length
    ? view.callStack.map((frame, index) => `<li class="${index === view.callStack.length - 1 ? "active" : ""}"><span>#${index + 1}</span><strong>dfs(${frame.r}, ${frame.c})</strong><small>prefix = "${escapeHtml(frame.prefix)}"</small><em>${escapeHtml(frame.direction)}</em></li>`).join("")
    : `<li class="empty">${vi ? "Call stack rỗng" : "Empty call stack"}</li>`;
  const resultHtml = (view.found || []).length
    ? view.found.map((word) => `<span>✓ ${escapeHtml(word)}</span>`).join("")
    : `<span class="empty">[]</span>`;

  const actionLabels = {
    build: vi ? "GỘP PREFIX CHUNG" : "MERGE SHARED PREFIXES",
    start: vi ? "BẮT ĐẦU DFS" : "START DFS",
    match: vi ? "MATCH · ĐI TIẾP" : "MATCH · CONTINUE",
    mark: vi ? "VISITED · ĐÁNH DẤU #" : "VISITED · MARK WITH #",
    prune: vi ? "PRUNE · RETURN NGAY" : "PRUNE · RETURN NOW",
    found: vi ? "FOUND · THÊM KẾT QUẢ" : "FOUND · ADD RESULT",
    backtrack: vi ? "BACKTRACK · KHÔI PHỤC" : "BACKTRACK · RESTORE",
    done: vi ? "HOÀN TẤT" : "COMPLETE",
  };
  const actionClass = ["mark", "prune", "found", "backtrack", "done"].includes(view.action) ? view.action : "";
  const moveText = view.candidate
    ? `${view.direction || "start"} (${view.candidate.r},${view.candidate.c}) = '${boardRows[view.candidate.r]?.[view.candidate.c] || ""}'`
    : (vi ? "chưa chọn ô" : "no cell selected");
  const summary = vi
    ? `Word Search II: prefix ${prefix || "rỗng"}, đã tìm ${foundSet.size} từ.`
    : `Word Search II: prefix ${prefix || "empty"}, found ${foundSet.size} words.`;

  $("treeView").innerHTML = `<section class="ws212-viz" role="img" aria-label="${escapeHtml(summary)}">
    <div class="ws212-phases">${phaseHtml}</div>
    <section class="ws212-words"><header><strong>WORDS / TERMINAL NODES</strong><span>${vi ? "xanh = đã tìm · cam = còn khớp prefix" : "green = found · amber = matches prefix"}</span></header><div>${wordsHtml}</div></section>
    <div class="ws212-action ${actionClass}"><span>${escapeHtml(actionLabels[view.action] || "DFS")}</span><strong>${escapeHtml(pick(view.decision) || "—")}</strong><code>${escapeHtml(moveText)}</code></div>
    <div class="ws212-layout">
      <section class="ws212-card board"><header><strong>BOARD</strong><span>${vi ? "số = thứ tự trong path" : "number = path order"}</span></header><div class="ws212-board" style="grid-template-columns: repeat(${Math.max(1, view.cols || 1)}, minmax(48px, 62px))">${boardHtml}</div></section>
      <section class="ws212-card trie"><header><strong>TRIE · PREFIX "${escapeHtml(prefix)}"</strong><span>${vi ? "cam = đường đồng bộ với board · vòng xanh = cuối từ" : "amber = board-synced path · green ring = word end"}</span></header><div id="ws212Trie" class="ws212-trie"></div></section>
    </div>
    <div class="ws212-bottom">
      <section class="ws212-state"><div><span>PREFIX</span><strong>"${escapeHtml(prefix)}"</strong></div><div><span>${vi ? "TRIE CÓ THỂ ĐI" : "TRIE CAN FOLLOW"}</span><p>${childrenHtml}</p></div><div><span>${vi ? "MOVE ĐANG THỬ" : "MOVE BEING TRIED"}</span><strong>${escapeHtml(moveText)}</strong></div></section>
      <section class="ws212-stack"><header><strong>DFS CALL STACK</strong><span>${vi ? "frame cuối đang chạy" : "last frame is active"}</span></header><ol>${stackHtml}</ol></section>
    </div>
    <section class="ws212-path"><b>BOARD PATH</b><div>${pathHtml}</div></section>
    <section class="ws212-result ${view.action === "done" ? "done" : ""}"><b>RESULT</b><div>${resultHtml}</div><strong>${foundSet.size}/${(view.words || []).length}</strong></section>
    <div class="ws212-legend"><span><i class="path"></i>${vi ? "path hợp lệ" : "valid path"}</span><span><i class="current"></i>${vi ? "ô hiện tại" : "current cell"}</span><span><i class="pruned"></i>Trie prune</span><span><i class="restored"></i>backtrack</span></div>
  </section>`;
  renderTree(step, "ws212Trie");
}

function renderWordDictionaryView(step) {
  const view = step.wordDictionaryView || {};
  const vi = lang === "vi";
  const phases = [
    { key: "build", label: vi ? "1 · Xây Trie" : "1 · Build Trie" },
    { key: "search", label: vi ? "2 · DFS tìm kiếm" : "2 · DFS search" },
    { key: "done", label: vi ? "3 · Kết quả" : "3 · Result" },
  ];
  const phaseRank = view.phase === "build" ? 0 : view.phase === "done" ? 2 : 1;
  const phaseHtml = phases.map((phase, index) => `<span class="${index === phaseRank ? "active" : index < phaseRank ? "done" : ""}">${escapeHtml(phase.label)}</span>`).join("");
  const wordsHtml = (view.words || []).map((word, index) => {
    const cls = view.phase === "build" && index === view.wordIndex ? "active" : index < Number(view.wordIndex ?? -1) || view.phase !== "build" ? "done" : "";
    return `<span class="${cls}">${escapeHtml(word)}</span>`;
  }).join("");
  const patternHtml = [...String(view.pattern || "")].map((char, index) => {
    const classes = [char === "." ? "wildcard" : ""];
    if (index === view.patternIndex) classes.push("active");
    else if (Number.isInteger(view.patternIndex) && index < view.patternIndex) classes.push("done");
    return `<div class="wd211-char ${classes.join(" ")}"><small>${index}</small><strong>${escapeHtml(char)}</strong><em>${char === "." ? (vi ? "bất kỳ" : "any") : "exact"}</em></div>`;
  }).join("") || `<div class="wd211-empty">${vi ? "Pattern rỗng" : "Empty pattern"}</div>`;
  const stack = Array.isArray(view.callStack) ? view.callStack : [];
  const stackHtml = stack.length ? stack.map((frame, index) => `<li class="${index === stack.length - 1 ? "active" : ""}"><span>#${index + 1}</span><strong>dfs(${escapeHtml(frame.node)}, ${escapeHtml(frame.i)})</strong><small>${vi ? "còn lại" : "remaining"}: ${escapeHtml(frame.suffix)}</small><em>${escapeHtml(frame.via)}</em></li>`).join("") : `<li class="empty">${vi ? "Call stack rỗng" : "Empty call stack"}</li>`;
  const branches = Array.isArray(view.branches) ? view.branches : [];
  const tried = new Set(view.triedBranches || []);
  const branchesHtml = branches.length ? branches.map((branch) => `<span class="${branch === view.activeBranch ? "active" : tried.has(branch) ? "tried" : ""}">'${escapeHtml(branch)}'</span>`).join("") : `<span class="empty">${vi ? "không có nhánh" : "no branches"}</span>`;
  const resultText = view.result === undefined ? "—" : view.result ? "True" : "False";
  const resultClass = view.result === undefined ? "" : view.result ? "success" : "failure";
  const treeView = $("treeView");
  treeView.innerHTML = `<section class="wd211-viz">
    <div class="wd211-phases">${phaseHtml}</div>
    <section class="wd211-words"><header><strong>addWord queue</strong><span>${vi ? "xanh = đã thêm" : "green = added"}</span></header><div>${wordsHtml}</div></section>
    <div class="wd211-layout">
      <section class="wd211-tree-card"><header><strong>${vi ? "TRIE HIỆN TẠI" : "CURRENT TRIE"}</strong><span>${vi ? "vòng xanh = cuối từ · cam = đường đang xét · đỏ = nhánh thất bại" : "green ring = word end · amber = active path · red = failed branch"}</span></header><div id="wd211Tree" class="wd211-tree"></div></section>
      <aside class="wd211-side">
        <section class="wd211-pattern"><header><strong>PATTERN</strong><span>i = ${escapeHtml(view.patternIndex ?? "—")}</span></header><div>${patternHtml}</div></section>
        <section class="wd211-decision ${resultClass}"><span>${vi ? "QUYẾT ĐỊNH HIỆN TẠI" : "CURRENT DECISION"}</span><strong>${escapeHtml(view.decision || "—")}</strong><small>${vi ? "đã thử" : "tried"}: ${escapeHtml(view.triedCount || 0)} · ${vi ? "thất bại" : "failed"}: ${escapeHtml(view.failedCount || 0)}</small></section>
        <section class="wd211-branches"><header><strong>${vi ? "NHÁNH CỦA '.'" : "'.' BRANCHES"}</strong><span>${vi ? "thử từ trái sang phải" : "try left to right"}</span></header><div>${branchesHtml}</div></section>
        <section class="wd211-stack"><header><strong>DFS CALL STACK</strong><span>${vi ? "frame cuối đang chạy" : "last frame is active"}</span></header><ol>${stackHtml}</ol></section>
        <section class="wd211-result ${resultClass}"><span>RETURN / RESULT</span><strong>${escapeHtml(resultText)}</strong></section>
      </aside>
    </div>
  </section>`;
  renderTree(step, "wd211Tree");
}

function renderClearStarsView(step) {
  const view = step.clearStarsView || {};
  const chars = Array.isArray(view.chars) ? view.chars : [...String(view.s || "")];
  const removed = Array.isArray(view.removed) ? view.removed : [];
  const buckets = Array.isArray(view.buckets) ? view.buckets : [];
  const vi = lang === "vi";
  const phaseIndex = ["setup", "scan", "push"].includes(view.phase) ? 0
    : ["star", "choose"].includes(view.phase) ? 1
      : view.phase === "remove" ? 2
        : 3;
  const phaseLabels = vi
    ? ["1 · Quét & push index", "2 · Chọn chữ nhỏ nhất", "3 · Xóa bên phải nhất", "4 · Ghép kết quả"]
    : ["1 · Scan & push index", "2 · Choose smallest letter", "3 · Remove rightmost", "4 · Join result"];
  const phases = phaseLabels.map((label, index) => {
    const state = index < phaseIndex ? "done" : index === phaseIndex ? "active" : "pending";
    return `<span class="${state}">${index < phaseIndex ? "✓" : index === phaseIndex ? "▶" : "○"}<b>${escapeHtml(label)}</b></span>`;
  }).join("");

  const tape = chars.map((char, index) => {
    const classes = ["clear3170-char"];
    if (index === view.currentIndex) classes.push("current");
    if (index <= view.scannedThrough) classes.push("scanned");
    if (char === "*") classes.push("star");
    if (removed[index]) classes.push("removed");
    if (index === view.chosenIndex) classes.push("chosen");
    const state = index === view.chosenIndex
      ? (vi ? "được chọn" : "chosen")
      : removed[index]
        ? (char === "*" ? "STAR" : (vi ? "đã xóa" : "removed"))
        : index > view.scannedThrough
          ? (vi ? "chờ" : "pending")
          : (vi ? "giữ" : "keep");
    return `<span class="${classes.join(" ")}"><small>[${index}]</small><strong>${escapeHtml(char)}</strong><em>${escapeHtml(state)}</em></span>`;
  }).join("");

  const mask = chars.map((_, index) => `<span class="${removed[index] ? "on" : "off"}"><small>${index}</small><strong>${removed[index] ? "1" : "0"}</strong></span>`).join("");
  const visibleBuckets = buckets.filter((bucket) => bucket.indices.length > 0 || bucket.letter === view.chosenLetter);
  const bucketHtml = visibleBuckets.length
    ? visibleBuckets.map((bucket) => {
      const isChosen = bucket.letter === view.chosenLetter;
      const isSmallest = bucket.letter === view.smallestAvailable;
      const indices = bucket.indices.map((index, position) => {
        const isTop = position === bucket.indices.length - 1;
        return `<span class="${isTop ? "top" : ""}"><small>${isTop ? "TOP" : "index"}</small><strong>${index}</strong></span>`;
      }).join("") || `<em>${vi ? "rỗng sau pop" : "empty after pop"}</em>`;
      return `<article class="clear3170-bucket${isChosen ? " chosen" : ""}${isSmallest ? " smallest" : ""}"><header><strong>'${escapeHtml(bucket.letter)}'</strong><span>${bucket.indices.length} index</span></header><div>${indices}</div>${isSmallest ? `<b>${vi ? "NHỎ NHẤT" : "SMALLEST"}</b>` : ""}</article>`;
    }).join("")
    : `<div class="clear3170-empty">${vi ? "Chưa có ký tự khả dụng trong bucket" : "No available character in the buckets"}</div>`;

  const selectedLetter = view.chosenLetter ? `'${escapeHtml(view.chosenLetter)}'` : "—";
  const selectedIndex = Number.isInteger(view.chosenIndex) ? view.chosenIndex : "—";
  let actionLabel = vi ? "KHỞI TẠO" : "INITIALIZE";
  let actionCode = "positions = [[], ..., []]";
  let actionDetail = vi ? "26 stack, một stack cho mỗi chữ cái" : "26 stacks, one per letter";
  if (view.event === "read-letter") {
    actionLabel = vi ? "ĐỌC KÝ TỰ" : "READ LETTER";
    actionCode = `s[${view.currentIndex}] = '${escapeHtml(chars[view.currentIndex])}'`;
    actionDetail = vi ? "Không phải dấu * → chuẩn bị push index" : "Not a star → prepare to push its index";
  } else if (view.event === "push-index") {
    actionLabel = "PUSH INDEX";
    actionCode = `positions['${escapeHtml(chars[view.currentIndex])}'].append(${view.currentIndex})`;
    actionDetail = vi ? "Index lớn nhất nằm ở TOP bên phải" : "The largest index is TOP on the right";
  } else if (view.event === "mark-star") {
    actionLabel = vi ? "GẶP DẤU *" : "STAR FOUND";
    actionCode = `removed[${view.currentIndex}] = True`;
    actionDetail = vi ? "Xóa dấu * trước, sau đó chọn bucket" : "Remove the star first, then choose a bucket";
  } else if (view.event === "choose-smallest") {
    actionLabel = vi ? "GREEDY · CHỌN BUCKET" : "GREEDY · CHOOSE BUCKET";
    actionCode = `first non-empty bucket = ${selectedLetter}`;
    actionDetail = `TOP = index ${selectedIndex}`;
  } else if (view.event === "remove-rightmost") {
    actionLabel = vi ? "POP · XÓA BÊN PHẢI NHẤT" : "POP · REMOVE RIGHTMOST";
    actionCode = `removed[${selectedIndex}] = True`;
    actionDetail = `${selectedLetter} · ${vi ? "pop TOP để giữ occurrence bên trái" : "pop TOP to keep the left occurrence"}`;
  } else if (view.event === "return") {
    actionLabel = "RETURN";
    actionCode = `"${escapeHtml(view.resultSoFar || "")}"`;
    actionDetail = vi ? "Nối các ô có removed = 0" : "Join cells whose removed flag is 0";
  }

  const summary = vi
    ? `Quét chuỗi ${view.s || ""}; bucket nhỏ nhất ${view.smallestAvailable || "không có"}; kết quả hiện tại ${view.resultSoFar || "rỗng"}.`
    : `Scan ${view.s || ""}; smallest bucket ${view.smallestAvailable || "none"}; current result ${view.resultSoFar || "empty"}.`;

  $("treeView").innerHTML = `<section class="clear3170-viz" role="img" aria-label="${escapeHtml(summary)}">
    <div class="clear3170-phases">${phases}</div>
    <section class="clear3170-rule"><strong>GREEDY RULE</strong><span>${vi ? "chọn chữ nhỏ nhất · nếu trùng, xóa index lớn nhất (bên phải nhất)" : "choose the smallest letter · on a tie, remove its largest (rightmost) index"}</span></section>
    <section class="clear3170-tape"><header><strong>INPUT TAPE · s</strong><span>${vi ? "gạch chéo = removed" : "strikethrough = removed"}</span></header><div>${tape}</div></section>
    <section class="clear3170-action ${escapeHtml(view.event || "setup")}"><small>${escapeHtml(actionLabel)}</small><strong>${actionCode}</strong><span>${escapeHtml(actionDetail)}</span></section>
    <section class="clear3170-buckets"><header><strong>26 LETTER BUCKETS · INDEX STACKS</strong><span>${vi ? "chỉ hiện bucket đang có dữ liệu" : "only non-empty buckets are shown"}</span></header><div>${bucketHtml}</div></section>
    <div class="clear3170-choice">
      <section class="smallest"><small>${vi ? "1 · KÝ TỰ NHỎ NHẤT" : "1 · SMALLEST LETTER"}</small><strong>${selectedLetter}</strong><span>${view.chosenLetter ? `${vi ? "bucket đầu tiên không rỗng" : "first non-empty bucket"}` : "a → z"}</span></section>
      <i>→</i>
      <section class="rightmost"><small>${vi ? "2 · OCCURRENCE BÊN PHẢI NHẤT" : "2 · RIGHTMOST OCCURRENCE"}</small><strong>index ${selectedIndex}</strong><span>${view.chosenLetter ? "bucket.pop() = TOP" : (vi ? "index lớn nhất trong bucket" : "largest index in the bucket")}</span></section>
    </div>
    <section class="clear3170-mask"><header><strong>REMOVED MASK</strong><span>1 = ${vi ? "bỏ" : "discard"} · 0 = ${vi ? "giữ" : "keep"}</span></header><div>${mask}</div></section>
    <section class="clear3170-result"><small>${vi ? "KẾT QUẢ ĐANG GIỮ" : "KEPT RESULT SO FAR"}</small><strong>"${escapeHtml(view.resultSoFar || "")}"</strong><span>${vi ? "đọc trái → phải, bỏ * và mọi ô removed = 1" : "read left → right, skipping stars and every removed = 1 cell"}</span></section>
  </section>`;
}

function renderCinemaSeatView(step) {
  const view = step.cinemaSeatView || {};
  const vi = lang === "vi";
  const seats = Array.isArray(view.seats) ? view.seats : null;
  const phaseLabels = {
    intro: vi ? "Giới thiệu" : "Intro",
    empty: vi ? "Hàng trống" : "Empty rows",
    inspect: vi ? "Kiểm tra cửa sổ" : "Check windows",
    assign: vi ? "Xếp nhóm" : "Assign groups",
    done: vi ? "Hoàn tất" : "Complete",
  };

  let seatSection = "";
  if (seats) {
    const seatHtml = seats.map((seat) => {
      const classes = ["cin1386-seat"];
      if (seat.reserved) classes.push("reserved");
      else if (seat.group) classes.push("group", seat.group);
      if (seat.aisle) classes.push("aisle");
      const icon = seat.reserved ? "✕" : seat.group ? "●" : "";
      return `<span class="${classes.join(" ")}"><small>${seat.col}</small><b>${icon}</b></span>`;
    }).join("");
    seatSection = `<section class="cin1386-row"><header><strong>${vi ? "HÀNG" : "ROW"} ${view.currentRow}</strong><span>${vi ? "✕ đã đặt · ● ghế trong nhóm · | lối đi" : "✕ reserved · ● seat in a group · | aisle"}</span></header><div class="cin1386-seats">${seatHtml}</div></section>`;
  }

  let windowSection = "";
  if (view.windows) {
    const w = view.windows;
    const chosenNames = new Set((view.chosen || []).map((g) => g.name));
    const box = (name, label, free) => {
      const state = chosenNames.has(name) ? "chosen" : free ? "free" : "blocked";
      const stateText = chosenNames.has(name) ? (vi ? "đã chọn" : "chosen") : free ? (vi ? "trống" : "free") : (vi ? "bị chặn" : "blocked");
      return `<div class="cin1386-window ${state}"><small>${label}</small><em>${stateText}</em></div>`;
    };
    windowSection = `<section class="cin1386-windows">
      ${box("left", "2–5", w.left)}
      ${box("mid", "4–7", w.mid)}
      ${box("right", "6–9", w.right)}
    </section>`;
  }

  const answerLine = view.phase === "done"
    ? `<b>${view.answer}</b> ${vi ? "nhóm" : "groups"}`
    : `${vi ? "tổng hiện tại" : "running total"}: <b>${view.answer}</b>`;

  $("treeView").innerHTML = `<section class="cin1386-viz" role="img" aria-label="${vi ? "Trực quan hóa xếp ghế rạp phim" : "Cinema seat allocation visualization"}">
    <header><strong>CINEMA SEAT ALLOCATION</strong><span class="cin1386-phase">${escapeHtml(phaseLabels[view.phase] || view.phase || "")}</span></header>
    <section class="cin1386-rule"><b>CORE RULE</b><strong>${vi ? "3 cửa sổ nhóm: 2–5 · 6–9 · 4–7" : "3 group windows: 2–5 · 6–9 · 4–7"}</strong><span>${vi ? "hai bên trống → 2 nhóm; chỉ giữa trống → 1 nhóm" : "both sides free → 2 groups; only middle free → 1 group"}</span></section>
    <section class="cin1386-stats">
      <div><small>${vi ? "hàng trống" : "empty rows"}</small><strong>${view.emptyRows} × 2 = ${view.emptyContribution}</strong></div>
      <div><small>${vi ? "hàng có ghế đặt" : "reserved rows"}</small><strong>${view.reservedRowCount}</strong></div>
      <div class="answer"><small>${vi ? "ĐÁP ÁN" : "ANSWER"}</small><strong>${answerLine}</strong></div>
    </section>
    ${seatSection}
    ${windowSection}
  </section>`;
}

function renderTicketsView(step) {
  const view = step.ticketsView || {};
  const vi = lang === "vi";
  const days = Array.isArray(view.days) ? view.days : [];
  const dp = Array.isArray(view.dp) ? view.dp : [];
  const costs = Array.isArray(view.costs) ? view.costs : [];
  const opt = view.options;
  const wSeven = view.windowSeven;
  const wThirty = view.windowThirty;
  const chosen = opt ? opt.chosen : null;
  const phaseLabels = {
    init: vi ? "Khởi tạo" : "Initialize",
    compute: vi ? "Chọn vé cho ngày" : "Pick a pass",
    done: vi ? "Hoàn tất" : "Complete",
  };
  // The window highlighted on the travel-day row depends on the chosen pass.
  const activeWindow = chosen === "seven" ? wSeven : chosen === "thirty" ? wThirty : null;

  const daysHtml = days.map((d, idx) => {
    const classes = ["mct983-day"];
    if (idx === view.currentIndex - 1) classes.push("current");
    if (activeWindow && idx >= activeWindow[0] && idx <= activeWindow[1]) classes.push("covered");
    return `<span class="${classes.join(" ")}"><small>#${idx + 1}</small><strong>${d}</strong></span>`;
  }).join("");

  const dpHtml = dp.map((v, idx) => {
    const classes = ["mct983-dp"];
    if (idx === view.currentIndex) classes.push("current");
    if (opt && (idx === opt.one.dpIdx || (chosen === "seven" && idx === opt.seven.dpIdx) || (chosen === "thirty" && idx === opt.thirty.dpIdx))) classes.push("source");
    if (v === null || v === undefined) classes.push("pending");
    return `<span class="${classes.join(" ")}"><small>dp${idx}</small><strong>${v === null || v === undefined ? "·" : v}</strong></span>`;
  }).join("");

  let optionsHtml = "";
  if (opt) {
    const card = (key, label, o, extra) => `<article class="mct983-opt ${key}${chosen === key ? " chosen" : ""}"><small>${label}</small><strong>${o.total}</strong><em>dp[${o.dpIdx}]=${o.dpVal} + ${o.cost}${extra ? `<br>${extra}` : ""}</em></article>`;
    optionsHtml = `<section class="mct983-opts">
      ${card("one", vi ? "Vé 1 ngày" : "1-day", opt.one, "")}
      ${card("seven", vi ? "Vé 7 ngày" : "7-day", opt.seven, vi ? `phủ ${opt.seven.windowStart}..${days[view.currentIndex - 1]}` : `covers ${opt.seven.windowStart}..${days[view.currentIndex - 1]}`)}
      ${card("thirty", vi ? "Vé 30 ngày" : "30-day", opt.thirty, vi ? `phủ ${opt.thirty.windowStart}..${days[view.currentIndex - 1]}` : `covers ${opt.thirty.windowStart}..${days[view.currentIndex - 1]}`)}
    </section>`;
  }

  $("treeView").innerHTML = `<section class="mct983-viz" role="img" aria-label="${vi ? "Trực quan hóa Minimum Cost For Tickets" : "Minimum Cost For Tickets visualization"}">
    <header><strong>MINIMUM COST FOR TICKETS</strong><span class="mct983-phase">${escapeHtml(phaseLabels[view.phase] || view.phase || "")}</span></header>
    <section class="mct983-rule"><b>3 VÉ</b><strong>1 ngày = ${costs[0]} · 7 ngày = ${costs[1]} · 30 ngày = ${costs[2]}</strong><span>${vi ? "mỗi ngày phải đi: chọn vé rẻ nhất; vé dài phủ nhiều ngày cùng lúc" : "for each travel day pick the cheapest pass; longer passes cover many days at once"}</span></section>
    <section class="mct983-panel"><header><strong>${vi ? "NGÀY PHẢI ĐI" : "TRAVEL DAYS"}</strong><span>${vi ? "vàng = đang xét · xanh = được vé đang chọn phủ" : "yellow = current · green = covered by chosen pass"}</span></header><div class="mct983-days">${daysHtml}</div></section>
    ${optionsHtml}
    <section class="mct983-panel"><header><strong>dp</strong><span>${vi ? "dp[i] = chi phí đi i ngày đầu" : "dp[i] = cost of first i days"}</span></header><div class="mct983-dps">${dpHtml}</div></section>
    ${view.answer != null ? `<section class="mct983-answer"><small>${vi ? "ĐÁP ÁN" : "ANSWER"}</small><strong>${view.answer}</strong></section>` : ""}
  </section>`;
}

function renderStockCooldownView(step) {
  const view = step.stockCooldownView || {};
  const vi = lang === "vi";
  const prices = Array.isArray(view.prices) ? view.prices : [];
  const st = view.states || {};
  const t = view.transitions;
  const phaseLabels = {
    init: vi ? "Khởi tạo" : "Initialize",
    day: vi ? "Xử lý ngày" : "Process day",
    done: vi ? "Hoàn tất" : "Complete",
  };
  const fmt = (v) => (v === null || v === undefined ? "−∞" : v);

  const pricesHtml = prices.map((p, i) => {
    const classes = ["sc309-price"];
    if (i === view.currentIndex) classes.push("current");
    return `<span class="${classes.join(" ")}"><small>${vi ? "ngày" : "day"} ${i}</small><strong>${p}</strong></span>`;
  }).join("");

  const stateCard = (key, label, value, desc) => `<article class="sc309-state ${key}${view.phase === "day" ? " active" : ""}"><small>${label}</small><strong>${fmt(value)}</strong><em>${desc}</em></article>`;
  const statesHtml = `
    ${stateCard("hold", "hold", st.hold, vi ? "đang GIỮ cổ phiếu" : "HOLDING a share")}
    ${stateCard("sold", "sold", st.sold, vi ? "VỪA BÁN hôm nay" : "just SOLD today")}
    ${stateCard("rest", "rest", st.rest, vi ? "RẢNH / cooldown" : "free / cooldown")}
  `;

  let action = "";
  if (t) {
    action = `${vi ? "giá" : "price"} ${t.price}: sold=${fmt(t.oldHold)}+${t.price}=<b>${fmt(t.newSold)}</b> · hold=max(${fmt(t.oldHold)}, ${t.oldRest}−${t.price})=<b>${fmt(t.newHold)}</b> · rest=max(${t.oldRest}, ${t.oldSold})=<b>${t.newRest}</b>`;
  } else if (view.phase === "done") {
    action = `max(sold, rest) = <b>${view.answer}</b>`;
  } else {
    action = vi ? "3 trạng thái bắt đầu: hold=-∞, sold=0, rest=0" : "3 initial states: hold=-∞, sold=0, rest=0";
  }

  $("treeView").innerHTML = `<section class="sc309-viz" role="img" aria-label="${vi ? "Trực quan hóa Stock with Cooldown" : "Stock with Cooldown visualization"}">
    <header><strong>STOCK WITH COOLDOWN</strong><span class="sc309-phase">${escapeHtml(phaseLabels[view.phase] || view.phase || "")}</span></header>
    <section class="sc309-rule"><b>3 STATES</b><strong>hold → sold → (cooldown) rest → hold</strong><span>${vi ? "bán xong phải NGHỈ 1 ngày mới mua lại; mua lại chỉ từ trạng thái rest" : "after selling you must REST 1 day before buying; buying happens only from rest"}</span></section>
    <section class="sc309-panel"><header><strong>prices</strong></header><div class="sc309-prices">${pricesHtml}</div></section>
    <section class="sc309-action">${action}</section>
    <section class="sc309-states">${statesHtml}</section>
    ${view.answer != null ? `<section class="sc309-answer"><small>${vi ? "ĐÁP ÁN" : "ANSWER"}</small><strong>${view.answer}</strong></section>` : ""}
  </section>`;
}

function renderMaximalSquareView(step) {
  const view = step.maximalSquareView || {};
  const vi = lang === "vi";
  const matrix = Array.isArray(view.matrix) ? view.matrix : [];
  const dp = Array.isArray(view.dp) ? view.dp : [];
  const cur = view.current;
  const nb = view.neighbors;
  const squareCells = new Set(view.squareCells || []);
  const phaseLabels = {
    init: vi ? "Khởi tạo" : "Initialize",
    compute: vi ? "Tính ô dp" : "Compute cell",
    done: vi ? "Hoàn tất" : "Complete",
  };
  const nbSet = new Set();
  if (nb) { ["top", "left", "diag"].forEach((k) => { if (nb[k]) nbSet.add(`${nb[k].r},${nb[k].c}`); }); }

  const gridHtml = matrix.map((row, r) => {
    const cells = row.map((val, c) => {
      const classes = ["ms221-cell", val === 1 ? "one" : "zero"];
      if (cur && cur.r === r && cur.c === c) classes.push("current");
      else if (nbSet.has(`${r},${c}`)) classes.push("neighbor");
      if (squareCells.has(`${r},${c}`)) classes.push("square");
      const dpVal = dp[r] && dp[r][c] !== null && dp[r][c] !== undefined ? dp[r][c] : "";
      return `<span class="${classes.join(" ")}"><b>${val}</b><i>${dpVal}</i></span>`;
    }).join("");
    return `<div class="ms221-row">${cells}</div>`;
  }).join("");

  let action = "";
  if (view.formula) {
    const f = view.formula;
    action = `dp = min(${vi ? "trên" : "top"}=${f.top}, ${vi ? "trái" : "left"}=${f.left}, ${vi ? "chéo" : "diag"}=${f.diag}) + 1 = <b>${f.result}</b>`;
  } else if (cur) {
    action = `${vi ? "ô" : "cell"} (${cur.r},${cur.c}) = 0 → dp = 0`;
  } else if (view.phase === "done") {
    action = `${vi ? "cạnh" : "side"} = ${view.best} → ${vi ? "diện tích" : "area"} = <b>${view.answer}</b>`;
  } else {
    action = vi ? "dp[r][c] = min(3 ô) + 1" : "dp[r][c] = min(3 cells) + 1";
  }

  $("treeView").innerHTML = `<section class="ms221-viz" role="img" aria-label="${vi ? "Trực quan hóa Maximal Square" : "Maximal Square visualization"}">
    <header><strong>MAXIMAL SQUARE</strong><span class="ms221-phase">${escapeHtml(phaseLabels[view.phase] || view.phase || "")}</span></header>
    <section class="ms221-rule"><b>CORE RULE</b><strong>dp[r][c] = min(top, left, diag) + 1</strong><span>${vi ? "ô hiển thị số gốc (to) và dp (nhỏ, góc). vàng = ô đang tính · tím = 3 ô nguồn · xanh = hình vuông lớn nhất" : "each cell shows original value (big) and dp (small). yellow = current · purple = 3 sources · green = largest square"}</span></section>
    <section class="ms221-action">${action}</section>
    <section class="ms221-grid">${gridHtml}</section>
    <section class="ms221-best"><small>${vi ? "CẠNH LỚN NHẤT" : "MAX SIDE"}</small><strong>${view.best}</strong>${view.answer != null ? `<em>${vi ? "diện tích" : "area"} = ${view.answer}</em>` : ""}</section>
  </section>`;
}

function renderNumberOfLISView(step) {
  const view = step.numberOfLISView || {};
  const vi = lang === "vi";
  const nums = Array.isArray(view.nums) ? view.nums : [];
  const length = Array.isArray(view.length) ? view.length : [];
  const count = Array.isArray(view.count) ? view.count : [];
  const cand = view.candidate;
  const phaseLabels = {
    init: vi ? "Khởi tạo" : "Initialize",
    scan: vi ? "Quét cặp (j, i)" : "Scan pair (j, i)",
    done: vi ? "Hoàn tất" : "Complete",
  };
  const isBest = (i) => view.phase === "done" && view.maxLen != null && length[i] === view.maxLen;

  const cellsHtml = nums.map((v, i) => {
    const classes = ["lis673-cell"];
    if (i === view.currentI) classes.push("current");
    if (i === view.currentJ) classes.push("source");
    if (isBest(i)) classes.push("best");
    return `<article class="${classes.join(" ")}"><small>[${i}]</small><strong>${v}</strong><div class="lis673-lc"><span class="len">L=${length[i]}</span><span class="cnt">C=${count[i]}</span></div></article>`;
  }).join("");

  let action = "";
  if (cand) {
    const cmp = cand.extendable ? `${cand.numJ} &lt; ${cand.numI} ✓` : `${cand.numJ} ≥ ${cand.numI} ✗`;
    if (!cand.extendable) action = `nums[${cand.j}] ${cmp} → ${vi ? "bỏ qua" : "skip"}`;
    else if (cand.action === "new") action = `length[${cand.j}]+1 &gt; length[${cand.i}] → <b>${vi ? "dãy dài hơn" : "longer"}</b>: L=${cand.lenI}, C=${cand.cntI}`;
    else if (cand.action === "add") action = `length[${cand.j}]+1 = length[${cand.i}] → <b>${vi ? "cộng count" : "add count"}</b>: C=${cand.cntI}`;
    else action = `${cmp} ${vi ? "nhưng không dài hơn" : "but not longer"}`;
  } else if (view.phase === "done") {
    action = `maxLen = ${view.maxLen} → <b>${view.answer}</b> ${vi ? "dãy" : "subsequences"}`;
  } else {
    action = vi ? "mỗi phần tử: L=1, C=1" : "each element: L=1, C=1";
  }

  $("treeView").innerHTML = `<section class="lis673-viz" role="img" aria-label="${vi ? "Trực quan hóa Number of LIS" : "Number of LIS visualization"}">
    <header><strong>NUMBER OF LIS</strong><span class="lis673-phase">${escapeHtml(phaseLabels[view.phase] || view.phase || "")}</span></header>
    <section class="lis673-rule"><b>CORE RULE</b><strong>L=${vi ? "độ dài LIS kết thúc tại i" : "LIS length ending at i"} · C=${vi ? "số cách" : "how many"}</strong><span>${vi ? "nối sau j (nums[j]<nums[i]): dài hơn → thay; bằng → cộng C" : "extend after j (nums[j]<nums[i]): longer → replace; tie → add C"}</span></section>
    <section class="lis673-action">${action}</section>
    <section class="lis673-panel"><header><strong>nums</strong><span>${vi ? "vàng = i · tím = j đang xét · xanh = thuộc LIS dài nhất" : "yellow = i · purple = j · green = in longest LIS"}</span></header><div class="lis673-cells">${cellsHtml}</div></section>
  </section>`;
}

function renderLIS2407View(step) {
  const view = step.lis2407View || {};
  const vi = lang === "vi";
  const nums = Array.isArray(view.nums) ? view.nums : [];
  const values = Array.isArray(view.values) ? view.values : [];
  const dp = Array.isArray(view.dp) ? view.dp : [];
  const tree = Array.isArray(view.tree) ? view.tree : [];
  const owners = Array.isArray(view.owners) ? view.owners : [];
  const coverage = Array.isArray(view.coverage) ? view.coverage : [];
  const queryNodes = new Set(Array.isArray(view.queryNodes) ? view.queryNodes : []);
  const visitedNodes = new Set(Array.isArray(view.visitedNodes) ? view.visitedNodes : []);
  const updatePath = new Set(Array.isArray(view.updatePath) ? view.updatePath : []);
  const chain = new Set(Array.isArray(view.chain) ? view.chain : []);
  const currentIndex = Number.isInteger(view.currentIndex) ? view.currentIndex : -1;
  const currentValue = view.currentValue;
  const phaseLabels = vi
    ? ["1 · Nén giá trị", "2 · Chọn cửa sổ", "3 · Query max", "4 · Point update", "5 · Kết quả"]
    : ["1 · Compress values", "2 · Choose window", "3 · Query maximum", "4 · Point update", "5 · Result"];
  const phaseIndex = Number.isInteger(view.phaseIndex) ? view.phaseIndex : 0;

  const phasesHtml = phaseLabels.map((label, index) => {
    const state = index < phaseIndex ? "is-done" : index === phaseIndex ? "is-active" : "";
    return `<span class="${state}">${index < phaseIndex ? "✓ " : ""}${escapeHtml(label)}</span>`;
  }).join("");

  const sequenceHtml = nums.map((value, index) => {
    const classes = ["lis2407-number"];
    if (index < currentIndex || dp[index] !== null && dp[index] !== undefined) classes.push("is-processed");
    if (index === currentIndex) classes.push("is-current");
    if (index === view.predecessorIndex) classes.push("is-predecessor");
    if (chain.has(index)) classes.push("is-chain");
    const dpValue = dp[index] === null || dp[index] === undefined ? "·" : dp[index];
    return `<article class="${classes.join(" ")}">
      <small>i=${index}</small>
      <strong>${escapeHtml(String(value))}</strong>
      <em>dp=${escapeHtml(String(dpValue))}</em>
    </article>`;
  }).join("");

  const hasWindow = Number.isInteger(view.leftCoord) && Number.isInteger(view.rightCoord) && view.leftCoord <= view.rightCoord;
  const leavesHtml = values.map((value, coord) => {
    const node = Number(view.size || 1) + coord;
    const leafBest = tree[node - 1] ?? 0;
    const leafOwner = owners[node - 1] ?? -1;
    const classes = ["lis2407-leaf"];
    if (hasWindow && coord >= view.leftCoord && coord <= view.rightCoord) classes.push("is-eligible");
    if (value === currentValue) classes.push("is-target");
    if (leafOwner === view.predecessorIndex && view.predecessorIndex >= 0) classes.push("is-predecessor");
    return `<article class="${classes.join(" ")}">
      <small>${vi ? "giá trị" : "value"}</small>
      <strong>${escapeHtml(String(value))}</strong>
      <em>${vi ? "tốt nhất" : "best"} ${escapeHtml(String(leafBest))}</em>
    </article>`;
  }).join("");

  const levels = [];
  const size = Math.max(1, Number(view.size) || 1);
  for (let start = 1, level = 0; start < size * 2; start *= 2, level += 1) {
    const end = Math.min(start * 2 - 1, size * 2 - 1);
    const nodes = [];
    for (let node = start; node <= end; node += 1) nodes.push(node);
    levels.push({ level, nodes });
  }
  const treeHtml = levels.map(({ level, nodes }) => {
    const nodesHtml = nodes.map((node) => {
      const range = coverage[node - 1];
      if (!Array.isArray(range)) return `<span class="lis2407-node is-empty" aria-hidden="true"></span>`;
      const rangeText = values[range[0]] === values[range[1]]
        ? String(values[range[0]])
        : `${values[range[0]]}..${values[range[1]]}`;
      const best = tree[node - 1] ?? 0;
      const owner = owners[node - 1] ?? -1;
      const classes = ["lis2407-node"];
      if (visitedNodes.has(node)) classes.push("is-visited");
      if (queryNodes.has(node)) classes.push("is-query");
      if (updatePath.has(node)) classes.push("is-update");
      return `<article class="${classes.join(" ")}" aria-label="${escapeHtml(`tree ${node}, values ${rangeText}, maximum ${best}`)}">
        <small>[${escapeHtml(rangeText)}]</small>
        <strong>${escapeHtml(String(best))}</strong>
        <em>${owner >= 0 ? `i=${owner}` : "—"}</em>
      </article>`;
    }).join("");
    return `<div class="lis2407-level" style="--lis2407-cols:${nodes.length}"><b>L${level}</b><div>${nodesHtml}</div></div>`;
  }).join("");

  const operation = String(view.operation || "init");
  let action = "";
  if (operation === "init") {
    action = vi ? "Mỗi lá bắt đầu ở 0; mỗi node cha lưu max của hai con." : "Every leaf starts at 0; each parent stores the maximum of its children.";
  } else if (operation === "scan") {
    action = `${vi ? "x" : "x"} = ${currentValue} → ${vi ? "tìm predecessor trong" : "find a predecessor in"} [${Number(currentValue) - Number(view.k)}, ${Number(currentValue) - 1}]`;
  } else if (operation === "bounds") {
    action = hasWindow
      ? `${vi ? "Giá trị hợp lệ" : "Eligible values"}: [${view.leftValue}, ${view.rightValue}] → ${vi ? "tọa độ" : "coordinates"} [${view.leftCoord}, ${view.rightCoord}]`
      : (vi ? "Cửa sổ không chứa giá trị đã nén nào → previous = 0" : "The window contains no compressed value → previous = 0");
  } else if (operation === "query") {
    action = `${vi ? "Max trên các node xanh" : "Maximum across green nodes"} = <b>${view.queryLength ?? 0}</b>`;
  } else if (operation === "dp") {
    action = `dp[${currentIndex}] = 1 + ${view.queryLength ?? 0} = <b>${dp[currentIndex] ?? 1}</b>`;
  } else if (operation === "update") {
    action = view.updateImproved
      ? `${vi ? "Đẩy" : "Propagate"} dp[${currentIndex}]=${dp[currentIndex]} ${vi ? "từ lá lên root" : "from the leaf to the root"}`
      : (vi ? "Giữ max cũ tại lá và các node cha" : "Keep the existing maximum at the leaf and its ancestors");
  } else if (operation === "best") {
    action = `${vi ? "Kết quả tốt nhất sau prefix này" : "Best result after this prefix"} = <b>${view.answer ?? 0}</b>`;
  } else {
    const chainValues = Array.from(chain).map((index) => nums[index]);
    action = `${vi ? "Một dãy tối ưu" : "One optimal subsequence"}: <b>[${chainValues.join(", ")}]</b> → ${vi ? "độ dài" : "length"} ${view.answer ?? 0}`;
  }

  const windowText = currentValue === null || currentValue === undefined
    ? "—"
    : `[${Number(currentValue) - Number(view.k)}, ${Number(currentValue) - 1}]`;
  const selectedText = queryNodes.size ? Array.from(queryNodes).map((node) => `tree[${node}]`).join(" + ") : "—";

  $("treeView").innerHTML = `<section class="lis2407-viz" role="img" aria-label="${vi ? "Trực quan hóa Longest Increasing Subsequence II" : "Longest Increasing Subsequence II visualization"}">
    <header><strong>LIS II · SEGMENT TREE</strong><span>k = ${escapeHtml(String(view.k ?? "—"))}</span></header>
    <div class="lis2407-phases">${phasesHtml}</div>
    <section class="lis2407-action">${action}</section>
    <div class="lis2407-stats">
      <span><small>x</small><strong>${escapeHtml(currentValue === null || currentValue === undefined ? "—" : String(currentValue))}</strong></span>
      <span><small>${vi ? "cửa sổ" : "window"}</small><strong>${escapeHtml(windowText)}</strong></span>
      <span><small>${vi ? "range max" : "range max"}</small><strong>${escapeHtml(view.queryLength === null || view.queryLength === undefined ? "—" : String(view.queryLength))}</strong></span>
      <span><small>${vi ? "đáp án" : "answer"}</small><strong>${escapeHtml(String(view.answer ?? Math.max(0, ...dp.filter(Number.isFinite))))}</strong></span>
    </div>
    <section class="lis2407-panel">
      <header><strong>nums → dp</strong><span>${vi ? "vàng = x · tím = predecessor · xanh = dãy cuối" : "yellow = x · purple = predecessor · green = final chain"}</span></header>
      <div class="lis2407-sequence">${sequenceHtml}</div>
    </section>
    <section class="lis2407-panel">
      <header><strong>${vi ? "TRỤC GIÁ TRỊ ĐÃ NÉN" : "COMPRESSED VALUE AXIS"}</strong><span>[x−k, x−1] · ${vi ? "không phải khoảng index" : "not an index range"}</span></header>
      <div class="lis2407-leaves">${leavesHtml}</div>
    </section>
    <section class="lis2407-panel lis2407-tree-panel">
      <header><strong>RANGE-MAX TREE</strong><span>${escapeHtml(selectedText)}</span></header>
      <div class="lis2407-tree">${treeHtml}</div>
    </section>
  </section>`;
}

function renderWordLadder126View(step) {
  const view = step.wordLadder126View || {};
  const vi = lang === "vi";
  const words = Array.isArray(view.words) ? view.words : [];
  const dictionary = Array.isArray(view.dictionary) ? view.dictionary : [];
  const levels = view.levels && typeof view.levels === "object" ? view.levels : {};
  const parents = view.parents && typeof view.parents === "object" ? view.parents : {};
  const frontier = new Set(Array.isArray(view.frontier) ? view.frontier : []);
  const nextFrontier = new Set(Array.isArray(view.nextFrontier) ? view.nextFrontier : []);
  const backtrackPath = Array.isArray(view.backtrackPath) ? view.backtrackPath : [];
  const pathWords = new Set(backtrackPath);
  const answers = Array.isArray(view.answers) ? view.answers : [];
  const activeEdge = view.activeEdge || null;
  const phaseIndex = Number.isInteger(view.phaseIndex) ? view.phaseIndex : 0;
  const phaseLabels = vi
    ? ["1 · Từ điển", "2 · BFS theo layer", "3 · Parent DAG", "4 · DFS đi ngược", "5 · Đáp án"]
    : ["1 · Dictionary", "2 · Layered BFS", "3 · Parent DAG", "4 · Backward DFS", "5 · Answers"];

  const phasesHtml = phaseLabels.map((label, index) => {
    const classes = index < phaseIndex ? "is-done" : index === phaseIndex ? "is-active" : "";
    return `<span class="${classes}">${index < phaseIndex ? "✓ " : ""}${escapeHtml(label)}</span>`;
  }).join("");

  const renderLetters = (word, changedIndex = -1) => String(word || "").split("").map((letter, index) => (
    `<b class="${index === changedIndex ? "is-changed" : ""}">${escapeHtml(letter)}</b>`
  )).join("");

  const currentWord = view.currentWord;
  const candidateWord = view.candidateWord;
  let comparisonHtml = "";
  if (currentWord && candidateWord) {
    const reverse = view.decision === "backtrack";
    const fromWord = reverse ? candidateWord : currentWord;
    const toWord = reverse ? currentWord : candidateWord;
    const changedIndex = Number.isInteger(view.changedIndex) && view.changedIndex >= 0
      ? view.changedIndex
      : (() => {
          for (let index = 0; index < String(fromWord).length; index += 1) {
            if (fromWord[index] !== toWord[index]) return index;
          }
          return -1;
        })();
    comparisonHtml = `<div class="wl126-transform">
      <span>${renderLetters(fromWord, changedIndex)}</span>
      <i>→</i>
      <span>${renderLetters(toWord, changedIndex)}</span>
      <em>${reverse ? (vi ? "đi ngược parent" : "follow parent backward") : (vi ? "đổi đúng 1 ký tự" : "change exactly 1 letter")}</em>
    </div>`;
  }

  const maxLevel = Math.max(0, ...Object.values(levels).filter(Number.isInteger));
  const layerHtml = Array.from({ length: maxLevel + 1 }, (_, depth) => {
    const layerWords = words.filter(word => levels[word] === depth);
    const nodesHtml = layerWords.map(word => {
      const classes = ["wl126-node"];
      if (word === view.beginWord) classes.push("is-begin");
      if (word === view.endWord) classes.push("is-end");
      if (frontier.has(word)) classes.push("is-frontier");
      if (nextFrontier.has(word)) classes.push("is-next");
      if (word === currentWord) classes.push("is-current");
      if (word === candidateWord) classes.push("is-candidate");
      if (pathWords.has(word)) classes.push("is-path");
      const wordParents = Array.isArray(parents[word]) ? parents[word] : [];
      const parentHtml = wordParents.length
        ? wordParents.map(parent => {
            const edgeActive = activeEdge && activeEdge.from === parent && activeEdge.to === word;
            return `<span class="${edgeActive ? "is-active" : ""}">← ${escapeHtml(parent)}</span>`;
          }).join("")
        : `<span class="is-root">${depth === 0 ? (vi ? "bắt đầu" : "start") : "—"}</span>`;
      return `<article class="${classes.join(" ")}">
        <small>${vi ? "tầng" : "level"} ${depth}</small>
        <strong>${escapeHtml(word)}</strong>
        <div>${parentHtml}</div>
      </article>`;
    }).join("");
    return `<section class="wl126-layer">
      <header><b>L${depth}</b><span>${depth === 0 ? "0 " + (vi ? "bước đổi" : "changes") : `${depth} ${vi ? "bước đổi" : "changes"}`}</span></header>
      <div>${nodesHtml}</div>
    </section>`;
  }).join("");

  const unseenWords = dictionary.filter(word => levels[word] === undefined);
  const unseenHtml = unseenWords.length
    ? unseenWords.map(word => `<span class="${word === view.endWord ? "is-end" : ""}">${escapeHtml(word)}</span>`).join("")
    : `<em>${vi ? "không còn từ chưa thăm" : "no unvisited words"}</em>`;

  const forwardPath = [...backtrackPath].reverse();
  const backtrackHtml = forwardPath.length
    ? forwardPath.map((word, index) => `${index ? "<i>→</i>" : ""}<span>${escapeHtml(word)}</span>`).join("")
    : `<em>${vi ? "DFS chưa bắt đầu" : "DFS has not started"}</em>`;

  const answersHtml = answers.length
    ? answers.map((path, answerIndex) => `<article><small>#${answerIndex + 1}</small><div>${path.map((word, index) => `${index ? "<i>→</i>" : ""}<strong>${escapeHtml(word)}</strong>`).join("")}</div></article>`).join("")
    : `<p>${view.operation === "missing-end" || view.operation === "no-path" ? (vi ? "Không có đường đi." : "No path exists.") : (vi ? "Chưa hoàn thành đường nào." : "No completed path yet.")}</p>`;

  const operation = String(view.operation || "init");
  const actionByOperation = {
    "missing-end": vi ? "endWord không có trong wordList ⇒ trả về [] ngay." : "endWord is absent from wordList ⇒ return [] immediately.",
    init: vi ? "BFS bắt đầu với frontier chỉ có beginWord." : "BFS starts with beginWord as the only frontier word.",
    "layer-check": vi ? "Mọi từ trong frontier hiện tại có cùng khoảng cách ngắn nhất." : "Every word in the current frontier has the same shortest distance.",
    "remove-layer": vi ? "Khóa layer cũ để DAG không có cạnh đi lùi." : "Lock the old layer so the DAG cannot contain backward edges.",
    "next-layer": vi ? "Chuẩn bị một set cho các từ đạt được sau đúng 1 bước nữa." : "Prepare a set for words reachable in exactly one more change.",
    "scan-word": vi ? `Mở rộng ${currentWord}; chỉ giữ từ có trong dictionary.` : `Expand ${currentWord}; keep only words in the dictionary.`,
    candidate: vi ? "Candidate hợp lệ: đúng một chữ khác và vẫn chưa bị khóa." : "Valid candidate: exactly one letter differs and the word is not locked.",
    discover: vi ? "Lần đầu tới từ này: đặt layer và lưu parent." : "First arrival: assign its layer and store its parent.",
    "add-parent": vi ? "Cùng shortest layer: thêm parent, không enqueue lần hai." : "Same shortest layer: add another parent without enqueuing twice.",
    "found-end": vi ? "Đã thấy endWord, nhưng phải quét hết layer để không bỏ sót parent khác." : "endWord is found, but finish the layer so no other parent is lost.",
    "finish-layer": vi ? "Chuyển next_layer thành frontier; BFS dừng nếu layer này chứa endWord." : "Promote next_layer to frontier; BFS stops if this layer contains endWord.",
    "no-path": vi ? "Frontier rỗng trước khi tới endWord ⇒ không có lời giải." : "The frontier emptied before endWord ⇒ there is no solution.",
    "dfs-start": vi ? "Parent DAG đã xong; giờ đi ngược từ endWord." : "The parent DAG is complete; now walk backward from endWord.",
    "dfs-enter": vi ? `Đang dựng path ngược tại ${currentWord}.` : `Building a backward path at ${currentWord}.`,
    "choose-parent": vi ? "Chọn một parent ở layer trước và đi sâu tiếp." : "Choose one parent in the prior layer and recurse.",
    "emit-path": vi ? "Đã chạm beginWord: đảo path ngược và lưu một đáp án." : "beginWord reached: reverse the backward path and save one answer.",
    backtrack: vi ? "Quay lui để thử parent khác; đây là cách tìm đủ mọi path." : "Backtrack to try another parent; this is how every path is found.",
    done: vi ? "BFS bảo đảm ngắn nhất; DFS bảo đảm liệt kê đầy đủ." : "BFS guarantees shortestness; DFS guarantees complete enumeration.",
  };

  $("treeView").innerHTML = `<section class="wl126-viz" role="img" aria-label="${vi ? "Trực quan hóa Word Ladder II bằng BFS và DFS" : "Word Ladder II BFS and DFS visualization"}">
    <header><strong>WORD LADDER II</strong><span>${escapeHtml(view.beginWord || "")} → ${escapeHtml(view.endWord || "")}</span></header>
    <div class="wl126-phases">${phasesHtml}</div>
    <section class="wl126-rule">
      <span><b>BFS</b>${vi ? "xây các layer ngắn nhất" : "build shortest layers"}</span>
      <i>→</i>
      <span><b>PARENTS</b>${vi ? "giữ mọi cách đi vào" : "keep every shortest entry"}</span>
      <i>→</i>
      <span><b>DFS</b>${vi ? "dựng tất cả đáp án" : "build all answers"}</span>
    </section>
    <section class="wl126-action">${escapeHtml(actionByOperation[operation] || operation)}</section>
    ${comparisonHtml}
    <section class="wl126-panel">
      <header><strong>${vi ? "PARENT DAG THEO BFS LAYER" : "PARENT DAG BY BFS LAYER"}</strong><span>${vi ? "mỗi nhãn ← là một cạnh parent" : "each ← label is one parent edge"}</span></header>
      <div class="wl126-layers">${layerHtml}</div>
    </section>
    <section class="wl126-unseen"><b>${vi ? "CHƯA THĂM" : "UNVISITED"}</b><div>${unseenHtml}</div></section>
    <section class="wl126-backtrack">
      <header><strong>${vi ? "PATH DFS ĐANG DỰNG" : "CURRENT DFS PATH"}</strong><span>${backtrackPath.length ? (vi ? "hiển thị theo chiều begin → end" : "shown begin → end") : ""}</span></header>
      <div>${backtrackHtml}</div>
    </section>
    <section class="wl126-answers">
      <header><strong>${vi ? "ĐƯỜNG NGẮN NHẤT ĐÃ TÌM" : "SHORTEST PATHS FOUND"}</strong><span>${answers.length}</span></header>
      <div>${answersHtml}</div>
    </section>
  </section>`;
}

function renderHouseRobberView(step) {
  const view = step.houseRobberView || {};
  const vi = lang === "vi";
  const nums = Array.isArray(view.nums) ? view.nums : [];
  const method = view.method || "dp";
  const sources = new Set(view.sources || []);
  const robbed = new Set(view.robbed || []);
  const range = view.range;
  const phaseLabels = {
    init: vi ? "Khởi tạo" : "Initialize",
    base: vi ? "Cơ sở" : "Base case",
    compute: vi ? "Quyết định" : "Decision",
    shift: vi ? "Dời biến" : "Shift",
    done: vi ? "Hoàn tất" : "Complete",
  };

  // Houses row.
  const housesHtml = nums.map((money, idx) => {
    const classes = ["hr198-house"];
    if (Array.isArray(range) && (idx < range[0] || idx > range[1])) classes.push("outside");
    if (idx === view.currentIndex) classes.push("current");
    if (sources.has(idx)) classes.push("source");
    if (robbed.has(idx)) classes.push("robbed");
    return `<span class="${classes.join(" ")}"><small>${vi ? "nhà" : "house"} ${idx}</small><strong>${money}</strong><em>${robbed.has(idx) ? "💰" : ""}</em></span>`;
  }).join("");

  // Formula / registers / dp block per method.
  let formulaHtml = "";
  let extraHtml = "";
  let ruleText = "";
  let methodLabel = "";

  if (method === "dp" || method === "circular") {
    ruleText = "dp[i] = max(dp[i-1], dp[i-2] + nums[i])";
    methodLabel = method === "circular"
      ? (vi ? "VÒNG TRÒN · chạy 2 lần" : "CIRCULAR · run twice")
      : (vi ? "APPROACH 1 · bảng dp" : "APPROACH 1 · dp table");
    if (view.formula) {
      const f = view.formula;
      const skipCls = f.chosen === "skip" ? "chosen" : "";
      const robCls = f.chosen === "rob" ? "chosen" : "";
      formulaHtml = `<div class="hr198-formula">
        <span class="hr198-opt ${skipCls}">${vi ? "BỎ" : "SKIP"}: dp[${f.skip.from}] = <b>${f.skip.value}</b></span>
        <i>max</i>
        <span class="hr198-opt ${robCls}">${vi ? "CƯỚP" : "ROB"}: dp[${f.rob.from}]+nums[${f.i}] = ${f.rob.value}+${f.rob.money} = <b>${f.rob.total}</b></span>
        <em>→ dp[${f.i}] = ${f.result}</em>
      </div>`;
    }
    if (Array.isArray(view.dp)) {
      const dpHtml = view.dp.map((val, pos) => {
        const classes = ["hr198-dp"];
        if (pos === view.currentIndex) classes.push("current");
        if (sources.has(pos)) classes.push("source");
        if (val === null || val === undefined) classes.push("pending");
        return `<span class="${classes.join(" ")}"><small>${pos}</small><strong>${val === null || val === undefined ? "·" : val}</strong></span>`;
      }).join("");
      extraHtml = `<section class="hr198-panel"><header><strong>dp</strong><span>${vi ? "tiền tối đa tới nhà i" : "max loot up to house i"}</span></header><div class="hr198-dps">${dpHtml}</div></section>`;
    }
    if (method === "circular") {
      const passBadge = view.pass ? `<span class="hr198-pass ${view.pass === "A" ? "a" : "b"}">PASS ${view.pass}${range ? ` · [${range[0]}..${range[1]}]` : ""}</span>` : "";
      const passInfo = (view.passA !== null || view.passB !== null)
        ? `<div class="hr198-passes"><span>${vi ? "Pass A (bỏ nhà cuối)" : "Pass A (skip last)"}: <b>${view.passA ?? "?"}</b></span><span>${vi ? "Pass B (bỏ nhà đầu)" : "Pass B (skip first)"}: <b>${view.passB ?? "?"}</b></span></div>`
        : "";
      formulaHtml = `${passBadge}${passInfo}${formulaHtml}`;
    }
  } else if (method === "rolling") {
    ruleText = "temp = max(max_rob, prev_rob + money)";
    methodLabel = vi ? "APPROACH 2 · O(1) — prev_rob/max_rob" : "APPROACH 2 · O(1) — prev_rob/max_rob";
    if (view.formula) {
      const f = view.formula;
      formulaHtml = `<div class="hr198-formula"><span class="hr198-opt chosen">temp = max(max_rob=${f.maxRob}, prev_rob+money=${f.prevRob}+${f.money}=${f.robVal}) = <b>${f.temp}</b></span></div>`;
    }
    if (view.rolling) {
      const r = view.rolling;
      const reg = (name, val, hint) => `<article class="hr198-reg ${val === null || val === undefined ? "empty" : "filled"}"><small>${name}</small><strong>${val === null || val === undefined ? "—" : val}</strong><em>${hint}</em></article>`;
      extraHtml = `<section class="hr198-panel"><header><strong>${vi ? "BỘ NHỚ" : "MEMORY"}</strong><span>${vi ? "2 biến" : "2 variables"}</span></header><div class="hr198-regs">
        ${reg("prev_rob", r.prevRob, vi ? "nhà trước-trước" : "two back")}
        ${reg("max_rob", r.maxRob, vi ? "nhà trước" : "one back")}
        ${reg("temp", r.temp, vi ? "giá trị mới" : "new value")}
      </div></section>`;
    }
  }

  const answerLine = view.answer === null || view.answer === undefined
    ? ""
    : `<section class="hr198-answer"><small>${vi ? "ĐÁP ÁN" : "ANSWER"}</small><strong>${view.answer}$</strong></section>`;

  $("treeView").innerHTML = `<section class="hr198-viz" role="img" aria-label="${vi ? "Trực quan hóa House Robber" : "House Robber visualization"}">
    <header><strong>HOUSE ROBBER</strong><span class="hr198-phase">${escapeHtml(phaseLabels[view.phase] || view.phase || "")}</span></header>
    <section class="hr198-rule"><b>${escapeHtml(methodLabel)}</b><strong>${escapeHtml(ruleText)}</strong><span>${vi ? "không được cướp 2 nhà liền kề" : "cannot rob two adjacent houses"}</span></section>
    <section class="hr198-panel"><header><strong>${vi ? "DÃY NHÀ" : "HOUSES"}</strong><span>${vi ? "vàng = đang xét · tím = 2 nguồn · 💰 = cướp" : "yellow = current · purple = sources · 💰 = robbed"}</span></header><div class="hr198-houses">${housesHtml}</div></section>
    ${formulaHtml}
    ${extraHtml}
    ${answerLine}
  </section>`;
}

function renderMinCostStairsView(step) {
  const view = step.minCostStairsView || {};
  const vi = lang === "vi";
  const cost = Array.isArray(view.cost) ? view.cost : [];
  const isRolling = view.method === "rolling";
  const sources = new Set(view.sources || []);
  const phaseLabels = {
    init: vi ? "Khởi tạo" : "Initialize",
    compute: vi ? "Tính chi phí" : "Compute cost",
    done: vi ? "Hoàn tất" : "Complete",
  };

  // Cost stairs row (cost[i] for each stair).
  const costHtml = cost.map((c, idx) => {
    const classes = ["mcs746-cost"];
    if (idx === view.currentIndex) classes.push("current");
    if (sources.has(idx)) classes.push("source");
    return `<span class="${classes.join(" ")}"><small>${vi ? "bậc" : "step"} ${idx}</small><strong>${c}</strong></span>`;
  }).join("");

  // Formula box.
  let formulaHtml = "";
  if (view.formula && !isRolling) {
    const f = view.formula;
    const aCls = f.chosen === "A" ? "chosen" : "";
    const bCls = f.chosen === "B" ? "chosen" : "";
    formulaHtml = `<div class="mcs746-formula">
      <span class="mcs746-opt ${aCls}">${vi ? "từ bậc" : "from"} ${f.optA.fromStep}: ${f.optA.dp}+${f.optA.cost} = <b>${f.optA.total}</b></span>
      <i>min</i>
      <span class="mcs746-opt ${bCls}">${vi ? "từ bậc" : "from"} ${f.optB.fromStep}: ${f.optB.dp}+${f.optB.cost} = <b>${f.optB.total}</b></span>
      <em>→ dp[${f.i}] = ${f.result}</em>
    </div>`;
  } else if (view.formula && isRolling) {
    const f = view.formula;
    formulaHtml = `<div class="mcs746-formula"><span class="mcs746-opt chosen">curr = cost[${f.i}] + min(prev1=${f.prev1}, prev2=${f.prev2}) = ${f.cost} + ${f.min} = <b>${f.result}</b></span></div>`;
  }

  // dp row (method dp) or rolling registers (method rolling).
  let stateHtml = "";
  if (isRolling && view.rolling) {
    const r = view.rolling;
    const reg = (name, item, hint) => `<article class="mcs746-reg ${item ? "filled" : "empty"}"><small>${name}</small><strong>${item ? item.value : "—"}</strong><em>${item ? `${vi ? "bậc" : "step"} ${item.step}` : hint}</em></article>`;
    stateHtml = `<section class="mcs746-panel"><header><strong>${vi ? "BỘ NHỚ ĐANG GIỮ" : "LIVE MEMORY"}</strong><span>${vi ? "cửa sổ 2 biến" : "two-variable window"}</span></header><div class="mcs746-regs">
      ${reg("prev2", r.prev2, vi ? "2 bậc trước" : "two back")}
      ${reg("prev1", r.prev1, vi ? "1 bậc trước" : "one back")}
      ${reg("curr", r.curr, vi ? "chi phí mới" : "new cost")}
    </div></section>`;
  } else if (Array.isArray(view.dp)) {
    const dpHtml = view.dp.map((val, pos) => {
      const classes = ["mcs746-dp"];
      if (pos === view.currentIndex) classes.push("current");
      if (sources.has(pos)) classes.push("source");
      if (pos === view.n) classes.push("goal");
      if (val === null || val === undefined) classes.push("pending");
      return `<span class="${classes.join(" ")}"><small>${pos}${pos === view.n ? " ★" : ""}</small><strong>${val === null || val === undefined ? "?" : val}</strong></span>`;
    }).join("");
    stateHtml = `<section class="mcs746-panel"><header><strong>dp[0..${view.n}]</strong><span>${vi ? "★ = đỉnh cầu thang (đáp án)" : "★ = top of stairs (answer)"}</span></header><div class="mcs746-dps">${dpHtml}</div></section>`;
  }

  const methodLabel = isRolling
    ? (vi ? "APPROACH 2 · O(1) — prev2/prev1" : "APPROACH 2 · O(1) — prev2/prev1")
    : (vi ? "APPROACH 1 · bảng dp" : "APPROACH 1 · dp table");
  const answerLine = view.answer === null || view.answer === undefined
    ? ""
    : `<section class="mcs746-answer"><small>${vi ? "ĐÁP ÁN" : "ANSWER"}</small><strong>${view.answer}</strong></section>`;

  $("treeView").innerHTML = `<section class="mcs746-viz" role="img" aria-label="${vi ? "Trực quan hóa Min Cost Climbing Stairs" : "Min Cost Climbing Stairs visualization"}">
    <header><strong>MIN COST CLIMBING STAIRS</strong><span class="mcs746-phase">${escapeHtml(phaseLabels[view.phase] || view.phase || "")}</span></header>
    <section class="mcs746-rule"><b>${escapeHtml(methodLabel)}</b><strong>${isRolling ? "curr = cost[i] + min(prev1, prev2)" : "dp[i] = min(dp[i-1]+cost[i-1], dp[i-2]+cost[i-2])"}</strong><span>${vi ? "trả cost để rời một bậc; leo 1 hoặc 2 bậc; bắt đầu ở bậc 0/1 miễn phí" : "pay a step's cost to leave it; climb 1 or 2 steps; start free at step 0/1"}</span></section>
    <section class="mcs746-panel"><header><strong>cost</strong><span>${vi ? "vàng = bậc đang xét · tím = 2 nguồn" : "yellow = current step · purple = 2 sources"}</span></header><div class="mcs746-costs">${costHtml}</div></section>
    ${formulaHtml}
    ${stateHtml}
    ${answerLine}
  </section>`;
}

function renderTwoEvents2054View(step) {
  const view = step.twoEvents2054View || {};
  const vi = lang === "vi";
  const events = Array.isArray(view.events) ? view.events : [];
  const stages = Array.isArray(view.stages) ? view.stages : [];
  const current = Number.isInteger(view.currentIndex) ? events[view.currentIndex] : null;
  const heap = Array.isArray(view.heap) ? view.heap : [];
  const heapIds = new Set(heap.map((event) => event.id));
  const releasedIds = new Set(Array.isArray(view.releasedIds) ? view.releasedIds : []);
  const pickedIds = new Set(view.answer?.picks || []);
  const final = view.event === "done";
  const phaseHtml = stages.map((stage, index) => {
    const state = final || index < view.stage ? "done" : index === view.stage ? "active" : "pending";
    return `<span class="${state}"><i>${state === "done" ? "✓" : index + 1}</i><b>${escapeHtml(pick(stage))}</b></span>`;
  }).join("");
  const line = Array.isArray(step.codeLines) && step.codeLines.length ? step.codeLines[0] : "—";

  const minimum = events.length ? Math.min(...events.map((event) => event.start)) : 0;
  const maximum = events.length ? Math.max(...events.map((event) => event.end)) : 1;
  const timeRange = Math.max(1, maximum - minimum);
  const timelineHtml = events.map((event, index) => {
    const isCurrent = index === view.currentIndex;
    const isBestPast = view.bestPast?.id === event.id;
    const isPicked = final && pickedIds.has(event.id);
    const status = isPicked
      ? (vi ? "ĐÁP ÁN" : "ANSWER")
      : isCurrent
        ? (vi ? "HIỆN TẠI" : "CURRENT")
        : isBestPast
          ? "BEST ENDED"
          : heapIds.has(event.id)
            ? "IN HEAP"
            : releasedIds.has(event.id)
              ? (vi ? "ĐÃ KẾT THÚC" : "ENDED")
              : (vi ? "CHƯA XÉT" : "WAITING");
    const classes = [isCurrent ? "current" : "", isBestPast ? "best" : "", isPicked ? "picked" : "", heapIds.has(event.id) ? "in-heap" : "", releasedIds.has(event.id) ? "released" : ""].filter(Boolean).join(" ");
    const left = Math.min(97, ((event.start - minimum) / timeRange) * 100);
    const naturalWidth = ((event.end - event.start) / timeRange) * 100;
    const width = Math.max(3, Math.min(100 - left, naturalWidth || 3));
    return `<div class="te2054-event ${classes}">
      <span><strong>#${event.id} · [${event.start}, ${event.end}]</strong><small>value ${event.value} · ${status}</small></span>
      <div><i style="left:${left.toFixed(3)}%;width:${width.toFixed(3)}%"><b>${event.value}</b></i></div>
    </div>`;
  }).join("");

  let gateHtml = "";
  if (current) {
    const checked = view.heapTop || view.popped || null;
    const relation = view.compatible === true ? "pass" : view.compatible === false ? "blocked" : "waiting";
    const equation = checked ? `${checked.end} < ${current.start}` : `end < ${current.start}`;
    const verdict = view.compatible === true ? "✓ POP" : view.compatible === false ? "✗ STOP" : "…";
    gateHtml = `<section class="te2054-gate ${relation}">
      <header><strong>${vi ? "CỔNG KHÔNG OVERLAP" : "NON-OVERLAP GATE"}</strong><span>end(previous) &lt; start(current)</span></header>
      <div><article><small>${checked ? `HEAP TOP · #${checked.id}` : "HEAP TOP"}</small><strong>${checked ? checked.end : "∅"}</strong><span>end</span></article><b>&lt;</b><article class="current"><small>CURRENT · #${current.id}</small><strong>${current.start}</strong><span>start</span></article><em>${equation} · ${verdict}</em></div>
      <footer>${view.compatible === true
        ? (vi ? `#${checked.id} đã kết thúc trước #${current.id} bắt đầu, nên có thể ghép.` : `#${checked.id} ended before #${current.id} starts, so they may be combined.`)
        : view.compatible === false
          ? (vi ? `Chạm biên hoặc chồng thời gian vẫn overlap; giữ #${checked.id} trong heap.` : `Touching or crossing time ranges still overlap; keep #${checked.id} in the heap.`)
          : (vi ? "Nếu heap rỗng, event hiện tại sẽ đứng một mình." : "When the heap is empty, the current event stands alone.")}</footer>
    </section>`;
  }

  const heapHtml = heap.length
    ? heap.map((event, index) => `<span class="${index === 0 ? "top" : ""}"><small>${index === 0 ? "TOP" : `#${index + 1}`} · #${event.id}</small><strong>end ${event.end}</strong><em>value ${event.value}</em></span>`).join("")
    : `<b class="te2054-empty">∅ ${vi ? "heap rỗng" : "empty heap"}</b>`;
  const past = view.bestPast;
  const bestPastHtml = past
    ? `<article><small>BEST ENDED · #${past.id}</small><strong>${past.value}</strong><span>[${past.start}, ${past.end}]</span></article>`
    : `<article class="empty"><small>BEST ENDED</small><strong>0</strong><span>${vi ? "chưa có event tương thích" : "no compatible event yet"}</span></article>`;

  const candidate = view.candidate;
  const candidateHtml = candidate && current
    ? `<section class="te2054-equation ${view.answerChanged ? "winner" : ""}">
      <header><strong>${vi ? "CHỈ CÓ HAI SLOT" : "ONLY TWO SLOTS"}</strong><span>${vi ? "một event đã kết thúc + event hiện tại" : "one ended event + the current event"}</span></header>
      <div><article><small>SLOT 1 · BEST ENDED</small><strong>${past ? past.value : 0}</strong><span>${past ? `#${past.id}` : "∅"}</span></article><b>+</b><article class="current"><small>SLOT 2 · CURRENT</small><strong>${current.value}</strong><span>#${current.id}</span></article><b>=</b><article class="candidate"><small>CANDIDATE</small><strong>${candidate.score}</strong><span>[${candidate.picks.map((id) => `#${id}`).join(" + ")}]</span></article></div>
      <footer><span>${vi ? "ĐÁP ÁN TỐT NHẤT" : "BEST ANSWER"}</span><strong>${view.answer?.score ?? 0}</strong><em>[${(view.answer?.picks || []).map((id) => `#${id}`).join(" + ") || "∅"}]</em></footer>
    </section>`
    : "";

  const processed = Array.isArray(view.processed) ? view.processed : [];
  const processedHtml = processed.length
    ? processed.map((item, index) => `<span class="${index === processed.length - 1 && !final ? "fresh" : ""}"><small>CURRENT #${item.id}</small><strong>${item.pastValue} + ${item.currentValue} = ${item.candidate}</strong><em>answer ${item.answer} · [${item.picks.map((id) => `#${id}`).join(" + ")}]</em></span>`).join("")
    : `<b class="te2054-empty">${vi ? "Chưa tính candidate nào" : "No candidate calculated yet"}</b>`;

  const answerHtml = final
    ? `<section class="te2054-answer"><header><span><small>${vi ? "TỔNG VALUE LỚN NHẤT" : "MAXIMUM TOTAL VALUE"}</small><strong>${view.answer?.score ?? 0}</strong></span><b>${(view.answer?.picks || []).length} / 2 ${vi ? "event được chọn" : "events selected"}</b></header><div>${(view.answer?.picks || []).map((id) => {
      const event = Array.isArray(view.original?.[id]) ? view.original[id] : [];
      return `<article><small>#${id}</small><strong>[${event[0]}, ${event[1]}]</strong><span>+${event[2]}</span></article>`;
    }).join("<i>+</i>")}</div><footer>${vi ? "Hai event hợp lệ chỉ khi end của event trước nhỏ hơn start của event sau." : "Two events are valid only when the earlier event's end is smaller than the later event's start."}</footer></section>`
    : "";

  $("treeView").innerHTML = `<section class="te2054-viz" role="img" aria-label="${escapeHtml(vi ? "Trực quan hóa hai event không chồng nhau bài 2054" : "Two best non-overlapping events visualization for problem 2054")}">
    <div class="te2054-phases">${phaseHtml}</div>
    <section class="te2054-action"><small>${vi ? "DÒNG CODE" : "CODE LINE"} ${line} · ${escapeHtml(String(view.event || "step").replaceAll("-", " "))}</small><strong>${escapeHtml(pick(step.title))}</strong><span>${escapeHtml(pick(step.note))}</span></section>
    <section class="te2054-rule"><b>${vi ? "QUY TẮC QUAN TRỌNG" : "KEY RULE"}</b><strong>end(previous) &lt; start(current)</strong><span>${vi ? "Dấu <, không phải ≤ · vì cả start và end đều inclusive" : "Strict <, not ≤ · both start and end are inclusive"}</span></section>
    <section class="te2054-timeline"><header><strong>${vi ? "EVENTS · SORT THEO START · GIỮ INDEX GỐC #" : "EVENTS · SORT BY START · KEEP ORIGINAL INDEX #"}</strong><span>${vi ? "cam = current · xanh dương = heap · tím = best ended · xanh lá = answer" : "amber = current · blue = heap · purple = best ended · green = answer"}</span></header><div class="te2054-axis"><span>${minimum}</span><i></i><span>${maximum}</span></div><div>${timelineHtml}</div></section>
    ${gateHtml}
    <div class="te2054-memory"><section><header><strong>MIN-HEAP BY END</strong><span>${vi ? "TOP kết thúc sớm nhất" : "earliest end is TOP"}</span></header><div class="te2054-heap">${heapHtml}</div></section><section><header><strong>BEST ENDED</strong><span>${vi ? "event tốt nhất đã được pop" : "best event already popped"}</span></header><div class="te2054-best">${bestPastHtml}</div></section></div>
    ${candidateHtml}
    <section class="te2054-processed"><header><strong>${vi ? "CANDIDATE ĐÃ TÍNH" : "CALCULATED CANDIDATES"}</strong><span>best_ended + current → answer</span></header><div>${processedHtml}</div></section>
    ${answerHtml}
  </section>`;
}

function renderWeightedIntervals3414View(step) {
  const view = step.weightedIntervals3414View || {};
  const vi = lang === "vi";
  const intervals = Array.isArray(view.intervals) ? view.intervals : [];
  const stages = Array.isArray(view.stages) ? view.stages : [];
  const stageIndex = Number.isInteger(view.stage) ? view.stage : 0;
  const active = Number.isInteger(view.activeRow) ? intervals[view.activeRow] : null;
  const picked = new Set(view.answer || view.decision?.winner?.picks || []);
  const formatPicks = (candidate) => candidate ? `[${(candidate.picks || []).join(", ")}]` : "?";
  const scoreOf = (candidate) => candidate ? candidate.score : "?";
  const activeLine = Array.isArray(step.codeLines) && step.codeLines.length ? step.codeLines[0] : "—";
  const phasesHtml = stages.map((stage, index) => {
    const state = index < stageIndex ? "done" : index === stageIndex ? "active" : "pending";
    return `<span class="${state}"><i>${state === "done" ? "✓" : index + 1}</i><b>${escapeHtml(pick(stage))}</b></span>`;
  }).join("");

  const minimum = intervals.length ? Math.min(...intervals.map((interval) => interval.start)) : 0;
  const maximum = intervals.length ? Math.max(...intervals.map((interval) => interval.end)) : 1;
  const range = Math.max(1, maximum - minimum);
  const timelineHtml = intervals.map((interval, row) => {
    const compatible = active && row < view.activeRow && interval.end < active.start;
    const conflicts = active && row < view.activeRow && interval.end >= active.start;
    const isCurrent = row === view.activeRow;
    const isPredecessor = row === view.prevRow;
    const classes = [
      isCurrent ? "current" : "",
      isPredecessor ? "predecessor" : "",
      compatible ? "compatible" : "",
      conflicts ? "conflict" : "",
      picked.has(interval.id) ? "picked" : "",
    ].filter(Boolean).join(" ");
    const left = Math.min(97, ((interval.start - minimum) / range) * 100);
    const naturalWidth = ((interval.end - interval.start) / range) * 100;
    const width = Math.max(3, Math.min(100 - left, naturalWidth || 3));
    const prev = Number.isInteger(interval.prev) ? interval.prev : "?";
    const state = isCurrent
      ? (vi ? "ĐANG XÉT" : "CURRENT")
      : isPredecessor
        ? "PREV"
        : picked.has(interval.id)
          ? (vi ? "ĐƯỢC CHỌN" : "PICKED")
          : compatible
            ? (vi ? "CÓ THỂ ĐỨNG TRƯỚC" : "CAN COME BEFORE")
            : conflicts
              ? (vi ? "CHỒNG LẤN" : "OVERLAPS")
              : (vi ? "CHỜ" : "WAITING");
    return `<div class="wi3414-interval ${classes}">
      <span><b>#${interval.id} · [${interval.start}, ${interval.end}] <em>+${interval.weight}</em></b><small>sorted ${row} · prev=${prev} · ${state}</small></span>
      <div><i style="left:${left.toFixed(3)}%;width:${width.toFixed(3)}%"><em>#${interval.id}</em></i></div>
    </div>`;
  }).join("");

  const ruleHtml = `<section class="wi3414-rule"><b>${vi ? "1 QUY TẮC CẦN NHỚ" : "ONE RULE TO REMEMBER"}</b><strong>end(previous) &lt; start(current)</strong><span>${vi ? "Dấu < nghiêm ngặt: chạm biên vẫn overlap" : "Strict <: touching endpoints still overlap"}</span></section>`;

  let compatibilityHtml = "";
  if (active) {
    const predecessor = Number.isInteger(view.prevRow) ? intervals[view.prevRow] : null;
    const equation = predecessor ? `${predecessor.end} < ${active.start}  ✓` : `${vi ? "không có end" : "no end"} < ${active.start}`;
    compatibilityHtml = `<section class="wi3414-compat ${predecessor ? "found" : "empty"}">
      <header><strong>${vi ? `VÌ SAO prev[${view.activeRow}] = ${predecessor ? view.prevRow : "−1"}?` : `WHY IS prev[${view.activeRow}] = ${predecessor ? view.prevRow : "−1"}?`}</strong><span>${vi ? "prev là interval tương thích gần nhất trong thứ tự đã sort" : "prev is the nearest compatible interval in sorted order"}</span></header>
      <div>
        <article class="previous"><small>${predecessor ? `PREV · #${predecessor.id}` : (vi ? "KHÔNG CÓ PREV" : "NO PREV")}</small><strong>${predecessor ? `[${predecessor.start}, ${predecessor.end}]` : "∅"}</strong><span>${predecessor ? `end = ${predecessor.end}` : (vi ? "dùng hàng DP 0" : "use DP row 0")}</span></article>
        <i>→</i>
        <code>${escapeHtml(equation)}</code>
        <i>→</i>
        <article class="current"><small>CURRENT · #${active.id}</small><strong>[${active.start}, ${active.end}]</strong><span>start = ${active.start} · score +${active.weight}</span></article>
      </div>
      <footer>${predecessor
        ? (vi ? `#${predecessor.id} kết thúc trước khi #${active.id} bắt đầu, nên TAKE có thể nối hai lời giải.` : `#${predecessor.id} ends before #${active.id} starts, so TAKE may join their solutions.`)
        : (vi ? `Không interval nào kết thúc trước ${active.start}; TAKE phải bắt đầu từ lời giải rỗng.` : `No interval ends before ${active.start}; TAKE must start from the empty solution.`)}</footer>
    </section>`;
  }

  let decisionHtml = "";
  if (view.decision) {
    const decision = view.decision;
    const skipWins = decision.choice === "skip";
    const takeWins = decision.choice === "take";
    const tie = decision.skip && decision.take && decision.skip.score === decision.take.score;
    const reason = !decision.winner
      ? decision.step === "skip"
        ? (vi ? "Bước 1/4 · đọc phương án SKIP" : "Step 1/4 · read the SKIP option")
        : decision.step === "base"
          ? (vi ? "Bước 2/4 · tìm lời giải gốc tương thích cho TAKE" : "Step 2/4 · find TAKE's compatible base solution")
          : (vi ? "Bước 3/4 · cộng weight để tạo TAKE" : "Step 3/4 · add the weight to build TAKE")
      : tie
        ? (vi ? `Hòa score → giữ mảng index nhỏ hơn: ${formatPicks(decision.winner)}` : `Score tie → keep the smaller index list: ${formatPicks(decision.winner)}`)
        : (vi ? `${decision.choice.toUpperCase()} có score lớn hơn` : `${decision.choice.toUpperCase()} has the higher score`);
    decisionHtml = `<section class="wi3414-decision">
      <header><span><small>${vi ? "Ô ĐANG TÍNH" : "CURRENT CELL"}</small><strong>dp[${view.activeRow + 1}][${view.activeCapacity}]</strong></span><em>${vi ? `chọn tối đa ${view.activeCapacity} interval` : `choose at most ${view.activeCapacity} interval(s)`}</em></header>
      <div class="wi3414-choice-grid">
        <article class="skip ${decision.skip ? "ready" : ""} ${skipWins ? "winner" : ""} ${decision.step === "skip" ? "current" : ""}"><small>1 · SKIP #${active?.id ?? "?"}</small><strong>${scoreOf(decision.skip)}</strong><code>${escapeHtml(formatPicks(decision.skip))}</code><span>dp[${view.activeRow}][${view.activeCapacity}]</span></article>
        <article class="base ${decision.base ? "ready" : ""} ${decision.step === "base" ? "current" : ""}"><small>2 · TAKE BASE</small><strong>${scoreOf(decision.base)}</strong><code>${escapeHtml(formatPicks(decision.base))}</code><span>dp[${(active?.prev ?? -1) + 1}][${view.activeCapacity - 1}]</span></article>
        <article class="take ${decision.take ? "ready" : ""} ${takeWins ? "winner" : ""} ${decision.step === "take" ? "current" : ""}"><small>3 · TAKE #${active?.id ?? "?"}</small><strong>${scoreOf(decision.take)}</strong><code>${escapeHtml(formatPicks(decision.take))}</code><span>${decision.base ? `${decision.base.score} + ${active?.weight ?? 0}` : "base + weight"}</span></article>
        <article class="result ${decision.winner ? "ready winner" : ""} ${decision.step === "winner" ? "current" : ""}"><small>4 · ${vi ? "GIỮ PHƯƠNG ÁN TỐT HƠN" : "KEEP THE BETTER OPTION"}</small><strong>${decision.choice ? decision.choice.toUpperCase() : "?"}</strong><code>${escapeHtml(formatPicks(decision.winner))}</code><span>${decision.winner ? `score ${decision.winner.score}` : "compare score, then indices"}</span></article>
      </div>
      <footer>${escapeHtml(reason)}</footer>
    </section>`;
  }

  const dp = Array.isArray(view.dp) ? view.dp : [];
  const visibleRowCount = view.phase === "dp"
    ? Math.min(dp.length, (Number.isInteger(view.activeRow) ? view.activeRow + 2 : 1))
    : view.phase === "done" ? dp.length : Math.min(1, dp.length);
  const dpRows = dp.slice(0, visibleRowCount).map((row, rowIndex) => {
    const interval = rowIndex > 0 ? intervals[rowIndex - 1] : null;
    const cells = row.map((cell, capacity) => {
      const current = rowIndex === (view.activeRow ?? -2) + 1 && capacity === view.activeCapacity;
      const skipSource = view.decision && rowIndex === view.activeRow && capacity === view.activeCapacity;
      const takeSource = view.decision && rowIndex === (active?.prev ?? -1) + 1 && capacity === view.activeCapacity - 1;
      const classes = [current ? "current" : "", skipSource ? "skip-source" : "", takeSource ? "take-source" : ""].filter(Boolean).join(" ");
      return `<td class="${classes}">${cell ? `<strong>${cell.score}</strong><small>[${cell.picks.join(",")}]</small>` : `<em>?</em>`}</td>`;
    }).join("");
    return `<tr><th><b>${rowIndex}</b><small>${interval ? `${vi ? "sau" : "after"} #${interval.id}` : (vi ? "bắt đầu" : "start")}</small></th>${cells}</tr>`;
  }).join("");
  const dpHeader = Array.from({ length: 5 }, (_, capacity) => `<th><small>${vi ? "TỐI ĐA" : "AT MOST"}</small><b>${capacity}</b></th>`).join("");

  const completedCells = Number.isInteger(view.completedCells) ? view.completedCells : 0;
  const totalCells = Number.isInteger(view.totalCells) && view.totalCells > 0 ? view.totalCells : 1;
  const progress = Math.max(0, Math.min(100, completedCells / totalCells * 100));
  const progressHtml = `<section class="wi3414-progress"><header><span><small>${vi ? "TIẾN ĐỘ DP" : "DP PROGRESS"}</small><strong>${completedCells} / ${totalCells} ${vi ? "ô đã chốt" : "cells finalized"}</strong></span><em>dp[i][k] = better(SKIP, TAKE)</em></header><div><i style="width:${progress.toFixed(3)}%"></i></div></section>`;

  const answerHtml = Array.isArray(view.answer)
    ? `<section class="wi3414-answer"><header><span><small>${vi ? "ĐÁP ÁN · INDEX GỐC TĂNG DẦN" : "ANSWER · SORTED ORIGINAL INDICES"}</small><strong>[${view.answer.join(", ")}]</strong></span><b>score = ${view.answerScore}</b></header><div>${view.answer.map((id) => {
      const interval = Array.isArray(view.original?.[id]) ? view.original[id] : [];
      return `<article><small>#${id}</small><strong>[${interval[0]}, ${interval[1]}]</strong><span>+${interval[2]}</span></article>`;
    }).join("<i>+</i>")}</div><footer>${vi ? "Các interval trên không chồng nhau; DP đã xử lý tie-break theo index." : "These intervals do not overlap; DP already applied the index tie-break."}</footer></section>`
    : "";

  $("treeView").innerHTML = `<section class="wi3414-viz" role="img" aria-label="${escapeHtml(vi ? "Trực quan hóa weighted interval DP bài 3414" : "Weighted interval DP visualization for problem 3414")}">
    <div class="wi3414-phases">${phasesHtml}</div>
    <section class="wi3414-action"><small>${vi ? "DÒNG CODE" : "CODE LINE"} ${activeLine} · ${escapeHtml(String(view.event || "step").replaceAll("-", " "))}</small><strong>${escapeHtml(pick(step.title))}</strong><span>${escapeHtml(pick(step.note))}</span></section>
    ${ruleHtml}
    <section class="wi3414-timeline"><header><strong>${vi ? "1 · SORT THEO END · GIỮ INDEX GỐC #" : "1 · SORT BY END · KEEP ORIGINAL INDEX #"}</strong><span>${vi ? "cam = current · xanh lá = prev / picked · đỏ = overlap" : "amber = current · green = prev / picked · red = overlap"}</span></header><div class="wi3414-axis"><span>${minimum}</span><i></i><span>${maximum}</span></div><div>${timelineHtml}</div></section>
    ${compatibilityHtml}
    ${decisionHtml}
    ${progressHtml}
    <section class="wi3414-table"><header><strong>DP · <b>SCORE</b> + [INDICES]</strong><span>${vi ? "hàng = đã xét bao nhiêu interval · cột = được chọn tối đa bao nhiêu" : "row = intervals considered · column = maximum picks allowed"}</span></header><div><table><thead><tr><th><small>${vi ? "ĐÃ XÉT" : "SEEN"}</small></th>${dpHeader}</tr></thead><tbody>${dpRows}</tbody></table></div></section>
    ${answerHtml}
    <section class="wi3414-legend"><span><i class="current"></i>${vi ? "interval / ô hiện tại" : "current interval / cell"}</span><span><i class="compatible"></i>${vi ? "tương thích / được chọn" : "compatible / picked"}</span><span><i class="conflict"></i>${vi ? "overlap với current" : "overlaps current"}</span></section>
  </section>`;
}

function renderAdvancedBitmaskView(step) {
  const view = step.advancedBitmaskView || {};
  const vi = lang === "vi";
  const stages = Array.isArray(view.stages) ? view.stages : [];
  const stageIndex = Number.isInteger(view.stageIndex) ? view.stageIndex : 0;
  const modeLabels = {
    "word-product": vi ? "TỪ → MASK CHỮ CÁI" : "WORDS → LETTER MASKS",
    arrangement: vi ? "BACKTRACKING + USED MASK" : "BACKTRACKING + USED MASK",
    "k-subsets": vi ? "BUCKETS + USED MASK" : "BUCKETS + USED MASK",
    team: vi ? "SKILL MASK + DP" : "SKILL MASK + DP",
    "gcd-pairs": vi ? "GHÉP CẶP + MEMO" : "PAIRING + MEMO",
    "xor-assignment": vi ? "GHÉP XOR + DP" : "XOR ASSIGNMENT + DP",
  };
  const toneClass = (value) => String(value || "").replace(/[^a-z0-9_-]/gi, "");
  const phasesHtml = stages.map((stage, index) => {
    const state = index === stageIndex ? "active" : index < stageIndex ? "done" : "";
    const label = pick(stage).replace(/^\d+\.\s*/, "");
    return `<span class="${state}"><b>${index < stageIndex ? "✓" : index + 1}</b><em>${escapeHtml(label)}</em></span>`;
  }).join("");

  const lanesHtml = (Array.isArray(view.lanes) ? view.lanes : []).map((lane) => {
    const items = Array.isArray(lane.items) ? lane.items : [];
    const itemsHtml = items.map((item) => `<article class="abm-item ${toneClass(item.state)}">
      <header><small>${escapeHtml(String(item.label || ""))}</small>${item.badge !== undefined ? `<span>${escapeHtml(String(item.badge))}</span>` : ""}</header>
      <strong>${escapeHtml(String(item.value ?? ""))}</strong>
      <p>${escapeHtml(String(item.sub || ""))}</p>
    </article>`).join("");
    return `<section class="abm-lane">
      <header><strong>${escapeHtml(pick(lane.title))}</strong><span>${escapeHtml(pick(lane.hint))}</span></header>
      <div class="abm-items">${itemsHtml || `<p class="abm-empty">${vi ? "Chưa có dữ liệu" : "No data yet"}</p>`}</div>
    </section>`;
  }).join("");

  const masks = Array.isArray(view.masks) ? view.masks : [];
  const masksHtml = masks.length ? `<section class="abm-mask-panel">
    <header><strong>${vi ? "BITMASK ĐANG DÙNG" : "CURRENT BITMASKS"}</strong><span>${vi ? "nhãn ở trên · trạng thái bit ở dưới" : "labels above · bit state below"}</span></header>
    <div>${masks.map((mask) => {
      const bits = Array.isArray(mask.bits) ? mask.bits : [];
      return `<article class="abm-mask ${toneClass(mask.tone)}">
        <header><small>${escapeHtml(pick(mask.title))}</small><code>${escapeHtml(String(mask.value ?? 0))}<sub>10</sub></code></header>
        <div class="abm-bits">${bits.map((bit) => `<i class="${bit.on ? "on" : "off"} ${toneClass(bit.state)}"><small>${escapeHtml(String(bit.label ?? ""))}</small><b>${bit.on ? "1" : "0"}</b></i>`).join("")}</div>
      </article>`;
    }).join("")}</div>
  </section>` : "";

  const operation = view.operation;
  const operationHtml = operation ? `<section class="abm-operation ${toneClass(operation.status)}">
    <small>${escapeHtml(pick(operation.eyebrow))}</small>
    <strong>${escapeHtml(String(operation.formula || ""))}</strong>
    <span>${escapeHtml(pick(operation.detail))}</span>
  </section>` : "";

  const states = view.states;
  const statesHtml = states ? `<section class="abm-states">
    <header><strong>${escapeHtml(pick(states.title))}</strong><span>${escapeHtml(pick(states.hint))}</span></header>
    <div>${(Array.isArray(states.items) ? states.items : []).map((item) => `<article class="abm-state ${toneClass(item.state)}">
      <header><code>${escapeHtml(String(item.label || ""))}</code>${item.mask !== undefined ? `<small>mask ${escapeHtml(String(item.mask))}</small>` : ""}</header>
      <strong>${escapeHtml(String(item.value ?? ""))}</strong>
      <span>${escapeHtml(String(item.sub || ""))}</span>
    </article>`).join("") || `<p class="abm-empty">${vi ? "Chưa có state nào được lưu" : "No state has been stored yet"}</p>`}</div>
  </section>` : "";

  const result = view.result;
  const resultHtml = result ? `<section class="abm-result ${toneClass(result.status)}">
    <small>${escapeHtml(pick(result.label))}</small>
    <strong>${escapeHtml(String(result.value ?? ""))}</strong>
    <span>${escapeHtml(String(result.detail || ""))}</span>
  </section>` : "";
  const traceNotice = view.traceTruncated
    ? `<p class="abm-trace-note">${vi ? "Ví dụ lớn: chỉ hiển thị một phần trace để nút Prev/Next vẫn chạy mượt; kết quả vẫn được tính đầy đủ." : "Large example: only part of the trace is shown so Prev/Next stays responsive; the result is still fully computed."}</p>`
    : "";

  $("treeView").innerHTML = `<section class="abm-viz" role="img" aria-label="${escapeHtml(modeLabels[view.mode] || "Advanced bitmask visualization")}">
    <header><div><small>BITMASK WORKSHOP · #${escapeHtml(String(view.problemId || ""))}</small><strong>${escapeHtml(modeLabels[view.mode] || "ADVANCED BITMASK")}</strong></div><span>${escapeHtml(pick(step.title))}</span></header>
    <div class="abm-phases">${phasesHtml}</div>
    <section class="abm-rule"><b>${vi ? "Ý NGHĨA CỦA MASK" : "WHAT THE MASK MEANS"}</b><strong>${escapeHtml(pick(view.rule))}</strong></section>
    ${lanesHtml}
    ${masksHtml}
    ${operationHtml}
    ${statesHtml}
    ${resultHtml}
    ${traceNotice}
  </section>`;
}

function renderBitmaskBasicsView(step) {
  const view = step.bitmaskBasicsView || {};
  const vi = lang === "vi";
  const rows = Array.isArray(view.rows) ? view.rows : [];
  const stages = Array.isArray(view.stages) ? view.stages : [];
  const stageIndex = Number.isInteger(view.stageIndex) ? view.stageIndex : 0;
  const activeBit = Number.isInteger(view.activeBit) ? view.activeBit : -1;
  const width = Number.isInteger(view.width) ? view.width : Math.max(1, ...rows.map((row) => String(row.bits || "").length));
  const modeLabels = {
    "xor-fold": vi ? "XOR TRIỆT TIÊU CẶP" : "PAIR-CANCELING XOR",
    "xor-game": vi ? "TRÒ CHƠI XOR" : "CHALKBOARD XOR GAME",
    popcount: vi ? "ĐẾM BIT 1" : "COUNT SET BITS",
    "power-of-two": vi ? "KIỂM TRA LŨY THỪA 2" : "POWER OF TWO CHECK",
    "xor-distance": vi ? "XOR TÌM BIT KHÁC" : "XOR DIFFERENCE",
    complement: vi ? "LẬT BIT BẰNG MASK" : "FLIP BITS WITH A MASK",
    alternating: vi ? "KIỂM TRA BIT XEN KẼ" : "ALTERNATING BITS",
    "binary-gap": vi ? "ĐO KHOẢNG CÁCH BIT" : "MEASURE BINARY GAP",
    "reduce-zero": vi ? "DỊCH BIT VỀ 0" : "SHIFT DOWN TO ZERO",
  };
  const phasesHtml = stages.map((stage, index) => {
    const state = index === stageIndex ? "active" : index < stageIndex ? "done" : "";
    const label = pick(stage).replace(/^\d+\.\s*/, "");
    return `<span class="${state}"><b>${index < stageIndex ? "✓" : index + 1}</b>${escapeHtml(label)}</span>`;
  }).join("");

  const rowsHtml = rows.map((row, rowIndex) => {
    const rawBits = String(row.bits || "").padStart(width, "0");
    const bitsHtml = rawBits.split("").map((bit, displayIndex) => {
      const bitIndex = rawBits.length - 1 - displayIndex;
      const classes = ["bmb-bit", bit === "1" ? "on" : "off"];
      if (activeBit === bitIndex) classes.push("active");
      return `<span class="${classes.join(" ")}"><small>${bitIndex}</small><strong>${bit}</strong></span>`;
    }).join("");
    const tone = row.tone ? ` ${escapeHtml(String(row.tone))}` : "";
    return `<div class="bmb-row${tone}">
      <div class="bmb-row-label"><small>${escapeHtml(String(row.label || `row ${rowIndex + 1}`))}</small><strong>${escapeHtml(String(row.value ?? ""))}</strong></div>
      <div class="bmb-bits" aria-label="${escapeHtml(rawBits)}">${bitsHtml}</div>
    </div>`;
  }).join("") || `<div class="bmb-empty">${vi ? "Chưa có hàng bit" : "No bit row yet"}</div>`;

  const progress = view.progress;
  const progressHtml = progress
    ? (() => {
      const total = Math.max(0, Number(progress.total) || 0);
      const current = Math.max(0, Number(progress.current) || 0);
      const percent = total === 0 ? 100 : Math.min(100, Math.round((current / total) * 100));
      return `<section class="bmb-progress"><div><small>${escapeHtml(pick(progress.label))}</small><strong>${current}/${total}</strong></div><span role="progressbar" aria-valuemin="0" aria-valuemax="${total}" aria-valuenow="${current}"><i style="width:${percent}%"></i></span></section>`;
    })()
    : "";

  const trail = Array.isArray(view.trail) ? view.trail.slice(-8) : [];
  const trailHtml = trail.length
    ? `<section class="bmb-trail"><header><strong>${vi ? "DẤU VẾT TỪNG BƯỚC" : "STEP TRACE"}</strong><span>${vi ? "mới nhất ở bên phải" : "newest on the right"}</span></header><div>${trail.map((item) => `<article><small>${escapeHtml(String(item.label || ""))}</small><strong>${escapeHtml(String(item.value ?? ""))}</strong><code>${escapeHtml(String(item.bits || ""))}</code></article>`).join("")}</div></section>`
    : "";

  const result = view.result;
  const resultHtml = result
    ? `<section class="bmb-result ${escapeHtml(String(result.status || ""))}"><small>${escapeHtml(pick(result.label))}</small><strong>${escapeHtml(String(result.value))}</strong>${result.bits ? `<code>${escapeHtml(String(result.bits))}<sub>2</sub></code>` : ""}</section>`
    : "";
  const activeHint = activeBit >= 0
    ? (vi ? `Viền vàng đang đánh dấu bit ${activeBit}.` : `The amber outline marks bit ${activeBit}.`)
    : (vi ? "Các hàng đã được căn theo cùng vị trí bit." : "Rows are aligned by bit position.");
  const aria = `${modeLabels[view.mode] || "Bitmask"}. ${pick(step.title)}`;

  $("treeView").innerHTML = `<section class="bmb-viz" role="img" aria-label="${escapeHtml(aria)}">
    <header><div><small>BITMASK LAB · #${escapeHtml(String(view.problemId || ""))}</small><strong>${escapeHtml(modeLabels[view.mode] || "BITMASK")}</strong></div><span>${escapeHtml(pick(step.title))}</span></header>
    <div class="bmb-phases">${phasesHtml}</div>
    <section class="bmb-rule"><b>${vi ? "QUY TẮC" : "CORE RULE"}</b><strong>${escapeHtml(pick(view.rule))}</strong></section>
    <section class="bmb-board"><header><strong>${vi ? "CĂN THEO VỊ TRÍ BIT" : "BIT-POSITION ALIGNMENT"}</strong><span>${escapeHtml(activeHint)}</span></header><div class="bmb-board-scroll">${rowsHtml}</div></section>
    ${view.expression ? `<section class="bmb-operation"><small>${vi ? "PHÉP TÍNH HIỆN TẠI" : "CURRENT OPERATION"}</small><strong>${escapeHtml(pick(view.expression))}</strong><span>${escapeHtml(pick(step.note))}</span></section>` : ""}
    ${progressHtml}
    ${trailHtml}
    ${resultHtml}
  </section>`;
}

function renderCountBitsView(step) {
  const view = step.countBitsView || {};
  const vi = lang === "vi";
  const cells = Array.isArray(view.cells) ? view.cells : [];
  const f = view.formula;
  const phaseLabels = {
    init: vi ? "Khởi tạo" : "Initialize",
    compute: vi ? "Tính dp[i]" : "Compute dp[i]",
    done: vi ? "Hoàn tất" : "Complete",
  };

  // Split binary into prefix (i>>1) + last bit, coloring the last bit.
  let action = "";
  if (f) {
    const prefix = f.iBits.slice(0, -1) || "0";
    const last = f.iBits.slice(-1);
    action = `<span class="cb338-bits"><b>${prefix}</b><i class="last">${last}</i></span> = <span class="cb338-bits"><b>${prefix}</b></span>(=${f.half}, dp=${f.halfValue}) + <i class="cb338-lastbit">${f.lastBit}</i> → <b>dp[${f.i}] = ${f.result}</b>`;
  } else if (view.phase === "done") {
    action = `<b>[${(view.answer || []).join(", ")}]</b>`;
  } else {
    action = "dp[0] = 0";
  }

  const cellsHtml = cells.map((cell) => {
    const classes = ["cb338-cell"];
    if (cell.num === view.currentIndex) classes.push("current");
    if (cell.num === view.sourceIndex) classes.push("source");
    if (cell.value === null) classes.push("pending");
    const bitsHtml = cell.binary.split("").map((bit, idx) => {
      const isLast = idx === cell.binary.length - 1;
      return `<span class="cb338-bit${bit === "1" ? " on" : ""}${isLast ? " last" : ""}">${bit}</span>`;
    }).join("");
    return `<article class="${classes.join(" ")}"><small>${cell.num}</small><div class="cb338-binary">${bitsHtml}</div><strong>${cell.value === null ? "?" : cell.value}</strong></article>`;
  }).join("");

  $("treeView").innerHTML = `<section class="cb338-viz" role="img" aria-label="${vi ? "Trực quan hóa Counting Bits" : "Counting Bits visualization"}">
    <header><strong>COUNTING BITS</strong><span class="cb338-phase">${escapeHtml(phaseLabels[view.phase] || view.phase || "")}</span></header>
    <section class="cb338-rule"><b>CORE RULE</b><strong>dp[i] = dp[i &gt;&gt; 1] + (i &amp; 1)</strong><span>${vi ? "bỏ bit cuối (i>>1) để lấy dp đã biết, rồi cộng lại bit cuối (i&1)" : "drop the last bit (i>>1) to reuse a known dp, then add back the last bit (i&1)"}</span></section>
    <section class="cb338-action">${action}</section>
    <section class="cb338-grid">${cellsHtml}</section>
  </section>`;
}

function renderWordBreakView(step) {
  const view = step.wordBreakView || {};
  const vi = lang === "vi";
  const chars = String(view.s || "").split("");
  const dp = Array.isArray(view.dp) ? view.dp : [];
  const cand = view.candidate;
  const phaseLabels = {
    init: vi ? "Khởi tạo" : "Initialize",
    check: vi ? "Thử điểm cắt j" : "Try split j",
    fail: vi ? "Không cắt được" : "No cut",
    done: vi ? "Hoàn tất" : "Complete",
  };

  // String characters with the candidate substring s[j:i] highlighted.
  const charHtml = chars.map((ch, idx) => {
    const classes = ["wb139-char"];
    if (cand && idx >= cand.j && idx < cand.i) classes.push(cand.matched ? "match" : "trying");
    return `<span class="${classes.join(" ")}"><small>${idx}</small><strong>${escapeHtml(ch)}</strong></span>`;
  }).join("") || `<span class="wb139-empty">${vi ? "chuỗi rỗng" : "empty string"}</span>`;

  // dp cells over positions 0..n.
  const dpHtml = dp.map((val, pos) => {
    const classes = ["wb139-dp"];
    if (pos === view.currentI) classes.push("current");
    if (cand && pos === cand.j) classes.push("source");
    classes.push(val ? "t" : "f");
    return `<span class="${classes.join(" ")}"><small>${pos}</small><strong>${val ? "T" : "F"}</strong></span>`;
  }).join("");

  const dictHtml = (view.wordDict || []).map((w) => {
    const active = cand && cand.word === w && cand.inDict ? " active" : "";
    return `<span class="wb139-word${active}">${escapeHtml(w)}</span>`;
  }).join("") || `<span class="wb139-empty">${vi ? "từ điển rỗng" : "empty dict"}</span>`;

  let action = "";
  if (cand) {
    const dpOk = cand.dpJ ? "✓" : "✗";
    const dictOk = cand.inDict ? "✓" : "✗";
    action = `dp[${cand.j}] ${dpOk} &nbsp;&&&nbsp; "${escapeHtml(cand.word)}" ∈ dict ${dictOk} → ${cand.matched ? `<b>dp[${cand.i}] = True</b>` : "thử tiếp"}`;
  } else if (view.phase === "done") {
    action = view.answer
      ? `<b>${vi ? "Tách được" : "Segmentable"}</b>: ${(view.segmentation || []).map((w) => `"${escapeHtml(w)}"`).join(" + ")}`
      : `<b>${vi ? "Không tách được" : "Not segmentable"}</b>`;
  } else if (view.phase === "fail") {
    action = `dp[${view.currentI}] = False`;
  } else {
    action = vi ? "dp[0] = True (chuỗi rỗng)" : "dp[0] = True (empty string)";
  }

  $("treeView").innerHTML = `<section class="wb139-viz" role="img" aria-label="${vi ? "Trực quan hóa Word Break" : "Word Break visualization"}">
    <header><strong>WORD BREAK</strong><span class="wb139-phase">${escapeHtml(phaseLabels[view.phase] || view.phase || "")}</span></header>
    <section class="wb139-rule"><b>CORE RULE</b><strong>dp[i] = ∃ j: dp[j] and s[j:i] ∈ dict</strong><span>${vi ? "cắt tại j: phần trái dp[j] phải tách được, phần phải s[j:i] phải là một từ" : "cut at j: left part dp[j] must be segmentable, right part s[j:i] must be a word"}</span></section>
    <section class="wb139-panel"><header><strong>${vi ? "TỪ ĐIỂN" : "DICTIONARY"}</strong></header><div class="wb139-words">${dictHtml}</div></section>
    <section class="wb139-panel"><header><strong>s</strong><span>${vi ? "tô = đoạn s[j:i] đang thử" : "highlight = current s[j:i]"}</span></header><div class="wb139-chars">${charHtml}</div></section>
    <section class="wb139-action">${action}</section>
    <section class="wb139-panel"><header><strong>dp[0..${view.n}]</strong><span>${vi ? "T = tách được tới vị trí đó" : "T = prefix segmentable"}</span></header><div class="wb139-dps">${dpHtml}</div></section>
  </section>`;
}

function renderCoinChangeView(step) {
  const view = step.coinChangeView || {};
  const vi = lang === "vi";
  const cells = Array.isArray(view.cells) ? view.cells : [];
  const phaseLabels = {
    init: vi ? "Khởi tạo" : "Initialize",
    base: vi ? "Cơ sở" : "Base case",
    compute: vi ? "Tính ô mới" : "Compute cell",
    try: vi ? "Thử xu" : "Try coin",
    update: vi ? "Cập nhật" : "Update",
    done: vi ? "Hoàn tất" : "Complete",
  };

  const cellsHtml = cells.map((cell) => {
    const classes = ["cc322-cell"];
    if (cell.amount === view.currentIndex) classes.push("current");
    if (cell.amount === view.sourceIndex) classes.push("source");
    const valueText = cell.value === null ? "∞" : cell.value;
    const chips = Array.isArray(cell.coins) && cell.coins.length
      ? cell.coins.map((coin) => `<span class="cc322-coin">${coin}</span>`).join("")
      : (cell.value === 0 ? `<span class="cc322-none">∅</span>` : "");
    return `<div class="${classes.join(" ")}">
      <small>[${cell.amount}]</small>
      <strong>${valueText}</strong>
      <div class="cc322-coins">${chips}</div>
    </div>`;
  }).join("");

  let action = "";
  if (view.phase === "try" || view.phase === "update") {
    const src = view.sourceIndex >= 0 ? `dp[${view.sourceIndex}]` : "—";
    action = `dp[${view.currentIndex}] ← min(dp[${view.currentIndex}], ${src} + 1×<span class="cc322-coin sm">${view.currentCoin}</span>)`;
  } else if (view.phase === "done") {
    action = view.answer < 0
      ? (vi ? "không tạo được → −1" : "cannot form → −1")
      : `dp[${view.amount}] = <b>${view.answer}</b>`;
  } else if (view.phase === "compute") {
    action = `${vi ? "đang tính" : "computing"} dp[${view.currentIndex}]`;
  } else {
    action = vi ? "chuẩn bị bảng dp" : "prepare dp table";
  }

  const coinLegend = view.coins.map((coin) => `<span class="cc322-coin">${coin}</span>`).join("");

  $("treeView").innerHTML = `<section class="cc322-viz" role="img" aria-label="${vi ? "Trực quan hóa Coin Change" : "Coin Change visualization"}">
    <header><strong>COIN CHANGE</strong><span class="cc322-phase">${escapeHtml(phaseLabels[view.phase] || view.phase || "")}</span></header>
    <section class="cc322-rule"><b>CORE RULE</b><strong>dp[i] = min(dp[i − coin] + 1)</strong><span>${vi ? "mỗi ô = số xu ít nhất; chip bên trong = các xu tạo nên số tiền đó" : "each cell = fewest coins; chips inside = the coins that build that amount"}</span></section>
    <section class="cc322-action"><small>${vi ? "XU CÓ" : "COINS"}: </small><span class="cc322-legend">${coinLegend}</span><strong>${action}</strong></section>
    <section class="cc322-grid">${cellsHtml}</section>
  </section>`;
}

function renderMissingNumberView(step) {
  const view = step.missingNumberView || {};
  const vi = lang === "vi";
  const nums = Array.isArray(view.nums) ? view.nums : [];
  const board = Array.isArray(view.board) ? view.board : [];
  const isSum = view.method === "sum";

  const cellsHtml = nums.map((value, index) => {
    const classes = ["mn268-cell"];
    if (index === view.currentIndex) classes.push("active");
    return `<span class="${classes.join(" ")}"><small>[${index}]</small><strong>${value}</strong></span>`;
  }).join("") || `<span class="mn268-empty">${vi ? "mảng rỗng" : "empty array"}</span>`;

  const boardHint = isSum
    ? (vi ? "✓ = đã cộng vào actual · xanh = số còn lại" : "✓ = added to actual · green = remaining")
    : (vi ? "✓ = đã triệt tiêu · xanh = số còn lại" : "✓ = canceled · green = remaining");
  const boardHtml = board.map((cell) => {
    const classes = ["mn268-board-cell"];
    if (cell.isResult) classes.push("result");
    else if (cell.current) classes.push("current");
    else if (cell.canceled) classes.push("canceled");
    return `<span class="${classes.join(" ")}"><strong>${cell.num}</strong><em>${cell.isResult ? (vi ? "còn lại" : "remains") : cell.canceled ? "✓" : ""}</em></span>`;
  }).join("");

  const numsPanel = `<section class="mn268-panel"><header><strong>nums</strong><span>${isSum ? (vi ? "vàng = phần tử đang cộng" : "yellow = element being added") : (vi ? "vàng = phần tử đang gộp" : "yellow = element being folded")}</span></header><div class="mn268-cells">${cellsHtml}</div></section>`;
  const boardPanel = `<section class="mn268-panel"><header><strong>${vi ? `BẢNG 0..${view.n}` : `BOARD 0..${view.n}`}</strong><span>${boardHint}</span></header><div class="mn268-board">${boardHtml}</div></section>`;

  if (isSum) {
    const phaseLabels = {
      expected: vi ? "Tổng mong đợi" : "Expected sum",
      actual: vi ? "Tổng thực tế" : "Actual sum",
      diff: vi ? "Lấy hiệu" : "Take the difference",
      done: vi ? "Hoàn tất" : "Complete",
    };
    let action = "";
    if (view.phase === "expected") action = `expected_sum = 0+1+…+${view.n} = <b>${view.expectedSum}</b>`;
    else if (view.phase === "actual") action = `actual_sum = <b>${view.actualSum}</b>`;
    else action = `missing = ${view.expectedSum} − ${view.actualSum} = <b>${view.missing}</b>`;
    const accents = `<section class="mn268-sums">
      <div class="mn268-sum expected"><small>expected_sum</small><strong>${view.expectedSum}</strong><em>Σ 0..${view.n}</em></div>
      <div class="mn268-sum actual ${view.actualReady ? "ready" : ""}"><small>actual_sum</small><strong>${view.actualSum}</strong><em>Σ nums</em></div>
      <div class="mn268-sum diff ${view.missing === null ? "" : "ready"}"><small>missing</small><strong>${view.missing === null ? "—" : view.missing}</strong><em>expected − actual</em></div>
    </section>`;
    $("treeView").innerHTML = `<section class="mn268-viz" role="img" aria-label="${vi ? "Trực quan hóa Missing Number bằng tổng Gauss" : "Missing Number Gauss-sum visualization"}">
      <header><strong>MISSING NUMBER · SUM</strong><span class="mn268-phase">${escapeHtml(phaseLabels[view.phase] || view.phase || "")}</span></header>
      <section class="mn268-rule"><b>CORE RULE</b><strong>Σ(0..n) − Σ(nums) = missing</strong><span>${vi ? `Tổng đầy đủ của 0..${view.n} trừ tổng các giá trị có mặt để lộ số bị thiếu.` : `The full sum of 0..${view.n} minus the sum of present values reveals the missing number.`}</span></section>
      <section class="mn268-action"><small>${vi ? "PHÉP TÍNH" : "OPERATION"}</small><strong>${action}</strong></section>
      ${accents}
      ${numsPanel}
      ${boardPanel}
    </section>`;
    return;
  }

  const phaseLabels = {
    init: vi ? "Khởi tạo" : "Initialize",
    fold: vi ? "Gộp XOR" : "Fold XOR",
    done: vi ? "Hoàn tất" : "Complete",
  };
  let action = "";
  if (view.pair) {
    action = `result ^= ${view.pair.index} ^ ${view.pair.value} : ${view.pair.previous} → <b>${view.result}</b>`;
  } else if (view.phase === "init") {
    action = `result = n = <b>${view.result}</b>`;
  } else if (view.phase === "done") {
    action = `${vi ? "số bị thiếu" : "missing number"} = <b>${view.result}</b>`;
  }
  const resultBox = `<section class="mn268-result"><small>result</small><strong>${view.result}</strong><code>${view.resultBits}₂</code></section>`;

  $("treeView").innerHTML = `<section class="mn268-viz" role="img" aria-label="${vi ? "Trực quan hóa Missing Number bằng XOR" : "Missing Number XOR visualization"}">
    <header><strong>MISSING NUMBER · XOR</strong><span class="mn268-phase">${escapeHtml(phaseLabels[view.phase] || view.phase || "")}</span></header>
    <section class="mn268-rule"><b>CORE RULE</b><strong>a ^ a = 0 · a ^ 0 = a</strong><span>${vi ? `XOR mọi index 0..${view.n} và mọi giá trị → cặp bằng nhau triệt tiêu, còn lại số thiếu.` : `XOR every index 0..${view.n} and every value → equal pairs cancel, leaving the missing number.`}</span></section>
    <section class="mn268-action"><small>${vi ? "PHÉP TÍNH" : "OPERATION"}</small><strong>${action}</strong></section>
    ${resultBox}
    ${numsPanel}
    ${boardPanel}
  </section>`;
}

function renderAlmostMissingView(step) {
  const view = step.almostMissingView || {};
  const vi = lang === "vi";
  const nums = Array.isArray(view.nums) ? view.nums : [];
  const highlight = new Set(view.highlight || []);
  const windowRange = view.windowRange;
  const inWindow = (index) => Array.isArray(windowRange) && index >= windowRange[0] && index <= windowRange[1];
  const caseLabels = {
    k1: vi ? "k = 1" : "k = 1",
    kn: vi ? "k = n" : "k = n",
    general: vi ? "1 < k < n" : "1 < k < n",
  };
  const phaseLabels = {
    setup: vi ? "Chuẩn bị" : "Setup",
    count: vi ? "Đếm tần suất" : "Count frequency",
    k1: vi ? "Trường hợp k = 1" : "Case k = 1",
    kn: vi ? "Trường hợp k = n" : "Case k = n",
    general: vi ? "Xét hai đầu" : "Check both ends",
    done: vi ? "Hoàn tất" : "Complete",
  };

  const cellsHtml = nums.map((value, index) => {
    const classes = ["am3471-cell"];
    if (highlight.has(index)) classes.push("hit");
    if (inWindow(index)) classes.push("window");
    if (index === 0 || index === nums.length - 1) classes.push("edge");
    return `<span class="${classes.join(" ")}"><small>[${index}]</small><strong>${value}</strong></span>`;
  }).join("");

  const windowNote = Array.isArray(windowRange)
    ? `<p class="am3471-window-note">${vi ? "Cửa sổ đang xét" : "Current window"}: [${windowRange[0]}..${windowRange[1]}]</p>`
    : "";

  let freqSection = "";
  if (Array.isArray(view.freq) && view.freq.length) {
    const chips = view.freq.map((entry) => `<span class="am3471-freq ${entry.count === 1 ? "single" : "multi"}"><b>${entry.value}</b><em>×${entry.count}</em></span>`).join("");
    freqSection = `<section class="am3471-panel"><header><strong>${vi ? "TẦN SUẤT" : "FREQUENCY"}</strong><span>${vi ? "xanh = xuất hiện đúng 1 lần" : "green = appears exactly once"}</span></header><div class="am3471-freqs">${chips}</div></section>`;
  }

  let candidateSection = "";
  if (Array.isArray(view.candidates) && view.candidates.length) {
    const cards = view.candidates.map((candidate, order) => {
      const roleLabel = candidate.role === "start"
        ? (vi ? "Đầu · nums[0]" : "Start · nums[0]")
        : (vi ? `Cuối · nums[${view.n - 1}]` : `End · nums[${view.n - 1}]`);
      const state = candidate.valid === null ? "pending" : candidate.valid ? "valid" : "invalid";
      const active = order === view.activeCandidate ? " active" : "";
      const status = candidate.valid === null
        ? (vi ? "chưa xét" : "not checked")
        : candidate.valid
          ? (vi ? "hợp lệ (1 lần)" : "valid (once)")
          : (vi ? `bị loại (${candidate.occurrences.length} lần)` : `rejected (${candidate.occurrences.length}×)`);
      return `<article class="am3471-candidate ${state}${active}"><small>${roleLabel}</small><strong>${candidate.value}</strong><em>${status}</em><span>idx: [${candidate.occurrences.join(", ")}]</span></article>`;
    }).join("");
    candidateSection = `<section class="am3471-panel"><header><strong>${vi ? "ỨNG VIÊN" : "CANDIDATES"}</strong><span>${vi ? "chỉ hai đầu mảng" : "only the two ends"}</span></header><div class="am3471-candidates">${cards}</div></section>`;
  }

  const answerText = view.answer === null || view.answer === undefined
    ? (vi ? "đang tính…" : "computing…")
    : view.answer;

  $("treeView").innerHTML = `<section class="am3471-viz" role="img" aria-label="${vi ? "Trực quan hóa almost missing integer" : "Almost missing integer visualization"}">
    <header><strong>ALMOST MISSING INTEGER</strong><span class="am3471-phase">${escapeHtml(phaseLabels[view.phase] || view.phase || "")}</span></header>
    <section class="am3471-rule"><b>${escapeHtml(caseLabels[view.caseType] || "")}</b><strong>${vi ? "'almost missing' = nằm trong ĐÚNG 1 cửa sổ độ dài k" : "almost missing = inside EXACTLY 1 window of length k"}</strong><span>${vi ? `số cửa sổ = n − k + 1 = ${view.windowCount}` : `windows = n − k + 1 = ${view.windowCount}`}</span></section>
    <section class="am3471-panel"><header><strong>nums</strong><span>${vi ? "vàng = đang tô · xanh = hai đầu" : "yellow = highlighted · green = ends"}</span></header><div class="am3471-cells">${cellsHtml}</div>${windowNote}</section>
    ${freqSection}
    ${candidateSection}
    <section class="am3471-answer"><small>${vi ? "ĐÁP ÁN" : "ANSWER"}</small><strong>${answerText}</strong></section>
  </section>`;
}

function renderPascalTriangleView(step) {
  const view = step.pascalTriangleView || {};
  const vi = lang === "vi";
  const committedRows = Array.isArray(view.rows) ? view.rows : [];
  const allRows = committedRows.map((row) => ({ cells: row, working: false }));
  if (Array.isArray(view.workingRow)) allRows.push({ cells: view.workingRow, working: true });
  const active = view.active || {};
  const parents = new Set((view.parents || []).map((cell) => `${cell.row}:${cell.col}`));
  const phaseLabels = {
    setup: vi ? "Khởi tạo" : "Initialize",
    "start-row": vi ? "Tạo hàng" : "Create row",
    "seed-edges": vi ? "Đặt hai biên" : "Set edges",
    "sum-parents": vi ? "Cộng hai ô cha" : "Add parents",
    "commit-row": vi ? "Chốt hàng" : "Commit row",
    done: vi ? "Hoàn tất" : "Complete",
  };
  const triangleHtml = allRows.map(({ cells, working }, row) => {
    const rowClasses = `pascal118-row${working ? " working" : ""}${active.row === row && active.col === null ? " active-row" : ""}`;
    const cellsHtml = cells.map((value, col) => {
      const key = `${row}:${col}`;
      const classes = ["pascal118-cell"];
      if (parents.has(key)) classes.push("parent");
      if (active.row === row && active.col === col) classes.push("active");
      if (value === null) classes.push("pending");
      else if (col === 0 || col === cells.length - 1) classes.push("edge");
      return `<span class="${classes.join(" ")}" title="row ${row}, col ${col}"><small>${row},${col}</small><strong>${value === null ? "?" : value}</strong></span>`;
    }).join("");
    return `<div class="${rowClasses}">${cellsHtml}</div>`;
  }).join("") || `<p class="pascal118-empty">${vi ? "Tam giác đang rỗng" : "Triangle is empty"}</p>`;

  let action = vi ? "Bắt đầu xây tam giác từ hàng 0." : "Start building the triangle from row 0.";
  let detail = vi ? "" : "";
  if (view.formula) {
    const formula = view.formula;
    action = `current[${formula.col}] = ${formula.leftParent} + ${formula.rightParent} = <b>${formula.result}</b>`;
    detail = vi
      ? `Hai ô tím ở hàng ${formula.row - 1} đi vào ô vàng ở hàng ${formula.row}.`
      : `The two purple cells in row ${formula.row - 1} feed the yellow cell in row ${formula.row}.`;
  } else if (view.phase === "seed-edges") {
    action = vi ? "Hai cạnh của mọi hàng đều là 1" : "Both edges of every row are 1";
    detail = vi ? "Chỉ các ô ở giữa mới cần cộng hai ô cha." : "Only inner cells need two-parent addition.";
  } else if (view.phase === "commit-row") {
    action = vi ? "Hàng hoàn chỉnh → dùng làm hàng cha kế tiếp" : "Completed row → becomes the next parent row";
  } else if (view.phase === "done") {
    action = vi ? `Đã tạo đủ ${view.numRows} hàng` : `Generated all ${view.numRows} rows`;
  }

  $("treeView").innerHTML = `<section class="pascal118-viz" role="img" aria-label="${vi ? "Trực quan hóa tam giác Pascal" : "Pascal triangle visualization"}">
    <header><strong>PASCAL'S TRIANGLE</strong><span class="pascal118-phase">${escapeHtml(phaseLabels[view.phase] || view.phase || "")}</span></header>
    <section class="pascal118-rule"><b>CORE RULE</b><strong>edge = 1 · inner = upper-left + upper-right</strong><span>${vi ? "Mỗi số bên trong nhận giá trị từ đúng hai ô cha phía trên." : "Every inner value comes from exactly two parent cells above."}</span></section>
    <section class="pascal118-action"><small>${vi ? "ĐANG THỰC HIỆN" : "CURRENT ACTION"}</small><strong>${action}</strong>${detail ? `<span>${escapeHtml(detail)}</span>` : ""}</section>
    <section class="pascal118-triangle"><header><strong>${vi ? "TAM GIÁC ĐANG XÂY" : "TRIANGLE UNDER CONSTRUCTION"}</strong><span>${vi ? "tím = cha · vàng = đang tạo · xanh = cạnh = 1" : "purple = parents · yellow = current · green = edge = 1"}</span></header><div>${triangleHtml}</div></section>
  </section>`;
}

function renderFibonacciView(step) {
  const view = step.fibonacciView || {};
  const vi = lang === "vi";
  const terms = Array.isArray(view.stairs) ? view.stairs : [];
  const labels = {
    base: vi ? "Base case" : "Base case",
    preview: vi ? "Chuẩn bị cộng" : "Prepare addition",
    calculate: vi ? "Cộng 2 số trước" : "Add 2 previous terms",
    "shift-prev2": vi ? "Dịch prev2" : "Shift prev2",
    "shift-prev1": vi ? "Dịch prev1" : "Shift prev1",
    done: vi ? "Hoàn tất" : "Complete",
  };
  const termHtml = terms.map((term) => {
    const value = term.ways === null ? "?" : term.ways;
    const status = term.ways === null ? (vi ? "chưa tính" : "not computed") : (vi ? "đã biết" : "known");
    return `<article class="cs70-stair ${term.state}"><small>F(${term.step})</small><strong>${value}</strong><em>${status}</em></article>`;
  }).join("");

  let equation = vi ? "Dãy được tính từ trái sang phải." : "The sequence is computed left to right.";
  let reason = "";
  if (view.formula) {
    const formula = view.formula;
    equation = `F(${formula.target}) = F(${formula.oneStep}) + F(${formula.twoSteps}) = ${formula.oneValue} + ${formula.twoValue} = <b>${formula.result}</b>`;
    reason = vi
      ? `Số Fibonacci mới bằng tổng của đúng hai số đứng ngay trước nó.`
      : `Every new Fibonacci number is the sum of exactly the two preceding numbers.`;
  } else if (view.phase === "base") {
    equation = view.target === 0
      ? "F(0) = <b>0</b>"
      : "F(1) = <b>1</b>";
    reason = vi ? "Đây là hai giá trị cơ sở của dãy Fibonacci." : "These are the two base values of the Fibonacci sequence.";
  } else if (view.phase === "preview") {
    const target = view.target;
    equation = `F(${target}) = F(${target - 1}) + F(${target - 2})`;
    reason = vi ? "Hai ô tím là hai số sẽ được cộng ở bước kế tiếp." : "The two purple cells are the terms that will be added next.";
  } else if (view.phase === "done") {
    const target = Number.isInteger(view.target) ? view.target : view.n;
    const result = terms[target] ? terms[target].ways : "?";
    equation = `F(${target}) = <b>${result}</b>`;
    reason = vi ? "Ô cuối là số Fibonacci cần trả về." : "The final cell is the Fibonacci number to return.";
  } else if (view.phase === "shift-prev2" || view.phase === "shift-prev1") {
    equation = view.phase === "shift-prev2" ? "prev2 ← prev1" : "prev1 ← curr";
    reason = vi ? "Dịch cửa sổ 2 biến để chuẩn bị cho số tiếp theo." : "Shift the two-variable window for the next number.";
  }

  const rolling = view.rolling;
  const rollingHtml = rolling ? [
    ["prev2", rolling.prev2, vi ? "2 số trước" : "two terms back"],
    ["prev1", rolling.prev1, vi ? "số trước" : "previous term"],
    ["curr", rolling.curr, vi ? "số mới" : "new term"],
  ].map(([name, item, hint]) => `<article class="cs70-register ${item ? "filled" : "empty"}"><small>${name}</small><strong>${item ? item.value : "—"}</strong><em>${item ? `F(${item.step})` : hint}</em></article>`).join("") : "";
  const method = Number(view.approach) === 2
    ? (vi ? "APPROACH 2 · chỉ giữ 2 biến" : "APPROACH 2 · keep only 2 variables")
    : (vi ? "APPROACH 1 · bảng DP" : "APPROACH 1 · DP table");
  const rollingSection = rollingHtml ? `<section class="cs70-rolling"><header><strong>${vi ? "BỘ NHỚ ĐANG GIỮ" : "LIVE MEMORY"}</strong><span>${vi ? "cửa sổ 2 giá trị" : "two-value window"}</span></header><div>${rollingHtml}</div></section>` : "";

  $("treeView").innerHTML = `<section class="cs70-viz" role="img" aria-label="${vi ? "Trực quan hóa số Fibonacci" : "Fibonacci-number visualization"}">
    <header><strong>FIBONACCI NUMBER</strong><span class="cs70-phase">${escapeHtml(labels[view.phase] || view.phase || "")}</span></header>
    <section class="cs70-rule"><b>CORE RULE</b><strong>F(i) = F(i−1) + F(i−2)</strong><span>${vi ? "Mỗi số mới là tổng của hai số liền trước." : "Each new term is the sum of its two previous terms."}</span></section>
    <section class="cs70-action"><small>${escapeHtml(method)}</small><strong>${equation}</strong>${reason ? `<span>${escapeHtml(reason)}</span>` : ""}</section>
    ${rollingSection}
    <section class="cs70-table"><header><strong>${vi ? "BẢNG FIBONACCI F(i)" : "FIBONACCI TABLE F(i)"}</strong><span>${vi ? "tím = 2 nguồn · vàng = ô đang tính · xanh = đã biết" : "purple = 2 sources · yellow = current target · green = known"}</span></header><div class="cs70-stairs">${termHtml}</div></section>
  </section>`;
}

function renderTribonacciView(step) {
  const view = step.tribonacciView || {};
  const vi = lang === "vi";
  const terms = Array.isArray(view.terms) ? view.terms : [];
  const labels = {
    base: vi ? "Base case" : "Base case",
    calculate: vi ? "Cộng 3 số trước" : "Add 3 previous terms",
    done: vi ? "Hoàn tất" : "Complete",
  };

  const termHtml = terms.map((term) => {
    const value = term.value === null ? "?" : term.value;
    const status = term.value === null ? (vi ? "chưa tính" : "not computed") : (vi ? "đã biết" : "known");
    return `<article class="cs70-stair ${term.state}"><small>T(${term.step})</small><strong>${value}</strong><em>${status}</em></article>`;
  }).join("");

  let equation = vi ? "Dãy được tính từ trái sang phải." : "The sequence is computed left to right.";
  let reason = "";
  if (view.formula) {
    const f = view.formula;
    equation = `T(${f.target}) = T(${f.s[2]}) + T(${f.s[1]}) + T(${f.s[0]}) = ${f.values[2]} + ${f.values[1]} + ${f.values[0]} = <b>${f.result}</b>`;
    reason = vi
      ? "Mỗi số Tribonacci mới bằng tổng của đúng ba số đứng ngay trước nó."
      : "Every new Tribonacci number is the sum of exactly the three preceding numbers.";
  } else if (view.phase === "base") {
    equation = "T(0) = <b>0</b>,  T(1) = <b>1</b>,  T(2) = <b>1</b>";
    reason = vi ? "Đây là ba giá trị cơ sở của dãy Tribonacci." : "These are the three base values of the Tribonacci sequence.";
  } else if (view.phase === "done") {
    const target = Number.isInteger(view.target) ? view.target : view.n;
    const result = terms[target] ? terms[target].value : "?";
    equation = `T(${target}) = <b>${result}</b>`;
    reason = vi ? "Ô cuối là số Tribonacci cần trả về." : "The final cell is the Tribonacci number to return.";
  }

  const rolling = view.rolling;
  const rollingHtml = rolling ? [
    ["a", rolling.a, vi ? "3 số trước" : "three terms back"],
    ["b", rolling.b, vi ? "2 số trước" : "two terms back"],
    ["c", rolling.c, vi ? "số trước" : "previous term"],
    ["next", rolling.next, vi ? "số mới" : "new term"],
  ].map(([name, item, hint]) => `<article class="cs70-register ${item ? "filled" : "empty"}"><small>${name}</small><strong>${item ? item.value : "—"}</strong><em>${item ? `T(${item.step})` : hint}</em></article>`).join("") : "";

  const method = Number(view.approach) === 2
    ? (vi ? "APPROACH 2 · chỉ giữ 3 biến" : "APPROACH 2 · keep only 3 variables")
    : (vi ? "APPROACH 1 · bảng DP" : "APPROACH 1 · DP table");
  const rollingSection = rollingHtml
    ? `<section class="cs70-rolling four"><header><strong>${vi ? "BỘ NHỚ ĐANG GIỮ" : "LIVE MEMORY"}</strong><span>${vi ? "cửa sổ 3 giá trị → số mới" : "three-value window → new term"}</span></header><div>${rollingHtml}</div></section>`
    : "";

  $("treeView").innerHTML = `<section class="cs70-viz" role="img" aria-label="${vi ? "Trực quan hóa số Tribonacci" : "Tribonacci-number visualization"}">
    <header><strong>TRIBONACCI NUMBER</strong><span class="cs70-phase">${escapeHtml(labels[view.phase] || view.phase || "")}</span></header>
    <section class="cs70-rule"><b>CORE RULE</b><strong>T(i) = T(i−1) + T(i−2) + T(i−3)</strong><span>${vi ? "Mỗi số mới là tổng của ba số liền trước." : "Each new term is the sum of its three previous terms."}</span></section>
    <section class="cs70-action"><small>${escapeHtml(method)}</small><strong>${equation}</strong>${reason ? `<span>${escapeHtml(reason)}</span>` : ""}</section>
    ${rollingSection}
    <section class="cs70-table"><header><strong>${vi ? "BẢNG TRIBONACCI T(i)" : "TRIBONACCI TABLE T(i)"}</strong><span>${vi ? "tím = 3 nguồn · vàng = ô đang tính · xanh = đã biết" : "purple = 3 sources · yellow = current target · green = known"}</span></header><div class="cs70-stairs">${termHtml}</div></section>
  </section>`;
}

function renderClimbingStairsView(step) {
  const view = step.climbingStairsView || {};
  const vi = lang === "vi";
  const stairs = Array.isArray(view.stairs) ? view.stairs : [];
  const formula = view.formula;
  const labels = {
    setup: vi ? "Tạo bảng" : "Build table",
    base: vi ? "Base case" : "Base case",
    calculate: vi ? "Cộng 2 đường đi" : "Add 2 paths",
    "shift-prev2": vi ? "Dịch prev2" : "Shift prev2",
    "shift-prev1": vi ? "Dịch prev1" : "Shift prev1",
    done: vi ? "Hoàn tất" : "Complete",
  };
  const stairHtml = stairs.map((stair) => {
    const value = stair.ways === null ? "?" : stair.ways;
    const status = stair.ways === null ? (vi ? "chưa tính" : "not computed") : (vi ? "đã biết" : "known");
    return `<article class="cs70-stair ${stair.state}"><small>${vi ? "BẬC" : "STEP"} ${stair.step}</small><strong>${value}</strong><em>${status}</em></article>`;
  }).join("");

  let equation = vi ? "Mỗi bậc sẽ được tính dần." : "Each step is computed in order.";
  let reason = vi ? "" : "";
  if (formula) {
    equation = `ways(${formula.target}) = ways(${formula.oneStep}) + ways(${formula.twoSteps}) = ${formula.oneValue} + ${formula.twoValue} = <b>${formula.result}</b>`;
    reason = vi
      ? `Bậc ${formula.target}: bước cuối đi từ bậc ${formula.oneStep} bằng 1 bước HOẶC bậc ${formula.twoSteps} bằng 2 bước.`
      : `For step ${formula.target}: the last move comes from step ${formula.oneStep} with 1 step OR step ${formula.twoSteps} with 2 steps.`;
  } else if (view.phase === "base") {
    equation = view.target === 0
      ? (vi ? "ways(0) = 1  →  có 1 cách: chưa leo bước nào" : "ways(0) = 1  →  one way: take no steps")
      : (vi ? "ways(1) = 1  →  chỉ leo một bước 1" : "ways(1) = 1  →  take one 1-step move");
  } else if (view.phase === "done") {
    const target = Number.isInteger(view.target) ? view.target : view.n;
    const result = stairs[target] ? stairs[target].ways : "?";
    equation = `ways(${target}) = <b>${result}</b>`;
    reason = vi ? "Đây là số cách để chạm đúng bậc đích." : "This is the number of ways to reach the target step.";
  }

  const rolling = view.rolling;
  const rollingHtml = rolling ? [
    ["prev2", rolling.prev2, vi ? "2 bậc trước" : "two steps back"],
    ["prev1", rolling.prev1, vi ? "1 bậc trước" : "one step back"],
    ["curr", rolling.curr, vi ? "kết quả mới" : "new result"],
  ].map(([name, item, hint]) => `<article class="cs70-register ${item ? "filled" : "empty"}"><small>${name}</small><strong>${item ? item.value : "—"}</strong><em>${item ? `ways(${item.step})` : hint}</em></article>`).join("") : "";

  const method = Number(view.approach) === 2
    ? (vi ? "APPROACH 2 · chỉ giữ 2 biến" : "APPROACH 2 · keep only 2 variables")
    : (vi ? "APPROACH 1 · bảng DP" : "APPROACH 1 · DP table");
  const rollingSection = rollingHtml ? `<section class="cs70-rolling"><header><strong>${vi ? "BỘ NHỚ ĐANG GIỮ" : "LIVE MEMORY"}</strong><span>${vi ? "cửa sổ 2 giá trị" : "two-value window"}</span></header><div>${rollingHtml}</div></section>` : "";

  $("treeView").innerHTML = `<section class="cs70-viz" role="img" aria-label="${vi ? "Trực quan hóa quy hoạch động leo cầu thang" : "Climbing stairs dynamic-programming visualization"}">
    <header><strong>CLIMBING STAIRS</strong><span class="cs70-phase">${escapeHtml(labels[view.phase] || view.phase || "")}</span></header>
    <section class="cs70-rule"><b>CORE RULE</b><strong>ways(i) = ways(i−1) + ways(i−2)</strong><span>${vi ? "Bước cuối chỉ có 2 lựa chọn: +1 hoặc +2." : "The final move has only 2 choices: +1 or +2."}</span></section>
    <section class="cs70-action"><small>${escapeHtml(method)}</small><strong>${equation}</strong>${reason ? `<span>${escapeHtml(reason)}</span>` : ""}</section>
    ${rollingSection}
    <section class="cs70-table"><header><strong>${vi ? "BẢNG SỐ CÁCH ways(i)" : "WAYS(i) TABLE"}</strong><span>${vi ? "tím = 2 nguồn · vàng = ô đang tính · xanh = đã biết" : "purple = 2 sources · yellow = current target · green = known"}</span></header><div class="cs70-stairs">${stairHtml}</div></section>
  </section>`;
}

function renderMapSumView(step) {
  const view = step.mapSumView || {};
  const vi = lang === "vi";
  const operations = Array.isArray(view.operations) ? view.operations : [];
  const path = Array.isArray(view.path) ? view.path : [];
  const values = Array.isArray(view.values) ? view.values : [];
  const outputs = Array.isArray(view.outputs) ? view.outputs : [];
  const operation = view.operation || null;
  const target = String(view.target || "");
  const phaseIndex = ["init", "operation"].includes(view.phase) ? 0
    : view.phase === "delta" ? 1
      : ["walk", "update"].includes(view.phase) ? 2
        : 3;
  const phaseLabels = vi
    ? ["1 · Đọc thao tác", "2 · Tính delta", "3 · Đi Trie & cập nhật", "4 · Trả prefix sum"]
    : ["1 · Read operation", "2 · Compute delta", "3 · Walk Trie & update", "4 · Return prefix sum"];
  const phases = phaseLabels.map((label, index) => {
    const skippedDelta = operation && operation.type === "sum" && index === 1;
    const done = view.phase === "done" || index < phaseIndex || skippedDelta;
    return `<span class="${done ? "done" : index === phaseIndex ? "active" : "pending"}">${skippedDelta ? "↷" : done ? "✓" : index === phaseIndex ? "▶" : "○"}<b>${escapeHtml(label)}</b></span>`;
  }).join("");

  const operationHtml = operations.map((item, index) => {
    const done = view.phase === "done" || index < view.opIndex;
    const active = index === view.opIndex;
    const kind = item.type === "insert" ? "insert" : "sum";
    return `<span class="${kind}${active ? " active" : ""}${done ? " done" : ""}"><small>${index + 1}</small><strong>${escapeHtml(item.label)}</strong><em>${done ? "✓" : active ? "RUN" : "WAIT"}</em></span>`;
  }).join("");

  const targetHtml = [...target].map((char, index) => {
    const classes = ["ms677-char"];
    if (index === view.charIndex) classes.push("active");
    if (index < view.charIndex || (view.event === "return-sum" && view.nodeFound)) classes.push("done");
    if (index === view.charIndex && view.edgeFound === false) classes.push("missing");
    return `<span class="${classes.join(" ")}"><small>${index}</small><strong>${escapeHtml(char)}</strong><em>${index === view.charIndex ? "char" : ""}</em></span>`;
  }).join("") || `<span class="ms677-empty">${vi ? "Chưa có key/prefix" : "No key/prefix yet"}</span>`;

  const pathHtml = path.map((node, index) => {
    const current = node.prefix === view.currentPrefix;
    const changed = view.change && node.prefix === view.change.prefix;
    const score = changed ? `${view.change.before} → ${view.change.after}` : `Σ=${node.score}`;
    const label = node.prefix === "" ? "ROOT" : `“${escapeHtml(node.prefix)}”`;
    return `${index ? "<i>→</i>" : ""}<span class="${current ? "current" : ""}${changed ? " changed" : ""}"><small>${escapeHtml(node.char)}</small><strong>${label}</strong><em>${escapeHtml(score)}</em></span>`;
  }).join("");

  const valuesHtml = values.length
    ? values.map((entry) => `<div><code>"${escapeHtml(entry.key)}"</code><strong>${entry.value}</strong></div>`).join("")
    : `<div class="ms677-empty">${vi ? "values đang rỗng" : "values is empty"}</div>`;
  const outputsHtml = outputs.length
    ? outputs.map((output) => `<div><code>sum("${escapeHtml(output.prefix)}")</code><strong>${output.value}</strong></div>`).join("")
    : `<div class="ms677-empty">${vi ? "Chưa gọi sum(prefix)" : "No sum(prefix) call yet"}</div>`;

  const hasDelta = Number.isFinite(view.delta);
  const deltaClass = !hasDelta ? "idle" : view.delta > 0 ? "positive" : view.delta < 0 ? "negative" : "zero";
  const deltaFormula = hasDelta
    ? `${view.newValue} − ${view.oldValue} = ${view.delta >= 0 ? "+" : ""}${view.delta}`
    : "new − old";
  const change = view.change;
  const nodeScore = change
    ? `${change.before} + (${view.delta}) = ${change.after}`
    : path.length ? `Σ = ${path[path.length - 1].score}` : "Σ = 0";

  let actionState = "inspect";
  let actionLabel = vi ? "KHỞI TẠO" : "INITIALIZE";
  let actionCode = "root = TrieNode()";
  let actionDetail = vi ? "Mỗi node cache tổng Σ" : "Each node caches a sum Σ";
  if (view.event === "operation-start") {
    actionState = operation ? operation.type : "inspect";
    actionLabel = operation && operation.type === "insert" ? "INSERT" : "SUM";
    actionCode = operation ? operation.label : "—";
    actionDetail = operation && operation.type === "insert"
      ? (vi ? "overwrite cần delta" : "an overwrite requires delta")
      : (vi ? "lookup prefix rồi đọc score" : "look up prefix, then read score");
  } else if (view.event === "delta") {
    actionState = "delta";
    actionLabel = "DELTA";
    actionCode = `delta = ${deltaFormula}`;
    actionDetail = vi ? "truyền phần chênh lệch, không cộng lại toàn bộ value" : "propagate only the difference, not the full value";
  } else if (["follow-edge", "create-edge", "query-edge"].includes(view.event)) {
    actionState = view.event === "create-edge" ? "create" : "walk";
    actionLabel = view.event === "create-edge" ? "CREATE EDGE" : "FOLLOW EDGE";
    actionCode = `children['${escapeHtml(view.edgeChar || "")}'] → “${escapeHtml(view.currentPrefix || "ROOT")}”`;
    actionDetail = view.event === "create-edge" ? (vi ? "tạo node mới với Σ=0" : "create a node with Σ=0") : (vi ? "node đã tồn tại" : "existing node");
  } else if (view.event === "update-score") {
    actionState = "update";
    actionLabel = "UPDATE Σ";
    actionCode = `score += delta → ${nodeScore}`;
    actionDetail = vi ? `prefix “${view.currentPrefix}” nhận cùng delta` : `prefix “${view.currentPrefix}” receives the same delta`;
  } else if (view.event === "missing-edge") {
    actionState = "missing";
    actionLabel = "MISSING EDGE";
    actionCode = `children['${escapeHtml(view.edgeChar || "")}'] = None`;
    actionDetail = vi ? "không có key khớp → return 0" : "no matching key → return 0";
  } else if (view.event === "return-sum") {
    actionState = view.nodeFound ? "return" : "missing";
    actionLabel = "RETURN";
    actionCode = view.nodeFound ? `node.score = ${view.result}` : "0";
    actionDetail = vi ? "đọc cache tại node cuối prefix" : "read the cache at the final prefix node";
  } else if (view.event === "done") {
    actionState = "return";
    actionLabel = "DONE";
    actionCode = `[${outputs.map((output) => output.value).join(", ")}]`;
    actionDetail = vi ? "tất cả kết quả sum(prefix)" : "all sum(prefix) results";
  }

  const resultText = view.result === undefined ? "—" : String(view.result);
  const summary = vi
    ? `MapSum: ${operation ? operation.label : "khởi tạo"}; prefix hiện tại ${view.currentPrefix || "root"}; kết quả ${resultText}.`
    : `MapSum: ${operation ? operation.label : "initialize"}; current prefix ${view.currentPrefix || "root"}; result ${resultText}.`;

  $("treeView").innerHTML = `<section class="ms677-viz" role="img" aria-label="${escapeHtml(summary)}">
    <div class="ms677-phases">${phases}</div>
    <section class="ms677-operations"><header><strong>OPERATION TIMELINE</strong><span>${vi ? "xanh = xong · cam = đang chạy" : "green = done · amber = running"}</span></header><div>${operationHtml}</div></section>
    <section class="ms677-rule"><strong>NODE CACHE</strong><span>score(prefix) = Σ values[key] where key.startswith(prefix)</span></section>
    <section class="ms677-action ${actionState}"><small>${escapeHtml(actionLabel)}</small><strong>${actionCode}</strong><span>${escapeHtml(actionDetail)}</span></section>
    <div class="ms677-layout">
      <section class="ms677-tree-card"><header><strong>MAPSUM TRIE · Σ ON EVERY NODE</strong><span>${vi ? "vòng xanh = key hoàn chỉnh · cam = path hiện tại" : "green ring = complete key · amber = current path"}</span></header><div id="ms677Tree" class="ms677-tree"></div></section>
      <aside class="ms677-side">
        <section class="ms677-target"><header><strong>${operation && operation.type === "insert" ? "KEY" : "PREFIX"}</strong><span>i = ${view.charIndex ?? "—"}</span></header><div>${targetHtml}</div></section>
        <section class="ms677-delta ${deltaClass}"><small>OVERWRITE FORMULA</small><strong>${escapeHtml(deltaFormula)}</strong><span>${hasDelta ? `old=${view.oldValue} · new=${view.newValue}` : (vi ? "chỉ dùng cho insert" : "insert only")}</span></section>
        <section class="ms677-node"><small>CURRENT NODE</small><strong>${view.currentPrefix ? `“${escapeHtml(view.currentPrefix)}”` : "ROOT"}</strong><code>${escapeHtml(nodeScore)}</code></section>
        <section class="ms677-result ${view.result === undefined ? "idle" : view.nodeFound === false ? "missing" : "ready"}"><small>sum(prefix)</small><strong>${escapeHtml(resultText)}</strong><span>${view.result === undefined ? (vi ? "chờ query" : "waiting") : (vi ? "đọc trực tiếp node.score" : "read node.score directly")}</span></section>
      </aside>
    </div>
    <section class="ms677-path"><header><strong>${vi ? "ĐƯỜNG PREFIX HIỆN TẠI" : "CURRENT PREFIX PATH"}</strong><span>ROOT → ${escapeHtml(view.currentPrefix || "...")}</span></header><div>${pathHtml}</div></section>
    <div class="ms677-data">
      <section><header><strong>VALUES HASH MAP</strong><span>${vi ? "key → giá trị mới nhất" : "key → latest value"}</span></header><div>${valuesHtml}</div></section>
      <section><header><strong>SUM OUTPUTS</strong><span>${vi ? "theo thứ tự query" : "in query order"}</span></header><div>${outputsHtml}</div></section>
    </div>
  </section>`;
  renderTree(step, "ms677Tree");
  const mapSumSvg = $("ms677Tree").querySelector("svg.tree-svg");
  if (mapSumSvg) {
    const naturalWidth = Number(mapSumSvg.getAttribute("width"));
    const naturalHeight = Number(mapSumSvg.getAttribute("height"));
    mapSumSvg.classList.remove("tree-svg-fit");
    if (Number.isFinite(naturalWidth) && naturalWidth > 0) {
      mapSumSvg.style.setProperty("width", `${naturalWidth}px`, "important");
      mapSumSvg.style.setProperty("min-width", `${naturalWidth}px`, "important");
      mapSumSvg.style.setProperty("max-width", "none", "important");
    }
    if (Number.isFinite(naturalHeight) && naturalHeight > 0) {
      mapSumSvg.style.setProperty("height", `${naturalHeight}px`, "important");
    }
  }
}

function renderElevator4027View(step) {
  const view = step.elevator4027View || {};
  const requests = Array.isArray(view.requests) ? view.requests : [];
  const vi = lang === "vi";
  const phase = String(view.phase || "setup");
  const transitionEvents = new Set(["next-loop", "already-served", "guard-pass", "travel", "wait", "arrive", "merge-mask", "improve", "reject", "write-dp", "write-parent"]);
  const phaseIndex = phase === "setup" ? 0 : phase === "initialize" ? 1 : phase === "finish" ? 4 : transitionEvents.has(view.event) ? 3 : 2;
  const phaseLabels = vi
    ? ["Đọc input", "Singleton DP", "Duyệt subset", "Transition + chờ", "Route tối ưu"]
    : ["Read input", "Singleton DP", "Scan subsets", "Transition + wait", "Optimal route"];
  const phases = phaseLabels.map((label, index) => {
    const state = index < phaseIndex ? "done" : index === phaseIndex ? "active" : "pending";
    return `<span class="${state}">${state === "done" ? "✓" : state === "active" ? "▶" : index + 1}<b>${escapeHtml(label)}</b></span>`;
  }).join("");

  const served = new Set(Array.isArray(view.served) ? view.served : []);
  const maskBits = String(view.maskBits || "").padStart(requests.length, "0");
  const bitCards = requests.map((request) => {
    const on = served.has(request.id);
    const classes = [on ? "on" : "off"];
    if (request.id === view.last) classes.push("last");
    if (request.id === view.next) classes.push("next");
    return `<span class="${classes.join(" ")}"><small>bit ${request.id}</small><strong>${on ? "1" : "0"}</strong><em>#${request.id} · F${request.floor}</em></span>`;
  }).join("");

  const requestCards = requests.map((request) => {
    const classes = [];
    if (served.has(request.id)) classes.push("served");
    if (request.id === view.last) classes.push("last");
    if (request.id === view.next) classes.push("next");
    const status = request.id === view.last
      ? (vi ? "VỊ TRÍ HIỆN TẠI" : "CURRENT LAST")
      : request.id === view.next
        ? (vi ? "ĐANG THỬ" : "TRY NEXT")
        : served.has(request.id) ? (vi ? "ĐÃ PHỤC VỤ" : "SERVED") : (vi ? "CHƯA PHỤC VỤ" : "PENDING");
    return `<article class="${classes.join(" ")}"><header><strong>#${request.id}</strong><span>${escapeHtml(status)}</span></header><div><small>${vi ? "TẦNG" : "FLOOR"}</small><b>${request.floor}</b></div><div><small>${vi ? "XUẤT HIỆN" : "ARRIVAL"}</small><b>t=${request.arrival}</b></div></article>`;
  }).join("");

  const n = Number(view.n) || 1;
  let floors;
  if (n <= 15) {
    floors = Array.from({ length: n }, (_, index) => n - 1 - index);
  } else {
    floors = [...new Set([n - 1, 0, view.start, ...requests.map((request) => request.floor)])].sort((a, b) => b - a);
  }
  const compressed = floors.length < n;
  const elevatorFloor = Number.isInteger(view.last) && view.last >= 0 && requests[view.last]
    ? requests[view.last].floor : view.start;
  const floorRows = floors.map((floor, index) => {
    const onFloor = requests.filter((request) => request.floor === floor);
    const requestHtml = onFloor.map((request) => {
      const classes = [];
      if (served.has(request.id)) classes.push("served");
      if (request.id === view.last) classes.push("last");
      if (request.id === view.next) classes.push("next");
      return `<b class="${classes.join(" ")}">#${request.id}<small>@${request.arrival}</small></b>`;
    }).join("");
    const gap = compressed && index < floors.length - 1 && floor - floors[index + 1] > 1
      ? `<i class="elv4027-gap">⋮ ${floor - floors[index + 1] - 1} ${vi ? "tầng ẩn" : "hidden floor(s)"}</i>` : "";
    return `<div class="elv4027-floor ${floor === elevatorFloor ? "elevator" : ""} ${floor === view.targetFloor ? "target" : ""}">
      <span>F${floor}</span><i class="shaft"></i><strong>${floor === elevatorFloor ? "ELEVATOR" : ""}</strong><div>${requestHtml}</div>
    </div>${gap}`;
  }).join("");

  const display = (value) => value === null || value === undefined || value === Infinity ? "—" : String(value);
  const rows = Array.isArray(view.dpRows) ? view.dpRows : [];
  const tableRows = rows.map((row) => {
    const classes = [];
    if (row.mask === view.mask && row.last === view.last) classes.push("active");
    if (row.mask === view.newMask && row.last === view.next) classes.push("candidate");
    if (row.mask === view.full) classes.push("full");
    const servedText = (row.served || []).map((id) => `#${id}`).join(", ");
    return `<tr class="${classes.join(" ")}"><td><code>${escapeHtml(row.maskBits)}</code><small>${escapeHtml(servedText)}</small></td><td>#${row.last} · F${row.floor}</td><td>${escapeHtml(display(row.time))}</td><td>${row.parent < 0 ? "START" : `#${row.parent}`}</td></tr>`;
  }).join("") || `<tr><td colspan="4">${vi ? "Chưa có state hữu hạn" : "No finite state yet"}</td></tr>`;

  const route = phase === "finish" && Array.isArray(view.finalRoute) && view.finalRoute.length
    ? view.finalRoute
    : Array.isArray(view.candidateRoute) && view.candidateRoute.length && view.improved
      ? view.candidateRoute : Array.isArray(view.route) ? view.route : [];
  const routeHtml = [`<span class="start"><small>START</small><strong>F${view.start}</strong><em>t=0</em></span>`]
    .concat(route.map((item) => `<i>→</i><span class="request ${item.request === view.next ? "next" : ""}"><small>#${item.request} · arrival ${item.arrival}</small><strong>F${item.floor}</strong><em>t=${item.time}</em></span>`)).join("");

  const hasTransition = Number.isFinite(view.travel) && Number.isFinite(view.targetFloor);
  const wait = Number(view.wait) || 0;
  const departureTime = phase === "initialize" ? 0 : view.currentTime;
  const formula = hasTransition
    ? `<div><small>${vi ? "DI CHUYỂN" : "TRAVEL"}</small><code>${display(departureTime)} + |${display(view.fromFloor)} − ${display(view.targetFloor)}| = ${display(view.reachedAt)}</code></div><b>max</b><div><small>REQUEST #${display(view.next)} ${vi ? "XUẤT HIỆN" : "ARRIVES"}</small><code>arrival = ${display(view.arrival)}</code></div><em>→</em><div class="result"><small>${vi ? "PHỤC VỤ LÚC" : "SERVE AT"}</small><strong>t=${display(view.candidateTime)}</strong><span>${wait > 0 ? `${vi ? "chờ" : "wait"} ${wait}s` : (vi ? "không chờ" : "no wait")}</span></div>`
    : `<div class="elv4027-formula-empty">${vi ? "Chọn một state và request kế tiếp để xem công thức travel/wait." : "Select a state and next request to see the travel/wait formula."}</div>`;
  const updateClass = view.improved === true ? "improved" : view.improved === false ? "rejected" : "idle";
  const updateText = view.improved === true
    ? (vi ? `CẬP NHẬT dp[${view.newMaskBits}][${view.next}]` : `UPDATE dp[${view.newMaskBits}][${view.next}]`)
    : view.improved === false ? (vi ? "KHÔNG CẢI THIỆN" : "NO IMPROVEMENT") : (vi ? "CHỜ SO SÁNH" : "WAITING TO COMPARE");
  const activeLine = Array.isArray(step.codeLines) ? step.codeLines[0] : null;
  const answer = view.answer === null || view.answer === undefined ? "—" : view.answer;

  $("treeView").innerHTML = `<section class="elv4027-viz" role="img" aria-label="#4027 Elevator Requests III, answer ${escapeHtml(String(answer))}">
    <div class="elv4027-phases">${phases}</div>
    <div class="elv4027-debug"><small>${vi ? "DÒNG" : "LINE"} ${activeLine ?? "—"}</small><strong>${escapeHtml(pick(step.title))}</strong><span>${escapeHtml(pick(step.note))}</span></div>
    <section class="elv4027-rule"><strong>dp[mask][last]</strong><span>${vi ? "thời gian sớm nhất đã phục vụ mask và dừng tại request last" : "earliest time after serving mask and stopping at request last"}</span><code>mask ${escapeHtml(maskBits)} · last ${view.last >= 0 ? `#${view.last}` : "—"} · t=${escapeHtml(display(view.currentTime))}</code></section>
    <div class="elv4027-main">
      <section class="elv4027-building"><header><strong>${vi ? "TRỤC TẦNG" : "FLOOR SHAFT"}</strong><span>${compressed ? (vi ? "chỉ hiện tầng quan trọng" : "important floors only") : (vi ? "đủ mọi tầng" : "all floors")}</span></header><div>${floorRows}</div></section>
      <section class="elv4027-requests"><header><strong>REQUESTS</strong><span>${served.size}/${requests.length} ${vi ? "đã phục vụ" : "served"}</span></header><div>${requestCards}</div></section>
    </div>
    <section class="elv4027-mask"><header><strong>BITMASK</strong><code>${escapeHtml(maskBits)}</code></header><div>${bitCards}</div></section>
    <section class="elv4027-formula ${hasTransition ? "ready" : "idle"}">${formula}</section>
    <section class="elv4027-update ${updateClass}"><strong>${escapeHtml(updateText)}</strong><span>${view.improved === true ? `${display(view.candidateTime)} < ${display(view.previousBest)}` : view.improved === false ? `${display(view.candidateTime)} ≥ ${display(view.previousBest)}` : "candidate vs current best"}</span></section>
    <div class="elv4027-bottom">
      <section class="elv4027-table"><header><strong>DP STATES</strong><span>${rows.length}${view.truncated ? "+" : ""} ${vi ? "state gần nhất" : "recent states"}</span></header><div><table><thead><tr><th>mask</th><th>last</th><th>time</th><th>parent</th></tr></thead><tbody>${tableRows}</tbody></table></div></section>
      <section class="elv4027-route"><header><strong>${phase === "finish" ? (vi ? "ROUTE TỐI ƯU" : "OPTIMAL ROUTE") : (vi ? "ROUTE HIỆN TẠI" : "CURRENT ROUTE")}</strong><span>${phase === "finish" ? `${vi ? "đáp án" : "answer"} = ${answer}s` : (vi ? "dựng từ parent" : "reconstructed from parent")}</span></header><div>${routeHtml}</div>${view.truncated ? `<p>${vi ? "Một số frame trung gian đã được rút gọn; kết quả DP vẫn đầy đủ." : "Some intermediate frames were capped; the DP result is still complete."}</p>` : ""}</section>
    </div>
  </section>`;
}

function renderSeparate1977View(step) {
  const view = step.separate1977View || {};
  const vi = lang === "vi";
  const phase = String(view.phase || "rules");
  const num = String(view.num || "");
  const n = Number(view.n) || num.length;
  const dp = Array.isArray(view.dp) ? view.dp : [];
  const comparisons = Array.isArray(view.comparisons) ? view.comparisons : [];
  const computed = new Set(Array.isArray(view.computedCells) ? view.computedCells : []);
  const display = (value) => value === null || value === undefined ? "—" : String(value);

  if (phase === "invalid") {
    $("treeView").innerHTML = `<section class="sep1977-viz invalid" role="img" aria-label="${vi ? "Đầu vào không hợp lệ cho LeetCode 1977" : "Invalid input for LeetCode 1977"}">
      <section class="sep1977-empty"><strong>${vi ? "Cần chuỗi gồm 1-10 chữ số" : "Enter a string of 1-10 digits"}</strong><code>${escapeHtml(num || "empty")}</code><span>${vi ? "Ví dụ hợp lệ: 327" : "Valid example: 327"}</span></section>
    </section>`;
    return;
  }

  const stageIndex = phase === "final" ? 3
    : ["compare", "write", "leading-zero"].includes(phase) ? 2
      : ["state", "base"].includes(phase) ? 1 : 0;
  const stageLabels = vi
    ? ["Hiểu luật", "Tạo bảng DP", "So sánh & cộng", "Cộng cột cuối"]
    : ["Read rules", "Build DP table", "Compare & add", "Sum final column"];
  const stages = stageLabels.map((label, index) => {
    const state = index < stageIndex || phase === "final" ? "done" : index === stageIndex ? "active" : "pending";
    return `<span class="${state}"><small>${state === "done" ? "✓" : index + 1}</small><strong>${escapeHtml(label)}</strong></span>`;
  }).join("");

  const segmentActive = ["base", "compare", "write", "leading-zero", "leading-zero-input"].includes(phase);
  const charCells = num.split("").map((digit, index) => {
    const classes = ["sep1977-digit"];
    if (phase === "final") classes.push("final");
    if (segmentActive && Number.isInteger(view.k) && index >= view.k && index < view.i) classes.push("previous");
    if (segmentActive && Number.isInteger(view.i) && Number.isInteger(view.j) && index >= view.i && index < view.j) classes.push("current");
    if ((phase === "leading-zero" || phase === "leading-zero-input") && index === view.i) classes.push("zero");
    const labels = [];
    if (Number.isInteger(view.k) && index === view.k) labels.push("k");
    if (Number.isInteger(view.i) && index === view.i) labels.push("i");
    if (Number.isInteger(view.j) && index === view.j - 1) labels.push("j−1");
    return `<span class="${classes.join(" ")}"><small>[${index}]</small><strong>${escapeHtml(digit)}</strong><em>${labels.join(" · ") || "\u00a0"}</em></span>`;
  }).join("");

  const tableHead = Array.from({ length: n }, (_, index) => `<span class="sep1977-col-head"><small>j</small>${index + 1}</span>`).join("");
  const sourceKeys = new Set(comparisons.map((item) => `${item.k}:${view.i}`));
  const tableRows = Array.from({ length: n }, (_, i) => {
    const cells = Array.from({ length: n }, (_, offset) => {
      const j = offset + 1;
      const validCell = i < j;
      if (!validCell) return `<span class="sep1977-cell blocked" title="i >= j"><small>—</small><strong>×</strong></span>`;
      const key = `${i}:${j}`;
      const classes = ["sep1977-cell"];
      if (computed.has(key)) classes.push("computed");
      if (i === view.i && j === view.j) classes.push("active");
      if (sourceKeys.has(key)) classes.push("source");
      if (i === view.k && j === view.i) classes.push(view.orderOk ? "source-active accepted" : "source-active rejected");
      if (phase === "final" && j === n) classes.push("final-column");
      const value = computed.has(key) ? (dp[i]?.[j] ?? 0) : "·";
      return `<span class="${classes.join(" ")}" title="dp[${i}][${j}], last = ${escapeHtml(num.slice(i, j))}"><small>${escapeHtml(num.slice(i, j))}</small><strong>${escapeHtml(display(value))}</strong></span>`;
    }).join("");
    return `<span class="sep1977-row-head"><small>i</small>${i}</span>${cells}`;
  }).join("");

  let operation = "";
  if (phase === "rules") {
    operation = `<section class="sep1977-rules">
      <span><strong>1</strong><b>${vi ? "Số dương" : "Positive"}</b><small>${vi ? "không bắt đầu bằng 0" : "no leading zero"}</small></span>
      <span><strong>2</strong><b>a ≤ b</b><small>${vi ? "dãy không giảm" : "non-decreasing order"}</small></span>
      <span><strong>3</strong><b>${vi ? "1 số vẫn tính" : "One piece counts"}</b><small>${vi ? `"${escapeHtml(num)}" là một cách` : `"${escapeHtml(num)}" is one split`}</small></span>
    </section>`;
  } else if (phase === "state") {
    operation = `<section class="sep1977-state">
      <div><small>${vi ? "TIỀN TỐ ĐÃ TÁCH" : "SPLIT PREFIX"}</small><strong>num[0:j]</strong></div>
      <i>&rarr;</i>
      <div><small>${vi ? "SỐ CUỐI CHÍNH XÁC" : "EXACT LAST NUMBER"}</small><strong>num[i:j]</strong></div>
      <code>dp[i][j] = ${vi ? "số cách" : "number of ways"}</code>
    </section>`;
  } else if (phase === "base") {
    operation = `<section class="sep1977-operation base"><div><small>num[0:${view.j}]</small><strong>"${escapeHtml(display(view.current))}"</strong></div><i>&rarr;</i><div><small>${vi ? "KHÔNG CÓ SỐ TRƯỚC" : "NO PREDECESSOR"}</small><strong>dp[0][${view.j}] = 1</strong></div><p>${vi ? "Đây là một số duy nhất, nên luôn tạo đúng một cách tách." : "This is one whole number, so it always creates exactly one split."}</p></section>`;
  } else if (phase === "compare") {
    const relationText = view.relation === "shorter"
      ? (vi ? "Ít chữ số hơn nên nhỏ hơn" : "Fewer digits means smaller")
      : view.relation === "longer"
        ? (vi ? "Nhiều chữ số hơn nên lớn hơn" : "More digits means larger")
        : (vi ? "Dài bằng nhau: so từ trái sang phải" : "Equal length: compare left to right");
    operation = `<section class="sep1977-operation compare ${view.orderOk ? "accepted" : "rejected"}">
      <div class="previous"><small>${vi ? "SỐ TRƯỚC" : "PREVIOUS"} · num[${view.k}:${view.i}]</small><strong>${escapeHtml(display(view.previous))}</strong><em>${String(view.previous || "").length} ${vi ? "chữ số" : "digits"}</em></div>
      <i>${view.orderOk ? "≤" : ">"}</i>
      <div class="current"><small>${vi ? "SỐ HIỆN TẠI" : "CURRENT"} · num[${view.i}:${view.j}]</small><strong>${escapeHtml(display(view.current))}</strong><em>${String(view.current || "").length} ${vi ? "chữ số" : "digits"}</em></div>
      <p><b>${view.orderOk ? (vi ? "HỢP LỆ" : "VALID") : (vi ? "LOẠI" : "REJECT")}</b><span>${escapeHtml(relationText)}</span></p>
      <code>total = ${display(view.runningTotal)} &nbsp; (+${display(view.contribution)} ${vi ? "từ" : "from"} dp[${view.k}][${view.i}])</code>
    </section>`;
  } else if (phase === "leading-zero" || phase === "leading-zero-input") {
    operation = `<section class="sep1977-operation zero"><div><small>${vi ? "ĐOẠN ĐANG XÉT" : "CURRENT PIECE"}</small><strong>"${escapeHtml(display(view.current))}"</strong></div><i>!</i><div><small>${vi ? "BẮT ĐẦU BẰNG 0" : "STARTS WITH 0"}</small><strong>${phase === "leading-zero-input" ? (vi ? "answer = 0" : "answer = 0") : `dp[${view.i}][${view.j}] = 0`}</strong></div><p>${vi ? "Không cần so với số trước: đoạn này đã không hợp lệ." : "No predecessor comparison is needed: this piece is already invalid."}</p></section>`;
  } else if (phase === "write") {
    operation = `<section class="sep1977-operation write"><div><small>${vi ? "Ô ĐÍCH" : "TARGET CELL"}</small><strong>dp[${view.i}][${view.j}]</strong></div><i>=</i><div><small>${comparisons.length} ${vi ? "SO SÁNH ĐÃ XONG" : "COMPARISONS DONE"}</small><strong>${display(view.runningTotal)}</strong></div><p>${vi ? `Mọi cách hợp lệ giờ kết thúc bằng "${escapeHtml(display(view.current))}".` : `Every counted split now ends with "${escapeHtml(display(view.current))}".`}</p></section>`;
  } else if (phase === "final") {
    const terms = (view.lastColumn || []).map((item) => `dp[${item.i}][${n}]`).join(" + ");
    operation = `<section class="sep1977-operation final"><div><small>${vi ? "CỘT CUỐI j = n" : "FINAL COLUMN j = n"}</small><strong>${escapeHtml(terms || "—")}</strong></div><i>=</i><div><small>${vi ? "TỔNG SỐ CÁCH" : "TOTAL WAYS"}</small><strong>${display(view.answer)}</strong></div><p>${vi ? "Mỗi hàng chọn một vị trí bắt đầu khác nhau cho số cuối cùng." : "Each row chooses a different start for the final number."}</p></section>`;
  }

  const contributionRows = comparisons.map((item, index) => {
    const active = index === comparisons.length - 1 && phase === "compare";
    return `<span class="${item.orderOk ? "accepted" : "rejected"}${active ? " active" : ""}"><small>k=${item.k}</small><code>"${escapeHtml(item.prev)}" ${item.orderOk ? "≤" : ">"} "${escapeHtml(item.cur)}"</code><b>dp[${item.k}][${view.i}] = ${display(item.sourceWays)}</b><strong>+${display(item.contribution)}</strong></span>`;
  }).join("") || `<em class="sep1977-none">${vi ? "Chưa có phép so sánh cho ô này" : "No comparison for this cell yet"}</em>`;

  const splitSample = Array.isArray(view.splitSample) ? view.splitSample : [];
  const splitRows = splitSample.map((split, index) => `<span><small>#${index + 1}</small><code>[${escapeHtml(split)}]</code></span>`).join("");
  const omitted = Math.max(0, Number(view.totalSplitCount || 0) - splitSample.length);
  const finalTerms = Array.isArray(view.lastColumn) ? view.lastColumn.map((item) => `<span class="${item.ways > 0 ? "nonzero" : "zero"}"><small>i=${item.i} · last "${escapeHtml(item.number)}"</small><strong>dp[${item.i}][${n}] = ${display(item.ways)}</strong></span>`).join("") : "";

  const activeLine = Array.isArray(step.codeLines) ? step.codeLines[0] : null;
  $("treeView").innerHTML = `<section class="sep1977-viz" role="img" aria-label="LeetCode 1977 DP visualization, phase ${escapeHtml(phase)}, answer ${display(view.answer)}">
    <div class="sep1977-stages">${stages}</div>
    <section class="sep1977-debug"><small>${vi ? "DÒNG" : "LINE"} ${activeLine ?? "—"}</small><strong>${escapeHtml(pick(step.title))}</strong><span>${escapeHtml(pick(step.note))}</span></section>
    <section class="sep1977-string"><header><strong>num = "${escapeHtml(num)}"</strong><span>${vi ? "k bắt đầu số trước · i bắt đầu số hiện tại · j là biên phải" : "k starts previous · i starts current · j is the right boundary"}</span></header><div style="--sep1977-n:${Math.max(1, n)}">${charCells}</div><footer><span class="previous"></span>${vi ? "số trước num[k:i]" : "previous num[k:i]"}<span class="current"></span>${vi ? "số hiện tại num[i:j]" : "current num[i:j]"}</footer></section>
    ${operation}
    <div class="sep1977-main">
      <section class="sep1977-table-panel"><header><strong>${vi ? "BẢNG DP" : "DP TABLE"}</strong><span>dp[i][j] · ${vi ? "số cuối = num[i:j]" : "last number = num[i:j]"}</span></header><div class="sep1977-table-scroll"><div class="sep1977-table" style="--sep1977-cols:${Math.max(1, n)}"><span class="sep1977-corner">i / j</span>${tableHead}${tableRows}</div></div><footer><span class="source"></span>${vi ? "nguồn dp[k][i]" : "source dp[k][i]"}<span class="active"></span>${vi ? "ô đích dp[i][j]" : "target dp[i][j]"}<span class="final"></span>${vi ? "cột đáp án" : "answer column"}</footer></section>
      <section class="sep1977-contributions"><header><strong>${vi ? "ĐÓNG GÓP VÀO Ô ĐÍCH" : "TARGET CELL CONTRIBUTIONS"}</strong><span>${Number.isInteger(view.i) && Number.isInteger(view.j) ? `dp[${view.i}][${view.j}]` : "total = Σ dp[k][i]"}</span></header><div>${contributionRows}</div><footer><small>${vi ? "TỔNG ĐANG CHẠY" : "RUNNING TOTAL"}</small><strong>${display(view.runningTotal ?? (phase === "final" ? view.answer : 0))}</strong></footer></section>
    </div>
    ${phase === "final" ? `<section class="sep1977-final-terms"><header><strong>${vi ? "VÌ SAO CỘNG CỘT CUỐI?" : "WHY SUM THE LAST COLUMN?"}</strong><span>${vi ? "Tất cả lựa chọn của số cuối" : "Every possible final number"}</span></header><div>${finalTerms}</div></section>` : ""}
    ${(phase === "rules" || phase === "final") && splitRows ? `<section class="sep1977-splits"><header><strong>${vi ? "ĐỐI CHIẾU CÁC CÁCH TÁCH" : "VALID SPLIT CHECK"}</strong><span>${display(view.totalSplitCount)} ${vi ? "cách" : "ways"}</span></header><div>${splitRows}${omitted ? `<em>+${omitted} ${vi ? "cách khác" : "more"}</em>` : ""}</div></section>` : ""}
  </section>`;
}

function renderMissing3718View(step) {
  const view = step.missing3718View || {};
  const vi = lang === "vi";
  const approach = Number(view.approach) || 1;
  const directAns = approach === 2;
  const nums = Array.isArray(view.nums) ? view.nums : [];
  const seen = Array.isArray(view.seen) ? view.seen : [];
  const checked = Array.isArray(view.checked) ? view.checked : [];
  const phase = String(view.phase || "init");
  const k = Number(view.k) || 1;
  const candidate = Number.isFinite(view.candidate) ? view.candidate : null;
  const currentIndex = Number.isInteger(view.currentIndex) ? view.currentIndex : null;
  const display = (value) => value === null || value === undefined ? "—" : String(value);
  const counts = nums.reduce((map, value) => map.set(value, (map.get(value) || 0) + 1), new Map());
  const stageIndex = phase === "missing" || phase === "increment" ? 3 : phase === "present" ? 2 : phase === "enumerate" ? 1 : 0;
  const stageLabels = directAns
    ? (vi
      ? ["Tạo Hash Set", "Đặt ans = k", "Check ans in seen", "ans += k / return"]
      : ["Build Hash Set", "Set ans = k", "Check ans in seen", "ans += k / return"])
    : (vi
      ? ["Tạo Hash Set", "Sinh m × k", "Kiểm tra trong Set", "Bội thiếu đầu tiên"]
      : ["Build Hash Set", "Generate m × k", "Check membership", "First missing multiple"]);
  const stages = stageLabels.map((label, index) => {
    const state = phase === "missing" || index < stageIndex ? "done" : index === stageIndex ? "active" : "pending";
    return `<span class="${state}"><small>${state === "done" ? "✓" : state === "active" ? "▶" : index + 1}</small><strong>${escapeHtml(label)}</strong></span>`;
  }).join("");

  const inputCells = nums.map((value, index) => {
    const classes = ["smm3718-num"];
    if (index < Number(view.inputProgress || 0)) classes.push("processed");
    if (index === currentIndex) classes.push("current");
    if (value % k === 0) classes.push("multiple");
    else classes.push("irrelevant");
    if (candidate !== null && value === candidate) classes.push("candidate");
    if (counts.get(value) > 1) classes.push("duplicate");
    const tag = index === currentIndex ? (vi ? "ĐANG THÊM" : "ADDING")
      : candidate !== null && value === candidate ? (vi ? "TÌM THẤY" : "MATCH")
        : value % k === 0 ? `${value / k} × k` : (vi ? "không phải bội" : "not a multiple");
    return `<span class="${classes.join(" ")}"><small>nums[${index}]</small><strong>${escapeHtml(display(value))}</strong><em>${escapeHtml(tag)}</em>${counts.get(value) > 1 ? `<b>×${counts.get(value)}</b>` : ""}</span>`;
  }).join("") || `<em class="smm3718-empty">[ ]</em>`;

  const setHtml = seen.length ? seen.map((value) => {
    const classes = [];
    if (value % k === 0) classes.push("multiple");
    if (candidate !== null && value === candidate) classes.push("candidate");
    if (view.insertion?.value === value) classes.push("inserted");
    return `<span class="${classes.join(" ")}"><small>${value % k === 0 ? `${value / k}×k` : (vi ? "khác" : "other")}</small><strong>${escapeHtml(display(value))}</strong></span>`;
  }).join("") : `<em class="smm3718-empty">{ }</em>`;

  const timeline = checked.map((item) => ({ ...item, pending: false }));
  if (candidate !== null && !timeline.some((item) => item.value === candidate)) {
    timeline.push({ multiplier: view.multiplier, value: candidate, present: null, pending: true });
  }
  const omitted = Math.max(0, timeline.length - 12);
  const visibleTimeline = timeline.slice(-12);
  const multipleHtml = `${omitted ? `<em class="smm3718-omitted">… ${omitted} ${vi ? "bội trước" : "earlier"}</em>` : ""}${visibleTimeline.map((item) => {
    const classes = ["smm3718-multiple"];
    if (item.pending) classes.push("pending");
    else if (item.present) classes.push("present");
    else classes.push("missing");
    if (item.value === candidate) classes.push("active");
    const status = item.pending ? (vi ? "SẮP KIỂM TRA" : "CHECK NEXT") : item.present ? "PRESENT" : "MISSING";
    return `<span class="${classes.join(" ")}"><small>m=${escapeHtml(display(item.multiplier))}</small><code>${escapeHtml(display(item.multiplier))} × ${k}</code><strong>${escapeHtml(display(item.value))}</strong><em>${status}</em></span>`;
  }).join("")}` || `<em class="smm3718-empty">${vi ? "Chưa sinh bội nào" : "No multiple generated yet"}</em>`;

  let operation;
  if (phase === "build-set" && view.insertion) {
    operation = `<section class="smm3718-operation set ${view.insertion.duplicate ? "duplicate" : "added"}"><div><small>SET BUILD · O(1) AVG</small><strong>seen.add(${escapeHtml(display(view.insertion.value))})</strong></div><i>&rarr;</i><div><small>${view.insertion.duplicate ? "ALREADY PRESENT" : "NEW VALUE"}</small><strong>|seen| = ${seen.length}</strong></div><p>${view.insertion.duplicate ? (vi ? "Duplicate được gộp thành một giá trị trong Set." : "The duplicate collapses to one Set value.") : (vi ? "Giá trị đã sẵn sàng cho membership check." : "The value is ready for membership checks.")}</p></section>`;
  } else if (phase === "increment" && directAns) {
    operation = `<section class="smm3718-operation increment"><div><small>ANS BEFORE</small><strong>ans = ${escapeHtml(display(view.ansBefore))}</strong></div><i>+</i><div><small>ans += k</small><strong>${escapeHtml(display(view.ansBefore))} + ${k} = ${escapeHtml(display(view.ansAfter))}</strong></div><p>${vi ? `${view.ansAfter} là bội kế tiếp; quay lại kiểm tra while ${view.ansAfter} in seen.` : `${view.ansAfter} is the next multiple; loop back to test while ${view.ansAfter} in seen.`}</p></section>`;
  } else if (phase === "present" || phase === "missing") {
    const candidateExpression = directAns
      ? `ans = ${escapeHtml(display(candidate))}`
      : `${escapeHtml(display(view.multiplier))} × ${k} = ${escapeHtml(display(candidate))}`;
    const condition = directAns ? "ans in seen" : "candidate in seen";
    const detail = view.present
      ? directAns
        ? (vi ? `${candidate} có trong Set: chạy ans += k trong thân while.` : `${candidate} is in the Set: execute ans += k in the while body.`)
        : (vi ? `Có ${candidate} trong Set: tăng multiplier và tiếp tục.` : `${candidate} is in the Set: increment multiplier and continue.`)
      : directAns
        ? (vi ? `${candidate} không có trong Set: while dừng và return ans.` : `${candidate} is absent: the while loop stops and returns ans.`)
        : (vi ? `Không có ${candidate}: trả về ngay vì đây là bội thiếu đầu tiên.` : `${candidate} is absent: return immediately because it is the first missing multiple.`);
    operation = `<section class="smm3718-operation check ${phase}"><div><small>CANDIDATE</small><strong>${candidateExpression}</strong></div><i>?</i><div><small>${condition}</small><strong>${view.present ? "TRUE" : "FALSE"}</strong></div><p>${detail}</p></section>`;
  } else if (phase === "enumerate") {
    operation = directAns
      ? `<section class="smm3718-operation enumerate"><div><small>${vi ? "BỘI DƯƠNG NHỎ NHẤT" : "SMALLEST POSITIVE MULTIPLE"}</small><strong>k = ${k}</strong></div><i>&rarr;</i><div><small>ans = k</small><strong>ans = ${k}</strong></div><p>${vi ? "ans giữ trực tiếp candidate, nên không cần biến multiplier." : "ans stores the candidate directly, so no multiplier variable is needed."}</p></section>`
      : `<section class="smm3718-operation enumerate"><div><small>${vi ? "BỘ ĐẾM BẮT ĐẦU TỪ 1" : "COUNTER STARTS AT 1"}</small><strong>multiplier = 1</strong></div><i>&rarr;</i><div><small>candidate = multiplier × k</small><strong>1 × ${k} = ${k}</strong></div><p>${vi ? "0 × k không hợp lệ vì không phải bội dương." : "0 × k is invalid because it is not a positive multiple."}</p></section>`;
  } else {
    operation = `<section class="smm3718-operation idle"><div><small>HASH SET</small><strong>seen = set(nums)</strong></div><i>&rarr;</i><div><small>${directAns ? "while ans in seen" : "MEMBERSHIP"}</small><strong>average O(1)</strong></div><p>${vi ? "Xây Set một lần, rồi tái sử dụng cho mọi bội cần kiểm tra." : "Build the Set once, then reuse it for every multiple check."}</p></section>`;
  }

  const activeLine = Array.isArray(step.codeLines) ? step.codeLines[0] : null;
  const summary = vi
    ? `Bội thiếu của k=${k}; Set có ${seen.length} giá trị, đã kiểm tra ${checked.length} bội, đáp án ${display(view.answer)}.`
    : `Missing multiple for k=${k}; Set has ${seen.length} values, ${checked.length} multiples checked, answer ${display(view.answer)}.`;
  const currentFormula = directAns
    ? phase === "increment"
      ? `ans += k: ${display(view.ansBefore)} + ${k} = ${display(view.ansAfter)}`
      : `ans = ${display(candidate)}`
    : `candidate = m × k = ${display(view.multiplier)} × ${k} = ${display(candidate)}`;
  $("treeView").innerHTML = `<section class="smm3718-viz approach-${approach}" role="img" aria-label="${escapeHtml(summary)}">
    <div class="smm3718-stages">${stages}</div>
    <div class="smm3718-action"><small>${vi ? "DÒNG" : "LINE"} ${activeLine ?? "—"}</small><strong>${escapeHtml(pick(step.title))}</strong><span>${escapeHtml(pick(step.note))}</span></div>
    <section class="smm3718-formula"><div><small>APPROACH ${approach} · POSITIVE MULTIPLES OF k=${k}</small><strong>k, 2k, 3k, …</strong></div><div><small>${directAns ? "CURRENT ans" : "CURRENT FORMULA"}</small><strong>${currentFormula}</strong></div></section>
    <section class="smm3718-input"><header><strong>INPUT · nums</strong><span>${Number(view.inputProgress || 0)}/${nums.length} ${vi ? "đã đưa vào Set" : "inserted into Set"}</span></header><div>${inputCells}</div></section>
    <section class="smm3718-set"><header><strong>HASH SET · seen</strong><span>${seen.length} ${vi ? "giá trị duy nhất" : "unique value(s)"}</span></header><div>${setHtml}</div></section>
    ${operation}
    <section class="smm3718-ladder"><header><strong>${vi ? "CÁC BỘI ĐƯỢC KIỂM TRA THEO THỨ TỰ" : "MULTIPLES CHECKED IN ORDER"}</strong><span>${checked.length}/${view.maxChecks} ${vi ? "lần kiểm tra tối đa" : "maximum checks"}</span></header><div>${multipleHtml}</div></section>
    <section class="smm3718-proof"><div><small>${vi ? "VÌ SAO LÀ NHỎ NHẤT?" : "WHY IS IT MINIMAL?"}</small><strong>k &lt; 2k &lt; 3k &lt; …</strong><span>${vi ? "Dừng đúng tại FALSE đầu tiên." : "Stop exactly at the first FALSE."}</span></div><div><small>${vi ? "VÌ SAO LUÔN DỪNG?" : "WHY MUST IT STOP?"}</small><strong>${nums.length} ${vi ? "phần tử" : "items"} &lt; ${view.maxChecks} ${vi ? "bội đầu tiên" : "first multiples"}</strong><span>answer ≤ (n+1) × k = ${view.upperBound}</span></div></section>
    ${phase === "missing" ? `<section class="smm3718-answer"><small>RETURN</small><strong>${escapeHtml(display(view.answer))}</strong><span>${directAns ? "ans" : `${escapeHtml(display(view.multiplier))} × ${k}`}</span></section>` : ""}
  </section>`;
}

function renderRussian354View(step) {
  const view = step.russian354View || {};
  const vi = lang === "vi";
  const approach = Number(view.approach) || 2;
  const phase = String(view.phase || "sort");
  const original = Array.isArray(view.original) ? view.original : [];
  const sorted = Array.isArray(view.sorted) ? view.sorted : [];
  const heights = Array.isArray(view.heights) ? view.heights : [];
  const n = sorted.length;
  const currentIndex = Number.isInteger(view.currentIndex) ? view.currentIndex : null;
  const compareIndex = Number.isInteger(view.compareIndex) ? view.compareIndex : null;
  const activeChain = new Set(Array.isArray(view.activeChain) ? view.activeChain : []);
  const bestChain = new Set(Array.isArray(view.bestChain) ? view.bestChain : []);
  const displayChain = bestChain.size ? bestChain : activeChain;
  const widthCounts = sorted.reduce((counts, item) => counts.set(item.width, (counts.get(item.width) || 0) + 1), new Map());
  const tiedWidths = [...widthCounts.entries()].filter(([, count]) => count > 1).map(([width]) => width);
  const maxWidth = Math.max(1, ...sorted.map((item) => Number(item.width) || 0));
  const maxHeight = Math.max(1, ...sorted.map((item) => Number(item.height) || 0));
  const display = (value) => value === null || value === undefined ? "—" : String(value);

  const stageIndex = phase === "done" ? 3 : phase === "sort" ? 0 : phase === "reduce" ? 1 : 2;
  const stageLabels = approach === 1
    ? (vi ? ["Sort w↑, tie h↓", "Lấy dãy chiều cao", "DP so mọi j < i", "Dựng chuỗi tốt nhất"] : ["Sort w↑, ties h↓", "Extract heights", "DP over every j < i", "Rebuild best chain"])
    : (vi ? ["Sort w↑, tie h↓", "Lấy dãy chiều cao", "Binary search tails", "Dựng chuỗi tốt nhất"] : ["Sort w↑, ties h↓", "Extract heights", "Binary-search tails", "Rebuild best chain"]);
  const stages = stageLabels.map((label, index) => {
    const state = phase === "done" || index < stageIndex ? "done" : index === stageIndex ? "active" : "pending";
    return `<span class="${state}"><small>${state === "done" ? "✓" : state === "active" ? "▶" : index + 1}</small><strong>${escapeHtml(label)}</strong></span>`;
  }).join("");

  const currentEnvelope = currentIndex !== null ? sorted[currentIndex] : null;
  const currentSummary = currentEnvelope
    ? `${currentEnvelope.width} × ${currentEnvelope.height} · h=${currentEnvelope.height}`
    : (vi ? "Chưa xét phong bì cụ thể" : "No specific envelope yet");
  const ruleSummary = approach === 1
    ? (vi ? "DP thử mọi phong bì trước đó: chỉ update khi cả width và height đều nhỏ hơn." : "DP checks every earlier envelope: update only when both width and height are smaller.")
    : (vi ? "LIS trên height dùng bisect_left: tìm tail đầu tiên >= h để append hoặc thay thế." : "Height LIS uses bisect_left: find the first tail >= h to append or replace.");
  const legend = [
    { className: "current", label: vi ? "đang xét" : "current" },
    { className: "compare", label: vi ? "đang so" : "compare" },
    { className: "same-width", label: vi ? "width trùng" : "same width" },
    { className: "chain", label: vi ? "trong chuỗi" : "in chain" },
  ].map((item) => `<span><i class="${item.className}"></i>${escapeHtml(item.label)}</span>`).join("");

  const renderEnvelope = (item, index, source) => {
    const sortedIndex = source === "sorted" ? index : sorted.findIndex((candidate) => candidate.originalIndex === item.originalIndex);
    const classes = ["rde354-envelope"];
    if (widthCounts.get(item.width) > 1) classes.push("same-width");
    if (sortedIndex === currentIndex) classes.push("current");
    if (sortedIndex === compareIndex) classes.push("compare");
    if (sortedIndex >= 0 && sortedIndex < Number(view.processedCount || 0)) classes.push("processed");
    if (displayChain.has(sortedIndex)) classes.push("chain");
    const shapeWidth = Math.round(48 + (Number(item.width) / maxWidth) * 48);
    const shapeHeight = Math.round(54 + (Number(item.height) / maxHeight) * 72);
    const indexText = source === "sorted" ? `s${index} · #${item.originalIndex}` : `#${item.originalIndex}`;
    return `<span class="${classes.join(" ")}"><small>${indexText}</small><i class="rde354-shape" style="--rde-shape-w:${shapeWidth}%;--rde-shape-h:${shapeHeight}px"><b>w=${escapeHtml(display(item.width))}</b><em>h=${escapeHtml(display(item.height))}</em></i><strong>${escapeHtml(display(item.width))} × ${escapeHtml(display(item.height))}</strong></span>`;
  };
  const originalHtml = original.map((item, index) => renderEnvelope(item, index, "original")).join("") || `<em class="rde354-empty">[ ]</em>`;
  const sortedHtml = sorted.map((item, index) => renderEnvelope(item, index, "sorted")).join("") || `<em class="rde354-empty">[ ]</em>`;

  const tieExample = tiedWidths.length
    ? tiedWidths.map((width) => {
      const group = sorted.filter((item) => item.width === width);
      return `<span><strong>w=${escapeHtml(display(width))}</strong><code>${group.map((item) => item.height).join(" > ")}</code><em>${vi ? "cao giảm" : "height desc"}</em></span>`;
    }).join("")
    : `<span><strong>${vi ? "KHÔNG CÓ WIDTH TRÙNG" : "NO WIDTH TIES"}</strong><code>(w↑, h↓)</code><em>${vi ? "quy tắc vẫn giữ nguyên" : "the rule still applies"}</em></span>`;

  const heightHtml = sorted.map((item, index) => {
    const classes = ["rde354-height"];
    if (index === currentIndex) classes.push("current");
    if (index === compareIndex) classes.push("compare");
    if (widthCounts.get(item.width) > 1) classes.push("same-width");
    if (displayChain.has(index)) classes.push("chain");
    if (index < Number(view.processedCount || 0)) classes.push("processed");
    return `<span class="${classes.join(" ")}"><small>i=${index} · w=${escapeHtml(display(item.width))}</small><strong>${escapeHtml(display(item.height))}</strong><em>h[${index}]</em></span>`;
  }).join("") || `<em class="rde354-empty">[ ]</em>`;

  let operation = "";
  let methodBoard = "";
  if (approach === 1) {
    const comparison = view.comparison;
    if (comparison) {
      const inner = sorted[comparison.inner];
      const outer = sorted[comparison.outer];
      const verdict = comparison.canNest ? (comparison.improved ? (vi ? "LỒNG ĐƯỢC · UPDATE" : "FITS · UPDATE") : (vi ? "LỒNG ĐƯỢC · GIỮ DP" : "FITS · KEEP DP")) : (vi ? "KHÔNG LỒNG" : "DOES NOT FIT");
      operation = `<section class="rde354-compare-rule ${comparison.canNest ? "pass" : "fail"} ${comparison.improved ? "improved" : ""}">
        <div class="inner"><small>j=${comparison.inner} · ${vi ? "PHONG BÌ TRONG" : "INNER"}</small><strong>${inner.width} × ${inner.height}</strong></div>
        <div class="checks"><span class="${comparison.widthOk ? "pass" : "fail"}"><small>WIDTH</small><strong>${inner.width} &lt; ${outer.width}</strong><em>${comparison.widthOk ? "✓" : "×"}</em></span><b>AND</b><span class="${comparison.heightOk ? "pass" : "fail"}"><small>HEIGHT</small><strong>${inner.height} &lt; ${outer.height}</strong><em>${comparison.heightOk ? "✓" : "×"}</em></span></div>
        <div class="outer"><small>i=${comparison.outer} · ${vi ? "PHONG BÌ NGOÀI" : "OUTER"}</small><strong>${outer.width} × ${outer.height}</strong></div>
        <footer><strong>${escapeHtml(verdict)}</strong><code>${comparison.canNest ? `dp[${comparison.outer}] = max(${comparison.previousDp}, dp[${comparison.inner}] + 1 = ${comparison.candidate}) → ${comparison.resultDp}` : `dp[${comparison.outer}] = ${comparison.resultDp} · skip`}</code></footer>
      </section>`;
    } else {
      operation = `<section class="rde354-fit-rule"><div><small>${vi ? "ĐIỀU KIỆN LỒNG NGHIÊM NGẶT" : "STRICT NESTING RULE"}</small><strong>w<sub>inner</sub> &lt; w<sub>outer</sub> <b>AND</b> h<sub>inner</sub> &lt; h<sub>outer</sub></strong></div><span>${vi ? "Không được bằng nhau ở bất kỳ chiều nào." : "Equality in either dimension is not allowed."}</span></section>`;
    }

    const dp = Array.isArray(view.dp) ? view.dp : [];
    const parent = Array.isArray(view.parent) ? view.parent : [];
    const dpCells = sorted.map((item, index) => {
      const classes = ["rde354-dp-cell"];
      if (index === currentIndex) classes.push("current");
      if (index === compareIndex) classes.push("compare");
      if (index < Number(view.processedCount || 0)) classes.push("processed");
      if (displayChain.has(index)) classes.push("chain");
      return `<span class="${classes.join(" ")}"><small>i=${index} · ${item.width}×${item.height}</small><strong>dp = ${escapeHtml(display(dp[index]))}</strong><em>parent = ${parent[index] >= 0 ? parent[index] : "—"}</em></span>`;
    }).join("") || `<em class="rde354-empty">dp = [ ]</em>`;
    methodBoard = `<section class="rde354-method dp"><header><strong>DP · O(n²)</strong><span>dp[i] = 1 + max(dp[j]) ${vi ? "với j lồng vào i" : "for every j that fits i"}</span></header><div>${dpCells}</div></section>`;
  } else {
    const tails = Array.isArray(view.tails) ? view.tails : [];
    const tailIndices = Array.isArray(view.tailIndices) ? view.tailIndices : [];
    const search = view.search || {};
    const mutation = view.mutation || null;
    const visited = new Set(Array.isArray(search.visitedMids) ? search.visitedMids : []);
    const found = Number.isInteger(search.found) ? search.found : null;
    const slotCount = Math.max(1, tails.length, found === tails.length ? tails.length + 1 : 0);
    const tailSlots = Array.from({ length: slotCount }, (_, index) => {
      const isGhost = index >= tails.length;
      const envelopeIndex = tailIndices[index];
      const envelope = sorted[envelopeIndex];
      const classes = ["rde354-tail-slot"];
      if (isGhost) classes.push("ghost");
      if (visited.has(index)) classes.push("visited");
      if (search.mid === index) classes.push("mid");
      if (found === index) classes.push("found");
      if (mutation?.pos === index) classes.push(mutation.type === "append" ? "appended" : "replaced");
      const inRange = Number.isInteger(search.loBefore) && Number.isInteger(search.hiBefore) && index >= search.loBefore && index < search.hiBefore;
      if (inRange) classes.push("in-range");
      return `<span class="${classes.join(" ")}"><small>L${index + 1} · index ${index}</small><strong>${isGhost ? "?" : escapeHtml(display(tails[index]))}</strong><em>${isGhost ? (vi ? "vị trí append" : "append slot") : envelope ? `${envelope.width}×${envelope.height} · s${envelopeIndex}` : "tail"}</em></span>`;
    }).join("");

    if (phase === "binary-search" && Number.isInteger(search.mid)) {
      operation = `<section class="rde354-search-step ${search.moveRight ? "right" : "left"}"><header><small>bisect_left · [lo, hi)</small><strong>lo=${search.loBefore} · mid=${search.mid} · hi=${search.hiBefore}</strong></header><div><code>tails[${search.mid}] = ${escapeHtml(display(search.midValue))}</code><b>${search.moveRight ? "<" : "≥"}</b><code>h = ${escapeHtml(display(search.target))}</code><i>&rarr;</i><strong>${search.moveRight ? `lo = ${search.lo}` : `hi = ${search.hi}`}</strong></div><p>${search.moveRight ? (vi ? "Mid quá nhỏ: bỏ cả mid và nửa trái." : "Mid is too small: discard mid and the left half.") : (vi ? "Mid đủ lớn: giữ mid và tìm tiếp bên trái." : "Mid is large enough: keep mid and search left.")}</p></section>`;
    } else if (phase === "position-found") {
      operation = `<section class="rde354-search-step found"><header><small>lo = hi</small><strong>bisect_left = ${found}</strong></header><p>${found === tails.length ? (vi ? "Không có tail nào ≥ h: mở thêm một độ dài mới." : "No tail is >= h: open a new length.") : (vi ? `L${found + 1} là ô đầu tiên có tail ≥ h.` : `L${found + 1} is the first slot whose tail is >= h.`)}</p></section>`;
    } else if (mutation) {
      operation = `<section class="rde354-mutation ${mutation.type}"><header><small>${mutation.type === "append" ? "EXTEND LIS" : mutation.oldValue === mutation.newValue ? "REFRESH TAIL OWNER" : "REPLACE A TAIL"}</small><strong>${mutation.type === "append" ? `append ${mutation.newValue} at L${mutation.pos + 1}` : `L${mutation.pos + 1}: ${mutation.oldValue} → ${mutation.newValue}`}</strong></header><div><code>[${mutation.before.join(", ")}]</code><i>&rarr;</i><code>[${mutation.after.join(", ")}]</code></div><p>${mutation.type === "append" ? (vi ? "Độ dài LIS tăng 1." : "LIS length grows by 1.") : (vi ? "Độ dài không đổi; tail mới không lớn hơn tail cũ nên vẫn tối ưu cho bước sau." : "Length stays the same; the new tail is no larger than the old one, so it remains optimal for later steps.")}</p></section>`;
    } else {
      operation = `<section class="rde354-fit-rule"><div><small>${vi ? "Ý NGHĨA CỦA TAILS" : "TAILS INVARIANT"}</small><strong>tails[L-1] = ${vi ? "đuôi nhỏ nhất của chuỗi dài L" : "smallest tail of a length-L chain"}</strong></div><span>${vi ? "bisect_left giữ LIS tăng nghiêm ngặt." : "bisect_left preserves a strictly increasing LIS."}</span></section>`;
    }

    methodBoard = `<section class="rde354-method tails"><header><strong>TAILS · O(n log n)</strong><span>${vi ? "mỗi ô đại diện một độ dài, không nhất thiết cùng một chuỗi" : "one slot per length, not necessarily one shared chain"}</span></header><div>${tailSlots}</div><footer><code>lo=${escapeHtml(display(search.lo))}</code><code>mid=${escapeHtml(display(search.mid))}</code><code>hi=${escapeHtml(display(search.hi))}</code><code>target h=${escapeHtml(display(search.target ?? (currentIndex !== null ? heights[currentIndex] : null)))}</code></footer></section>`;
  }

  const chainIndexes = [...displayChain];
  const chainHtml = chainIndexes.length
    ? chainIndexes.map((index, chainIndex) => {
      const item = sorted[index];
      if (!item) return "";
      return `${chainIndex ? `<i>&rarr;</i>` : ""}<span><small>s${index}</small><strong>${item.width} × ${item.height}</strong><em>${chainIndex ? `${sorted[chainIndexes[chainIndex - 1]].width}<${item.width} · ${sorted[chainIndexes[chainIndex - 1]].height}<${item.height}` : (vi ? "bắt đầu" : "start")}</em></span>`;
    }).join("")
    : `<em class="rde354-empty">${vi ? "Chuỗi sẽ xuất hiện khi thuật toán chọn predecessor." : "The chain appears after the algorithm chooses predecessors."}</em>`;
  const chainTitle = phase === "done" ? (vi ? "MỘT CHUỖI TỐI ƯU THẬT" : "ONE REAL OPTIMAL CHAIN") : (vi ? "CHUỖI ĐANG THEO DÕI" : "CURRENT RECONSTRUCTED CHAIN");
  const activeLine = Array.isArray(step.codeLines) ? step.codeLines[0] : null;
  const summary = vi
    ? `Russian Doll Envelopes, cách ${approach}, đã xử lý ${Number(view.processedCount || 0)}/${n}, đáp án ${display(view.answer)}.`
    : `Russian Doll Envelopes, approach ${approach}, processed ${Number(view.processedCount || 0)}/${n}, answer ${display(view.answer)}.`;

  $("treeView").innerHTML = `<section class="rde354-viz" role="img" aria-label="${escapeHtml(summary)}">
    <div class="rde354-stages">${stages}</div>
    <section class="rde354-overview">
      <div><small>${vi ? "ĐANG NHÌN" : "CURRENT"}</small><strong>${escapeHtml(currentSummary)}</strong><span>${escapeHtml(pick(step.title))}</span></div>
      <div><small>${vi ? "SORT ĐỂ KHỬ BẪY" : "SORT GUARD"}</small><strong>${vi ? "w tăng, h giảm khi w bằng" : "w asc, h desc on ties"}</strong><span>${vi ? "Nhờ vậy hai phong bì cùng width không thể bị LIS đếm nhầm." : "This prevents equal-width envelopes from being counted together by LIS."}</span></div>
      <div><small>${vi ? "LUẬT CHÍNH" : "MAIN RULE"}</small><strong>${approach === 1 ? "dp[i]" : "tails[L-1]"}</strong><span>${escapeHtml(ruleSummary)}</span></div>
    </section>
    <div class="rde354-action"><small>${vi ? "DÒNG" : "LINE"} ${activeLine ?? "—"} · ${vi ? "CÁCH" : "APPROACH"} ${approach}</small><strong>${escapeHtml(pick(step.title))}</strong><span>${escapeHtml(pick(step.note))}</span></div>
    <div class="rde354-legend">${legend}</div>
    <section class="rde354-sort-rule"><div><small>SORT KEY</small><strong>(width ↑, height ↓)</strong><span>${vi ? "rộng bằng nhau phải xếp cao giảm" : "equal widths must use descending heights"}</span></div><div class="rde354-ties">${tieExample}</div></section>
    <section class="rde354-orders"><div><header><strong>${vi ? "THỨ TỰ BAN ĐẦU" : "ORIGINAL ORDER"}</strong><span># = input index</span></header><div>${originalHtml}</div></div><b>&rarr;</b><div><header><strong>${vi ? "SAU KHI SORT" : "SORTED ORDER"}</strong><span>s = sorted index</span></header><div>${sortedHtml}</div></div></section>
    <section class="rde354-heights"><header><strong>HEIGHT SEQUENCE</strong><span>${vi ? `đã xử lý ${Number(view.processedCount || 0)}/${n}` : `${Number(view.processedCount || 0)}/${n} processed`}</span></header><div>${heightHtml}</div></section>
    ${operation}
    ${methodBoard}
    <section class="rde354-chain ${phase === "done" ? "done" : ""}"><header><strong>${chainTitle}</strong><span>${phase === "done" ? `${vi ? "đáp án" : "answer"} = ${display(view.answer)}` : `${displayChain.size} ${vi ? "phong bì" : "envelope(s)"}`}</span></header><div>${chainHtml}</div></section>
  </section>`;
}

function renderRotate48View(step) {
  const view = step.rotate48View || {};
  const vi = lang === "vi";
  const matrix = Array.isArray(view.matrix) ? view.matrix : [];
  const original = Array.isArray(view.original) ? view.original : [];
  const n = Number(view.n) || matrix.length;
  const phase = String(view.phase || "init");
  const activeCells = Array.isArray(view.activeCells) ? view.activeCells : [];
  const activeRow = Number.isInteger(view.activeRow) ? view.activeRow : null;
  const reversedRows = new Set(Array.isArray(view.reversedRows) ? view.reversedRows : []);
  const swap = view.swap || null;
  const display = (value) => value === null || value === undefined ? "—" : String(value);
  const sameCell = (cell, row, col) => Array.isArray(cell) && cell[0] === row && cell[1] === col;
  const phaseIndex = phase === "done" ? 2
    : phase === "transpose-done" || phase.startsWith("reverse") ? 1 : 0;
  const stageLabels = vi
    ? ["Transpose qua đường chéo", "Đảo trái-phải từng hàng", "Xoay 90° hoàn tất"]
    : ["Transpose across diagonal", "Reverse each row", "90° rotation complete"];
  const stages = stageLabels.map((label, index) => {
    const state = phase === "done" || index < phaseIndex ? "done" : index === phaseIndex ? "active" : "pending";
    const marker = state === "done" ? "✓" : state === "active" ? "▶" : index + 1;
    return `<span class="${state} stage-${index + 1}"><small>${marker}</small><strong>${escapeHtml(label)}</strong></span>`;
  }).join("");

  const transposeDone = Number(view.transposeSwaps) || 0;
  const transposeTotal = Number(view.totalTransposeSwaps) || 0;
  const rowDone = reversedRows.size;
  const progress = `<section class="rot48-progress">
    <div class="transpose"><small>TRANSPOSE SWAPS</small><strong>${transposeDone} / ${transposeTotal}</strong><span>${vi ? "chỉ đổi phía trên đường chéo" : "swap only above the diagonal"}</span></div>
    <div class="diagonal"><small>MAIN DIAGONAL</small><strong>${n} ${vi ? "ô cố định" : "fixed cells"}</strong><span>(i,i) &rarr; (i,i)</span></div>
    <div class="reverse"><small>REVERSED ROWS</small><strong>${rowDone} / ${n}</strong><span>${view.approach === 2 ? (vi ? "swap từng cặp" : "pair-by-pair swaps") : "row.reverse()"}</span></div>
  </section>`;

  const matrixItems = [];
  matrixItems.push(`<span class="rot48-corner">r\\c</span>`);
  for (let col = 0; col < n; col++) matrixItems.push(`<span class="rot48-col-label">c=${col}</span>`);
  matrix.forEach((row, rowIndex) => {
    matrixItems.push(`<span class="rot48-row-label ${rowIndex === activeRow ? "active" : ""} ${reversedRows.has(rowIndex) ? "done" : ""}">r=${rowIndex}</span>`);
    row.forEach((value, colIndex) => {
      const classes = ["rot48-cell"];
      const isA = sameCell(activeCells[0], rowIndex, colIndex);
      const isB = sameCell(activeCells[1], rowIndex, colIndex) && !isA;
      if (rowIndex === colIndex) classes.push("diagonal");
      if (rowIndex === activeRow) classes.push("active-row");
      if (reversedRows.has(rowIndex)) classes.push("row-done");
      if (isA) classes.push("active-a");
      if (isB) classes.push("active-b");
      const tag = isA ? "A" : isB ? "B" : rowIndex === colIndex ? "DIAG" : reversedRows.has(rowIndex) ? (vi ? "ĐÚNG CHỖ" : "FINAL") : "";
      matrixItems.push(`<div class="${classes.join(" ")}"><small>[${rowIndex},${colIndex}]</small><strong>${escapeHtml(display(value))}</strong><em>${escapeHtml(tag)}</em></div>`);
    });
  });

  let operation;
  if (swap?.kind === "transpose") {
    operation = `<section class="rot48-operation transpose">
      <header><small>${vi ? "ĐỔI QUA ĐƯỜNG CHÉO" : "MIRROR SWAP"}</small><strong>matrix[${swap.a[0]}][${swap.a[1]}] ↔ matrix[${swap.b[0]}][${swap.b[1]}]</strong></header>
      <div><span class="a"><small>A · (${swap.a.join(",")})</small><strong>${escapeHtml(display(swap.before?.[0]))} &rarr; ${escapeHtml(display(swap.after?.[0]))}</strong></span><i>↔</i><span class="b"><small>B · (${swap.b.join(",")})</small><strong>${escapeHtml(display(swap.before?.[1]))} &rarr; ${escapeHtml(display(swap.after?.[1]))}</strong></span></div>
      <p>${vi ? "A và B có tọa độ đảo ngược nhau, nên chúng đối xứng qua đường chéo chính." : "A and B have reversed coordinates, so they mirror each other across the main diagonal."}</p>
    </section>`;
  } else if (swap?.kind === "reverse") {
    operation = `<section class="rot48-operation reverse">
      <header><small>${vi ? `ĐẢO HÀNG ${swap.a[0]}` : `REVERSE ROW ${swap.a[0]}`}</small><strong>j=${swap.a[1]} ↔ n-1-j=${swap.b[1]}</strong></header>
      <div><span class="a"><small>${vi ? "ĐẦU TRÁI" : "LEFT END"} · (${swap.a.join(",")})</small><strong>${escapeHtml(display(swap.before?.[0]))} &rarr; ${escapeHtml(display(swap.after?.[0]))}</strong></span><i>↔</i><span class="b"><small>${vi ? "ĐẦU PHẢI" : "RIGHT END"} · (${swap.b.join(",")})</small><strong>${escapeHtml(display(swap.before?.[1]))} &rarr; ${escapeHtml(display(swap.after?.[1]))}</strong></span></div>
      <p>${vi ? "Hai ô cùng hàng và cách đều hai mép đổi chỗ; lặp đến giữa hàng." : "Two cells in the same row, equally far from opposite ends, trade places; repeat toward the center."}</p>
    </section>`;
  } else if (swap?.kind === "row-reverse") {
    const before = (swap.beforeRow || []).map(display).join(", ");
    const after = (swap.afterRow || []).map(display).join(", ");
    operation = `<section class="rot48-operation reverse row-reverse">
      <header><small>row.reverse()</small><strong>${vi ? `ĐẢO TOÀN BỘ HÀNG ${swap.row}` : `REVERSE ALL OF ROW ${swap.row}`}</strong></header>
      <div class="rot48-row-change"><code>[${escapeHtml(before)}]</code><i>&rarr;</i><code>[${escapeHtml(after)}]</code></div>
      <p>${vi ? "Phần tử ngoài cùng đổi phía trước, rồi tiếp tục vào giữa; Python thực hiện toàn bộ bằng row.reverse()." : "Outer values change sides first, continuing inward; Python performs the whole operation with row.reverse()."}</p>
    </section>`;
  } else if (phase === "transpose-done") {
    operation = `<section class="rot48-operation bridge"><header><small>${vi ? "CHUYỂN PHA" : "PHASE CHANGE"}</small><strong>${vi ? "Transpose xong, bắt đầu đảo từng hàng" : "Transpose done, now reverse every row"}</strong></header><p>${vi ? "Cột của ma trận gốc đã trở thành hàng. Đảo hàng sẽ biến hướng xoay ngược chiều thành đúng 90° clockwise." : "Original columns are now rows. Reversing those rows turns the reflection into a 90° clockwise rotation."}</p></section>`;
  } else if (phase === "done") {
    operation = `<section class="rot48-operation done"><header><small>DONE · O(n²) TIME · O(1) SPACE</small><strong>(r,c) &rarr; (c,n-1-r)</strong></header><p>${vi ? "Mọi hàng đã đảo xong và mọi phần tử đang ở tọa độ xoay cuối cùng." : "Every row is reversed and every value is at its final rotated coordinate."}</p></section>`;
  } else {
    operation = `<section class="rot48-operation idle"><header><small>${vi ? "HAI PHÉP BIẾN ĐỔI TẠI CHỖ" : "TWO IN-PLACE TRANSFORMS"}</small><strong>transpose &rarr; reverse rows</strong></header><p>${vi ? "Theo dõi đường chéo xanh, cặp A/B đang đổi và các hàng đã hoàn tất." : "Watch the cyan diagonal, the active A/B pair, and rows that have reached their final order."}</p></section>`;
  }

  const transformCards = `<section class="rot48-map">
    <header><strong>${vi ? "BẢN ĐỒ TỌA ĐỘ" : "COORDINATE MAP"}</strong><span>${vi ? "vì sao hai bước tạo đúng phép xoay" : "why the two steps equal one rotation"}</span></header>
    <div>
      <span class="transpose ${phaseIndex === 0 ? "active" : ""}"><small>1 · TRANSPOSE</small><strong>(r,c) &rarr; (c,r)</strong><em>${vi ? "đổi hàng ↔ cột" : "swap row ↔ column"}</em></span>
      <i>&rarr;</i>
      <span class="reverse ${phaseIndex === 1 ? "active" : ""}"><small>2 · REVERSE ROW</small><strong>(c,r) &rarr; (c,n-1-r)</strong><em>${vi ? "lật chỉ số cột" : "flip the column index"}</em></span>
      <i>=</i>
      <span class="combined ${phase === "done" ? "active" : ""}"><small>${vi ? "KẾT QUẢ" : "COMBINED"}</small><strong>(r,c) &rarr; (c,n-1-r)</strong><em>90° CLOCKWISE</em></span>
    </div>
  </section>`;

  const originalRows = original.map((row, index) => `<span><small>row ${index}</small><code>[${escapeHtml(row.map(display).join(", "))}]</code></span>`).join("");
  const currentRows = matrix.map((row, index) => `<span class="${reversedRows.has(index) ? "done" : index === activeRow ? "active" : ""}"><small>row ${index}</small><code>[${escapeHtml(row.map(display).join(", "))}]</code></span>`).join("");
  const activeLine = Array.isArray(step.codeLines) ? step.codeLines[0] : null;
  const summary = vi
    ? `Rotate Image: transpose ${transposeDone}/${transposeTotal}, đã đảo ${rowDone}/${n} hàng.`
    : `Rotate Image: ${transposeDone}/${transposeTotal} transpose swaps, ${rowDone}/${n} rows reversed.`;

  $("treeView").innerHTML = `<section class="rot48-viz" role="img" aria-label="${escapeHtml(summary)}">
    <div class="rot48-stages">${stages}</div>
    <div class="rot48-action"><small>${vi ? "DÒNG" : "LINE"} ${activeLine ?? "—"} · ${view.approach === 2 ? (vi ? "CÁCH 2" : "APPROACH 2") : (vi ? "CÁCH 1" : "APPROACH 1")}</small><strong>${escapeHtml(pick(step.title))}</strong><span>${escapeHtml(pick(step.note))}</span></div>
    ${progress}
    ${operation}
    <div class="rot48-layout">
      <section class="rot48-board"><header><strong>MATRIX ${n} × ${n}</strong><span>${vi ? "đường chéo chính được giữ cố định" : "main diagonal stays fixed during transpose"}</span></header><div class="rot48-matrix-wrap"><div class="rot48-matrix" style="--rot48-cols:${n}">${matrixItems.join("")}</div></div></section>
      <aside class="rot48-legend"><strong>${vi ? "ĐỌC MÀU" : "READ THE COLORS"}</strong><span class="diag"><i></i>${vi ? "đường chéo chính" : "main diagonal"}</span><span class="a"><i></i>${vi ? "ô A đang đổi" : "active cell A"}</span><span class="b"><i></i>${vi ? "ô B đang đổi" : "active cell B"}</span><span class="row"><i></i>${vi ? "hàng đã đảo xong" : "reversed row"}</span></aside>
    </div>
    ${transformCards}
    <section class="rot48-compare"><div><header><strong>${vi ? "MA TRẬN GỐC" : "ORIGINAL MATRIX"}</strong><span>input</span></header>${originalRows}</div><i>&rarr;</i><div><header><strong>${phase === "done" ? (vi ? "KẾT QUẢ XOAY" : "ROTATED RESULT") : (vi ? "TRẠNG THÁI HIỆN TẠI" : "CURRENT STATE")}</strong><span>in-place</span></header>${currentRows}</div></section>
  </section>`;
}

function renderParen32View(step) {
  const view = step.paren32View || {};
  const vi = lang === "vi";
  const chars = Array.isArray(view.chars) ? view.chars : [];
  const stack = Array.isArray(view.stack) ? view.stack : [];
  const bestRange = Array.isArray(view.bestRange) ? view.bestRange : null;
  const candidateRange = Array.isArray(view.candidateRange) ? view.candidateRange : null;
  const current = Number.isInteger(view.currentIndex) ? view.currentIndex : -1;
  const phase = String(view.phase || "init");
  const boundary = stack.length ? stack[0] : null;
  const stackIndexes = new Set(stack.filter((index) => index >= 0));
  const inRange = (index, range) => range && index >= range[0] && index <= range[1];
  const phaseIndex = phase === "done" ? 3 : phase === "measure" ? 2 : phase === "scan" ? 1 : 0;
  const stages = [
    vi ? "Mốc -1" : "Boundary -1",
    vi ? "Duyệt ký tự" : "Scan characters",
    vi ? "Đo đoạn hợp lệ" : "Measure valid span",
  ].map((label, index) => `<span class="${phaseIndex > index || phaseIndex === 3 ? "done" : phaseIndex === index ? "active" : ""}"><small>${phaseIndex > index || phaseIndex === 3 ? "OK" : index + 1}</small><strong>${escapeHtml(label)}</strong></span>`).join("");
  const charsHtml = chars.map((char, index) => {
    const classes = ["p32-char"];
    if (inRange(index, bestRange)) classes.push("best");
    if (inRange(index, candidateRange)) classes.push("candidate");
    if (stackIndexes.has(index)) classes.push("stacked");
    if (index === boundary) classes.push("boundary");
    if (index === current) classes.push("current");
    return `<span class="${classes.join(" ")}"><small>${index}</small><strong>${escapeHtml(char)}</strong><em>${index === boundary ? (vi ? "mốc" : "base") : stackIndexes.has(index) ? "(" : ""}</em></span>`;
  }).join("") || `<span class="p32-empty">${vi ? "chuỗi rỗng" : "empty string"}</span>`;
  const stackHtml = [...stack].reverse().map((index, reverseIndex) => {
    const isBoundary = reverseIndex === stack.length - 1;
    const label = isBoundary ? (index === -1 ? "-1" : `) [${index}]`) : `( [${index}]`;
    return `<span class="p32-stack-item${isBoundary ? " base" : ""}"><small>${reverseIndex === 0 ? "TOP" : isBoundary ? "BASE" : ""}</small><strong>${escapeHtml(label)}</strong></span>`;
  }).join("") || `<span class="p32-empty">${vi ? "stack rỗng" : "empty stack"}</span>`;

  let action;
  if (["enter", "init-best", "boundary", "loop", "char-check", "close-branch", "empty-check", "measure-branch", "loop-exit"].includes(view.event)) action = pick(step.title);
  else if (view.event === "push") action = vi ? `Gặp '(' -> push chỉ số ${current}.` : `Found '(' -> push index ${current}.`;
  else if (view.event === "pop") action = vi ? `Gặp ')' -> pop một '(' hoặc mốc trên đỉnh.` : `Found ')' -> pop one '(' or the top boundary.`;
  else if (view.event === "reset") action = vi ? `Đặt mốc mới ${current}: ')' này không ghép được.` : `Set new boundary ${current}: this ')' is unmatched.`;
  else if (view.event === "best") action = vi ? `Đo được ${view.decision.length} ký tự và cập nhật best.` : `Measured ${view.decision.length} characters and updated best.`;
  else if (view.event === "measure") action = vi ? `Đo từ mốc + 1 đến i: ${view.decision.length} ký tự.` : `Measure from boundary + 1 through i: ${view.decision.length} characters.`;
  else if (view.event === "return") action = vi ? `Trả về best = ${view.best}.` : `Return best = ${view.best}.`;
  else action = vi ? "Đáy stack là mốc trước đoạn hợp lệ đang xét." : "The bottom of the stack marks the position before the current valid span.";

  const bestText = bestRange ? `${view.s.slice(bestRange[0], bestRange[1] + 1)} [${bestRange[0]}..${bestRange[1]}]` : "-";
  $("treeView").innerHTML = `<section class="p32-viz" role="img" aria-label="${vi ? "Trực quan hóa Longest Valid Parentheses" : "Longest Valid Parentheses visualization"}">
    <header><strong>LONGEST VALID PARENTHESES</strong><span>${escapeHtml(phase === "done" ? (vi ? "Hoàn tất" : "Complete") : phase)}</span></header>
    <section class="p32-stages">${stages}</section>
    <section class="p32-action"><small>${escapeHtml(view.event || "INIT").toUpperCase()}</small><strong>${escapeHtml(action)}</strong></section>
    <section class="p32-main">
      <section class="p32-panel"><header><strong>s</strong><span>${vi ? "xanh = best, vàng = đoạn đang đo" : "green = best, yellow = span being measured"}</span></header><div class="p32-chars" style="--p32-count:${Math.max(chars.length, 1)}">${charsHtml}</div></section>
      <section class="p32-stack"><header><strong>INDEX STACK</strong><span>${vi ? "đỉnh ở trên" : "top at top"}</span></header><div>${stackHtml}</div></section>
    </section>
    <section class="p32-result"><span><small>best</small><strong>${view.best ?? "-"}</strong></span><span><small>${vi ? "đoạn tốt nhất" : "best span"}</small><strong>${escapeHtml(bestText)}</strong></span><span><small>rule</small><strong>length = i - stack[-1]</strong></span></section>
  </section>`;
}

function renderWordBreakIIView(step) {
  const view = step.wordBreakIIView || {};
  const vi = lang === "vi";
  const chars = String(view.s || "").split("");
  const candidate = view.candidate;
  const memo = Array.isArray(view.memo) ? view.memo : [];
  const stack = Array.isArray(view.callStack) ? view.callStack : [];
  const partial = Array.isArray(view.partial) ? view.partial : [];
  const phaseNames = {
    init: vi ? "Khởi tạo" : "Initialize",
    call: vi ? "Gọi DFS" : "DFS call",
    try: vi ? "Thử từ" : "Try word",
    reject: vi ? "Không thuộc dict" : "Not in dict",
    recurse: vi ? "Đệ quy" : "Recurse",
    base: vi ? "Base case" : "Base case",
    append: vi ? "Ghép câu" : "Append sentence",
    "memo-hit": vi ? "Dùng memo" : "Memo hit",
    "memo-save": vi ? "Lưu memo" : "Save memo",
    done: vi ? "Hoàn tất" : "Complete",
  };
  const charsHtml = chars.map((char, index) => {
    const classes = ["wb140-char"];
    if (candidate && index >= candidate.start && index < candidate.end) classes.push(candidate.inDict ? "match" : "reject");
    if (index === view.start) classes.push("start");
    return `<span class="${classes.join(" ")}"><small>${index}</small><strong>${escapeHtml(char)}</strong></span>`;
  }).join("") || `<span class="wb140-empty">${vi ? "chuỗi rỗng" : "empty string"}</span>`;
  const wordsHtml = (view.wordDict || []).map((word) => `<span class="wb140-word${candidate && candidate.word === word && candidate.inDict ? " active" : ""}">${escapeHtml(word)}</span>`).join("") || `<span class="wb140-empty">${vi ? "từ điển rỗng" : "empty dictionary"}</span>`;
  const callHtml = stack.map((start, index) => `<span class="wb140-call${index === stack.length - 1 ? " current" : ""}"><small>${index === 0 ? "ROOT" : `#${index}`}</small><strong>dfs(${start})</strong><em>"${escapeHtml(String(view.s || "").slice(start))}"</em></span>`).join("") || `<span class="wb140-empty">${vi ? "đang ở ngoài dfs" : "outside dfs"}</span>`;
  const memoHtml = memo.map((entry) => {
    const classes = ["wb140-memo", entry.state];
    if (entry.start === view.start) classes.push("current");
    const count = entry.sentences.length;
    const preview = count ? entry.sentences.slice(0, 2).map((sentence) => `"${escapeHtml(sentence)}"`).join("<br>") : entry.state === "done" ? (vi ? "không có câu" : "no sentence") : "?";
    return `<article class="${classes.join(" ")}"><small>memo[${entry.start}]</small><strong>${entry.state === "done" ? count : entry.state === "active" ? "DFS" : "-"}</strong><em>${preview}</em></article>`;
  }).join("") || `<span class="wb140-empty">memo = {}</span>`;
  const sentenceHtml = partial.length
    ? partial.slice(0, 12).map((sentence) => `<span>${escapeHtml(sentence || '""')}</span>`).join("") + (partial.length > 12 ? `<em>+${partial.length - 12}</em>` : "")
    : `<span class="wb140-empty">${vi ? "chưa có câu hoàn chỉnh" : "no complete sentence yet"}</span>`;
  let action = "";
  if (candidate) action = candidate.inDict
    ? `"${candidate.word}" ∈ dict -> dfs(${candidate.end})`
    : `"${candidate.word}" ∉ dict`;
  else if (view.phase === "memo-hit") action = vi ? `Dùng lại memo[${view.start}].` : `Reuse memo[${view.start}].`;
  else if (view.phase === "base") action = vi ? "Cuối chuỗi trả về continuation rỗng." : "At string end, return the empty continuation.";
  else if (view.phase === "done") action = `${partial.length} ${vi ? "câu hợp lệ" : "valid sentence(s)"}`;
  else action = vi ? "Mỗi vị trí start là một bài toán con." : "Each start position is a subproblem.";

  $("treeView").innerHTML = `<section class="wb140-viz" role="img" aria-label="${vi ? "Trực quan hóa Word Break II" : "Word Break II visualization"}">
    <header><strong>WORD BREAK II</strong><span>${escapeHtml(phaseNames[view.phase] || view.phase || "")}</span></header>
    <section class="wb140-rule"><b>CORE RULE</b><strong>dfs(start) -> all sentences from s[start:]</strong><span>${vi ? "memo[start] lưu cả danh sách câu, không chỉ True/False." : "memo[start] stores the entire sentence list, not merely True/False."}</span></section>
    <section class="wb140-panel"><header><strong>WORD DICT</strong></header><div class="wb140-words">${wordsHtml}</div></section>
    <section class="wb140-panel"><header><strong>s</strong><span>${vi ? "tô màu = word đang thử" : "colored = candidate word"}</span></header><div class="wb140-chars">${charsHtml}</div></section>
    <section class="wb140-action"><small>${escapeHtml(view.phase || "init").toUpperCase()}</small><strong>${escapeHtml(action)}</strong></section>
    <section class="wb140-lower">
      <section class="wb140-panel"><header><strong>CALL STACK</strong><span>${vi ? "lời gọi mới nhất ở cuối" : "newest call at the end"}</span></header><div class="wb140-calls">${callHtml}</div></section>
      <section class="wb140-panel"><header><strong>memo[start]</strong><span>${vi ? "số câu đã giải xong" : "completed sentence counts"}</span></header><div class="wb140-memos">${memoHtml}</div></section>
    </section>
    <section class="wb140-panel wb140-output"><header><strong>${vi ? "CÂU ĐANG GOM" : "SENTENCES BEING COLLECTED"}</strong><span>${partial.length}</span></header><div>${sentenceHtml}</div></section>
  </section>`;
}

function renderDirected685View(step) {
  const view = step.directed685View || {};
  const vi = lang === "vi";
  const nodes = Array.isArray(view.nodes) ? view.nodes : [];
  const edges = Array.isArray(view.edges) ? view.edges : [];
  const activeIndex = Number.isInteger(view.activeIndex) ? view.activeIndex : -1;
  const processed = new Set(view.processedIndexes || []);
  const sameEdge = (left, right) => Array.isArray(left) && Array.isArray(right) && left[0] === right[0] && left[1] === right[1];
  const nodeCount = Math.max(nodes.length, 1);
  const size = Math.max(330, Math.min(520, nodeCount * 58));
  const center = size / 2;
  const radius = Math.max(86, size / 2 - 72);
  const positions = new Map(nodes.map((node, index) => {
    const angle = (Math.PI * 2 * index / nodeCount) - Math.PI / 2;
    return [node, { x: center + radius * Math.cos(angle), y: center + radius * Math.sin(angle) }];
  }));
  const edgeSvg = edges.map((edge) => {
    const from = positions.get(edge.u);
    const to = positions.get(edge.v);
    if (!from || !to) return "";
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const distance = Math.max(Math.hypot(dx, dy), 1);
    const ux = dx / distance;
    const uy = dy / distance;
    const startX = from.x + ux * 26;
    const startY = from.y + uy * 26;
    const endX = to.x - ux * 31;
    const endY = to.y - uy * 31;
    const bend = edges.filter((other) => other.u === edge.u && other.v === edge.v).length > 1 ? (edge.index % 2 ? 24 : -24) : 0;
    const midX = (startX + endX) / 2 - uy * bend;
    const midY = (startY + endY) / 2 + ux * bend;
    const curveMidX = (startX + 2 * midX + endX) / 4;
    const curveMidY = (startY + 2 * midY + endY) / 4;
    const normalX = -uy;
    const normalY = ux;
    const labelOffset = 16;
    const labelA = { x: curveMidX + normalX * labelOffset, y: curveMidY + normalY * labelOffset };
    const labelB = { x: curveMidX - normalX * labelOffset, y: curveMidY - normalY * labelOffset };
    const distToCenter = (point) => (point.x - center) ** 2 + (point.y - center) ** 2;
    const label = distToCenter(labelA) >= distToCenter(labelB) ? labelA : labelB;
    const classes = ["rd685-edge"];
    if (processed.has(edge.index)) classes.push("kept");
    if (edge.index === activeIndex) classes.push("active");
    if (edge.index === view.skippedIndex) classes.push("skipped");
    if (sameEdge([edge.u, edge.v], view.first)) classes.push("first");
    if (sameEdge([edge.u, edge.v], view.second)) classes.push("second");
    if (sameEdge([edge.u, edge.v], view.cycle)) classes.push("cycle");
    if (sameEdge([edge.u, edge.v], view.answer)) classes.push("removed");
    return `<g><path class="${classes.join(" ")}" d="M ${startX.toFixed(1)} ${startY.toFixed(1)} Q ${midX.toFixed(1)} ${midY.toFixed(1)} ${endX.toFixed(1)} ${endY.toFixed(1)}" marker-end="url(#rd685-arrow)"/><text x="${label.x.toFixed(1)}" y="${label.y.toFixed(1)}" class="rd685-edge-label">#${edge.index}</text></g>`;
  }).join("");
  const activeEdge = edges[activeIndex];
  const nodeSvg = nodes.map((node) => {
    const position = positions.get(node);
    const classes = ["rd685-node"];
    if (activeEdge && (node === activeEdge.u || node === activeEdge.v)) classes.push("active");
    if (view.first && node === view.first[1]) classes.push("two-parent");
    return `<g class="${classes.join(" ")}" transform="translate(${position.x.toFixed(1)} ${position.y.toFixed(1)})"><circle r="30"/><text class="rd685-node-value" text-anchor="middle" y="7">${node}</text></g>`;
  }).join("");
  const incomingHtml = nodes.map((node) => {
    const parent = Array.isArray(view.incoming) ? view.incoming[node - 1] : 0;
    const twoParent = view.first && node === view.first[1];
    return `<span class="rd685-parent${twoParent ? " conflict" : ""}"><small>node ${node}</small><strong>${parent ? `${parent} -> ${node}` : "ROOT"}</strong></span>`;
  }).join("");
  const dsuHtml = nodes.map((node) => {
    const parent = Array.isArray(view.uf) ? view.uf[node - 1] : node;
    const root = Array.isArray(view.roots) ? view.roots[node - 1] : node;
    const active = activeEdge && (node === activeEdge.u || node === activeEdge.v) ? " active" : "";
    return `<span class="rd685-dsu${active}"><small>${node}</small><strong>p=${parent}</strong><em>root ${root}</em></span>`;
  }).join("");
  const phaseIndex = view.phase === "done" ? 3 : ["union-init", "union-check", "union", "skip", "cycle"].includes(view.phase) ? 1 : ["two-parent"].includes(view.phase) ? 0 : 0;
  const stageHtml = [vi ? "Tìm hai parent" : "Find two parents", vi ? "Bỏ second + DSU" : "Skip second + DSU", vi ? "Chọn cạnh xóa" : "Choose removal"].map((label, index) => `<span class="${view.phase === "done" || index < phaseIndex ? "done" : index === phaseIndex ? "active" : ""}"><small>${view.phase === "done" || index < phaseIndex ? "OK" : index + 1}</small><strong>${escapeHtml(label)}</strong></span>`).join("");
  let decision = "";
  if (view.decision && view.decision.kind === "two-parent") decision = vi ? `Node ${view.decision.node} nhận ${view.decision.first.join(" -> ")} và ${view.decision.second.join(" -> ")}.` : `Node ${view.decision.node} receives ${view.decision.first.join(" -> ")} and ${view.decision.second.join(" -> ")}.`;
  else if (view.decision && view.decision.kind === "skip") decision = vi ? "Tạm không union cạnh second để phân biệt hai trường hợp." : "Temporarily do not union second to distinguish the two cases.";
  else if (view.decision && view.decision.kind === "cycle") decision = vi ? `Cạnh ${view.decision.edge.join(" -> ")} nối hai node đã cùng component.` : `Edge ${view.decision.edge.join(" -> ")} joins nodes already in one component.`;
  else if (view.decision && view.decision.kind === "union") decision = vi ? `Union component ${view.decision.ru} vào ${view.decision.rv}.` : `Union component ${view.decision.ru} into ${view.decision.rv}.`;
  else if (Array.isArray(view.answer)) decision = vi ? `Cạnh cần xóa: [${view.answer.join(", ")}].` : `Edge to remove: [${view.answer.join(", ")}].`;
  else decision = vi ? "Quét thứ tự cạnh để ghi nhận parent đầu tiên." : "Scan edges in order to record each first parent.";

  $("treeView").innerHTML = `<section class="rd685-viz" role="img" aria-label="${vi ? "Trực quan hóa Redundant Connection II" : "Redundant Connection II visualization"}">
    <header><strong>REDUNDANT CONNECTION II</strong><span>${escapeHtml(view.phase || "")}</span></header>
    <section class="rd685-stages">${stageHtml}</section>
    <section class="rd685-action"><small>${escapeHtml(view.phase || "init").toUpperCase()}</small><strong>${escapeHtml(decision)}</strong></section>
    <section class="rd685-graph"><header><strong>${vi ? "ĐỒ THỊ CÓ HƯỚNG" : "DIRECTED GRAPH"}</strong><span>${vi ? "# = vị trí edge trong input" : "# = edge position in input"}</span></header><svg viewBox="0 0 ${size} ${size}" role="img"><defs><marker id="rd685-arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L7,3 z"/></marker></defs>${edgeSvg}${nodeSvg}</svg></section>
    <section class="rd685-lower">
      <section class="rd685-panel"><header><strong>INCOMING PARENT</strong></header><div class="rd685-parents">${incomingHtml}</div></section>
      <section class="rd685-panel"><header><strong>UNION-FIND</strong><span>p / root</span></header><div class="rd685-dsus">${dsuHtml}</div></section>
    </section>
    <section class="rd685-legend"><span class="first"></span>${vi ? "first (parent đến trước)" : "first (earlier parent)"}<span class="second"></span>${vi ? "second (bị bỏ tạm)" : "second (temporarily skipped)"}<span class="cycle"></span>cycle<span class="removed"></span>${vi ? "cạnh xóa" : "removal edge"}</section>
  </section>`;
}

function renderMountain1095View(step) {
  const view = step.mountain1095View || {};
  const vi = lang === "vi";
  const nums = Array.isArray(view.nums) ? view.nums : [];
  const phase = String(view.phase || "peak");
  const lo = Number.isInteger(view.lo) ? view.lo : null;
  const hi = Number.isInteger(view.hi) ? view.hi : null;
  const mid = Number.isInteger(view.mid) ? view.mid : null;
  const peak = Number.isInteger(view.peak) ? view.peak : null;
  const found = Number.isInteger(view.found) ? view.found : null;
  const rangeActive = (index) => lo !== null && hi !== null && index >= lo && index <= hi;
  const stageIndex = phase === "done" ? 3
    : ["desc", "desc-exit", "call-desc"].includes(phase) ? 2
      : ["asc", "asc-exit", "peak-found"].includes(phase) ? 1 : 0;
  const probed = new Set(Array.isArray(view.probed) ? view.probed : []);
  const stages = [
    vi ? "Tìm đỉnh" : "Find peak",
    vi ? "Tìm nửa tăng" : "Search rising side",
    vi ? "Tìm nửa giảm" : "Search falling side",
  ].map((label, index) => {
    const state = phase === "done" || index < stageIndex ? "done" : index === stageIndex ? "active" : "pending";
    return `<span class="${state}"><small>${state === "done" ? "OK" : index + 1}</small><strong>${escapeHtml(label)}</strong></span>`;
  }).join("");
  const cells = nums.map((value, index) => {
    const classes = ["m1095-cell"];
    if (rangeActive(index)) classes.push("in-range");
    if (index === mid) classes.push("mid");
    if (index === peak) classes.push("peak");
    if (index === found) classes.push("found");
    if (probed.has(index)) classes.push("probed");
    if (value === view.target) classes.push("target-value");
    const tags = [];
    if (index === lo) tags.push("LO");
    if (index === mid) tags.push("MID");
    if (index === hi) tags.push("HI");
    if (index === peak) tags.push("PEAK");
    if (index === found) tags.push("FOUND");
    return `<span class="${classes.join(" ")}"><small>[${index}]</small><strong>${escapeHtml(String(value))}</strong><em>${escapeHtml(tags.join(" · ") || " ")}</em></span>`;
  }).join("");
  const mode = phase === "peak" || phase === "peak-exit" || phase === "peak-found"
    ? `<code>${mid === null ? "compare get(mid) and get(mid + 1)" : `get(mid) ${nums[mid] < nums[mid + 1] ? "<" : "≥"} get(mid + 1)`}</code>`
    : phase === "asc" || phase === "asc-exit"
      ? `<code>ascending binary search</code>`
      : phase === "desc" || phase === "desc-exit"
        ? `<code>descending binary search</code>`
        : `<code>return ${found === null ? "-1" : found}</code>`;
  const targetMatches = nums.map((value, index) => value === view.target ? index : null).filter((index) => index !== null);
  const answer = view.answer == null ? "—" : String(view.answer);
  const activeLine = Array.isArray(step.codeLines) ? step.codeLines[0] : null;
  const actionText = pick(step.note) || (vi ? "Theo dõi cửa sổ binary search hiện tại." : "Follow the current binary-search window.");
  const summary = vi
    ? `Mountain Array: ${phase}, vùng đang xét ${lo ?? "-"} đến ${hi ?? "-"}.`
    : `Mountain Array: ${phase}, current range ${lo ?? "-"} through ${hi ?? "-"}.`;

  $("treeView").innerHTML = `<section class="m1095-viz" role="img" aria-label="${escapeHtml(summary)}">
    <header><strong>FIND IN MOUNTAIN ARRAY</strong><span>${nums.length} ${vi ? "phần tử" : "values"}</span></header>
    <section class="m1095-stages">${stages}</section>
    <section class="m1095-action"><small>${vi ? "DÒNG" : "LINE"} ${activeLine ?? "—"} · ${escapeHtml(phase.toUpperCase())}</small><strong>${escapeHtml(actionText)}</strong></section>
    <section class="m1095-array"><header><strong>MOUNTAIN ARRAY</strong><span>${vi ? "khung xanh là khoảng binary search hiện tại" : "blue range is the current binary-search interval"}</span></header><div>${cells}</div></section>
    <section class="m1095-lower">
      <div class="m1095-rule"><small>${vi ? "ĐIỀU KIỆN ĐANG DÙNG" : "CURRENT RULE"}</small><strong>${mode}</strong><span>${phase === "peak" ? (vi ? "Nếu còn tăng, bỏ nửa trái; nếu đã giảm, giữ nửa trái gồm mid." : "If it still rises, discard the left half; otherwise keep the left half including mid.") : phase === "asc" || phase === "asc-exit" ? (vi ? "Tăng: giá trị nhỏ hơn target thì đi sang phải." : "Ascending: a value below target moves right.") : phase === "desc" || phase === "desc-exit" ? (vi ? "Giảm: giá trị lớn hơn target thì đi sang phải." : "Descending: a value above target moves right.") : (vi ? "Đỉnh đã chia mảng thành hai đoạn đơn điệu." : "The peak splits the array into two monotonic searches.")}</span></div>
      <div class="m1095-pointers"><span><small>LO</small><strong>${lo ?? "—"}</strong></span><span><small>MID</small><strong>${mid ?? "—"}</strong></span><span><small>HI</small><strong>${hi ?? "—"}</strong></span><span><small>PEAK</small><strong>${peak ?? "?"}</strong></span><span><small>get()</small><strong>${Number(view.gets) || 0}</strong></span></div>
    </section>
    <section class="m1095-result"><div><small>TARGET</small><strong>${escapeHtml(String(view.target ?? "?"))}</strong><span>${targetMatches.length ? `${vi ? "xuất hiện tại index" : "appears at index"} ${targetMatches.join(", ")}` : (vi ? "không xuất hiện" : "not present")}</span></div><div><small>${vi ? "KẾT QUẢ" : "RESULT INDEX"}</small><strong>${answer}</strong><span>${found === -1 ? (vi ? "không tìm thấy" : "not found") : found === null ? (vi ? "đang tìm" : "searching") : (vi ? "ưu tiên nửa tăng trước" : "rising side checked first")}</span></div></section>
  </section>`;
}

function renderEmployee690View(step) {
  const view = step.employee690View || {};
  const vi = lang === "vi";
  const employees = Array.isArray(view.employees) ? view.employees : [];
  const employeeById = new Map(employees.map((employee) => [employee.id, employee]));
  const roots = Array.isArray(view.roots) ? view.roots : [];
  const reachable = new Set(view.reachable || []);
  const mapped = new Set(view.mappedIds || []);
  const callStack = Array.isArray(view.callStack) ? view.callStack : [];
  const stackSet = new Set(callStack);
  const frameTotals = view.frameTotals || {};
  const returnedTotals = view.returnedTotals || {};
  const activeId = view.activeId;
  const activeChild = view.activeChild;
  const phaseIndex = ["map-init", "map-entry"].includes(view.phase) ? 0
    : view.phase === "start" ? 1
      : ["call", "lookup", "own", "child", "recurse", "leaf"].includes(view.phase) ? 2
        : view.phase === "add" ? 3 : 4;
  const stages = (vi
    ? ["Tạo Hash Map", "Chọn id", "DFS cây con", "Cộng subtotal", "Trả kết quả"]
    : ["Build Hash Map", "Choose id", "DFS subtree", "Add subtotals", "Return result"])
    .map((label, index) => {
      const state = index < phaseIndex ? "done" : index === phaseIndex ? "active" : "pending";
      return `<span class="${state}"><small>${state === "done" ? "OK" : index + 1}</small><strong>${escapeHtml(label)}</strong></span>`;
    }).join("");

  let nextLeaf = 0;
  const units = new Map();
  const place = (id) => {
    const employee = employeeById.get(id);
    if (!employee) return nextLeaf++;
    const childUnits = (employee.subordinates || []).map(place);
    const unit = childUnits.length ? childUnits.reduce((sum, value) => sum + value, 0) / childUnits.length : nextLeaf++;
    units.set(id, unit);
    return unit;
  };
  roots.forEach(place);
  employees.forEach((employee) => {
    if (!units.has(employee.id)) place(employee.id);
  });
  const leafSlots = Math.max(nextLeaf, 1);
  const svgWidth = Math.max(540, leafSlots * 150 + 80);
  const maxDepth = Math.max(0, ...employees.map((employee) => Number(employee.depth) || 0));
  const svgHeight = Math.max(170, maxDepth * 120 + 130);
  const positions = new Map();
  employees.forEach((employee) => {
    const unit = units.get(employee.id) ?? 0;
    const x = leafSlots === 1 ? svgWidth / 2 : 70 + unit * (svgWidth - 140) / (leafSlots - 1);
    positions.set(employee.id, { x, y: 60 + (Number(employee.depth) || 0) * 120 });
  });
  const edges = employees.filter((employee) => employee.parentId !== null).map((employee) => {
    const from = positions.get(employee.parentId);
    const to = positions.get(employee.id);
    if (!from || !to) return "";
    const classes = [reachable.has(employee.id) ? "reachable" : "outside", employee.id === activeChild ? "active" : ""];
    return `<path class="${classes.join(" ")}" d="M ${from.x} ${from.y + 29} C ${from.x} ${from.y + 68}, ${to.x} ${to.y - 68}, ${to.x} ${to.y - 29}"></path>`;
  }).join("");
  const nodes = employees.map((employee) => {
    const position = positions.get(employee.id);
    if (!position) return "";
    const classes = ["emp690-node"];
    if (!reachable.has(employee.id)) classes.push("outside");
    if (mapped.has(employee.id)) classes.push("mapped");
    if (stackSet.has(employee.id)) classes.push("stacked");
    if (Object.prototype.hasOwnProperty.call(returnedTotals, employee.id)) classes.push("returned");
    if (employee.id === view.targetId) classes.push("target");
    if (employee.id === activeChild) classes.push("child");
    if (employee.id === activeId) classes.push("active");
    const hasReturned = Object.prototype.hasOwnProperty.call(returnedTotals, employee.id);
    const hasFrame = Object.prototype.hasOwnProperty.call(frameTotals, employee.id);
    const subtotal = hasReturned ? returnedTotals[employee.id] : hasFrame ? frameTotals[employee.id] : null;
    const meta = subtotal === null ? `${employee.importance >= 0 ? "+" : ""}${employee.importance}` : `total ${subtotal}`;
    return `<g class="${classes.join(" ")}" transform="translate(${position.x} ${position.y})"><rect x="-59" y="-29" width="118" height="58" rx="6"></rect><text class="id" text-anchor="middle" y="-3">#${escapeHtml(employee.id)}</text><text class="importance" text-anchor="middle" y="16">${escapeHtml(meta)}</text></g>`;
  }).join("");
  const treeHtml = `<div class="emp690-tree-scroll"><svg viewBox="0 0 ${svgWidth} ${svgHeight}" role="img" aria-label="${escapeHtml(vi ? "Cây quản lý nhân viên và trạng thái DFS" : "Employee hierarchy and DFS state")}"><g class="emp690-edges">${edges}</g><g>${nodes}</g></svg></div>`;

  const stackHtml = callStack.length
    ? callStack.map((id, index) => {
      const total = Object.prototype.hasOwnProperty.call(frameTotals, id) ? frameTotals[id] : "?";
      return `<span class="${id === activeId ? "active" : ""}"><small>${index === callStack.length - 1 ? "TOP" : index}</small><strong>dfs(${escapeHtml(id)})</strong><em>total = ${escapeHtml(total)}</em></span>`;
    }).join("")
    : `<em>${vi ? "call stack rỗng" : "empty call stack"}</em>`;
  const activeEmployee = employeeById.get(activeId);
  const childReturns = activeEmployee
    ? (activeEmployee.subordinates || []).filter((id) => Object.prototype.hasOwnProperty.call(returnedTotals, id)).map((id) => ({ id, total: returnedTotals[id] }))
    : [];
  const ownImportance = activeEmployee ? activeEmployee.importance : null;
  const activeTotal = Object.prototype.hasOwnProperty.call(frameTotals, activeId)
    ? frameTotals[activeId]
    : Object.prototype.hasOwnProperty.call(returnedTotals, activeId) ? returnedTotals[activeId] : null;
  const formulaTerms = ownImportance === null
    ? `<em>${vi ? "chưa vào DFS" : "DFS has not started"}</em>`
    : [`<span class="own"><small>${vi ? "BẢN THÂN" : "OWN"}</small><strong>${escapeHtml(ownImportance)}</strong></span>`, ...childReturns.map((entry) => `<b>+</b><span class="child"><small>dfs(${escapeHtml(entry.id)})</small><strong>${escapeHtml(entry.total)}</strong></span>`)].join("");
  const returns = Array.isArray(view.returnLog) ? view.returnLog : [];
  const returnHtml = returns.length
    ? returns.map((entry) => `<span class="${entry.id === activeId ? "active" : ""}"><small>dfs(${escapeHtml(entry.id)})</small><strong>${escapeHtml(entry.total)}</strong></span>`).join("")
    : `<em>${vi ? "chưa có frame return" : "no frame has returned"}</em>`;
  const ready = Number.isInteger(view.answer);

  $("treeView").innerHTML = `<section class="emp690-viz" role="img" aria-label="${escapeHtml(vi ? "Mô phỏng Employee Importance" : "Employee Importance simulation")}">
    <div class="emp690-stages">${stages}</div>
    <section class="emp690-action"><small>${vi ? "DÒNG" : "LINE"} ${(step.codeLines || [])[0] ?? "-"}</small><strong>${escapeHtml(pick(step.title))}</strong><span>${escapeHtml(pick(step.note))}</span></section>
    <section class="emp690-tree"><header><strong>${vi ? "SƠ ĐỒ NHÂN VIÊN" : "EMPLOYEE HIERARCHY"}</strong><span>${vi ? `tính từ id #${view.targetId}` : `calculate from id #${view.targetId}`}</span></header>${treeHtml}</section>
    <div class="emp690-state"><section class="emp690-stack"><header><strong>DFS CALL STACK</strong><span>${callStack.length}</span></header><div>${stackHtml}</div></section><section class="emp690-formula"><header><strong>${vi ? "SUBTOTAL CỦA FRAME" : "FRAME SUBTOTAL"}</strong><span>${activeId === null ? "—" : `dfs(${escapeHtml(activeId)})`}</span></header><div>${formulaTerms}</div><footer><small>total</small><strong>${activeTotal === null ? "?" : escapeHtml(activeTotal)}</strong></footer></section></div>
    <section class="emp690-returns"><header><strong>${vi ? "CÁC GIÁ TRỊ ĐÃ RETURN" : "RETURNED VALUES"}</strong><span>${returns.length}</span></header><div>${returnHtml}</div></section>
    <section class="emp690-answer ${ready ? "ready" : "pending"}"><small>${vi ? "TOTAL IMPORTANCE" : "TOTAL IMPORTANCE"}</small><strong>${ready ? escapeHtml(view.answer) : "…"}</strong><span>${ready ? `dfs(${escapeHtml(view.targetId)})` : (vi ? "đang cộng cây con" : "accumulating subtree")}</span></section>
    <aside class="emp690-legend"><span class="active"><i></i>${vi ? "đang chạy" : "active"}</span><span class="child"><i></i>${vi ? "sắp gọi đệ quy" : "next recursive call"}</span><span class="returned"><i></i>${vi ? "đã tính xong" : "returned"}</span><span class="outside"><i></i>${vi ? "ngoài cây con" : "outside subtree"}</span></aside>
  </section>`;
}

function renderVideos1311View(step) {
  const view = step.videos1311View || {};
  const vi = lang === "vi";
  const watchedVideos = Array.isArray(view.watchedVideos) ? view.watchedVideos : [];
  const friends = Array.isArray(view.friends) ? view.friends : [];
  const isDfs = view.algorithm === "dfs";
  const queue = Array.isArray(view.queue) ? view.queue : [];
  const callStack = Array.isArray(view.callStack) ? view.callStack : [];
  const stackPeople = callStack.map((frame) => frame.person);
  const queueSet = new Set(isDfs ? stackPeople : queue);
  const visited = new Set(view.visited || []);
  const targetPeople = new Set(view.peopleAtLevel || []);
  const counts = view.counts || {};
  const result = Array.isArray(view.result) ? view.result : [];
  const beforeSort = Array.isArray(view.beforeSort) ? view.beforeSort : Object.keys(counts);
  const phase = String(view.phase || "queue-init");
  const phaseIndex = isDfs
    ? (["distance-init", "dfs-start", "dfs-call", "distance-check", "distance-update", "level-check", "level-stop", "inspect-friend", "dfs-recurse", "dfs-prune", "dfs-return"].includes(phase) ? 0
      : ["counter-init", "scan-person", "skip-person"].includes(phase) ? 1
        : phase === "count-video" ? 2 : 3)
    : (["queue-init", "visited-init", "level-start", "dequeue", "inspect-friend", "visit-friend", "enqueue", "skip-friend"].includes(phase) ? 0
      : phase === "target-level" ? 1
        : ["counter-init", "collect-person", "count-video"].includes(phase) ? 2 : 3);
  const stageLabels = isDfs
    ? (vi ? ["DFS cập nhật distance", `Lọc level ${view.targetLevel}`, "Đếm video", "Sắp xếp kết quả"] : ["DFS improves distance", `Filter level ${view.targetLevel}`, "Count videos", "Sort result"])
    : (vi ? ["BFS theo lớp", `Chốt level ${view.targetLevel}`, "Đếm video", "Sắp xếp kết quả"] : ["Layered BFS", `Lock level ${view.targetLevel}`, "Count videos", "Sort result"]);
  const stages = stageLabels.map((label, index) => {
    const state = index < phaseIndex || phase === "done" ? "done" : index === phaseIndex ? "active" : "pending";
    return `<span class="${state}"><small>${state === "done" ? "OK" : index + 1}</small><strong>${escapeHtml(label)}</strong></span>`;
  }).join("");

  const layoutDistances = Array(friends.length).fill(null);
  if (Number.isInteger(view.id) && friends[view.id]) {
    layoutDistances[view.id] = 0;
    const bfs = [view.id];
    for (let head = 0; head < bfs.length; head += 1) {
      const person = bfs[head];
      (friends[person] || []).forEach((friend) => {
        if (layoutDistances[friend] === null) {
          layoutDistances[friend] = layoutDistances[person] + 1;
          bfs.push(friend);
        }
      });
    }
  }
  const displayDistances = isDfs && Array.isArray(view.distance) ? view.distance : layoutDistances;
  const maxDistance = Math.max(0, ...layoutDistances.filter((distance) => distance !== null));
  const columns = Array.from({ length: maxDistance + 1 }, (_, distance) => watchedVideos.map((_, person) => person).filter((person) => layoutDistances[person] === distance));
  const unreachable = watchedVideos.map((_, person) => person).filter((person) => layoutDistances[person] === null);
  if (unreachable.length) columns.push(unreachable);
  const maxRows = Math.max(1, ...columns.map((column) => column.length));
  const svgWidth = Math.max(620, columns.length * 170 + 50);
  const svgHeight = Math.max(190, maxRows * 100 + 66);
  const positions = new Map();
  columns.forEach((column, columnIndex) => column.forEach((person, rowIndex) => {
    const x = 70 + columnIndex * ((svgWidth - 140) / Math.max(columns.length - 1, 1));
    const gap = svgHeight / (column.length + 1);
    positions.set(person, { x, y: gap * (rowIndex + 1) });
  }));
  const edges = friends.flatMap((neighbors, person) => neighbors.filter((friend) => person < friend).map((friend) => {
    const from = positions.get(person);
    const to = positions.get(friend);
    if (!from || !to) return "";
    const active = (person === view.activePerson && friend === view.activeFriend) || (friend === view.activePerson && person === view.activeFriend);
    return `<line class="${active ? "active" : ""}" x1="${from.x}" y1="${from.y}" x2="${to.x}" y2="${to.y}"></line>`;
  })).join("");
  const nodes = watchedVideos.map((videos, person) => {
    const position = positions.get(person);
    if (!position) return "";
    const classes = ["vid1311-node"];
    if (person === view.id) classes.push("source");
    if (visited.has(person)) classes.push("visited");
    if (queueSet.has(person)) classes.push("queued");
    if (targetPeople.has(person)) classes.push("target");
    if (person === view.activePerson) classes.push("active");
    if (person === view.activeFriend) classes.push("friend");
    const badge = targetPeople.has(person) ? `LEVEL ${view.targetLevel}` : queueSet.has(person) ? (isDfs ? "STACK" : "QUEUE") : visited.has(person) ? (isDfs ? "KNOWN" : "SEEN") : "";
    return `<g class="${classes.join(" ")}" transform="translate(${position.x} ${position.y})"><rect x="-57" y="-29" width="114" height="58" rx="6"></rect><text class="person" text-anchor="middle" y="-5">PERSON ${person}</text><text class="distance" text-anchor="middle" y="12">dist ${displayDistances[person] ?? "∞"}${badge ? ` · ${badge}` : ""}</text></g>`;
  }).join("");
  const graphHtml = `<div class="vid1311-graph-scroll"><svg viewBox="0 0 ${svgWidth} ${svgHeight}" role="img" aria-label="${escapeHtml(isDfs ? (vi ? "Đồ thị bạn bè và distance đang được DFS cập nhật" : "Friend graph with distances being improved by DFS") : (vi ? "Đồ thị bạn bè theo khoảng cách BFS" : "Friend graph grouped by BFS distance"))}"><g class="vid1311-edges">${edges}</g><g>${nodes}</g></svg></div>`;

  const queueHtml = isDfs
    ? (callStack.length
      ? callStack.map((frame, index) => `<span class="${index === callStack.length - 1 ? "active" : ""}"><small>${index === callStack.length - 1 ? "TOP" : index}</small><strong>dfs(${frame.person}, ${frame.depth})</strong><em>dist[${frame.person}] = ${displayDistances[frame.person] ?? "∞"}</em></span>`).join("")
      : `<em>${vi ? "call stack rỗng" : "empty call stack"}</em>`)
    : (queue.length
      ? queue.map((person, index) => `<span class="${person === view.activePerson ? "active" : ""}"><small>${index === 0 ? "FRONT" : index}</small><strong>${person}</strong><em>dist ${displayDistances[person] ?? "?"}</em></span>`).join("")
      : `<em>${vi ? "queue rỗng" : "empty queue"}</em>`);
  const peopleCards = watchedVideos.map((videos, person) => {
    const classes = [];
    if (targetPeople.has(person)) classes.push("target");
    if (person === view.activePerson) classes.push("active");
    return `<span class="${classes.join(" ")}"><small>PERSON ${person}${targetPeople.has(person) ? ` · LEVEL ${view.targetLevel}` : ""}</small><strong>${videos.map((video) => escapeHtml(video)).join(" · ") || "—"}</strong></span>`;
  }).join("");
  const frequencyEntries = Object.entries(counts);
  const frequencyHtml = frequencyEntries.length
    ? frequencyEntries.map(([video, count]) => `<span class="${video === view.activeVideo ? "active" : ""}"><small>${escapeHtml(video)}</small><strong>${count}</strong><em>${vi ? "lượt" : "view(s)"}</em></span>`).join("")
    : `<em>${vi ? "chưa đếm video" : "no videos counted yet"}</em>`;
  const order = phase === "done" ? result : beforeSort;
  const sortHtml = order.length
    ? order.map((video, index) => `<span class="${phase === "done" ? "done" : ""}"><small>#${index + 1}</small><strong>${escapeHtml(video)}</strong><em>(${counts[video] ?? "?"}, ${escapeHtml(video)})</em></span>`).join("")
    : `<em>${vi ? "chưa có ứng viên" : "no candidates yet"}</em>`;

  $("treeView").innerHTML = `<section class="vid1311-viz ${isDfs ? "dfs" : "bfs"}" role="img" aria-label="${escapeHtml(isDfs ? (vi ? "Mô phỏng DFS distance và xếp hạng video" : "DFS distance and video ranking simulation") : (vi ? "Mô phỏng BFS và xếp hạng video" : "BFS and video ranking simulation"))}">
    <div class="vid1311-stages">${stages}</div>
    <section class="vid1311-action"><small>${vi ? "DÒNG" : "LINE"} ${(step.codeLines || [])[0] ?? "-"}</small><strong>${escapeHtml(pick(step.title))}</strong><span>${escapeHtml(pick(step.note))}</span></section>
    <section class="vid1311-network"><header><strong>${vi ? "MẠNG BẠN BÈ" : "FRIEND NETWORK"}</strong><span>${vi ? `nguồn ${view.id} · cần đúng khoảng cách ${view.targetLevel}` : `source ${view.id} · exact distance ${view.targetLevel}`}</span></header>${graphHtml}</section>
    <div class="vid1311-state"><section class="vid1311-queue"><header><strong>${isDfs ? "DFS CALL STACK" : "BFS QUEUE"}</strong><span>${isDfs ? callStack.length : queue.length}</span></header><div>${queueHtml}</div></section><section class="vid1311-level"><small>${isDfs ? (vi ? "DEPTH ĐANG THỬ" : "CURRENT DEPTH") : (vi ? "LỚP ĐANG XỬ LÝ" : "CURRENT LAYER")}</small><strong>${view.currentLevel ?? 0} / ${view.targetLevel}</strong><span>${isDfs ? `old dist = ${view.previousDistance ?? "∞"}` : `level_size = ${view.levelSize ?? "?"}`}</span></section></div>
    <section class="vid1311-watch"><header><strong>${vi ? "VIDEO CỦA TỪNG NGƯỜI" : "VIDEOS BY PERSON"}</strong><span>${vi ? "chỉ thẻ xanh được đưa vào Counter" : "only green cards feed the Counter"}</span></header><div>${peopleCards}</div></section>
    <div class="vid1311-bottom"><section class="vid1311-count"><header><strong>COUNTER</strong><span>${frequencyEntries.length}</span></header><div>${frequencyHtml}</div></section><section class="vid1311-sort"><header><strong>${vi ? "THỨ TỰ (TẦN SUẤT, TÊN)" : "ORDER (FREQUENCY, TITLE)"}</strong><span>${phase === "done" ? "SORTED" : "PENDING"}</span></header><div>${sortHtml}</div></section></div>
  </section>`;
}

function renderBombs2101View(step) {
  const view = step.bombs2101View || {};
  const vi = lang === "vi";
  const bombs = Array.isArray(view.bombs) ? view.bombs : [];
  const graph = Array.isArray(view.graph) ? view.graph : [];
  const detonated = new Set(view.detonated || []);
  const stack = Array.isArray(view.stack) ? view.stack : [];
  const stackSet = new Set(stack);
  const trials = Array.isArray(view.trialCounts) ? view.trialCounts : [];
  const phase = String(view.phase || "graph-init");
  const phaseIndex = ["graph-init", "skip-self", "distance-check", "add-edge"].includes(phase) ? 0
    : phase === "graph-done" ? 1
      : ["dfs-start", "dfs-pop", "dfs-edge", "dfs-see", "dfs-push", "dfs-skip"].includes(phase) ? 2 : 3;
  const stages = (vi
    ? ["Kiểm tra mọi cặp", "Chốt đồ thị có hướng", "DFS từng bom", "Lấy maximum"]
    : ["Check every pair", "Lock directed graph", "DFS each bomb", "Take maximum"])
    .map((label, index) => {
      const state = index < phaseIndex || phase === "done" ? "done" : index === phaseIndex ? "active" : "pending";
      return `<span class="${state}"><small>${state === "done" ? "OK" : index + 1}</small><strong>${escapeHtml(label)}</strong></span>`;
    }).join("");

  const minX = Math.min(...bombs.map(([x, , r]) => x - r), 0);
  const maxX = Math.max(...bombs.map(([x, , r]) => x + r), 1);
  const minY = Math.min(...bombs.map(([, y, r]) => y - r), 0);
  const maxY = Math.max(...bombs.map(([, y, r]) => y + r), 1);
  const plotWidth = 720;
  const plotHeight = 350;
  const padding = 34;
  const scale = Math.min((plotWidth - 2 * padding) / Math.max(maxX - minX, 1), (plotHeight - 2 * padding) / Math.max(maxY - minY, 1));
  const usedWidth = (maxX - minX) * scale;
  const usedHeight = (maxY - minY) * scale;
  const offsetX = (plotWidth - usedWidth) / 2;
  const offsetY = (plotHeight - usedHeight) / 2;
  const points = bombs.map(([x, y, radius]) => ({
    x: offsetX + (x - minX) * scale,
    y: plotHeight - (offsetY + (y - minY) * scale),
    radius: radius * scale,
  }));
  const stateClasses = (index, base) => {
    const classes = [base];
    if (index === view.buildI) classes.push("source");
    if (index === view.buildJ) classes.push("check");
    if (index === view.activeStart) classes.push("start");
    if (detonated.has(index)) classes.push("detonated");
    if (stackSet.has(index)) classes.push("stacked");
    if (index === view.activeBomb) classes.push("active");
    if (index === view.activeNext) classes.push("next");
    return classes;
  };
  const relationFrom = Number.isInteger(view.buildI) ? view.buildI : view.activeBomb;
  const relationTo = Number.isInteger(view.buildJ) ? view.buildJ : view.activeNext;
  const relationLine = Number.isInteger(relationFrom) && Number.isInteger(relationTo) && relationFrom !== relationTo && points[relationFrom] && points[relationTo]
    ? `<line class="pair" x1="${points[relationFrom].x}" y1="${points[relationFrom].y}" x2="${points[relationTo].x}" y2="${points[relationTo].y}" marker-end="url(#bomb2101-map-arrow)"></line>`
    : "";
  const rings = bombs.map((bomb, index) => {
    const point = points[index];
    return `<g class="${stateClasses(index, "bomb2101-bomb").join(" ")}"><circle class="radius" cx="${point.x}" cy="${point.y}" r="${point.radius}"></circle><circle class="center" cx="${point.x}" cy="${point.y}" r="14"></circle><text x="${point.x}" y="${point.y + 4}" text-anchor="middle">${index}</text></g>`;
  }).join("");
  const plotHtml = `<div class="bomb2101-plot-scroll"><svg viewBox="0 0 ${plotWidth} ${plotHeight}" role="img" aria-label="${escapeHtml(vi ? "Vị trí tâm bom và bán kính thật theo cùng tỉ lệ" : "Bomb centers and radii at one scale")}"><defs><marker id="bomb2101-map-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z"></path></marker></defs><g class="bomb2101-map-relation">${relationLine}</g><g>${rings}</g></svg></div>`;
  const bombDataHtml = bombs.map((bomb, index) => `<span class="${stateClasses(index, "bomb2101-data-item").join(" ")}"><small>BOMB ${index}</small><strong>(${bomb[0]}, ${bomb[1]})</strong><em>r = ${bomb[2]}</em></span>`).join("");

  const chainWidth = 720;
  const chainHeight = 340;
  const chainCenter = { x: chainWidth / 2, y: chainHeight / 2 };
  const chainRadius = bombs.length <= 2 ? 150 : 122;
  const chainPoints = bombs.map((_, index) => {
    if (bombs.length === 1) return { ...chainCenter };
    const angle = bombs.length === 2 ? (index === 0 ? Math.PI : 0) : -Math.PI / 2 + index * Math.PI * 2 / bombs.length;
    return { x: chainCenter.x + Math.cos(angle) * chainRadius, y: chainCenter.y + Math.sin(angle) * chainRadius };
  });
  const chainEdges = graph.flatMap((neighbors, from) => neighbors.map((to) => {
    const a = chainPoints[from];
    const b = chainPoints[to];
    if (!a || !b) return "";
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const length = Math.hypot(dx, dy) || 1;
    const ux = dx / length;
    const uy = dy / length;
    const startX = a.x + ux * 27;
    const startY = a.y + uy * 27;
    const endX = b.x - ux * 31;
    const endY = b.y - uy * 31;
    const reciprocal = (graph[to] || []).includes(from);
    const bend = reciprocal ? 24 : 0;
    const controlX = (a.x + b.x) / 2 - uy * bend;
    const controlY = (a.y + b.y) / 2 + ux * bend;
    const active = (from === view.activeBomb && to === view.activeNext) || (from === view.buildI && to === view.buildJ);
    return `<path class="${active ? "active" : ""}" d="M ${startX} ${startY} Q ${controlX} ${controlY} ${endX} ${endY}" marker-end="url(#bomb2101-graph-arrow)"></path>`;
  })).join("");
  const chainNodes = bombs.map((_, index) => {
    const point = chainPoints[index];
    const outDegree = (graph[index] || []).length;
    return `<g class="${stateClasses(index, "bomb2101-chain-node").join(" ")}" transform="translate(${point.x} ${point.y})"><circle r="24"></circle><text class="id" text-anchor="middle" y="5">${index}</text><text class="degree" text-anchor="middle" y="43">out: ${outDegree}</text></g>`;
  }).join("");
  const chainHtml = `<div class="bomb2101-chain-scroll"><svg viewBox="0 0 ${chainWidth} ${chainHeight}" role="img" aria-label="${escapeHtml(vi ? "Đồ thị kích nổ có hướng với các node giãn đều" : "Directed detonation graph with evenly spaced nodes")}"><defs><marker id="bomb2101-graph-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z"></path></marker></defs><g class="bomb2101-chain-edges">${chainEdges}</g><g>${chainNodes}</g></svg></div>`;

  const check = view.distanceCheck;
  const checkHtml = check
    ? `<section class="bomb2101-check ${check.reaches ? "yes" : "no"}"><small>${check.i} → ${check.j}</small><strong>${check.dx}² + ${check.dy}² = ${check.distanceSquared}</strong><b>${check.reaches ? "≤" : ">"}</b><strong>r${check.i}² = ${check.radiusSquared}</strong><span>${check.reaches ? (vi ? "THÊM CẠNH" : "ADD EDGE") : (vi ? "KHÔNG CÓ CẠNH" : "NO EDGE")}</span></section>`
    : `<section class="bomb2101-check idle"><small>${vi ? "ĐIỀU KIỆN CẠNH" : "EDGE CONDITION"}</small><strong>distance² ≤ radius²</strong><span>${vi ? "Mỗi chiều được kiểm tra riêng" : "Each direction is checked separately"}</span></section>`;
  const adjacency = graph.map((neighbors, index) => `<span class="${index === view.activeBomb || index === view.buildI ? "active" : ""}"><small>${index} DETONATES</small><strong>[${neighbors.join(", ")}]</strong></span>`).join("");
  const stackHtml = stack.length
    ? stack.map((bomb, index) => `<span class="${bomb === view.activeBomb ? "active" : ""}"><small>${index === stack.length - 1 ? "TOP" : index}</small><strong>${bomb}</strong></span>`).join("")
    : `<em>${vi ? "stack rỗng" : "empty stack"}</em>`;
  const seenHtml = detonated.size
    ? [...detonated].map((bomb) => `<span class="${bomb === view.activeNext ? "next" : ""}"><small>BOMB</small><strong>${bomb}</strong></span>`).join("")
    : `<em>${vi ? "chưa bắt đầu DFS" : "DFS not started"}</em>`;
  const trialHtml = bombs.map((_, start) => {
    const trial = trials.find((entry) => entry.start === start);
    const active = start === view.activeStart;
    return `<span class="${active ? "active" : trial ? "done" : "pending"}"><small>START ${start}</small><strong>${trial ? trial.count : active ? detonated.size : "?"}</strong><em>${vi ? "bom" : "bombs"}</em></span>`;
  }).join("");
  const ready = Number.isInteger(view.answer);

  $("treeView").innerHTML = `<section class="bomb2101-viz" role="img" aria-label="${escapeHtml(vi ? "Mô phỏng phản ứng dây chuyền bom" : "Bomb chain reaction simulation")}">
    <div class="bomb2101-stages">${stages}</div>
    <section class="bomb2101-action"><small>${vi ? "DÒNG" : "LINE"} ${(step.codeLines || [])[0] ?? "-"}</small><strong>${escapeHtml(pick(step.title))}</strong><span>${escapeHtml(pick(step.note))}</span></section>
    <section class="bomb2101-map"><header><strong>${vi ? "1. BẢN ĐỒ HÌNH HỌC" : "1. GEOMETRY MAP"}</strong><span>${vi ? "tâm + bán kính thật, cùng một tỉ lệ" : "centers + true radii at one scale"}</span></header>${plotHtml}<div class="bomb2101-data">${bombDataHtml}</div></section>
    <section class="bomb2101-graph"><header><strong>${vi ? "2. ĐỒ THỊ KÍCH NỔ CÓ HƯỚNG" : "2. DIRECTED DETONATION GRAPH"}</strong><span>${vi ? "node được giãn đều để đọc cạnh i → j" : "nodes are spread out to clarify i → j"}</span></header>${chainHtml}</section>
    ${checkHtml}
    <section class="bomb2101-adj"><header><strong>ADJACENCY LIST</strong><span>i → graph[i]</span></header><div>${adjacency}</div></section>
    <div class="bomb2101-dfs"><section><header><strong>DFS STACK</strong><span>${stack.length}</span></header><div>${stackHtml}</div></section><section><header><strong>${vi ? "ĐÃ KÍCH NỔ" : "DETONATED / SEEN"}</strong><span>${detonated.size}</span></header><div>${seenHtml}</div></section></div>
    <section class="bomb2101-trials"><header><strong>${vi ? "KẾT QUẢ TỪNG ĐIỂM BẮT ĐẦU" : "RESULT BY START BOMB"}</strong><span>best = ${view.best ?? 0}</span></header><div>${trialHtml}</div></section>
    <section class="bomb2101-answer ${ready ? "ready" : "pending"}"><small>MAXIMUM DETONATION</small><strong>${ready ? view.answer : view.best ?? 0}</strong><span>${ready ? (vi ? "đã thử mọi bom" : "every start tested") : (vi ? "giá trị tốt nhất hiện tại" : "best value so far")}</span></section>
  </section>`;
}

function renderThrone1600View(step) {
  const view = step.throne1600View || {};
  const vi = lang === "vi";
  const nodes = Array.isArray(view.nodes) ? view.nodes : [];
  const nodeByName = new Map(nodes.map((node) => [node.name, node]));
  const visited = new Set(view.visited || []);
  const stack = new Set(view.stack || []);
  const order = Array.isArray(view.order) ? view.order : [];
  const orderSet = new Set(order);
  const activeName = view.activeName || null;
  const newbornName = view.newbornName || null;
  const phaseLabels = {
    constructor: vi ? "Khởi tạo vương triều" : "Initialize dynasty",
    "birth-call": vi ? "Tìm cha/mẹ" : "Find parent",
    "birth-add": vi ? "Thêm người con" : "Append child",
    "death-call": vi ? "Nhận thông báo mất" : "Receive death",
    "death-mark": vi ? "Đánh dấu đã mất" : "Mark as dead",
    "query-call": vi ? "Yêu cầu thứ tự" : "Request order",
    "query-start": vi ? "Tạo order rỗng" : "Create empty order",
    visit: vi ? "DFS thăm node" : "DFS visits node",
    "alive-check": vi ? "Người còn sống" : "Person is alive",
    append: vi ? "Thêm vào kế vị" : "Append to succession",
    skip: vi ? "Bỏ qua người đã mất" : "Skip dead person",
    child: vi ? "Chọn con tiếp theo" : "Choose next child",
    recurse: vi ? "Đi sâu vào nhánh con" : "Descend into child branch",
    "query-done": vi ? "Hoàn tất preorder" : "Preorder complete",
    done: vi ? "Hoàn tất operations" : "Operations complete",
  };

  let nextLeaf = 0;
  const unitPositions = new Map();
  const place = (name) => {
    const node = nodeByName.get(name);
    if (!node) return 0;
    const childUnits = (node.children || []).map(place);
    const unit = childUnits.length ? childUnits.reduce((sum, value) => sum + value, 0) / childUnits.length : nextLeaf++;
    unitPositions.set(name, unit);
    return unit;
  };
  if (view.kingName && nodeByName.has(view.kingName)) place(view.kingName);
  const leafSlots = Math.max(nextLeaf, 1);
  const svgWidth = Math.max(520, leafSlots * 154 + 80);
  const maxDepth = Math.max(0, ...nodes.map((node) => Number(node.depth) || 0));
  const svgHeight = Math.max(150, maxDepth * 112 + 116);
  const positions = new Map();
  nodes.forEach((node) => {
    const unit = unitPositions.get(node.name) ?? 0;
    const x = leafSlots === 1 ? svgWidth / 2 : 70 + (unit * (svgWidth - 140)) / (leafSlots - 1);
    positions.set(node.name, { x, y: 55 + (Number(node.depth) || 0) * 112 });
  });
  const edges = nodes.filter((node) => node.parent !== null).map((node) => {
    const from = positions.get(node.parent);
    const to = positions.get(node.name);
    return from && to ? `<path d="M ${from.x} ${from.y + 25} C ${from.x} ${from.y + 64}, ${to.x} ${to.y - 64}, ${to.x} ${to.y - 25}"></path>` : "";
  }).join("");
  const treeNodes = nodes.map((node) => {
    const position = positions.get(node.name);
    if (!position) return "";
    const classes = ["th1600-node"];
    if (node.name === view.kingName) classes.push("king");
    if (node.dead) classes.push("dead");
    if (visited.has(node.name)) classes.push("visited");
    if (orderSet.has(node.name)) classes.push("ranked");
    if (stack.has(node.name)) classes.push("stacked");
    if (node.name === activeName) classes.push("active");
    if (node.name === newbornName) classes.push("newborn");
    const rank = order.indexOf(node.name);
    const meta = node.dead ? "DEAD" : rank >= 0 ? `#${rank + 1}` : node.name === view.kingName ? "KING" : `born ${node.birthOrder}`;
    return `<g class="${classes.join(" ")}" transform="translate(${position.x} ${position.y})"><rect x="-56" y="-24" width="112" height="48" rx="6"></rect><text class="name ${node.name.length > 10 ? "long" : ""}" text-anchor="middle" y="1">${escapeHtml(node.name)}</text><text class="meta" text-anchor="middle" y="16">${escapeHtml(meta)}</text></g>`;
  }).join("");
  const treeHtml = nodes.length
    ? `<div class="th1600-tree-scroll"><svg viewBox="0 0 ${svgWidth} ${svgHeight}" role="img" aria-label="${escapeHtml(vi ? "Cây gia phả và thứ tự kế vị" : "Family tree and inheritance order")}"><g class="th1600-edges">${edges}</g><g>${treeNodes}</g></svg></div>`
    : "";

  const operations = Array.isArray(view.operations) ? view.operations : [];
  const operationHtml = operations.map((operation, index) => {
    const state = index < view.activeOpIndex ? "done" : index === view.activeOpIndex ? "active" : "pending";
    return `<span class="${state}"><small>${index + 1}</small><strong>${escapeHtml(operation)}</strong></span>`;
  }).join("");
  const orderHtml = order.length
    ? order.map((name, index) => `<span class="${name === activeName ? "active" : ""}"><small>#${index + 1}</small><strong>${escapeHtml(name)}</strong></span>`).join("")
    : `<em>${vi ? "chưa có tên" : "no names yet"}</em>`;
  const stackValues = Array.isArray(view.stack) ? view.stack : [];
  const stackHtml = stackValues.length
    ? stackValues.map((name, index) => `<span><small>${index === stackValues.length - 1 ? "TOP" : index}</small><strong>${escapeHtml(name)}</strong></span>`).join("")
    : `<em>${vi ? "stack rỗng" : "empty stack"}</em>`;
  const outputs = Array.isArray(view.queryOutputs) ? view.queryOutputs : [];
  const outputHtml = outputs.length
    ? outputs.map((output, index) => `<span><small>GET ${index + 1}</small><strong>[${output.map((name) => escapeHtml(name)).join(", ")}]</strong></span>`).join("")
    : `<em>${vi ? "chưa gọi getInheritanceOrder" : "getInheritanceOrder not called yet"}</em>`;

  $("treeView").innerHTML = `<section class="th1600-viz" role="img" aria-label="${escapeHtml(vi ? "Mô phỏng thứ tự kế vị ngai vàng" : "Throne inheritance simulation")}">
    <header><div><small>LEETCODE 1600</small><strong>${escapeHtml(phaseLabels[view.phase] || "")}</strong></div><span>${nodes.length} ${vi ? "người" : "people"} · ${nodes.filter((node) => node.dead).length} ${vi ? "đã mất" : "dead"}</span></header>
    <div class="th1600-ops">${operationHtml}</div>
    <section class="th1600-action"><small>${vi ? "DÒNG" : "LINE"} ${(step.codeLines || [])[0] ?? "-"}</small><strong>${escapeHtml(pick(step.title))}</strong><span>${escapeHtml(pick(step.note))}</span></section>
    <section class="th1600-tree"><header><strong>${vi ? "CÂY GIA PHẢ" : "FAMILY TREE"}</strong><span>${vi ? "trái → phải là thứ tự sinh" : "left → right follows birth order"}</span></header>${treeHtml}</section>
    <section class="th1600-order"><header><strong>${view.orderIsPartial ? (vi ? "ORDER ĐANG DỰNG" : "ORDER IN PROGRESS") : (vi ? "THỨ TỰ KẾ VỊ" : "INHERITANCE ORDER")}</strong><span>preorder DFS</span></header><div>${orderHtml}</div></section>
    <div class="th1600-bottom"><section><header><strong>DFS CALL STACK</strong><span>${stackValues.length}</span></header><div>${stackHtml}</div></section><section><header><strong>${vi ? "KẾT QUẢ QUERY" : "QUERY OUTPUTS"}</strong><span>${outputs.length}</span></header><div>${outputHtml}</div></section></div>
    <aside class="th1600-legend"><span class="active"><i></i>${vi ? "đang xử lý" : "active"}</span><span class="newborn"><i></i>${vi ? "vừa sinh" : "new birth"}</span><span class="ranked"><i></i>${vi ? "đã vào order" : "in order"}</span><span class="dead"><i></i>${vi ? "đã mất, vẫn giữ nhánh" : "dead, branch retained"}</span></aside>
  </section>`;
}

function renderNary429View(step) {
  const view = step.nary429View || {};
  const vi = lang === "vi";
  const nodes = Array.isArray(view.nodes) ? view.nodes : [];
  const nodeById = new Map(nodes.map((node) => [node.id, node]));
  const queueIds = Array.isArray(view.queueIds) ? view.queueIds : [];
  const visitedIds = new Set(view.visitedIds || []);
  const childIds = new Set(view.childIds || []);
  const currentId = Number.isInteger(view.currentId) ? view.currentId : null;
  const currentLevel = Array.isArray(view.currentLevel) ? view.currentLevel : [];
  const result = Array.isArray(view.result) ? view.result : [];
  const levelIndex = Number.isInteger(view.levelIndex) ? view.levelIndex : null;
  const phase = String(view.phase || "guard");
  const decision = view.decision || {};
  const phaseIndex = phase === "done" || phase === "empty" ? 3 : phase === "level-done" ? 2 : ["for", "dequeue", "append-value", "enqueue-children"].includes(phase) ? 1 : 0;
  const stages = [
    { label: vi ? "Khởi tạo queue" : "Initialize queue", detail: "root" },
    { label: vi ? "Xử lý một tầng" : "Process one level", detail: "popleft + children" },
    { label: vi ? "Lưu level" : "Store level", detail: "result.append" },
  ].map((item, index) => {
    const state = phaseIndex === 3 || index < phaseIndex ? "done" : index === phaseIndex ? "active" : "pending";
    return `<span class="${state}"><small>${state === "done" ? "OK" : index + 1}</small><strong>${escapeHtml(item.label)}</strong><em>${escapeHtml(item.detail)}</em></span>`;
  }).join("");

  let decisionHtml;
  if (decision.kind === "empty") {
    decisionHtml = `<section class="n429-decision empty"><small>${vi ? "ROOT RỖNG" : "EMPTY ROOT"}</small><strong>return []</strong><span>${vi ? "Không có node nào cần đưa vào queue." : "There is no node to enqueue."}</span></section>`;
  } else if (decision.kind === "guard") {
    decisionHtml = `<section class="n429-decision init"><small>${vi ? "KIỂM TRA" : "GUARD"}</small><strong>root = ${escapeHtml(String(decision.root))}</strong><span>${vi ? "root tồn tại, nên tiếp tục khởi tạo BFS." : "root exists, so BFS initialization continues."}</span></section>`;
  } else if (decision.kind === "init-result") {
    decisionHtml = `<section class="n429-decision init"><small>RESULT</small><strong>result = []</strong><span>${vi ? "Mỗi tầng hoàn chỉnh sẽ trở thành một mảng con trong result." : "Each completed level becomes a subarray of result."}</span></section>`;
  } else if (decision.kind === "init-queue") {
    decisionHtml = `<section class="n429-decision queue"><small>QUEUE</small><strong>deque([${escapeHtml(String(decision.root))}])</strong><span>${vi ? "Gốc nằm ở FRONT của queue." : "The root is at the FRONT of the queue."}</span></section>`;
  } else if (decision.kind === "while") {
    decisionHtml = `<section class="n429-decision queue"><small>WHILE</small><strong>while queue: ${decision.size} ${vi ? "node" : "node(s)"}</strong><span>${vi ? "Bắt đầu xử lý một tầng mới." : "Start processing a new level."}</span></section>`;
  } else if (decision.kind === "level-size") {
    decisionHtml = `<section class="n429-decision queue"><small>LEVEL SIZE</small><strong>level_size = ${decision.size}</strong><span>${vi ? "Các node được thêm sau thời điểm này phải chờ sang tầng kế tiếp." : "Nodes added after this point wait for the next level."}</span></section>`;
  } else if (decision.kind === "level-init") {
    decisionHtml = `<section class="n429-decision init"><small>LEVEL</small><strong>level = []</strong><span>${vi ? `Bắt đầu gom giá trị cho tầng ${decision.levelIndex}.` : `Start collecting values for level ${decision.levelIndex}.`}</span></section>`;
  } else if (decision.kind === "for") {
    decisionHtml = `<section class="n429-decision queue"><small>FOR</small><strong>${decision.offset + 1}/${decision.size}</strong><span>${vi ? "Lặp đúng level_size lần để không lẫn node tầng sau." : "Loop exactly level_size times so next-level nodes do not mix in."}</span></section>`;
  } else if (decision.kind === "dequeue") {
    decisionHtml = `<section class="n429-decision current"><small>POP LEFT</small><strong>node = ${escapeHtml(String(decision.value))}</strong><span>${vi ? "Node vừa rời FRONT của queue." : "The node just left the FRONT of the queue."}</span></section>`;
  } else if (decision.kind === "append-value") {
    decisionHtml = `<section class="n429-decision current"><small>APPEND VALUE</small><strong>level.append(${escapeHtml(String(decision.value))})</strong><span>${vi ? "Giá trị hiện thuộc mảng của tầng đang xử lý." : "The value now belongs to the level being processed."}</span></section>`;
  } else if (decision.kind === "enqueue-children") {
    const values = Array.isArray(decision.values) ? decision.values : [];
    decisionHtml = `<section class="n429-decision children"><small>EXTEND CHILDREN</small><strong>queue.extend([${values.map((value) => escapeHtml(String(value))).join(", ")}])</strong><span>${values.length ? (vi ? "Các node cyan sẽ được xử lý ở tầng sau." : "The cyan nodes will be processed at the next level.") : (vi ? "Node này không có con, queue không đổi." : "This node has no children, so the queue is unchanged.")}</span></section>`;
  } else if (decision.kind === "level-done") {
    const values = Array.isArray(decision.level) ? decision.level : [];
    decisionHtml = `<section class="n429-decision done"><small>RESULT APPEND</small><strong>result.append([${values.map((value) => escapeHtml(String(value))).join(", ")}])</strong><span>${vi ? "Tầng hiện tại đã được chốt vào output." : "The current level is now committed to the output."}</span></section>`;
  } else {
    decisionHtml = `<section class="n429-decision done"><small>COMPLETE</small><strong>return result</strong><span>${vi ? "Queue đã rỗng, nên BFS kết thúc." : "The queue is empty, so BFS is complete."}</span></section>`;
  }

  const levelsByDepth = new Map();
  nodes.forEach((node) => {
    const depth = Number(node.depth) || 0;
    if (!levelsByDepth.has(depth)) levelsByDepth.set(depth, []);
    levelsByDepth.get(depth).push(node);
  });
  const depths = [...levelsByDepth.keys()].sort((a, b) => a - b);
  const maxLevelWidth = Math.max(1, ...[...levelsByDepth.values()].map((level) => level.length));
  const svgWidth = Math.max(400, maxLevelWidth * 94 + 76);
  const svgHeight = Math.max(150, Math.max(1, depths.length) * 116 + 32);
  const positions = new Map();
  depths.forEach((depth) => {
    const level = levelsByDepth.get(depth) || [];
    level.forEach((node, index) => positions.set(node.id, { x: ((index + 1) * svgWidth) / (level.length + 1), y: 52 + depth * 116 }));
  });
  const edges = nodes.filter((node) => node.parentId !== null && node.parentId !== undefined).map((node) => {
    const from = positions.get(node.parentId);
    const to = positions.get(node.id);
    return from && to ? `<line x1="${from.x}" y1="${from.y + 25}" x2="${to.x}" y2="${to.y - 25}"></line>` : "";
  }).join("");
  const treeNodes = nodes.map((node) => {
    const pos = positions.get(node.id);
    if (!pos) return "";
    const classes = ["n429-node"];
    if (visitedIds.has(node.id)) classes.push("visited");
    if (queueIds.includes(node.id)) classes.push("queued");
    if (childIds.has(node.id)) classes.push("child");
    if (node.id === currentId) classes.push("current");
    return `<g class="${classes.join(" ")}" transform="translate(${pos.x} ${pos.y})"><circle r="25"></circle><text class="value" text-anchor="middle" y="5">${escapeHtml(String(node.value))}</text><text class="coord" text-anchor="middle" y="43">d=${node.depth}</text></g>`;
  }).join("");
  const treeHtml = nodes.length
    ? `<div class="n429-tree-scroll"><svg class="n429-tree-svg" viewBox="0 0 ${svgWidth} ${svgHeight}" role="img" aria-label="${escapeHtml(vi ? "Cây N-ary và trạng thái BFS" : "N-ary tree and BFS state")}"><g class="n429-edges">${edges}</g><g class="n429-nodes">${treeNodes}</g></svg></div>`
    : `<div class="n429-empty-tree">${vi ? "Cây rỗng" : "Empty tree"}</div>`;
  const queueHtml = queueIds.length ? queueIds.map((id, index) => {
    const node = nodeById.get(id);
    return `<span class="${index === 0 ? "front" : ""}"><small>${index === 0 ? "FRONT" : `#${index}`}</small><strong>${escapeHtml(String(node ? node.value : "?"))}</strong></span>`;
  }).join("") : `<em>${vi ? "queue rỗng" : "queue empty"}</em>`;
  const outputHtml = result.length ? result.map((level, index) => `<span><small>L${index}</small><strong>[${level.map((value) => escapeHtml(String(value))).join(", ")}]</strong></span>`).join("") : `<em>[ ]</em>`;
  const currentLevelHtml = currentLevel.length ? `[${currentLevel.map((value) => escapeHtml(String(value))).join(", ")}]` : "[ ]";
  const actionLine = Array.isArray(step.codeLines) ? step.codeLines[0] : null;
  const summary = vi
    ? `N-ary Tree Level Order Traversal: queue có ${queueIds.length} node, output có ${result.length} tầng hoàn tất.`
    : `N-ary Tree Level Order Traversal: queue has ${queueIds.length} nodes and output has ${result.length} completed levels.`;

  $("treeView").innerHTML = `<section class="n429-viz" role="img" aria-label="${escapeHtml(summary)}">
    <div class="n429-stages">${stages}</div>
    <section class="n429-action"><small>${vi ? "DÒNG" : "LINE"} ${actionLine ?? "-"}</small><strong>${escapeHtml(pick(step.title))}</strong><span>${escapeHtml(pick(step.note))}</span></section>
    ${decisionHtml}
    <section class="n429-tree"><header><strong>${vi ? "CÂY N-ARY" : "N-ARY TREE"}</strong><span>${nodes.length} ${vi ? "node" : "nodes"}</span></header>${treeHtml}</section>
    <div class="n429-state-grid">
      <section class="n429-queue"><header><strong>QUEUE</strong><span>${vi ? "trái là FRONT" : "left is FRONT"}</span></header><div>${queueHtml}</div></section>
      <section class="n429-level"><header><strong>${vi ? `LEVEL ĐANG GOM${levelIndex === null ? "" : ` · ${levelIndex}`}` : `CURRENT LEVEL${levelIndex === null ? "" : ` · ${levelIndex}`}`}</strong><span>level</span></header><strong>${currentLevelHtml}</strong></section>
      <section class="n429-output"><header><strong>RESULT</strong><span>${result.length} ${vi ? "tầng" : "levels"}</span></header><div>${outputHtml}</div></section>
    </div>
    <aside class="n429-legend"><strong>${vi ? "ĐỌC MÀU" : "READ COLORS"}</strong><span class="current"><i></i>${vi ? "node đang xử lý" : "node being processed"}</span><span class="queued"><i></i>${vi ? "đang chờ trong queue" : "waiting in queue"}</span><span class="child"><i></i>${vi ? "con vừa được thêm" : "child just enqueued"}</span><span class="visited"><i></i>${vi ? "đã vào level" : "already added to level"}</span></aside>
  </section>`;
}

function renderRotation1886View(step) {
  const view = step.rotation1886View || {};
  const vi = lang === "vi";
  const current = Array.isArray(view.current) ? view.current : [];
  const target = Array.isArray(view.target) ? view.target : [];
  const size = Number(view.size) || current.length;
  const directMode = Number(view.approach) === 2 || view.comparisonMode === "mapped";
  const angle = Number.isInteger(view.angle) ? view.angle : null;
  const phase = String(view.phase || "compare");
  const decision = view.decision || {};
  const matchingCells = new Set((view.matches || []).map(([row, col]) => `${row},${col}`));
  const sourceMatches = new Set((view.sourceMatches || view.matches || []).map(([row, col]) => `${row},${col}`));
  const targetMatches = new Set((view.targetMatches || view.matches || []).map(([row, col]) => `${row},${col}`));
  const sourceMismatches = new Set((view.sourceMismatches || view.mismatches || []).map(([row, col]) => `${row},${col}`));
  const targetMismatches = new Set((view.targetMismatches || view.mismatches || []).map(([row, col]) => `${row},${col}`));
  const activeSource = Array.isArray(view.activeSource) ? view.activeSource : null;
  const activeTarget = Array.isArray(view.activeTarget) ? view.activeTarget : null;
  const tested = new Map((view.tested || []).map((item) => [Number(item.angle), Boolean(item.same)]));
  const phaseIndex = directMode
    ? (phase === "found" || phase === "missing" ? 3 : phase === "direct-result" ? 2 : ["direct-compare", "direct-fail", "direct-break"].includes(phase) ? 1 : 0)
    : (phase === "found" || phase === "missing" ? 3 : phase === "rotate" ? 1 : 0);
  const stages = (directMode ? [
    { label: vi ? "Ánh xạ tọa độ" : "Map coordinates", detail: "mat[i][j] -> target[...]" },
    { label: vi ? "So sánh cặp ô" : "Compare cell pair", detail: "== / !=" },
    { label: vi ? "Kiểm tra flag" : "Check flag", detail: "True / False" },
  ] : [
    { label: vi ? "So sánh từng ô" : "Compare every cell", detail: "candidate vs target" },
    { label: vi ? "Xoay 90°" : "Rotate 90°", detail: "clockwise" },
    { label: vi ? "Kết luận" : "Conclude", detail: "True / False" },
  ]).map((item, index) => {
    const state = phaseIndex === 3 || index < phaseIndex ? "done" : index === phaseIndex ? "active" : "pending";
    return `<span class="${state}"><small>${state === "done" ? "OK" : index + 1}</small><strong>${escapeHtml(item.label)}</strong><em>${escapeHtml(item.detail)}</em></span>`;
  }).join("");
  const angleTrack = (directMode ? [90, 180, 270, 0] : [0, 90, 180, 270]).map((candidateAngle) => {
    const result = tested.get(candidateAngle);
    const classes = ["rot1886-angle"];
    if (result === true) classes.push("match");
    else if (result === false) classes.push("miss");
    else classes.push("waiting");
    if (candidateAngle === angle) classes.push("active");
    const status = result === true
      ? (vi ? "TRÙNG" : "MATCH")
      : result === false
        ? (vi ? "KHÁC" : "DIFFERENT")
        : (vi ? "CHƯA THỬ" : "NOT TRIED");
    return `<span class="${classes.join(" ")}"><strong>${candidateAngle}°</strong><em>${status}</em></span>`;
  }).join("");

  let decisionHtml;
  if (directMode) {
    if (decision.kind === "direct-size") {
      decisionHtml = `<section class="rot1886-decision loop"><small>${vi ? "KÍCH THƯỚC" : "SIZE"}</small><strong>n = len(mat) = ${decision.size}</strong><span>${vi ? "Cách 2 giữ mat cố định và dùng n để tính tọa độ tương ứng trên target." : "Approach 2 keeps mat fixed and uses n to calculate corresponding target coordinates."}</span></section>`;
    } else if (decision.kind === "direct-reset") {
      decisionHtml = `<section class="rot1886-decision rotate"><small>${vi ? `ÁNH XẠ ${decision.angle}°` : `${decision.angle}° MAPPING`}</small><strong>mat[i][j] &harr; ${escapeHtml(decision.formula)}</strong><span>${vi ? "flag được đặt lại True trước khi kiểm tra toàn bộ cặp tọa độ." : "flag is reset to True before checking every coordinate pair."}</span></section>`;
    } else if (decision.kind === "direct-outer" || decision.kind === "direct-inner") {
      const sourceText = decision.kind === "direct-inner" ? `mat[${decision.row}][${decision.col}]` : "mat[i][j]";
      const targetText = decision.kind === "direct-inner" ? `target[${decision.targetRow}][${decision.targetCol}]` : "target[...]";
      decisionHtml = `<section class="rot1886-decision loop"><small>${vi ? "CHỌN CẶP Ô" : "CHOOSE CELL PAIR"}</small><strong>${escapeHtml(sourceText)} &harr; ${escapeHtml(targetText)}</strong><span>${vi ? "Hai ô viền xanh là cặp sẽ được so sánh ở dòng điều kiện kế tiếp." : "The two blue-outlined cells are the pair checked by the next condition line."}</span></section>`;
    } else if (decision.kind === "direct-compare") {
      decisionHtml = `<section class="rot1886-decision ${decision.same ? "found" : "compare"}"><small>${vi ? "ĐIỀU KIỆN" : "CONDITION"}</small><strong>${escapeHtml(String(decision.sourceValue))} ${decision.same ? "==" : "!="} ${escapeHtml(String(decision.targetValue))}</strong><span>${vi ? `mat[${decision.row}][${decision.col}] so với target[${decision.targetRow}][${decision.targetCol}] cho ánh xạ ${decision.angle}°.` : `mat[${decision.row}][${decision.col}] compared with target[${decision.targetRow}][${decision.targetCol}] for the ${decision.angle}° mapping.`}</span></section>`;
    } else if (decision.kind === "direct-fail") {
      decisionHtml = `<section class="rot1886-decision compare"><small>FLAG</small><strong>flag = False</strong><span>${vi ? "Cặp ô đang viền xanh khác nhau, nên ánh xạ hiện tại đã thất bại." : "The blue-outlined cells differ, so this mapping has failed."}</span></section>`;
    } else if (decision.kind === "direct-break") {
      decisionHtml = `<section class="rot1886-decision loop"><small>BREAK</small><strong>${vi ? "Thoát vòng j hiện tại" : "Exit the current j loop"}</strong><span>${vi ? "Theo code gốc, vòng i vẫn tiếp tục với hàng tiếp theo." : "Per the original code, the i loop still continues with the next row."}</span></section>`;
    } else if (decision.kind === "direct-result") {
      decisionHtml = `<section class="rot1886-decision ${decision.flag ? "found" : "compare"}"><small>IF FLAG</small><strong>flag == ${decision.flag ? "True" : "False"}</strong><span>${vi ? (decision.flag ? "Tất cả cặp đã kiểm tra đều bằng nhau, nên chuẩn bị trả về True." : "Có ít nhất một cặp khác nhau, nên chuyển sang ánh xạ kế tiếp.") : (decision.flag ? "Every checked pair is equal, so prepare to return True." : "At least one pair differs, so move to the next mapping.")}</span></section>`;
    } else if (decision.kind === "direct-found") {
      decisionHtml = `<section class="rot1886-decision found"><small>${vi ? "ĐÃ TÌM THẤY" : "MATCH FOUND"}</small><strong>${decision.matchingCount}/${decision.total} ${vi ? "cặp ô đều bằng nhau" : "cell pairs are equal"}</strong><span>${vi ? `Ánh xạ ${decision.angle}° giữ flag = True, nên trả về True.` : `The ${decision.angle}° mapping keeps flag = True, so return True.`}</span></section>`;
    } else {
      decisionHtml = `<section class="rot1886-decision missing"><small>${vi ? "KHÔNG CÓ ÁNH XẠ" : "NO MATCHING MAP"}</small><strong>${vi ? "Bốn lần kiểm tra đều làm flag = False" : "All four checks make flag = False"}</strong><span>${vi ? "Không cần tạo matrix xoay để kết luận False." : "No rotated matrix is needed to conclude False."}</span></section>`;
    }
  } else if (decision.kind === "rotate") {
    decisionHtml = `<section class="rot1886-decision rotate"><small>${vi ? "QUY TẮC XOAY" : "ROTATION RULE"}</small><strong>current[r][c] &rarr; next[c][n - 1 - r]</strong><span>${vi ? `Xoay ${decision.fromAngle}° theo chiều kim đồng hồ để tạo ứng viên ${decision.toAngle}°.` : `Rotate ${decision.fromAngle}° clockwise to create the ${decision.toAngle}° candidate.`}</span></section>`;
  } else if (decision.kind === "loop") {
    decisionHtml = `<section class="rot1886-decision loop"><small>${vi ? "VÒNG LẶP" : "LOOP"}</small><strong>for _ in range(4):</strong><span>${vi ? `Bắt đầu lượt thử ứng viên ở góc ${decision.angle}°. Chưa thực hiện phép so sánh ở dòng kế tiếp.` : `Start the ${decision.angle}° candidate attempt. The comparison happens on the next line.`}</span></section>`;
  } else if (decision.kind === "found") {
    decisionHtml = `<section class="rot1886-decision found"><small>${vi ? "ĐÃ TÌM THẤY" : "MATCH FOUND"}</small><strong>${decision.matchingCount}/${decision.total} ${vi ? "ô đều bằng target" : "cells equal target"}</strong><span>${vi ? `Ứng viên ở góc ${angle}° trùng hoàn toàn với target, nên trả về True.` : `The ${angle}° candidate completely equals target, so return True.`}</span></section>`;
  } else if (decision.kind === "missing") {
    decisionHtml = `<section class="rot1886-decision missing"><small>${vi ? "KHÔNG CÓ GÓC PHÙ HỢP" : "NO MATCHING ANGLE"}</small><strong>${vi ? "Đã thử cả bốn hướng xoay" : "All four rotations were tried"}</strong><span>${vi ? `Ứng viên cuối vẫn còn ${decision.total - decision.matchingCount} ô khác target, nên trả về False.` : `The last candidate still has ${decision.total - decision.matchingCount} cells different from target, so return False.`}</span></section>`;
  } else {
    decisionHtml = `<section class="rot1886-decision compare"><small>${vi ? "SO SÁNH CÙNG TỌA ĐỘ" : "COMPARE SAME COORDINATES"}</small><strong>${decision.matchingCount}/${decision.total} ${vi ? "ô đang trùng" : "cells currently match"}</strong><span>${vi ? "Ô xanh có giá trị bằng nhau; ô đỏ cho thấy vị trí vẫn khác target." : "Green cells have equal values; red cells show positions that still differ from target."}</span></section>`;
  }

  const sameCell = (cell, row, col) => Array.isArray(cell) && cell[0] === row && cell[1] === col;
  const renderBoard = (grid, kind, label, detail, matchSet, mismatchSet, activeCell) => {
    const rows = Array.from({ length: size }, (_, row) => Array.from({ length: size }, (_, col) => {
      const key = `${row},${col}`;
      const comparisonReady = decision.kind !== "loop";
      const matches = matchSet.has(key);
      const differs = directMode ? mismatchSet.has(key) : !matches;
      const active = sameCell(activeCell, row, col);
      const classes = ["rot1886-cell", kind];
      if (directMode) classes.push(matches ? "same" : differs ? "different" : "pending");
      else classes.push(comparisonReady ? (matches ? "same" : "different") : "pending");
      if (active) classes.push("active");
      const value = grid[row]?.[col] ?? "";
      const tag = active
        ? (vi ? "ĐANG XÉT" : "CHECKING")
        : matches
          ? (vi ? "BẰNG" : "EQUAL")
          : differs
            ? (vi ? "KHÁC" : "DIFFERS")
            : (vi ? "CHƯA SO SÁNH" : "NOT COMPARED");
      return `<div class="${classes.join(" ")}"><small>[${row},${col}]</small><strong>${escapeHtml(String(value))}</strong><em>${escapeHtml(tag)}</em></div>`;
    }).join(""));
    return `<section class="rot1886-board ${kind}"><header><strong>${escapeHtml(label)}</strong><span>${escapeHtml(detail)}</span></header><div class="rot1886-board-scroll"><div class="rot1886-grid" style="--rot1886-cols:${size}"><span class="rot1886-corner">r\\c</span>${Array.from({ length: size }, (_, col) => `<span class="rot1886-col">c=${col}</span>`).join("")}${Array.from({ length: size }, (_, row) => `<span class="rot1886-row">r=${row}</span>${rows[row] || ""}`).join("")}</div></div></section>`;
  };

  const actionLine = Array.isArray(step.codeLines) ? step.codeLines[0] : null;
  const summary = directMode
    ? (vi ? `Cách 2: đối chiếu mat với target qua ánh xạ ${angle === null ? "chưa chọn" : `${angle} độ`}.` : `Approach 2: compare mat and target through the ${angle === null ? "unselected" : `${angle}-degree`} mapping.`)
    : (vi ? `Determine Whether Matrix Can Be Obtained By Rotation: đang xét ứng viên ${angle ?? 0} độ.` : `Determine Whether Matrix Can Be Obtained By Rotation: viewing the ${angle ?? 0}-degree candidate.`);
  const sourceLabel = directMode ? (vi ? "MAT (GIỮ CỐ ĐỊNH)" : "MAT (FIXED SOURCE)") : (vi ? `ỨNG VIÊN ${angle ?? 0}°` : `${angle ?? 0}° CANDIDATE`);
  const sourceDetail = directMode ? "mat[i][j]" : (vi ? "mat sau xoay" : "rotated mat");
  const targetDetail = directMode
    ? (angle === null ? (vi ? "chọn ánh xạ" : "choose a mapping") : (vi ? `tọa độ ${angle}° trên target` : `${angle}° target coordinates`))
    : (vi ? "ma trận cần đạt" : "desired matrix");
  const centerSymbol = directMode ? "&rarr;" : phase === "found" ? "=" : "?";
  const centerText = directMode ? (vi ? "ánh xạ tới" : "maps to") : (vi ? "so với" : "vs");
  const headerTitle = directMode ? (vi ? "BỐN ÁNH XẠ TRỰC TIẾP" : "FOUR DIRECT MAPPINGS") : (vi ? "BỐN ỨNG VIÊN XOAY" : "FOUR ROTATION CANDIDATES");
  const headerDetail = directMode ? (vi ? "mat không đổi, chỉ đổi tọa độ target" : "mat stays fixed; only target coordinates change") : (vi ? "mỗi thẻ là một lần so sánh với target" : "each card is compared with target");
  const legendSame = directMode ? (vi ? "cặp ánh xạ cùng giá trị" : "mapped pair with equal values") : (vi ? "cùng tọa độ, cùng giá trị" : "same coordinate and value");
  const legendDifferent = directMode ? (vi ? "cặp ánh xạ khác giá trị" : "mapped pair with different values") : (vi ? "cùng tọa độ, khác giá trị" : "same coordinate, different value");
  const legendActive = directMode ? (vi ? "cặp tọa độ đang xét" : "coordinate pair being checked") : (vi ? "ứng viên đang xét" : "current candidate");

  $("treeView").innerHTML = `<section class="rot1886-viz" role="img" aria-label="${escapeHtml(summary)}">
    <div class="rot1886-stages">${stages}</div>
    <section class="rot1886-action"><small>${vi ? "DÒNG" : "LINE"} ${actionLine ?? "-"}</small><strong>${escapeHtml(pick(step.title))}</strong><span>${escapeHtml(pick(step.note))}</span></section>
    <section class="rot1886-angles"><header><strong>${headerTitle}</strong><span>${headerDetail}</span></header><div>${angleTrack}</div></section>
    ${decisionHtml}
    <div class="rot1886-layout">
      ${renderBoard(current, "candidate", sourceLabel, sourceDetail, directMode ? sourceMatches : matchingCells, directMode ? sourceMismatches : new Set(), directMode ? activeSource : null)}
      <div class="rot1886-compare-symbol ${directMode ? "mapped" : ""}" aria-hidden="true"><b>${centerSymbol}</b><span>${centerText}</span></div>
      ${renderBoard(target, "target", "TARGET", targetDetail, directMode ? targetMatches : matchingCells, directMode ? targetMismatches : new Set(), directMode ? activeTarget : null)}
    </div>
    <aside class="rot1886-legend"><strong>${vi ? "ĐỌC MÀU" : "READ COLORS"}</strong><span class="same"><i></i>${legendSame}</span><span class="different"><i></i>${legendDifferent}</span><span class="candidate"><i></i>${legendActive}</span></aside>
  </section>`;
}

function renderConvert2022View(step) {
  const view = step.convert2022View || {};
  const vi = lang === "vi";
  const nums = Array.isArray(view.nums) ? view.nums : [];
  const matrix = Array.isArray(view.matrix) ? view.matrix : [];
  const rows = Number(view.rows) || 0;
  const cols = Number(view.cols) || 0;
  const needed = Number(view.needed) || rows * cols;
  const phase = String(view.phase || "validate");
  const activeIndex = Number.isInteger(view.activeIndex) ? view.activeIndex : null;
  const activeCell = Array.isArray(view.activeCell) ? view.activeCell : null;
  const placedCount = Math.max(0, Number(view.placedCount) || 0);
  const decision = view.decision || {};
  const sameCell = (row, col) => activeCell && activeCell[0] === row && activeCell[1] === col;
  const phaseIndex = phase === "done" ? 3 : phase === "place" ? 2 : phase === "init" || phase === "map" ? 1 : 0;
  const stages = [
    { label: vi ? "Kiểm tra số ô" : "Check cell count", detail: "len(original) = m*n" },
    { label: vi ? "Đổi index" : "Map index", detail: "i -> (i // n, i % n)" },
    { label: vi ? "Ghi vào matrix" : "Write to matrix", detail: "result[row][col]" },
  ].map((item, index) => {
    const state = phaseIndex === 3 || index < phaseIndex ? "done" : index === phaseIndex ? "active" : "pending";
    return `<span class="${state}"><small>${state === "done" ? "OK" : index + 1}</small><strong>${escapeHtml(item.label)}</strong><em>${escapeHtml(item.detail)}</em></span>`;
  }).join("");

  let decisionHtml;
  if (decision.kind === "mismatch") {
    decisionHtml = `<section class="c2022-decision mismatch"><small>${vi ? "KHÔNG THỂ TẠO" : "CANNOT CREATE"}</small><strong>len(original) = ${decision.length}, nhưng m*n = ${decision.needed}</strong><span>${vi ? "Số phần tử không khớp số ô cần có, nên thuật toán trả về []." : "The value count does not match the required cells, so the algorithm returns []."}</span></section>`;
  } else if (decision.kind === "valid") {
    decisionHtml = `<section class="c2022-decision valid"><small>${vi ? "KÍCH THƯỚC HỢP LỆ" : "VALID SIZE"}</small><strong>len(original) = ${decision.length} = m*n = ${decision.needed}</strong><span>${vi ? "Mỗi giá trị sẽ có đúng một ô đích trong result." : "Each value will have exactly one destination cell in result."}</span></section>`;
  } else if (decision.kind === "init") {
    decisionHtml = `<section class="c2022-decision init"><small>${vi ? "MA TRẬN RỖNG" : "EMPTY MATRIX"}</small><strong>result = m hàng × n cột</strong><span>${vi ? "Hàng được điền từ trái sang phải trước, sau đó mới sang hàng kế tiếp." : "Rows fill left to right before moving to the next row."}</span></section>`;
  } else if (decision.kind === "map") {
    decisionHtml = `<section class="c2022-decision map"><small>${vi ? "ÁNH XẠ INDEX" : "INDEX MAPPING"}</small><strong>i = ${decision.index}: row = ${decision.index} // ${cols} = ${decision.row}, col = ${decision.index} % ${cols} = ${decision.col}</strong><span>original[${decision.index}] = ${escapeHtml(String(decision.value))} ${vi ? `sẽ đi tới ô (${decision.row}, ${decision.col}).` : `will go to cell (${decision.row}, ${decision.col}).`}</span></section>`;
  } else if (decision.kind === "place") {
    decisionHtml = `<section class="c2022-decision place"><small>${vi ? "VỪA GHI" : "JUST WRITTEN"}</small><strong>result[${decision.row}][${decision.col}] = original[${decision.index}] = ${escapeHtml(String(decision.value))}</strong><span>${vi ? "Ô đích đã được điền; tiếp tục với index kế tiếp." : "The destination cell is filled; continue with the next index."}</span></section>`;
  } else {
    decisionHtml = `<section class="c2022-decision done"><small>${vi ? "HOÀN TẤT" : "COMPLETE"}</small><strong>${placedCount}/${needed} ${vi ? "ô đã được điền" : "cells filled"}</strong><span>${vi ? "Tất cả phần tử của original đã nằm trong result theo thứ tự hàng." : "Every original value now appears in result in row-major order."}</span></section>`;
  }

  const sourceTrack = nums.map((value, index) => {
    const classes = ["c2022-source-cell"];
    if (index < placedCount) classes.push("placed");
    if (index === activeIndex) classes.push("active");
    const tag = index === activeIndex
      ? (phase === "map" ? (vi ? "ĐANG ĐỔI VỊ TRÍ" : "MAPPING") : (vi ? "VỪA ĐẶT" : "JUST PLACED"))
      : index < placedCount
        ? (vi ? "ĐÃ DÙNG" : "USED")
        : `i = ${index}`;
    return `<div class="${classes.join(" ")}"><small>i = ${index}</small><strong>${escapeHtml(String(value))}</strong><em>${escapeHtml(tag)}</em></div>`;
  }).join("");

  const matrixRows = rows > 0 && cols > 0 ? Array.from({ length: rows }, (_, row) => Array.from({ length: cols }, (_, col) => {
    const index = row * cols + col;
    const written = index < placedCount;
    const active = sameCell(row, col);
    const classes = ["c2022-cell"];
    if (written) classes.push("written");
    if (active) classes.push("active");
    const value = matrix[row]?.[col] ?? "·";
    const tag = active
      ? (phase === "map" ? (vi ? "Ô ĐÍCH" : "DESTINATION") : (vi ? "VỪA GHI" : "JUST WRITTEN"))
      : written
        ? (vi ? "ĐÃ ĐIỀN" : "FILLED")
        : (vi ? "TRỐNG" : "EMPTY");
    return `<div class="${classes.join(" ")}"><small>[${row},${col}]</small><strong>${escapeHtml(String(value))}</strong><em>${escapeHtml(tag)}</em></div>`;
  }).join("")) : [];
  const board = phase === "mismatch"
    ? `<section class="c2022-empty-result"><strong>result = []</strong><span>${vi ? "Không có ma trận 2D nào được tạo." : "No 2D matrix is created."}</span></section>`
    : `<section class="c2022-board"><header><strong>RESULT MATRIX</strong><span>${rows} × ${cols}</span></header><div class="c2022-board-scroll"><div class="c2022-grid" style="--c2022-cols:${cols}"><span class="c2022-corner">r\\c</span>${Array.from({ length: cols }, (_, col) => `<span class="c2022-col">c=${col}</span>`).join("")}${Array.from({ length: rows }, (_, row) => `<span class="c2022-row">r=${row}</span>${matrixRows[row] || ""}`).join("")}</div></div></section>`;
  const activeLine = Array.isArray(step.codeLines) ? step.codeLines[0] : null;
  const summary = phase === "mismatch"
    ? (vi ? `Convert 1D Array Into 2D Array: ${nums.length} phần tử không khớp với ${needed} ô.` : `Convert 1D Array Into 2D Array: ${nums.length} values do not match ${needed} cells.`)
    : (vi ? `Convert 1D Array Into 2D Array: đã điền ${placedCount} trong ${needed} ô.` : `Convert 1D Array Into 2D Array: ${placedCount} of ${needed} cells are filled.`);

  $("treeView").innerHTML = `<section class="c2022-viz" role="img" aria-label="${escapeHtml(summary)}">
    <div class="c2022-stages">${stages}</div>
    <section class="c2022-action"><small>${vi ? "DÒNG" : "LINE"} ${activeLine ?? "-"}</small><strong>${escapeHtml(pick(step.title))}</strong><span>${escapeHtml(pick(step.note))}</span></section>
    <section class="c2022-size"><span><small>len(original)</small><strong>${nums.length}</strong></span><b>${phase === "mismatch" ? "!=" : "="}</b><span><small>m × n</small><strong>${rows} × ${cols} = ${needed}</strong></span><em>${phase === "mismatch" ? (vi ? "trả về []" : "return []") : (vi ? "có thể tạo matrix" : "matrix can be created")}</em></section>
    ${decisionHtml}
    <div class="c2022-layout">
      <section class="c2022-source"><header><strong>ORIGINAL 1D</strong><span>${nums.length} ${vi ? "phần tử" : "values"}</span></header><div style="--c2022-values:${Math.max(nums.length, 1)}">${sourceTrack}</div></section>
      <div class="c2022-arrow" aria-hidden="true"><span>i</span><b>&rarr;</b><small>row, col</small></div>
      ${board}
    </div>
    <aside class="c2022-legend"><strong>${vi ? "ĐỌC MÀU" : "READ COLORS"}</strong><span class="active"><i></i>${vi ? "giá trị và ô đang xét" : "current value and cell"}</span><span class="placed"><i></i>${vi ? "đã đặt vào result" : "already placed"}</span><span class="empty"><i></i>${vi ? "ô result chưa điền" : "empty result cell"}</span></aside>
  </section>`;
}

function renderSearchMatrix74View(step) {
  const view = step.search74View || {};
  const vi = lang === "vi";
  const matrix = Array.isArray(view.matrix) ? view.matrix : [];
  const rows = Number(view.rows) || matrix.length;
  const cols = Number(view.cols) || (matrix[0] ? matrix[0].length : 0);
  const total = rows * cols;
  const lo = Number.isInteger(view.lo) ? view.lo : 0;
  const hi = Number.isInteger(view.hi) ? view.hi : total - 1;
  const mid = Number.isInteger(view.mid) ? view.mid : null;
  const target = view.target;
  const phase = String(view.phase || "init");
  const decision = view.decision || {};
  const inspected = new Set((view.inspected || []).map((item) => Number(item.index)));
  const phaseIndex = phase === "found" || phase === "missing" ? 4 : phase === "move-left" || phase === "move-right" ? 3 : phase === "probe" ? 2 : 0;
  const stages = [
    { label: vi ? "Trải phẳng" : "Flatten", detail: "0..m*n-1" },
    { label: vi ? "Giữ khoảng" : "Keep range", detail: "lo .. hi" },
    { label: vi ? "Chọn giữa" : "Pick middle", detail: "mid" },
    { label: vi ? "Bỏ một nửa" : "Discard half", detail: "< / > target" },
  ].map((item, index) => {
    const state = phaseIndex === 4 || index < phaseIndex ? "done" : index === phaseIndex ? "active" : "pending";
    return `<span class="${state}"><small>${state === "done" ? "✓" : index + 1}</small><strong>${escapeHtml(item.label)}</strong><em>${escapeHtml(item.detail)}</em></span>`;
  }).join("");
  const inRange = (index) => index >= lo && index <= hi;
  const positionCards = [
    { key: "lo", label: "LO", value: lo, detail: vi ? "đầu khoảng" : "range start" },
    { key: "mid", label: "MID", value: mid, detail: vi ? "điểm thử" : "probe" },
    { key: "hi", label: "HI", value: hi, detail: vi ? "cuối khoảng" : "range end" },
  ].map((item) => `<span class="${item.key}"><small>${item.label}</small><strong>${item.value ?? "-"}</strong><em>${escapeHtml(item.detail)}</em></span>`).join("");

  let decisionHtml;
  if (decision.kind === "init") {
    decisionHtml = `<section class="s74-decision init"><small>${vi ? "ÁNH XẠ INDEX" : "INDEX MAPPING"}</small><strong>index → (index // cols, index % cols)</strong><span>${vi ? "Binary search dùng chỉ số phẳng, rồi đổi mid trở lại hàng và cột khi cần đọc giá trị." : "Binary search uses a flat index, then maps mid back to a row and column to read a value."}</span></section>`;
  } else if (decision.kind === "probe") {
    decisionHtml = `<section class="s74-decision probe"><small>${vi ? "ĐANG SO SÁNH" : "COMPARING"}</small><strong>mid ${mid} → (${decision.row},${decision.col}) → ${decision.value}</strong><span>${decision.value} ${decision.value === target ? "=" : decision.value < target ? "<" : ">"} target ${target}</span></section>`;
  } else if (decision.kind === "move-right") {
    decisionHtml = `<section class="s74-decision right"><small>${vi ? "GIỮ NỬA PHẢI" : "KEEP RIGHT HALF"}</small><strong>${decision.value} &lt; ${target} → lo: ${decision.oldLo} → ${decision.nextLo}</strong><span>${vi ? `Bỏ các index ${decision.oldLo}..${mid}; target chỉ có thể ở bên phải.` : `Discard indexes ${decision.oldLo}..${mid}; the target can only be to the right.`}</span></section>`;
  } else if (decision.kind === "move-left") {
    decisionHtml = `<section class="s74-decision left"><small>${vi ? "GIỮ NỬA TRÁI" : "KEEP LEFT HALF"}</small><strong>${decision.value} &gt; ${target} → hi: ${decision.oldHi} → ${decision.nextHi}</strong><span>${vi ? `Bỏ các index ${mid}..${decision.oldHi}; target chỉ có thể ở bên trái.` : `Discard indexes ${mid}..${decision.oldHi}; the target can only be to the left.`}</span></section>`;
  } else if (decision.kind === "found") {
    decisionHtml = `<section class="s74-decision found"><small>${vi ? "ĐÃ TÌM THẤY" : "FOUND"}</small><strong>${target} == ${decision.value} tại (${decision.row},${decision.col})</strong><span>${vi ? `Index phẳng ${mid} ánh xạ chính xác đến ô target.` : `Flat index ${mid} maps exactly to the target cell.`}</span></section>`;
  } else {
    decisionHtml = `<section class="s74-decision missing"><small>${vi ? "KHOẢNG RỖNG" : "EMPTY RANGE"}</small><strong>lo ${lo} &gt; hi ${hi}</strong><span>${vi ? "Không còn index nào để thử, nên target không tồn tại." : "There is no index left to try, so the target is absent."}</span></section>`;
  }

  const cellClass = (index, kind) => {
    const classes = [kind];
    if (!inRange(index)) classes.push("discarded");
    else classes.push("candidate");
    if (inspected.has(index)) classes.push("inspected");
    if (index === lo) classes.push("at-lo");
    if (index === hi) classes.push("at-hi");
    if (index === mid) classes.push("mid");
    if (decision.kind === "found" && index === mid) classes.push("found");
    return classes.join(" ");
  };
  const flatValues = matrix.flat();
  const flatTrack = flatValues.map((value, index) => {
    const row = Math.floor(index / cols), col = index % cols;
    const tag = index === mid ? `mid=${index}` : index === lo ? "lo" : index === hi ? "hi" : `i=${index}`;
    return `<span class="${cellClass(index, "s74-flat-cell")}"><small>${escapeHtml(tag)}</small><strong>${escapeHtml(String(value))}</strong><em>[${row},${col}]</em></span>`;
  }).join("");
  const matrixRows = matrix.map((row, rowIndex) => row.map((value, colIndex) => {
    const index = rowIndex * cols + colIndex;
    const tag = decision.kind === "found" && index === mid
      ? (vi ? "TÌM THẤY" : "FOUND")
      : index === mid
        ? `mid=${index}`
        : !inRange(index)
          ? (vi ? "BỎ" : "DISCARD")
          : index === lo
            ? "LO"
            : index === hi
              ? "HI"
              : (vi ? "GIỮ" : "KEEP");
    return `<div class="${cellClass(index, "s74-cell")}"><small>i=${index}</small><strong>${escapeHtml(String(value))}</strong><em>[${rowIndex},${colIndex}] · ${escapeHtml(tag)}</em></div>`;
  }));
  const activeLine = Array.isArray(step.codeLines) ? step.codeLines[0] : null;
  const summary = vi
    ? `Search a 2D Matrix: target ${target}, khoảng index hiện tại ${lo} đến ${hi}.`
    : `Search a 2D Matrix: target ${target}, current index range ${lo} through ${hi}.`;

  $("treeView").innerHTML = `<section class="s74-viz" role="img" aria-label="${escapeHtml(summary)}">
    <div class="s74-stages">${stages}</div>
    <section class="s74-action"><small>${vi ? "DÒNG" : "LINE"} ${activeLine ?? "-"}</small><strong>${escapeHtml(pick(step.title))}</strong><span>${escapeHtml(pick(step.note))}</span></section>
    <section class="s74-range"><header><strong>${vi ? "KHOẢNG TÌM KIẾM PHẲNG" : "FLAT SEARCH RANGE"}</strong><span>target = ${escapeHtml(String(target))}</span></header><div>${positionCards}</div></section>
    ${decisionHtml}
    <section class="s74-flat"><header><strong>${vi ? "MATRIX ĐƯỢC TRẢI PHẲNG" : "MATRIX AS ONE SORTED ARRAY"}</strong><span>${total} ${vi ? "index" : "indexes"}</span></header><div>${flatTrack}</div></section>
    <div class="s74-layout">
      <section class="s74-board"><header><strong>MATRIX</strong><span>${rows} × ${cols}</span></header><div class="s74-grid" style="--s74-cols:${cols}"><span class="s74-corner">r\\c</span>${Array.from({ length: cols }, (_, col) => `<span class="s74-col">c=${col}</span>`).join("")}${Array.from({ length: rows }, (_, row) => `<span class="s74-row">r=${row}</span>${(matrixRows[row] || []).join("")}`).join("")}</div></section>
      <aside class="s74-legend"><strong>${vi ? "ĐỌC MÀU" : "READ COLORS"}</strong><span class="range"><i></i>${vi ? "khoảng còn lại" : "remaining range"}</span><span class="mid"><i></i>${vi ? "mid đang thử" : "midpoint"}</span><span class="discard"><i></i>${vi ? "nửa đã bỏ" : "discarded half"}</span><span class="found"><i></i>${vi ? "target" : "target"}</span></aside>
    </div>
  </section>`;
}

function renderXMatrix2319View(step) {
  const view = step.xMatrix2319View || {};
  const vi = lang === "vi";
  const matrix = Array.isArray(view.matrix) ? view.matrix : [];
  const n = Number(view.n) || matrix.length;
  const phase = String(view.phase || "init");
  const decision = view.decision || {};
  const activeCell = Array.isArray(view.activeCell) ? view.activeCell : null;
  const checkedCells = Array.isArray(view.checkedCells) ? view.checkedCells : [];
  const checkedCount = Number(view.checkedCount) || 0;
  const key = (cell) => Array.isArray(cell) ? `${cell[0]},${cell[1]}` : "";
  const checkedOrder = new Map(checkedCells.map((cell, index) => [key(cell), index + 1]));
  const resultPhase = phase === "fail" || phase === "done";
  const phaseIndex = resultPhase ? 4 : phase === "check-x" || phase === "check-outside" ? 2 : phase === "classify" || phase === "cell-loop" || phase === "row-loop" ? 1 : 0;
  const diagonalCount = n % 2 === 0 ? n * 2 : n * 2 - 1;
  const outsideCount = n * n - diagonalCount;
  const activeLine = Array.isArray(step.codeLines) ? step.codeLines[0] : null;
  const stages = [
    { vi: "Đọc kích thước", en: "Read size", detail: "n" },
    { vi: "Phân loại ô", en: "Classify cell", detail: "r,c" },
    { vi: "Kiểm tra giá trị", en: "Check value", detail: "0 / nonzero" },
    { vi: "Trả kết quả", en: "Return result", detail: "True / False" },
  ].map((item, index) => {
    const state = phaseIndex === 4 || index < phaseIndex ? "done" : index === phaseIndex ? "active" : "pending";
    return `<span class="${state}"><small>${state === "done" ? "✓" : index + 1}</small><strong>${escapeHtml(vi ? item.vi : item.en)}</strong><em>${escapeHtml(item.detail)}</em></span>`;
  }).join("");

  let decisionHtml;
  if (decision.kind === "init") {
    decisionHtml = `<section class="xm2319-decision info"><small>${vi ? "ĐỊNH NGHĨA" : "DEFINITION"}</small><strong>on_x = (r == c) or (r + c == n - 1)</strong><span>${vi ? "Ô trên một trong hai đường chéo phải khác 0; mọi ô khác phải bằng 0." : "A cell on either diagonal must be nonzero; every other cell must equal zero."}</span></section>`;
  } else if (decision.kind === "row-loop" || decision.kind === "cell-loop") {
    decisionHtml = `<section class="xm2319-decision info"><small>${decision.kind === "row-loop" ? "FOR R" : "FOR C"}</small><strong>${decision.kind === "row-loop" ? `r = ${view.row}` : `(r, c) = (${view.row}, ${view.col})`}</strong><span>${decision.kind === "row-loop" ? (vi ? "Vòng ngoài chọn hàng tiếp theo." : "The outer loop selects the next row.") : (vi ? `Đọc giá trị ${view.value} trước khi phân loại ô.` : `Read value ${view.value} before classifying the cell.`)}</span></section>`;
  } else if (decision.kind === "classify") {
    decisionHtml = `<section class="xm2319-decision ${decision.onX ? "diagonal" : "outside"}"><small>ON_X</small><strong>(${view.row} == ${view.col}) or (${view.row} + ${view.col} == ${n - 1}) → ${decision.onX ? "TRUE" : "FALSE"}</strong><span>${decision.onX ? (vi ? "Ô này thuộc chữ X nên giá trị bắt buộc khác 0." : "This cell belongs to the X, so its value must be nonzero.") : (vi ? "Ô này nằm ngoài chữ X nên giá trị bắt buộc bằng 0." : "This cell lies outside the X, so its value must be zero.")}</span></section>`;
  } else if (decision.kind === "check-x") {
    decisionHtml = `<section class="xm2319-decision ${decision.invalid ? "invalid" : "valid"}"><small>ON_X AND VALUE == 0</small><strong>True and ${view.value} == 0 → ${decision.invalid ? "TRUE" : "FALSE"}</strong><span>${decision.invalid ? (vi ? "Vi phạm: ô trên đường chéo không được bằng 0." : "Violation: a diagonal cell cannot equal zero.") : (vi ? "Hợp lệ: ô trên đường chéo khác 0." : "Valid: the diagonal cell is nonzero.")}</span></section>`;
  } else if (decision.kind === "check-outside") {
    decisionHtml = `<section class="xm2319-decision ${decision.invalid ? "invalid" : "valid"}"><small>NOT ON_X AND VALUE != 0</small><strong>True and ${view.value} != 0 → ${decision.invalid ? "TRUE" : "FALSE"}</strong><span>${decision.invalid ? (vi ? "Vi phạm: ô ngoài đường chéo phải bằng 0." : "Violation: a cell outside the diagonals must equal zero.") : (vi ? "Hợp lệ: ô ngoài đường chéo bằng 0." : "Valid: the outside cell equals zero.")}</span></section>`;
  } else if (decision.kind === "fail") {
    const diagonalFailure = decision.reason === "x-zero";
    decisionHtml = `<section class="xm2319-decision invalid"><small>RETURN FALSE</small><strong>grid[${view.row}][${view.col}] = ${view.value} · expected ${escapeHtml(decision.expected)}</strong><span>${diagonalFailure ? (vi ? "Ô thuộc chữ X nhưng bằng 0." : "The cell belongs to the X but equals zero.") : (vi ? "Ô nằm ngoài chữ X nhưng khác 0." : "The cell lies outside the X but is nonzero.")}</span></section>`;
  } else if (decision.kind === "done") {
    decisionHtml = `<section class="xm2319-decision valid"><small>RETURN TRUE</small><strong>${checkedCount} / ${n * n} ${vi ? "ô hợp lệ" : "cells valid"}</strong><span>${vi ? "Hai đường chéo đều khác 0 và toàn bộ vùng ngoài đều bằng 0." : "Both diagonals are nonzero and the entire outside region equals zero."}</span></section>`;
  } else {
    decisionHtml = `<section class="xm2319-decision info"><small>LOOP</small><strong>${vi ? "Tiếp tục duyệt grid" : "Continue scanning the grid"}</strong><span>${checkedCount} / ${n * n}</span></section>`;
  }

  const cells = [];
  cells.push(`<span class="xm2319-corner">r\\c</span>`);
  for (let col = 0; col < n; col++) cells.push(`<span class="xm2319-axis">c=${col}</span>`);
  for (let row = 0; row < n; row++) {
    cells.push(`<span class="xm2319-axis xm2319-row">r=${row}</span>`);
    for (let col = 0; col < n; col++) {
      const onMain = row === col;
      const onAnti = row + col === n - 1;
      const onX = onMain || onAnti;
      const current = key(activeCell) === `${row},${col}`;
      const order = checkedOrder.get(`${row},${col}`);
      const invalid = current && phase === "fail";
      const valid = current && !invalid && (phase === "check-x" || phase === "check-outside");
      const classes = ["xm2319-cell", onX ? "on-x" : "outside"];
      if (onMain) classes.push("main-diagonal");
      if (onAnti) classes.push("anti-diagonal");
      if (order) classes.push("checked");
      if (current) classes.push("active");
      if (valid) classes.push("valid");
      if (invalid) classes.push("invalid");
      const label = invalid
        ? (vi ? "VI PHẠM" : "INVALID")
        : valid
          ? (vi ? "HỢP LỆ" : "VALID")
          : current
            ? (onX ? "ON X" : (vi ? "NGOÀI X" : "OUTSIDE"))
            : onX
              ? (onMain && onAnti ? (vi ? "TÂM X" : "X CENTER") : (vi ? "ĐƯỜNG CHÉO" : "DIAGONAL"))
              : (vi ? "PHẢI = 0" : "MUST = 0");
      cells.push(`<span class="${classes.join(" ")}"><small>[${row},${col}]</small><strong>${escapeHtml(String(matrix[row]?.[col]))}</strong><em>${escapeHtml(label)}</em>${order ? `<b>${order}</b>` : ""}</span>`);
    }
  }

  const pointer = activeCell ? `(${activeCell[0]}, ${activeCell[1]})` : "—";
  const zone = view.onX == null ? "—" : view.onX ? (vi ? "trên X" : "on X") : (vi ? "ngoài X" : "outside X");
  const summary = vi
    ? `Check X-Matrix: đã xác nhận ${checkedCount} trong ${n * n} ô.`
    : `Check X-Matrix: ${checkedCount} of ${n * n} cells confirmed.`;
  $("treeView").innerHTML = `<section class="xm2319-viz" role="img" aria-label="${escapeHtml(summary)}">
    <div class="xm2319-stages">${stages}</div>
    <section class="xm2319-action"><small>${vi ? "DÒNG" : "LINE"} ${activeLine ?? "-"}</small><strong>${escapeHtml(pick(step.title))}</strong><span>${escapeHtml(pick(step.note))}</span></section>
    <section class="xm2319-stats"><span><small>N × N</small><strong>${n} × ${n}</strong></span><span><small>${vi ? "Ô HIỆN TẠI" : "CURRENT CELL"}</small><strong>${escapeHtml(pointer)}</strong></span><span><small>${vi ? "VÙNG" : "ZONE"}</small><strong>${escapeHtml(zone)}</strong></span><span><small>${vi ? "ĐÃ XÁC NHẬN" : "CONFIRMED"}</small><strong>${checkedCount}/${n * n}</strong></span></section>
    ${decisionHtml}
    <div class="xm2319-layout">
      <section class="xm2319-board"><header><strong>X-MATRIX GRID</strong><span>${n} × ${n}</span></header><div class="xm2319-board-scroll"><div class="xm2319-grid" style="--xm2319-n:${n}">${cells.join("")}</div></div></section>
      <aside class="xm2319-rules"><strong>${vi ? "HAI ĐIỀU KIỆN" : "TWO CONDITIONS"}</strong><span class="diagonal ${view.onX === true ? "active" : ""}"><small>${diagonalCount} ${vi ? "ô chữ X" : "X cells"}</small><b>r == c <i>OR</i> r+c == n-1</b><em>grid[r][c] != 0</em></span><span class="outside ${view.onX === false ? "active" : ""}"><small>${outsideCount} ${vi ? "ô bên ngoài" : "outside cells"}</small><b>${vi ? "không thuộc hai đường chéo" : "not on either diagonal"}</b><em>grid[r][c] == 0</em></span></aside>
    </div>
    <aside class="xm2319-legend"><span class="diagonal"><i></i>${vi ? "ô trên chữ X" : "cell on X"}</span><span class="outside"><i></i>${vi ? "ô ngoài chữ X" : "outside cell"}</span><span class="active"><i></i>${vi ? "ô đang kiểm tra" : "current cell"}</span><span class="checked"><i></i>${vi ? "đã hợp lệ" : "confirmed valid"}</span><span class="invalid"><i></i>${vi ? "ô vi phạm" : "violating cell"}</span></aside>
  </section>`;
}

function renderSearchMatrix240View(step) {
  const view = step.search240View || {};
  const vi = lang === "vi";
  const matrix = Array.isArray(view.matrix) ? view.matrix : [];
  const rows = Number(view.rows) || matrix.length;
  const cols = Number(view.cols) || (matrix[0] ? matrix[0].length : 0);
  const target = view.target;
  const phase = String(view.phase || "guard");
  const decision = view.decision || {};
  const activeCell = Array.isArray(view.activeCell) ? view.activeCell : null;
  const previousCell = Array.isArray(view.previousCell) ? view.previousCell : null;
  const path = Array.isArray(view.path) ? view.path : [];
  const eliminatedRows = new Set((view.eliminatedRows || []).map(Number));
  const eliminatedCols = new Set((view.eliminatedCols || []).map(Number));
  const cellKey = (cell) => Array.isArray(cell) ? `${cell[0]},${cell[1]}` : "";
  const sameCell = (cell, row, col) => cellKey(cell) === `${row},${col}`;
  const pathOrder = new Map(path.map((cell, index) => [cellKey(cell), index + 1]));
  const isResult = phase === "found" || phase === "missing";
  const phaseIndex = isResult ? 4 : phase.startsWith("move") ? 3 : phase === "compare" ? 2 : phase === "read" || phase === "loop" ? 1 : 0;
  const activeLine = Array.isArray(step.codeLines) ? step.codeLines[0] : null;

  const stages = [
    { vi: "Góc trên-phải", en: "Top-right corner", detail: "row = 0" },
    { vi: "Đọc một ô", en: "Read one cell", detail: "matrix[row][col]" },
    { vi: "So với target", en: "Compare to target", detail: "= / > / <" },
    { vi: "Loại hàng/cột", en: "Drop row/column", detail: "↓ / ←" },
  ].map((item, index) => {
    const state = phaseIndex === 4 || index < phaseIndex ? "done" : index === phaseIndex ? "active" : "pending";
    return `<span class="${state}"><small>${state === "done" ? "✓" : index + 1}</small><strong>${escapeHtml(vi ? item.vi : item.en)}</strong><em>${escapeHtml(item.detail)}</em></span>`;
  }).join("");

  let decisionHtml;
  if (decision.kind === "guard") {
    decisionHtml = `<section class="s240-decision init"><small>${vi ? "ĐIỀU KIỆN ĐẦU VÀO" : "INPUT GUARD"}</small><strong>matrix and matrix[0] → TRUE</strong><span>${vi ? "Matrix không rỗng nên tiếp tục đến bước đặt con trỏ." : "The matrix is non-empty, so execution continues to pointer initialization."}</span></section>`;
  } else if (decision.kind === "init") {
    decisionHtml = `<section class="s240-decision init"><small>${vi ? "ĐIỂM BẮT ĐẦU" : "STARTING POINT"}</small><strong>(row, col) = (0, ${cols - 1})</strong><span>${vi ? "Góc trên-phải cho phép loại một hướng chắc chắn sau mỗi lần so sánh." : "The top-right corner makes one direction safely removable after each comparison."}</span></section>`;
  } else if (decision.kind === "bounds") {
    decisionHtml = `<section class="s240-decision ${decision.inBounds ? "check" : "missing"}"><small>WHILE</small><strong>row &lt; ${rows} and col &gt;= 0 → ${decision.inBounds ? "TRUE" : "FALSE"}</strong><span>${decision.inBounds ? (vi ? "Con trỏ còn trong vùng ứng viên." : "The pointer remains in the candidate region.") : (vi ? "Con trỏ đã đi qua biên; vùng ứng viên rỗng." : "The pointer crossed a boundary; the candidate region is empty.")}</span></section>`;
  } else if (decision.kind === "read") {
    decisionHtml = `<section class="s240-decision check"><small>${vi ? "ĐỌC Ô" : "READ CELL"}</small><strong>value = matrix[${view.row}][${view.col}] = ${escapeHtml(String(view.value))}</strong><span>${vi ? `Lần đọc ${path.length}; chỉ những ô trên đường cầu thang mới được truy cập.` : `Probe ${path.length}; only cells on the staircase path are accessed.`}</span></section>`;
  } else if (decision.kind === "equal") {
    decisionHtml = `<section class="s240-decision ${decision.result ? "found" : "check"}"><small>VALUE == TARGET</small><strong>${escapeHtml(String(view.value))} == ${escapeHtml(String(target))} → ${decision.result ? "TRUE" : "FALSE"}</strong><span>${decision.result ? (vi ? "Đã xác định đúng ô target." : "The target cell has been identified.") : (vi ? "Chưa bằng target; xét tiếp quan hệ lớn hơn." : "Not equal; next test whether the value is greater.")}</span></section>`;
  } else if (decision.kind === "greater") {
    decisionHtml = `<section class="s240-decision ${decision.result ? "left" : "down"}"><small>VALUE &gt; TARGET</small><strong>${escapeHtml(String(view.value))} &gt; ${escapeHtml(String(target))} → ${decision.result ? "TRUE" : "FALSE"}</strong><span>${decision.result ? (vi ? "Giá trị quá lớn: bước kế tiếp đi sang trái." : "The value is too large: the next move goes left.") : (vi ? "Giá trị nhỏ hơn target: chuyển sang nhánh đi xuống." : "The value is below the target: switch to the downward branch.")}</span></section>`;
  } else if (decision.kind === "else") {
    decisionHtml = `<section class="s240-decision down"><small>ELSE · VALUE &lt; TARGET</small><strong>${escapeHtml(String(view.value))} &lt; ${escapeHtml(String(target))}</strong><span>${vi ? `Mọi ô còn lại bên trái của hàng ${view.row} đều còn nhỏ hơn, nên loại hàng đó.` : `Every remaining cell to the left in row ${view.row} is smaller, so that row can be removed.`}</span></section>`;
  } else if (decision.kind === "move-left") {
    decisionHtml = `<section class="s240-decision left"><small>COL -= 1 · ←</small><strong>${vi ? `Loại cột ${decision.eliminatedCol}` : `Eliminate column ${decision.eliminatedCol}`}</strong><span>${vi ? `Con trỏ mới: (${view.row}, ${view.col}). Các ô chưa xét trong cột vừa loại đều ≥ ${view.value} > target.` : `New pointer: (${view.row}, ${view.col}). Every unvisited cell in the removed column is at least ${view.value} > target.`}</span></section>`;
  } else if (decision.kind === "move-down") {
    decisionHtml = `<section class="s240-decision down"><small>ROW += 1 · ↓</small><strong>${vi ? `Loại hàng ${decision.eliminatedRow}` : `Eliminate row ${decision.eliminatedRow}`}</strong><span>${vi ? `Con trỏ mới: (${view.row}, ${view.col}). Các ô chưa xét trong hàng vừa loại đều ≤ ${view.value} < target.` : `New pointer: (${view.row}, ${view.col}). Every unvisited cell in the removed row is at most ${view.value} < target.`}</span></section>`;
  } else if (decision.kind === "found") {
    decisionHtml = `<section class="s240-decision found"><small>${vi ? "KẾT QUẢ" : "RESULT"}</small><strong>return True · (${view.row}, ${view.col})</strong><span>${vi ? `Tìm thấy target ${target} sau ${path.length} lần đọc.` : `Found target ${target} after ${path.length} probe(s).`}</span></section>`;
  } else {
    decisionHtml = `<section class="s240-decision missing"><small>${vi ? "KẾT QUẢ" : "RESULT"}</small><strong>return False</strong><span>${vi ? `Không còn ứng viên sau ${path.length} lần đọc.` : `No candidate remains after ${path.length} probe(s).`}</span></section>`;
  }

  const matrixRows = matrix.map((values, row) => values.map((value, col) => {
    const key = `${row},${col}`;
    const discardedByRow = eliminatedRows.has(row);
    const discardedByCol = eliminatedCols.has(col);
    const discarded = discardedByRow || discardedByCol;
    const current = sameCell(activeCell, row, col);
    const previous = sameCell(previousCell, row, col);
    const order = pathOrder.get(key);
    const found = phase === "found" && current;
    const classes = ["s240-cell", discarded ? "discarded" : "candidate"];
    if (discardedByRow) classes.push("discarded-row");
    if (discardedByCol) classes.push("discarded-col");
    if (order) classes.push("visited");
    if (previous) classes.push("previous");
    if (current) classes.push("current");
    if (found) classes.push("found");
    const tag = found
      ? (vi ? "TÌM THẤY" : "FOUND")
      : current
        ? (vi ? "CON TRỎ" : "POINTER")
        : discarded
          ? (vi ? "ĐÃ LOẠI" : "REMOVED")
          : order
            ? `${vi ? "BƯỚC" : "STEP"} ${order}`
            : (vi ? "ỨNG VIÊN" : "CANDIDATE");
    return `<span class="${classes.join(" ")}"><small>[${row},${col}]</small><strong>${escapeHtml(String(value))}</strong><em>${escapeHtml(tag)}</em>${order ? `<b>${order}</b>` : ""}</span>`;
  }).join(""));

  const trail = path.length
    ? path.map((cell, index) => {
      const next = path[index + 1];
      const arrow = next ? (next[0] > cell[0] ? "↓" : "←") : "";
      return `<span><b>${index + 1}</b><code>(${cell[0]},${cell[1]})</code><em>${escapeHtml(String(matrix[cell[0]]?.[cell[1]]))}</em>${arrow ? `<i>${arrow}</i>` : ""}</span>`;
    }).join("")
    : `<em class="s240-empty">${vi ? "Chưa đọc ô nào" : "No cell has been read yet"}</em>`;
  const pointerText = view.pointer ? `(${view.pointer[0]}, ${view.pointer[1]})` : (vi ? "ngoài matrix" : "outside matrix");
  const summary = vi
    ? `Search a 2D Matrix II: target ${target}, đã đọc ${path.length} ô, còn ${view.candidates} ứng viên.`
    : `Search a 2D Matrix II: target ${target}, ${path.length} probes, ${view.candidates} candidates remain.`;

  $("treeView").innerHTML = `<section class="s240-viz" role="img" aria-label="${escapeHtml(summary)}">
    <div class="s240-stages">${stages}</div>
    <section class="s240-action"><small>${vi ? "DÒNG" : "LINE"} ${activeLine ?? "-"}</small><strong>${escapeHtml(pick(step.title))}</strong><span>${escapeHtml(pick(step.note))}</span></section>
    <section class="s240-stats"><span><small>TARGET</small><strong>${escapeHtml(String(target))}</strong></span><span><small>${vi ? "CON TRỎ" : "POINTER"}</small><strong>${escapeHtml(pointerText)}</strong></span><span><small>${vi ? "LẦN ĐỌC" : "PROBES"}</small><strong>${path.length}</strong></span><span><small>${vi ? "Ô ỨNG VIÊN" : "CANDIDATES"}</small><strong>${view.candidates}</strong></span></section>
    ${decisionHtml}
    <div class="s240-layout">
      <section class="s240-board"><header><strong>${vi ? "MA TRẬN TÌM KIẾM" : "SEARCH MATRIX"}</strong><span>${rows} × ${cols}</span></header><div class="s240-board-scroll"><div class="s240-grid" style="--s240-cols:${cols}"><span class="s240-corner">r\\c</span>${Array.from({ length: cols }, (_, col) => `<span class="s240-axis">c=${col}</span>`).join("")}${Array.from({ length: rows }, (_, row) => `<span class="s240-axis s240-row">r=${row}</span>${matrixRows[row] || ""}`).join("")}</div></div></section>
      <aside class="s240-proof"><strong>${vi ? "QUY TẮC CẦU THANG" : "STAIRCASE RULE"}</strong><span class="left ${decision.kind === "greater" && decision.result || decision.kind === "move-left" ? "active" : ""}"><b>value &gt; target</b><em>← ${vi ? "đi trái · loại cột" : "left · drop column"}</em></span><span class="down ${decision.kind === "else" || decision.kind === "move-down" || decision.kind === "greater" && !decision.result ? "active" : ""}"><b>value &lt; target</b><em>↓ ${vi ? "đi xuống · loại hàng" : "down · drop row"}</em></span><span class="equal ${phase === "found" ? "active" : ""}"><b>value == target</b><em>✓ return True</em></span></aside>
    </div>
    <section class="s240-trail"><header><strong>${vi ? "ĐƯỜNG ĐI ĐÃ ĐỌC" : "VISITED STAIRCASE PATH"}</strong><span>${path.length} / ${rows + cols - 1} ${vi ? "ô tối đa" : "max probes"}</span></header><div>${trail}</div></section>
    <aside class="s240-legend"><span class="candidate"><i></i>${vi ? "vùng còn xét" : "candidate region"}</span><span class="current"><i></i>${vi ? "con trỏ hiện tại" : "current pointer"}</span><span class="visited"><i></i>${vi ? "đường đã đọc" : "visited path"}</span><span class="discarded"><i></i>${vi ? "hàng/cột đã loại" : "removed row/column"}</span></aside>
  </section>`;
}

function renderImageOverlap835View(step) {
  const view = step.overlap835View || {};
  const vi = lang === "vi";
  const img1 = Array.isArray(view.img1) ? view.img1 : [];
  const img2 = Array.isArray(view.img2) ? view.img2 : [];
  const n = Number(view.n) || img1.length || 1;
  const phase = String(view.phase || "collect");
  const activeOne1 = Array.isArray(view.activeOne1) ? view.activeOne1 : null;
  const activeOne2 = Array.isArray(view.activeOne2) ? view.activeOne2 : null;
  const shift = Array.isArray(view.shift) ? view.shift : null;
  const bestShift = Array.isArray(view.bestShift) ? view.bestShift : null;
  const key = (cell) => Array.isArray(cell) ? `${cell[0]},${cell[1]}` : "";
  const same = (a, b) => key(a) !== "" && key(a) === key(b);
  const shifted = new Set((view.shiftedCells || []).map(key));
  const overlaps = new Set((view.overlapCells || []).map(key));
  const counted = new Set((view.countedCells || []).map(key));
  const currentShiftKey = key(shift);
  const activeLine = Array.isArray(step.codeLines) ? step.codeLines[0] : null;
  const phaseIndex = phase === "done" ? 4 : phase === "best" ? 3 : phase === "count" ? 2 : phase === "pairs" || phase === "translate" ? 1 : 0;
  const stages = [
    { vi: "Lấy tọa độ 1", en: "Collect one-cells" },
    { vi: "Ghép từng cặp", en: "Pair coordinates" },
    { vi: "Đếm vector dịch", en: "Count translations" },
    { vi: "Giữ kỷ lục", en: "Track maximum" },
  ].map((item, index) => {
    const state = phaseIndex === 4 || index < phaseIndex ? "done" : index === phaseIndex ? "active" : "pending";
    return `<span class="${state}"><small>${state === "done" ? "✓" : state === "active" ? "▶" : index + 1}</small><strong>${escapeHtml(vi ? item.vi : item.en)}</strong></span>`;
  }).join("");

  const originalGrid = (image, active, label) => {
    const cells = [];
    cells.push(`<span class="io835-corner">r\\c</span>`);
    for (let col = 0; col < n; col++) cells.push(`<span class="io835-axis">${col}</span>`);
    for (let row = 0; row < n; row++) {
      cells.push(`<span class="io835-axis">${row}</span>`);
      for (let col = 0; col < n; col++) {
        const value = image[row]?.[col] || 0;
        const classes = ["io835-cell", value ? "one" : "zero"];
        if (same(active, [row, col])) classes.push("active");
        cells.push(`<span class="${classes.join(" ")}"><strong>${value}</strong><small>[${row},${col}]</small></span>`);
      }
    }
    return `<section class="io835-board"><header><strong>${escapeHtml(label)}</strong><span>${n} × ${n}</span></header><div class="io835-grid" style="--io835-n:${n}">${cells.join("")}</div></section>`;
  };

  const overlayCells = [];
  overlayCells.push(`<span class="io835-corner">r\\c</span>`);
  for (let col = 0; col < n; col++) overlayCells.push(`<span class="io835-axis">${col}</span>`);
  for (let row = 0; row < n; row++) {
    overlayCells.push(`<span class="io835-axis">${row}</span>`);
    for (let col = 0; col < n; col++) {
      const cellKey = `${row},${col}`;
      const from1 = shifted.has(cellKey);
      const from2 = img2[row]?.[col] === 1;
      const overlap = overlaps.has(cellKey);
      const classes = ["io835-cell", "overlay"];
      if (from1) classes.push("from-img1");
      if (from2) classes.push("from-img2");
      if (overlap) classes.push("overlap");
      if (counted.has(cellKey)) classes.push("counted");
      if (same(activeOne2, [row, col]) && shift) classes.push("active-pair");
      const symbol = overlap ? "1+1" : from1 ? "A" : from2 ? "B" : "·";
      const tag = counted.has(cellKey) ? (vi ? "ĐÃ ĐẾM" : "COUNTED") : overlap ? (vi ? "TRÙNG" : "OVERLAP") : from1 ? "img1" : from2 ? "img2" : "";
      overlayCells.push(`<span class="${classes.join(" ")}"><strong>${symbol}</strong><small>${escapeHtml(tag)}</small></span>`);
    }
  }

  const vector = shift
    ? `<section class="io835-vector active"><small>${vi ? "VECTOR HIỆN TẠI" : "CURRENT VECTOR"}</small><strong>(${shift[0]}, ${shift[1]})</strong><span>(${activeOne2?.[0] ?? "r2"} − ${activeOne1?.[0] ?? "r1"}, ${activeOne2?.[1] ?? "c2"} − ${activeOne1?.[1] ?? "c1"})</span></section>`
    : `<section class="io835-vector"><small>${vi ? "VECTOR DỊCH" : "TRANSLATION VECTOR"}</small><strong>(dr, dc)</strong><span>(r2 − r1, c2 − c1)</span></section>`;
  const vote = view.countAfter === null || view.countAfter === undefined
    ? "—"
    : `${view.countBefore ?? 0} → ${view.countAfter}`;
  const bestText = bestShift ? `(${bestShift[0]}, ${bestShift[1]})` : "—";
  const formula = `<section class="io835-formula">
    ${vector}
    <i>→</i>
    <section><small>${vi ? "PHIẾU CHO VECTOR" : "VECTOR VOTES"}</small><strong>${escapeHtml(vote)}</strong><span>shifts[(dr, dc)] += 1</span></section>
    <i>→</i>
    <section class="best ${view.bestChanged ? "changed" : ""}"><small>BEST</small><strong>${Number(view.best) || 0}</strong><span>${escapeHtml(bestText)}</span></section>
  </section>`;

  const countRows = (view.counts || []).slice(0, 8).map((entry, index) => {
    const entryKey = `${entry.dr},${entry.dc}`;
    const classes = [];
    if (entryKey === currentShiftKey) classes.push("current");
    if (bestShift && entryKey === key(bestShift)) classes.push("best");
    return `<li class="${classes.join(" ")}"><small>#${index + 1}</small><code>(${entry.dr}, ${entry.dc})</code><strong>${entry.count}</strong></li>`;
  }).join("") || `<li class="empty">${vi ? "Chưa có vector nào được đếm" : "No translation has been counted yet"}</li>`;
  const scoreboard = `<section class="io835-score"><header><strong>${vi ? "BẢNG XẾP HẠNG VECTOR" : "TRANSLATION LEADERBOARD"}</strong><span>${(view.counts || []).length} ${vi ? "vector khác nhau" : "distinct vectors"}</span></header><ol>${countRows}</ol><footer>${vi ? "Các vector được xếp theo số phiếu giảm dần." : "Vectors are ordered by descending vote count."}</footer></section>`;
  const overlay = `<section class="io835-board io835-overlay"><header><strong>${vi ? "IMG1 SAU KHI DỊCH + IMG2" : "SHIFTED IMG1 + IMG2"}</strong><span>${shift ? `Δ = (${shift.join(", ")})` : "Δ = —"}</span></header><div class="io835-grid" style="--io835-n:${n}">${overlayCells.join("")}</div><footer>${Number(view.clipped) || 0} ${vi ? "ô 1 của img1 nằm ngoài khung" : "img1 one-cell(s) outside the frame"}</footer></section>`;
  const summary = vi
    ? `Image Overlap: vector tốt nhất ${bestText}, overlap ${Number(view.best) || 0}.`
    : `Image Overlap: best vector ${bestText}, overlap ${Number(view.best) || 0}.`;

  $("treeView").innerHTML = `<section class="io835-viz" role="img" aria-label="${escapeHtml(summary)}">
    <div class="io835-stages">${stages}</div>
    <section class="io835-action"><small>${vi ? "DÒNG" : "LINE"} ${activeLine ?? "—"}</small><strong>${escapeHtml(pick(step.title))}</strong><span>${escapeHtml(pick(step.note))}</span></section>
    ${formula}
    <div class="io835-main">
      <div class="io835-images">${originalGrid(img1, activeOne1, "IMG1")}${overlay}${originalGrid(img2, activeOne2, "IMG2")}</div>
      ${scoreboard}
    </div>
    <div class="io835-legend"><span class="a"><i></i>${vi ? "1 từ img1 đã dịch" : "shifted img1 one"}</span><span class="b"><i></i>${vi ? "1 từ img2" : "img2 one"}</span><span class="overlap"><i></i>${vi ? "hai ô 1 trùng nhau" : "overlapping ones"}</span><span class="counted"><i></i>${vi ? "phiếu đã đếm" : "counted vote"}</span></div>
  </section>`;
}

function renderSetMatrixZeroes73ConstantView(step) {
  const view = step.zero73View || {};
  const vi = lang === "vi";
  const original = Array.isArray(view.original) ? view.original : [];
  const matrix = Array.isArray(view.matrix) ? view.matrix : original;
  const rows = Number(view.rows) || matrix.length;
  const cols = Number(view.cols) || (matrix[0] ? matrix[0].length : 0);
  const markerRows = new Set((view.markerRows || []).map(Number));
  const markerCols = new Set((view.markerCols || []).map(Number));
  const activeCell = Array.isArray(view.activeCell) ? view.activeCell : null;
  const changedCell = Array.isArray(view.changedCell) ? view.changedCell : null;
  const phase = String(view.phase || "boundaries");
  const decision = view.decision || {};
  const sameCell = (cell, row, col) => Array.isArray(cell) && cell[0] === row && cell[1] === col;
  const phaseIndex = phase === "done" ? 4 : phase === "restore" ? 3 : phase === "apply" ? 2 : phase === "mark" ? 1 : 0;
  const phases = [
    { label: vi ? "Lưu cờ" : "Save flags", detail: "row 0 / col 0" },
    { label: vi ? "Ghi marker" : "Mark matrix", detail: "[r][0] / [0][c]" },
    { label: vi ? "Xóa lõi" : "Clear core", detail: vi ? "đọc marker" : "read markers" },
    { label: vi ? "Xóa biên" : "Clear border", detail: vi ? "dùng hai cờ" : "use flags" },
  ].map((item, index) => {
    const state = phaseIndex === 4 || index < phaseIndex ? "done" : index === phaseIndex ? "active" : "pending";
    return `<span class="${state}"><small>${state === "done" ? "✓" : index + 1}</small><strong>${escapeHtml(item.label)}</strong><em>${escapeHtml(item.detail)}</em></span>`;
  }).join("");

  const flag = (name, value, label) => `<section class="${value ? "true" : "false"}"><small>${escapeHtml(name)}</small><strong>${value ? "TRUE" : "FALSE"}</strong><span>${escapeHtml(label)}</span></section>`;
  const flags = `${flag("first_row_has_zero", Boolean(view.firstRowHasZero), vi ? "xóa hàng 0 ở cuối" : "clear row 0 at the end")}${flag("first_col_has_zero", Boolean(view.firstColHasZero), vi ? "xóa cột 0 ở cuối" : "clear column 0 at the end")}`;
  const markers = (indices, axis) => indices.length
    ? indices.map((index) => `<span>${axis}${index} → matrix[${axis === "r" ? `${index}][0` : `0][${index}`}] = 0</span>`).join("")
    : `<em>${vi ? "chưa ghi marker lõi" : "no inner marker stored"}</em>`;

  let rule;
  if (decision.kind === "init") {
    rule = `<section class="zm73-rule continue"><small>${vi ? "O(1) BỘ NHỚ PHỤ" : "O(1) AUXILIARY SPACE"}</small><strong>${vi ? "Matrix tự làm bộ nhớ marker" : "The matrix stores its own markers"}</strong><b>${vi ? "Chỉ cần thêm hai biến boolean." : "Only two boolean variables are added."}</b></section>`;
  } else if (decision.kind === "boundary-flag") {
    const found = Boolean(decision.found);
    const axis = decision.axis === "row" ? (vi ? "hàng đầu" : "first row") : (vi ? "cột đầu" : "first column");
    rule = `<section class="zm73-rule ${found ? "found" : "continue"}"><small>${vi ? "DÒNG ĐANG CHẠY · ANY(...)" : "CURRENT LINE · ANY(...)"}</small><strong>${escapeHtml(axis)} ${found ? "→ TRUE" : "→ FALSE"}</strong><b>${found ? (vi ? `Dừng tại index ${decision.stop}: đã gặp 0.` : `Stopped at index ${decision.stop}: found zero.`) : (vi ? "Đã đọc hết biên và không gặp 0." : "Read the full boundary without finding zero.")}</b></section>`;
  } else if (["loop-marker-row", "loop-marker-col", "loop-apply-row", "loop-apply-col", "loop-boundary"].includes(decision.kind)) {
    const index = decision.col ?? decision.row ?? decision.index;
    rule = `<section class="zm73-rule continue"><small>${vi ? "VÒNG LẶP ĐANG CHẠY" : "LOOP LINE EXECUTED"}</small><strong>${decision.col !== undefined || decision.axis === "row" ? "c" : "r"} = ${escapeHtml(String(index))}</strong><b>${vi ? "Chỉ cập nhật con trỏ; matrix chưa đổi ở bước này." : "Only the cursor changes; the matrix is unchanged in this step."}</b></section>`;
  } else if (decision.kind === "check-zero") {
    const found = Number(decision.value) === 0;
    rule = `<section class="zm73-rule ${found ? "found" : "continue"}"><small>${vi ? "DÒNG 9 · KIỂM TRA Ô LÕI" : "LINE 9 · CHECK INTERIOR CELL"}</small><strong>matrix[r][c] == 0 → ${found ? "TRUE" : "FALSE"}</strong><b>${found ? (vi ? "Tiếp theo chạy dòng 10, rồi dòng 11." : "Next execute line 10, then line 11.") : (vi ? "Bỏ qua dòng 10–11." : "Skip lines 10–11.")}</b></section>`;
  } else if (decision.kind === "store-row-marker") {
    rule = `<section class="zm73-rule found"><small>${vi ? "DÒNG 10 · GHI MARKER HÀNG" : "LINE 10 · WRITE ROW MARKER"}</small><strong>matrix[${decision.row}][0] = 0</strong><b>${vi ? "Marker cột chưa được ghi ở bước này." : "The column marker has not been written in this step."}</b></section>`;
  } else if (decision.kind === "store-col-marker") {
    rule = `<section class="zm73-rule found"><small>${vi ? "DÒNG 11 · GHI MARKER CỘT" : "LINE 11 · WRITE COLUMN MARKER"}</small><strong>matrix[0][${decision.col}] = 0</strong><b>${vi ? "Bây giờ cặp marker mới hoàn tất." : "The marker pair is now complete."}</b></section>`;
  } else if (decision.kind === "check-marker" || decision.kind === "write-zero") {
    const rowMarked = Boolean(decision.rowMarked);
    const colMarked = Boolean(decision.colMarked);
    const becomesZero = decision.kind === "write-zero" || Boolean(decision.shouldZero);
    rule = `<section class="zm73-rule ${becomesZero ? "zero" : "keep"}"><small>${vi ? "ĐỌC MARKER TẠI CHỖ" : "READ IN-PLACE MARKERS"}</small><div><span class="${rowMarked ? "true" : "false"}">matrix[r][0] == 0 <b>${rowMarked ? "TRUE" : "FALSE"}</b></span><i>OR</i><span class="${colMarked ? "true" : "false"}">matrix[0][c] == 0 <b>${colMarked ? "TRUE" : "FALSE"}</b></span></div><strong>${becomesZero ? (vi ? "Có marker 0 → xóa ô lõi" : "A zero marker exists → clear inner cell") : (vi ? "Không marker 0 → giữ nguyên" : "No zero marker → keep the cell")}</strong></section>`;
  } else if (decision.kind === "check-boundary") {
    const axis = decision.axis === "row" ? (vi ? "hàng đầu" : "first row") : (vi ? "cột đầu" : "first column");
    const enabled = Boolean(decision.enabled);
    const skipped = decision.axis === "row" ? "19–20" : "23–24";
    rule = `<section class="zm73-rule ${enabled ? "found" : "keep"}"><small>${vi ? "KIỂM TRA CỜ BIÊN" : "CHECK BOUNDARY FLAG"}</small><strong>${escapeHtml(axis)} → ${enabled ? "TRUE" : "FALSE"}</strong><b>${enabled ? (vi ? "Đi vào vòng xóa biên." : "Enter the boundary-clearing loop.") : (vi ? `Bỏ qua dòng ${skipped}.` : `Skip lines ${skipped}.`)}</b></section>`;
  } else if (decision.kind === "write-boundary") {
    const axis = decision.axis === "row" ? (vi ? "hàng đầu" : "first row") : (vi ? "cột đầu" : "first column");
    const target = decision.axis === "row" ? `matrix[0][${decision.index}]` : `matrix[${decision.index}][0]`;
    rule = `<section class="zm73-rule zero"><small>${vi ? "GÁN Ô BIÊN" : "WRITE BOUNDARY CELL"}</small><strong>${escapeHtml(target)} = 0</strong><b>${vi ? `${escapeHtml(axis)} được xử lý từng ô, đúng dòng đang sáng.` : `${escapeHtml(axis)} is cleared one cell at a time on the highlighted line.`}</b></section>`;
  } else if (decision.kind === "return") {
    rule = `<section class="zm73-rule done"><small>${vi ? "DÒNG 25 · RETURN" : "LINE 25 · RETURN"}</small><strong>${vi ? "Trả về None; matrix đã sửa tại chỗ." : "Return None; matrix was modified in place."}</strong><b>O(m·n) time · O(1) space</b></section>`;
  } else {
    rule = `<section class="zm73-rule done"><small>${vi ? "HOÀN TẤT" : "COMPLETE"}</small><strong>${vi ? "Đã áp dụng toàn bộ marker ngay trong matrix." : "All in-matrix markers have been applied."}</strong><b>O(m·n) time · O(1) space</b></section>`;
  }

  const cellRows = matrix.map((row, rowIndex) => row.map((value, colIndex) => {
    const sourceZero = original[rowIndex]?.[colIndex] === 0;
    const boundary = rowIndex === 0 || colIndex === 0;
    const storedRow = colIndex === 0 && markerRows.has(rowIndex);
    const storedCol = rowIndex === 0 && markerCols.has(colIndex);
    const active = sameCell(activeCell, rowIndex, colIndex);
    const changed = sameCell(changedCell, rowIndex, colIndex);
    const classes = ["zm73-cell"];
    if (boundary) classes.push("marker-storage");
    if (storedRow || storedCol) classes.push("stored-marker");
    if (sourceZero) classes.push("source-zero");
    if (active) classes.push("active");
    if (changed) classes.push("changed");
    const tag = changed
      ? (vi ? "VỪA → 0" : "NOW → 0")
      : storedRow
        ? (vi ? `MARK HÀNG ${rowIndex}` : `MARK ROW ${rowIndex}`)
        : storedCol
          ? (vi ? `MARK CỘT ${colIndex}` : `MARK COL ${colIndex}`)
          : sourceZero
            ? (vi ? "0 GỐC" : "ORIGINAL 0")
            : boundary
              ? (vi ? "Ô MARKER" : "MARKER CELL")
              : (vi ? "PHẦN LÕI" : "INTERIOR");
    return `<div class="${classes.join(" ")}"><small>[${rowIndex},${colIndex}]</small><strong>${escapeHtml(String(value))}</strong><em>${escapeHtml(tag)}</em></div>`;
  }));

  const actionLine = Array.isArray(step.codeLines) ? step.codeLines[0] : null;
  const summary = vi
    ? `Set Matrix Zeroes Cách 2: ${markerRows.size} marker hàng, ${markerCols.size} marker cột, O(1) bộ nhớ phụ.`
    : `Set Matrix Zeroes Approach 2: ${markerRows.size} row markers, ${markerCols.size} column markers, O(1) auxiliary space.`;
  $("treeView").innerHTML = `<section class="zm73-viz zm73-constant" role="img" aria-label="${escapeHtml(summary)}">
    <div class="zm73-method"><small>${vi ? "CÁCH 2" : "APPROACH 2"}</small><strong>${vi ? "Marker tại chỗ" : "In-place markers"}</strong><span>O(1) ${vi ? "bộ nhớ phụ" : "auxiliary space"}</span></div>
    <div class="zm73-phases">${phases}</div>
    <section class="zm73-action"><small>${vi ? "DÒNG" : "LINE"} ${actionLine ?? "-"}</small><strong>${escapeHtml(pick(step.title))}</strong><span>${escapeHtml(pick(step.note))}</span></section>
    <div class="zm73-flags">${flags}</div>
    <section class="zm73-markers"><header><strong>${vi ? "MARKER NẰM TRONG MATRIX" : "MARKERS STORED IN THE MATRIX"}</strong><span>${vi ? "hàng 0 + cột 0 thay cho hai Set" : "row 0 + column 0 replace two Sets"}</span></header><div><section class="rows"><small>matrix[r][0]</small><div>${markers([...markerRows].sort((a, b) => a - b), "r")}</div></section><section class="cols"><small>matrix[0][c]</small><div>${markers([...markerCols].sort((a, b) => a - b), "c")}</div></section></div></section>
    ${rule}
    <div class="zm73-layout">
      <section class="zm73-board"><header><strong>${vi ? "MATRIX + VÙNG MARKER" : "MATRIX + MARKER STORAGE"}</strong><span>${rows} × ${cols}</span></header><div class="zm73-grid" style="--zm73-cols:${cols}"><span class="zm73-corner">r\\c</span>${Array.from({ length: cols }, (_, col) => `<span class="zm73-col ${col === 0 || markerCols.has(col) ? "marked" : ""}">c=${col}</span>`).join("")}${Array.from({ length: rows }, (_, row) => `<span class="zm73-row ${row === 0 || markerRows.has(row) ? "marked" : ""}">r=${row}</span>${(cellRows[row] || []).join("")}`).join("")}</div></section>
      <aside class="zm73-legend"><strong>${vi ? "ĐỌC MÀU" : "READ COLORS"}</strong><span class="storage"><i></i>${vi ? "ô lưu marker" : "marker storage"}</span><span class="stored"><i></i>${vi ? "marker đã ghi" : "stored marker"}</span><span class="source"><i></i>${vi ? "số 0 gốc" : "original zero"}</span><span class="active"><i></i>${vi ? "ô đang xét" : "active cell"}</span><span class="changed"><i></i>${vi ? "ô vừa thành 0" : "just set to 0"}</span></aside>
    </div>
  </section>`;
}

function renderSetMatrixZeroes73View(step) {
  const view = step.zero73View || {};
  if (Number(view.approach) === 2) {
    renderSetMatrixZeroes73ConstantView(step);
    return;
  }
  const vi = lang === "vi";
  const original = Array.isArray(view.original) ? view.original : [];
  const matrix = Array.isArray(view.matrix) ? view.matrix : original;
  const rows = Number(view.rows) || matrix.length;
  const cols = Number(view.cols) || (matrix[0] ? matrix[0].length : 0);
  const zeroRows = new Set((view.zeroRows || []).map(Number));
  const zeroCols = new Set((view.zeroCols || []).map(Number));
  const activeCell = Array.isArray(view.activeCell) ? view.activeCell : null;
  const changedCell = Array.isArray(view.changedCell) ? view.changedCell : null;
  const phase = String(view.phase || "scan");
  const decision = view.decision || {};
  const sameCell = (cell, row, col) => Array.isArray(cell) && cell[0] === row && cell[1] === col;
  const phaseIndex = phase === "done" ? 3 : phase === "apply" ? 2 : phase === "mark" ? 1 : 0;
  const phases = [
    { label: vi ? "Quét matrix" : "Scan matrix", detail: vi ? "tìm 0 gốc" : "find original zeroes" },
    { label: vi ? "Lưu marker" : "Store markers", detail: "zero_rows / zero_cols" },
    { label: vi ? "Đặt thành 0" : "Set to zero", detail: vi ? "hàng OR cột" : "row OR column" },
  ].map((item, index) => {
    const state = phaseIndex === 3 || index < phaseIndex ? "done" : index === phaseIndex ? "active" : "pending";
    return `<span class="${state}"><small>${state === "done" ? "✓" : index + 1}</small><strong>${escapeHtml(item.label)}</strong><em>${escapeHtml(item.detail)}</em></span>`;
  }).join("");

  const markers = (indices, axis) => indices.length
    ? indices.map((index) => `<span>${axis} = ${escapeHtml(String(index))}</span>`).join("")
    : `<em>${vi ? "chưa có marker" : "no markers yet"}</em>`;
  const rowMarkers = [...zeroRows].sort((a, b) => a - b);
  const colMarkers = [...zeroCols].sort((a, b) => a - b);

  let rule;
  if (decision.kind === "init") {
    rule = `<section class="zm73-rule continue"><small>${vi ? "BẮT ĐẦU" : "START"}</small><strong>${vi ? "Lượt 1 chỉ tìm số 0 gốc" : "Pass 1 only looks for original zeroes"}</strong><b>${vi ? "Chưa đổi ô nào trong matrix." : "No matrix cell has changed yet."}</b></section>`;
  } else if (decision.kind === "scan") {
    const isZero = Number(decision.value) === 0;
    rule = `<section class="zm73-rule ${isZero ? "found" : "continue"}"><small>${vi ? "LƯỢT 1 · ĐANG ĐỌC" : "PASS 1 · READING"}</small><strong>matrix[r][c] == 0 ?</strong><b>${isZero ? (vi ? "CÓ → lưu hàng và cột" : "YES → save row and column") : (vi ? "KHÔNG → tiếp tục quét" : "NO → keep scanning")}</b></section>`;
  } else if (decision.kind === "mark") {
    rule = `<section class="zm73-rule found"><small>${vi ? "LƯỢT 1 · GHI MARKER" : "PASS 1 · STORE MARKERS"}</small><strong>zero_rows.add(${escapeHtml(String(decision.row))}) &nbsp; + &nbsp; zero_cols.add(${escapeHtml(String(decision.col))})</strong><b>${vi ? "Matrix chưa đổi" : "Matrix is still unchanged"}</b></section>`;
  } else if (decision.kind === "check" || decision.kind === "apply") {
    const rowMarked = Boolean(decision.rowMarked);
    const colMarked = Boolean(decision.colMarked);
    const becomesZero = decision.kind === "apply" || Boolean(decision.shouldZero);
    rule = `<section class="zm73-rule ${becomesZero ? "zero" : "keep"}"><small>${vi ? "LƯỢT 2 · QUY TẮC OR" : "PASS 2 · OR RULE"}</small><div><span class="${rowMarked ? "true" : "false"}">r in zero_rows <b>${rowMarked ? "TRUE" : "FALSE"}</b></span><i>OR</i><span class="${colMarked ? "true" : "false"}">c in zero_cols <b>${colMarked ? "TRUE" : "FALSE"}</b></span></div><strong>${becomesZero ? (vi ? "Ít nhất một điều kiện đúng → đặt 0" : "At least one is true → set 0") : (vi ? "Cả hai sai → giữ nguyên" : "Both false → keep value")}</strong></section>`;
  } else {
    rule = `<section class="zm73-rule done"><small>${vi ? "HOÀN TẤT" : "COMPLETE"}</small><strong>${vi ? "Marker đã được áp dụng cho toàn bộ matrix." : "Markers have been applied to the entire matrix."}</strong><b>${vi ? "Mỗi 0 mới đều có lý do từ lượt 1" : "Every new zero has a pass-1 reason"}</b></section>`;
  }

  const cellRows = matrix.map((row, rowIndex) => row.map((value, colIndex) => {
    const originalValue = original[rowIndex]?.[colIndex];
    const sourceZero = originalValue === 0;
    const rowMarked = zeroRows.has(rowIndex);
    const colMarked = zeroCols.has(colIndex);
    const affected = rowMarked || colMarked;
    const active = sameCell(activeCell, rowIndex, colIndex);
    const changed = sameCell(changedCell, rowIndex, colIndex);
    const classes = ["zm73-cell"];
    if (sourceZero) classes.push("source-zero");
    if (rowMarked) classes.push("marked-row");
    if (colMarked) classes.push("marked-col");
    if (affected) classes.push("affected");
    if (active) classes.push("active");
    if (changed) classes.push("changed");
    if (!affected) classes.push("kept");
    const causes = [rowMarked ? (vi ? `hàng ${rowIndex}` : `row ${rowIndex}`) : "", colMarked ? (vi ? `cột ${colIndex}` : `col ${colIndex}`) : ""].filter(Boolean);
    const tag = changed
      ? (vi ? "VỪA → 0" : "NOW → 0")
      : sourceZero
        ? (vi ? "0 GỐC" : "ORIGINAL 0")
        : affected
          ? causes.join(" + ")
          : (vi ? "GIỮ" : "KEEP");
    return `<div class="${classes.join(" ")}"><small>[${rowIndex},${colIndex}]</small><strong>${escapeHtml(String(value))}</strong><em>${escapeHtml(tag)}</em></div>`;
  }));

  const actionLine = Array.isArray(step.codeLines) ? step.codeLines[0] : null;
  const summary = vi
    ? `Set Matrix Zeroes: ${rowMarkers.length} hàng và ${colMarkers.length} cột đã được đánh dấu.`
    : `Set Matrix Zeroes: ${rowMarkers.length} marked rows and ${colMarkers.length} marked columns.`;

  $("treeView").innerHTML = `<section class="zm73-viz" role="img" aria-label="${escapeHtml(summary)}">
    <div class="zm73-phases">${phases}</div>
    <section class="zm73-action"><small>${vi ? "DÒNG" : "LINE"} ${actionLine ?? "-"}</small><strong>${escapeHtml(pick(step.title))}</strong><span>${escapeHtml(pick(step.note))}</span></section>
    <section class="zm73-markers"><header><strong>${vi ? "MARKER LƯỢT 1" : "PASS-1 MARKERS"}</strong><span>${vi ? "chỉ nhớ vị trí, chưa sửa matrix" : "remember positions; do not edit the matrix yet"}</span></header><div><section class="rows"><small>zero_rows</small><div>${markers(rowMarkers, "r")}</div></section><section class="cols"><small>zero_cols</small><div>${markers(colMarkers, "c")}</div></section></div></section>
    ${rule}
    <div class="zm73-layout">
      <section class="zm73-board"><header><strong>${vi ? "MATRIX HIỆN TẠI" : "CURRENT MATRIX"}</strong><span>${rows} × ${cols}</span></header><div class="zm73-grid" style="--zm73-cols:${cols}"><span class="zm73-corner">r\\c</span>${Array.from({ length: cols }, (_, col) => `<span class="zm73-col ${zeroCols.has(col) ? "marked" : ""}">c=${col}</span>`).join("")}${Array.from({ length: rows }, (_, row) => `<span class="zm73-row ${zeroRows.has(row) ? "marked" : ""}">r=${row}</span>${(cellRows[row] || []).join("")}`).join("")}</div></section>
      <aside class="zm73-legend"><strong>${vi ? "ĐỌC MÀU" : "READ COLORS"}</strong><span class="source"><i></i>${vi ? "số 0 gốc" : "original zero"}</span><span class="row"><i></i>${vi ? "hàng đã đánh dấu" : "marked row"}</span><span class="col"><i></i>${vi ? "cột đã đánh dấu" : "marked column"}</span><span class="active"><i></i>${vi ? "ô đang xét" : "active cell"}</span><span class="changed"><i></i>${vi ? "ô vừa thành 0" : "just set to 0"}</span></aside>
    </div>
  </section>`;
}

function renderSpiral54View(step) {
  const view = step.spiral54View || {};
  const vi = lang === "vi";
  const matrix = Array.isArray(view.matrix) ? view.matrix : [];
  const rows = Number(view.rows) || matrix.length;
  const cols = Number(view.cols) || (matrix[0] ? matrix[0].length : 0);
  const bounds = view.bounds || { top: 0, bottom: rows - 1, left: 0, right: cols - 1 };
  const phase = String(view.phase || "init");
  const direction = view.direction;
  const activeCell = Array.isArray(view.activeCell) ? view.activeCell : null;
  const visitedCells = Array.isArray(view.visitedCells) ? view.visitedCells : [];
  const result = Array.isArray(view.result) ? view.result : [];
  const visited = new Map(visitedCells.map((cell) => [`${cell.row},${cell.col}`, cell]));
  const validRegion = bounds.top <= bounds.bottom && bounds.left <= bounds.right;
  const directions = [
    { key: "top", label: "TOP", arrow: "→", detail: vi ? "hàng trên" : "top row" },
    { key: "right", label: "RIGHT", arrow: "↓", detail: vi ? "cột phải" : "right column" },
    { key: "bottom", label: "BOTTOM", arrow: "←", detail: vi ? "hàng dưới" : "bottom row" },
    { key: "left", label: "LEFT", arrow: "↑", detail: vi ? "cột trái" : "left column" },
  ];
  const activeStage = Math.max(0, directions.findIndex((item) => item.key === direction));
  const stages = directions.map((item, index) => {
    const state = phase === "done" || index < activeStage ? "done" : index === activeStage ? "active" : "pending";
    return `<span class="${state} ${item.key}"><small>${state === "done" ? "✓" : item.arrow}</small><strong>${item.label}</strong><em>${escapeHtml(item.detail)}</em></span>`;
  }).join("");

  const boundaryCards = [
    { key: "top", label: "TOP", value: bounds.top, movement: vi ? "xong hàng → tăng" : "row done → increment" },
    { key: "right", label: "RIGHT", value: bounds.right, movement: vi ? "xong cột → giảm" : "column done → decrement" },
    { key: "bottom", label: "BOTTOM", value: bounds.bottom, movement: vi ? "xong hàng → giảm" : "row done → decrement" },
    { key: "left", label: "LEFT", value: bounds.left, movement: vi ? "xong cột → tăng" : "column done → increment" },
  ].map((item) => {
    const changed = view.boundaryChange?.name === item.key;
    const active = direction === item.key;
    return `<span class="${item.key} ${active ? "active" : ""} ${changed ? "changed" : ""}"><small>${item.label}</small><strong>${item.key} = ${escapeHtml(String(item.value))}</strong><em>${escapeHtml(item.movement)}</em></span>`;
  }).join("");

  const cells = matrix.flatMap((row, rowIndex) => row.map((value, colIndex) => {
    const key = `${rowIndex},${colIndex}`;
    const visit = visited.get(key);
    const isActive = activeCell && activeCell[0] === rowIndex && activeCell[1] === colIndex;
    const inRegion = validRegion
      && rowIndex >= bounds.top && rowIndex <= bounds.bottom
      && colIndex >= bounds.left && colIndex <= bounds.right;
    const classes = ["sm54-cell"];
    if (visit) classes.push("visited");
    if (inRegion) classes.push("remaining");
    if (isActive) classes.push("active");
    if (validRegion && rowIndex === bounds.top && colIndex >= bounds.left && colIndex <= bounds.right) classes.push("bound-top");
    if (validRegion && rowIndex === bounds.bottom && colIndex >= bounds.left && colIndex <= bounds.right) classes.push("bound-bottom");
    if (validRegion && colIndex === bounds.left && rowIndex >= bounds.top && rowIndex <= bounds.bottom) classes.push("bound-left");
    if (validRegion && colIndex === bounds.right && rowIndex >= bounds.top && rowIndex <= bounds.bottom) classes.push("bound-right");
    return `<div class="${classes.join(" ")}"><small>[${rowIndex},${colIndex}]</small><strong>${escapeHtml(String(value))}</strong><em>${visit ? `#${visit.order}` : inRegion ? (vi ? "CHƯA ĐI" : "UNVISITED") : ""}</em></div>`;
  })).join("");

  const topEdge = `<div class="sm54-edge-label top ${direction === "top" ? "active" : ""}"><span>↓</span><b>TOP = ${escapeHtml(String(bounds.top))}</b></div>`;
  const bottomEdge = `<div class="sm54-edge-label bottom ${direction === "bottom" ? "active" : ""}"><b>BOTTOM = ${escapeHtml(String(bounds.bottom))}</b><span>↑</span></div>`;
  const leftEdge = `<div class="sm54-edge-label left ${direction === "left" ? "active" : ""}"><b>LEFT</b><strong>${escapeHtml(String(bounds.left))}</strong><span>→</span></div>`;
  const rightEdge = `<div class="sm54-edge-label right ${direction === "right" ? "active" : ""}"><span>←</span><b>RIGHT</b><strong>${escapeHtml(String(bounds.right))}</strong></div>`;

  let operation;
  if (view.boundaryChange) {
    const change = view.boundaryChange;
    operation = `<section class="sm54-operation change ${escapeHtml(change.name)}"><small>${vi ? "CO BIÊN" : "SHRINK BOUND"}</small><strong>${String(change.name).toUpperCase()}: ${escapeHtml(String(change.from))} → ${escapeHtml(String(change.to))}</strong><span>${vi ? "Cạnh vừa quét được loại khỏi vùng chưa duyệt." : "The completed edge leaves the unvisited region."}</span></section>`;
  } else if (view.guard) {
    const guard = view.guard;
    operation = `<section class="sm54-operation guard ${guard.pass ? "pass" : "skip"}"><small>${vi ? "ĐIỀU KIỆN CHỐNG TRÙNG" : "DUPLICATE GUARD"}</small><strong>${escapeHtml(guard.expression)} · ${escapeHtml(String(guard.left))} ${guard.pass ? "≤" : ">"} ${escapeHtml(String(guard.right))}</strong><span>${guard.pass ? (vi ? "PASS: cạnh này vẫn còn." : "PASS: this edge still exists.") : (vi ? "SKIP: hai biên đã giao nhau." : "SKIP: the bounds have crossed.")}</span></section>`;
  } else if (direction) {
    const formulas = {
      top: `matrix[top][c] · c: ${bounds.left} → ${bounds.right}`,
      right: `matrix[r][right] · r: ${bounds.top} → ${bounds.bottom}`,
      bottom: `matrix[bottom][c] · c: ${bounds.right} → ${bounds.left}`,
      left: `matrix[r][left] · r: ${bounds.bottom} → ${bounds.top}`,
    };
    operation = `<section class="sm54-operation scan ${direction}"><small>${vi ? "CẠNH ĐANG QUÉT" : "ACTIVE EDGE"}</small><strong>${direction.toUpperCase()} ${directions.find((item) => item.key === direction)?.arrow || ""}</strong><code>${escapeHtml(formulas[direction] || "top <= bottom and left <= right")}</code></section>`;
  } else {
    operation = `<section class="sm54-operation idle"><small>${phase === "done" ? "DONE" : (vi ? "VÙNG CHƯA DUYỆT" : "UNVISITED REGION")}</small><strong>${phase === "done" ? `${result.length}/${rows * cols}` : `[top..bottom] × [left..right]`}</strong><span>${phase === "done" ? (vi ? "Mọi ô đã được lấy đúng một lần." : "Every cell was taken exactly once.") : (vi ? "Bốn biên bắt đầu ở viền ngoài." : "The four bounds start at the outer rim.")}</span></section>`;
  }

  const output = result.length
    ? result.map((value, index) => `<span class="${index === result.length - 1 && activeCell ? "active" : ""}"><small>#${index + 1}</small><strong>${escapeHtml(String(value))}</strong></span>`).join("")
    : `<em class="sm54-empty">${vi ? "result đang rỗng" : "result is empty"}</em>`;
  const activeLine = Array.isArray(step.codeLines) ? step.codeLines[0] : null;
  const summary = vi
    ? `Spiral Matrix: đã lấy ${result.length}/${rows * cols} ô; top ${bounds.top}, right ${bounds.right}, bottom ${bounds.bottom}, left ${bounds.left}.`
    : `Spiral Matrix: visited ${result.length}/${rows * cols} cells; top ${bounds.top}, right ${bounds.right}, bottom ${bounds.bottom}, left ${bounds.left}.`;

  $("treeView").innerHTML = `<section class="sm54-viz" role="img" aria-label="${escapeHtml(summary)}">
    <div class="sm54-stages">${stages}</div>
    <div class="sm54-action"><small>${vi ? "LỚP" : "LAYER"} ${Number(view.layer || 0) + 1} · ${vi ? "DÒNG" : "LINE"} ${activeLine ?? "—"}</small><strong>${escapeHtml(pick(step.title))}</strong><span>${escapeHtml(pick(step.note))}</span></div>
    <section class="sm54-bounds"><header><strong>4 BOUNDS</strong><span>${vi ? "bao quanh vùng CHƯA duyệt" : "enclose the UNVISITED region"}</span></header><div>${boundaryCards}</div></section>
    ${operation}
    <div class="sm54-layout">
      <section class="sm54-board"><header><strong>MATRIX ${rows} × ${cols}</strong><span>${vi ? `còn ${view.remainingCount} ô` : `${view.remainingCount} remaining`}</span></header>${topEdge}<div class="sm54-board-row">${leftEdge}<div class="sm54-grid-wrap"><div class="sm54-grid" style="--sm54-cols:${cols}">${cells}</div></div>${rightEdge}</div>${bottomEdge}</section>
      <aside class="sm54-legend"><strong>${vi ? "ĐỌC KHUNG" : "READ THE FRAME"}</strong><span class="top"><i></i>TOP · →</span><span class="right"><i></i>RIGHT · ↓</span><span class="bottom"><i></i>BOTTOM · ←</span><span class="left"><i></i>LEFT · ↑</span><span class="visited"><i></i>${vi ? "đã vào result" : "already in result"}</span></aside>
    </div>
    <section class="sm54-output"><header><strong>SPIRAL OUTPUT</strong><span>${result.length}/${rows * cols}</span></header><div>${output}</div></section>
  </section>`;
}

function renderRandomizedSet380View(step) {
  const view = step.randomizedSet380View || {};
  const vi = lang === "vi";
  const phase = String(view.phase || "init");
  const values = Array.isArray(view.values) ? view.values : [];
  const entries = Array.isArray(view.mapEntries) ? view.mapEntries : [];
  const operations = Array.isArray(view.operations) ? view.operations : [];
  const results = Array.isArray(view.results) ? view.results : [];
  const display = (value) => value === null || value === undefined ? "—" : String(value);
  const phaseIndex = phase === "init" || phase === "invalid" ? 0
    : ["insert-check", "insert-reject", "remove-lookup", "remove-reject", "remove-plan"].includes(phase) ? 1
      : phase === "return" || phase === "done" ? 3 : 2;
  const phaseLabels = vi
    ? ["Khởi tạo", "Tra hashmap", "Sửa mảng + map", "Trả kết quả"]
    : ["Initialize", "Hash lookup", "Update array + map", "Return result"];
  const phases = phaseLabels.map((label, index) => {
    const state = index < phaseIndex ? "done" : index === phaseIndex ? "active" : "pending";
    return `<span class="${state}">${state === "done" ? "✓" : state === "active" ? "▶" : index + 1}<b>${escapeHtml(label)}</b></span>`;
  }).join("");
  const operationHtml = operations.map((operation, index) => {
    const state = index < view.completedOps ? "done" : index === view.activeOpIndex ? "active" : "pending";
    const result = index < view.completedOps ? results[index] : null;
    return `<span class="${state}"><small>#${index + 1}</small><b>${escapeHtml(operation)}</b><em>${state === "done" ? `→ ${escapeHtml(display(result))}` : state === "active" ? (vi ? "đang chạy" : "running") : ""}</em></span>`;
  }).join("");

  const ghostSlot = phase === "insert-map" && view.activeArrayIndex === values.length
    ? `<div class="rs380-cell ghost active"><small>[${values.length}]</small><strong>?</strong><em>${vi ? "sắp append" : "append next"}</em></div>`
    : "";
  const arrayHtml = values.map((value, index) => {
    const classes = ["rs380-cell"];
    if (index === view.activeArrayIndex) classes.push("active");
    if (index === view.lastIndex) classes.push("last");
    if (view.randomPick && index === view.randomPick.index) classes.push("random");
    return `<div class="${classes.join(" ")}"><small>[${index}]</small><strong>${escapeHtml(display(value))}</strong><em>${index === view.lastIndex ? "LAST" : index === view.activeArrayIndex ? (vi ? "ĐANG XỬ LÝ" : "ACTIVE") : ""}</em></div>`;
  }).join("") + ghostSlot;
  const mapHtml = entries.length ? entries.map((entry) => {
    const active = entry.value === view.activeValue || entry.value === view.lastValue;
    return `<div class="rs380-map-row ${active ? "active" : ""}"><strong>${escapeHtml(display(entry.value))}</strong><i>→</i><b>${escapeHtml(display(entry.index))}</b><span>values[${escapeHtml(display(entry.index))}] = ${escapeHtml(display(values[entry.index]))}</span></div>`;
  }).join("") : `<em class="rs380-empty">{ }</em>`;

  const removePhases = ["remove-plan", "remove-write-last", "remove-map-update", "remove-pop", "return"];
  const removeStage = removePhases.indexOf(phase);
  const removeBoard = phase.startsWith("remove") || (phase === "return" && view.lastValue !== null)
    ? `<section class="rs380-remove"><header><strong>SWAP-DELETE · O(1)</strong><span>${vi ? "không dịch các phần tử ở giữa" : "never shift middle elements"}</span></header><div>
        <span class="${removeStage === 0 ? "active" : removeStage > 0 ? "done" : ""}"><small>1</small><b>${vi ? "TÌM Ô" : "LOCATE"}</b><em>${display(view.activeArrayIndex)}</em></span>
        <i>→</i><span class="${removeStage === 1 ? "active" : removeStage > 1 ? "done" : ""}"><small>2</small><b>${vi ? "COPY LAST" : "COPY LAST"}</b><em>${display(view.lastValue)}</em></span>
        <i>→</i><span class="${removeStage === 2 ? "active" : removeStage > 2 ? "done" : ""}"><small>3</small><b>${vi ? "SỬA MAP" : "REPOINT MAP"}</b><em>${display(view.lastValue)} → ${display(view.activeArrayIndex)}</em></span>
        <i>→</i><span class="${removeStage >= 3 ? "active" : ""}"><small>4</small><b>POP + DELETE</b><em>O(1)</em></span>
      </div></section>`
    : "";
  const randomBoard = view.randomPick
    ? `<section class="rs380-random"><small>UNIFORM RANDOM INDEX · seed ${escapeHtml(display(view.seed))}</small><strong>randrange(${view.randomPick.length}) = ${view.randomPick.index}</strong><span>values[${view.randomPick.index}] = <b>${escapeHtml(display(view.randomPick.value))}</b></span></section>`
    : "";
  const detail = view.detail || {};
  const insertBoard = phase.startsWith("insert")
    ? `<section class="rs380-insert"><small>INSERT ${escapeHtml(display(view.activeValue))}</small><strong>${detail.exists ? (vi ? "ĐÃ TỒN TẠI → FALSE" : "ALREADY PRESENT → FALSE") : `new index = len(values) = ${escapeHtml(display(view.activeArrayIndex))}`}</strong><span>${vi ? "Hashmap chặn duplicate trước khi append." : "The hash map rejects duplicates before append."}</span></section>`
    : "";
  const resultHtml = operations.map((operation, index) => index < view.completedOps
    ? `<span><small>${escapeHtml(operation)}</small><strong>${escapeHtml(display(results[index]))}</strong></span>` : "").join("") || `<em class="rs380-empty">${vi ? "Chưa có output" : "No output yet"}</em>`;
  const activeLine = Array.isArray(step.codeLines) ? step.codeLines[0] : null;
  const summary = vi ? `RandomizedSet có ${values.length} phần tử; invariant ${view.invariantOk ? "đúng" : "đang cập nhật"}.` : `RandomizedSet has ${values.length} values; invariant ${view.invariantOk ? "holds" : "is being updated"}.`;

  $("treeView").innerHTML = `<section class="rs380-viz" role="img" aria-label="${escapeHtml(summary)}">
    <div class="rs380-phases">${phases}</div>
    <div class="rs380-action"><small>${vi ? "DÒNG" : "LINE"} ${activeLine ?? "—"}</small><strong>${escapeHtml(pick(step.title))}</strong><span>${escapeHtml(pick(step.note))}</span></div>
    <section class="rs380-operations"><header><strong>OPERATIONS</strong><span>${view.completedOps}/${operations.length} ${vi ? "hoàn tất" : "complete"}</span></header><div>${operationHtml}</div></section>
    <section class="rs380-invariant ${view.invariantOk ? "ok" : "updating"}"><strong>index[values[i]] = i</strong><span>${view.invariantOk ? (vi ? "✓ mảng và hashmap đang khớp" : "✓ array and map agree") : (vi ? "↻ trạng thái trung gian giữa hai dòng code" : "↻ intermediate state between two code lines")}</span></section>
    <div class="rs380-structures">
      <section class="rs380-array"><header><strong>DENSE ARRAY · values</strong><span>getRandom → random index</span></header><div>${arrayHtml || `<em class="rs380-empty">[ ]</em>`}</div></section>
      <section class="rs380-map"><header><strong>HASH MAP · index</strong><span>value → array index</span></header><div>${mapHtml}</div></section>
    </div>
    ${removeBoard}${randomBoard}${insertBoard}
    <section class="rs380-results"><header><strong>RETURN LOG</strong><span>True / False / random value</span></header><div>${resultHtml}</div></section>
  </section>`;
}

function renderLexSwap2948View(step) {
  const view = step.lexSwap2948View || {};
  const vi = lang === "vi";
  const phase = String(view.phase || "input");
  const original = Array.isArray(view.original) ? view.original : [];
  const sortedPairs = Array.isArray(view.sortedPairs) ? view.sortedPairs : [];
  const groups = Array.isArray(view.groups) ? view.groups : [];
  const answer = Array.isArray(view.answer) ? view.answer : [];
  const assigned = new Set(Array.isArray(view.assignedIndices) ? view.assignedIndices : []);
  const assignment = view.assignment || null;
  const phaseIndex = phase === "input" || phase === "invalid" ? 0
    : phase === "sorted" || phase === "scan-gap" ? 1
      : phase === "groups-ready" ? 2 : 3;
  const phaseLabels = vi
    ? ["Giữ index", "Tạo nhóm bằng gap", "Ghép value với index", "Đáp án"]
    : ["Keep indices", "Build groups by gap", "Pair values with indices", "Answer"];
  const stages = phaseLabels.map((label, index) => {
    const state = index < phaseIndex ? "done" : index === phaseIndex ? "active" : "pending";
    return `<span class="${state}"><small>${state === "done" ? "✓" : state === "active" ? "▶" : index + 1}</small><strong>${escapeHtml(label)}</strong></span>`;
  }).join("");
  const originalCells = original.map((value, index) => {
    const active = assignment && assignment.index === index;
    return `<span class="${active ? "active" : ""}"><small>idx ${index}</small><strong>${escapeHtml(String(value))}</strong><em>${active ? (vi ? "đích đang gán" : "assignment target") : "original"}</em></span>`;
  }).join("");
  const sortedLane = sortedPairs.map((pair, position) => {
    const isScan = view.scanIndex === position;
    const revealed = position <= Number(view.revealedThrough);
    const groupClass = revealed ? `g${pair.group % 6}` : "unrevealed";
    const previous = sortedPairs[position - 1];
    const gap = previous ? pair.value - previous.value : null;
    const gapState = isScan ? (view.sameGroup ? "pass active" : "break active") : revealed && position > 0 ? (pair.group === previous.group ? "pass" : "break") : "";
    const connector = position > 0 ? `<i class="lsa2948-gap ${gapState}"><b>Δ ${gap}</b><small>${isScan ? (view.sameGroup ? `≤ ${view.limit}` : `> ${view.limit}`) : ""}</small></i>` : "";
    return `${connector}<span class="lsa2948-pair ${groupClass} ${isScan ? "active" : ""}"><small>sorted[${position}]</small><strong>${escapeHtml(String(pair.value))}</strong><em>from idx ${pair.index}</em><b>G${pair.group + 1}</b></span>`;
  }).join("");
  const groupHtml = groups.map((group) => {
    const active = view.activeGroup === group.id;
    const visible = phaseIndex >= 2 || phase === "scan-gap" && group.end <= Number(view.revealedThrough);
    return `<article class="lsa2948-group g${group.id % 6} ${active ? "active" : ""} ${visible ? "" : "muted"}">
      <header><strong>GROUP ${group.id + 1}</strong><span>${group.values.length} ${vi ? "phần tử" : "value(s)"}</span></header>
      <div><small>${vi ? "VALUES ĐÃ SORT" : "SORTED VALUES"}</small><b>[${group.values.map((value) => escapeHtml(String(value))).join(", ")}]</b></div>
      <div><small>${vi ? "INDICES ĐÃ SORT" : "SORTED INDICES"}</small><b>[${group.indices.join(", ")}]</b></div>
    </article>`;
  }).join("");
  const resultCells = original.map((_, index) => {
    const value = answer[index];
    const active = assignment && assignment.index === index;
    const filled = assigned.has(index);
    return `<span class="${filled ? "filled" : ""} ${active ? "active" : ""}"><small>idx ${index}</small><strong>${value === null || value === undefined ? "_" : escapeHtml(String(value))}</strong><em>${active ? `← ${escapeHtml(String(assignment.value))}` : filled ? "fixed" : (vi ? "chưa gán" : "pending")}</em></span>`;
  }).join("");
  const gapBoard = phase === "scan-gap"
    ? `<section class="lsa2948-decision ${view.sameGroup ? "pass" : "break"}"><small>${vi ? "KIỂM TRA RANH GIỚI" : "BOUNDARY CHECK"}</small><strong>${sortedPairs[view.scanIndex]?.value} - ${sortedPairs[view.scanIndex - 1]?.value} = ${view.gap}</strong><span>${view.sameGroup ? `≤ limit ${view.limit} · ${vi ? "nối cùng nhóm" : "connect"}` : `> limit ${view.limit} · ${vi ? "cắt sang nhóm mới" : "split"}`}</span></section>`
    : "";
  const assignmentBoard = assignment
    ? `<section class="lsa2948-assignment"><span><small>${vi ? "VALUE NHỎ THỨ" : "VALUE RANK"} ${assignment.rank + 1}</small><strong>${escapeHtml(String(assignment.value))}</strong></span><i>→</i><span><small>GROUP ${assignment.group + 1}</small><strong>${vi ? "có thể swap tự do" : "freely swappable"}</strong></span><i>→</i><span><small>${vi ? "INDEX NHỎ THỨ" : "INDEX RANK"} ${assignment.rank + 1}</small><strong>${assignment.index}</strong></span></section>`
    : "";
  const activeLine = Array.isArray(step.codeLines) ? step.codeLines[0] : null;
  const summary = vi
    ? `Bài 2948: ${groups.length} nhóm hoán đổi, đã gán ${assigned.size}/${original.length} vị trí.`
    : `Problem 2948: ${groups.length} swap groups, ${assigned.size}/${original.length} positions assigned.`;

  $("treeView").innerHTML = `<section class="lsa2948-viz" role="img" aria-label="${escapeHtml(summary)}">
    <div class="lsa2948-stages">${stages}</div>
    <div class="lsa2948-action"><small>${vi ? "DÒNG" : "LINE"} ${activeLine ?? "—"}</small><strong>${escapeHtml(pick(step.title))}</strong><span>${escapeHtml(pick(step.note))}</span></div>
    <section class="lsa2948-rule"><strong>|a - b| ≤ limit</strong><span>${vi ? "Gap kề nhau nối thành component nhờ tính bắc cầu" : "Adjacent gaps create a component through transitivity"}</span><b>limit = ${escapeHtml(String(view.limit))}</b></section>
    <section class="lsa2948-row"><header><strong>ORIGINAL · value + index</strong><span>${vi ? "index không bị mất khi sort" : "indices survive sorting"}</span></header><div style="--lsa2948-count:${original.length}">${originalCells}</div></section>
    <section class="lsa2948-sorted"><header><strong>SORT BY VALUE</strong><span>${vi ? "đọc gap từ trái sang phải" : "scan gaps left to right"}</span></header><div>${sortedLane}</div></section>
    ${gapBoard}
    <section class="lsa2948-groups"><header><strong>SWAP COMPONENTS</strong><span>${vi ? "value nhỏ ↔ index nhỏ" : "small value ↔ small index"}</span></header><div>${groupHtml}</div></section>
    ${assignmentBoard}
    <section class="lsa2948-row result"><header><strong>LEXICOGRAPHIC RESULT</strong><span>${assigned.size}/${original.length} ${vi ? "vị trí đã gán" : "assigned"}</span></header><div style="--lsa2948-count:${original.length}">${resultCells}</div></section>
  </section>`;
}

function renderRandomizedCollection381View(step) {
  const view = step.randomizedCollection381View || {};
  const vi = lang === "vi";
  const phase = String(view.phase || "init");
  const values = Array.isArray(view.values) ? view.values : [];
  const entries = Array.isArray(view.indexEntries) ? view.indexEntries : [];
  const probabilities = Array.isArray(view.probabilities) ? view.probabilities : [];
  const operations = Array.isArray(view.operations) ? view.operations : [];
  const results = Array.isArray(view.results) ? view.results : [];
  const detail = view.detail || {};
  const needsSwap = detail.needsSwap !== undefined
    ? detail.needsSwap
    : detail.removeIndex !== undefined && detail.lastIndex !== undefined
      ? detail.removeIndex !== detail.lastIndex
      : null;
  const display = (value) => value === null || value === undefined ? "—" : String(value);
  const phaseIndex = phase === "init" || phase === "invalid" ? 0
    : ["insert-check", "remove-lookup", "remove-reject", "remove-take-index", "remove-plan"].includes(phase) ? 1
      : phase === "return" || phase === "done" ? 3 : 2;
  const phaseLabels = vi
    ? ["Khởi tạo", "Chọn occurrence", "Sửa array + index sets", "Trả kết quả"]
    : ["Initialize", "Choose occurrence", "Update array + index sets", "Return result"];
  const phases = phaseLabels.map((label, index) => {
    const state = index < phaseIndex ? "done" : index === phaseIndex ? "active" : "pending";
    return `<span class="${state}">${state === "done" ? "✓" : state === "active" ? "▶" : index + 1}<b>${escapeHtml(label)}</b></span>`;
  }).join("");
  const operationHtml = operations.map((operation, index) => {
    const state = index < view.completedOps ? "done" : index === view.activeOpIndex ? "active" : "pending";
    const result = index < view.completedOps ? results[index] : null;
    return `<span class="${state}"><small>#${index + 1}</small><b>${escapeHtml(operation)}</b><em>${state === "done" ? `→ ${escapeHtml(display(result))}` : state === "active" ? (vi ? "đang chạy" : "running") : ""}</em></span>`;
  }).join("");

  const ghostSlot = phase === "insert-index" && view.activeArrayIndex === values.length
    ? `<div class="rs380-cell ghost active"><small>[${values.length}]</small><strong>?</strong><em>${vi ? "sắp append" : "append next"}</em></div>`
    : "";
  const arrayHtml = values.map((value, index) => {
    const classes = ["rs380-cell"];
    if (index === view.activeArrayIndex) classes.push("active");
    if (index === view.lastIndex) classes.push("last");
    if (view.randomPick && index === view.randomPick.index) classes.push("random");
    const occurrence = values.slice(0, index + 1).filter((item) => item === value).length;
    return `<div class="${classes.join(" ")}"><small>[${index}]</small><strong>${escapeHtml(display(value))}</strong><em>occurrence #${occurrence}${index === view.lastIndex ? " · LAST" : ""}</em></div>`;
  }).join("") + ghostSlot;
  const mapHtml = entries.length ? entries.map((entry) => {
    const active = entry.value === view.activeValue || entry.value === view.lastValue;
    const slots = Array.isArray(entry.indices) ? entry.indices : [];
    const checks = slots.map((index) => `values[${index}]=${display(values[index])}`).join(" · ") || (vi ? "set tạm rỗng" : "temporarily empty set");
    return `<div class="rc381-map-row ${active ? "active" : ""}"><strong>${escapeHtml(display(entry.value))}</strong><i>→</i><b>{${slots.map((index) => escapeHtml(display(index))).join(", ")}}</b><span>${escapeHtml(checks)}</span></div>`;
  }).join("") : `<em class="rs380-empty">{ }</em>`;
  const probabilityHtml = probabilities.length ? probabilities.map((entry) => {
    const ratio = entry.total ? entry.count / entry.total : 0;
    return `<span class="${entry.value === view.activeValue ? "active" : ""}"><small>VALUE ${escapeHtml(display(entry.value))}</small><strong>${entry.count}/${entry.total}</strong><em>${Math.round(ratio * 100)}%</em><i style="--rc381-prob:${ratio}"></i></span>`;
  }).join("") : `<em class="rs380-empty">${vi ? "Collection rỗng" : "Empty collection"}</em>`;

  const removePhases = ["remove-take-index", "remove-plan", "remove-copy-last", "remove-index-old", "remove-index-new", "remove-no-swap", "remove-pop", "remove-clean-key", "remove-keep-key", "return"];
  const removeStageRaw = removePhases.indexOf(phase);
  const removeStage = removeStageRaw < 0 ? -1
    : removeStageRaw <= 1 ? removeStageRaw
      : removeStageRaw === 2 ? 2
        : removeStageRaw <= 4 ? 3
          : removeStageRaw === 5 ? 3
            : removeStageRaw === 6 ? 4 : 5;
  const isRemoveReturn = phase === "return" && detail.removeIndex !== undefined;
  const removeBoard = phase.startsWith("remove") || isRemoveReturn
    ? `<section class="rc381-remove"><header><strong>REMOVE ONE OCCURRENCE · SWAP-DELETE</strong><span>${vi ? "không splice, không dịch mảng" : "no splice and no array shifting"}</span></header><div>
        <span class="${removeStage === 0 ? "active" : removeStage > 0 ? "done" : ""}"><small>1</small><b>${vi ? "LẤY INDEX" : "TAKE INDEX"}</b><em>${display(detail.removeIndex)}</em></span>
        <span class="${removeStage === 1 ? "active" : removeStage > 1 ? "done" : ""}"><small>2</small><b>${vi ? "ĐỌC LAST" : "READ LAST"}</b><em>${display(view.lastValue)} @ ${display(view.lastIndex)}</em></span>
        <span class="${removeStage === 2 ? "active" : removeStage > 2 ? "done" : ""}"><small>3</small><b>${vi ? "LẤP LỖ" : "FILL HOLE"}</b><em>${needsSwap === true ? `${display(view.lastValue)} → ${display(detail.removeIndex)}` : needsSwap === false ? "SKIP" : "—"}</em></span>
        <span class="${removeStage === 3 ? "active" : removeStage > 3 ? "done" : ""}"><small>4</small><b>${vi ? "CHUYỂN INDEX" : "MOVE INDEX"}</b><em>${needsSwap === true ? `${display(view.lastIndex)} → ${display(detail.removeIndex)}` : needsSwap === false ? "SKIP" : "—"}</em></span>
        <span class="${removeStage === 4 ? "active" : removeStage > 4 ? "done" : ""}"><small>5</small><b>POP LAST</b><em>O(1)</em></span>
        <span class="${removeStage >= 5 ? "active" : ""}"><small>6</small><b>${vi ? "DỌN KEY RỖNG" : "CLEAN EMPTY KEY"}</b><em>${detail.keyDeleted === true ? "DELETE" : detail.keyDeleted === false ? "KEEP" : "CHECK"}</em></span>
      </div></section>`
    : "";
  const randomBoard = view.randomPick
    ? `<section class="rs380-random"><small>UNIFORM OCCURRENCE INDEX · seed ${escapeHtml(display(view.seed))}</small><strong>randrange(${view.randomPick.length}) = ${view.randomPick.index}</strong><span>values[${view.randomPick.index}] = <b>${escapeHtml(display(view.randomPick.value))}</b></span></section>`
    : "";
  const insertBoard = phase.startsWith("insert") || (phase === "return" && detail.isNew !== undefined)
    ? `<section class="rs380-insert"><small>INSERT ${escapeHtml(display(view.activeValue))} · DUPLICATES ALLOWED</small><strong>${detail.isNew ? (vi ? "CHƯA CÓ → RETURN TRUE" : "ABSENT → RETURN TRUE") : (vi ? "ĐÃ CÓ → VẪN APPEND, RETURN FALSE" : "PRESENT → APPEND ANYWAY, RETURN FALSE")}</strong><span>${vi ? "Return cho biết value có mới hay không, không cho biết insert có xảy ra hay không." : "The return value reports whether val was new, not whether insertion happened."}</span></section>`
    : "";
  const resultHtml = operations.map((operation, index) => index < view.completedOps
    ? `<span><small>${escapeHtml(operation)}</small><strong>${escapeHtml(display(results[index]))}</strong></span>` : "").join("") || `<em class="rs380-empty">${vi ? "Chưa có output" : "No output yet"}</em>`;
  const activeLine = Array.isArray(step.codeLines) ? step.codeLines[0] : null;
  const summary = vi ? `RandomizedCollection có ${values.length} occurrence; invariant ${view.invariantOk ? "đúng" : "đang cập nhật"}.` : `RandomizedCollection has ${values.length} occurrences; invariant ${view.invariantOk ? "holds" : "is being updated"}.`;

  $("treeView").innerHTML = `<section class="rs380-viz rc381-viz" role="img" aria-label="${escapeHtml(summary)}">
    <div class="rs380-phases">${phases}</div>
    <div class="rs380-action"><small>${vi ? "DÒNG" : "LINE"} ${activeLine ?? "—"}</small><strong>${escapeHtml(pick(step.title))}</strong><span>${escapeHtml(pick(step.note))}</span></div>
    <section class="rs380-operations"><header><strong>OPERATIONS</strong><span>${view.completedOps}/${operations.length} ${vi ? "hoàn tất" : "complete"}</span></header><div>${operationHtml}</div></section>
    <section class="rs380-invariant ${view.invariantOk ? "ok" : "updating"}"><strong>i ∈ indices[values[i]]</strong><span>${view.invariantOk ? (vi ? "✓ mọi occurrence và index set khớp hai chiều" : "✓ every occurrence and index set agree both ways") : (vi ? "↻ trạng thái trung gian của swap-delete" : "↻ intermediate swap-delete state")}</span></section>
    <div class="rs380-structures">
      <section class="rs380-array"><header><strong>DENSE ARRAY · values</strong><span>${values.length} ${vi ? "occurrence" : "occurrence(s)"}</span></header><div>${arrayHtml || `<em class="rs380-empty">[ ]</em>`}</div></section>
      <section class="rs380-map rc381-map"><header><strong>HASH MAP · indices</strong><span>value → set of array indices</span></header><div>${mapHtml}</div></section>
    </div>
    <section class="rc381-probability"><header><strong>${vi ? "XÁC SUẤT THEO OCCURRENCE" : "OCCURRENCE-WEIGHTED PROBABILITY"}</strong><span>${vi ? "mỗi ô values có cùng xác suất" : "every values slot is equally likely"}</span></header><div>${probabilityHtml}</div></section>
    ${removeBoard}${randomBoard}${insertBoard}
    <section class="rs380-results"><header><strong>RETURN LOG</strong><span>True / False / random value</span></header><div>${resultHtml}</div></section>
  </section>`;
}

// ---- Remove Boxes visualization (bai 546) ----
// Replays the memoised interval DP dfs in true execution order: box row with
// the active window and k phantom boxes, live call stack, option chips and
// memo statistics.
function renderRemoveBoxes546View(step) {
  const view = step.removeBoxes546View || {};
  const el = $("treeView");
  const vi = lang === "vi";
  const event = String(view.event || "init");
  const boxes = Array.isArray(view.boxes) ? view.boxes : [];
  const l = Number.isInteger(view.l) ? view.l : null;
  const r = Number.isInteger(view.r) ? view.r : null;
  const k = Number.isInteger(view.k) ? view.k : null;
  const curM = Number.isInteger(view.curM) ? view.curM : null;
  const matchMs = Array.isArray(view.matchMs) ? view.matchMs : [];
  const options = Array.isArray(view.options) ? view.options : [];
  const stack = Array.isArray(view.stack) ? view.stack : [];
  const bestValue = options.length ? Math.max(...options.map((o) => o.value)) : null;

  // ---- phase header ----
  const phaseLabels = vi
    ? ["Gọi dp(l,r,k)", "Quét vị trí cùng màu", "Đánh giá phương án", "Lưu memo & trả"]
    : ["Call dp(l,r,k)", "Scan matching spots", "Score the options", "Memoise & return"];
  let phaseIndex = -1;
  if (event === "enter") phaseIndex = 0;
  else if (event === "scan-matches") phaseIndex = 1;
  else if (event === "option-direct" || event === "option-split") phaseIndex = 2;
  else if (["memo-store", "memo-hit", "base-return"].includes(event)) phaseIndex = 3;
  else if (event === "done") phaseIndex = 4;
  const phases = phaseLabels.map((label, index) => {
    const state = index < phaseIndex ? "done" : index === phaseIndex ? "active" : "pending";
    return `<span class="${state}">${state === "done" ? "✓" : state === "active" ? "▶" : "○"} ${escapeHtml(label)}</span>`;
  }).join("");

  // ---- box row ----
  const boxHtml = (value, idx, extraClass) => `<div class="rb546-box ${extraClass}"><small>${idx}</small><b>${value}</b></div>`;
  let rowHtml = "";
  if (k !== null && k > 0 && l !== null && !["init", "done", "invalid"].includes(event)) {
    rowHtml += `<div class="rb546-ghosts"><span class="rb546-ghost">×${k}</span><i>+</i></div>`;
  }
  rowHtml += boxes.map((value, idx) => {
    const inWindow = l !== null && r !== null && idx >= l && idx <= r;
    const isCurM = idx === curM && event === "option-split";
    const classes = [
      "cell",
      `c${Math.abs(value) % 6}`,
      inWindow ? "" : "out",
      idx === l && inWindow ? "anchor" : "",
      isCurM ? "merge" : "",
      event === "option-split" && curM !== null && idx > l && idx < curM && inWindow ? "mid-clear" : "",
    ].filter(Boolean).join(" ");
    return boxHtml(value, idx, classes);
  }).join("");
  const rowWrap = `<section class="rb546-row-wrap"><header>
      <strong>${vi ? "HÀNG HỘP" : "BOX ROW"} · ${boxes.length}</strong>
      <span>${vi ? "mờ = ngoài đoạn đang xét · ×k = hộp ảo bên trái" : "dim = outside range · ×k = phantom left boxes"}</span>
    </header><div class="rb546-row">${rowHtml}</div></section>`;

  // ---- call stack ----
  const stackHtml = `<section class="rb546-stack"><header><strong>${vi ? "NGĂN XẾP ĐỆ QUY" : "CALL STACK"}</strong><span>${vi ? "đáy → đỉnh" : "bottom → top"}</span></header>
    <div>${stack.map((frame, i) => `
      <div class="rb546-frame${i === stack.length - 1 ? " current" : ""}"><em>L${i}</em>dp(${frame.l}, ${frame.r}, ${frame.k})</div>`).join("") || `<em class="rb546-empty">(trống)</em>`}
    </div></section>`;

  // ---- action card ----
  const optSummary = options.length
    ? `${vi ? "phương án tốt nhất" : "best option"}: ${options.reduce((a, b) => (b.value > a.value ? b : a)).label} = ${bestValue}`
    : "";
  let actText = "";
  switch (event) {
    case "init":
      actText = { tag: "START", text: `dp(0, ${boxes.length - 1}, 0)`, sub: vi ? "Bắt đầu từ toàn bộ hàng hộp, không có hộp ảo nào." : "Start from the full row with zero phantoms." };
      break;
    case "enter":
      actText = { tag: "CALL", text: `dp(${l}, ${r}, ${k}) · colour ${view.color}`, sub: vi ? `Có ${k} hộp màu ${view.color} dính ngoài trái đoạn.` : `${k} colour-${view.color} boxes hang off the left edge.` };
      break;
    case "base-return":
      actText = { tag: "BASE", text: "l > r → return 0", sub: vi ? "Đoạn rỗng không có điểm." : "An empty range scores nothing." };
      break;
    case "memo-hit":
      actText = { tag: "MEMO HIT", text: `dp(${l}, ${r}, ${k}) → ${view.returnValue}`, sub: vi ? "Trạng thái đã tính; trả ngay khỏi duyệt lại." : "Already solved; reuse the cached value." };
      break;
    case "scan-matches":
      actText = { tag: vi ? "QUÉT" : "SCAN", text: `m ∈ {${matchMs.join(", ")}}`, sub: vi ? "Vị trí cùng màu cho phép hoãn gỡ để gộp lớn hơn." : "Matching colours allow postponing the removal to merge bigger." };
      break;
    case "option-direct": {
      const sq = (k + 1) * (k + 1);
      actText = { tag: vi ? "PHƯƠNG ÁN GỠ NGAY" : "REMOVE NOW", text: `(${k + 1})² = ${sq} + rest → ${bestValue}`, sub: vi ? "Xoá nhóm hiện tại cộng hộp ảo trong một nước." : "Clear the current run plus phantoms in one strike." };
      break;
    }
    case "option-split":
      actText = { tag: `${vi ? "GỘP TẠI" : "ATTACH"} m=${curM}`, text: `middle + merged → ${options.length ? options[options.length - 1].value : "?"}`, sub: vi ? `Dọn giữa để boxes[${l}] & boxes[${curM}] thành một khối.` : `Clear between so boxes[${l}] and boxes[${curM}] fuse into one block.` };
      break;
    case "memo-store":
      actText = { tag: "MEMOISE", text: `memo[(${l},${r},${k})] = ${view.returnValue}`, sub: optSummary };
      break;
    case "done":
      actText = { tag: "ANSWER", text: String(view.answer ?? ""), sub: vi ? "Tổng điểm lớn nhất gỡ sạch hàng hộp." : "The maximum score to clear the whole row." };
      break;
    default:
      actText = { tag: event.toUpperCase(), text: pick(step.title), sub: pick(step.note) };
  }

  // ---- option chips ----
  const optionsHtml = options.length
    ? `<div class="rb546-options">${options.map((option) => `
        <span class="rb546-option${option.value === bestValue ? " best" : ""}${option.label.startsWith("remove") ? " direct" : " split"}">
          <small>${escapeHtml(option.label)}</small><b>${option.value}</b>
        </span>`).join("")}</div>`
    : "";

  el.innerHTML = `<section class="rb546-viz">
    <div class="rb546-phases">${phases}</div>
    <div class="rb546-top">
      <div class="rb546-left">
        ${rowWrap}
        <div class="rb546-action"><small>${escapeHtml(actText.tag)}</small><strong>${escapeHtml(actText.text)}</strong><span>${escapeHtml(actText.sub)}</span></div>
        ${optionsHtml}
      </div>
      ${stackHtml}
    </div>
    <div class="rb546-stats">
      <span><small>${vi ? "memo đã lưu" : "states stored"}</small><strong>${view.memoCount ?? 0}</strong></span>
      <span><small>${vi ? "lần trúng memo" : "memo hits"}</small><strong>${view.memoHits ?? 0}</strong></span>
      <span><small>${vi ? "độ sâu đệ quy" : "recursion depth"}</small><strong>${view.depth ?? 0}</strong></span>
      <span class="ans"><small>${vi ? "đáp án" : "answer"}</small><strong>${view.answer ?? "…"}</strong></span>
    </div>
  </section>`;
}

// ---- Max Points on a Line visualization (bai 149) ----
// Plots every point on an aspect-locked grid, then walks the anchor rounds:
// dashed ray to the scanned point, canonical-slope card, bucket chips and the
// densest line glowing through each anchor.
function renderMaxPoints149View(step) {
  const view = step.maxPoints149View || {};
  const el = $("treeView");
  const vi = lang === "vi";
  const event = String(view.event || "setup");
  const points = Array.isArray(view.points) ? view.points : [];
  const n = points.length;
  const anchorIdx = Number.isInteger(view.anchorIdx) ? view.anchorIdx : null;
  const scanIdx = Number.isInteger(view.scanIdx) ? view.scanIdx : null;
  const scannedSet = new Set(Array.isArray(view.scanned) ? view.scanned : []);
  const collinearSet = new Set(Array.isArray(view.collinear) ? view.collinear : []);
  const buckets = Array.isArray(view.buckets) ? view.buckets.slice(0, 8) : [];
  const key = view.key != null ? String(view.key) : null;

  // ---- phase header ----
  const phaseLabels = vi
    ? ["Chọn điểm gốc", "Tính dy / dx", "Chuẩn hoá slope", "Đếm & kết luận"]
    : ["Pick anchor", "Compute dy / dx", "Reduce slope", "Count & conclude"];
  let phaseIndex = -1;
  if (["anchor-start", "skip-self"].includes(event)) phaseIndex = 0;
  else if (event === "deltas") phaseIndex = 1;
  else if (["gcd-reduce", "canonical", "duplicate"].includes(event)) phaseIndex = 2;
  else if (["bucket-add", "round-best", "best-update"].includes(event)) phaseIndex = 3;
  else if (event === "done") phaseIndex = 4;
  const phases = phaseLabels.map((label, index) => {
    const state = index < phaseIndex ? "done" : index === phaseIndex ? "active" : "pending";
    return `<span class="${state}">${state === "done" ? "✓" : state === "active" ? "▶" : "○"} ${escapeHtml(label)}</span>`;
  }).join("");

  // ---- plot geometry (aspect-locked so angles stay true) ----
  const xs = points.map((pt) => pt[0]);
  const ys = points.map((pt) => pt[1]);
  const minX = Math.min(...xs), maxX = Math.max(...xs);
  const minY = Math.min(...ys), maxY = Math.max(...ys);
  const padX = Math.max(2, (maxX - minX) * 0.14);
  const padY = Math.max(2, (maxY - minY) * 0.14);
  const spanX = (maxX - minX) + padX * 2 || 1;
  const spanY = (maxY - minY) + padY * 2 || 1;
  const ux = 100 / spanX;
  const uy = 100 / spanY;
  const leftOf = (x) => ((x - minX) + padX) * ux;
  const topOf = (y) => ((maxY + padY) - y) * uy;

  const dotsHtml = points.map((pt, idx) => {
    const classes = ["mp149-dot"];
    if (idx === anchorIdx) classes.push("anchor");
    if (idx === scanIdx) classes.push("scan");
    else if (scannedSet.has(idx)) classes.push("scanned");
    if (collinearSet.has(idx) && idx !== anchorIdx && idx !== scanIdx && !scannedSet.has(idx)) classes.push("collinear");
    return `<div class="${classes.join(" ")}" style="left:${leftOf(pt[0])}%;top:${topOf(pt[1])}%" title="(${pt[0]}, ${pt[1]})"><b>${idx}</b><small>(${pt[0]},${pt[1]})</small></div>`;
  }).join("");

  const segHtml = [];
  if (anchorIdx !== null && scanIdx !== null && ["deltas", "gcd-reduce", "canonical", "bucket-add"].includes(event)) {
    const [x1, y1] = points[anchorIdx];
    const [x2, y2] = points[scanIdx];
    const dxU = x2 - x1, dyU = y2 - y1;
    const lenPct = Math.hypot(dxU, dyU) * ux;
    const angle = Math.atan2(-dyU * uy, dxU * ux);
    segHtml.push(`<div class="mp149-segline ray" style="left:${leftOf(x1)}%;top:${topOf(y1)}%;width:${lenPct}%;transform:rotate(${angle}rad)"></div>`);
  }
  const lineKey = view.localBest && view.localBest.key ? view.localBest.key : null;
  const showWinningLine = ["round-best", "best-update"].includes(event) && lineKey;
  const showFinalLine = event === "done" && view.globalBest && Number.isInteger(view.globalBest.anchorIdx);
  if (showWinningLine || showFinalLine) {
    const srcAnchor = showFinalLine ? view.globalBest.anchorIdx : anchorIdx;
    const dirKey = showFinalLine
      ? (points.length && view.globalBest.lineKey ? view.globalBest.lineKey : null)
      : lineKey;
    if (dirKey) {
      const [aRaw, bRaw] = dirKey.split("/").map(Number);
      const dxU = bRaw === 0 ? 0 : bRaw;
      const dyU = bRaw === 0 ? 1 : aRaw;
      const lenPct = spanX * ux;
      const angle = Math.atan2(-dyU * uy, dxU * ux);
      segHtml.push(`<div class="mp149-segline winning" style="left:${leftOf(points[srcAnchor][0])}%;top:${topOf(points[srcAnchor][1])}%;width:${lenPct}%;transform:translate(-50%, -50%) rotate(${angle}rad)"></div>`);
    } else if (collinearSet.size >= 2) {
      const list = [...collinearSet];
      const [x1, y1] = points[list[0]];
      const [x2, y2] = points[list[list.length - 1]];
      const dxU = x2 - x1 || 1e-9, dyU = y2 - y1 || 1e-9;
      const lenPct = Math.hypot(dxU, dyU) * ux;
      const angle = Math.atan2(-dyU * uy, dxU * ux);
      segHtml.push(`<div class="mp149-segline winning" style="left:${leftOf(x1)}%;top:${topOf(y1)}%;width:${lenPct}%;transform-origin:0 0;transform:rotate(${angle}rad)"></div>`);
    }
  }

  const plotHtml = `<section class="mp149-plot-wrap">
    <header><strong>${vi ? "MẶT PHẲNG ĐIỂM" : "POINT PLANE"}</strong><span>${n} ${vi ? "điểm · tỉ lệ trục giữ nguyên" : "points · axes share one scale"}</span></header>
    <div class="mp149-plot" style="aspect-ratio:${spanX}/${spanY}">
      <i class="mp149-axis mp149-axis-x"></i><i class="mp149-axis mp149-axis-y"></i>
      ${segHtml.join("")}
      ${dotsHtml}
    </div>
  </section>`;

  // ---- slope computation card ----
  let slopeHtml = "";
  if (view.dy != null && view.dx != null && anchorIdx !== null && scanIdx !== null) {
    const branchNote =
      view.b === 0 ? { vi: "dx = 0 → key đứng đặc biệt (1, 0)", en: "dx = 0 → special vertical key (1, 0)" }
        : view.a === 0 ? { vi: "dy = 0 → key ngang đặc biệt (0, 1)", en: "dy = 0 → special horizontal key (0, 1)" }
          : { vi: "chia GCD rồi thống nhất dấu để hướng gộp đúng bucket", en: "divide by GCD then normalize signs so equal directions merge" };
    slopeHtml = `<section class="mp149-slope ${event === "bucket-add" ? "counted" : ""}">
      <header><strong>${vi ? "HỆ SỐ GÓC" : "SLOPE"} · P<sub>${anchorIdx}</sub>→P<sub>${scanIdx}</sub></strong><span>${escapeHtml(pick(branchNote))}</span></header>
      <div class="mp149-formula">
        <span><small>dy</small><b>${view.dy}</b></span>
        <span><small>dx</small><b>${view.dx}</b></span>
        <span><small>gcd</small><b>${view.g != null ? view.g : "—"}</b></span>
        <span><small>(a, b)</small><b>${view.a != null && view.b != null ? `(${view.a}, ${view.b})` : "—"}</b></span>
        <span class="key"><small>key</small><b>${key != null ? `"${key}"` : "…"}</b></span>
      </div>
    </section>`;
  }

  // ---- bucket chips ----
  const bucketsHtml = buckets.length
    ? `<section class="mp149-buckets"><header><strong>SLOPES{}</strong><span>${vi ? "cùng gốc ⇒ cùng bucket ⇒ thẳng hàng" : "one anchor ⇒ same bucket ⇒ collinear"}</span></header><div>${
      buckets.map((bk) => `<span class="mp149-bucket${bk.key === key ? " active" : ""}${bk.key === (view.localBest && view.localBest.key) ? " best" : ""}"><small>"${escapeHtml(bk.key)}"</small><b>×${bk.count}</b></span>`).join("")
    }</div></section>`
    : "";

  // ---- summary cards ----
  const dupChip = view.duplicateCount > 0
    ? `<span class="mp149-dup">${vi ? "trùng gốc" : "duplicates"} ×${view.duplicateCount}</span>` : "";
  const localCard = view.localBest
    ? `<span class="mp149-stat local"><small>${vi ? "ĐƯỜNG DÀY NHẤT QUA GỐC" : "DENSEST LINE VIA ANCHOR"} P${anchorIdx}</small><strong>"${escapeHtml(view.localBest.key)}" → ${view.localBest.count} ${vi ? "điểm" : "pts"}</strong></span>`
    : `<span class="mp149-stat"><small>${vi ? "VÒNG GỐC" : "ANCHOR ROUND"}</small><strong>${anchorIdx !== null ? `P${anchorIdx} ${fmtSafe(anchorIdx, points)}` : "—"}</strong></span>`;
  const globalCard = view.globalBest
    ? `<span class="mp149-stat global${event === "best-update" || event === "done" ? " hit" : ""}"><small>BEST</small><strong>${view.globalBest.count} ${vi ? "điểm" : "pts"}</strong><em>P${view.globalBest.anchorIdx ?? "?"}</em></span>`
    : "";

  // ---- action box ----
  const actionMap = {
    setup: { tag: "SETUP", text: `n = ${n}`, sub: vi ? "Mỗi vòng chọn một điểm làm gốc và băm mọi tia ra theo slope." : "Each round picks one anchor and hashes every outgoing ray by slope." },
    invalid: { tag: "INVALID", text: vi ? "Input không hợp lệ" : "Invalid input", sub: vi ? "Dạng đúng: x,y; x,y; ... tối đa 10 điểm." : "Expected: x,y; x,y; ... with up to 10 points." },
    "init-best": { tag: "INIT", text: "best = 1", sub: vi ? "Một điểm luôn nằm trên ít nhất một đường thẳng." : "A single point always lies on some line." },
    "anchor-start": { tag: vi ? "GỐC MỚI" : "NEW ANCHOR", text: `i = ${anchorIdx} · P${anchorIdx}${anchorIdx !== null ? fmtSafe(anchorIdx, points) : ""}`, sub: vi ? "Reset slopes{} và duplicates cho vòng này." : "Reset slopes{} and duplicates for this round." },
    "skip-self": { tag: "SKIP", text: `j == i == ${scanIdx}`, sub: vi ? "Tia từ điểm tới chính nó không có hướng." : "A self-ray has no direction." },
    deltas: { tag: "Δ", text: `dy=${view.dy}, dx=${view.dx}`, sub: vi ? "Vector chỉ phương thô tới P" + scanIdx + "." : "Raw direction vector toward P" + scanIdx + "." },
    duplicate: { tag: vi ? "TRÙNG ĐIỂM" : "COINCIDENT", text: `duplicates = ${view.duplicateCount}`, sub: vi ? "Nằm trên mọi đường qua gốc nên cộng thẳng vào tổng." : "Lies on every line through the anchor; added straight to the tally." },
    "gcd-reduce": { tag: "REDUCE", text: `gcd=${view.g} → (${view.a}, ${view.b})`, sub: vi ? "(2,4) và (1,2) phải chung bucket." : "(2,4) and (1,2) must share a bucket." },
    canonical: { tag: "CANONICAL", text: `(${view.a}, ${view.b})`, sub: vi ? "Dấu chuẩn hoá; đứng (1,0), ngang (0,1)." : "Signs normalized; vertical (1,0), horizontal (0,1)." },
    "bucket-add": { tag: "COUNT", text: `slopes["${key}"]++`, sub: vi ? `${view.buckets.find((bk) => bk.key === key)?.count ?? "?"} tia cùng hướng qua gốc.` : `${view.buckets.find((bk) => bk.key === key)?.count ?? "?"} rays share this direction.` },
    "round-best": { tag: vi ? "KẾT VÒNG" : "ROUND BEST", text: view.localBest ? `"${view.localBest.key}" → ${view.localBest.count}` : "", sub: vi ? "Bucket lớn nhất + trùng + chính gốc." : "Largest bucket + duplicates + the anchor itself." },
    "best-update": { tag: "BEST ↑", text: `best = ${view.globalBest ? view.globalBest.count : ""}`, sub: vi ? "Kỷ lục toàn cục vừa bị phá." : "The global record was just broken." },
    done: { tag: "ANSWER", text: `${view.globalBest ? view.globalBest.count : ""}`, sub: vi ? "O(n²): mỗi cặp (gốc, điểm) xử lý đúng một lần với băm slope." : "O(n²): every (anchor, point) pair handled once with slope hashing." },
  };
  const act = actionMap[event] || { tag: event.toUpperCase(), text: pick(step.title), sub: pick(step.note) };

  const legendHtml = `<span><i class="lg-anchor"></i>${vi ? "điểm gốc i" : "anchor i"}</span><span><i class="lg-scan"></i>${vi ? "đang xét j" : "scanning j"}</span><span><i class="lg-scanned"></i>${vi ? "đã xét trong vòng" : "processed this round"}</span><span><i class="lg-coll"></i>${vi ? "thẳng hàng với đường thắng" : "on the winning line"}</span>`;

  el.innerHTML = `<section class="mp149-viz">
    <div class="mp149-phases">${phases}</div>
    <div class="mp149-top">
      ${plotHtml}
      <div class="mp149-side">
        <div class="mp149-action"><small>${escapeHtml(act.tag)}</small><strong>${escapeHtml(String(act.text))}</strong><span>${escapeHtml(String(act.sub))}</span>${dupChip}</div>
        ${slopeHtml}
        ${localCard}
        ${globalCard}
      </div>
    </div>
    ${bucketsHtml}
    <div class="mp149-legend">${legendHtml}</div>
  </section>`;
}

function fmtSafe(idx, points) {
  return Array.isArray(points[idx]) ? ` (${points[idx][0]},${points[idx][1]})` : "";
}

// ---- Data Stream as Disjoint Intervals (bai 352) ----
// Shows the sorted disjoint-interval list three ways at once:
//  1. a number-line track with coverage bars and the incoming value marker;
//  2. interval cards (prev/next neighbours, absorbed/removed ghosts);
//  3. an approach tracker - binary search over starts, or the linear cursor.
function renderDataStream352View(step) {
  const view = step.dataStream352View || {};
  const el = $("treeView");
  const vi = lang === "vi";
  const approach = Number(view.approach) === 1 ? 1 : 2;
  const event = String(view.event || "init");
  const intervals = Array.isArray(view.intervals) ? view.intervals : [];
  const value = Number.isFinite(view.value) ? view.value : null;
  const bs = view.bs || null;
  const prevIdx = Number.isInteger(view.prevIdx) ? view.prevIdx : null;
  const nextIdx = Number.isInteger(view.nextIdx) ? view.nextIdx : null;
  const scanIdx = Number.isInteger(view.scanIdx) ? view.scanIdx : null;
  const insertAt = Number.isInteger(view.insertAt) ? view.insertAt : null;
  const touched = new Set(Array.isArray(view.touched) ? view.touched : []);
  const removedIdx = Number.isInteger(view.removedIdx) ? view.removedIdx : null;
  const newInterval = Array.isArray(view.newInterval) && view.newInterval.length === 2 ? view.newInterval : null;
  const results = Array.isArray(view.results) ? view.results : [];
  const returned = Array.isArray(view.returned) ? view.returned : null;
  const fmtIv = (iv) => `[${iv[0]}, ${iv[1]}]`;
  const fmtList = (list) => list.map(fmtIv).join(", ");

  // ---- phase header ----
  const phaseLabels = vi
    ? (approach === 1
      ? ["Nhận lệnh addNum", "Quét & bỏ qua", "Hấp thụ & chèn", "Trả getIntervals"]
      : ["Nhận lệnh addNum", "Binary search vị trí", "Gộp / mở rộng / chèn", "Trả getIntervals"])
    : (approach === 1
      ? ["Read addNum call", "Scan & skip", "Absorb & insert", "Return getIntervals"]
      : ["Read addNum call", "Binary-search position", "Merge / extend / insert", "Return getIntervals"]);
  let phaseIndex = -1;
  if (event === "call-add") phaseIndex = 0;
  else if (/^bs-/.test(event) || event === "skip-scan" || event === "lin-new") phaseIndex = 1;
  else if (["neighbors", "covered", "bridge-check", "bridge-link", "bridge-pop", "extend-prev-check", "extend-prev-done", "extend-next-check", "extend-next-done", "insert-check", "insert-done", "absorb-check", "absorb-grow", "insert-linear"].includes(event)) phaseIndex = 2;
  else if (event === "query" || event === "done") phaseIndex = 3;
  const phases = phaseLabels.map((label, index) => {
    const state = index < phaseIndex ? "done" : index === phaseIndex ? "active" : "pending";
    return `<span class="${state}">${state === "done" ? "✓" : state === "active" ? "▶" : "○"} ${escapeHtml(label)}</span>`;
  }).join("");

  // ---- operation stream chips ----
  let querySeen = 0;
  const opChips = (view.ops || []).map((label, index) => {
    const state = index < view.completedOps ? "done" : index === view.activeOpIndex ? "active" : "pending";
    let resultNote = "";
    if (state !== "pending" && /^getIntervals/.test(label)) {
      const snap = results[querySeen];
      resultNote = snap ? `→ ${snap.length} ${vi ? "khoảng" : "interval(s)"}` : "";
      querySeen += 1;
    }
    return `<span class="dsr352-op ${state}"><small>#${index + 1}</small><b>${escapeHtml(label)}</b>${resultNote ? `<em>${escapeHtml(resultNote)}</em>` : ""}</span>`;
  }).join("");

  // ---- number line ----
  const lo = Number.isFinite(view.domainLo) ? view.domainLo : 0;
  const hiRaw = Number.isFinite(view.domainHi) ? view.domainHi : lo + 9;
  const hi = Math.max(hiRaw, lo + 1);
  const span = hi - lo;
  const posOf = (v) => Math.min(100, Math.max(0, ((v - lo) / span) * 100));
  const widthOf = (s, e) => Math.max(((e - s + 1) / span) * 100, span > 48 ? 0.9 : 3);
  const tickStep = Math.max(1, Math.round(span / 8));
  const ticks = [];
  for (let v = Math.ceil(lo / tickStep) * tickStep; v <= hi; v += tickStep) ticks.push(v);
  const tickHtml = ticks.map((v) => `<span style="left:${posOf(v)}%"><i></i><em>${v}</em></span>`).join("");
  const segState = (idx) => removedIdx !== null && idx === removedIdx ? "removed"
    : touched.has(idx) ? (event.endsWith("-check") || event === "absorb-check" ? "target" : "touched")
      : idx === prevIdx || idx === nextIdx ? "neighbour" : "";
  const segsHtml = intervals.map((iv, idx) => `<div class="dsr352-seg ${segState(idx)}${idx % 2 ? " alt" : ""}" style="left:${posOf(iv[0])}%;width:${widthOf(iv[0], iv[1])}%" title="#${idx} · ${escapeHtml(fmtIv(iv))}">${escapeHtml(widthOf(iv[0], iv[1]) > 7 ? `[${iv[0]},${iv[1]}]` : "")}</div>`).join("");
  const showMarker = value !== null && !["init", "query", "done", "invalid"].includes(event);
  const markerHtml = showMarker ? `<div class="dsr352-marker${event === "call-add" ? " incoming" : ""}" style="left:${posOf(value)}%"><b>${value}</b><i></i></div>` : "";
  const ghostHtml = newInterval ? `<div class="dsr352-seg ghost" style="left:${posOf(newInterval[0])}%;width:${widthOf(newInterval[0], newInterval[1])}%">[${newInterval[0]},${newInterval[1]}]</div>` : "";

  // ---- interval cards ----
  const cardHtml = (iv, idx, extraClass, badge) => `
    <div class="dsr352-card ${extraClass || ""}">
      <small>#${idx}${badge ? ` · ${escapeHtml(badge)}` : ""}</small>
      <strong>[${iv[0]},&hairsp;${iv[1]}]</strong>
      <em>len ${iv[1] - iv[0] + 1}</em>
    </div>`;
  let cardsHtml = intervals.map((iv, idx) => {
    let badge = "";
    if (idx === prevIdx) badge = vi ? "trước" : "prev";
    else if (idx === nextIdx) badge = vi ? "sau" : "nxt";
    else if (idx === scanIdx) badge = "i";
    return cardHtml(iv, idx, `${segState(idx)} card`, badge);
  }).join("");
  if (removedIdx !== null) {
    cardsHtml += `<div class="dsr352-card removed ghost-card"><small>#${removedIdx}</small><strong>✕</strong><em>${vi ? "bị xoá" : "deleted"}</em></div>`;
  }
  if (newInterval && insertAt !== null) {
    cardsHtml += `<div class="dsr352-card new ghost-card"><small>@${insertAt}</small><strong>[${newInterval[0]}, ${newInterval[1]}]</strong><em>${vi ? "mới" : "new"}</em></div>`;
  }
  if (!cardsHtml.trim()) cardsHtml = `<div class="dsr352-empty">${vi ? "(danh sách rỗng)" : "(list is empty)"}</div>`;

  // ---- approach tracker: binary search over starts / linear cursor ----
  let trackerHtml = "";
  if (approach === 2 && bs) {
    const left = Number.isInteger(bs.left) ? bs.left : null;
    const right = Number.isInteger(bs.right) ? bs.right : null;
    const mid = Number.isInteger(bs.mid) ? bs.mid : null;
    trackerHtml = `<section class="dsr352-bs"><header><strong>STARTS · binary search [L, R)</strong><span>${vi ? "tìm start đầu tiên > " + escapeHtml(String(value)) : "first start > " + escapeHtml(String(value))}</span></header><div>${
      intervals.map((iv, idx) => {
        const classes = [];
        if (left !== null && right !== null) {
          if (idx < left) classes.push("eliminated");
          else if (idx >= right) classes.push("candidate");
          else classes.push("inrange");
        }
        if (idx === mid) classes.push("mid");
        const tags = [];
        if (idx === left) tags.push("L");
        if (idx === mid) tags.push("M");
        if (right !== null && right > left && idx === right - 1) tags.push("R−1");
        return `<div class="dsr352-bscell ${classes.join(" ")}"><small>[${tags.join("/") || "&nbsp;"}]</small><strong>s=${iv[0]}</strong><em>${iv[0]}..${iv[1]}</em></div>`;
      }).join("") || `<em class="dsr352-empty">(empty)</em>`
  }${intervals.length === 0 ? `<div class="dsr352-bscell inrange"><small>[L/R]</small><strong>n=0</strong><em>&nbsp;</em></div>` : ""}</div></section>`;
  } else if (approach === 1 && (scanIdx !== null || event === "insert-linear")) {
    trackerHtml = `<section class="dsr352-bs linear"><header><strong>LINEAR CURSOR i</strong><span>${vi ? "bỏ qua khi end+1 < value, hấp thụ khi start ≤ new.end+1" : "skip while end+1 < value, absorb while start ≤ new.end+1"}</span></header><div>${
      intervals.map((iv, idx) => {
        const classes = [];
        if (scanIdx !== null) {
          if (idx < scanIdx) classes.push("eliminated");
          else if (idx === scanIdx) classes.push(event.startsWith("absorb") ? "mid absorbing" : "inrange");
        }
        return `<div class="dsr352-bscell ${classes.join(" ")}"><small>[${idx === scanIdx ? "i" : "&nbsp;"}]</small><strong>${iv[0]}..${iv[1]}</strong><em>end+1=${iv[1] + 1}</em></div>`;
      }).join("") || `<em class="dsr352-empty">(empty)</em>`
  }</div></section>`;
  }

  // ---- action box ----
  const prevTxt = prevIdx !== null ? fmtIv(intervals[prevIdx]) : "None";
  const nxtTxt = nextIdx !== null ? fmtIv(intervals[nextIdx]) : "None";
  const bsState = bs ? `L=${bs.left}, R=${bs.right}${Number.isInteger(bs.mid) ? `, M=${bs.mid}` : ""}` : "";
  let actionHtml = "";
  switch (event) {
    case "init":
      actionHtml = `<div class="dsr352-action setup"><small>CONSTRUCTOR</small><strong>self.intervals = []</strong><span>${vi ? "Bắt đầu với danh sách rỗng; bất biến: rời nhau + sắp xếp theo start" : "Start empty; invariant: disjoint + sorted by start"}</span></div>`;
      break;
    case "call-add":
      actionHtml = `<div class="dsr352-action add"><small>ADDNUM</small><strong>value = ${value}</strong><span>${vi ? `Tìm chỗ cho ${value}: có thể rơi vào giữa, dính mép, hoặc tạo khoảng mới` : `Locate ${value}: it may land inside, touch an edge, or form a fresh interval`}</span></div>`;
      break;
    case "bs-range":
      actionHtml = `<div class="dsr352-action search"><small>BINARY SEARCH</small><strong>[L, R) = [${bs.left}, ${bs.right})</strong><span>${vi ? "Mục tiêu: index đầu tiên có start > value" : "Goal: first index whose start > value"}</span></div>`;
      break;
    case "bs-mid":
      actionHtml = `<div class="dsr352-action mid"><small>COMPUTE MID</small><strong>M = ${bs.mid} → starts[M] = ${intervals[bs.mid][0]}</strong><span>${bs.left} ≤ M &lt; ${bs.right}</span></div>`;
      break;
    case "bs-compare": {
      const goRight = intervals[bs.mid][0] <= value;
      actionHtml = `<div class="dsr352-action compare ${goRight ? "past" : "future"}"><small>COMPARE</small><strong>starts[M]=${intervals[bs.mid][0]} ${goRight ? "≤" : ">"} value=${value}</strong><span>${goRight ? (vi ? "Đáp án nằm bên phải M" : "Answer lies right of M") : (vi ? "M vẫn có thể là đáp án" : "M may still be the answer")}</span></div>`;
      break;
    }
    case "bs-left":
    case "bs-right":
      actionHtml = `<div class="dsr352-action move"><small>SHRINK RANGE</small><strong>${event === "bs-left" ? `L = M + 1 = ${bs.left}` : `R = M = ${bs.right}`}</strong><span>${bsState}</span></div>`;
      break;
    case "neighbors":
      actionHtml = `<div class="dsr352-action neighbours"><small>NEIGHBOURS</small><strong>i=${insertAt ?? (bs ? bs.left : "?")} · prev=${escapeHtml(prevTxt)} · nxt=${escapeHtml(nxtTxt)}</strong><span>${vi ? "Chỉ hai láng giềng này quyết định số phận của value" : "Only these two neighbours decide how value lands"}</span></div>`;
      break;
    case "covered":
      actionHtml = `<div class="dsr352-action covered"><small>${vi ? "ĐÃ ĐƯỢC PHỦ" : "ALREADY COVERED"}</small><strong>${escapeHtml(prevTxt)} chứa ${value}</strong><span>${vi ? "return ngay; danh sách không đổi — O(log n)" : "return immediately; list unchanged — O(log n)"}</span></div>`;
      break;
    case "bridge-check":
      actionHtml = `<div class="dsr352-action bridge"><small>BRIDGE</small><strong>${prevTxt} + {${value}} + ${nxtTxt}</strong><span>${vi ? "end+1 == value == start−1 → ba mảnh hợp nhất thành một" : "end+1 == value == start−1 → three pieces fuse into one"}</span></div>`;
      break;
    case "bridge-link":
      actionHtml = `<div class="dsr352-action bridge write"><small>MERGE STEP 1</small><strong>prev.end ← nxt.end</strong><span>${vi ? `prev giờ là [${intervals[prevIdx][0]}, ${intervals[prevIdx][1]}]` : `prev is now [${intervals[prevIdx][0]}, ${intervals[prevIdx][1]}]`}</span></div>`;
      break;
    case "bridge-pop":
      actionHtml = `<div class="dsr352-action bridge done"><small>MERGE STEP 2</small><strong>splice(nxt, 1)</strong><span>${vi ? `Số khoảng giảm: ${fmtList(intervals)}` : `Interval count shrinks: ${fmtList(intervals)}`}</span></div>`;
      break;
    case "extend-prev-check":
    case "extend-prev-done":
      actionHtml = `<div class="dsr352-action extend right ${event.endsWith("done") ? "write" : ""}"><small>${vi ? "MỞ RỘNG PREV" : "EXTEND PREV"}</small><strong>prev.end+1 == ${value}</strong><span>${vi ? `Kéo dài mép phải của ${prevTxt} tới ${value}` : `Stretch the right edge of ${prevTxt} up to ${value}`}</span></div>`;
      break;
    case "extend-next-check":
    case "extend-next-done":
      actionHtml = `<div class="dsr352-action extend left ${event.endsWith("done") ? "write" : ""}"><small>${vi ? "MỞ RỘNG NXT" : "EXTEND NXT"}</small><strong>nxt.start−1 == ${value}</strong><span>${vi ? `Hạ mép trái của ${nxtTxt} xuống ${value}` : `Lower the left edge of ${nxtTxt} to ${value}`}</span></div>`;
      break;
    case "insert-check":
    case "insert-done":
      actionHtml = `<div class="dsr352-action insert ${event.endsWith("done") ? "write" : ""}"><small>INSERT NEW</small><strong>gap: ${prevTxt}.end+1 … ${nxtTxt}.start−1</strong><span>${vi ? `${value} đứng cô lập nên tự lập khoảng [${value}, ${value}] tại index ${insertAt ?? (bs ? bs.left : "?")}` : `${value} sits isolated and forms its own [${value}, ${value}] at index ${insertAt ?? (bs ? bs.left : "?")}`}</span></div>`;
      break;
    case "skip-scan":
      actionHtml = `<div class="dsr352-action skip"><small>SKIP i=${scanIdx}</small><strong>intervals[i].end+1 = ${intervals[scanIdx][1] + 1} &lt; ${value}</strong><span>${vi ? "Quá xa bên trái, không thể chạm new_interval" : "Too far left; it can never touch new_interval"}</span></div>`;
      break;
    case "absorb-check":
      actionHtml = `<div class="dsr352-action absorb"><small>ABSORB i=${scanIdx}</small><strong>${fmtIv(intervals[scanIdx])} chạm new_interval</strong><span>${vi ? "start ≤ new.end+1 → nuốt vào rồi xoá khỏi danh sách" : "start ≤ new.end+1 → swallow it, then delete from the list"}</span></div>`;
      break;
    case "absorb-grow":
      actionHtml = `<div class="dsr352-action absorb grow"><small>NEW_INTERVAL</small><strong>${escapeHtml(fmtIv(newInterval))}</strong><span>${vi ? "min/max mở rộng sau mỗi lần hấp thụ" : "min/max stretch after every absorption"}</span></div>`;
      break;
    case "insert-linear":
      actionHtml = `<div class="dsr352-action insert write"><small>SPLICE @ i=${insertAt}</small><strong>${fmtList(intervals)}</strong><span>${vi ? "Chèn khoảng tổng hợp; danh sách lại rời nhau" : "Splice the merged interval back; the list is disjoint again"}</span></div>`;
      break;
    case "query":
      actionHtml = `<div class="dsr352-action query"><small>GETINTERVALS</small><strong>${returned ? `[${fmtList(returned)}]` : "[]"}</strong><span>${vi ? `${returned ? returned.length : 0} khoảng rời nhau phủ toàn bộ giá trị đã thấy` : `${returned ? returned.length : 0} disjoint intervals cover everything seen so far`}</span></div>`;
      break;
    case "done":
      actionHtml = `<div class="dsr352-action result"><small>COMPLETE</small><strong>${returned || results.length ? `${results.length} × getIntervals()` : ""} ${fmtList(intervals) || "[]"}</strong><span>${approach === 1 ? (vi ? "Cách 1: O(n)/addNum, dễ cài đặt" : "Approach 1: O(n)/addNum, trivially correct") : (vi ? "Cách 2: O(log n) tìm vị trí, chỉ đụng 2 láng giềng" : "Approach 2: O(log n) lookup, touches only two neighbours")}</span></div>`;
      break;
    default:
      actionHtml = `<div class="dsr352-action setup"><small>${escapeHtml(pick(step.title))}</small></div>`;
  }

  // ---- legend + results log ----
  const legendHtml = approach === 2
    ? `<span><i class="lg-elim"></i>${vi ? "đã loại" : "eliminated"}</span><span><i class="lg-range"></i>${vi ? "đang xét" : "in range"}</span><span><i class="lg-touch"></i>${vi ? "láng giềng / bị đụng" : "neighbours / touched"}</span><span><i class="lg-ghost"></i>${vi ? "khoảng mới" : "new interval"}</span>`
    : `<span><i class="lg-elim"></i>${vi ? "đã bỏ qua" : "skipped"}</span><span><i class="lg-touch"></i>${vi ? "đang quét" : "cursor"}</span><span><i class="lg-ghost"></i>${vi ? "new_interval" : "new_interval"}</span>`;
  let qCounter = 0;
  const resultsHtml = (view.ops || []).map((label, index) => {
    if (!/^getIntervals/.test(label)) return "";
    const snap = results[qCounter];
    const completed = index < view.completedOps || event === "done";
    const active = index === view.activeOpIndex;
    qCounter += 1;
    return `<span class="dsr352-res${completed ? " done" : ""}${active ? " active" : ""}"><small>#${qCounter}</small><strong>${completed ? `[${snap ? fmtList(snap) : ""}]` : active ? "…" : "?"}</strong></span>`;
  }).join("") || `<em class="dsr352-empty">${vi ? "chưa gọi getIntervals" : "no getIntervals yet"}</em>`;

  el.innerHTML = `<section class="dsr352-viz">
    <div class="dsr352-phases">${phases}</div>
    <div class="dsr352-ops">${opChips}</div>
    <section class="dsr352-numberline"><header><strong>${vi ? "TRỤC SỐ" : "NUMBER LINE"} · ${lo}…${hi}</strong><span>${vi ? "thanh màu = khoảng đã gộp" : "bars = merged intervals"}</span></header>
      <div class="dsr352-track">
        <div class="dsr352-rail"></div>
        <div class="dsr352-ticks">${tickHtml}</div>
        ${segsHtml}
        ${ghostHtml}
        ${markerHtml}
      </div>
    </section>
    <section class="dsr352-cards-wrap"><header><strong>${vi ? "DANH SÁCH KHOẢNG" : "INTERVAL LIST"}</strong><span>${vi ? "luôn rời nhau, sắp theo start" : "always disjoint, sorted by start"}</span></header><div class="dsr352-cards">${cardsHtml}</div></section>
    ${trackerHtml}
    ${actionHtml}
    <div class="dsr352-legend">${legendHtml}</div>
    <section class="dsr352-results"><header><strong>${vi ? "KẾT QUẢ getIntervals()" : "getIntervals() RESULTS"}</strong></header><div>${resultsHtml}</div></section>
  </section>`;
}

function renderAllocator2502View(step) {
  const view = step.allocator2502View || {};
  const vi = lang === "vi";
  const phase = String(view.phase || "init");
  const memory = Array.isArray(view.memory) ? view.memory : [];
  const operations = Array.isArray(view.operations) ? view.operations : [];
  const results = Array.isArray(view.results) ? view.results : [];
  const touched = new Set(Array.isArray(view.touched) ? view.touched : []);
  const candidate = Array.isArray(view.candidateRange) ? view.candidateRange : null;
  const display = (value) => value === null || value === undefined ? "—" : String(value);
  const phaseIndex = phase === "init" || phase === "invalid" ? 0
    : phase.endsWith("start") ? 0
      : ["scan-free", "scan-blocked", "fit-found", "free-find"].includes(phase) ? 1
        : ["allocate-write", "free-write"].includes(phase) ? 2 : 3;
  const phaseLabels = vi
    ? ["Nhận operation", "Quét bộ nhớ", "Ghi / giải phóng", "Trả kết quả"]
    : ["Read operation", "Scan memory", "Write / release", "Return result"];
  const phases = phaseLabels.map((label, index) => {
    const state = index < phaseIndex ? "done" : index === phaseIndex ? "active" : "pending";
    return `<span class="${state}">${state === "done" ? "✓" : state === "active" ? "▶" : index + 1}<b>${escapeHtml(label)}</b></span>`;
  }).join("");
  const operationHtml = operations.map((operation, index) => {
    const state = index < view.completedOps ? "done" : index === view.activeOpIndex ? "active" : "pending";
    return `<span class="${state}"><small>#${index + 1}</small><b>${escapeHtml(operation)}</b><em>${state === "done" ? `→ ${escapeHtml(display(results[index]))}` : state === "active" ? (vi ? "đang chạy" : "running") : ""}</em></span>`;
  }).join("");
  const cells = memory.map((mID, index) => {
    const colorIndex = Math.abs(Number(mID)) % 6;
    const classes = ["alloc2502-cell", mID === 0 ? "free" : `owned c${colorIndex}`];
    if (index === view.scanIndex) classes.push("scan");
    if (candidate && index >= candidate[0] && index <= candidate[1]) classes.push("candidate");
    if (index === view.blocker) classes.push("blocker");
    if (touched.has(index)) classes.push(phase === "free-find" ? "releasing" : phase === "free-write" ? "released" : "written");
    return `<div class="${classes.join(" ")}"><small>${index}</small><strong>${mID === 0 ? "FREE" : `mID ${escapeHtml(display(mID))}`}</strong><em>${index === view.scanIndex ? "i" : touched.has(index) ? (phase.startsWith("free") ? "FREE" : "WRITE") : ""}</em></div>`;
  }).join("");
  const runs = (view.freeRuns || []).map((run) => `<span><small>[${run.start}..${run.end}]</small><strong>${run.length}</strong><em>${vi ? "ô liên tiếp" : "contiguous"}</em></span>`).join("") || `<em class="alloc2502-empty">${vi ? "Không còn block FREE" : "No FREE block remains"}</em>`;
  const current = view.currentOperation;
  let request = "";
  if (current?.name === "allocate") {
    const enough = view.streak >= current.size;
    request = `<section class="alloc2502-request allocate"><div><small>REQUEST</small><strong>size=${current.size} · mID=${current.mID}</strong></div><div><small>FREE STREAK</small><strong>${view.streak} / ${current.size}</strong></div><div class="${enough ? "ready" : ""}"><small>FIRST FIT</small><strong>${enough && candidate ? `[${candidate[0]}..${candidate[1]}]` : phase === "allocate-fail" ? "NONE" : "…"}</strong></div><div><small>RETURN</small><strong>${escapeHtml(display(view.result))}</strong></div></section>`;
  } else if (current?.name === "free") {
    request = `<section class="alloc2502-request release"><div><small>REQUEST</small><strong>freeMemory(${current.mID})</strong></div><div><small>MATCHED CELLS</small><strong>${touched.size}</strong></div><div><small>RETURN</small><strong>${escapeHtml(display(view.result))}</strong></div></section>`;
  }
  const resultHtml = operations.map((operation, index) => index < view.completedOps
    ? `<span><small>${escapeHtml(operation)}</small><strong>${escapeHtml(display(results[index]))}</strong></span>` : "").join("") || `<em class="alloc2502-empty">${vi ? "Chưa có output" : "No output yet"}</em>`;
  const activeLine = Array.isArray(step.codeLines) ? step.codeLines[0] : null;
  const summary = vi ? `Allocator ${memory.length} ô, ${view.freeRuns?.length || 0} vùng trống.` : `Allocator with ${memory.length} cells and ${view.freeRuns?.length || 0} free runs.`;

  $("treeView").innerHTML = `<section class="alloc2502-viz" role="img" aria-label="${escapeHtml(summary)}">
    <div class="alloc2502-phases">${phases}</div>
    <div class="alloc2502-action"><small>${vi ? "DÒNG" : "LINE"} ${activeLine ?? "—"}</small><strong>${escapeHtml(pick(step.title))}</strong><span>${escapeHtml(pick(step.note))}</span></div>
    <section class="alloc2502-operations"><header><strong>OPERATIONS</strong><span>${view.completedOps}/${operations.length} ${vi ? "hoàn tất" : "complete"}</span></header><div>${operationHtml}</div></section>
    ${request}
    <section class="alloc2502-memory"><header><strong>MEMORY · ${memory.length} CELLS</strong><span>${vi ? "địa chỉ tăng từ trái sang phải" : "addresses increase left to right"}</span></header><div>${cells}</div></section>
    <section class="alloc2502-runs"><header><strong>CONTIGUOUS FREE RUNS</strong><span>${vi ? "allocate cần một run đủ dài" : "allocate needs one long-enough run"}</span></header><div>${runs}</div></section>
    <section class="alloc2502-results"><header><strong>RETURN LOG</strong><span>${vi ? "allocate → start · free → count" : "allocate → start · free → count"}</span></header><div>${resultHtml}</div></section>
  </section>`;
}

function renderStoneGame1872View(step) {
  const view = step.stoneGame1872View || {};
  const vi = lang === "vi";
  const phase = String(view.phase || "rules");
  const stones = Array.isArray(view.stones) ? view.stones : [];
  const prefix = Array.isArray(view.prefix) ? view.prefix : [];
  const dp = Array.isArray(view.dp) ? view.dp : [];
  const moveLog = Array.isArray(view.moveLog) ? view.moveLog : [];
  const traceStops = new Set(Array.isArray(view.traceStops) ? view.traceStops : []);
  const moveStops = new Map(moveLog.map((move, index) => [move.idx, { ...move, turn: index + 1 }]));
  const display = (value) => value === null || value === undefined ? "—" : String(value);
  const signed = (value) => Number(value) >= 0 ? `+${value}` : String(value);
  const expression = (values) => (values || []).map((value, index) => {
    if (index === 0) return String(value);
    return Number(value) < 0 ? ` − ${Math.abs(value)}` : ` + ${value}`;
  }).join("");

  const phaseIndex = phase === "rules" ? 0
    : phase.startsWith("game") ? 1
      : phase === "bridge" || phase === "prefix" ? 2
        : phase.startsWith("dp") ? 3 : 4;
  const phaseLabels = vi
    ? ["Luật chơi", "Chơi một ván", "Đổi sang prefix", "DP từ phải", "Đối chiếu"]
    : ["Rules", "Play one game", "Build prefixes", "Right-to-left DP", "Verify"];
  const phases = phaseLabels.map((label, index) => {
    const state = index < phaseIndex ? "done" : index === phaseIndex ? "active" : "pending";
    return `<span class="${state}">${state === "done" ? "✓" : state === "active" ? "▶" : index + 1}<b>${escapeHtml(label)}</b></span>`;
  }).join("");

  const activeLine = Array.isArray(step.codeLines) ? step.codeLines[0] : null;
  const action = `<div class="sg1872-action"><small>${vi ? "DÒNG" : "LINE"} ${activeLine ?? "—"}</small><strong>${escapeHtml(pick(step.title))}</strong><span>${escapeHtml(pick(step.note))}</span></div>`;

  const rules = `<section class="sg1872-rules" aria-label="${vi ? "Ba bước của một lượt" : "Three actions in one turn"}">
    <div><small>1 · CHOOSE</small><strong>x &gt; 1</strong><span>${vi ? "viên ngoài cùng bên trái" : "leftmost stones"}</span></div><i>→</i>
    <div><small>2 · SCORE</small><strong>sum = Σ picked</strong><span>${vi ? "người đi cộng sum vào điểm" : "the mover adds sum to score"}</span></div><i>→</i>
    <div><small>3 · MERGE</small><strong>[sum, ...rest]</strong><span>${vi ? "đặt viên tổng về đầu hàng" : "put the sum back on the left"}</span></div>
  </section>`;

  const gameItems = (Array.isArray(view.gameRow) ? view.gameRow : []).map((item) => {
    const classes = ["sg1872-stone", item.taken ? "taken" : "", item.mergedThrough !== null ? "merged" : ""].filter(Boolean).join(" ");
    const tag = item.taken
      ? (vi ? "ĐANG GỘP" : "PICKED")
      : item.mergedThrough !== null ? (vi ? "VIÊN TỔNG" : "MERGED SUM") : (vi ? "CÒN LẠI" : "REMAINS");
    return `<div class="${classes}"><small>${escapeHtml(item.label)}</small><strong>${escapeHtml(display(item.value))}</strong><span>${tag}</span></div>`;
  }).join("");
  const currentMove = view.currentMove;
  const moveEquation = currentMove
    ? `<section class="sg1872-move-equation ${phase === "game-move" ? "active" : "merged"}"><small>${escapeHtml(currentMove.mover)} · x=${currentMove.x} · ${vi ? `dừng tại index gốc ${currentMove.idx}` : `stop at original index ${currentMove.idx}`}</small><strong>${escapeHtml(expression(currentMove.taken))} = ${escapeHtml(display(currentMove.sum))}</strong><span>${phase === "game-move" ? (vi ? "Những viên viền vàng sẽ biến thành đúng một viên tổng." : "The gold stones will become one merged-sum stone.") : (vi ? `Đã cộng ${signed(currentMove.sum)} điểm và thu hàng đá lại.` : `Added ${signed(currentMove.sum)} points and shrank the row.`)}</span></section>`
    : "";
  const scoreDiff = Number(view.aliceScore || 0) - Number(view.bobScore || 0);
  const gameBoard = `<section class="sg1872-game">
    <header><strong>${vi ? "HÀNG ĐÁ HIỆN TẠI" : "CURRENT STONE ROW"}</strong><span>${vi ? "hàng ngắn dần sau mỗi lượt" : "the row shrinks after every move"}</span></header>
    <div class="sg1872-score"><span class="alice ${view.mover === "Alice" ? "turn" : ""}"><small>ALICE</small><strong>${escapeHtml(display(view.aliceScore || 0))}</strong></span><b>${vi ? "hiệu" : "gap"} ${signed(scoreDiff)}</b><span class="bob ${view.mover === "Bob" ? "turn" : ""}"><small>BOB</small><strong>${escapeHtml(display(view.bobScore || 0))}</strong></span></div>
    <div class="sg1872-row">${gameItems}</div>
    ${moveEquation}
  </section>`;

  const timelineItems = moveLog.map((move, index) => `<span class="${move.mover === "Alice" ? "alice" : "bob"}"><small>#${index + 1} · ${escapeHtml(move.mover)}</small><strong>p[${move.idx}] = ${escapeHtml(display(move.sum))}</strong><em>${vi ? `dừng tại i=${move.idx}` : `stop at i=${move.idx}`}</em></span>`).join("");
  const pendingMove = phase === "game-move" && currentMove
    ? `<span class="pending ${currentMove.mover === "Alice" ? "alice" : "bob"}"><small>#${moveLog.length + 1} · ${escapeHtml(currentMove.mover)}</small><strong>p[${currentMove.idx}] = ${escapeHtml(display(currentMove.sum))}</strong><em>${vi ? "đang chọn" : "choosing"}</em></span>`
    : "";
  const timeline = moveLog.length || pendingMove
    ? `<section class="sg1872-timeline"><header><strong>${vi ? "TIMELINE ĐIỂM DỪNG" : "STOP-INDEX TIMELINE"}</strong><span>${vi ? "mỗi lượt tương ứng đúng một prefix sum" : "each move maps to exactly one prefix sum"}</span></header><div>${timelineItems}${pendingMove}</div></section>`
    : "";

  const stateCells = stones.map((value, index) => {
    const classes = ["sg1872-state-cell"];
    if (index === view.currentIndex) classes.push("current");
    if (prefix[index] !== null && prefix[index] !== undefined) classes.push("prefix-ready");
    if (dp[index] !== null && dp[index] !== undefined) classes.push("dp-ready");
    if (moveStops.has(index)) classes.push(moveStops.get(index).mover === "Alice" ? "alice-stop" : "bob-stop");
    if (traceStops.has(index)) classes.push("traced");
    const move = moveStops.get(index);
    const marker = traceStops.has(index) ? (vi ? "DP CHỌN" : "DP PICK")
      : move ? `#${move.turn} ${move.mover}` : "";
    return `<div class="${classes.join(" ")}">
      <small>i = ${index}</small>
      <dl><div><dt>a[i]</dt><dd>${escapeHtml(display(value))}</dd></div><div><dt>p[i]</dt><dd>${escapeHtml(display(prefix[index]))}</dd></div><div><dt>f[i]</dt><dd>${index === 0 ? "×" : escapeHtml(display(dp[index]))}</dd></div></dl>
      <em>${escapeHtml(marker)}</em>
    </div>`;
  }).join("");
  const stateGrid = `<section class="sg1872-state"><header><strong>stones → prefix p[i] → DP f[i]</strong><span>${vi ? "ô sáng là index đang xử lý" : "the bright cell is the current index"}</span></header><div>${stateCells}</div><footer><span><i class="alice"></i>Alice stop</span><span><i class="bob"></i>Bob stop</span><span><i class="trace"></i>${vi ? "DP lần lại" : "DP trace"}</span></footer></section>`;

  const choice = view.choice;
  let decision = "";
  if (choice?.kind === "base") {
    decision = `<section class="sg1872-base"><small>${vi ? "BASE CASE · CHỈ CÒN MỘT ĐIỂM DỪNG" : "BASE CASE · ONLY ONE STOP REMAINS"}</small><strong>f[${view.currentIndex}] = p[${view.currentIndex}] = ${escapeHtml(display(choice.result))}</strong><span>${vi ? "Người sắp đi buộc phải gộp hết, nên nhận toàn bộ prefix cuối." : "The mover must merge everything, so they receive the final prefix."}</span></section>`;
  } else if (choice?.kind === "compare") {
    const tie = choice.take === choice.skip;
    decision = `<section class="sg1872-decision"><header><strong>f[${view.currentIndex}] = max(TAKE, SKIP)</strong><span>${vi ? "lợi thế tối đa của người sắp đi" : "best margin for the player to move"}</span></header><div>
      <article class="take ${choice.picked === "take" || tie ? "picked" : ""}"><small>TAKE · ${vi ? "dừng tại i" : "stop at i"}</small><code>p[${view.currentIndex}] − f[${view.currentIndex + 1}]</code><strong>${display(choice.prefixValue)} − (${display(choice.opponentBest)}) = ${display(choice.take)}</strong><span>${vi ? "điểm mình nhận trừ lợi thế tốt nhất của đối thủ" : "my score minus the opponent's best margin"}</span></article>
      <b>VS</b>
      <article class="skip ${choice.picked === "skip" || tie ? "picked" : ""}"><small>SKIP · ${vi ? "chưa dừng" : "do not stop yet"}</small><code>f[${view.currentIndex + 1}]</code><strong>${display(choice.skip)}</strong><span>${vi ? "bỏ index này, giữ phương án tốt nhất bên phải" : "ignore this index and keep the best option to its right"}</span></article>
      <em>→</em><article class="result"><small>${tie ? "TIE · BOTH OPTIMAL" : (vi ? `CHỌN ${choice.picked.toUpperCase()}` : `PICK ${choice.picked.toUpperCase()}`)}</small><strong>f[${view.currentIndex}] = ${display(choice.result)}</strong></article>
    </div></section>`;
  } else if (choice?.kind === "trace") {
    decision = `<section class="sg1872-trace"><small>${escapeHtml(view.mover || "Player")} · ${vi ? "TRA NGƯỢC PHƯƠNG ÁN TỐI ƯU" : "TRACE THE OPTIMAL CHOICE"}</small><strong>${signed(choice.prefixValue)} − (${display(choice.opponentBest)}) = ${display(choice.result)}</strong><span>${vi ? `Dừng tại i=${view.currentIndex}; điểm nhận là p[${view.currentIndex}].` : `Stop at i=${view.currentIndex}; the score gained is p[${view.currentIndex}].`}</span></section>`;
  }

  const answerKnown = view.answer !== null && view.answer !== undefined;
  const answer = answerKnown
    ? `<section class="sg1872-answer ${phase === "done" ? "done" : "preview"}"><small>${phase === "done" ? (vi ? "ĐÁP ÁN · f[1]" : "ANSWER · f[1]") : (vi ? "CHÊNH LỆCH VÁN MẪU" : "DEMO GAME MARGIN")}</small><strong>${escapeHtml(display(view.answer))}</strong><span>${phase === "done" ? `Alice ${display(view.aliceScore)} − Bob ${display(view.bobScore)} = f[1]` : `Alice − Bob = ${display(view.answer)}`}</span></section>`
    : "";
  const conceptualRule = phaseIndex >= 2
    ? `<section class="sg1872-meaning"><strong>f[i]</strong><span>${vi ? "lợi thế lớn nhất người sắp đi có thể đảm bảo khi điểm dừng kế tiếp phải nằm từ i trở đi" : "the largest margin the player to move can guarantee when the next stop must be at i or later"}</span><code>f[i] = max(f[i+1], p[i] − f[i+1])</code></section>`
    : "";
  const main = phaseIndex <= 1 ? `${rules}${gameBoard}${timeline}` : `${conceptualRule}${stateGrid}${decision}${timeline}${answer}`;
  const summary = vi ? `Bài 1872, giai đoạn ${phaseIndex + 1}, ${moveLog.length} nước đã mô phỏng.` : `Problem 1872, phase ${phaseIndex + 1}, ${moveLog.length} moves simulated.`;

  $("treeView").innerHTML = `<section class="sg1872-viz" role="img" aria-label="${escapeHtml(summary)}">
    <div class="sg1872-phases">${phases}</div>
    ${action}
    ${main}
  </section>`;
}

function renderAbsoluteSubarray1749View(step) {
  const view = step.absoluteSubarrayView || {};
  const nums = Array.isArray(view.nums) ? view.nums : [];
  const vi = lang === "vi";
  const phase = String(view.phase || "init-ending");
  const i = Number.isInteger(view.i) ? view.i : 0;
  const display = (value) => value === null || value === undefined ? "—" : String(value);
  const inRange = (index, left, right) => Number.isInteger(left) && Number.isInteger(right) && index >= left && index <= right;
  const rangeText = (left, right) => Number.isInteger(left) && Number.isInteger(right) ? `[${left}..${right}]` : (vi ? "rỗng" : "empty");
  const phaseIndex = phase.startsWith("init") ? 0 : phase === "scan" ? 1
    : ["max-ending", "max-best"].includes(phase) ? 2
      : ["min-ending", "min-best"].includes(phase) ? 3 : 4;
  const phaseLabels = vi
    ? ["Khởi tạo 0", "Đọc x", "Kadane MAX", "Kadane MIN", "So sánh |sum|"]
    : ["Initialize zero", "Read x", "MAX Kadane", "MIN Kadane", "Compare |sum|"];
  const phases = phaseLabels.map((label, index) => {
    const state = index < phaseIndex ? "done" : index === phaseIndex ? "active" : "pending";
    return `<span class="${state}">${state === "done" ? "✓" : state === "active" ? "▶" : index + 1}<b>${escapeHtml(label)}</b></span>`;
  }).join("");

  const maxHistory = Array.isArray(view.maxHistory) ? view.maxHistory : [];
  const minHistory = Array.isArray(view.minHistory) ? view.minHistory : [];
  const cells = nums.map((value, index) => {
    const classes = ["mas1749-cell"];
    if (inRange(index, view.maxL, view.maxR)) classes.push("positive-best");
    if (inRange(index, view.minL, view.minR)) classes.push("negative-best");
    if (inRange(index, view.maxEndingL, view.maxEndingR)) classes.push("current-max");
    if (inRange(index, view.minEndingL, view.minEndingR)) classes.push("current-min");
    if (inRange(index, view.selectedL, view.selectedR)) classes.push("selected");
    if (index === i && phase !== "done") classes.push("active");
    const tags = [];
    if (inRange(index, view.maxL, view.maxR)) tags.push(`<b class="positive">${vi ? "DƯƠNG" : "POS"}</b>`);
    if (inRange(index, view.minL, view.minR)) tags.push(`<b class="negative">${vi ? "ÂM" : "NEG"}</b>`);
    if (inRange(index, view.selectedL, view.selectedR)) tags.push(`<b class="pick">${vi ? "CHỌN" : "PICK"}</b>`);
    return `<div class="${classes.join(" ")}">
      <small>[${index}]</small><strong>${escapeHtml(String(value))}</strong>
      <div><span><i>max</i><b>${escapeHtml(display(maxHistory[index]))}</b></span><span><i>min</i><b>${escapeHtml(display(minHistory[index]))}</b></span></div>
      <em>${tags.join("")}</em>
    </div>`;
  }).join("");

  const lane = (kind) => {
    const isMax = kind === "max";
    const previous = isMax ? view.prevMaxEnding : view.prevMinEnding;
    const extend = isMax ? view.extendMax : view.extendMin;
    const current = isMax ? view.maxEnding : view.minEnding;
    const reset = isMax ? view.maxReset : view.minReset;
    const global = isMax ? view.maxSum : view.minSum;
    const currentL = isMax ? view.maxEndingL : view.minEndingL;
    const currentR = isMax ? view.maxEndingR : view.minEndingR;
    const bestL = isMax ? view.maxL : view.minL;
    const bestR = isMax ? view.maxR : view.minR;
    const active = isMax ? ["max-ending", "max-best"].includes(phase) : ["min-ending", "min-best"].includes(phase);
    return `<section class="mas1749-lane ${kind} ${active ? "active" : ""}">
      <header><strong>${isMax ? "MAX lane" : "MIN lane"}</strong><span>${isMax ? (vi ? "tìm tổng dương lớn nhất" : "largest positive sum") : (vi ? "tìm tổng âm nhỏ nhất" : "smallest negative sum")}</span></header>
      <div class="mas1749-choice">
        <span class="${reset ? "picked" : ""}"><small>${vi ? "RESET RỖNG" : "RESET EMPTY"}</small><b>0</b></span>
        <i>${isMax ? "max" : "min"}</i>
        <span class="${extend !== null && !reset ? "picked" : ""}"><small>${vi ? "NỐI TIẾP" : "EXTEND"}</small><b>${escapeHtml(display(previous))} + ${escapeHtml(display(view.x))} = ${escapeHtml(display(extend))}</b></span>
        <em>→</em><span class="result"><small>${isMax ? "max_ending" : "min_ending"}</small><b>${escapeHtml(display(current))}</b></span>
      </div>
      <footer><span>${vi ? "đoạn hiện tại" : "current range"}: ${escapeHtml(rangeText(currentL, currentR))}</span><strong>${isMax ? "max_sum" : "min_sum"}=${escapeHtml(display(global))} · ${escapeHtml(rangeText(bestL, bestR))}</strong></footer>
    </section>`;
  };

  const positiveCandidate = Number(view.positiveCandidate) || 0;
  const negativeCandidate = Number(view.negativeCandidate) || 0;
  const winner = view.winner;
  const selectedValues = Number.isInteger(view.selectedL) ? nums.slice(view.selectedL, view.selectedR + 1) : [];
  const selectedSum = selectedValues.reduce((sum, value) => sum + value, 0);
  const resultExpression = selectedValues.length
    ? `|${selectedValues.join(" + ")}| = |${selectedSum}| = ${view.answer}`
    : `|0| = ${view.answer ?? 0}`;
  const activeLine = Array.isArray(step.codeLines) ? step.codeLines[0] : null;

  $("treeView").innerHTML = `<section class="mas1749-viz" role="img" aria-label="#1749 Maximum Absolute Sum, answer ${escapeHtml(display(view.answer))}">
    <div class="mas1749-phases">${phases}</div>
    <div class="mas1749-debug"><small>${vi ? "DÒNG" : "LINE"} ${activeLine ?? "—"}</small><strong>${escapeHtml(pick(step.title))}</strong><span>${escapeHtml(pick(step.note))}</span></div>
    <section class="mas1749-rule"><div><strong>MAX</strong><code>max_ending = max(0, max_ending + x)</code><span>${vi ? "reset khi tổng không dương" : "reset when sum is not positive"}</span></div><div><strong>MIN</strong><code>min_ending = min(0, min_ending + x)</code><span>${vi ? "reset khi tổng không âm" : "reset when sum is not negative"}</span></div></section>
    <section class="mas1749-array"><header><strong>nums + Dual Kadane history</strong><span>${vi ? "xanh=DƯƠNG · tím/đỏ=ÂM · vàng=CHỌN" : "blue=POSITIVE · purple/red=NEGATIVE · gold=PICK"}</span></header><div class="mas1749-cells">${cells}</div></section>
    <div class="mas1749-lanes">${lane("max")}${lane("min")}</div>
    <section class="mas1749-meaning"><div><strong>${escapeHtml(display(view.maxSum))}</strong><span>${vi ? "tổng dương lớn nhất" : "largest positive sum"}</span></div><b>vs</b><div><strong>|${escapeHtml(display(view.minSum))}| = ${negativeCandidate}</strong><span>${vi ? "độ lớn của tổng âm nhỏ nhất" : "magnitude of smallest negative sum"}</span></div></section>
    <div class="mas1749-candidates">
      <section class="positive ${winner === "positive" ? "winner" : ""}"><small>+ max_sum</small><strong>${positiveCandidate}</strong><span>${escapeHtml(rangeText(view.maxL, view.maxR))}</span></section>
      <b>VS</b>
      <section class="negative ${winner === "negative" ? "winner" : ""}"><small>| min_sum |</small><strong>${negativeCandidate}</strong><span>${escapeHtml(rangeText(view.minL, view.minR))}</span></section>
      <em>→</em>
      <section class="answer ${winner ? "ready" : ""}"><small>${vi ? "ĐÁP ÁN" : "ANSWER"}${winner ? ` · ${winner.toUpperCase()}` : ""}</small><strong>${escapeHtml(display(view.answer))}</strong><span>${winner ? escapeHtml(resultExpression) : (vi ? "đang tính..." : "calculating...")}</span></section>
    </div>
    <section class="mas1749-result"><header><strong>${vi ? "SUBARRAY ĐƯỢC CHỌN" : "SELECTED SUBARRAY"}</strong><span>${escapeHtml(rangeText(view.selectedL, view.selectedR))}</span></header><div>${selectedValues.length ? selectedValues.map((value) => `<b>${escapeHtml(String(value))}</b>`).join("<i>+</i>") : `<b class="empty">${vi ? "rỗng" : "empty"}</b>`}<em>${winner ? `|sum| = ${view.answer}` : "—"}</em></div></section>
  </section>`;
}

function renderCircularMaximumSubarrayView(step) {
  const view = step.circularSubarrayView || {};
  const nums = Array.isArray(view.nums) ? view.nums : [];
  const vi = lang === "vi";
  const phase = String(view.phase || "init-max");
  const i = Number.isInteger(view.i) ? view.i : 0;
  const display = (value) => value === null || value === undefined ? "—" : String(value);
  const inRange = (index, left, right) => Number.isInteger(left) && Number.isInteger(right) && index >= left && index <= right;
  const inRanges = (index, ranges) => Array.isArray(ranges) && ranges.some(([left, right]) => inRange(index, left, right));
  const formatRange = (range) => Array.isArray(range) ? `[${range[0]}..${range[1]}]` : "—";
  const formatRanges = (ranges) => Array.isArray(ranges) && ranges.length ? ranges.map(formatRange).join(" + ") : (vi ? "rỗng" : "empty");

  const phaseIndex = phase.startsWith("init") ? 0
    : ["loop", "scan", "max-ending", "max-best", "min-ending", "min-best", "total"].includes(phase) ? 1
      : phase === "guard" ? 2 : phase === "circular" ? 3 : 4;
  const phaseLabels = vi
    ? ["Khởi tạo", "Dual Kadane", "Chặn toàn âm", "Ghép circular", "So sánh kết quả"]
    : ["Initialize", "Dual Kadane", "All-negative guard", "Build circular", "Compare result"];
  const phases = phaseLabels.map((label, index) => {
    const state = index < phaseIndex ? "done" : index === phaseIndex ? "active" : "pending";
    return `<span class="${state}">${state === "done" ? "✓" : state === "active" ? "▶" : index + 1}<b>${escapeHtml(label)}</b></span>`;
  }).join("");

  const showWrap = phase === "circular" || phase === "done";
  const selectedRanges = Array.isArray(view.selectedRanges) ? view.selectedRanges : [];
  const wrapRanges = Array.isArray(view.wrapRanges) ? view.wrapRanges : [];
  const maxHistory = Array.isArray(view.maxHistory) ? view.maxHistory : [];
  const minHistory = Array.isArray(view.minHistory) ? view.minHistory : [];
  const totalHistory = Array.isArray(view.totalHistory) ? view.totalHistory : [];
  const cells = nums.map((value, index) => {
    const classes = ["msc918-cell"];
    if (inRange(index, view.normalL, view.normalR)) classes.push("normal");
    if (inRange(index, view.minL, view.minR)) classes.push("excluded");
    if (showWrap && inRanges(index, wrapRanges)) classes.push("wrap");
    if (inRanges(index, selectedRanges)) classes.push("selected");
    if (index === i && phase !== "done") classes.push("active");
    const badges = [];
    if (inRange(index, view.normalL, view.normalR)) badges.push(`<b class="normal-tag">${vi ? "THƯỜNG" : "NORMAL"}</b>`);
    if (inRange(index, view.minL, view.minR)) badges.push(`<b class="cut-tag">${vi ? "LOẠI" : "CUT"}</b>`);
    if (showWrap && inRanges(index, wrapRanges)) badges.push(`<b class="wrap-tag">WRAP</b>`);
    if (inRanges(index, selectedRanges)) badges.push(`<b class="pick-tag">${vi ? "CHỌN" : "PICK"}</b>`);
    return `<div class="${classes.join(" ")}">
      <small>[${index}]</small><strong>${escapeHtml(String(value))}</strong>
      <dl><div><dt>max</dt><dd>${escapeHtml(display(maxHistory[index]))}</dd></div><div><dt>min</dt><dd>${escapeHtml(display(minHistory[index]))}</dd></div><div><dt>Σ</dt><dd>${escapeHtml(display(totalHistory[index]))}</dd></div></dl>
      <em>${badges.join("")}</em>
    </div>`;
  }).join("");

  const lane = (kind) => {
    const isMax = kind === "max";
    const restart = isMax ? view.restartMax : view.restartMin;
    const extend = isMax ? view.extendMax : view.extendMin;
    const current = isMax ? view.curMax : view.curMin;
    const best = isMax ? view.maxSum : view.minSum;
    const left = isMax ? view.curMaxStart : view.curMinStart;
    const bestLeft = isMax ? view.normalL : view.minL;
    const bestRight = isMax ? view.normalR : view.minR;
    const active = isMax ? ["max-ending", "max-best"].includes(phase) : ["min-ending", "min-best"].includes(phase);
    const operation = isMax ? "max" : "min";
    const pickedRestart = restart !== null && extend !== null && (isMax ? restart > extend : restart < extend);
    return `<section class="msc918-lane ${kind} ${active ? "active" : ""}">
      <header><strong>${isMax ? "MAX Kadane" : "MIN Kadane"}</strong><span>${isMax ? (vi ? "đoạn giữ nguyên" : "ordinary segment") : (vi ? "đoạn cần loại" : "segment to exclude")}</span></header>
      <div class="msc918-choice">
        <span class="${pickedRestart ? "picked" : ""}"><small>${vi ? "BẮT ĐẦU" : "RESTART"}</small><b>${escapeHtml(display(restart))}</b></span>
        <i>${operation}</i>
        <span class="${restart !== null && !pickedRestart ? "picked" : ""}"><small>${vi ? "NỐI TIẾP" : "EXTEND"}</small><b>${escapeHtml(display(extend))}</b></span>
        <em>→</em><span class="result"><small>${isMax ? "cur_max" : "cur_min"}</small><b>${escapeHtml(display(current))}</b></span>
      </div>
      <footer><span>${vi ? "đang kết thúc" : "ending now"}: [${escapeHtml(display(left))}..${i}]</span><strong>${isMax ? "max_sum" : "min_sum"}=${escapeHtml(display(best))} · [${bestLeft}..${bestRight}]</strong></footer>
    </section>`;
  };

  const circularInvalid = Boolean(view.allNegative || view.wrapEmpty);
  const normalRange = `[${display(view.normalL)}..${display(view.normalR)}]`;
  const circularRange = formatRanges(wrapRanges);
  const equation = view.circularSum === null || view.circularSum === undefined
    ? `circular = total − min_sum = ${display(view.total)} − (${display(view.minSum)})`
    : `circular = ${display(view.total)} − (${display(view.minSum)}) = ${display(view.circularSum)}`;
  const selectedValues = selectedRanges.flatMap(([left, right]) => nums.slice(left, right + 1));
  const guardResolved = phaseIndex >= 2;
  const guardClass = !guardResolved ? "pending" : view.allNegative ? "invalid" : "valid";
  const guardTitle = !guardResolved
    ? (vi ? "○ Chờ kiểm tra trường hợp toàn số âm" : "○ Waiting for the all-negative check")
    : view.allNegative
      ? (vi ? "⛔ TOÀN SỐ ÂM — KHÔNG ĐƯỢC CHỌN PHẦN BÙ RỖNG" : "⛔ ALL NEGATIVE — EMPTY COMPLEMENT IS ILLEGAL")
      : (vi ? "✓ Có phần tử không âm — được xét circular" : "✓ A nonnegative value exists — circular is allowed");
  const guardText = !guardResolved
    ? (vi ? "Sau Dual Kadane, dòng guard quyết định có được dùng total - min_sum hay không." : "After Dual Kadane, the guard decides whether total - min_sum is legal.")
    : view.allNegative
      ? (vi ? `total - min_sum sẽ loại cả mảng và tạo subarray rỗng. Trả max_sum = ${view.maxSum}.` : `total - min_sum would remove the whole array and create an empty subarray. Return max_sum = ${view.maxSum}.`)
      : view.wrapEmpty
        ? (vi ? "Đoạn MIN đang phủ cả mảng; ứng viên phần bù rỗng bị đánh dấu không hợp lệ." : "The MIN segment covers the whole array; its empty complement is marked invalid.")
        : (vi ? "Ứng viên circular gồm đoạn cuối nối trực tiếp về đoạn đầu." : "The circular candidate joins the ending segment directly to the starting segment.");
  const winnerLabel = view.winner === "wrap" ? "CIRCULAR" : view.winner ? "NORMAL" : (vi ? "CHƯA CHỌN" : "PENDING");
  const activeLine = Array.isArray(step.codeLines) ? step.codeLines[0] : null;

  $("treeView").innerHTML = `<section class="msc918-viz" role="img" aria-label="#918 Maximum Sum Circular Subarray, answer ${escapeHtml(display(view.answer))}">
    <div class="msc918-phases">${phases}</div>
    <div class="msc918-debug"><small>${vi ? "DÒNG" : "LINE"} ${activeLine ?? "—"}</small><strong>${escapeHtml(pick(step.title))}</strong><span>${escapeHtml(pick(step.note))}</span></div>
    <section class="msc918-circle">
      <header><strong>nums · ${vi ? "mảng vòng tròn" : "circular array"}</strong><span>${vi ? "xanh=NORMAL · tím/đỏ=LOẠI MIN · xanh lá=WRAP · vàng=CHỌN" : "blue=NORMAL · purple/red=CUT MIN · green=WRAP · gold=PICK"}</span></header>
      <div class="msc918-seam"><b>nums[n−1]</b><i>↻</i><b>nums[0]</b><span>${vi ? "điểm nối cuối → đầu" : "end → start seam"}</span></div>
      <div class="msc918-cells">${cells}</div>
    </section>
    <div class="msc918-lanes">${lane("max")}${lane("min")}</div>
    <section class="msc918-guard ${guardClass}"><strong>${escapeHtml(guardTitle)}</strong><span>${escapeHtml(guardText)}</span></section>
    <section class="msc918-complement ${phase === "circular" ? "active" : ""}">
      <div><small>${vi ? "CẮT ĐOẠN MIN" : "CUT MIN SEGMENT"}</small><strong>[${view.minL}..${view.minR}] = ${escapeHtml(display(view.minSum))}</strong></div>
      <code>${escapeHtml(equation)}</code>
      <div><small>${vi ? "GHÉP HAI BIÊN" : "JOIN BOTH EDGES"}</small><strong>${escapeHtml(circularRange)}</strong></div>
    </section>
    <div class="msc918-candidates">
      <section class="normal ${view.winner === "normal" || view.winner === "all-negative" ? "winner" : ""}"><small>NORMAL</small><strong>${escapeHtml(display(view.maxSum))}</strong><span>${escapeHtml(normalRange)}</span></section>
      <b>VS</b>
      <section class="circular ${view.winner === "wrap" ? "winner" : ""} ${circularInvalid ? "invalid" : ""}"><small>CIRCULAR</small><strong>${circularInvalid ? "INVALID" : escapeHtml(display(view.circularSum))}</strong><span>${escapeHtml(circularRange)}</span></section>
      <em>→</em>
      <section class="answer"><small>${vi ? "KẾT QUẢ" : "ANSWER"} · ${winnerLabel}</small><strong>${escapeHtml(display(view.answer))}</strong><span>${selectedValues.length ? `[${selectedValues.join(", ")}]` : (vi ? "đang tính..." : "calculating...")}</span></section>
    </div>
  </section>`;
}



/**
 * LeetCode 1111: Maximum Nesting Depth of Two Valid Parentheses Strings.
 * Render parentheses splitting visualization.
 */
function renderParentheses1111View(step) {
  const view = step.parentheses1111View || {};
  const vi = lang === "vi";
  const seq = Array.isArray(view.seq) ? view.seq : [...String(view.seq || "")];
  const answer = Array.isArray(view.answer) ? view.answer : [];
  const depthA = Number(view.depthA) || 0;
  const depthB = Number(view.depthB) || 0;
  const maxDepthA = Number(view.maxDepthA) || 0;
  const maxDepthB = Number(view.maxDepthB) || 0;
  const stackA = Array.isArray(view.stackA) ? view.stackA : [];
  const stackB = Array.isArray(view.stackB) ? view.stackB : [];
  const pointer = Number.isInteger(view.pointer) ? view.pointer : -1;
  const splitType = view.splitType === "A" || view.splitType === "B" ? view.splitType : "";
  const sourceMaxDepth = Number(view.sourceMaxDepth) || 0;
  const optimalMaxDepth = Number(view.optimalMaxDepth) || 0;

  const cells = [];
  for (let i = 0; i < seq.length; i++) {
    const c = seq[i];
    const isOpen = c === '(';
    const current = i === pointer;
    const pendingChoice = current && splitType ? (splitType === "A" ? 0 : 1) : undefined;
    const group = answer[i] === 0 || answer[i] === 1 ? answer[i] : pendingChoice;
    const assignToA = group === 0;
    const assignToB = group === 1;
    const inStackA = stackA.includes(i);
    const inStackB = stackB.includes(i);
    const stackDepth = assignToA
      ? stackA.indexOf(i) + 1
      : assignToB
        ? stackB.indexOf(i) + 1
        : 0;
    
    const classes = ["pa1111-cell", isOpen ? "open" : "close"];
    if (assignToA) classes.push("in-a");
    if (assignToB) classes.push("in-b");
    if (current) classes.push("current");
    if (inStackA || inStackB) classes.push("in-stack");
    
    const label = assignToA ? "A" : assignToB ? "B" : "—";
    const stackMarker = stackDepth > 0 ? `<b>${stackDepth}</b>` : "";
    
    cells.push(`<span class="${classes.join(" ")}"><small>[${i}]</small><strong>${escapeHtml(c)}</strong><em>${escapeHtml(label)}</em>${stackMarker}</span>`);
  }

  const currentChar = pointer >= 0 && pointer < seq.length ? seq[pointer] : "—";
  const assignment = pointer >= 0 && pointer < seq.length
    ? splitType || (answer[pointer] === 0 ? "A" : answer[pointer] === 1 ? "B" : "—")
    : "—";
  const chooseRule = currentChar === "("
    ? (vi ? "chọn depth nhỏ hơn" : "choose smaller depth")
    : currentChar === ")"
      ? (vi ? "chọn depth lớn hơn" : "choose larger depth")
      : "—";

  const stackCellsA = [];
  const stackCellsB = [];
  
  for (let i = 0; i < Math.max(stackA.length, stackB.length); i++) {
    const hasA = i < stackA.length;
    const hasB = i < stackB.length;
    const depth = i + 1;
    
    stackCellsA.push(`<span class="${hasA ? "occupied" : "empty"}"><small>depth ${depth}</small><strong>${hasA ? `[${stackA[i]}]` : "—"}</strong></span>`);
    stackCellsB.push(`<span class="${hasB ? "occupied" : "empty"}"><small>depth ${depth}</small><strong>${hasB ? `[${stackB[i]}]` : "—"}</strong></span>`);
  }

  const phases = [
    { vi: "Đọc ký tự", en: "Read char", detail: currentChar },
    { vi: "So sánh depth", en: "Compare depths", detail: `A=${depthA}, B=${depthB}` },
    { vi: "Chọn quy tắc", en: "Choose rule", detail: chooseRule },
    { vi: "Gán kết quả", en: "Assign result", detail: assignment },
  ].map((item, index) => {
    const activePhase = view.phase === "intro" ? 0 : view.phase === "process" ? 2 : 3;
    const state = index < activePhase ? "done" : index === activePhase ? "active" : "pending";
    return `<span class="${state}"><small>${state === "done" ? "✓" : index + 1}</small><strong>${escapeHtml(vi ? item.vi : item.en)}</strong><em>${escapeHtml(item.detail)}</em></span>`;
  }).join("");

  $("treeView").innerHTML = `<section class="pa1111-viz" role="img" aria-label="LeetCode 1111: Split parentheses into A and B">
    <div class="pa1111-phases">${phases}</div>
    <section class="pa1111-action">
      <small>${vi ? "DÒNG" : "LINE"} ${Array.isArray(step.codeLines) ? step.codeLines[0] || "—" : "—"}</small>
      <strong>${escapeHtml(pick(step.title))}</strong>
      <span>${escapeHtml(pick(step.note))}</span>
    </section>
    <section class="pa1111-stats">
      <span><small>${vi ? "KÝ TỰ HIỆN TẠI" : "CURRENT CHAR"}</small><strong>${escapeHtml(currentChar)}</strong></span>
      <span><small>DEPTH A</small><strong>${depthA}</strong></span>
      <span><small>DEPTH B</small><strong>${depthB}</strong></span>
      <span><small>${vi ? "GÁN CHO" : "ASSIGN TO"}</small><strong>${escapeHtml(assignment)}</strong></span>
    </section>
    <section class="pa1111-sequence">
      <header><strong>${vi ? "CHUỖI NGOẶC" : "PARENTHESES STRING"}</strong><span>${seq.length} chars</span></header>
      <div class="pa1111-cells">${cells.join("")}</div>
    </section>
    <div class="pa1111-split">
      <section class="pa1111-stack pa1111-stack-a">
        <header><strong>STACK A</strong><span>depth=${maxDepthA}</span></header>
        <div class="pa1111-stack-cells">${stackCellsA.join("")}</div>
        <footer><small>${vi ? "Độ sâu hiện tại" : "Current depth"}</small><strong>${depthA}</strong></footer>
      </section>
      <section class="pa1111-stack pa1111-stack-b">
        <header><strong>STACK B</strong><span>depth=${maxDepthB}</span></header>
        <div class="pa1111-stack-cells">${stackCellsB.join("")}</div>
        <footer><small>${vi ? "Độ sâu hiện tại" : "Current depth"}</strong><strong>${depthB}</strong></footer>
      </section>
    </div>
    <section class="pa1111-rules">
      <strong>${vi ? "QUY TẮC GÁN" : "ASSIGNMENT RULES"}</strong>
      <div class="rule ${currentChar === "(" ? "active" : ""}">
        <small>${vi ? "GẶP '('" : "ON '('"}</small>
        <b>${vi ? "Gán vào chuỗi có depth nhỏ hơn" : "Assign to the shallower string"}</b>
        <em>${vi ? "giữ A và B cân bằng" : "keep A and B balanced"}</em>
      </div>
      <div class="rule ${currentChar === ")" ? "active" : ""}">
        <small>${vi ? "GẶP ')'" : "ON ')'"}</small>
        <b>${vi ? "Gán vào chuỗi có depth lớn hơn" : "Assign to the deeper string"}</b>
        <em>${vi ? "đóng một '(' chưa đóng" : "close an unmatched '('"}</em>
      </div>
    </section>
    <aside class="pa1111-legend">
      <span class="in-a"><i></i>${vi ? "thuộc A" : "in A"}</span>
      <span class="in-b"><i></i>${vi ? "thuộc B" : "in B"}</span>
      <span class="open"><i></i>${vi ? "mở ngoặc '('" : "open '('"}</span>
      <span class="close"><i></i>${vi ? "đóng ngoặc ')'" : "close ')'"}</span>
      <span class="current"><i></i>${vi ? "ký tự hiện tại" : "current char"}</span>
      <span class="in-stack"><i></i>${vi ? "trong stack" : "in stack"}</span>
    </aside>
    <section class="pa1111-result">
      <small>${vi ? "KẾT QUẢ" : "RESULT"}</small>
      <strong>answer = [${answer.join(", ")}]</strong>
      <span>max(depth(A), depth(B)) = max(${maxDepthA}, ${maxDepthB}) = ${Math.max(maxDepthA, maxDepthB)} · ceil(depth(seq)/2) = ceil(${sourceMaxDepth}/2) = ${optimalMaxDepth}</span>
    </section>
  </section>`;
}
