let selectedFoodRatingsCuisine2353 = null;

const studyWord = (vi, en) => lang === "vi" ? vi : en;
function studyToken(value, sub = "", cls = "", tone = null) {
  return `<span class="study-token ${cls}"${tone === null ? "" : ` style="--study-tone:var(--study-c${tone % 6})"`}><b>${escapeHtml(String(value))}</b>${sub === "" ? "" : `<small>${escapeHtml(String(sub))}</small>`}</span>`;
}
function studyHeapPicture(entries, labels, { selected = [], stale = [], ranges = null, tones = null } = {}) {
  const esc = escapeHtml, levels = Math.floor(Math.log2(Math.max(1, entries.length))) + 1;
  const width = Math.max(280, 2 ** (levels - 1) * 76), height = levels * 60 + 12;
  const point = i => { const d = Math.floor(Math.log2(i + 1)); return [(i - 2 ** d + 1.5) * width / 2 ** d, d * 60 + 6]; };
  const edges = [], nodes = [];
  entries.forEach((entry, i) => {
    if (ranges && !ranges[i]) return;
    const [x, y] = point(i), text = labels(entry, i), active = selected.includes(i), expired = stale.includes(i);
    if (i && (!ranges || ranges[Math.floor((i - 1) / 2)])) {
      const p = point(Math.floor((i - 1) / 2));
      edges.push(`<line data-tree-edge="${Math.floor((i - 1) / 2)},${i}" x1="${p[0]}" y1="${p[1] + 42}" x2="${x}" y2="${y}"/>`);
    }
    nodes.push(`<g data-heap-index="${i}" class="study-node ${i === 0 ? "root" : ""} ${active ? "focus" : ""} ${expired ? "stale" : ""}" transform="translate(${x - 34},${y})"${tones ? ` style="--study-tone:var(--study-c${tones(entry, i) % 6})"` : ""}><title>${esc(JSON.stringify(entry))}</title><rect width="68" height="42" rx="10"/><text x="34" y="18" ${String(text[0]).length > 6 ? 'textLength="58" lengthAdjust="spacingAndGlyphs"' : ""}>${esc(String(text[0]))}</text><text class="study-node-sub" x="34" y="34" ${String(text[1]).length > 11 ? 'textLength="59" lengthAdjust="spacingAndGlyphs"' : ""}>${esc(String(text[1]))}</text>${expired ? '<path class="study-stale-cross" d="M8 6 60 36 M8 36 60 6"/>' : ""}</g>`);
  });
  return `<div class="study-tree-scroll"><svg style="max-width:${width}px" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="${ranges ? studyWord("Cây lưu giá trị MAX theo khoảng", "Range maximum segment tree") : studyWord("Cây heap, ứng viên ở gốc", "Heap tree, candidate at root")}">${edges.join("")}${nodes.join("") || `<text class="study-empty-svg" x="${width / 2}" y="40">∅</text>`}</svg></div>`;
}
function studyNumberLine(values, { left = null, right = null, focus = null, low = null, high = null, includeZero = false } = {}) {
  const all = [...values, ...(includeZero ? [0] : []), ...[low, high].filter(Number.isFinite)];
  const min = Math.min(...all), max = Math.max(...all), span = Math.max(1, max - min), x = value => max === min ? 200 : 26 + 348 * (value - min) / span;
  const band = Number.isFinite(low) && Number.isFinite(high) ? `<rect class="study-number-window" x="${x(low) - 5}" y="18" width="${Math.max(10, x(high) - x(low) + 10)}" height="30" rx="8"/>` : "";
  const unique = [...new Set(values)];
  const dots = unique.map(value => {
    const inWindow = Number.isFinite(low) && value >= low && value <= high;
    const l = Number.isInteger(left) && values[left] === value, r = Number.isInteger(right) && values[right] === value;
    return `<g class="study-line-dot ${inWindow ? "eligible" : ""} ${value === focus ? "current" : ""} ${l || r ? "endpoint" : ""}" data-number-value="${value}" transform="translate(${x(value)},40)"><title>${value}</title><circle r="${l || r || value === focus ? 7 : 4}"/><text y="21">${value}</text>${l || r ? `<text class="study-pointer-label" y="-20">${l && r ? "L=R" : l ? "L" : "R"}</text>` : ""}</g>`;
  }).join("");
  return `<svg class="study-numberline" viewBox="0 0 400 78" role="img" aria-label="${escapeHtml(studyWord("Vị trí các giá trị trên trục số", "Values on the number line"))}">${band}<path class="study-number-axis" d="M14 40H388m-7-4 7 4-7 4"/>${includeZero ? `<path class="study-zero-axis" d="M${x(0)} 23V48"/>${values.includes(0) ? "" : `<text class="study-zero-label" x="${x(0)}" y="73">0</text>`}` : ""}${dots}</svg>`;
}

