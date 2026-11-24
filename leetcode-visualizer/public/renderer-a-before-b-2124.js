"use strict";

function renderABeforeB2124View(step) {
  const v = step.aBeforeB2124View;
  const text = (vi, en) => lang === "vi" ? vi : en;
  const host = $("treeView");
  const final = v.answer !== null;
  const active = !final && !["init", "exhausted"].includes(v.phase) ? v.i : null;
  const rejected = Boolean(v.conflict);
  const bool = value => value ? "True" : "False";
  const presets = ["aaabbb", "aababb", "bbb", "aaa", "ba"];
  const canNext = stepIndex < steps.length - 1;
  const cells = [...v.s].map((letter, index) => {
    const bad = v.conflict && (index === v.conflict.b || index === v.conflict.a);
    const visited = index < v.processed;
    const marker = index === active ? "i" : index === v.firstB ? text("b đầu", "first b") : "";
    return `<div class="ab2124-cell ${letter}${visited ? " visited" : ""}${index === active ? " current" : ""}${bad ? " conflict" : ""}" aria-label="s[${index}] = ${letter}${index === active ? text(', đang đọc', ', current') : ''}"><span class="ab2124-pointer">${marker}</span><small>${index}</small><b>${letter}</b><span class="ab2124-check">${bad ? "×" : visited ? "✓" : "·"}</span></div>`;
  }).join("");
  const witness = v.conflict
    ? `<div class="ab2124-witness"><span class="ab2124-mini b"><small>${v.conflict.b}</small><b>b</b></span><svg viewBox="0 0 80 32" aria-hidden="true"><path d="M2 16H72M61 6l11 10-11 10"/></svg><span class="ab2124-mini a"><small>${v.conflict.a}</small><b>a</b></span><strong>× ${text("Sai thứ tự", "Wrong order")}</strong></div>`
    : `<div class="ab2124-witness"><span class="ab2124-symbol">${final ? "✓" : v.seenB ? "⚑" : "…"}</span><strong>${final ? text("Mọi a đều trước b", "Every a precedes b") : v.seenB ? text("Từ đây chỉ nhận b", "Only b from here") : text("Chưa gặp b", "No b seen yet")}</strong></div>`;
  const condition = v.condition
    ? `<code>${escapeHtml(v.condition.expression)}</code><strong class="${v.condition.value ? "yes" : "no"}">${bool(v.condition.value)}</strong>`
    : `<code>${escapeHtml(v.source)}</code><strong>${v.answer === null ? v.phase === "remember-b" ? "True" : "—" : bool(v.answer)}</strong>`;
  host.innerHTML = `<section class="ab2124-viz" aria-label="${text('2124 · a trước b', '2124 · a before b')}">
    <header class="ab2124-head"><div><small>2124 · STRING SCAN</small><h2>${text("a trước, b sau", "a first, then b")}</h2></div><span class="ab2124-progress">${v.processed} / ${v.s.length}</span></header>
    <div class="ab2124-rule" aria-label="${text('Thứ tự hợp lệ và không hợp lệ', 'Valid and invalid order')}"><span><i class="a">a</i><i class="a">a</i><i class="a">a</i><span>→</span><i class="b">b</i><i class="b">b</i><b class="yes">✓</b></span><span><i class="b">b</i><i class="a">a</i><b class="no">×</b></span></div>
    <div class="ab2124-strip" role="group" aria-label="${text('Chuỗi và con trỏ i', 'String and pointer i')}"><div class="ab2124-cells">${cells}</div></div>
    <div class="ab2124-legend"><span>i · ${text("đang đọc", "current")}</span><span>✓ · ${text("đã xét", "checked")}</span><span>· · ${text("chưa xét", "unread")}</span></div>
    <div class="ab2124-machine" aria-label="seen_b = ${bool(v.seenB)}">
      <div class="ab2124-state a${!v.seenB ? ' active' : ''}"><small>seen_b = False</small><b>a</b><span>a ↻</span></div>
      <div class="ab2124-transition${v.phase === 'remember-b' ? ' active' : ''}"><b>b</b><svg viewBox="0 0 100 24" aria-hidden="true"><path d="M2 12H94M83 2l11 10-11 10"/></svg></div>
      <div class="ab2124-state b${v.seenB ? ' active' : ''}${rejected ? ' rejected' : ''}"><small>seen_b = True</small><b>b</b><span>b ↻ <em>a ×</em></span></div>
    </div>
    <div class="ab2124-outcome${rejected ? ' rejected' : final ? ' accepted' : ''}" aria-live="polite">${witness}${final ? `<span class="ab2124-answer">${bool(v.answer)}</span>` : ''}</div>
    <div class="ab2124-debug"><header><b>${text("Dòng", "Line")} ${v.line}</b><span>i = ${v.i ?? "—"} · ch = ${v.ch === null ? "—" : `'${v.ch}'`}</span></header><div class="ab2124-condition">${condition}</div></div>
    <nav class="ab2124-actions" aria-label="${text('Debug từng dòng', 'Line-by-line debug')}"><button type="button" data-ab2124-nav="reset"${stepIndex === 0 ? ' disabled' : ''}>${text("Làm lại", "Restart")}</button><button type="button" data-ab2124-nav="line"${!canNext ? ' disabled' : ''}>${text("Dòng tiếp", "Next line")} <kbd>F10</kbd></button><button type="button" data-ab2124-nav="char"${!canNext ? ' disabled' : ''}>${text("Ký tự tiếp", "Next character")}</button><button type="button" data-ab2124-nav="last"${!canNext ? ' disabled' : ''}>${text("Kết quả", "Result")}</button></nav>
    <nav class="ab2124-presets" aria-label="${text('Ví dụ nhanh', 'Quick examples')}"><span>${text("Thử", "Try")}</span>${presets.map(s => `<button type="button" data-ab2124-preset="${s}" aria-pressed="${s === v.s}">${s}</button>`).join('')}</nav>
  </section>`;

  const strip = host.querySelector(".ab2124-strip");
  const pointer = strip.querySelector(".current") || strip.querySelector(".conflict:last-child");
  if (pointer) strip.scrollLeft = Math.max(0, pointer.offsetLeft - strip.clientWidth / 2 + pointer.clientWidth / 2);
  host.querySelectorAll("[data-ab2124-nav]").forEach(button => button.addEventListener("click", () => {
    stopPlay();
    const action = button.dataset.ab2124Nav;
    if (action === "reset") stepIndex = 0;
    else if (action === "last") stepIndex = steps.length - 1;
    else if (action === "char") {
      const next = steps.findIndex((frame, index) => index > stepIndex && frame.aBeforeB2124View?.phase === "read");
      stepIndex = next < 0 ? steps.length - 1 : next;
    } else stepIndex = Math.min(stepIndex + 1, steps.length - 1);
    renderStep();
  }));
  host.querySelectorAll("[data-ab2124-preset]").forEach(button => button.addEventListener("click", () => {
    stopPlay();
    $("arrInput").value = button.dataset.ab2124Preset;
    runViz();
  }));
}

