"use strict";

class GuessTheWord843Visualizer {
  constructor({ host, language = "en", escape = escapeHtml }) {
    this.host = host;
    this.language = language;
    this.escape = escape;
  }

  t(vi, en) { return this.language === "vi" ? vi : en; }
  matches(a, b) { return [...a].reduce((count, letter, i) => count + Number(letter === b[i]), 0); }

  letters(word, reference = null, hidden = false) {
    const text = hidden ? "??????" : word || "······";
    return '<div class="gtw843-letters">' + [...text].map((letter, i) => {
      const state = hidden ? " hidden" : reference ? (letter === reference[i] ? " match" : " miss") : "";
      return '<span class="gtw843-letter' + state + '" data-position="' + i + '">' + this.escape(letter) + '</span>';
    }).join("") + '</div>';
  }

  focusedRow(view) {
    const word = view.phase === "score" ? view.activeWord : view.bestWord;
    return (view.scoreRows || []).find(row => row.word === word) || null;
  }

  pipeline(view, step) {
    const active = { score: 0, choose: 1, guess: 2, filter: 3 }[view.phase] ?? -1;
    const stages = [["◉", this.t("Chia", "Group")], ["★", this.t("Chọn", "Pick")], ["🤖", "Master"], ["✂", this.t("Lọc", "Filter")]];
    return '<nav class="gtw843-pipeline" aria-label="' + this.t("Các bước minimax", "Minimax stages") + '">' + stages.map(([icon, label], i) => '<span class="' + (view.phase === "found" ? "done" : i === active ? "active" : i < active ? "done" : "") + '"><i>' + icon + '</i><b>' + label + '</b></span>').join("") + '</nav><div class="gtw843-debug"><span>L' + (step.codeLines[0] ?? "—") + '</span><b>' + this.t("Vòng", "Round") + ' ' + (view.round || 0) + '</b><span>' + (view.candidates || []).length + ' ' + this.t("ứng viên", "candidates") + '</span></div>';
  }

  feedback(count) {
    const known = Number.isInteger(count);
    const circumference = 2 * Math.PI * 25;
    return '<svg class="gtw843-feedback" viewBox="0 0 70 76" role="img" aria-label="' + (known ? count + "/6" : this.t("Chưa hỏi Master", "Master not asked yet")) + '"><circle class="track" cx="35" cy="31" r="25"/>' + (known ? '<circle class="progress" cx="35" cy="31" r="25" stroke-dasharray="' + (circumference * count / 6) + " " + circumference + '" transform="rotate(-90 35 31)"/>' : "") + '<text x="35" y="39">' + (known ? count : "?") + '</text><text class="total" x="35" y="73">/6</text></svg>';
  }

  comparison(view) {
    const oracle = ["guess", "filter", "found"].includes(view.phase);
    if (oracle) {
      const word = view.bestWord || view.activeWord;
      const found = view.phase === "found";
      // Master returns a count, never the matching positions or hidden letters.
      return '<section class="gtw843-panel gtw843-master" data-source="master"><header><strong>🤖 Master</strong><span>' + this.t("chỉ trả số lượng", "returns only the count") + '</span></header><div class="gtw843-comparison">' + this.letters(word, found ? word : null) + '<div class="gtw843-master-flow"><svg viewBox="0 0 56 46" class="gtw843-robot" aria-hidden="true"><path d="M28 3v7M24 3h8"/><rect x="8" y="10" width="40" height="30" rx="9"/><circle cx="20" cy="23" r="3"/><circle cx="36" cy="23" r="3"/><path d="M20 32h16M4 20v12M52 20v12"/></svg><i>→</i>' + this.feedback(view.result) + '</div><div class="gtw843-secret-row">' + (found ? this.letters(view.found, view.found) : '<span aria-label="' + this.t("Từ bí mật được giữ kín", "Secret stays hidden") + '">🔒 · · · · · ·</span>') + '</div></div></section>';
    }
    const row = this.focusedRow(view);
    const a = view.phase === "match-example" ? view.comparison?.left : row?.word;
    const b = view.phase === "match-example" ? view.comparison?.right : (view.candidates || []).find(word => word !== a);
    if (!a || !b) return '<section class="gtw843-panel"><header><strong>match(a, b)</strong></header><div class="gtw843-comparison">' + this.letters(a) + '<div class="gtw843-ready">🔒 → ? /6</div></div></section>';
    const count = this.matches(a, b);
    const connectors = [...a].map((letter, i) => '<i class="' + (letter === b[i] ? "match" : "miss") + '">' + (letter === b[i] ? "✓" : "×") + '</i>').join("");
    return '<section class="gtw843-panel"><header><strong>match(a, b)</strong><span>' + count + '/6</span></header><div class="gtw843-comparison">' + this.letters(a, b) + '<div class="gtw843-connectors">' + connectors + '</div>' + this.letters(b, a) + '</div></section>';
  }

