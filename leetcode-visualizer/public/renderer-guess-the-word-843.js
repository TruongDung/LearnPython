"use strict";

function renderGuessTheWord843View(step) {
  const view = step.guessWord843View;
  if (!view) return;

  const text = (vi, en) => lang === "vi" ? vi : en;
  const stages = [
    ["◉", text("Chia", "Group")],
    ["★", text("Chọn", "Pick")],
    ["?", text("Hỏi", "Ask")],
    ["✓", text("Lọc", "Filter")],
  ];
  const activeIndex = ["score", "choose", "guess", "filter", "found"].indexOf(view.phase);
  const stagesHtml = stages.map(([icon, label], index) => {
    const done = view.phase === "found" || index < activeIndex;
    const active = index === activeIndex;
    return `<span class="gtw843-stage${done ? " done" : ""}${active ? " active" : ""}"><i>${done ? "✓" : icon}</i><b>${label}</b></span>`;
  }).join("");

  const comparison = view.comparison;
  const compareHtml = comparison
    ? [...comparison.left].map((letter, index) => {
      const matched = letter === comparison.right[index];
      return `<span class="gtw843-compare-letter${matched ? " match" : " miss"}">
        <small>${index + 1}</small><b>${escapeHtml(letter)}</b><i>${matched ? "✓" : "×"}</i>
      </span>`;
    }).join("")
    : Array.from({ length: 6 }, (_, index) => `<span class="gtw843-compare-letter waiting"><small>${index + 1}</small><b>·</b><i>?</i></span>`).join("");
  const feedback = comparison
    ? `<strong>${comparison.result}<small>/6</small></strong>`
    : `<strong>?</strong>`;
  const attemptedWord = comparison?.left || view.activeWord || view.bestWord;

  const displayedCandidates = view.previousCandidates || view.candidates || [];
  const removed = new Set(view.removed || []);
  const kept = new Set(view.kept || []);
  const matchesByWord = new Map((view.candidateMatches || []).map(({ word, m }) => [word, m]));
  const candidateCards = displayedCandidates.map((word) => {
    const classes = [
      "gtw843-word",
      word === view.activeWord ? "active" : "",
      removed.has(word) ? "removed" : "",
      kept.has(word) ? "kept" : "",
      word === view.found ? "found" : "",
    ].filter(Boolean).join(" ");
    const matchCount = matchesByWord.get(word);
    const markers = attemptedWord ? [...word].map((letter, index) => (
      `<i class="${letter === attemptedWord[index] ? "same" : ""}"></i>`
    )).join("") : "";
    return `<span class="${classes}" title="${escapeHtml(word)}"><span class="gtw843-word-dots">${markers}</span><b>${escapeHtml(word)}</b>${matchCount !== undefined ? `<small>${matchCount}</small>` : ""}</span>`;
  }).join("");

  let scoreChart;
  if (view.scoreRows?.length) {
    const maxCount = Math.max(1, ...view.scoreRows.flatMap((row) => row.counts));
    scoreChart = `<div class="gtw843-chart-legend"><span>${text("Từ", "Guess")}</span><div>${Array.from({ length: 7 }, (_, index) => `<i>${index}</i>`).join("")}</div><span>max</span></div>
      <div class="gtw843-score-scroll">${view.scoreRows.map((row) => {
        const best = row.word === view.bestWord && ["choose", "guess", "filter", "found"].includes(view.phase);
        const current = row.word === view.activeWord;
        const bucketCells = row.counts.map((count, index) => {
          const actual = row.word === view.bestWord && comparison && comparison.result === index;
          const height = Math.max(count > 0 ? 5 : 0, Math.round((count / maxCount) * 100));
          return `<span class="gtw843-chart-bucket${count === row.worst && count ? " worst" : ""}${actual ? " actual" : ""}" title="${text("Khớp", "Match")} ${index}: ${count}">
            <i style="--gtw843-bar-height:${height}%"></i><b>${count || ""}</b>
          </span>`;
        }).join("");
        return `<div class="gtw843-score-row${current ? " active" : ""}${best ? " best" : ""}">
          <strong>${escapeHtml(row.word)}</strong><div class="gtw843-buckets">${bucketCells}</div><span class="gtw843-worst">${row.worst}</span>
        </div>`;
      }).join("")}</div>`;
  } else {
    scoreChart = `<div class="gtw843-score-empty" aria-hidden="true">${Array.from({ length: 7 }, (_, index) => `<i>${index}</i>`).join("")}</div>`;
  }

  const roundText = view.round
    ? text(`Vòng ${view.round}`, `Round ${view.round}`)
    : text("Bắt đầu", "Ready");
  const candidateCount = view.candidates?.length ?? 0;
  const resultCount = view.phase === "filter" ? kept.size : candidateCount;
  const line = Number(step.codeLines?.[0]);
  const lineLabels = {
    6: text("Đếm vị trí", "Count positions"),
    7: text("So ký tự", "Compare letters"),
    12: text("Vòng đoán", "Guess loop"),
    16: text("Khởi tạo", "Initialize"),
    17: text("Điểm tốt nhất", "Best score"),
    30: text("Nhóm xấu nhất", "Worst bucket"),
    32: text("Chọn minimax", "Pick minimax"),
    33: text("Cập nhật điểm", "Update score"),
    34: text("Đổi từ đoán", "Update guess"),
    37: text("Hỏi Master", "Ask Master"),
    40: text("Đã tìm thấy?", "Found?"),
    43: text("Lọc ứng viên", "Filter candidates"),
  };
  const lineLabel = lineLabels[line] || text("Đang chạy", "Running");

  $("treeView").innerHTML = `<section class="gtw843-viz" aria-label="${text("Trò chơi đoán từ", "Guess the word game")}">
    <header class="gtw843-heading">
      <div class="gtw843-title"><span>#843</span><h3>${text("Đoán từ bí mật", "Guess the secret word")}</h3></div>
      <div class="gtw843-round"><strong>${roundText}</strong><span>${view.phase === "found" ? "✓" : `${candidateCount} ${text("từ", "left")}`}</span></div>
    </header>
    <nav class="gtw843-pipeline" aria-label="${text("Các bước minimax", "Minimax steps")}">${stagesHtml}</nav>
    <div class="gtw843-debug" aria-label="${text(`Đang chạy dòng ${line}`, `Running line ${line}`)}">
      <span>L${Number.isInteger(line) ? line : "—"}</span><strong>${lineLabel}</strong>
      <i>${text("Từng dòng", "Line by line")}</i>
    </div>
    <div class="gtw843-main">
      <section class="gtw843-panel gtw843-master">
        <header><strong>${text("Lượt đoán", "Guess")}</strong><span>${feedback}</span></header>
        <div class="gtw843-comparison">${compareHtml}</div>
        <div class="gtw843-feedback-label">${comparison ? text("vị trí trùng", "positions match") : text("6 ký tự", "6 letters")}</div>
      </section>
      <section class="gtw843-panel gtw843-pool">
        <header><strong>${text("Ứng viên", "Candidates")}</strong><span>${resultCount}/${displayedCandidates.length}</span></header>
        <div class="gtw843-words">${candidateCards || `<span class="gtw843-empty">∅</span>`}</div>
        ${view.phase === "filter" ? `<footer><i class="kept"></i>${kept.size}<i class="eliminated"></i>${removed.size}</footer>` : ""}
      </section>
    </div>
    <section class="gtw843-panel gtw843-score">
      <header><strong>${text("Chia nhóm theo số vị trí khớp", "Group by matching positions")}</strong><span>${Number.isFinite(view.bestScore) ? `${escapeHtml(view.bestWord)} · max ${view.bestScore}` : "0—6"}</span></header>
      ${scoreChart}
    </section>
    ${view.phase === "found" ? `<div class="gtw843-found" aria-label="${text("Đã tìm thấy từ", "Secret found")}">${[...view.found].map((letter) => `<b>${escapeHtml(letter)}</b>`).join("")}</div>` : ""}
  </section>`;
}