function study378Picture(v) {
  const n = v.matrix.length, taken = new Set(v.taken.map(e => `${e.r},${e.c}`)), queued = new Set(v.heap.map(e => `${e[1]},${e[2]}`)), a = v.action;
  const cells = v.matrix.map((row, r) => `<span class="study-axis">${r}</span>${row.map((val, c) => {
    const key = `${r},${c}`, focus = a && a.r === r && a.c === c;
    return `<div class="study-matrix-cell ${taken.has(key) ? "done" : ""} ${queued.has(key) ? "queued" : ""} ${focus ? "focus" : ""}" data-matrix-cell="${key}" style="--study-tone:var(--study-c${r % 6})"><b>${val}</b>${queued.has(key) ? '<i>↓</i>' : taken.has(key) ? '<i>✓</i>' : ""}</div>`;
  }).join("")}`).join("");
  const stream = v.taken.map((entry, i) => studyToken(entry.val, `#${i + 1}`, i === v.k - 1 ? "winner" : "", entry.r)).join("");
  const root = v.heap[0];
  const action = a?.kind === "push" ? `${studyToken(a.val, `(${a.r},${a.c})`, "focus", a.r)}<strong>→</strong><svg class="study-mini-heap" viewBox="0 0 44 36" aria-hidden="true"><path d="M22 8 9 27M22 8 35 27"/><circle cx="22" cy="8" r="5"/><circle cx="9" cy="27" r="5"/><circle cx="35" cy="27" r="5"/></svg><b>heap</b>`
    : a?.kind === "pop" ? `<span>heap[0]</span><strong>→</strong>${studyToken(a.val, `(${a.r},${a.c})`, "focus", a.r)}<strong>→</strong><b>#${v.taken.length}</b>`
    : a?.kind === "check" ? `${studyToken(v.matrix[a.r][a.c], `(${a.r},${a.c})`, "", a.r)}<strong>→</strong>${a.pass ? studyToken(v.matrix[a.r][a.c + 1], `(${a.r},${a.c + 1})`, "queued", a.r) : `<strong>⊣</strong><span>${studyWord("Hết hàng", "Row ends")}</span>`}`
    : v.taken.length === v.k ? `<strong class="study-good">✓ #${v.k}</strong>${studyToken(v.taken.at(-1).val, "", "winner")}`
    : `<b>↓ ${n} ${studyWord("hàng", "rows")}</b><strong>→</strong><span>${studyWord("mỗi hàng 1 ứng viên", "one candidate per row")}</span>`;
  return `<div class="study-pair"><section class="study-panel"><header><b>${studyWord("Ma trận", "Matrix")}</b><small>→ ↓</small></header><div class="study-grid-scroll"><div class="study-matrix study-matrix-axes" style="--study-cols:${n}"><span class="study-axis">r/c</span>${Array.from({ length: n }, (_, c) => `<span class="study-axis">${c}</span>`).join("")}${cells}</div></div><div class="study-legend">↓ heap · ✓ ${studyWord("đã lấy", "popped")}</div></section><section class="study-panel"><header><b>MIN-HEAP</b><small>${root ? `★ ${root[0]}` : "∅"}</small></header>${v.heapReady ? studyHeapPicture(v.heap, e => [e[0], `(${e[1]},${e[2]})`], { selected: a?.kind === "push" ? [v.heap.findIndex(e => e[1] === a.r && e[2] === a.c)] : [0], tones: e => e[1] }) : '<div class="study-empty">—</div>'}</section></div><div class="study-action">${action}</div><section class="study-panel"><header><b>${studyWord("Thứ tự lấy ra", "Pop order")}</b><small>#${v.taken.length} / ${v.k}</small></header><div class="study-stream">${stream || "∅"}</div><div class="study-progress"><i style="width:${100 * v.taken.length / v.k}%"></i></div></section>`;
}

