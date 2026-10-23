"use strict";

const MOD = 1000000007;
const bi = (vi, en) => ({ vi, en });

const SOURCE = [
  "class Solution:",
  "    def possibleStringCount(self, word, k):",
  "        MOD = 10**9 + 7",
  "        groups = run_lengths(word)",
  "        total = product(groups) % MOD",
  "        if len(groups) >= k:",
  "            return total",
  "        dp = [0] * k",
  "        dp[0] = 1",
  "        for length in groups:",
  "            prefix = [0]",
  "            for ways in dp:",
  "                prefix.append((prefix[-1] + ways) % MOD)",
  "            dp = [0] + [(prefix[j] - prefix[max(0, j-length)]) % MOD for j in range(1, k)]",
  "        return (total - sum(dp)) % MOD",
];

function parseInput(input, params = {}) {
  const word = typeof input === "object" && input !== null ? String(input.word ?? "") : String(input ?? "");
  const k = Number(params.k ?? input?.k ?? 5);
  if (!/^[a-z]+$/.test(word) || word.length > 24) {
    throw new Error("3333: Use a lowercase word up to 24 characters / Nhập từ chữ thường, tối đa 24 ký tự.");
  }
  if (!Number.isInteger(k) || k < 1 || k > word.length) {
    throw new Error("3333: k must be between 1 and word.length / k phải từ 1 đến độ dài word.");
  }
  return { word, k };
}

function buildSteps(input, params = {}) {
  const { word, k } = parseInput(input, params);
  const groups = [];
  for (let i = 0; i < word.length;) {
    let end = i + 1;
    while (end < word.length && word[end] === word[i]) end++;
    groups.push({ char: word[i], length: end - i, start: i, end });
    i = end;
  }

  const total = groups.reduce((product, group) => (product * group.length) % MOD, 1);
  const steps = [];
  let dp = null;
  let dpBefore = null;
  let dpAfter = null;
  let groupIndex = -1;
  let sumIndex = null;
  let window = null;
  let shortWays = null;
  let answer = null;

  function emit(phase, line, final = false) {
    const activeGroup = groups[groupIndex] || null;
    const title = phase === "runs" ? bi("Gom các ký tự lặp", "Group repeated keys")
      : phase === "seed" ? bi("Bắt đầu ở độ dài 0", "Start at length 0")
        : phase === "early" ? bi("Đã đủ k ký tự gốc", "Already have k original keys")
          : phase === "cell" ? bi(`Tính độ dài ${sumIndex}`, `Count length ${sumIndex}`)
            : bi("Đếm xong", "Count complete");
    steps.push({
      arr: [],
      codeLines: [line],
      title,
      note: bi("", ""),
      final,
      vars: [
        { name: "groups", value: groups.length },
        { name: "k", value: k },
        { name: "j", value: sumIndex ?? "—" },
        { name: "answer", value: answer ?? "—" },
      ],
      originalTypedString3333View: {
        phase, word, k, groups: groups.map((group) => ({ ...group })),
        groupIndex, activeGroup: activeGroup ? { ...activeGroup } : null,
        dpBefore: dpBefore ? [...dpBefore] : null,
        dpAfter: dpAfter ? [...dpAfter] : dp ? [...dp] : null,
        sumIndex, window: window ? [...window] : null,
        total, shortWays, answer,
      },
    });
  }

  emit("runs", 4);
  if (groups.length >= k) {
    answer = total;
    shortWays = 0;
    emit("early", 7, true);
    return { original: { word, k }, answer, steps };
  }

  dp = Array(k).fill(0);
  dp[0] = 1;
  emit("seed", 9);

  for (groupIndex = 0; groupIndex < groups.length; groupIndex++) {
    const length = groups[groupIndex].length;
    dpBefore = [...dp];
    dpAfter = Array(k).fill(0);
    dpAfter[0] = 0;
    const prefix = Array(k + 1).fill(0);
    for (let index = 0; index < k; index++) prefix[index + 1] = (prefix[index] + dp[index]) % MOD;

    for (sumIndex = 1; sumIndex < k; sumIndex++) {
      const low = Math.max(0, sumIndex - length);
      window = [low, sumIndex - 1];
      dpAfter[sumIndex] = (prefix[sumIndex] - prefix[low] + MOD) % MOD;
      emit("cell", 14);
    }
    dp = [...dpAfter];
  }

  shortWays = dp.reduce((sum, ways) => (sum + ways) % MOD, 0);
  answer = (total - shortWays + MOD) % MOD;
  groupIndex = groups.length - 1;
  sumIndex = null;
  window = null;
  dpBefore = [...dp];
  dpAfter = [...dp];
  emit("done", 15, true);
  return { original: { word, k }, answer, steps };
}

module.exports = {
  3333: {
    id: 3333,
    slug: "find-the-original-typed-string-ii",
    difficulty: "hard",
    category: { key: "dp", vi: "Quy hoạch động", en: "Dynamic Programming" },
    tags: [
      { key: "dp", vi: "Quy hoạch động", en: "Dynamic Programming" },
      { key: "prefix-sum", vi: "Prefix sum", en: "Prefix sum" },
    ],
    title: bi("Find the Original Typed String II", "Find the Original Typed String II"),
    titleVi: bi("Đếm chuỗi gốc có độ dài ít nhất k", "Count original strings of length at least k"),
    statement: bi("Một phím có thể bị giữ lâu, tạo ký tự lặp. Đếm chuỗi gốc dài ít nhất k.", "A key may be held too long, creating repeats. Count original strings with length at least k."),
    defaultInput: "aabbcc",
    inputKind: "string",
    singleInput: true,
    inputLabel: bi("word · chữ đã gõ", "word · typed string"),
    extraParams: [{ key: "k", type: "number", min: 1, max: 24, default: 5, label: bi("k · độ dài tối thiểu", "k · minimum length") }],
    debugMode: "line-by-line",
    approach: [
      bi("Mỗi đoạn ký tự giống nhau dài L có L lựa chọn: giữ 1 đến L ký tự.", "A run of L equal characters has L choices: keep 1 through L."),
      bi("DP đếm các cách có độ dài nhỏ hơn k; prefix sum gom các lựa chọn liên tiếp.", "DP counts ways shorter than k; prefix sums combine consecutive choices."),
      bi("Tổng mọi cách − cách quá ngắn = đáp án.", "All choices − too-short choices = answer."),
    ],
    complexity: { time: "O(g · k)", space: "O(k)", note: bi("g = số đoạn ký tự giống nhau.", "g = number of equal-character runs.") },
    code: SOURCE,
    liveArgs: (input, params) => {
      const parsed = parseInput(input, params);
      return [parsed.word, parsed.k];
    },
    builder: buildSteps,
  },
};
