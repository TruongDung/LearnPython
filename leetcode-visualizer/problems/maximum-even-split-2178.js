// Step builder for LeetCode 2178: Maximum Split of Positive Even Integers.
function buildSteps2178(input) {
  const total = Number(String(input).trim());
  const steps = [];
  const chosen = [];
  const valid = Number.isSafeInteger(total) && total > 0 && total % 2 === 0;
  const displayTotal = Number.isFinite(total) ? total : 0;
  const termCount = valid ? Math.floor((Math.sqrt(1 + 4 * total) - 1) / 2) : 0;
  const batchSize = Math.max(1, Math.ceil(termCount / 40));
  let remaining = valid ? total : 0;
  let candidate = 2;
  let answer = [];

  const snapshot = (phase, added = null, adjustment = null, final = false) => {
    const preview = chosen.length <= 12
      ? [...chosen]
      : [...chosen.slice(0, 6), ...chosen.slice(-6)];
    return {
      title: {
        vi: final ? `Tách ${displayTotal} thành ${chosen.length} phần` : `Còn ${remaining}`,
        en: final ? `Split ${displayTotal} into ${chosen.length} parts` : `${remaining} left`,
      },
      arr: preview,
      highlight: [],
      mark: [],
      codeLines: final ? [13] : phase === "invalid" ? [3, 4]
        : phase === "add" ? [7, 8, 9]
          : phase === "balance" ? [11, 12] : [5, 6],
      vars: [
        { name: "remaining", value: remaining },
        { name: "parts", value: chosen.length },
        ...(final ? [{ name: "answer", value: answer }] : []),
      ],
      note: {
        vi: phase === "add"
          ? `Lấy số chẵn nhỏ nhất còn dùng được: ${added.start}${added.count > 1 ? ` → ${added.end}` : ""}.`
          : phase === "balance"
            ? `Cộng ${adjustment.added} còn dư vào phần cuối: ${adjustment.before} → ${adjustment.after}.`
            : final ? "Các phần chẵn đôi một khác nhau, tổng đúng bằng ban đầu." : "Bắt đầu từ số chẵn nhỏ nhất.",
        en: phase === "add"
          ? `Take the smallest unused even number: ${added.start}${added.count > 1 ? ` → ${added.end}` : ""}.`
          : phase === "balance"
            ? `Add the ${adjustment.added} leftover to the last part: ${adjustment.before} → ${adjustment.after}.`
            : final ? "All parts are distinct evens and add up to the original sum." : "Start with the smallest even number.",
      },
      final,
      maximumEvenSplit2178View: {
        phase,
        total: displayTotal,
        remaining,
        count: chosen.length,
        preview,
        omitted: Math.max(0, chosen.length - preview.length),
        added,
        adjustment,
        answer: final ? answer : null,
      },
    };
  };

  steps.push(snapshot(valid ? "start" : "invalid"));
  if (valid) {
    let batchStart = null;
    let batchEnd = null;
    let inBatch = 0;

    while (remaining >= candidate) {
      if (batchStart === null) batchStart = candidate;
      batchEnd = candidate;
      chosen.push(candidate);
      remaining -= candidate;
      candidate += 2;
      inBatch += 1;

      if (inBatch === batchSize || remaining < candidate) {
        steps.push(snapshot("add", { start: batchStart, end: batchEnd, count: inBatch }));
        batchStart = null;
        batchEnd = null;
        inBatch = 0;
      }
    }

    if (remaining > 0 && chosen.length > 0) {
      const before = chosen.at(-1);
      chosen[chosen.length - 1] += remaining;
      const adjustment = { before, added: remaining, after: chosen.at(-1) };
      remaining = 0;
      steps.push(snapshot("balance", null, adjustment));
    }
  }

  answer = [...chosen];
  steps.push(snapshot("done", null, null, true));
  return { input, answer, steps };
}

module.exports = {
  2178: {
    id: 2178,
    difficulty: "medium",
    slug: "maximum-split-of-positive-even-integers",
    category: { key: "math", vi: "Toán học", en: "Math" },
    title: { vi: "Maximum Split of Positive Even Integers", en: "Maximum Split of Positive Even Integers" },
    titleVi: { vi: "Chia tổng thành nhiều số chẵn", en: "Split a sum into distinct even numbers" },
    statement: {
      vi: "Cho số chẵn dương finalSum. Tách thành nhiều số chẵn dương đôi một khác nhau nhất có thể. Trả về các phần đó.",
      en: "Given a positive even finalSum, split it into the maximum number of distinct positive even integers.",
    },
    defaultInput: 28,
    inputKind: "positive",
    inputLabel: { vi: "finalSum", en: "finalSum" },
    extraParams: [],
    complexity: {
      time: "O(√n)",
      space: "O(√n)",
      note: { vi: "Tham lam lấy số chẵn nhỏ nhất; phần dư cộng vào phần cuối.", en: "Greedily take the smallest evens; add any remainder to the last part." },
    },
    code: [
      "class Solution:",
      "    def maximumEvenSplit(self, finalSum: int) -> List[int]:",
      "        if finalSum % 2:",
      "            return []",
      "        parts = []",
      "        even = 2",
      "        while finalSum >= even:",
      "            parts.append(even)",
      "            finalSum -= even",
      "            even += 2",
      "        if finalSum:",
      "            parts[-1] += finalSum",
      "        return parts",
    ],
    builder: buildSteps2178,
  },
};
