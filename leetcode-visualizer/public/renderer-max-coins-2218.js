"use strict";

// LeetCode 2218 — Maximum Value of K Coins From Piles. Picture-first renderer for both DP approaches:
// coin stacks (take from the top only), the current pile's cut line (take t coins = +prefix[t]), the candidate list
// for the cell being filled (winner starred), and the DP table with an arrow from the source cell to the target cell.
// The Python source is shown once, in the shared #codePanel (highlighted by script.js from step.codeLines); locals
// are shown once, in the shared Variables panel.

const LC2218_LINE_COUNT = 18;

// Preset inputs: [piles, k, Vietnamese label, English label]. The first preset is the default input.
const LC2218_CASES = Object.freeze([
  ["[[1,100,3],[7,8,9],[20,5,40]]", 3, "Ví dụ", "Example"],
  ["[[1,100,3],[7,8,9]]", 2, "Ngắn", "Short"],
  ["[[100],[100],[100],[100],[100],[100],[1,1,1,1,1,1,700]]", 7, "Đáy 700", "700 at bottom"],
]);

const LC2218_COPY = Object.freeze({
  vi: Object.freeze({
    picture: "Chồng xu và bảng DP",
    code: "Dòng đang chạy",
    examples: "Ví dụ",
    topOnly: "↑ chỉ lấy xu trên cùng",
    caption1: "dp[i][j]: i chồng đầu, đúng j xu",
    caption2: "dp[j]: đúng j xu",
    prefix: "prefix[t]",
    coins: "xu",
    piles: "chồng",
    answer: "Đáp án",
    jumps: [["line", "Dòng →"], ["pile", "Chồng →"], ["result", "Kết quả ↠"]],
    legend: { coin: "xu", take: "lấy t xu", src: "ô nguồn", dst: "ô đang tính", neg: "−∞ chưa đạt", win: "tốt nhất" },
    formula: "Công thức DP",
    formulaNow: "Bước này",
    answerWord: "đáp án",
    skip: "bỏ qua",
    kept: "giữ",
    start: "bắt đầu",
    symbols1: [["i", "i chồng đầu"], ["j", "đúng j xu"], ["t", "lấy t xu trên cùng"], ["prefix[t]", "tổng t xu đó"]],
    symbols2: [["dp", "trước chồng này"], ["new_dp", "sau chồng này"], ["j", "đúng j xu"], ["t", "lấy t xu trên cùng"], ["prefix[t]", "tổng t xu đó"]],
    picture3: "Chồng xu, memo và ngăn xếp gọi",
    caption3: "memo[i][r] = dfs(i, r) · lru_cache",
    stack: "ngăn xếp gọi (gốc → đỉnh)",
    skipRow: "bỏ qua",
    jumps3: [["line", "Dòng →"], ["call", "Lời gọi →"], ["result", "Kết quả ↠"]],
    legend3: { coin: "xu", take: "đã cộng vào total", dst: "lời gọi hiện tại", src: "lời gọi con", memo: "trúng memo", stack: "đang chờ", dead: "−∞ ngõ cụt", empty: "· chưa tính", win: "giữ" },
    hits: "trúng memo",
    memoTag: "memo",
    deadEnd: "ngõ cụt",
    symbols3: [["i", "piles[i] là P(i+1)"], ["r", "remaining: số xu còn phải lấy"], ["t", "take: lấy t xu trên cùng"], ["prefix[t]", "= total sau t xu"], ["memo", "lru_cache"]],
  }),
  en: Object.freeze({
    picture: "Coin piles and DP table",
    code: "Current line",
    examples: "Examples",
    topOnly: "↑ top coins only",
    caption1: "dp[i][j]: first i piles, exactly j coins",
    caption2: "dp[j]: exactly j coins",
    prefix: "prefix[t]",
    coins: "coins",
    piles: "piles",
    answer: "Answer",
    jumps: [["line", "Line →"], ["pile", "Next pile →"], ["result", "Result ↠"]],
    legend: { coin: "coin", take: "take t coins", src: "source cell", dst: "cell being filled", neg: "−∞ unreachable", win: "best" },
    formula: "DP formula",
    formulaNow: "This step",
    answerWord: "answer",
    skip: "skip",
    kept: "kept",
    start: "start",
    symbols1: [["i", "first i piles"], ["j", "exactly j coins"], ["t", "take top t coins"], ["prefix[t]", "sum of those t"]],
    symbols2: [["dp", "before this pile"], ["new_dp", "after this pile"], ["j", "exactly j coins"], ["t", "take top t coins"], ["prefix[t]", "sum of those t"]],
    picture3: "Coin piles, memo and call stack",
    caption3: "memo[i][r] = dfs(i, r) · lru_cache",
    stack: "call stack (root → top)",
    skipRow: "skip",
    jumps3: [["line", "Line →"], ["call", "Next call →"], ["result", "Result ↠"]],
    legend3: { coin: "coin", take: "added to total", dst: "current call", src: "child call", memo: "memo hit", stack: "waiting", dead: "−∞ dead end", empty: "· not computed", win: "kept" },
    hits: "memo hits",
    memoTag: "memo",
    deadEnd: "dead end",
    symbols3: [["i", "piles[i] is P(i+1)"], ["r", "remaining: coins still to take"], ["t", "take: top t coins"], ["prefix[t]", "= total after t coins"], ["memo", "lru_cache"]],
  }),
});

const LC2218_EVENTS = new Set([
  "import", "class", "call", "n", "neg", "alloc", "seed", "for-pile", "pile", "prefix0", "for-coin", "append", "copy",
  "for-j", "for-t", "check", "update", "commit", "return",
]);
const LC2218_CHOICE_STATES = new Set(["pending", "try", "skip", "win", "lose"]);

