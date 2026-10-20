"use strict";

const MOD = 1000000007;
const MAX_TRACE = 520;
const bi = (vi, en) => ({ vi, en });

const CODE = Object.freeze([
  "class Solution:",
  "    def numberOfWays(self, n, x):",
  "        MOD = 10**9 + 7",
  "        powers = []",
  "        base = 1",
  "        while base ** x <= n:",
  "            powers.append(base ** x)",
  "            base += 1",
  "        dp = [0] * (n + 1)",
  "        dp[0] = 1",
  "        for power in powers:",
  "            for total in range(n, power - 1, -1):",
  "                dp[total] = (dp[total] + dp[total - power]) % MOD",
  "        return dp[n]",
]);

function parse2787Input(input, params = {}) {
  const n = Number(input);
  const x = Number(params.x);
  if (!Number.isInteger(n) || n < 1 || n > 300) {
    throw new RangeError("2787: n must be an integer in [1, 300].");
  }
  if (!Number.isInteger(x) || x < 1 || x > 5) {
    throw new RangeError("2787: x must be an integer in [1, 5].");
  }
  return { n, x };
}

function buildSteps2787(input, params = {}) {
  const { n, x } = parse2787Input(input, params);
  const powers = [];
  const dp = Array(n + 1).fill(0);
  const example = Array(n + 1).fill(null);
  const steps = [];
  let base = 1;
  let powerIndex = -1;
  let total = null;
  let transition = null;
  let answer = null;
  let witness = null;
  let truncated = false;

  function visibleTotals() {
    if (n <= 30) return Array.from({ length: n + 1 }, (_, index) => index);
    const visible = new Set([0, 1, 2, n - 2, n - 1, n]);
    for (const center of [total, transition?.source, transition?.destination]) {
      if (!Number.isInteger(center)) continue;
      for (let offset = -3; offset <= 3; offset += 1) {
        const value = center + offset;
        if (value >= 0 && value <= n) visible.add(value);
      }
    }
    return [...visible].sort((a, b) => a - b);
  }

  function record(event, line, final = false) {
    if (!final && steps.length >= MAX_TRACE) {
      truncated = true;
      return;
    }
    const currentPower = powerIndex >= 0 && powerIndex < powers.length ? powers[powerIndex] : null;
    steps.push({
      arr: [],
      highlight: [],
      mark: [],
      title: bi("Tổng các lũy thừa riêng biệt", "Sum of distinct powers"),
      note: bi("", ""),
      codeLines: [line],
      final,
      vars: [
        { name: "n", value: n },
        { name: "x", value: x },
        { name: "power", value: currentPower?.value ?? "—" },
        { name: "total", value: total ?? "—" },
      ],
      waysToExpressPowers2787View: {
        n,
        x,
        event,
        base,
        powers: powers.map((item) => ({ ...item })),
        powerIndex,
        currentPower: currentPower ? { ...currentPower } : null,
        total,
        transition: transition ? { ...transition } : null,
        cells: visibleTotals().map((value) => ({ total: value, ways: dp[value] })),
        cropped: n > 30,
        answer,
        witness: witness ? witness.map((item) => ({ ...item })) : null,
        modulo: MOD,
        truncated,
      },
    });
  }

  record("bind-class", 1);
  record("enter-method", 2);
  record("set-modulo", 3);
  record("create-powers", 4);
  record("set-base", 5);
  while (base ** x <= n) {
    record("check-power", 6);
    powers.push({ base, value: base ** x });
    record("add-power", 7);
    base += 1;
    record("next-base", 8);
  }
  record("finish-powers", 6);
  record("allocate-dp", 9);
  dp[0] = 1;
  example[0] = [];
  record("seed-zero", 10);

  for (powerIndex = 0; powerIndex < powers.length; powerIndex += 1) {
    total = null;
    transition = null;
    record("pick-power", 11);
    const power = powers[powerIndex];
    for (total = n; total >= power.value; total -= 1) {
      const source = total - power.value;
      const before = dp[total];
      const added = dp[source];
      const after = (before + added) % MOD;
      transition = {
        source,
        destination: total,
        power: power.value,
        base: power.base,
        before,
        added,
        after,
      };
      record("aim-total", 12);
      dp[total] = after;
      if (example[total] === null && example[source] !== null) {
        example[total] = [...example[source], { ...power }];
      }
      record("move-ways", 13);
    }
  }

  answer = dp[n];
  witness = example[n];
  total = n;
  transition = null;
  powerIndex = powers.length;
  record("return-answer", 14, true);
  return { original: n, x, powers, answer, witness, steps };
}

module.exports = {
  2787: {
    id: 2787,
    difficulty: "medium",
    slug: "ways-to-express-an-integer-as-sum-of-powers",
    category: { key: "dp", vi: "Quy hoạch động", en: "Dynamic Programming" },
    tags: [
      { key: "0-1-knapsack", vi: "Balo 0/1", en: "0/1 Knapsack" },
      { key: "counting", vi: "Đếm số cách", en: "Counting" },
    ],
    title: bi("Ways to Express an Integer as Sum of Powers", "Ways to Express an Integer as Sum of Powers"),
    titleVi: bi("Biểu diễn số bằng tổng lũy thừa", "Express an integer as a sum of powers"),
    statement: bi(
      "Đếm số cách viết n thành tổng các số nguyên dương khác nhau, mỗi số được nâng lên lũy thừa x.",
      "Count ways to write n as a sum of distinct positive integers, each raised to the power x.",
    ),
    defaultInput: 10,
    inputKind: "positive",
    singleInput: true,
    inputLabel: bi("n · đích", "n · target"),
    extraParams: [
      { key: "x", type: "number", min: 1, max: 5, default: 2, label: bi("x · số mũ", "x · exponent") },
    ],
    debugMode: "line-by-line",
    approach: [
      bi("Biến 1ˣ, 2ˣ, … thành các mảnh ghép không lặp.", "Turn 1ˣ, 2ˣ, … into one-use pieces."),
      bi("dp[t] là số cách ghép đúng tổng t.", "dp[t] counts ways to build total t."),
      bi("Quét t giảm dần để mỗi mảnh chỉ được dùng một lần.", "Scan t downward so each piece is used once."),
    ],
    complexity: {
      time: "O(n · n^(1/x))",
      space: "O(n)",
      note: bi("Mỗi lũy thừa được đưa vào DP đúng một lượt.", "Each power enters the DP exactly once."),
    },
    code: CODE,
    liveArgs: (input, params) => {
      const parsed = parse2787Input(input, params);
      return [parsed.n, parsed.x];
    },
    parseInput: parse2787Input,
    builder: buildSteps2787,
  },
};