function study977Picture(v) {
  const used = new Set(v.used), a = v.action;
  const nums = v.nums.map((value, i) => `<span class="study-number ${used.has(i) ? "used" : ""} ${v.choice === i ? "focus" : ""}" style="--study-tone:var(--study-c${value < 0 ? 0 : 3})"><small>${i === v.left ? "L →" : ""} ${i === v.right ? "← R" : ""}</small><b>${value}</b><em>[${i}]</em></span>`).join("");
  const result = v.result.map((value, i) => `<span class="study-token ${v.written[i] ? "done" : ""} ${i === v.pos ? "focus" : ""}" data-result-index="${i}" data-written="${!!v.written[i]}"><small>${i === v.pos ? "↓ pos" : `[${i}]`}</small><b>${v.written[i] ? value : "·"}</b></span>`).join("");
  let compare;
  if (a?.kind === "compare") {
    const max = Math.max(1, a.a, a.b), side = value => Math.max(2, value / max * 55);
    const shape = (value, x) => value === 0 ? `<path class="study-square-zero" d="M${x - 4} 68h8"/>` : `<rect x="${x - side(value) / 2}" y="${68 - side(value)}" width="${side(value)}" height="${side(value)}" rx="4"/>`;
    compare = `<svg class="study-square-compare" viewBox="0 0 320 112" role="img" aria-label="${studyWord("So sánh diện tích hai hình vuông", "Compare the areas of two squares")}"><g class="study-square left ${a.fromLeft ? "chosen" : ""}">${shape(a.a, 72)}<text x="72" y="88">(${v.nums[v.left]})² = ${a.a ** 2}</text><text x="72" y="105">L</text></g><text class="study-square-sign" x="160" y="43">${a.fromLeft ? ">" : "≤"}</text><g class="study-square right ${!a.fromLeft ? "chosen" : ""}">${shape(a.b, 248)}<text x="248" y="88">(${v.nums[v.right]})² = ${a.b ** 2}</text><text x="248" y="105">R</text></g></svg>`;
  } else if (a?.kind === "write") {
    compare = `${studyToken(a.value, `[${a.from}]`, "focus")}<strong>² →</strong>${studyToken(a.square, `result[${a.to}]`, "winner")}<strong>↓</strong>`;
  } else compare = `<strong>${v.written.length && v.written.every(Boolean) ? "✓" : "L ⇢ 0 ⇠ R"}</strong><span>${studyWord("Lớn hơn → điền bên phải", "Larger square → fill right")}</span>`;
  const validPointers = Number.isInteger(v.left) && Number.isInteger(v.right) && v.left <= v.right;
  return `<section class="study-panel"><header><b>nums</b><small>${studyWord("khoảng cách tới 0", "distance from 0")}</small></header>${studyNumberLine(v.nums, { left: validPointers ? v.left : null, right: validPointers ? v.right : null, includeZero: true })}<div class="study-number-scroll">${nums}</div></section><div class="study-action">${compare}</div><section class="study-panel"><header><b>result</b><small>← ${studyWord("điền từ cuối", "fill from the end")}</small></header><div class="study-stream study-result">${result || "—"}</div></section>`;
}

