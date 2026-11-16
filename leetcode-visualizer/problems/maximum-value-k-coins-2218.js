// LeetCode 2218 — Maximum Value of K Coins From Piles. Group knapsack over pile prefixes.
// Approach 1: 2D dp[i][j]. Approach 2: 1D dp plus a fresh new_dp per pile.
// Each step is one executed Python line; the picture model lives in step.maxCoins2218View.

const bi2218 = (vi, en) => ({ vi, en });

const SOURCE_2218_A = Object.freeze([
  "from typing import List",
  "",
  "class Solution:",
  "    def maxValueOfCoins(self, piles: List[List[int]], k: int) -> int:",
  "        n = len(piles)",
  "        NEG = float('-inf')",
  "        dp = [[NEG] * (k + 1) for _ in range(n + 1)]",
  "        dp[0][0] = 0",
  "        for i in range(1, n + 1):",
  "            pile = piles[i - 1]",
  "            prefix = [0]",
  "            for coin in pile:",
  "                prefix.append(prefix[-1] + coin)",
  "            for j in range(k + 1):",
  "                for t in range(min(j, len(pile)) + 1):",
  "                    if dp[i - 1][j - t] != NEG:",
  "                        dp[i][j] = max(dp[i][j], dp[i - 1][j - t] + prefix[t])",
  "        return dp[n][k]",
]);

const SOURCE_2218_B = Object.freeze([
  "from typing import List",
  "",
  "class Solution:",
  "    def maxValueOfCoins(self, piles: List[List[int]], k: int) -> int:",
  "        NEG = float('-inf')",
  "        dp = [NEG] * (k + 1)",
  "        dp[0] = 0",
  "        for pile in piles:",
  "            prefix = [0]",
  "            for coin in pile:",
  "                prefix.append(prefix[-1] + coin)",
  "            new_dp = dp[:]",
  "            for j in range(1, k + 1):",
  "                for t in range(1, min(j, len(pile)) + 1):",
  "                    if dp[j - t] != NEG:",
  "                        new_dp[j] = max(new_dp[j], dp[j - t] + prefix[t])",
  "            dp = new_dp",
  "        return dp[k]",
]);

const DEFAULT_INPUT_2218 = "[[1,100,3],[7,8,9],[20,5,40]]";
const DEFAULT_K_2218 = 3;
const MAX_PILES_2218 = 7;
const MAX_PILE_LEN_2218 = 7;
const MAX_K_2218 = 8;
const MAX_COIN_2218 = 999;

const list2218 = (values) => `[${values.join(", ")}]`;
const num2218 = (value) => (value === null ? "-inf" : String(value));

function parsePiles2218(input) {
  let piles;
  if (Array.isArray(input)) {
    piles = input;
  } else {
    const raw = String(input ?? "").trim() || DEFAULT_INPUT_2218;
    if (raw.startsWith("[")) {
      try {
        piles = JSON.parse(raw);
      } catch (_error) {
        throw new Error("2218: piles phải là JSON như [[1,100,3],[7,8,9]] / piles must be JSON like [[1,100,3],[7,8,9]]");
      }
    } else {
      piles = raw.split(";").map((pile) => pile.split(",").map((value) => (value.trim() === "" ? NaN : Number(value))));
    }
  }
  if (!Array.isArray(piles) || piles.length < 1 || piles.length > MAX_PILES_2218) {
    throw new Error(`2218: cần 1–${MAX_PILES_2218} chồng / need 1–${MAX_PILES_2218} piles`);
  }
  for (const pile of piles) {
    if (!Array.isArray(pile) || pile.length < 1 || pile.length > MAX_PILE_LEN_2218) {
      throw new Error(`2218: mỗi chồng có 1–${MAX_PILE_LEN_2218} xu / each pile holds 1–${MAX_PILE_LEN_2218} coins`);
    }
    if (pile.some((coin) => !Number.isInteger(coin) || coin < 1 || coin > MAX_COIN_2218)) {
      throw new Error(`2218: mỗi xu là số nguyên 1–${MAX_COIN_2218} / each coin is an integer 1–${MAX_COIN_2218}`);
    }
  }
  return piles.map((pile) => [...pile]);
}

