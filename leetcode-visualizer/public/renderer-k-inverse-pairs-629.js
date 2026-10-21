"use strict";

const KIP629_SOURCE = Object.freeze([
  "class Solution:",
  "    def kInversePairs(self, n: int, k: int) -> int:",
  "        MOD = 10**9 + 7",
  "        maximum = n * (n - 1) // 2",
  "        if k < 0 or k > maximum:",
  "            return 0",
  "        k = min(k, maximum - k)",
  "        dp = [0] * (k + 1)",
  "        dp[0] = 1",
  "        for size in range(1, n + 1):",
  "            next_dp = [0] * (k + 1)",
  "            window = 0",
  "            upper = min(k, size * (size - 1) // 2)",
  "            for inv in range(upper + 1):",
  "                window = (window + dp[inv]) % MOD",
  "                if inv >= size:",
  "                    window = (window - dp[inv - size]) % MOD",
  "                next_dp[inv] = window",
  "            dp = next_dp",
  "        answer = dp[k]",
  "        return answer",
]);

const KIP629_LINE_EVENTS = Object.freeze([
  "class", "method", "mod", "maximum", "check", "zero", "mirror", "dp", "seed", "size",
  "next", "window", "upper", "cell", "add", "check-left", "remove", "write", "commit", "answer", "return",
]);

