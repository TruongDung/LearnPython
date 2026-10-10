"use strict";

const WS1915_COPY = {
  en: {
    eyebrow: "#1915 · GOOGLE PREFIX-XOR INTERVIEW",
    invariant: "Wonderful ⇔ prefix XOR has at most one set bit",
    even: "even", odd: "odd", answer: "answer", exact: "all even",
    oneOdd: "one odd", added: "added now", probes: "11 candidate prefix masks",
    counter: "Prefix counter (stored so far)", matches: "Wonderful substrings ending here",
    empty: "No match for this lookup yet", same: "same mask", flip: "flip",
    pending: "pending", hit: "hit", miss: "miss", positions: "prefix positions",
  },
  vi: {
    eyebrow: "#1915 · PHỎNG VẤN GOOGLE · PREFIX XOR",
    invariant: "Wonderful ⇔ prefix XOR có nhiều nhất một bit 1",
    even: "chẵn", odd: "lẻ", answer: "đáp án", exact: "tất cả chẵn",
    oneOdd: "một chữ lẻ", added: "cộng ở vị trí này", probes: "11 prefix mask cần tra",
    counter: "Bộ đếm prefix đã lưu", matches: "Wonderful substring kết thúc tại đây",
    empty: "Phép tra này chưa có kết quả khớp", same: "cùng mask", flip: "lật",
    pending: "chưa tra", hit: "trúng", miss: "không có", positions: "vị trí prefix",
  },
};

function ws1915Escape(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[char]);
}

function ws1915Text(value) {
  if (value && typeof value === "object") return value[lang] ?? value.en ?? value.vi ?? "";
  return value ?? "";
}

function renderWonderful1915View(step) {
  const view = step.wonderful1915View;
  if (!view) return;
  const copy = WS1915_COPY[lang] || WS1915_COPY.en;
  const word = String(view.word || "");
  const probes = Array.isArray(view.probes) ? view.probes : [];
  const buckets = Array.isArray(view.frequencyEntries) ? view.frequencyEntries : [];
  const matches = Array.isArray(view.matchesCurrent) ? view.matchesCurrent : [];
  const added = Number(view.exactContribution || 0) + Number(view.oneBitContribution || 0);

  const wordHtml = [...word].map((char, index) => {
    const state = index === view.index && !view.final ? " is-current" : index < view.index || view.final ? " is-done" : "";
    return `<div class="ws1915-char${state}"><span>${index}</span><b>${ws1915Escape(char)}</b></div>`;
  }).join("");

  const bitsHtml = Array.from({ length: 10 }, (_, bit) => {
    const letter = String.fromCharCode(97 + bit);
    const odd = Boolean(Number(view.mask || 0) & (1 << bit));
    const active = view.char === letter ? " is-active" : "";
    return `<div class="ws1915-bit ${odd ? "is-odd" : "is-even"}${active}">
      <b>${letter}</b><span>${odd ? 1 : 0}</span><small>${odd ? copy.odd : copy.even}</small>
    </div>`;
  }).join("");

  const probesHtml = probes.map((probe) => {
    const state = probe.active ? "is-active" : !probe.evaluated ? "is-pending" : probe.count ? "is-hit" : "is-miss";
    const label = probe.kind === "same" ? copy.same : `${copy.flip} ${probe.letter}`;
    const status = !probe.evaluated ? copy.pending : probe.count ? `${copy.hit} ×${probe.count}` : copy.miss;
    return `<div class="ws1915-probe ${state}">
      <div><strong>${ws1915Escape(label)}</strong><span>${ws1915Escape(status)}</span></div>
      <code>${ws1915Escape(probe.binary)}</code>
    </div>`;
  }).join("");

  const counterHtml = buckets.map((bucket) => `<div class="ws1915-bucket${bucket.mask === view.mask ? " is-current" : ""}">
    <code>${ws1915Escape(bucket.binary)}</code>
    <span>{${bucket.oddLetters.length ? bucket.oddLetters.join(",") : "∅"}}</span>
    <b>×${bucket.count}</b>
    <small>${copy.positions}: ${bucket.positions.join(", ")}</small>
  </div>`).join("");

  const matchesHtml = matches.length ? matches.map((match) => `<div class="ws1915-match">
    <strong>word[${match.start}..${match.end}]</strong><code>${ws1915Escape(match.text)}</code>
    <span>${match.oddLetters.length ? `${copy.odd}: ${match.oddLetters.join(", ")}` : copy.exact}</span>
  </div>`).join("") : `<p class="ws1915-empty">${copy.empty}</p>`;

  $("treeView").innerHTML = `<section class="ws1915-viz">
    <header class="ws1915-header">
      <div><p>${copy.eyebrow}</p><h3>${ws1915Escape(ws1915Text(step.title))}</h3></div>
      <div class="ws1915-line">L${view.line}<code>${ws1915Escape(view.source)}</code></div>
    </header>
    <div class="ws1915-invariant"><span>INVARIANT</span><strong>${copy.invariant}</strong><code>popcount(P[r] ⊕ P[l−1]) ≤ 1</code></div>
    <div class="ws1915-word">${wordHtml}</div>
    <div class="ws1915-mask"><div><small>mask</small><code>${ws1915Escape(view.binary)}</code></div>${bitsHtml}</div>
    <div class="ws1915-stats">
      <div><small>${copy.exact}</small><b>+${view.exactContribution || 0}</b></div>
      <div><small>${copy.oneOdd}</small><b>+${view.oneBitContribution || 0}</b></div>
      <div><small>${copy.added}</small><b>+${added}</b></div>
      <div class="is-answer"><small>${copy.answer}</small><b>${view.answer || 0}</b></div>
    </div>
    <div class="ws1915-grid">
      <article class="ws1915-panel"><h4>${copy.probes}</h4><div class="ws1915-probes">${probesHtml}</div></article>
      <article class="ws1915-panel"><h4>${copy.counter}</h4><div class="ws1915-counter">${counterHtml}</div></article>
    </div>
    <article class="ws1915-panel ws1915-matches"><h4>${copy.matches}</h4><div>${matchesHtml}</div></article>
  </section>`;
}
