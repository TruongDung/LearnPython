function renderExpression282Pictures(step) {
  const v = step.expression282View, t = (vi, en) => lang === "vi" ? vi : en, esc = x => escapeHtml(String(x));
  const done = v.phase === "done", frame = v.stack.at(-1), selectedRange = ["range", "zero-check", "break", "piece", "operand", "first-check", "resume"].includes(v.phase) && v.j !== null;
  const number = (value, extra = "") => `<b class="ex282-number ${extra}">${esc(value < 0 ? `(${value})` : value)}</b>`;
  const op = symbol => `<i class="ex282-op ${symbol === "*" ? "multiply" : symbol === "-" ? "minus" : "plus"}">${symbol === "*" ? "×" : symbol === "-" ? "−" : symbol}</i>`;
  const expression = (text, compact = false) => {
    const groups = text.match(/[+-]?\d+(?:\*\d+)*/g) || [];
    let digitIndex = 0;
    return groups.length ? groups.map((group, g) => {
      const sign = /^[+-]/.test(group) ? group[0] : "", core = sign ? group.slice(1) : group, factors = core.split("*");
      const inner = factors.map((digits, f) => {
        const start = digitIndex; digitIndex += digits.length;
        return `${f ? op("*") : ""}<b class="ex282-factor" data-expression-range="${start}:${digitIndex}">${esc(digits)}</b>`;
      }).join("");
      const isLast = g === groups.length - 1 && !compact;
      return `${sign && !isLast ? op(sign) : ""}<span class="ex282-term ${isLast ? "last" : ""}" data-term="${esc(group)}">${sign && isLast ? op(sign) : ""}${inner}${g === groups.length - 1 && !compact ? `<small>last = ${esc(v.last)}</small>` : ""}</span>`;
    }).join("") : '<span class="ex282-empty">∅</span>';
  };
  const source = [...v.num].map((digit, i) => `<div class="ex282-digit ${v.i !== null && i < v.i ? "consumed" : ""} ${selectedRange && i >= v.i && i <= v.j ? "selected" : ""} ${v.leadingZero && selectedRange && i >= v.i && i <= v.j ? "invalid" : ""}" data-digit="${i}"><small>${v.i === i && selectedRange ? "i ↓" : v.j === i && selectedRange ? "j ↓" : ""}</small><b>${digit}</b><span>[${i}]</span></div>`).join("");
  const change = ["enter", "compare", "save", "return"].includes(v.phase) ? v.transition : null;
  let operation;
  if (done) operation = `<div class="ex282-finished"><strong>${v.resultCount ? "✓" : "∅"}</strong><b>${v.resultCount}</b><span>${t("biểu thức", "expressions")}</span></div>`;
  else if (v.phase === "resume") operation = `<div class="ex282-return"><div class="ex282-expression compact">${expression(v.returned.nextExpr, true)}</div><strong>↩</strong><div class="ex282-expression compact">${expression(v.expr, true)}</div></div>`;
  else if (v.phase === "compare" || v.phase === "save") operation = `<div class="ex282-compare ${v.match ? "pass" : "fail"}"><span><small>cur</small>${number(v.cur)}</span><strong>${v.match ? "=" : "≠"}</strong><span><small>target</small>${number(v.target)}</span><b>${v.match ? "✓" : "×"}</b></div>`;
  else if (change?.operator === "*") {
    const base = change.fromCur - change.fromLast;
    operation = `<div class="ex282-multiply-diagram" data-multiply="${change.fromCur},${change.fromLast},${change.operand}"><div class="ex282-math-row"><span><small>cur − last</small>${number(base, "base")}</span>${op("+")}<span><small>last</small>${number(change.fromLast, "old")}</span><strong>=</strong>${number(change.fromCur)}</div><div class="ex282-replace"><span></span><b>↓ × ${change.operand}</b><span></span></div><div class="ex282-math-row"><span>${number(base, "base")}</span>${op("+")}<span><small>last × operand</small>${number(change.nextLast, "new")}</span><strong>=</strong><span><small>cur</small>${number(change.nextCur, "new")}</span></div></div>`;
  } else if (change) operation = `<div class="ex282-simple-math">${change.operator ? number(change.fromCur) + op(change.operator) : ""}${number(change.operand)}<strong>→</strong><span><small>cur</small>${number(v.cur, "new")}</span><span><small>last</small>${number(v.last, "last-value")}</span></div>`;
  else if (selectedRange && v.phase !== "exhausted") {
    const candidate = v.num.slice(v.i, v.j + 1), converted = ["operand", "first-check"].includes(v.phase);
    operation = `<div class="ex282-join ${v.leadingZero ? "invalid" : ""}" data-candidate="${candidate}"><div>${[...candidate].map(digit => `<b>${digit}</b>`).join("")}</div><strong>${v.leadingZero ? "×" : "↓"}</strong><span class="ex282-joined ${v.leadingZero ? "crossed" : ""}">${converted ? Number(candidate) : `"${candidate}"`}</span><small>${v.leadingZero ? t("Không có 0 ở đầu", "No leading zero") : converted ? "operand" : "num[i:j + 1]"}</small></div>`;
  } else if (["return", "exhausted", "root-return"].includes(v.phase)) operation = `<div class="ex282-empty-operation"><strong>↩</strong><code>${t("Quay lui", "Backtrack")}</code></div>`;
  else operation = `<div class="ex282-empty-operation"><strong>＋ − ×</strong><code>${v.phase === "init" ? "result = []" : "bt(i, expr, cur, last)"}</code></div>`;
  const activeOperator = v.phase === "resume" ? v.returned.operator : change?.operator;
  const choices = ["+", "-", "*"].map(operator => `<span class="ex282-choice ${operator === activeOperator ? "active" : ""}">${op(operator)}${operator === activeOperator ? `<b>${v.phase === "resume" ? "↩" : "↓"}</b>` : ""}</span>`).join("");
  const stack = v.stack.map((f, depth) => `<article class="ex282-frame ${depth === v.stack.length - 1 ? "active" : ""}" data-frame-id="${f.id}"><header><b>bt(${f.i})</b><small>d=${depth}</small></header><div class="ex282-expression compact">${expression(f.expr, true)}</div><footer><span>cur <b>${f.cur}</b></span><span>last <b>${f.last}</b></span></footer></article>`).join("") || `<div class="ex282-stack-empty">${done || v.phase === "root-return" ? "✓" : "↓"}<code>bt(0, '', 0, 0)</code></div>`;
  const results = v.results.map((expr, index) => `<article class="ex282-result ${v.phase === "save" && index === v.results.length - 1 ? "new" : ""}" data-result-number="${v.shownFrom + index + 1}"><small>#${v.shownFrom + index + 1}</small><div class="ex282-expression compact">${expression(expr, true)}<strong>= ${v.target} ✓</strong></div></article>`).join("") || '<span class="ex282-empty">∅</span>';
  const summary = t(`Sau dòng ${v.source.line}, biểu thức ${v.expr || "rỗng"}, ${v.resultCount} kết quả`, `After line ${v.source.line}, expression ${v.expr || "empty"}, ${v.resultCount} results`);
  const host = $("treeView");
  host.innerHTML = `<section class="ex282-viz" role="group" aria-label="${esc(summary)}"><header class="ex282-heading"><b>target <strong>${v.target}</strong></b><span>${t("Sau dòng", "After line")} <strong>${v.source.line}</strong></span></header><div class="ex282-source"><code>num</code><div>${source}</div><small>${v.i === null ? "—" : `${v.i} / ${v.num.length}`}</small></div><div class="ex282-main"><div class="ex282-work"><section class="ex282-current"><header><b>expr</b><span>cur <strong>${v.cur === null ? "—" : v.cur}</strong></span></header><div class="ex282-expression">${expression(v.expr)}</div></section><div class="ex282-choices" aria-label="${esc(t("Ba nhánh toán tử", "Three operator branches"))}">${choices}</div><div class="ex282-operation">${operation}</div>${change?.operator === "*" && v.phase === "enter" ? '<div class="ex282-formula"><code>cur − last + last × operand</code></div>' : ""}</div><section class="ex282-stack"><header><b>↳ bt</b><small>${t("Nhánh hiện tại", "Current branch")}</small></header><div>${stack}</div></section></div><section class="ex282-results"><header><b>result <strong>${v.resultCount}</strong></b><small>${v.shownFrom ? `+${v.shownFrom} ${t("kết quả trước", "earlier")}` : done ? t("Tất cả", "All") : "expr → result"}</small></header><div class="ex282-gallery">${results}</div></section></section>`;
  const stackPane = host.querySelector(".ex282-stack > div");
  if (stackPane) { stackPane.scrollLeft = stackPane.scrollWidth; stackPane.scrollTop = stackPane.scrollHeight; }
  const gallery = host.querySelector(".ex282-gallery");
  if (gallery && v.phase === "save") gallery.scrollTop = gallery.scrollHeight;
}