function kip629Escape(value) {
  return String(value ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;")
    .replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

function kip629Locale() {
  return typeof lang !== "undefined" && lang === "vi" ? "vi" : "en";
}

function kip629Int(value, minimum, maximum) {
  return Number.isSafeInteger(value) && value >= minimum && value <= maximum ? value : null;
}

function kip629Row(raw, width, n) {
  if (!raw || typeof raw !== "object") return null;
  const size = kip629Int(raw.size, 0, n);
  const upper = kip629Int(raw.upper, 0, Math.max(0, width - 1));
  if (size === null || upper === null) return null;
  return {
    size,
    upper,
    values: Array.from({ length: width }, (_, index) => kip629Int(raw.values?.[index], 0, 1_000_000_006) ?? 0),
    computed: Array.from({ length: width }, (_, index) => raw.computed?.[index] === true),
  };
}

function kip629Normalize(step) {
  const raw = step?.inversePairs629View && typeof step.inversePairs629View === "object" ? step.inversePairs629View : {};
  const input = raw.input && typeof raw.input === "object" ? raw.input : {};
  const n = kip629Int(input.n, 1, 8) ?? 1;
  const requestedK = kip629Int(input.requestedK, 0, 28) ?? 0;
  const maximum = kip629Int(input.maximum, 0, 28);
  const effectiveK = kip629Int(input.effectiveK, 0, 14);
  const width = (effectiveK ?? 0) + 1;
  const cursor = raw.cursor && typeof raw.cursor === "object" ? raw.cursor : {};
  const window = raw.window && typeof raw.window === "object" ? raw.window : {};
  const rolling = raw.rolling && typeof raw.rolling === "object" ? raw.rolling : {};
  const sourceLine = kip629Int(raw.source?.line, 1, 21)
    ?? kip629Int(step?.codeLines?.[0], 1, 21) ?? 1;
  const array = (values) => Array.from({ length: width }, (_, index) => kip629Int(values?.[index], 0, 1_000_000_006) ?? 0);
  const witnessRaw = raw.witness && typeof raw.witness === "object" ? raw.witness : null;
  const witness = witnessRaw ? {
    permutation: Array.isArray(witnessRaw.permutation)
      ? witnessRaw.permutation.slice(0, n).map((value) => kip629Int(value, 1, n)).filter((value) => value !== null) : [],
    pairs: Array.isArray(witnessRaw.pairs) ? witnessRaw.pairs.slice(0, 28).flatMap((pair) => (
      Array.isArray(pair) && pair.length === 2
        ? [[kip629Int(pair[0], 1, n) ?? 0, kip629Int(pair[1], 1, n) ?? 0]] : []
    )) : [],
    inversionCount: kip629Int(witnessRaw.inversionCount, 0, 28) ?? 0,
    valid: witnessRaw.valid === true,
  } : null;
  return {
    event: typeof raw.event === "string" ? raw.event : KIP629_LINE_EVENTS[sourceLine - 1],
    phase: ["setup", "row", "cell", "done"].includes(raw.phase) ? raw.phase : "setup",
    sourceLine,
    input: {
      n,
      requestedK,
      maximum,
      effectiveK,
      reflected: input.reflected === true,
      impossible: input.impossible === true,
    },
    cursor: {
      size: kip629Int(cursor.size, 1, n),
      inv: kip629Int(cursor.inv, 0, Math.max(0, width - 1)),
      upper: kip629Int(cursor.upper, 0, Math.max(0, width - 1)),
    },
    window: {
      left: kip629Int(window.left, 0, 28),
      right: kip629Int(window.right, 0, 28),
      afterAdd: kip629Int(window.afterAdd, 0, 1_000_000_006),
      afterRemove: kip629Int(window.afterRemove, 0, 1_000_000_006),
      evict: window.evict === true,
    },
    rolling: {
      dp: array(rolling.dp),
      next: array(rolling.next),
      computed: Array.from({ length: width }, (_, index) => rolling.nextComputed?.[index] === true),
    },
    rows: Array.isArray(raw.rows) ? raw.rows.slice(0, n + 1).map((row) => kip629Row(row, width, n)).filter(Boolean) : [],
    witness,
    answer: kip629Int(raw.answer, 0, 1_000_000_006),
    final: raw.final === true || step?.final === true,
  };
}

function kip629Columns(state) {
  const target = state.input.effectiveK ?? 0;
  if (target <= 8) return Array.from({ length: target + 1 }, (_, index) => index);
  const columns = new Set([0, target]);
  if (state.cursor.inv !== null) {
    columns.add(state.cursor.inv);
    for (let index = state.window.left ?? state.cursor.inv; index <= (state.window.right ?? state.cursor.inv); index += 1) columns.add(index);
  } else {
    for (let index = Math.max(1, target - 6); index <= target; index += 1) columns.add(index);
  }
  return [...columns].sort((first, second) => first - second).slice(0, 10);
}

function kip629PairStaircase(state, copy) {
  const rows = Array.from({ length: state.input.n }, (_, index) => {
    return `<div><b>${index + 1}</b><span>${Array.from({ length: index }, () => "●").join("") || "·"}</span></div>`;
  }).join("");
  return `<section class="kip629-pairs-picture"><div class="kip629-staircase">${rows}</div><strong>${state.input.maximum ?? "?"}</strong><small>${copy.max}</small></section>`;
}

function kip629InsertionPicture(state, copy) {
  const size = state.cursor.size;
  if (size === null) return kip629PairStaircase(state, copy);
  const limit = state.cursor.inv === null ? size - 1 : Math.min(size - 1, state.cursor.inv);
  const options = Array.from({ length: size }, (_, added) => {
    const base = Array.from({ length: size - 1 }, (_, index) => index + 1);
    base.splice(size - 1 - added, 0, size);
    return `<div class="kip629-option ${added <= limit ? "eligible" : ""}" data-added="${added}"><span>${base.map((value) => `<b class="${value === size ? "new" : ""}">${value}</b>`).join("")}</span><em>+${added}</em></div>`;
  }).join("");
  return `<section class="kip629-insert"><header><span>${copy.insert}</span><strong>${size}</strong><i>→</i><b>0…${size - 1}</b></header><div>${options}</div></section>`;
}

function kip629Matrix(state) {
  const columns = kip629Columns(state);
  const rows = [...state.rows];
  const size = state.cursor.size;
  if (size !== null && !rows.some((row) => row.size === size) && state.rolling.next.length) {
    rows.push({ size, upper: state.cursor.upper ?? 0, values: state.rolling.next, computed: state.rolling.computed });
  }
  const latestRows = rows.slice(-Math.min(rows.length, 6));
  const cell = (row, column) => {
    const computed = row.computed[column] === true;
    const source = size !== null && row.size === size - 1
      && state.window.left !== null && column >= state.window.left && column <= (state.window.right ?? state.window.left);
    const active = row.size === size && column === state.cursor.inv;
    const target = state.final && row.size === state.input.n && column === state.input.effectiveK;
    return `<span class="${computed ? "computed" : "empty"} ${source ? "source" : ""} ${active ? "active" : ""} ${target ? "target" : ""}" data-size="${row.size}" data-inv="${column}">${computed ? row.values[column] : "·"}</span>`;
  };
  return `<section class="kip629-matrix" style="--kip-columns:${columns.length}"><header><b>n\k</b>${columns.map((column, index) => `<b class="${index > 0 && column - columns[index - 1] > 1 ? "jump" : ""}">${column}</b>`).join("")}</header>${latestRows.map((row) => `<div><b>${row.size}</b>${columns.map((column) => cell(row, column)).join("")}</div>`).join("")}</section>`;
}

function kip629WindowPicture(state, copy) {
  const left = state.window.left;
  const right = state.window.right;
  const chips = left === null || right === null ? [] : Array.from({ length: right - left + 1 }, (_, offset) => {
    const index = left + offset;
    return `<span><small>k=${index}</small><b>${state.rolling.dp[index] ?? 0}</b></span>`;
  });
  const result = state.final && state.answer !== null
    ? state.answer
    : state.cursor.inv === null ? "?" : state.rolling.next[state.cursor.inv] ?? state.window.afterRemove ?? state.window.afterAdd ?? "?";
  return `<section class="kip629-window ${state.window.evict ? "evict" : ""}"><header><span>${copy.window}</span><b>${left === null ? "—" : `${left}…${right}`}</b></header><div>${chips.join("<i>+</i>") || "<em>·</em>"}<i>→</i><strong>${result}</strong></div></section>`;
}

function kip629WitnessPicture(state, copy) {
  if (!state.witness) {
    return `<section class="kip629-no-witness"><span>${state.input.impossible ? "∅" : "…"}</span><b>${state.input.impossible ? copy.impossible : copy.building}</b></section>`;
  }
  const permutation = state.witness.permutation;
  const width = 520;
  const left = 45;
  const right = 475;
  const x = (index) => permutation.length === 1 ? width / 2 : left + index * ((right - left) / (permutation.length - 1));
  const arcs = state.witness.pairs.map(([larger, smaller], index) => {
    const first = permutation.indexOf(larger);
    const second = permutation.indexOf(smaller);
    const middle = (x(first) + x(second)) / 2;
    const rise = Math.min(86, 18 + Math.abs(second - first) * 14 + (index % 3) * 4);
    return `<path data-pair="${larger}-${smaller}" d="M ${x(first)} 112 Q ${middle} ${112 - rise} ${x(second)} 112"/>`;
  }).join("");
  const nodes = permutation.map((value, index) => `<g transform="translate(${x(index)},112)"><circle r="17"/><text text-anchor="middle" y="5">${value}</text></g>`).join("");
  return `<section class="kip629-witness"><header><span>${copy.witness}</span><strong>${state.witness.inversionCount}</strong></header><svg viewBox="0 0 ${width} 145" role="img" aria-label="${state.witness.inversionCount} inverse pairs"><g class="kip629-arcs">${arcs}</g><g class="kip629-nodes">${nodes}</g></svg><div>${permutation.map((value) => `<b>${value}</b>`).join("<i>›</i>")}</div></section>`;
}

function renderKInversePairs629View(step) {
  const host = typeof document !== "undefined" && document.getElementById
    ? document.getElementById("treeView") : typeof $ === "function" ? $("treeView") : null;
  if (!host) return;
  const locale = kip629Locale();
  const copy = locale === "vi" ? {
    insert: "Chèn số lớn nhất", window: "Cộng cửa sổ", witness: "Cặp nghịch thế",
    max: "tối đa", impossible: "k vượt giới hạn", building: "đang dựng", ways: "cách",
  } : {
    insert: "Insert largest", window: "Sum window", witness: "Inverse pairs",
    max: "maximum", impossible: "k is impossible", building: "building", ways: "ways",
  };
  const state = kip629Normalize(step);
  const phase = state.final ? 2 : state.phase === "cell" ? 1 : 0;
  const event = KIP629_LINE_EVENTS[state.sourceLine - 1];
  const answer = state.answer === null ? "?" : state.answer;
  host.innerHTML = `<article class="kip629-viz ${state.final ? "final" : ""}" role="region" aria-label="K Inverse Pairs"><header class="kip629-head"><span>#629</span><strong>n=${state.input.n}</strong><b>k=${state.input.requestedK}</b><em>L${state.sourceLine} · ${kip629Escape(event)}</em><i>${answer} ${copy.ways}</i></header><nav class="kip629-phases" aria-label="Algorithm phases"><span class="${phase === 0 ? "active" : phase > 0 ? "done" : ""}">① ${copy.insert}</span><b>→</b><span class="${phase === 1 ? "active" : phase > 1 ? "done" : ""}">② ${copy.window}</span><b>→</b><span class="${phase === 2 ? "active" : ""}">③ DP[n][k]</span></nav>${kip629InsertionPicture(state, copy)}<div class="kip629-work"><div>${kip629Matrix(state)}</div>${kip629WindowPicture(state, copy)}</div>${state.final || state.input.impossible ? kip629WitnessPicture(state, copy) : ""}<footer><span class="source">● DP ${locale === "vi" ? "được cộng" : "summed"}</span><span class="active">● DP ${locale === "vi" ? "đang ghi" : "being written"}</span><span class="target">★ DP[n][k]</span></footer></article>`;
}
