"use strict";

function renderGuessTheWord843View(step) {
  const view = step.guessWord843View;
  if (!view) return;

  const text = (vi, en) => lang === "vi" ? vi : en;
  const phaseOrder = ["score", "choose", "guess", "filter"];
  const activePhase = view.phase === "round" ? -1 : phaseOrder.indexOf(view.phase);
  const doneThrough = view.phase === "found" ? 3 : activePhase;
  const phaseLabels = [
    ["1. Chia bucket", "1. Build buckets"],
    ["2. Chọn minimax", "2. Pick minimax"],
    ["3. Hỏi Master", "3. Ask Master"],
    ["4. Lọc ứng viên", "4. Filter candidates"],
  ];
  const pipeline = phaseLabels.map((labels, index) => {
    const classes = [index === activePhase ? "active" : "", index < doneThrough || view.phase === "found" ? "done" : ""].filter(Boolean).join(" ");
    return `<span class="${classes}">${text(...labels)}</span>`;
  }).join("");

  const comparison = view.comparison;
  let comparisonHtml = `<div class="gtw843-empty">${text(
    "Master đang giấu một từ 6 ký tự. Ta chỉ được biết có bao nhiêu vị trí khớp.",
    "The Master hides a six-letter word. We only learn how many positions match.",
  )}</div>`;
  if (comparison) {
    const cells = [...comparison.left].map((letter, index) => {
      const right = comparison.right[index];
      const matches = letter === right;
      return `<div class="gtw843-letter${matches ? " match" : " miss"}">
        <small>${index}</small><b>${escapeHtml(letter)}</b><b>${comparison.revealRight ? escapeHtml(right) : "•"}</b><em>${matches ? "✓" : "×"}</em>
      </div>`;
    }).join("");
    comparisonHtml = `<div class="gtw843-compare-labels"><span>${view.phase === "match-example" ? "a" : text("Đoán", "Guess")}</span><span>${view.phase === "match-example" ? "b" : "secret"}</span></div>
      <div class="gtw843-letters">${cells}</div>
      <div class="gtw843-feedback"><span>Master</span><b>${comparison.result} / 6</b><em>${text("vị trí khớp", "positions match")}</em></div>`;
  }

  const displayedCandidates = view.previousCandidates || view.candidates || [];
  const removed = new Set(view.removed || []);
  const kept = new Set(view.kept || []);
  const matchesByWord = new Map((view.candidateMatches || []).map((entry) => [entry.word, entry.m]));
  const candidateCards = displayedCandidates.map((word) => {
    const classes = ["gtw843-word"];
    if (word === view.activeWord) classes.push("active");
    if (removed.has(word)) classes.push("removed");
    if (kept.has(word)) classes.push("kept");
    if (view.found === word) classes.push("found");
    let badge = "";
    if (matchesByWord.has(word)) badge = `<small>match = ${matchesByWord.get(word)}</small>`;
    else if (word === view.activeWord) badge = `<small>${text("đang xét", "current")}</small>`;
    return `<span class="${classes.join(" ")}"><b>${escapeHtml(word)}</b>${badge}</span>`;
  }).join("");

  let scoreTable = `<p class="gtw843-placeholder">${text(
    "Ở bước kế tiếp, mỗi từ sẽ được chia thành 7 bucket theo số vị trí khớp.",
    "Next, every word is split into seven buckets by its number of matching positions.",
  )}</p>`;
  if (view.scoreRows?.length) {
    const minWorst = Math.min(...view.scoreRows.map((row) => row.worst));
    const rows = view.scoreRows.map((row) => {
      const isBest = row.word === view.bestWord && ["choose", "guess", "filter", "found"].includes(view.phase);
      const buckets = row.counts.map((count, matchCount) => {
        const isWorst = count === row.worst && count > 0;
        const actual = view.result === matchCount && row.word === view.bestWord && ["guess", "filter", "found"].includes(view.phase);
        const details = row.groups[matchCount]?.length ? row.groups[matchCount].join(", ") : "∅";
        return `<span class="gtw843-bucket${isWorst ? " worst" : ""}${actual ? " actual" : ""}" title="m=${matchCount}: ${escapeHtml(details)}"><small>${matchCount}</small><b>${count}</b></span>`;
      }).join("");
      return `<div class="gtw843-score-row${row.word === view.activeWord ? " active" : ""}${isBest ? " best" : ""}">
        <strong>${escapeHtml(row.word)}</strong><div class="gtw843-buckets">${buckets}</div><span class="gtw843-worst${row.worst === minWorst ? " minimum" : ""}"><small>worst</small><b>${row.worst}</b></span>
      </div>`;
    }).join("");
    scoreTable = `<div class="gtw843-score-head"><strong>${text("Từ đoán", "Guess")}</strong><span>match = 0 · 1 · 2 · 3 · 4 · 5 · 6</span><b>max(bucket)</b></div><div class="gtw843-score-scroll">${rows}</div>`;
  }

  const history = (view.history || []).map((entry) => `<div class="gtw843-history-row">
    <span>#${entry.round}</span><b>${escapeHtml(entry.guess)}</b><strong>${entry.result}/6</strong><em>${entry.before} → ${entry.after}</em>
  </div>`).join("");

  const status = view.phase === "found"
    ? text(`Tìm thấy ${view.found}!`, `Found ${view.found}!`)
    : view.round
      ? text(`Vòng ${view.round} · còn ${view.candidates.length} từ`, `Round ${view.round} · ${view.candidates.length} left`)
      : text(`${view.words.length} từ ban đầu`, `${view.words.length} initial words`);

  $("treeView").innerHTML = `<section class="gtw843-viz" aria-label="${text("Mô phỏng bài 843", "Problem 843 simulation")}">
    <header class="gtw843-heading"><div><small>#843 · HARD · MINIMAX</small><h3>${text("Đoán từ bằng cách thu nhỏ trường hợp xấu nhất", "Guess by shrinking the worst case")}</h3></div><span class="${view.phase === "found" ? "success" : ""}">${escapeHtml(status)}</span></header>
    <div class="gtw843-rule"><b>match(a, b)</b><span>${text("Đếm ký tự bằng nhau ở cùng vị trí — không phải số chữ cái chung.", "Count equal letters in the same positions—not shared letters.")}</span><code>sum(a[i] == b[i])</code></div>
    <nav class="gtw843-pipeline" aria-label="${text("Bốn bước mỗi vòng", "Four steps per round")}">${pipeline}</nav>
    <div class="gtw843-layout">
      <section class="gtw843-panel gtw843-master"><header><strong>${text("Phản hồi của Master", "Master feedback")}</strong><span>${comparison ? `${comparison.result}/6` : "? / 6"}</span></header>${comparisonHtml}</section>
      <section class="gtw843-panel gtw843-pool"><header><strong>${text("Tập ứng viên", "Candidate pool")}</strong><span>${displayedCandidates.length} ${text("từ", "words")}</span></header><div class="gtw843-words">${candidateCards}</div>${view.phase === "filter" ? `<p><b>${kept.size}</b> ${text("giữ lại", "kept")} · <b>${removed.size}</b> ${text("bị loại vì phản hồi không khớp", "removed because their feedback differs")}</p>` : ""}</section>
    </div>
    <div class="gtw843-action"><strong>${escapeHtml(pick(step.title))}</strong><p>${escapeHtml(pick(step.note))}</p></div>
    <section class="gtw843-panel gtw843-score"><header><div><strong>${text("Bảng minimax", "Minimax scoreboard")}</strong><span>${text("Mỗi ô = số từ rơi vào bucket đó", "Each cell = words in that bucket")}</span></div><code>${text("chọn min(max(bucket))", "choose min(max(bucket))")}</code></header>${scoreTable}</section>
    <div class="gtw843-bottom">
      <section class="gtw843-panel gtw843-history"><header><strong>${text("Lịch sử hỏi Master", "Master query history")}</strong><span>${view.history.length}/30</span></header>${history || `<p>${text("Chưa đoán từ nào.", "No guesses yet.")}</p>`}</section>
      <details class="gtw843-interview"${view.phase === "found" ? " open" : ""}><summary>${text("Cách giải thích trong phỏng vấn", "Interview explanation")}</summary><ol><li>${text("Với mỗi từ đoán, gom các từ khác theo match 0..6.", "For each possible guess, group other words by match 0..6.")}</li><li>${text("Bucket lớn nhất là số ứng viên có thể còn lại trong tình huống xấu nhất.", "The largest bucket is how many candidates may remain in the worst case.")}</li><li>${text("Chọn từ có bucket lớn nhất nhỏ nhất, hỏi Master, rồi chỉ giữ bucket được trả về.", "Choose the word with the smallest largest bucket, ask Master, then keep only the returned bucket.")}</li></ol><p><b>${text("Độ phức tạp:", "Complexity:")}</b> O(W² · L) ${text("mỗi vòng; L = 6.", "per round; L = 6.")}</p></details>
    </div>
  </section>`;
}
