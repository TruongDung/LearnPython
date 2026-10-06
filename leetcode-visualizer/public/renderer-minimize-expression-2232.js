function renderMinimizeExpression2232View(step) {
  const v = step.minimizeExpression2232View;
  if (!v) return;
  const t = (vi, en) => lang === 'vi' ? vi : en, esc = escapeHtml, done = Boolean(step.final);
  let c = v.candidate;
  if (done) {
    const { i, j } = v.bestPair;
    c = { i, j, prefix: v.left.slice(0, i), innerLeft: v.left.slice(i), innerRight: v.right.slice(0, j), suffix: v.right.slice(j),
      a: i ? Number(v.left.slice(0, i)) : 1, b: Number(v.left.slice(i)), c: Number(v.right.slice(0, j)), d: j < v.right.length ? Number(v.right.slice(j)) : 1,
      value: v.bestValue, expression: v.bestExpression };
  }
  const total = v.left === null ? null : v.left.length * v.right.length;
  const bestExpression = v.updating ? t('Đang cập nhật answer ở dòng tiếp theo…', 'answer will be updated on the next line…') : v.bestExpression || t('Chưa chọn biểu thức', 'No expression chosen yet');
  const expression = c ? `<code class="me2232-expression"><span class="outer">${esc(c.prefix)}</span><span class="paren">(</span><span class="inner">${esc(c.innerLeft)} + ${esc(c.innerRight)}</span><span class="paren">)</span><span class="outer">${esc(c.suffix)}</span></code>` : `<code class="me2232-expression">${esc(v.expression)}</code>`;
  const parts = c ? [
    ['A', c.prefix, c.a, t("Trước '(' · nhân bên trái", "Before '(' · left multiplier"), 'outer'],
    ['B', c.innerLeft, c.b, t('Trong ngoặc · bên trái +', 'Inside · left of +'), 'inner'],
    ['C', c.innerRight, c.c, t('Trong ngoặc · bên phải +', 'Inside · right of +'), 'inner'],
    ['D', c.suffix, c.d, t("Sau ')' · nhân bên phải", "After ')' · right multiplier"), 'outer'],
  ].map(([label, raw, value, description, type]) => `<div class="${type}"><small>${label} · ${description}</small><code>${raw ? esc(raw) : t('rỗng', 'empty')}</code><b>${value ?? '—'}</b>${!raw ? `<small>${t('Rỗng dùng hệ số 1', 'Empty means multiplier 1')}</small>` : ''}</div>`).join('') : '';
  const formula = c ? `${c.a ?? 'A'} × (${c.b ?? 'B'} + ${c.c ?? 'C'}) × ${c.d ?? 'D'}${c.value === null ? '' : ' = ' + c.value}` : 'A × (B + C) × D';
  const records = new Map(v.history.map(item => [`${item.i},${item.j}`, item]));
  const grid = v.left === null ? `<p>${t('Chưa tách biểu thức.', 'Expression not split yet.')}</p>` : `<div class="me2232-grid-scroll"><table class="me2232-grid"><caption>${t('Hàng: i · cột: j · ô: giá trị', 'Rows: i · columns: j · cells: values')}</caption><thead><tr><th scope="col">i / j</th>${[...v.right].map((_, j) => `<th scope="col">${j + 1}</th>`).join('')}</tr></thead><tbody>${[...v.left].map((_, i) => `<tr><th scope="row">${i}</th>${[...v.right].map((_, index) => {
    const j = index + 1, record = records.get(`${i},${j}`), current = !done && v.candidate?.i === i && v.candidate?.j === j;
    const best = !v.updating && v.bestPair?.i === i && v.bestPair?.j === j;
    return `<td class="${record ? 'tested' : 'future'}${current ? ' current' : ''}${best ? ' best' : ''}" data-cell="${i},${j}" title="${record ? esc(record.expression) : t('Chưa tính', 'Not calculated')}">${record?.value ?? '—'}</td>`;
  }).join('')}</tr>`).join('')}</tbody></table></div>`;
  const history = v.history.map((item, i) => `<li class="${item.status === 'best' && v.updating ? 'old-answer' : item.status}" data-trial="${i}"><span>${i + 1}</span><code>${esc(item.expression)}</code><b>${item.value}</b><small>${item.status === 'best' && !v.updating ? t('tốt nhất', 'best') : item.status === 'pending' ? t('chờ so sánh', 'awaiting comparison') : item.status === 'updating' ? t('chờ gán answer', 'awaiting answer') : item.status === 'superseded' ? t('tốt nhất trước đó', 'former best') : item.status === 'best' ? t('answer cũ', 'old answer') : t('giữ best', 'keep best')}</small></li>`).join('');
  $("treeView").innerHTML = `<article class="me2232-viz" role="region" aria-label="${t('Đặt ngoặc tối ưu 2232', 'Minimize expression 2232')}">
    <header class="me2232-heading"><div><small>2232 · ${t('THỬ TỪNG CẶP VỊ TRÍ', 'TRY EVERY PLACEMENT')}</small><h3>A × (B + C) × D</h3><p>${t('Ngoặc bao quanh dấu +. Hai phần ngoài ngoặc là hệ số nhân.', 'Parentheses surround +. The outside parts are multipliers.')}</p></div><span>${v.history.length}/${total ?? '—'} ${t('đã tính', 'evaluated')}</span></header>
    <section class="me2232-card me2232-best"><header><strong>${done ? t('Đáp án tối ưu', 'Optimal answer') : t('Tốt nhất đến lúc này', 'Best so far')}</strong><b class="me2232-best-value">${v.bestValue ?? '∞'}</b></header><code class="me2232-best-expression${v.updating ? ' updating' : ''}">${esc(bestExpression)}</code>${done ? `<p>${t('Trả về biểu thức trên. Số bên cạnh là giá trị nhỏ nhất của nó.', 'Return the expression above. The number is its minimum evaluated value.')}</p>` : ''}</section>
    <section class="me2232-card me2232-placement"><header><strong>${done ? t('1 · Phân tách đáp án đã chọn', '1 · Decompose the chosen answer') : t('1 · Cách đặt đang thử', '1 · Current placement')}</strong>${c ? `<span>i = ${c.i} · j = ${c.j}</span>` : ''}</header>${expression}<p>${t('i: chữ số bên trái nằm ngoài · j: chữ số bên phải nằm trong.', 'i: left digits outside · j: right digits inside.')}</p>${c ? `<div class="me2232-parts">${parts}</div>` : ''}<strong class="me2232-formula">${formula}</strong>${c?.value === null ? `<p>${t('Chỉ hiện số sau khi dòng tính tương ứng chạy. Chưa tính value.', 'Numbers appear after their calculation line runs. value not calculated yet.')}</p>` : ''}</section>
    <section class="me2232-card me2232-action"><small>${t('DÒNG', 'LINE')} ${v.line}</small><strong>${esc(t(step.title.vi, step.title.en))}</strong><p>${esc(t(step.note.vi, step.note.en))}</p></section>
    <section class="me2232-card"><header><strong>${t('2 · Mọi cặp (i, j)', '2 · Every (i, j) pair')}</strong></header>${grid}<p>${t('Vàng: đang thử · xanh lá: cách đã chọn tốt nhất · —: chưa tính.', 'Yellow: current · green: chosen best · —: not calculated.')}</p></section>
    <section class="me2232-card me2232-history"><header><strong>${t('3 · Lịch sử thử', '3 · Trial history')}</strong></header><ol>${history || `<li>${t('Chưa tính cách nào.', 'No candidates evaluated yet.')}</li>`}</ol></section>
  </article>`;
}
