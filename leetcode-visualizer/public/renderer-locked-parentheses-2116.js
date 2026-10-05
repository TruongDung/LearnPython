function renderLockedParentheses2116View(step) {
  const v = step.lockedParentheses2116View;
  if (!v) return;
  const t = (vi, en) => lang === 'vi' ? vi : en, esc = escapeHtml, done = Boolean(step.final);
  const status = key => ({ pending: t('Chưa chạy', 'Pending'), running: t('Đang kiểm tra', 'Checking'), passed: t('Đạt', 'Passed'), failed: t('Không đạt', 'Failed') })[key];
  const original = [...v.s].map((ch, i) => {
    const locked = v.locked[i] === '1', failed = v.failure?.start <= i && i <= v.failure?.end;
    return `<div class="lp2116-char ${locked ? 'locked' : 'flexible'}${!done && v.index === i ? ' current' : ''}${failed ? ' impossible' : ''}" data-index="${i}"><small>${i}</small><b>${ch}</b><span>${locked ? '🔒 1' : '↔ 0'}</span></div>`;
  }).join('');
  function renderPass(direction) {
    const pass = v[direction], forward = direction === 'forward', active = v.phase === direction;
    const assumptions = new Map(pass.trail.map(item => [item.index, item.choice]));
    if (active && v.index !== null && v.choice !== null) assumptions.set(v.index, v.choice);
    const chars = [...v.s].map((ch, i) => `<div class="lp2116-char ${v.locked[i] === '0' ? 'flexible' : 'locked'}${active && !done && v.index === i ? ' current' : ''}${assumptions.has(i) ? ' checked' : ''}" data-pass="${direction}" data-pass-index="${i}"><small>${i}</small><b>${assumptions.get(i) ?? (v.locked[i] === '1' ? ch : '?')}</b><span>${v.locked[i] === '0' ? t('tự do', 'free') : t('khóa', 'fixed')}</span></div>`).join('');
    const last = pass.trail.at(-1);
    return `<section class="lp2116-card lp2116-pass ${pass.status}${active ? ' active' : ''}" data-direction="${direction}"><header><strong>${forward ? t('2 · Trái → phải', '2 · Left → right') : t('3 · Phải → trái', '3 · Right → left')} ${forward ? '→' : '←'}</strong><span>${status(pass.status)} · ${pass.trail.length}/${v.s.length}</span></header><p>${forward ? t("Vị trí tự do giả định '('. Mỗi prefix phải có đủ dấu mở.", "Assume '(' at editable positions. Every prefix needs enough openings.") : t("Vị trí tự do giả định ')'. Mỗi suffix phải có đủ dấu đóng.", "Assume ')' at editable positions. Every suffix needs enough closings.")}</p><div class="lp2116-scroll">${chars}</div><div class="lp2116-pass-balance"><code>balance</code><b>${active ? v.balance ?? '—' : last?.balance ?? '—'}</b><small>${last ? `${t('Lần cập nhật gần nhất', 'Latest update')}: ${last.before} ${last.delta > 0 ? '+' : '−'} 1 = ${last.balance}` : t('Chưa xử lý ký tự nào', 'No characters processed yet')}</small></div></section>`;
  }
  const failureText = v.failure?.kind === 'odd-length' ? t('Độ dài lẻ: không thể ghép hết thành cặp.', 'Odd length: complete pairs cannot cover the string.') : v.failure ? t(`Đoạn [${v.failure.start}…${v.failure.end}] thiếu dấu ${v.failure.kind === 'forward' ? 'mở ở bên trái' : 'đóng ở bên phải'}, dù đã ưu tiên mọi vị trí tự do.`, `Segment [${v.failure.start}…${v.failure.end}] lacks ${v.failure.kind === 'forward' ? 'openings to the left' : 'closings to the right'}, even with the most favorable editable choices.`) : '';
  const witness = v.witness === null ? '' : `<section class="lp2116-card lp2116-witness"><header><strong>${t('4 · Một cách sửa hợp lệ', '4 · One valid assignment')}</strong><code>${esc(v.witness)}</code></header><p>${t('Giữ nguyên mọi vị trí khóa. Tím: ký tự đã đổi · xanh lá: vị trí tự do giữ nguyên. Chuỗi này là minh họa riêng sau khi hai lượt kiểm tra đạt.', 'All locked positions stay unchanged. Purple: changed · green: editable but unchanged. This is a separate illustration after both checks pass.')}</p><div class="lp2116-scroll">${[...v.witness].map((ch, i) => `<div class="lp2116-char ${v.locked[i] === '1' ? 'locked' : ch !== v.s[i] ? 'changed' : 'unchanged'}" data-witness-index="${i}"><small>${i}</small><b>${ch}</b><span>${v.locked[i] === '1' ? '🔒' : ch !== v.s[i] ? `${v.s[i]} → ${ch}` : '='}</span></div>`).join('')}</div><p>${t('Số dấu mở = số dấu đóng; mọi prefix có số dấu mở ≥ số dấu đóng.', 'Openings and closings are equal; every prefix has at least as many openings as closings.')}</p></section>`;
  $("treeView").innerHTML = `<article class="lp2116-viz" role="region" aria-label="${t('Ngoặc khóa 2116', 'Locked parentheses 2116')}">
    <header class="lp2116-heading"><div><small>2116 · ${t('KHÓA HAY ĐƯỢC ĐỔI?', 'FIXED OR EDITABLE?')}</small><h3>${t('Kiểm tra cả hai phía', 'Check both directions')}</h3><p>${t('Mỗi vị trí 0 phải chọn ( hoặc ); không được xóa ký tự.', 'Each 0 position must become ( or ); deletion is not allowed.')}</p></div><div class="lp2116-answer ${done ? v.answer ? 'yes' : 'no' : ''}"><small>${t('KẾT QUẢ', 'RESULT')}</small><b>${done ? v.answer ? 'true' : 'false' : '…'}</b></div></header>
    <section class="lp2116-card"><header><strong>${t('1 · s và locked thẳng cột', '1 · Aligned s and locked')}</strong><span>n = ${v.n ?? '—'} · ${v.n === null ? t('chưa kiểm tra', 'not checked') : v.n % 2 ? t('lẻ', 'odd') : t('chẵn', 'even')}</span></header><div class="lp2116-scroll lp2116-input">${original}</div><p>${t('🔒 1: giữ nguyên · ↔ 0: được đổi · vàng: đang xét · đỏ: đoạn không thể sửa.', '🔒 1: fixed · ↔ 0: editable · yellow: current · red: impossible segment.')}</p></section>
    <section class="lp2116-card lp2116-action"><small>${t('DÒNG', 'LINE')} ${v.line}</small><strong>${esc(t(step.title.vi, step.title.en))}</strong><p>${esc(t(step.note.vi, step.note.en))}</p>${failureText ? `<p class="lp2116-failure">${failureText}</p>` : ''}</section>
    ${renderPass('forward')}${renderPass('backward')}
    <p class="lp2116-disclaimer">${t("Hai lượt là hai giả định độc lập, không phải hai chuỗi kết quả. balance là khả năng ghép tối đa của lượt đó: chỉ cần không âm, không bắt buộc bằng 0 ở cuối.", "The scans use independent assumptions, not two result strings. balance is the maximum pairing capacity for that scan: it must stay nonnegative, but need not end at zero.")}</p>
    ${witness}
  </article>`;
  for (const strip of $("treeView").querySelectorAll?.('.lp2116-scroll') || []) {
    const target = strip.querySelector('.current');
    if (target) {
      const a = strip.getBoundingClientRect(), b = target.getBoundingClientRect();
      if (b.left < a.left || b.right > a.right) strip.scrollLeft += b.left - a.left - strip.clientWidth / 2 + b.width / 2;
    }
  }
}
