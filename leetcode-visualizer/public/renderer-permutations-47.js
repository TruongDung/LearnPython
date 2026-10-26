function renderPermutations47View(step) {
  const view = step.permutation47View;
  if (!view) return;
  const host = $("treeView");
  const t = (vi, en) => lang === "vi" ? vi : en;
  const { nums, path, used, phase, activeIndex } = view;
  const width = Math.max(220, (host.clientWidth || 550) - 24);
  const columns = Math.max(1, Math.min(4, nums.length, Math.floor(width / 68)));
  const stride = width / columns;
  const box = Math.min(86, stride - 12);
  const rows = Math.ceil(nums.length / columns);
  const rowStart = row => (width - Math.min(columns, nums.length - row * columns) * stride) / 2;
  const point = (i, y) => ({ x: rowStart(Math.floor(i / columns)) + (i % columns + .5) * stride, y: y + Math.floor(i / columns) * 78 });
  const tile = (x, y, index, state = '', ghost = false) => `<g class="perm47-tile ${state}" transform="translate(${x - box / 2},${y})" data-index="${index}"><rect width="${box}" height="58" rx="8"/><text class="perm47-number ${index >= 0 && String(nums[index]).length > 4 ? 'long' : ''}" x="${box / 2}" y="28" text-anchor="middle">${index < 0 ? '·' : nums[index]}</text><text class="perm47-index" x="${box / 2}" y="46" text-anchor="middle">${index < 0 ? '' : `i=${index}`}</text>${ghost ? `<path class="perm47-cross" d="M8,8 L${box - 8},50 M${box - 8},8 L8,50"/>` : ''}</g>`;
  const currentY = 40 + rows * 78 + 42;
  const source = nums.map((value, i) => {
    const p = point(i, 34);
    const active = i === activeIndex;
    const state = active ? phase === 'skip' ? 'skip' : phase === 'backtrack' ? 'release' : 'pick' : used[i] ? 'used' : 'free';
    const symbol = active && phase === 'skip' ? '×' : used[i] ? '✓' : '';
    return tile(p.x, p.y, i, state) + (symbol ? `<text class="perm47-status ${state}" x="${p.x + box / 2 - 6}" y="${p.y + 12}" text-anchor="end">${symbol}</text>` : '');
  }).join('');
  const slots = nums.map((_, i) => {
    const p = point(i, currentY);
    const ghost = phase === 'backtrack' && i === path.length;
    return tile(p.x, p.y, ghost ? activeIndex : path[i] ?? -1, ghost ? 'release' : i < path.length ? phase === 'save' ? 'saved' : 'filled' : 'empty', ghost);
  }).join('');
  const labels = {
    ready: t('Sắp xếp · chọn từng ô', 'Sort · pick one tile at a time'),
    pick: t('Chọn → thêm vào dãy', 'Pick → append'),
    backtrack: t('Trả ô → thử nhánh khác', 'Return tile → try another branch'),
    skip: t('Bỏ nhánh trùng', 'Skip duplicate branch'),
    save: t('Đủ ô → lưu ✓', 'All slots filled → save ✓'),
    done: t('Hoàn tất ✓', 'Complete ✓'),
  };
  const back = phase === 'backtrack';
  let transfer = '';
  if (['pick', 'backtrack'].includes(phase)) {
    const from = point(activeIndex, 34);
    const to = point(back ? path.length : path.length - 1, currentY);
    const sourceY = from.y + 62;
    const targetY = to.y - 8;
    const midY = (sourceY + targetY) / 2;
    const route = rows === 1
      ? back ? `M${to.x},${targetY} C${to.x},${midY} ${from.x},${midY} ${from.x},${sourceY}` : `M${from.x},${sourceY} C${from.x},${midY} ${to.x},${midY} ${to.x},${targetY}`
      : back ? `M${to.x},${targetY} H2 V${sourceY + 6} H${from.x} V${sourceY}` : `M${from.x},${sourceY} V${sourceY + 6} H2 V${targetY - 4} H${to.x} V${targetY}`;
    transfer = `<path class="perm47-transfer ${back ? 'release' : 'pick'}" d="${route}" marker-end="url(#perm47-arrow)"/>`;
  }
  let fork = '';
  const captionRight = Boolean(transfer) && point(back ? path.length : path.length - 1, currentY).x < width / 2;
  const forkY = currentY + rows * 78 + 6;
  if (phase === 'skip') {
    const branchY = forkY + 62;
    const centers = [width / 4, width * 3 / 4];
    const prefix = path.length ? `[${path.length > 3 ? '…, ' : ''}${path.slice(-3).map(i => nums[i]).join(', ')}]` : '∅';
    const output = `[${path.length ? '…, ' : ''}${nums[activeIndex]}]`;
    fork = `<text class="perm47-caption" x="${width / 2}" y="${forkY + 8}" text-anchor="middle">${escapeHtml(prefix)}</text>${centers.map((x, j) => `<path class="perm47-branch ${j ? 'skip' : 'pick'}" d="M${width / 2},${forkY + 18} Q${x},${forkY + 24} ${x},${branchY - 6}"/>${tile(x, branchY, activeIndex - 1 + j, j ? 'skip' : 'pick', Boolean(j))}<text class="perm47-caption" x="${x}" y="${branchY + 79}" text-anchor="middle">${escapeHtml(output)}</text><text class="perm47-index" x="${x}" y="${branchY + 98}" text-anchor="middle">${j ? t('× trùng nhánh', '× duplicate') : t('✓ chọn trước', '✓ left first')}</text>`).join('')}`;
  }
  const duplicateAllowed = phase === 'pick' && activeIndex > 0 && nums[activeIndex] === nums[activeIndex - 1] && used[activeIndex - 1];
  const height = phase === 'skip' ? forkY + 175 : currentY + rows * 78 - 8;
  const gallery = view.saved.map(row => `<div class="perm47-result" aria-label="${escapeHtml(JSON.stringify(row))}">${row.map(value => `<b>${value}</b>`).join('')}<span aria-hidden="true">✓</span></div>`).join('');
  const detail = phase === 'skip' ? t('Bản trái chưa dùng → bỏ bản phải.', 'Left copy unused → skip the right copy.') : duplicateAllowed ? t('Bản trái đã dùng → chọn bản phải được.', 'Left copy used → the right copy is allowed.') : t('i = chỉ số ô · ✓ = đang dùng', 'i = tile index · ✓ = in use');
  host.innerHTML = `<section class="perm47-viz"><header><strong>${labels[phase] || ''}</strong><span>${view.count} ${t('kết quả', 'saved')}</span></header><svg class="perm47-scene" viewBox="0 0 ${width} ${height}" role="img" aria-label="${escapeHtml(`${labels[phase]}. ${detail}`)}"><defs><marker id="perm47-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0L10 5L0 10Z"/></marker></defs><text class="perm47-caption" x="6" y="18">nums</text>${source}${transfer}<text class="perm47-caption" x="${captionRight ? width - 6 : 6}" y="${currentY - 10}" text-anchor="${captionRight ? 'end' : 'start'}">current · ${path.length}/${nums.length}</text>${slots}${fork}</svg><div class="perm47-detail" aria-live="polite">${detail}</div><section class="perm47-gallery"><header>${t('Đã lưu', 'Saved')} · ${view.count}</header><div>${gallery || '<span>∅</span>'}</div>${view.count > view.saved.length ? `<small>+${view.count - view.saved.length} ${t('kết quả khác', 'more')}</small>` : ''}</section>${view.truncated ? `<small class="perm47-detail">${t('Minh họa 480 bước đầu · tổng kết quả vẫn đầy đủ.', 'First 480 steps shown · total count is complete.')}</small>` : ''}</section>`;
  host._permutations47Step = step;
  host._permutations47Width = host.clientWidth;
  if (typeof ResizeObserver !== 'undefined' && !host._permutations47Observer) {
    host._permutations47Observer = new ResizeObserver(() => {
      if (host.querySelector('.perm47-viz') && host.clientWidth !== host._permutations47Width) renderPermutations47View(host._permutations47Step);
    });
    host._permutations47Observer.observe(host);
  }
}