function parseK2218(params, piles) {
  const raw = params && params.k !== undefined && params.k !== null && params.k !== "" ? params.k : DEFAULT_K_2218;
  const k = Number(raw);
  const total = piles.reduce((sum, pile) => sum + pile.length, 0);
  const limit = Math.min(MAX_K_2218, total);
  if (!Number.isInteger(k) || k < 1 || k > limit) {
    throw new Error(`2218: k phải là số nguyên 1–${limit} / k must be an integer 1–${limit}`);
  }
  return k;
}

// Display-only reconstruction: how many coins the optimum takes from each pile (first maximum wins, like the code).
function plan2218(piles, k) {
  const n = piles.length;
  const dp = [[0, ...Array(k).fill(-Infinity)]];
  const pick = [Array(k + 1).fill(0)];
  for (let i = 1; i <= n; i++) {
    const pile = piles[i - 1];
    const prefix = [0];
    for (const coin of pile) prefix.push(prefix.at(-1) + coin);
    dp.push(Array(k + 1).fill(-Infinity));
    pick.push(Array(k + 1).fill(-1));
    for (let j = 0; j <= k; j++) {
      for (let t = 0; t <= Math.min(j, pile.length); t++) {
        const prev = dp[i - 1][j - t];
        if (prev === -Infinity) continue;
        if (prev + prefix[t] > dp[i][j]) {
          dp[i][j] = prev + prefix[t];
          pick[i][j] = t;
        }
      }
    }
  }
  const picks = Array(n).fill(0);
  const path = [[n, k]];
  let j = k;
  for (let i = n; i >= 1; i--) {
    picks[i - 1] = pick[i][j];
    j -= pick[i][j];
    path.push([i - 1, j]);
  }
  return { answer: dp[n][k], picks, path: path.reverse() };
}

// Shared step recorder for both approaches.
function recorder2218(approach, piles, k, varNames) {
  const steps = [];
  const locals = Object.fromEntries(varNames.map((name) => [name, "—"]));
  const view = {
    pileIndex: null,
    prefix: null,
    coinIndex: null,
    j: null,
    t: null,
    choices: [],
    table: null,
  };
  function emit(o) {
    const final = Boolean(o.final);
    const model = {
      version: 1,
      problemId: 2218,
      approach,
      line: o.line,
      event: o.event,
      condition: typeof o.condition === "boolean" ? o.condition : null,
      effect: o.effect || "",
      k,
      n: piles.length,
      piles,
      pileIndex: view.pileIndex,
      prefix: view.prefix,
      coinIndex: view.coinIndex,
      j: view.j,
      t: view.t,
      src: o.src || null,
      dst: o.dst || null,
      prev: o.prev === undefined ? null : o.prev,
      gain: o.gain === undefined ? null : o.gain,
      total: o.total === undefined ? null : o.total,
      updated: typeof o.updated === "boolean" ? o.updated : null,
      best: o.best === undefined ? null : o.best,
      choices: view.choices,
      table: view.table,
      answer: final ? o.answer : null,
      picks: final ? o.picks : null,
      path: final ? o.path || null : null,
      final,
    };
    steps.push({
      title: bi2218(o.title || o.effect, o.title || o.effect),
      note: o.note,
      arr: [],
      highlight: [],
      mark: [],
      codeLines: [o.line],
      codeBlock: approach,
      final,
      vars: varNames.map((name) => ({ name, value: locals[name] })),
      maxCoins2218View: JSON.parse(JSON.stringify(model)),
    });
  }
  return { steps, locals, view, emit };
}

const NOTES_2218 = {
  import: bi2218("Kiểu List.", "Type hints."),
  class: bi2218("Định nghĩa lớp.", "Class defined."),
  neg: bi2218("NEG = không đạt được.", "NEG = unreachable."),
  prefix0: bi2218("Lấy 0 xu = 0.", "Take 0 coins = 0."),
};

function call2218(n, k) {
  return bi2218(`${n} chồng, lấy đúng ${k} xu.`, `${n} piles, take exactly ${k}.`);
}