function lc2218Escape(value) {
  return String(value == null ? "" : value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function lc2218IsVi() {
  return typeof lang !== "undefined" && lang === "vi";
}

function lc2218Int(value, minimum, maximum) {
  return Number.isSafeInteger(value) && value >= minimum && value <= maximum ? value : null;
}

// A DP value: a non-negative integer, or null for −∞.
function lc2218Val(value) {
  return lc2218Int(value, 0, 1e7);
}

function lc2218Cell(value, rows, cols) {
  return Array.isArray(value) && value.length === 2 && lc2218Int(value[0], 0, rows - 1) !== null && lc2218Int(value[1], 0, cols - 1) !== null
    ? value.slice() : null;
}

// Validates the builder's view model so malformed data never reaches innerHTML unescaped.
function lc2218Normalize(step) {
  const raw = step && step.maxCoins2218View && typeof step.maxCoins2218View === "object" ? step.maxCoins2218View : {};
  const approach = raw.approach === 2 ? 2 : 1;
  const fallbackLine = step && Array.isArray(step.codeLines) ? step.codeLines[0] : null;
  const line = lc2218Int(raw.line, 1, LC2218_LINE_COUNT) ?? lc2218Int(fallbackLine, 1, LC2218_LINE_COUNT) ?? 1;
  const piles = Array.isArray(raw.piles) && raw.piles.length >= 1 && raw.piles.length <= 7
    && raw.piles.every((pile) => Array.isArray(pile) && pile.length >= 1 && pile.length <= 7 && pile.every((coin) => lc2218Int(coin, 1, 999) !== null))
    ? raw.piles.map((pile) => pile.slice()) : [[1]];
  const n = piles.length;
  const total = piles.reduce((sum, pile) => sum + pile.length, 0);
  const k = lc2218Int(raw.k, 1, Math.min(8, total)) ?? 1;
  const rows = approach === 1 ? n + 1 : 2;
  const cols = k + 1;
  const maxRows = approach === 1 ? n + 1 : 2;
  const table = Array.isArray(raw.table) && raw.table.length >= 1 && raw.table.length <= maxRows
    && raw.table.every((row) => Array.isArray(row) && row.length === cols && row.every((v) => v === null || lc2218Val(v) !== null))
    ? raw.table.map((row) => row.slice()) : null;
  const pileIndex = lc2218Int(raw.pileIndex, 0, n - 1);
  const pileLen = pileIndex !== null ? piles[pileIndex].length : 0;
  const prefix = pileIndex !== null && Array.isArray(raw.prefix) && raw.prefix.length >= 1 && raw.prefix.length <= pileLen + 1
    && raw.prefix.every((v) => lc2218Val(v) !== null) ? raw.prefix.slice() : null;
  const choices = Array.isArray(raw.choices) && raw.choices.length <= 9
    ? raw.choices.filter((c) => c && lc2218Int(c.t, 0, 7) !== null && LC2218_CHOICE_STATES.has(c.state)).map((c) => ({
      t: c.t,
      prev: lc2218Val(c.prev),
      gain: lc2218Val(c.gain),
      total: lc2218Val(c.total),
      state: c.state,
    })) : [];
  const finalFlag = raw.final === true || Boolean(step && step.final);
  const picks = finalFlag && Array.isArray(raw.picks) && raw.picks.length === n && raw.picks.every((v, i) => lc2218Int(v, 0, piles[i].length) !== null)
    ? raw.picks.slice() : null;
  const path = finalFlag && approach === 1 && Array.isArray(raw.path) && raw.path.length === n + 1
    ? raw.path.map((cell) => lc2218Cell(cell, rows, cols)).filter(Boolean) : null;
  return {
    approach,
    line,
    event: typeof raw.event === "string" && LC2218_EVENTS.has(raw.event) ? raw.event : "",
    condition: typeof raw.condition === "boolean" ? raw.condition : null,
    effect: typeof raw.effect === "string" && raw.effect.length <= 90 ? raw.effect : "",
    k,
    n,
    piles,
    rows,
    cols,
    table,
    pileIndex,
    prefix,
    coinIndex: pileIndex !== null ? lc2218Int(raw.coinIndex, 0, pileLen - 1) : null,
    j: lc2218Int(raw.j, 0, k),
    t: pileIndex !== null ? lc2218Int(raw.t, 0, Math.min(k, pileLen)) : null,
    src: lc2218Cell(raw.src, rows, cols),
    dst: lc2218Cell(raw.dst, rows, cols),
    prev: lc2218Val(raw.prev),
    old: lc2218Val(raw.old),
    gain: lc2218Val(raw.gain),
    total: lc2218Val(raw.total),
    updated: typeof raw.updated === "boolean" ? raw.updated : null,
    best: lc2218Val(raw.best),
    choices,
    answer: finalFlag ? lc2218Val(raw.answer) : null,
    picks,
    path: path && path.length === n + 1 ? path : null,
    final: finalFlag,
  };
}

// ---------- Picture ----------

const LC2218_PAD = 12;
const LC2218_CAP_Y = 13;
const LC2218_LABEL_Y = 34;
const LC2218_COIN_Y0 = 56;
const LC2218_COIN_W = 36;
const LC2218_COIN_H = 20;
const LC2218_COIN_STEP = 24;
const LC2218_COL = 44;
const LC2218_CH_GAP = 14;
const LC2218_CH_W = 160;
const LC2218_CH_ROW = 20;
const LC2218_CH_Y0 = 42;
const LC2218_ROW_LABEL = 50;
const LC2218_CELL_W = 40;
const LC2218_CELL_H = 24;
const LC2218_ROW_GAP = 14;

// The compare phase: the code is trying "take t coins from the current pile" for one target cell.
function lc2218Comparing(state) {
  return state.event === "for-t" || state.event === "check" || state.event === "update";
}

function lc2218Layout(state) {
  const maxLen = Math.max(...state.piles.map((pile) => pile.length));
  const pilesW = state.n * LC2218_COL;
  const chX = LC2218_PAD + pilesW + LC2218_CH_GAP;
  const footerY = LC2218_COIN_Y0 + maxLen * LC2218_COIN_STEP + 10;
  const bandBottom = Math.max(footerY + 6, LC2218_CH_Y0 + (maxLen + 1) * LC2218_CH_ROW + 4);
  const dpY = bandBottom + 10;
  const headY = dpY + 30;
  const gridY = dpY + 38;
  // Size from the rows actually drawn: approach 2 has one row except while new_dp exists.
  const shownRows = state.table && state.table.length ? state.table.length : state.rows;
  const gridBottom = gridY + shownRows * (LC2218_CELL_H + LC2218_ROW_GAP) - LC2218_ROW_GAP;
  const eqY = gridBottom + 22;
  const gridW = LC2218_ROW_LABEL + state.cols * LC2218_CELL_W;
  const width = Math.max(chX + LC2218_CH_W, LC2218_PAD + gridW, LC2218_PAD + 360) + LC2218_PAD;
  return { maxLen, chX, footerY, dpY, headY, gridY, eqY, width, height: eqY + 10 };
}

const lc2218PileX = (p) => LC2218_PAD + p * LC2218_COL + (LC2218_COL - LC2218_COIN_W) / 2;
const lc2218CoinY = (c) => LC2218_COIN_Y0 + c * LC2218_COIN_STEP;
const lc2218CellX = (c) => LC2218_PAD + LC2218_ROW_LABEL + c * LC2218_CELL_W + 2;
const lc2218CellY = (L, r) => L.gridY + r * (LC2218_CELL_H + LC2218_ROW_GAP);
const lc2218Glyph = (value) => (value === null ? "−∞" : String(value));

function lc2218Piles(state, L, copy, parts) {
  const comparing = lc2218Comparing(state);
  parts.push(`<text class="lc2218-caption" x="${LC2218_PAD}" y="${LC2218_CAP_Y}">${lc2218Escape(copy.topOnly)}</text>`);
  state.piles.forEach((pile, p) => {
    const x = lc2218PileX(p);
    const cx = x + LC2218_COIN_W / 2;
    const active = state.pileIndex === p;
    if (active) {
      parts.push(`<rect class="lc2218-col" x="${LC2218_PAD + p * LC2218_COL + 1}" y="20" width="${LC2218_COL - 2}" height="${L.footerY + 4 - 20}" rx="8"/>`);
    }
    parts.push(`<text class="lc2218-pile-label${active ? " is-active" : ""}" x="${cx}" y="${LC2218_LABEL_Y}">P${p + 1}</text>`);
    parts.push(`<path class="lc2218-up${active ? " is-active" : ""}" d="M${cx} 51 V41 M${cx - 4} 45 L${cx} 40 L${cx + 4} 45"/>`);
    const pick = state.picks ? state.picks[p] : 0;
    const take = active && comparing && state.t !== null ? state.t : 0;
    pile.forEach((coin, c) => {
      let cls = "";
      if (state.final && c < pick) cls = " is-chosen";
      else if (state.final) cls = " is-left";
      else if (active && c < take) cls = " is-take";
      else if (active && state.coinIndex === c) cls = " is-reading";
      else if (active && state.prefix && c < state.prefix.length - 1 && !comparing) cls = " is-summed";
      const y = lc2218CoinY(c);
      parts.push(`<rect class="lc2218-coin${cls}" data-pile="${p}" data-coin="${c}" x="${x}" y="${y}" width="${LC2218_COIN_W}" height="${LC2218_COIN_H}" rx="10"/>`);
      parts.push(`<text class="lc2218-coin-label${cls}" x="${cx}" y="${y + 14}">${coin}</text>`);
    });
    if (active && comparing && state.t !== null) {
      const y = LC2218_COIN_Y0 + state.t * LC2218_COIN_STEP - 2;
      parts.push(`<line class="lc2218-cut" data-cut="${state.t}" x1="${x - 3}" y1="${y}" x2="${x + LC2218_COIN_W + 3}" y2="${y}"/>`);
    }
    let foot = "";
    let footCls = "";
    if (state.final && state.picks) {
      foot = `×${pick}`;
      footCls = pick ? " is-chosen" : " is-left";
    } else if (active && comparing && state.t !== null && state.prefix) {
      foot = `+${state.prefix[state.t]}`;
      footCls = " is-take";
    } else if (active && state.prefix) {
      foot = `Σ${state.prefix[state.prefix.length - 1]}`;
      footCls = " is-sum";
    }
    if (foot) parts.push(`<text class="lc2218-pile-foot${footCls}" x="${cx}" y="${L.footerY}">${lc2218Escape(foot)}</text>`);
  });
}

// Right panel: the current pile's prefix list while it is built, then the candidates for the cell being filled.
function lc2218Choices(state, L, copy, parts) {
  const x = L.chX;
  const comparing = state.choices.length > 0 && (state.event === "for-j" || lc2218Comparing(state));
  let header = "";
  const rows = [];
  if (comparing && state.dst) {
    header = state.approach === 1 ? `dp[${state.dst[0]}][${state.dst[1]}] = max` : `new_dp[${state.dst[1]}] = max`;
    state.choices.forEach((c) => {
      let text;
      if (c.state === "pending") text = `t=${c.t}: ?`;
      else if (c.state === "skip") text = `t=${c.t}: −∞`;
      else text = `t=${c.t}: ${c.prev}+${c.gain}=${c.total}`;
      const mark = c.state === "win" ? "★" : c.state === "skip" ? "✗" : "";
      rows.push({ text, mark, cls: ` is-${c.state}${state.t === c.t && lc2218Comparing(state) ? " is-now" : ""}`, key: c.t });
    });
  } else if (state.prefix && !state.final && (state.event === "prefix0" || state.event === "for-coin" || state.event === "append")) {
    header = copy.prefix;
    state.prefix.forEach((value, t) => rows.push({ text: `t=${t}: ${value}`, mark: "", cls: t === state.prefix.length - 1 ? " is-now" : "", key: t }));
  }
  if (!header) return;
  parts.push(`<text class="lc2218-ch-head" x="${x}" y="${LC2218_LABEL_Y}">${lc2218Escape(header)}</text>`);
  rows.forEach((row, r) => {
    const y = LC2218_CH_Y0 + r * LC2218_CH_ROW;
    parts.push(`<rect class="lc2218-choice${row.cls}" data-t="${row.key}" x="${x}" y="${y}" width="${LC2218_CH_W}" height="${LC2218_CH_ROW - 2}" rx="5"/>`);
    parts.push(`<text class="lc2218-choice-label${row.cls}" x="${x + 6}" y="${y + 13}">${lc2218Escape(row.text)}</text>`);
    if (row.mark) parts.push(`<text class="lc2218-choice-mark${row.cls}" x="${x + LC2218_CH_W - 12}" y="${y + 13}">${row.mark}</text>`);
  });
}

function lc2218Arrow(L, from, to, cls) {
  const x1 = lc2218CellX(from[1]) + (LC2218_CELL_W - 4) / 2;
  const y1 = lc2218CellY(L, from[0]) + LC2218_CELL_H + 1;
  const x2 = lc2218CellX(to[1]) + (LC2218_CELL_W - 4) / 2;
  const y2 = lc2218CellY(L, to[0]) - 2;
  return `<line class="lc2218-arrow${cls}" data-from="${from.join(",")}" data-to="${to.join(",")}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" marker-end="url(#lc2218-head${["blocked", "path", "hit", "stack"].map((name) => (cls.includes(`is-${name}`) ? `-${name}` : "")).join("")})"/>`;
}

function lc2218Table(state, L, copy, parts) {
  parts.push(`<text class="lc2218-caption" x="${LC2218_PAD}" y="${L.dpY + 11}">${lc2218Escape(state.approach === 1 ? copy.caption1 : copy.caption2)}</text>`);
  parts.push(`<text class="lc2218-head-label" x="${LC2218_PAD + LC2218_ROW_LABEL / 2}" y="${L.headY}">j</text>`);
  for (let c = 0; c < state.cols; c++) {
    parts.push(`<text class="lc2218-head-label" x="${lc2218CellX(c) + (LC2218_CELL_W - 4) / 2}" y="${L.headY}">${c}</text>`);
  }
  if (!state.table) return;
  const comparing = lc2218Comparing(state) || state.event === "for-j";
  const pathSet = new Set((state.path || []).map((cell) => cell.join(",")));
  state.table.forEach((row, r) => {
    const label = state.approach === 1 ? `i=${r}` : r === 0 ? "dp" : "new_dp";
    const y = lc2218CellY(L, r);
    parts.push(`<text class="lc2218-row-label" x="${LC2218_PAD + LC2218_ROW_LABEL / 2}" y="${y + 16}">${label}</text>`);
    row.forEach((value, c) => {
      const key = `${r},${c}`;
      let cls = value === null ? " is-neg" : "";
      if (state.final) {
        if (pathSet.has(key)) cls += " is-path";
        if (state.dst && state.dst[0] === r && state.dst[1] === c) cls += " is-answer";
      } else {
        if (comparing && state.src && state.src[0] === r && state.src[1] === c) cls += " is-src";
        if (state.dst && state.dst[0] === r && state.dst[1] === c) cls += state.event === "update" && state.updated ? " is-dst is-new" : " is-dst";
      }
      parts.push(`<rect class="lc2218-cell${cls}" data-cell="${key}" x="${lc2218CellX(c)}" y="${y}" width="${LC2218_CELL_W - 4}" height="${LC2218_CELL_H}" rx="5"/>`);
      parts.push(`<text class="lc2218-cell-label${cls}" x="${lc2218CellX(c) + (LC2218_CELL_W - 4) / 2}" y="${y + 16}">${lc2218Glyph(value)}</text>`);
    });
  });
  if (state.final && state.path) {
    for (let s = 0; s + 1 < state.path.length; s++) parts.push(lc2218Arrow(L, state.path[s], state.path[s + 1], " is-path"));
  } else if (comparing && state.src && state.dst && state.src[0] !== state.dst[0]) {
    const blocked = state.prev === null || (state.event === "update" && state.updated === false);
    parts.push(lc2218Arrow(L, state.src, state.dst, blocked ? " is-blocked" : ""));
  }
}

// One line of arithmetic under the table: the move the code is making right now.
function lc2218Equation(state, copy) {
  const span = (cls, text) => `<tspan class="${cls}">${lc2218Escape(text)}</tspan>`;
  const dstName = state.dst ? (state.approach === 1 ? `dp[${state.dst[0]}][${state.dst[1]}]` : `new_dp[${state.dst[1]}]`) : "";
  if (state.final && state.answer !== null) {
    const parts = state.picks ? state.picks.map((pick, p) => (pick ? `P${p + 1}×${pick}` : "")).filter(Boolean) : [];
    return `${span("eq-take", parts.join(" + "))}${span("eq-op", " → ")}${span("eq-win", `${copy.answer} ${state.answer}`)}`;
  }
  if (lc2218Comparing(state) && state.t !== null && state.dst) {
    const prev = span("eq-src", lc2218Glyph(state.prev));
    const gain = span("eq-take", String(state.gain ?? 0));
    if (state.prev === null) return `${prev}${span("eq-op", " + ")}${gain}${span("eq-bad", " ✗")}`;
    const total = state.prev + (state.gain ?? 0);
    let tail = span("eq-op", ` → ${dstName}`);
    if (state.event === "update") {
      tail = state.updated ? `${span("eq-op", ` → ${dstName} `)}${span("eq-win", "✓")}` : `${span("eq-op", " ≤ ")}${span("eq-dst", lc2218Glyph(state.best))}${span("eq-bad", " ✗")}`;
    }
    return `${prev}${span("eq-op", " + ")}${gain}${span("eq-op", " = ")}${span("eq-dst", String(total))}${tail}`;
  }
  if (state.event === "for-j" && state.dst) {
    return state.approach === 1
      ? `${span("eq-dst", dstName)}${span("eq-op", " = max(…)")}`
      : `${span("eq-dst", dstName)}${span("eq-op", " = ")}${span("eq-src", `dp[${state.dst[1]}] ${lc2218Glyph(state.prev)}`)}${span("eq-op", " (t=0)")}`;
  }
  if (state.event === "append" && state.prefix && state.coinIndex !== null) {
    const c = state.coinIndex;
    return `${span("eq-op", `prefix[${c + 1}] = ${state.prefix[c]} + `)}${span("eq-take", String(state.piles[state.pileIndex][c]))}${span("eq-op", ` = ${state.prefix[c + 1]}`)}`;
  }
  if (state.event === "copy") return span("eq-op", "new_dp = dp[:]");
  if (state.event === "commit") return span("eq-op", "dp = new_dp");
  if (state.event === "seed") return span("eq-op", state.approach === 1 ? "dp[0][0] = 0" : "dp[0] = 0");
  return "";
}

// The DP recurrence under the picture: the general formula (Python names of the shown approach), the base case and
// answer, a symbol key, and the same formula filled in with this step's numbers. Terms are colored like the picture:
// target cell (pink), source cell (purple), taken coins (cyan), kept/winning value (green). A segment never breaks
// inside, so narrow cards wrap between segments.
function lc2218Formula(state, copy) {
  const a1 = state.approach === 1;
  const html = (tokens) => tokens.map(([cls, text]) => (cls ? `<span class="${cls}">${lc2218Escape(text)}</span>` : lc2218Escape(text))).join("");
  const plain = (segs) => segs.map((seg) => seg.map((token) => token[1]).join("")).join(" ");
  const row = (cls, segs, extra = "") => `<div class="${cls}"${extra}>${segs.map((seg) => `<span class="fx-seg">${html(seg)}</span>`).join(" ")}</div>`;
  const T = a1 ? "dp[i][j]" : "new_dp[j]";
  const S = a1 ? "dp[i-1][j-t]" : "dp[j-t]";
  const general = [[["fx-dst", T], ["", " ="]], [["", "max("], ["fx-dst", T], ["", ", "], ["fx-src", S], ["", " + "], ["fx-take", "prefix[t]"], ["", ")"]]];
  const comparing = lc2218Comparing(state) && state.dst && state.t !== null;
  const baseText = a1 ? "dp[0][0] = 0" : "dp[0] = 0";
  const answerText = `${copy.answerWord} = ${a1 ? "dp[n][k]" : "dp[k]"}`;
  const base = [[[state.event === "seed" ? "fx-now" : "", baseText]]];
  if (!a1) base.push([[state.event === "copy" ? "fx-now" : "", "new_dp = dp[:] (t = 0)"]]);
  base.push([[state.final ? "fx-now" : "", answerText]]);
  const symbols = (a1 ? copy.symbols1 : copy.symbols2)
    .map(([name, meaning]) => `<span><code>${lc2218Escape(name)}</code> ${lc2218Escape(meaning)}</span>`).join("");

  // This step, filled in. data-* carry the raw numbers ("-inf" = −∞) so tests can check them against the DP.
  const g = (value) => lc2218Glyph(value);
  const d = (value) => (value === null ? "-inf" : String(value));
  let now = [];
  let data = {};
  if (comparing) {
    const [i, j] = state.dst;
    const t = state.t;
    const dst = a1 ? `dp[${i}][${j}]` : `new_dp[${j}]`;
    const src = a1 ? `dp[${i - 1}][${j - t}]` : `dp[${j - t}]`;
    const old = state.event === "update" ? state.old : state.best;
    const gain = state.gain ?? 0;
    data = { dst, src, t, old: d(old), prev: d(state.prev), gain };
    now.push([["fx-dst", dst], ["", " ="]]);
    now.push([["", "max("], ["fx-dst", g(old)], ["", ", "], ["fx-src", src], ["", " + "], ["fx-take", `prefix[${t}]`], ["", ")"]]);
    if (state.prev === null) {
      if (state.event === "check") now.push([["fx-bad", `${src} = −∞ → ${copy.skip} ✗`]]);
    } else if (state.event !== "for-t") {
      const total = state.prev + gain;
      const won = state.event === "update" && state.updated === true;
      const kept = state.event === "update" && state.updated === false;
      data.total = total;
      now.push([["", "= max("], [`fx-dst${kept ? " fx-win" : ""}`, g(old)], ["", ", "], [`fx-src${won ? " fx-win" : ""}`, String(state.prev)],
        ["", " + "], [`fx-take${won ? " fx-win" : ""}`, String(gain)], ["", ")"]]);
      if (state.event === "update") {
        data.result = d(state.best);
        now.push([["", "= "], ["fx-dst fx-result", g(state.best)], ["fx-mark", won ? " ✓" : ` (${copy.kept} ${g(old)})`]]);
      }
    }
  } else if (state.event === "for-j" && state.dst) {
    const j = state.dst[1];
    if (a1) {
      data = { dst: `dp[${state.dst[0]}][${j}]`, result: d(state.best) };
      now.push([["fx-dst", data.dst], ["", ` = ${g(state.best)} (${copy.start})`]]);
    } else {
      data = { dst: `new_dp[${j}]`, prev: d(state.prev), result: d(state.best) };
      now.push([["fx-dst", data.dst], ["", " = "], ["fx-src", `dp[${j}]`], ["", " = "], ["fx-src", g(state.prev)], ["", " (t = 0)"]]);
    }
  } else if (state.event === "seed") {
    now.push([["fx-dst", a1 ? "dp[0][0]" : "dp[0]"], ["", " = "], ["fx-win", "0"]]);
  } else if (state.final && state.answer !== null) {
    const cell = a1 ? `dp[${state.n}][${state.k}]` : `dp[${state.k}]`;
    data = { dst: cell, result: d(state.answer) };
    now.push([["", `${copy.answerWord} = `], ["fx-dst", cell], ["", " = "], ["fx-win", String(state.answer)]]);
  }
  const dataAttrs = Object.entries(data).map(([key, value]) => ` data-${key}="${lc2218Escape(value)}"`).join("");
  const nowLabel = now.length ? `${copy.formulaNow}: ${plain(now)}` : copy.formulaNow;
  const nowRow = now.length
    ? row("lc2218-fx-now", [[["fx-tag", copy.formulaNow]], ...now], ` role="group" data-event="${lc2218Escape(state.event)}"${dataAttrs} aria-label="${lc2218Escape(nowLabel)}"`)
    : `<div class="lc2218-fx-now is-empty" aria-hidden="true">&nbsp;</div>`;
  return `<div class="lc2218-formula" role="group" aria-label="${lc2218Escape(`${copy.formula}: ${plain(general)}; ${plain(base)}`)}">`
    + row(`lc2218-fx-general${comparing ? " is-active" : ""}`, [[["fx-tag", copy.formula]], ...general])
    + row("lc2218-fx-base", base)
    + `<div class="lc2218-fx-symbols">${symbols}</div>`
    + nowRow
    + "</div>";
}

function lc2218Picture(state, copy) {
  const L = lc2218Layout(state);
  const parts = [];
  parts.push("<defs>"
    + '<marker id="lc2218-head" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="6" markerHeight="6" orient="auto"><path class="lc2218-arrowhead" d="M0,0 L8,4 L0,8 z"/></marker>'
    + '<marker id="lc2218-head-blocked" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="6" markerHeight="6" orient="auto"><path class="lc2218-arrowhead is-blocked" d="M0,0 L8,4 L0,8 z"/></marker>'
    + '<marker id="lc2218-head-path" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="6" markerHeight="6" orient="auto"><path class="lc2218-arrowhead is-path" d="M0,0 L8,4 L0,8 z"/></marker>'
    + "</defs>");
  lc2218Piles(state, L, copy, parts);
  lc2218Choices(state, L, copy, parts);
  lc2218Table(state, L, copy, parts);
  const eq = lc2218Equation(state, copy);
  if (eq) parts.push(`<text class="lc2218-eq" x="${LC2218_PAD}" y="${L.eqY}">${eq}</text>`);
  const vi = lc2218IsVi();
  const label = state.final && state.answer !== null
    ? `${copy.answer}: ${state.answer}`
    : vi ? `${state.n} ${copy.piles}, lấy đúng ${state.k} ${copy.coins}` : `${state.n} ${copy.piles}, take exactly ${state.k} ${copy.coins}`;
  return `<svg class="lc2218-svg" width="${L.width}" height="${L.height}" viewBox="0 0 ${L.width} ${L.height}" role="img" aria-label="${lc2218Escape(label)}">${parts.join("")}</svg>`;
}

// ---------- Approach 3: top-down DFS with lru_cache ----------
// Picture: the piles (current pile i, cut at `take`, +total underneath), the candidates of the current call
// (best = max(...), kept one starred), the memo grid i × remaining (fills as calls return; a memo hit lights the cached
// cell blue and is never entered), the call stack as a path through the grid plus one chip per frame, and one line of
// arithmetic. Values: a number, "-inf" (−∞, a dead end) or null (not known yet / not computed).

const LC2218_LINE_COUNT3 = 26;
const LC2218_EVENTS3 = new Set([
  "import", "class", "method", "n", "deco", "def", "call", "enter", "if-base", "if-end", "ret", "back", "hit", "total0",
  "for-take", "add", "loop-end", "return",
]);
const LC2218_CHOICE3_STATES = new Set(["pending", "skip", "win", "lose"]);
const LC2218_CHIP_W = 56;
const LC2218_CHIP_GAP = 6;
const LC2218_CHIP_H = 20;

function lc2218V3(value) {
  return value === "-inf" ? "-inf" : lc2218Val(value);
}

const lc2218G3 = (value) => (value === "-inf" ? "−∞" : value === null ? "?" : String(value));
const lc2218Dfs = (cell, compact) => (cell ? (compact ? `dfs(${cell[0]},${cell[1]})` : `dfs(${cell[0]}, ${cell[1]})`) : "");

function lc2218NormalizeA3(step, raw) {
  const fallbackLine = step && Array.isArray(step.codeLines) ? step.codeLines[0] : null;
  const line = lc2218Int(raw.line, 1, LC2218_LINE_COUNT3) ?? lc2218Int(fallbackLine, 1, LC2218_LINE_COUNT3) ?? 1;
  const piles = Array.isArray(raw.piles) && raw.piles.length >= 1 && raw.piles.length <= 7
    && raw.piles.every((pile) => Array.isArray(pile) && pile.length >= 1 && pile.length <= 7 && pile.every((coin) => lc2218Int(coin, 1, 999) !== null))
    ? raw.piles.map((pile) => pile.slice()) : [[1]];
  const n = piles.length;
  const total = piles.reduce((sum, pile) => sum + pile.length, 0);
  const k = lc2218Int(raw.k, 1, Math.min(8, total)) ?? 1;
  const rows = n + 1;
  const cols = k + 1;
  const cell = (value) => lc2218Cell(value, rows, cols);
  const memo = Array.isArray(raw.memo) && raw.memo.length === rows
    && raw.memo.every((row) => Array.isArray(row) && row.length === cols && row.every((v) => v === null || lc2218V3(v) !== null))
    ? raw.memo.map((row) => row.slice()) : null;
  const stack = Array.isArray(raw.stack) && raw.stack.length <= rows ? raw.stack.map(cell).filter(Boolean) : [];
  const frame = cell(raw.frame);
  const pileIndex = frame && frame[0] < n ? frame[0] : null;
  const pileLen = pileIndex !== null ? piles[pileIndex].length : 0;
  const choices = Array.isArray(raw.choices) && raw.choices.length <= 8
    ? raw.choices.filter((c) => c && lc2218Int(c.t, 0, 7) !== null && LC2218_CHOICE3_STATES.has(c.state)).map((c) => ({
      t: c.t,
      gain: lc2218Val(c.gain),
      sub: lc2218V3(c.sub),
      sum: lc2218V3(c.sum),
      state: c.state,
    })) : [];
  const finalFlag = raw.final === true || Boolean(step && step.final);
  const picks = finalFlag && Array.isArray(raw.picks) && raw.picks.length === n && raw.picks.every((v, i) => lc2218Int(v, 0, piles[i].length) !== null)
    ? raw.picks.slice() : null;
  const path = finalFlag && Array.isArray(raw.path) && raw.path.length >= 1 && raw.path.length <= rows ? raw.path.map(cell).filter(Boolean) : null;
  return {
    approach: 3,
    line,
    event: typeof raw.event === "string" && LC2218_EVENTS3.has(raw.event) ? raw.event : "",
    site: raw.site === "skip" || raw.site === "take" || raw.site === "root" ? raw.site : null,
    condition: typeof raw.condition === "boolean" ? raw.condition : null,
    effect: typeof raw.effect === "string" && raw.effect.length <= 90 ? raw.effect : "",
    k,
    n,
    piles,
    rows,
    cols,
    memo,
    stack,
    frame,
    pileIndex,
    best: lc2218V3(raw.best),
    total: pileIndex !== null ? lc2218Val(raw.total) : null,
    take: pileIndex !== null ? lc2218Int(raw.take, 1, Math.min(k, pileLen)) : null,
    taken: pileIndex !== null ? lc2218Int(raw.taken, 0, pileLen) ?? 0 : 0,
    call: cell(raw.call),
    hit: raw.hit === true,
    value: lc2218V3(raw.value),
    old: lc2218V3(raw.old),
    updated: typeof raw.updated === "boolean" ? raw.updated : null,
    choices,
    stored: cell(raw.stored),
    hits: lc2218Int(raw.hits, 0, 9999) ?? 0,
    answer: finalFlag ? lc2218Val(raw.answer) : null,
    picks,
    path: path && path.length ? path : null,
    final: finalFlag,
  };
}

// The current call is a base case (remaining == 0) or a dead end (i == n with remaining > 0).
function lc2218Kind3(state) {
  if (!state.frame) return "";
  if (state.frame[1] === 0 && (state.line === 9 || state.line === 10)) return "base";
  if (state.frame[0] === state.n && state.frame[1] > 0 && (state.line === 12 || state.line === 13)) return "dead";
  return "";
}

function lc2218LayoutA3(state) {
  const maxLen = Math.max(...state.piles.map((pile) => pile.length));
  const chX = LC2218_PAD + state.n * LC2218_COL + LC2218_CH_GAP;
  const footerY = LC2218_COIN_Y0 + maxLen * LC2218_COIN_STEP + 10;
  const bandBottom = Math.max(footerY + 6, LC2218_CH_Y0 + (maxLen + 1) * LC2218_CH_ROW + 4);
  const dpY = bandBottom + 10;
  const headY = dpY + 30;
  const gridY = dpY + 38;
  const gridBottom = gridY + state.rows * (LC2218_CELL_H + LC2218_ROW_GAP) - LC2218_ROW_GAP;
  const stackY = gridBottom + 20;
  const chipY = gridBottom + 28;
  const eqY = chipY + LC2218_CHIP_H + 22;
  const gridW = LC2218_ROW_LABEL + state.cols * LC2218_CELL_W;
  const chipsW = state.rows * (LC2218_CHIP_W + LC2218_CHIP_GAP) - LC2218_CHIP_GAP;
  const width = Math.max(chX + LC2218_CH_W, LC2218_PAD + gridW, LC2218_PAD + chipsW, LC2218_PAD + 360) + LC2218_PAD;
  return { maxLen, chX, footerY, dpY, headY, gridY, stackY, chipY, eqY, width, height: eqY + 10 };
}

function lc2218PilesA3(state, L, copy, parts) {
  parts.push(`<text class="lc2218-caption" x="${LC2218_PAD}" y="${LC2218_CAP_Y}">${lc2218Escape(copy.topOnly)}</text>`);
  state.piles.forEach((pile, p) => {
    const x = lc2218PileX(p);
    const cx = x + LC2218_COIN_W / 2;
    const active = !state.final && state.pileIndex === p;
    if (active) {
      parts.push(`<rect class="lc2218-col" x="${LC2218_PAD + p * LC2218_COL + 1}" y="20" width="${LC2218_COL - 2}" height="${L.footerY + 4 - 20}" rx="8"/>`);
    }
    parts.push(`<text class="lc2218-pile-label${active ? " is-active" : ""}" x="${cx}" y="${LC2218_LABEL_Y}">P${p + 1}</text>`);
    parts.push(`<path class="lc2218-up${active ? " is-active" : ""}" d="M${cx} 51 V41 M${cx - 4} 45 L${cx} 40 L${cx + 4} 45"/>`);
    const pick = state.picks ? state.picks[p] : 0;
    pile.forEach((coin, c) => {
      let cls = "";
      if (state.final && c < pick) cls = " is-chosen";
      else if (state.final) cls = " is-left";
      else if (active && c < state.taken) cls = " is-take";
      else if (active && state.take !== null && c === state.take - 1) cls = " is-reading";
      const y = lc2218CoinY(c);
      parts.push(`<rect class="lc2218-coin${cls}" data-pile="${p}" data-coin="${c}" x="${x}" y="${y}" width="${LC2218_COIN_W}" height="${LC2218_COIN_H}" rx="10"/>`);
      parts.push(`<text class="lc2218-coin-label${cls}" x="${cx}" y="${y + 14}">${coin}</text>`);
    });
    if (active && state.take !== null) {
      const y = LC2218_COIN_Y0 + state.take * LC2218_COIN_STEP - 2;
      parts.push(`<line class="lc2218-cut" data-cut="${state.take}" x1="${x - 3}" y1="${y}" x2="${x + LC2218_COIN_W + 3}" y2="${y}"/>`);
    }
    let foot = "";
    let footCls = "";
    if (state.final && state.picks) {
      foot = `×${pick}`;
      footCls = pick ? " is-chosen" : " is-left";
    } else if (active && state.total !== null) {
      foot = `+${state.total}`;
      footCls = " is-take";
    }
    if (foot) parts.push(`<text class="lc2218-pile-foot${footCls}" x="${cx}" y="${L.footerY}">${lc2218Escape(foot)}</text>`);
  });
}

// Right panel: best = max(...) for the current call. t = 0 is the skip call on line 15.
function lc2218ChoicesA3(state, L, copy, parts) {
  if (!state.frame || state.final) return;
  const x = L.chX;
  const kind = lc2218Kind3(state);
  const name = lc2218Dfs(state.frame, true);
  let header = `${name} = max`;
  let headCls = "";
  if (kind === "base") {
    header = `${name} = 0`;
    headCls = " is-base";
  } else if (kind === "dead") {
    header = `${name} = −∞ ✗`;
    headCls = " is-dead";
  } else if (state.event === "enter" || (state.event === "if-base" && state.condition === false)) {
    header = `${name} = ?`;
  }
  parts.push(`<text class="lc2218-ch-head${headCls}" x="${x}" y="${LC2218_LABEL_Y}">${lc2218Escape(header)}</text>`);
  if (kind) return;
  const rows = state.choices.slice();
  if (state.event === "call" && state.site === "skip") rows.push({ t: 0, gain: 0, sub: null, sum: null, state: "pending" });
  const nowT = state.event === "call" || state.event === "back" || state.event === "hit"
    ? (state.site === "skip" ? 0 : state.take)
    : state.event === "for-take" || state.event === "add" ? state.take : null;
  rows.forEach((c, r) => {
    let text;
    if (c.t === 0) text = `t=0 ${copy.skipRow}: ${lc2218G3(c.sub)}`;
    else if (c.gain === null) text = `t=${c.t}: ?`;
    else if (c.sub === null) text = `t=${c.t}: ${c.gain}+?`;
    else if (c.sum === "-inf") text = `t=${c.t}: ${c.gain}+${lc2218G3(c.sub)}`;
    else text = `t=${c.t}: ${c.gain}+${c.sub}=${c.sum}`;
    const mark = c.state === "win" ? "★" : c.state === "skip" ? "✗" : "";
    const cls = ` is-${c.state}${nowT === c.t ? " is-now" : ""}`;
    const y = LC2218_CH_Y0 + r * LC2218_CH_ROW;
    parts.push(`<rect class="lc2218-choice${cls}" data-t="${c.t}" x="${x}" y="${y}" width="${LC2218_CH_W}" height="${LC2218_CH_ROW - 2}" rx="5"/>`);
    parts.push(`<text class="lc2218-choice-label${cls}" x="${x + 6}" y="${y + 13}">${lc2218Escape(text)}</text>`);
    if (mark) parts.push(`<text class="lc2218-choice-mark${cls}" x="${x + LC2218_CH_W - 12}" y="${y + 13}">${mark}</text>`);
  });
}

function lc2218MemoA3(state, L, copy, parts) {
  parts.push(`<text class="lc2218-caption" x="${LC2218_PAD}" y="${L.dpY + 11}">${lc2218Escape(copy.caption3)}</text>`);
  parts.push(`<text class="lc2218-head-label" x="${LC2218_PAD + LC2218_ROW_LABEL / 2}" y="${L.headY}">r</text>`);
  for (let c = 0; c < state.cols; c++) {
    parts.push(`<text class="lc2218-head-label" x="${lc2218CellX(c) + (LC2218_CELL_W - 4) / 2}" y="${L.headY}">${c}</text>`);
  }
  if (!state.memo) return;
  const same = (a, b) => Boolean(a && b && a[0] === b[0] && a[1] === b[1]);
  const onStack = new Set(state.stack.map((cell) => cell.join(",")));
  const pathSet = new Set((state.path || []).map((cell) => cell.join(",")));
  const showCall = !state.final && state.call && (state.event === "call" || state.event === "back" || state.event === "hit");
  state.memo.forEach((row, r) => {
    const y = lc2218CellY(L, r);
    parts.push(`<text class="lc2218-row-label" x="${LC2218_PAD + LC2218_ROW_LABEL / 2}" y="${y + 16}">i=${r}</text>`);
    row.forEach((value, c) => {
      const key = `${r},${c}`;
      const here = [r, c];
      let cls = value === null ? " is-empty" : value === "-inf" ? " is-dead" : "";
      if (state.final) {
        if (pathSet.has(key)) cls += " is-path";
        if (r === 0 && c === state.k) cls += " is-answer";
      } else {
        if (same(state.frame, here)) cls += state.event === "ret" ? " is-dst is-new" : " is-dst";
        else if (onStack.has(key)) cls += " is-stack";
        if (showCall && same(state.call, here)) cls += state.event === "hit" ? " is-hit" : " is-src";
      }
      parts.push(`<rect class="lc2218-cell${cls}" data-cell="${key}" x="${lc2218CellX(c)}" y="${y}" width="${LC2218_CELL_W - 4}" height="${LC2218_CELL_H}" rx="5"/>`);
      parts.push(`<text class="lc2218-cell-label${cls}" x="${lc2218CellX(c) + (LC2218_CELL_W - 4) / 2}" y="${y + 16}">${value === null ? "·" : lc2218G3(value)}</text>`);
    });
  });
  if (state.final && state.path) {
    for (let s = 0; s + 1 < state.path.length; s++) parts.push(lc2218Arrow(L, state.path[s], state.path[s + 1], " is-path"));
    return;
  }
  for (let s = 0; s + 1 < state.stack.length; s++) parts.push(lc2218Arrow(L, state.stack[s], state.stack[s + 1], " is-stack"));
  if (showCall && state.frame) {
    const cls = state.event === "hit" ? " is-hit" : state.event === "back" && state.value === "-inf" ? " is-blocked" : "";
    parts.push(lc2218Arrow(L, state.frame, state.call, cls));
  }
}

// One chip per frame, root first; a pending call (dashed) or a memo hit (blue) is drawn after the top frame.
function lc2218StackA3(state, L, copy, parts) {
  if (state.final || (!state.stack.length && !state.call)) return;
  parts.push(`<text class="lc2218-caption" x="${LC2218_PAD}" y="${L.stackY}">${lc2218Escape(copy.stack)}</text>`);
  const chips = state.stack.map((cell, s) => {
    let cls = s === state.stack.length - 1 ? " is-top" : " is-wait";
    const kind = s === state.stack.length - 1 ? lc2218Kind3(state) : "";
    if (kind) cls += ` is-${kind}`;
    return { cell, cls };
  });
  if (state.call && (state.event === "call" || state.event === "hit")) chips.push({ cell: state.call, cls: state.event === "hit" ? " is-hit" : " is-call" });
  chips.forEach((chip, s) => {
    const x = LC2218_PAD + s * (LC2218_CHIP_W + LC2218_CHIP_GAP);
    parts.push(`<rect class="lc2218-chip${chip.cls}" data-frame="${chip.cell.join(",")}" x="${x}" y="${L.chipY}" width="${LC2218_CHIP_W}" height="${LC2218_CHIP_H}" rx="6"/>`);
    parts.push(`<text class="lc2218-chip-label${chip.cls}" x="${x + LC2218_CHIP_W / 2}" y="${L.chipY + 14}">${lc2218Escape(lc2218Dfs(chip.cell, true))}</text>`);
  });
}

function lc2218EquationA3(state, copy) {
  const span = (cls, text) => `<tspan class="${cls}">${lc2218Escape(text)}</tspan>`;
  const g = lc2218G3;
  if (state.final && state.answer !== null) {
    const parts = state.picks ? state.picks.map((pick, p) => (pick ? `P${p + 1}×${pick}` : "")).filter(Boolean) : [];
    return `${span("eq-take", parts.join(" + "))}${span("eq-op", " → ")}${span("eq-win", `${copy.answer} ${state.answer}`)}`;
  }
  const me = lc2218Dfs(state.frame, true);
  const child = lc2218Dfs(state.call, true);
  if (state.event === "call") return `${span("eq-dst", me || copy.answerWord)}${span("eq-op", " → ")}${span("eq-src", `${child} ?`)}`;
  if (state.event === "hit" || state.event === "back") {
    const head = state.event === "hit" ? `${span("eq-memo", `${copy.memoTag} ${child} = ${g(state.value)}`)}${span("eq-op", " · ")}` : "";
    if (state.site === "skip") return `${head}${span("eq-op", "best = ")}${span(state.value === "-inf" ? "eq-bad" : "eq-src", g(state.value))}`;
    const sum = state.value === "-inf" ? "-inf" : (state.total ?? 0) + state.value;
    const body = `${span("eq-take", String(state.total ?? 0))}${span("eq-op", " + ")}${span("eq-src", g(state.value))}${span("eq-op", " = ")}${span("eq-dst", g(sum))}`;
    const tail = state.updated ? span("eq-win", " ✓") : `${span("eq-op", " ≤ ")}${span("eq-dst", g(state.old))}${span("eq-bad", " ✗")}`;
    return `${head}${body}${tail}`;
  }
  if (state.event === "ret") {
    const bad = state.value === "-inf";
    return `${span("eq-dst", me)}${span("eq-op", " = ")}${span(bad ? "eq-bad" : "eq-win", g(state.value))}${span("eq-op", ` → memo[${state.frame[0]}][${state.frame[1]}]`)}${bad ? span("eq-bad", ` ${copy.deadEnd}`) : ""}`;
  }
  if (state.event === "add" && state.take !== null && state.total !== null) {
    const coin = state.piles[state.pileIndex][state.take - 1];
    return `${span("eq-op", `total = ${state.total - coin} + `)}${span("eq-take", String(coin))}${span("eq-op", ` = ${state.total}`)}`;
  }
  return "";
}

// The recurrence of the user's dfs, its base cases, a symbol key and this step filled in. Colors match the picture:
// current call (pink), child call (purple), taken coins / total (cyan), memo hit (blue), kept value (green box).
function lc2218FormulaA3(state, copy) {
  const html = (tokens) => tokens.map(([cls, text]) => (cls ? `<span class="${cls}">${lc2218Escape(text)}</span>` : lc2218Escape(text))).join("");
  const plain = (segs) => segs.map((seg) => seg.map((token) => token[1]).join("")).join(" ");
  const row = (cls, segs, extra = "") => `<div class="${cls}"${extra}>${segs.map((seg) => `<span class="fx-seg">${html(seg)}</span>`).join(" ")}</div>`;
  const general = [
    [["fx-dst", "dfs(i, r)"], ["", " ="]],
    [["", "max("], ["fx-src", "dfs(i+1, r)"], ["", ","]],
    [["fx-take", "prefix[t]"], ["", " + "], ["fx-src", "dfs(i+1, r−t)"], ["", ")"]],
    [["fx-range", "t = 1…min(len(piles[i]), r)"]],
  ];
  const kind = lc2218Kind3(state);
  const base = [
    [[kind === "base" ? "fx-now" : "", "dfs(i, 0) = 0"]],
    [[kind === "dead" ? "fx-now fx-bad" : "", "dfs(n, r > 0) = −∞"]],
    [[state.final ? "fx-now" : "", `${copy.answerWord} = dfs(0, k)`]],
  ];
  const symbols = copy.symbols3.map(([name, meaning]) => `<span><code>${lc2218Escape(name)}</code> ${lc2218Escape(meaning)}</span>`).join("");
  const g = lc2218G3;
  const d = (value) => (value === null ? "?" : String(value));
  const me = lc2218Dfs(state.frame, false);
  const child = lc2218Dfs(state.call, false);
  const now = [];
  let data = {};
  const memoTag = state.hit ? [["fx-memo", `${copy.memoTag} ✓`]] : null;
  if (state.final && state.answer !== null) {
    data = { state: "dfs(0, " + state.k + ")", result: String(state.answer) };
    now.push([["", `${copy.answerWord} = `], ["fx-dst", `dfs(0, ${state.k})`], ["", " = "], ["fx-win", String(state.answer)]]);
  } else if (state.event === "call" && state.site === "root") {
    data = { state: child };
    now.push([["", `${copy.answerWord} = `], ["fx-src", child], ["", " = ?"]]);
  } else if (state.event === "enter" || (state.event === "if-base" && !kind) || (state.event === "if-end" && !kind)) {
    data = { state: me };
    const [i, r] = state.frame;
    now.push([["fx-dst", me], ["", " ="]]);
    now.push([["", "max("], ["fx-src", `dfs(${i + 1}, ${r})`], ["", ", "], ["fx-take", "prefix[t]"], ["", " + "], ["fx-src", `dfs(${i + 1}, ${r}−t)`], ["", ")"]]);
  } else if (kind) {
    data = { state: me, result: kind === "base" ? "0" : "-inf" };
    now.push([["fx-dst", me], ["", " = "], [kind === "base" ? "fx-win" : "fx-bad", kind === "base" ? "0" : `−∞ (${copy.deadEnd}) ✗`]]);
  } else if ((state.event === "call" || state.event === "back" || state.event === "hit") && state.site === "skip") {
    data = { state: me, call: child, sub: d(state.event === "call" ? null : state.value) };
    now.push([["fx-dst", "best"], ["", " = "], ["fx-src", child]]);
    if (state.event !== "call") {
      data.result = d(state.value);
      now.push([["", "= "], [`${state.value === "-inf" ? "fx-bad" : "fx-src"} fx-result`, g(state.value)], ...(memoTag ? [["", " "], ...memoTag] : [])]);
    } else now.push([["", "= ?"]]);
  } else if (state.event === "total0") {
    now.push([["fx-take", "total"], ["", " = "], ["fx-take", "prefix[0]"], ["", " = 0"]]);
  } else if (state.event === "for-take" && state.take !== null) {
    data = { state: me, t: String(state.take), old: d(state.best) };
    now.push([["", `t = ${state.take}: `], ["fx-dst", "best"], ["", " = max("], ["fx-dst", g(state.best)], ["", ", "], ["fx-take", `prefix[${state.take}]`], ["", " + "], ["fx-src", `dfs(${state.frame[0] + 1}, ${state.frame[1] - state.take})`], ["", ")"]]);
  } else if (state.event === "add" && state.take !== null && state.total !== null) {
    const coin = state.piles[state.pileIndex][state.take - 1];
    data = { t: String(state.take), gain: String(state.total) };
    now.push([["fx-take", `prefix[${state.take}]`], ["", " = "], ["fx-take", "total"], ["", ` = ${state.total - coin} + ${coin} = `], ["fx-take", String(state.total)]]);
  } else if ((state.event === "call" || state.event === "back" || state.event === "hit") && state.site === "take") {
    const gain = state.total ?? 0;
    data = { state: me, call: child, t: String(state.take), gain: String(gain) };
    now.push([["fx-dst", "best"], ["", " ="]]);
    now.push([["", "max("], ["fx-dst", state.event === "call" ? g(state.best) : g(state.old)], ["", ", "], ["fx-take", String(gain)], ["", " + "], ["fx-src", child], ["", ")"]]);
    if (state.event !== "call") {
      const sum = state.value === "-inf" ? "-inf" : gain + state.value;
      const won = state.updated === true;
      Object.assign(data, { old: d(state.old), sub: d(state.value), sum: d(sum), result: d(won ? sum : state.old) });
      now.push([["", "= max("], [`fx-dst${won ? "" : " fx-win"}`, g(state.old)], ["", ", "], [`fx-take${won ? " fx-win" : ""}`, String(gain)], ["", " + "],
        [`${state.value === "-inf" ? "fx-bad" : "fx-src"}${won ? " fx-win" : ""}`, g(state.value)], ["", ")"]]);
      now.push([["", "= "], ["fx-dst fx-result", g(won ? sum : state.old)], ["fx-mark", won ? " ✓" : ` (${copy.kept} ${g(state.old)})`], ...(memoTag ? [["", " "], ...memoTag] : [])]);
    }
  } else if (state.event === "loop-end") {
    data = { state: me, result: d(state.best) };
    now.push([["fx-dst", me], ["", " = "], ["fx-dst", "best"], ["", " = "], ["fx-dst fx-result", g(state.best)]]);
  } else if (state.event === "ret") {
    data = { state: me, result: d(state.value) };
    now.push([["fx-dst", me], ["", " = "], ["fx-win", g(state.value)], ["", ` → memo[${state.frame[0]}][${state.frame[1]}]`]]);
  }
  const dataAttrs = Object.entries(data).map(([key, value]) => ` data-${key}="${lc2218Escape(value)}"`).join("");
  const nowLabel = now.length ? `${copy.formulaNow}: ${plain(now)}` : copy.formulaNow;
  const nowRow = now.length
    ? row("lc2218-fx-now", [[["fx-tag", copy.formulaNow]], ...now], ` role="group" data-event="${lc2218Escape(state.event)}"${dataAttrs} aria-label="${lc2218Escape(nowLabel)}"`)
    : `<div class="lc2218-fx-now is-empty" aria-hidden="true">&nbsp;</div>`;
  const comparing = Boolean(state.frame) && !kind && !state.final;
  return `<div class="lc2218-formula" role="group" aria-label="${lc2218Escape(`${copy.formula}: ${plain(general)}; ${plain(base)}`)}">`
    + row(`lc2218-fx-general${comparing ? " is-active" : ""}`, [[["fx-tag", copy.formula]], ...general])
    + row("lc2218-fx-base", base)
    + `<div class="lc2218-fx-symbols">${symbols}</div>`
    + nowRow
    + "</div>";
}

function lc2218PictureA3(state, copy) {
  const L = lc2218LayoutA3(state);
  const parts = [];
  const marker = (suffix, cls) => `<marker id="lc2218-head${suffix}" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="6" markerHeight="6" orient="auto"><path class="lc2218-arrowhead${cls}" d="M0,0 L8,4 L0,8 z"/></marker>`;
  parts.push(`<defs>${marker("", "")}${marker("-blocked", " is-blocked")}${marker("-path", " is-path")}${marker("-hit", " is-hit")}${marker("-stack", " is-stack")}</defs>`);
  lc2218PilesA3(state, L, copy, parts);
  lc2218ChoicesA3(state, L, copy, parts);
  lc2218MemoA3(state, L, copy, parts);
  lc2218StackA3(state, L, copy, parts);
  const eq = lc2218EquationA3(state, copy);
  if (eq) parts.push(`<text class="lc2218-eq" x="${LC2218_PAD}" y="${L.eqY}">${eq}</text>`);
  const vi = lc2218IsVi();
  const label = state.final && state.answer !== null
    ? `${copy.answer}: ${state.answer}`
    : vi ? `${state.n} ${copy.piles}, lấy đúng ${state.k} ${copy.coins}` : `${state.n} ${copy.piles}, take exactly ${state.k} ${copy.coins}`;
  return `<svg class="lc2218-svg" width="${L.width}" height="${L.height}" viewBox="0 0 ${L.width} ${L.height}" role="img" aria-label="${lc2218Escape(label)}">${parts.join("")}</svg>`;
}

function lc2218LegendA3(copy) {
  const G = copy.legend3;
  return `<div class="lc2218-legend" aria-hidden="true">`
    + `<span class="lg-coin"><i></i>${lc2218Escape(G.coin)}</span>`
    + `<span class="lg-take"><i></i>${lc2218Escape(G.take)}</span>`
    + `<span class="lg-dst"><i></i>${lc2218Escape(G.dst)}</span>`
    + `<span class="lg-src"><i></i>${lc2218Escape(G.src)}</span>`
    + `<span class="lg-memo"><i></i>${lc2218Escape(G.memo)}</span>`
    + `<span class="lg-stack"><i></i>${lc2218Escape(G.stack)}</span>`
    + `<span class="lg-dead"><i></i>${lc2218Escape(G.dead)}</span>`
    + `<span class="lg-empty">${lc2218Escape(G.empty)}</span>`
    + `<span class="lg-win">★ ${lc2218Escape(G.win)}</span></div>`;
}

// ---------- Current-line strip (source lives in the shared #codePanel) ----------

function lc2218Code(state, copy) {
  const badge = state.condition !== null && (state.event === "check" || state.event === "if-base" || state.event === "if-end")
    ? `<b class="lc2218-branch${state.condition ? " is-true" : " is-false"}">${state.condition ? "True" : "False"}</b>`
    : "";
  return `<header><b>${lc2218Escape(copy.code)}</b></header><div class="lc2218-now" data-code-line="${state.line}" aria-current="step"><span class="lc2218-lineno">L${state.line}</span>${state.effect ? `<code class="lc2218-effect">↳ ${lc2218Escape(state.effect)}</code>` : ""}${badge}</div>`;
}

// ---------- Navigation (same contract as other line-by-line renderers) ----------

function lc2218Next(kind) {
  if (typeof steps === "undefined" || !Array.isArray(steps) || typeof stepIndex === "undefined") return -1;
  return steps.findIndex((step, index) => {
    const view = step && step.maxCoins2218View;
    if (index <= stepIndex || !view) return false;
    if (kind === "line") return true;
    if (kind === "pile") return view.event === "for-pile";
    if (kind === "call") return view.event === "enter" || view.event === "hit";
    if (kind === "result") return Boolean(step.final);
    return false;
  });
}

function lc2218Go(index) {
  if (index < 0 || typeof steps === "undefined" || !steps[index]) return;
  if (typeof stopPlay === "function") stopPlay();
  stepIndex = index;
  if (typeof renderStep === "function") renderStep();
}

function lc2218Bind(host) {
  if (!host || typeof host.querySelectorAll !== "function") return;
  const bind = (selector, handler) => host.querySelectorAll(selector).forEach((element) => {
    element.addEventListener("click", () => handler(element));
    element.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        event.stopPropagation();
        handler(element);
      }
    });
  });
  bind("[data-lc2218-jump]", (element) => lc2218Go(lc2218Next(element.dataset.lc2218Jump)));
  bind("[data-lc2218-case]", (element) => {
    const preset = LC2218_CASES[Number(element.dataset.lc2218Case)];
    const input = typeof document !== "undefined" ? document.getElementById("arrInput") : null;
    if (!preset || !input) return;
    input.value = preset[0];
    const kInput = document.getElementById("param-k");
    if (kInput) kInput.value = String(preset[1]);
    if (typeof runViz === "function") runViz();
  });
}

