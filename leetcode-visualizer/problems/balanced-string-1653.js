"use strict";

const bi = (vi, en) => ({ vi, en });
const SOURCE = [
  "class Solution:",
  "    def minimumDeletions(self, s: str) -> int:",
  "        deletions = 0",
  "        b_count = 0",
  "        for i, ch in enumerate(s):",
  "            if ch == 'b':",
  "                b_count += 1",
  "            else:",
  "                delete_a = deletions + 1",
  "                delete_b = b_count",
  "                deletions = min(delete_a, delete_b)",
  "        return deletions",
];

function parseInput(input) {
  if (typeof input !== "string" || input.length < 1 || input.length > 100 || /[^ab]/.test(input)) {
    throw new Error("1653: mô phỏng nhận 1–100 ký tự a hoặc b / visualization accepts 1–100 characters, a or b only.");
  }
  return input;
}

function buildSteps(input) {
  const s = parseInput(input);
  const steps = [];
  const locals = {};
  const allB = [];
  const history = [];
  let deletions = 0;
  let bCount = null;
  let i = null;
  let ch = null;
  let processed = 0;
  let removed = [];
  let candidates = null;
  const emit = (line, phase, title, condition = null, final = false) => steps.push({
    arr: [], highlight: [], mark: [], codeLines: [line], title, note: bi("", ""), final,
    vars: Object.entries(locals).map(([name, value]) => ({ name, value })),
    balancedString1653View: {
      s, i, ch, deletions, bCount, processed, phase, line,
      source: SOURCE[line - 1].trim(),
      removed: [...removed], allB: [...allB],
      candidates: candidates ? {
        ...candidates,
        removeA: [...candidates.removeA],
        removeB: candidates.removeB ? [...candidates.removeB] : null,
      } : null,
      history: history.map(entry => ({ ...entry })),
      condition, answer: final ? deletions : null,
    },
  });
  locals.deletions = 0;
  emit(3, "init-dp", bi("deletions = 0", "deletions = 0"));
  bCount = 0;
  locals.b_count = 0;
  emit(4, "init-b", bi("b_count = 0", "b_count = 0"));
  for (i = 0; i < s.length; i += 1) {
    ch = s[i];
    locals.i = i;
    locals.ch = ch;
    candidates = null;
    emit(5, "read", bi(`Đọc s[${i}] = '${ch}'`, `Read s[${i}] = '${ch}'`));
    emit(6, "check", bi(`ch == 'b' → ${ch === "b" ? "True" : "False"}`, `ch == 'b' → ${ch === "b" ? "True" : "False"}`), ch === "b");
    if (ch === "b") {
      bCount += 1;
      locals.b_count = bCount;
      allB.push(i);
      processed = i + 1;
      history.push({ i, ch, deletions, step: steps.length });
      emit(7, "count-b", bi(`b_count = ${bCount} · giữ b`, `b_count = ${bCount} · keep b`));
    } else {
      locals.delete_a = deletions + 1;
      candidates = { previous: deletions, deleteA: locals.delete_a, deleteB: null, removeA: [...removed, i], removeB: null, choice: null };
      emit(9, "delete-a", bi(`Bỏ a này: ${deletions} + 1 = ${locals.delete_a}`, `Delete this a: ${deletions} + 1 = ${locals.delete_a}`));
      locals.delete_b = bCount;
      candidates.deleteB = bCount;
      candidates.removeB = [...allB];
      emit(10, "delete-b", bi(`Bỏ mọi b trước: ${bCount}`, `Delete all earlier b: ${bCount}`));
      candidates.choice = locals.delete_a <= locals.delete_b ? "a" : "b";
      deletions = Math.min(locals.delete_a, locals.delete_b);
      locals.deletions = deletions;
      removed = [...(candidates.choice === "a" ? candidates.removeA : candidates.removeB)];
      processed = i + 1;
      history.push({ i, ch, deletions, step: steps.length });
      emit(11, "choose", bi(`min(${locals.delete_a}, ${locals.delete_b}) = ${deletions}`, `min(${locals.delete_a}, ${locals.delete_b}) = ${deletions}`));
    }
  }
  // Python retains i and ch after the final, unsuccessful loop iteration.
  i = s.length - 1;
  emit(5, "exhausted", bi("Đã xét hết chuỗi", "End of string"));
  emit(12, "done", bi(`Ít nhất ${deletions} lần xóa`, `Minimum ${deletions} deletions`), null, true);
  return { original: s, answer: deletions, steps };
}

module.exports = {
  1653: {
    id: 1653,
    slug: "minimum-deletions-to-make-string-balanced",
    difficulty: "medium",
    category: { key: "dp", vi: "Quy hoạch động", en: "Dynamic Programming" },
    tags: [{ key: "string", vi: "Chuỗi", en: "String" }],
    title: bi("Minimum Deletions to Make String Balanced", "Minimum Deletions to Make String Balanced"),
    titleVi: bi("Xóa ít nhất để mọi a đứng trước b", "Fewest deletions to put every a before b"),
    statement: bi("Xóa ít ký tự nhất khỏi s để mọi a đứng trước mọi b. Chuỗi chỉ có a hoặc chỉ có b cũng hợp lệ. Đề gốc: tối đa 100.000 ký tự; mô phỏng từng dòng: tối đa 100.", "Delete the fewest characters from s so every a appears before every b. Strings with only a or only b are valid too. Original limit: 100,000 characters; line-by-line visualization: up to 100."),
    inputKind: "string", preserveInputWhitespace: true,
    inputLabel: bi("s · 1–100 ký tự a / b", "s · 1–100 characters a / b"),
    defaultInput: "aababbab", extraParams: [], debugMode: "line-by-line",
    approach: [bi("Gặp a: chọn min(bỏ a này, bỏ mọi b phía trước).", "On a: choose min(delete this a, delete all earlier b).")],
    complexity: { time: "O(n)", space: "O(1)", note: bi("Một lượt quét, hai bộ đếm. Không tính dữ liệu minh hoạ và dựng phương án xóa.", "One scan, two counters. Excludes visualization data and deletion reconstruction.") },
    code: SOURCE, builder: buildSteps, liveArgs: input => [parseInput(input)],
  },
};