function study3619Buckets(total, k, complete, accepted) {
  if (total === undefined) return '<div class="study-empty">Σ = ?</div>';
  const q = Math.floor(total / k), remainder = total % k;
  const groups = Array.from({ length: q > 3 ? 1 : q }, () => ({ amount: k, full: true }));
  groups.push({ amount: remainder, full: false });
  const start = (240 - groups.length * 52) / 2;
  const buckets = groups.map((g, i) => {
    const x = start + i * 52, fill = 48 * g.amount / k;
    return `<g class="study-bucket ${g.full ? "full" : "remainder"}" data-bucket-value="${g.amount}"><rect class="study-bucket-fill" x="${x + 3}" y="${61 - fill}" width="38" height="${fill}" rx="4"/><path d="M${x} 12V64H${x + 44}V12"/><text x="${x + 22}" y="38">${g.amount}</text><text class="study-bucket-label" x="${x + 22}" y="82">${g.full ? q > 3 ? `×${q}` : `k=${k}` : "r"}</text></g>`;
  }).join("");
  return `<svg class="study-buckets" viewBox="0 0 240 96" role="img" aria-label="${escapeHtml(`${total} = ${q} × ${k} + ${remainder}`)}">${buckets}</svg><div class="study-division ${complete ? accepted ? "accepted" : "rejected" : ""}"><span>${total} = ${q} × ${k} + <b>${remainder}</b></span>${complete ? `<strong>${accepted ? "✓" : "✕"}</strong>` : ""}</div>`;
}
function study3619Picture(v) {
  const n = v.grid[0].length, tile = 44, margin = 22, w = n * tile + margin + 4, h = v.grid.length * tile + margin + 4;
  const queued = new Set(v.queue.map(cell => cell.join(","))), a = v.action, activeRecord = v.islands[v.island];
  const axes = Array.from({ length: n }, (_, c) => `<text class="study-island-axis" x="${margin + (c + .5) * tile}" y="11">${c}</text>`).join("") + v.grid.map((_, r) => `<text class="study-island-axis" x="10" y="${margin + (r + .5) * tile}">${r}</text>`).join("");
  const cells = v.grid.flatMap((row, r) => row.map((value, c) => {
    const key = `${r},${c}`, owner = v.owners[key], record = v.islands[owner], here = v.current?.[0] === r && v.current[1] === c;
    const near = a?.cell?.[0] === r && a.cell[1] === c;
    return `<g class="study-island-cell ${value ? "land" : "water"} ${owner === undefined ? "unseen" : "owned"} ${queued.has(key) ? "queued" : ""} ${here ? "focus" : ""} ${near ? "neighbor" : ""} ${record?.complete ? record.accepted ? "accepted" : "rejected" : ""}" data-grid-cell="${key}" transform="translate(${margin + c * tile},${margin + r * tile})" style="--study-tone:var(--study-c${(owner ?? 0) % 6})"><title>(${r},${c}) = ${value}</title><rect x="2" y="2" width="40" height="40" rx="10"/><text x="22" y="26" style="font-size:${Math.min(16, 57 / String(value).length)}px">${value || "≋"}</text>${owner === undefined ? "" : `<text class="study-cell-id" x="34" y="11">${owner + 1}</text>`}</g>`;
  })).join("");
  let arrow = "";
  if (a?.cell && v.current) {
    const [r, c] = v.current, dr = a.cell[0] - r, dc = a.cell[1] - c;
    if (Math.abs(dr) + Math.abs(dc) === 1) {
      const x = margin + (c + .5) * tile, y = margin + (r + .5) * tile;
      arrow = `<path class="study-grid-arrow ${a.pass === false ? "rejected" : ""}" d="M${x + dc * 15} ${y + dr * 15}l${dc * 14} ${dr * 14}" marker-end="url(#study-island-${a.pass === false ? "reject" : "arrow"})"/>`;
    }
  }
  const queue = v.queue.map((cell, i) => studyToken(cell.join(","), !i ? "←" : "", !i ? "focus" : "")).join("");
  const records = v.islands.map((record, i) => {
    const minR = record.cells.length ? Math.min(...record.cells.map(cell => cell[0])) : 0;
    const minC = record.cells.length ? Math.min(...record.cells.map(cell => cell[1])) : 0;
    return `<article class="study-island-record ${record.complete ? record.accepted ? "accepted" : "rejected" : ""}" style="--study-tone:var(--study-c${i % 6})"><small>#${i + 1}</small><div class="study-island-mini">${record.cells.map(cell => `<i style="grid-row:${cell[0] - minR + 1};grid-column:${cell[1] - minC + 1}"></i>`).join("")}</div><b>Σ ${record.total}</b><strong>${record.complete ? record.accepted ? "✓" : "✕" : "…"}</strong></article>`;
  }).join("");
  const action = a?.kind === "add" ? `${studyToken(v.total - a.value)}<strong>+ ${a.value} →</strong>${studyToken(v.total, "Σ", "focus")}`
    : a?.kind === "accept" ? `<strong>✓ → ${v.answer}</strong>`
    : a?.kind === "neighbor" && a.pass !== undefined ? `${studyToken(a.cell.join(","))}<strong>${a.pass ? "✓ → Q" : "✕"}</strong>`
    : a?.kind === "skip" ? `<strong>${a.pass ? "↷" : "🏝"}</strong>` : `<strong>↓ ↑ → ←</strong>`;
  return `<div class="study-pair"><section class="study-panel"><header><b>${studyWord("Bản đồ đảo", "Island map")}</b><small>0 ≋</small></header><div class="study-grid-scroll"><svg class="study-island-grid" style="max-width:${Math.min(w, 440)}px" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="${studyWord("Đảo gồm các ô dương nối theo bốn hướng", "Islands contain positive cells connected in four directions")}"><defs><marker id="study-island-arrow" viewBox="0 0 8 8" refX="6" refY="4" markerWidth="4" markerHeight="4" orient="auto"><path d="M0 0 8 4 0 8Z"/></marker><marker id="study-island-reject" viewBox="0 0 8 8" refX="6" refY="4" markerWidth="4" markerHeight="4" orient="auto"><path d="M0 0 8 4 0 8Z"/></marker></defs>${axes}${cells}${arrow}</svg></div></section><section class="study-panel"><header><b>Σ ${v.total ?? "?"}</b><small>k = ${v.k}</small></header>${study3619Buckets(v.total, v.k, activeRecord?.complete, activeRecord?.accepted)}<div class="study-action">${action}</div><header><b>FIFO</b><small>${v.queue.length}</small></header><div class="study-stream">${queue || "∅"}</div></section></div><div class="study-island-records">${records || '<span class="study-empty">🏝 ?</span>'}</div><div class="study-score">✓ <strong>${v.answer}</strong> <small>${studyWord("đảo", "islands")}</small></div>`;
}