function buildSteps2218(input, params = {}) {
  const piles = parsePiles2218(input);
  const k = parseK2218(params, piles);
  const n = piles.length;
  const plan = plan2218(piles, k);
  const rec = recorder2218(1, piles, k, ["n", "i", "pile", "coin", "prefix", "j", "t"]);
  const { emit, locals, view } = rec;
  const dp = Array.from({ length: n + 1 }, () => Array(k + 1).fill(null));
  const snapshot = () => dp.map((row) => [...row]);

  emit({ line: 1, event: "import", effect: "List", note: NOTES_2218.import });
  emit({ line: 3, event: "class", effect: "Solution", note: NOTES_2218.class });
  emit({ line: 4, event: "call", effect: `k = ${k}`, title: `maxValueOfCoins(piles, ${k})`, note: call2218(n, k) });
  locals.n = n;
  emit({ line: 5, event: "n", effect: `n = ${n}`, note: bi2218(`n = ${n} chồng.`, `n = ${n} piles.`) });
  emit({ line: 6, event: "neg", effect: "NEG = -inf", note: NOTES_2218.neg });
  view.table = snapshot();
  emit({ line: 7, event: "alloc", effect: `dp = ${n + 1}×${k + 1} NEG`, note: bi2218("Bảng toàn −∞.", "Table full of −∞.") });
  dp[0][0] = 0;
  view.table = snapshot();
  emit({ line: 8, event: "seed", effect: "dp[0][0] = 0", dst: [0, 0], note: bi2218("0 chồng, 0 xu = 0.", "0 piles, 0 coins = 0.") });

  for (let i = 1; i <= n; i++) {
    const pile = piles[i - 1];
    locals.i = i;
    view.pileIndex = i - 1;
    view.prefix = null;
    view.coinIndex = null;
    view.j = null;
    view.t = null;
    view.choices = [];
    emit({ line: 9, event: "for-pile", effect: `i = ${i}`, note: bi2218(`Chồng P${i}.`, `Pile P${i}.`) });
    locals.pile = list2218(pile);
    emit({ line: 10, event: "pile", effect: `pile = ${list2218(pile)}`, note: bi2218(`Xét chồng P${i}.`, `Look at pile P${i}.`) });
    const prefix = [0];
    locals.prefix = list2218(prefix);
    view.prefix = [...prefix];
    emit({ line: 11, event: "prefix0", effect: "prefix = [0]", note: NOTES_2218.prefix0 });
    pile.forEach((coin, c) => {
      locals.coin = coin;
      view.coinIndex = c;
      emit({ line: 12, event: "for-coin", effect: `coin = ${coin}`, note: bi2218(`Xu thứ ${c + 1}: ${coin}.`, `Coin ${c + 1}: ${coin}.`) });
      const before = prefix.at(-1);
      prefix.push(before + coin);
      locals.prefix = list2218(prefix);
      view.prefix = [...prefix];
      emit({
        line: 13,
        event: "append",
        effect: `prefix[${c + 1}] = ${before} + ${coin} = ${prefix[c + 1]}`,
        note: bi2218(`${c + 1} xu trên = ${prefix[c + 1]}.`, `Top ${c + 1} coins = ${prefix[c + 1]}.`),
      });
    });
    view.coinIndex = null;

    for (let j = 0; j <= k; j++) {
      locals.j = j;
      view.j = j;
      view.t = null;
      view.choices = [];
      emit({ line: 14, event: "for-j", effect: `j = ${j}`, dst: [i, j], best: dp[i][j], note: bi2218(`Tính dp[${i}][${j}].`, `Fill dp[${i}][${j}].`) });
      for (let t = 0; t <= Math.min(j, pile.length); t++) {
        locals.t = t;
        view.t = t;
        const choice = { t, prev: null, gain: prefix[t], total: null, state: "pending" };
        view.choices = [...view.choices.map((item) => ({ ...item })), choice];
        const src = [i - 1, j - t];
        const prev = dp[i - 1][j - t];
        const common = { src, dst: [i, j], prev, gain: prefix[t] };
        emit({ ...common, line: 15, event: "for-t", effect: `t = ${t}`, best: dp[i][j], note: bi2218(`Lấy ${t} xu từ P${i}.`, `Take ${t} from P${i}.`) });
        const reachable = prev !== null;
        choice.prev = prev;
        choice.state = reachable ? "try" : "skip";
        if (reachable) choice.total = prev + prefix[t];
        view.choices = view.choices.map((item) => ({ ...item }));
        emit({
          ...common,
          line: 16,
          event: "check",
          condition: reachable,
          total: reachable ? prev + prefix[t] : null,
          best: dp[i][j],
          effect: `dp[${i - 1}][${j - t}] = ${num2218(prev)}`,
          note: reachable
            ? bi2218(`dp[${i - 1}][${j - t}] đạt được.`, `dp[${i - 1}][${j - t}] is reachable.`)
            : bi2218(`dp[${i - 1}][${j - t}] = −∞: bỏ.`, `dp[${i - 1}][${j - t}] = −∞: skip.`),
        });
        if (!reachable) continue;
        const total = prev + prefix[t];
        const old = dp[i][j];
        const updated = old === null || total > old;
        if (updated) {
          dp[i][j] = total;
          view.table = snapshot();
          view.choices.forEach((item) => { if (item.state === "win") item.state = "lose"; });
        }
        choice.state = updated ? "win" : "lose";
        view.choices = view.choices.map((item) => ({ ...item }));
        emit({
          ...common,
          line: 17,
          event: "update",
          total,
          updated,
          best: dp[i][j],
          effect: `dp[${i}][${j}] = max(${num2218(old)}, ${total}) = ${dp[i][j]}`,
          note: updated
            ? bi2218(`${prev} + ${prefix[t]} = ${total} ✓`, `${prev} + ${prefix[t]} = ${total} ✓`)
            : bi2218(`${total} ≤ ${old}: giữ.`, `${total} ≤ ${old}: keep.`),
        });
      }
    }
  }

  view.pileIndex = null;
  view.prefix = null;
  view.j = null;
  view.t = null;
  view.choices = [];
  emit({
    line: 18,
    event: "return",
    effect: `return ${dp[n][k]}`,
    dst: [n, k],
    best: dp[n][k],
    answer: dp[n][k],
    picks: plan.picks,
    path: plan.path,
    final: true,
    note: bi2218(`Đáp án = ${dp[n][k]}.`, `Answer = ${dp[n][k]}.`),
  });
  return { input: piles, k, answer: dp[n][k], selectedCounts: plan.picks, steps: rec.steps };
}

