"use strict";

const { bi } = require("./hard-viz-shared");
const base = require("./heap")[295];
const originalBuilder = base.builder;
const originalParser = base.parseMedianFinder295Input;

function parseMedian295(input = base.defaultInput) {
  if (!Array.isArray(input)) throw new TypeError("#295: cần mảng 1–40 số nguyên / enter an array of 1–40 integers.");
  return originalParser(Array.from(input));
}

function buildSteps295(input) {
  const run = originalBuilder(parseMedian295(input));
  run.steps = run.steps.map(step => {
    const v = step.medianFinder295View, lower = v.heaps.after.lower, upper = v.heaps.after.upper;
    return {
      ...step, note: bi("", ""),
      vars: [
        { name: "num", value: v.operation.name === "addNum" ? v.operation.args[0] : "—" },
        { name: "len(small)", value: lower.initialized ? lower.size : "—" },
        { name: "len(large)", value: upper.initialized ? upper.size : "—" },
        { name: "-small[0]", value: lower.top ?? "—" },
        { name: "large[0]", value: upper.top ?? "—" },
        { name: "median", value: v.medianHistory.length ? v.medianHistory.at(-1) : "—" },
      ],
    };
  });
  return run;
}

module.exports = {
  295: {
    ...base, builder: buildSteps295, parseMedianFinder295Input: parseMedian295,
    approach: [
      bi("small giữ nửa nhỏ · large giữ nửa lớn. Hai đỉnh nằm giữa dãy.", "small holds the lower half · large holds the upper half. Their roots meet in the middle."),
      bi("Chuyển đỉnh để giữ đúng thứ tự và chênh lệch kích thước 0 hoặc 1.", "Transfer a root to preserve order and a size difference of 0 or 1."),
      bi("Lẻ → đỉnh small. Chẵn → trung bình hai đỉnh.", "Odd → small's root. Even → average the two roots."),
    ],
  },
};
