"use strict";

const bi = (vi, en) => ({ vi, en });
const SOURCE = Object.freeze([
  "class Solution:",
  "    def validPalindrome(self, s):",
  "        def is_palindrome(left, right):",
  "            while left < right:",
  "                if s[left] != s[right]:",
  "                    return False",
  "                left += 1",
  "                right -= 1",
  "            return True",
  "",
  "        left = 0",
  "        right = len(s) - 1",
  "        while left < right:",
  "            if s[left] != s[right]:",
  "                skip_left = is_palindrome(left + 1, right)",
  "                if skip_left:",
  "                    return True",
  "                skip_right = is_palindrome(left, right - 1)",
  "                return skip_right",
  "            left += 1",
  "            right -= 1",
  "        return True",
]);

function parseInput680(input) {
  const s = String(input ?? "");
  if (s.length < 1 || s.length > 18 || /[^a-z]/i.test(s)) {
    throw new Error("#680: nhập 1–18 chữ cái / enter 1–18 alphabetic characters.");
  }
  return s;
}

function buildSteps680(input) {
  const s = parseInput680(input), steps = [], pairs = [];
  const outer = { s };
  let frame = outer, method = "validPalindrome", activeSide = null;
  let branches = [], mismatch = null, answer = null, deletedIndex = null;
  const py = value => value ? "True" : "False";
  const captions = {
    define: bi("Hàm kiểm tra đoạn còn lại", "Check the remaining range"),
    init: bi("Đặt hai con trỏ", "Place the pointers"),
    loop: bi("Còn cặp để so sánh?", "More pairs to compare?"),
    match: bi("Hai ký tự khớp", "The characters match"),
    mismatch: bi("Lệch cặp · thử xóa một ký tự", "Mismatch · try one deletion"),
    move: bi("Tiến vào giữa", "Move inward"),
    "helper-pass": bi("Đoạn còn lại đối xứng", "The remaining range is a palindrome"),
    "helper-fail": bi("Vẫn còn cặp lệch", "A mismatched pair remains"),
    assign: bi("Nhận kết quả kiểm tra", "Receive the check result"),
    branch: bi("Nhánh trái đã đủ?", "Did skipping left work?"),
    done: bi("Kết quả", "Result"),
  };
  function emit(line, phase, equation, condition = null) {
    const branch = branches.find(item => item.side === activeSide);
    const isHelper = method === "is_palindrome";
    const locals = { ...frame };
    steps.push({
      title: captions[phase], note: bi("", ""), arr: [], highlight: [], mark: [],
      codeLines: [line], final: phase === "done",
      vars: [
        { name: "left", value: frame.left ?? "—" },
        { name: "right", value: frame.right ?? "—" },
        { name: "s[left]", value: s[frame.left] ?? "—" },
        { name: "s[right]", value: s[frame.right] ?? "—" },
        { name: "skip_left", value: outer.skip_left ?? "—" },
        { name: "skip_right", value: outer.skip_right ?? "—" },
      ],
      palindrome680View: {
        s, chars: [...s], phase, equation, condition, method, locals,
        source: { line, text: SOURCE[line - 1], timing: "after" },
        left: frame.left ?? null, right: frame.right ?? null,
        mainLeft: outer.left ?? null, mainRight: outer.right ?? null,
        pairs: (isHelper ? [...pairs, ...branch.pairs] : pairs).map(pair => [...pair]),
        mismatch: mismatch ? [...mismatch] : null,
        failedPair: isHelper ? branch.failedPair ? [...branch.failedPair] : null : mismatch ? [...mismatch] : null,
        activeSide: isHelper ? activeSide : null,
        removedIndex: isHelper ? branch.index : phase === "done" && answer ? deletedIndex : null,
        branches: branches.map(item => ({ ...item, pairs: item.pairs.map(pair => [...pair]), failedPair: item.failedPair ? [...item.failedPair] : null })),
        answer, deletedIndex,
        witness: phase === "done" && answer ? [...s].filter((_, index) => index !== deletedIndex).join("") : null,
      },
    });
  }

  function checkRange(side, left, right) {
    const branch = branches.find(item => item.side === side);
    branch.status = "checking"; activeSide = side;
    frame = { s, left, right }; method = "is_palindrome";
    while (true) {
      branch.left = frame.left; branch.right = frame.right;
      const more = frame.left < frame.right;
      emit(4, "loop", `${frame.left} < ${frame.right} → ${py(more)}`, more);
      if (!more) break;
      const different = s[frame.left] !== s[frame.right];
      if (different) branch.failedPair = [frame.left, frame.right];
      else branch.pairs.push([frame.left, frame.right]);
      emit(5, different ? "mismatch" : "match", `${s[frame.left]} ${different ? "≠" : "="} ${s[frame.right]}`, different);
      if (different) {
        branch.status = "returned"; branch.result = false;
        emit(6, "helper-fail", "return False");
        frame = outer; method = "validPalindrome"; activeSide = null;
        return false;
      }
      frame.left++;
      branch.left = frame.left;
      emit(7, "move", `left += 1 → ${frame.left}`);
      frame.right--;
      branch.right = frame.right;
      emit(8, "move", `right -= 1 → ${frame.right}`);
    }
    branch.status = "returned"; branch.result = true;
    emit(9, "helper-pass", "return True");
    frame = outer; method = "validPalindrome"; activeSide = null;
    return true;
  }

  emit(3, "define", "is_palindrome(left, right)");
  outer.left = 0; emit(11, "init", "left = 0");
  outer.right = s.length - 1; emit(12, "init", `right = ${outer.right}`);
  while (true) {
    const more = outer.left < outer.right;
    emit(13, "loop", `${outer.left} < ${outer.right} → ${py(more)}`, more);
    if (!more) break;
    const different = s[outer.left] !== s[outer.right];
    if (different) {
      mismatch = [outer.left, outer.right];
      branches = [
        { side: "left", index: outer.left, from: outer.left + 1, to: outer.right },
        { side: "right", index: outer.right, from: outer.left, to: outer.right - 1 },
      ].map(item => ({ ...item, left: item.from, right: item.to, status: "pending", result: null, pairs: [], failedPair: null }));
    } else pairs.push([outer.left, outer.right]);
    emit(14, different ? "mismatch" : "match", `${s[outer.left]} ${different ? "≠" : "="} ${s[outer.right]}`, different);
    if (different) {
      outer.skip_left = checkRange("left", outer.left + 1, outer.right);
      branches[0].status = "done";
      emit(15, "assign", `skip_left = ${py(outer.skip_left)}`);
      if (outer.skip_left) branches[1].status = "skipped";
      emit(16, "branch", `skip_left → ${py(outer.skip_left)}`, outer.skip_left);
      if (outer.skip_left) {
        answer = true; deletedIndex = outer.left;
        emit(17, "done", "return True");
      } else {
        outer.skip_right = checkRange("right", outer.left, outer.right - 1);
        branches[1].status = "done";
        emit(18, "assign", `skip_right = ${py(outer.skip_right)}`);
        answer = outer.skip_right;
        if (answer) deletedIndex = outer.right;
        emit(19, "done", `return ${py(answer)}`);
      }
      return { original: s, answer, steps };
    }
    outer.left++; emit(20, "move", `left += 1 → ${outer.left}`);
    outer.right--; emit(21, "move", `right -= 1 → ${outer.right}`);
  }
  answer = true;
  emit(22, "done", "return True");
  return { original: s, answer, steps };
}

module.exports = {
  680: {
    ...require("./two-pointer")[680],
    debugMode: "line-by-line", code: SOURCE, builder: buildSteps680,
    liveArgs: input => [parseInput680(input)],
    approach: [
      bi("Hai con trỏ → so sánh từng cặp đối xứng.", "Two pointers → compare mirrored pairs."),
      bi("Cặp lệch đầu tiên → thử bỏ trái; nếu chưa được, thử bỏ phải.", "First mismatch → try skipping left, then right if needed."),
      bi("Mỗi lượt thử chỉ xóa đúng một ký tự.", "Each trial skips exactly one character."),
    ],
  },
};
