function renderProfitableSchemes879View(step) {
  const v = step.profitableSchemes879View;
  const vi = lang === "vi", text = (a, b) => vi ? a : b;
  const selected = v.activeCrime === null ? null : v.crimes[v.activeCrime];
  const esc = value => escapeHtml(String(value));
  const people = (used, limit = v.members) => `<svg class="ps879-people-meter" viewBox="0 0 ${limit * 14 + 4} 25" role="img" aria-label="${used}/${limit} ${text('người','members')}">${Array.from({length:limit}, (_, i) => `<use href="#ps879-avatar" width="12" height="24" x="${i * 14 + 2}" class="${i < used ? 'filled' : 'empty'}"/>`).join('')}</svg>`;
  const profit = gain => `<div class="ps879-profit-meter" role="img" aria-label="${text('Lợi nhuận','Profit')}: ${gain}, ${text('mục tiêu','goal')}: ${v.minProfit}">${Array.from({length:v.minProfit}, (_, i) => `<i class="${i < gain ? 'filled' : ''}"></i>`).join('') || '<span>≥0</span>'}</div>`;
  const plan = scheme => {
    const crewOk = scheme.members <= v.members, gainOk = scheme.profit >= v.minProfit;
    const ok = crewOk && gainOk;
    const jobs = scheme.jobs.slice(0, 6).map(i => `<b class="ps879-job-chip">#${i + 1}</b>`).join('<span>+</span>');
    return `<article class="ps879-plan ${ok ? 'valid' : 'invalid'}" aria-label="${text('Chọn việc','Selected jobs')}: ${scheme.jobs.map(i=>i+1).join(', ') || '∅'}. ${scheme.members}/${v.members} ${text('người','members')}; ${scheme.profit} ${text('lãi','profit')}.">
      <div class="ps879-plan-jobs">${jobs || `<span>∅ · ${text('Không chọn việc','No jobs')}</span>`}${scheme.jobs.length > 6 ? `<small>+${scheme.jobs.length - 6}</small>` : ''}</div>
      <div class="ps879-plan-meters">
        <div class="${crewOk ? '' : 'over'}"><strong>👥 ${scheme.members}/${v.members}</strong>${people(scheme.members)}</div>
        <div><strong>💰 ${scheme.profit}</strong>${profit(scheme.profit)}</div>
      </div>
      <small class="ps879-verdict">${ok ? text('✓ Đạt','✓ Qualifies') : !crewOk ? text('× Quá người','× Too many members') : text('× Thiếu lãi','× Profit too low')}</small>
    </article>`;
  };
  const cards = v.crimes.map(crime => {
    const active = crime.index === v.activeCrime;
    const processed = crime.index < v.processedCount;
    return `<div class="ps879-job ${active ? 'active' : ''}${processed ? ' processed' : ''}"><header><b>#${crime.index + 1}</b>${active ? '<span>↓</span>' : ''}</header><strong>👥 ${crime.members}</strong><svg class="ps879-job-people" viewBox="0 0 ${Math.min(crime.members, 6) * 14 + 4} 25" aria-hidden="true">${Array.from({length:Math.min(crime.members,6)},(_,i)=>`<use href="#ps879-avatar" width="12" height="24" x="${i*14+2}" class="filled"/>`).join('')}</svg><strong class="ps879-gain">💰 +${crime.gain}</strong></div>`;
  }).join('');
  const branch = (take, count, examples) => `<section class="ps879-branch ${take ? 'take' : 'skip'}"><header><strong>${take ? text('Chọn','Take') : text('Bỏ','Skip')} #${selected.index + 1}</strong><b>${count} ${text('cách','ways')}</b></header>${examples.map(plan).join('')}${count === 0 && examples.length === 0 ? `<span class="ps879-empty">∅</span>` : ''}</section>`;
  const main = selected && v.phase === 'crime'
    ? `<div class="ps879-branches">${branch(false,v.skipCount,v.skipSamples)}${branch(true,v.takeCount,v.takeSamples)}</div><div class="ps879-sum"><b>${v.skipCount}</b><span>+</span><b>${v.takeCount}</b><span>${v.skipCount + v.takeCount >= 1000000007 ? '→' : '='}</span><output>${v.count}</output><span>${text('cách','ways')}</span></div>`
    : v.phase === 'intro'
      ? `<section class="ps879-start"><header>${text('Bắt đầu','Start')}</header>${plan({jobs:[],members:0,profit:0})}</section>`
      : `<section class="ps879-schemes"><header>${v.examplesOnly ? text('Ví dụ đạt mục tiêu','Qualifying examples') : text('Các kế hoạch đạt mục tiêu','Schemes that qualify')}</header><div>${v.samples.map(plan).join('') || `<span class="ps879-empty">∅ · ${text('Chưa có kế hoạch đạt','No qualifying schemes')}</span>`}</div></section>`;
  const targetUpdate = selected ? v.updates.find(u => u.members === v.members && u.profit === v.minProfit) : null;
  const table = `<details class="ps879-dp"><summary>${text('Bảng DP','DP table')}</summary><div class="ps879-table-scroll"><table><caption>${text('Số cách: người ≤ hàng, lãi ≥ cột','Ways: members ≤ row, profit ≥ column')}</caption><thead><tr><th>👥 / 💰</th>${Array.from({length:v.minProfit+1},(_,j)=>`<th>≥${j}</th>`).join('')}</tr></thead><tbody>${v.dp.map((row,i)=>`<tr><th>≤${i}</th>${row.map((value,j)=>`<td class="${i===v.members && j===v.minProfit ? 'target' : targetUpdate && i===targetUpdate.sourceMembers && j===targetUpdate.sourceProfit ? 'source' : ''}">${value}</td>`).join('')}</tr>`).join('')}</tbody></table></div>${targetUpdate ? `<div class="ps879-dp-flow">[${targetUpdate.sourceMembers}][${targetUpdate.sourceProfit}] → [${v.members}][${v.minProfit}] · +${targetUpdate.added}</div>` : ''}<small>${text('Duyệt ngược: mỗi việc dùng một lần.','Scan backwards: use each job once.')}</small></details>`;
  const root = $("treeView");
  const keepDpOpen = root.querySelector(".ps879-dp")?.open || false;
  root.innerHTML = `<section class="ps879-viz" aria-label="${text('Đếm cách chọn việc đủ lợi nhuận','Count subsets of jobs meeting the profit goal')}"><svg width="0" height="0" aria-hidden="true" class="ps879-defs"><defs><symbol id="ps879-avatar" viewBox="0 0 12 24"><circle cx="6" cy="5" r="3"/><path d="M3 10H9L11 17H8V23H4V17H1Z"/></symbol></defs></svg>
    <header class="ps879-header"><strong>${text('Kế hoạch có lãi','Profitable schemes')}</strong><span>${v.processedCount}/${v.crimes.length} ${text('việc đã xét','jobs processed')}</span></header>
    <div class="ps879-goals"><div><span>👥</span><strong>≤ ${v.members}</strong><small>${text('người','members')}</small></div><div><span>💰</span><strong>≥ ${v.minProfit}</strong><small>${text('lãi','profit')}</small></div></div>
    <div class="ps879-jobs" aria-label="${text('Các việc có thể chọn','Available jobs')}">${cards}</div>
    ${v.final ? `<div class="ps879-result"><strong>${v.answer}</strong><span>${text('cách chọn đạt mục tiêu','qualifying ways to choose')}</span></div>` : ''}
    ${main}${table}<footer><span>✓ ${text('Đủ cả hai điều kiện','Both conditions met')}</span><small>mod 1e9+7</small></footer>
  </section>`;
  const details = root.querySelector('.ps879-dp');
  if (details) details.open = keepDpOpen;
  const active = root.querySelector('.ps879-job.active');
  if (active) {
    const strip = root.querySelector('.ps879-jobs');
    strip.scrollLeft = Math.max(0, active.offsetLeft - strip.offsetLeft - (strip.clientWidth - active.offsetWidth) / 2);
  }
}