function lc2218Presets(vi) {
  return LC2218_CASES.map((preset, index) => `<button type="button" data-lc2218-case="${index}">${lc2218Escape(vi ? preset[2] : preset[3])}</button>`).join("");
}

function renderMaxCoins2218Memo(host, step, raw, copy, vi) {
  const state = lc2218NormalizeA3(step, raw);
  const heading = state.final && state.answer !== null ? `return ${state.answer}` : `maxValueOfCoins(piles, ${state.k})`;
  const status = state.final ? `✓ ${state.answer} · ${copy.hits} ${state.hits}`
    : state.frame ? `${lc2218Dfs(state.frame, false)} · ${copy.hits} ${state.hits}` : `k = ${state.k}`;
  const jumps = copy.jumps3.map(([kind, label]) => `<button type="button" data-lc2218-jump="${kind}"${lc2218Next(kind) < 0 ? " disabled" : ""}>${lc2218Escape(label)}</button>`).join("");
  host.innerHTML = `<article class="lc2218-viz is-memo${state.final ? " is-final" : ""}" data-problem-id="2218" data-approach="3" data-source-line="${state.line}" role="region" aria-label="LeetCode 2218 · ${vi ? "dòng" : "line"} ${state.line}">`
    + `<header class="lc2218-head"><div><small>LEETCODE 2218 · K COINS · DFS + MEMO</small><h2><code>${lc2218Escape(heading)}</code></h2></div><span class="lc2218-status">${lc2218Escape(status)}</span></header>`
    + `<nav class="lc2218-presets" aria-label="${lc2218Escape(copy.examples)}">${lc2218Presets(vi)}</nav>`
    + `<section class="lc2218-card lc2218-picture-card" aria-label="${lc2218Escape(copy.picture3)}"><header><b>${lc2218Escape(copy.picture3)}</b></header>${lc2218PictureA3(state, copy)}${lc2218FormulaA3(state, copy)}${lc2218LegendA3(copy)}</section>`
    + `<section class="lc2218-card lc2218-code-card" aria-label="${lc2218Escape(copy.code)}">${lc2218Code(state, copy)}</section>`
    + `<footer class="lc2218-foot">${jumps}</footer></article>`;
  lc2218Bind(host);
}