function study2353FoodMap(v) {
  const esc = escapeHtml, name = v.local.food, writing = v.line === 8 || v.line === 12;
  const tuple = (rating, cuisine) => `<span class="study-food-tuple">(<span class="study-food-rating">${rating}</span>, <span class="study-food-origin">&quot;${esc(cuisine)}&quot;</span>)</span>`;
  const assignment = name && (writing || v.line === 7 && !Object.hasOwn(v.food, name)) ? `<div class="study-food-assignment ${writing ? "written" : ""}"><small>${writing ? studyWord(v.line === 8 ? "Thêm vào bảng" : "Cập nhật trong bảng", v.line === 8 ? "Add to the dictionary" : "Update the dictionary") : studyWord("Chuẩn bị ghi", "About to write")}</small><div><code>self.food[</code>${studyToken(`"${name}"`, "food · key")}<code>] = (</code>${studyToken(v.line === 12 ? v.local.newRating : v.local.rating, `${v.line === 12 ? "newRating" : "rating"} · [0]`, "", 3)}<code>,</code>${studyToken(`"${v.local.cuisine}"`, "cuisine · [1]", "", 2)}<code>)</code></div><p>${studyWord("Dùng tên món làm key, lưu cặp (điểm, loại ẩm thực).", "Use the food name as the key and store (rating, cuisine).")}</p></div>` : "";
  const rows = Object.entries(v.food).map(([food, [rating, cuisine]]) => {
    const focused = food === name;
    const previous = focused && v.line === 12 ? `<span class="study-food-previous">${tuple(v.action.from, cuisine)}</span><span aria-hidden="true"> → </span>` : "";
    return `<tr class="${focused ? "current" : ""} ${focused && writing ? "written" : ""}" data-food-map-key="${esc(food)}"><th scope="row">&quot;${esc(food)}&quot;</th><td>${previous}${tuple(rating, cuisine)}${focused && writing ? `<small class="study-food-saved">✓ ${studyWord("đã lưu", "saved")}</small>` : ""}</td></tr>`;
  }).join("");
  return `<section class="study-panel study-food-map"><header><b>self.food</b><small>${Object.keys(v.food).length} ${studyWord("món đã lưu", "stored foods")}</small></header><p class="study-food-map-help">${studyWord("self = đối tượng FoodRatings này; self.food = dictionary của đối tượng.", "self = this FoodRatings object; self.food = its dictionary.")}</p>${assignment}<div class="study-food-map-scroll">${rows ? `<table><thead><tr><th scope="col">food · key</th><th scope="col">(rating, cuisine) · value</th></tr></thead><tbody>${rows}</tbody></table>` : `<div class="study-empty">{} · ${studyWord("Chưa lưu món nào", "No foods stored yet")}</div>`}</div><div class="study-legend"><span class="study-food-rating">[0] = rating</span> · <span class="study-food-origin">[1] = cuisine</span></div></section>`;
}