function buildSteps2218OneDimensional(input, params = {}) {
  const piles = parsePiles2218(input);
  const k = parseK2218(params, piles);
  const n = piles.length;
  const plan = plan2218(piles, k);
  const rec = recorder2218(2, piles, k, ["pile", "coin", "prefix", "j", "t"]);
  const { emit, locals, view } = rec;
  let dp = Array(k + 1).fill(null);
  let newDp = null;
  const snapshot = () => (newDp ? [[...dp], [...newDp]] : [[...dp]]);

  emit({ line: 1, event: "import", effect: "List", note: NOTES_2218.import });
  emit({ line: 3, event: "class", effect: "Solution", note: NOTES_2218.class });
  emit({ line: 4, event: "call", effect: `k = ${k}`, title: `maxValueOfCoins(piles, ${k})`, note: call2218(n, k) });
  emit({ line: 5, event: "neg", effect: "NEG = -inf", note: NOTES_2218.neg });
  view.table = snapshot();
  emit({ line: 6, event: "alloc", effect: `dp = [NEG] * ${k + 1}`, note: bi2218("dp toàn −∞.", "dp full of −∞.") });
  dp[0] = 0;
  view.table = snapshot();
  emit({ line: 7, event: "seed", effect: "dp[0] = 0", dst: [0, 0], note: bi2218("0 xu = 0.", "0 coins = 0.") });

  piles.forEach((pile, p) => {
    locals.pile = list2218(pile);
    view.pileIndex = p;
    view.prefix = null;
    view.coinIndex = null;
    view.j = null;
    view.t = null;
    view.choices = [];
    emit({ line: 8, event: "for-pile", effect: `pile = ${list2218(pile)}`, note: bi2218(`Chồng P${p + 1}.`, `Pile P${p + 1}.`) });
    const prefix = [0];
    locals.prefix = list2218(prefix);
    view.prefix = [...prefix];
    emit({ line: 9, event: "prefix0", effect: "prefix = [0]", note: NOTES_2218.prefix0 });
    pile.forEach((coin, c) => {
      locals.coin = coin;
      view.coinIndex = c;
      emit({ line: 10, event: "for-coin", effect: `coin = ${coin}`, note: bi2218(`Xu thứ ${c + 1}: ${coin}.`, `Coin ${c + 1}: ${coin}.`) });
      const before = prefix.at(-1);
      prefix.push(before + coin);
      locals.prefix = list2218(prefix);
      view.prefix = [...prefix];
      emit({
        line: 11,
        event: "append",
        effect: `prefix[${c + 1}] = ${before} + ${coin} = ${prefix[c + 1]}`,
        note: bi2218(`${c + 1} xu trên = ${prefix[c + 1]}.`, `Top ${c + 1} coins = ${prefix[c + 1]}.`),
      });
    });
    view.coinIndex = null;
    newDp = [...dp];
    view.table = snapshot();
    emit({ line: 12, event: "copy", effect: "new_dp = dp[:]", note: bi2218("Sao chép = lấy 0 xu.", "Copy = take 0 coins.") });

    for (let j = 1; j <= k; j++) {
      locals.j = j;
      view.j = j;
      view.t = null;
      const base = dp[j];
      view.choices = [{ t: 0, prev: base, gain: 0, total: base, state: base === null ? "skip" : "win" }];
      emit({
        line: 13,
        event: "for-j",
        effect: `j = ${j}`,
        src: [0, j],
        dst: [1, j],
        prev: base,
        gain: 0,
        total: base,
        best: newDp[j],
        note: bi2218(`Tính new_dp[${j}].`, `Fill new_dp[${j}].`),
      });
      for (let t = 1; t <= Math.min(j, pile.length); t++) {
        locals.t = t;
        view.t = t;
        const choice = { t, prev: null, gain: prefix[t], total: null, state: "pending" };
        view.choices = [...view.choices.map((item) => ({ ...item })), choice];
        const prev = dp[j - t];
        const common = { src: [0, j - t], dst: [1, j], prev, gain: prefix[t] };
        emit({ ...common, line: 14, event: "for-t", effect: `t = ${t}`, best: newDp[j], note: bi2218(`Lấy ${t} xu từ P${p + 1}.`, `Take ${t} from P${p + 1}.`) });
        const reachable = prev !== null;
        choice.prev = prev;
        choice.state = reachable ? "try" : "skip";
        if (reachable) choice.total = prev + prefix[t];
        view.choices = view.choices.map((item) => ({ ...item }));
        emit({
          ...common,
          line: 15,
          event: "check",
          condition: reachable,
          total: reachable ? prev + prefix[t] : null,
          best: newDp[j],
          effect: `dp[${j - t}] = ${num2218(prev)}`,
          note: reachable
            ? bi2218(`dp[${j - t}] đạt được.`, `dp[${j - t}] is reachable.`)
            : bi2218(`dp[${j - t}] = −∞: bỏ.`, `dp[${j - t}] = −∞: skip.`),
        });
        if (!reachable) continue;
        const total = prev + prefix[t];
        const old = newDp[j];
        const updated = old === null || total > old;
        if (updated) {
          newDp[j] = total;
          view.table = snapshot();
          view.choices.forEach((item) => { if (item.state === "win") item.state = "lose"; });
        }
        choice.state = updated ? "win" : "lose";
        view.choices = view.choices.map((item) => ({ ...item }));
        emit({
          ...common,
          line: 16,
          event: "update",
          total,
          updated,
          best: newDp[j],
          effect: `new_dp[${j}] = max(${num2218(old)}, ${total}) = ${newDp[j]}`,
          note: updated
            ? bi2218(`${prev} + ${prefix[t]} = ${total} ✓`, `${prev} + ${prefix[t]} = ${total} ✓`)
            : bi2218(`${total} ≤ ${old}: giữ.`, `${total} ≤ ${old}: keep.`),
        });
      }
    }
    dp = newDp;
    newDp = null;
    view.j = null;
    view.t = null;
    view.choices = [];
    view.table = snapshot();
    emit({ line: 17, event: "commit", effect: "dp = new_dp", note: bi2218(`dp gồm P1…P${p + 1}.`, `dp now covers P1…P${p + 1}.`) });
  });

  view.pileIndex = null;
  view.prefix = null;
  emit({
    line: 18,
    event: "return",
    effect: `return ${dp[k]}`,
    dst: [0, k],
    best: dp[k],
    answer: dp[k],
    picks: plan.picks,
    path: null,
    final: true,
    note: bi2218(`Đáp án = ${dp[k]}.`, `Answer = ${dp[k]}.`),
  });
  return { input: piles, k, answer: dp[k], selectedCounts: plan.picks, steps: rec.steps };
}