function renderMaxCoins2218View(step) {
  const host = typeof document !== "undefined" && document.getElementById
    ? document.getElementById("treeView")
    : typeof $ === "function" ? $("treeView") : null;
  if (!host) return;
  const vi = lc2218IsVi();
  const copy = LC2218_COPY[vi ? "vi" : "en"];
  const raw = step && step.maxCoins2218View && typeof step.maxCoins2218View === "object" ? step.maxCoins2218View : {};
  if (raw.approach === 3) {
    renderMaxCoins2218Memo(host, step, raw, copy, vi);
    return;
  }
  const state = lc2218Normalize(step);
  const heading = state.final && state.answer !== null ? `return ${state.answer}` : `maxValueOfCoins(piles, ${state.k})`;
  const status = state.final ? `✓ ${state.answer}` : state.pileIndex !== null
    ? `P${state.pileIndex + 1}${state.j !== null ? ` · j = ${state.j}` : ""}` : `k = ${state.k}`;
  const presets = LC2218_CASES.map((preset, index) => `<button type="button" data-lc2218-case="${index}">${lc2218Escape(vi ? preset[2] : preset[3])}</button>`).join("");
  const jumps = copy.jumps.map(([kind, label]) => `<button type="button" data-lc2218-jump="${kind}"${lc2218Next(kind) < 0 ? " disabled" : ""}>${lc2218Escape(label)}</button>`).join("");
  const G = copy.legend;
  const legend = `<div class="lc2218-legend" aria-hidden="true">`
    + `<span class="lg-coin"><i></i>${lc2218Escape(G.coin)}</span>`
    + `<span class="lg-take"><i></i>${lc2218Escape(G.take)}</span>`
    + `<span class="lg-src"><i></i>${lc2218Escape(G.src)}</span>`
    + `<span class="lg-dst"><i></i>${lc2218Escape(G.dst)}</span>`
    + `<span class="lg-neg"><i></i>${lc2218Escape(G.neg)}</span>`
    + `<span class="lg-win">★ ${lc2218Escape(G.win)}</span></div>`;
  const method = state.approach === 1 ? "2D DP" : "1D DP";

  host.innerHTML = `<article class="lc2218-viz${state.final ? " is-final" : ""}" data-problem-id="2218" data-approach="${state.approach}" data-source-line="${state.line}" role="region" aria-label="LeetCode 2218 · ${vi ? "dòng" : "line"} ${state.line}">`
    + `<header class="lc2218-head"><div><small>LEETCODE 2218 · K COINS · ${method}</small><h2><code>${lc2218Escape(heading)}</code></h2></div><span class="lc2218-status">${lc2218Escape(status)}</span></header>`
    + `<nav class="lc2218-presets" aria-label="${lc2218Escape(copy.examples)}">${presets}</nav>`
    + `<section class="lc2218-card lc2218-picture-card" aria-label="${lc2218Escape(copy.picture)}"><header><b>${lc2218Escape(copy.picture)}</b></header>${lc2218Picture(state, copy)}${lc2218Formula(state, copy)}${legend}</section>`
    + `<section class="lc2218-card lc2218-code-card" aria-label="${lc2218Escape(copy.code)}">${lc2218Code(state, copy)}</section>`
    + `<footer class="lc2218-foot">${jumps}</footer></article>`;
  lc2218Bind(host);
}