function setupABeforeB2124CodeTheme() {
  const oldToolbar = document.getElementById("ab2124CodeTheme");
  if (Number(problemData?.id) !== 2124) {
    oldToolbar?.remove();
    delete $("codePanel").dataset.ab2124Theme;
    return;
  }
  const text = (vi, en) => lang === "vi" ? vi : en;
  const panel = $("codePanel");
  let saved = null;
  try { saved = localStorage.getItem("ab2124CodeTheme"); } catch (_) { /* Theme works without storage. */ }
  const selected = saved === "light" || saved === "dark" ? saved : document.documentElement.dataset.theme === "light" ? "light" : "dark";
  const toolbar = oldToolbar || document.createElement("div");
  toolbar.id = "ab2124CodeTheme";
  toolbar.className = "ab2124-code-theme";
  toolbar.setAttribute("role", "group");
  toolbar.setAttribute("aria-label", text("Theme code", "Code theme"));
  toolbar.innerHTML = `<button type="button" data-ab2124-theme="light" title="${text("Nền code sáng", "Light code theme")}" aria-label="${text("Nền code sáng", "Light code theme")}"><span aria-hidden="true">☀</span></button><button type="button" data-ab2124-theme="dark" title="${text("Nền code tối", "Dark code theme")}" aria-label="${text("Nền code tối", "Dark code theme")}"><span aria-hidden="true">☾</span></button>`;
  panel.parentElement.querySelector(".code-mode-bar").appendChild(toolbar);
  const apply = theme => {
    panel.dataset.ab2124Theme = theme;
    toolbar.querySelectorAll("button").forEach(button => button.setAttribute("aria-pressed", String(button.dataset.ab2124Theme === theme)));
  };
  toolbar.querySelectorAll("button").forEach(button => button.addEventListener("click", () => {
    apply(button.dataset.ab2124Theme);
    try { localStorage.setItem("ab2124CodeTheme", button.dataset.ab2124Theme); } catch (_) { /* Optional preference. */ }
  }));
  apply(selected);
}
