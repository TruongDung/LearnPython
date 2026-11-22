"use strict";

function renderBalancedString1653View(step) {
  const v = step.balancedString1653View;
  const text = (vi, en) => lang === "vi" ? vi : en;
  const host = $("treeView");
  const final = v.answer !== null;
  const current = !final && !["init-dp", "init-b", "exhausted"].includes(v.phase) ? v.i : null;
  const removed = new Set(v.removed);
  const tiles = (prefix, deleted, mini = false) => [...prefix].map((letter, index) => {
    const crossed = deleted.has(index);
    if (mini) return `<span class="bs1653-mini ${letter}${crossed ? ' removed' : ''}" aria-label="${index}: ${letter}${crossed ? text(', bỏ', ', deleted') : ''}">${letter}</span>`;
    return `<div class="bs1653-cell ${letter}${crossed ? ' removed' : ''}${index >= v.processed ? ' unread' : ' checked'}${index === current ? ' current' : ''}" aria-label="s[${index}] = ${letter}${crossed ? text(', bỏ', ', deleted') : ''}"><span class="bs1653-pointer">${index === current ? 'i' : ''}</span><small>${index}</small><b>${letter}</b><span>${crossed ? '×' : index < v.processed ? '✓' : '·'}</span></div>`;
  }).join('');
  const c = v.candidates;
  const branch = kind => {
    const ready = c && (kind === "a" || c.deleteB !== null);
    const cost = ready ? kind === "a" ? c.deleteA : c.deleteB : null;
    const chosen = c?.choice === kind;
    const deleted = ready ? new Set(kind === "a" ? c.removeA : c.removeB) : new Set(kind === "a" ? [1] : [0]);
    const prefix = ready ? v.s.slice(0, v.i + 1) : "ba";
    return `<article class="bs1653-branch${chosen ? ' selected' : ''}${!ready ? ' pending' : ''}"><header><b>${kind === 'a' ? text('Bỏ a này', 'Delete this a') : text('Bỏ b trước', 'Delete earlier b')}</b><strong>${cost ?? '?'}</strong></header><div class="bs1653-formula">${ready ? kind === 'a' ? `${c.previous} + 1 = ${c.deleteA}` : `b_count = ${c.deleteB}` : kind === 'a' ? 'deletions + 1' : 'b_count'}</div><div class="bs1653-mini-scroll"><div>${tiles(prefix, deleted, true)}</div></div><footer>${chosen ? `✓ ${text('Chọn', 'Chosen')}${c.deleteA === c.deleteB ? ` · ${text('bằng nhau', 'tie')}` : ''}` : ready ? text('Phương án', 'Candidate') : text('Khi gặp a', 'On an a')}</footer></article>`;
  };
  const kept = [...v.s.slice(0, v.processed)].filter((_, index) => !removed.has(index)).join('');
  const rack = v.allB.slice(-8).map(index => `<span class="bs1653-mini b${removed.has(index) ? ' counted-deleted' : ''}" title="s[${index}] = b">b</span>`).join('');
  const presets = ['aababbab', 'bbaaa', 'ba', 'aaabbb', 'bbbb'];
  host.innerHTML = `<section class="bs1653-viz" aria-label="${text('1653 · Xóa ít nhất để cân bằng chuỗi', '1653 · Minimum deletions for a balanced string')}">
    <header class="bs1653-head"><div><small>1653 · DYNAMIC PROGRAMMING</small><h2>${text('Giữ a trước, b sau', 'Keep a first, then b')}</h2></div><div class="bs1653-total"><strong>${v.deletions}</strong><span>${text('lần xóa', 'deletions')}</span></div></header>
    <div class="bs1653-row-head"><b>s</b><span>${v.processed} / ${v.s.length}</span></div>
    <div class="bs1653-strip"><div class="bs1653-cells">${tiles(v.s, removed)}</div></div>
    <div class="bs1653-legend"><span>i · ${text('đang đọc', 'current')}</span><span>× · ${text('bỏ', 'delete')}</span><span>✓ · ${text('giữ', 'keep')}</span></div>
    <div class="bs1653-b-count"><code>b_count = ${v.bCount ?? '—'}</code><div>${v.allB.length > 8 ? `<small>+${v.allB.length - 8}</small>` : ''}${rack || '<span>∅</span>'}</div></div>
    <div class="bs1653-choices" aria-label="${text('Hai cách xử lý a', 'Two ways to handle a')}">${branch('a')}<span class="bs1653-min">min</span>${branch('b')}</div>
    <div class="bs1653-kept${final ? ' final' : ''}"><header><b>${final ? text('Một kết quả tối ưu', 'One optimal result') : text('Giữ lại trong tiền tố đã xét', 'Kept in the processed prefix')}</b><span>✓ a* b*</span></header><div>${kept ? [...kept].map(ch => `<span class="bs1653-mini ${ch}">${ch}</span>`).join('') : '<span class="bs1653-empty">∅</span>'}</div>${!final ? `<small>${text('Phương án có thể đổi ở bước sau.', 'The plan may change at a later step.')}</small>` : `<small>${text('Đã xóa', 'Deleted')} ${v.removed.length} · ${text('giữ', 'kept')} ${kept.length}</small>`}</div>
    <div class="bs1653-debug" aria-live="polite"><header><b>${text('Dòng', 'Line')} ${v.line}</b><span>i = ${v.i ?? '—'} · ch = ${v.ch === null ? '—' : `'${v.ch}'`}</span></header><div><code>${escapeHtml(v.source)}</code>${v.condition !== null ? `<b class="${v.condition ? 'yes' : 'no'}">${v.condition ? 'True' : 'False'}</b>` : c?.choice && v.phase === 'choose' ? `<b>min(${c.deleteA}, ${c.deleteB}) = ${v.deletions}</b>` : final ? `<b>${v.answer}</b>` : ''}</div></div>
    <nav class="bs1653-actions" aria-label="${text('Debug từng dòng', 'Line-by-line debug')}">${[['reset', text('Làm lại', 'Restart')], ['line', text('Dòng tiếp', 'Next line') + ' <kbd>F10</kbd>'], ['char', text('Ký tự tiếp', 'Next character')], ['last', text('Kết quả', 'Result')]].map(([action, label]) => `<button type="button" data-bs1653-nav="${action}"${(action === 'reset' ? stepIndex === 0 : stepIndex >= steps.length - 1) ? ' disabled' : ''}>${label}</button>`).join('')}</nav>
    <details class="bs1653-history"><summary>${text('Xem lại từng tiền tố', 'Replay each prefix')} · dp</summary><div>${v.history.map(entry => `<button type="button" data-bs1653-history="${entry.step}" aria-label="i = ${entry.i}, ch = ${entry.ch}, deletions = ${entry.deletions}"><small>${entry.i}</small><span class="${entry.ch}">${entry.ch}</span><b>${entry.deletions}</b></button>`).join('') || '∅'}</div></details>
    <nav class="bs1653-presets" aria-label="${text('Ví dụ nhanh', 'Quick examples')}"><span>${text('Thử', 'Try')}</span>${presets.map(s => `<button type="button" data-bs1653-preset="${s}" aria-pressed="${s === v.s}">${s}</button>`).join('')}</nav>
  </section>`;
  const strip = host.querySelector('.bs1653-strip');
  const pointer = strip.querySelector('.current');
  if (pointer) strip.scrollLeft = Math.max(0, pointer.offsetLeft - strip.clientWidth / 2 + pointer.clientWidth / 2);
  const go = index => { stopPlay(); stepIndex = index; renderStep(); };
  host.querySelectorAll('[data-bs1653-nav]').forEach(button => button.addEventListener('click', () => {
    const action = button.dataset.bs1653Nav;
    if (action === 'reset') return go(0);
    if (action === 'last') return go(steps.length - 1);
    if (action === 'char') {
      const index = steps.findIndex((frame, idx) => idx > stepIndex && frame.balancedString1653View?.phase === 'read');
      return go(index < 0 ? steps.length - 1 : index);
    }
    go(Math.min(stepIndex + 1, steps.length - 1));
  }));
  host.querySelectorAll('[data-bs1653-history]').forEach(button => button.addEventListener('click', () => go(Number(button.dataset.bs1653History))));
  host.querySelectorAll('[data-bs1653-preset]').forEach(button => button.addEventListener('click', () => {
    stopPlay(); $('arrInput').value = button.dataset.bs1653Preset; runViz();
  }));
}