const complexity2218 = (space, vi, en) => ({ time: "O(k · Σ min(k, len(pile)))", space, note: bi2218(vi, en) });

module.exports = {
  2218: {
    id: 2218,
    difficulty: "hard",
    slug: "maximum-value-of-k-coins-from-piles",
    category: { key: "dp", vi: "Quy hoạch động", en: "Dynamic Programming" },
    tags: [
      { key: "array", vi: "Mảng", en: "Array" },
      { key: "dp", vi: "Quy hoạch động", en: "Dynamic Programming" },
      { key: "prefix-sum", vi: "Prefix Sum", en: "Prefix Sum" },
    ],
    title: bi2218("Maximum Value of K Coins From Piles", "Maximum Value of K Coins From Piles"),
    titleVi: bi2218("Giá trị lớn nhất khi lấy K đồng xu", "Maximum value from K coins"),
    statement: bi2218(
      "Mỗi chồng xu chỉ cho lấy xu trên cùng. Lấy đúng k xu từ tất cả các chồng sao cho tổng giá trị lớn nhất. Giới hạn trực quan: 1–7 chồng, mỗi chồng 1–7 xu (1–999), k ≤ 8.",
      "You may only take the top coin of a pile. Take exactly k coins across all piles to maximize their total value. Visualizer limits: 1–7 piles, 1–7 coins each (1–999), k ≤ 8.",
    ),
    defaultInput: DEFAULT_INPUT_2218,
    inputKind: "string",
    inputLabel: bi2218("piles: [[trên,…,dưới], …]", "piles: [[top,…,bottom], …]"),
    extraParams: [
      { key: "k", label: bi2218("k (số xu phải lấy)", "k (exact coins to take)"), default: DEFAULT_K_2218, min: 1, max: MAX_K_2218 },
      {
        key: "approach",
        label: bi2218("Cách giải", "Approach"),
        type: "select",
        default: "1",
        options: [
          { value: "1", label: bi2218("Cách 1: DP 2D dp[i][j]", "Approach 1: 2D dp[i][j]") },
          { value: "2", label: bi2218("Cách 2: DP 1D dp / new_dp", "Approach 2: 1D dp / new_dp") },
        ],
      },
    ],
    approach: [
      bi2218("prefix[t] = tổng t xu trên cùng của một chồng: lấy một chồng = chọn một t.", "prefix[t] = value of a pile's top t coins: using a pile means choosing one t."),
      bi2218("dp[i][j] = giá trị lớn nhất khi lấy đúng j xu từ i chồng đầu (−∞ nếu không được).", "dp[i][j] = best value from exactly j coins of the first i piles (−∞ if impossible)."),
      bi2218("dp[i][j] = max theo t của dp[i−1][j−t] + prefix[t]; đáp án là dp[n][k].", "dp[i][j] = max over t of dp[i−1][j−t] + prefix[t]; the answer is dp[n][k]."),
      bi2218("Cách 2 chỉ giữ một hàng dp và chép sang new_dp cho mỗi chồng, nên mỗi chồng chỉ dùng một lần.", "Approach 2 keeps one dp row and copies it to new_dp per pile, so each pile is used once."),
    ],
    complexity: complexity2218("O(n · k)", "Bảng (n+1)×(k+1).", "An (n+1)×(k+1) table."),
    complexity2: complexity2218("O(k)", "Chỉ hai hàng dp và new_dp.", "Only the dp and new_dp rows."),
    code: [...SOURCE_2218_A],
    code2: [...SOURCE_2218_B],
    codeLabel: bi2218("Cách 1 · DP 2D", "Approach 1 · 2D DP"),
    code2Label: bi2218("Cách 2 · DP 1D", "Approach 2 · 1D DP"),
    debugMode: "line-by-line",
    liveArgs: (input, params = {}) => {
      const piles = parsePiles2218(input);
      return [piles, parseK2218(params, piles)];
    },
    builder: buildSteps2218,
    builder2: buildSteps2218OneDimensional,
  },
};

Object.defineProperty(module.exports[2218], "__internals2218", {
  enumerable: false,
  value: {
    parsePiles2218,
    parseK2218,
    plan2218,
    SOURCE_2218_A,
    SOURCE_2218_B,
    DEFAULT_INPUT_2218,
    DEFAULT_K_2218,
    MAX_PILES_2218,
    MAX_PILE_LEN_2218,
    MAX_K_2218,
    MAX_COIN_2218,
  },
});
