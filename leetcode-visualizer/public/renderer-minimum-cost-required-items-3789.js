function renderMinimumCost3789View(step) {
  const view = step.cost3789View;
  const host = $('treeView');
  const t = (vi, en) => lang === 'vi' ? vi : en;
  const esc = value => escapeHtml(String(value ?? '—'));
  const fmt = value => Number(value).toLocaleString(lang === 'vi' ? 'vi-VN' : 'en-US');
  const { cost1, cost2, costBoth, need1, need2 } = view.inputs;
  const planLabel = bothCount => {
    if (bothCount === 0) return t('Không mua loại 3', 'No type-3 items');
    if (bothCount === view.matched) return t('Đáp ứng nhu cầu nhỏ hơn', 'Meet the smaller need');
    if (bothCount === view.cover) return t('Đáp ứng nhu cầu lớn hơn', 'Cover the larger need');
    return t('Mốc số lượng loại 3', 'Type-3 breakpoint');
  };
  const plans = view.candidates.map(plan => {
    const active = plan.bothCount === view.active;
    const winner = plan.status === 'winner';
    const pending = plan.cost === null;
    const total1 = pending ? null : plan.total1;
    const total2 = pending ? null : plan.total2;
    const row = (label, quantity, unitCost, kind) => `<div class="cost3789-cost-row ${kind}">
      <span>${label}</span><b>${pending ? '—' : `${fmt(quantity)} × ${fmt(unitCost)}`}</b>
      <strong>${pending ? '—' : fmt(quantity * unitCost)}</strong></div>`;
    const coverage = (total, need) => {
      if (total === null) return `<div class="cost3789-coverage"><span>— / ${fmt(need)}</span><i><b style="width:0%"></b></i></div>`;
      const percent = need === 0 ? 100 : Math.min(100, total / need * 100);
      return `<div class="cost3789-coverage"><span>${fmt(total)} / ${fmt(need)} ${total > need ? `(+${fmt(total - need)} ${t('dư','extra')})` : ''}</span><i><b style="width:${percent}%"></b></i></div>`;
    };
    return `<article class="cost3789-plan ${active ? 'active' : ''} ${winner ? 'winner' : ''} ${pending ? 'pending' : ''}">
      <header><span class="cost3789-step-number">${view.candidates.indexOf(plan) + 1}</span><div><b>${esc(planLabel(plan.bothCount))}</b><small>${t('Món loại 3','Type-3 items')}: ${fmt(plan.bothCount)}</small></div>
        ${winner ? `<strong class="cost3789-winner">${t('RẺ NHẤT','CHEAPEST')}</strong>` : ''}</header>
      <div class="cost3789-items">
        ${row(t('Loại 1','Type 1'), plan.only1, cost1, 'type1')}
        ${row(t('Loại 2','Type 2'), plan.only2, cost2, 'type2')}
        ${row(t('Loại 3','Type 3'), plan.bothCount, costBoth, 'type3')}
      </div>
      <div class="cost3789-requirements">
        <div><small>${t('Đáp ứng nhu cầu 1','Type-1 requirement')}</small>${coverage(total1, need1)}</div>
        <div><small>${t('Đáp ứng nhu cầu 2','Type-2 requirement')}</small>${coverage(total2, need2)}</div>
      </div>
      <footer><small>${t('Tổng chi phí','Total cost')}</small><b>${pending ? '—' : fmt(plan.cost)}</b></footer>
    </article>`;
  }).join('');
  const slopeFirst = costBoth - cost1 - cost2;
  const extraCost = need1 > need2 ? cost1 : cost2;
  const slopeSecond = costBoth - extraCost;
  const result = view.final
    ? `<section class="cost3789-result"><small>${t('CHI PHÍ NHỎ NHẤT','MINIMUM TOTAL COST')}</small><b>${fmt(view.answer)}</b><span>${t('Chọn phương án được đánh dấu RẺ NHẤT.','Choose the plan marked CHEAPEST.')}</span></section>`
    : '';
  host.innerHTML = `<section class="cost3789-viz">
    <header class="cost3789-heading"><b>#3789 · ${t('Mua đủ vật phẩm với chi phí thấp nhất','Acquire required items at minimum cost')}</b>
      <span>${t('Bước','Step')} ${stepIndex + 1}/${steps.length}</span></header>
    <div class="cost3789-inputs">
      <article><small>${t('Giá loại 1','Type-1 cost')}</small><b>${fmt(cost1)}</b></article>
      <article><small>${t('Giá loại 2','Type-2 cost')}</small><b>${fmt(cost2)}</b></article>
      <article class="both"><small>${t('Giá loại 3 · đáp ứng cả hai','Type-3 cost · counts for both')}</small><b>${fmt(costBoth)}</b></article>
      <article class="need"><small>${t('Nhu cầu 1','Need 1')}</small><b>${fmt(need1)}</b></article>
      <article class="need"><small>${t('Nhu cầu 2','Need 2')}</small><b>${fmt(need2)}</b></article>
    </div>
    <section class="cost3789-explanation"><small>${t('ĐANG XÉT','CURRENT STEP')}</small><b>${esc(step.title?.[lang] ?? step.title?.en ?? '')}</b>
      <p>${esc(step.note?.[lang] ?? step.note?.en ?? '')}</p></section>
    <div class="cost3789-plans">${plans}</div>
    <section class="cost3789-proof"><b>${t('Vì sao chỉ xét các mốc này?','Why only these breakpoints?')}</b>
      <div><span>0 → ${fmt(view.matched)}</span><p>${t('Đang thiếu cả hai loại; chi phí thay đổi tuyến tính với độ dốc','Both needs are still short; cost changes linearly with slope')} <strong>${fmt(slopeFirst)}</strong>.</p></div>
      ${view.cover !== view.matched ? `<div><span>${fmt(view.matched)} → ${fmt(view.cover)}</span><p>${t('Chỉ còn thiếu loại có nhu cầu lớn hơn; độ dốc','Only the type with the larger need remains; slope')} <strong>${fmt(slopeSecond)}</strong>.</p></div>` : ''}
      <div><span>${fmt(view.cover)}+</span><p>${t('Đã đủ hai nhu cầu; mua thêm loại 3 chỉ tăng chi phí.','Both needs are met; buying more type 3 only increases cost.')}</p></div>
    </section>
    ${result}
    <p class="cost3789-hint">${t('Mỗi món loại 3 thay thế cùng lúc một món loại 1 và một món loại 2. Vì vậy, ở mỗi đoạn giữa các điểm gãy, chi phí là đường thẳng; giá thấp nhất nằm ở một đầu đoạn.', 'Each type-3 item replaces one type-1 and one type-2 item at once. Cost is linear between breakpoints, so its minimum is at an endpoint.')}</p>
  </section>`;
}
