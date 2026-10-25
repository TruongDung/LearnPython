"use strict";

const bi = (vi, en) => ({ vi, en });
const SOURCE = [
  "class Solution:",
  "    def numberOfCategories(self, n, categoryHandler):",
  "        reps = []",
  "        count = 0",
  "        for i in range(n):",
  "            same = False",
  "            for rep in reps:",
  "                same = categoryHandler.haveSameCategory(i, rep)",
  "                if same:",
  "                    break",
  "            if not same:",
  "                reps.append(i)",
  "                count += 1",
  "        return count",
];

function parseCategories(input) {
  if (!Array.isArray(input) || input.length < 1 || input.length > 100 || input.some(value => !Number.isSafeInteger(value))) {
    throw new RangeError("2782: nhập 1–100 nhãn nguyên / provide 1–100 integer category labels.");
  }
  return [...input];
}

function buildSteps(input) {
  const categories = parseCategories(input);
  // The solver can only ask this oracle; category labels never enter its state.
  const haveSameCategory = (left, right) => categories[left] === categories[right];
  const n = categories.length, detailed = n <= 18;
  const reps = [], groups = [], owners = Array(n).fill(-1), steps = [];
  let i = null, rep = null, same = null, count = null, feedback = null, calls = 0, processed = 0;
  const captions = {
    init: bi("📦 Các hộp bí mật", "📦 Mystery boxes"),
    pick: bi("🔎 Chọn một hộp", "🔎 Pick a box"),
    ask: bi("↔ So với đại diện", "↔ Compare with a representative"),
    reply: bi("↔ Kết quả so sánh", "↔ Comparison result"),
    joined: bi("✓ Xếp vào nhóm có sẵn", "✓ Join the matching group"),
    decide: bi("⌕ Đã có nhóm phù hợp?", "⌕ Is there a matching group?"),
    new: bi("＋ Tạo nhóm mới", "＋ Create a new group"),
    count: bi("＋1 nhóm", "＋1 group"),
    finish: bi("🏁 Đã phân nhóm xong", "🏁 All boxes grouped"),
  };
  function emit(line, phase, final = false) {
    if (!detailed && !["init", "pick", "joined", "count", "finish"].includes(phase)) return;
    steps.push({
      title: phase === "reply" ? (feedback ? bi("✓ Cùng nhóm", "✓ Same category") : bi("≠ Khác nhóm", "≠ Different categories")) : captions[phase],
      arr: [], highlight: [], mark: [], codeLines: [line], final,
      vars: [
        { name: "i", value: i ?? "—" },
        { name: "rep", value: rep ?? "—" },
        { name: "same", value: same ?? "—" },
        { name: "reps", value: [...reps] },
        { name: "count", value: count ?? "—" },
      ],
      note: bi("", ""),
      categories2782View: {
        n, i, rep: phase === "pick" || phase === "init" ? null : rep, feedback, count, phase, processed, calls, detailed,
        owners: [...owners], reps: [...reps],
        groups: groups.map(group => ({ representative: group.representative, members: [...group.members] })),
      },
    });
  }

  emit(3, "init");
  count = 0; emit(4, "init");
  for (i = 0; i < n; i++) {
    feedback = null;
    emit(5, "pick");
    same = false; emit(6, "pick");
    for (const representative of reps) {
      rep = representative; feedback = null;
      emit(7, "ask");
      same = haveSameCategory(i, rep); feedback = same; calls++;
      emit(8, "reply");
      emit(9, "reply");
      if (same) {
        const group = owners[rep];
        owners[i] = group; groups[group].members.push(i); processed++;
        emit(10, "joined");
        break;
      }
    }
    emit(11, "decide");
    if (!same) {
      owners[i] = reps.length;
      reps.push(i); groups.push({ representative: i, members: [i] }); processed++;
      emit(12, "new");
      count++; emit(13, "count");
    }
  }
  i = n - 1;
  emit(14, "finish", true);
  return { original: categories, answer: count, calls, steps };
}

module.exports = { 2782: {
  id: 2782, difficulty: "medium", premium: true, slug: "number-of-unique-categories",
  category: { key: "greedy", vi: "Tham lam", en: "Greedy" },
  tags: [{ key: "interactive", vi: "Tương tác", en: "Interactive" }, { key: "array", vi: "Mảng", en: "Array" }],
  title: bi("Number of Unique Categories", "Number of Unique Categories"),
  titleVi: bi("Đếm nhóm bằng cách hỏi từng cặp", "Discover groups by comparing pairs"),
  statement: bi("Mỗi phần tử thuộc một nhóm bí mật. Chỉ được hỏi haveSameCategory(i, rep). Tìm số nhóm khác nhau; nhãn nhập vào chỉ dùng để mô phỏng API.", "Each item has a hidden category. Ask only haveSameCategory(i, rep) and count distinct categories. Input labels configure the simulated API."),
  defaultInput: [1, 2, 1, 3, 2, 3], inputKind: "array",
  inputLabel: bi("categoryHandler · nhãn giả lập (1–100 phần tử)", "categoryHandler · simulation labels (1–100 items)"),
  approach: [
    bi("Mỗi nhóm giữ đúng một đại diện trong reps.", "Keep one representative per discovered group in reps."),
    bi("Hỏi từng đại diện: khớp → cùng nhóm; không khớp ai → thêm nhóm mới.", "Compare with representatives: a match joins that group; no match creates a new group."),
  ],
  complexity: { time: "O(n²)", space: "O(n)", note: bi("Tối đa n(n−1)/2 lần hỏi. Với >18 phần tử, hình rút gọn theo từng hộp; vẫn tính đủ mọi lần hỏi.", "At most n(n−1)/2 oracle calls. Above 18 items, frames summarize each box while all comparisons are computed.") },
  code: SOURCE, builder: buildSteps,
  liveArgs: input => { const categories = parseCategories(input); return [categories.length, { __viz_type: "category_handler", categories }]; },
} };
