"use strict";

function renderCountWords2135View(step) {
  const view = step.countWords2135View;
  if (!view) return;
  const text = (vi, en) => lang === "vi" ? vi : en;
  const phaseIndex = view.phase === "build" ? 0
    : view.phase === "target" ? 1
      : ["try", "match"].includes(view.phase) ? 2
        : ["verdict", "answer"].includes(view.phase) ? 3 : -1;
  const pipelineLabels = [
    ["1. Hash start", "1. Hash starts"],
    ["2. Chọn target", "2. Pick target"],
    ["3. Bỏ một chữ", "3. Remove one"],
    ["4. Chốt kết quả", "4. Record result"],
  ];
  const pipeline = pipelineLabels.map((pair, index) => `<span class="${index === phaseIndex ? "active" : ""}${index < phaseIndex ? " done" : ""}">${text(...pair)}</span>`).join("");

  const startByWord = new Map(view.startEntries.map((entry) => [entry.word, entry]));
  const starts = view.startWords.map((word) => {
    const entry = startByWord.get(word);
    const isMatch = word === view.matchedStart;
    return `<span class="cw2135-start${entry ? " ready" : ""}${isMatch ? " matched" : ""}"><b>${escapeHtml(word)}</b><small>${entry ? `{${entry.letters.split("").join(",")}}` : text("chưa hash", "not hashed")}</small></span>`;
  }).join("");

  let transform = `<p class="cw2135-empty">${text(
    "Ta sẽ đảo chiều thao tác của đề: target − một chữ = một start signature.",
    "Reverse the requested operation: target − one letter = a start signature.",
  )}</p>`;
  if (view.currentTarget) {
    const letters = [...view.currentTarget].map((ch) => `<span class="cw2135-letter${ch === view.removedChar ? " removed" : ""}"><b>${ch}</b><small>${ch === view.removedChar ? text("bỏ", "remove") : "✓"}</small></span>`).join("");
    const candidate = view.candidateLetters === null
      ? `<span class="cw2135-signature pending">?</span>`
      : `<span class="cw2135-signature ${view.matchedStart ? "success" : "failure"}">{${view.candidateLetters.split("").join(",") || "∅"}}</span>`;
    transform = `<div class="cw2135-transform"><div><small>target</small><strong>${escapeHtml(view.currentTarget)}</strong><div class="cw2135-letters">${letters}</div></div><span class="cw2135-operator">− <b>${view.removedChar || "?"}</b> →</span><div><small>${text("key còn lại", "remaining key")}</small>${candidate}<em>${view.candidateLetters === null ? text("chọn chữ để bỏ", "choose a letter") : view.matchedStart ? `∈ starts · ${escapeHtml(view.matchedStart)}` : "∉ starts"}</em></div></div>`;
  }

  const attempts = view.attempts.length
    ? view.attempts.map((attempt, index) => `<div class="cw2135-attempt${attempt.matched ? " matched" : ""}"><span>#${index + 1}</span><b>− ${attempt.removed}</b><code>{${attempt.letters.split("").join(",") || "∅"}}</code><strong>${attempt.matched ? `✓ ${escapeHtml(attempt.startWord)}` : "×"}</strong></div>`).join("")
    : `<p>${text("Chưa thử cách bỏ nào.", "No removal tried yet.")}</p>`;

  const verdictByWord = new Map(view.verdicts.map((entry) => [entry.word, entry]));
  const targetCards = view.targetWords.map((word) => {
    const verdict = verdictByWord.get(word);
    const classes = ["cw2135-target", word === view.currentTarget ? "active" : "", verdict ? (verdict.matched ? "valid" : "invalid") : ""].filter(Boolean).join(" ");
    return `<span class="${classes}"><b>${escapeHtml(word)}</b><small>${!verdict ? text("chờ", "waiting") : verdict.matched ? `✓ ${escapeHtml(verdict.startWord)} + 1` : `× ${verdict.attempts} ${text("lần thử", "tries")}`}</small></span>`;
  }).join("");

  $("treeView").innerHTML = `<section class="cw2135-viz" aria-label="${text("Mô phỏng bài 2135", "Problem 2135 simulation")}">
    <header class="cw2135-heading"><div><small>#2135 · MEDIUM · BITMASK + HASH SET</small><h3>${text("Bỏ một chữ rồi tra cứu", "Remove one letter, then look it up")}</h3></div><span class="${view.phase === "answer" ? "success" : ""}"><small>answer</small><b>${view.answer}</b></span></header>
    <div class="cw2135-insight"><article><small>${text("Đề bài đi xuôi", "Forward operation")}</small><code>start + 1 letter → shuffle → target</code></article><b>⇔</b><article><small>${text("Thuật toán đi ngược", "Algorithm reverses it")}</small><code>target − 1 letter → lookup(start)</code></article></div>
    <nav class="cw2135-pipeline" aria-label="${text("Các bước thuật toán", "Algorithm stages")}">${pipeline}</nav>
    <section class="cw2135-panel cw2135-dictionary"><header><strong>startWords → Hash Set</strong><span>${view.startEntries.length}/${view.startWords.length}</span></header><div>${starts}</div></section>
    <div class="cw2135-action"><strong>${escapeHtml(pick(step.title))}</strong><p>${escapeHtml(pick(step.note))}</p></div>
    <section class="cw2135-panel cw2135-workbench"><header><strong>${text("Bàn thử target", "Target workbench")}</strong><span>${view.currentTarget || "—"}</span></header>${transform}</section>
    <div class="cw2135-lower">
      <section class="cw2135-panel cw2135-attempts"><header><strong>${text("Các cách bỏ một chữ", "One-letter removals")}</strong><span>${view.attempts.length}</span></header><div>${attempts}</div></section>
      <section class="cw2135-panel cw2135-results"><header><strong>targetWords</strong><span>${view.verdicts.filter((entry) => entry.matched).length} ${text("hợp lệ", "valid")}</span></header><div>${targetCards}</div></section>
    </div>
    <details class="cw2135-interview"${view.phase === "answer" ? " open" : ""}><summary>${text("Vì sao bitmask đúng và nhanh?", "Why is the bitmask correct and fast?")}</summary><div><article><b>${text("Không cần sinh permutation", "No permutations")}</b><p>${text("Mỗi từ không lặp ký tự, nên tập chữ cái quyết định mọi hoán vị; một bit biểu diễn một chữ.", "Each word has unique letters, so its letter set determines every permutation; one bit represents one letter.")}</p></article><article><b>${text("Không đếm target hai lần", "No double-counting")}</b><p>${text("Một target có thể khớp nhiều start, nhưng break sau match đầu tiên vì câu hỏi đếm targetWords.", "A target may match multiple starts, but break after the first match because the task counts targetWords.")}</p></article></div><p><b>${text("Độ phức tạp:", "Complexity:")}</b> O(S + T) ${text("theo tổng số ký tự.", "in total characters.")}</p></details>
  </section>`;
}
