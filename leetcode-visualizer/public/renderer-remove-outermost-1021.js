function renderRemoveOutermost1021View(step) {
  const v = step.removeOutermost1021View;
  if (!v) return;
  const vi = lang === "vi", t = (a, b) => vi ? a : b;
  const esc = escapeHtml, done = Boolean(step.final);
  const groupOutput = group => v.kept.filter(i => i >= group.start && i <= group.end).map(i => v.s[i]).join("");
  const groups = v.groups.map((group, groupIndex) => {
    const active = !done && groupIndex === v.groupIndex;
    const chars = Array.from({ length: group.end - group.start + 1 }, (_, offset) => {
      const index = group.start + offset, status = v.decisions[index] || "future";
      const current = !done && index === v.index;
      const statusText = status === "keep" ? t("đã giữ", "kept") : status === "remove" ? t("bỏ lớp ngoài", "outer, removed") : t("chưa quyết định", "not decided");
      return `<div class="ro1021-char ${status}${current ? ' current' : ''}" data-index="${index}" aria-label="${esc(`${index}: ${v.s[index]}, ${statusText}`)}"><small>${current ? 'i ↓' : '&nbsp;'}</small><strong>${v.s[index]}</strong><span>${index}</span><em>${status === 'keep' ? '✓' : status === 'remove' ? '×' : '·'}</em></div>`;
    }).join("");
    return `<section class="ro1021-group${active ? ' active' : ''}" data-group="${groupIndex}"><header><b>${t('Nhóm', 'Group')} ${groupIndex + 1}</b><span>[${group.start}…${group.end}]</span></header><div class="ro1021-chars">${chars}</div><footer>${t('Đã giữ', 'Kept')}: <code>${esc(groupOutput(group)) || '∅'}</code></footer></section>`;
  }).join("");
  const activeChar = !done && v.index !== null ? v.s[v.index] : null;
  const opening = activeChar === '(';
  const decisionClass = done ? 'complete' : v.decision === 'remove' ? 'remove' : v.decision === 'keep' ? 'keep' : v.decision === 'keep-pending' ? 'pending' : 'waiting';
  const decisionLabel = done ? t('HOÀN TẤT', 'COMPLETE') : v.decision === 'remove' ? t('BỎ NGOÀI CÙNG', 'REMOVE OUTER') : v.decision === 'keep' ? t('ĐÃ GIỮ', 'KEPT') : v.decision === 'keep-pending' ? t('GIỮ · CHỜ APPEND', 'KEEP · AWAIT APPEND') : t('CHƯA QUYẾT ĐỊNH', 'NOT DECIDED');
  let explanation = t("Chuỗi được tách ở những vị trí depth trở về 0. Mỗi khung là một nhóm; chỉ bỏ hai dấu bao ngoài của khung đó.", "Split the string wherever depth returns to 0. Each box is one group; remove only its enclosing pair.");
  if (done) explanation = t(`Đã bỏ ${v.removed.length} dấu = ${v.groups.length} nhóm × 2. Ghép các dấu xanh theo thứ tự ban đầu.`, `Removed ${v.removed.length} characters = ${v.groups.length} groups × 2. Join the green characters in their original order.`);
  else if (activeChar) {
    if (v.decision === 'remove') explanation = opening ? t("Trước khi mở: depth = 0 → dấu '(' bắt đầu lớp ngoài cùng. Bỏ dấu này nhưng vẫn tăng độ sâu.", "Before opening: depth = 0 → '(' starts the outer layer. Remove it but still increase depth.") : t("Sau khi đóng: depth = 0 → dấu ')' kết thúc lớp ngoài cùng. Bỏ dấu này và kết thúc nhóm.", "After closing: depth = 0 → ')' ends the outer layer. Remove it and finish this group.");
    else if (v.decision) explanation = opening ? t("Trước khi mở đã có lớp bao ngoài → dấu '(' này nằm bên trong nên giữ.", "An outer layer is already open → this '(' is internal, so keep it.") : t("Sau khi đóng vẫn còn lớp bao ngoài → dấu ')' này nằm bên trong nên giữ.", "An outer layer remains after closing → this ')' is internal, so keep it.");
    else explanation = opening ? t("Kiểm tra depth > 0 trước, rồi mới tăng depth. Chưa thêm ký tự vào kết quả.", "Check depth > 0 first, then increase depth. The character has not been appended.") : t("Giảm depth trước, rồi mới kiểm tra depth > 0. Chưa thêm ký tự vào kết quả.", "Decrease depth first, then check depth > 0. The character has not been appended.");
  }
  const output = v.kept.map(index => `<span data-source-index="${index}" title="s[${index}]">${v.s[index]}</span>`).join("");
  const completedGroups = v.groups.filter(group => v.decisions[group.end] !== null).length;
  $("treeView").innerHTML = `<article class="ro1021-viz" role="region" aria-label="${t('Bỏ ngoặc ngoài cùng 1021', 'Remove outermost parentheses 1021')}">
    <header class="ro1021-heading"><div><small>1021 · ${t('MỘT CẶP MỖI NHÓM', 'ONE PAIR PER GROUP')}</small><h3>${t('Bỏ lớp ngoài, giữ phần bên trong', 'Remove the outer layer, keep the inside')}</h3><p>${t('Không phải chỉ bỏ ký tự đầu và cuối của cả chuỗi.', 'Remove the enclosing pair of every group.')}</p></div><div class="ro1021-progress"><b>${completedGroups}/${v.groups.length}</b><small>${t('nhóm đã xong', 'groups finished')}</small></div></header>
    <section class="ro1021-input"><header><strong>${t('1 · Chuỗi đầu vào, chia thành từng nhóm', '1 · Input, split into primitive groups')}</strong><span>s = <code>${esc(v.s)}</code></span></header><div class="ro1021-scroll">${groups}</div><div class="ro1021-legend"><span class="keep">✓ ${t('giữ', 'keep')}</span><span class="remove">× ${t('bỏ ngoài cùng', 'remove outer')}</span><span class="current">${t('viền vàng: đang xét', 'yellow outline: current')}</span><span>${t('xám: chưa quyết định', 'gray: not decided')}</span></div></section>
    <div class="ro1021-rules"><section class="${activeChar && opening ? 'active' : ''}"><b>${t("Gặp '(' — dấu mở", "On '(' — opening")}</b><p>① ${t('Kiểm tra', 'Check')} depth &gt; 0 → ${t('giữ', 'keep')}</p><p>② depth += 1</p><small>${t('Kiểm tra TRƯỚC khi tăng.', 'Check BEFORE incrementing.')}</small></section><section class="${activeChar && !opening ? 'active' : ''}"><b>${t("Gặp ')' — dấu đóng", "On ')' — closing")}</b><p>① depth -= 1</p><p>② ${t('Kiểm tra', 'Check')} depth &gt; 0 → ${t('giữ', 'keep')}</p><small>${t('Giảm TRƯỚC khi kiểm tra.', 'Decrement BEFORE checking.')}</small></section></div>
    <section class="ro1021-action ${decisionClass}"><header><strong>${t('2 · Quyết định tại ký tự này', '2 · Decision at this character')}</strong><span>${decisionLabel}</span></header><div class="ro1021-depth"><div><small>${t('Độ sâu trước ký tự', 'Depth before character')}</small><b>${v.depthBefore ?? '—'}</b></div><span>→</span><div><small>${t('depth hiện tại', 'Current depth')}</small><b>${v.depth ?? '—'}</b></div><div><small>${t('Ký tự đang xét', 'Current character')}</small><b>${activeChar ? `${activeChar} <em>[${v.index}]</em>` : done ? '✓' : '—'}</b></div></div><p>${explanation}</p><div class="ro1021-line"><strong>${esc(t(step.title.vi, step.title.en))}</strong><span>${esc(t(step.note.vi, step.note.en))}</span></div></section>
    <section class="ro1021-output"><header><strong>${done ? t('3 · Kết quả cuối', '3 · Final result') : t('3 · result đã xây dựng', '3 · Result built so far')}</strong><span>${v.kept.length} ${t('giữ', 'kept')} · ${v.removed.length} ${t('bỏ', 'removed')}</span></header><div class="ro1021-result">${output || `<em>${t('Chuỗi rỗng', 'Empty string')} · ""</em>`}</div><p>${t('Chỉ thêm vào result ở dòng append. Dấu đã bỏ vẫn được tính khi tăng/giảm depth.', 'Only append lines add to result. Removed parentheses still affect depth.')}</p></section>
  </article>`;
  const strip = $("treeView").querySelector(".ro1021-scroll");
  const target = strip?.querySelector(".ro1021-char.current");
  if (target) {
    const a = strip.getBoundingClientRect(), b = target.getBoundingClientRect();
    if (b.left < a.left || b.right > a.right) strip.scrollLeft += b.left - a.left - strip.clientWidth / 2 + b.width / 2;
  }
}
