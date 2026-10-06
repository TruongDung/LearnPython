function renderMinInsertions1541View(step) {
  const v = step.minInsertions1541View;
  if (!v) return;
  const t = (vi, en) => lang === 'vi' ? vi : en, esc = escapeHtml, done = Boolean(step.final);
  const reason = key => ({
    'missing-open': t("Thiếu '(' trước dấu đóng", "Missing '(' before the closing"),
    'finish-pair': t("Hoàn tất )) trước '(' mới", "Complete )) before a new '('"),
    suffix: t("Đóng các dấu mở ở cuối chuỗi", "Close remaining openings at the end"),
  })[key];
  const processed = new Set(v.tokens.filter(token => !token.inserted).map(token => token.index));
  const chars = [...v.s].map((ch, i) => `<div class="mi1541-char${processed.has(i) ? ' processed' : ''}${!done && i === v.index ? ' current' : ''}" data-index="${i}"><small>${!done && i === v.index ? 'i ↓' : '&nbsp;'}</small><b>${ch}</b><span>${i}</span></div>`).join('');
  const output = v.tokens.map((token, i) => `<div class="mi1541-char ${token.inserted ? 'inserted' : 'original'}${done && token.reason === 'suffix' ? ' suffix' : ''}${!done && !token.inserted && token.index === v.index ? ' current' : ''}" data-token="${i}" title="${esc(token.inserted ? reason(token.reason) : `s[${token.index}]`)}"><small>${token.inserted ? '+' : '&nbsp;'}</small><b>${token.ch}</b><span>${token.inserted ? t('chèn', 'new') : token.index}</span></div>`).join('');
  const needs = v.need === null ? t('Chưa khởi tạo', 'Not initialized') : v.need === -1 ? t("Thiếu '(' — cần sửa", "Missing '(' — correction needed") : v.need % 2 === 1 ? t("Cặp )) dang dở: còn thiếu ')' thứ hai", "Incomplete )) pair: its second ')' is missing") : v.need > 0 ? t('Còn các dấu mở cần đóng', 'Openings still need closing') : t('Không còn dấu đóng đang thiếu', 'No closing character is outstanding');
  const fixes = v.fixes.map((fix, i) => `<li data-fix="${i}"><code>+ ${fix.ch}</code><div><strong>${reason(fix.reason)}</strong><small>${fix.before === v.s.length ? t('Cuối chuỗi', 'End of string') : t(`Trước s[${fix.before}]`, `Before s[${fix.before}]`)}</small></div></li>`).join('');
  $("treeView").innerHTML = `<article class="mi1541-viz" role="region" aria-label="${t('Chèn ngoặc 1541', 'Parentheses insertions 1541')}">
    <header><div><small>1541 · ${t('MỖI DẤU MỞ CẦN HAI DẤU ĐÓNG', 'TWO CLOSINGS PER OPENING')}</small><h3><code>(</code> → <code>))</code></h3><p>${t('Hai dấu đóng phải liền nhau. () vẫn thiếu một dấu ).', 'The two closings must be consecutive. () still needs one more ).')}</p></div>${done ? `<div class="mi1541-answer"><small>${t('CHÈN ÍT NHẤT', 'MINIMUM INSERTIONS')}</small><b>${v.answer}</b></div>` : ''}</header>
    <section class="mi1541-card"><header><strong>${t('1 · Chuỗi gốc', '1 · Original string')}</strong><code>${esc(v.s)}</code></header><div class="mi1541-scroll input">${chars}</div><p>${t('Vàng: đang xét · xanh: đã nhận · chỉ số bắt đầu từ 0.', 'Yellow: current · blue: consumed · indices start at 0.')}</p></section>
    <div class="mi1541-counters"><section class="mi1541-card"><small>${t('ĐÃ CHÈN TRONG VÒNG LẶP', 'INSERTED DURING THE LOOP')}</small><b class="mi1541-count">${v.insertions ?? '—'}</b><code>insertions</code></section><section class="mi1541-card${v.need === -1 ? ' warning' : ''}"><small>${done ? t('THÊM Ở CUỐI CHUỖI', 'APPENDED AT THE END') : t('SỐ DẤU ĐÓNG CÒN THIẾU', 'OUTSTANDING CLOSINGS')}</small><b class="mi1541-need">${v.need ?? '—'}</b><code>need</code><p>${done ? t('Đã dùng số này để thêm đuôi. Biến Python vẫn giữ nguyên khi return.', 'Used to append the suffix. The Python variable stays unchanged at return.') : needs}</p></section></div>
    <section class="mi1541-card mi1541-action"><small>${t('DÒNG', 'LINE')} ${v.line}</small><strong>${esc(t(step.title.vi, step.title.en))}</strong><p>${esc(t(step.note.vi, step.note.en))}</p></section>
    <section class="mi1541-card mi1541-output"><header><strong>${done ? t('2 · Chuỗi đã sửa, hợp lệ', '2 · Repaired balanced string') : t('2 · Phần chuỗi đã xử lý', '2 · Processed prefix')}</strong><span>${t('Tím: chèn khi duyệt · xanh lá: thêm ở cuối', 'Purple: inserted during scan · green: appended suffix')}</span></header><div class="mi1541-scroll output">${output || `<p>${t('Chưa nhận ký tự nào.', 'No characters consumed yet.')}</p>`}</div>${done ? `<p class="mi1541-equation">${v.insertions} + ${v.need} = <strong>${v.answer}</strong> ${t('lần chèn', 'insertions')}</p>` : `<p>${t('Chỉ hiển thị phần đã nhận; phần này có thể còn thiếu dấu đóng.', 'Only consumed input is shown; this prefix may still need closing characters.')}</p>`}</section>
    <section class="mi1541-card mi1541-fixes"><header><strong>${t('3 · Chèn ở đâu, vì sao?', '3 · Where and why insert?')}</strong><span>${v.fixes.length} ${t('dấu mới', v.fixes.length === 1 ? 'new character' : 'new characters')}</span></header><ol>${fixes || `<li>${t('Chưa chèn dấu nào.', 'No insertions yet.')}</li>`}</ol></section>
  </article>`;
  for (const selector of ['.mi1541-scroll.input', '.mi1541-scroll.output']) {
    const strip = $("treeView").querySelector(selector), target = strip?.querySelector('.current') || (selector.endsWith('output') ? strip?.lastElementChild : null);
    if (target) {
      const a = strip.getBoundingClientRect(), b = target.getBoundingClientRect();
      if (b.left < a.left || b.right > a.right) strip.scrollLeft += b.left - a.left - strip.clientWidth / 2 + b.width / 2;
    }
  }
}
