"use strict";

function renderLongestStringChain1048View(step) {
  const view = step.stringChain1048View;
  if (!view) return;
  const text = (vi, en) => lang === "vi" ? vi : en;
  const phaseIndex = ["sort", "init"].includes(view.phase) ? 0
    : view.phase === "word" ? 1
      : ["hit", "miss", "improve"].includes(view.phase) ? 2
        : 3;
  const phases = [
    ["1. Sort theo length", "1. Sort by length"],
    ["2. Mở chain = 1", "2. Start chain = 1"],
    ["3. Xóa từng ký tự", "3. Delete each char"],
    ["4. Lưu DP + answer", "4. Store DP + answer"],
  ];
  const phasesHtml = phases.map((labels, index) => `<span class="${index === phaseIndex ? "active" : ""}${index < phaseIndex ? " done" : ""}">${text(...labels)}</span>`).join("");

  const windowStart = view.currentIndex === null ? 0 : Math.max(0, Math.min(view.currentIndex - 7, view.words.length - 18));
  const visibleWords = view.words.slice(windowStart, windowStart + 18);
  const runwayHtml = visibleWords.map((word, offset) => {
    const index = windowStart + offset;
    const processed = index < view.processedCount;
    return `<div class="sc1048-word ${index === view.currentIndex ? "active" : ""} ${processed ? "processed" : "pending"}"><small>#${index + 1} · L${word.length}</small><b>${escapeHtml(word)}</b></div>`;
  }).join("");

  const lettersHtml = view.currentWord ? [...view.currentWord].map((character, index) => `<span class="${index === view.removedIndex ? "removed" : ""}"><b>${character}</b><small>${index === view.removedIndex ? text("xóa", "delete") : index}</small></span>`).join("") : `<em>${text("Chọn một word để bắt đầu", "Select a word to begin")}</em>`;
  const candidateClass = view.hit === true ? "hit" : view.hit === false ? "miss" : "idle";
  const candidateHtml = view.predecessor === null ? `<div class="sc1048-candidate idle"><small>predecessor</small><b>—</b><span>${text("Xóa đúng một ký tự", "Delete exactly one character")}</span></div>` : `<div class="sc1048-candidate ${candidateClass}"><small>predecessor</small><b>“${escapeHtml(view.predecessor || "∅")}”</b><span>${view.hit ? `dp = ${view.predecessorLength} → candidate = ${view.candidateLength}` : text("không có trong DP", "absent from DP")}</span></div>`;

  const chainHtml = view.chain.length ? view.chain.map((word, index) => `<span><small>${index + 1}</small><b>${escapeHtml(word)}</b></span>`).join("<i>→</i>") : `<em>${text("Chain sẽ xuất hiện khi DP tìm được predecessor", "The chain appears after DP finds a predecessor")}</em>`;
  const retained = new Map();
  view.dpEntries.slice(-48).forEach((entry) => retained.set(entry.word, entry));
  view.chain.forEach((word) => {
    const entry = view.dpEntries.find((item) => item.word === word);
    if (entry) retained.set(word, entry);
  });
  const layers = [...retained.values()].reduce((map, entry) => {
    const size = entry.word.length;
    if (!map.has(size)) map.set(size, []);
    map.get(size).push(entry);
    return map;
  }, new Map());
  const chainSet = new Set(view.chain);
  const layersHtml = [...layers.entries()].sort(([left], [right]) => left - right).map(([length, entries]) => `<div class="sc1048-layer"><header><span>${text("độ dài", "length")} ${length}</span></header><div>${entries.map((entry) => `<article class="${entry.active ? "active" : ""} ${entry.best ? "best" : ""} ${chainSet.has(entry.word) ? "chain" : ""}"><b>${escapeHtml(entry.word)}</b><span>dp=${entry.length}</span>${entry.parent ? `<small>← ${escapeHtml(entry.parent)}</small>` : `<small>${text("bắt đầu", "start")}</small>`}</article>`).join("")}</div></div>`).join("");

  const formula = view.predecessor === null
    ? "dp[word] = 1"
    : `max(${view.wordBest ?? 1}, dp.get(“${escapeHtml(view.predecessor || "∅")}”, 0) + 1)`;

  $("treeView").innerHTML = `<section class="sc1048-viz" aria-label="${text("Mô phỏng Longest String Chain", "Longest String Chain simulation")}">
    <header class="sc1048-heading"><div><small>#1048 · MEDIUM · STRING DP</small><h3>${text("Xóa một ký tự để đi ngược chain", "Delete one character to walk backward")}</h3></div><div class="sc1048-answer"><small>${text("CHAIN DÀI NHẤT", "LONGEST CHAIN")}</small><b>${view.answer}</b><span>${view.processedCount}/${view.words.length} ${text("words đã lưu", "words stored")}</span></div></header>
    <nav class="sc1048-phases">${phasesHtml}</nav>
    <div class="sc1048-action"><strong>${escapeHtml(pick(step.title))}</strong><p>${escapeHtml(pick(step.note))}</p></div>
    <section class="sc1048-runway"><header><strong>${text("Words sau khi sort", "Words after sorting")}</strong><span>${windowStart + 1}–${Math.min(windowStart + 18, view.words.length)} / ${view.words.length}</span></header><div>${runwayHtml}</div></section>
    <div class="sc1048-workbench">
      <section class="sc1048-delete"><header><strong>${text("Máy sinh predecessor", "Predecessor generator")}</strong><code>${formula}</code></header><div class="sc1048-letters">${lettersHtml}</div><div class="sc1048-arrow">↓</div>${candidateHtml}</section>
      <section class="sc1048-chain"><header><strong>${text("Chain đang chứng minh", "Chain being proved")}</strong><span>${view.chain.length} ${text("mắt xích", "links")}</span></header><div>${chainHtml}</div><p>${text("Mỗi mũi tên thêm đúng 1 ký tự và giữ nguyên thứ tự ký tự cũ.", "Every arrow adds exactly 1 character while preserving existing character order.")}</p></section>
    </div>
    <section class="sc1048-dp"><header><div><strong>${text("Bản đồ DP theo tầng độ dài", "DP map by word length")}</strong><span>dp[word] = ${text("chain tốt nhất kết thúc tại word", "best chain ending at word")}</span></div><div class="sc1048-legend"><i class="chain"></i>${text("optimal chain", "optimal chain")}<i class="active"></i>${text("đang xét", "active")}<i></i>${text("đã lưu", "stored")}</div></header><div class="sc1048-layers">${layersHtml || `<p>${text("DP chưa có word", "No words in DP yet")}</p>`}</div></section>
    <section class="sc1048-invariant"><div><small>${text("THỨ TỰ XỬ LÝ", "PROCESSING ORDER")}</small><b>len(predecessor) = len(word) − 1</b></div><i>⇒</i><p>${text("Predecessor luôn ngắn hơn, nên đã được sort đứng trước và dp của nó đã hoàn tất. Đây là lý do một lượt từ ngắn đến dài là đủ.", "A predecessor is always shorter, so sorting places it earlier and its dp value is already final. That is why one shortest-to-longest pass is enough.")}</p></section>
  </section>`;
}