function study2353Picture(v) {
  const esc = escapeHtml, cuisines = [...new Set(v.cuisines)], a = v.action, active = v.local.cuisine, max = Math.max(1, ...Object.values(v.food).map(e => e[0]));
  const displayCuisine = cuisines.includes(selectedFoodRatingsCuisine2353) ? selectedFoodRatingsCuisine2353 : active || cuisines[0];
  const cards = cuisines.map((cuisine, i) => `<section class="study-cuisine ${active === cuisine ? "focus" : ""} ${displayCuisine === cuisine ? "selected" : ""}" style="--study-tone:var(--study-c${i % 6})"><header><button type="button" data-study-cuisine="${esc(cuisine)}" aria-pressed="${displayCuisine === cuisine}">🍽 ${esc(cuisine)}</button></header>${v.foods.filter(name => v.food[name]?.[1] === cuisine).map(name => `<div class="study-food ${v.local.food === name || a?.kind === "return" && a.food === name ? "focus" : ""}" data-food="${esc(name)}"><b>${esc(name)}</b><span>★ ${v.food[name][0]}</span><i style="width:${100 * v.food[name][0] / max}%"></i></div>`).join("") || '<span class="study-empty">∅</span>'}</section>`).join("");
  const tabs = cuisines.map((cuisine, i) => `<button type="button" class="study-cuisine-tab ${active === cuisine ? "active-cuisine" : ""}" id="study-cuisine-tab-${i}" role="tab" aria-selected="${displayCuisine === cuisine}" aria-controls="study-cuisine-panel" tabindex="${displayCuisine === cuisine ? 0 : -1}" data-study-cuisine-tab="${esc(cuisine)}" style="--study-tone:var(--study-c${i % 6})">${esc(cuisine)}<small>${(v.heaps[cuisine] || []).length}</small></button>`).join("");
  const heaps = cuisines.filter(cuisine => cuisine === displayCuisine).map(cuisine => {
    const i = cuisines.indexOf(cuisine);
    const heap = v.heaps[cuisine] || [], stale = heap.map((e, index) => -e[0] !== v.food[e[1]][0] ? index : -1).filter(index => index >= 0);
    const selected = displayCuisine !== cuisine ? [] : a?.kind === "push" && active === cuisine ? [heap.findLastIndex(e => e[0] === a.entry[0] && e[1] === a.entry[1])] : [0];
    return `<section class="study-cuisine-heap ${active === cuisine ? "focus" : ""} selected" data-cuisine-heap="${esc(cuisine)}" id="study-cuisine-panel" role="tabpanel" aria-labelledby="study-cuisine-tab-${i}" tabindex="0" style="--study-tone:var(--study-c${i % 6})"><header><b>heap · ${esc(cuisine)}</b><small>${heap.length} · ★ ↓ · a → z</small></header>${studyHeapPicture(heap, e => [e[1], `★ ${-e[0]}`], { selected, stale })}</section>`;
  }).join("");
  const rail = v.operations.map((op, i) => `<span class="study-op ${i === v.activeIndex ? "focus" : i > v.activeIndex ? "future" : ""}" title="${esc(`${op.name}(${op.args.join(", ")})`)}"><small>${i + 1}</small>${op.name === "highestRated" ? "★" : "↻"}${i === v.activeIndex ? ` ${esc(op.args.join(" → "))}` : ""}</span>`).join("");
  const heap = v.heaps[active] || [];
  const action = a?.kind === "change" ? `<b>${esc(a.food)}</b>${studyToken(`★ ${a.from}`)}<strong>→</strong>${studyToken(`★ ${a.to}`, "", "winner")}`
    : a?.kind === "remove" ? `${studyToken(a.entry[1], `★ ${-a.entry[0]}`, "study-stale")}<strong>✕ → 🗑</strong>`
    : a?.kind === "push" ? `${studyToken(a.entry[1], `★ ${-a.entry[0]}`, "focus")}<strong>→</strong><b>heap</b>`
    : a?.kind === "return" ? `<strong>🏆</strong>${studyToken(a.food, `★ ${v.food[a.food][0]}`, "winner")}`
    : a?.kind === "check" ? `${studyToken(heap[0][1], `★ ${-heap[0][0]}`, a.pass ? "study-stale" : "focus")}<strong>${a.pass ? "≠" : "="}</strong>${studyToken(`★ ${v.food[heap[0][1]][0]}`, studyWord("điểm hiện tại", "live rating"))}<strong>${a.pass ? "✕" : "✓"}</strong>` : `<strong>🍽 → ★</strong>`;
  const members = v.foods.filter(name => v.food[name]?.[1] === active);
  const tied = a?.kind === "return" ? members.filter(name => v.food[name][0] === v.food[a.food][0]).sort() : [];
  const tie = tied.length > 1 ? `<div class="study-food-tie">★ ${v.food[a.food][0]} = ★ ${v.food[a.food][0]} <span>${esc(tied[0])} &lt; ${esc(tied[1])}</span><strong>→ ${esc(tied[0])}</strong></div>` : "";
  const history = v.history.map(record => studyToken(record.food, `${record.cuisine} · ★${record.rating}`, "winner")).join("");
  return `<div class="study-ops">${rail || "🍽 ?"}</div>${study2353FoodMap(v)}<div class="study-cuisines">${cards}</div><div class="study-action">${action}</div>${tie}<section class="study-panel"><header><b>${studyWord("Heap theo cuisine", "Heaps by cuisine")}</b><small>✕ ${studyWord("bản cũ", "stale entry")} · (−rating, food)</small></header><div class="study-cuisine-tabs" role="tablist" aria-label="${studyWord("Heap theo cuisine", "Heaps by cuisine")}">${tabs}</div><div class="study-cuisine-heaps">${heaps}</div></section><div class="study-stream">${history || "🏆 ?"}</div>`;
}

