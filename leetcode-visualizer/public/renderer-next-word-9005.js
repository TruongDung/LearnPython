function renderNextWord9005View(step) {
  const v = step.nextWord9005View;
  if (!v) return;
  const t = (vi, en) => lang === "vi" ? vi : en;
  const esc = value => escapeHtml(String(value));
  const icons = { init: "∅", sentence: "▤", pair: "↔", count: "+1", loop: "↻", "choose-word": "⑂", choose: "★", cache: "▣", predict: "⚡" };
  const shownSentences = new Set(v.sentences.slice(0, 3).map((_, index) => index));
  if (v.sentenceIndex >= 0) shownSentences.add(v.sentenceIndex);
  const evidence = v.sentences.findIndex(words => words.includes(v.query));
  if (evidence >= 0) shownSentences.add(evidence);
  const sentences = [...shownSentences].sort((a, b) => a - b).map(index => {
    const words = v.sentences[index];
    const active = v.activePair?.sentenceIndex === index;
    const focus = active ? v.activePair.index : Math.max(0, words.indexOf(v.query));
    const start = Math.max(0, Math.min(focus - 2, words.length - 8));
    const tokens = words.slice(start, start + 8).map((word, offset) => {
      const position = start + offset;
      const from = active && position === v.activePair.index;
      const to = active && position === v.activePair.index + 1;
      return `${offset ? `<i class="${to ? "active" : ""}">→</i>` : ""}<span class="np9005-word${word === v.query ? " query" : ""}${from ? " from" : ""}${to ? " to" : ""}" title="${esc(word)}" data-position="${position}">${esc(word)}</span>`;
    }).join("");
    return `<div class="np9005-sentence${active ? " active" : ""}" data-sentence-index="${index}"><small>#${index + 1}</small><div>${start ? "<small>…</small>" : ""}${tokens}${words.length > start + 8 ? `<small>… +${words.length - start - 8}</small>` : ""}</div></div>`;
  }).join("");

  const allChoices = v.choices.map(choice => ({ ...choice, pending: false }));
  if (v.phase === "pair" && !allChoices.some(choice => choice.word === v.activePair.nxt)) {
    allChoices.push({ word: v.activePair.nxt, count: 0, pending: true });
  }
  const choices = allChoices.filter((choice, index) => index < 5 || choice.word === v.activePair?.nxt || choice.word === v.focusWinner);
  const maxCount = Math.max(0, ...allChoices.map(choice => choice.count));
  const tied = allChoices.filter(choice => choice.count === maxCount && !choice.pending);
  const candidates = choices.map(choice => {
    const fresh = v.increment?.word === v.focusWord && v.increment.nxt === choice.word;
    const won = choice.word === v.focusWinner;
    const tally = maxCount <= 12
      ? `<div class="np9005-dots">${Array.from({ length: Math.max(1, maxCount) }, (_, index) => `<i class="${index < choice.count ? "filled" : ""}${fresh && index === choice.count - 1 ? " fresh" : ""}"></i>`).join("")}</div>`
      : `<div class="np9005-bar"><i class="${fresh ? "fresh" : ""}" style="width:${choice.count / Math.max(1, maxCount) * 100}%"></i></div>`;
    return `<div class="np9005-choice${won ? " winner" : ""}${fresh ? " counting" : ""}${choice.pending ? " pending" : ""}" data-choice="${esc(choice.word)}" data-count="${choice.count}" role="img" aria-label="${esc(`${v.focusWord} → ${choice.word}: ${choice.count}${won ? t(", được chọn", ", winner") : ""}`)}"><span title="${esc(choice.word)}">${won ? "★ " : ""}${esc(choice.word)}</span>${tally}<strong>${choice.count}${fresh ? "<small>+1</small>" : ""}${choice.pending ? "<small>…</small>" : ""}</strong></div>`;
  }).join("");
  const tie = v.focusWinner !== null && tied.length > 1
    ? `<div class="np9005-tie" aria-label="${esc(t("Hòa tần suất: chọn thứ tự chữ cái nhỏ hơn", "Equal counts: choose the lexicographically smallest word"))}">⚖ ${maxCount} = ${maxCount} <span>→ a…z →</span> <b>${esc(v.focusWinner)}</b></div>` : "";
  const visibleWinners = v.winners.filter((entry, index) => index < 6 || entry.word === v.query || entry.word === v.focusWord);
  const cache = visibleWinners.map(entry => `<div class="np9005-cache-entry${v.method === "predict" && entry.word === v.query ? " lookup" : v.phase === "choose" && entry.word === v.focusWord ? " active" : ""}" data-key="${esc(entry.word)}"><span title="${esc(entry.word)}">${esc(entry.word)}</span><i>→</i><strong title="${esc(entry.next)}">${esc(entry.next)}</strong></div>`).join("");
  const prediction = step.final ? v.prediction === null ? "∅" : esc(v.prediction) : "?";
  const progress = Math.min(16, v.totalPairs);
  $("treeView").innerHTML = `<section class="np9005-viz" aria-label="${esc(t("Học cặp từ và dự đoán từ kế tiếp", "Learn adjacent word pairs and predict the next word"))}">
    <header class="np9005-heading"><span>${icons[v.phase]} <small>${v.method} · L${v.source.line}</small></span><span>${v.cacheReady ? "✓ " : ""}${v.processedPairs}/${v.totalPairs} ${t("cặp", "pairs")}</span></header>
    <div class="np9005-query"><span><small>query</small><b title="${esc(v.query)}">${esc(v.query)}</b></span><i>${step.final && v.prediction === null ? "⇢" : "→"}</i><span class="${step.final ? v.prediction === null ? "missing" : "predicted" : "waiting"}"><small>predict</small><b title="${step.final && v.prediction !== null ? esc(v.prediction) : ""}">${prediction}</b></span></div>
    <section class="np9005-training"><div class="np9005-label"><span>▤ ${t("Câu mẫu", "Training sentences")}</span><div class="np9005-progress" aria-label="${v.processedPairs}/${v.totalPairs}">${Array.from({ length: progress }, (_, index) => `<i class="${index < Math.floor(v.processedPairs * progress / Math.max(1, v.totalPairs)) ? "filled" : ""}"></i>`).join("")}${v.totalPairs > progress ? "<small>…</small>" : ""}</div></div>${sentences}${v.sentences.length > shownSentences.size ? `<small class="np9005-caption">… +${v.sentences.length - shownSentences.size} ${t("câu", "sentences")}</small>` : ""}</section>
    <section class="np9005-counting"><div class="np9005-label"><code>counts[word][nxt]</code>${v.increment ? `<span class="np9005-increment">${v.increment.before} → <b>${v.increment.after}</b> · +1</span>` : ""}</div><div class="np9005-branches"><div class="np9005-source"><b title="${esc(v.focusWord)}">${esc(v.focusWord)}</b></div><div class="np9005-candidates">${candidates || `<div class="np9005-empty">∅ <small>${t("Chưa có cặp", "No word pair")}</small></div>`}</div></div>${allChoices.length > choices.length ? `<small class="np9005-caption">… +${allChoices.length - choices.length}</small>` : ""}${tie}</section>
    <section class="np9005-cache"><div class="np9005-label"><code>${v.cacheReady ? "self.winner" : "winner"}</code><span>${v.cacheReady ? "▣ ✓" : "▣"} ${v.winners.length}</span></div><div class="np9005-cache-map">${cache || "<span class='np9005-cache-empty'>∅</span>"}</div>${v.winners.length > visibleWinners.length ? `<small class="np9005-caption">… +${v.winners.length - visibleWinners.length}</small>` : ""}</section>
  </section>`;
}
