"use strict";

const base = require("./dp")[2407];
function builder(input, params) {
  const run = base.builder(input, params);
  let answer = 0;
  return { ...run, steps: run.steps.map(step => {
    const v = step.lis2407View;
    if (v.operation === "best" || v.operation === "done") answer = v.answer;
    return { ...step, note: { vi: "", en: "" },
      vars: [{ name: "i", value: v.currentIndex >= 0 ? v.currentIndex : "—" }, { name: "x", value: v.currentValue ?? "—" },
        { name: "k", value: v.k }, { name: "previous", value: v.queryLength ?? "—" },
        { name: "current", value: v.currentIndex >= 0 ? v.dp[v.currentIndex] ?? "—" : "—" }, { name: "answer", value: answer },
        { name: "[x-k, x-1]", value: v.leftValue === null ? "—" : `[${v.leftValue}, ${v.rightValue}]` },
        { name: "predecessor", value: v.queryLength === null ? "—" : v.predecessorIndex }],
      pictureStudyView: { ...v, id: 2407, line: step.codeLines[0], phase: v.operation, answer },
    };
  }) };
}
module.exports = { 2407: { ...base, builder } };