function study2407Picture(v) {
  const nums = v.nums, current = v.currentIndex, chain = new Set(v.chain), max = Math.max(1, ...v.dp.filter(Number.isFinite));
  const eligible = i => current >= 0 && i < current && nums[i] >= nums[current] - v.k && nums[i] < nums[current];
  const sequence = nums.map((x, i) => `<span class="study-lis-column ${i === current ? "focus" : ""} ${i === v.predecessorIndex || chain.has(i) ? "winner" : ""} ${eligible(i) ? "eligible" : ""} ${current >= 0 && i > current ? "future" : ""}" data-sequence-index="${i}"><small>dp=${v.dp[i] ?? "·"}</small><i style="height:${(v.dp[i] ?? 0) / max * 55}px"></i><b>${x}</b><em>[${i}]</em></span>`).join("");
  const leaves = v.values.map((x, i) => `<span class="study-token ${v.leftCoord !== null && i >= v.leftCoord && i <= v.rightCoord ? "queued" : ""} ${x === v.currentValue ? "focus" : ""}" data-value-slot="${x}"><small>${x}</small><b>${v.tree[v.size + i - 1]}</b></span>`).join("");
  const selected = (v.operation === "update" ? v.updatePath : v.queryNodes).map(i => i - 1);
  const tree = studyHeapPicture(v.tree, (entry, i) => {
    const bounds = v.coverage[i]; return [entry, bounds ? `${v.values[bounds[0]]}…${v.values[bounds[1]]}` : "—"];
  }, { selected, ranges: v.coverage });
  const nodes = v.queryNodes.map(node => {
    const bounds = v.coverage[node - 1];
    return studyToken(v.tree[node - 1], bounds ? `[${v.values[bounds[0]]},${v.values[bounds[1]]}]` : "", "queued");
  }).join("");
  const action = v.operation === "done" ? v.chain.map((i, p) => `${p ? '<strong>→</strong>' : ""}${studyToken(nums[i], `[${i}]`, "winner")}`).join("")
    : `${studyToken(v.predecessorIndex >= 0 ? nums[v.predecessorIndex] : "∅", v.predecessorIndex >= 0 ? `[${v.predecessorIndex}]` : "")}<strong>→</strong>${studyToken(v.currentValue ?? "?", current >= 0 ? `[${current}]` : "", "focus")}<b>${v.queryLength ?? "?"} + 1 = ${current >= 0 ? v.dp[current] ?? "?" : "?"}</b>`;
  return `<section class="study-panel"><header><b>nums → dp</b><small>k = ${v.k} · ${studyWord("chỉ nối sang phải", "only connect rightward")}</small></header><div class="study-lis-scroll">${sequence}</div></section><div class="study-action">${action}</div><section class="study-panel"><header><b>[x−k, x−1]</b><small>${v.leftValue === null ? "—" : `[${v.leftValue}, ${v.rightValue}]`}</small></header>${studyNumberLine(v.values, { focus: v.currentValue, low: v.leftValue, high: v.rightValue })}<div class="study-stream">${leaves}</div><div class="study-query-nodes"><span>MAX</span>${nodes || studyToken(v.queryLength ?? "?", "∅")}<strong>→ ${v.queryLength ?? "?"}</strong></div></section><section class="study-panel"><header><b>${studyWord("Cây MAX", "MAX tree")}</b><small>${v.operation === "update" ? "↑ UPDATE" : "↓ QUERY"}</small></header>${tree}</section><div class="study-score">★ <strong>${v.answer}</strong></div>`;
}