  buckets(view) {
    const row = this.focusedRow(view);
    if (!row || view.phase === "found" || view.result === 6) return "";
    const actual = ["guess", "filter"].includes(view.phase) ? view.result : null;
    const boxes = row.groups.map((words, i) => {
      const worst = row.counts[i] === row.worst && row.worst > 0;
      const dots = words.slice(0, 8).map(word => '<i title="' + this.escape(word) + '"></i>').join("") + (words.length > 8 ? '<em>+' + (words.length - 8) + '</em>' : "");
      return '<div class="gtw843-chart-bucket' + (worst ? " worst" : "") + (i === actual ? " actual" : "") + '" data-bucket="' + i + '" data-count="' + words.length + '" title="' + this.escape(words.join(", ") || "∅") + '"><small>' + i + '</small><div>' + (dots || '<span>∅</span>') + '</div><b>' + words.length + '</b></div>';
    }).join("");
    return '<section class="gtw843-panel"><header><strong>' + this.escape(row.word) + ' → 0…6</strong><span>' + this.t("đỏ = nhóm lớn nhất", "red = largest group") + '</span></header><div class="gtw843-bucket-grid">' + boxes + '</div><small class="gtw843-self-note">' + this.t("★ bỏ chính từ đang xét", "★ skip the guess itself") + '</small></section>';
  }

  candidates(view) {
    const words = view.previousCandidates || view.candidates || [];
    const guess = this.focusedRow(view)?.word || view.comparison?.left || view.activeWord || view.bestWord;
    const kept = new Set(view.kept || []);
    const removed = new Set(view.removed || []);
    const recorded = new Map((view.candidateMatches || []).map(entry => [entry.word, entry.m]));
    const cards = words.map(word => {
      const count = recorded.get(word) ?? (guess ? this.matches(word, guess) : null);
      const state = removed.has(word) ? " removed" : kept.has(word) || view.found === word ? " kept" : word === guess ? " active" : "";
      const self = word === guess && ["score", "choose"].includes(view.phase);
      return '<article class="gtw843-word' + state + '" data-word="' + this.escape(word) + '" data-matches="' + (count ?? "pending") + '"><div>' + this.letters(word, guess) + '<span class="gtw843-match-dots" aria-label="' + (count ?? "?") + '/6">' + Array.from({ length: 6 }, (_, i) => '<i class="' + (i < count ? "on" : "") + '"></i>').join("") + '</span></div><b>' + (self ? "★" : (removed.has(word) ? "× " : kept.has(word) ? "✓ " : "") + (count ?? "?")) + '</b></article>';
    }).join("");
    const before = words.length;
    const after = view.phase === "filter" ? kept.size : (view.candidates || []).length;
    return '<section class="gtw843-panel gtw843-pool"><header><strong>' + this.t("Ứng viên", "Candidates") + '</strong><span>' + (view.phase === "filter" ? before + " → " + after : after) + '</span></header>' + (view.phase === "filter" ? '<div class="gtw843-filter-rule">' + this.t("Giữ đúng", "Keep exactly") + ' <b>' + view.result + '/6</b><span>✓ ' + kept.size + ' · × ' + removed.size + '</span></div>' : "") + '<div class="gtw843-words">' + (cards || "∅") + '</div></section>';
  }

  ranking(view) {
    let rows = view.scoreRows || [];
    if (!rows.length || view.phase === "found") return "";
    if (view.phase === "score") rows = rows.slice(0, rows.findIndex(row => row.word === view.activeWord) + 1);
    const peak = Math.max(1, ...rows.map(row => row.worst));
    return '<details class="gtw843-ranking"' + (["score", "choose"].includes(view.phase) ? " open" : "") + '><summary>Minimax · ' + this.t("nhóm lớn nhất càng nhỏ càng tốt", "smaller worst group is better") + '</summary><div>' + rows.map(row => '<div class="gtw843-score-row' + (row.word === view.bestWord ? " best" : "") + '" data-word="' + this.escape(row.word) + '" data-worst="' + row.worst + '"><b>' + this.escape(row.word) + '</b><span><i style="width:' + (row.worst / peak * 100) + '%"></i></span><strong>' + row.worst + '</strong>' + (row.word === view.bestWord ? '<em>★</em>' : '<em></em>') + '</div>').join("") + '</div></details>';
  }

  history(view) {
    const history = view.history || [];
    if (!history.length) return "";
    return '<div class="gtw843-history">' + history.map(item => '<span title="' + item.before + " → " + item.after + '"><small>#' + item.round + '</small><b>' + this.escape(item.guess) + '</b><i>→</i><strong>' + item.result + '/6</strong></span>').join("") + '</div>';
  }

  render(step) {
    const view = step.guessWord843View;
    if (!view) return;
    const found = view.phase === "found";
    this.host.innerHTML = '<section class="gtw843-viz"><header class="gtw843-heading"><strong>843 · ' + this.t("Đoán từ", "Guess the Word") + '</strong><span>' + (found ? "✓ " + this.escape(view.found) : "🔒 6") + '</span></header>' + this.pipeline(view, step) + this.comparison(view) + (found ? '<div class="gtw843-found">✓ ' + this.escape(view.found) + '</div>' : this.buckets(view) + this.candidates(view) + this.ranking(view)) + this.history(view) + '</section>';
  }
}

function renderGuessTheWord843View(step) {
  new GuessTheWord843Visualizer({ host: $("treeView"), language: lang, escape: escapeHtml }).render(step);
}
