
// ---- Next Permutation (#31): expose the four-part greedy recipe. ----
function renderNextPermutation31View(step) {
  const view = step.nextPermutationView || {};
  const arr = Array.isArray(view.arr) ? view.arr : [];
  const original = Array.isArray(view.original) ? view.original : [];
  const vi = lang === "vi";
  const phaseIndex = { pivot: 0, successor: 1, swap: 2, reverse: 3, done: 4 }[view.phase] ?? 0;
  const phaseLabels = vi
    ? [
        ["Tìm pivot", "cặp tăng đầu tiên từ phải"],
        ["Tìm successor", "số nhỏ nhất > pivot"],
        ["Đổi chỗ", "tăng ít nhất có thể"],
        ["Đảo suffix", "làm phần đuôi nhỏ nhất"],
      ]
    : [
        ["Find pivot", "first rise from the right"],
        ["Find successor", "smallest value > pivot"],
        ["Swap", "make the smallest increase"],
        ["Reverse suffix", "make the tail smallest"],
      ];
  const phases = phaseLabels.map(([label, detail], index) => {
    const skipped = view.hasPivot === false && (index === 1 || index === 2) && phaseIndex >= 3;
    const state = skipped ? "skipped" : phaseIndex > index ? "done" : phaseIndex === index ? "active" : "pending";
    const marker = skipped ? "—" : state === "done" ? "✓" : index + 1;
    return `<span class="${state}"><i>${marker}</i><b>${escapeHtml(label)}</b><small>${skipped ? (vi ? "bỏ qua" : "skipped") : escapeHtml(detail)}</small></span>`;
  }).join("");

  const scanPair = Array.isArray(view.scanPair) ? view.scanPair : [];
  const reversePair = Array.isArray(view.reversePair) ? view.reversePair : [];
  const changed = Array.isArray(view.changed) ? view.changed : [];
  const cells = arr.map((value, index) => {
    const classes = [
      "np31-cell",
      Number.isInteger(view.suffixStart) && index >= view.suffixStart ? "suffix" : "prefix",
      index === view.pivot ? "pivot" : "",
      index === view.successor ? "successor" : "",
      index === view.candidate && view.event === "successor-check" ? "candidate" : "",
      scanPair.includes(index) ? "scanning" : "",
      reversePair.includes(index) ? "reversing" : "",
      changed.includes(index) ? "changed" : "",
      view.phase === "done" ? "finished" : "",
    ].filter(Boolean).join(" ");
    let role = "";
    if (index === view.pivot) role = "pivot · i";
    if (index === view.successor) role = "successor · j";
    if (index === view.candidate && view.event === "successor-check") role = vi ? "đang thử · j" : "candidate · j";
    if (reversePair[0] === index) role = "left";
    if (reversePair[1] === index) role = "right";
    return `<span class="${classes}"><small>index ${index}</small><strong>${escapeHtml(value)}</strong><em>${role || "&nbsp;"}</em></span>`;
  }).join("");

  let action = vi ? "Bắt đầu từ bên phải để thay đổi mảng ít nhất." : "Start from the right to change the array as little as possible.";
  let reason = vi ? "Giữ prefix bên trái càng lâu thì số mới càng gần số cũ." : "Keeping a longer left prefix makes the new number closer to the old one.";
  if (view.event === "pivot-check") {
    action = vi ? "Cặp này vẫn giảm dần → dịch i sang trái." : "This pair is still descending → move i left.";
    reason = vi ? "Ta chưa thể tăng tại vị trí này." : "We cannot increase the permutation at this position yet.";
  } else if (view.event === "pivot-found") {
    action = vi ? `nums[${view.pivot}] là pivot.` : `nums[${view.pivot}] is the pivot.`;
    reason = vi ? "Đây là vị trí ngoài cùng bên phải có thể tăng." : "This is the rightmost position that can be increased.";
  } else if (view.event === "no-pivot") {
    action = vi ? "Không có cặp tăng → bỏ qua successor và swap." : "There is no rising pair → skip successor and pivot swap.";
    reason = vi ? "Mảng đang là hoán vị lớn nhất; đảo toàn bộ để quay về nhỏ nhất." : "The array is the largest permutation; reverse all of it to wrap to the smallest.";
  } else if (view.event === "successor-check") {
    action = vi ? `Ứng viên tại j=${view.candidate} chưa lớn hơn pivot.` : `Candidate at j=${view.candidate} is not greater than the pivot.`;
    reason = vi ? "Dịch j sang trái cho tới khi gặp một giá trị lớn hơn." : "Move j left until a greater value appears.";
  } else if (view.event === "successor-found") {
    action = vi ? `nums[${view.successor}] là successor.` : `nums[${view.successor}] is the successor.`;
    reason = vi ? "Đi từ phải trên suffix giảm dần đảm bảo đây là số lớn hơn nhỏ nhất." : "Scanning the descending suffix from the right guarantees the smallest greater value.";
  } else if (view.event === "swap") {
    action = vi ? `Đổi pivot tại ${view.pivot} với successor tại ${view.successor}.` : `Swap the pivot at ${view.pivot} with the successor at ${view.successor}.`;
    reason = vi ? "Prefix vừa tăng lên mức nhỏ nhất có thể." : "The prefix has now increased by the smallest possible amount.";
  } else if (view.event === "reverse-start") {
    action = vi ? `Đảo đoạn từ index ${view.suffixStart} đến cuối.` : `Reverse from index ${view.suffixStart} to the end.`;
    reason = vi ? "Suffix giảm dần là lớn nhất; đảo lại sẽ thành tăng dần và nhỏ nhất." : "A descending suffix is largest; reversing it makes it ascending and smallest.";
  } else if (view.event === "reverse-swap") {
    action = vi ? `Đổi hai đầu suffix: ${reversePair[0]} ↔ ${reversePair[1]}.` : `Swap the suffix ends: ${reversePair[0]} ↔ ${reversePair[1]}.`;
    reason = vi ? "Tiếp tục thu hai con trỏ vào giữa." : "Continue moving both pointers toward the middle.";
  } else if (view.event === "done") {
    action = vi ? "Hoán vị kế tiếp đã hoàn thành." : "The next permutation is complete.";
    reason = vi ? "Pivot tăng ít nhất + suffix nhỏ nhất = đáp án liền sau theo thứ tự từ điển." : "Smallest pivot increase + smallest suffix = the immediate next lexicographic order.";
  }

  const comparison = view.comparison
    ? `<div class="np31-comparison ${view.comparison.result ? "yes" : "no"}"><small>${vi ? "SO SÁNH" : "COMPARISON"}</small><strong>${escapeHtml(view.comparison.left)} ${escapeHtml(view.comparison.operator)} ${escapeHtml(view.comparison.right)}</strong><b>${view.comparison.result ? (vi ? "ĐÚNG" : "YES") : (vi ? "CHƯA" : "NO")}</b></div>`
    : "";
  const transition = Array.isArray(view.before)
    ? `<div class="np31-transition"><code>[${view.before.map(escapeHtml).join(", ")}]</code><i>→</i><code>[${arr.map(escapeHtml).join(", ")}]</code></div>`
    : "";
  const suffixLabel = Number.isInteger(view.suffixStart)
    ? `${vi ? "suffix bắt đầu tại" : "suffix starts at"} index ${view.suffixStart}`
    : (vi ? "chưa xác định suffix" : "suffix not identified yet");
  const summary = vi
    ? `Bài 31. Mảng hiện tại ${arr.join(", ")}. ${action}`
    : `Problem 31. Current array ${arr.join(", ")}. ${action}`;

  $("treeView").innerHTML = `<section class="np31-viz phase-${escapeHtml(view.phase || "pivot")}" role="img" aria-label="${escapeHtml(summary)}">
    <div class="np31-phases">${phases}</div>
    <section class="np31-rule"><b>${vi ? "MỤC TIÊU" : "GOAL"}</b><strong>${vi ? "Tạo số lớn hơn gần nhất" : "Build the nearest greater order"}</strong><span>${vi ? "Thay đổi bên phải trước, tăng pivot ít nhất, rồi làm suffix nhỏ nhất." : "Change the right side first, raise the pivot minimally, then minimize the suffix."}</span></section>
    <section class="np31-array-card">
      <header><strong>NUMS</strong><span>${escapeHtml(suffixLabel)}</span></header>
      <div class="np31-cells-wrap"><div class="np31-cells" style="--np31-count:${Math.max(arr.length, 1)}">${cells}</div></div>
      <div class="np31-array-legend"><span class="pivot"><i></i>pivot</span><span class="successor"><i></i>successor</span><span class="suffix"><i></i>suffix</span></div>
    </section>
    <section class="np31-explanation">
      <div class="np31-action"><small>${vi ? "ĐANG LÀM" : "ACTION"}</small><strong>${escapeHtml(action)}</strong><span>${escapeHtml(reason)}</span></div>
      ${comparison}
    </section>
    ${transition}
    <footer class="np31-result ${view.phase === "done" ? "ready" : "pending"}"><span><small>${vi ? "BAN ĐẦU" : "ORIGINAL"}</small><strong>[${original.map(escapeHtml).join(", ")}]</strong></span><i>→</i><span><small>${vi ? "HIỆN TẠI" : "CURRENT"}</small><strong>[${arr.map(escapeHtml).join(", ")}]</strong></span></footer>
  </section>`;
}

// ---- Permutations (#46): make choices, current order, and saved results explicit. ----
function renderPermutation46View(step) {
  const view = step.permutation46View || {};
  const nums = Array.isArray(view.nums) ? view.nums : [];
  const used = Array.isArray(view.used) ? view.used : [];
  const current = Array.isArray(view.current) ? view.current : [];
  const activeIndex = Number.isInteger(view.activeIndex) ? view.activeIndex : -1;
  const vi = lang === "vi";
  const phaseLabels = {
    ready: vi ? "Sẵn sàng chọn" : "Ready to choose",
    pick: vi ? "Đang chọn" : "Choosing",
    complete: vi ? "Đã lưu hoán vị" : "Permutation saved",
    backtrack: vi ? "Quay lui" : "Backtracking",
    done: vi ? "Hoàn tất" : "Complete",
  };
  const sourceCells = nums.map((value, index) => {
    const state = index === activeIndex ? (view.phase === "backtrack" ? "release" : "active") : used[index] ? "used" : "free";
    const label = index === activeIndex
      ? (view.phase === "backtrack" ? (vi ? "trả lại" : "release") : (vi ? "chọn" : "pick"))
      : used[index] ? (vi ? "đã dùng" : "used") : (vi ? "còn" : "free");
    return `<span class="perm46-source ${state}"><small>idx=${index}</small><strong>${escapeHtml(String(value))}</strong><em>${label}</em></span>`;
  }).join("");
  const currentSlots = nums.map((_, index) => {
    const value = index < current.length ? String(current[index]) : "—";
    return `<span class="perm46-slot ${index < current.length ? "filled" : "empty"}"><small>${vi ? `vị trí ${index + 1}` : `slot ${index + 1}`}</small><strong>${escapeHtml(value)}</strong></span>`;
  }).join("");
  const lastSaved = Array.isArray(view.lastSaved) ? `[${view.lastSaved.join(", ")}]` : "—";
  const savedCount = Number(view.savedCount) || 0;
  const total = Number(view.total) || 0;
  const treeView = $("treeView");
  treeView.innerHTML = `<section class="perm46-viz" style="--perm46-cols:${Math.max(nums.length, 1)}">
    <header><strong>PERMUTATIONS</strong><span>${escapeHtml(phaseLabels[view.phase] || "")}</span></header>
    <section class="perm46-row source"><header><strong>NUMS</strong><span>${vi ? "mỗi index dùng một lần" : "each index used once"}</span></header><div class="perm46-cells">${sourceCells}</div></section>
    <section class="perm46-row current"><header><strong>CURRENT</strong><span>${current.length}/${nums.length}</span></header><div class="perm46-cells">${currentSlots}</div></section>
    <footer><span><small>${vi ? "VỪA LƯU" : "LAST SAVED"}</small><strong>${escapeHtml(lastSaved)}</strong></span><span class="answer"><small>${vi ? "ĐÃ LƯU" : "SAVED"}</small><strong>${savedCount}/${total}</strong></span></footer>
  </section>`;
}

function renderLexPermutation3720View(step) {
  const view = step.lexPermutationView || {};
  const target = String(view.target || "");
  const prefix = Array.isArray(view.prefix) ? view.prefix : [];
  const activeIndex = Number.isInteger(view.activeIndex) ? view.activeIndex : -1;
  const vi = lang === "vi";
  const phaseText = {
    init: vi ? "Khởi tạo" : "Initialize",
    match: vi ? "Khớp prefix" : "Match prefix",
    blocked: vi ? "Không thể khớp" : "Cannot match",
    greater: vi ? "Chọn lớn hơn" : "Choose greater",
    suffix: vi ? "Điền suffix" : "Fill suffix",
    scan: vi ? "Quét ứng viên" : "Scan candidates",
    backtrack: vi ? "Quay lui" : "Backtrack",
    "no-greater": vi ? "Không thể tăng" : "Cannot increase",
    done: vi ? "Hoàn tất" : "Complete",
    fail: vi ? "Không có đáp án" : "No answer",
  };
  const targetCells = [...target].map((char, index) => {
    const state = index === activeIndex ? (view.phase === "backtrack" || view.phase === "no-greater" ? "blocked" : "active") : index < activeIndex ? "matched" : "";
    return `<span class="lex3720-cell ${state}"><small>i=${index}</small><strong>${escapeHtml(char)}</strong></span>`;
  }).join("");
  const outputCells = Array.from({ length: target.length }, (_, index) => {
    const char = prefix[index] || "—";
    const state = index === activeIndex && ["greater", "suffix", "done"].includes(view.phase)
      ? "greater"
      : index < prefix.length ? "filled" : "empty";
    return `<span class="lex3720-cell output ${state}"><small>${vi ? `vị trí ${index}` : `slot ${index}`}</small><strong>${escapeHtml(char)}</strong></span>`;
  }).join("");
  const pool = Array.isArray(view.remaining) ? view.remaining : [];
  const poolCells = pool.length
    ? pool.map((item) => `<span class="${item.amount < 0 ? "negative" : ""}"><strong>${escapeHtml(item.char)}</strong><small>x${item.amount}</small></span>`).join("")
    : `<em>${vi ? "rỗng" : "empty"}</em>`;
  const poolLabel = view.poolLabel || (vi ? "KÝ TỰ CÒN LẠI" : "REMAINING POOL");
  const poolSummary = view.poolSummary ?? pool.reduce((total, item) => total + item.amount, 0);
  const treeView = $("treeView");
  treeView.innerHTML = `<section class="lex3720-viz" style="--lex3720-cols:${Math.max(target.length, 1)}">
    <header><strong>LEXICOGRAPHIC GREEDY</strong><span>${escapeHtml(phaseText[view.phase] || "")}</span></header>
    <section class="lex3720-row target"><header><strong>TARGET</strong><span>${escapeHtml(target)}</span></header><div class="lex3720-cells">${targetCells}</div></section>
    <section class="lex3720-row output"><header><strong>BUILD</strong><span>${escapeHtml(prefix.join("") || "—")}</span></header><div class="lex3720-cells">${outputCells}</div></section>
    <section class="lex3720-pool"><header><strong>${escapeHtml(poolLabel)}</strong><span>${escapeHtml(String(poolSummary))}</span></header><div>${poolCells}</div></section>
  </section>`;
}

function renderPalindromicPermutation3734View(step) {
  const view = step.palindrome3734View || {};
  const target = String(view.target || "");
  const source = String(view.s || "");
  const middle = String(view.middle || "");
  const candidate = String(view.candidate || "");
  const draft = Array.isArray(view.draft) ? view.draft : [];
  const shown = candidate ? [...candidate] : Array.from({ length: target.length }, (_, index) => draft[index] || "");
  const activeIndex = Number.isInteger(view.activeIndex) ? view.activeIndex : -1;
  const halfLength = Math.floor(target.length / 2);
  const vi = lang === "vi";
  const phaseText = {
    count: vi ? "Đếm ký tự" : "Count characters",
    invalid: vi ? "Không tạo được palindrome" : "Palindrome impossible",
    split: vi ? "Tách thành các cặp" : "Split into pairs",
    match: vi ? "Khớp nửa trái" : "Match left half",
    blocked: vi ? "Prefix bị chặn" : "Prefix blocked",
    compare: vi ? "So sánh toàn palindrome" : "Compare full palindrome",
    scan: vi ? "Quét cặp lớn hơn" : "Scan larger pairs",
    greater: vi ? "Đã tăng nửa trái" : "Left half increased",
    suffix: vi ? "Điền suffix nhỏ nhất" : "Fill smallest suffix",
    backtrack: vi ? "Quay lui nửa trái" : "Backtrack left half",
    done: vi ? "Hoàn tất" : "Complete",
    fail: vi ? "Không có đáp án" : "No answer",
  };
  const targetCells = [...target].map((char, index) => {
    const mirror = target.length - 1 - activeIndex;
    const state = index === activeIndex ? "active" : index === mirror && activeIndex >= 0 ? "mirror-active" : "";
    return `<span class="pal3734-cell ${state}"><small>i=${index}</small><strong>${escapeHtml(char)}</strong></span>`;
  }).join("");
  const palindromeCells = shown.map((char, index) => {
    const isCenter = target.length % 2 === 1 && index === halfLength;
    const side = isCenter ? "center" : index < halfLength ? "left" : "right";
    const mirror = target.length - 1 - activeIndex;
    const isActive = index === activeIndex || (activeIndex >= 0 && index === mirror);
    let state = char ? "filled" : "empty";
    if (isActive) state += " active";
    if (candidate && view.phase === "done") state += " done";
    if (view.phase === "backtrack" && isActive) state += " release";
    const label = isCenter
      ? (vi ? "tâm" : "center")
      : index < halfLength
        ? (vi ? `trái ${index}` : `left ${index}`)
        : (vi ? `gương ${target.length - 1 - index}` : `mirror ${target.length - 1 - index}`);
    return `<span class="pal3734-cell build ${side} ${state}"><small>${escapeHtml(label)}</small><strong>${escapeHtml(char || "—")}</strong></span>`;
  }).join("");
  const remaining = Array.isArray(view.remaining) ? view.remaining : [];
  const pairCells = remaining.length
    ? remaining.map((item) => `<span><strong>${escapeHtml(item.char)}</strong><small>× ${item.amount} ${vi ? "cặp" : "pair"}${item.amount === 1 ? "" : "s"}</small></span>`).join("")
    : `<em>${vi ? "không còn cặp" : "no pairs remain"}</em>`;
  const sourceCounts = Array.isArray(view.fullCount) ? view.fullCount : [];
  const sourceSummary = sourceCounts.map((item) => `${item.char}×${item.amount}`).join("  ");
  const relation = candidate ? (candidate > target ? ">" : candidate === target ? "=" : "<") : "?";
  const relationState = candidate ? (candidate > target ? "greater" : "not-greater") : "pending";
  const treeView = $("treeView");
  treeView.innerHTML = `<section class="pal3734-viz" style="--pal3734-cols:${Math.max(target.length, 1)}">
    <header><strong>PALINDROMIC GREEDY</strong><span>${escapeHtml(phaseText[view.phase] || "")}</span></header>
    <section class="pal3734-source"><span><small>SOURCE</small><strong>${escapeHtml(source)}</strong></span><span><small>${vi ? "TẦN SUẤT" : "FREQUENCY"}</small><strong>${escapeHtml(sourceSummary || "—")}</strong></span><span><small>${vi ? "KÝ TỰ GIỮA" : "CENTER"}</small><strong>${escapeHtml(middle || (vi ? "không có" : "none"))}</strong></span></section>
    <section class="pal3734-row target"><header><strong>TARGET</strong><span>${escapeHtml(target)}</span></header><div class="pal3734-cells">${targetCells}</div></section>
    <section class="pal3734-row palindrome"><header><strong>${vi ? "PALINDROME ĐANG DỰNG" : "PALINDROME BUILD"}</strong><span>${vi ? "nửa phải = phản chiếu nửa trái" : "right half = mirror of left half"}</span></header><div class="pal3734-cells">${palindromeCells}</div></section>
    <section class="pal3734-pool"><header><strong>${vi ? "POOL NỬA TRÁI" : "LEFT-HALF POOL"}</strong><span>${vi ? "mỗi phần tử đặt vào hai ô" : "each item fills two slots"}</span></header><div>${pairCells}</div></section>
    <footer><span><small>${vi ? "SO SÁNH TOÀN CHUỖI" : "FULL-STRING COMPARISON"}</small><strong>${escapeHtml(candidate || (vi ? "chưa dựng xong" : "not complete"))}</strong></span><b class="${relationState}">${escapeHtml(relation)}</b><span><small>TARGET</small><strong>${escapeHtml(target)}</strong></span></footer>
  </section>`;
}

// ---- Palindrome Partitioning (#131): show the backtracking state directly. ----
function renderPalindromePartitionView(step) {
  const view = step.palindromePartitionView || {};
  const vi = lang === "vi";
  const s = String(view.s || "");
  const chars = Array.from(s);
  const path = Array.isArray(view.path) ? view.path : [];
  const stack = Array.isArray(view.stack) ? view.stack : [];
  const results = Array.isArray(view.results) ? view.results : [];
  const start = Number.isInteger(view.start) ? view.start : null;
  const end = Number.isInteger(view.end) ? view.end : null;
  const piece = view.piece === null || view.piece === undefined ? "" : String(view.piece);
  const hasCandidate = start !== null && end !== null && end > start;
  const action = String(view.action || "intro");
  const phaseIndex = action === "done" ? 4
    : ["save", "saved", "return"].includes(action) ? 3
      : ["choose", "recurse", "backtrack"].includes(action) ? 2
        : ["try", "check-pass", "check-fail"].includes(action) ? 1 : 0;
  const phaseLabels = vi
    ? ["Chọn mảnh", "Kiểm tra palindrome", "Đi sâu / quay lui", "Lưu đáp án"]
    : ["Choose a piece", "Check palindrome", "Recurse / backtrack", "Save answer"];
  const phasesHtml = phaseLabels.map((label, index) => {
    const state = phaseIndex === 4 || index < phaseIndex ? "done" : index === phaseIndex ? "active" : "";
    return `<span class="${state}"><i>${state === "done" ? "✓" : index + 1}</i><b>${escapeHtml(label)}</b></span>`;
  }).join("");

  let pathCursor = 0;
  const chosenRanges = path.map((value) => {
    const from = pathCursor;
    pathCursor += String(value).length;
    return { from, to: pathCursor, value: String(value) };
  });
  const cellHtml = chars.length ? chars.map((char, index) => {
    const chosen = chosenRanges.find((range) => index >= range.from && index < range.to);
    const candidate = hasCandidate && index >= start && index < end;
    const classes = ["pp131-char"];
    if (chosen) classes.push("is-chosen");
    if (candidate && !chosen) classes.push("is-candidate");
    if (start === index && hasCandidate) classes.push("is-start");
    if (end === index + 1 && hasCandidate) classes.push("is-end");
    if (start !== null && index >= start && !candidate && !chosen) classes.push("is-remaining");
    const pointer = start === index && hasCandidate ? `<em>start=${start}</em>` : "";
    return `<div class="${classes.join(" ")}">${pointer}<small>[${index}]</small><strong>${escapeHtml(char)}</strong></div>`;
  }).join("") : `<div class="pp131-empty">${vi ? "Chuỗi rỗng" : "Empty string"}</div>`;
  const cutsHtml = chosenRanges.length
    ? chosenRanges.map((range, index) => `<span class="${view.removed === range.value ? "is-removed" : ""}"><small>${range.from}:${range.to}</small><strong>"${escapeHtml(range.value)}"</strong>${index < chosenRanges.length - 1 ? "<b>|</b>" : ""}</span>`).join("")
    : `<em>${vi ? "path = [] — chưa chọn mảnh nào" : "path = [] — no piece selected"}</em>`;

  const reversed = Array.from(piece).reverse().join("");
  const gateState = view.palindrome === true ? "pass" : view.palindrome === false ? "fail" : "waiting";
  const gateWord = gateState === "pass" ? "PASS" : gateState === "fail" ? "SKIP" : "?";
  const gateDetail = hasCandidate
    ? `"${piece}" ${view.palindrome === null ? "?" : view.palindrome ? "==" : "!="} "${reversed}"`
    : (vi ? "Chọn một đoạn để kiểm tra" : "Choose a piece to check");
  const gateExplain = gateState === "pass"
    ? (vi ? "Palindrome → được gọi bt(end, path)." : "Palindrome → call bt(end, path).")
    : gateState === "fail"
      ? (vi ? "Không phải palindrome → không đệ quy." : "Not a palindrome → do not recurse.")
      : (vi ? "Chỉ đoạn PASS mới được đưa vào path." : "Only a PASS piece can enter path.");

  const stackHtml = stack.length
    ? stack.map((frame, index) => {
      const framePath = Array.isArray(frame.path) && frame.path.length ? `[${frame.path.map((value) => `"${value}"`).join(", ")}]` : "[]";
      return `<span class="${index === stack.length - 1 ? "is-active" : ""}"><small>${vi ? "frame" : "frame"} ${index + 1}</small><strong>bt(${escapeHtml(String(frame.start))})</strong><em>${escapeHtml(framePath)}</em></span>`;
    }).join("<b class=\"pp131-stack-arrow\">→</b>")
    : `<em>${vi ? "Chưa ở trong lời gọi bt nào" : "Not inside a bt call"}</em>`;
  const resultsHtml = results.length
    ? results.map((partition, index) => {
      const text = `[${partition.map((value) => `"${value}"`).join(", ")}]`;
      const newest = Array.isArray(view.justSaved) && JSON.stringify(view.justSaved) === JSON.stringify(partition);
      return `<span class="${newest ? "is-new" : ""}"><small>#${index + 1}</small>${escapeHtml(text)}</span>`;
    }).join("")
    : `<em>${vi ? "Chưa có đáp án — cần đi đến cuối chuỗi." : "No answer yet — reach the end of the string."}</em>`;
  const activeLine = Array.isArray(step.codeLines) ? step.codeLines[0] : null;
  const summary = vi
    ? `Palindrome Partitioning cho chuỗi ${s}. Path hiện tại có ${path.length} mảnh, đã lưu ${results.length} đáp án.`
    : `Palindrome Partitioning for ${s}. The current path has ${path.length} pieces and ${results.length} answers are saved.`;

  $("treeView").innerHTML = `<section class="pp131-viz" role="img" aria-label="${escapeHtml(summary)}">
    <div class="pp131-phases">${phasesHtml}</div>
    <section class="pp131-string-section">
      <header><strong>${vi ? "CHUỖI GỐC" : "ORIGINAL STRING"}</strong><span>${hasCandidate ? `candidate = s[${start}:${end}]` : (vi ? "mỗi ô là một ký tự" : "one cell per character")}</span></header>
      <div class="pp131-chars">${cellHtml}</div>
      <div class="pp131-legend"><span><i class="chosen"></i>${vi ? "đã ở trong path" : "already in path"}</span><span><i class="candidate"></i>${vi ? "đang thử" : "candidate"}</span><span><i class="remaining"></i>${vi ? "chưa xử lý" : "not processed"}</span></div>
    </section>
    <div class="pp131-main-row">
      <section class="pp131-path-section"><header><strong>path</strong><span>${vi ? "các mảnh đã chọn tạm thời" : "temporarily chosen pieces"}</span></header><div class="pp131-cuts">${cutsHtml}</div></section>
      <section class="pp131-gate ${gateState}"><header><strong>${vi ? "CỔNG PALINDROME" : "PALINDROME GATE"}</strong><b>${gateWord}</b></header><code>${escapeHtml(gateDetail)}</code><span>${escapeHtml(gateExplain)}</span></section>
    </div>
    <section class="pp131-stack-section"><header><strong>CALL STACK</strong><span>${vi ? "frame cuối là lời gọi đang chạy" : "the last frame is running now"}</span></header><div class="pp131-stack">${stackHtml}</div></section>
    <section class="pp131-results-section"><header><strong>res</strong><span>${results.length} ${vi ? "partition đã lưu" : "saved partitions"}</span></header><div class="pp131-results">${resultsHtml}</div></section>
    <div class="pp131-action"><small>${vi ? "DÒNG" : "LINE"} ${activeLine ?? "—"}</small><strong>${escapeHtml(pick(step.title))}</strong><span>${escapeHtml(pick(step.note))}</span></div>
  </section>`;
}

// ---- Jewels and Stones (#771): make each set membership check explicit. ----
function renderJewelsStonesView(step) {
  const view = step.jewelsStonesView || {};
  const vi = lang === "vi";
  const jewelTypes = Array.isArray(view.jewelTypes) ? view.jewelTypes : [];
  const stones = Array.from(String(view.stones || ""));
  const states = Array.isArray(view.stoneStates) ? view.stoneStates : [];
  const phase = String(view.phase || "init");
  const currentIndex = Number.isInteger(view.currentIndex) ? view.currentIndex : null;
  const currentStone = currentIndex === null ? null : String(view.currentStone ?? "");
  const count = Number(view.count) || 0;
  const phaseIndex = phase === "done" ? 3 : ["match", "skip"].includes(phase) ? 1 : 0;
  const phases = (vi ? ["Tạo jewel_set", "Kiểm tra 1 viên", "Cộng kết quả"] : ["Build jewel_set", "Check one stone", "Add result"])
    .map((label, index) => {
      const state = phaseIndex === 3 || index < phaseIndex ? "done" : index === phaseIndex ? "active" : "";
      return `<span class="${state}"><i>${state === "done" ? "✓" : index + 1}</i><b>${escapeHtml(label)}</b></span>`;
    }).join("");
  const jewelHtml = jewelTypes.length
    ? jewelTypes.map((type) => `<span><small>${vi ? "loại jewel" : "jewel type"}</small><strong>${escapeHtml(type)}</strong></span>`).join("")
    : `<em>${vi ? "Không có loại đá quý nào" : "No jewel types"}</em>`;
  const stoneHtml = stones.length
    ? stones.map((stone, index) => {
      const state = states[index] || "waiting";
      const label = state === "matched" || state === "active-match" ? "+1" : state === "skipped" || state === "active-skip" ? "0" : "?";
      return `<div class="js771-stone ${escapeHtml(state)}"><small>stones[${index}]</small><strong>${escapeHtml(stone)}</strong><em>${label}</em></div>`;
    }).join("")
    : `<em>${vi ? "stones rỗng" : "stones is empty"}</em>`;
  const gateState = view.isJewel === true ? "match" : view.isJewel === false ? "skip" : "waiting";
  const gateLabel = gateState === "match" ? (vi ? "CÓ · +1" : "YES · +1") : gateState === "skip" ? (vi ? "KHÔNG · +0" : "NO · +0") : "?";
  const gateExpression = currentStone === null
    ? (vi ? "Chọn viên đá tiếp theo để tra set" : "Choose the next stone to look up in the set")
    : `"${currentStone}" ${view.isJewel ? "∈" : "∉"} jewel_set`;
  const gateDetail = gateState === "match"
    ? (vi ? `"${currentStone}" đúng là một loại đá quý, nên count tăng lên ${count}.` : `"${currentStone}" is a jewel type, so count increases to ${count}.`)
    : gateState === "skip"
      ? (vi ? `"${currentStone}" không phải đá quý, nên count giữ nguyên ${count}.` : `"${currentStone}" is not a jewel, so count remains ${count}.`)
      : (vi ? "Set lookup là O(1) trung bình. Hoa và thường là hai ký tự khác nhau: a ≠ A." : "A set lookup is O(1) on average. Uppercase and lowercase are different: a ≠ A.");
  const actionDetail = phase === "done"
    ? (vi ? `Đã kiểm tra hết ${stones.length} viên. Mỗi thẻ xanh đóng góp 1 vào đáp án.` : `All ${stones.length} stones were checked. Every green card contributes 1 to the answer.`)
    : currentIndex === null
      ? (vi ? "Chuẩn bị set trước, sau đó duyệt lần lượt stones từ trái sang phải." : "Prepare the set, then scan stones left to right.")
      : (vi ? `Đang xét đúng một viên: stones[${currentIndex}] = "${currentStone}".` : `Examining exactly one stone: stones[${currentIndex}] = "${currentStone}".`);
  const summary = vi
    ? `Jewels and Stones. Có ${jewelTypes.length} loại đá quý, đang đếm ${stones.length} viên đá.`
    : `Jewels and Stones. ${jewelTypes.length} jewel types and ${stones.length} stones to count.`;

  $("treeView").innerHTML = `<section class="js771-viz" role="img" aria-label="${escapeHtml(summary)}">
    <div class="js771-phases">${phases}</div>
    <section class="js771-set-section"><header><strong>jewel_set</strong><span>${vi ? "mỗi ký tự = một loại đá quý" : "each character = one jewel type"}</span></header><div class="js771-jewels">${jewelHtml}</div><p>${vi ? "Phân biệt chữ hoa/thường: a và A là hai loại khác nhau." : "Case-sensitive: a and A are two different types."}</p></section>
    <section class="js771-stones-section"><header><strong>stones</strong><span>${vi ? "xanh = cộng 1 · xám = cộng 0 · vàng = đang xét" : "green = +1 · gray = +0 · yellow = checking"}</span></header><div class="js771-stones">${stoneHtml}</div></section>
    <div class="js771-bottom-row">
      <section class="js771-gate ${gateState}"><header><strong>${vi ? "TRA SET" : "SET LOOKUP"}</strong><b>${gateLabel}</b></header><code>${escapeHtml(gateExpression)}</code><span>${escapeHtml(gateDetail)}</span></section>
      <section class="js771-count"><small>count</small><strong>${count}</strong><span>${vi ? "số stone là jewel" : "stones that are jewels"}</span></section>
    </div>
    <div class="js771-action"><small>${vi ? "DÒNG" : "LINE"} ${(step.codeLines || [])[0] ?? "—"}</small><strong>${escapeHtml(pick(step.title))}</strong><span>${escapeHtml(actionDetail)}</span></div>
  </section>`;
}

function renderNonDecreasingSubsequencesView(step) {
  const view = step.nonDecreasingView || {};
  const vi = lang === "vi";
  const nums = Array.isArray(view.nums) ? view.nums : [];
  const current = Array.isArray(view.current) ? view.current : [];
  const chosenIndices = Array.isArray(view.chosenIndices) ? view.chosenIndices : [];
  const used = Array.isArray(view.used) ? view.used : [];
  const results = Array.isArray(view.results) ? view.results : [];
  const chosenOrder = new Map(chosenIndices.map((index, order) => [index, order + 1]));
  const candidateKnown = Number.isInteger(view.i);
  const duplicateKnown = typeof view.duplicate === "boolean";
  const orderKnown = typeof view.orderOk === "boolean";
  const duplicateRejected = view.duplicate === true;
  const orderRejected = view.orderOk === false;
  const accepted = candidateKnown && view.duplicate === false && view.orderOk === true;
  const activePhase = view.action === "result" || view.action === "save"
    ? 2
    : new Set(["loop", "duplicate-check", "skip-duplicate", "order-check", "skip-order", "used-add", "choose", "recurse", "backtrack"]).has(view.action)
      ? 1
      : 0;
  const phaseLabels = vi
    ? ["1. Mở một frame", "2. Lọc rồi chọn", "3. Lưu đáp án"]
    : ["1. Open a frame", "2. Filter then choose", "3. Save answers"];
  const phaseHtml = phaseLabels.map((label, index) => {
    const state = index < activePhase ? "is-done" : index === activePhase ? "is-active" : "";
    return `<span class="${state}">${index < activePhase ? "✓" : ""}<b>${escapeHtml(label)}</b></span>`;
  }).join("");

  const arrayHtml = nums.map((value, index) => {
    const classes = ["nds-number"];
    if (chosenOrder.has(index)) classes.push("is-chosen");
    if (index === view.i) classes.push("is-candidate");
    if (index === view.i && duplicateRejected) classes.push("is-duplicate-reject");
    if (index === view.i && orderRejected) classes.push("is-order-reject");
    if (index === view.i && accepted) classes.push("is-accepted");
    if (Number.isInteger(view.start) && index < view.start && !chosenOrder.has(index)) classes.push("is-before-start");
    let pointer = "";
    if (index === view.i) pointer = `<span class="nds-pointer">i</span>`;
    else if (chosenOrder.has(index)) pointer = `<span class="nds-pick-order">#${chosenOrder.get(index)}</span>`;
    const start = Number.isInteger(view.start) && index === view.start
      ? `<em class="nds-start">start</em>`
      : "";
    return `<div class="${classes.join(" ")}">${pointer}${start}<small>[${index}]</small><strong>${escapeHtml(value)}</strong></div>`;
  }).join("");

  const currentHtml = current.length
    ? current.map((value, index) => `<span><small>#${index + 1}</small><strong>${escapeHtml(value)}</strong></span>`).join("<b>→</b>")
    : `<em>∅</em>`;
  const usedHtml = used.length
    ? used.map((value) => `<span>${escapeHtml(value)}</span>`).join("")
    : `<em>{ }</em>`;
  const stackHtml = Array.isArray(view.callStack) && view.callStack.length
    ? view.callStack.map((frame, index) => `<span class="${index === view.callStack.length - 1 ? "is-active" : ""}"><small>d=${frame.depth}</small><strong>backtrack(${frame.start})</strong></span>`).join("<b>→</b>")
    : `<em>${vi ? "chưa vào hàm" : "not entered"}</em>`;

  function checkClass(known, pass) {
    if (!known) return "is-pending";
    return pass ? "is-pass" : "is-fail";
  }
  const uniquePass = duplicateKnown ? !view.duplicate : false;
  const orderText = view.last === null
    ? (vi ? "current rỗng" : "current is empty")
    : candidateKnown
      ? `${view.candidate} >= ${view.last}`
      : "nums[i] >= current[-1]";
  const checksHtml = `<div class="nds-check ${checkClass(duplicateKnown, uniquePass)}">
      <b>1</b><span><strong>nums[i] ∉ used</strong><small>${duplicateKnown ? `${view.candidate} ${uniquePass ? "∉" : "∈"} {${used.join(", ")}}` : (vi ? "chưa kiểm tra" : "not checked")}</small></span><em>${duplicateKnown ? (uniquePass ? "PASS" : "SKIP") : "?"}</em>
    </div>
    <div class="nds-check ${checkClass(orderKnown, view.orderOk)}">
      <b>2</b><span><strong>${vi ? "Không làm dãy giảm" : "Does not decrease"}</strong><small>${escapeHtml(orderText)}</small></span><em>${orderKnown ? (view.orderOk ? "PASS" : "SKIP") : "?"}</em>
    </div>`;

  const resultHtml = results.length
    ? results.map((sequence, index) => {
      const newest = view.action === "save" && index === results.length - 1;
      return `<span class="${newest ? "is-new" : ""}">[${sequence.map(escapeHtml).join(", ")}]</span>`;
    }).join("")
    : `<em>${vi ? "chưa có đáp án" : "no answers yet"}</em>`;
  const truncated = view.resultCount > results.length
    ? `<small>+${view.resultCount - results.length} ${vi ? "đáp án trước" : "earlier"}</small>`
    : "";
  const summary = vi
    ? `Non-decreasing Subsequences; current có ${current.length} phần tử; đã lưu ${view.resultCount || 0} đáp án.`
    : `Non-decreasing Subsequences; current has ${current.length} values; ${view.resultCount || 0} answers saved.`;

  $("treeView").innerHTML = `<section class="nds-viz" role="img" aria-label="${escapeHtml(summary)}">
    <div class="nds-phases">${phaseHtml}</div>
    <div class="nds-frame-bar">
      <span><small>FRAME</small><strong>${Number.isInteger(view.start) ? `backtrack(${view.start})` : "—"}</strong></span>
      <span><small>DEPTH</small><strong>${escapeHtml(view.depth ?? 0)}</strong></span>
      <span><small>${vi ? "ĐÁP ÁN" : "ANSWERS"}</small><strong>${escapeHtml(view.resultCount ?? 0)}</strong></span>
    </div>
    <section class="nds-array-section"><header><strong>nums</strong><span>${vi ? "giữ nguyên thứ tự index" : "preserve index order"}</span></header><div class="nds-array">${arrayHtml}</div></section>
    <div class="nds-state-row">
      <section class="nds-current-section"><header><strong>current</strong><span>${vi ? "subsequence đang xây" : "subsequence being built"}</span></header><div class="nds-current">${currentHtml}</div></section>
      <section class="nds-used-section"><header><strong>used</strong><span>${vi ? "chỉ thuộc frame hiện tại" : "current frame only"}</span></header><div class="nds-used">${usedHtml}</div></section>
    </div>
    <section class="nds-checks-section"><header><strong>${vi ? "HAI CỔNG TRƯỚC KHI CHỌN" : "TWO GATES BEFORE CHOOSING"}</strong><span>${candidateKnown ? `nums[${view.i}] = ${view.candidate}` : (vi ? "chưa có ứng viên" : "no candidate")}</span></header><div class="nds-checks">${checksHtml}</div></section>
    <section class="nds-stack-section"><header><strong>CALL STACK</strong><span>start → i + 1</span></header><div class="nds-stack">${stackHtml}</div></section>
    <section class="nds-results-section"><header><strong>result</strong><span>${view.resultCount || 0} ${vi ? "dãy khác nhau" : "distinct sequences"}</span></header><div class="nds-results">${resultHtml}</div>${truncated}</section>
    <div class="nds-action"><strong>${escapeHtml(pick(step.title))}</strong><span>${escapeHtml(pick(step.note))}</span></div>
    <div class="nds-legend"><span><i class="chosen"></i>${vi ? "đã chọn" : "chosen"}</span><span><i class="candidate"></i>${vi ? "đang xét" : "candidate"}</span><span><i class="duplicate"></i>${vi ? "trùng level" : "same-level duplicate"}</span><span><i class="decrease"></i>${vi ? "làm dãy giảm" : "would decrease"}</span></div>
  </section>`;
}

function renderPredictWinnerView(step) {
  const view = step.predictWinnerView;
  const vi = lang === "vi";
  const hasI = Number.isInteger(view.i);
  const hasJ = Number.isInteger(view.j);
  const intervalReady = hasI && hasJ;
  const intervalStage = new Set(["length", "interval-start", "interval", "take-left", "take-right", "choose"]);
  const activeStage = view.phase === "done" ? 2 : intervalStage.has(view.phase) ? 1 : 0;
  const phaseLabels = vi
    ? ["1. Đoạn dài 1", "2. Ghép đoạn dài hơn", "3. Kiểm tra Player 1"]
    : ["1. Length-1 intervals", "2. Build longer intervals", "3. Check Player 1"];
  const phasesHtml = phaseLabels.map((label, index) => {
    const state = index < activeStage ? "is-done" : index === activeStage ? "is-active" : "";
    return `<span class="${state}">${index < activeStage ? "✓" : ""}<b>${escapeHtml(label)}</b></span>`;
  }).join("");

  const arrayHtml = view.nums.map((value, index) => {
    const classes = ["predict-winner-number"];
    if (intervalReady && (index < view.i || index > view.j)) classes.push("is-outside");
    if (hasI && index === view.i) classes.push("is-left");
    if (hasJ && index === view.j) classes.push("is-right");
    if (hasI && hasJ && view.i === view.j && index === view.i) classes.push("is-only");
    let pointers = "";
    if (hasI && hasJ && view.i === view.j && index === view.i) {
      pointers = `<span>${vi ? "CHỈ CÒN" : "ONLY"}</span>`;
    } else {
      if (hasI && index === view.i) pointers += `<span>L · i</span>`;
      if (hasJ && index === view.j) pointers += `<span>R · j</span>`;
    }
    return `<div class="${classes.join(" ")}">
      <div class="predict-winner-pointers">${pointers}</div>
      <strong>${escapeHtml(value)}</strong>
      <small>[${index}]</small>
    </div>`;
  }).join("");

  const leftDependency = intervalReady && view.i + 1 <= view.j ? [view.i + 1, view.j] : null;
  const rightDependency = intervalReady && view.i <= view.j - 1 ? [view.i, view.j - 1] : null;
  let dpCells = `<div class="predict-winner-dp-cell is-corner">i \\ j</div>`;
  view.nums.forEach((value, j) => {
    dpCells += `<div class="predict-winner-dp-cell is-header"><small>j=${j}</small><strong>${escapeHtml(value)}</strong></div>`;
  });
  view.dp.forEach((row, i) => {
    dpCells += `<div class="predict-winner-dp-cell is-header"><small>i=${i}</small><strong>${escapeHtml(view.nums[i])}</strong></div>`;
    row.forEach((value, j) => {
      const classes = ["predict-winner-dp-cell"];
      if (i > j) classes.push("is-unused");
      if (i === view.i && j === view.j) classes.push("is-active");
      if (leftDependency && i === leftDependency[0] && j === leftDependency[1]) classes.push("is-left-dependency");
      if (rightDependency && i === rightDependency[0] && j === rightDependency[1]) classes.push("is-right-dependency");
      if (value !== null) classes.push("is-filled");
      const cellValue = i > j ? "" : value === null ? "·" : value;
      dpCells += `<div class="${classes.join(" ")}" role="gridcell" aria-label="dp ${i} ${j}: ${cellValue || "unused"}">
        <small>${i <= j ? `[${i},${j}]` : ""}</small><strong>${escapeHtml(cellValue)}</strong>
      </div>`;
    });
  });

  const leftOpponent = leftDependency ? view.dp[leftDependency[0]][leftDependency[1]] : null;
  const rightOpponent = rightDependency ? view.dp[rightDependency[0]][rightDependency[1]] : null;
  const leftKnown = view.takeLeft !== null;
  const rightKnown = view.takeRight !== null;
  const leftClasses = ["predict-winner-choice", "is-left-choice"];
  const rightClasses = ["predict-winner-choice", "is-right-choice"];
  if (view.phase === "take-left") leftClasses.push("is-current");
  if (view.phase === "take-right") rightClasses.push("is-current");
  if (view.phase === "choose" || view.phase === "done") {
    if (view.picked === "left") {
      leftClasses.push("is-picked");
      rightClasses.push("is-rejected");
    } else {
      rightClasses.push("is-picked");
      leftClasses.push("is-rejected");
    }
  }
  const leftChoiceHtml = intervalReady && view.i !== view.j
    ? `<div class="${leftClasses.join(" ")}">
        <div><b>${vi ? "LẤY TRÁI" : "TAKE LEFT"}</b><strong>${escapeHtml(view.nums[view.i])}</strong></div>
        <code>${escapeHtml(view.nums[view.i])} - dp[${view.i + 1}][${view.j}]</code>
        <span>${escapeHtml(view.nums[view.i])} - ${escapeHtml(leftOpponent)} = <b>${leftKnown ? escapeHtml(view.takeLeft) : "?"}</b></span>
      </div>`
    : "";
  const rightChoiceHtml = intervalReady && view.i !== view.j
    ? `<div class="${rightClasses.join(" ")}">
        <div><b>${vi ? "LẤY PHẢI" : "TAKE RIGHT"}</b><strong>${escapeHtml(view.nums[view.j])}</strong></div>
        <code>${escapeHtml(view.nums[view.j])} - dp[${view.i}][${view.j - 1}]</code>
        <span>${escapeHtml(view.nums[view.j])} - ${escapeHtml(rightOpponent)} = <b>${rightKnown ? escapeHtml(view.takeRight) : "?"}</b></span>
      </div>`
    : "";

  let actionMain;
  let actionDetail;
  let actionClass = "";
  if (view.phase === "init") {
    actionMain = "dp[i][j]";
    actionDetail = vi ? "lợi thế tối đa của người sắp chơi trên đoạn [i..j]" : "best advantage for the player about to move on [i..j]";
  } else if (view.phase === "base") {
    actionMain = `dp[${view.i}][${view.j}] = ${view.nums[view.i]}`;
    actionDetail = vi ? "Một số duy nhất: lấy nó, đối thủ không còn điểm trong đoạn này." : "One number remains: take it, leaving no score in this interval for the opponent.";
  } else if (view.phase === "length") {
    actionMain = `length = ${view.length}`;
    actionDetail = vi ? "Chỉ dùng kết quả từ các đoạn ngắn hơn đã được tính." : "Use only previously computed shorter intervals.";
  } else if (view.phase === "interval-start") {
    actionMain = `i = ${view.i}`;
    actionDetail = vi ? "Đặt đầu trái; j sẽ được tính từ i và length." : "Set the left endpoint; j is computed from i and length.";
  } else if (view.phase === "interval") {
    actionMain = `[i, j] = [${view.i}, ${view.j}]`;
    actionDetail = vi ? `Chỉ có thể lấy ${view.nums[view.i]} bên trái hoặc ${view.nums[view.j]} bên phải.` : `Only ${view.nums[view.i]} on the left or ${view.nums[view.j]} on the right can be taken.`;
  } else if (view.phase === "take-left") {
    actionMain = `take_left = ${view.takeLeft}`;
    actionDetail = vi ? "Điểm lấy được trừ lợi thế tối ưu của đối thủ trong đoạn còn lại." : "Score taken minus the opponent's optimal advantage on the remaining interval.";
  } else if (view.phase === "take-right") {
    actionMain = `take_right = ${view.takeRight}`;
    actionDetail = vi ? "Tính tương tự khi lấy số ngoài cùng bên phải." : "Apply the same calculation after taking the rightmost number.";
  } else if (view.phase === "choose") {
    actionMain = `max(${view.takeLeft}, ${view.takeRight}) = ${view.dp[view.i][view.j]}`;
    actionDetail = vi ? `Người hiện tại chọn ${view.picked === "left" ? "TRÁI" : "PHẢI"} để giữ lợi thế lớn hơn.` : `The current player chooses ${view.picked.toUpperCase()} for the larger advantage.`;
    actionClass = "is-choice";
  } else {
    actionMain = `dp[0][${view.nums.length - 1}] = ${view.advantage}`;
    actionDetail = view.winner
      ? (vi ? `${view.advantage} ≥ 0 nên Player 1 thắng hoặc hòa.` : `${view.advantage} ≥ 0, so Player 1 wins or ties.`)
      : (vi ? `${view.advantage} < 0 nên Player 2 thắng nếu cả hai chơi tối ưu.` : `${view.advantage} < 0, so Player 2 wins under optimal play.`);
    actionClass = view.winner ? "is-winner" : "is-loser";
  }

  const choicesHtml = intervalReady && view.i !== view.j
    ? `<div class="predict-winner-choices">${leftChoiceHtml}${rightChoiceHtml}</div>`
    : `<div class="predict-winner-rule"><strong>${vi ? "Công thức" : "Formula"}</strong><code>pick - ${vi ? "lợi thế của đối thủ" : "opponent advantage"}</code></div>`;
  const summary = vi
    ? `Predict the Winner với ${view.nums.length} số; phase ${view.phase}.`
    : `Predict the Winner with ${view.nums.length} numbers; phase ${view.phase}.`;
  $("treeView").innerHTML = `<section class="predict-winner-viz" role="img" aria-label="${escapeHtml(summary)}">
    <div class="predict-winner-phases">${phasesHtml}</div>
    <div class="predict-winner-array">${arrayHtml}</div>
    <div class="predict-winner-workspace">
      <div class="predict-winner-table-block">
        <div class="predict-winner-section-head"><strong>dp[i][j]</strong><span>${vi ? "người hiện tại - đối thủ" : "current player - opponent"}</span></div>
        <div class="predict-winner-table-scroll">
          <div class="predict-winner-dp-grid" role="grid" style="--predict-winner-size:${view.nums.length}">${dpCells}</div>
        </div>
      </div>
      <div class="predict-winner-choice-block">
        <div class="predict-winner-section-head"><strong>${vi ? "Hai lựa chọn" : "Two choices"}</strong><span>${intervalReady ? `[${view.i}, ${view.j}]` : "—"}</span></div>
        ${choicesHtml}
      </div>
    </div>
    <div class="predict-winner-action ${actionClass}"><strong>${escapeHtml(actionMain)}</strong><span>${escapeHtml(actionDetail)}</span></div>
    <div class="predict-winner-legend">
      <span><i class="active"></i>${vi ? "ô đang tính" : "current cell"}</span>
      <span><i class="left"></i>dp[i+1][j]</span>
      <span><i class="right"></i>dp[i][j-1]</span>
    </div>
  </section>`;
}

function renderStoneGameIIView(step) {
  const view = step.stoneGameIIView || {};
  const vi = lang === "vi";
  const piles = Array.isArray(view.piles) ? view.piles : [];
  const suffix = Array.isArray(view.suffix) ? view.suffix : [];
  const dp = Array.isArray(view.dp) ? view.dp : [];
  const options = Array.isArray(view.options) ? view.options : [];
  const hasState = Number.isInteger(view.i) && Number.isInteger(view.m);
  const hasChoice = hasState && Number.isInteger(view.x);
  const phaseIndex = view.phase === "result" ? 2 : ["dp-init", "dp"].includes(view.phase) ? 1 : 0;
  const phaseLabels = vi
    ? ["1. Dựng tổng suffix", "2. Điền dp[i][M] và thử X", "3. Trả dp[0][1]"]
    : ["1. Build suffix totals", "2. Fill dp[i][M] and try X", "3. Return dp[0][1]"];
  const phasesHtml = phaseLabels.map((label, index) => {
    const state = index < phaseIndex ? "is-done" : index === phaseIndex ? "is-active" : "";
    return `<span class="${state}">${index < phaseIndex ? "✓" : ""}<b>${escapeHtml(label)}</b></span>`;
  }).join("");

  const maxPile = Math.max(1, ...piles.map((pile) => pile.value));
  const selectedEnd = hasChoice ? Math.min(piles.length, view.i + view.x) : null;
  const pilesHtml = piles.map((pile) => {
    const classes = ["sg2-pile"];
    if (Number.isInteger(view.i) && pile.index < view.i) classes.push("is-consumed");
    if (Number.isInteger(view.i) && pile.index >= view.i) classes.push("is-remaining");
    if (hasChoice && pile.index >= view.i && pile.index < selectedEnd) classes.push("is-taken");
    if (Number.isInteger(view.nextI) && pile.index >= view.nextI) classes.push("is-opponent-suffix");
    if (pile.index === view.i) classes.push("is-start");
    const pointers = [];
    if (pile.index === view.i) pointers.push("i");
    if (hasChoice && pile.index === selectedEnd - 1) pointers.push(`X=${view.x}`);
    if (pile.index === view.nextI) pointers.push(vi ? "đối thủ" : "opponent");
    const height = 18 + Math.round((pile.value / maxPile) * 32);
    return `<div class="${classes.join(" ")}">
      <div class="sg2-pointers">${pointers.map((pointer) => `<span>${escapeHtml(pointer)}</span>`).join("")}</div>
      <div class="sg2-pile-bar" style="--sg2-pile-height:${height}px"><strong>${escapeHtml(pile.value)}</strong></div>
      <small>[${pile.index}]</small>
    </div>`;
  }).join("");

  const suffixHtml = suffix.map((cell) => {
    const classes = ["sg2-suffix-cell"];
    if (cell.index === view.i) classes.push("is-active");
    if (cell.index === view.nextI) classes.push("is-dependency");
    if (!cell.known) classes.push("is-pending");
    return `<span class="${classes.join(" ")}"><small>suffix[${cell.index}]</small><strong>${cell.known ? escapeHtml(cell.value) : "?"}</strong></span>`;
  }).join("");

  const columnHeaders = Array.from({ length: view.n || 0 }, (_, index) => `<div class="sg2-dp-head">M=${index + 1}</div>`).join("");
  const dpRows = dp.map((row, rowIndex) => {
    const cells = row.map((cell) => {
      const classes = ["sg2-dp-cell"];
      if (cell.known) classes.push("is-known");
      if (cell.i === view.i && cell.m === view.m) classes.push("is-active");
      if (cell.i === view.nextI && cell.m === view.nextM) classes.push("is-dependency");
      if (cell.i === view.n) classes.push("is-base");
      const role = cell.i === view.i && cell.m === view.m
        ? (vi ? "đang tính" : "current")
        : cell.i === view.nextI && cell.m === view.nextM
          ? (vi ? "đối thủ" : "opponent")
          : "";
      return `<div class="${classes.join(" ")}" role="gridcell" aria-label="dp ${cell.i} ${cell.m}: ${cell.known ? cell.value : "unknown"}"><small>${escapeHtml(role)}</small><strong>${cell.known ? escapeHtml(cell.value) : "?"}</strong></div>`;
    }).join("");
    const rowSuffix = suffix[rowIndex] && suffix[rowIndex].known ? suffix[rowIndex].value : "?";
    return `<div class="sg2-dp-row-head"><strong>i=${rowIndex}</strong><small>Σ=${escapeHtml(rowSuffix)}</small></div>${cells}`;
  }).join("");

  const stateHtml = `<div class="sg2-state-strip">
    <span><small>${vi ? "TRẠNG THÁI" : "STATE"}</small><strong>${hasState ? `dp[${view.i}][${view.m}]` : "dp[i][M]"}</strong></span>
    <span><small>${vi ? "CÒN LẠI" : "REMAINING"}</small><strong>${Number.isInteger(view.remaining) ? view.remaining : "?"} ${vi ? "đống" : "piles"}</strong></span>
    <span><small>${vi ? "GIỚI HẠN LƯỢT" : "TURN LIMIT"}</small><strong>${Number.isInteger(view.m) ? `1 ≤ X ≤ ${view.maxTake}` : "1 ≤ X ≤ 2M"}</strong></span>
    <span><small>${hasState ? `suffix[${view.i}]` : "suffix[i]"}</small><strong>${hasState && suffix[view.i]?.known ? escapeHtml(suffix[view.i].value) : "?"}</strong></span>
  </div>`;

  let formulaHtml;
  if (view.phase === "suffix" && Number.isInteger(view.i)) {
    const left = piles[view.i]?.value ?? "?";
    const right = suffix[view.i + 1]?.known ? suffix[view.i + 1].value : "?";
    const result = suffix[view.i]?.known ? suffix[view.i].value : "?";
    formulaHtml = `<div class="sg2-formula suffix"><span><small>piles[${view.i}]</small><strong>${escapeHtml(left)}</strong></span><i>+</i><span><small>suffix[${view.i + 1}]</small><strong>${escapeHtml(right)}</strong></span><i>=</i><span class="is-result"><small>suffix[${view.i}]</small><strong>${escapeHtml(result)}</strong></span></div>`;
  } else {
    const suffixValue = hasState && suffix[view.i]?.known ? suffix[view.i].value : "?";
    const opponentValue = view.opponent === null || view.opponent === undefined ? "?" : view.opponent;
    const candidateValue = view.candidate === null || view.candidate === undefined ? "?" : view.candidate;
    formulaHtml = `<div class="sg2-formula"><span><small>${hasState ? `suffix[${view.i}] · ${vi ? "tổng còn lại" : "remaining total"}` : "suffix[i]"}</small><strong>${escapeHtml(suffixValue)}</strong></span><i>−</i><span class="is-opponent"><small>${Number.isInteger(view.nextI) ? `dp[${view.nextI}][${view.nextM}] · ${vi ? "đối thủ" : "opponent"}` : "dp[i+X][max(M,X)]"}</small><strong>${escapeHtml(opponentValue)}</strong></span><i>=</i><span class="is-result"><small>${vi ? "người hiện tại đảm bảo" : "current player secures"}</small><strong>${escapeHtml(candidateValue)}</strong></span></div>`;
  }

  let optionCounts;
  if (view.takeAll || view.phase === "result") {
    optionCounts = options.map((option) => option.x);
  } else {
    optionCounts = Array.from({ length: Number.isInteger(view.maxTake) ? view.maxTake : 0 }, (_, index) => index + 1);
  }
  const optionsHtml = optionCounts.length ? optionCounts.map((x) => {
    const option = options.find((item) => item.x === x);
    const classes = ["sg2-option"];
    if (x === view.x) classes.push("is-current");
    if (option && x === view.bestX) classes.push("is-best");
    if (!option) classes.push("is-pending");
    const indices = option ? `[${option.indices.join(", ")}]` : (hasState ? `[${view.i}..${view.i + x - 1}]` : "—");
    return `<div class="${classes.join(" ")}">
      <header><strong>X=${x}</strong><span>${option && x === view.bestX ? (vi ? "TỐT NHẤT" : "BEST") : option ? (vi ? "ĐÃ THỬ" : "TRIED") : (vi ? "CHƯA THỬ" : "PENDING")}</span></header>
      <code>${escapeHtml(indices)}</code>
      <div><span><small>${vi ? "lấy ngay" : "take now"}</small><b>${option ? escapeHtml(option.immediate) : "?"}</b></span><span><small>${vi ? "đối thủ" : "opponent"}</small><b>${option ? escapeHtml(option.opponent) : "?"}</b></span><span><small>${vi ? "đảm bảo" : "secures"}</small><b>${option ? escapeHtml(option.candidate) : "?"}</b></span></div>
      <small>${option ? `→ dp[${option.nextI}][${option.nextM}]` : `→ dp[${hasState ? view.i + x : "i+X"}][max(M,${x})]`}</small>
    </div>`;
  }).join("") : `<div class="sg2-options-empty">${vi ? "Các lựa chọn X sẽ xuất hiện khi bắt đầu một trạng thái dp." : "X choices appear when a dp state begins."}</div>`;

  let detail;
  if (view.event === "enter") detail = vi ? "Alice bắt đầu tại (i=0, M=1)." : "Alice starts at (i=0, M=1).";
  else if (view.event === "read-n") detail = vi ? "Mỗi trạng thái được xác định bởi vị trí i và giới hạn M." : "Each state is identified by position i and limit M.";
  else if (view.event === "init-suffix") detail = vi ? "Suffix rỗng sau cuối mảng có tổng bằng 0." : "The empty suffix after the array has total 0.";
  else if (view.event === "suffix-loop") detail = vi ? `Chuẩn bị cộng piles[${view.i}] vào suffix bên phải.` : `Prepare to add piles[${view.i}] to the suffix on its right.`;
  else if (view.event === "suffix-save") detail = vi ? `Đã biết tổng đá từ vị trí ${view.i} đến cuối.` : `The total from position ${view.i} to the end is now known.`;
  else if (view.event === "init-dp") detail = vi ? `Hàng i=${view.n} là base case: không còn đá nên mọi giá trị bằng 0.` : `Row i=${view.n} is the base case: no piles remain, so every value is 0.`;
  else if (view.event === "outer-loop") detail = vi ? `Mở hàng i=${view.i}; các hàng i lớn hơn đã sẵn sàng.` : `Open row i=${view.i}; rows with larger i are ready.`;
  else if (view.event === "inner-loop") detail = vi ? `Tại M=${view.m}, được xét X từ 1 đến ${view.maxTake}.` : `At M=${view.m}, X ranges from 1 through ${view.maxTake}.`;
  else if (view.event === "take-all-check") detail = view.takeAll
    ? (vi ? `2M đủ phủ ${view.remaining} đống còn lại.` : `2M covers all ${view.remaining} remaining piles.`)
    : (vi ? "Không thể lấy hết; phải tính phần tối ưu của đối thủ." : "Cannot take all; the opponent's optimal remainder must be considered.");
  else if (view.event === "take-all") detail = vi ? `Lấy hết ${view.remaining} đống và để lại 0 cho đối thủ.` : `Take all ${view.remaining} piles and leave 0 for the opponent.`;
  else if (view.event === "else-branch") detail = vi ? `So sánh ${view.maxTake} lựa chọn X.` : `Compare ${view.maxTake} possible X choices.`;
  else if (view.event === "reset-best") detail = vi ? "Đặt best=0 trước khi thử lựa chọn đầu tiên." : "Reset best=0 before evaluating the first choice.";
  else if (view.event === "option-loop") detail = vi ? `X=${view.x}: lấy ${view.immediate} viên ngay, rồi chuyển lượt sang dp[${view.nextI}][${view.nextM}].` : `X=${view.x}: take ${view.immediate} now, then pass the turn to dp[${view.nextI}][${view.nextM}].`;
  else if (view.event === "evaluate-option") detail = vi ? `Đối thủ đảm bảo ${view.opponent}; người hiện tại còn ${view.candidate}. Best hiện tại là ${view.best}.` : `The opponent secures ${view.opponent}; the current player keeps ${view.candidate}. Current best is ${view.best}.`;
  else if (view.event === "commit") detail = vi ? `Chọn X=${view.bestX} và lưu dp[${view.i}][${view.m}]=${view.best}.` : `Choose X=${view.bestX} and store dp[${view.i}][${view.m}]=${view.best}.`;
  else detail = vi ? `Alice đảm bảo ${view.alice}/${view.total} viên khi cả hai chơi tối ưu.` : `Alice guarantees ${view.alice}/${view.total} stones under optimal play.`;

  const resultHtml = view.phase === "result" ? `<div class="sg2-result-split">
    <span class="alice" style="--sg2-share:${view.total ? (view.alice / view.total) * 100 : 0}%"><small>ALICE · dp[0][1]</small><strong>${escapeHtml(view.alice)}</strong><i></i></span>
    <span class="bob" style="--sg2-share:${view.total ? (view.bob / view.total) * 100 : 0}%"><small>BOB · ${vi ? "còn lại" : "remainder"}</small><strong>${escapeHtml(view.bob)}</strong><i></i></span>
  </div>` : "";

  const summary = vi
    ? `Stone Game II với ${piles.length} đống; trạng thái ${view.phase}.`
    : `Stone Game II with ${piles.length} piles; phase ${view.phase}.`;
  $("treeView").innerHTML = `<section class="stone-game-ii-viz" role="img" aria-label="${escapeHtml(summary)}">
    <div class="sg2-phases">${phasesHtml}</div>
    ${stateHtml}
    <section class="sg2-piles-section"><header><strong>PILES</strong><span>${hasChoice ? `${vi ? "lấy" : "take"} X=${view.x} · next (${view.nextI}, ${view.nextM})` : (vi ? "độ cao biểu diễn số đá" : "height represents stones")}</span></header><div class="sg2-piles">${pilesHtml}</div></section>
    <section class="sg2-suffix-section"><header><strong>SUFFIX TOTALS</strong><span>suffix[i] = piles[i] + suffix[i+1]</span></header><div class="sg2-suffix-row">${suffixHtml}</div></section>
    ${formulaHtml}
    <section class="sg2-options-section"><header><strong>${vi ? "LỰA CHỌN X" : "X CHOICES"}</strong><span>${hasState ? `dp[${view.i}][${view.m}]` : "dp[i][M]"}</span></header><div class="sg2-options">${optionsHtml}</div></section>
    <section class="sg2-table-section"><header><strong>DP TABLE</strong><span>${vi ? "số đá tối đa người hiện tại đảm bảo" : "maximum stones current player secures"}</span></header><div class="sg2-table-scroll"><div class="sg2-dp-grid" role="grid" style="--sg2-cols:${view.n || 1}"><div class="sg2-dp-corner">i / M</div>${columnHeaders}${dpRows}</div></div></section>
    ${resultHtml}
    <div class="sg2-action ${view.takeAll ? "is-take-all" : ""} ${view.phase === "result" ? "is-result" : ""}"><strong>${escapeHtml(pick(step.title))}</strong><span>${escapeHtml(detail)}</span></div>
    <div class="sg2-legend"><span><i class="current"></i>${vi ? "trạng thái hiện tại" : "current state"}</span><span><i class="taken"></i>${vi ? "đống đang lấy" : "piles taken"}</span><span><i class="opponent"></i>${vi ? "trạng thái đối thủ" : "opponent state"}</span><span><i class="best"></i>${vi ? "lựa chọn tốt nhất" : "best choice"}</span></div>
  </section>`;
}

function renderStoneGameView(step) {
  const view = step.stoneGameView;
  const vi = lang === "vi";
  const hasI = Number.isInteger(view.i);
  const hasK = Number.isInteger(view.k);
  const activeChoice = hasK ? view.k + 1 : null;
  const solvingPhases = new Set([
    "index", "take-reset", "best-reset", "choice", "bounds-check",
    "accumulate", "compare", "commit",
  ]);
  const activePhase = view.phase === "result" ? 2 : solvingPhases.has(view.phase) ? 1 : 0;
  const phaseLabels = vi
    ? ["1. Khởi tạo suffix DP", "2. Thử lấy 1-3 viên", "3. Đọc dấu dp[0]"]
    : ["1. Initialize suffix DP", "2. Try taking 1-3", "3. Read dp[0] sign"];
  const phasesHtml = phaseLabels.map((label, index) => {
    const state = index < activePhase ? "is-done" : index === activePhase ? "is-active" : "";
    return `<span class="${state}">${index < activePhase ? "✓" : ""}<b>${escapeHtml(label)}</b></span>`;
  }).join("");

  const stoneHtml = view.stones.map((stone) => {
    const classes = ["stone-game-stone"];
    classes.push(stone.value < 0 ? "is-negative" : stone.value > 0 ? "is-positive" : "is-zero");
    const selected = hasI && stone.index >= view.i && stone.index < view.i + view.selectedCount;
    const cursor = hasI && hasK && stone.index === view.i + view.k;
    if (hasI && stone.index < view.i) classes.push("is-before-suffix");
    if (hasI && stone.index >= view.i) classes.push("is-suffix");
    if (selected) classes.push("is-selected");
    if (cursor) classes.push("is-cursor");
    let pointer = "";
    if (hasI && stone.index === view.i) pointer += `<span>i</span>`;
    if (cursor) pointer += `<span>i+k</span>`;
    const takeOrder = selected ? stone.index - view.i + 1 : null;
    return `<div class="${classes.join(" ")}">
      <div class="stone-game-pointer">${pointer}</div>
      <strong>${escapeHtml(stone.value)}</strong>
      <small>[${stone.index}]</small>
      ${takeOrder === null ? "" : `<em>${vi ? "lấy" : "take"} ${takeOrder}</em>`}
    </div>`;
  }).join("");

  const dpHtml = view.dp.map((cell) => {
    const classes = ["stone-game-dp-cell"];
    if (cell.known) classes.push("is-known");
    if (cell.base) classes.push("is-base");
    if (cell.index === view.i) classes.push("is-active");
    if (cell.index === view.next) classes.push("is-dependency");
    const value = cell.value === null ? "?" : cell.value;
    let role = "";
    if (cell.index === view.i) role = vi ? "đang tính" : "current";
    else if (cell.index === view.next) role = vi ? "đối thủ" : "opponent";
    else if (cell.base) role = "base";
    return `<div class="${classes.join(" ")}">
      <span>${role}</span><small>dp[${cell.index}]</small><strong>${escapeHtml(value)}</strong>
    </div>`;
  }).join("");

  const optionHtml = [1, 2, 3].map((count) => {
    const option = view.options.find((item) => item.count === count);
    const classes = ["stone-game-option"];
    if (activeChoice === count) classes.push("is-current");
    if (view.bestCount === count && option) classes.push("is-best");
    if (view.phase === "commit" && view.bestCount !== count && option) classes.push("is-rejected");
    const isInvalid = activeChoice === count && view.phase === "bounds-check" && view.valid === false;
    if (isInvalid) classes.push("is-invalid");

    let stonesLabel = "—";
    if (option) {
      stonesLabel = option.indices.map((index) => view.stones[index].value).join(" + ");
    } else if (hasI && view.i + count <= view.stones.length) {
      stonesLabel = view.stones.slice(view.i, view.i + count).map((stone) => stone.value).join(" + ");
    }
    const status = option
      ? (view.bestCount === count ? (vi ? "tốt nhất" : "best") : (vi ? "đã thử" : "tried"))
      : isInvalid ? (vi ? "vượt mảng" : "out of range") : (vi ? "chưa thử" : "not tried");
    return `<div class="${classes.join(" ")}">
      <div class="stone-game-option-head"><b>${vi ? "LẤY" : "TAKE"} ${count}</b><span>${escapeHtml(status)}</span></div>
      <strong>${escapeHtml(stonesLabel)}</strong>
      <div class="stone-game-option-math">
        <span><small>take</small><b>${option ? escapeHtml(option.take) : "?"}</b></span>
        <i>−</i>
        <span><small>${option ? `dp[${option.next}]` : "dp[next]"}</small><b>${option ? escapeHtml(option.opponent) : "?"}</b></span>
        <i>=</i>
        <span class="candidate"><small>candidate</small><b>${option ? escapeHtml(option.candidate) : "?"}</b></span>
      </div>
    </div>`;
  }).join("");

  const nextCell = Number.isInteger(view.next) ? view.dp[view.next] : null;
  const opponent = nextCell && nextCell.value !== null ? nextCell.value : "?";
  const takeValue = view.take === null ? "?" : view.take;
  const candidateValue = view.candidate === null ? "?" : view.candidate;
  const bestValue = view.best === null ? "?" : view.best;
  const formulaHtml = `<div class="stone-game-formula">
    <span class="is-take"><small>${vi ? "điểm lấy ngay" : "score taken now"}</small><strong>${escapeHtml(takeValue)}</strong></span>
    <i>−</i>
    <span class="is-opponent"><small>${Number.isInteger(view.next) ? `dp[${view.next}] · ${vi ? "lợi thế đối thủ" : "opponent advantage"}` : "dp[next]"}</small><strong>${escapeHtml(opponent)}</strong></span>
    <i>=</i>
    <span class="is-candidate"><small>candidate</small><strong>${escapeHtml(candidateValue)}</strong></span>
    <i>→ max →</i>
    <span class="is-best"><small>${hasI ? `dp[${view.i}] · best` : "dp[i] · best"}</small><strong>${escapeHtml(bestValue)}</strong></span>
  </div>`;

  let actionDetail;
  if (view.phase === "setup") {
    actionDetail = vi ? "Đọc số viên đá; chưa có ô dp nào được tạo." : "Read the stones; no dp cell has been initialized yet.";
  } else if (view.phase === "initialize") {
    actionDetail = vi ? `dp[${view.stones.length}] = 0 vì suffix rỗng không còn điểm.` : `dp[${view.stones.length}] = 0 because the empty suffix has no score.`;
  } else if (view.phase === "index") {
    actionDetail = vi ? `Bắt đầu suffix tại i=${view.i}; các ô bên phải đã biết.` : `Start the suffix at i=${view.i}; all cells to its right are known.`;
  } else if (view.phase === "take-reset") {
    actionDetail = vi ? "Đặt take=0 trước khi cộng dần 1, 2 rồi 3 viên." : "Reset take=0 before accumulating 1, then 2, then 3 stones.";
  } else if (view.phase === "best-reset") {
    actionDetail = vi ? `Đặt dp[${view.i}]=−∞ để lựa chọn hợp lệ đầu tiên chắc chắn thay thế nó.` : `Set dp[${view.i}]=−∞ so the first valid choice must replace it.`;
  } else if (view.phase === "choice") {
    actionDetail = vi ? `k=${view.k} tương ứng thử lấy ${activeChoice} viên.` : `k=${view.k} means trying to take ${activeChoice} stone(s).`;
  } else if (view.phase === "bounds-check") {
    actionDetail = view.valid
      ? (vi ? `i+k còn trong mảng, nên lựa chọn lấy ${activeChoice} viên hợp lệ.` : `i+k is inside the array, so taking ${activeChoice} stone(s) is valid.`)
      : (vi ? `i+k vượt cuối mảng; bỏ qua lựa chọn lấy ${activeChoice} viên.` : `i+k is past the array; skip taking ${activeChoice} stone(s).`);
  } else if (view.phase === "accumulate") {
    actionDetail = vi ? `Cộng viên mới vào tổng đang lấy: take=${view.take}.` : `Add the new stone to the running taken sum: take=${view.take}.`;
  } else if (view.phase === "compare") {
    actionDetail = vi ? `Lấy ${view.take}, sau đó đối thủ có lợi thế ${opponent}; candidate=${view.candidate}. Giữ giá trị lớn nhất.` : `Take ${view.take}, then the opponent has advantage ${opponent}; candidate=${view.candidate}. Keep the maximum.`;
  } else if (view.phase === "commit") {
    actionDetail = vi ? `Lấy ${view.bestCount} viên là nước đi tốt nhất tại suffix này; chốt dp[${view.i}]=${view.best}.` : `Taking ${view.bestCount} stone(s) is best for this suffix; commit dp[${view.i}]=${view.best}.`;
  } else {
    const resultReason = view.winner === "Alice"
      ? (vi ? "dp[0] dương: Alice hơn điểm khi cả hai chơi tối ưu." : "dp[0] is positive: Alice finishes ahead under optimal play.")
      : view.winner === "Bob"
        ? (vi ? "dp[0] âm: Bob hơn điểm khi cả hai chơi tối ưu." : "dp[0] is negative: Bob finishes ahead under optimal play.")
        : (vi ? "dp[0] bằng 0: hai người hòa điểm." : "dp[0] is zero: both players tie.");
    actionDetail = resultReason;
  }

  const resultClass = view.phase === "result" ? ` is-result is-${String(view.winner || "tie").toLowerCase()}` : "";
  const summary = vi
    ? `Stone Game III với ${view.stones.length} viên; trạng thái ${view.phase}.`
    : `Stone Game III with ${view.stones.length} stones; phase ${view.phase}.`;
  $("treeView").innerHTML = `<section class="stone-game-viz" role="img" aria-label="${escapeHtml(summary)}">
    <div class="stone-game-phases">${phasesHtml}</div>
    <section class="stone-game-stones-section">
      <header><strong>stones</strong><span>${hasI ? `suffix [${view.i}..${view.stones.length - 1}]` : (vi ? "đầu vào" : "input")}</span></header>
      <div class="stone-game-scroll"><div class="stone-game-stones">${stoneHtml}</div></div>
    </section>
    <section class="stone-game-dp-section">
      <header><strong>suffix dp</strong><span>${vi ? "lợi thế người hiện tại − đối thủ" : "current-player advantage"}</span></header>
      <div class="stone-game-scroll"><div class="stone-game-dp-row">${dpHtml}</div></div>
    </section>
    ${formulaHtml}
    <section class="stone-game-options-section">
      <header><strong>${vi ? "Ba nước đi có thể thử" : "Three possible moves"}</strong><span>candidate = take − dp[next]</span></header>
      <div class="stone-game-options">${optionHtml}</div>
    </section>
    <div class="stone-game-action${resultClass}"><strong>${escapeHtml(pick(step.title))}</strong><span>${escapeHtml(actionDetail)}</span>${view.phase === "result" ? `<b>${escapeHtml(view.winner)}</b>` : ""}</div>
    <div class="stone-game-legend">
      <span><i class="selected"></i>${vi ? "đang lấy" : "stones taken"}</span>
      <span><i class="opponent"></i>dp[next]</span>
      <span><i class="best"></i>${vi ? "lựa chọn tốt nhất" : "best choice"}</span>
      <span><b>dp[i] &gt; 0</b>Alice · <b>= 0</b>Tie · <b>&lt; 0</b>Bob</span>
    </div>
  </section>`;
}

function renderStoneGameIVView(step) {
  const view = step.stoneGameIVView || {};
  const vi = lang === "vi";
  const phaseIndex = view.phase === "result" ? 2 : ["try", "check", "win", "next", "lose"].includes(view.phase) ? 1 : 0;
  const phaseLabels = vi
    ? ["1. Base losing state", "2. Thử số chính phương", "3. Đọc dp[n]"]
    : ["1. Base losing state", "2. Try perfect squares", "3. Read dp[n]"];
  const phasesHtml = phaseLabels.map((label, index) => {
    const state = index < phaseIndex ? "is-done" : index === phaseIndex ? "is-active" : "";
    return `<span class="${state}">${index < phaseIndex ? "✓" : ""}<b>${escapeHtml(label)}</b></span>`;
  }).join("");

  const dpHtml = (view.dp || []).map((cell) => {
    const classes = ["sg4-cell"];
    if (cell.known) classes.push(cell.value ? "is-win" : "is-lose");
    if (cell.active) classes.push("is-active");
    if (cell.remain) classes.push("is-remain");
    const label = cell.known ? (cell.value ? "WIN" : "LOSE") : "?";
    return `<div class="${classes.join(" ")}">
      <small>${cell.index}</small>
      <strong>${escapeHtml(label)}</strong>
    </div>`;
  }).join("");

  const squareHtml = (view.squares || []).map((item) => {
    const classes = ["sg4-square"];
    if (item.move === view.activeMove) classes.push("is-active");
    if (item.square > view.activeI && Number.isInteger(view.activeI)) classes.push("is-too-big");
    return `<div class="${classes.join(" ")}"><small>${item.move}²</small><strong>${item.square}</strong></div>`;
  }).join("");

  const optionHtml = (view.options || []).length
    ? view.options.map((option) => {
      const classes = ["sg4-option", option.winning ? "is-winning" : "is-losing"];
      if (option.square === view.activeSquare) classes.push("is-current");
      return `<div class="${classes.join(" ")}">
        <b>${vi ? "Lấy" : "Take"} ${option.square}</b>
        <span>${view.activeI} - ${option.square} = ${option.remain}</span>
        <strong>dp[${option.remain}] = ${option.remainValue ? "WIN" : "LOSE"}</strong>
        <em>${option.winning ? (vi ? "nước thắng" : "winning move") : (vi ? "chưa thắng" : "not winning")}</em>
      </div>`;
    }).join("")
    : `<div class="sg4-empty">${vi ? "Chưa thử square nào." : "No square tried yet."}</div>`;

  const activeSquare = Number.isInteger(view.activeSquare) ? view.activeSquare : "?";
  const activeRemain = Number.isInteger(view.activeRemain) ? view.activeRemain : "?";
  const remainCell = Number.isInteger(view.activeRemain) ? (view.dp || [])[view.activeRemain] : null;
  const remainValue = remainCell && remainCell.known ? (remainCell.value ? "WIN" : "LOSE") : "?";
  const formulaHtml = `<div class="sg4-formula">
    <span><small>${vi ? "đang xét" : "current"}</small><strong>dp[${Number.isInteger(view.activeI) ? view.activeI : "i"}]</strong></span>
    <i>${vi ? "lấy" : "take"}</i>
    <span class="is-square"><small>square</small><strong>${escapeHtml(activeSquare)}</strong></span>
    <i>→</i>
    <span class="is-remain"><small>i - square</small><strong>${escapeHtml(activeRemain)}</strong></span>
    <i>${vi ? "đối thủ nhận" : "opponent gets"}</i>
    <span class="${remainValue === "LOSE" ? "is-good" : ""}"><small>dp[remain]</small><strong>${escapeHtml(remainValue)}</strong></span>
  </div>`;

  let detail;
  if (view.phase === "intro") {
    detail = vi ? "Mỗi trạng thái chỉ cần biết WIN hay LOSE cho người đang tới lượt." : "Each state only needs WIN or LOSE for the current player.";
  } else if (view.phase === "init") {
    detail = vi ? "dp[0] = LOSE vì không còn viên nào để lấy." : "dp[0] = LOSE because there are no stones to take.";
  } else if (view.phase === "state") {
    detail = vi ? `Bắt đầu tính dp[${view.activeI}], mặc định coi là LOSE.` : `Start computing dp[${view.activeI}], initially treated as LOSE.`;
  } else if (view.phase === "try") {
    detail = vi ? `Thử lấy ${activeSquare} viên, còn lại ${activeRemain}.` : `Try taking ${activeSquare} stones, leaving ${activeRemain}.`;
  } else if (view.phase === "check") {
    detail = remainValue === "LOSE"
      ? (vi ? "Phần còn lại là LOSE cho đối thủ, vậy đây là nước thắng." : "The remainder is LOSE for the opponent, so this is a winning move.")
      : (vi ? "Phần còn lại là WIN cho đối thủ, nên chưa thể chốt thắng." : "The remainder is WIN for the opponent, so this move cannot prove a win.");
  } else if (view.phase === "win") {
    detail = vi ? `Chốt dp[${view.activeI}] = WIN và dừng thử square khác.` : `Set dp[${view.activeI}] = WIN and stop trying other squares.`;
  } else if (view.phase === "lose") {
    detail = vi ? `Không có square nào đẩy đối thủ vào LOSE, nên dp[${view.activeI}] = LOSE.` : `No square sends the opponent to LOSE, so dp[${view.activeI}] = LOSE.`;
  } else if (view.phase === "next") {
    detail = vi ? "Nước vừa thử không thắng, thử square kế tiếp." : "The tried move is not winning, try the next square.";
  } else {
    const answer = (view.dp || [])[view.n] && (view.dp || [])[view.n].value;
    detail = answer
      ? (vi ? `dp[${view.n}] = WIN, Alice thắng.` : `dp[${view.n}] = WIN, Alice wins.`)
      : (vi ? `dp[${view.n}] = LOSE, Alice thua nếu Bob tối ưu.` : `dp[${view.n}] = LOSE, Alice loses if Bob plays optimally.`);
  }

  const resultCell = (view.dp || [])[view.n] || {};
  const resultClass = view.phase === "result" ? (resultCell.value ? " is-win" : " is-lose") : "";
  const summary = vi
    ? `Stone Game IV với n=${view.n}; trạng thái ${view.phase}.`
    : `Stone Game IV with n=${view.n}; phase ${view.phase}.`;
  $("treeView").innerHTML = `<section class="sg4-viz" role="img" aria-label="${escapeHtml(summary)}">
    <div class="sg4-phases">${phasesHtml}</div>
    <section class="sg4-section">
      <header><strong>dp states</strong><span>${vi ? "WIN/LOSE cho người đang tới lượt" : "WIN/LOSE for the current player"}</span></header>
      <div class="sg4-scroll"><div class="sg4-row">${dpHtml}</div></div>
    </section>
    <section class="sg4-section">
      <header><strong>${vi ? "Số chính phương" : "Perfect squares"}</strong><span>${vi ? "các nước có thể lấy" : "possible amounts to take"}</span></header>
      <div class="sg4-squares">${squareHtml}</div>
    </section>
    ${formulaHtml}
    <section class="sg4-section">
      <header><strong>${vi ? "Các nước đã thử cho i hiện tại" : "Moves tried for current i"}</strong><span>dp[i] = any(not dp[i-square])</span></header>
      <div class="sg4-options">${optionHtml}</div>
    </section>
    <div class="sg4-action${resultClass}">
      <strong>${escapeHtml(pick(step.title))}</strong>
      <span>${escapeHtml(detail)}</span>
      ${view.phase === "result" ? `<b>${resultCell.value ? "Alice wins" : "Alice loses"}</b>` : ""}
    </div>
    <div class="sg4-legend"><span><i class="win"></i>WIN</span><span><i class="lose"></i>LOSE</span><span><i class="remain"></i>dp[i-square]</span><span><i class="square"></i>${vi ? "square đang thử" : "current square"}</span></div>
  </section>`;
}

// ---- 1739 Building Boxes renderer ----
function renderBuildingBoxesView(step) {
  const view = step.buildingBoxesView || {};
  const vi = lang === "vi";
  const n = Number(view.n) || 1;
  const k = Number(view.k) || 0;
  const floor = Number(view.floor) || 0;
  const total = Number(view.total) || 0;
  const remainder = Number(view.remainder) || 0;
  const extraFloor = Number(view.extraFloor) || 0;
  const complete = !!view.complete;

  // Phase strip
  const phaseIndex = { init: 0, layer: 1, between: 1, "extra-init": 2, extra: 2, done: 3 }[view.phase] ?? 0;
  const phaseLabels = vi
    ? ["0 · Khởi tạo", "1 · Tháp đầy đủ (Step 1)", "2 · Ô sàn dư (Step 2)", "3 · Hoàn tất"]
    : ["0 · Init", "1 · Full pyramid (Step 1)", "2 · Extra floor cells (Step 2)", "3 · Done"];
  const phases = phaseLabels.map((label, i) => {
    const cls = i < phaseIndex ? "done" : i === phaseIndex ? "active" : "pending";
    return `<span class="${cls}">${i < phaseIndex ? "✓" : i === phaseIndex ? "▶" : "○"}<b>${escapeHtml(label)}</b></span>`;
  }).join("");

  // Layer cards — one per full pyramid layer, plus partial layer if extraFloor > 0
  function triNum(x) { return x * (x + 1) / 2; }
  const layerCards = [];
  for (let lyr = 1; lyr <= k + (extraFloor > 0 ? 1 : 0); lyr++) {
    const isFull = lyr <= k;
    const boxes = isFull ? triNum(lyr) : extraFloor;
    const floorCells = isFull ? lyr : extraFloor;
    const isActive = (view.phase === "layer" && lyr === k) || (view.phase === "extra" && lyr === k + 1) || (view.phase === "done" && lyr === k + extraFloor);
    const cls = isActive ? "bb-layer active" : (lyr <= k ? "bb-layer full" : "bb-layer partial");
    // Draw a small triangle footprint with SVG dots
    const size = Math.min(isFull ? lyr : extraFloor, 7); // cap display at 7 rows
    const dotSpacing = 10;
    const svgW = size * dotSpacing + 6;
    const svgH = size * dotSpacing + 6;
    let dots = "";
    for (let row = 0; row < size; row++) {
      for (let col = 0; col <= row; col++) {
        const x = 3 + col * dotSpacing;
        const y = 3 + row * dotSpacing;
        const isFloor = (row === size - 1) || (!isFull);
        dots += `<circle cx="${x}" cy="${y}" r="3.5" class="${isFloor ? "bb-dot floor" : "bb-dot upper"}"></circle>`;
      }
    }
    const truncated = (isFull ? lyr : extraFloor) > 7 ? `<text x="${svgW / 2}" y="${svgH - 1}" text-anchor="middle" class="bb-dot-label">…${isFull ? lyr : extraFloor} rows</text>` : "";
    layerCards.push(`<article class="${cls}"><header><small>${isFull ? (vi ? `Tầng ${lyr}` : `Layer ${lyr}`) : (vi ? "Tầng dở (dư)" : "Partial layer")}</small></header><svg class="bb-triangle" viewBox="0 0 ${svgW} ${svgH}" width="${svgW}" height="${svgH}">${dots}${truncated}</svg><footer><b>${boxes}</b><em>${vi ? "hộp" : "boxes"}</em></footer></article>`);
  }

  // Summary panels
  const progressPct = Math.min(100, Math.round(total / n * 100));
  const formulaText = k > 0
    ? `k*(k+1)*(k+2)/6 = ${k}×${k + 1}×${k + 2}/6 = ${k * (k + 1) * (k + 2) / 6}`
    : "0";
  const answerClass = complete ? "bb-answer complete" : "bb-answer";

  $("treeView").innerHTML = `<section class="bb-viz" role="img" aria-label="${vi ? "Trực quan hóa Building Boxes" : "Building Boxes visualization"}">
    <div class="bb-phases">${phases}</div>
    <div class="bb-main">
      <section class="bb-layers">
        <header><strong>${vi ? "CÁC TẦNG THÁP" : "PYRAMID LAYERS"}</strong><span>${vi ? "mỗi tầng = tam giác đều" : "each layer = equilateral triangle"}</span></header>
        <div class="bb-layer-row">${layerCards.join("") || `<em class="bb-empty">${vi ? "chưa có tầng nào" : "no layers yet"}</em>`}</div>
      </section>
      <aside class="bb-side">
        <section class="bb-stat-grid">
          <div><small>${vi ? "TẦNG ĐẦY" : "FULL LAYERS"}</small><strong>${k}</strong></div>
          <div><small>${vi ? "Ô SÀN ĐẦY" : "PYRAMID FLOOR"}</small><strong>${triNum(k)}</strong></div>
          <div><small>${vi ? "Ô SÀN DƯ" : "EXTRA FLOOR"}</small><strong>${extraFloor}</strong></div>
          <div><small>${vi ? "TỔNG SÀN" : "TOTAL FLOOR"}</small><strong>${floor}</strong></div>
          <div><small>${vi ? "TỔNG HỘP" : "BOXES HELD"}</small><strong>${total}<em>/${n}</em></strong></div>
          <div><small>${vi ? "CÒN DƯ" : "REMAINING"}</small><strong>${remainder}</strong></div>
        </section>
        <section class="bb-progress">
          <header><strong>${vi ? "TIẾN ĐỘ" : "PROGRESS"}</strong><span>${progressPct}%</span></header>
          <div class="bb-progress-bar"><div class="bb-progress-fill ${complete ? "complete" : ""}" style="width:${progressPct}%"></div></div>
        </section>
        <section class="bb-formula">
          <header><strong>${vi ? "CÔNG THỨC k TẦNG" : "k LAYERS FORMULA"}</strong></header>
          <code>${escapeHtml(formulaText)}</code>
          <span>${vi ? `T(${k}) = ${k}×${k + 1}/2 = ${triNum(k)} ô sàn` : `T(${k}) = ${k}×${k + 1}/2 = ${triNum(k)} floor cells`}</span>
        </section>
        <section class="${answerClass}">
          <small>${vi ? "ĐÁP ÁN — số ô SÀN tối thiểu" : "ANSWER — minimum FLOOR cells"}</small>
          <strong>${complete ? floor : "—"}</strong>
          <span>${complete ? (vi ? `${floor} ô sàn chứa ≥ ${n} hộp` : `${floor} floor cells hold ≥ ${n} boxes`) : (vi ? "đang tính…" : "computing…")}</span>
        </section>
      </aside>
    </div>
  </section>`;
}

function renderRectangleAreaView(step) {
  const view = step.rectangleAreaView;
  const vi = lang === "vi";
  const phaseIndex = {
    build: 0, sort: 0,
    init: 1, event: 1, measure: 1, scan: 1, merge: 1,
    area: 2, update: 2,
    done: 3,
  }[view.phase] ?? 0;
  const phaseLabels = vi
    ? ["1. Tạo x-events", "2. Hợp các đoạn y", "3. Cộng diện tích dải", "4. Trả modulo"]
    : ["1. Build x-events", "2. Merge y-intervals", "3. Add strip area", "4. Return modulo"];
  const phasesHtml = phaseLabels.map((label, index) => {
    const state = index < phaseIndex ? "is-done" : index === phaseIndex ? "is-active" : "";
    return `<span class="${state}">${index < phaseIndex ? "✓" : ""}<b>${escapeHtml(label)}</b></span>`;
  }).join("");

  const eventsHtml = view.events.length
    ? view.events.map((event) => {
      const type = event.type === 1 ? "START" : "END";
      const classes = ["rectangle-area-event", event.type === 1 ? "is-start" : "is-end"];
      if (event.isCurrent) classes.push("is-current");
      else if (event.isProcessed) classes.push("is-processed");
      if (view.currentRectId === event.rectId && !event.isCurrent && view.phase === "build") classes.push("is-related");
      return `<div class="${classes.join(" ")}">
        <small>x = ${escapeHtml(event.x)}</small>
        <strong>${type} R${escapeHtml(event.rectId)}</strong>
        <span>[${escapeHtml(event.y1)}, ${escapeHtml(event.y2)})</span>
      </div>`;
    }).join("")
    : `<span class="rectangle-area-empty">${vi ? "Chưa có event" : "No events yet"}</span>`;

  const allX = view.rectangles.flatMap((rect) => [rect.x1, rect.x2]);
  const allY = view.rectangles.flatMap((rect) => [rect.y1, rect.y2]);
  const rawMinX = Math.min(...allX);
  const rawMaxX = Math.max(...allX);
  const rawMinY = Math.min(...allY);
  const rawMaxY = Math.max(...allY);
  const xPadding = Math.max(0.45, (rawMaxX - rawMinX) * 0.08);
  const yPadding = Math.max(0.45, (rawMaxY - rawMinY) * 0.1);
  const minX = rawMinX - xPadding;
  const maxX = rawMaxX + xPadding;
  const minY = rawMinY - yPadding;
  const maxY = rawMaxY + yPadding;
  const svgWidth = 620;
  const svgHeight = 338;
  const pad = { left: 48, right: 20, top: 22, bottom: 42 };
  const plotWidth = svgWidth - pad.left - pad.right;
  const plotHeight = svgHeight - pad.top - pad.bottom;
  const sx = (x) => pad.left + ((x - minX) / (maxX - minX || 1)) * plotWidth;
  const sy = (y) => pad.top + ((maxY - y) / (maxY - minY || 1)) * plotHeight;

  const makeTicks = (values, minValue, maxValue) => {
    const unique = [...new Set(values.concat(Number.isInteger(minValue) ? [minValue] : []))].sort((a, b) => a - b);
    if (unique.length <= 9) return unique;
    const ticks = [];
    for (let index = 0; index < 7; index++) ticks.push(minValue + ((maxValue - minValue) * index) / 6);
    return ticks;
  };
  const xTicks = makeTicks(allX, rawMinX, rawMaxX);
  const yTicks = makeTicks(allY, rawMinY, rawMaxY);
  let gridSvg = "";
  xTicks.forEach((tick) => {
    const x = sx(tick);
    gridSvg += `<line class="rectangle-area-grid-line" x1="${x}" y1="${pad.top}" x2="${x}" y2="${svgHeight - pad.bottom}" />`;
    gridSvg += `<text class="rectangle-area-axis-label" x="${x}" y="${svgHeight - 17}" text-anchor="middle">${escapeXml(Number(tick.toFixed(2)))}</text>`;
  });
  yTicks.forEach((tick) => {
    const y = sy(tick);
    gridSvg += `<line class="rectangle-area-grid-line" x1="${pad.left}" y1="${y}" x2="${svgWidth - pad.right}" y2="${y}" />`;
    gridSvg += `<text class="rectangle-area-axis-label" x="${pad.left - 10}" y="${y}" text-anchor="end" dy="0.34em">${escapeXml(Number(tick.toFixed(2)))}</text>`;
  });

  let bandsSvg = "";
  view.processedBands.forEach((band) => {
    band.segments.forEach((segment) => {
      const x = sx(band.x1);
      const y = sy(segment.y2);
      const width = Math.max(0, sx(band.x2) - x);
      const height = Math.max(0, sy(segment.y1) - y);
      bandsSvg += `<rect class="rectangle-area-counted-band" x="${x}" y="${y}" width="${width}" height="${height}" />`;
    });
  });
  if (view.currentBand && view.currentBand.x2 > view.currentBand.x1) {
    view.currentBand.segments.forEach((segment) => {
      const x = sx(view.currentBand.x1);
      const y = sy(segment.y2);
      const width = Math.max(0, sx(view.currentBand.x2) - x);
      const height = Math.max(0, sy(segment.y1) - y);
      bandsSvg += `<rect class="rectangle-area-current-band${view.currentBand.counted ? " is-counted" : ""}" x="${x}" y="${y}" width="${width}" height="${height}" />`;
    });
  }

  const sourceSvg = view.rectangles.map((rect) => {
    const x = sx(rect.x1);
    const y = sy(rect.y2);
    const width = sx(rect.x2) - x;
    const height = sy(rect.y1) - y;
    const current = rect.id === view.currentRectId ? " is-current" : "";
    return `<g class="rectangle-area-source rectangle-area-source-${(rect.id - 1) % 4 + 1}${current}">
      <rect x="${x}" y="${y}" width="${width}" height="${height}" />
      <text x="${x + width / 2}" y="${y + height / 2}" text-anchor="middle" dy="0.35em">R${escapeXml(rect.id)}</text>
    </g>`;
  }).join("");

  let sweepSvg = "";
  if (view.sweepX !== null) {
    const x = sx(view.sweepX);
    sweepSvg = `<line class="rectangle-area-sweep-line" x1="${x}" y1="${pad.top - 8}" x2="${x}" y2="${svgHeight - pad.bottom + 5}" />
      <path class="rectangle-area-sweep-arrow" d="M ${x - 6} ${pad.top - 8} L ${x + 6} ${pad.top - 8} L ${x} ${pad.top} Z" />
      <text class="rectangle-area-sweep-label" x="${x}" y="${pad.top - 11}" text-anchor="middle">x=${escapeXml(view.sweepX)}</text>`;
  }
  let intervalSvg = "";
  if (view.currentInterval && view.sweepX !== null) {
    const x = sx(view.sweepX) + 8;
    const yTop = sy(view.currentInterval.y2);
    const yBottom = sy(view.currentInterval.y1);
    intervalSvg = `<line class="rectangle-area-scan-interval" x1="${x}" y1="${yTop}" x2="${x}" y2="${yBottom}" />
      <circle class="rectangle-area-scan-point" cx="${x}" cy="${yTop}" r="4" />
      <circle class="rectangle-area-scan-point" cx="${x}" cy="${yBottom}" r="4" />`;
  }
  const plotSummary = vi
    ? `${view.rectangles.length} hình chữ nhật; diện tích đã cộng ${view.area}; đường quét ${view.sweepX === null ? "chưa gán" : `tại x=${view.sweepX}`}.`
    : `${view.rectangles.length} rectangles; accumulated area ${view.area}; sweep ${view.sweepX === null ? "unset" : `at x=${view.sweepX}`}.`;

  const activeHtml = view.active.length
    ? view.active.map((interval) => {
      const current = view.currentInterval && interval.rectId === view.currentInterval.rectId ? " is-current" : "";
      return `<div class="rectangle-area-interval${current}"><b>R${escapeHtml(interval.rectId)}</b><code>[${escapeHtml(interval.y1)}, ${escapeHtml(interval.y2)})</code></div>`;
    }).join("")
    : `<span class="rectangle-area-empty">${vi ? "active đang rỗng" : "active is empty"}</span>`;
  const unionHtml = view.mergedSegments.length
    ? view.mergedSegments.map((segment) => `<code>[${escapeHtml(segment.y1)}, ${escapeHtml(segment.y2)})</code>`).join("")
    : `<span class="rectangle-area-empty">${vi ? "chưa có đoạn y phủ" : "no covered y yet"}</span>`;

  let actionMain = "";
  let actionDetail = "";
  if (view.phase === "build") {
    actionMain = `events.length = ${view.events.length}`;
    actionDetail = vi ? "Mỗi hình đóng góp START tại x1 và END tại x2." : "Each rectangle contributes START at x1 and END at x2.";
  } else if (view.phase === "sort") {
    actionMain = vi ? "Quét từ x nhỏ đến x lớn" : "Sweep from smaller to larger x";
    actionDetail = vi ? "Các event cùng x không tạo diện tích vì Δx = 0." : "Events sharing an x add no area because Δx = 0.";
  } else if (view.phase === "init") {
    actionMain = `prev_x = ${view.prevX ?? "?"}, area = ${view.area}`;
    actionDetail = vi ? "Khởi tạo vị trí bắt đầu và tổng diện tích." : "Initialize the starting position and accumulated area.";
  } else if (view.phase === "event") {
    actionMain = `[prev_x, x) = [${view.currentBand?.x1 ?? view.prevX}, ${view.sweepX})`;
    actionDetail = vi ? "Luôn đo dải bên trái trước khi thay đổi active." : "Always measure the strip to the left before changing active.";
  } else if (["measure", "scan", "merge"].includes(view.phase)) {
    const end = view.currentEnd === null ? "?" : view.currentEnd;
    actionMain = `covered_y = ${view.coveredY}`;
    actionDetail = view.currentInterval
      ? (vi ? `Đang merge R${view.currentInterval.rectId}[${view.currentInterval.y1},${view.currentInterval.y2}); current_end = ${end}.` : `Merging R${view.currentInterval.rectId}[${view.currentInterval.y1},${view.currentInterval.y2}); current_end = ${end}.`)
      : (vi ? "Reset rồi merge các interval theo start tăng dần." : "Reset, then merge intervals by increasing start.");
  } else if (view.phase === "area") {
    const dx = view.currentBand ? view.currentBand.x2 - view.currentBand.x1 : 0;
    actionMain = `${dx} × ${view.coveredY} = ${view.stripArea}`;
    actionDetail = vi ? `Cộng diện tích dải một lần; area = ${view.area}.` : `Add the strip once; area = ${view.area}.`;
  } else if (view.phase === "update") {
    const event = view.events.find((item) => item.isCurrent);
    actionMain = event ? `${event.type === 1 ? "START" : "END"} R${event.rectId}` : "active";
    actionDetail = event
      ? (event.type === 1
        ? (vi ? "Thêm interval để dùng cho dải bên phải." : "Add its interval for the strip to the right.")
        : (vi ? "Xóa interval vì hình đã kết thúc tại x này." : "Remove its interval because the rectangle ends at this x."))
      : "";
  } else {
    actionMain = `${view.area} mod 1,000,000,007 = ${view.answer}`;
    actionDetail = vi ? "Diện tích hợp cuối cùng: mỗi vùng chỉ được tính đúng một lần." : "Final union area: every region is counted exactly once.";
  }

  $("treeView").innerHTML = `<section class="rectangle-area-viz" role="img" aria-label="${escapeHtml(plotSummary)}">
    <div class="rectangle-area-phases">${phasesHtml}</div>
    <div class="rectangle-area-events" aria-label="x events">${eventsHtml}</div>
    <div class="rectangle-area-workspace">
      <div class="rectangle-area-plot-wrap">
        <div class="rectangle-area-section-head"><strong>${vi ? "Mặt phẳng tọa độ" : "Coordinate plane"}</strong><span>${vi ? "đường quét đi từ trái sang phải" : "sweep moves left to right"}</span></div>
        <svg class="rectangle-area-plot" viewBox="0 0 ${svgWidth} ${svgHeight}" role="img" aria-label="${escapeHtml(plotSummary)}">
          <title>${escapeXml(plotSummary)}</title>
          ${gridSvg}
          <line class="rectangle-area-axis" x1="${pad.left}" y1="${svgHeight - pad.bottom}" x2="${svgWidth - pad.right}" y2="${svgHeight - pad.bottom}" />
          <line class="rectangle-area-axis" x1="${pad.left}" y1="${pad.top}" x2="${pad.left}" y2="${svgHeight - pad.bottom}" />
          ${bandsSvg}${sourceSvg}${intervalSvg}${sweepSvg}
          <text class="rectangle-area-axis-name" x="${svgWidth - pad.right}" y="${svgHeight - 7}" text-anchor="end">x</text>
          <text class="rectangle-area-axis-name" x="${pad.left - 12}" y="${pad.top}" text-anchor="end">y</text>
        </svg>
      </div>
      <aside class="rectangle-area-state">
        <div class="rectangle-area-metrics">
          <span><small>prev_x</small><strong>${view.prevX === null ? "—" : escapeHtml(view.prevX)}</strong></span>
          <span><small>x</small><strong>${view.sweepX === null ? "—" : escapeHtml(view.sweepX)}</strong></span>
          <span><small>covered_y</small><strong>${escapeHtml(view.coveredY)}</strong></span>
          <span class="is-total"><small>area</small><strong>${escapeHtml(view.area)}</strong></span>
        </div>
        <div class="rectangle-area-state-section">
          <div class="rectangle-area-section-head"><strong>active</strong><span>${view.active.length} interval${view.active.length === 1 ? "" : "s"}</span></div>
          <div class="rectangle-area-active-list">${activeHtml}</div>
        </div>
        <div class="rectangle-area-state-section">
          <div class="rectangle-area-section-head"><strong>${vi ? "Hợp trên trục y" : "Union on y-axis"}</strong><span>current_end = ${view.currentEnd === null ? "—" : escapeHtml(view.currentEnd)}</span></div>
          <div class="rectangle-area-union-list">${unionHtml}</div>
        </div>
      </aside>
    </div>
    <div class="rectangle-area-action"><strong>${escapeHtml(actionMain)}</strong><span>${escapeHtml(actionDetail)}</span></div>
    <div class="rectangle-area-legend">
      <span><i class="source"></i>${vi ? "hình ban đầu" : "source rectangle"}</span>
      <span><i class="counted"></i>${vi ? "đã cộng vào area" : "counted area"}</span>
      <span><i class="current"></i>${vi ? "dải đang tính" : "current strip"}</span>
      <span><i class="sweep"></i>${vi ? "đường quét" : "sweep line"}</span>
    </div>
  </section>`;
}

function renderTreeDpLessonView(step) {
  const view = step.treeDpLessonView || {};
  const vi = lang === "vi";
  const phases = Array.isArray(view.phases) ? view.phases : [];
  const phaseIndex = Number.isInteger(view.phaseIndex) ? view.phaseIndex : 0;
  const metrics = Array.isArray(view.metrics) ? view.metrics : [];
  const nodeRows = Array.isArray(view.nodeRows) ? view.nodeRows : [];
  const edgeRows = Array.isArray(view.edgeRows) ? view.edgeRows : [];
  const display = (value) => {
    if (value && typeof value === "object" && !Array.isArray(value)) return pick(value);
    if (Array.isArray(value)) return JSON.stringify(value);
    return value === null || value === undefined ? "—" : String(value);
  };
  const problemNames = {
    2246: vi ? "PATH KHÁC KÝ TỰ" : "DIFFERENT-CHARACTER PATH",
    834: vi ? "TỔNG KHOẢNG CÁCH" : "DISTANCE SUMS",
    2858: vi ? "REROOT HƯỚNG CẠNH" : "EDGE-DIRECTION REROOTING",
    1466: vi ? "ĐƯỜNG VỀ THỦ ĐÔ" : "ROADS TO THE CAPITAL",
  };
  const phaseHtml = phases.map((phase, index) => `<span class="${index < phaseIndex ? "done" : index === phaseIndex ? "active" : ""}"><b>${index < phaseIndex ? "✓" : index + 1}</b>${escapeHtml(display(phase))}</span>`).join("");
  const metricHtml = metrics.map((metric) => `<div class="${escapeHtml(metric.state || "")}"><small>${escapeHtml(display(metric.label))}</small><strong>${escapeHtml(display(metric.value))}</strong></div>`).join("");
  const nodeHtml = nodeRows.map((row) => {
    const values = (row.values || []).map((item) => `<span class="${escapeHtml(item.state || "")}"><small>${escapeHtml(display(item.label))}</small><b>${escapeHtml(display(item.value))}</b></span>`).join("");
    return `<article class="tdp-node ${escapeHtml(row.state || "")}"><header><small>#${escapeHtml(row.id)}</small><strong>${escapeHtml(display(row.label))}</strong></header><div>${values}</div></article>`;
  }).join("");
  const edgeHtml = edgeRows.length
    ? edgeRows.map((edge) => `<div class="tdp-edge ${escapeHtml(edge.state || "")}"><strong>${escapeHtml(edge.from)} <i>→</i> ${escapeHtml(edge.to)}</strong><span>${escapeHtml(display(edge.label))}</span><b>${escapeHtml(display(edge.value))}</b></div>`).join("")
    : `<em>${vi ? "Bài này chưa có cạnh." : "This example has no edges."}</em>`;
  const resultText = view.answer === null || view.answer === undefined ? "…" : display(view.answer);
  const currentLink = view.current >= 0
    ? `${vi ? "node" : "node"} ${view.current}${view.parent >= 0 ? ` · parent ${view.parent}` : ""}${view.child >= 0 ? ` · child ${view.child}` : ""}`
    : (vi ? "không có node đang chạy" : "no active node");

  $("treeView").innerHTML = `<section class="tdp-viz">
    <header><div><small>TREE DP · DFS · #${escapeHtml(view.problemId)}</small><strong>${escapeHtml(problemNames[view.problemId] || "TREE STEP VISUALIZATION")}</strong></div><span>${escapeHtml(pick(step.title))}</span></header>
    <div class="tdp-phases">${phaseHtml}</div>
    <section class="tdp-rule"><b>${vi ? "Ý TƯỞNG CỐT LÕI" : "CORE IDEA"}</b><strong>${escapeHtml(display(view.rule))}</strong></section>
    <section class="tdp-metrics">${metricHtml}</section>
    <div class="tdp-main">
      <section class="tdp-graph-wrap"><header><strong>${vi ? "CÂY VÀ HƯỚNG CẠNH" : "TREE AND EDGE DIRECTIONS"}</strong><span>${escapeHtml(currentLink)}</span></header><div id="treeDpLessonGraph" class="tdp-graph"></div></section>
      <section class="tdp-edges"><header><strong>${vi ? "TRẠNG THÁI TỪNG CẠNH" : "EDGE-BY-EDGE STATE"}</strong><span>${vi ? "đọc theo mũi tên gốc" : "read by original arrow"}</span></header><div>${edgeHtml}</div></section>
    </div>
    <section class="tdp-nodes"><header><strong>${vi ? "BẢNG DP CỦA TỪNG NODE" : "PER-NODE DP TABLE"}</strong><span>${vi ? "tím = đang xử lý · xanh = đã chốt" : "purple = active · green = resolved"}</span></header><div style="--tdp-node-count:${Math.max(nodeRows.length, 1)}">${nodeHtml}</div></section>
    <section class="tdp-formula"><small>${vi ? "DÒNG TÍNH HIỆN TẠI" : "CURRENT CALCULATION"}</small><strong>${escapeHtml(display(view.formula))}</strong><span>${escapeHtml(display(view.explanation))}</span></section>
    <footer class="tdp-result ${view.answer === null || view.answer === undefined ? "" : "done"}"><small>${vi ? "KẾT QUẢ" : "RESULT"}</small><strong>${escapeHtml(resultText)}</strong><span>${view.answer === null || view.answer === undefined ? (vi ? "Dùng Next để theo dõi từng cập nhật." : "Use Next to follow each update.") : (vi ? "Đã hoàn tất toàn bộ các lượt DFS/DP." : "All DFS/DP passes are complete.")}</span></footer>
  </section>`;
  renderGraph(step, "treeDpLessonGraph");
}

function renderCycle2360View(step) {
  const view = step.cycle2360View || {};
  const vi = lang === "vi";
  const localPick = (value) => typeof pick === "function" ? pick(value) : value?.[lang] ?? value?.en ?? value?.vi ?? value ?? "";
  const edges = Array.isArray(view.edges) ? view.edges : [];
  const visited = Array.isArray(view.visited) ? view.visited : [];
  const path = Array.isArray(view.path) ? view.path : [];
  const cycle = Array.isArray(view.cycle) ? view.cycle : [];
  const bestCycle = Array.isArray(view.bestCycle) ? view.bestCycle : [];
  const event = String(view.event || "init");
  const current = Number.isInteger(view.current) ? view.current : null;
  const next = Number.isInteger(view.next) ? view.next : null;
  const start = Number.isInteger(view.start) ? view.start : null;
  const longest = Number.isInteger(view.longest) ? view.longest : -1;
  const repeatAt = Number.isInteger(view.repeatAt) ? view.repeatAt : null;
  const cycleLength = Number.isInteger(view.cycleLength) ? view.cycleLength : null;
  const final = Boolean(view.final || step.final || event === "done");
  const pathDepth = new Map(path.map((item) => [item.node, item.depth]));
  const activeCycle = new Set(cycle.length ? cycle : (final ? bestCycle : []));

  const phaseIndex = ["init", "start"].includes(event)
    ? 0
    : ["inspect", "record"].includes(event)
      ? 1
      : event === "follow"
        ? 2
        : 3;
  const phaseLabels = vi
    ? ["Chọn điểm bắt đầu", "Ghi vị trí trong walk", "Đi theo mũi tên", "Kiểm tra có quay lại"]
    : ["Choose a start", "Record path position", "Follow the arrow", "Check for a repeat"];
  const phases = phaseLabels.map((label, index) => {
    const state = final || index < phaseIndex ? "done" : index === phaseIndex ? "active" : "";
    return `<span class="${state}"><b>${final || index < phaseIndex ? "✓" : index + 1}</b>${escapeHtml(label)}</span>`;
  }).join("");

  const pathParts = path.map((item, index) => {
    const inCycle = activeCycle.has(item.node);
    const isCurrent = item.node === current;
    return `${index ? "<i>→</i>" : ""}<span class="${inCycle ? "cycle" : ""} ${isCurrent ? "current" : ""}"><b>${item.node}</b><small>position ${item.depth}</small></span>`;
  });
  const shouldAppendNext = next !== null && (event === "follow" || event === "cycle") && (!path.length || path[path.length - 1].node !== next || pathDepth.has(next));
  if (shouldAppendNext) {
    const repeats = pathDepth.has(next);
    pathParts.push(`<i>→</i><span class="next ${repeats ? "repeat" : ""}"><b>${next}</b><small>${repeats ? `${vi ? "LẶP position" : "REPEATS position"} ${pathDepth.get(next)}` : (vi ? "node tiếp theo" : "next node")}</small></span>`);
  } else if (event === "follow" && view.next === -1) {
    pathParts.push(`<i>→</i><span class="sink"><b>−1</b><small>${vi ? "hết đường" : "dead end"}</small></span>`);
  }
  const pathHtml = pathParts.length
    ? pathParts.join("")
    : `<em>${vi ? "Walk mới chưa ghi node nào" : "The new walk has no recorded nodes yet"}</em>`;

  const nodeCards = edges.map((target, node) => {
    const classes = [
      "lc2360-node",
      pathDepth.has(node) ? "in-path" : "",
      activeCycle.has(node) ? "cycle" : "",
      visited[node] ? "visited" : "",
      node === current ? "current" : "",
      node === next ? "next" : "",
      target === -1 ? "sink" : "",
    ].filter(Boolean).join(" ");
    let status = vi ? "chưa thăm" : "unvisited";
    if (activeCycle.has(node)) status = vi ? "trong cycle" : "in cycle";
    else if (pathDepth.has(node)) status = `position ${pathDepth.get(node)}`;
    else if (visited[node]) status = vi ? "đã xử lý trước" : "processed earlier";
    return `<article class="${classes}">
      <header><small>NODE</small><strong>${node}</strong></header>
      <div><small>edges[${node}]</small><b>→ ${target}</b></div>
      <footer>${escapeHtml(status)}</footer>
    </article>`;
  }).join("");

  let focusHtml;
  if (event === "cycle") {
    focusHtml = `<section class="lc2360-focus cycle-found">
      <small>${vi ? "TÌM THẤY CYCLE" : "CYCLE FOUND"}</small>
      <strong>${vi ? `Node ${current} đã có trong current walk tại position ${repeatAt}` : `Node ${current} is already in the current walk at position ${repeatAt}`}</strong>
      <div class="lc2360-formula"><span><small>${vi ? "ĐỘ DÀI WALK" : "WALK LENGTH"}</small><b>${path.length}</b></span><i>−</i><span><small>${vi ? "POSITION LẶP" : "REPEAT POSITION"}</small><b>${repeatAt}</b></span><i>=</i><span class="answer"><small>${vi ? "ĐỘ DÀI CYCLE" : "CYCLE LENGTH"}</small><b>${cycleLength}</b></span></div>
      <p>${vi ? "Chỉ phần path từ position bị lặp trở đi thuộc cycle." : "Only the path segment starting at the repeated position belongs to the cycle."}</p>
    </section>`;
  } else if (event === "stop") {
    const hitDeadEnd = current === -1;
    focusHtml = `<section class="lc2360-focus no-cycle">
      <small>${vi ? "KHÔNG CÓ CYCLE MỚI" : "NO NEW CYCLE"}</small>
      <strong>${hitDeadEnd
        ? (vi ? "Walk đi tới −1 nên kết thúc" : "The walk reached −1 and stops")
        : (vi ? `Node ${current} đã visited nhưng không nằm trong current walk` : `Node ${current} was visited earlier but is not in this current walk`)}</strong>
      <p>${vi ? "Một node visited từ walk cũ không tạo cycle cho walk hiện tại." : "A node visited by an older walk does not create a cycle in the current walk."}</p>
    </section>`;
  } else if (event === "done") {
    focusHtml = `<section class="lc2360-focus done">
      <small>${vi ? "HOÀN TẤT" : "DONE"}</small>
      <strong>${longest === -1 ? (vi ? "Không tìm thấy cycle" : "No cycle was found") : (vi ? `Cycle dài nhất: ${bestCycle.join(" → ")} → ${bestCycle[0]}` : `Longest cycle: ${bestCycle.join(" → ")} → ${bestCycle[0]}`)}</strong>
      <div class="lc2360-final-answer"><span>${vi ? "Độ dài lớn nhất" : "Longest length"}</span><b>${longest}</b></div>
    </section>`;
  } else if (event === "follow") {
    focusHtml = `<section class="lc2360-focus follow">
      <small>${vi ? "ĐI THEO ĐÚNG MỘT CẠNH" : "FOLLOW THE ONLY OUTGOING EDGE"}</small>
      <strong><code>node = edges[${current}] = ${view.next}</code></strong>
      <div class="lc2360-edge-focus"><span>${current}</span><i>→</i><span>${view.next}</span></div>
      <p>${view.next === -1
        ? (vi ? "−1 nghĩa là không còn cạnh để đi." : "−1 means there is no outgoing edge.")
        : pathDepth.has(view.next)
          ? (vi ? `Node ${view.next} đã nằm trong current walk: bước kế tiếp sẽ tính cycle.` : `Node ${view.next} is already in the current walk: the next step measures the cycle.`)
          : (vi ? `Tiếp tục walk tại node ${view.next}.` : `Continue the walk at node ${view.next}.`)}</p>
    </section>`;
  } else if (event === "record") {
    const depth = pathDepth.get(current);
    focusHtml = `<section class="lc2360-focus record">
      <small>${vi ? "GHI VỊ TRÍ TRONG WALK HIỆN TẠI" : "RECORD POSITION IN THIS WALK"}</small>
      <strong><code>position[${current}] = ${depth}</code></strong>
      <p>${vi ? "Nếu quay lại node này, position cho biết cycle bắt đầu ở đâu." : "If the walk returns here, this position tells us where the cycle begins."}</p>
    </section>`;
  } else if (event === "inspect") {
    focusHtml = `<section class="lc2360-focus inspect">
      <small>${vi ? "KIỂM TRA ĐIỀU KIỆN WHILE" : "CHECK THE WHILE CONDITION"}</small>
      <strong><code>node != -1 and not visited[node]</code></strong>
      <p>${vi ? `Node ${current} hợp lệ và chưa visited, nên có thể ghi vào current walk.` : `Node ${current} is valid and unvisited, so record it in the current walk.`}</p>
    </section>`;
  } else if (event === "start") {
    focusHtml = `<section class="lc2360-focus start">
      <small>${vi ? "WALK MỚI" : "NEW WALK"}</small>
      <strong>${vi ? `Bắt đầu từ node ${start} với position rỗng` : `Start at node ${start} with an empty position map`}</strong>
      <p><code>position = {}</code><code>node = ${start}</code></p>
    </section>`;
  } else {
    focusHtml = `<section class="lc2360-focus init">
      <small>${vi ? "HAI LOẠI BỘ NHỚ" : "TWO KINDS OF MEMORY"}</small>
      <strong>${vi ? "Đừng nhầm visited với position" : "Do not confuse visited with position"}</strong>
      <div class="lc2360-memory"><span><b>visited</b><small>${vi ? "đã xử lý ở bất kỳ walk nào" : "processed in any walk"}</small></span><span><b>position</b><small>${vi ? "chỉ thuộc current walk" : "only in the current walk"}</small></span></div>
    </section>`;
  }

  $("treeView").innerHTML = `<section class="lc2360-viz" role="img" aria-label="Longest Cycle in a Graph visualization">
    <header><div><small>#2360 · FUNCTIONAL GRAPH</small><strong>${vi ? "TÌM CYCLE BẰNG VỊ TRÍ TRONG CURRENT WALK" : "FIND A CYCLE WITH CURRENT-WALK POSITIONS"}</strong></div><span>${escapeHtml(localPick(step.title))}</span></header>
    <section class="lc2360-rule"><b>${vi ? "QUY TẮC QUAN TRỌNG NHẤT" : "THE MOST IMPORTANT RULE"}</b><strong>${vi ? "Quay lại node trong CURRENT PATH → có cycle" : "Return to a node in the CURRENT PATH → cycle"}</strong><span>${vi ? "Chỉ visited nhưng không nằm trong current path → không phải cycle mới" : "Visited earlier but absent from the current path → no new cycle"}</span></section>
    <div class="lc2360-phases">${phases}</div>
    <section class="lc2360-metrics"><div><small>START</small><strong>${start ?? "—"}</strong></div><div><small>${vi ? "CURRENT PATH" : "CURRENT PATH"}</small><strong>${path.length}</strong></div><div><small>${vi ? "LONGEST" : "LONGEST"}</small><strong>${longest}</strong></div></section>
    ${focusHtml}
    <section class="lc2360-path"><header><strong>${vi ? "CURRENT WALK" : "CURRENT WALK"}</strong><span>${vi ? "position tăng từ 0" : "position starts at 0"}</span></header><div>${pathHtml}</div></section>
    <section class="lc2360-map"><header><strong>${vi ? "MỖI NODE TRỎ TỚI ĐÂU?" : "WHERE DOES EACH NODE POINT?"}</strong><span>${vi ? "mỗi node có tối đa một mũi tên đi ra" : "each node has at most one outgoing arrow"}</span></header><div>${nodeCards}</div></section>
    <div class="lc2360-legend"><span><i class="current"></i>${vi ? "node hiện tại" : "current"}</span><span><i class="path"></i>${vi ? "trong current path" : "current path"}</span><span><i class="cycle"></i>cycle</span><span><i class="visited"></i>${vi ? "đã xử lý trước" : "visited earlier"}</span></div>
    <footer class="lc2360-result ${final ? "done" : ""}"><small>${vi ? "KẾT QUẢ HIỆN TẠI" : "RUNNING ANSWER"}</small><strong>${longest}</strong><span>${escapeHtml(localPick(step.note))}</span></footer>
  </section>`;
}

// ---- Graph renderer (directed weighted graph) ----
function renderGraph(step, targetId = "treeView") {
  const { nodes, edges, hlNodes, hlEdges, visitedNodes } = step.graph;
  const n = nodes.length;
  const isLinear = step.graph.layout === "linear";
  const isFlow = step.graph.layout === "flow";
  const r = isLinear ? 44 : isFlow ? 28 : 24;
  const pad = isLinear ? 64 : isFlow ? 72 : 60;
  const size = Math.max(280, n * 50);
  const cx = size / 2;
  const cy = size / 2;
  const radius = size / 2 - pad;

  const pos = {};
  let svgWidth = size;
  let svgHeight = size;
  if (isFlow && step.graph.positions) {
    svgWidth = step.graph.width || 660;
    svgHeight = step.graph.height || 340;
    nodes.forEach((node) => {
      const custom = step.graph.positions[node.id];
      if (!custom) return;
      pos[node.id] = {
        x: pad + custom.x * (svgWidth - pad * 2),
        y: pad + custom.y * (svgHeight - pad * 2),
      };
    });
  } else if (isLinear) {
    const order = step.graph.order || nodes.map((node) => node.id);
    const nodeById = new Map(nodes.map((node) => [node.id, node]));
    const orderedNodes = order.map((id) => nodeById.get(id)).filter(Boolean);
    const remainingNodes = nodes.filter((node) => !order.includes(node.id));
    const allOrdered = orderedNodes.concat(remainingNodes);
    const hasDiscardedRow = allOrdered.some((node) => node.row === "discarded");
    const hasCircularEdge = edges.some((edge) => edge.circular);
    const gap = 196;
    const left = 96;
    svgWidth = Math.max(420, left * 2 + Math.max(0, allOrdered.length - 1) * gap);
    svgHeight = hasDiscardedRow ? 250 : hasCircularEdge ? 260 : 180;
    allOrdered.forEach((node, i) => {
      pos[node.id] = {
        x: left + i * gap,
        y: node.row === "discarded" ? 178 : 86,
      };
    });
  } else {
    // Position nodes in a circle
    nodes.forEach((node, i) => {
      const angle = (2 * Math.PI * i) / n - Math.PI / 2;
      pos[node.id] = {
        x: cx + radius * Math.cos(angle),
        y: cy + radius * Math.sin(angle),
      };
    });
  }

  const hlNodeSet = new Set(hlNodes || []);
  const visitedSet = new Set(visitedNodes || []);
  const restrictedSet = new Set(step.graph.restrictedNodes || []);
  const hlEdgeSet = new Set((hlEdges || []).map((e) => `${e[0]}-${e[1]}${e[2] ? `-${e[2]}` : ""}`));

  // Optional column dividers + labels (used by "semester"/level layouts to show
  // that nodes in the same column are grouped together, e.g. LeetCode 1136).
  let columnSvg = "";
  if (isFlow && step.graph.columnLabels) {
    for (const col of step.graph.columnLabels) {
      const colX = pad + col.x * (svgWidth - pad * 2);
      if (col.divider) {
        columnSvg += `<line x1="${colX}" y1="${pad * 0.35}" x2="${colX}" y2="${svgHeight - pad * 0.35}" class="graph-column-divider" />`;
      }
      if (col.label) {
        columnSvg += `<text x="${colX}" y="${pad * 0.55}" text-anchor="middle" class="graph-column-label">${escapeXml(col.label)}</text>`;
      }
    }
  }

  // Draw edges (with arrowheads and weight labels)
  let edgeSvg = "";
  const arrowId = "graph-arrow";
  const arrowPrevId = "graph-arrow-prev";
  const arrowHlId = "graph-arrow-hl";

  for (const edge of edges) {
    const from = pos[edge.u];
    const to = pos[edge.v];
    if (!from || !to) continue;

    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const len = Math.sqrt(dx * dx + dy * dy) || 1;
    const ux = dx / len;
    const uy = dy / len;
    const x1 = from.x + ux * (r + 2);
    const y1 = from.y + uy * (r + 2);
    const x2 = to.x - ux * (r + 6);
    const y2 = to.y - uy * (r + 6);

    const edgeKey = `${edge.u}-${edge.v}`;
    const reverseEdgeKey = `${edge.v}-${edge.u}`;
    const typedEdgeKey = `${edgeKey}${edge.kind ? `-${edge.kind}` : ""}`;
    const isHl = hlEdgeSet.has(edgeKey)
      || hlEdgeSet.has(typedEdgeKey)
      || (edge.undirected && hlEdgeSet.has(reverseEdgeKey));
    const kindClass = edge.kind ? ` ${edge.kind}` : "";
    const isDimmed = step.graph.dimUnfocused && hlEdgeSet.size > 0 && !isHl;
    const cls = `graph-edge${kindClass}${isHl ? " hl" : ""}${isDimmed ? " dim" : ""}`;
    const markerId = isHl ? arrowHlId : edge.kind === "prev" ? arrowPrevId : arrowId;
    const markerEnd = edge.undirected ? "" : `url(#${markerId})`;
    const isPointerLane = isLinear && (edge.kind === "next" || edge.kind === "prev") && Math.abs(dy) < 1;

    let mx = (x1 + x2) / 2;
    let my = (y1 + y2) / 2;
    const labelOffset = isFlow ? 30 : 12;
    let labelX = mx - uy * labelOffset;
    let labelY = my + ux * labelOffset;
    if (isFlow) {
      const normalX = -uy;
      const normalY = ux;
      const candidateA = { x: mx + normalX * labelOffset, y: my + normalY * labelOffset };
      const candidateB = { x: mx - normalX * labelOffset, y: my - normalY * labelOffset };
      const centerX = svgWidth / 2;
      const centerY = svgHeight / 2;
      const distanceA = (candidateA.x - centerX) ** 2 + (candidateA.y - centerY) ** 2;
      const distanceB = (candidateB.x - centerX) ** 2 + (candidateB.y - centerY) ** 2;
      const outward = distanceA >= distanceB ? candidateA : candidateB;
      labelX = outward.x;
      labelY = outward.y;
    }
    if (isLinear && edge.circular) {
      const isSelfLoop = edge.u === edge.v;
      const isPrev = edge.kind === "prev";
      if (isSelfLoop) {
        const side = isPrev ? -1 : 1;
        const startY = from.y - r;
        const endY = from.y + r;
        const controlX = from.x + side * 84;
        edgeSvg += `<path d="M ${from.x} ${startY} C ${controlX} ${from.y - 74}, ${controlX} ${from.y + 74}, ${from.x} ${endY}" class="${cls}" marker-end="${markerEnd}" />`;
        labelX = from.x + side * 70;
        labelY = from.y;
      } else {
        const curveY = from.y + (isPrev ? 86 : -66);
        const startY = from.y + (isPrev ? r + 2 : -r - 2);
        const endY = to.y + (isPrev ? r + 6 : -r - 6);
        edgeSvg += `<path d="M ${from.x} ${startY} C ${from.x} ${curveY}, ${to.x} ${curveY}, ${to.x} ${endY}" class="${cls}" marker-end="${markerEnd}" />`;
        labelX = (from.x + to.x) / 2;
        labelY = curveY + (isPrev ? 13 : -10);
      }
    } else if (isPointerLane) {
      const laneY = from.y + (edge.kind === "prev" ? 13 : -13);
      const direction = Math.sign(dx) || 1;
      const laneX1 = from.x + direction * (r + 2);
      const laneX2 = to.x - direction * (r + 6);
      edgeSvg += `<line x1="${laneX1}" y1="${laneY}" x2="${laneX2}" y2="${laneY}" class="${cls}" marker-end="${markerEnd}" />`;
      mx = (laneX1 + laneX2) / 2;
      my = laneY;
      labelX = mx;
      labelY = laneY + (edge.kind === "prev" ? 15 : -15);
    } else if (edge.kind === "next" || edge.kind === "prev") {
      // Offset next/prev perpendicular to the edge line so the two
      // directions render as parallel lines instead of overlapping.
      // Use a canonical (order-independent) direction so the "next" edge
      // (u->v) and its matching "prev" edge (v->u, i.e. reversed) always
      // offset to opposite sides — otherwise the reversed direction flips
      // the perpendicular too and both lines land on the same side.
      const swap = String(edge.u) > String(edge.v);
      const canonUx = swap ? -ux : ux;
      const canonUy = swap ? -uy : uy;
      const perpX = -canonUy;
      const perpY = canonUx;
      const side = edge.kind === "prev" ? -1 : 1;
      const offset = 8 * side;
      const ox1 = x1 + perpX * offset;
      const oy1 = y1 + perpY * offset;
      const ox2 = x2 + perpX * offset;
      const oy2 = y2 + perpY * offset;
      edgeSvg += `<line x1="${ox1}" y1="${oy1}" x2="${ox2}" y2="${oy2}" class="${cls}" marker-end="${markerEnd}" />`;
      mx = (ox1 + ox2) / 2;
      my = (oy1 + oy2) / 2;
      labelX = mx + perpX * 14 * side;
      labelY = my + perpY * 14 * side;
    } else {
      edgeSvg += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="${cls}" marker-end="${markerEnd}" />`;
    }

    const weightText = edge.w === undefined || edge.w === null ? "" : String(edge.w);
    const weightWidth = Math.max(24, weightText.length * 8 + 10);
    const weight = weightText
      ? `<rect x="${labelX - weightWidth / 2}" y="${labelY - 9}" width="${weightWidth}" height="18" rx="4" class="graph-weight-bg${isHl ? " hl" : ""}${isDimmed ? " dim" : ""}" />` +
        `<text x="${labelX}" y="${labelY}" class="graph-weight${kindClass}${isHl ? " hl" : ""}${isDimmed ? " dim" : ""}" text-anchor="middle" dy="0.35em">${escapeXml(weightText)}</text>`
      : "";
    edgeSvg += weight;
  }

  // Draw nodes
  let nodeSvg = "";
  const annotations = step.graph.annotations || null; // { nodeId: "label" } e.g. { 2: "slow", 5: "fast" }
  for (const node of nodes) {
    const p = pos[node.id];
    const isHl = hlNodeSet.has(node.id);
    const isVisited = visitedSet.has(node.id);
    const isRestricted = restrictedSet.has(node.id);
    let cls = "graph-node";
    if (isRestricted) cls += " restricted";
    else if (isHl) cls += " hl";
    else if (isVisited) cls += " visited";

    nodeSvg += `<g class="${cls}">`;
    nodeSvg += `<circle cx="${p.x}" cy="${p.y}" r="${r}" />`;
    nodeSvg += `<text x="${p.x}" y="${p.y}" dy="0.35em" text-anchor="middle">${escapeXml(node.label || String(node.id))}</text>`;
    // Annotation label above node (e.g. "fast", "slow", "head") — only when explicitly provided
    if (annotations && annotations[node.id] !== undefined) {
      const ann = annotations[node.id];
      let color = "#94a3b8"; // default gray
      if (ann.includes("fast.next")) color = "#fb923c"; // lighter orange
      else if (ann.includes("fast")) color = "#f59e0b"; // amber
      if (ann.includes("slow")) color = "#22c55e"; // green
      if (ann === "slow+fast") color = "#ec4899"; // pink for both
      if (ann === "head") color = "#6366f1"; // indigo
      if (ann.startsWith("head ")) color = "#6366f1"; // head combined
      const isFaded = ann.includes(".next");
      const opacity = isFaded ? "0.45" : "1";
      nodeSvg += `<text x="${p.x}" y="${p.y - r - 5}" text-anchor="middle" font-size="11" font-weight="700" fill="${color}" opacity="${opacity}">${escapeXml(ann)}</text>`;
    }
    // Distance label below node (for Dijkstra etc.)
    if (node.dist !== undefined) {
      const distLabel = node.dist === Infinity ? "∞" : node.dist;
      nodeSvg += `<text x="${p.x}" y="${p.y + r + 14}" class="graph-dist${isHl ? " hl" : ""}" text-anchor="middle">${distLabel}</text>`;
    }
    if (node.sub !== undefined) {
      nodeSvg += `<text x="${p.x}" y="${p.y + r + 18}" class="graph-sub" text-anchor="middle">${escapeXml(node.sub)}</text>`;
    }
    nodeSvg += `</g>`;
  }

  // Arrow marker definitions
  const defs = `<defs>
    <marker id="${arrowId}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="#64748b" />
    </marker>
    <marker id="${arrowPrevId}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="#38bdf8" />
    </marker>
    <marker id="${arrowHlId}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="#f59e0b" />
    </marker>
  </defs>`;

  const caption = step.graph.caption
    ? `<div class="graph-caption">${escapeXml(pick(step.graph.caption))}</div>`
    : "";
  $(targetId).innerHTML =
    caption +
    `<svg viewBox="0 0 ${svgWidth} ${svgHeight}" width="${svgWidth}" height="${svgHeight}" class="tree-svg graph-svg${isLinear ? " graph-linear" : ""}${isFlow ? " graph-flow" : ""}">` +
    defs + columnSvg + edgeSvg + nodeSvg +
    `</svg>`;
}

function renderCountPaths1976View(step) {
  const view = step.countPaths1976View || {};
  const vi = lang === "vi";
  const stageIndex = ["build", "init"].includes(view.phase)
    ? 0
    : ["pop", "inspect"].includes(view.phase)
      ? 1
      : ["compare", "shorter", "equal"].includes(view.phase)
        ? 2
        : 3;
  const stages = vi
    ? ["1. Dựng graph", "2. Pop gần nhất", "3. Cập nhật dist + ways", "4. Trả kết quả"]
    : ["1. Build graph", "2. Pop closest", "3. Update dist + ways", "4. Return result"];
  const stagesHtml = stages.map((label, index) => {
    const state = index < stageIndex ? "is-done" : index === stageIndex ? "is-active" : "";
    return `<span class="${state}">${index < stageIndex ? "✓" : ""}<b>${escapeHtml(label)}</b></span>`;
  }).join("");

  const nodeCards = (view.nodes || []).map((item) => {
    const classes = ["cp1976-node-state"];
    if (item.isSource) classes.push("is-source");
    if (item.isTarget) classes.push("is-target");
    if (item.isFinalized) classes.push("is-finalized");
    if (item.isCurrent) classes.push("is-current");
    if (item.isCandidate) classes.push("is-candidate");
    const currentRole = view.phase === "build"
      ? (vi ? "ĐANG NỐI" : "CONNECTING")
      : (vi ? "ĐANG POP" : "POPPED");
    const role = item.isSource
      ? "SOURCE"
      : item.isTarget
        ? "TARGET"
        : item.isCurrent
          ? currentRole
          : `NODE ${item.node}`;
    return `<div class="${classes.join(" ")}">
      <header><b>${escapeHtml(role)}</b><span>${escapeHtml(item.node)}</span></header>
      <div><small>dist</small><strong>${escapeHtml(item.distance)}</strong></div>
      <div><small>ways</small><strong>${escapeHtml(item.ways)}</strong></div>
    </div>`;
  }).join("");

  const heapHtml = (view.heap || []).length
    ? view.heap.map((item, index) => `<div class="cp1976-heap-item${index === 0 ? " is-front" : ""}">
        <small>${index === 0 ? (vi ? "POP TIẾP" : "NEXT POP") : `#${index + 1}`}</small>
        <strong>(${escapeHtml(item.time)}, ${escapeHtml(item.node)})</strong>
        <em>time, node</em>
      </div>`).join("")
    : `<em class="cp1976-empty">${vi ? "Heap đang rỗng" : "Heap is empty"}</em>`;

  const edge = view.activeEdge;
  const currentState = edge ? (view.nodes || []).find((item) => item.node === edge.u) : null;
  const hasCandidate = edge && view.candidateTime !== null && view.candidateTime !== undefined;
  const relationSymbol = view.relation === "shorter"
    ? "<"
    : view.relation === "equal"
      ? "="
      : view.relation === "longer"
        ? ">"
        : "?";
  const calculationHtml = hasCandidate
    ? `<div class="cp1976-calc">
        <small>${vi ? "THỬ ĐI QUA ROAD" : "TRY THIS ROAD"} ${escapeHtml(edge.u)} — ${escapeHtml(edge.v)}</small>
        <div class="cp1976-equation">
          <span>dist[${escapeHtml(edge.u)}]</span><b>${escapeHtml(currentState?.distance ?? "?")}</b>
          <i>+</i><span>${vi ? "road" : "road"}</span><b>${escapeHtml(edge.w)}</b>
          <i>=</i><strong>${escapeHtml(view.candidateTime)}</strong>
        </div>
        ${view.previousDistance !== null && view.previousDistance !== undefined
          ? `<div class="cp1976-compare is-${escapeHtml(view.relation || "pending")}">
              <b>${escapeHtml(view.candidateTime)}</b><i>${escapeHtml(relationSymbol)}</i><b>${escapeHtml(view.previousDistance)}</b>
              <span>${vi ? `so với dist[${edge.v}] hiện tại` : `compared with current dist[${edge.v}]`}</span>
            </div>`
          : ""}
      </div>`
    : `<div class="cp1976-calc is-idle"><small>${vi ? "PHÉP RELAX" : "RELAXATION"}</small><p>${vi ? "Chọn một cạnh để xem phép tính dist và ways." : "Select an edge to see the dist and ways calculation."}</p></div>`;

  let decisionText = vi
    ? "Dijkstra luôn xử lý node có thời gian nhỏ nhất trước."
    : "Dijkstra always processes the node with the smallest time first.";
  let waysFormula = vi ? "Chưa thay đổi ways" : "ways is unchanged";
  if (view.relation === "shorter") {
    decisionText = vi
      ? "Đường mới ngắn hơn → thay dist và thay toàn bộ số cách cũ."
      : "The new route is shorter → replace dist and all old path counts.";
    waysFormula = `ways[${edge.v}] = ways[${edge.u}] = ${view.incomingWays}`;
  } else if (view.relation === "equal") {
    decisionText = vi
      ? "Thời gian bằng nhau → giữ dist và cộng thêm số cách mới."
      : "The times are equal → keep dist and add the new path count.";
    waysFormula = `ways[${edge.v}] = (${view.previousWays} + ${view.incomingWays}) % MOD`;
  } else if (view.relation === "longer") {
    decisionText = vi
      ? "Đường mới dài hơn → bỏ qua, dist và ways đều giữ nguyên."
      : "The new route is longer → ignore it; dist and ways stay unchanged.";
    waysFormula = vi ? "Không cập nhật" : "No update";
  } else if (view.relation === "check-equal") {
    decisionText = vi
      ? "Không ngắn hơn; cần kiểm tra tiếp xem thời gian có bằng nhau không."
      : "It is not shorter; next check whether the times are equal.";
  }

  const answerHtml = view.answer !== null && view.answer !== undefined
    ? `<div class="cp1976-answer"><small>${vi ? "KẾT QUẢ" : "ANSWER"}</small><strong>${escapeHtml(view.answer)}</strong><span>${vi ? `đường ngắn nhất tới node ${view.target}` : `shortest routes to node ${view.target}`}</span></div>`
    : "";

  $("treeView").innerHTML = `<section class="cp1976-viz" aria-label="${vi ? "Trực quan hóa đếm đường đi ngắn nhất" : "Shortest-path counting visualization"}">
    <div class="cp1976-stages">${stagesHtml}</div>
    <div class="cp1976-concepts">
      <div><b>dist[v]</b><span>${vi ? "thời gian ngắn nhất tới v" : "shortest time to v"}</span></div>
      <div><b>ways[v]</b><span>${vi ? "số đường đạt đúng dist[v]" : "routes attaining dist[v]"}</span></div>
    </div>
    <div class="cp1976-rules">
      <article class="is-shorter${view.relation === "shorter" ? " is-active" : ""}"><small>${vi ? "TRƯỜNG HỢP 1" : "CASE 1"}</small><strong>new_time &lt; dist[v]</strong><span>${vi ? "Thay dist[v] · ways[v] = ways[u]" : "Replace dist[v] · ways[v] = ways[u]"}</span></article>
      <article class="is-equal${view.relation === "equal" ? " is-active" : ""}"><small>${vi ? "TRƯỜNG HỢP 2" : "CASE 2"}</small><strong>new_time = dist[v]</strong><span>${vi ? "Giữ dist[v] · ways[v] += ways[u]" : "Keep dist[v] · ways[v] += ways[u]"}</span></article>
    </div>
    <div class="cp1976-main">
      <section class="cp1976-panel cp1976-graph-panel"><header><strong>${vi ? "BẢN ĐỒ ĐƯỜNG ĐI" : "ROAD MAP"}</strong><span>${vi ? "số trên cạnh = thời gian" : "edge label = travel time"}</span></header><div id="countPaths1976Graph"></div></section>
      <aside class="cp1976-side">
        ${calculationHtml}
        <div class="cp1976-decision is-${escapeHtml(view.relation || "neutral")}"><small>${vi ? "QUYẾT ĐỊNH" : "DECISION"}</small><strong>${escapeHtml(decisionText)}</strong><code>${escapeHtml(waysFormula)}</code></div>
        ${answerHtml}
      </aside>
    </div>
    <section class="cp1976-panel"><header><strong>dist + ways</strong><span>${vi ? "trạng thái của từng node" : "state of every node"}</span></header><div class="cp1976-node-grid">${nodeCards}</div></section>
    <section class="cp1976-panel"><header><strong>MIN-HEAP</strong><span>${vi ? "ưu tiên time nhỏ nhất" : "smallest time first"}</span></header><div class="cp1976-heap">${heapHtml}</div></section>
  </section>`;
  renderGraph(step, "countPaths1976Graph");
}

function renderNetworkDelayView(step) {
  const view = step.networkDelayView;
  const vi = lang === "vi";
  const dijkstraPhases = new Set(["init", "pop", "stale", "inspect", "calculate", "compare", "update", "push"]);
  const activeStage = view.phase === "build" ? 0 : dijkstraPhases.has(view.phase) ? 1 : 2;
  const stageLabels = vi
    ? ["1. Dựng graph", "2. Chạy Dijkstra", "3. Lấy max(dist)"]
    : ["1. Build graph", "2. Run Dijkstra", "3. Take max(dist)"];
  const stageHtml = stageLabels.map((label, index) => {
    const state = index < activeStage ? "is-done" : index === activeStage ? "is-active" : "";
    return `<span class="${state}">${index < activeStage ? "✓" : ""}<b>${escapeHtml(label)}</b></span>`;
  }).join("");

  const distanceHtml = view.distances.map((item) => {
    const classes = ["network-delay-dist"];
    let stateLabel = vi ? "chưa tới" : "unreached";
    if (item.value !== "∞") stateLabel = vi ? "đã biết" : "known";
    if (item.isSource) {
      classes.push("is-source");
      stateLabel = "source";
    }
    if (item.isFinalized) {
      classes.push("is-finalized");
      stateLabel = vi ? "đã chốt" : "finalized";
    }
    if (item.isCandidate) {
      classes.push("is-candidate");
      stateLabel = vi ? "đang so sánh" : "candidate";
    }
    if (item.isCurrent) {
      classes.push("is-current");
      stateLabel = vi ? "vừa pop" : "popped";
    }
    return `<div class="${classes.join(" ")}">
      <small>node ${escapeHtml(item.node)}</small>
      <strong>${escapeHtml(item.value)}</strong>
      <em>${escapeHtml(stateLabel)}</em>
    </div>`;
  }).join("");

  const heapHtml = view.heap.length
    ? view.heap.map((item, index) => `<div class="network-delay-heap-item${index === 0 ? " is-front" : ""}">
        <small>${index === 0 ? (vi ? "POP TIẾP" : "NEXT POP") : `[${index}]`}</small>
        <strong>(${escapeHtml(item.distance)}, ${escapeHtml(item.node)})</strong>
        <em>distance, node</em>
      </div>`).join("")
    : `<span class="network-delay-empty">${vi ? "heap rỗng" : "empty heap"}</span>`;

  const edge = view.activeEdge;
  const currentDistance = edge
    ? (view.distances.find((item) => item.node === edge.u) || {}).value
    : null;
  let actionMain;
  let actionDetail;
  let outcomeClass = "";
  if (view.phase === "build") {
    actionMain = edge ? `${edge.u} → ${edge.v} · w=${edge.w}` : (vi ? "Tạo adjacency list" : "Create adjacency list");
    actionDetail = edge
      ? (vi ? "Lưu cạnh có hướng và trọng số vào graph[u]." : "Store the directed weighted edge in graph[u].")
      : (vi ? "Chuẩn bị danh sách cạnh đi ra cho mỗi node." : "Prepare outgoing edges for every node.");
  } else if (view.phase === "init") {
    actionMain = `dist[${view.source}] = 0`;
    actionDetail = vi ? "Nguồn vào heap với khoảng cách 0; các node khác vẫn là ∞." : "Push the source with distance 0; every other node remains ∞.";
  } else if (view.phase === "pop") {
    actionMain = view.currentNode === null
      ? (vi ? "Lấy phần tử nhỏ nhất của heap" : "Take the minimum heap entry")
      : `pop → node ${view.currentNode}`;
    actionDetail = vi ? "Chỉ node có distance nhỏ nhất hiện tại được mở rộng." : "Only the node with the smallest current distance is expanded.";
  } else if (view.phase === "stale") {
    actionMain = vi ? `Bỏ qua bản ghi cũ của node ${view.currentNode}` : `Skip stale entry for node ${view.currentNode}`;
    actionDetail = vi ? "Heap entry lớn hơn dist đang lưu, nên không được duyệt cạnh từ entry này." : "The heap entry exceeds the stored dist, so its outgoing edges are not explored.";
    outcomeClass = "is-rejected";
  } else if (edge && view.phase === "inspect") {
    actionMain = `${edge.u} → ${edge.v} · w=${edge.w}`;
    actionDetail = vi ? `Thử đi từ node ${edge.u} đang xử lý sang node ${edge.v}.` : `Try moving from current node ${edge.u} to node ${edge.v}.`;
  } else if (edge && view.phase === "calculate") {
    actionMain = `${currentDistance} + ${edge.w} = ${view.candidate}`;
    actionDetail = vi ? `Đây là thời gian mới nếu tín hiệu đi qua cạnh ${edge.u} → ${edge.v}.` : `This is the candidate arrival time through edge ${edge.u} → ${edge.v}.`;
  } else if (edge && view.phase === "compare") {
    actionMain = `${view.candidate} < ${view.oldDistance} → ${view.improves ? "True" : "False"}`;
    actionDetail = view.improves
      ? (vi ? `Đường mới tốt hơn, dòng kế tiếp sẽ cập nhật dist[${edge.v}].` : `The new route is better; the next line updates dist[${edge.v}].`)
      : (vi ? `Không tốt hơn, giữ nguyên dist[${edge.v}] = ${view.oldDistance}.` : `No improvement; keep dist[${edge.v}] = ${view.oldDistance}.`);
    outcomeClass = view.improves ? "is-accepted" : "is-rejected";
  } else if (edge && view.phase === "update") {
    actionMain = `dist[${edge.v}]: ${view.oldDistance} → ${view.candidate}`;
    actionDetail = vi ? "Khoảng cách ngắn nhất đã biết được thay bằng giá trị nhỏ hơn." : "Replace the known shortest distance with the smaller value.";
    outcomeClass = "is-accepted";
  } else if (edge && view.phase === "push") {
    actionMain = `heappush((${view.candidate}, ${edge.v}))`;
    actionDetail = vi ? "Trạng thái mới vào heap và sẽ được sắp theo distance." : "The improved state enters the heap and is ordered by distance.";
    outcomeClass = "is-accepted";
  } else if (view.phase === "done") {
    actionMain = view.answer === -1 ? "return -1" : `return ${view.answer}`;
    actionDetail = view.answer === -1
      ? (vi ? "Vẫn còn node có dist = ∞, nên tín hiệu không tới được toàn mạng." : "At least one dist is ∞, so the signal cannot reach the whole network.")
      : (vi ? `Giá trị lớn nhất trong dist là ${view.answer}: thời điểm node cuối cùng nhận tín hiệu.` : `The maximum dist is ${view.answer}: when the final node receives the signal.`);
    outcomeClass = view.answer === -1 ? "is-rejected" : "is-accepted";
  } else {
    actionMain = vi ? "Heap rỗng → kiểm tra max(dist)" : "Heap empty → inspect max(dist)";
    actionDetail = vi ? "Khoảng cách lớn nhất quyết định thời gian toàn mạng nhận được tín hiệu." : "The largest distance determines when the whole network has received the signal.";
  }

  const summary = vi
    ? `Dijkstra từ nguồn ${view.source}. Heap có ${view.heap.length} trạng thái.`
    : `Dijkstra from source ${view.source}. The heap contains ${view.heap.length} states.`;
  $("treeView").innerHTML = `<section class="network-delay-viz" aria-label="${escapeHtml(summary)}">
    <div class="network-delay-phases">${stageHtml}</div>
    <div class="network-delay-workspace">
      <div id="networkDelayGraph" class="network-delay-graph"></div>
      <div class="network-delay-state">
        <div class="network-delay-section-head"><strong>dist</strong><span>${vi ? "thời gian ngắn nhất đã biết" : "best known arrival time"}</span></div>
        <div class="network-delay-distances">${distanceHtml}</div>
        <div class="network-delay-section-head"><strong>min-heap</strong><span>${vi ? "ưu tiên distance nhỏ nhất" : "smallest distance first"}</span></div>
        <div class="network-delay-heap">${heapHtml}</div>
      </div>
    </div>
    <div class="network-delay-action ${outcomeClass}"><strong>${escapeHtml(actionMain)}</strong><span>${escapeHtml(actionDetail)}</span></div>
    <div class="network-delay-legend">
      <span><i class="current"></i>${vi ? "vừa pop / đang xử lý" : "popped / current"}</span>
      <span><i class="candidate"></i>${vi ? "node đang relax" : "relax candidate"}</span>
      <span><i class="finalized"></i>${vi ? "khoảng cách đã chốt" : "finalized distance"}</span>
    </div>
  </section>`;
  renderGraph(step, "networkDelayGraph");
}

function renderReachable882View(step) {
  const view = step.reachable882View || {};
  const vi = lang === "vi";
  const phase = String(view.phase || "build");
  const distances = Array.isArray(view.distances) ? view.distances : [];
  const heap = Array.isArray(view.heap) ? view.heap : [];
  const edgeRows = Array.isArray(view.edgeRows) ? view.edgeRows : [];
  const activeStage = phase === "build" ? 0
    : ["init", "pop", "stale", "relax", "update"].includes(phase) ? 1
      : phase === "count-original" ? 2 : 3;
  const stageLabels = vi
    ? ["1. Nén cạnh", "2. Dijkstra node gốc", "3. Đếm node gốc", "4. Đếm node mới"]
    : ["1. Compress edges", "2. Dijkstra original nodes", "3. Count originals", "4. Count new nodes"];
  const stages = stageLabels.map((label, index) => {
    const state = index < activeStage ? "is-done" : index === activeStage ? "is-active" : "";
    return `<span class="${state}">${index < activeStage ? "✓" : ""}<b>${escapeHtml(label)}</b></span>`;
  }).join("");
  const distanceHtml = distances.map((item) => {
    const classes = ["network-delay-dist"];
    if (item.node === 0) classes.push("is-source");
    if (item.finalized) classes.push("is-finalized");
    if (item.current) classes.push("is-current");
    return `<div class="${classes.join(" ")}"><small>node ${item.node}</small><strong>${escapeHtml(String(item.value))}</strong><em>${item.reachable ? `${vi ? "còn" : "left"} ${item.remaining}` : (vi ? "ngoài budget" : "over budget")}</em></div>`;
  }).join("");
  const heapHtml = heap.length
    ? heap.map((item, index) => `<div class="network-delay-heap-item${index === 0 ? " is-front" : ""}"><small>${index === 0 ? (vi ? "POP TIẾP" : "NEXT POP") : `[${index}]`}</small><strong>(${item.distance}, ${item.node})</strong><em>distance, node</em></div>`).join("")
    : `<span class="network-delay-empty">${vi ? "heap rỗng" : "empty heap"}</span>`;
  const ledgerHtml = edgeRows.map((edge) => {
    const active = edge.index === view.activeEdgeIndex;
    const visibleCount = Math.min(edge.cnt, 14);
    const leftReach = Math.min(edge.cnt, edge.fromU);
    const rightReach = Math.min(edge.cnt, edge.fromV);
    const dots = visibleCount
      ? Array.from({ length: visibleCount }, (_, visualIndex) => {
          const actualIndex = edge.cnt <= 14 ? visualIndex : Math.floor(visualIndex * edge.cnt / visibleCount);
          const fromU = edge.counted && actualIndex < leftReach;
          const fromV = edge.counted && actualIndex >= edge.cnt - rightReach;
          const state = fromU && fromV ? "both" : fromU ? "from-u" : fromV ? "from-v" : "unreached";
          return `<i class="${state}" title="subdivision ${actualIndex + 1}">${actualIndex + 1}</i>`;
        }).join("")
      : `<em>${vi ? "không có node mới" : "no new nodes"}</em>`;
    const extra = edge.cnt > visibleCount ? `<b class="reachable882-more">+${edge.cnt - visibleCount}</b>` : "";
    return `<article class="reachable882-edge ${active ? "active" : ""} ${edge.counted ? "counted" : "pending"}">
      <header><strong>${edge.u} ⟷ ${edge.v}</strong><span>cnt=${edge.cnt} · cost=${edge.cnt}+1</span></header>
      <div class="reachable882-chain"><b>${edge.u}</b><span>${dots}${extra}</span><b>${edge.v}</b></div>
      <footer><span><small>from ${edge.u}</small><strong>${edge.fromU}</strong></span><i>+</i><span><small>from ${edge.v}</small><strong>${edge.fromV}</strong></span><i>→</i><span class="total"><small>${vi ? "NODE MỚI" : "NEW NODES"}</small><strong>${edge.counted ? edge.reachable : "?"}/${edge.cnt}</strong></span></footer>
    </article>`;
  }).join("");
  let actionMain = "";
  let actionDetail = "";
  let outcomeClass = "";
  const edge = view.activeEdge;
  if (phase === "build") {
    actionMain = "weight = cnt + 1";
    actionDetail = vi ? "Nén chuỗi node mới để Dijkstra chỉ chạy trên original nodes." : "Compress each new-node chain so Dijkstra runs only on original nodes.";
  } else if (phase === "init") {
    actionMain = "dist[0] = 0";
    actionDetail = vi ? `Bắt đầu với maxMoves = ${view.maxMoves}.` : `Start with maxMoves = ${view.maxMoves}.`;
  } else if (phase === "pop") {
    actionMain = `pop node ${view.currentNode}`;
    actionDetail = vi ? "Khoảng cách nhỏ nhất của node này đã được chốt." : "This node's shortest distance is finalized.";
  } else if (phase === "stale") {
    actionMain = vi ? "Bỏ heap entry cũ" : "Skip stale heap entry";
    actionDetail = vi ? "Một đường ngắn hơn đã được lưu trước đó." : "A shorter route was stored earlier.";
    outcomeClass = "is-rejected";
  } else if (phase === "relax" && edge) {
    actionMain = `${view.candidate} < ${view.oldDistance} → ${view.improves ? "True" : "False"}`;
    actionDetail = vi
      ? `Cạnh ${edge.u}-${edge.v} có cost ${edge.cnt}+1 = ${edge.cost}.`
      : `Edge ${edge.u}-${edge.v} costs ${edge.cnt}+1 = ${edge.cost}.`;
    outcomeClass = view.improves ? "is-accepted" : "is-rejected";
  } else if (phase === "update" && edge) {
    const target = edge.u === view.currentNode ? edge.v : edge.u;
    actionMain = `dist[${target}] = ${view.candidate}`;
    actionDetail = vi ? "Cập nhật khoảng cách và push trạng thái mới vào heap." : "Update the distance and push the improved state into the heap.";
    outcomeClass = "is-accepted";
  } else if (phase === "count-original") {
    actionMain = `${view.originalCount} original node${view.originalCount === 1 ? "" : "s"}`;
    actionDetail = `dist[u] ≤ maxMoves (${view.maxMoves})`;
    outcomeClass = "is-accepted";
  } else if (phase === "count-edge" && edge) {
    const row = edgeRows[edge.index];
    actionMain = `min(${edge.cnt}, ${row.fromU} + ${row.fromV}) = ${view.edgeContribution}`;
    actionDetail = vi ? `Budget còn lại tiến vào cạnh từ hai đầu ${edge.u} và ${edge.v}.` : `Remaining budgets enter the edge from endpoints ${edge.u} and ${edge.v}.`;
    outcomeClass = "is-accepted";
  } else {
    actionMain = `${view.originalCount} + ${view.newCount} = ${view.total}`;
    actionDetail = vi ? "Original nodes + subdivided nodes reachable." : "Reachable original nodes plus reachable subdivided nodes.";
    outcomeClass = "is-accepted";
  }
  const activeLine = Array.isArray(step.codeLines) ? step.codeLines[0] : null;
  const summary = vi
    ? `Bài 882: ${view.originalCount} node gốc, ${view.newCount} node mới, tổng ${view.total}.`
    : `Problem 882: ${view.originalCount} original, ${view.newCount} new, total ${view.total}.`;

  $("treeView").innerHTML = `<section class="network-delay-viz reachable882-viz" role="img" aria-label="${escapeHtml(summary)}">
    <div class="network-delay-phases">${stages}</div>
    <div class="reachable882-title"><small>${vi ? "DÒNG" : "LINE"} ${activeLine ?? "—"}</small><strong>${escapeHtml(pick(step.title))}</strong><span>${escapeHtml(pick(step.note))}</span></div>
    <section class="reachable882-equation"><strong>edge cost = cnt + 1</strong><span>${vi ? "Dijkstra tìm dist tới original nodes" : "Dijkstra finds dist to original nodes"}</span><b>new = min(cnt, left[u] + left[v])</b></section>
    <div class="network-delay-workspace">
      <div id="reachable882Graph" class="network-delay-graph"></div>
      <div class="network-delay-state">
        <div class="network-delay-section-head"><strong>dist + remaining</strong><span>remaining[u] = max(0, ${view.maxMoves} - dist[u])</span></div>
        <div class="network-delay-distances">${distanceHtml}</div>
        <div class="network-delay-section-head"><strong>min-heap</strong><span>${vi ? "distance nhỏ nhất trước" : "smallest distance first"}</span></div>
        <div class="network-delay-heap">${heapHtml}</div>
      </div>
    </div>
    <div class="reachable882-metrics"><span><small>ORIGINAL</small><strong>${view.originalCount}</strong></span><i>+</i><span><small>SUBDIVIDED</small><strong>${view.newCount}</strong></span><i>=</i><span class="total"><small>TOTAL</small><strong>${view.total}</strong></span></div>
    <div class="network-delay-action ${outcomeClass}"><strong>${escapeHtml(actionMain)}</strong><span>${escapeHtml(actionDetail)}</span></div>
    <section class="reachable882-ledger"><header><strong>SUBDIVISION LEDGER</strong><span>${vi ? "xanh: từ u · hồng: từ v · tím: gặp nhau" : "green: from u · pink: from v · violet: overlap"}</span></header><div>${ledgerHtml}</div></section>
  </section>`;
  renderGraph(step, "reachable882Graph");
}

function renderMaze499View(step) {
  const view = step.maze499View || {};
  const vi = lang === "vi";
  const maze = view.maze || [];
  const rows = view.rows || maze.length;
  const cols = view.cols || (maze[0] ? maze[0].length : 0);
  const cellKey = (cell) => Array.isArray(cell) ? `${cell[0]},${cell[1]}` : "";
  const currentKey = cellKey(view.current);
  const stopKey = cellKey(view.stop);
  const ballKey = cellKey(view.ball);
  const holeKey = cellKey(view.hole);
  const rolling = new Set((view.rollPath || []).map(cellKey));
  const route = new Set((view.finalRoute || []).map(cellKey));
  const settled = new Set(view.settled || []);
  const directionLetter = view.direction && view.direction.letter;
  const phases = vi
    ? ["1. Lăn tới điểm dừng", "2. Dijkstra (dist, path)", "3. Rơi vào hole"]
    : ["1. Roll to a stop", "2. Dijkstra (dist, path)", "3. Fall into the hole"];
  const phaseIndex = ["model", "init"].includes(view.phase)
    ? 0
    : ["done", "impossible"].includes(view.phase) ? 2 : 1;
  const phaseHtml = phases.map((label, index) => `<span class="${index === phaseIndex ? "active" : ""} ${index < phaseIndex ? "done" : ""}">${index < phaseIndex ? "✓ " : ""}${label}</span>`).join("");

  let cells = "";
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const key = `${r},${c}`;
      const classes = ["maze499-cell", maze[r][c] === 1 ? "wall" : "open"];
      if (settled.has(key)) classes.push("settled");
      if (route.has(key)) classes.push("route");
      if (rolling.has(key)) classes.push("rolling");
      if (key === stopKey) classes.push("stop");
      if (key === currentKey) classes.push("current");
      if (key === ballKey) classes.push("ball");
      if (key === holeKey) classes.push("hole");
      const marker = key === ballKey
        ? `<strong>B</strong><small>${vi ? "BALL" : "BALL"}</small>`
        : key === holeKey
          ? `<strong>H</strong><small>HOLE</small>`
          : maze[r][c] === 1
            ? `<strong>×</strong>`
            : route.has(key) ? `<strong>•</strong>` : "";
      cells += `<div class="${classes.join(" ")}"><i>${r},${c}</i>${marker}</div>`;
    }
  }

  const heap = view.heap || [];
  const heapHtml = heap.length
    ? heap.slice(0, 8).map((item, index) => `<div class="maze499-state ${index === 0 ? "top" : ""}"><span>#${index + 1}</span><b>${item.distance}</b><code>'${escapeHtml(item.path || "∅")}'</code><em>(${item.r},${item.c})</em></div>`).join("")
    : `<div class="maze499-empty">${vi ? "heap rỗng" : "empty heap"}</div>`;
  const best = view.best || [];
  const bestHtml = best.length
    ? best.slice(0, 9).map((item) => `<div class="maze499-best-state ${item.settled ? "settled" : ""}"><span>(${item.r},${item.c})</span><b>${item.distance}</b><code>'${escapeHtml(item.path || "∅")}'</code></div>`).join("")
    : `<div class="maze499-empty">${vi ? "chưa có best state" : "no best state yet"}</div>`;
  const dirs = [
    ["d", "↓", vi ? "xuống" : "down"],
    ["l", "←", vi ? "trái" : "left"],
    ["r", "→", vi ? "phải" : "right"],
    ["u", "↑", vi ? "lên" : "up"],
  ];
  const dirsHtml = dirs.map(([letter, arrow, name]) => `<span class="${letter === directionLetter ? "active" : ""}"><b>${letter}</b><i>${arrow}</i><small>${name}</small></span>`).join("");
  const candidate = view.candidate;
  const incumbent = view.incumbent;
  const comparisonHtml = candidate
    ? `<section class="maze499-comparison ${view.accepted === true ? "accepted" : view.accepted === false ? "rejected" : "pending"}">
        <div><small>CANDIDATE</small><strong>(${candidate.distance}, '${escapeHtml(candidate.path)}')</strong><span>stop (${candidate.r},${candidate.c}) · +${candidate.rolled}</span></div>
        <b class="maze499-compare-symbol">${view.accepted === true ? "<" : view.accepted === false ? "≥" : "?"}</b>
        <div><small>CURRENT BEST</small><strong>${incumbent ? `(${incumbent.distance}, '${escapeHtml(incumbent.path)}')` : "(∞, —)"}</strong><span>${view.accepted === true ? (vi ? "candidate thắng" : "candidate wins") : view.accepted === false ? (vi ? "giữ best cũ" : "keep current best") : (vi ? "chuẩn bị so sánh" : "ready to compare")}</span></div>
      </section>`
    : `<section class="maze499-rule"><code>(distance₁, path₁) &lt; (distance₂, path₂)</code><span>${vi ? "so distance trước, path sau" : "compare distance first, then path"}</span></section>`;
  const rollSummary = candidate
    ? `<span><small>${vi ? "LĂN" : "ROLL"}</small><strong>'${escapeHtml(directionLetter || "-")}' · ${candidate.rolled} ${vi ? "ô" : "cells"}</strong></span><i>→</i><span><small>${view.fellIntoHole ? "HOLE" : (vi ? "ĐIỂM DỪNG" : "STOP")}</small><strong>(${candidate.r},${candidate.c})</strong></span>`
    : `<span><small>ORDER</small><strong>d &lt; l &lt; r &lt; u</strong></span><i>→</i><span><small>HEAP KEY</small><strong>(distance, path)</strong></span>`;
  const finished = ["done", "impossible"].includes(view.phase);
  const answerText = !finished ? "—" : view.answer === "impossible" ? "impossible" : `'${view.answer}'`;
  const activeLine = Array.isArray(step.codeLines) ? step.codeLines[0] : step.codeLines;
  const summary = vi
    ? `Bài 499: heap có ${heap.length} state, kết quả ${answerText}.`
    : `Problem 499: heap has ${heap.length} states, result ${answerText}.`;

  $("treeView").innerHTML = `<section class="maze499-viz" role="img" aria-label="${escapeHtml(summary)}">
    <div class="maze499-phases">${phaseHtml}</div>
    <header class="maze499-title"><small>${vi ? "DÒNG" : "LINE"} ${activeLine ?? "—"}</small><strong>${escapeHtml(pick(step.title))}</strong><span>${escapeHtml(pick(step.note))}</span></header>
    <div class="maze499-roll-summary">${rollSummary}</div>
    <div class="maze499-workspace">
      <section class="maze499-maze-panel"><header><strong>MAZE</strong><span>B = ball · H = hole</span></header><div class="maze499-grid" style="--maze499-cols:${cols}">${cells}</div><footer><span><i class="ball"></i>ball</span><span><i class="hole"></i>hole</span><span><i class="rolling"></i>${vi ? "đang lăn" : "rolling"}</span><span><i class="route"></i>${vi ? "đường cuối" : "final route"}</span></footer></section>
      <section class="maze499-state-panel">
        <div class="maze499-directions"><header><strong>DIRECTION ORDER</strong><span>${vi ? "thứ tự từ điển" : "lexicographic order"}</span></header><div>${dirsHtml}</div></div>
        <div class="maze499-heap"><header><strong>MIN-HEAP</strong><span>(distance, path, row, col)</span></header><div>${heapHtml}</div></div>
      </section>
    </div>
    ${comparisonHtml}
    <section class="maze499-best"><header><strong>BEST STOPPING STATES</strong><span>${vi ? "mỗi ô lưu cặp tốt nhất" : "best pair stored for each cell"}</span></header><div>${bestHtml}</div></section>
    <div class="maze499-result ${finished ? "visible" : ""}"><small>RESULT</small><strong>${escapeHtml(answerText)}</strong><span>${view.phase === "done" ? (vi ? "shortest + lexicographically smallest" : "shortest + lexicographically smallest") : view.phase === "impossible" ? (vi ? "hole không tới được" : "the hole is unreachable") : (vi ? "chưa kết thúc" : "not finished")}</span></div>
  </section>`;
}

function renderRestricted1786View(step) {
  const view = step.restricted1786View || {};
  const vi = lang === "vi";
  const phases = vi
    ? ["1. Dựng graph", "2. Dijkstra từ n", "3. Hướng cạnh", "4. DP đếm đường"]
    : ["1. Build graph", "2. Dijkstra from n", "3. Orient edges", "4. Count with DP"];
  const phaseIndex = view.phase === "build" || view.phase === "invalid" ? 0
    : ["dijkstra", "stale", "relax"].includes(view.phase) ? 1
      : view.phase === "orient" ? 2 : 3;
  const phaseHtml = phases.map((label, index) => `<span class="${index === phaseIndex ? "active" : ""} ${index < phaseIndex ? "done" : ""}">${index < phaseIndex ? "✓ " : ""}${label}</span>`).join("");
  const distances = view.distances || [];
  const ways = view.ways || [];
  const distanceHtml = distances.map((item) => `<div class="restricted1786-dist ${item.current ? "current" : ""} ${item.settled ? "settled" : ""}"><small>node ${item.node}</small><strong>${escapeHtml(item.value)}</strong><span>${item.settled ? (vi ? "đã chốt" : "settled") : "dist"}</span></div>`).join("");
  const waysHtml = ways.map((item) => `<div class="restricted1786-way ${item.source ? "source" : ""} ${item.target ? "target" : ""}"><small>node ${item.node}</small><strong>${item.value}</strong><span>ways[${item.node}]</span></div>`).join("");
  const heap = view.heap || [];
  const heapHtml = heap.length
    ? heap.slice(0, 8).map((item, index) => `<span class="${index === 0 ? "front" : ""}"><small>#${index + 1}</small><strong>(${item.distance}, ${item.node})</strong></span>`).join("")
    : `<em>${vi ? "heap rỗng" : "empty heap"}</em>`;
  const restricted = view.restrictedEdges || [];
  const restrictedHtml = restricted.length
    ? restricted.map((edge) => `<span class="${view.activeEdge && ((view.activeEdge.u === edge.from && view.activeEdge.v === edge.to) || (view.activeEdge.v === edge.from && view.activeEdge.u === edge.to)) ? "active" : ""}"><b>${edge.from}</b><i>→</i><b>${edge.to}</b><small>${view.distances.find((item) => item.node === edge.from)?.value} &gt; ${view.distances.find((item) => item.node === edge.to)?.value}</small></span>`).join("")
    : `<em>${vi ? "chờ Dijkstra hoàn tất" : "waiting for Dijkstra"}</em>`;
  const order = view.order || [];
  const orderHtml = order.length ? order.map((node, index) => `<span class="${node === view.dpSource ? "active" : ""} ${node === view.dpTarget ? "target" : ""}"><small>${index}</small><b>${node}</b><em>d=${distances.find((item) => item.node === node)?.value}</em></span>`).join("") : "";
  let formula;
  if (view.phase === "relax" && view.activeEdge) {
    formula = `<strong>${view.currentNode} → ${view.activeEdge.v}</strong><span>${view.candidate} &lt; ${escapeHtml(view.oldDistance)} → ${view.improves ? "True" : "False"}</span>`;
  } else if (view.phase === "dp-update") {
    formula = `<strong>ways[${view.dpTarget}] += ways[${view.dpSource}]</strong><span>+${view.contribution} · dist[${view.dpTarget}] &gt; dist[${view.dpSource}]</span>`;
  } else {
    formula = `<strong>dist[u] &gt; dist[v]</strong><span>${vi ? "chỉ đi từ cao xuống thấp" : "move only from higher to lower"}</span>`;
  }
  const activeLine = Array.isArray(step.codeLines) ? step.codeLines[0] : step.codeLines;
  const summary = vi ? `Bài 1786: ways[1] = ${view.answer}.` : `Problem 1786: ways[1] = ${view.answer}.`;
  $("treeView").innerHTML = `<section class="restricted1786-viz" role="img" aria-label="${escapeHtml(summary)}">
    <div class="restricted1786-phases">${phaseHtml}</div>
    <header class="restricted1786-title"><small>${vi ? "DÒNG" : "LINE"} ${activeLine ?? "—"}</small><strong>${escapeHtml(pick(step.title))}</strong><span>${escapeHtml(pick(step.note))}</span></header>
    <div class="restricted1786-formula">${formula}</div>
    <div class="restricted1786-workspace">
      <section class="restricted1786-graph"><header><strong>WEIGHTED GRAPH</strong><span>start = 1 · target = ${view.n}</span></header><div id="restricted1786Graph"></div></section>
      <section class="restricted1786-state"><header><strong>DIJKSTRA STATE</strong><span>${vi ? "khoảng cách tới node cuối" : "distance to last node"}</span></header><div class="restricted1786-distances">${distanceHtml}</div><div class="restricted1786-heap"><header><strong>MIN-HEAP</strong><span>(distance, node)</span></header><div>${heapHtml}</div></div></section>
    </div>
    <section class="restricted1786-slopes"><header><strong>RESTRICTED DIRECTIONS</strong><span>${vi ? "mũi tên luôn giảm dist" : "arrows strictly decrease dist"}</span></header><div>${restrictedHtml}</div></section>
    ${orderHtml ? `<section class="restricted1786-order"><header><strong>DP ORDER</strong><span>${vi ? "dist tăng dần để truyền ways ngược lên" : "increasing dist for backward propagation"}</span></header><div>${orderHtml}</div></section>` : ""}
    <section class="restricted1786-ways"><header><strong>WAYS</strong><span>mod 10⁹+7</span></header><div>${waysHtml}</div></section>
    <div class="restricted1786-result ${view.phase === "done" ? "visible" : ""}"><small>ANSWER</small><strong>${view.answer}</strong><span>${vi ? "restricted paths từ 1 tới n" : "restricted paths from 1 to n"}</span></div>
  </section>`;
  renderGraph(step, "restricted1786Graph");
}

function renderMultiDijkstra2203View(step) {
  const view = step.multiDijkstra2203View || {};
  const vi = lang === "vi";
  const phases = vi
    ? ["1. Dựng graph", "2. Từ src1", "3. Từ src2", "4. Tới dest", "5. Ghép"]
    : ["1. Build graph", "2. From src1", "3. From src2", "4. To dest", "5. Combine"];
  const phaseIndex = view.phase === "build" || view.phase === "invalid" ? 0
    : view.activeRun === "src1" ? 1 : view.activeRun === "src2" ? 2 : view.activeRun === "dest" ? 3 : 4;
  const phaseHtml = phases.map((label, index) => `<span class="${index === phaseIndex ? "active" : ""} ${index < phaseIndex ? "done" : ""}">${index < phaseIndex ? "✓ " : ""}${label}</span>`).join("");
  const distanceGroups = [
    ["src1", `FROM SRC1 · ${view.src1}`, view.distances?.src1 || []],
    ["src2", `FROM SRC2 · ${view.src2}`, view.distances?.src2 || []],
    ["dest", `TO DEST · ${view.dest}`, view.distances?.dest || []],
  ];
  const distancesHtml = distanceGroups.map(([key, label, values]) => `<section class="multi2203-dist-group ${view.activeRun === key ? "active" : ""}"><header><strong>${label}</strong><span>${key === "dest" ? (vi ? "reverse graph" : "reversed graph") : (vi ? "graph gốc" : "original graph")}</span></header><div>${values.map((item) => `<span class="${item.node === view.currentNode && view.activeRun === key ? "current" : ""}"><small>${item.node}</small><b>${escapeHtml(item.value)}</b></span>`).join("")}</div></section>`).join("");
  const heap = view.heap || [];
  const heapHtml = heap.length
    ? heap.slice(0, 8).map((item, index) => `<span class="${index === 0 ? "front" : ""}"><small>#${index + 1}</small><b>(${item.distance}, ${item.node})</b></span>`).join("")
    : `<em>${vi ? "heap rỗng" : "empty heap"}</em>`;
  const rows = view.combineRows || [];
  const combineHtml = rows.map((row) => `<div class="${row.node === view.combineNode ? "active" : ""} ${row.best ? "best" : ""}"><strong>${row.node}</strong><span>${escapeHtml(row.d1)}</span><i>+</i><span>${escapeHtml(row.d2)}</span><i>+</i><span>${escapeHtml(row.d3)}</span><b>${escapeHtml(row.total)}</b></div>`).join("");
  let action;
  if (view.phase === "relax" && view.activeEdge) {
    action = `<strong>${view.activeRun === "dest" ? `${view.activeEdge.u} ⇢ ${view.activeEdge.v} (reversed)` : `${view.activeEdge.u} → ${view.activeEdge.v}`}</strong><span>${view.candidate} &lt; ${escapeHtml(view.oldDistance)} → ${view.improves ? "update" : "keep"}</span>`;
  } else if (view.phase === "combine" && view.combineNode !== null) {
    const row = rows.find((item) => item.node === view.combineNode);
    action = `<strong>meet = ${view.combineNode}</strong><span>${escapeHtml(row?.d1)} + ${escapeHtml(row?.d2)} + ${escapeHtml(row?.d3)} = ${escapeHtml(row?.total)}</span>`;
  } else if (view.phase === "done") {
    action = `<strong>meeting point = ${view.bestMeeting ?? "—"}</strong><span>minimum = ${escapeHtml(view.answer)}</span>`;
  } else {
    action = `<strong>d1[x] + d2[x] + toDest[x]</strong><span>${vi ? "suffix tới dest chỉ tính một lần" : "count the shared suffix only once"}</span>`;
  }
  const activeLine = Array.isArray(step.codeLines) ? step.codeLines[0] : step.codeLines;
  const summary = vi ? `Bài 2203: minimum = ${view.answer}.` : `Problem 2203: minimum = ${view.answer}.`;
  $("treeView").innerHTML = `<section class="multi2203-viz" role="img" aria-label="${escapeHtml(summary)}">
    <div class="multi2203-phases">${phaseHtml}</div>
    <header class="multi2203-title"><small>${vi ? "DÒNG" : "LINE"} ${activeLine ?? "—"}</small><strong>${escapeHtml(pick(step.title))}</strong><span>${escapeHtml(pick(step.note))}</span></header>
    <div class="multi2203-action">${action}</div>
    <div class="multi2203-workspace">
      <section class="multi2203-graph"><header><strong>DIRECTED GRAPH</strong><span>src1=${view.src1} · src2=${view.src2} · dest=${view.dest}</span></header><div id="multi2203Graph"></div></section>
      <section class="multi2203-runs">${distancesHtml}<div class="multi2203-heap"><header><strong>ACTIVE HEAP</strong><span>${escapeHtml(pick(view.runLabel) || "—")}</span></header><div>${heapHtml}</div></div></section>
    </div>
    <section class="multi2203-combine"><header><strong>TRY EVERY MEETING NODE</strong><span>d1[x] + d2[x] + toDest[x]</span></header><div class="multi2203-combine-head"><b>x</b><span>d1</span><i></i><span>d2</span><i></i><span>toDest</span><strong>total</strong></div><div>${combineHtml}</div></section>
    <div class="multi2203-result ${view.phase === "done" ? "visible" : ""}"><small>MINIMUM WEIGHT</small><strong>${view.phase === "done" && view.answer === "∞" ? -1 : escapeHtml(view.answer)}</strong><span>${view.bestMeeting === null ? (vi ? "chưa có meeting point" : "no meeting point yet") : `meet at node ${view.bestMeeting}`}</span></div>
  </section>`;
  renderGraph(step, "multi2203Graph");
}

function renderPathExistsDfsView(step) {
  const view = step.pathExistsDfsView || {};
  const vi = lang === "vi";
  const callStack = Array.isArray(view.callStack) ? view.callStack : [];
  const visited = new Set(Array.isArray(view.visited) ? view.visited : []);
  const adj = Array.isArray(view.adj) ? view.adj : [];
  const activeNode = Number.isInteger(view.activeNode) ? view.activeNode : null;
  const activeNeighbor = Number.isInteger(view.activeNeighbor) ? view.activeNeighbor : null;
  const source = Number.isInteger(view.source) ? view.source : null;
  const destination = Number.isInteger(view.destination) ? view.destination : null;

  const stage = ["intro", "build-adj", "init-visited"].includes(view.phase)
    ? 0
    : view.phase === "done" ? 2 : 1;
  const stageLabels = vi
    ? ["1 · Dựng graph", "2 · DFS đệ quy", "3 · Return kết quả"]
    : ["1 · Build graph", "2 · Recursive DFS", "3 · Return result"];
  const phases = stageLabels.map((label, index) => {
    const state = index < stage ? "done" : index === stage ? "active" : "";
    return `<span class="${state}">${index < stage ? "✓" : index + 1}<b>${escapeHtml(label.replace(/^\d+ · /, ""))}</b></span>`;
  }).join("");

  const stackHtml = callStack.length
    ? callStack.map((node, index) => `<span class="${index === callStack.length - 1 ? "top" : ""}"><small>#${index + 1}</small><strong>dfs(${escapeHtml(node)})</strong></span>`).join("")
    : `<span class="path1971-empty">${vi ? "stack rỗng" : "empty stack"}</span>`;

  const visitedHtml = adj.length
    ? adj.map((_, node) => {
      const classes = [
        "path1971-node-chip",
        visited.has(node) ? "visited" : "",
        node === activeNode ? "active" : "",
        node === source ? "source" : "",
        node === destination ? "destination" : "",
      ].filter(Boolean).join(" ");
      return `<span class="${classes}">${node}</span>`;
    }).join("")
    : `<span class="path1971-empty">∅</span>`;

  const adjHtml = adj.length
    ? adj.map((neighbors, node) => {
      const neighborHtml = neighbors.length
        ? neighbors.map((nb) => `<span class="${nb === activeNeighbor ? "current" : visited.has(nb) ? "visited" : ""}">${escapeHtml(nb)}</span>`).join("")
        : "<em>∅</em>";
      return `<div class="path1971-adj-row ${node === activeNode ? "active" : ""}">
        <b>${node}</b><i>→</i><div>${neighborHtml}</div>
      </div>`;
    }).join("")
    : `<div class="path1971-empty">${vi ? "adj đang rỗng" : "adj is empty"}</div>`;

  const decisionText = {
    "define-dfs": vi ? "Định nghĩa dfs(node): kiểm tra đích, kiểm tra visited, rồi thử từng hàng xóm." : "Define dfs(node): check destination, check visited, then try each neighbor.",
    "init-adj": vi ? "Tạo danh sách kề rỗng cho mọi node." : "Create an empty adjacency list for every node.",
    "read-edge": vi ? "Đọc một cạnh vô hướng từ input." : "Read one undirected edge from input.",
    "append-forward": vi ? "Thêm chiều a → b vào adjacency list." : "Add direction a → b to the adjacency list.",
    "append-backward": vi ? "Thêm chiều b → a vì graph vô hướng." : "Add direction b → a because the graph is undirected.",
    "init-visited": vi ? "Khởi tạo visited để tránh lặp trong chu trình." : "Initialize visited to avoid cycles.",
    "start-dfs": vi ? "Gọi dfs(source) để bắt đầu tìm đường." : "Call dfs(source) to start searching.",
    "enter-call": vi ? "Một frame dfs mới được đặt lên call stack." : "A new dfs frame is pushed onto the call stack.",
    "destination-found": vi ? "node hiện tại chính là destination." : "The current node is the destination.",
    "not-destination": vi ? "Chưa tới đích, tiếp tục kiểm tra visited." : "Not at the destination yet; check visited next.",
    "already-visited": vi ? "Node đã thăm rồi, nhánh này trả False." : "This node was already visited; this branch returns False.",
    "not-visited": vi ? "Node chưa thăm, có thể mở rộng nhánh này." : "This node is unvisited; this branch can expand.",
    "mark-visited": vi ? "Đánh dấu node trước khi đi sang hàng xóm." : "Mark the node before exploring neighbors.",
    "iterate-neighbors": vi ? "Duyệt từng hàng xóm trong adj[node]." : "Iterate through adj[node].",
    "call-neighbor": vi ? "Gọi dfs(neighbor), call stack sâu thêm một tầng." : "Call dfs(neighbor); the call stack goes one level deeper.",
    "neighbor-false": vi ? "Nhánh vừa thử trả False, quay lại frame hiện tại." : "The tried branch returned False; return to the current frame.",
    "return-false-exhausted": vi ? "Hết hàng xóm mà không tới đích, trả False." : "No neighbor reaches the destination; return False.",
    "return-false-visited": vi ? "Gặp node đã thăm, trả False để chặn chu trình." : "Hit a visited node; return False to stop the cycle.",
    "return-true": vi ? "Tới destination, trả True." : "Reached destination; return True.",
    "bubble-true": vi ? "True lan ngược lên các frame cha." : "True bubbles back up through parent frames.",
    "done-true": vi ? "Có đường đi từ source tới destination." : "A path exists from source to destination.",
    "done-false": vi ? "Không có đường đi trong component của source." : "No path exists in source's component.",
  }[view.decision] || (vi ? "Theo dõi DFS đệ quy." : "Trace recursive DFS.");

  const returnClass = view.returnValue === true ? "true" : view.returnValue === false ? "false" : "";
  const returnLabel = view.returnValue === null || view.returnValue === undefined
    ? (vi ? "chưa return" : "no return yet")
    : String(view.returnValue);
  const isDone = view.phase === "done";
  const summary = vi
    ? `DFS đệ quy từ ${source} tới ${destination}. Stack có ${callStack.length} frame.`
    : `Recursive DFS from ${source} to ${destination}. Stack has ${callStack.length} frame(s).`;

  $("treeView").innerHTML = `<section class="path1971-viz" aria-label="${escapeHtml(summary)}">
    <div class="path1971-phases">${phases}</div>
    <div class="path1971-layout">
      <div id="path1971Graph" class="path1971-graph"></div>
      <div class="path1971-state">
        <div class="path1971-head"><strong>call stack</strong><span>${vi ? "frame trên cùng đang chạy" : "top frame is running"}</span></div>
        <div class="path1971-stack">${stackHtml}</div>
        <div class="path1971-head"><strong>visited</strong><span>${visited.size}/${adj.length}</span></div>
        <div class="path1971-visited">${visitedHtml}</div>
      </div>
    </div>
    <div class="path1971-lower">
      <div class="path1971-adj">
        <div class="path1971-head"><strong>adjacency list</strong><span>${vi ? "hàng xóm của từng node" : "neighbors per node"}</span></div>
        <div>${adjHtml}</div>
      </div>
      <div class="path1971-decision ${returnClass}${isDone ? " done" : ""}">
        <small>${isDone ? (vi ? "Hoàn tất" : "Done") : (vi ? "Bước hiện tại" : "Current step")}</small>
        <strong>${escapeHtml(decisionText)}</strong>
        <div>
          ${activeNode === null ? "" : `<span>node = ${escapeHtml(activeNode)}</span>`}
          ${activeNeighbor === null ? "" : `<span>nb = ${escapeHtml(activeNeighbor)}</span>`}
          <span>return = ${escapeHtml(returnLabel)}</span>
        </div>
      </div>
    </div>
  </section>`;
  renderGraph(step, "path1971Graph");
}

// ---- 785 Is Graph Bipartite? (2-colouring) ----
function renderBipartiteView(step) {
  const view = step.bipartiteView || {};
  const vi = lang === "vi";
  const isDfs = view.mode === "dfs";
  const color = Array.isArray(view.color) ? view.color : [];
  const n = Number(view.n) || color.length;
  const adj = Array.isArray(view.adj) ? view.adj : [];
  const frontier = Array.isArray(view.queue) ? view.queue : [];
  const activeNode = Number.isInteger(view.activeNode) ? view.activeNode : null;
  const activeNeighbor = Number.isInteger(view.activeNeighbor) ? view.activeNeighbor : null;
  const startNode = Number.isInteger(view.startNode) ? view.startNode : null;
  const conflict = view.conflictEdge || null;
  const conflictNodes = new Set(conflict ? [conflict.u, conflict.v] : []);

  // ── Phase bar ───────────────────────────────────────────────────────────
  const stage = ["intro", "init"].includes(view.phase) ? 0 : view.phase === "done" ? 2 : 1;
  const stageLabels = vi
    ? ["Khởi tạo color[]", isDfs ? "DFS tô 2 màu" : "BFS tô 2 màu", "Kết luận"]
    : ["Init color[]", isDfs ? "DFS 2-colouring" : "BFS 2-colouring", "Conclusion"];
  const phases = stageLabels.map((label, i) => {
    const state = i < stage ? "done" : i === stage ? "active" : "";
    return `<span class="${state}">${i < stage ? "✓" : i + 1}<b>${escapeHtml(label)}</b></span>`;
  }).join("");

  // ── The two sets: the whole point of the problem ────────────────────────
  const setNodes = (c) => color.map((v, i) => (v === c ? i : -1)).filter((i) => i >= 0);
  const setChip = (i) => {
    const cls = ["bip785-chip"];
    if (i === activeNode) cls.push("active");
    if (i === activeNeighbor) cls.push("neighbor");
    if (conflictNodes.has(i)) cls.push("conflict");
    return `<span class="${cls.join(" ")}">${i}</span>`;
  };
  const setA = setNodes(0);
  const setB = setNodes(1);
  const uncoloured = color.map((v, i) => (v === -1 ? i : -1)).filter((i) => i >= 0);
  const partitionHtml = `<div class="bip785-sets">
    <section class="bip785-set c0"><header><strong>${vi ? "TẬP 0" : "SET 0"}</strong><span>${setA.length}</span></header><div>${setA.map(setChip).join("") || `<em>∅</em>`}</div></section>
    <div class="bip785-vs">${conflict ? "✕" : "|"}</div>
    <section class="bip785-set c1"><header><strong>${vi ? "TẬP 1" : "SET 1"}</strong><span>${setB.length}</span></header><div>${setB.map(setChip).join("") || `<em>∅</em>`}</div></section>
  </div>
  ${uncoloured.length ? `<div class="bip785-uncoloured"><small>${vi ? "chưa tô" : "uncoloured"}</small><div>${uncoloured.map(setChip).join("")}</div></div>` : ""}`;

  // ── color[] array strip ─────────────────────────────────────────────────
  const colorCells = color.map((c, i) => {
    const cls = ["bip785-cell", c === -1 ? "none" : c === 0 ? "c0" : "c1"];
    if (i === activeNode) cls.push("active");
    if (i === activeNeighbor) cls.push("neighbor");
    if (conflictNodes.has(i)) cls.push("conflict");
    return `<div class="${cls.join(" ")}"><small>${i}</small><strong>${c === -1 ? "−1" : c}</strong></div>`;
  }).join("");

  // ── Frontier (queue for BFS / call stack for DFS) ───────────────────────
  const frontierLabel = isDfs ? "call stack" : "queue";
  const frontierHint = isDfs
    ? (vi ? "khung trên cùng đang chạy" : "top frame is running")
    : (vi ? "front được pop trước" : "front pops first");
  const frontierHtml = frontier.length
    ? frontier.map((item, i) => {
      const front = isDfs ? i === frontier.length - 1 : i === 0;
      const tag = isDfs ? (front ? "top" : `#${i + 1}`) : (front ? "front" : `#${i + 1}`);
      return `<span class="${front ? "top" : ""}"><small>${tag}</small><strong>${escapeHtml(item)}</strong></span>`;
    }).join("")
    : `<span class="bip785-empty">${vi ? (isDfs ? "stack rỗng" : "queue rỗng") : (isDfs ? "empty stack" : "empty queue")}</span>`;

  // ── Adjacency list, with the current edge called out ────────────────────
  const adjHtml = adj.length
    ? adj.map((neighbors, node) => {
      const nbHtml = neighbors.length
        ? neighbors.map((nb) => {
          const cls = [];
          if (node === activeNode && nb === activeNeighbor) cls.push("current");
          else if (color[nb] === 0) cls.push("c0");
          else if (color[nb] === 1) cls.push("c1");
          if (conflictNodes.has(nb) && conflictNodes.has(node)) cls.push("conflict");
          return `<span class="${cls.join(" ")}">${nb}</span>`;
        }).join("")
        : "<em>∅</em>";
      const rowCls = ["bip785-adj-row"];
      if (node === activeNode) rowCls.push("active");
      if (color[node] === 0) rowCls.push("is0");
      if (color[node] === 1) rowCls.push("is1");
      return `<div class="${rowCls.join(" ")}"><b>${node}</b><i>→</i><div>${nbHtml}</div></div>`;
    }).join("")
    : `<div class="bip785-empty">∅</div>`;

  // ── Decision copy ───────────────────────────────────────────────────────
  const decisionText = {
    intro: vi ? "Bipartite ⇔ tô được 2 màu sao cho mọi cạnh nối hai màu khác nhau." : "Bipartite ⇔ 2-colourable so that every edge joins two different colours.",
    "init-color": vi ? "color[i] = -1 nghĩa là node i chưa được tô." : "color[i] = -1 means node i is not coloured yet.",
    "skip-coloured": vi ? "Node này đã thuộc một component đã xử lý → bỏ qua." : "This node already belongs to a processed component → skip it.",
    "start-component": vi ? "Component mới: gán màu 0 cho node bắt đầu (chọn màu nào cũng được)." : "New component: give the start node colour 0 (either choice works).",
    dequeue: vi ? "Lấy node ra khỏi queue để xét các hàng xóm." : "Dequeue a node to inspect its neighbours.",
    "colour-node": vi ? "Tô node hiện tại rồi đi xét từng hàng xóm." : "Colour the current node, then inspect each neighbour.",
    "colour-neighbour": vi ? "Hàng xóm chưa tô → tô màu ĐẢO rồi thêm vào frontier." : "Neighbour is uncoloured → assign the FLIPPED colour and add it to the frontier.",
    recurse: vi ? "Đi sâu vào hàng xóm với màu đảo." : "Recurse into the neighbour with the flipped colour.",
    "already-ok": vi ? "Hàng xóm đã tô và khác màu → cạnh này hợp lệ." : "Neighbour is already coloured and differs → this edge is fine.",
    conflict: vi ? "Cạnh nối hai node CÙNG màu → có chu trình lẻ → không bipartite." : "This edge joins two nodes of the SAME colour → odd cycle → not bipartite.",
    "propagate-false": vi ? "False được truyền ngược lên chuỗi đệ quy." : "False propagates back up the recursion chain.",
    "return-true": vi ? "Mọi hàng xóm hợp lệ → khung đệ quy trả True." : "All neighbours are valid → this frame returns True.",
    "component-done": vi ? "Component này đã tô xong, tìm component tiếp theo." : "This component is fully coloured; look for the next one.",
    "done-true": vi ? "Không có cạnh nào vi phạm → đồ thị là bipartite." : "No edge is violated → the graph is bipartite.",
    "done-false": vi ? "Đã tìm được cạnh vi phạm → đồ thị không bipartite." : "A violating edge was found → the graph is not bipartite.",
  }[view.decision] || (vi ? "Đang tô màu đồ thị." : "Colouring the graph.");

  const rv = view.returnValue;
  const decCls = rv === true ? "true" : rv === false ? "false" : "";
  const isDone = view.phase === "done";
  const rvLabel = rv === null || rv === undefined ? (vi ? "chưa return" : "no return yet") : String(rv);

  const conflictBanner = conflict
    ? `<div class="bip785-conflict"><b>${vi ? "CẠNH VI PHẠM" : "VIOLATING EDGE"}</b><code>${conflict.u} — ${conflict.v}</code><span>${vi ? `cả hai đều màu ${conflict.color}` : `both are colour ${conflict.color}`}</span></div>`
    : "";

  $("treeView").innerHTML = `<section class="bip785-viz" aria-label="${escapeHtml(vi ? "Trực quan hóa kiểm tra đồ thị hai phía" : "Is-graph-bipartite visualization")}">
    <div class="bip785-phases">${phases}</div>
    ${conflictBanner}
    <div class="bip785-layout">
      <div id="bip785Graph" class="bip785-graph"></div>
      <div class="bip785-state">
        <div class="bip785-head"><strong>${vi ? "HAI TẬP MÀU" : "THE TWO SETS"}</strong><span>${vi ? "mọi cạnh phải bắc qua giữa" : "every edge must cross the middle"}</span></div>
        ${partitionHtml}
        <div class="bip785-head"><strong>${escapeHtml(frontierLabel)}</strong><span>${escapeHtml(frontierHint)}</span></div>
        <div class="bip785-frontier">${frontierHtml}</div>
      </div>
    </div>
    <div class="bip785-head"><strong>color[]</strong><span>${vi ? "−1 = chưa tô" : "−1 = uncoloured"}</span></div>
    <div class="bip785-array">${colorCells}</div>
    <div class="bip785-lower">
      <div class="bip785-adj">
        <div class="bip785-head"><strong>adjacency list</strong><span>${vi ? "hàng xóm mỗi node" : "neighbours per node"}</span></div>
        <div>${adjHtml}</div>
      </div>
      <div class="bip785-decision ${decCls}${isDone ? " done" : ""}">
        <small>${isDone ? (vi ? "Hoàn tất" : "Done") : (vi ? "Bước hiện tại" : "Current step")}</small>
        <strong>${escapeHtml(decisionText)}</strong>
        <div>
          ${startNode === null ? "" : `<span>start = ${escapeHtml(startNode)}</span>`}
          ${activeNode === null ? "" : `<span>node = ${escapeHtml(activeNode)}</span>`}
          ${activeNeighbor === null ? "" : `<span>nb = ${escapeHtml(activeNeighbor)}</span>`}
          <span>return = ${escapeHtml(rvLabel)}</span>
        </div>
      </div>
    </div>
  </section>`;
  renderGraph(step, "bip785Graph");
}

function renderPathExistsBfsView(step) {
  const view = step.pathExistsBfsView || {};
  const vi = lang === "vi";
  const queue = Array.isArray(view.queue) ? view.queue : [];
  const visited = new Set(Array.isArray(view.visited) ? view.visited : []);
  const adj = Array.isArray(view.adj) ? view.adj : [];
  const activeNode = Number.isInteger(view.activeNode) ? view.activeNode : null;
  const activeNeighbor = Number.isInteger(view.activeNeighbor) ? view.activeNeighbor : null;
  const source = Number.isInteger(view.source) ? view.source : null;
  const destination = Number.isInteger(view.destination) ? view.destination : null;

  const stage = ["intro", "check-source", "build-adj", "init-bfs"].includes(view.phase)
    ? 0
    : view.phase === "done" ? 2 : 1;
  const stageLabels = vi
    ? ["1 · Dựng graph", "2 · BFS queue", "3 · Return kết quả"]
    : ["1 · Build graph", "2 · BFS queue", "3 · Return result"];
  const phases = stageLabels.map((label, index) => {
    const state = index < stage ? "done" : index === stage ? "active" : "";
    return `<span class="${state}">${index < stage ? "✓" : index + 1}<b>${escapeHtml(label.replace(/^\d+ · /, ""))}</b></span>`;
  }).join("");

  const queueHtml = queue.length
    ? queue.map((node, index) => `<span class="${index === 0 ? "top" : ""}"><small>${index === 0 ? "front" : `#${index + 1}`}</small><strong>${escapeHtml(node)}</strong></span>`).join("")
    : `<span class="path1971-empty">${vi ? "queue rỗng" : "empty queue"}</span>`;

  const visitedHtml = adj.length
    ? adj.map((_, node) => {
      const classes = [
        "path1971-node-chip",
        visited.has(node) ? "visited" : "",
        node === activeNode ? "active" : "",
        node === source ? "source" : "",
        node === destination ? "destination" : "",
      ].filter(Boolean).join(" ");
      return `<span class="${classes}">${node}</span>`;
    }).join("")
    : `<span class="path1971-empty">∅</span>`;

  const adjHtml = adj.length
    ? adj.map((neighbors, node) => {
      const neighborHtml = neighbors.length
        ? neighbors.map((nb) => `<span class="${nb === activeNeighbor ? "current" : visited.has(nb) ? "visited" : ""}">${escapeHtml(nb)}</span>`).join("")
        : "<em>∅</em>";
      return `<div class="path1971-adj-row ${node === activeNode ? "active" : ""}">
        <b>${node}</b><i>→</i><div>${neighborHtml}</div>
      </div>`;
    }).join("")
    : `<div class="path1971-empty">${vi ? "adj đang rỗng" : "adj is empty"}</div>`;

  const decisionText = {
    intro: vi ? "BFS dùng queue để duyệt component từ source theo thứ tự FIFO." : "BFS uses a queue to explore source's component in FIFO order.",
    "source-is-destination": vi ? "source đã trùng destination." : "source is already destination.",
    "source-not-destination": vi ? "source khác destination, cần dựng graph rồi BFS." : "source differs from destination; build graph then BFS.",
    "init-adj": vi ? "Tạo danh sách kề rỗng cho mọi node." : "Create an empty adjacency list for every node.",
    "read-edge": vi ? "Đọc một cạnh vô hướng từ input." : "Read one undirected edge from input.",
    "append-forward": vi ? "Thêm chiều a → b vào adjacency list." : "Add direction a → b to the adjacency list.",
    "append-backward": vi ? "Thêm chiều b → a vì graph vô hướng." : "Add direction b → a because the graph is undirected.",
    "init-visited": vi ? "Khởi tạo visited để không enqueue trùng node." : "Initialize visited to avoid enqueueing a node twice.",
    "init-queue": vi ? "Queue bắt đầu với source ở front." : "The queue starts with source at the front.",
    "mark-source": vi ? "Đánh dấu source ngay khi enqueue." : "Mark source as soon as it is enqueued.",
    "while-queue": vi ? "Queue chưa rỗng, tiếp tục pop node ở front." : "The queue is not empty; pop the front node next.",
    dequeue: vi ? "Lấy node ở front ra để xử lý." : "Remove the front node for processing.",
    "destination-found": vi ? "Node vừa pop chính là destination." : "The popped node is destination.",
    "not-destination": vi ? "Chưa tới destination, thử các hàng xóm." : "Not destination yet; inspect neighbors.",
    "iterate-neighbors": vi ? "Duyệt từng hàng xóm của node hiện tại." : "Iterate through the current node's neighbors.",
    "skip-visited": vi ? "Hàng xóm đã visited, không enqueue lại." : "This neighbor is already visited; do not enqueue it again.",
    "visit-neighbor": vi ? "Hàng xóm chưa visited, chuẩn bị đánh dấu và enqueue." : "This neighbor is unvisited; mark and enqueue it.",
    "mark-neighbor": vi ? "Đánh dấu hàng xóm trước khi enqueue." : "Mark the neighbor before enqueueing it.",
    "enqueue-neighbor": vi ? "Đưa hàng xóm vào cuối queue." : "Append the neighbor to the back of the queue.",
    "queue-empty": vi ? "Queue rỗng, BFS đã duyệt hết component của source." : "The queue is empty; BFS has explored source's entire component.",
    "done-true": vi ? "Có đường đi từ source tới destination." : "A path exists from source to destination.",
    "done-false": vi ? "Không có đường đi trong component của source." : "No path exists in source's component.",
  }[view.decision] || (vi ? "Theo dõi BFS bằng queue." : "Trace BFS with a queue.");

  const returnClass = view.returnValue === true ? "true" : view.returnValue === false ? "false" : "";
  const returnLabel = view.returnValue === null || view.returnValue === undefined
    ? (vi ? "chưa return" : "no return yet")
    : String(view.returnValue);
  const isDone = view.phase === "done";
  const summary = vi
    ? `BFS từ ${source} tới ${destination}. Queue có ${queue.length} node đang chờ.`
    : `BFS from ${source} to ${destination}. Queue has ${queue.length} pending node(s).`;

  $("treeView").innerHTML = `<section class="path1971-viz" aria-label="${escapeHtml(summary)}">
    <div class="path1971-phases">${phases}</div>
    <div class="path1971-layout">
      <div id="path1971BfsGraph" class="path1971-graph"></div>
      <div class="path1971-state">
        <div class="path1971-head"><strong>queue</strong><span>${vi ? "front được pop trước" : "front pops first"}</span></div>
        <div class="path1971-stack">${queueHtml}</div>
        <div class="path1971-head"><strong>visited</strong><span>${visited.size}/${adj.length}</span></div>
        <div class="path1971-visited">${visitedHtml}</div>
      </div>
    </div>
    <div class="path1971-lower">
      <div class="path1971-adj">
        <div class="path1971-head"><strong>adjacency list</strong><span>${vi ? "hàng xóm của từng node" : "neighbors per node"}</span></div>
        <div>${adjHtml}</div>
      </div>
      <div class="path1971-decision ${returnClass}${isDone ? " done" : ""}">
        <small>${isDone ? (vi ? "Hoàn tất" : "Done") : (vi ? "Bước hiện tại" : "Current step")}</small>
        <strong>${escapeHtml(decisionText)}</strong>
        <div>
          ${activeNode === null ? "" : `<span>node = ${escapeHtml(activeNode)}</span>`}
          ${activeNeighbor === null ? "" : `<span>nb = ${escapeHtml(activeNeighbor)}</span>`}
          <span>return = ${escapeHtml(returnLabel)}</span>
        </div>
      </div>
    </div>
  </section>`;
  renderGraph(step, "path1971BfsGraph");
}

function criticalPoints2058LineExplanation(view, vi) {
  const line = Number(view.debugLine);
  const comparison = view.comparison;
  const current = Number.isInteger(view.current) ? view.current : -1;
  const value = current >= 0 && Array.isArray(view.values) ? view.values[current] : null;
  const bool = (result) => String(Boolean(result)).toLowerCase();
  const messages = {
    3: vi ? "Gắn prev vào head (node index 0). Chưa gắn curr hay next_node." : "Point prev to head (node index 0). curr and next_node are not assigned yet.",
    4: vi ? "Gắn curr vào head.next (node index 1). Đây là node giữa đầu tiên có thể được xét." : "Point curr to head.next (node index 1), the first eligible middle node.",
    5: vi ? "index = 1 vì curr hiện đang đứng tại node index 1." : "Set index = 1 because curr currently points to node 1.",
    7: vi ? "-1 nghĩa là chưa lưu critical point đầu tiên." : "-1 means the first critical point has not been saved yet.",
    8: vi ? "-1 nghĩa là chưa có critical point gần nhất để tính gap." : "-1 means there is no previous critical point for a gap yet.",
    9: vi ? "Khởi tạo min_distance = ∞ để gap hợp lệ đầu tiên luôn cập nhật được min." : "Initialize min_distance to infinity so the first valid gap always replaces it.",
    11: vi ? "Kiểm tra curr.next. Nếu còn node bên phải thì curr có đủ hai hàng xóm và vòng lặp tiếp tục." : "Check curr.next. If a right node exists, curr has two neighbors and the loop continues.",
    12: vi ? `Gắn next_node vào node ngay bên phải curr${current >= 0 ? ` (index ${current + 1})` : ""}.` : `Point next_node to the node immediately right of curr${current >= 0 ? ` (index ${current + 1})` : ""}.`,
    14: vi ? "Bắt đầu tính is_critical từ hai phép kiểm tra PEAK và VALLEY." : "Begin computing is_critical from the PEAK and VALLEY checks.",
    15: comparison
      ? (vi ? `PEAK: ${comparison.current} > ${comparison.left} và ${comparison.current} > ${comparison.right} → ${bool(comparison.isPeak)}.` : `PEAK: ${comparison.current} > ${comparison.left} and ${comparison.current} > ${comparison.right} → ${bool(comparison.isPeak)}.`)
      : (vi ? "Kiểm tra curr có lớn hơn cả hai hàng xóm không." : "Check whether curr is greater than both neighbors."),
    16: vi ? "Toán tử or: chỉ cần PEAK hoặc VALLEY đúng thì node là critical." : "The or operator means either PEAK or VALLEY is enough to make the node critical.",
    17: comparison
      ? (vi ? `VALLEY: ${comparison.current} < ${comparison.left} và ${comparison.current} < ${comparison.right} → ${bool(comparison.isValley)}.` : `VALLEY: ${comparison.current} < ${comparison.left} and ${comparison.current} < ${comparison.right} → ${bool(comparison.isValley)}.`)
      : (vi ? "Kiểm tra curr có nhỏ hơn cả hai hàng xóm không." : "Check whether curr is smaller than both neighbors."),
    18: comparison
      ? (vi ? `Kết thúc biểu thức: is_critical = ${bool(comparison.isCritical)}.` : `Finish the expression: is_critical = ${bool(comparison.isCritical)}.`)
      : (vi ? "Kết thúc biểu thức is_critical." : "Finish the is_critical expression."),
    20: comparison
      ? (vi ? `Rẽ nhánh theo is_critical = ${bool(comparison.isCritical)}${value == null ? "" : ` của node ${value}`}.` : `Branch on is_critical = ${bool(comparison.isCritical)}${value == null ? "" : ` for node ${value}`}.`)
      : (vi ? "Chỉ vào khối này khi curr là critical point." : "Enter this block only when curr is a critical point."),
    21: vi ? "Kiểm tra đây có phải critical point đầu tiên hay không." : "Check whether this is the first critical point.",
    22: vi ? `Lưu index ${current} vào first_critical.` : `Save index ${current} as first_critical.`,
    23: vi ? "Đã có critical đầu tiên, nên chuyển sang tính khoảng cách với critical gần nhất." : "A first critical already exists, so compute the gap to the nearest previous critical.",
    24: vi ? "Bắt đầu cập nhật min_distance bằng giá trị nhỏ hơn." : "Begin updating min_distance with the smaller value.",
    25: vi ? "Đối số thứ nhất là min_distance tốt nhất đã tìm thấy trước đó." : "The first argument is the best min_distance found so far.",
    26: vi ? "Đối số thứ hai là gap = index hiện tại − prev_critical." : "The second argument is gap = current index − prev_critical.",
    27: vi ? `Gán kết quả min vào min_distance${view.minDistance == null ? "" : ` = ${view.minDistance}`}.` : `Assign the minimum back to min_distance${view.minDistance == null ? "" : ` = ${view.minDistance}`}.`,
    29: vi ? `Cập nhật prev_critical = ${current} để critical kế tiếp tính gap với node này.` : `Set prev_critical = ${current} so the next critical point measures its gap from this node.`,
    31: vi ? "Dịch prev tới vị trí curr hiện tại." : "Move prev to curr's current position.",
    32: vi ? "Dịch curr sang node kế tiếp; cửa sổ tiến sang phải một node." : "Move curr to the next node; the window advances one position right.",
    33: vi ? "Tăng index thêm 1 để index tiếp tục khớp với vị trí curr." : "Increment index so it stays aligned with curr's position.",
    35: vi ? "Nếu min_distance vẫn là ∞ thì chưa từng có một cặp critical hợp lệ." : "If min_distance is still infinity, no valid critical-point pair was ever formed.",
    36: vi ? "Không đủ hai critical point: trả về [-1, -1]." : "There are fewer than two critical points, so return [-1, -1].",
    38: vi ? `Tính max_distance = critical cuối − critical đầu${view.maxDistance == null ? "" : ` = ${view.maxDistance}`}.` : `Compute max_distance = last critical − first critical${view.maxDistance == null ? "" : ` = ${view.maxDistance}`}.`,
    40: Array.isArray(view.answer)
      ? (vi ? `Trả về [min_distance, max_distance] = [${view.answer.join(", ")}].` : `Return [min_distance, max_distance] = [${view.answer.join(", ")}].`)
      : (vi ? "Trả về hai khoảng cách đã tính." : "Return the two computed distances."),
  };
  return messages[line] || "";
}

function renderSubsets78BitmaskView(step) {
  const view = step.subsets78BitmaskView || step.subsets90BitmaskView || {};
  const vi = lang === "vi";
  const duplicateMode = Boolean(view.duplicateMode);
  const values = Array.isArray(view.values) ? view.values : [];
  const n = Number.isInteger(view.n) ? view.n : values.length;
  const mask = Number.isInteger(view.mask) ? view.mask : 0;
  const totalMasks = Number.isInteger(view.totalMasks) ? view.totalMasks : (1 << n);
  const currentBit = Number.isInteger(view.currentBit) ? view.currentBit : null;
  const subset = Array.isArray(view.subset) ? view.subset : [];
  const recentSubsets = Array.isArray(view.recentSubsets) ? view.recentSubsets : [];
  const phaseGroup = duplicateMode
    ? (view.phase === "setup" ? "sort" : view.phase === "mask" ? "mask" : ["check", "choose"].includes(view.phase) ? "bits" : view.phase === "dedupe" ? "dedupe" : "result")
    : (view.phase === "setup" ? "count" : view.phase === "mask" ? "mask" : ["check", "choose"].includes(view.phase) ? "bits" : view.phase === "save" ? "save" : "done");
  const phaseLabels = duplicateMode
    ? [["sort", vi ? "1. Sắp xếp" : "1. Sort"], ["mask", vi ? "2. Chọn mask" : "2. Choose mask"], ["bits", vi ? "3. Đọc bit" : "3. Read bits"], ["dedupe", vi ? "4. Khử trùng" : "4. Dedupe"], ["result", vi ? "5. Lưu / return" : "5. Save / return"]]
    : [["count", vi ? "1. Đếm mask" : "1. Count masks"], ["mask", vi ? "2. Chọn mask" : "2. Choose mask"], ["bits", vi ? "3. Đọc bit" : "3. Read bits"], ["save", vi ? "4. Lưu subset" : "4. Save subset"], ["done", vi ? "5. Hoàn tất" : "5. Done"]];
  const phaseHtml = phaseLabels.map(([key, label]) => `<span class="${phaseGroup === key ? "active" : ""}">${label}</span>`).join("");
  const selectedAt = (index) => Boolean(mask & (1 << index));

  const bitCells = Array.from({ length: n }, (_, displayIndex) => {
    const index = n - 1 - displayIndex;
    const selected = selectedAt(index);
    return `<div class="sub78-bit ${selected ? "on" : "off"}${currentBit === index ? " current" : ""}">
      <small>bit ${index}</small><strong>${selected ? 1 : 0}</strong>
    </div>`;
  }).join("") || `<div class="sub78-empty">${vi ? "Không có bit nào để đọc" : "No bits to read"}</div>`;

  const elementsHtml = values.map((value, index) => {
    const selected = selectedAt(index);
    const state = selected
      ? (vi ? "1 → chọn" : "1 → choose")
      : (vi ? "0 → bỏ qua" : "0 → skip");
    return `<div class="sub78-element ${selected ? "selected" : "skipped"}${currentBit === index ? " current" : ""}">
      <small>nums[${index}] · bit ${index}</small>
      <strong>${escapeHtml(String(value))}</strong>
      <span>${state}</span>
    </div>`;
  }).join("") || `<div class="sub78-empty">${vi ? "nums rỗng tạo ra subset []" : "An empty nums still produces []"}</div>`;

  const recentHtml = recentSubsets.length
    ? recentSubsets.map((item, index) => {
      const number = Math.max(0, Number(view.generatedCount || 0) - recentSubsets.length + index + 1);
      return `<div class="sub78-saved${view.justSaved && index === recentSubsets.length - 1 ? " fresh" : ""}"><small>#${number}</small><strong>${escapeHtml(`[${item.join(", ")}]`)}</strong></div>`;
    }).join("")
    : `<div class="sub78-empty">${vi ? "Chưa lưu subset nào" : "No subset saved yet"}</div>`;
  const generatedCount = Math.min(Number(view.generatedCount) || 0, totalMasks);
  const progress = totalMasks ? Math.round((generatedCount / totalMasks) * 100) : 100;
  const currentDecision = duplicateMode && view.phase === "dedupe"
    ? (view.duplicate
      ? (vi ? `Candidate [${subset.join(", ")}] trùng mask ${view.duplicateOf} → bỏ qua.` : `Candidate [${subset.join(", ")}] duplicates mask ${view.duplicateOf} → skip.`)
      : (vi ? `Candidate [${subset.join(", ")}] chưa có key trong seen → sẽ lưu.` : `Candidate [${subset.join(", ")}] has a new seen key → save it.`))
    : currentBit === null
    ? (view.phase === "done"
      ? (vi ? `Đã xét tất cả ${totalMasks} mask.` : `All ${totalMasks} masks have been processed.`)
      : (vi ? "Mỗi bit quyết định một phần tử có thuộc subset hay không." : "Each bit decides whether one element belongs to the subset."))
    : (vi
      ? `Đang xét bit ${currentBit}: ${selectedAt(currentBit) ? "1 nên chọn" : "0 nên bỏ qua"} nums[${currentBit}].`
      : `Checking bit ${currentBit}: ${selectedAt(currentBit) ? "1, so choose" : "0, so skip"} nums[${currentBit}].`);
  const summary = vi
    ? `Bitmask ${mask} trên ${n} phần tử; đã lưu ${generatedCount} trên ${totalMasks} subset.`
    : `Bitmask ${mask} across ${n} elements; ${generatedCount} of ${totalMasks} subsets are saved.`;
  const duplicateHtml = duplicateMode
    ? `<section class="sub78-dedupe-panel ${view.phase === "dedupe" && view.duplicate ? "duplicate" : ""}">
        <header><strong>SEEN · UNIQUE KEYS</strong><span>${vi ? "subset có cùng giá trị chỉ lưu một lần" : "equal-value subsets save once"}</span></header>
        <div><small>${vi ? "candidate" : "candidate"}</small><code>${escapeHtml(`[${subset.join(", ")}]`)}</code></div>
        <div><small>${vi ? "trạng thái" : "status"}</small><strong>${view.phase === "dedupe" && view.duplicate ? (vi ? `TRÙNG · mask ${view.duplicateOf}` : `DUPLICATE · mask ${view.duplicateOf}`) : (vi ? "KEY MỚI" : "NEW KEY")}</strong><span>${vi ? `${Number(view.skippedDuplicates) || 0} mask trùng đã bỏ` : `${Number(view.skippedDuplicates) || 0} duplicate mask(s) skipped`}</span></div>
      </section>`
    : "";

  $("treeView").innerHTML = `<section class="sub78-viz${duplicateMode ? " duplicate-mode" : ""}" role="img" aria-label="${escapeHtml(summary)}">
    <div class="sub78-phases">${phaseHtml}</div>
    <section class="sub78-mask-panel">
      <header><strong>${duplicateMode ? "BITMASK → CANDIDATE" : "BITMASK → SUBSET"}</strong><span>${vi ? "bit phải nhất là bit 0" : "rightmost bit is bit 0"}</span></header>
      <div class="sub78-mask-readout"><small>mask</small><strong>${mask}</strong><code>0b${escapeHtml(String(view.bits || mask.toString(2).padStart(n || 1, "0")))}</code></div>
      <div class="sub78-bit-row">${bitCells}</div>
      <div class="sub78-decision">${escapeHtml(currentDecision)}</div>
    </section>
    <section class="sub78-elements-panel">
      <header><strong>NUMS ↔ BITS</strong><span>${vi ? "bit i = 1 chọn nums[i]" : "bit i = 1 selects nums[i]"}</span></header>
      <div class="sub78-elements">${elementsHtml}</div>
    </section>
    ${duplicateHtml}
    <div class="sub78-lower">
      <section class="sub78-subset-panel">
        <header><strong>${vi ? "SUBSET ĐANG TẠO" : "CURRENT SUBSET"}</strong><span>${subset.length} ${vi ? "phần tử" : "element(s)"}</span></header>
        <code>${escapeHtml(`[${subset.join(", ")}]`)}</code>
      </section>
      <section class="sub78-saved-panel">
        <header><strong>${vi ? "SUBSETS ĐÃ LƯU" : "SAVED SUBSETS"}</strong><span>${generatedCount}/${totalMasks}${duplicateMode ? ` · −${Number(view.skippedDuplicates) || 0}` : ""}</span></header>
        <div class="sub78-progress" role="progressbar" aria-label="Saved subsets" aria-valuenow="${generatedCount}" aria-valuemin="0" aria-valuemax="${totalMasks}"><span style="width:${progress}%"></span></div>
        <div class="sub78-saved-list">${recentHtml}</div>
      </section>
    </div>
    <div class="sub78-action"><strong>${escapeHtml(pick(step.title))}</strong><span>${escapeHtml(pick(step.note))}</span></div>
  </section>`;
}

function renderSubsets90BitmaskView(step) {
  renderSubsets78BitmaskView(step);
}

function renderBinaryWatch401View(step) {
  const view = step.binaryWatch401View || {};
  const vi = lang === "vi";
  const mask = Number.isInteger(view.mask) ? view.mask : 0;
  const hour = Number.isInteger(view.hour) ? view.hour : 0;
  const minute = Number.isInteger(view.minute) ? view.minute : 0;
  const turnedOn = Number.isInteger(view.turnedOn) ? view.turnedOn : 0;
  const valid = Boolean(view.valid);
  const phaseGroup = view.phase === "setup"
    ? "setup"
    : view.phase === "decode"
      ? "decode"
      : view.phase === "reject"
        ? "validate"
        : view.phase === "save"
          ? "save"
          : "done";
  const phases = [
    ["setup", vi ? "1. Chọn số LED" : "1. Set LED count"],
    ["decode", vi ? "2. Tách mask" : "2. Decode mask"],
    ["validate", vi ? "3. Kiểm tra giờ" : "3. Validate time"],
    ["save", vi ? "4. Lưu thời gian" : "4. Save time"],
    ["done", vi ? "5. Return" : "5. Return"],
  ].map(([key, label]) => `<span class="${phaseGroup === key ? "active" : ""}">${label}</span>`).join("");
  const isOn = (bit) => Boolean(mask & (1 << bit));
  const ledHtml = (bits, group) => bits.map((bit) => {
    const value = bit < 4 ? (1 << bit) : (1 << (bit - 4));
    return `<div class="watch401-led ${isOn(bit) ? "on" : "off"}">
      <small>bit ${bit}</small><strong>${value}</strong><span>${isOn(bit) ? "1" : "0"}</span>
    </div>`;
  }).join("");
  const timeText = `${hour}:${String(minute).padStart(2, "0")}`;
  const recentTimes = Array.isArray(view.recentTimes) ? view.recentTimes : [];
  const timesHtml = recentTimes.length
    ? recentTimes.map((time, index) => `<span class="watch401-time${view.justSaved && index === recentTimes.length - 1 ? " fresh" : ""}">${escapeHtml(String(time))}</span>`).join("")
    : `<span class="watch401-empty">${vi ? "Chưa có thời gian hợp lệ" : "No valid time yet"}</span>`;
  const resultCount = Number(view.resultCount) || 0;
  const candidateCount = Number(view.candidateCount) || 0;
  const checkedCount = Number(view.checkedCount) || 0;
  const rejectedCount = Number(view.rejectedCount) || 0;
  const summary = vi
    ? `Mask ${mask} bật ${view.litCount || 0} LED, giải mã thành ${timeText}.`
    : `Mask ${mask} lights ${view.litCount || 0} LEDs and decodes to ${timeText}.`;

  $("treeView").innerHTML = `<section class="watch401-viz" role="img" aria-label="${escapeHtml(summary)}">
    <div class="watch401-phases">${phases}</div>
    <section class="watch401-overview">
      <div><small>turnedOn</small><strong>${turnedOn}</strong><span>${vi ? "LED phải bật" : "LEDs required"}</span></div>
      <div><small>mask</small><strong>${mask}</strong><code>0b${escapeHtml(String(view.bits || mask.toString(2).padStart(10, "0")))}</code></div>
      <div><small>${vi ? "đã xét" : "checked"}</small><strong>${checkedCount}/${candidateCount}</strong><span>${rejectedCount} ${vi ? "bị loại" : "rejected"}</span></div>
    </section>
    <section class="watch401-led-panel">
      <header><strong>10 LEDS → TIME</strong><span>${vi ? "4 bit giờ · 6 bit phút" : "4 hour bits · 6 minute bits"}</span></header>
      <div class="watch401-led-groups">
        <section><header><strong>HOUR</strong><span>8 · 4 · 2 · 1</span></header><div class="watch401-led-row">${ledHtml([3, 2, 1, 0], "hour")}</div></section>
        <section><header><strong>MINUTE</strong><span>32 · 16 · 8 · 4 · 2 · 1</span></header><div class="watch401-led-row">${ledHtml([9, 8, 7, 6, 5, 4], "minute")}</div></section>
      </div>
    </section>
    <section class="watch401-decode ${valid ? "valid" : "invalid"}">
      <div><small>hour = mask &amp; 0b1111</small><strong>${hour}</strong></div>
      <b>:</b>
      <div><small>minute = mask &gt;&gt; 4</small><strong>${String(minute).padStart(2, "0")}</strong></div>
      <aside><strong>${valid ? timeText : (vi ? "KHÔNG HỢP LỆ" : "INVALID")}</strong><span>${valid ? (vi ? "hour &lt; 12 và minute &lt; 60" : "hour &lt; 12 and minute &lt; 60") : (vi ? "mask bị bỏ qua" : "mask is skipped")}</span></aside>
    </section>
    <section class="watch401-results">
      <header><strong>${vi ? "THỜI GIAN ĐÃ LƯU" : "SAVED TIMES"}</strong><span>${resultCount} ${vi ? "hợp lệ" : "valid"}</span></header>
      <div>${timesHtml}</div>
    </section>
    <div class="watch401-action"><strong>${escapeHtml(pick(step.title))}</strong><span>${escapeHtml(pick(step.note))}</span></div>
  </section>`;
}

function renderCountCommas3870View(step) {
  const view = step.countCommas3870View || {};
  const vi = lang === "vi";
  const n = Number(view.n) || 0;
  const threshold = Number(view.threshold) || 1000;
  const noCommaCount = Number(view.noCommaCount) || 0;
  const commaCount = Number(view.commaCount) || 0;
  const answer = Number(view.answer) || 0;
  const phaseIndex = Number.isInteger(view.phaseIndex) ? view.phaseIndex : 0;
  const formatNumber = (value) => Number(value).toLocaleString("en-US");
  const phaseLabels = vi
    ? ["1. Đọc đoạn", "2. Tìm mốc", "3. Đếm số", "4. Kết quả"]
    : ["1. Read range", "2. Find threshold", "3. Count values", "4. Answer"];
  const phases = phaseLabels.map((label, index) => `<span class="${index < phaseIndex ? "done" : index === phaseIndex ? "active" : ""}"><b>${index < phaseIndex ? "✓" : index + 1}</b>${escapeHtml(label)}</span>`).join("");
  const samples = (Array.isArray(view.samples) ? view.samples : []).map((sample) => {
    const state = sample.inRange ? (sample.commas ? "with-comma" : "no-comma") : "outside";
    const status = sample.inRange
      ? sample.commas
        ? (vi ? "1 dấu phẩy" : "1 comma")
        : (vi ? "0 dấu phẩy" : "0 commas")
      : (vi ? "ngoài đoạn" : "outside range");
    return `<article class="cc3870-sample ${state}"><small>${sample.value}</small><strong>${escapeHtml(String(sample.formatted))}</strong><span>${escapeHtml(status)}</span></article>`;
  }).join("");
  const conditionText = view.condition == null
    ? (vi ? "chưa kiểm tra" : "not checked")
    : view.condition
      ? "TRUE"
      : "FALSE";
  const currentFormula = view.calculation || (view.phase === "threshold"
    ? `${n} < ${threshold} → ${conditionText}`
    : (vi ? "Chưa cần tính" : "No calculation yet"));
  const rightRange = commaCount > 0 ? `[1,000, ${formatNumber(n)}]` : "∅";
  const rightDescription = commaCount > 0
    ? (vi ? `${formatNumber(commaCount)} số × 1 dấu phẩy` : `${formatNumber(commaCount)} values x 1 comma`)
    : (vi ? "n chưa chạm mốc 1,000" : "n does not reach 1,000");
  const finalLabel = view.final
    ? `${vi ? "Tổng" : "Total"}: ${formatNumber(answer)}`
    : (vi ? "Đang tính..." : "Computing...");

  $("treeView").innerHTML = `<section class="cc3870-viz" role="img" aria-label="Count Commas in Range visualization">
    <header><div><small>COUNTING · #3870</small><strong>COUNT COMMAS IN RANGE</strong></div><span>${escapeHtml(pick(step.title))}</span></header>
    <div class="cc3870-phases">${phases}</div>
    <section class="cc3870-rule">
      <div><small>${vi ? "KHÔNG CÓ DẤU PHẨY" : "NO COMMA"}</small><strong>999</strong></div>
      <i>→</i>
      <div class="threshold"><small>${vi ? "SỐ ĐẦU TIÊN CÓ DẤU PHẨY" : "FIRST COMMA"}</small><strong>1,000</strong></div>
      <p>${vi ? "Dấu phẩy xuất hiện khi số có từ 4 chữ số." : "Comma formatting starts when a number has 4 digits."}</p>
    </section>
    <section class="cc3870-range">
      <article class="plain"><header><small>${vi ? "ĐOẠN KHÔNG ĐÓNG GÓP" : "ZERO-CONTRIBUTION RANGE"}</small><strong>[1, ${formatNumber(noCommaCount)}]</strong></header><div><b>${formatNumber(noCommaCount)}</b><span>${vi ? "số" : "values"}</span><em>× 0</em></div><footer>${vi ? "Mỗi số dùng 0 dấu phẩy" : "Each value uses 0 commas"}</footer></article>
      <div class="cc3870-divider"><span>999</span><b>|</b><span>1,000</span></div>
      <article class="qualified ${commaCount ? "has-values" : "empty"}"><header><small>${vi ? "ĐOẠN CÓ ĐÓNG GÓP" : "CONTRIBUTING RANGE"}</small><strong>${rightRange}</strong></header><div><b>${formatNumber(commaCount)}</b><span>${vi ? "số" : "values"}</span><em>× 1</em></div><footer>${escapeHtml(rightDescription)}</footer></article>
    </section>
    <section class="cc3870-examples"><header><strong>${vi ? "NHÌN QUANH MỐC 1,000" : "LOOK AROUND 1,000"}</strong><span>${vi ? "số xám chỉ để so sánh, không thuộc [1, n]" : "gray values are reference-only, outside [1, n]"}</span></header><div>${samples}</div></section>
    <section class="cc3870-calculation ${view.final ? "done" : ""}"><div><small>${vi ? "DÒNG CODE HIỆN TẠI" : "CURRENT CODE LINE"}</small><strong>${escapeHtml(currentFormula)}</strong><span>${escapeHtml(pick(step.note))}</span></div><aside><small>answer</small><strong>${view.final ? formatNumber(answer) : "?"}</strong></aside></section>
    <footer class="cc3870-result ${view.final ? "done" : ""}"><code>max(0, n - 999)</code><strong>${escapeHtml(finalLabel)}</strong></footer>
  </section>`;
}

function renderCountCommas3871View(step) {
  const view = step.countCommas3871View || {};
  const vi = lang === "vi";
  const n = Number(view.n) || 0;
  const layers = Array.isArray(view.layers) ? view.layers : [];
  const formatNumber = (value) => Number(value).toLocaleString("en-US");
  const phaseIndex = Number.isInteger(view.phaseIndex) ? view.phaseIndex : 0;
  const phaseLabels = vi
    ? ["1. Nhìn quy luật", "2. Kiểm tra mốc", "3. Cộng một tầng", "4. Kết quả"]
    : ["1. See the pattern", "2. Check threshold", "3. Add one layer", "4. Answer"];
  const phases = phaseLabels.map((label, index) => `<span class="${index < phaseIndex ? "done" : index === phaseIndex ? "active" : ""}"><b>${index < phaseIndex ? "✓" : index + 1}</b>${escapeHtml(label)}</span>`).join("");

  const groups = formatNumber(n).split(",");
  const numberGroups = groups.map((group, index) => `${index ? '<i aria-hidden="true">,</i>' : ""}<span class="${index === 0 ? "leading" : ""}"><small>${index === 0 ? (vi ? "nhóm đầu" : "leading group") : `${vi ? "nhóm" : "group"} ${index}`}</small><strong>${escapeHtml(group)}</strong></span>`).join("");
  const commaCountInN = Math.max(0, groups.length - 1);

  const layerRows = layers.map((layer) => {
    const statusText = {
      pending: vi ? "chờ" : "waiting",
      checking: vi ? "đang kiểm tra" : "checking",
      adding: vi ? "đang cộng" : "adding",
      blocked: vi ? "chưa đạt" : "not reached",
      done: vi ? "đã cộng" : "added",
      skipped: vi ? "bỏ qua" : "skipped",
    }[layer.status] || "";
    const range = layer.reached
      ? `[${formatNumber(layer.threshold)}, ${formatNumber(n)}]`
      : "∅";
    const contribution = layer.reached ? `+${formatNumber(layer.contribution)}` : "+0";
    return `<article class="cc3871-layer ${escapeHtml(layer.status || "pending")}">
      <div class="cc3871-layer-index"><small>${vi ? "TẦNG" : "LAYER"}</small><strong>+1</strong><span>${vi ? `dấu phẩy thứ ${layer.commaNumber}` : `comma #${layer.commaNumber}`}</span></div>
      <div class="cc3871-threshold"><small>threshold</small><strong>${formatNumber(layer.threshold)}</strong><span>n ${layer.reached ? "≥" : "<"} threshold</span></div>
      <div class="cc3871-range"><small>${vi ? "ĐOẠN ĐÓNG GÓP" : "CONTRIBUTING RANGE"}</small><strong>${escapeHtml(range)}</strong><span>${layer.reached ? `${formatNumber(layer.contribution)} ${vi ? "số" : "values"} × 1` : (vi ? "không có số nào" : "no values")}</span></div>
      <div class="cc3871-contribution"><small>${escapeHtml(statusText)}</small><strong>${escapeHtml(contribution)}</strong></div>
    </article>`;
  }).join("");

  let formula = "total = 0, threshold = 1,000";
  if (view.event === "check" && view.currentIndex >= 0) {
    const threshold = layers[view.currentIndex]?.threshold || 1000;
    formula = `${formatNumber(threshold)} ≤ ${formatNumber(n)} → ${view.condition ? "TRUE" : "FALSE"}`;
  } else if (view.event === "add" && view.currentIndex >= 0) {
    const threshold = layers[view.currentIndex]?.threshold || 1000;
    formula = `${formatNumber(view.before)} + (${formatNumber(n)} − ${formatNumber(threshold)} + 1) = ${formatNumber(view.total)}`;
  } else if (view.event === "answer") {
    formula = `return ${formatNumber(view.answer)}`;
  }
  const currentThreshold = view.currentIndex >= 0 ? layers[view.currentIndex]?.threshold : null;
  const currentHint = view.event === "add"
    ? (vi ? "Mỗi số từ threshold đến n nhận thêm đúng 1 dấu phẩy." : "Every value from threshold through n receives exactly 1 extra comma.")
    : view.event === "check" && view.condition === false
      ? (vi ? "Dừng: các mốc sau còn lớn hơn nữa." : "Stop: every later threshold is even larger.")
      : (vi ? "Mỗi mốc lũy thừa của 1,000 là một tầng độc lập." : "Each power-of-1,000 threshold is an independent layer.");
  const final = Boolean(view.final);
  const summary = vi
    ? `Bài 3871 với n bằng ${formatNumber(n)}. Tổng hiện tại ${formatNumber(view.total)} dấu phẩy.`
    : `Problem 3871 with n ${formatNumber(n)}. Current total ${formatNumber(view.total)} commas.`;

  $("treeView").innerHTML = `<section class="cc3871-viz" role="img" aria-label="${escapeHtml(summary)}">
    <header><div><small>COUNTING · #3871</small><strong>COUNT COMMAS IN RANGE II</strong></div><span>${escapeHtml(pick(step.title))}</span></header>
    <div class="cc3871-phases">${phases}</div>
    <section class="cc3871-number">
      <header><strong>n = ${formatNumber(n)}</strong><span>${commaCountInN} ${vi ? "dấu phẩy trong riêng số n" : "comma(s) in n itself"}</span></header>
      <div class="cc3871-number-groups">${numberGroups}</div>
    </section>
    <section class="cc3871-rule"><small>${vi ? "CÔNG THỨC TẦNG" : "LAYER FORMULA"}</small><strong>contribution = max(0, n − threshold + 1)</strong><span>${vi ? "Đạt thêm một mốc → mọi số từ mốc đó đến n có thêm một dấu phẩy." : "Reaching one more threshold gives every value from there through n one extra comma."}</span></section>
    <section class="cc3871-layers"><header><strong>${vi ? "5 MỐC CÓ THỂ CÓ" : "5 POSSIBLE THRESHOLDS"}</strong><span>1,000 → 1,000,000 → … → 10<sup>15</sup></span></header><div>${layerRows}</div></section>
    <section class="cc3871-calculation ${final ? "done" : ""}"><div><small>${vi ? "PHÉP TÍNH HIỆN TẠI" : "CURRENT CALCULATION"}</small><strong>${escapeHtml(formula)}</strong><span>${escapeHtml(currentHint)}${currentThreshold ? ` ${vi ? "Mốc" : "Threshold"}: ${formatNumber(currentThreshold)}.` : ""}</span></div><aside><small>total</small><strong>${formatNumber(view.total)}</strong></aside></section>
    <footer class="cc3871-answer ${final ? "done" : ""}"><code>Σ max(0, n − 10<sup>3k</sup> + 1)</code><span><small>ANSWER</small><strong>${final ? formatNumber(view.answer) : "?"}</strong></span></footer>
  </section>`;
}

function renderStable3903View(step) {
  const view = step.stable3903View || {};
  const vi = lang === "vi";
  const nums = Array.isArray(view.nums) ? view.nums : [];
  const right = Array.isArray(view.right) ? view.right : [];
  const prefix = Array.isArray(view.prefix) ? view.prefix : [];
  const gaps = Array.isArray(view.gaps) ? view.gaps : [];
  const current = Number.isInteger(view.current) ? view.current : -1;
  const k = Number.isFinite(view.k) ? view.k : 0;
  const suffixBuilt = new Set(Array.isArray(view.suffixBuilt) ? view.suffixBuilt : []);
  const phaseOrder = { size: 0, "suffix-init": 0, "suffix-loop": 0, "suffix-write": 0, "prefix-init": 1, "forward-loop": 1, "prefix-write": 1, check: 1, found: 2, "not-found": 2 };
  const phaseIndex = phaseOrder[view.phase] ?? 0;
  const phases = (vi ? ["1. Suffix min ←", "2. Prefix max →", "3. Đáp án"] : ["1. Suffix min ←", "2. Prefix max →", "3. Answer"]).map((label, index) => `<span class="${index < phaseIndex ? "done" : index === phaseIndex ? "active" : ""}"><b>${index < phaseIndex ? "✓" : index + 1}</b>${escapeHtml(label)}</span>`).join("");
  const isChecking = ["check", "found"].includes(view.phase);
  const cells = nums.map((value, index) => {
    const suffixKnown = suffixBuilt.has(index);
    const prefixKnown = Number.isFinite(prefix[index]);
    const gapKnown = Number.isFinite(gaps[index]);
    const classes = ["stable3903-cell"];
    if (index === current) classes.push("active");
    if (index < current && isChecking) classes.push("scanned");
    if (index === view.answer) classes.push("answer");
    return `<article class="${classes.join(" ")}">
      <header><small>index</small><strong>${index}</strong></header>
      <div class="stable3903-value"><small>nums</small><b>${escapeHtml(String(value))}</b></div>
      <div class="stable3903-row suffix ${suffixKnown ? "known" : "pending"}"><small>suffix min</small><b>${suffixKnown ? escapeHtml(String(right[index])) : "?"}</b></div>
      <div class="stable3903-row prefix ${prefixKnown ? "known" : "pending"}"><small>prefix max</small><b>${prefixKnown ? escapeHtml(String(prefix[index])) : "?"}</b></div>
      <div class="stable3903-row gap ${gapKnown ? "known" : "pending"}"><small>gap</small><b>${gapKnown ? escapeHtml(String(gaps[index])) : "?"}</b></div>
    </article>`;
  }).join("");
  const leftRange = current >= 0 ? `nums[0..${current}]` : "—";
  const rightRange = current >= 0 ? `nums[${current}..${Math.max(0, nums.length - 1)}]` : "—";
  const formula = isChecking
    ? `max(${leftRange}) ${Number.isFinite(view.prefixMax) ? `= ${view.prefixMax}` : ""} − min(${rightRange}) ${current >= 0 ? `= ${right[current]}` : ""} = ${view.gap ?? "?"}`
    : view.phase.startsWith("suffix")
      ? (current >= 0 && current < nums.length - 1 ? `right[${current}] = min(nums[${current}], right[${current + 1}]) = ${right[current]}` : `right[n − 1] = nums[n − 1] = ${right[nums.length - 1] ?? "?"}`)
      : (vi ? "Sẵn sàng kiểm tra: prefix max − suffix min" : "Ready to check: prefix max − suffix min");
  const decision = view.stable === true
    ? (vi ? `Ổn định: gap ≤ k (${k})` : `Stable: gap ≤ k (${k})`)
    : view.stable === false
      ? (vi ? `Chưa ổn định: gap > k (${k})` : `Not stable: gap > k (${k})`)
      : (vi ? `Ngưỡng k = ${k}` : `Threshold k = ${k}`);
  const result = view.answer >= 0
    ? (vi ? `Đáp án nhỏ nhất: index ${view.answer}` : `Smallest answer: index ${view.answer}`)
    : view.phase === "not-found"
      ? (vi ? "Không có index ổn định → −1" : "No stable index → −1")
      : (vi ? "Đang tính…" : "Computing…");

  $("treeView").innerHTML = `<section class="stable3903-viz" role="img" aria-label="Smallest Stable Index visualization">
    <header><div><small>ARRAY BOUNDARIES · #3903</small><strong>SMALLEST STABLE INDEX</strong></div><span>${escapeHtml(pick(step.title))}</span></header>
    <div class="stable3903-phases">${phases}</div>
    <section class="stable3903-rule"><b>${vi ? "CÂU HỎI Ở MỖI INDEX i" : "QUESTION AT EVERY INDEX i"}</b><strong>max(nums[0..i]) − min(nums[i..n−1]) ≤ k ?</strong><span>${vi ? "Hai đoạn gặp nhau tại i; màu xanh là min bên phải, màu cam là max bên trái." : "The two ranges overlap at i; blue is the right minimum and amber is the left maximum."}</span></section>
    <section class="stable3903-metrics"><div><small>i</small><strong>${current >= 0 ? current : "—"}</strong></div><div><small>prefix max</small><strong>${view.prefixMax ?? "—"}</strong></div><div><small>suffix min</small><strong>${current >= 0 && suffixBuilt.has(current) ? right[current] : "—"}</strong></div><div class="${view.stable === true ? "yes" : view.stable === false ? "no" : ""}"><small>gap vs k</small><strong>${view.gap ?? "—"} ${view.gap != null ? (view.stable ? "≤" : ">") : ""} ${k}</strong></div></section>
    <section class="stable3903-ranges"><span class="left">${escapeHtml(leftRange)} → ${vi ? "lấy MAX" : "take MAX"}</span><b>−</b><span class="right">${escapeHtml(rightRange)} → ${vi ? "lấy MIN" : "take MIN"}</span></section>
    <section class="stable3903-grid-wrap"><header><strong>${vi ? "BẢNG THEO INDEX" : "INDEX TABLE"}</strong><span>${vi ? "tím = index đang xét · xanh = đáp án" : "purple = current index · green = answer"}</span></header><div class="stable3903-grid" style="--stable3903-count:${Math.max(nums.length, 1)}">${cells}</div></section>
    <section class="stable3903-formula ${view.stable === true ? "yes" : view.stable === false ? "no" : ""}"><small>${vi ? "PHÉP TÍNH HIỆN TẠI" : "CURRENT CALCULATION"}</small><strong>${escapeHtml(formula)}</strong><span>${escapeHtml(decision)}</span></section>
    <footer class="stable3903-result ${view.answer >= 0 ? "yes" : view.phase === "not-found" ? "no" : ""}"><small>${vi ? "KẾT QUẢ" : "RESULT"}</small><strong>${escapeHtml(result)}</strong><span>${escapeHtml(pick(step.note))}</span></footer>
  </section>`;
}

function renderOddEven975View(step) {
  const view = step.oddEven975View || {};
  const vi = lang === "vi";
  const nums = Array.isArray(view.nums) ? view.nums : [];
  const oddNext = Array.isArray(view.oddNext) ? view.oddNext : [];
  const evenNext = Array.isArray(view.evenNext) ? view.evenNext : [];
  const oddGood = Array.isArray(view.oddGood) ? view.oddGood : [];
  const evenGood = Array.isArray(view.evenGood) ? view.evenGood : [];
  const oddKnown = Array.isArray(view.oddKnown) ? view.oddKnown : [];
  const evenKnown = Array.isArray(view.evenKnown) ? view.evenKnown : [];
  const order = Array.isArray(view.order) ? view.order : [];
  const stack = Array.isArray(view.stack) ? view.stack : [];
  const current = Number.isInteger(view.current) ? view.current : -1;
  const popped = Number.isInteger(view.popped) ? view.popped : -1;
  const stageIndex = Number.isInteger(view.stageIndex) ? view.stageIndex : 0;
  const phaseLabels = vi
    ? ["Odd next", "Even next", "DP từ phải", "Đếm start"]
    : ["Odd next", "Even next", "DP from right", "Count starts"];
  const phases = phaseLabels.map((label, index) => `<span class="${index < stageIndex ? "done" : index === stageIndex ? "active" : ""}"><b>${index < stageIndex ? "✓" : index + 1}</b>${escapeHtml(label)}</span>`).join("");
  const endpoint = (target) => target >= 0 ? `${target} : ${nums[target]}` : "—";
  const booleanCell = (known, value) => known ? `<b class="${value ? "yes" : "no"}">${value ? "True" : "False"}</b>` : "<b class=\"unknown\">?</b>";
  const cells = nums.map((value, index) => {
    const classes = ["oe975-cell"];
    if (index === current) classes.push("current");
    if (index === popped) classes.push("linked");
    if (stack.includes(index)) classes.push("in-stack");
    if (view.answer != null && oddGood[index]) classes.push("good-start");
    return `<article class="${classes.join(" ")}">
      <header><small>index</small><strong>${index}</strong></header>
      <div class="oe975-value"><small>arr[${index}]</small><b>${escapeHtml(String(value))}</b></div>
      <div class="oe975-next odd"><small>odd next</small><b>${escapeHtml(endpoint(oddNext[index] ?? -1))}</b></div>
      <div class="oe975-next even"><small>even next</small><b>${escapeHtml(endpoint(evenNext[index] ?? -1))}</b></div>
      <div class="oe975-dp"><span><small>odd</small>${booleanCell(Boolean(oddKnown[index]), Boolean(oddGood[index]))}</span><span><small>even</small>${booleanCell(Boolean(evenKnown[index]), Boolean(evenGood[index]))}</span></div>
    </article>`;
  }).join("");
  const isBuilding = view.jumpType === "odd" || view.jumpType === "even";
  const jumpName = view.jumpType === "even" ? "even" : "odd";
  const rule = view.jumpType === "even"
    ? (vi ? "Even jump: chọn value LỚN NHẤT ≤ arr[i], hòa thì index nhỏ nhất." : "Even jump: choose the LARGEST value ≤ arr[i], then the smallest index.")
    : (vi ? "Odd jump: chọn value NHỎ NHẤT ≥ arr[i], hòa thì index nhỏ nhất." : "Odd jump: choose the SMALLEST value ≥ arr[i], then the smallest index.");
  const orderText = order.length ? order.map((index) => `${index}:${nums[index]}`).join("  →  ") : "—";
  const stackText = stack.length ? stack.map((index) => `${index}:${nums[index]}`).join(" · ") : "[]";
  const dpFormula = current >= 0 && view.phase === "odd-dp"
    ? (oddNext[current] < 0 ? `odd[${current}] = False (no odd next)` : `odd[${current}] = even[${oddNext[current]}] = ${oddGood[current]}`)
    : current >= 0 && view.phase === "even-dp"
      ? (evenNext[current] < 0 ? `even[${current}] = False (no even next)` : `even[${current}] = odd[${evenNext[current]}] = ${evenGood[current]}`)
      : (vi ? "Mỗi trạng thái lấy kết quả của trạng thái đối nghịch tại điểm đến." : "Each state takes the opposite-jump result at its destination.");
  const startIndices = oddGood.map((good, index) => good ? index : -1).filter((index) => index >= 0);
  const final = view.answer != null;
  const action = view.action || (isBuilding
    ? (vi ? `Đang dựng ${jumpName} next bằng stack.` : `Building ${jumpName} next with the stack.`)
    : (vi ? "Đang tính trạng thái DP." : "Computing DP states."));

  $("treeView").innerHTML = `<section class="oe975-viz" role="img" aria-label="Odd Even Jump visualization">
    <header><div><small>MONOTONIC STACK + DP · #975</small><strong>ODD EVEN JUMP</strong></div><span>${escapeHtml(pick(step.title))}</span></header>
    <div class="oe975-phases">${phases}</div>
    <section class="oe975-rule"><b>${isBuilding ? `${jumpName.toUpperCase()} JUMP RULE` : (vi ? "Ý NGHĨA DP" : "DP MEANING")}</b><strong>${escapeHtml(isBuilding ? rule : "odd[i] = even[oddNext[i]]   ·   even[i] = odd[evenNext[i]]")}</strong><span>${vi ? "Mỗi card cho biết điểm đến ưu tiên và liệu có thể tới index cuối hay không." : "Each card shows the preferred destination and whether it can reach the last index."}</span></section>
    <section class="oe975-stack-wrap"><header><strong>${isBuilding ? (vi ? `THỨ TỰ SORT CHO ${jumpName.toUpperCase()} JUMP` : `SORTED ORDER FOR ${jumpName.toUpperCase()} JUMP`) : (vi ? "DP QUÉT TỪ PHẢI SANG TRÁI" : "DP SCANS RIGHT TO LEFT")}</strong><span>${isBuilding ? (vi ? "index:value" : "index:value") : (vi ? "điểm đến luôn ở bên phải" : "destinations are always to the right")}</span></header><code>${escapeHtml(isBuilding ? orderText : nums.map((value, index) => `${index}:${value}`).join("  ←  "))}</code><div><small>${vi ? "STACK HIỆN TẠI" : "CURRENT STACK"}</small><strong>${escapeHtml(isBuilding ? stackText : "—")}</strong></div></section>
    <section class="oe975-grid-wrap"><header><strong>${vi ? "BẢNG INDEX" : "INDEX TABLE"}</strong><span>${vi ? "xanh = odd next · cam = even next · tím = index đang xét" : "blue = odd next · orange = even next · purple = current index"}</span></header><div class="oe975-grid" style="--oe975-count:${Math.max(nums.length, 1)}">${cells}</div></section>
    <section class="oe975-formula ${view.phase === "odd-dp" || view.phase === "even-dp" ? "active" : ""}"><small>${vi ? "BƯỚC HIỆN TẠI" : "CURRENT STEP"}</small><strong>${escapeHtml(isBuilding ? action : dpFormula)}</strong><span>${escapeHtml(pick(step.note))}</span></section>
    <footer class="oe975-result ${final ? "done" : ""}"><small>${vi ? "GOOD START INDICES" : "GOOD START INDICES"}</small><strong>${final ? `${view.answer}  ·  { ${startIndices.join(", ")} }` : "…"}</strong><span>${final ? (vi ? "Chỉ odd[i] = True được phép bắt đầu, vì jump đầu tiên là odd jump." : "Only odd[i] = True can start, because the first jump is odd.") : (vi ? "Màu xanh lá chỉ xuất hiện sau khi đã hoàn tất đếm." : "Green starts appear after the count is complete.")}</span></footer>
  </section>`;
}

function renderValidSubarrays1063View(step) {
  const view = step.validSubarrays1063View || {};
  const vi = lang === "vi";
  const nums = Array.isArray(view.nums) ? view.nums : [];
  const stack = Array.isArray(view.stack) ? view.stack : [];
  const contributions = Array.isArray(view.contributions) ? view.contributions : [];
  const starts = Array.isArray(view.currentStarts) ? view.currentStarts : [];
  const current = Number.isInteger(view.current) ? view.current : -1;
  const comparedIndex = Number.isInteger(view.comparedIndex) ? view.comparedIndex : -1;
  const popped = Number.isInteger(view.popped) ? view.popped : -1;
  const poppedThisRound = Array.isArray(view.poppedThisRound) ? view.poppedThisRound : [];
  const phaseIndex = Number.isInteger(view.phaseIndex) ? view.phaseIndex : 0;
  const phaseLabels = vi
    ? ["Đọc right endpoint", "Pop start sai", "Push index i", "Cộng len(stack)", "Kết quả"]
    : ["Read right endpoint", "Pop invalid starts", "Push index i", "Add stack length", "Result"];
  const phases = phaseLabels.map((label, index) => `<span class="${index < phaseIndex ? "done" : index === phaseIndex ? "active" : ""}"><b>${index < phaseIndex ? "✓" : index + 1}</b>${escapeHtml(label)}</span>`).join("");
  const cells = nums.map((value, index) => {
    const contribution = contributions[index];
    const classes = ["vs1063-cell"];
    if (index === current) classes.push("current");
    if (stack.includes(index)) classes.push("in-stack");
    if (index === popped) classes.push("popped");
    if (starts.includes(index)) classes.push("valid-start");
    return `<article class="${classes.join(" ")}">
      <header><small>index</small><strong>${index}</strong></header>
      <div class="vs1063-value"><small>nums[${index}]</small><b>${escapeHtml(String(value))}</b></div>
      <div class="vs1063-status"><small>${stack.includes(index) ? (vi ? "trong stack" : "in stack") : index === popped ? (vi ? "đã pop" : "popped") : (vi ? "không hoạt động" : "inactive")}</small><b>${stack.includes(index) ? "✓" : index === popped ? "×" : "·"}</b></div>
      <div class="vs1063-add"><small>${vi ? "contribution" : "contribution"}</small><b>${Number.isInteger(contribution) ? `+${contribution}` : "?"}</b></div>
    </article>`;
  }).join("");
  const stackText = stack.length ? stack.map((index) => `${index}:${nums[index]}`).join("  →  ") : "[]";
  const ranges = current >= 0 && starts.length
    ? starts.map((start) => {
      const values = nums.slice(start, current + 1);
      return `<span><b>[${start}..${current}]</b><small>${values.join(", ")} · min = ${Math.min(...values)} = first</small></span>`;
    }).join("")
    : `<em>${vi ? "Push index hiện tại để tạo các range hợp lệ." : "Push the current index to create valid ranges."}</em>`;
  let running = 0;
  const contributionRows = nums.map((_, index) => {
    const addition = contributions[index];
    const known = Number.isInteger(addition);
    if (known) running += addition;
    return `<div class="${index === current ? "current" : ""}"><small>i = ${index}</small><b>${known ? `+${addition}` : "?"}</b><span>${known ? `sum = ${running}` : ""}</span></div>`;
  }).join("");
  const rule = vi
    ? "nums[left] phải ≤ mọi phần tử trong nums[left..right]."
    : "nums[left] must be ≤ every element in nums[left..right].";
  const stepFormula = view.phase === "count" && current >= 0
    ? `answer = ${view.answer - (contributions[current] ?? 0)} + ${contributions[current] ?? 0} = ${view.answer}`
    : (view.action || (vi ? "Giữ stack theo thứ tự value không giảm." : "Keep the stack in non-decreasing value order."));
  const isFinal = view.phase === "done";
  const isComparing = current >= 0 && comparedIndex >= 0 && ["while", "pop"].includes(view.phase);
  const shouldPop = isComparing && nums[comparedIndex] > nums[current];
  const comparisonHtml = isComparing ? `<section class="vs1063-compare ${shouldPop ? "remove" : "keep"}">
    <div><small>stack top · index ${comparedIndex}</small><strong>${nums[comparedIndex]}</strong></div>
    <b>${shouldPop ? ">" : "≤"}</b>
    <div><small>nums[${current}] · current</small><strong>${nums[current]}</strong></div>
    <p><b>${shouldPop ? "POP" : "KEEP"}</b><span>${shouldPop ? (vi ? `Start ${comparedIndex} không thể còn là minimum tới index ${current}.` : `Start ${comparedIndex} can no longer be the minimum through index ${current}.`) : (vi ? `Start ${comparedIndex} vẫn là minimum hợp lệ.` : `Start ${comparedIndex} remains a valid minimum.`)}</span></p>
  </section>` : "";
  const poppedHtml = poppedThisRound.length
    ? poppedThisRound.map((index) => `<span><b>${index}:${nums[index]}</b><small>${vi ? `loại range [${index}..${current}]` : `reject range [${index}..${current}]`}</small></span>`).join("")
    : `<em>${vi ? "Chưa pop start nào tại right endpoint này." : "No start has been popped at this right endpoint."}</em>`;

  $("treeView").innerHTML = `<section class="vs1063-viz" role="img" aria-label="Number of Valid Subarrays visualization">
    <header><div><small>MONOTONIC STACK · #1063</small><strong>NUMBER OF VALID SUBARRAYS</strong></div><span>${escapeHtml(pick(step.title))}</span></header>
    <div class="vs1063-phases">${phases}</div>
    <section class="vs1063-rule"><b>${vi ? "KHI NÀO MỘT RANGE HỢP LỆ?" : "WHEN IS A RANGE VALID?"}</b><strong>${escapeHtml(rule)}</strong><span>${vi ? "Vì vậy, khi gặp value nhỏ hơn, mọi start có value lớn hơn phải bị loại khỏi stack." : "Therefore, when a smaller value appears, every start with a larger value must leave the stack."}</span></section>
    <section class="vs1063-metrics"><div><small>right endpoint i</small><strong>${current >= 0 ? current : "—"}</strong></div><div><small>value</small><strong>${current >= 0 ? nums[current] : "—"}</strong></div><div><small>len(stack)</small><strong>${stack.length}</strong></div><div class="answer"><small>answer</small><strong>${view.answer ?? 0}</strong></div></section>
    ${comparisonHtml}
    <section class="vs1063-stack"><header><strong>${vi ? "MONOTONIC STACK (INDEX : VALUE)" : "MONOTONIC STACK (INDEX : VALUE)"}</strong><span>${vi ? "từ đáy → đỉnh" : "bottom → top"}</span></header><code>${escapeHtml(stackText)}</code><p>${vi ? "Mỗi index trong stack là một start index vẫn có thể tạo valid subarray tới right endpoint hiện tại." : "Each index in the stack is a start index that can still form a valid subarray to the current right endpoint."}</p><div class="vs1063-popped"><small>${vi ? "ĐÃ POP TẠI i NÀY" : "POPPED AT THIS i"}</small><div>${poppedHtml}</div></div></section>
    <section class="vs1063-grid-wrap"><header><strong>${vi ? "ARRAY + ĐÓNG GÓP" : "ARRAY + CONTRIBUTION"}</strong><span>${vi ? "tím = current · xanh = start hợp lệ · đỏ = vừa pop" : "purple = current · blue = valid start · red = just popped"}</span></header><div class="vs1063-grid" style="--vs1063-count:${Math.max(nums.length, 1)}">${cells}</div></section>
    <section class="vs1063-ranges"><header><strong>${vi ? `VALID SUBARRAY KẾT THÚC Ở i = ${current >= 0 ? current : "—"}` : `VALID SUBARRAYS ENDING AT i = ${current >= 0 ? current : "—"}`}</strong><span>${starts.length ? `${starts.length} ${vi ? "range" : "range(s)"}` : ""}</span></header><div>${ranges}</div></section>
    <section class="vs1063-contributions"><header><strong>${vi ? "CỘNG DỒN THEO RIGHT ENDPOINT" : "ACCUMULATED BY RIGHT ENDPOINT"}</strong><span>${vi ? "mỗi +k là len(stack) sau khi push" : "each +k is len(stack) after push"}</span></header><div>${contributionRows}</div></section>
    <section class="vs1063-formula"><small>${vi ? "BƯỚC HIỆN TẠI" : "CURRENT STEP"}</small><strong>${escapeHtml(stepFormula)}</strong><span>${escapeHtml(pick(step.note))}</span></section>
    <footer class="vs1063-result ${isFinal ? "done" : ""}"><small>${vi ? "KẾT QUẢ" : "RESULT"}</small><strong>${isFinal ? view.answer : "…"}</strong><span>${isFinal ? (vi ? "Tổng tất cả contribution là số valid subarray." : "The sum of all contributions is the number of valid subarrays.") : (vi ? "answer sẽ được cập nhật sau khi stack hợp lệ." : "answer is updated after the stack is valid.")}</span></footer>
  </section>`;
}

function renderVisibleQueue1944View(step) {
  const view = step.visibleQueue1944View || {};
  const vi = lang === "vi";
  const heights = Array.isArray(view.heights) ? view.heights : [];
  const answer = Array.isArray(view.answer) ? view.answer : [];
  const stack = Array.isArray(view.stack) ? view.stack : [];
  const resolved = Array.isArray(view.resolved) ? view.resolved : [];
  const visible = Array.isArray(view.visible) ? view.visible : [];
  const current = Number.isInteger(view.current) ? view.current : -1;
  const compared = Number.isInteger(view.compared) ? view.compared : -1;
  const popped = Number.isInteger(view.popped) ? view.popped : -1;
  const blocker = Number.isInteger(view.blocker) ? view.blocker : -1;
  const phaseIndex = Number.isInteger(view.phaseIndex) ? view.phaseIndex : 0;
  const maxHeight = Math.max(1, ...heights);
  const phaseLabels = vi
    ? ["Hiểu luật nhìn", "Chọn person i", "Pop người thấp", "Dừng ở blocker", "Push / Kết quả"]
    : ["Visibility rule", "Choose person i", "Pop shorter", "Stop at blocker", "Push / Result"];
  const phases = phaseLabels.map((label, index) => `<span class="${index < phaseIndex ? "done" : index === phaseIndex ? "active" : ""}"><b>${index < phaseIndex ? "✓" : index + 1}</b>${escapeHtml(label)}</span>`).join("");
  const people = heights.map((height, index) => {
    const classes = ["vq1944-person"];
    if (resolved.includes(index)) classes.push("resolved");
    if (stack.includes(index)) classes.push("in-stack");
    if (visible.includes(index)) classes.push("visible");
    if (index === current) classes.push("current");
    if (index === compared) classes.push("compared");
    if (index === popped) classes.push("popped");
    if (index === blocker) classes.push("blocker");
    const barHeight = 44 + Math.round((height / maxHeight) * 72);
    let status = resolved.includes(index) ? (vi ? "đã tính" : "resolved") : (vi ? "chưa quét" : "not scanned");
    if (stack.includes(index)) status = "STACK";
    if (visible.includes(index)) status = vi ? "NHÌN THẤY" : "VISIBLE";
    if (index === current) status = "CURRENT";
    if (index === popped) status = "POP";
    if (index === blocker) status = "BLOCKER";
    return `<article class="${classes.join(" ")}"><div class="vq1944-height-zone"><div class="vq1944-height" style="height:${barHeight}px"><b>${height}</b></div></div><header><small>person</small><strong>${index}</strong></header><footer><span>${escapeHtml(status)}</span><b>ans ${answer[index] ?? 0}</b></footer></article>`;
  }).join("");
  const stackHtml = stack.length
    ? stack.map((index, position) => `<span class="${position === stack.length - 1 ? "top" : ""}"><small>person ${index}</small><b>${heights[index]}</b>${position === stack.length - 1 ? "<em>TOP</em>" : ""}</span>`).join("<i>→</i>")
    : `<p>${vi ? "Stack rỗng" : "Empty stack"}</p>`;
  const sightHtml = current >= 0 && visible.length
    ? visible.map((target) => `<span class="${target === blocker ? "blocker" : "shorter"}"><small>${current} → ${target}</small><b>${heights[current]} ${target === blocker ? "≤" : ">"} ${heights[target]}</b><em>${target === blocker ? (vi ? "thấy rồi dừng" : "see, then stop") : (vi ? "thấy rồi pop" : "see, then pop")}</em></span>`).join("")
    : `<p>${current < 0 ? (vi ? "Chọn một person để bắt đầu nhìn sang phải." : "Choose a person to begin looking right.") : (vi ? "Chưa thấy người nào ở bước này." : "No person has been seen in this step yet.")}</p>`;
  const hasComparison = current >= 0 && compared >= 0;
  const currentHeight = current >= 0 ? heights[current] : null;
  const comparedHeight = compared >= 0 ? heights[compared] : null;
  const relation = hasComparison ? (currentHeight > comparedHeight ? ">" : "<") : "?";
  const decision = popped >= 0 || view.phase === "compare" || view.phase === "pop"
    ? "SEE + POP"
    : blocker >= 0
      ? "SEE + STOP"
      : stack.length === 0 && current >= 0
        ? "NO BLOCKER"
        : "WAIT";
  const comparison = hasComparison ? `<section class="vq1944-compare ${popped >= 0 || view.phase === "pop" || view.phase === "compare" ? "pop" : blocker >= 0 ? "stop" : ""}"><div><small>CURRENT · person ${current}</small><strong>${currentHeight}</strong></div><b>${relation}</b><div><small>STACK TOP · person ${compared}</small><strong>${comparedHeight}</strong></div><p><b>${decision}</b><span>${popped >= 0 || view.phase === "pop" || view.phase === "compare" ? (vi ? "Người thấp hơn được nhìn thấy và bị loại để tiếp tục nhìn xa hơn." : "The shorter person is visible and removed so the scan can continue farther.") : blocker >= 0 ? (vi ? "Người cao hơn đầu tiên được nhìn thấy, nhưng chặn mọi người phía sau." : "The first taller person is visible, but blocks everyone behind them.") : ""}</span></p></section>` : "";
  const ledger = heights.map((height, index) => `<span class="${index === current ? "current" : resolved.includes(index) ? "done" : ""}"><small>person ${index} · h=${height}</small><b>${resolved.includes(index) || index === current ? answer[index] : "?"}</b></span>`).join("");
  const final = view.phase === "done";

  $("treeView").innerHTML = `<section class="vq1944-viz" role="img" aria-label="Number of Visible People in a Queue visualization">
    <header><div><small>MONOTONIC DECREASING STACK · #1944</small><strong>VISIBLE PEOPLE IN A QUEUE</strong></div><span>${escapeHtml(pick(step.title))}</span></header>
    <div class="vq1944-phases">${phases}</div>
    <section class="vq1944-rule"><b>${vi ? "HAI TRƯỜNG HỢP ĐƯỢC NHÌN THẤY" : "TWO VISIBLE CASES"}</b><div><span><strong>1</strong><b>${vi ? "Thấp hơn current" : "Shorter than current"}</b><small>${vi ? "Thấy → cộng 1 → pop → nhìn tiếp" : "See → add 1 → pop → continue"}</small></span><span><strong>2</strong><b>${vi ? "Cao hơn đầu tiên" : "First taller person"}</b><small>${vi ? "Thấy → cộng 1 → dừng, không pop" : "See → add 1 → stop, do not pop"}</small></span></div></section>
    <section class="vq1944-metrics"><div><small>current person</small><strong>${current >= 0 ? current : "—"}</strong></div><div><small>current height</small><strong>${currentHeight ?? "—"}</strong></div><div><small>${vi ? "đã thấy lúc này" : "visible now"}</small><strong>${visible.length}</strong></div><div class="answer"><small>answer[current]</small><strong>${current >= 0 ? answer[current] : "—"}</strong></div></section>
    ${comparison}
    <section class="vq1944-queue"><header><strong>${vi ? "HÀNG NGƯỜI · QUÉT TỪ PHẢI SANG TRÁI" : "QUEUE · SCAN RIGHT TO LEFT"}</strong><span>${vi ? "← hướng quét · chiều cao cột theo heights[i]" : "← scan direction · column height follows heights[i]"}</span></header><div style="--vq1944-count:${Math.max(heights.length, 1)}">${people}</div></section>
    <div class="vq1944-panels"><section class="vq1944-stack"><header><strong>SKYLINE STACK</strong><span>${vi ? "đáy → đỉnh" : "bottom → top"}</span></header><div>${stackHtml}</div><p>${vi ? "Chỉ những person chưa bị che hoàn toàn mới còn trong stack." : "Only people who are not completely hidden remain in the stack."}</p></section><section class="vq1944-sight"><header><strong>${vi ? "ĐƯỜNG NHÌN CỦA CURRENT" : "CURRENT LINE OF SIGHT"}</strong><span>${current >= 0 ? `person ${current}` : "—"}</span></header><div>${sightHtml}</div></section></div>
    <section class="vq1944-ledger"><header><strong>${vi ? "KẾT QUẢ TỪNG PERSON" : "ANSWER PER PERSON"}</strong><span>answer[i] = visible people to the right</span></header><div style="--vq1944-count:${Math.max(heights.length, 1)}">${ledger}</div></section>
    <section class="vq1944-action"><small>${vi ? "BƯỚC HIỆN TẠI" : "CURRENT STEP"}</small><strong>${escapeHtml(pick(view.action))}</strong><span>${escapeHtml(pick(view.explanation))}</span></section>
    <footer class="vq1944-result ${final ? "done" : ""}"><small>${vi ? "KẾT QUẢ" : "RESULT"}</small><strong>${final ? `[${answer.join(", ")}]` : "…"}</strong><span>${final ? (vi ? "Mỗi person vào stack một lần và bị pop nhiều nhất một lần." : "Each person enters the stack once and is popped at most once.") : (vi ? "Theo dõi stack top để biết nhìn tiếp hay dừng." : "Watch the stack top to decide whether to continue or stop.")}</span></footer>
  </section>`;
}

function renderMaxMin1950View(step) {
  const view = step.maxMin1950View || {};
  const vi = lang === "vi";
  const nums = Array.isArray(view.nums) ? view.nums : [];
  const left = Array.isArray(view.left) ? view.left : [];
  const right = Array.isArray(view.right) ? view.right : [];
  const leftKnown = Array.isArray(view.leftKnown) ? view.leftKnown : [];
  const rightKnown = Array.isArray(view.rightKnown) ? view.rightKnown : [];
  const stack = Array.isArray(view.stack) ? view.stack : [];
  const answer = Array.isArray(view.answer) ? view.answer : [];
  const current = Number.isInteger(view.current) ? view.current : -1;
  const compared = Number.isInteger(view.compared) ? view.compared : -1;
  const popped = Number.isInteger(view.popped) ? view.popped : -1;
  const activeLength = Number.isInteger(view.activeLength) ? view.activeLength : 0;
  const sourceLength = Number.isInteger(view.sourceLength) ? view.sourceLength : 0;
  const finalizedFrom = Number.isInteger(view.finalizedFrom) ? view.finalizedFrom : nums.length + 1;
  const ownerRange = view.ownerRange && Number.isInteger(view.ownerRange.start) ? view.ownerRange : null;
  const phaseIndex = Number.isInteger(view.phaseIndex) ? view.phaseIndex : 0;
  const phaseLabels = vi
    ? ["Tìm biên L / R", "Ghi bucket theo span", "Lan từ dài → ngắn", "Kết quả"]
    : ["Find L / R bounds", "Write span bucket", "Long → short fill", "Result"];
  const phases = phaseLabels.map((label, index) => `<span class="${index < phaseIndex ? "done" : index === phaseIndex ? "active" : ""}"><b>${index < phaseIndex ? "✓" : index + 1}</b>${escapeHtml(label)}</span>`).join("");

  const cards = nums.map((value, index) => {
    const classes = ["mm1950-card"];
    const bounded = Boolean(leftKnown[index] && rightKnown[index]);
    if (bounded) classes.push("bounded");
    if (stack.includes(index)) classes.push("in-stack");
    if (index === current) classes.push("current");
    if (index === compared) classes.push("compared");
    if (index === popped) classes.push("popped");
    const span = bounded ? right[index] - left[index] - 1 : "?";
    let status = bounded ? (vi ? "ĐỦ HAI BIÊN" : "BOUNDS READY") : (vi ? "ĐANG TÌM BIÊN" : "FINDING BOUNDS");
    if (stack.includes(index)) status = "IN STACK";
    if (index === current) status = "CURRENT";
    if (index === compared) status = "STACK TOP";
    if (index === popped) status = "POPPED";
    return `<article class="${classes.join(" ")}"><header><small>INDEX</small><strong>${index}</strong></header><div class="mm1950-value"><small>nums[${index}]</small><b>${value}</b></div><div class="mm1950-bounds"><span><small>L · prev &lt;</small><b>${leftKnown[index] ? left[index] : "?"}</b></span><span><small>R · next ≤</small><b>${rightKnown[index] ? right[index] : "?"}</b></span></div><div class="mm1950-span"><small>R − L − 1</small><b>${span}</b></div><footer>${escapeHtml(status)}</footer></article>`;
  }).join("");

  const stackHtml = stack.length
    ? stack.map((index, position) => `<span class="${position === stack.length - 1 ? "top" : ""}"><small>i=${index}</small><b>${nums[index]}</b>${position === stack.length - 1 ? "<em>TOP</em>" : ""}</span>`).join("<i>→</i>")
    : `<p>${vi ? "Stack rỗng" : "Empty stack"}</p>`;
  const comparisonIndex = compared >= 0 ? compared : popped;
  const showComparison = current >= 0 && comparisonIndex >= 0 && ["boundary-compare", "boundary-pop"].includes(view.phase);
  const shouldPop = showComparison && nums[comparisonIndex] >= nums[current];
  const comparison = showComparison ? `<section class="mm1950-compare ${shouldPop ? "pop" : "keep"}"><div><small>STACK TOP · i=${comparisonIndex}</small><strong>${nums[comparisonIndex]}</strong></div><b>${shouldPop ? "≥" : "<"}</b><div><small>CURRENT · i=${current}</small><strong>${nums[current]}</strong></div><p><b>${shouldPop ? "POP" : "KEEP"}</b><span>${shouldPop ? (vi ? "Current là next smaller-or-equal của stack top; chốt R rồi pop." : "Current is the stack top's next smaller-or-equal value; set R and pop.") : (vi ? "Stack top nhỏ hơn current; đây là previous smaller L." : "The stack top is smaller than current; it becomes previous-smaller L.")}</span></p></section>` : "";

  const rangeCells = nums.map((value, index) => {
    const classes = ["mm1950-range-cell"];
    if (ownerRange && index >= ownerRange.start && index <= ownerRange.end) classes.push("inside");
    if (index === current) classes.push("owner");
    if (index === compared) classes.push("compared");
    if (index === popped) classes.push("popped");
    return `<span class="${classes.join(" ")}"><small>i=${index}</small><b>${value}</b>${ownerRange && index === current ? `<em>${vi ? "MINIMUM" : "MINIMUM"}</em>` : ""}</span>`;
  }).join("");
  const rangeTitle = ownerRange
    ? `[${ownerRange.start}..${ownerRange.end}] · length ${ownerRange.length}`
    : current >= 0
      ? (vi ? `Đang tìm khoảng cho i=${current}` : `Finding the interval for i=${current}`)
      : (vi ? "Chưa chọn owner" : "No owner selected");
  const boundarySummary = ownerRange
    ? `<span class="left"><small>L · previous smaller</small><b>${left[current]}</b></span><i>owned interval</i><span class="right"><small>R · next smaller/equal</small><b>${right[current]}</b></span>`
    : `<p>${vi ? "Sau khi có cả L và R, vùng màu xanh sẽ là khoảng lớn nhất mà nums[i] làm minimum." : "Once both L and R are known, the green region is the widest interval where nums[i] is the minimum."}</p>`;

  const buckets = answer.map((value, index) => {
    const length = index + 1;
    const classes = ["mm1950-bucket"];
    if (length === activeLength) classes.push("active");
    if (length === sourceLength) classes.push("source");
    if (length >= finalizedFrom) classes.push("finalized");
    const shown = value === 0 && view.phase !== "done" ? "—" : value;
    return `<span class="${classes.join(" ")}"><small>WINDOW SIZE</small><strong>${length}</strong><b>${shown}</b><em>${vi ? "max của minimum" : "max of minima"}</em></span>`;
  }).join("");

  const currentValue = current >= 0 ? nums[current] : null;
  const currentLeft = current >= 0 && leftKnown[current] ? left[current] : null;
  const currentRight = current >= 0 && rightKnown[current] ? right[current] : null;
  const currentSpan = currentLeft != null && currentRight != null ? currentRight - currentLeft - 1 : null;
  let formula = view.action || "span(i) = R - L - 1";
  if (view.phase === "bucket-span" && ownerRange) formula = `size = ${right[current]} − (${left[current]}) − 1 = ${ownerRange.length}`;
  if (view.phase === "bucket-write" && ownerRange) formula = `answer[${ownerRange.length - 1}] = max(${view.bucketBefore}, ${nums[current]}) = ${answer[ownerRange.length - 1]}`;
  if (view.phase.startsWith("fill") && activeLength > 0 && sourceLength > 0) formula = `answer[${activeLength - 1}] = max(${view.bucketBefore}, answer[${sourceLength - 1}]) = ${answer[activeLength - 1]}`;
  const final = view.phase === "done";

  $("treeView").innerHTML = `<section class="mm1950-viz" role="img" aria-label="Maximum of Minimum Values in All Subarrays visualization">
    <header><div><small>MONOTONIC BOUNDARIES · #1950</small><strong>MAXIMUM OF MINIMUMS</strong></div><span>${escapeHtml(pick(step.title))}</span></header>
    <div class="mm1950-phases">${phases}</div>
    <section class="mm1950-rule"><b>${vi ? "MỖI VALUE SỞ HỮU MỘT KHOẢNG" : "EACH VALUE OWNS AN INTERVAL"}</b><strong>nums[i] is minimum on [L + 1 .. R − 1]</strong><div><span><small>L</small><b>previous strictly smaller</b></span><i>←</i><span class="owner"><small>i</small><b>nums[i]</b></span><i>→</i><span><small>R</small><b>next smaller or equal</b></span></div><p>maximum window size = R − L − 1</p></section>
    <section class="mm1950-metrics"><div><small>current i</small><strong>${current >= 0 ? current : "—"}</strong></div><div><small>nums[i]</small><strong>${currentValue ?? "—"}</strong></div><div><small>L</small><strong>${currentLeft ?? "—"}</strong></div><div><small>R</small><strong>${currentRight ?? "—"}</strong></div><div class="span"><small>max window</small><strong>${currentSpan ?? (activeLength || "—")}</strong></div></section>
    ${comparison}
    <section class="mm1950-cards-wrap"><header><strong>${vi ? "BIÊN CỦA TỪNG INDEX" : "BOUNDARIES FOR EVERY INDEX"}</strong><span>${vi ? "stack tăng dần theo value" : "stack increases by value"}</span></header><div style="--mm1950-count:${Math.max(nums.length, 1)}">${cards}</div></section>
    <section class="mm1950-stack"><header><strong>MONOTONIC INCREASING STACK</strong><span>${vi ? "đáy → đỉnh · index:value" : "bottom → top · index:value"}</span></header><div>${stackHtml}</div><p>${vi ? "Khi top ≥ current, top bị pop và current trở thành biên R của top." : "When top ≥ current, pop top and use current as top's R boundary."}</p></section>
    <section class="mm1950-interval"><header><strong>${vi ? "KHOẢNG MÀ CURRENT LÀ MINIMUM" : "INTERVAL WHERE CURRENT IS THE MINIMUM"}</strong><span>${escapeHtml(rangeTitle)}</span></header><div class="mm1950-range" style="--mm1950-count:${Math.max(nums.length, 1)}">${rangeCells}</div><footer>${boundarySummary}</footer></section>
    <section class="mm1950-buckets"><header><strong>${vi ? "ĐÁP ÁN THEO WINDOW SIZE" : "ANSWER BY WINDOW SIZE"}</strong><span>${vi ? "bucket k nằm tại answer[k−1]" : "bucket k lives at answer[k−1]"}</span></header><div style="--mm1950-count:${Math.max(nums.length, 1)}">${buckets}</div></section>
    <section class="mm1950-fill-rule"><b>${vi ? "VÌ SAO LAN TỪ PHẢI SANG TRÁI?" : "WHY FILL FROM RIGHT TO LEFT?"}</b><span>${vi ? "Minimum hợp lệ cho window dài k+1 cũng là candidate cho một window ngắn k. Do đó answer[k] = max(answer[k], answer[k+1])." : "A minimum valid for a window of length k+1 is also a candidate for a shorter window k. Therefore answer[k] = max(answer[k], answer[k+1])."}</span></section>
    <section class="mm1950-action"><small>${vi ? "PHÉP TÍNH HIỆN TẠI" : "CURRENT CALCULATION"}</small><strong>${escapeHtml(formula)}</strong><span>${escapeHtml(pick(view.explanation))}</span></section>
    <footer class="mm1950-result ${final ? "done" : ""}"><small>WINDOW SIZE 1 → n</small><strong>${final ? `[${answer.join(", ")}]` : "…"}</strong><span>${final ? (vi ? "Mỗi vị trí answer[k−1] là minimum lớn nhất trong mọi window dài k." : "Each answer[k−1] is the largest minimum among all windows of length k.") : (vi ? "Hoàn tất biên, ghi span bucket, rồi backfill." : "Finish boundaries, write span buckets, then backfill.")}</span></footer>
  </section>`;
}

function renderDistinctSubseq940View(step) {
  const view = step.distinctSubseq940View || {};
  const vi = lang === "vi";
  const s = String(view.s || "");
  const chars = [...s];
  const dp = Array.isArray(view.dp) ? view.dp : [];
  const current = Number.isInteger(view.current) ? view.current : -1;
  const previousIndex = Number.isInteger(view.previousIndex) ? view.previousIndex : -1;
  const processedThrough = Number.isInteger(view.processedThrough) ? view.processedThrough : -1;
  const currentChar = view.currentChar || "";
  const oldTotal = Number(view.oldTotal || 0);
  const doubled = Number(view.doubled || 0);
  const duplicateCount = Number(view.duplicateCount || 0);
  const newTotal = Number.isFinite(view.newTotal) ? view.newTotal : null;
  const phaseIndex = Number.isInteger(view.phaseIndex) ? view.phaseIndex : 0;
  const lastCounts = view.lastCounts && typeof view.lastCounts === "object" ? view.lastCounts : {};
  const lastIndices = view.lastIndices && typeof view.lastIndices === "object" ? view.lastIndices : {};
  const phaseLabels = vi
    ? ["Tính cả ∅", "Skip hoặc take", "Loại duplicate", "Lưu / Kết quả"]
    : ["Include ∅", "Skip or take", "Remove duplicates", "Store / Result"];
  const phases = phaseLabels.map((label, index) => `<span class="${index < phaseIndex ? "done" : index === phaseIndex ? "active" : ""}"><b>${index < phaseIndex ? "✓" : index + 1}</b>${escapeHtml(label)}</span>`).join("");

  const formatSubsequence = (value) => value === "" ? "∅" : value;
  const examples = (values, total, emptyText) => {
    const list = Array.isArray(values) ? values : [];
    if (!list.length) return `<p>${escapeHtml(emptyText)}</p>`;
    const hidden = Math.max(0, Number(total || list.length) - list.length);
    return `${list.map((value) => `<span>${escapeHtml(formatSubsequence(value))}</span>`).join("")}${hidden ? `<em>+${hidden} ${vi ? "khác" : "more"}</em>` : ""}`;
  };

  const charCards = chars.map((ch, index) => {
    const classes = ["ds940-char"];
    if (index <= processedThrough) classes.push("processed");
    if (index === previousIndex) classes.push("previous");
    if (index === current) classes.push("current");
    let status = index <= processedThrough ? (vi ? "đã xử lý" : "processed") : (vi ? "chưa đọc" : "unread");
    if (index === previousIndex) status = vi ? "lần trước" : "previous same";
    if (index === current) status = "CURRENT";
    return `<article class="${classes.join(" ")}"><small>index ${index}</small><strong>${escapeHtml(ch)}</strong><span>${escapeHtml(status)}</span></article>`;
  }).join("");

  const dpCells = dp.map((value, index) => `<span class="${index === current + 1 && current >= 0 ? "current" : value != null ? "known" : ""}"><small>dp[${index}]</small><b>${value == null ? "?" : value}</b><em>${index === 0 ? "∅" : escapeHtml(s.slice(0, index))}</em></span>`).join("");
  const lastEntries = Object.entries(lastCounts);
  const lastTable = lastEntries.length
    ? lastEntries.map(([ch, count]) => `<span class="${ch === currentChar ? "current" : ""}"><b>'${escapeHtml(ch)}'</b><strong>${count}</strong><small>${vi ? "trước index" : "before index"} ${lastIndices[ch] ?? "?"}</small></span>`).join("")
    : `<p>${vi ? "Chưa ký tự nào được lưu." : "No character has been stored yet."}</p>`;

  let formula = "total = 1";
  if (view.phase === "read") formula = `previous = ${oldTotal}`;
  if (view.phase === "double") formula = `2 × ${oldTotal} = ${oldTotal * 2}`;
  if (view.phase === "subtract") formula = `${oldTotal * 2} − ${duplicateCount} = ${oldTotal * 2 - duplicateCount}`;
  if (view.phase === "commit") formula = `total = (2 × ${oldTotal} − ${duplicateCount}) mod M = ${newTotal}`;
  if (view.phase === "done") formula = `${oldTotal} − 1 empty = ${newTotal}`;
  const final = view.phase === "done";
  const duplicateTitle = duplicateCount > 0
    ? (vi ? `TRÙNG DO '${currentChar}' TRƯỚC ĐÓ` : `DUPLICATES FROM THE PREVIOUS '${currentChar}'`)
    : (vi ? "KHÔNG CÓ DUPLICATE" : "NO DUPLICATES");
  const rulePanel = final
    ? `<section class="ds940-rule finish"><b>${vi ? "BỎ KẾT QUẢ RỖNG" : "REMOVE THE EMPTY RESULT"}</b><div><span><small>${vi ? "TÍNH CẢ ∅" : "INCLUDING ∅"}</small><strong>${oldTotal}</strong></span><i>−</i><span class="duplicate"><small>EMPTY</small><strong>1</strong></span><i>=</i><span class="result"><small>${vi ? "KHÔNG RỖNG" : "NON-EMPTY"}</small><strong>${newTotal}</strong></span></div><p>answer = (total − 1) mod M</p></section>`
    : `<section class="ds940-rule"><b>${vi ? "MỘT CÔNG THỨC, BA Ý" : "ONE FORMULA, THREE IDEAS"}</b><div><span><small>SKIP</small><strong>${oldTotal}</strong></span><i>+</i><span><small>TAKE '${escapeHtml(currentChar || "?")}'</small><strong>${oldTotal}</strong></span><i>−</i><span class="duplicate"><small>DUPLICATE</small><strong>${duplicateCount}</strong></span><i>=</i><span class="result"><small>NEW TOTAL</small><strong>${newTotal ?? "?"}</strong></span></div><p>new_total = 2 × old_total − last[ch]</p></section>`;
  const metricsPanel = final
    ? `<section class="ds940-metrics final"><div><small>${vi ? "total tính cả ∅" : "total including ∅"}</small><strong>${oldTotal}</strong></div><div class="subtract"><small>empty</small><strong>− 1</strong></div><div class="answer"><small>answer</small><strong>${newTotal}</strong></div></section>`
    : `<section class="ds940-metrics"><div><small>old total</small><strong>${oldTotal || "—"}</strong></div><div><small>after × 2</small><strong>${doubled || "—"}</strong></div><div class="subtract"><small>last['${escapeHtml(currentChar || "?")}']</small><strong>− ${duplicateCount}</strong></div><div class="answer"><small>new total</small><strong>${newTotal ?? "—"}</strong></div></section>`;
  const choicePanel = final ? "" : `<section class="ds940-choice"><header><strong>${vi ? "VÌ SAO NHÂN ĐÔI?" : "WHY DOES THE COUNT DOUBLE?"}</strong><span>${currentChar ? `${vi ? "ký tự hiện tại" : "current character"} '${escapeHtml(currentChar)}'` : "—"}</span></header><div><article><header><b>SKIP</b><span>${view.oldCount || 0} ${vi ? "kết quả giữ nguyên" : "unchanged results"}</span></header><div>${examples(view.oldExamples, view.oldCount, vi ? "Chưa có nhóm skip." : "No skip group yet.")}</div></article><i>+</i><article class="take"><header><b>TAKE</b><span>${view.takeCount || 0} ${vi ? `kết quả nối '${currentChar}'` : `results append '${currentChar}'`}</span></header><div>${examples(view.takeExamples, view.takeCount, vi ? "Chưa đọc ký tự." : "No character has been read.")}</div></article></div></section>`;
  const duplicatePanel = final ? "" : `<section class="ds940-duplicates ${duplicateCount > 0 ? "has-duplicates" : ""}"><header><strong>${escapeHtml(duplicateTitle)}</strong><span>subtract = last['${escapeHtml(currentChar || "?")}'] = ${duplicateCount}</span></header><div>${examples(view.duplicateExamples, duplicateCount, vi ? "Mọi kết quả TAKE đều mới." : "Every TAKE result is new.")}</div><p>${duplicateCount > 0 ? (vi ? `Những chuỗi này đã tồn tại, nên chỉ được đếm một lần.` : "These strings already exist, so each must be counted only once.") : (vi ? "Ký tự chưa xuất hiện trước đó nên không tạo lại kết quả cũ." : "The character has not appeared before, so it recreates no old result.")}</p></section>`;

  $("treeView").innerHTML = `<section class="ds940-viz" role="img" aria-label="Distinct Subsequences II dynamic programming visualization">
    <header><div><small>DYNAMIC PROGRAMMING · #940</small><strong>DISTINCT SUBSEQUENCES II</strong></div><span>${escapeHtml(pick(step.title))}</span></header>
    <div class="ds940-phases">${phases}</div>
    ${rulePanel}${metricsPanel}
    <section class="ds940-string"><header><strong>INPUT STRING</strong><span>${vi ? "xanh lá = đã xử lý · cam = lần giống trước" : "green = processed · amber = previous same character"}</span></header><div style="--ds940-count:${Math.max(chars.length, 1)}">${charCards}</div></section>
    ${choicePanel}${duplicatePanel}
    <section class="ds940-dp"><header><strong>DP BY PREFIX</strong><span>${vi ? "dp[i] có tính cả ∅" : "dp[i] includes ∅"}</span></header><div>${dpCells}</div></section>
    <section class="ds940-last"><header><strong>LAST CONTRIBUTION</strong><span>last[ch] = total ${vi ? "trước lần ch trước" : "before the previous ch"}</span></header><div>${lastTable}</div></section>
    <section class="ds940-distinct"><header><strong>${vi ? "TẬP PHÂN BIỆT HIỆN TẠI" : "CURRENT DISTINCT SET"}</strong><span>${view.distinctCount || 0} ${vi ? "kể cả ∅" : "including ∅"}</span></header><div>${examples(view.distinctExamples, view.distinctCount, vi ? "Chưa có dữ liệu." : "No data yet.")}</div></section>
    <section class="ds940-action"><small>${vi ? "PHÉP TÍNH HIỆN TẠI" : "CURRENT CALCULATION"}</small><strong>${escapeHtml(formula)}</strong><span>${escapeHtml(pick(view.explanation))}</span></section>
    <footer class="ds940-result ${final ? "done" : ""}"><small>${vi ? "ĐÁP ÁN KHÔNG TÍNH ∅" : "ANSWER EXCLUDING ∅"}</small><strong>${final ? newTotal : "…"}</strong><span>${final ? (vi ? `Có ${newTotal} subsequence không rỗng khác nhau trong '${s}'.` : `There are ${newTotal} distinct non-empty subsequences of '${s}'.`) : (vi ? "Tính cả ∅ trong DP; chỉ trừ nó tại dòng return." : "Keep ∅ inside DP and remove it only at return.")}</span></footer>
  </section>`;
}

function renderBstPreorder255View(step) {
  const view = step.bstPreorder255View || {};
  const vi = lang === "vi";
  const preorder = Array.isArray(view.preorder) ? view.preorder : [];
  const stack = Array.isArray(view.stack) ? view.stack : [];
  const accepted = Array.isArray(view.accepted) ? view.accepted : [];
  const history = Array.isArray(view.lowerHistory) ? view.lowerHistory : [];
  const currentPops = Array.isArray(view.currentPops) ? view.currentPops : [];
  const current = Number.isInteger(view.current) ? view.current : -1;
  const compared = Number.isFinite(view.compared) ? view.compared : null;
  const popped = Number.isFinite(view.popped) ? view.popped : null;
  const lower = Number.isFinite(view.lower) ? view.lower : null;
  const currentValue = current >= 0 ? preorder[current] : null;
  const phaseIndex = Number.isInteger(view.phaseIndex) ? view.phaseIndex : 0;
  const labels = vi
    ? ["Hiểu lower bound", "Kiểm tra current", "Pop ancestor", "Push / Kết quả"]
    : ["Understand bound", "Check current", "Pop ancestors", "Push / Result"];
  const phases = labels.map((label, index) => `<span class="${index < phaseIndex ? "done" : index === phaseIndex ? "active" : ""}"><b>${index < phaseIndex ? "✓" : index + 1}</b>${escapeHtml(label)}</span>`).join("");

  const sequence = preorder.map((value, index) => {
    const classes = ["vp255-item"];
    const invalid = view.phase === "reject" && index === current;
    if (accepted.includes(index)) classes.push("accepted");
    if (stack.includes(value)) classes.push("in-stack");
    if (index === current) classes.push("current");
    if (value === compared) classes.push("compared");
    if (value === popped) classes.push("popped");
    if (invalid) classes.push("invalid");
    let status = index > current && current >= 0 ? (vi ? "chưa đọc" : "unread") : (vi ? "đang chờ" : "waiting");
    if (accepted.includes(index)) status = vi ? "đã nhận" : "accepted";
    if (stack.includes(value)) status = "ANCESTOR";
    if (index === current) status = "CURRENT";
    if (value === popped) status = "POPPED";
    if (invalid) status = "INVALID";
    return `<article class="${classes.join(" ")}"><small>index ${index}</small><strong>${value}</strong><span>${escapeHtml(status)}</span></article>`;
  }).join("");

  const stackHtml = stack.length
    ? stack.map((value, index) => `<span class="${index === stack.length - 1 ? "top" : ""}"><small>${index === 0 ? "ROOT / ANCESTOR" : "ANCESTOR"}</small><b>${value}</b>${index === stack.length - 1 ? "<em>TOP</em>" : ""}</span>`).join("<i>→</i>")
    : `<p>${vi ? "Ancestor path đang trống" : "The ancestor path is empty"}</p>`;
  const popsHtml = currentPops.length
    ? currentPops.map((value, index) => `<span><small>POP #${index + 1}</small><b>${value}</b><em>lower = ${value}</em></span>`).join("<i>→</i>")
    : `<p>${vi ? "Current chưa leo qua ancestor nào." : "Current has not climbed past an ancestor."}</p>`;
  const historyHtml = history.length
    ? history.map((item) => `<span class="${item.current === currentValue ? "current" : ""}"><small>${item.current} &gt; ${item.popped}</small><b>lower = ${item.lower}</b></span>`).join("")
    : `<p>${vi ? "lower_bound vẫn là −∞." : "lower_bound is still −∞."}</p>`;

  const passesBound = currentValue == null || lower == null || currentValue > lower;
  const gate = currentValue == null ? "WAIT" : passesBound ? "PASS" : "INVALID";
  const gateHtml = `<section class="vp255-gate ${gate.toLowerCase()}"><div class="forbidden"><small>${vi ? "VÙNG CẤM" : "FORBIDDEN"}</small><strong>${lower == null ? "none yet" : `value ≤ ${lower}`}</strong><span>${vi ? "Không được quay lại left subtree đã đóng" : "Cannot return to a closed left subtree"}</span></div><b>| lower_bound = ${lower ?? "−∞"} |</b><div class="allowed"><small>${vi ? "VÙNG HỢP LỆ" : "ALLOWED"}</small><strong>${lower == null ? "all values" : `value > ${lower}`}</strong><span>${currentValue == null ? "current = —" : `current = ${currentValue} · ${gate}`}</span></div></section>`;

  const showCompare = currentValue != null && compared != null && (view.phase === "compare" || view.phase === "pop");
  const climbs = showCompare && currentValue > compared;
  const compareHtml = showCompare ? `<section class="vp255-compare ${climbs ? "pop" : "stay"}"><div><small>CURRENT</small><strong>${currentValue}</strong></div><b>${climbs ? ">" : "<"}</b><div><small>STACK TOP</small><strong>${compared}</strong></div><p><b>${climbs ? "POP + MOVE RIGHT" : "STOP + MOVE LEFT"}</b><span>${climbs ? (vi ? `Đóng left subtree của ${compared}; lower_bound tăng lên ${popped ?? compared}.` : `Close ${compared}'s left subtree; raise lower_bound to ${popped ?? compared}.`) : (vi ? `${currentValue} vẫn thuộc left subtree của ${compared}.` : `${currentValue} remains in ${compared}'s left subtree.`)}</span></p></section>` : "";
  const isFinal = view.phase === "done" || view.phase === "reject";
  const isValid = view.phase === "done";

  $("treeView").innerHTML = `<section class="vp255-viz" role="img" aria-label="Verify Preorder Sequence in Binary Search Tree visualization">
    <header><div><small>MONOTONIC ANCESTOR STACK · #255</small><strong>VERIFY BST PREORDER</strong></div><span>${escapeHtml(pick(step.title))}</span></header>
    <div class="vp255-phases">${phases}</div>
    <section class="vp255-rule"><b>PREORDER = ROOT → LEFT → RIGHT</b><div><span><small>1</small><strong>${vi ? "Stack giữ ancestor path" : "Stack keeps ancestor path"}</strong></span><i>→</i><span><small>2</small><strong>${vi ? "Pop nghĩa là rẽ phải" : "A pop means move right"}</strong></span><i>→</i><span><small>3</small><strong>${vi ? "Node bị pop thành lower bound" : "Popped node becomes lower bound"}</strong></span></div><p>${vi ? "Sau khi rẽ phải khỏi node x, mọi value về sau bắt buộc phải > x." : "After moving into node x's right subtree, every later value must be greater than x."}</p></section>
    <section class="vp255-metrics"><div><small>input index</small><strong>${current >= 0 ? current : "—"}</strong></div><div><small>current value</small><strong>${currentValue ?? "—"}</strong></div><div class="${gate.toLowerCase()}"><small>lower_bound</small><strong>${lower ?? "−∞"}</strong></div><div><small>stack depth</small><strong>${stack.length}</strong></div></section>
    ${gateHtml}${compareHtml}
    <section class="vp255-sequence"><header><strong>PREORDER SEQUENCE</strong><span>${vi ? "đọc từ trái sang phải" : "read left to right"}</span></header><div style="--vp255-count:${Math.max(preorder.length, 1)}">${sequence}</div></section>
    <section class="vp255-stack"><header><strong>${vi ? "ANCESTOR PATH ĐANG MỞ" : "OPEN ANCESTOR PATH"}</strong><span>${vi ? "root → node gần nhất" : "root → nearest node"}</span></header><div>${stackHtml}</div><p>${vi ? "Đỉnh stack là ancestor đầu tiên current phải so sánh." : "The stack top is the first ancestor compared with current."}</p></section>
    <section class="vp255-climb"><header><strong>${vi ? "CURRENT ĐÃ LEO QUA" : "ANCESTORS CLIMBED BY CURRENT"}</strong><span>${currentValue == null ? "—" : `current ${currentValue}`}</span></header><div>${popsHtml}</div></section>
    <section class="vp255-history"><header><strong>${vi ? "LỊCH SỬ NÂNG LOWER BOUND" : "LOWER-BOUND HISTORY"}</strong><span>${history.length} pop(s)</span></header><div>${historyHtml}</div></section>
    <section class="vp255-action"><small>${vi ? "BƯỚC HIỆN TẠI" : "CURRENT STEP"}</small><strong>${escapeHtml(view.action || "value must stay above lower_bound")}</strong><span>${escapeHtml(pick(view.explanation))}</span></section>
    <footer class="vp255-result ${isFinal ? (isValid ? "valid" : "invalid") : ""}"><small>${vi ? "KẾT QUẢ" : "RESULT"}</small><strong>${isFinal ? (isValid ? "TRUE · VALID PREORDER" : "FALSE · INVALID PREORDER") : "…"}</strong><span>${isFinal ? (isValid ? (vi ? "Mọi value đều nằm đúng phía của lower_bound." : "Every value stayed on the valid side of lower_bound.") : (vi ? `preorder[${current}] = ${currentValue} nhỏ hơn lower_bound ${lower}.` : `preorder[${current}] = ${currentValue} is below lower_bound ${lower}.`)) : (vi ? "Tiếp tục kiểm tra current, ancestor stack và hàng rào." : "Continue checking current, the ancestor stack, and the barrier.")}</span></footer>
  </section>`;
}

function renderTotalStrength2281View(step) {
  const view = step.totalStrength2281View || {};
  const vi = lang === "vi";
  const strength = Array.isArray(view.strength) ? view.strength : [];
  const left = Array.isArray(view.left) ? view.left : [];
  const right = Array.isArray(view.right) ? view.right : [];
  const prefix = Array.isArray(view.prefix) ? view.prefix : [];
  const prefix2 = Array.isArray(view.prefix2) ? view.prefix2 : [];
  const contributions = Array.isArray(view.contributions) ? view.contributions : [];
  const stack = Array.isArray(view.stack) ? view.stack : [];
  const ownedRanges = Array.isArray(view.ownedRanges) ? view.ownedRanges : [];
  const current = Number.isInteger(view.current) ? view.current : -1;
  const compared = Number.isInteger(view.compared) ? view.compared : -1;
  const popped = Number.isInteger(view.popped) ? view.popped : -1;
  const phaseIndex = Number.isInteger(view.phaseIndex) ? view.phaseIndex : 0;
  const phaseLabels = vi
    ? ["Biên trái <", "Biên phải ≤", "Hai prefix", "Contribution", "Kết quả"]
    : ["Left boundary <", "Right boundary ≤", "Two prefixes", "Contribution", "Result"];
  const phases = phaseLabels.map((label, index) => `<span class="${index < phaseIndex ? "done" : index === phaseIndex ? "active" : ""}"><b>${index < phaseIndex ? "✓" : index + 1}</b>${escapeHtml(label)}</span>`).join("");
  const cards = strength.map((value, index) => {
    const classes = ["ts2281-card"];
    if (index === current) classes.push("current");
    if (index === compared) classes.push("compared");
    if (index === popped) classes.push("popped");
    if (stack.includes(index)) classes.push("in-stack");
    if (contributions[index] != null) classes.push("resolved");
    const l = left[index];
    const r = right[index];
    return `<article class="${classes.join(" ")}"><header><small>INDEX</small><strong>${index}</strong></header><div class="ts2281-value"><small>strength</small><b>${value}</b></div><div class="ts2281-bounds"><span><small>left &lt;</small><b>${l == null ? "?" : l}</b></span><span><small>right ≤</small><b>${r == null ? "?" : r}</b></span></div><div class="ts2281-choices"><small>${vi ? "số subarray sở hữu" : "owned subarrays"}</small><b>${l == null || r == null ? "?" : `${index - l}×${r - index}=${(index - l) * (r - index)}`}</b></div><footer><small>contribution</small><strong>${contributions[index] == null ? "?" : contributions[index]}</strong></footer></article>`;
  }).join("");
  const stackHtml = stack.length
    ? stack.map((index, position) => `<span class="${position === stack.length - 1 ? "top" : ""}"><b>i=${index}</b><small>${strength[index]}</small></span>`).join("<i>→</i>")
    : `<em>${vi ? "Stack đang trống" : "The stack is empty"}</em>`;
  const isBoundary = view.phase === "left" || view.phase === "right";
  const hasComparison = isBoundary && current >= 0 && compared >= 0;
  const topValue = hasComparison ? strength[compared] : null;
  const currentValue = current >= 0 ? strength[current] : null;
  const popCondition = view.phase === "left" ? topValue >= currentValue : topValue > currentValue;
  const relation = !hasComparison ? "?" : topValue === currentValue ? "=" : topValue > currentValue ? ">" : "<";
  const actionText = String(view.action || "");
  const isPoppedStep = actionText.includes("POP") || popped >= 0;
  const comparisonHtml = hasComparison ? `<section class="ts2281-compare ${popCondition || isPoppedStep ? "pop" : "keep"}"><div><small>STACK TOP · i=${compared}</small><strong>${topValue}</strong></div><b>${relation}</b><div><small>CURRENT · i=${current}</small><strong>${currentValue}</strong></div><p><b>${popCondition || isPoppedStep ? "POP" : "KEEP"}</b><span>${view.phase === "left" ? (popCondition || isPoppedStep ? (vi ? "Biên trái cần strictly smaller, nên giá trị bằng cũng phải pop." : "The left boundary must be strictly smaller, so equality is popped too.") : (vi ? "Top nhỏ hơn current, đây là candidate biên trái." : "The top is smaller than current, so it is a left-boundary candidate.")) : (popCondition || isPoppedStep ? (vi ? "Biên phải cần smaller-or-equal; chỉ giá trị lớn hơn mới bị pop." : "The right boundary needs smaller-or-equal; only larger values are popped.") : topValue === currentValue ? (vi ? "Giá trị bằng được KEEP làm biên phải để tránh đếm trùng." : "Equality is KEPT as the right boundary to avoid double counting.") : (vi ? "Top nhỏ hơn current nên là candidate biên phải." : "The top is smaller than current, so it is a right-boundary candidate."))}</span></p></section>` : "";
  const prefixCards = Array.from({ length: strength.length + 2 }, (_, index) => `<span class="${index === view.prefixIndex ? "current" : ""}"><small>k=${index}</small><b>P ${index < prefix.length && prefix[index] != null ? prefix[index] : "—"}</b><strong>PP ${prefix2[index] != null ? prefix2[index] : "?"}</strong></span>`).join("");
  const hasOwnedRegion = current >= 0 && left[current] != null && right[current] != null;
  const ownerCells = strength.map((value, index) => {
    const inside = hasOwnedRegion && index > left[current] && index < right[current];
    const classes = [];
    if (inside) classes.push("inside");
    if (index === current) classes.push("owner");
    return `<span class="${classes.join(" ")}"><small>i=${index}</small><b>${value}</b></span>`;
  }).join("");
  const rangeHtml = ownedRanges.length
    ? ownedRanges.map((range) => `<span><small>[${range.start}..${range.end}]</small><b>sum ${range.sum}</b></span>`).join("")
    : `<em>${vi ? "Chọn một wizard ở phase contribution để xem các subarray do nó sở hữu." : "Select a wizard during the contribution phase to see its owned subarrays."}</em>`;
  const rightSums = view.rightSums;
  const leftSums = view.leftSums;
  const ownedSums = view.ownedSums;
  const formulaBlocks = `<div class="positive"><small>${vi ? "KHỐI DƯƠNG" : "POSITIVE BLOCK"}</small><b>${rightSums == null ? "?" : rightSums}</b><span>(PP[R+1] − PP[i+1]) × (i−L)</span></div><i>−</i><div class="negative"><small>${vi ? "KHỐI TRỪ" : "SUBTRACTED BLOCK"}</small><b>${leftSums == null ? "?" : leftSums}</b><span>(PP[i+1] − PP[L+1]) × (R−i)</span></div><i>=</i><div class="owned"><small>${vi ? "TỔNG CÁC SUBARRAY SUM" : "OWNED SUBARRAY SUMS"}</small><b>${ownedSums == null ? "?" : ownedSums}</b><span>${current >= 0 ? `× minimum ${strength[current]}` : "× minimum"}</span></div>`;
  const ledger = contributions.map((value, index) => `<span class="${index === current ? "current" : ""}"><small>i=${index} · min ${strength[index]}</small><b>${value == null ? "?" : `+${value}`}</b></span>`).join("");
  const formula = view.formula || view.action || (vi ? "Tìm hai biên trước, sau đó dùng PP để cộng các subarray sum." : "Find both boundaries, then use PP to sum the owned subarray sums.");
  const final = view.phase === "done";

  $("treeView").innerHTML = `<section class="ts2281-viz" role="img" aria-label="Sum of Total Strength of Wizards visualization">
    <header><div><small>MONOTONIC BOUNDARIES · PREFIX OF PREFIX · #2281</small><strong>SUM OF TOTAL STRENGTH</strong></div><span>${escapeHtml(pick(step.title))}</span></header>
    <div class="ts2281-phases">${phases}</div>
    <section class="ts2281-rule"><b>${vi ? "ĐỔI TỪ DUYỆT SUBARRAY SANG CONTRIBUTION" : "SWITCH FROM SUBARRAYS TO CONTRIBUTIONS"}</b><strong>contribution(i) = strength[i] × Σ sum(subarray owned by i)</strong><span>${vi ? "Biên bất đối xứng left < và right ≤ đảm bảo mỗi subarray có đúng một owner khi minimum bị trùng." : "Asymmetric left < and right ≤ boundaries give every subarray exactly one owner when minima tie."}</span></section>
    <section class="ts2281-metrics"><div><small>${vi ? "wizard hiện tại" : "current wizard"}</small><strong>${current >= 0 ? `i=${current}` : "—"}</strong></div><div><small>minimum value</small><strong>${currentValue == null ? "—" : currentValue}</strong></div><div><small>${vi ? "vùng sở hữu" : "ownership region"}</small><strong>${hasOwnedRegion ? `[${left[current] + 1}..${right[current] - 1}]` : "—"}</strong></div><div class="answer"><small>running answer</small><strong>${view.total ?? 0}</strong></div></section>
    <section class="ts2281-cards-wrap"><header><strong>${vi ? "BIÊN VÀ CONTRIBUTION CỦA TỪNG WIZARD" : "EACH WIZARD'S BOUNDARIES AND CONTRIBUTION"}</strong><span>${vi ? "viền xanh = trong stack · tím = current" : "blue edge = in stack · purple = current"}</span></header><div style="--ts2281-count:${Math.max(strength.length, 1)}">${cards}</div></section>
    <section class="ts2281-stack"><header><strong>${view.phase === "right" ? (vi ? "STACK TÌM NEXT ≤" : "STACK FOR NEXT ≤") : (vi ? "STACK TÌM PREVIOUS <" : "STACK FOR PREVIOUS <")}</strong><span>${vi ? "đáy → đỉnh" : "bottom → top"}</span></header><div>${stackHtml}</div><p>${vi ? "Tie rule: trái pop ≥, phải chỉ pop >. Hai phía không được dùng cùng một dấu." : "Tie rule: the left pass pops ≥, while the right pass pops only >. The two sides must not use the same comparison."}</p></section>
    ${comparisonHtml}
    <section class="ts2281-prefix"><header><div><small>TWO PREFIX ARRAYS</small><strong>P[k] = Σ strength[0..k−1] · PP[k] = Σ P[0..k−1]</strong></div><span>${vi ? "PP cộng một dải P trong O(1)" : "PP sums a range of P in O(1)"}</span></header><div>${prefixCards}</div></section>
    <section class="ts2281-owner"><header><strong>${vi ? "CÁC SUBARRAY DO CURRENT MINIMUM SỞ HỮU" : "SUBARRAYS OWNED BY THE CURRENT MINIMUM"}</strong><span>${hasOwnedRegion ? `${view.leftCount ?? "?"} left × ${view.rightCount ?? "?"} right = ${ownedRanges.length}` : ""}</span></header><div class="ts2281-owner-array" style="--ts2281-count:${Math.max(strength.length, 1)}">${ownerCells}</div><div class="ts2281-ranges">${rangeHtml}</div></section>
    <section class="ts2281-blocks">${formulaBlocks}</section>
    <section class="ts2281-formula"><small>${vi ? "PHÉP TÍNH HIỆN TẠI" : "CURRENT CALCULATION"}</small><strong>${escapeHtml(formula)}</strong><span>${escapeHtml(pick(step.note))}</span></section>
    <section class="ts2281-ledger"><header><strong>${vi ? "SỔ CONTRIBUTION" : "CONTRIBUTION LEDGER"}</strong><span>Σ contribution mod 1,000,000,007</span></header><div>${ledger}</div></section>
    <footer class="ts2281-result ${final ? "done" : ""}"><small>TOTAL STRENGTH OF ALL SUBARRAYS</small><strong>${final ? view.total : "…"}</strong><span>${final ? (vi ? "Mỗi subarray đã được tính đúng một lần qua minimum owner của nó." : "Every subarray has been counted exactly once through its minimum owner.") : (vi ? "Hoàn tất hai biên và hai prefix trước khi cộng contribution." : "Complete both boundaries and both prefixes before adding contributions.")}</span></footer>
  </section>`;
}

function renderVisibleMountains2345View(step) {
  const view = step.visibleMountains2345View || {};
  const vi = lang === "vi";
  const peaks = Array.isArray(view.peaks) ? view.peaks : [];
  const intervals = Array.isArray(view.intervals) ? view.intervals : [];
  const sorted = Array.isArray(view.sorted) ? view.sorted : [];
  const converted = Array.isArray(view.converted) ? view.converted : [];
  const duplicateCounts = Array.isArray(view.duplicateCounts) ? view.duplicateCounts : [];
  const states = Array.isArray(view.states) ? view.states : [];
  const coveredBy = Array.isArray(view.coveredBy) ? view.coveredBy : [];
  const current = Number.isInteger(view.current) ? view.current : -1;
  const phaseIndex = Number.isInteger(view.phaseIndex) ? view.phaseIndex : 0;
  const currentInterval = current >= 0 ? intervals[current] : null;
  const phaseLabels = vi
    ? ["Đổi interval", "Tìm duplicate", "Sort hai biên", "Sweep phủ", "Kết quả"]
    : ["Make intervals", "Find duplicates", "Sort endpoints", "Coverage sweep", "Result"];
  const phases = phaseLabels.map((label, index) => `<span class="${index < phaseIndex ? "done" : index === phaseIndex ? "active" : ""}"><b>${index < phaseIndex ? "✓" : index + 1}</b>${escapeHtml(label)}</span>`).join("");
  const minLeft = intervals.length ? Math.min(...intervals.map((interval) => interval.left)) : 0;
  const maxRight = intervals.length ? Math.max(...intervals.map((interval) => interval.right)) : 1;
  const domainSpan = Math.max(1, maxRight - minLeft);
  const position = (value) => ((value - minLeft) / domainSpan) * 100;
  const stateLabel = (state, index) => {
    if (state === "visible") return vi ? "VISIBLE" : "VISIBLE";
    if (state === "covered") return vi ? `BỊ CHE bởi i=${coveredBy[index]}` : `COVERED by i=${coveredBy[index]}`;
    if (state === "duplicate") return vi ? "TRÙNG · KHÔNG VISIBLE" : "DUPLICATE · NOT VISIBLE";
    return vi ? "chưa sweep" : "not swept";
  };
  const tracks = sorted.map((interval, sortedIndex) => {
    const state = states[interval.index] || "pending";
    const classes = ["vm2345-track", state];
    if (interval.index === current) classes.push("current");
    const left = position(interval.left);
    const width = Math.max(2, position(interval.right) - left);
    const peak = ((interval.x - interval.left) / Math.max(1, interval.right - interval.left)) * 100;
    return `<article class="${classes.join(" ")}"><header><small>SORT #${sortedIndex + 1}</small><b>i=${interval.index}</b><span>peak (${interval.x},${interval.y})</span></header><div class="vm2345-axis"><i class="vm2345-shape" style="left:${left}%;width:${width}%"><b style="left:${peak}%">${interval.y}</b></i><span class="left" style="left:${left}%">${interval.left}</span><span class="right" style="left:${left + width}%">${interval.right}</span></div><footer><code>[${interval.left}, ${interval.right}]</code><strong>${stateLabel(state, interval.index)}</strong></footer></article>`;
  }).join("");
  const cards = intervals.map((interval) => {
    const state = states[interval.index] || "pending";
    const classes = ["vm2345-card", state];
    if (interval.index === current) classes.push("current");
    const duplicateKnown = phaseIndex >= 1;
    return `<article class="${classes.join(" ")}"><header><small>MOUNTAIN</small><strong>i=${interval.index}</strong></header><div><span><small>peak</small><b>(${interval.x},${interval.y})</b></span><span><small>interval</small><b>${converted[interval.index] ? `[${interval.left},${interval.right}]` : "?"}</b></span></div><footer><small>frequency</small><b>${duplicateKnown ? duplicateCounts[interval.index] : "?"}</b><em>${stateLabel(state, interval.index)}</em></footer></article>`;
  }).join("");
  const orderHtml = sorted.map((interval, index) => `<span class="${index === view.sortedPosition ? "current" : ""} ${states[interval.index] || "pending"}"><small>#${index + 1} · i=${interval.index}</small><b>[${interval.left}, ${interval.right}]</b></span>`).join("<i>→</i>");
  const previous = view.previousFarthest;
  const extendsRight = currentInterval && (previous == null || currentInterval.right > previous);
  let decision = extendsRight ? "EXTENDS" : "COVERED";
  if (current >= 0 && duplicateCounts[current] > 1 && String(view.action).includes("DUPLICATE")) decision = "DUPLICATE";
  if (current >= 0 && states[current] === "visible") decision = "VISIBLE";
  const compareHtml = view.phase === "sweep" && currentInterval ? `<section class="vm2345-compare ${decision.toLowerCase()}"><div><small>CURRENT RIGHT</small><strong>${currentInterval.right}</strong></div><b>${extendsRight ? ">" : "≤"}</b><div><small>PREVIOUS farthestRight</small><strong>${previous == null ? "−∞" : previous}</strong></div><p><b>${decision}</b><span>${decision === "COVERED" ? (vi ? `Interval nằm trọn trong mountain i=${view.farthestOwner}.` : `The interval lies completely inside mountain i=${view.farthestOwner}.`) : decision === "DUPLICATE" ? (vi ? "Interval có thể mở rộng biên nhưng mountain giống nhau che phủ lẫn nhau." : "The interval may extend the boundary, but identical mountains cover one another.") : decision === "VISIBLE" ? (vi ? "Interval mở rộng biên và là duy nhất, nên được cộng vào đáp án." : "The interval extends the boundary and is unique, so it is counted.") : (vi ? "Interval chưa bị che; tiếp theo kiểm tra duplicate." : "The interval is not covered; next check whether it is duplicated.")}</span></p></section>` : "";
  const formula = view.formula || view.action || "(x, y) → [x − y, x + y]";
  const final = view.phase === "done";

  $("treeView").innerHTML = `<section class="vm2345-viz" role="img" aria-label="Finding the Number of Visible Mountains visualization">
    <header><div><small>INTERVAL COVERAGE · SORTING · #2345</small><strong>VISIBLE MOUNTAINS</strong></div><span>${escapeHtml(pick(step.title))}</span></header>
    <div class="vm2345-phases">${phases}</div>
    <section class="vm2345-rule"><b>${vi ? "MOUNTAIN TRỞ THÀNH INTERVAL" : "A MOUNTAIN BECOMES AN INTERVAL"}</b><div><span><small>LEFT FOOT</small><strong>x − y</strong></span><i>←</i><span class="peak"><small>PEAK</small><strong>(x, y)</strong></span><i>→</i><span><small>RIGHT FOOT</small><strong>x + y</strong></span></div><p>${vi ? "Mountain A che B khi leftA ≤ leftB và rightB ≤ rightA." : "Mountain A covers B when leftA ≤ leftB and rightB ≤ rightA."}</p></section>
    <section class="vm2345-metrics"><div><small>${vi ? "mountain hiện tại" : "current mountain"}</small><strong>${current >= 0 ? `i=${current}` : "—"}</strong></div><div><small>interval</small><strong>${currentInterval ? `[${currentInterval.left},${currentInterval.right}]` : "—"}</strong></div><div><small>farthestRight</small><strong>${view.farthestRight == null ? "−∞" : view.farthestRight}</strong></div><div class="answer"><small>visible count</small><strong>${view.visible ?? 0}</strong></div></section>
    <section class="vm2345-cards-wrap"><header><strong>${vi ? "PEAK → INTERVAL → TRẠNG THÁI" : "PEAK → INTERVAL → STATUS"}</strong><span>${vi ? "frequency > 1 nghĩa là duplicate" : "frequency > 1 means duplicate"}</span></header><div style="--vm2345-count:${Math.max(intervals.length, 1)}">${cards}</div></section>
    <section class="vm2345-order"><header><strong>${vi ? "THỨ TỰ SWEEP" : "SWEEP ORDER"}</strong><span>left ↑ · right ↓</span></header><div>${orderHtml}</div></section>
    <section class="vm2345-map"><header><strong>${vi ? "BẢN ĐỒ VÙNG PHỦ" : "COVERAGE MAP"}</strong><span>domain [${minLeft}, ${maxRight}]</span></header><div>${tracks}</div></section>
    ${compareHtml}
    <section class="vm2345-formula"><small>${vi ? "BƯỚC HIỆN TẠI" : "CURRENT STEP"}</small><strong>${escapeHtml(formula)}</strong><span>${escapeHtml(pick(step.note))}</span></section>
    <footer class="vm2345-result ${final ? "done" : ""}"><small>${vi ? "SỐ MOUNTAIN VISIBLE" : "VISIBLE MOUNTAINS"}</small><strong>${final ? view.visible : "…"}</strong><span>${final ? (vi ? "Chỉ interval duy nhất và không bị interval trước chứa mới được đếm." : "Only unique intervals not contained by an earlier interval are counted.") : (vi ? "Sort biến bài toán che phủ 2D thành một lần so sánh farthestRight." : "Sorting turns 2D coverage into a single farthestRight comparison.")}</span></footer>
  </section>`;
}

function renderMaximumSumQueries2736View(step) {
  const view = step.maximumSumQueries2736View || {};
  const vi = lang === "vi";
  const nums1 = Array.isArray(view.nums1) ? view.nums1 : [];
  const nums2 = Array.isArray(view.nums2) ? view.nums2 : [];
  const queries = Array.isArray(view.queries) ? view.queries : [];
  const points = Array.isArray(view.points) ? view.points : [];
  const orderedQueries = Array.isArray(view.orderedQueries) ? view.orderedQueries : [];
  const answers = Array.isArray(view.answers) ? view.answers : [];
  const pointStates = Array.isArray(view.pointStates) ? view.pointStates : [];
  const frontier = Array.isArray(view.frontier) ? view.frontier : [];
  const currentQuery = Number.isInteger(view.currentQuery) ? view.currentQuery : -1;
  const currentPoint = Number.isInteger(view.currentPoint) ? view.currentPoint : -1;
  const phaseIndex = Number.isInteger(view.phaseIndex) ? view.phaseIndex : 0;
  const currentQueryData = currentQuery >= 0 ? queries[currentQuery] : null;
  const currentPointData = currentPoint >= 0 ? { a: nums1[currentPoint], b: nums2[currentPoint], sum: nums1[currentPoint] + nums2[currentPoint], index: currentPoint } : null;
  const phaseLabels = vi
    ? ["Sort offline", "Lọc theo x", "Giữ frontier", "Tìm theo y", "Trả kết quả"]
    : ["Offline sort", "Filter by x", "Keep frontier", "Search by y", "Return answers"];
  const phases = phaseLabels.map((label, index) => `<span class="${index < phaseIndex ? "done" : index === phaseIndex ? "active" : ""}"><b>${index < phaseIndex ? "✓" : index + 1}</b>${escapeHtml(label)}</span>`).join("");
  const pointCards = points.map((point, sortedIndex) => {
    const state = pointStates[point.index] || "pending";
    const classes = ["msq2736-point", state];
    if (point.index === currentPoint) classes.push("current");
    return `<article class="${classes.join(" ")}">
      <header><small>SORT #${sortedIndex + 1}</small><strong>i=${point.index}</strong></header>
      <div><span><small>nums1 · a</small><b>${point.a}</b></span><span><small>nums2 · b</small><b>${point.b}</b></span></div>
      <footer><small>a + b</small><strong>${point.sum}</strong></footer>
      <em>${state === "pending" ? (vi ? "chưa kích hoạt" : "pending") : state === "candidate" ? (vi ? "đang xét" : "candidate") : state === "frontier" ? (vi ? "trên frontier" : "on frontier") : (vi ? "bị dominate" : "dominated")}</em>
    </article>`;
  }).join("");
  const queryRank = new Map(orderedQueries.map((query, index) => [query.index, index + 1]));
  const queryCards = queries.map(([x, y], index) => {
    const classes = ["msq2736-query"];
    if (index === currentQuery) classes.push("current");
    if (answers[index] != null) classes.push("answered");
    return `<article class="${classes.join(" ")}"><header><small>OFFLINE #${queryRank.get(index) || "?"}</small><strong>q${index}</strong></header><div><span><small>x</small><b>${x}</b></span><span><small>y</small><b>${y}</b></span></div><footer><small>answer[${index}]</small><strong>${answers[index] == null ? "?" : answers[index]}</strong></footer></article>`;
  }).join("");
  const frontierHtml = frontier.length
    ? frontier.map((entry, index) => `<span class="${index === view.mid ? "mid" : ""} ${index === view.foundPosition ? "found" : ""}"><small>pos ${index} · i=${entry.index}</small><b>b=${entry.b}</b><strong>sum=${entry.sum}</strong></span>`).join("<i>→</i>")
    : `<em>${vi ? "Frontier đang trống" : "The frontier is empty"}</em>`;
  let comparisonHtml = "";
  if (view.phase === "frontier" && currentPointData) {
    const compared = view.comparedEntry;
    const isPop = String(view.action).includes("POP");
    const isDiscard = String(view.action).includes("DISCARD");
    const field = isPop ? "sum" : "b";
    const leftValue = compared ? compared[field] : "empty";
    const rightValue = currentPointData[field];
    const symbol = compared ? (isPop ? "≤" : compared.b < currentPointData.b ? "<" : "≥") : "→";
    const decision = isPop ? "POP" : isDiscard ? "DISCARD" : "APPEND";
    comparisonHtml = `<section class="msq2736-compare ${decision.toLowerCase()}"><div><small>${compared ? `FRONTIER TOP · ${field}` : "FRONTIER"}</small><strong>${leftValue}</strong></div><b>${symbol}</b><div><small>${`CURRENT i=${currentPoint} · ${field}`}</small><strong>${rightValue}</strong></div><p><b>${decision}</b><span>${isPop ? (vi ? "Tổng mới tốt hơn nên point cũ không còn cần thiết." : "The new sum is better, so the old point is no longer needed.") : isDiscard ? (vi ? "Point trên frontier đã có b và sum tốt hơn current." : "A frontier point already has a better b and sum than current.") : (vi ? "Current mở rộng frontier tới ngưỡng b lớn hơn." : "Current extends the frontier to a larger b threshold.")}</span></p></section>`;
  }
  const lo = Number.isInteger(view.lo) ? view.lo : -1;
  const hi = Number.isInteger(view.hi) ? view.hi : -1;
  const mid = Number.isInteger(view.mid) ? view.mid : -1;
  const searchCells = frontier.map((entry, index) => {
    const classes = [];
    if (lo >= 0 && index >= lo && index < hi) classes.push("inside");
    if (index === mid) classes.push("mid");
    if (index === view.foundPosition) classes.push("found");
    return `<span class="${classes.join(" ")}"><small>pos ${index}</small><b>${entry.b}</b><em>sum ${entry.sum}</em></span>`;
  }).join("");
  const searchHtml = `<section class="msq2736-search ${view.phase === "search" ? "active" : ""}"><header><div><small>BINARY SEARCH ON b</small><strong>${currentQueryData ? `first b ≥ y=${currentQueryData[1]}` : (vi ? "Chờ query" : "Waiting for a query")}</strong></div><span>lo ${lo >= 0 ? lo : "—"} · mid ${mid >= 0 ? mid : "—"} · hi ${hi >= 0 ? hi : "—"}</span></header><div>${searchCells || `<em>${vi ? "Chưa có point đủ điều kiện x." : "No point passes the x constraint yet."}</em>`}</div><p>${vi ? "Vì b tăng dần, phần màu xanh là khoảng còn có thể chứa vị trí đầu tiên b ≥ y. Sum trên frontier giảm dần, nên vị trí đầu tiên cũng cho tổng lớn nhất." : "Because b increases, the blue cells are the remaining search range for the first b ≥ y. Frontier sums decrease, so that first position also gives the largest sum."}</p></section>`;
  const formula = view.formula || view.action || (vi ? "Sort theo x để biến điều kiện 2D thành một lần quét + binary search." : "Sort by x to turn the 2D condition into one scan plus binary search.");
  const final = view.phase === "done";

  $("treeView").innerHTML = `<section class="msq2736-viz" role="img" aria-label="Maximum Sum Queries visualization">
    <header><div><small>OFFLINE QUERY · PARETO FRONTIER · #2736</small><strong>MAXIMUM SUM QUERIES</strong></div><span>${escapeHtml(pick(step.title))}</span></header>
    <div class="msq2736-phases">${phases}</div>
    <section class="msq2736-rule"><b>${vi ? "MỖI QUERY LÀ HAI BỘ LỌC" : "EVERY QUERY HAS TWO FILTERS"}</b><div><span><small>FILTER 1</small><strong>a = nums1[i] ≥ x</strong><em>${vi ? "xử lý bằng sort + pointer" : "handled by sort + pointer"}</em></span><i>THEN</i><span><small>FILTER 2</small><strong>b = nums2[i] ≥ y</strong><em>${vi ? "xử lý bằng frontier + binary search" : "handled by frontier + binary search"}</em></span></div></section>
    <section class="msq2736-metrics"><div><small>${vi ? "query hiện tại" : "current query"}</small><strong>${currentQueryData ? `q${currentQuery}` : "—"}</strong></div><div><small>${vi ? "ngưỡng (x,y)" : "threshold (x,y)"}</small><strong>${currentQueryData ? `(${currentQueryData.join(",")})` : "—"}</strong></div><div><small>${vi ? "point đã kích hoạt" : "activated points"}</small><strong>${view.pointCursor ?? 0}/${points.length}</strong></div><div><small>frontier size</small><strong>${frontier.length}</strong></div></section>
    <section class="msq2736-points"><header><strong>${vi ? "POINT ĐÃ SORT THEO nums1 GIẢM DẦN" : "POINTS SORTED BY DESCENDING nums1"}</strong><span>${vi ? "xanh = frontier · đỏ = dominated · tím = current" : "green = frontier · red = dominated · purple = current"}</span></header><div style="--msq2736-count:${Math.max(points.length, 1)}">${pointCards}</div></section>
    <section class="msq2736-queries"><header><strong>${vi ? "QUERY GỐC + THỨ TỰ OFFLINE" : "ORIGINAL QUERIES + OFFLINE ORDER"}</strong><span>${vi ? "answer vẫn ghi về q index gốc" : "answers return to original q indices"}</span></header><div style="--msq2736-query-count:${Math.max(queries.length, 1)}">${queryCards}</div></section>
    <section class="msq2736-frontier"><header><strong>PARETO FRONTIER: b ↑ · sum ↓</strong><span>${vi ? "mỗi point còn lại đều hữu ích" : "every remaining point is useful"}</span></header><div>${frontierHtml}</div></section>
    ${comparisonHtml}
    ${searchHtml}
    <section class="msq2736-formula"><small>${vi ? "BƯỚC HIỆN TẠI" : "CURRENT STEP"}</small><strong>${escapeHtml(formula)}</strong><span>${escapeHtml(pick(step.note))}</span></section>
    <footer class="msq2736-result ${final ? "done" : ""}"><small>ANSWERS IN ORIGINAL QUERY ORDER</small><strong>[${answers.map((answer) => answer == null ? "?" : answer).join(", ")}]</strong><span>${final ? (vi ? "Mỗi kết quả đã được trả về đúng query_index ban đầu." : "Every result has been restored to its original query_index.") : (vi ? "Query được xử lý theo x giảm dần, nhưng vị trí output không đổi." : "Queries are processed by descending x, while output positions stay unchanged.")}</span></footer>
  </section>`;
}

function renderBuildingMeet2940View(step) {
  const view = step.buildingMeet2940View || {};
  const vi = lang === "vi";
  const heights = Array.isArray(view.heights) ? view.heights : [];
  const queries = Array.isArray(view.queries) ? view.queries : [];
  const answers = Array.isArray(view.answers) ? view.answers : [];
  const heap = Array.isArray(view.heap) ? view.heap : [];
  const currentBuilding = Number.isInteger(view.currentBuilding) ? view.currentBuilding : -1;
  const currentQuery = Number.isInteger(view.currentQuery) ? view.currentQuery : -1;
  const visualQueryIndex = currentQuery >= 0 ? currentQuery : (heap[0]?.query ?? -1);
  const activeQuery = visualQueryIndex >= 0 ? queries[visualQueryIndex] : null;
  const maxHeight = Math.max(...heights, 1);
  const phaseIndex = Number.isInteger(view.phaseIndex) ? view.phaseIndex : 0;
  const phaseLabels = vi
    ? ["1. Phân loại query", "2. Quét building →", "3. Heap giải query", "4. Kết quả"]
    : ["1. Classify queries", "2. Scan buildings →", "3. Resolve with heap", "4. Results"];
  const phases = phaseLabels.map((label, index) => `<span class="${index < phaseIndex ? "done" : index === phaseIndex ? "active" : ""}"><b>${index < phaseIndex ? "✓" : index + 1}</b>${escapeHtml(label)}</span>`).join("");

  const canReach = (start, destination) => destination === start || (destination > start && heights[destination] > heights[start]);
  const meeting = activeQuery && Number.isInteger(activeQuery.answer) && activeQuery.answer >= 0
    ? activeQuery.answer
    : -1;
  const buildingCards = heights.map((height, index) => {
    const alice = activeQuery && index === activeQuery.a;
    const bob = activeQuery && index === activeQuery.b;
    const bothCanReach = activeQuery && canReach(activeQuery.a, index) && canReach(activeQuery.b, index);
    const classes = [
      "bm2940-building",
      index === currentBuilding ? "current" : "",
      index < currentBuilding ? "scanned" : "",
      alice ? "alice" : "",
      bob ? "bob" : "",
      bothCanReach ? "reachable" : "",
      index === meeting ? "meeting" : "",
    ].filter(Boolean).join(" ");
    const people = `${alice ? '<i class="alice">A</i>' : ""}${bob ? '<i class="bob">B</i>' : ""}${index === meeting ? '<i class="meet">✓</i>' : ""}` || "<i></i>";
    return `<article class="${classes}"><div class="bm2940-people">${people}</div><div class="bm2940-tower" style="--bm2940-height:${Math.max(16, Math.round((height / maxHeight) * 100))}%"><strong>${height}</strong></div><footer><small>index</small><b>${index}</b></footer></article>`;
  }).join("");

  const stateLabels = vi
    ? { unseen: "chưa xét", waiting: "chờ tới b", heap: "trong heap", answered: "đã có đáp án", unreachable: "không thể gặp" }
    : { unseen: "unseen", waiting: "waiting at b", heap: "in heap", answered: "answered", unreachable: "unreachable" };
  const queryCards = queries.map((query) => {
    const classes = ["bm2940-query", query.state, query.index === visualQueryIndex ? "current" : ""].filter(Boolean).join(" ");
    const decision = query.kind === "same"
      ? (vi ? "cùng vị trí" : "same start")
      : query.kind === "direct"
        ? `${heights[query.left]} < ${heights[query.right]}`
        : query.kind === "offline"
          ? `need height > ${query.threshold}`
          : (vi ? "chưa phân loại" : "not classified");
    return `<article class="${classes}"><header><strong>q${query.index}</strong><span>${escapeHtml(stateLabels[query.state] || query.state)}</span></header><div><span><small>A</small><b>${query.a}</b></span><i>·</i><span><small>B</small><b>${query.b}</b></span><em>→ [${query.left}, ${query.right}]</em></div><p>${escapeHtml(decision)}</p><footer><small>answer[${query.index}]</small><strong>${query.answer == null ? "?" : query.answer}</strong></footer></article>`;
  }).join("");

  const heapCards = heap.length
    ? heap.map((item, index) => `<span class="${index === 0 ? "top" : ""}"><small>${index === 0 ? "MIN / TOP" : `heap ${index}`}</small><b>q${item.query}</b><strong>height &gt; ${item.threshold}</strong></span>`).join("")
    : `<em>${vi ? "Heap đang trống" : "The heap is empty"}</em>`;
  const waitingCount = queries.filter((query) => query.state === "waiting").length;
  const answeredCount = answers.filter((answer) => answer != null).length;
  const topQuery = heap.length ? queries[heap[0].query] : null;
  const comparedQuery = view.comparedQuery >= 0 ? queries[view.comparedQuery] : topQuery;
  const comparison = currentBuilding >= 0 && comparedQuery
    ? `<section class="bm2940-compare ${heights[currentBuilding] > comparedQuery.threshold ? "pass" : "wait"}"><div><small>CURRENT HEIGHT</small><strong>${heights[currentBuilding]}</strong><span>building ${currentBuilding}</span></div><b>${heights[currentBuilding] > comparedQuery.threshold ? ">" : "≤"}</b><div><small>REQUIRED HEIGHT</small><strong>${comparedQuery.threshold}</strong><span>q${comparedQuery.index}</span></div><p>${heights[currentBuilding] > comparedQuery.threshold ? (vi ? "PASS → đây là building gặp nhau trái nhất cho query ở heap." : "PASS → this is the leftmost meeting building for the heap query.") : (vi ? "CHƯA ĐỦ CAO → query tiếp tục nằm trong heap." : "NOT TALL ENOUGH → the query remains in the heap.")}</p></section>`
    : "";
  const formula = view.operation || "k > right and heights[k] > threshold";
  const final = Boolean(view.final);
  const summary = vi
    ? `Bài 2940, đang xử lý ${visualQueryIndex >= 0 ? `query ${visualQueryIndex}` : "các query"}, tại building ${currentBuilding >= 0 ? currentBuilding : "chưa bắt đầu"}.`
    : `Problem 2940, processing ${visualQueryIndex >= 0 ? `query ${visualQueryIndex}` : "queries"} at building ${currentBuilding >= 0 ? currentBuilding : "not started"}.`;

  $("treeView").innerHTML = `<section class="bm2940-viz" role="img" aria-label="${escapeHtml(summary)}">
    <header><div><small>OFFLINE QUERY · MIN-HEAP · #2940</small><strong>LEFTMOST MEETING BUILDING</strong></div><span>${escapeHtml(pick(step.title))}</span></header>
    <div class="bm2940-phases">${phases}</div>
    <section class="bm2940-rule"><b>${vi ? "KHI NÀO ĐI ĐƯỢC?" : "WHEN CAN A PERSON MOVE?"}</b><div><span><small>ĐI SANG PHẢI</small><strong>i &lt; j</strong></span><i>AND</i><span><small>TÒA ĐÍCH CAO HƠN</small><strong>heights[i] &lt; heights[j]</strong></span></div><p>${vi ? "Query khó sau khi chuẩn hóa cần tòa đầu tiên k > b và heights[k] > heights[a]." : "After normalization, a hard query needs the first k > b with heights[k] > heights[a]."}</p></section>
    <section class="bm2940-metrics"><div><small>scan index</small><strong>${currentBuilding >= 0 ? currentBuilding : "—"}</strong></div><div><small>${vi ? "query đang nhìn" : "focused query"}</small><strong>${visualQueryIndex >= 0 ? `q${visualQueryIndex}` : "—"}</strong></div><div><small>${vi ? "đang chờ kích hoạt" : "waiting to activate"}</small><strong>${waitingCount}</strong></div><div><small>heap size</small><strong>${heap.length}</strong></div><div><small>${vi ? "đã trả lời" : "answered"}</small><strong>${answeredCount}/${queries.length}</strong></div></section>
    <section class="bm2940-skyline"><header><strong>${vi ? "DÃY BUILDING" : "BUILDING SKYLINE"}</strong><span>${vi ? "A/B = vị trí bắt đầu · ✓ = nơi gặp" : "A/B = starting positions · ✓ = meeting"}</span></header><div style="--bm2940-count:${Math.max(heights.length, 1)}">${buildingCards}</div></section>
    <section class="bm2940-queries"><header><strong>${vi ? "TRẠNG THÁI CÁC QUERY" : "QUERY STATES"}</strong><span>${vi ? "output luôn theo thứ tự q ban đầu" : "output stays in original query order"}</span></header><div style="--bm2940-query-count:${Math.max(queries.length, 1)}">${queryCards}</div></section>
    <section class="bm2940-heap"><header><strong>MIN-HEAP · REQUIRED HEIGHT</strong><span>${vi ? "threshold nhỏ nhất ở đầu" : "smallest threshold first"}</span></header><div>${heapCards}</div><p>${vi ? "Chỉ query đã đi qua right endpoint mới được vào heap." : "A query enters the heap only after its right endpoint has been passed."}</p></section>
    ${comparison}
    <section class="bm2940-action"><small>${vi ? "BƯỚC HIỆN TẠI" : "CURRENT STEP"}</small><strong>${escapeHtml(formula)}</strong><span>${escapeHtml(pick(step.note))}</span></section>
    <footer class="bm2940-result ${final ? "done" : ""}"><small>ANSWERS IN ORIGINAL QUERY ORDER</small><strong>[${answers.map((answer) => answer == null ? "?" : answer).join(", ")}]</strong><span>${final ? (vi ? "Query còn mắc trong heap nhận -1 vì không còn building nào bên phải." : "Queries left in the heap receive -1 because no buildings remain to the right.") : (vi ? "Mỗi answer được ghi về đúng query index ban đầu." : "Each answer is written back to its original query index.")}</span></footer>
  </section>`;
}

function renderProductExcept238View(step) {
  const view = step.productExcept238View || {};
  const vi = lang === "vi";
  const nums = Array.isArray(view.nums) ? view.nums : [];
  const left = Array.isArray(view.leftProducts) ? view.leftProducts : [];
  const right = Array.isArray(view.rightProducts) ? view.rightProducts : [];
  const answer = Array.isArray(view.answer) ? view.answer : [];
  const current = Number.isInteger(view.currentIndex) ? view.currentIndex : -1;
  const phaseIndex = Number.isInteger(view.phaseIndex) ? view.phaseIndex : 0;
  const phaseLabels = vi
    ? ["1. Tách trái × phải", "2. Prefix trái → phải", "3. Suffix phải → trái", "4. Kết quả"]
    : ["1. Split left × right", "2. Prefix left → right", "3. Suffix right → left", "4. Result"];
  const phases = phaseLabels.map((label, index) => `<span class="${index < phaseIndex ? "done" : index === phaseIndex ? "active" : ""}"><b>${index < phaseIndex ? "✓" : index + 1}</b>${escapeHtml(label)}</span>`).join("");
  const show = (value) => value == null ? "?" : String(value);

  const cards = nums.map((value, index) => {
    const classes = [
      "pes238-card",
      index === current ? "current excluded" : "",
      left[index] != null ? "has-left" : "",
      right[index] != null ? "has-right" : "",
      value === 0 ? "zero" : "",
    ].filter(Boolean).join(" ");
    return `<article class="${classes}">
      <header><small>INDEX</small><strong>${index}</strong></header>
      <div class="pes238-number"><small>nums[i]</small><b>${value}</b><em>${index === current ? (vi ? "BỎ SỐ NÀY" : "EXCLUDE THIS") : ""}</em></div>
      <div class="pes238-parts"><span class="left"><small>LEFT</small><b>${show(left[index])}</b></span><i>×</i><span class="right"><small>RIGHT</small><b>${show(right[index])}</b></span></div>
      <footer><small>answer[${index}]</small><strong>${right[index] == null ? "?" : show(answer[index])}</strong></footer>
    </article>`;
  }).join("");

  const factors = nums.map((value, index) => {
    let side = "neutral";
    if (current >= 0 && index < current) side = "left";
    if (current >= 0 && index > current) side = "right";
    if (index === current) side = "excluded";
    return `<span class="${side}"><small>i=${index}</small><b>${value}</b><em>${side === "left" ? "LEFT" : side === "right" ? "RIGHT" : side === "excluded" ? "×" : ""}</em></span>`;
  }).join("");

  let calculation = "";
  if (current >= 0 && view.direction === "prefix") {
    calculation = `<section class="pes238-calc prefix"><div><small>${vi ? "PREFIX TRƯỚC i" : "PREFIX BEFORE i"}</small><strong>${show(view.runningBefore)}</strong><span>${vi ? `lưu vào LEFT(${current})` : `stored as LEFT(${current})`}</span></div><b>×</b><div class="excluded"><small>nums[${current}]</small><strong>${nums[current]}</strong><span>${vi ? "nhân sau khi lưu" : "multiply after storing"}</span></div><b>=</b><div><small>${vi ? "PREFIX CHO i KẾ" : "PREFIX FOR NEXT i"}</small><strong>${show(view.runningAfter)}</strong><span>${show(view.runningBefore)} × ${nums[current]}</span></div></section>`;
  } else if (current >= 0 && view.direction === "suffix") {
    calculation = `<section class="pes238-calc suffix"><div><small>LEFT(${current})</small><strong>${show(left[current])}</strong><span>${vi ? "đã lưu ở lượt 1" : "saved in pass 1"}</span></div><b>×</b><div><small>RIGHT(${current})</small><strong>${show(right[current])}</strong><span>${vi ? "suffix trước nums[i]" : "suffix before nums[i]"}</span></div><b>=</b><div class="answer"><small>answer[${current}]</small><strong>${show(answer[current])}</strong><span>${vi ? "không chứa nums[i]" : "does not contain nums[i]"}</span></div></section>`;
  }

  const prefixCells = nums.map((_, index) => `<span class="${left[index] != null ? "known" : ""} ${index === current && view.direction === "prefix" ? "current" : ""}"><small>i=${index}</small><b>${show(left[index])}</b></span>`).join("");
  const suffixCells = nums.map((_, index) => `<span class="${right[index] != null ? "known" : ""} ${index === current && view.direction === "suffix" ? "current" : ""}"><small>i=${index}</small><b>${show(right[index])}</b></span>`).join("");
  const resolved = right.filter((value) => value != null).length;
  const final = Boolean(view.final);

  $("treeView").innerHTML = `<section class="pes238-viz" role="img" aria-label="Product of Array Except Self visualization">
    <header><div><small>PREFIX PRODUCT · TWO PASSES · #238</small><strong>PRODUCT EXCEPT SELF</strong></div><span>${escapeHtml(pick(step.title))}</span></header>
    <div class="pes238-phases">${phases}</div>
    <section class="pes238-rule"><b>${vi ? "Ý TƯỞNG CHÍNH TẠI MỖI INDEX i" : "THE CORE IDEA AT EVERY INDEX i"}</b><div><span class="left"><small>${vi ? "TÍCH BÊN TRÁI" : "PRODUCT ON THE LEFT"}</small><strong>nums[0] · … · nums[i−1]</strong></span><i>×</i><span class="right"><small>${vi ? "TÍCH BÊN PHẢI" : "PRODUCT ON THE RIGHT"}</small><strong>nums[i+1] · … · nums[n−1]</strong></span><i>=</i><span class="answer"><small>ANSWER</small><strong>answer[i]</strong></span></div><p>${vi ? "nums[i] không xuất hiện ở vế trái lẫn vế phải, nên tự động bị loại mà không cần phép chia." : "nums[i] appears in neither side, so it is excluded automatically without division."}</p></section>
    <section class="pes238-metrics"><div><small>direction</small><strong>${view.direction === "prefix" ? "LEFT → RIGHT" : view.direction === "suffix" ? "RIGHT → LEFT" : "—"}</strong></div><div><small>${vi ? "index hiện tại" : "current index"}</small><strong>${current >= 0 ? current : "—"}</strong></div><div><small>${vi ? "tích đang chạy" : "running product"}</small><strong>${current >= 0 ? show(view.runningAfter) : "—"}</strong></div><div><small>${vi ? "đáp án hoàn chỉnh" : "completed answers"}</small><strong>${resolved}/${nums.length}</strong></div></section>
    <section class="pes238-factors"><header><strong>${vi ? "SỐ NÀO ĐƯỢC NHÂN CHO INDEX HIỆN TẠI?" : "WHICH VALUES MULTIPLY INTO THE CURRENT INDEX?"}</strong><span>${vi ? "xanh lá = trái · xanh dương = phải · đỏ = bị loại" : "green = left · blue = right · red = excluded"}</span></header><div>${factors}</div></section>
    <section class="pes238-cards-wrap"><header><strong>${vi ? "BẢNG LEFT × RIGHT" : "LEFT × RIGHT TABLE"}</strong><span>${vi ? "mỗi cột tương ứng một index" : "each column represents one index"}</span></header><div style="--pes238-count:${Math.max(nums.length, 1)}">${cards}</div></section>
    <section class="pes238-sweeps"><div><header><strong>PREFIX · LEFT</strong><span>0 → ${Math.max(0, nums.length - 1)}</span></header><div>${prefixCells}</div></div><div><header><strong>SUFFIX · RIGHT</strong><span>${Math.max(0, nums.length - 1)} → 0</span></header><div>${suffixCells}</div></div></section>
    ${calculation}
    <section class="pes238-action"><small>${vi ? "BƯỚC HIỆN TẠI" : "CURRENT STEP"}</small><strong>${escapeHtml(view.expression || "answer[i] = LEFT(i) × RIGHT(i)")}</strong><span>${escapeHtml(pick(step.note))}</span></section>
    <footer class="pes238-result ${final ? "done" : ""}"><small>ANSWER</small><strong>[${answer.map((value, index) => right[index] == null && !final ? "?" : show(value)).join(", ")}]</strong><span>${final ? (vi ? "Hai lượt duyệt, không phép chia, dùng O(1) bộ nhớ phụ ngoài output." : "Two passes, no division, and O(1) auxiliary space beyond the output.") : (vi ? "LEFT được điền trước; RIGHT hoàn tất từng đáp án khi quét ngược." : "LEFT is stored first; RIGHT completes each answer during the reverse pass.")}</span></footer>
  </section>`;
}

function renderUniqueEven3483View(step) {
  const view = step.uniqueEven3483View || {};
  const vi = lang === "vi";
  const digits = Array.isArray(view.digits) ? view.digits : [];
  const numbers = Array.isArray(view.numbers) ? view.numbers : [];
  const phaseIndex = Number.isInteger(view.phaseIndex) ? view.phaseIndex : 0;
  const phaseLabels = vi
    ? ["1. Hàng trăm", "2. Hàng chục", "3. Hàng đơn vị", "4. Thêm vào set", "5. Kết quả"]
    : ["1. Hundreds", "2. Tens", "3. Ones", "4. Add to set", "5. Result"];
  const phases = phaseLabels.map((label, index) => `<span class="${index < phaseIndex ? "done" : index === phaseIndex ? "active" : ""}"><b>${index < phaseIndex ? "✓" : index + 1}</b>${escapeHtml(label)}</span>`).join("");

  const digitCards = digits.map((digit, index) => {
    let role = "";
    let roleLabel = "";
    if (index === view.i) { role = "hundreds"; roleLabel = vi ? "TRĂM" : "HUNDREDS"; }
    else if (index === view.j) { role = "tens"; roleLabel = vi ? "CHỤC" : "TENS"; }
    else if (index === view.k) { role = "ones"; roleLabel = vi ? "ĐƠN VỊ" : "ONES"; }
    const rejected = (view.reason === "leading-zero" && index === view.i)
      || (view.reason === "odd-ones" && index === view.k);
    return `<article class="ue3483-digit ${role} ${rejected ? "rejected" : ""}">
      <small>INDEX ${index}</small><strong>${escapeHtml(digit)}</strong><span>${roleLabel || (vi ? "CHƯA CHỌN" : "AVAILABLE")}</span>
    </article>`;
  }).join("");

  const slot = (name, index, symbol) => {
    const chosen = Number.isInteger(index) && index >= 0 && index < digits.length;
    return `<div class="ue3483-slot ${chosen ? "filled" : "empty"}"><small>${escapeHtml(name)}</small><strong>${chosen ? escapeHtml(digits[index]) : "—"}</strong><span>${chosen ? `digits[${index}]` : symbol}</span></div>`;
  };
  const slots = [
    slot(vi ? "HÀNG TRĂM" : "HUNDREDS", view.i, "× 100"),
    slot(vi ? "HÀNG CHỤC" : "TENS", view.j, "× 10"),
    slot(vi ? "HÀNG ĐƠN VỊ" : "ONES", view.k, "× 1"),
  ].join("<i>+</i>");

  const hasCandidate = Number.isInteger(view.candidate);
  const candidateFormula = hasCandidate
    ? `${digits[view.i]} × 100 + ${digits[view.j]} × 10 + ${digits[view.k]} = ${view.candidate}`
    : (vi ? "Chọn đủ 3 vị trí để tạo ứng viên" : "Choose all 3 places to form a candidate");
  const decisionLabels = {
    intro: vi ? "QUY TẮC" : "RULES",
    choose: vi ? "ĐANG CHỌN" : "CHOOSING",
    reject: vi ? "LOẠI" : "REJECT",
    add: vi ? "THÊM SỐ MỚI" : "ADD NEW NUMBER",
    duplicate: vi ? "TRÙNG — KHÔNG TĂNG COUNT" : "DUPLICATE — COUNT UNCHANGED",
    done: vi ? "HOÀN TẤT" : "COMPLETE",
  };
  const decisionDetails = {
    "leading-zero": vi ? "Hàng trăm bằng 0 → không phải số có 3 chữ số." : "Hundreds digit is 0 → not a three-digit number.",
    "odd-ones": vi ? "Hàng đơn vị lẻ → số tạo được không chẵn." : "The ones digit is odd → the formed number is not even.",
    "already-in-set": vi ? "Số này đã có trong set nên không đếm lại." : "This number is already in the set, so it is not counted again.",
    "new-number": vi ? "Đủ 3 chữ số, không có số 0 đầu và hàng đơn vị chẵn." : "Three digits, no leading zero, and an even ones digit.",
  };
  const decision = String(view.decision || "choose");
  const recentNumbers = numbers.length > 40 ? numbers.slice(-40) : numbers;
  const hiddenCount = numbers.length - recentNumbers.length;
  const setItems = recentNumbers.length
    ? `${hiddenCount > 0 ? `<span class="more">+${hiddenCount} ${vi ? "số trước" : "earlier"}</span>` : ""}${recentNumbers.map((number) => `<span class="${number === view.candidate ? "current" : ""}">${escapeHtml(number)}</span>`).join("")}`
    : `<em>${vi ? "Set đang rỗng" : "The set is empty"}</em>`;
  const final = Boolean(view.final || step.final);

  $("treeView").innerHTML = `<section class="ue3483-viz" role="img" aria-label="Unique three-digit even numbers visualization">
    <header><div><small>ENUMERATION · HASH SET · #3483</small><strong>UNIQUE 3-DIGIT EVEN NUMBERS</strong></div><span>${escapeHtml(pick(step.title))}</span></header>
    <div class="ue3483-phases">${phases}</div>
    <section class="ue3483-rule"><b>${vi ? "BA ĐIỀU KIỆN" : "THREE CONDITIONS"}</b><div><span><strong>1</strong>${vi ? "3 index khác nhau" : "3 different indices"}</span><span><strong>2</strong>${vi ? "hàng trăm ≠ 0" : "hundreds ≠ 0"}</span><span><strong>3</strong>${vi ? "hàng đơn vị chẵn" : "even ones digit"}</span></div></section>
    <section class="ue3483-metrics"><div><small>${vi ? "bộ ba đã thử" : "triples tried"}</small><strong>${view.attempts || 0}</strong></div><div><small>${vi ? "ứng viên chẵn" : "even candidates"}</small><strong>${view.evenCandidates || 0}</strong></div><div><small>${vi ? "ứng viên trùng" : "duplicates"}</small><strong>${view.duplicateCandidates || 0}</strong></div><div class="answer"><small>${vi ? "số khác nhau" : "distinct numbers"}</small><strong>${numbers.length}</strong></div></section>
    <section class="ue3483-digits"><header><strong>${vi ? "CÁC DIGIT TRONG INPUT" : "INPUT DIGITS"}</strong><span>${vi ? "Mỗi thẻ là một index nên các digit giống nhau vẫn là hai bản sao riêng" : "Each card is an index, so equal digits remain separate copies"}</span></header><div>${digitCards}</div></section>
    <section class="ue3483-builder"><div class="ue3483-slots">${slots}</div><code>${escapeHtml(candidateFormula)}</code></section>
    <section class="ue3483-decision ${decision}"><small>${escapeHtml(decisionLabels[decision] || decisionLabels.choose)}</small><strong>${hasCandidate ? escapeHtml(view.candidate) : "—"}</strong><span>${escapeHtml(decisionDetails[view.reason] || pick(step.note))}</span></section>
    <section class="ue3483-set"><header><strong>SET · ${numbers.length}</strong><span>${vi ? "Không chứa phần tử trùng" : "Contains no duplicates"}</span></header><div>${setItems}</div></section>
    <footer class="ue3483-result ${final ? "done" : ""}"><small>ANSWER = len(numbers)</small><strong>${final ? numbers.length : "…"}</strong><span>${final ? (vi ? "Kích thước set là số lượng kết quả phân biệt." : "The set size is the number of distinct results.") : escapeHtml(pick(step.note))}</span></footer>
  </section>`;
}

function renderPourWater755View(step) {
  const view = step.pourWater755View || {};
  const vi = lang === "vi";
  const terrain = Array.isArray(view.terrain) ? view.terrain : [];
  const heights = Array.isArray(view.heights) ? view.heights : [];
  const water = Array.isArray(view.water) ? view.water : [];
  const path = Array.isArray(view.path) ? view.path : [];
  const source = Number.isInteger(view.source) ? view.source : 0;
  const maxHeight = Math.max(1, ...heights);
  const phaseIndex = Number.isInteger(view.phaseIndex) ? view.phaseIndex : 0;
  const phaseLabels = vi
    ? ["1. Thả giọt", "2. Tìm bên trái", "3. Tìm bên phải", "4. Giọt đọng", "5. Kết quả"]
    : ["1. Release drop", "2. Search left", "3. Search right", "4. Settle", "5. Result"];
  const phases = phaseLabels.map((label, index) => `<span class="${index < phaseIndex ? "done" : index === phaseIndex ? "active" : ""}"><b>${index < phaseIndex ? "✓" : index + 1}</b>${escapeHtml(label)}</span>`).join("");
  const pathSet = new Set(path);

  const columns = heights.map((height, index) => {
    const classes = [
      "pw755-column",
      index === source ? "source" : "",
      index === view.current ? "current" : "",
      index === view.best ? "best" : "",
      index === view.candidate ? "candidate" : "",
      pathSet.has(index) ? "path" : "",
      water[index] > 0 ? "wet" : "",
    ].filter(Boolean).join(" ");
    const terrainHeight = Math.max(terrain[index] > 0 ? 7 : 0, Math.round((terrain[index] / maxHeight) * 124));
    const waterHeight = Math.max(water[index] > 0 ? 7 : 0, Math.round(((water[index] || 0) / maxHeight) * 124));
    return `<article class="${classes}">
      <div class="pw755-drop">${index === source ? "💧" : ""}</div>
      <div class="pw755-stack"><i class="water" style="height:${waterHeight}px">${water[index] > 0 ? `<b>+${water[index]}</b>` : ""}</i><i class="earth" style="height:${terrainHeight}px"><b>${terrain[index]}</b></i></div>
      <footer><small>i</small><strong>${index}</strong><span>${height}</span></footer>
    </article>`;
  }).join("");

  const route = path.length
    ? path.map((index, position) => `<span class="${index === view.best ? "best" : ""}"><small>${position === 0 ? "START" : view.direction === "left" ? "←" : "→"}</small><b>i=${index}</b><em>h=${heights[index]}</em></span>`).join("<i>›</i>")
    : `<em>${vi ? "Không còn giọt đang di chuyển." : "No drop is currently moving."}</em>`;
  const hasComparison = Number.isInteger(view.candidate) && view.candidate >= 0 && Number.isInteger(view.compared) && view.compared >= 0;
  const comparison = hasComparison
    ? `<section class="pw755-compare ${view.canMove ? "pass" : "blocked"}"><div><small>${vi ? "CỘT KẾ TIẾP" : "NEXT COLUMN"} · i=${view.candidate}</small><strong>${heights[view.candidate]}</strong></div><b>${view.canMove ? "≤" : ">"}</b><div><small>${vi ? "CỘT VỪA ĐI QUA" : "PREVIOUS COLUMN"} · i=${view.compared}</small><strong>${heights[view.compared]}</strong></div><p><b>${view.canMove ? (vi ? "ĐI ĐƯỢC" : "CAN MOVE") : (vi ? "BỊ CHẶN" : "BLOCKED")}</b><span>${view.canMove ? (vi ? "Giọt không phải leo lên nên có thể tiếp tục." : "The drop does not climb, so it may continue.") : (vi ? "Giọt không thể chảy lên một cột cao hơn." : "The drop cannot flow uphill onto a taller column.")}</span></p></section>`
    : "";
  const totalWater = water.reduce((sum, amount) => sum + amount, 0);
  const final = Boolean(view.final);

  $("treeView").innerHTML = `<section class="pw755-viz" role="img" aria-label="Pour Water simulation, drop ${view.dropNumber || 0} of ${view.volume || 0}">
    <header><div><small>GREEDY SIMULATION · #755</small><strong>POUR WATER</strong></div><span>${escapeHtml(pick(step.title))}</span></header>
    <div class="pw755-phases">${phases}</div>
    <section class="pw755-rule"><b>${vi ? "THỨ TỰ ƯU TIÊN CỦA MỖI GIỌT" : "PRIORITY FOR EACH DROP"}</b><div><span><small>1</small><strong>${vi ? "Chỗ thấp hơn bên trái" : "Lower place on the left"}</strong></span><i>→</i><span><small>2</small><strong>${vi ? "Chỗ thấp hơn bên phải" : "Lower place on the right"}</strong></span><i>→</i><span><small>3</small><strong>${vi ? "Nằm lại tại k" : "Stay at k"}</strong></span></div></section>
    <section class="pw755-metrics"><div><small>${vi ? "giọt hiện tại" : "current drop"}</small><strong>${view.dropNumber || 0}/${view.volume || 0}</strong></div><div><small>source k</small><strong>${source}</strong></div><div><small>direction</small><strong>${String(view.direction || "—").toUpperCase()}</strong></div><div><small>best index</small><strong>${Number.isInteger(view.best) ? view.best : "—"}</strong></div><div><small>${vi ? "nước đã đọng" : "settled water"}</small><strong>${totalWater}</strong></div></section>
    <section class="pw755-terrain"><header><strong>${vi ? "MẶT CẮT ĐỊA HÌNH" : "TERRAIN CROSS-SECTION"}</strong><span>${vi ? "nâu = đất · xanh = nước · viền tím = best" : "brown = terrain · blue = water · purple edge = best"}</span></header><div style="--pw755-count:${Math.max(terrain.length, 1)}">${columns}</div></section>
    <section class="pw755-route"><header><strong>${vi ? "ĐƯỜNG ĐI CỦA GIỌT" : "DROP ROUTE"}</strong><span>${vi ? "best chỉ đổi khi tìm thấy độ cao thấp hơn" : "best changes only at a strictly lower height"}</span></header><div>${route}</div></section>
    ${comparison}
    <section class="pw755-action"><small>${vi ? "BƯỚC HIỆN TẠI" : "CURRENT STEP"}</small><strong>${escapeHtml(view.operation || "release at k")}</strong><span>${escapeHtml(pick(step.note))}</span></section>
    <footer class="pw755-result ${final ? "done" : ""}"><small>FINAL HEIGHTS</small><strong>[${heights.join(", ")}]</strong><span>${final ? (vi ? `Đã đặt đủ ${view.volume} giọt.` : `All ${view.volume} drops have settled.`) : (vi ? "Mỗi lần đọng làm chiều cao tại vị trí đó tăng 1." : "Each settled drop increases that position by one.")}</span></footer>
  </section>`;
}

function renderChampagne799View(step) {
  const view = step.champagne799View || {};
  const vi = lang === "vi";
  const tower = Array.isArray(view.tower) ? view.tower : [];
  const processed = Array.isArray(view.processed) ? view.processed : [];
  const receiving = new Set((view.receiving || []).map((cell) => `${cell[0]}:${cell[1]}`));
  const phaseIndex = Number.isInteger(view.phaseIndex) ? view.phaseIndex : 0;
  const phaseLabels = vi
    ? ["1. Rót vào đỉnh", "2. Xét từng ly", "3. Chia phần tràn", "4. Đọc đáp án"]
    : ["1. Pour at top", "2. Inspect glasses", "3. Split overflow", "4. Read answer"];
  const phases = phaseLabels.map((label, index) => `<span class="${index < phaseIndex ? "done" : index === phaseIndex ? "active" : ""}"><b>${index < phaseIndex ? "✓" : index + 1}</b>${escapeHtml(label)}</span>`).join("");
  const format = (amount) => {
    if (!Number.isFinite(amount)) return "0";
    const rounded = Number(amount.toFixed(3));
    return String(rounded);
  };

  const rows = tower.map((row, rowIndex) => {
    const glasses = row.map((amount, glassIndex) => {
      const fill = Math.max(0, Math.min(100, amount * 100));
      const isCurrent = rowIndex === view.currentRow && glassIndex === view.currentGlass;
      const isQuery = rowIndex === view.queryRow && glassIndex === view.queryGlass;
      const classes = [
        "ct799-glass",
        processed[rowIndex]?.[glassIndex] ? "processed" : "",
        isCurrent ? "current" : "",
        isQuery ? "query" : "",
        receiving.has(`${rowIndex}:${glassIndex}`) ? "receiving" : "",
        amount >= 1 ? "full" : amount > 0 ? "partial" : "empty",
      ].filter(Boolean).join(" ");
      return `<article class="${classes}"><div class="ct799-cup"><i style="height:${fill}%"></i><b>${format(Math.min(1, amount))}</b></div><footer><small>(${rowIndex},${glassIndex})</small><span>raw ${format(amount)}</span></footer></article>`;
    }).join("");
    return `<div class="ct799-row"><small>ROW ${rowIndex}</small><div>${glasses}</div></div>`;
  }).join("");

  const hasCurrent = Number.isInteger(view.currentRow) && view.currentRow >= 0;
  const rawAmount = Number.isFinite(view.rawAmount) ? view.rawAmount : 0;
  const overflow = Number.isFinite(view.overflow) ? view.overflow : 0;
  const calculation = hasCurrent
    ? `<section class="ct799-calc ${overflow > 0 ? "overflow" : "hold"}"><div><small>RAW IN</small><strong>${format(rawAmount)}</strong><span>cup</span></div><b>− 1</b><div><small>${vi ? "PHẦN DƯ" : "EXCESS"}</small><strong>${format(Math.max(0, rawAmount - 1))}</strong><span>cup</span></div><b>÷ 2</b><div><small>${vi ? "MỖI LY CON" : "EACH CHILD"}</small><strong>${format(overflow)}</strong><span>cup</span></div></section>`
    : "";
  const filledCount = tower.flat().filter((amount) => amount >= 1).length;
  const final = Boolean(view.final);
  const shownAnswer = final ? format(view.answer) : "…";

  $("treeView").innerHTML = `<section class="ct799-viz" role="img" aria-label="Champagne Tower visualization for row ${view.queryRow}, glass ${view.queryGlass}">
    <header><div><small>DYNAMIC PROGRAMMING · FLOW SIMULATION · #799</small><strong>CHAMPAGNE TOWER</strong></div><span>${escapeHtml(pick(step.title))}</span></header>
    <div class="ct799-phases">${phases}</div>
    <section class="ct799-rule"><b>${vi ? "MỖI LY CHỈ GIỮ 1 CUP" : "EACH GLASS HOLDS ONE CUP"}</b><div><span><small>RAW AMOUNT</small><strong>tower[r][c]</strong></span><i>→</i><span><small>OVERFLOW TO EACH CHILD</small><strong>max(0, (raw − 1) / 2)</strong></span></div></section>
    <section class="ct799-metrics"><div><small>poured</small><strong>${view.poured ?? 0}</strong></div><div><small>target</small><strong>(${view.queryRow}, ${view.queryGlass})</strong></div><div><small>${vi ? "ly hiện tại" : "current glass"}</small><strong>${hasCurrent ? `(${view.currentRow}, ${view.currentGlass})` : "—"}</strong></div><div><small>${vi ? "ly đầy" : "full glasses"}</small><strong>${filledCount}</strong></div></section>
    <section class="ct799-tower"><header><strong>${vi ? "THÁP CHAMPAGNE" : "CHAMPAGNE TOWER"}</strong><span>${vi ? "viền tím = ly đích · xanh sáng = đang nhận" : "purple edge = target · bright blue = receiving"}</span></header><div>${rows}</div></section>
    ${calculation}
    <section class="ct799-action"><small>${vi ? "BƯỚC HIỆN TẠI" : "CURRENT STEP"}</small><strong>${escapeHtml(view.operation || "tower[0][0] = poured")}</strong><span>${escapeHtml(pick(step.note))}</span></section>
    <footer class="ct799-result ${final ? "done" : ""}"><small>FULLNESS AT (${view.queryRow}, ${view.queryGlass})</small><strong>${shownAnswer}</strong><span>${final ? (vi ? "Kết quả luôn nằm trong đoạn [0, 1]." : "The result is always capped to [0, 1].") : (vi ? "Xử lý xong một hàng trước khi đi xuống hàng tiếp theo." : "Finish one row before moving to the next.")}</span></footer>
  </section>`;
}

function renderMaximizeScore2818View(step) {
  const view = step.maximizeScore2818View || {};
  const vi = lang === "vi";
  const nums = Array.isArray(view.nums) ? view.nums : [];
  const factors = Array.isArray(view.factors) ? view.factors : [];
  const scores = Array.isArray(view.scores) ? view.scores : [];
  const left = Array.isArray(view.left) ? view.left : [];
  const right = Array.isArray(view.right) ? view.right : [];
  const uses = Array.isArray(view.uses) ? view.uses : [];
  const stack = Array.isArray(view.stack) ? view.stack : [];
  const order = Array.isArray(view.order) ? view.order : [];
  const history = Array.isArray(view.greedyHistory) ? view.greedyHistory : [];
  const current = Number.isInteger(view.current) ? view.current : -1;
  const compared = Number.isInteger(view.compared) ? view.compared : -1;
  const popped = Number.isInteger(view.popped) ? view.popped : -1;
  const phaseIndex = Number.isInteger(view.phaseIndex) ? view.phaseIndex : 0;
  const phaseLabels = vi
    ? ["Prime score", "Tìm hai biên", "Đếm subarray", "Chọn greedy", "Kết quả"]
    : ["Prime scores", "Find boundaries", "Count subarrays", "Greedy picks", "Result"];
  const phases = phaseLabels.map((label, index) => `<span class="${index < phaseIndex ? "done" : index === phaseIndex ? "active" : ""}"><b>${index < phaseIndex ? "✓" : index + 1}</b>${escapeHtml(label)}</span>`).join("");
  const usedIndices = new Set(history.map((entry) => entry.index));
  const cards = nums.map((value, index) => {
    const classes = ["ms2818-card"];
    if (index === current) classes.push("current");
    if (index === compared) classes.push("compared");
    if (index === popped) classes.push("popped");
    if (stack.includes(index)) classes.push("in-stack");
    if (usedIndices.has(index)) classes.push("used");
    const knownFactors = Array.isArray(factors[index]);
    const factorText = knownFactors ? (factors[index].length ? `{ ${factors[index].join(", ")} }` : "{ }") : "?";
    return `<article class="${classes.join(" ")}">
      <header><small>INDEX</small><strong>${index}</strong></header>
      <div class="ms2818-value"><small>nums[i]</small><b>${escapeHtml(String(value))}</b></div>
      <div class="ms2818-factors"><small>${vi ? "prime khác nhau" : "distinct primes"}</small><code>${escapeHtml(factorText)}</code></div>
      <div class="ms2818-score"><small>prime score</small><b>${scores[index] == null ? "?" : scores[index]}</b></div>
      <div class="ms2818-bounds"><span><small>left ≥</small><b>${left[index] == null ? "?" : left[index]}</b></span><span><small>right &gt;</small><b>${right[index] == null ? "?" : right[index]}</b></span></div>
      <footer><small>${vi ? "số lần được chọn" : "selection capacity"}</small><b>${uses[index] == null ? "?" : uses[index]}</b></footer>
    </article>`;
  }).join("");
  const stackHtml = stack.length
    ? stack.map((index, position) => `<span class="${position === stack.length - 1 ? "top" : ""}"><b>i=${index}</b><small>score ${scores[index]}</small></span>`).join("<i>→</i>")
    : `<em>${vi ? "Stack đang trống" : "The stack is empty"}</em>`;
  const hasComparison = view.phase === "boundary" && current >= 0 && compared >= 0;
  const topScore = hasComparison ? scores[compared] : null;
  const currentScore = current >= 0 ? scores[current] : null;
  const relation = hasComparison ? (topScore < currentScore ? "<" : topScore === currentScore ? "=" : ">") : "?";
  const willPop = hasComparison && topScore < currentScore;
  const comparisonHtml = hasComparison ? `<section class="ms2818-compare ${willPop ? "pop" : "keep"}">
    <div><small>STACK TOP · i=${compared}</small><strong>${topScore}</strong></div>
    <b>${relation}</b>
    <div><small>CURRENT · i=${current}</small><strong>${currentScore}</strong></div>
    <p><b>${willPop ? "POP" : "KEEP"}</b><span>${willPop ? (vi ? "Current là next strictly-greater prime score của top." : "Current is the top index's next strictly-greater prime score.") : topScore === currentScore ? (vi ? "Bằng nhau nên giữ index bên trái để thắng tie." : "Equal scores stay so the earlier index wins the tie.") : (vi ? "Top mạnh hơn nên current không thể mở rộng qua nó." : "The top is stronger, so current cannot extend past it.")}</span></p>
  </section>` : "";
  const orderHtml = order.map((index, rank) => {
    const used = history.find((entry) => entry.index === index);
    const classes = [];
    if (index === current && view.phase === "greedy") classes.push("current");
    if (used) classes.push("used");
    return `<span class="${classes.join(" ")}"><small>#${rank + 1} · i=${index}</small><b>${nums[index]}</b><em>${uses[index] == null ? "?" : `${uses[index]}×`}</em></span>`;
  }).join("");
  const historyHtml = history.length
    ? history.map((entry, index) => `<div class="${index === history.length - 1 ? "latest" : ""}"><span><small>${vi ? "chọn index" : "pick index"}</small><b>${entry.index}</b></span><span><small>value</small><b>${entry.value}</b></span><span><small>take</small><b>${entry.take}/${entry.capacity}</b></span><code>${entry.answerBefore} × ${entry.value}^${entry.take} = ${entry.answerAfter}</code><span><small>k left</small><b>${entry.kAfter}</b></span></div>`).join("")
    : `<p>${vi ? "Các phép nhân sẽ xuất hiện khi chuyển sang bước greedy." : "Multiplications appear when the greedy phase begins."}</p>`;
  const defaultFormula = view.phase === "prime"
    ? "primeScore(x) = number of distinct prime factors of x"
    : view.phase === "boundary"
      ? "left = previous score ≥ current · right = next score > current"
      : view.phase === "count"
        ? "uses[i] = (i − left[i]) × (right[i] − i)"
        : view.phase === "greedy"
          ? "take = min(k, uses[i]) · answer ×= nums[i]^take"
          : `maximum score = ${view.answer ?? 1}`;
  const formula = view.formula || view.action || defaultFormula;
  const isFinal = view.phase === "done";

  $("treeView").innerHTML = `<section class="ms2818-viz" role="img" aria-label="Apply Operations to Maximize Score visualization">
    <header><div><small>PRIME SCORE · MONOTONIC STACK · GREEDY · #2818</small><strong>APPLY OPERATIONS TO MAXIMIZE SCORE</strong></div><span>${escapeHtml(pick(step.title))}</span></header>
    <div class="ms2818-phases">${phases}</div>
    <section class="ms2818-rule"><b>${vi ? "LUẬT CHỌN TRONG MỘT SUBARRAY" : "SELECTION RULE INSIDE ONE SUBARRAY"}</b><strong>${vi ? "Prime score lớn nhất thắng; nếu hòa, index nhỏ nhất thắng." : "Highest prime score wins; the smallest index wins a tie."}</strong><span>${vi ? "Vì vậy hai dấu ở biên khác nhau: previous ≥ nhưng next >." : "That is why the two boundaries differ: previous ≥ but next >."}</span></section>
    <section class="ms2818-metrics"><div><small>${vi ? "index hiện tại" : "current index"}</small><strong>${current >= 0 ? current : "—"}</strong></div><div><small>prime score</small><strong>${currentScore == null ? "—" : currentScore}</strong></div><div><small>k remaining</small><strong>${view.kRemaining ?? view.kInitial ?? "—"}</strong></div><div class="answer"><small>score product</small><strong>${view.answer ?? 1}</strong></div></section>
    <section class="ms2818-cards-wrap"><header><strong>${vi ? "MỖI INDEX KIỂM SOÁT BAO NHIÊU SUBARRAY?" : "HOW MANY SUBARRAYS DOES EACH INDEX CONTROL?"}</strong><span>${vi ? "tím = current · viền xanh = đang trong stack" : "purple = current · blue edge = in stack"}</span></header><div class="ms2818-cards" style="--ms2818-count:${Math.max(nums.length, 1)}">${cards}</div></section>
    <section class="ms2818-stack"><header><strong>${vi ? "STACK PRIME SCORE KHÔNG TĂNG" : "NON-INCREASING PRIME-SCORE STACK"}</strong><span>${vi ? "đáy → đỉnh" : "bottom → top"}</span></header><div>${stackHtml}</div><p>${vi ? "Chỉ pop khi score(top) < score(current). Dấu bằng phải ở lại để index bên trái thắng tie." : "Pop only when score(top) < score(current). Equality must stay so the earlier index wins the tie."}</p></section>
    ${comparisonHtml}
    <section class="ms2818-formula"><small>${vi ? "PHÉP TÍNH HIỆN TẠI" : "CURRENT CALCULATION"}</small><strong>${escapeHtml(formula)}</strong><span>${escapeHtml(pick(step.note))}</span></section>
    <section class="ms2818-greedy"><header><strong>${vi ? "THỨ TỰ GREEDY THEO VALUE" : "GREEDY ORDER BY VALUE"}</strong><span>${vi ? "mỗi chip: value và số lần tối đa" : "each chip: value and maximum uses"}</span></header><div class="ms2818-order">${orderHtml}</div><div class="ms2818-history">${historyHtml}</div></section>
    <footer class="ms2818-result ${isFinal ? "done" : ""}"><small>MAXIMUM SCORE</small><strong>${isFinal ? view.answer : "…"}</strong><span>${isFinal ? (vi ? `Đã dùng đủ ${view.kInitial} operation.` : `All ${view.kInitial} operations have been used.`) : (vi ? "Hoàn tất prime score và contribution trước khi chọn value." : "Finish prime scores and contributions before selecting values.")}</span></footer>
  </section>`;
}

function renderMinIncrements1526View(step) {
  const view = step.minIncrements1526View || {};
  const vi = lang === "vi";
  const target = Array.isArray(view.target) ? view.target : [];
  const contributions = Array.isArray(view.contributions) ? view.contributions : [];
  const current = Number.isInteger(view.current) ? view.current : -1;
  const previous = Number.isFinite(view.previous) ? view.previous : 0;
  const delta = Number.isFinite(view.delta) ? view.delta : 0;
  const operations = Array.isArray(view.operations) ? view.operations : [];
  const phaseIndex = Number.isInteger(view.phaseIndex) ? view.phaseIndex : 0;
  const phaseLabels = vi
    ? ["Hiểu operation", "So với bên trái", "Mở layer mới", "Kết quả"]
    : ["Understand operation", "Compare with left", "Open new layers", "Result"];
  const phases = phaseLabels.map((label, index) => `<span class="${index < phaseIndex ? "done" : index === phaseIndex ? "active" : ""}"><b>${index < phaseIndex ? "✓" : index + 1}</b>${escapeHtml(label)}</span>`).join("");
  const maxHeight = Math.max(1, ...target);
  const bars = target.map((value, index) => {
    const isProcessed = contributions[index] != null;
    const layers = Array.from({ length: maxHeight }, (_, offset) => {
      const level = maxHeight - offset;
      const filled = level <= value;
      const newLayer = index === current && filled && level > previous;
      return `<i class="${filled ? "filled" : ""} ${isProcessed ? "known" : ""} ${newLayer ? "new" : ""}">${filled ? level : ""}</i>`;
    }).join("");
    const classes = ["mi1526-bar"];
    if (index === current) classes.push("current");
    if (isProcessed) classes.push("processed");
    return `<article class="${classes.join(" ")}"><header><small>index</small><strong>${index}</strong></header><div class="mi1526-layers">${layers}</div><footer><small>target</small><b>${value}</b></footer></article>`;
  }).join("");
  const activeLayers = current >= 0
    ? Array.from({ length: target[current] }, (_, offset) => {
      const level = offset + 1;
      const isNew = level > previous;
      return `<span class="${isNew ? "new" : "continue"}"><b>L${level}</b><small>${isNew ? (vi ? `bắt đầu tại i=${current}` : `starts at i=${current}`) : (vi ? "kéo dài từ trái" : "continues from left")}</small></span>`;
    }).join("") || `<em>${vi ? "Không có layer nào tại index này." : "There are no layers at this index."}</em>`
    : `<em>${vi ? "Chọn một index để xem các layer." : "Select an index to inspect its layers."}</em>`;
  let running = 0;
  const contributionsHtml = target.map((_, index) => {
    const value = contributions[index];
    const known = Number.isInteger(value);
    if (known) running += value;
    return `<div class="${index === current ? "current" : ""}"><small>i = ${index}</small><b>${known ? (value > 0 ? `+${value}` : "+0") : "?"}</b><span>${known ? `sum = ${running}` : ""}</span></div>`;
  }).join("");
  const comparisonHtml = current >= 0 ? `<section class="mi1526-compare ${delta > 0 ? "rise" : "reuse"}">
    <div><small>${current === 0 ? (vi ? "CHIỀU CAO BAN ĐẦU" : "STARTING HEIGHT") : `target[${current - 1}]`}</small><strong>${previous}</strong></div>
    <b>${delta > 0 ? "<" : "≥"}</b>
    <div><small>target[${current}]</small><strong>${target[current]}</strong></div>
    <p><b>${delta > 0 ? `+${delta}` : "+0"}</b><span>${delta > 0 ? (vi ? "layer mới phải bắt đầu tại đây" : "new layer(s) must start here") : (vi ? "layer cũ đủ dùng; có thể kết thúc layer dư" : "old layers are enough; extra layers may end")}</span></p>
  </section>` : "";
  const knownOperations = operations.filter((operation) => operation.known);
  const operationsHtml = knownOperations.length
    ? knownOperations.map((operation) => `<article class="mi1526-operation ${operation.active ? "active" : ""}">
      <header><small>OP ${operation.index + 1}</small><strong>+1 · [${operation.start}..${operation.end}]</strong><span>layer ${operation.level}</span></header>
      <div style="--mi1526-count:${Math.max(target.length, 1)}">${target.map((value, index) => `<i class="${index >= operation.start && index <= operation.end ? "inside" : "outside"}"><small>${index}</small><b>${index >= operation.start && index <= operation.end ? "+1" : "·"}</b></i>`).join("")}</div>
    </article>`).join("")
    : `<p>${vi ? "Các operation cụ thể sẽ xuất hiện khi một layer mới được mở." : "Concrete operations appear as each new layer is opened."}</p>`;
  const formula = current === 0 && view.phase === "init"
    ? `answer = target[0] = ${target[0]}`
    : view.phase === "add"
      ? `answer = ${view.answer - delta} + (${target[current]} − ${previous}) = ${view.answer}`
      : view.phase === "check" && current >= 0
        ? delta > 0 ? `target[${current}] − target[${current - 1}] = ${target[current]} − ${previous} = +${delta}` : `target[${current}] ≤ target[${current - 1}] → +0 new layers`
        : view.action || (vi ? "Các layer hiện có có thể tiếp tục sang phải." : "Existing layers can continue to the right.");
  const final = view.phase === "done";

  $("treeView").innerHTML = `<section class="mi1526-viz" role="img" aria-label="Minimum Number of Increments visualization">
    <header><div><small>GREEDY · LAYER COUNTING · #1526</small><strong>MINIMUM SUBARRAY INCREMENTS</strong></div><span>${escapeHtml(pick(step.title))}</span></header>
    <div class="mi1526-phases">${phases}</div>
    <section class="mi1526-rule"><b>${vi ? "QUY TẮC GREEDY" : "GREEDY RULE"}</b><strong>answer = target[0] + Σ max(0, target[i] − target[i−1])</strong><span>${vi ? "Layer cũ được kéo dài qua i miễn là target[i] không đòi hỏi chiều cao lớn hơn target[i−1]." : "Old layers extend through i as long as target[i] does not demand more height than target[i−1]."}</span></section>
    <section class="mi1526-metrics"><div><small>i</small><strong>${current >= 0 ? current : "—"}</strong></div><div><small>previous height</small><strong>${current >= 0 ? previous : "—"}</strong></div><div><small>target[i]</small><strong>${current >= 0 ? target[current] : "—"}</strong></div><div class="delta ${delta > 0 ? "rise" : ""}"><small>new layers</small><strong>${current >= 0 ? (delta > 0 ? `+${delta}` : "+0") : "—"}</strong></div><div class="answer"><small>answer</small><strong>${view.answer ?? 0}</strong></div></section>
    <section class="mi1526-chart"><header><strong>${vi ? "CÁC LAYER CỦA TARGET" : "TARGET LAYERS"}</strong><span>${vi ? "xanh lá = layer mới ở index hiện tại · tím = index đang xét" : "green = new layer at current index · purple = current index"}</span></header><div class="mi1526-bars" style="--mi1526-count:${Math.max(target.length, 1)}">${bars}</div></section>
    ${comparisonHtml}
    <section class="mi1526-active"><header><strong>${vi ? `LAYER ĐANG PHỦ INDEX ${current >= 0 ? current : "—"}` : `LAYERS COVERING INDEX ${current >= 0 ? current : "—"}`}</strong><span>${current >= 0 ? `${target[current]} ${vi ? "layer" : "layer(s)"}` : ""}</span></header><div>${activeLayers}</div></section>
    <section class="mi1526-contributions"><header><strong>${vi ? "ĐÓNG GÓP VÀO ĐÁP ÁN" : "ANSWER CONTRIBUTIONS"}</strong><span>${vi ? "chỉ positive rise mới làm tổng tăng" : "only positive rises increase the total"}</span></header><div>${contributionsHtml}</div></section>
    <section class="mi1526-plan"><header><strong>${vi ? "CÁC OPERATION SUBARRAY ĐÃ MỞ" : "OPENED SUBARRAY OPERATIONS"}</strong><span>${knownOperations.length}/${view.answer ?? 0} ${vi ? "operation đang được tính" : "counted operations"}</span></header><div>${operationsHtml}</div></section>
    <section class="mi1526-formula"><small>${vi ? "PHÉP TÍNH HIỆN TẠI" : "CURRENT CALCULATION"}</small><strong>${escapeHtml(formula)}</strong><span>${escapeHtml(pick(step.note))}</span></section>
    <footer class="mi1526-result ${final ? "done" : ""}"><small>${vi ? "SỐ OPERATION ÍT NHẤT" : "MINIMUM OPERATIONS"}</small><strong>${final ? view.answer : "…"}</strong><span>${final ? (vi ? "Mỗi layer mới tương ứng với đúng một operation subarray phải mở thêm." : "Every new layer corresponds to exactly one additional subarray operation.") : (vi ? "Đếm layer mới tại mỗi rise để hoàn tất đáp án." : "Count new layers at each rise to complete the answer.")}</span></footer>
  </section>`;
}

function renderCarFleet1776View(step) {
  const view = step.carFleet1776View || {};
  const vi = lang === "vi";
  const cars = Array.isArray(view.cars) ? view.cars : [];
  const answer = Array.isArray(view.answer) ? view.answer : [];
  const resolved = Array.isArray(view.resolved) ? view.resolved : [];
  const stack = Array.isArray(view.stack) ? view.stack : [];
  const current = Number.isInteger(view.current) ? view.current : -1;
  const candidate = Number.isInteger(view.candidate) ? view.candidate : -1;
  const potential = Number.isFinite(view.potential) && view.potential >= 0 ? view.potential : -1;
  const phaseIndex = Number.isInteger(view.phaseIndex) ? view.phaseIndex : 0;
  const phaseLabels = vi ? ["Khởi tạo", "Lọc fleet bằng stack", "Collision time"] : ["Initialize", "Filter fleets with stack", "Collision times"];
  const phases = phaseLabels.map((label, index) => `<span class="${index < phaseIndex ? "done" : index === phaseIndex ? "active" : ""}"><b>${index < phaseIndex ? "✓" : index + 1}</b>${escapeHtml(label)}</span>`).join("");
  const timeText = (value) => value < 0 || !Number.isFinite(value) ? "−1" : Number(value.toFixed(3)).toString();
  const positions = cars.map(([position]) => position);
  const minPosition = positions.length ? Math.min(...positions) : 0;
  const maxPosition = positions.length ? Math.max(...positions) : minPosition + 1;
  const span = Math.max(1, maxPosition - minPosition);
  const roadCars = cars.map(([position, speed], index) => {
    const left = 4 + ((position - minPosition) / span) * 92;
    const classes = ["cf1776-road-car"];
    if (index === current) classes.push("current");
    if (index === candidate) classes.push("candidate");
    if (stack.includes(index)) classes.push("in-stack");
    return `<div class="${classes.join(" ")}" style="left:${left.toFixed(2)}%"><b>C${index}</b><small>p ${position} · v ${speed}</small></div>`;
  }).join("");
  const carCards = cars.map(([position, speed], index) => {
    const classes = ["cf1776-car-card"];
    if (index === current) classes.push("current");
    if (index === candidate) classes.push("candidate");
    if (stack.includes(index)) classes.push("in-stack");
    if (resolved[index]) classes.push(answer[index] >= 0 ? "will-hit" : "no-hit");
    const collision = resolved[index] ? timeText(answer[index]) : "?";
    return `<article class="${classes.join(" ")}"><header><small>CAR</small><strong>C${index}</strong></header><div><small>position</small><b>${position}</b></div><div><small>speed</small><b>${speed}</b></div><footer><small>${vi ? "collision time" : "collision time"}</small><b>${collision}</b></footer></article>`;
  }).join("");
  const stackHtml = stack.length
    ? stack.map((index) => `<span class="${index === candidate ? "top" : ""}"><b>C${index}</b><small>p=${cars[index][0]} · v=${cars[index][1]}</small></span>`).join("<i>→</i>")
    : `<em>${vi ? "Stack trống" : "Stack is empty"}</em>`;
  const reasonText = view.reason === "too-slow"
    ? (vi ? `speed(C${current}) ≤ speed(C${candidate}): không thể bắt kịp → pop candidate.` : `speed(C${current}) ≤ speed(C${candidate}): cannot catch → pop candidate.`)
    : view.reason === "candidate-collides-first"
      ? (vi ? `C${candidate} va chạm ở t=${timeText(answer[candidate])} trước khi C${current} tới ở t=${timeText(potential)} → pop.` : `C${candidate} collides at t=${timeText(answer[candidate])} before C${current} arrives at t=${timeText(potential)} → pop.`)
      : view.reason === "valid"
        ? (vi ? `C${candidate} vẫn tồn tại đến t=${timeText(potential)} → đây là fleet va chạm đầu tiên.` : `C${candidate} still exists at t=${timeText(potential)} → it is the first collision fleet.`)
        : view.reason === "collision"
          ? (vi ? `C${current} bắt C${candidate} tại t=${timeText(potential)}.` : `C${current} catches C${candidate} at t=${timeText(potential)}.`)
          : view.reason === "continue"
            ? (vi ? "Tiếp tục kiểm tra candidate kế tiếp trên stack." : "Continue with the next stack candidate.")
            : (view.reason || (vi ? "Quét từ phải sang trái để fleet phía trước được giải trước." : "Scan right-to-left so front fleets are solved first."));
  const decisionClass = ["too-slow", "candidate-collides-first"].includes(view.reason) ? "reject" : ["valid", "collision"].includes(view.reason) ? "accept" : "";
  const answerRows = cars.map((_, index) => `<div class="${index === current ? "current" : ""}"><small>C${index}</small><b>${resolved[index] ? timeText(answer[index]) : "?"}</b><span>${resolved[index] ? (answer[index] < 0 ? (vi ? "không va chạm" : "no collision") : `t = ${timeText(answer[index])}`) : (vi ? "chưa xử lý" : "pending")}</span></div>`).join("");
  const final = view.phase === "done";

  $("treeView").innerHTML = `<section class="cf1776-viz" role="img" aria-label="Car Fleet II visualization">
    <header><div><small>MONOTONIC STACK · COLLISION TIMES · #1776</small><strong>CAR FLEET II</strong></div><span>${escapeHtml(pick(step.title))}</span></header>
    <div class="cf1776-phases">${phases}</div>
    <section class="cf1776-rule"><b>${vi ? "QUY TẮC LOẠI CANDIDATE" : "CANDIDATE ELIMINATION RULE"}</b><strong>pop j if speed[i] ≤ speed[j]  OR  catch(i,j) ≥ answer[j]</strong><span>${vi ? "Candidate bị loại khi không thể bị bắt kịp, hoặc nó nhập fleet khác trước khi xe hiện tại tới." : "Discard a candidate when it cannot be caught, or when it joins another fleet before the current car reaches it."}</span></section>
    <section class="cf1776-road"><header><strong>${vi ? "ĐƯỜNG: POSITION TĂNG SANG PHẢI" : "ROAD: POSITION INCREASES TO THE RIGHT"}</strong><span>${vi ? "tím = current · cam = candidate · xanh = trong stack" : "purple = current · amber = candidate · blue = in stack"}</span></header><div class="cf1776-road-line"><i></i>${roadCars}</div></section>
    <section class="cf1776-metrics"><div><small>current car</small><strong>${current >= 0 ? `C${current}` : "—"}</strong></div><div><small>candidate</small><strong>${candidate >= 0 ? `C${candidate}` : "—"}</strong></div><div><small>potential catch</small><strong>${potential >= 0 ? `t = ${timeText(potential)}` : "—"}</strong></div><div><small>stack size</small><strong>${stack.length}</strong></div></section>
    <section class="cf1776-stack"><header><strong>${vi ? "STACK FLEET CÒN ỨNG VIÊN" : "STACK OF REMAINING FLEET CANDIDATES"}</strong><span>${vi ? "đáy → đỉnh" : "bottom → top"}</span></header><div>${stackHtml}</div></section>
    <section class="cf1776-cars"><header><strong>${vi ? "TRẠNG THÁI TỪNG XE" : "CAR STATES"}</strong><span>${vi ? "t = thời điểm va chạm đầu tiên" : "t = first collision time"}</span></header><div class="cf1776-car-grid" style="--cf1776-count:${Math.max(cars.length, 1)}">${carCards}</div></section>
    <section class="cf1776-decision ${decisionClass}"><small>${vi ? "QUYẾT ĐỊNH HIỆN TẠI" : "CURRENT DECISION"}</small><strong>${escapeHtml(reasonText)}</strong><span>${escapeHtml(pick(step.note))}</span></section>
    <section class="cf1776-answer"><header><strong>${vi ? "ANSWER THEO CAR" : "ANSWER BY CAR"}</strong><span>${vi ? "−1 = không va chạm" : "−1 = no collision"}</span></header><div>${answerRows}</div></section>
    <footer class="cf1776-result ${final ? "done" : ""}"><small>${vi ? "KẾT QUẢ" : "RESULT"}</small><strong>${final ? `[${answer.map(timeText).join(", ")}]` : "…"}</strong><span>${final ? (vi ? "Mỗi giá trị là collision time đầu tiên, làm tròn để hiển thị." : "Each value is the first collision time, rounded for display.") : (vi ? "Từng collision time được xác định khi quét ngược qua các xe." : "Collision times are resolved while scanning backward through the cars.")}</span></footer>
  </section>`;
}

function renderCriticalPoints2058View(step) {
  const view = step.criticalPoints2058View || {};
  const vi = lang === "vi";
  const values = Array.isArray(view.values) ? view.values : [];
  const points = Array.isArray(view.points) ? view.points : [];
  const pointByIndex = new Map(points.map((point) => [point.index, point]));
  const current = Number.isInteger(view.current) ? view.current : -1;
  const debugLine = Number(view.debugLine);
  const hasDebugLine = Number.isInteger(debugLine) && debugLine > 0;
  let pointerPrev = current > 0 ? current - 1 : -1;
  let pointerCurr = current;
  let pointerNext = current > 0 && current < values.length - 1 ? current + 1 : -1;

  if (hasDebugLine && view.phase === "rule") {
    pointerPrev = debugLine >= 3 ? 0 : -1;
    pointerCurr = debugLine >= 4 ? 1 : -1;
    pointerNext = -1;
  } else if (hasDebugLine && debugLine === 11) {
    pointerNext = -1;
  } else if (hasDebugLine && debugLine === 31) {
    pointerPrev = current;
    pointerCurr = current;
  } else if (hasDebugLine && (debugLine === 32 || debugLine === 33)) {
    pointerPrev = current;
    pointerCurr = current >= 0 && current + 1 < values.length ? current + 1 : -1;
    pointerNext = -1;
  }

  const comparison = !hasDebugLine || (debugLine >= 14 && debugLine <= 29)
    ? view.comparison
    : null;
  const phaseGroup = view.phase === "rule"
    ? "rule"
    : view.phase === "inspect" || view.phase === "move"
      ? "inspect"
      : view.phase === "record"
        ? "record"
        : view.phase === "distance"
          ? "distance"
          : "result";
  const phaseHtml = [
    ["rule", vi ? "1. Quy tắc" : "1. Rule"],
    ["inspect", vi ? "2. Xét bộ ba" : "2. Inspect triple"],
    ["record", vi ? "3. Lưu critical" : "3. Save critical"],
    ["distance", vi ? "4. Tính khoảng cách" : "4. Update distances"],
    ["result", vi ? "5. Kết quả" : "5. Result"],
  ].map(([key, label]) => `<span class="${phaseGroup === key ? "active" : ""}">${label}</span>`).join("");

  const listHtml = values.map((value, index) => {
    const point = pointByIndex.get(index);
    const roles = [];
    if (index === pointerPrev) roles.push("prev");
    if (index === pointerCurr) roles.push("curr");
    if (index === pointerNext) roles.push("next");
    const isCandidate = index === current && comparison && comparison.isCritical && !point;
    const classes = ["cp2058-node"];
    if (index <= Number(view.inspectedThrough)) classes.push("seen");
    if (roles.length) classes.push("in-window");
    if (index === pointerCurr) classes.push("current");
    if (point) classes.push("critical", point.type);
    if (isCandidate) classes.push("candidate", comparison.type);
    if (index === view.newCritical) classes.push("new-critical");

    let label = vi ? "node thường" : "normal node";
    if (index === 0) label = "HEAD";
    if (index === values.length - 1) label = "TAIL";
    if (point) label = `C${point.order} · ${point.type.toUpperCase()}`;
    if (isCandidate) label = vi ? `${comparison.type.toUpperCase()} · sắp lưu` : `${comparison.type.toUpperCase()} · save next`;

    const node = `<div class="cp2058-node-wrap">
      <div class="cp2058-pointer-slot">${roles.map((role) => `<span class="${role}">${role}</span>`).join("")}</div>
      <div class="${classes.join(" ")}">
        <small>index ${index}</small>
        <strong>${escapeHtml(String(value))}</strong>
        <span>${escapeHtml(label)}</span>
      </div>
    </div>`;
    return index < values.length - 1 ? `${node}<b class="cp2058-next" aria-hidden="true">→</b>` : node;
  }).join("");

  let comparisonHtml;
  if (comparison) {
    const verdict = comparison.isPeak
      ? (vi ? "PEAK: lớn hơn cả hai bên" : "PEAK: greater than both sides")
      : comparison.isValley
        ? (vi ? "VALLEY: nhỏ hơn cả hai bên" : "VALLEY: smaller than both sides")
        : (vi ? "KHÔNG CRITICAL: không thỏa cả hai quy tắc" : "NOT CRITICAL: neither rule passes");
    comparisonHtml = `<div class="cp2058-triple">
        <span><small>prev</small><strong>${comparison.left}</strong></span>
        <b>←</b>
        <span class="curr"><small>curr</small><strong>${comparison.current}</strong></span>
        <b>→</b>
        <span><small>next</small><strong>${comparison.right}</strong></span>
      </div>
      <div class="cp2058-tests">
        <div class="${comparison.isPeak ? "pass" : "fail"}"><span>PEAK</span><code>${comparison.current} &gt; ${comparison.left} AND ${comparison.current} &gt; ${comparison.right}</code><strong>${comparison.isPeak ? "TRUE" : "FALSE"}</strong></div>
        <div class="${comparison.isValley ? "pass valley" : "fail"}"><span>VALLEY</span><code>${comparison.current} &lt; ${comparison.left} AND ${comparison.current} &lt; ${comparison.right}</code><strong>${comparison.isValley ? "TRUE" : "FALSE"}</strong></div>
      </div>
      <div class="cp2058-verdict ${comparison.type}"><strong>${escapeHtml(verdict)}</strong><span>${comparison.isCritical ? (vi ? "Node curr là critical point." : "The curr node is a critical point.") : (vi ? "Bỏ qua node curr và dịch cửa sổ." : "Skip curr and slide the window.")}</span></div>`;
  } else if (view.phase === "result") {
    comparisonHtml = `<div class="cp2058-no-comparison done"><strong>${vi ? "Đã xét xong mọi node giữa" : "All middle nodes are processed"}</strong><span>${vi ? "Head và tail luôn bị loại khỏi phép kiểm tra." : "Head and tail are always excluded from the check."}</span></div>`;
  } else {
    comparisonHtml = `<div class="cp2058-no-comparison"><strong>${vi ? "Chỉ kiểm tra node curr ở giữa" : "Only inspect the middle curr node"}</strong><span>prev &lt; curr &gt; next = PEAK</span><span>prev &gt; curr &lt; next = VALLEY</span></div>`;
  }

  const timelineHtml = points.length
    ? points.map((point, index) => {
        const chip = `<div class="cp2058-point ${point.type}${point.index === view.newCritical ? " fresh" : ""}"><small>C${point.order}</small><strong>index ${point.index}</strong><span>value ${point.value} · ${point.type}</span></div>`;
        if (index === points.length - 1) return chip;
        const gap = points[index + 1].index - point.index;
        return `${chip}<div class="cp2058-gap"><span>${vi ? "khoảng cách" : "distance"}</span><strong>${points[index + 1].index} − ${point.index} = ${gap}</strong></div>`;
      }).join("")
    : `<div class="cp2058-empty">${vi ? "Chưa tìm thấy critical point" : "No critical point found yet"}</div>`;

  const valueOrDash = (value) => value == null || value < 0 ? "—" : value;
  const minLabel = view.minDistance == null ? "∞" : view.minDistance;
  const maxLabel = view.maxDistance == null
    ? (view.span == null ? "—" : `${view.span}*`)
    : view.maxDistance;
  const maxHint = view.maxDistance == null && view.span != null
    ? (vi ? "span hiện tại" : "current span")
    : (vi ? "critical đầu → cuối" : "first → last critical");

  let formulaHtml = `<strong>${vi ? "Cần ít nhất 2 critical point để có khoảng cách" : "At least 2 critical points are needed for a distance"}</strong>`;
  if (view.latestGap != null) {
    const previousMin = view.previousMin == null ? "∞" : view.previousMin;
    formulaHtml = `<div><small>${vi ? "GAP MỚI" : "NEW GAP"}</small><strong>index hiện tại − prev_critical = ${view.latestGap}</strong></div>
      <div><small>MIN</small><strong>min(${previousMin}, ${view.latestGap}) = ${minLabel}</strong></div>
      <div><small>${vi ? "SPAN TỪ CRITICAL ĐẦU" : "SPAN FROM FIRST CRITICAL"}</small><strong>${view.span}</strong></div>`;
  } else if (Array.isArray(view.answer)) {
    formulaHtml = view.answer[0] === -1
      ? `<div><small>${vi ? "KHÔNG ĐỦ MỘT CẶP" : "NO VALID PAIR"}</small><strong>return [-1, -1]</strong></div>`
      : `<div><small>MIN</small><strong>${view.answer[0]}</strong><span>${vi ? "gap nhỏ nhất giữa hai C liên tiếp" : "smallest adjacent C gap"}</span></div>
        <div><small>MAX</small><strong>${view.prevCritical} − ${view.firstCritical} = ${view.answer[1]}</strong><span>${vi ? "critical cuối − critical đầu" : "last critical − first critical"}</span></div>
        <div class="answer"><small>RETURN</small><strong>[${view.answer.join(", ")}]</strong></div>`;
  } else if (points.length >= 2) {
    const previousPoint = points.at(-2);
    const lastPoint = points.at(-1);
    const savedGap = lastPoint.index - previousPoint.index;
    formulaHtml = `<div><small>${vi ? "GAP GẦN NHẤT" : "LATEST SAVED GAP"}</small><strong>${lastPoint.index} − ${previousPoint.index} = ${savedGap}</strong></div>
      <div><small>MIN ${vi ? "HIỆN TẠI" : "SO FAR"}</small><strong>${minLabel}</strong></div>
      <div><small>${vi ? "SPAN TỪ CRITICAL ĐẦU" : "SPAN FROM FIRST CRITICAL"}</small><strong>${view.span}</strong></div>`;
  }

  const summary = vi
    ? `Linked list có ${values.length} node và đã tìm thấy ${points.length} critical point.`
    : `The linked list has ${values.length} nodes and ${points.length} critical point(s) have been found.`;

  const lineExplanation = criticalPoints2058LineExplanation(view, vi);

  $("treeView").innerHTML = `<section class="cp2058-viz" role="img" aria-label="${escapeHtml(summary)}">
    <div class="cp2058-phases">${phaseHtml}</div>
    <div class="cp2058-rule"><strong>${vi ? "Critical point là node giữa" : "A critical point is a middle node"}</strong><span><b>PEAK</b> ${vi ? "lớn hơn cả hai bên" : "greater than both sides"}</span><span><b>VALLEY</b> ${vi ? "nhỏ hơn cả hai bên" : "smaller than both sides"}</span><em>HEAD / TAIL: ${vi ? "không xét" : "excluded"}</em></div>
    <section class="cp2058-list-section"><header><strong>LINKED LIST</strong><span>${vi ? "nhãn prev · curr · next nằm ngay trên node" : "prev · curr · next labels sit above their nodes"}</span></header><div class="cp2058-list">${listHtml}</div></section>
    <div class="cp2058-learning">
      <section class="cp2058-compare"><header><strong>${vi ? "A. NODE HIỆN TẠI CÓ CRITICAL KHÔNG?" : "A. IS THE CURRENT NODE CRITICAL?"}</strong></header>${comparisonHtml}</section>
      <section class="cp2058-state"><header><strong>${vi ? "B. CÁC CRITICAL ĐÃ LƯU" : "B. SAVED CRITICAL POINTS"}</strong></header><div class="cp2058-timeline">${timelineHtml}</div><div class="cp2058-metrics">
        <div><small>first_critical</small><strong>${valueOrDash(view.firstCritical)}</strong></div>
        <div><small>prev_critical</small><strong>${valueOrDash(view.prevCritical)}</strong></div>
        <div><small>min_distance</small><strong>${minLabel}</strong></div>
        <div><small>max_distance</small><strong>${maxLabel}</strong><span>${maxHint}</span></div>
      </div></section>
    </div>
    <section class="cp2058-formula">${formulaHtml}</section>
    <div class="cp2058-action"><strong>${escapeHtml(pick(step.title))}</strong><span>${escapeHtml(lineExplanation || pick(step.note))}</span></div>
  </section>`;
}