function renderPictureStudy(step) {
  const v = step.pictureStudyView, host = $("treeView"), esc = escapeHtml;
  const names = { 378: "▦ → heap → #k", 3619: "🏝 → Σ → ✓", 2407: "[x−k, x−1] → MAX → +1", 977: "L ⇢ 0 ⇠ R → x²", 2353: "🍽 → ★ → 🏆" };
  const render = { 378: study378Picture, 3619: study3619Picture, 2407: study2407Picture, 977: study977Picture, 2353: study2353Picture }[v.id];
  host.innerHTML = `<section class="study-viz" data-study-id="${v.id}" aria-label="#${v.id} ${esc(names[v.id])}"><header class="study-heading"><b>#${v.id} · ${names[v.id]}</b><small>${lang === "vi" ? "Dòng" : "Line"} ${v.line}</small></header>${render(v)}</section>`;
  for (const tree of host.querySelectorAll(".study-tree-scroll")) {
    const target = tree.querySelector(".study-node.focus") || tree.querySelector(".study-node");
    if (target) { const rect = target.getBoundingClientRect(), box = tree.getBoundingClientRect(); tree.scrollLeft = Math.max(0, rect.x - box.x + tree.scrollLeft - tree.clientWidth / 2 + rect.width / 2); tree.scrollTop = Math.max(0, rect.y - box.y + tree.scrollTop - tree.clientHeight / 2 + rect.height / 2); }
  }
  for (const container of host.querySelectorAll(".study-number-scroll, .study-lis-scroll, .study-result")) {
    const target = container.querySelector(".focus"); if (target) container.scrollLeft = Math.max(0, target.offsetLeft - container.clientWidth / 2);
  }
  const ops = host.querySelector(".study-ops"), active = ops?.querySelector(".focus");
  if (active) { ops.scrollLeft = Math.max(0, active.offsetLeft - ops.clientWidth / 2 + active.clientWidth / 2); }
  if (v.id === 2353) {
    const row = host.querySelector(".study-food-map tr.current"), dictionary = host.querySelector(".study-food-map-scroll");
    if (row && dictionary) dictionary.scrollTop = Math.max(0, row.offsetTop - dictionary.clientHeight / 2 + row.offsetHeight / 2);
    const selectCuisine = (cuisine, focusTab = false) => {
      selectedFoodRatingsCuisine2353 = cuisine;
      renderPictureStudy(step);
      if (focusTab) host.querySelector(`[data-study-cuisine-tab="${esc(cuisine)}"]`)?.focus();
    };
    host.querySelectorAll("[data-study-cuisine]").forEach(button => button.addEventListener("click", () => {
      selectCuisine(button.dataset.studyCuisine, true);
    }));
    const tabs = [...host.querySelectorAll("[data-study-cuisine-tab]")];
    tabs.forEach((button, index) => {
      button.addEventListener("click", () => selectCuisine(button.dataset.studyCuisineTab, true));
      button.addEventListener("keydown", event => {
        const next = { ArrowRight: (index + 1) % tabs.length, ArrowLeft: (index - 1 + tabs.length) % tabs.length, Home: 0, End: tabs.length - 1 }[event.key];
        if (next === undefined) return;
        event.preventDefault();
        selectCuisine(tabs[next].dataset.studyCuisineTab, true);
      });
    });
  }
}
