function renderScoreParentheses856View(step) {
  const v = step.scoreParentheses856View;
  if (!v) return;
  const vi = lang === "vi", t = (a, b) => vi ? a : b, esc = escapeHtml;
  const done = Boolean(step.final), active = done ? null : v.index;
  const closingChar = active !== null && v.s[active] === ')';
  const matchedOpen = done ? null : v.closing?.open ?? (closingChar ? v.frames.at(-1)?.open : null);
  const merged = new Set(v.pairs.filter(pair => pair.merged).flatMap(pair => [pair.open, pair.close]));
  const calculated = new Set(v.pairs.filter(pair => !pair.merged).flatMap(pair => [pair.open, pair.close]));
  const chars = [...v.s].map((ch, index) => {
    const status = merged.has(index) ? 'merged' : calculated.has(index) ? 'calculated' : active !== null && index < active ? 'read' : 'future';
    return `<div class="sp856-char ${status}${index === active ? ' current' : ''}${index === matchedOpen ? ' matched' : ''}" data-index="${index}" aria-label="${esc(`${index}: ${ch}`)}"><small>${index === active ? 'i ↓' : index === matchedOpen ? '↔' : '&nbsp;'}</small><strong>${ch}</strong><span>${index}</span></div>`;
  }).join('');
  const frameHtml = [...v.frames].reverse().map((frame, i) => {
    const parentActive = v.event === 'merge' && i === 0;
    const frameTitle = frame.open === null ? t('Ô gốc · toàn chuỗi', 'Root · whole string') : `${t("Mở '(' tại", "Opened '(' at")} ${frame.open}`;
    const sum = frame.children.map(child => child.score).join(' + ') || '0';
    return `<li class="sp856-frame ${frame.open === null ? 'root' : ''}${i === 0 ? ' top' : ''}${parentActive ? ' updated' : ''}" data-level="${frame.level}"><div><small>${i === 0 ? t('ĐỈNH STACK', 'STACK TOP') + ' · ' : ''}[${frame.level}]</small><strong>${frameTitle}</strong><span>${esc(sum)}${frame.children.length > 1 ? ' = ' + frame.score : ''}</span></div><b>${frame.score}</b></li>`;
  }).join('');
  let formula = `<strong>${t('Mỗi dấu mở tạo một ô 0', 'Each opening creates a zero frame')}</strong><p>${t('Trong mỗi ô, cộng điểm các nhóm con đã đóng. Chỉ nhân đôi khi chính ô đó đóng.', 'Inside each frame, add closed child groups. Double the total only when that frame closes.')}</p>`;
  let mode = 'waiting';
  if (done) {
    const totals = v.frames[0].children.map(child => child.score);
    formula = `<span>${t('Ô gốc cộng các nhóm ngoài cùng', 'The root adds top-level groups')}</span><strong>${totals.join(' + ')}${totals.length > 1 ? ' = ' + v.answer : ''}</strong><p>${t('Không nhân đôi ô gốc: nó không có cặp ngoặc bao ngoài.', 'Do not double the root: there is no enclosing pair for it.')}</p>`;
    mode = 'complete';
  } else if (v.closing) {
    const pair = v.closing;
    if (v.event === 'pop') {
      formula = `<span>① POP · s[${pair.open}…${pair.close}]</span><strong>inner = ${pair.inner}</strong><p>${t('Ô con đã rời stack. Giữ điểm bên trong trong biến inner.', 'The child frame has left the stack. Its inside score is saved in inner.')}</p><small>${t('Chưa tính pair_score; chưa cộng vào ô cha.', 'pair_score not calculated; parent not updated.')}</small>`;
      mode = 'pop';
    } else if (v.event === 'calculate') {
      formula = `<span>② ${t('TÍNH ĐIỂM CẶP', 'CALCULATE PAIR SCORE')}</span><strong>${pair.inner === 0 ? '() = 1' : '2 × ' + pair.inner + ' = ' + pair.score}</strong><p>max(1, 2 × ${pair.inner}) = ${pair.score}</p><small>${t('Đã tính điểm, nhưng ô cha vẫn chưa nhận điểm này.', 'Score calculated, but the parent has not received it yet.')}</small>`;
      mode = 'calculate';
    } else {
      formula = `<span>③ ${t('CỘNG VÀO Ô CHA', 'ADD TO THE PARENT')}</span><strong>${pair.parentBefore} + ${pair.score} = ${v.stack.at(-1)}</strong><p>${pair.parentOpen === null ? t('Ô cha là ô gốc, cộng tổng điểm toàn chuỗi.', 'The parent is the root, which adds the whole string score.') : t(`Cộng vào ô '(' mở tại vị trí ${pair.parentOpen}.`, `Add to the '(' frame opened at ${pair.parentOpen}.`)}</p>`;
      mode = 'merge';
    }
  } else if (v.event === 'push') {
    formula = `<span>PUSH · s[${active}] = '('</span><strong>${t('Mở ô mới: 0 điểm', 'Open a new frame: score 0')}</strong><p>${t('Chưa có nhóm con hoàn tất bên trong ô này.', 'No child group has completed inside this frame yet.')}</p>`;
    mode = 'push';
  }
  const history = v.pairs.map((pair, i) => {
    const children = pair.childScores.length > 1 ? `(${pair.childScores.join(' + ')})` : String(pair.inner);
    const expression = pair.inner === 0 ? '() = 1' : `2 × ${children} = ${pair.score}`;
    const current = !done && v.closing?.close === pair.close;
    return `<li class="${pair.merged ? 'merged' : 'pending'}${current ? ' current' : ''}" data-open="${pair.open}" data-close="${pair.close}"><span class="sp856-number">${i + 1}</span><div><code>${esc(v.s.slice(pair.open, pair.close + 1))}</code><strong>${expression}</strong><small>[${pair.open}…${pair.close}] · ${pair.merged ? t('đã cộng vào ô cha', 'added to parent') : t('chờ cộng vào ô cha', 'awaiting parent addition')}</small></div></li>`;
  }).join('');
  $("treeView").innerHTML = `<article class="sp856-viz" role="region" aria-label="${t('Tính điểm ngoặc 856', 'Score of parentheses 856')}">
    <header class="sp856-heading"><div><small>856 · ${t('TỪ TRONG RA NGOÀI', 'INSIDE OUT')}</small><h3>${t('Đóng cặp nào, tính điểm cặp đó', 'Close a pair, calculate its score')}</h3><p>${t('Lồng ngoặc nhân đôi. Các nhóm cạnh nhau cộng điểm.', 'Nesting doubles. Adjacent groups add.')}</p></div><div class="sp856-total"><small>${done ? t('ĐÁP ÁN', 'ANSWER') : t('ĐIỂM Ô GỐC', 'ROOT SCORE')}</small><b>${v.stack[0] ?? '—'}</b></div></header>
    <div class="sp856-rules"><div><code>()</code><strong>1</strong><small>${t('Cặp rỗng', 'Empty pair')}</small></div><div><code>(A)</code><strong>2 × A</strong><small>${t('Bao ngoài nhân đôi', 'Enclosing doubles')}</small></div><div><code>AB</code><strong>A + B</strong><small>${t('Nối nhau cộng điểm', 'Adjacent adds')}</small></div></div>
    <section class="sp856-card sp856-input"><header><strong>${t('1 · Chuỗi đầu vào', '1 · Input string')}</strong><span>s = <code>${esc(v.s)}</code></span></header><div class="sp856-scroll">${chars}</div><div class="sp856-legend"><span class="current">${t('vàng: đang xét', 'yellow: current')}</span><span class="matched">${t('tím: dấu mở ghép cặp', 'purple: matching opening')}</span><span class="merged">${t('xanh: đã cộng điểm', 'green: score added')}</span></div></section>
    <div class="sp856-work"><section class="sp856-card"><header><strong>2 · STACK</strong><span>${v.stack.length} ${t('ô', 'frames')}</span></header><p>${t('Đỉnh ở trên. Mỗi ô là tổng điểm các nhóm con đã đóng.', 'Top first. Each frame sums completed child groups.')}</p><ol class="sp856-stack">${frameHtml || `<li class="sp856-empty">${t('Chưa khởi tạo', 'Not initialized')}</li>`}</ol><small>${t('Ô gốc là ô phụ để cộng toàn chuỗi, không phải một cặp ngoặc.', 'The root is a helper frame for the whole string, not a pair.')}</small></section><section class="sp856-card sp856-formula ${mode}"><header><strong>${t('3 · Pop → tính → cộng', '3 · Pop → calculate → add')}</strong></header>${formula}</section></div>
    <section class="sp856-card sp856-action"><strong>${esc(t(step.title.vi, step.title.en))}</strong><p>${esc(t(step.note.vi, step.note.en))}</p></section>
    <section class="sp856-card sp856-history"><header><strong>${t('4 · Những cặp đã tính điểm', '4 · Pairs whose scores have been calculated')}</strong><span>${v.pairs.length} ${t('cặp', 'pairs')}</span></header><ol>${history || `<li class="sp856-empty">${t('Chưa đóng cặp nào.', 'No pair closed yet.')}</li>`}</ol></section>
  </article>`;
  const strip = $("treeView").querySelector('.sp856-scroll'), target = strip?.querySelector('.sp856-char.current');
  if (target) {
    const a = strip.getBoundingClientRect(), b = target.getBoundingClientRect();
    if (b.left < a.left || b.right > a.right) strip.scrollLeft += b.left - a.left - strip.clientWidth / 2 + b.width / 2;
  }
}
