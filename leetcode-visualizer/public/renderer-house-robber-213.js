function renderHouseRobber213View(step) {
  const v = step.houseRobberView;
  const vi = lang === "vi", nums = v.nums, n = nums.length;
  const taken = new Set(v.robbed);
  const pass = v.pass ? v.passes[v.pass] : null;
  const excluded = pass ? pass.excluded : v.bestPass ? v.passes[v.bestPass].excluded : -1;
  const focus = v.currentIndex >= 0 ? v.currentIndex : v.robbed.at(-1) ?? 0;
  const money = value => escapeHtml(String(value));
  const house = (i, classes = "", x = 0, y = 0) => `<g class="h213-house ${classes}" transform="translate(${x} ${y})"><path class="h213-building" d="M-24 -10 L0 -29 L24 -10 L20 -10 V23 H-20 V-10 Z"/><text class="h213-money" x="0" y="9" text-anchor="middle">${money(nums[i])}</text><text class="h213-id" x="0" y="40" text-anchor="middle">#${i}</text>${classes.includes("excluded") ? '<path class="h213-cross" d="M-19 -20 L19 21 M19 -20 L-19 21"/>' : ""}${classes.includes("picked") ? '<text class="h213-check" x="23" y="-17">✓</text>' : ""}</g>`;
  // Large circles show the endpoints and a local neighborhood, keeping labels readable.
  const ids = n <= 10 ? nums.map((_, i) => i) : [...new Set([0, n - 1,
    ...Array.from({ length: 5 }, (_, i) => Math.min(n - 1, Math.max(0, focus - 2 + i)))])].sort((a, b) => a - b);
  const points = ids.map((i, pos) => {
    const angle = -Math.PI / 2 + pos * 2 * Math.PI / ids.length;
    return { i, x: 210 + Math.cos(angle) * 142, y: 166 + Math.sin(angle) * 110 };
  });
  const edges = n === 1 ? "" : points.map((p, pos) => {
    const next = points[(pos + 1) % points.length];
    if (n === 2 && pos === 0) return "";
    const closing = pos === points.length - 1;
    const gap = !closing && next.i - p.i > 1;
    const cut = excluded === p.i || excluded === next.i;
    const line = n === 2 ? `M${p.x} ${p.y} Q54 166 ${next.x} ${next.y}` : `M${p.x} ${p.y} L${next.x} ${next.y}`;
    return `<g><path class="h213-edge${closing ? " closing" : ""}${cut ? " cut" : ""}${gap ? " gap" : ""}" d="${line}"/>${gap ? `<text class="h213-gap" x="${(p.x + next.x) / 2}" y="${(p.y + next.y) / 2 - 5}">…</text>` : ""}</g>`;
  }).join("");
  const houses = points.map(p => house(p.i, [taken.has(p.i) ? "picked" : "", p.i === excluded ? "excluded" : "",
    p.i === v.currentIndex ? "current" : "", v.phase === "circle" && (p.i === 0 || p.i === n - 1) ? "endpoint" : ""].join(" "), p.x, p.y)).join("");
  const labels = { circle: vi ? "Không chọn nhà cạnh nhau" : "Never take neighbors", start: vi ? "Cắt vòng tròn" : "Break the circle",
    base: vi ? "Chọn hay bỏ?" : "Take or skip?", compute: vi ? "Chọn hay bỏ?" : "Take or skip?",
    "pass-done": vi ? "Xong lượt này" : "Pass complete", done: vi ? "Tổng lớn nhất" : "Largest total" };
  const center = n === 1 ? `<text class="h213-center" x="210" y="174" text-anchor="middle">${vi ? "Một nhà" : "One house"}</text>`
    : `<text class="h213-center" x="210" y="161" text-anchor="middle">0 ↔ ${n - 1}</text><text class="h213-center-note" x="210" y="184" text-anchor="middle">${vi ? "Không cùng chọn" : "Never take both"}</text>`;
  const miniStreet = (selected, options = {}) => {
    const list = options.ids || nums.map((_, i) => i);
    const chosen = new Set(selected);
    return `<div class="h213-street-scroll"><svg class="h213-street" width="${list.length * 62 + 12}" height="88" viewBox="0 0 ${list.length * 62 + 12} 88" role="img" aria-label="${vi ? "Nhà được chọn" : "Chosen houses"}: ${selected.length ? selected.join(', ') : (vi ? 'không có' : 'none')}">${list.map((i, pos) => house(i, [chosen.has(i) ? "picked" : "", i === options.excluded ? "excluded" : "", i === options.current ? "current" : ""].join(" "), 37 + pos * 62, 36)).join("")}</svg></div>`;
  };
  const cases = n > 1 ? ["A", "B"].map(key => {
    const state = v.passes[key];
    const active = v.pass === key || v.bestPass === key;
    return `<section class="h213-case ${active ? 'active' : ''}${v.bestPass === key ? ' winner' : ''}"><header><strong>${key} · ${vi ? key === 'A' ? 'Bỏ nhà cuối' : 'Bỏ nhà đầu' : key === 'A' ? 'Exclude last' : 'Exclude first'}</strong><output>${state.total === null ? '?' : `${state.status === 'running' ? (vi ? 'Tạm: ' : 'So far: ') : '= '}${state.total}`}</output></header>${miniStreet(state.robbed, { excluded: state.excluded, current: v.pass === key ? v.currentIndex : -1 })}</section>`;
  }).join("") : "";
  const f = v.formula;
  const candidate = (type, value, selected, equation) => {
    const winner = f.chosen === type;
    const local = [...new Set([...(selected.slice(-3)), Math.max(pass.range[0], f.i - 1), f.i])].sort((a,b) => a-b);
    return `<section class="h213-choice ${winner ? 'winner' : ''}"><header><span>${vi ? type === 'rob' ? 'Chọn' : 'Bỏ' : type === 'rob' ? 'Take' : 'Skip'} #${f.i}</span><b>${winner ? '✓' : ''}</b></header>${miniStreet(selected, { ids: local, excluded: type === 'rob' ? (f.i > pass.range[0] ? f.i - 1 : -1) : f.i })}<strong>${equation || value}</strong></section>`;
  };
  const choices = f ? `<div class="h213-choices">${candidate('skip', f.skip.value, f.skip.houses)}${candidate('rob', f.rob.total, f.rob.houses, `${f.rob.value} + ${f.rob.money} = ${f.rob.total}`)}</div>` : "";
  const total = v.answer === null ? '' : `<div class="h213-result"><span>${n > 1 ? `max(${v.passA}, ${v.passB})` : (vi ? 'Tổng' : 'Total')}</span><output>= ${v.answer}</output></div>`;
  $("treeView").innerHTML = `<section class="h213-viz" aria-label="${vi ? 'Nhà xếp vòng tròn: so sánh hai lượt' : 'Circular houses: compare two passes'}"><header><strong>${vi ? 'Dãy nhà vòng tròn' : 'Houses in a circle'}</strong><span>${labels[v.phase] || ''}</span></header>${total}<svg class="h213-circle" viewBox="0 0 420 335" role="img" aria-label="${n === 1 ? (vi ? 'Một nhà. Dấu chọn biểu thị nhà được chọn.' : 'One house. A check marks the chosen house.') : (vi ? 'Nhà đầu và cuối liền kề. Nhà xanh được chọn, nhà gạch chéo bị loại.' : 'First and last are adjacent. Green houses are chosen; crossed houses are excluded.')}">${edges}${center}${houses}</svg>${n > 10 ? `<small class="h213-short">${n} ${vi ? 'nhà · hình rút gọn' : 'houses · condensed view'}</small>` : ''}${choices}<div class="h213-cases">${cases}</div><footer><span class="picked">✓ ${vi ? 'Chọn' : 'Take'}</span><span>× ${vi ? 'Loại' : 'Exclude'}</span><span class="current">${vi ? 'Viền vàng: đang xét' : 'Gold outline: current'}</span></footer></section>`;
}
