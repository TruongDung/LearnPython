function renderUniqueEmail929View(step) {
  const v = step.uniqueEmail929View;
  const text = (vi, en) => lang === "vi" ? vi : en;
  const esc = value => escapeHtml(String(value));
  const done = Boolean(step.final);
  const phase = { init: -1, take: 0, split: 1, cut: 2, dots: 3, join: 4, add: 5, "loop-end": 5, done: 5 }[v.phase];
  const mailIcon = '<svg viewBox="0 0 32 26" fill="none" aria-hidden="true"><rect x="2" y="3" width="28" height="21" rx="4" stroke="currentColor" stroke-width="2"/><path d="m3 5 13 10L29 5" stroke="currentColor" stroke-width="2"/></svg>';
  const group = address => Math.max(0, v.seen.indexOf(address));
  function localTiles(value, cutPlus, removeDots) {
    const plus = value.indexOf("+");
    return [...value].map((ch, index) => {
      const ignored = cutPlus && plus >= 0 && index >= plus;
      const dot = !ignored && removeDots && ch === ".";
      return `<span class="ue929-char${ignored ? " ignored" : dot ? " removed" : ch === "." ? " dot" : ""}">${esc(ch)}</span>`;
    }).join("");
  }
  const queue = v.emails.map((email, index) => {
    const processed = v.history.find(item => item.index === index);
    const current = !done && index === v.index;
    return `<div class="ue929-email${current ? " current" : ""}${processed ? " processed" : ""}"><span class="ue929-number">${index + 1}</span><code>${esc(email)}</code><span class="ue929-email-status">${processed ? `<span class="ue929-group" style="--group:${group(processed.normalized) % 5}">→ ${group(processed.normalized) + 1}</span>` : current ? "↓" : "○"}</span></div>`;
  }).join("");
  const stageLabels = [text("Tách @", "Split @"), text("Cắt +", "Cut +"), text("Bỏ .", "Remove ."), text("Ghép → set", "Join → set")];
  const activeStage = phase <= 1 ? 0 : phase === 2 ? 1 : phase === 3 ? 2 : 3;
  let workshop = "";
  if (!done && v.index !== null) {
    const [inputLocal, inputDomain] = v.emails[v.index].split("@");
    workshop = `<section class="ue929-work" aria-label="${text("Xử lý email hiện tại", "Process the current email")}">
      <div class="ue929-stages">${stageLabels.map((label, index) => `<span class="${index === activeStage ? "active" : index < activeStage ? "complete" : ""}"><b>${index < activeStage ? "✓" : index + 1}</b>${label}</span>`).join("")}</div>
      <div class="ue929-parts"><div class="ue929-local"><small>local</small><div class="ue929-characters">${localTiles(inputLocal, phase >= 2, phase >= 3)}</div></div><b class="ue929-at">@</b><div class="ue929-domain"><small>domain · ${text("giữ nguyên", "unchanged")}</small><code>${esc(inputDomain)}</code></div></div>
      <div class="ue929-transforms">
        <div class="ue929-transform${phase === 2 ? " active" : ""}"><span class="ue929-operation">+… → ∅</span><code>${v.cutLocal === null ? "…" : esc(v.cutLocal || "''")}</code>${phase >= 2 ? '<b>✓</b>' : '<span>○</span>'}</div>
        <div class="ue929-transform${phase === 3 ? " active" : ""}"><span class="ue929-operation">. → ∅</span><code>${v.cleanLocal === null ? "…" : esc(v.cleanLocal || "''")}</code>${phase >= 3 ? '<b>✓</b>' : '<span>○</span>'}</div>
      </div>
      <div class="ue929-normalized${phase >= 5 ? " inserted" : ""}"><small>normalized</small>${v.normalized === null ? '<code>…</code>' : `<code><span>${esc(v.cleanLocal)}</span><span class="ue929-domain-text">@${esc(v.domain)}</span></code>`}<span>${phase >= 5 ? v.duplicate ? text("↳ Trùng · +0", "↳ Duplicate · +0") : text("✓ Mới · +1", "✓ New · +1") : phase === 4 ? text("Chờ seen.add", "Await seen.add") : ""}</span></div>
    </section>`;
  }
  const mailboxes = v.seen.map((address, index) => {
    const members = v.history.filter(item => item.normalized === address);
    const highlighted = !done && v.normalized === address && phase >= 5;
    return `<div class="ue929-mailbox${highlighted ? " highlighted" : ""}" style="--group:${index % 5}"><div class="ue929-mailbox-icon">${mailIcon}<b>${index + 1}</b></div><code>${esc(address)}</code><span>${members.map(member => `<span class="ue929-member">#${member.index + 1}</span>`).join("")}</span></div>`;
  }).join("");
  const summary = done ? `<div class="ue929-mapping">${v.history.map(item => `<div><span class="ue929-number">${item.index + 1}</span><code>${esc(item.email)}</code><b>→</b><span class="ue929-group" style="--group:${group(item.normalized) % 5}">${mailIcon}<b>${group(item.normalized) + 1}</b></span><span class="${item.duplicate ? "ue929-duplicate" : "ue929-new"}">${item.duplicate ? text("trùng · +0", "duplicate · +0") : text("mới · +1", "new · +1")}</span></div>`).join("")}</div>` : "";
  $("treeView").innerHTML = `<section class="ue929-viz" aria-label="${text("929 · Email duy nhất", "929 · Unique email addresses")}">
    <header><div>${mailIcon}<div><small>929 · ${text("Email duy nhất", "Unique emails")}</small><strong>${v.history.length} / ${v.emails.length}</strong></div></div><div class="ue929-count"><b>${v.seen.length}</b><small>${text("hộp thư", "mailboxes")}</small></div></header>
    <div class="ue929-line"><b>L${v.line}</b><code>${esc(v.source)}</code></div>
    ${!done ? `<div class="ue929-queue">${queue}</div>` : summary}
    ${workshop}
    <section class="ue929-set" aria-label="${text("Các hộp thư duy nhất trong seen", "Unique mailboxes in seen")}"><header><strong>seen</strong><small>${text("Mỗi địa chỉ chỉ 1 lần", "Each address only once")}</small></header><div>${mailboxes || '<span class="ue929-empty">∅</span>'}</div></section>
    ${done ? `<div class="ue929-result" role="status">len(seen) = <b>${v.answer}</b> ✓</div>` : `<div class="ue929-legend"><span><i class="removed">.</i> ${text("bỏ trong local", "remove in local")}</span><span><i class="ignored">+…</i> ${text("bỏ từ +", "discard from +")}</span><span class="ue929-domain-text">@domain · ${text("giữ nguyên", "unchanged")}</span></div>`}
  </section>`;
}