function setupBalancedString1653CodeTheme() {
  const oldToolbar = document.getElementById('bs1653CodeTheme');
  const panel = $('codePanel');
  if (Number(problemData?.id) !== 1653) {
    oldToolbar?.remove(); delete panel.dataset.bs1653Theme; return;
  }
  const text = (vi, en) => lang === 'vi' ? vi : en;
  let saved = null;
  try { saved = localStorage.getItem('bs1653CodeTheme'); } catch (_) { /* Optional preference. */ }
  const selected = ['light', 'dark'].includes(saved) ? saved : document.documentElement.dataset.theme === 'light' ? 'light' : 'dark';
  const toolbar = oldToolbar || document.createElement('div');
  toolbar.id = 'bs1653CodeTheme'; toolbar.className = 'bs1653-code-theme';
  toolbar.setAttribute('role', 'group'); toolbar.setAttribute('aria-label', text('Theme code', 'Code theme'));
  toolbar.innerHTML = `<span>Code</span><button type="button" data-bs1653-theme="light">☀ ${text('Sáng', 'Light')}</button><button type="button" data-bs1653-theme="dark">☾ ${text('Tối', 'Dark')}</button>`;
  panel.parentElement.querySelector('.code-mode-bar').appendChild(toolbar);
  const apply = theme => {
    panel.dataset.bs1653Theme = theme;
    toolbar.querySelectorAll('button').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.bs1653Theme === theme)));
  };
  toolbar.querySelectorAll('button').forEach(button => button.addEventListener('click', () => {
    apply(button.dataset.bs1653Theme);
    try { localStorage.setItem('bs1653CodeTheme', button.dataset.bs1653Theme); } catch (_) { /* Optional preference. */ }
  }));
  apply(selected);
}
