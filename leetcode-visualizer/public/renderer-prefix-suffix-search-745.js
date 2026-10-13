function renderPrefixSuffix745View(step) {
  const v = step.prefixSuffix745View;
  const t = (vi, en) => lang === "vi" ? vi : en;
  const q = v.query;
  const slices = (pref, suff) => `<span class="ps745-prefix">${pref ?? "—"}</span><b>＋</b><span class="ps745-suffix">${suff ?? "—"}</span>`;
  const letters = (word, pref, suff, small = false) => [...word].map((ch, i) => {
    const a = pref != null && word.startsWith(pref) && i < pref.length;
    const b = suff != null && word.endsWith(suff) && i >= word.length - suff.length;
    return `<span class="ps745-letter${a && b ? " both" : a ? " prefix" : b ? " suffix" : ""}"><b>${ch}</b>${small ? "" : `<small>${i}</small>`}</span>`;
  }).join("");
  const words = v.words.map((word, i) => {
    const revealed = q && q.result !== null;
    const match = revealed && word.startsWith(q.pref) && word.endsWith(q.suff);
    return `<article class="ps745-word${i === v.wordIndex ? " current" : ""}${q?.result === i ? " selected" : ""}${match ? " match" : ""}" data-index="${i}"><small>#${i}${q?.result === i ? " ★" : ""}</small><div class="ps745-mini-letters">${letters(word, q?.pref, q?.suff, true)}</div>${revealed ? `<span class="ps745-checks"><i class="ps745-prefix">${word.startsWith(q.pref) ? "✓" : "×"}</i><i class="ps745-suffix">${word.endsWith(q.suff) ? "✓" : "×"}</i></span>` : ""}</article>`;
  }).join("");
  let build = "";
  if (v.word !== null) {
    const product = v.strategy === "cartesian-product";
    const prefixes = product ? v.prefixes : Array.from({ length: v.word.length }, (_, i) => v.word.slice(0, i + 1));
    const suffixes = product ? v.suffixes : Array.from({ length: v.word.length }, (_, i) => v.word.slice(-i - 1));
    const axes = product ? `<section class="ps745-product"><header>${t("TÍCH DESCARTES", "CARTESIAN PRODUCT")} <span>${prefixes.length} × ${suffixes.length} = ${v.pairCount}</span></header><div class="ps745-product-formula"><div>${prefixes.map(pref => `<code class="ps745-prefix${pref === v.pref ? " active" : ""}">${pref}</code>`).join("") || "—"}</div><b>×</b><div>${suffixes.map(suff => `<code class="ps745-suffix${suff === v.suff ? " active" : ""}">${suff}</code>`).join("") || "—"}</div></div></section>` : "";
    const columns = suffixes.map((suff, i) => `<th scope="col" class="${v.s === i + 1 ? "current" : ""}">${suff}</th>`).join("");
    const rows = v.grid.map((row, r) => `<tr><th scope="row" class="${v.p === r + 1 ? "current" : ""}">${prefixes[r]}</th>${row.map((value, c) => `<td data-p="${r + 1}" data-s="${c + 1}" class="${value === null ? "empty" : "stored"}${v.p === r + 1 && v.s === c + 1 ? " active" : ""}">${value ?? "·"}</td>`).join("")}</tr>`).join("");
    const write = v.pref !== null && v.suff !== null ? `<div class="ps745-key">${slices(v.pref, v.suff)}<span>→</span><div class="ps745-register"><small>index</small><b>${v.event === "write" ? `${v.previousIndex ?? "∅"} → ${v.wordIndex}` : v.grid[v.p - 1]?.[v.s - 1] ?? "∅"}</b></div>${v.event === "write" ? '<span class="ps745-written">✓</span>' : ""}</div>` : "";
    build = `<section class="ps745-build"><header><strong>${t("Tạo khóa", "Build keys")} · #${v.wordIndex}</strong><span>${v.lookupSize} ${t("khóa", "keys")}</span></header><div class="ps745-letters">${letters(v.word, v.pref, v.suff)}</div>${write}${axes}<div class="ps745-grid-scroll"><table class="ps745-grid"><caption><span class="ps745-prefix">prefix ↓</span> × <span class="ps745-suffix">suffix →</span> · ${t("ô = index", "cell = index")}</caption><thead><tr><th scope="col">×</th>${columns}</tr></thead><tbody>${rows}</tbody></table></div></section>`;
  }
  const query = q ? `<section class="ps745-query"><header><strong>f #${q.index + 1}</strong><span>${t("Tra 1 khóa", "One key lookup")}</span></header><div class="ps745-key">${slices(q.pref, q.suff)}<span>→</span><div class="ps745-register${q.result === -1 ? " missing" : ""}"><small>${q.result === null ? "index" : q.result === -1 ? "∅" : t("index lớn nhất", "largest index")}</small><b>${q.result ?? "?"}</b></div></div></section>` : "";
  const output = v.outputs.map((value, i) => `<span><small>${i === 0 ? "init" : `f #${i}`}</small><b>${value === null ? "null" : value}</b></span>`).join("");
  $("treeView").innerHTML = `<section class="ps745-viz" data-line="${v.line}" aria-label="${t("Mô phỏng prefix và suffix", "Prefix and suffix simulation")}"><header class="ps745-heading"><h3>#745 · ${v.strategy === "cartesian-product" ? "Product" : "Hash Map"}</h3><span>${t("Dòng", "Line")} ${v.line}</span></header><div class="ps745-legend"><span class="ps745-prefix">▰ prefix</span><span class="ps745-suffix">▰ suffix</span><span>★ ${t("index lớn nhất", "largest index")}</span></div>${query}<div class="ps745-words">${words}</div>${build}${v.phase === "ready" || v.event === "initialize" ? `<div class="ps745-ready">${v.event === "initialize" ? "∅" : "✓"}<span>${v.lookupSize} ${t("khóa", "keys")}</span></div>` : ""}${output ? `<section class="ps745-output"><header>${t("Kết quả", "Results")}</header><div>${output}</div></section>` : ""}<details class="ps745-details"><summary>${t("Chi tiết bước", "Step details")}</summary><code>${escapeHtml(v.source.trim())}</code><p>${escapeHtml(pick(step.note))}</p></details></section>`;
}
